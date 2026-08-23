import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { EMAIL_PROVIDER } from "./providers/email.provider";
import { PrismaService } from "../prisma/prisma.service";

const CONFIG: Record<string, string> = {
  JWT_ACCESS_SECRET: "test-access-secret",
  ACCESS_TOKEN_TTL: "15m",
  REFRESH_TOKEN_TTL: "7d",
  NODE_ENV: "development",
};

/** Same in-memory stand-in the service spec uses, exercised through HTTP here. */
function prismaDouble() {
  const users: any[] = [];
  const tokens: any[] = [];
  return {
    users,
    tokens,
    user: {
      // Honour `select` the way Prisma does, otherwise the double hands back
      // columns the real query never returns (e.g. passwordHash) and the test
      // would not be checking what production actually does.
      findUnique: jest.fn(async ({ where, select }: any) => {
        const u = users.find((x) => (where.email ? x.email === where.email : x.id === where.id));
        if (!u) return null;
        if (!select) return u;
        return Object.fromEntries(
          Object.keys(select).filter((k) => select[k]).map((k) => [k, u[k]]),
        );
      }),
      create: jest.fn(async ({ data }: any) => {
        const u = {
          id: `u${users.length + 1}`,
          phoneVerified: false,
          idVerified: false,
          status: "active",
          createdAt: new Date(),
          ...data,
        };
        users.push(u);
        return u;
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const u = users.find((x) => x.id === where.id);
        if (u) Object.assign(u, data);
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
        return t ? { ...t, user: users.find((u) => u.id === t.userId) } : null;
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const t = tokens.find((x) => x.id === where.id);
        Object.assign(t, data);
        return t;
      }),
      updateMany: jest.fn(async ({ where, data }: any) => {
        tokens
          .filter((t) => (where.userId ? t.userId === where.userId : t.tokenHash === where.tokenHash))
          .forEach((t) => Object.assign(t, data));
        return { count: 0 };
      }),
    },
  };
}

const VALID = {
  email: "marisol@example.com",
  password: "cleaning2026",
  fullName: "Marisol Rivera",
  role: "freelancer",
  country: "Canada",
  state: "Ontario",
  postalCode: "M5V2T6",
};

/** Pull one cookie's value out of a Set-Cookie header list. */
function cookieValue(setCookie: string[] | undefined, name: string): string | undefined {
  const line = (setCookie ?? []).find((c) => c.startsWith(`${name}=`));
  return line?.split(";")[0].split("=")[1];
}

