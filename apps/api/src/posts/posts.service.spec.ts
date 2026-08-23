import { ForbiddenException, NotFoundException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { PostsService, type PostAuthor } from "./posts.service";
import type { PrismaService } from "../prisma/prisma.service";

/** In-memory Prisma double covering the tables the posts service touches, plus
 *  a $transaction that just runs the callback against the same store. */
function prismaDouble() {
  const posts: any[] = [];
  const violations: any[] = [];
  const users: Record<string, any> = {};

  // Annotated `any` because $transaction references `store` inside its own
  // initializer, which TS otherwise can't infer (TS7022/7024).
  const store: any = {
    users,
    posts,
    violations,
    post: {
      create: jest.fn(async ({ data }: any) => {
        const p = { id: `p${posts.length + 1}`, createdAt: new Date(), updatedAt: new Date(), blockedReason: null, ...data };
        posts.push(p);
        return p;
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const p = posts.find((x) => x.id === where.id);
        Object.assign(p, data, { updatedAt: new Date() });
        return p;
      }),
      findUnique: jest.fn(async ({ where }: any) => posts.find((x) => x.id === where.id) ?? null),
      findMany: jest.fn(async ({ where }: any) => posts.filter((x) => x.authorId === where.authorId)),
      delete: jest.fn(async ({ where }: any) => {
        const i = posts.findIndex((x) => x.id === where.id);
        return posts.splice(i, 1)[0];
      }),
    },
    violation: {
      create: jest.fn(async ({ data }: any) => {
        const v = { id: `v${violations.length + 1}`, createdAt: new Date(), ...data };
        violations.push(v);
        return v;
      }),
    },
    user: {
      update: jest.fn(async ({ where, data, select }: any) => {
        const u = users[where.id];
        if (data.strikeCount?.increment) u.strikeCount += data.strikeCount.increment;
        if (data.status) u.status = data.status;
        return select ? { strikeCount: u.strikeCount } : u;
      }),
    },
    $transaction: jest.fn(async (fn: (tx: unknown) => unknown) => fn(store)),
  };
  return store;
}

function makeService(db: ReturnType<typeof prismaDouble>, env: Record<string, string> = {}) {
  const config = { get: (key: string) => env[key] } as unknown as ConfigService;
  return new PostsService(db as unknown as PrismaService, config);
}

const verifiedFreelancer: PostAuthor = {
  id: "u1",
  role: "freelancer",
  status: "active",
  phoneVerified: true,
  idVerified: true,
};

const CLEAN = {
  title: "Deep cleaning for homes and offices",
  description: "Ten years of experience, eco-friendly products, rates from 10,000 per visit.",
  category: "Home & Cleaning",
  status: "active" as const,
};

const LEAKY = {
  ...CLEAN,
  description: "Great rates. Message me on whatsapp or call 555 123 4567.",
};

describe("PostsService", () => {
  describe("create — clean posts", () => {
    it("publishes a clean post for a verified freelancer", async () => {
      const db = prismaDouble();
      db.users.u1 = { ...verifiedFreelancer, strikeCount: 0 };
      const res = await makeService(db).create(verifiedFreelancer, CLEAN);
      expect(res.blocked).toBeUndefined();
      expect(res.post.status).toBe("active");
    });

    it("saves a clean draft even before verification", async () => {
      const db = prismaDouble();
      db.users.u1 = { strikeCount: 0 };
      const unverified: PostAuthor = { ...verifiedFreelancer, phoneVerified: false, idVerified: false };
      const res = await makeService(db).create(unverified, { ...CLEAN, status: "draft" });
      expect(res.post.status).toBe("draft");
    });
  });

  describe("publish gate", () => {
    it("blocks publishing without phone verification", async () => {
      const db = prismaDouble();
      const author: PostAuthor = { ...verifiedFreelancer, phoneVerified: false };
      await expect(makeService(db).create(author, CLEAN)).rejects.toThrow(/phone/i);
    });

    it("blocks publishing without ID verification", async () => {
      const db = prismaDouble();
      const author: PostAuthor = { ...verifiedFreelancer, idVerified: false };
      await expect(makeService(db).create(author, CLEAN)).rejects.toThrow(/identity/i);
    });

    it("allows a US freelancer to publish without phone (US SMS can't be delivered)", async () => {
      const db = prismaDouble();
      db.users.u1 = { strikeCount: 0 };
      const author: PostAuthor = {
        ...verifiedFreelancer,
        phoneVerified: false,
        idVerified: true,
        country: "United States",
      };
      const res = await makeService(db).create(author, CLEAN);
      expect(res.post.status).toBe("active");
    });

    it("still requires phone for a non-US freelancer", async () => {
      const db = prismaDouble();
      const author: PostAuthor = { ...verifiedFreelancer, phoneVerified: false, country: "Germany" };
      await expect(makeService(db).create(author, CLEAN)).rejects.toThrow(/phone/i);
    });

    it("allows publishing without phone when phone verification is turned off", async () => {
      const db = prismaDouble();
      db.users.u1 = { strikeCount: 0 };
      const author: PostAuthor = { ...verifiedFreelancer, phoneVerified: false, idVerified: true };
      const res = await makeService(db, { PHONE_VERIFICATION_REQUIRED: "false" }).create(author, CLEAN);
      expect(res.post.status).toBe("active");
    });

    it("still requires ID when phone verification is turned off", async () => {
      const db = prismaDouble();
      const author: PostAuthor = { ...verifiedFreelancer, phoneVerified: false, idVerified: false };
      await expect(
        makeService(db, { PHONE_VERIFICATION_REQUIRED: "false" }).create(author, CLEAN),
      ).rejects.toThrow(/identity/i);
    });

    it("refuses a client outright", async () => {
      const db = prismaDouble();
      const client: PostAuthor = { ...verifiedFreelancer, role: "client" };
      await expect(makeService(db).create(client, CLEAN)).rejects.toThrow(ForbiddenException);
    });

    it("refuses a banned freelancer", async () => {
      const db = prismaDouble();
      const banned: PostAuthor = { ...verifiedFreelancer, status: "banned" };
      await expect(makeService(db).create(banned, CLEAN)).rejects.toThrow(/suspended/i);
    });
  });

  describe("scanner blocks leaks and counts strikes", () => {
    it("blocks a leaky post, records a violation, and reports strike 1 of 3", async () => {
      const db = prismaDouble();
      db.users.u1 = { ...verifiedFreelancer, strikeCount: 0 };
      const res = await makeService(db).create(verifiedFreelancer, LEAKY);

      expect(res.post.status).toBe("blocked");
      expect(res.post.blockedReason).toContain("whatsapp");
      expect(res.blocked?.strikeCount).toBe(1);
      expect(res.blocked?.banned).toBe(false);
      expect(res.blocked?.message).toMatch(/strike 1 of 3/i);
      expect(db.violations).toHaveLength(1);
      expect(db.users.u1.strikeCount).toBe(1);
    });

    it("shows the offending text so honest mistakes can be fixed (FR-M-5)", async () => {
      const db = prismaDouble();
      db.users.u1 = { ...verifiedFreelancer, strikeCount: 0 };
      const res = await makeService(db).create(verifiedFreelancer, LEAKY);
      expect(res.blocked?.detectedText).toContain("555 123 4567");
    });

    it("bans the account on the third strike (FR-M-4)", async () => {
      const db = prismaDouble();
      db.users.u1 = { ...verifiedFreelancer, strikeCount: 2 }; // two already
      const res = await makeService(db).create(verifiedFreelancer, LEAKY);

      expect(res.blocked?.strikeCount).toBe(3);
      expect(res.blocked?.banned).toBe(true);
      expect(res.blocked?.message).toMatch(/suspended/i);
      expect(db.users.u1.status).toBe("banned");
    });

    it("does not ban on the second strike", async () => {
      const db = prismaDouble();
      db.users.u1 = { ...verifiedFreelancer, strikeCount: 1 };
      const res = await makeService(db).create(verifiedFreelancer, LEAKY);
      expect(res.blocked?.strikeCount).toBe(2);
      expect(res.blocked?.banned).toBe(false);
      expect(db.users.u1.status).not.toBe("banned");
    });

    it("blocks a leaky draft too — the scan runs on every save", async () => {
      const db = prismaDouble();
      db.users.u1 = { ...verifiedFreelancer, strikeCount: 0 };
      const res = await makeService(db).create(verifiedFreelancer, { ...LEAKY, status: "draft" });
      expect(res.post.status).toBe("blocked");
      expect(db.violations).toHaveLength(1);
    });
  });

  describe("update", () => {
    it("clears the blocked flag once the text scans clean", async () => {
      const db = prismaDouble();
      db.users.u1 = { ...verifiedFreelancer, strikeCount: 0 };
      const svc = makeService(db);
      const blocked = await svc.create(verifiedFreelancer, LEAKY);
      expect(blocked.post.status).toBe("blocked");

      const fixed = await svc.update(verifiedFreelancer, blocked.post.id, {
        description: CLEAN.description,
        status: "active",
      });
      expect(fixed.post.status).toBe("active");
      expect(fixed.post.blockedReason).toBeNull();
      expect(fixed.blocked).toBeUndefined();
    });

    it("counts another strike if the edit still leaks", async () => {
      const db = prismaDouble();
      db.users.u1 = { ...verifiedFreelancer, strikeCount: 0 };
      const svc = makeService(db);
      const first = await svc.create(verifiedFreelancer, LEAKY);
      await svc.update(verifiedFreelancer, first.post.id, { description: "still here: @my_handle" });
      expect(db.users.u1.strikeCount).toBe(2);
    });

    it("404s when editing a post that isn't yours", async () => {
      const db = prismaDouble();
      db.users.u1 = { ...verifiedFreelancer, strikeCount: 0 };
      db.users.u2 = { ...verifiedFreelancer, id: "u2", strikeCount: 0 };
      const svc = makeService(db);
      const mine = await svc.create(verifiedFreelancer, CLEAN);
      const other: PostAuthor = { ...verifiedFreelancer, id: "u2" };
      await expect(svc.update(other, mine.post.id, { title: "hijack attempt" })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("getOwn", () => {
    it("returns the author's own post", async () => {
      const db = prismaDouble();
      db.users.u1 = { ...verifiedFreelancer, strikeCount: 0 };
      const svc = makeService(db);
      const mine = await svc.create(verifiedFreelancer, { ...CLEAN, status: "draft" });
      const fetched = await svc.getOwn(verifiedFreelancer.id, mine.post.id);
      expect(fetched.id).toBe(mine.post.id);
    });

    it("404s for a post that isn't yours", async () => {
      const db = prismaDouble();
      db.users.u1 = { ...verifiedFreelancer, strikeCount: 0 };
      const svc = makeService(db);
      const mine = await svc.create(verifiedFreelancer, { ...CLEAN, status: "draft" });
      await expect(svc.getOwn("u2", mine.post.id)).rejects.toThrow(NotFoundException);
    });

    it("404s for a post that doesn't exist", async () => {
      const svc = makeService(prismaDouble());
      await expect(svc.getOwn("u1", "missing")).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("deletes the author's own post", async () => {
      const db = prismaDouble();
      db.users.u1 = { ...verifiedFreelancer, strikeCount: 0 };
      const svc = makeService(db);
      const mine = await svc.create(verifiedFreelancer, { ...CLEAN, status: "draft" });
      await svc.remove(verifiedFreelancer, mine.post.id);
      expect(db.posts).toHaveLength(0);
    });

    it("won't delete someone else's post", async () => {
      const db = prismaDouble();
      db.users.u1 = { ...verifiedFreelancer, strikeCount: 0 };
      const svc = makeService(db);
      const mine = await svc.create(verifiedFreelancer, { ...CLEAN, status: "draft" });
      const other: PostAuthor = { ...verifiedFreelancer, id: "u2" };
      await expect(svc.remove(other, mine.post.id)).rejects.toThrow(NotFoundException);
    });
  });
});
