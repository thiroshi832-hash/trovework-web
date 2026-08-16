export const VERIFICATION_PROVIDER = Symbol("VERIFICATION_PROVIDER");

export interface IdSubmission {
  fullName: string;
  dob: string;
  idNumber: string;
  idFrontPath: string;
  idBackPath?: string;
  selfiePath: string;
}

export type Decision = "verified" | "rejected" | "review";

export interface Assessment {
  decision: Decision;
  /** 0..1 confidence when an automated engine ran; null for manual. */
  score: number | null;
  reason?: string;
}

export interface VerificationProvider {
  assess(submission: IdSubmission): Promise<Assessment>;
}

/**
 * The shipping default (BUILD_PLAN §6.1 manual-review fallback): every
 * submission is routed to a human. A future AutoVerificationProvider —
 * face-embedding match + OCR + liveness behind the SAME interface — can return
 * "verified"/"rejected" directly, and only borderline cases "review", without
 * the gate or the flag-flip logic changing.
 */
export class ManualVerificationProvider implements VerificationProvider {
  async assess(): Promise<Assessment> {
    return { decision: "review", score: null, reason: "Awaiting manual review." };
  }
}
