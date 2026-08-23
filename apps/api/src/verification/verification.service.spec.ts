import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { createHash } from "node:crypto";
import { ConfigService } from "@nestjs/config";
import { VerificationService, type Actor } from "./verification.service";
import { ManualVerificationProvider, type VerificationProvider } from "./providers/verification.provider";
import { PiiCryptoService } from "../crypto/pii-crypto.service";
import type { SmsProvider } from "./providers/sms.provider";
import type { PrismaService } from "../prisma/prisma.service";
import type { SecuredStorageService } from "../storage/secured-storage.service";

// A real crypto service with a fixed test key, so the encrypt→decrypt roundtrip
// is actually exercised rather than mocked away.
const pii = new PiiCryptoService({
  get: (_k: string, d?: string) => "0".repeat(64) || d,
} as unknown as ConfigService);

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

function prismaDouble() {
  const users: Record<string, any> = {};
  const challenges: Record<string, any> = {};
  const verifications: any[] = [];
  const profiles: Record<string, any> = {};

  const db: any = {
    users,
    challenges,
    verifications,
    profiles,
    phoneChallenge: {
      // Resolve Prisma's { increment } atomic writes the way the DB would.
      __apply: (row: any, data: any) =>
        Object.fromEntries(
          Object.entries(data).map(([k, v]: [string, any]) =>
            v && typeof v === "object" && "increment" in v ? [k, (row[k] ?? 0) + v.increment] : [k, v],
          ),
        ),
      /**
       * Evaluates the conditional UPDATE the service relies on. Without the
       * predicate here the double would happily "claim" a slot the real
       * database would refuse, and the race test would prove nothing.
       */
      updateMany: jest.fn(async function (this: any, { where, data }: any) {
        const row = challenges[where.userId];
        if (!row) return { count: 0 };
        const matches =
          (where.lastSentAt?.lte === undefined || row.lastSentAt <= where.lastSentAt.lte) &&
          (where.windowStartedAt?.gte === undefined ||
            row.windowStartedAt >= where.windowStartedAt.gte) &&
          (where.windowStartedAt?.lt === undefined ||
            row.windowStartedAt < where.windowStartedAt.lt) &&
          (where.sendCount?.lt === undefined || row.sendCount < where.sendCount.lt);
        if (!matches) return { count: 0 };
        challenges[where.userId] = { ...row, ...db.phoneChallenge.__apply(row, data) };
        return { count: 1 };
      }),
      create: jest.fn(async ({ data }: any) => {
        if (challenges[data.userId]) {
          // Mirror the unique index on user_id.
          const err: any = new Error("Unique constraint failed on the fields: (`user_id`)");
          err.code = "P2002";
          throw err;
        }
        challenges[data.userId] = { attempts: 0, sendCount: 0, ...data };
        return challenges[data.userId];
      }),
      findUnique: jest.fn(async ({ where }: any) => challenges[where.userId] ?? null),
      update: jest.fn(async ({ where, data }: any) => {
        const c = challenges[where.userId];
        if (data.attempts?.increment) c.attempts += data.attempts.increment;
        return c;
      }),
      delete: jest.fn(async ({ where }: any) => {
        delete challenges[where.userId];
      }),
    },
    user: {
      update: jest.fn(async ({ where, data }: any) => {
        Object.assign(users[where.id], data);
        return users[where.id];
      }),
    },
    idVerification: {
      create: jest.fn(async ({ data }: any) => {
        const v = { id: `v${verifications.length + 1}`, ...data };
        verifications.push(v);
        return v;
      }),
      findUnique: jest.fn(async ({ where }: any) => verifications.find((v) => v.id === where.id) ?? null),
      findMany: jest.fn(async ({ where }: any) => verifications.filter((v) => v.status === where.status)),
      findFirst: jest.fn(async ({ where }: any) => verifications.find((v) => v.status === where.status) ?? null),
      count: jest.fn(async ({ where }: any) => verifications.filter((v) => v.status === where.status).length),
      update: jest.fn(async ({ where, data }: any) => {
        const v = verifications.find((x) => x.id === where.id);
        Object.assign(v, data);
        return v;
      }),
    },
    freelancerProfile: {
      updateMany: jest.fn(async ({ where, data }: any) => {
        if (profiles[where.userId]) Object.assign(profiles[where.userId], data);
        return { count: profiles[where.userId] ? 1 : 0 };
      }),
    },
    // both array-form and callback-form transactions are used
    $transaction: jest.fn(async (arg: any) => (typeof arg === "function" ? arg(db) : Promise.all(arg))),
  };
  return db;
}

