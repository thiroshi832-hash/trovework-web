import { Logger, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { Assessment, IdSubmission, VerificationProvider } from "./verification.provider";
import { crossCheckMrz, findMrzLines, isDataMismatch, type MrzFields } from "./mrz-check";

/* eslint-disable @typescript-eslint/no-explicit-any -- the ML libs are loaded
   dynamically and untyped; everything they touch is isolated in this file. */

export interface Signals {
  /** A face was found on BOTH the ID photo and the selfie. */
  faceDetected: boolean;
  /** Euclidean distance between the two face descriptors (lower = more alike). */
  distance: number | null;
  /** Whether the ID's OCR'd text contains the entered name; null when OCR ran unavailable. */
  nameMatch: boolean | null;
  /** The selfie is byte-identical to the ID image — a replay/spoof attempt. */
  duplicateImage?: boolean;
  /** Selfie face width as a fraction of the selfie width; gates match reliability. */
  selfieFaceRatio?: number | null;
  /** The ID's checksum-valid MRZ contradicts the entered DOB / doc number / name. */
  dataMismatch?: boolean;
}

export interface Thresholds {
  verifyMin: number; // score >= this (and the name isn't a mismatch) -> auto-verify
  rejectMax: number; // score < this -> auto-reject
  /** A selfie whose face is smaller than this fraction of the image is too small to trust. */
  minSelfieFaceRatio: number;
}

/**
 * Pure policy: turns the raw signals into a decision. Kept separate from the ML
 * so it can be unit-tested exhaustively. score = 1 - distance, clamped to [0,1]
 * (so a distance of 0.4 -> 0.6). Anything the engine can't decide confidently
 * — a spoof, no face, a too-small selfie, a borderline match, or a name
 * mismatch — is rejected or sent to a human, never auto-verified.
 */
export function decide(signals: Signals, t: Thresholds): Assessment {
  // A selfie that is literally the ID image can't prove a live person is present.
  if (signals.duplicateImage) {
    return {
      decision: "rejected",
      score: 0,
      reason: "The selfie is the same image as the ID photo. Please take a live selfie.",
    };
  }
  // The ID's own machine-readable data disagreeing with what was typed is
  // usually a typo the applicant can fix — tell them and let them resubmit.
  if (signals.dataMismatch) {
    return {
      decision: "review",
      score: null,
      retryable: true,
      reason: "The details you entered didn't match your document. Check them and submit again.",
    };
  }
  // No readable face is a photo-quality problem the applicant can retake.
  if (!signals.faceDetected || signals.distance == null) {
    return {
      decision: "review",
      score: null,
      retryable: true,
      reason: "We couldn't detect a face in your photos. Retake them in good, even light and try again.",
    };
  }
  // Too small a selfie face makes the descriptor unreliable — also retryable.
  if (signals.selfieFaceRatio != null && signals.selfieFaceRatio < t.minSelfieFaceRatio) {
    return {
      decision: "review",
      score: null,
      retryable: true,
      reason: "Your selfie was too far away or unclear. Move closer so your face fills the frame and try again.",
    };
  }
  const score = Math.max(0, Math.min(1, 1 - signals.distance));

  if (score >= t.verifyMin && signals.nameMatch !== false) {
    return { decision: "verified", score, reason: "The selfie matches the ID photo and the details line up." };
  }
  if (score < t.rejectMax) {
    return { decision: "rejected", score, reason: "The selfie doesn't appear to match the ID photo." };
  }
  // Name mismatch is fixable (a typo); a borderline face match is not — that one
  // needs a human, and we don't hint how close it was.
  if (signals.nameMatch === false) {
    return {
      decision: "review",
      score,
      retryable: true,
      reason: "The name didn't match your document. Check the spelling and submit again.",
    };
  }
  return { decision: "review", score, retryable: false, reason: "Borderline face match — sent for manual review." };
}

/** Detection result for one image: its descriptor and how big the face was. */
interface FaceHit {
  descriptor: Float32Array;
  /** Face box width as a fraction of the image width. */
  faceRatio: number;
}

/**
 * Automated ID check: face-descriptor match (face-api.js over the WASM tfjs
 * backend, no native binaries) plus an OCR name cross-check. Still NO true
 * liveness — it can't tell a live face from a high-quality print — so it stays
 * a first-pass filter, not proof of presence; the duplicate-image guard blocks
 * only the crudest replay. Every failure mode (models missing, no face, any
 * error) falls back to "review" so a real human still decides, and the platform
 * never breaks if the ML stack is unavailable. Opt-in via ID_VERIFY_ENGINE=auto.
 */
export class AutoVerificationProvider implements VerificationProvider, OnModuleInit {
  private readonly log = new Logger("AutoVerification");
  private readonly thresholds: Thresholds;
  /** "ssd" (accurate, default) or "tiny" (faster, less accurate). */
  private readonly detector: string;
  private deps: any = null;
  private loadFailed = false;

  constructor(private readonly config: ConfigService) {
    this.thresholds = {
      verifyMin: Number(config.get<string>("ID_VERIFY_VERIFY_MIN", "0.6")),
      rejectMax: Number(config.get<string>("ID_VERIFY_REJECT_MAX", "0.4")),
      minSelfieFaceRatio: Number(config.get<string>("ID_VERIFY_MIN_SELFIE_FACE", "0.12")),
    };
    this.detector = (config.get<string>("FACE_DETECTOR", "ssd") ?? "ssd").toLowerCase();
  }

  /** Warm the models at boot so the first real submission isn't slow. */
  async onModuleInit(): Promise<void> {
    await this.load().catch(() => undefined);
  }

  async assess(submission: IdSubmission): Promise<Assessment> {
    try {
      // Engine down (models unavailable) is a system problem, not the user's —
      // retrying won't help, so route it to a human rather than asking them to
      // redo their photos. This is a non-retryable review.
      if (!(await this.engineAvailable())) {
        return { decision: "review", score: null, retryable: false, reason: "Your documents are in review." };
      }
      // Cheapest, strongest signal first: an identical selfie is a spoof.
      if (await this.sameImage(submission.idFrontPath, submission.selfiePath)) {
        return decide({ faceDetected: false, distance: null, nameMatch: null, duplicateImage: true }, this.thresholds);
      }

      const match = await this.faceDistance(submission.idFrontPath, submission.selfiePath);
      const nameMatch = await this.ocrNameMatch(submission.idFrontPath, submission.fullName);
      const mrz = await this.readMrz(submission.idFrontPath, submission.idBackPath);
      const dataMismatch = mrz
        ? isDataMismatch(
            crossCheckMrz(mrz, {
              idNumber: submission.idNumber,
              dob: submission.dob,
              fullName: submission.fullName,
            }),
          )
        : false;

      const signals: Signals = {
        faceDetected: match != null,
        distance: match?.distance ?? null,
        nameMatch,
        selfieFaceRatio: match?.selfieFaceRatio ?? null,
        dataMismatch,
      };
      const result = decide(signals, this.thresholds);
      this.log.log(
        `ID check: detector=${this.detector} distance=${signals.distance?.toFixed(3) ?? "n/a"} ` +
          `selfieFace=${signals.selfieFaceRatio?.toFixed(2) ?? "n/a"} name=${nameMatch ?? "n/a"} ` +
          `mrz=${mrz ? (dataMismatch ? "mismatch" : "ok") : "n/a"} ` +
          `score=${result.score?.toFixed(3) ?? "n/a"} -> ${result.decision}`,
      );
      return result;
    } catch (err) {
      this.log.error(`Auto ID check errored; falling back to manual review: ${(err as Error)?.message}`);
      return { decision: "review", score: null, retryable: false, reason: "Your documents are in review." };
    }
  }

  /* ------------ overridable seams (the ML lives here; tests stub these) ------------ */

  /** Whether the ML models are loaded and usable. Stubbed true in tests. */
  protected async engineAvailable(): Promise<boolean> {
    return (await this.load()) != null;
  }

  /** True when the two files are byte-identical — the crudest selfie spoof. */
  protected async sameImage(idPath: string, selfiePath: string): Promise<boolean> {
    try {
      const [a, b] = await Promise.all([readFile(idPath), readFile(selfiePath)]);
      if (a.length !== b.length) return false;
      return sha256(a) === sha256(b);
    } catch {
      return false; // can't read -> don't block; the face check still runs
    }
  }

  protected async faceDistance(
    idPath: string,
    selfiePath: string,
  ): Promise<{ distance: number; selfieFaceRatio: number } | null> {
    const deps = await this.load();
    if (!deps) return null;
    const [a, b] = await Promise.all([this.descriptor(idPath, deps), this.descriptor(selfiePath, deps)]);
    if (!a || !b) return null;
    return {
      distance: deps.faceapi.euclideanDistance(a.descriptor, b.descriptor) as number,
      selfieFaceRatio: b.faceRatio,
    };
  }

  /** OCR one image to raw text, or null if OCR is unavailable / errors. */
  protected async ocrText(imagePath: string): Promise<string | null> {
    try {
      const tesseract: any = await import("tesseract.js");
      const worker = await tesseract.createWorker("eng", 1, { cachePath: "/tmp/tessdata" });
      try {
        const { data } = await worker.recognize(imagePath);
        return String(data?.text ?? "");
      } finally {
        await worker.terminate();
      }
    } catch (err) {
      this.log.warn(`OCR unavailable: ${(err as Error)?.message}`);
      return null;
    }
  }

  protected async ocrNameMatch(idPath: string, fullName: string): Promise<boolean | null> {
    const text = (await this.ocrText(idPath))?.toLowerCase();
    if (!text) return null;
    const tokens = fullName.toLowerCase().split(/\s+/).filter((tk) => tk.length >= 2);
    if (!tokens.length) return null;
    const hits = tokens.filter((tk) => text.includes(tk)).length;
    return hits / tokens.length >= 0.5;
  }

  /**
   * Reads the ID's MRZ (usually on the back of a card, the front of a passport)
   * and returns its fields ONLY when the `mrz` parser confirms every checksum —
   * so a bad OCR read can never masquerade as valid data and wrongly contradict
   * an honest applicant. Returns null when there's no MRZ or it can't be trusted.
   */
  protected async readMrz(idFrontPath: string, idBackPath?: string): Promise<MrzFields | null> {
    try {
      const { parse }: any = await import("mrz");
      // Back first — that's where an ID card's MRZ normally lives.
      const paths = [idBackPath, idFrontPath].filter(Boolean) as string[];
      for (const p of paths) {
        const text = await this.ocrText(p);
        if (!text) continue;
        const lines = findMrzLines(text);
        if (!lines) continue;
        const result = parse(lines);
        if (result?.valid) {
          const f = result.fields;
          return {
            documentNumber: f.documentNumber,
            birthDate: f.birthDate,
            firstName: f.firstName,
            lastName: f.lastName,
          };
        }
      }
      return null;
    } catch (err) {
      this.log.warn(`MRZ check unavailable: ${(err as Error)?.message}`);
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
      // SSD MobileNet is more accurate on ID portraits; TinyFaceDetector is the
      // faster fallback. Whichever is selected, the landmark + recognition nets
      // are always needed for descriptors.
      if (this.detector === "tiny") {
        await faceapi.nets.tinyFaceDetector.loadFromDisk(modelDir);
      } else {
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelDir);
      }
      await faceapi.nets.faceLandmark68Net.loadFromDisk(modelDir);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(modelDir);

      this.deps = { tf, faceapi, canvas };
      this.log.log(`Auto ID verification engine ready (detector=${this.detector}).`);
      return this.deps;
    } catch (err) {
      this.loadFailed = true;
      this.log.error(`Auto ID engine unavailable (submissions go to manual review): ${(err as Error)?.message}`);
      return null;
    }
  }

  private detectorOptions(faceapi: any): any {
    return this.detector === "tiny"
      ? new faceapi.TinyFaceDetectorOptions()
      : new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });
  }

  private modelDir(): string {
    const override = this.config.get<string>("FACE_MODEL_DIR");
    if (override) return override;
    // The weights ship inside the package's model/ folder.
    const pkg = require.resolve("@vladmandic/face-api/package.json");
    return join(dirname(pkg), "model");
  }

  private async descriptor(imagePath: string, deps: any): Promise<FaceHit | null> {
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
      // Detect ALL faces and keep the largest: on an ID card this ignores a
      // small ghost/hologram portrait and locks onto the real photo.
      const dets = await faceapi
        .detectAllFaces(input, this.detectorOptions(faceapi))
        .withFaceLandmarks()
        .withFaceDescriptors();
      if (!dets?.length) return null;
      const best = dets.reduce((m: any, d: any) => (d.detection.box.area > m.detection.box.area ? d : m));
      return { descriptor: best.descriptor as Float32Array, faceRatio: best.detection.box.width / width };
    } finally {
      input.dispose();
    }
  }
}

const sha256 = (buf: Buffer) => createHash("sha256").update(buf).digest("hex");
