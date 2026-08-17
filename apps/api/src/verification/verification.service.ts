import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createHash, randomInt } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { PiiCryptoService } from "../crypto/pii-crypto.service";
import { SMS_PROVIDER, type SmsProvider } from "./providers/sms.provider";
import {
  VERIFICATION_PROVIDER,
  type IdSubmission,
  type VerificationProvider,
} from "./providers/verification.provider";

const CODE_TTL_MS = 10 * 60_000;
const MAX_CODE_ATTEMPTS = 5;

export interface Actor {
  id: string;
  role: string;
  status: string;
}

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(SMS_PROVIDER) private readonly sms: SmsProvider,
    @Inject(VERIFICATION_PROVIDER) private readonly engine: VerificationProvider,
    private readonly pii: PiiCryptoService,
  ) {}

  private hash(code: string): string {
    return createHash("sha256").update(code).digest("hex");
  }

  private assertActive(actor: Actor) {
    if (actor.status === "banned") throw new ForbiddenException("This account has been suspended.");
  }

  /* ----------------------------- phone: request ---------------------------- */

  async requestPhoneCode(actor: Actor, phone: string): Promise<{ sent: true }> {
    this.assertActive(actor);
    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");

    await this.prisma.phoneChallenge.upsert({
      where: { userId: actor.id },
      create: { userId: actor.id, phone, codeHash: this.hash(code), expiresAt: new Date(Date.now() + CODE_TTL_MS) },
      update: { phone, codeHash: this.hash(code), expiresAt: new Date(Date.now() + CODE_TTL_MS), attempts: 0 },
    });

    await this.sms.sendCode(phone, code);
    return { sent: true };
  }

  /* ----------------------------- phone: confirm ---------------------------- */

  async confirmPhoneCode(actor: Actor, code: string): Promise<{ phoneVerified: true }> {
    this.assertActive(actor);
    const challenge = await this.prisma.phoneChallenge.findUnique({ where: { userId: actor.id } });
    if (!challenge) throw new BadRequestException("Request a code first.");

    if (challenge.expiresAt <= new Date()) {
      await this.prisma.phoneChallenge.delete({ where: { userId: actor.id } });
      throw new BadRequestException("That code has expired. Request a new one.");
    }
    if (challenge.attempts >= MAX_CODE_ATTEMPTS) {
      await this.prisma.phoneChallenge.delete({ where: { userId: actor.id } });
      throw new BadRequestException("Too many attempts. Request a new code.");
    }
    if (challenge.codeHash !== this.hash(code)) {
      await this.prisma.phoneChallenge.update({
        where: { userId: actor.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException("That code is incorrect.");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: actor.id },
        data: { phone: challenge.phone, phoneVerified: true },
      }),
      this.prisma.phoneChallenge.delete({ where: { userId: actor.id } }),
    ]);

    return { phoneVerified: true };
  }

  /* ------------------------------- id: submit ------------------------------ */

  async submitId(actor: Actor, submission: IdSubmission) {
    this.assertActive(actor);

    const assessment = await this.engine.assess(submission);

    const record = await this.prisma.idVerification.create({
      data: {
        userId: actor.id,
        fullName: submission.fullName,
        // dob and idNumber are sensitive — encrypted at rest (NFR-SEC-2).
        dob: this.pii.encrypt(submission.dob),
        idNumber: this.pii.encrypt(submission.idNumber),
        idFrontPath: submission.idFrontPath,
        idBackPath: submission.idBackPath ?? null,
        selfiePath: submission.selfiePath,
        score: assessment.score ?? null,
        status: assessment.decision === "review" ? "pending" : (assessment.decision as "approved" | "rejected"),
      },
    });

    // An automated engine may decide outright; the manual provider always
    // returns "review", leaving the record pending for an admin.
    if (assessment.decision === "verified") {
      await this.applyApproval(actor.id, record.id, null, "Auto-verified by the engine.");
    }

    return {
      status: assessment.decision === "verified" ? "approved" : assessment.decision === "rejected" ? "rejected" : "pending",
      message:
        assessment.decision === "verified"
          ? "Your identity has been verified."
          : assessment.decision === "rejected"
            ? "We couldn't verify your identity. You can submit again."
            : "Thanks — your documents are in review. We'll email you when it's done.",
    };
  }

  /* --------------------------------- admin --------------------------------- */

  /** Pending requests with dob/idNumber decrypted for the admin reviewer. */
  async listPending() {
    const records = await this.prisma.idVerification.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, email: true, role: true } } },
    });
    return records.map((r) => ({ ...r, dob: this.pii.decrypt(r.dob), idNumber: this.pii.decrypt(r.idNumber) }));
  }

  async approve(adminId: string, verificationId: string): Promise<void> {
    const record = await this.prisma.idVerification.findUnique({ where: { id: verificationId } });
    if (!record) throw new NotFoundException("Verification request not found.");
    if (record.status !== "pending") throw new BadRequestException("This request has already been decided.");
    await this.applyApproval(record.userId, record.id, adminId, "Approved by admin.");
  }

  async reject(adminId: string, verificationId: string, note?: string): Promise<void> {
    const record = await this.prisma.idVerification.findUnique({ where: { id: verificationId } });
    if (!record) throw new NotFoundException("Verification request not found.");
    if (record.status !== "pending") throw new BadRequestException("This request has already been decided.");

    await this.prisma.idVerification.update({
      where: { id: record.id },
      data: { status: "rejected", reviewedById: adminId, reviewedAt: new Date(), reviewNote: note ?? null },
    });
  }

  /* -------------------------------- internals ------------------------------ */

  /**
   * The one place id_verified is turned on. In a transaction it marks the
   * record approved, flips the user's flag, and — for a freelancer — makes the
   * profile visible (FR-V-5). Client access to contact info and chat follows
   * automatically, since those re-read id_verified per request.
   */
  private async applyApproval(userId: string, verificationId: string, adminId: string | null, note: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.idVerification.update({
        where: { id: verificationId },
        data: { status: "approved", reviewedById: adminId, reviewedAt: new Date(), reviewNote: note },
      });
      await tx.user.update({ where: { id: userId }, data: { idVerified: true } });
      // No error if the freelancer hasn't built a profile yet.
      await tx.freelancerProfile.updateMany({ where: { userId }, data: { isVisible: true } });
    });
  }
}