function makeService(
  db: ReturnType<typeof prismaDouble>,
  opts: { sms?: SmsProvider; engine?: VerificationProvider; env?: Record<string, string> } = {},
) {
  const sms = opts.sms ?? { available: true, sendCode: jest.fn(async () => undefined) };
  const engine = opts.engine ?? new ManualVerificationProvider();
  const config = {
    get: (key: string, fallback?: unknown) => opts.env?.[key] ?? fallback,
  } as unknown as ConfigService;
  const securedStorage = {
    removeFile: jest.fn(async () => undefined),
    read: jest.fn(async () => Buffer.from("image-bytes")),
  };
  return {
    svc: new VerificationService(
      db as unknown as PrismaService,
      sms,
      engine,
      pii,
      config,
      securedStorage as unknown as SecuredStorageService,
    ),
    sms,
    engine,
    securedStorage,
  };
}

/** Moves a challenge's clocks back so the next send is past the cooldown. */
function agePastCooldown(db: any, userId: string, seconds = 60) {
  db.challenges[userId].lastSentAt = new Date(Date.now() - seconds * 1000);
}

const freelancer: Actor = { id: "f1", role: "freelancer", status: "active" };

describe("VerificationService — phone send limits", () => {
  const german = "+4915112345678";

  it("refuses cleanly when no SMS provider is configured, without spending an allowance", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const sms = { available: false, sendCode: jest.fn(async () => undefined) };
    const { svc } = makeService(db, { sms });

    await expect(svc.requestPhoneCode(freelancer, german)).rejects.toMatchObject({ status: 503 });
    expect(sms.sendCode).not.toHaveBeenCalled();
    // No challenge row, so nothing was deducted from the daily cap — the user
    // gets their full allowance the moment a key is added.
    expect(db.challenges.f1).toBeUndefined();
  });

  it("sends to a country that used to be over the price ceiling", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc, sms } = makeService(db);

    // Pakistan, EUR 0.2952 — formerly blocked on price, now sendable.
    await expect(svc.requestPhoneCode(freelancer, "+923001234567")).resolves.toMatchObject({
      sent: true,
    });
    expect(sms.sendCode).toHaveBeenCalledTimes(1);
  });

  it("still refuses a policy-blocked country, without sending", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc, sms } = makeService(db);

    // India (+91) is on the explicit policy blocklist regardless of price.
    await expect(svc.requestPhoneCode(freelancer, "+919812345678")).rejects.toThrow(
      BadRequestException,
    );
    expect(sms.sendCode).not.toHaveBeenCalled();
    expect(db.challenges.f1).toBeUndefined();
  });

  it("sends to both the US and a formerly-expensive NANP territory (both +1)", async () => {
    // Jamaica (+1 876) was EUR 0.2358 and refused; the US (+1 212) was allowed.
    // With the ceiling lifted both now send. Separate instances so neither call
    // trips the other's resend cooldown.
    for (const num of ["+12125550123", "+18765550123"]) {
      const db = prismaDouble();
      db.users.f1 = { ...freelancer, phoneVerified: false };
      const { svc, sms } = makeService(db);
      await expect(svc.requestPhoneCode(freelancer, num)).resolves.toMatchObject({ sent: true });
      expect(sms.sendCode).toHaveBeenCalledTimes(1);
    }
  });

  it("rejects an unparseable number before spending anything", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc, sms } = makeService(db);

    await expect(svc.requestPhoneCode(freelancer, "+1")).rejects.toThrow(BadRequestException);
    expect(sms.sendCode).not.toHaveBeenCalled();
  });

  it("stores the number normalised to E.164", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc } = makeService(db);

    await svc.requestPhoneCode(freelancer, "+49 (151) 123-456-78");
    expect(db.challenges.f1.phone).toBe(german);
  });

  it("blocks a resend inside the cooldown and says how long to wait", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc, sms } = makeService(db);

    await expect(svc.requestPhoneCode(freelancer, german)).resolves.toEqual({
      sent: true,
      resendAfterSeconds: 30,
    });

    await expect(svc.requestPhoneCode(freelancer, german)).rejects.toMatchObject({
      status: 429,
      response: { retryAfterSeconds: expect.any(Number) },
    });
    expect(sms.sendCode).toHaveBeenCalledTimes(1);
  });

  it("allows the resend once the cooldown has elapsed", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc, sms } = makeService(db);

    await svc.requestPhoneCode(freelancer, german);
    agePastCooldown(db, "f1");

    await expect(svc.requestPhoneCode(freelancer, german)).resolves.toMatchObject({ sent: true });
    expect(sms.sendCode).toHaveBeenCalledTimes(2);
    expect(db.challenges.f1.sendCount).toBe(2);
  });

  it("caps the daily spend per account", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc, sms } = makeService(db, { env: { PHONE_MAX_SENDS_PER_DAY: "3" } });

    for (let i = 0; i < 3; i++) {
      await svc.requestPhoneCode(freelancer, german);
      agePastCooldown(db, "f1");
    }
    expect(sms.sendCode).toHaveBeenCalledTimes(3);

    await expect(svc.requestPhoneCode(freelancer, german)).rejects.toMatchObject({ status: 429 });
    expect(sms.sendCode).toHaveBeenCalledTimes(3);
  });

  it("does not let a new number reset the daily allowance", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc, sms } = makeService(db, { env: { PHONE_MAX_SENDS_PER_DAY: "2" } });

    await svc.requestPhoneCode(freelancer, german);
    agePastCooldown(db, "f1");
    await svc.requestPhoneCode(freelancer, "+4915112345679");
    agePastCooldown(db, "f1");

    // Cycling numbers is the abuse this cap exists to stop.
    await expect(svc.requestPhoneCode(freelancer, "+4915112345670")).rejects.toMatchObject({
      status: 429,
    });
    expect(sms.sendCode).toHaveBeenCalledTimes(2);
  });

  it("opens a fresh allowance once the 24h window rolls over", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc, sms } = makeService(db, { env: { PHONE_MAX_SENDS_PER_DAY: "1" } });

    await svc.requestPhoneCode(freelancer, german);
    agePastCooldown(db, "f1");
    await expect(svc.requestPhoneCode(freelancer, german)).rejects.toMatchObject({ status: 429 });

    db.challenges.f1.windowStartedAt = new Date(Date.now() - 25 * 3_600_000);
    await expect(svc.requestPhoneCode(freelancer, german)).resolves.toMatchObject({ sent: true });
    // The counter restarts, and the message genuinely goes out again — the
    // refused attempt in the middle must not have consumed the new window.
    expect(db.challenges.f1.sendCount).toBe(1);
    expect(sms.sendCode).toHaveBeenCalledTimes(2);
  });

  /*
   * The limits are worthless if firing two requests at once slips both past
   * them. These fail against a read-then-write implementation, where both calls
   * observe the same pre-send state before either has written.
   */
  it("sends once when two requests arrive together", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc, sms } = makeService(db);

    const results = await Promise.allSettled([
      svc.requestPhoneCode(freelancer, german),
      svc.requestPhoneCode(freelancer, german),
    ]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
    expect(sms.sendCode).toHaveBeenCalledTimes(1);
    expect(db.challenges.f1.sendCount).toBe(1);
  });

  it("does not let a parallel burst outrun the daily cap", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc, sms } = makeService(db, {
      // No cooldown, so the daily cap is the only thing holding the line.
      env: { PHONE_RESEND_COOLDOWN_SECONDS: "0", PHONE_MAX_SENDS_PER_DAY: "3" },
    });

    // One send first: a burst starting from no row at all contends on the
    // insert instead, where the unique index lets exactly one through and the
    // rest are refused — safe, but it tests a different thing.
    await svc.requestPhoneCode(freelancer, german);

    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () => svc.requestPhoneCode(freelancer, german)),
    );

    // Two slots were left, so two of the ten get through and no more.
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(2);
    expect(sms.sendCode).toHaveBeenCalledTimes(3);
    expect(db.challenges.f1.sendCount).toBe(3);
  });

  it("lets only one of a first-time burst through, and refuses the rest", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc, sms } = makeService(db, {
      env: { PHONE_RESEND_COOLDOWN_SECONDS: "0", PHONE_MAX_SENDS_PER_DAY: "5" },
    });

    // With no row yet, all five race the insert. The unique index picks one
    // winner; the losers are turned away rather than retried, which errs
    // towards not spending money.
    const results = await Promise.allSettled(
      Array.from({ length: 5 }, () => svc.requestPhoneCode(freelancer, german)),
    );

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(sms.sendCode).toHaveBeenCalledTimes(1);
    for (const r of results.filter((x) => x.status === "rejected")) {
      expect((r as PromiseRejectedResult).reason).toMatchObject({ status: 429 });
    }
  });

  it("charges the allowance even when the gateway rejects the send", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const sms = { available: true, sendCode: jest.fn(async () => { throw new Error("gateway down"); }) };
    const { svc } = makeService(db, { sms });

    await expect(svc.requestPhoneCode(freelancer, german)).rejects.toThrow("gateway down");
    // Otherwise a number the gateway always refuses could be retried forever.
    expect(db.challenges.f1.sendCount).toBe(1);
  });
});

