import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { createHash } from "node:crypto";
import { ConfigService } from "@nestjs/config";
import { VerificationService, type Actor } from "./verification.service";
import { ManualVerificationProvider, type VerificationProvider } from "./providers/verification.provider";
import { PiiCryptoService } from "../crypto/pii-crypto.service";
import type { SmsProvider } from "./providers/sms.provider";
import type { PrismaService } from "../prisma/prisma.service";

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
      upsert: jest.fn(async ({ where, create, update }: any) => {
        challenges[where.userId] = challenges[where.userId]
          ? { ...challenges[where.userId], ...update }
          : { attempts: 0, ...create }; // mirror the schema default
        return challenges[where.userId];
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
  opts: { sms?: SmsProvider; engine?: VerificationProvider } = {},
) {
  const sms = opts.sms ?? { sendCode: jest.fn(async () => undefined) };
  const engine = opts.engine ?? new ManualVerificationProvider();
  return { svc: new VerificationService(db as unknown as PrismaService, sms, engine, pii), sms, engine };
}

const freelancer: Actor = { id: "f1", role: "freelancer", status: "active" };

describe("VerificationService — phone", () => {
  it("sends a code and stores it hashed, never in the clear", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc, sms } = makeService(db);

    await svc.requestPhoneCode(freelancer, "+15551234567");

    expect(sms.sendCode).toHaveBeenCalledTimes(1);
    const sentCode = (sms.sendCode as jest.Mock).mock.calls[0][1];
    expect(db.challenges.f1.codeHash).toBe(sha(sentCode));
    expect(db.challenges.f1.codeHash).not.toBe(sentCode);
  });

  it("verifies the correct code and flips phone_verified", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc, sms } = makeService(db);

    await svc.requestPhoneCode(freelancer, "+15551234567");
    const code = (sms.sendCode as jest.Mock).mock.calls[0][1];

    await expect(svc.confirmPhoneCode(freelancer, code)).resolves.toEqual({ phoneVerified: true });
    expect(db.users.f1.phoneVerified).toBe(true);
    expect(db.users.f1.phone).toBe("+15551234567");
    expect(db.challenges.f1).toBeUndefined(); // consumed
  });

  it("rejects a wrong code and counts the attempt", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc } = makeService(db);
    await svc.requestPhoneCode(freelancer, "+15551234567");

    await expect(svc.confirmPhoneCode(freelancer, "000000")).rejects.toThrow(BadRequestException);
    expect(db.challenges.f1.attempts).toBe(1);
    expect(db.users.f1.phoneVerified).toBe(false);
  });

  it("rejects an expired code and clears it", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc, sms } = makeService(db);
    await svc.requestPhoneCode(freelancer, "+15551234567");
    const code = (sms.sendCode as jest.Mock).mock.calls[0][1];
    db.challenges.f1.expiresAt = new Date(Date.now() - 1000);

    await expect(svc.confirmPhoneCode(freelancer, code)).rejects.toThrow(/expired/i);
    expect(db.challenges.f1).toBeUndefined();
  });

  it("locks out after too many attempts", async () => {
    const db = prismaDouble();
    db.users.f1 = { ...freelancer, phoneVerified: false };
    const { svc } = makeService(db);
    await svc.requestPhoneCode(freelancer, "+15551234567");
    db.challenges.f1.attempts = 5;
    await expect(svc.confirmPhoneCode(freelancer, "123456")).rejects.toThrow(/too many/i);
  });

  it("refuses a banned user", async () => {
    const db = prismaDouble();
    const banned: Actor = { ...freelancer, status: "banned" };
    await expect(makeService(db).svc.requestPhoneCode(banned, "+15551234567")).rejects.toThrow(
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
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe("v2");
    // The reviewer sees decrypted PII, not the stored ciphertext.
    expect(pending[0].idNumber).toBe("AB123456");
    expect(pending[0].dob).toBe("1990-04-12");
  });
});
