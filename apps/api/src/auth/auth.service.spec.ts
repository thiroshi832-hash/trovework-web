import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import type { PrismaService } from "../prisma/prisma.service";

const CONFIG: Record<string, string> = {
  JWT_ACCESS_SECRET: "test-access-secret",
  ACCESS_TOKEN_TTL: "15m",
  REFRESH_TOKEN_TTL: "7d",
};

function makeService(prisma: Partial<PrismaService>, adminEmails = "") {
  const cfg: Record<string, string> = { ...CONFIG, ADMIN_EMAILS: adminEmails };
  const config = {
    get: (k: string, d?: string) => cfg[k] ?? d,
    getOrThrow: (k: string) => cfg[k],
  } as unknown as ConfigService;
  return new AuthService(prisma as PrismaService, new JwtService(), config);
}

/** Minimal in-memory stand-ins for the two tables auth touches. */
function prismaDouble() {
  const users: any[] = [];
  const tokens: any[] = [];
  return {
    users,
    tokens,
    user: {
      findUnique: jest.fn(async ({ where }: any) =>
        users.find((u) => (where.email ? u.email === where.email : u.id === where.id)) ?? null,
      ),
      create: jest.fn(async ({ data }: any) => {
        const u = { id: `u${users.length + 1}`, phoneVerified: false, idVerified: false, status: "active", ...data };
        users.push(u);
        return u;
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const u = users.find((x) => x.id === where.id);
        Object.assign(u, data);
        return u;
      }),
    },
    refreshToken: {
      create: jest.fn(async ({ data }: any) => {
        const t = { id: `t${tokens.length + 1}`, revokedAt: null, ...data };
        tokens.push(t);
        return t;
      }),
      findUnique: jest.fn(async ({ where }: any) => {
        const t = tokens.find((x) => x.tokenHash === where.tokenHash);
        if (!t) return null;
        return { ...t, user: users.find((u) => u.id === t.userId) };
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const t = tokens.find((x) => x.id === where.id);
        Object.assign(t, data);
        return t;
      }),
      updateMany: jest.fn(async ({ where, data }: any) => {
        tokens
          .filter((t) => (where.userId ? t.userId === where.userId : t.tokenHash === where.tokenHash))
          .filter((t) => (where.revokedAt === null ? t.revokedAt === null : true))
          .forEach((t) => Object.assign(t, data));
        return { count: 0 };
      }),
    },
  };
}

const REGISTRATION = {
  email: "Marisol@Example.com ",
  password: "cleaning2026",
  fullName: " Marisol Rivera ",
  role: "freelancer" as const,
  country: "Canada",
  state: "Ontario",
  postalCode: "M5V2T6",
};