describe("VerificationService — phone", () => {
  it("sends a code and stores it hashed, never in the clear", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc, sms } = makeService(db);

    await svc.requestPhoneCode(freelancer, "+12125550123");

    expect(sms.sendCode).toHaveBeenCalledTimes(1);
    const sentCode = (sms.sendCode as jest.Mock).mock.calls[0][1];
    expect(db.challenges.f1.codeHash).toBe(sha(sentCode));
    expect(db.challenges.f1.codeHash).not.toBe(sentCode);
  });

  it("verifies the correct code and flips phone_verified", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc, sms } = makeService(db);

    await svc.requestPhoneCode(freelancer, "+12125550123");
    const code = (sms.sendCode as jest.Mock).mock.calls[0][1];

    await expect(svc.confirmPhoneCode(freelancer, code)).resolves.toEqual({ phoneVerified: true });
    expect(db.users.f1.phoneVerified).toBe(true);
    expect(db.users.f1.phone).toBe("+12125550123");
    expect(db.challenges.f1).toBeUndefined(); // consumed
  });

  it("rejects a wrong code and counts the attempt", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc } = makeService(db);
    await svc.requestPhoneCode(freelancer, "+12125550123");

    await expect(svc.confirmPhoneCode(freelancer, "000000")).rejects.toThrow(BadRequestException);
    expect(db.challenges.f1.attempts).toBe(1);
    expect(db.users.f1.phoneVerified).toBe(false);
  });

  it("rejects an expired code and clears it", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc, sms } = makeService(db);
    await svc.requestPhoneCode(freelancer, "+12125550123");
    const code = (sms.sendCode as jest.Mock).mock.calls[0][1];
    db.challenges.f1.expiresAt = new Date(Date.now() - 1000);

    await expect(svc.confirmPhoneCode(freelancer, code)).rejects.toThrow(/expired/i);
    expect(db.challenges.f1).toBeUndefined();
  });

  it("locks out after too many attempts", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc } = makeService(db);
    await svc.requestPhoneCode(freelancer, "+12125550123");
    db.challenges.f1.attempts = 5;
    await expect(svc.confirmPhoneCode(freelancer, "123456")).rejects.toThrow(/too many/i);
  });

  it("refuses a banned user", async () => {
    const db = prismaDouble();
    const banned: Actor = { ...freelancer, status: "banned" };
    await expect(makeService(db).svc.requestPhoneCode(banned, "+12125550123")).rejects.toThrow(
      ForbiddenException,
    );
  });
});

