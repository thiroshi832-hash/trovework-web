import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { dirname, join } from "node:path";
import type { Assessment, IdSubmission, VerificationProvider } from "./verification.provider";

/* eslint-disable @typescript-eslint/no-explicit-any -- the ML libs are loaded
   dynamically and untyped; everything they touch is isolated in this file. */

export interface Signals {
  /** A face was found on BOTH the ID photo and the selfie. */
  faceDetected: boolean;
  /** Euclidean distance between the two face descriptors (lower = more alike). */
  distance: number | null;
  /** Whether the ID's OCR'd text contains the entered name; null when OCR ran unavailable. */
  nameMatch: boolean | null;
}

export interface Thresholds {
  verifyMin: number; // score >= this (and the name isn't a mismatch) -> auto-verify
  rejectMax: number; // score < this -> auto-reject
}

/**
 * Pure policy: turns the raw signals into a decision. Kept separate from the ML
 * so it can be unit-tested exhaustively. score = 1 - distance, clamped to [0,1]
 * (so a distance of 0.4 -> 0.6). Anything the engine can't decide confidently
 * — no face, borderline match, or a name mismatch — goes to a human.
 */
export function decide(signals: Signals, t: Thresholds): Assessment {
  if (!signals.faceDetected || signals.distance == null) {
    return { decision: "review", score: null, reason: "Couldn't read a face from the photos — sent for manual review." };
  }
  const score = Math.max(0, Math.min(1, 1 - signals.distance));

  if (score >= t.verifyMin && signals.nameMatch !== false) {
    return { decision: "verified", score, reason: "The selfie matches the ID photo and the details line up." };
  }
  if (score < t.rejectMax) {
    return { decision: "rejected", score, reason: "The selfie doesn't appear to match the ID photo." };
  }
  return {
    decision: "review",
    score,
    reason:
      signals.nameMatch === false
        ? "The name on the ID didn't match what was entered — sent for manual review."
        : "Borderline face match — sent for manual review.",
  };
}

/**
 * Automated ID check: face-descriptor match (face-api.js over the WASM tfjs
 * backend, no native binaries) plus an OCR name cross-check. It has NO liveness
 * detection, so it can be fooled by a photo of a photo — it's a first-pass
 * filter, not proof of presence. Every failure mode (models missing, no face
 * detected, any error) falls back to "review" so a real human still decides,
 * and the platform never breaks if the ML stack is unavailable. Opt-in via
 * ID_VERIFY_ENGINE=auto; otherwise ManualVerificationProvider is used.
 */
export class AutoVerificationProvider implements VerificationProvider {
  private readonly log = new Logger("AutoVerification");
  private readonly thresholds: Thresholds;
  private deps: any = null;
  private loadFailed = false;

  constructor(private readonly config: ConfigService) {
    this.thresholds = {
      verifyMin: Number(config.get<string>("ID_VERIFY_VERIFY_MIN", "0.6")),
      rejectMax: Number(config.get<string>("ID_VERIFY_REJECT_MAX", "0.4")),
    };
  }

  async assess(submission: IdSubmission): Promise<Assessment> {
    try {
      const distance = await this.faceDistance(submission.idFrontPath, submission.selfiePath);
      const nameMatch = await this.ocrNameMatch(submission.idFrontPath, submission.fullName);
      return decide({ faceDetected: distance != null, distance, nameMatch }, this.thresholds);
    } catch (err) {
      this.log.error(`Auto ID check errored; falling back to manual review: ${(err as Error)?.message}`);
      return { decision: "review", score: null, reason: "The automatic check errored — sent for manual review." };
    }
  }

  /* ------------ overridable seams (the ML lives here; tests stub these) ------------ */

  protected async faceDistance(idPath: string, selfiePath: string): Promise<number | null> {
    const deps = await this.load();
    if (!deps) return null;
    const [a, b] = await Promise.all([this.descriptor(idPath, deps), this.descriptor(selfiePath, deps)]);
    if (!a || !b) return null;
    return deps.faceapi.euclideanDistance(a, b) as number;
  }

  protected async ocrNameMatch(idPath: string, fullName: string): Promise<boolean | null> {
    try {
      const tesseract: any = await import("tesseract.js");
      const worker = await tesseract.createWorker("eng", 1, { cachePath: "/tmp/tessdata" });
      try {
        const { data } = await worker.recognize(idPath);
        const text = String(data?.text ?? "").toLowerCase();
        const tokens = fullName.toLowerCase().split(/\s+/).filter((tk) => tk.length >= 2);
        if (!tokens.length || !text) return null;
        const hits = tokens.filter((tk) => text.includes(tk)).length;
        return hits / tokens.length >= 0.5;
      } finally {
        await worker.terminate();
      }
    } catch (err) {
      this.log.warn(`OCR unavailable, skipping the name check: ${(err as Error)?.message}`);
      return null;
    }
  }

  /* -------------------------------- internals -------------------------------- */

  private async load(): Promise<any | null> {
    if (this.deps) return this.deps;
    if (this.loadFailed) return null;
    try {
      const tf: any = await import("@tensorflow/tfjs");
      // Deep path via a variable so TS doesn't try to resolve types for it.
      const faceApiPath = "@vladmandic/face-api/dist/face-api.node-wasm.js";
      const faceapi: any = await import(faceApiPath);
      const canvas: any = await import("@napi-rs/canvas");

      await tf.setBackend("wasm");
      await tf.ready();

      const modelDir = this.modelDir();
      await faceapi.nets.tinyFaceDetector.loadFromDisk(modelDir);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(modelDir);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(modelDir);

      this.deps = { tf, faceapi, canvas };
      this.log.log("Auto ID verification engine ready.");
      return this.deps;
    } catch (err) {
      this.loadFailed = true;
      this.log.error(`Auto ID engine unavailable (submissions go to manual review): ${(err as Error)?.message}`);
      return null;
    }
  }

  private modelDir(): string {
    const override = this.config.get<string>("FACE_MODEL_DIR");
    if (override) return override;
    // The weights ship inside the package's model/ folder.
    const pkg = require.resolve("@vladmandic/face-api/package.json");
    return join(dirname(pkg), "model");
  }

  private async descriptor(imagePath: string, deps: any): Promise<Float32Array | null> {
    const { faceapi, canvas, tf } = deps;
    const img = await canvas.loadImage(imagePath);
    const cv = canvas.createCanvas(img.width, img.height);
    cv.getContext("2d").drawImage(img, 0, 0);
    const { data, width, height } = cv.getContext("2d").getImageData(0, 0, img.width, img.height);

    // Drop the alpha channel: face-api wants an [h, w, 3] RGB tensor.
    const rgb = new Uint8Array(width * height * 3);
    for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
      rgb[j] = data[i];
      rgb[j + 1] = data[i + 1];
      rgb[j + 2] = data[i + 2];
    }
    const input = tf.tensor3d(rgb, [height, width, 3]);
    try {
      const det = await faceapi
        .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
      return det?.descriptor ? (det.descriptor as Float32Array) : null;
    } finally {
      input.dispose();
    }
  }
}