describe("AuthService", () => {
  describe("register", () => {
    it("normalises the email and trims the name", async () => {
      const db = prismaDouble();
      await makeService(db as any).register({ ...REGISTRATION });
      expect(db.users[0].email).toBe("marisol@example.com");
      expect(db.users[0].fullName).toBe("Marisol Rivera");
    });

    it("never stores the raw password", async () => {
      const db = prismaDouble();
      await makeService(db as any).register({ ...REGISTRATION });
      expect(db.users[0].passwordHash).not.toBe(REGISTRATION.password);
      expect(await bcrypt.compare(REGISTRATION.password, db.users[0].passwordHash)).toBe(true);
    });

    it("rejects a duplicate email regardless of casing", async () => {
      const db = prismaDouble();
      const svc = makeService(db as any);
      await svc.register({ ...REGISTRATION });
      await expect(svc.register({ ...REGISTRATION, email: "MARISOL@example.com" })).rejects.toThrow(
        ConflictException,
      );
    });

    it("stores the refresh token hashed, not in the clear", async () => {
      const db = prismaDouble();
      const { refreshToken } = await makeService(db as any).register({ ...REGISTRATION });
      expect(db.tokens[0].tokenHash).not.toBe(refreshToken);
      expect(db.tokens[0].tokenHash).toHaveLength(64); // sha256 hex
    });
  });

  describe("login", () => {
    it("accepts the right password", async () => {
      const db = prismaDouble();
      const svc = makeService(db as any);
      await svc.register({ ...REGISTRATION });
      await expect(
        svc.login({ email: "marisol@example.com", password: REGISTRATION.password }),
      ).resolves.toHaveProperty("accessToken");
    });

    it("rejects the wrong password", async () => {
      const db = prismaDouble();
      const svc = makeService(db as any);
      await svc.register({ ...REGISTRATION });
      await expect(
        svc.login({ email: "marisol@example.com", password: "wrong-password-1" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    // Same message either way, so the endpoint cannot be used to discover
    // which email addresses have accounts.
    it("gives the same error for an unknown email as for a wrong password", async () => {
      const db = prismaDouble();
      const svc = makeService(db as any);
      await svc.register({ ...REGISTRATION });

      const wrongPw = await svc.login({ email: "marisol@example.com", password: "nope12345" }).catch((e) => e);
      const noUser = await svc.login({ email: "ghost@example.com", password: "nope12345" }).catch((e) => e);
      expect(noUser.message).toBe(wrongPw.message);
    });

    it("refuses a banned account", async () => {
      const db = prismaDouble();
      const svc = makeService(db as any);
      await svc.register({ ...REGISTRATION });
      db.users[0].status = "banned";
      await expect(
        svc.login({ email: "marisol@example.com", password: REGISTRATION.password }),
      ).rejects.toThrow(/suspended/i);
    });
  });

  describe("refresh", () => {
    it("rotates: the old token stops working and a new one is issued", async () => {
      const db = prismaDouble();
      const svc = makeService(db as any);
      const first = await svc.register({ ...REGISTRATION });

      const second = await svc.refresh(first.refreshToken);
      expect(second.refreshToken).not.toBe(first.refreshToken);

      await expect(svc.refresh(first.refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    // Reuse means the token leaked, so every session is killed rather than
    // letting the attacker and the victim both keep refreshing.
    it("revokes every session when a used token is presented again", async () => {
      const db = prismaDouble();
      const svc = makeService(db as any);
      const first = await svc.register({ ...REGISTRATION });
      const second = await svc.refresh(first.refreshToken);

      await expect(svc.refresh(first.refreshToken)).rejects.toThrow();

      // the still-current token is now dead too
      await expect(svc.refresh(second.refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it("rejects an expired token", async () => {
      const db = prismaDouble();
      const svc = makeService(db as any);
      const { refreshToken } = await svc.register({ ...REGISTRATION });
      db.tokens[0].expiresAt = new Date(Date.now() - 1000);
      await expect(svc.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it("rejects a token that was never issued", async () => {
      const db = prismaDouble();
      await expect(makeService(db as any).refresh("made-up-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("logout", () => {
    it("revokes the presented token", async () => {
      const db = prismaDouble();
      const svc = makeService(db as any);
      const { refreshToken } = await svc.register({ ...REGISTRATION });
      await svc.logout(refreshToken);
      await expect(svc.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it("is a no-op when no token is presented", async () => {
      await expect(makeService(prismaDouble() as any).logout(undefined)).resolves.toBeUndefined();
    });
  });

  describe("ttlToMs", () => {
    const svc = makeService(prismaDouble() as any);
    it.each([
      ["30s", 30_000],
      ["15m", 900_000],
      ["2h", 7_200_000],
      ["7d", 604_800_000],
    ])("parses %s", (input, expected) => {
      expect(svc.ttlToMs(input)).toBe(expected);
    });

    it("throws on nonsense", () => {
      expect(() => svc.ttlToMs("soon")).toThrow();
    });
  });
});

describe("AuthService — admin bootstrap", () => {
  it("promotes an ADMIN_EMAILS address to admin on login", async () => {
    const db = prismaDouble();
    const svc = makeService(db as any, "marisol@example.com, boss@trovework.com");
    await svc.register({ ...REGISTRATION });
    const res = await svc.login({ email: "marisol@example.com", password: REGISTRATION.password });
    expect(res).toHaveProperty("accessToken");
    expect(db.users[0].role).toBe("admin");
  });

  it("leaves a non-listed user's role untouched", async () => {
    const db = prismaDouble();
    const svc = makeService(db as any, "someone-else@trovework.com");
    await svc.register({ ...REGISTRATION });
    await svc.login({ email: "marisol@example.com", password: REGISTRATION.password });
    expect(db.users[0].role).toBe("freelancer");
  });

  it("promotes at registration when the email is listed", async () => {
    const db = prismaDouble();
    const svc = makeService(db as any, "marisol@example.com");
    await svc.register({ ...REGISTRATION });
    expect(db.users[0].role).toBe("admin");
  });

  it("is case-insensitive on the email match", async () => {
    const db = prismaDouble();
    const svc = makeService(db as any, "MARISOL@EXAMPLE.COM");
    await svc.register({ ...REGISTRATION });
    expect(db.users[0].role).toBe("admin");
  });
});