describe("VerificationService — ID submission", () => {
  const submission = {
    fullName: "Marisol Rivera",
    dob: "1990-04-12",
    idNumber: "AB123456",
    idFrontPath: "/secured/f1/id-front.jpg",
    selfiePath: "/secured/f1/selfie.jpg",
  };

  it("queues for manual review by default — does not self-verify", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, idVerified: false };
    const res = await makeService(db).svc.submitId(freelancer, submission);

    expect(res.status).toBe("pending");
    expect(db.verifications[0].status).toBe("pending");
    expect(db.users.f1.idVerified).toBe(false); // crucially NOT flipped on submit
  });

  it("stores dob and idNumber encrypted, never in the clear (NFR-SEC-2)", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, idVerified: false };
    await makeService(db).svc.submitId(freelancer, submission);

    const stored = db.verifications[0];
    expect(stored.idNumber).not.toBe("AB123456");
    expect(stored.dob).not.toBe("1990-04-12");
    expect(stored.idNumber.startsWith("v1.")).toBe(true);
    // fullName is not secret and stays readable.
    expect(stored.fullName).toBe("Marisol Rivera");
    // It round-trips back to the original for an authorised reader.
    expect(pii.decrypt(stored.idNumber)).toBe("AB123456");
  });

  it("a retryable review is not stored or queued — files are discarded and the user is told to retry", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, idVerified: false };
    const engine: VerificationProvider = {
      assess: async () => ({ decision: "review", score: null, retryable: true, reason: "Retake your selfie." }),
    };
    const { svc, securedStorage } = makeService(db, { engine });
    const res = await svc.submitId(freelancer, submission);

    expect(res.status).toBe("retry");
    expect(res.message).toMatch(/retake/i);
    expect(db.verifications).toHaveLength(0); // nothing queued for an admin
    expect(securedStorage.removeFile).toHaveBeenCalledWith(submission.idFrontPath);
    expect(securedStorage.removeFile).toHaveBeenCalledWith(submission.selfiePath);
  });

  it("a NON-retryable review is still queued for an admin", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, idVerified: false };
    const engine: VerificationProvider = {
      assess: async () => ({ decision: "review", score: null, retryable: false, reason: "in review" }),
    };
    const res = await makeService(db, { engine }).svc.submitId(freelancer, submission);
    expect(res.status).toBe("pending");
    expect(db.verifications[0].status).toBe("pending");
  });

  it("an auto engine that verifies flips id_verified immediately", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, idVerified: false };
    db.profiles.f1 = { userId: "f1", isVisible: false };
    const engine: VerificationProvider = {
      assess: async () => ({ decision: "verified", score: 0.97 }),
    };
    const res = await makeService(db, { engine }).svc.submitId(freelancer, submission);

    expect(res.status).toBe("approved");
    expect(db.users.f1.idVerified).toBe(true);
    expect(db.profiles.f1.isVisible).toBe(true); // FR-V-5
  });
});

