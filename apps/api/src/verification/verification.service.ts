import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash, randomInt } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { PiiCryptoService } from "../crypto/pii-crypto.service";
import { SecuredStorageService } from "../storage/secured-storage.service";
import { SMS_PROVIDER, type SmsProvider } from "./providers/sms.provider";
import { parsePhone } from "./phone-number";
import { isCountryBlocked } from "./sms-pricing";
import {
  VERIFICATION_PROVIDER,
  type IdSubmission,
  type VerificationProvider,
} from "./providers/verification.provider";

const CODE_TTL_MS = 10 * 60_000;
const MAX_CODE_ATTEMPTS = 5;

/** Defaults for the send limits; both are overridable per environment. */
const DEFAULT_RESEND_COOLDOWN_S = 30;
const DEFAULT_MAX_SENDS_PER_DAY = 5;
const SEND_WINDOW_MS = 24 * 3_600_000;

/** Prisma's unique-constraint code, narrowed without importing the namespace. */
function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002";
}

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
    private readonly config: ConfigService,
    private readonly securedStorage: SecuredStorageService,
  ) {}

  /** Removes the images from a submission we're not keeping (a retryable review). */
  private async discardSubmissionFiles(submission: IdSubmission): Promise<void> {
    const paths = [submission.idFrontPath, submission.idBackPath, submission.selfiePath].filter(
      (p): p is string => !!p,
    );
    await Promise.all(paths.map((p) => this.securedStorage.removeFile(p)));
  }

  private get resendCooldownMs(): number {
    return (
      Number(this.config.get("PHONE_RESEND_COOLDOWN_SECONDS", DEFAULT_RESEND_COOLDOWN_S)) * 1000
    );
  }

  private get maxSendsPerWindow(): number {
    return Number(this.config.get("PHONE_MAX_SENDS_PER_DAY", DEFAULT_MAX_SENDS_PER_DAY));
  }

  private hash(code: string): string {
    return createHash("sha256").update(code).digest("hex");
  }

  private assertActive(actor: Actor) {
    if (actor.status === "banned") throw new ForbiddenException("This account has been suspended.");
  }

  /* ----------------------------- phone: request ---------------------------- */

  /**
   * Issues a code, subject to three gates that all exist because every send
   * costs money: the destination must be a country we're willing to pay for,
   * the caller must be past the resend cooldown, and they must not have burned
   * the daily allowance.
   *
   * The gates run before the SMS, and the counters are written in the same
   * statement that stores the code — so a send that the provider then rejects
   * still consumes the allowance. That is deliberate: the alternative lets a
   * caller hammer a number the gateway refuses, at our cost, forever.
   */
  async requestPhoneCode(
    actor: Actor,
    phone: string,
  ): Promise<{ sent: true; resendAfterSeconds: number }> {
    this.assertActive(actor);

    // Checked before anything else: with no SMS credentials configured there is
    // nothing to send, and refusing here means the attempt costs the user
    // nothing from their daily allowance.
    if (!this.sms.available) {
      throw new ServiceUnavailableException(
        "Phone verification is temporarily unavailable. Please try again later.",
      );
    }

    const parsed = parsePhone(phone);
    // No country means no rate, and no rate means we cannot agree to pay for
    // it. Reported as an invalid number rather than a blocked country, because
    // that is what it is — the number belongs to no numbering plan we know.
    if (!parsed?.country) {
      throw new BadRequestException("Enter a valid phone number in international format.");
    }
    if (isCountryBlocked(parsed.country)) {
      throw new BadRequestException(
        "We can't send verification codes to that country yet. Please use a number from another country.",
      );
    }

    const now = Date.now();
    const sentAt = new Date(now);
    const cooldownCutoff = new Date(now - this.resendCooldownMs);
    const windowFloor = new Date(now - SEND_WINDOW_MS);

    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const codeFields = {
      phone: parsed.e164,
      codeHash: this.hash(code),
      expiresAt: new Date(now + CODE_TTL_MS),
      attempts: 0,
      lastSentAt: sentAt,
    };

    /*
     * Claiming a send slot has to be one atomic statement, not a read followed
     * by a write. Two requests that arrive together would otherwise both read
     * the same `lastSentAt`, both conclude the cooldown had passed, and both
     * send — so the limits could be bypassed simply by firing in parallel,
     * which is precisely the abuse they exist to stop.
     *
     * Each branch below is a single conditional UPDATE, so the database decides
     * the winner. The branches are mutually exclusive on `windowStartedAt`, and
     * every one of them requires the cooldown to have elapsed.
     */

    // Still inside the 24h window, with allowance left.
    let claimed = (
      await this.prisma.phoneChallenge.updateMany({
        where: {
          userId: actor.id,
          lastSentAt: { lte: cooldownCutoff },
          windowStartedAt: { gte: windowFloor },
          sendCount: { lt: this.maxSendsPerWindow },
        },
        data: { ...codeFields, sendCount: { increment: 1 } },
      })
    ).count;

    // The window has rolled over, so the allowance restarts. Note this keys off
    // time only — changing the phone number never resets the count.
    if (!claimed) {
      claimed = (
        await this.prisma.phoneChallenge.updateMany({
          where: {
            userId: actor.id,
            lastSentAt: { lte: cooldownCutoff },
            windowStartedAt: { lt: windowFloor },
          },
          data: { ...codeFields, sendCount: 1, windowStartedAt: sentAt },
        })
      ).count;
    }

    // First code this user has ever asked for. The unique index on user_id is
    // what makes the race safe: a concurrent create loses with P2002 and is
    // refused below rather than sending a second message.
    if (!claimed) {
      try {
        await this.prisma.phoneChallenge.create({
          data: { userId: actor.id, ...codeFields, sendCount: 1, windowStartedAt: sentAt },
        });
        claimed = 1;
      } catch (err) {
        if (!isUniqueViolation(err)) throw err;
      }
    }

    if (!claimed) await this.refuseSend(actor.id, now);

    await this.sms.sendCode(parsed.e164, code);
    return { sent: true, resendAfterSeconds: Math.ceil(this.resendCooldownMs / 1000) };
  }

  /**
   * Works out which limit turned the request away, so the message and the wait
   * are the real ones. Re-reads because the claim above deliberately says only
   * yes or no — asking the database *why* is worth one extra query on a path
   * that is, by definition, not sending anything.
   */
  private async refuseSend(userId: string, now: number): Promise<never> {
    const existing = await this.prisma.phoneChallenge.findUnique({ where: { userId } });

    if (existing) {
      const waitedMs = now - existing.lastSentAt.getTime();
      if (waitedMs < this.resendCooldownMs) {
        this.tooManyRequests(
          "Please wait before requesting another code.",
          Math.ceil((this.resendCooldownMs - waitedMs) / 1000),
        );
      }

      const windowAgeMs = now - existing.windowStartedAt.getTime();
      if (windowAgeMs < SEND_WINDOW_MS && existing.sendCount >= this.maxSendsPerWindow) {
        this.tooManyRequests(
          "You've requested too many codes today. Try again tomorrow, or contact support.",
          Math.ceil((SEND_WINDOW_MS - windowAgeMs) / 1000),
        );
      }
    }

    // Neither limit looks breached, so a request that arrived alongside this
    // one took the slot in between. Treat it as the cooldown, which is what it
    // effectively is.
    this.tooManyRequests(
      "Please wait before requesting another code.",
      Math.ceil(this.resendCooldownMs / 1000),
    );
  }

  /** 429 with the wait attached, so the UI can count down instead of guessing. */
  private tooManyRequests(message: string, retryAfterSeconds: number): never {
    throw new HttpException(
      { message, retryAfterSeconds, statusCode: HttpStatus.TOO_MANY_REQUESTS },
      HttpStatus.TOO_MANY_REQUESTS,
    );
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

    // A retryable review is something the applicant can fix right now (an
    // unreadable photo, a detail that didn't match the document). Don't store it
    // or queue it for an admin — discard the just-uploaded files and tell them
    // what to fix so they can resubmit, rather than leaving them waiting.
    if (assessment.decision === "review" && assessment.retryable) {
      await this.discardSubmissionFiles(submission);
      return {
        status: "retry" as const,
        message: assessment.reason ?? "Please check your details and try again.",
      };
    }

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

  /** A page of pending requests with dob/idNumber decrypted for the reviewer. */
  async listPending(opts: { take?: number; skip?: number } = {}) {
    const take = Math.min(Math.max(Math.trunc(opts.take ?? 25), 1), 100);
    const skip = Math.max(Math.trunc(opts.skip ?? 0), 0);
    const where = { status: "pending" as const };
    const [records, total] = await Promise.all([
      this.prisma.idVerification.findMany({
        where,
        orderBy: { createdAt: "asc" },
        take,
        skip,
        include: { user: { select: { id: true, email: true, role: true } } },
      }),
      this.prisma.idVerification.count({ where }),
    ]);
    const items = records.map((r) => ({ ...r, dob: this.pii.decrypt(r.dob), idNumber: this.pii.decrypt(r.idNumber) }));
    return { items, total };
  }

  /**
   * Streams one image from a verification record for an admin reviewer. The
   * files live in the secured store that nginx never serves, so this authed
   * endpoint is the only way to see them — the path comes from our own DB row,
   * never the client, so there's nothing to traverse.
   */
  async getReviewImage(
    verificationId: string,
    kind: "front" | "back" | "selfie",
  ): Promise<{ buffer: Buffer; contentType: string }> {
    const record = await this.prisma.idVerification.findUnique({ where: { id: verificationId } });
    if (!record) throw new NotFoundException("Verification request not found.");
    const path = kind === "front" ? record.idFrontPath : kind === "back" ? record.idBackPath : record.selfiePath;
    if (!path) throw new NotFoundException("That image isn't available.");
    const buffer = await this.securedStorage.read(path);
    if (!buffer) throw new NotFoundException("That image isn't available.");
    return { buffer, contentType: imageContentType(path) };
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

/** Best-effort content type from a stored file's extension. */
function imageContentType(path: string): string {
  const ext = path.toLowerCase().match(/\.[a-z0-9]+$/)?.[0];
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}