describe("AuthController (HTTP)", () => {
  let app: INestApplication;
  let db: ReturnType<typeof prismaDouble>;

  beforeEach(async () => {
    db = prismaDouble();

    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({})],
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtStrategy,
        { provide: PrismaService, useValue: db },
        { provide: EMAIL_PROVIDER, useValue: { sendPasswordReset: jest.fn() } },
        {
          provide: ConfigService,
          useValue: { get: (k: string, d?: string) => CONFIG[k] ?? d, getOrThrow: (k: string) => CONFIG[k] },
        },
        { provide: APP_GUARD, useFactory: (r: Reflector) => new JwtAuthGuard(r), inject: [Reflector] },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("POST /auth/register", () => {
    it("creates the account and sets both cookies httpOnly", async () => {
      const res = await request(app.getHttpServer()).post("/auth/register").send(VALID).expect(201);

      expect(res.body.userId).toBeDefined();
      const setCookie = res.headers["set-cookie"] as unknown as string[];

      const access = setCookie.find((c) => c.startsWith("access_token="))!;
      const refresh = setCookie.find((c) => c.startsWith("refresh_token="))!;
      expect(access).toMatch(/HttpOnly/i);
      expect(refresh).toMatch(/HttpOnly/i);
      // Refresh is scoped so it is not sent with every ordinary request.
      expect(refresh).toMatch(/Path=\/api\/auth/i);
    });

    it("never returns the password or its hash", async () => {
      const res = await request(app.getHttpServer()).post("/auth/register").send(VALID).expect(201);
      expect(JSON.stringify(res.body)).not.toContain(VALID.password);
      expect(JSON.stringify(res.body)).not.toContain("passwordHash");
    });

    it("rejects a weak password", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({ ...VALID, password: "short" })
        .expect(400);
    });

    it("rejects a password with no digit", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({ ...VALID, password: "onlyletters" })
        .expect(400);
    });

    it("rejects an invalid role", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({ ...VALID, role: "admin" })
        .expect(400);
    });

    // Mass-assignment guard: a caller must not be able to set their own flags.
    it("strips unknown fields rather than trusting them", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({ ...VALID, idVerified: true, role: "freelancer" })
        .expect(400); // forbidNonWhitelisted rejects outright
    });

    it("rejects a duplicate email with 409", async () => {
      await request(app.getHttpServer()).post("/auth/register").send(VALID).expect(201);
      await request(app.getHttpServer()).post("/auth/register").send(VALID).expect(409);
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      await request(app.getHttpServer()).post("/auth/register").send(VALID);
    });

    it("accepts the right credentials", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: VALID.email, password: VALID.password })
        .expect(200);
    });

    it("rejects a wrong password with 401", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: VALID.email, password: "wrongpassword1" })
        .expect(401);
    });

    it("returns the same body for an unknown email as for a wrong password", async () => {
      const wrongPw = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: VALID.email, password: "wrongpassword1" });
      const noUser = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "ghost@example.com", password: "wrongpassword1" });

      expect(noUser.status).toBe(wrongPw.status);
      expect(noUser.body.message).toBe(wrongPw.body.message);
    });
  });

  describe("GET /auth/me", () => {
    it("is refused without a session", async () => {
      await request(app.getHttpServer()).get("/auth/me").expect(401);
    });

    it("returns the signed-in user, without the password hash", async () => {
      const reg = await request(app.getHttpServer()).post("/auth/register").send(VALID);
      const access = cookieValue(reg.headers["set-cookie"] as unknown as string[], "access_token");

      const me = await request(app.getHttpServer())
        .get("/auth/me")
        .set("Cookie", [`access_token=${access}`])
        .expect(200);

      expect(me.body.email).toBe(VALID.email);
      expect(me.body.role).toBe("freelancer");
      expect(me.body.passwordHash).toBeUndefined();
      // A fresh account is unverified, so it cannot publish yet.
      expect(me.body.phoneVerified).toBe(false);
      expect(me.body.idVerified).toBe(false);
    });

    it("refuses a token signed with the wrong secret", async () => {
      // A forged token must not pass, even if it is well-formed.
      const forged =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
        Buffer.from(JSON.stringify({ sub: "u1", role: "admin" })).toString("base64url") +
        ".not-a-real-signature";
      await request(app.getHttpServer())
        .get("/auth/me")
        .set("Cookie", [`access_token=${forged}`])
        .expect(401);
    });
  });

  describe("POST /auth/refresh", () => {
    it("rotates the session and issues new cookies", async () => {
      const reg = await request(app.getHttpServer()).post("/auth/register").send(VALID);
      const first = cookieValue(reg.headers["set-cookie"] as unknown as string[], "refresh_token")!;

      const res = await request(app.getHttpServer())
        .post("/auth/refresh")
        .set("Cookie", [`refresh_token=${first}`])
        .expect(200);

      const second = cookieValue(res.headers["set-cookie"] as unknown as string[], "refresh_token");
      expect(second).toBeDefined();
      expect(second).not.toBe(first);
    });

    it("rejects a replayed token and clears the cookies", async () => {
      const reg = await request(app.getHttpServer()).post("/auth/register").send(VALID);
      const first = cookieValue(reg.headers["set-cookie"] as unknown as string[], "refresh_token")!;

      await request(app.getHttpServer()).post("/auth/refresh").set("Cookie", [`refresh_token=${first}`]);

      const replay = await request(app.getHttpServer())
        .post("/auth/refresh")
        .set("Cookie", [`refresh_token=${first}`])
        .expect(401);

      const cleared = (replay.headers["set-cookie"] as unknown as string[]) ?? [];
      expect(cleared.some((c) => c.startsWith("refresh_token=;"))).toBe(true);
    });

    it("401s with no cookie at all", async () => {
      await request(app.getHttpServer()).post("/auth/refresh").expect(401);
    });
  });

  describe("POST /auth/logout", () => {
    it("clears cookies and kills the refresh token", async () => {
      const reg = await request(app.getHttpServer()).post("/auth/register").send(VALID);
      const refresh = cookieValue(reg.headers["set-cookie"] as unknown as string[], "refresh_token")!;

      await request(app.getHttpServer())
        .post("/auth/logout")
        .set("Cookie", [`refresh_token=${refresh}`])
        .expect(204);

      await request(app.getHttpServer())
        .post("/auth/refresh")
        .set("Cookie", [`refresh_token=${refresh}`])
        .expect(401);
    });
  });
});