describe("VerificationService — review images", () => {
  const submission = {
    fullName: "Marisol Rivera",
    dob: "1990-04-12",
    idNumber: "AB123456",
    idFrontPath: "/secured/f1/id-front.jpg",
    selfiePath: "/secured/f1/selfie.png",
  };

  it("serves a stored image with a content type inferred from its extension", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, idVerified: false };
    const { svc, securedStorage } = makeService(db);
    await svc.submitId(freelancer, submission);
    const id = db.verifications[0].id;

    const front = await svc.getReviewImage(id, "front");
    expect(front.contentType).toBe("image/jpeg");
    const selfie = await svc.getReviewImage(id, "selfie");
    expect(selfie.contentType).toBe("image/png");
    expect(securedStorage.read).toHaveBeenCalledWith("/secured/f1/id-front.jpg");
  });

  it("404s an image the record doesn't have (no back uploaded)", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, idVerified: false };
    const { svc } = makeService(db);
    await svc.submitId(freelancer, submission);
    await expect(svc.getReviewImage(db.verifications[0].id, "back")).rejects.toThrow(NotFoundException);
  });

  it("404s an unknown verification", async () => {
    await expect(makeService(prismaDouble()).svc.getReviewImage("nope", "front")).rejects.toThrow(NotFoundException);
  });
});

