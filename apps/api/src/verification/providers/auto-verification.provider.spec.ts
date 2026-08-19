import { ConfigService } from "@nestjs/config";
import { AutoVerificationProvider, decide, type Signals, type Thresholds } from "./auto-verification.provider";
import type { MrzFields } from "./mrz-check";
import type { IdSubmission } from "./verification.provider";

const T: Thresholds = { verifyMin: 0.6, rejectMax: 0.4, minSelfieFaceRatio: 0.12 };
const sig = (over: Partial<Signals> = {}): Signals => ({
  faceDetected: true,
  distance: 0.3,
  nameMatch: true,
  selfieFaceRatio: 0.4,
  ...over,
});

describe("decide (policy)", () => {
  it("reviews when no face was detected", () => {
    const a = decide(sig({ faceDetected: false, distance: null }), T);
    expect(a.decision).toBe("review");
    expect(a.score).toBeNull();
  });

  it("verifies a close match with a matching name", () => {
    // distance 0.3 -> score 0.7 >= 0.6
    expect(decide(sig({ distance: 0.3, nameMatch: true }), T).decision).toBe("verified");
  });

  it("verifies a close match even when OCR couldn't check the name", () => {
    expect(decide(sig({ distance: 0.3, nameMatch: null }), T).decision).toBe("verified");
  });

  it("does NOT auto-verify a close face match if the name is a mismatch", () => {
    const a = decide(sig({ distance: 0.3, nameMatch: false }), T);
    expect(a.decision).toBe("review");
    expect(a.reason).toMatch(/name/i);
  });

  it("rejects a clear non-match", () => {
    // distance 0.8 -> score 0.2 < 0.4
    expect(decide(sig({ distance: 0.8 }), T).decision).toBe("rejected");
  });

  it("reviews a borderline match", () => {
    // distance 0.5 -> score 0.5, between the thresholds
    expect(decide(sig({ distance: 0.5 }), T).decision).toBe("review");
  });

  it("scores as 1 - distance, clamped", () => {
    expect(decide(sig({ distance: 0.25 }), T).score).toBeCloseTo(0.75);
  });

  it("rejects a selfie that is the same image as the ID (spoof)", () => {
    const a = decide(sig({ duplicateImage: true, distance: 0.1 }), T);
    expect(a.decision).toBe("rejected");
    expect(a.reason).toMatch(/live selfie/i);
  });

  it("reviews a selfie whose face is too small to trust", () => {
    const a = decide(sig({ distance: 0.2, selfieFaceRatio: 0.05 }), T);
    expect(a.decision).toBe("review");
    expect(a.score).toBeNull();
  });

  it("still verifies when the selfie face is large enough", () => {
    expect(decide(sig({ distance: 0.3, selfieFaceRatio: 0.3 }), T).decision).toBe("verified");
  });
});

/** A subclass that stubs the ML seams so assess()'s orchestration is testable. */
class StubProvider extends AutoVerificationProvider {
  constructor(
    private readonly stub: {
      distance: number | null | (() => never);
      name: boolean | null;
      faceRatio?: number;
      dup?: boolean;
      mrz?: MrzFields | null;
    },
  ) {
    super({ get: (_k: string, d?: string) => d } as unknown as ConfigService);
  }
  protected async sameImage(): Promise<boolean> {
    return this.stub.dup ?? false;
  }
  protected async readMrz(): Promise<MrzFields | null> {
    return this.stub.mrz ?? null;
  }
  protected async faceDistance(): Promise<{ distance: number; selfieFaceRatio: number } | null> {
    if (typeof this.stub.distance === "function") this.stub.distance();
    if (this.stub.distance == null) return null;
    return { distance: this.stub.distance as number, selfieFaceRatio: this.stub.faceRatio ?? 0.4 };
  }
  protected async ocrNameMatch(): Promise<boolean | null> {
    return this.stub.name;
  }
}

const submission: IdSubmission = {
  fullName: "Marisol Rivera",
  dob: "1990-04-12",
  idNumber: "AB123456",
  idFrontPath: "/secured/f1/id-front.jpg",
  selfiePath: "/secured/f1/selfie.jpg",
};

describe("AutoVerificationProvider.assess", () => {
  it("verifies when the face is close and the name matches", async () => {
    const res = await new StubProvider({ distance: 0.3, name: true }).assess(submission);
    expect(res.decision).toBe("verified");
    expect(res.score).toBeCloseTo(0.7);
  });

  it("rejects a clear non-match", async () => {
    expect((await new StubProvider({ distance: 0.85, name: true }).assess(submission)).decision).toBe("rejected");
  });

  it("reviews when no face could be read", async () => {
    expect((await new StubProvider({ distance: null, name: null }).assess(submission)).decision).toBe("review");
  });

  it("falls back to manual review if the engine throws", async () => {
    const res = await new StubProvider({
      distance: (() => {
        throw new Error("model exploded");
      }) as unknown as never,
      name: null,
    }).assess(submission);
    expect(res.decision).toBe("review");
    expect(res.score).toBeNull();
  });

  it("rejects a selfie identical to the ID image before any face match", async () => {
    const res = await new StubProvider({ distance: 0.3, name: true, dup: true }).assess(submission);
    expect(res.decision).toBe("rejected");
    expect(res.reason).toMatch(/live selfie/i);
  });

  it("reviews a too-small selfie face even on a close distance", async () => {
    const res = await new StubProvider({ distance: 0.2, name: true, faceRatio: 0.05 }).assess(submission);
    expect(res.decision).toBe("review");
  });

  it("reviews when the MRZ contradicts the entered details, despite a good face match", async () => {
    // submission.dob is 1990-04-12 (900412); the MRZ says 1980-01-01.
    const res = await new StubProvider({
      distance: 0.3,
      name: true,
      mrz: { birthDate: "800101", documentNumber: "AB123456", firstName: "MARISOL", lastName: "RIVERA" },
    }).assess(submission);
    expect(res.decision).toBe("review");
    expect(res.reason).toMatch(/machine-readable/i);
  });

  it("still verifies when the MRZ agrees with the entered details", async () => {
    const res = await new StubProvider({
      distance: 0.3,
      name: true,
      mrz: { birthDate: "900412", documentNumber: "AB123456", firstName: "MARISOL", lastName: "RIVERA" },
    }).assess(submission);
    expect(res.decision).toBe("verified");
  });
});