describe("VerificationService — admin review", () => {
  const submission = {
    fullName: "Marisol Rivera", dob: "1990-04-12", idNumber: "AB123456",
    idFrontPath: "/s/a.jpg", selfiePath: "/s/b.jpg",
  };
  const admin = "admin1";

  it("approval flips id_verified and makes a freelancer profile visible", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, idVerified: false };
    db.profiles.f1 = { userId: "f1", isVisible: false };
    const { svc } = makeService(db);
    await svc.submitId(freelancer, submission);

    await svc.approve(admin, "v1");

    expect(db.users.f1.idVerified).toBe(true);
    expect(db.profiles.f1.isVisible).toBe(true);
    expect(db.verifications[0].status).toBe("approved");
    expect(db.verifications[0].reviewedById).toBe(admin);
  });

  it("approval works even if the freelancer hasn't built a profile yet", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, idVerified: false }; // no profile row
    const { svc } = makeService(db);
    await svc.submitId(freelancer, submission);
    await expect(svc.approve(admin, "v1")).resolves.toBeUndefined();
    expect(db.users.f1.idVerified).toBe(true);
  });

  it("rejection records the decision and leaves id_verified false", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, idVerified: false };
    const { svc } = makeService(db);
    await svc.submitId(freelancer, submission);

    await svc.reject(admin, "v1", "Photo too blurry to read.");

    expect(db.users.f1.idVerified).toBe(false);
    expect(db.verifications[0].status).toBe("rejected");
    expect(db.verifications[0].reviewNote).toContain("blurry");
  });

  it("won't decide a request twice", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, idVerified: false };
    const { svc } = makeService(db);
    await svc.submitId(freelancer, submission);
    await svc.approve(admin, "v1");
    await expect(svc.approve(admin, "v1")).rejects.toThrow(/already/i);
  });

  it("404s an unknown request", async () => {
    const db = prismaDouble();
    await expect(makeService(db).svc.approve(admin, "nope")).rejects.toThrow(NotFoundException);
  });

  it("lists only pending requests", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, idVerified: false };
    db.users.f2 = { id: "f2", role: "freelancer", status: "active", idVerified: false };
    const { svc } = makeService(db);
    await svc.submitId(freelancer, submission);
    await svc.submitId({ id: "f2", role: "freelancer", status: "active" }, submission);
    await svc.approve(admin, "v1");

    const pending = await svc.listPending();
    expect(pending.total).toBe(1);
    expect(pending.items).toHaveLength(1);
    expect(pending.items[0].id).toBe("v2");
    // The reviewer sees decrypted PII, not the stored ciphertext.
    expect(pending.items[0].idNumber).toBe("AB123456");
    expect(pending.items[0].dob).toBe("1990-04-12");
  });
});
