import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { AdminModerationService } from "./admin-moderation.service";
import type { PrismaService } from "../prisma/prisma.service";
import type { PublicStorageService } from "../storage/public-storage.service";
import type { SecuredStorageService } from "../storage/secured-storage.service";

function prismaDouble() {
  const users: any[] = [];
  const posts: any[] = [];
  const violations: any[] = [];
  const profiles: any[] = [];
  const byStatus = (arr: any[], where: any) => (where?.status ? arr.filter((x) => x.status === where.status) : [...arr]);
  return {
    users,
    posts,
    violations,
    profiles,
    violation: {
      findMany: jest.fn(async () => violations),
      count: jest.fn(async () => violations.length),
    },
    post: {
      findMany: jest.fn(async ({ where }: any) => posts.filter((p) => p.status === where.status)),
      count: jest.fn(async ({ where }: any = {}) => byStatus(posts, where).length),
    },
    conversation: {
      count: jest.fn(async () => 0),
    },
    freelancerProfile: {
      findUnique: jest.fn(async ({ where }: any) => profiles.find((p) => p.userId === where.userId) ?? null),
    },
    idVerification: {
      findFirst: jest.fn(async () => null),
    },
    user: {
      findMany: jest.fn(async ({ where }: any = {}) => byStatus(users, where)),
      count: jest.fn(async ({ where }: any = {}) => byStatus(users, where).length),
      findUnique: jest.fn(async ({ where }: any) => users.find((u) => u.id === where.id) ?? null),
      update: jest.fn(async ({ where, data }: any) => {
        const u = users.find((x) => x.id === where.id);
        Object.assign(u, data);
        return u;
      }),
      delete: jest.fn(async ({ where }: any) => {
        const i = users.findIndex((u) => u.id === where.id);
        if (i >= 0) users.splice(i, 1);
      }),
    },
  };
}

const publicStorage = () => ({ removeUserDir: jest.fn(async () => undefined) });
const securedStorage = () => ({ removeUserDir: jest.fn(async () => undefined) });

function makeService(db: ReturnType<typeof prismaDouble>, pub = publicStorage(), sec = securedStorage()) {
  return {
    service: new AdminModerationService(
      db as unknown as PrismaService,
      pub as unknown as PublicStorageService,
      sec as unknown as SecuredStorageService,
    ),
    pub,
    sec,
  };
}

/** Most tests only want the service; a couple assert on the storage stubs. */
const svc = (db: ReturnType<typeof prismaDouble>) => makeService(db).service;

describe("AdminModerationService", () => {
  it("lists only blocked posts, with a total", async () => {
    const db = prismaDouble();
    db.posts.push({ id: "p1", status: "blocked" }, { id: "p2", status: "active" });
    const page = await svc(db).listBlockedPosts();
    expect(page.items.map((p: any) => p.id)).toEqual(["p1"]);
    expect(page.total).toBe(1);
  });

  it("lists only banned users, with a total", async () => {
    const db = prismaDouble();
    db.users.push({ id: "u1", status: "banned" }, { id: "u2", status: "active" });
    const page = await svc(db).listBannedUsers();
    expect(page.items.map((u: any) => u.id)).toEqual(["u1"]);
    expect(page.total).toBe(1);
  });

  it("lists all users with a total", async () => {
    const db = prismaDouble();
    db.users.push({ id: "u1", status: "active" }, { id: "u2", status: "banned" });
    const page = await svc(db).listUsers();
    expect(page.items.map((u: any) => u.id).sort()).toEqual(["u1", "u2"]);
    expect(page.total).toBe(2);
  });

  it("reinstates a banned user and clears their strikes", async () => {
    const db = prismaDouble();
    db.users.push({ id: "u1", status: "banned", strikeCount: 3 });
    await svc(db).reinstate("u1");
    expect(db.users[0].status).toBe("active");
    expect(db.users[0].strikeCount).toBe(0);
  });

  it("won't reinstate a user who isn't banned", async () => {
    const db = prismaDouble();
    db.users.push({ id: "u1", status: "active", strikeCount: 0 });
    await expect(svc(db).reinstate("u1")).rejects.toThrow(BadRequestException);
  });

  it("bans an active user", async () => {
    const db = prismaDouble();
    db.users.push({ id: "u1", status: "active", role: "freelancer" });
    await svc(db).ban("admin1", "u1");
    expect(db.users[0].status).toBe("banned");
  });

  it("won't ban self, another admin, or an already-banned user", async () => {
    const db = prismaDouble();
    db.users.push(
      { id: "admin1", status: "active", role: "admin" },
      { id: "admin2", status: "active", role: "admin" },
      { id: "u3", status: "banned", role: "freelancer" },
    );
    await expect(svc(db).ban("admin1", "admin1")).rejects.toThrow(BadRequestException);
    await expect(svc(db).ban("admin1", "admin2")).rejects.toThrow(ForbiddenException);
    await expect(svc(db).ban("admin1", "u3")).rejects.toThrow(BadRequestException);
  });

  it("resets a user's strikes without changing status", async () => {
    const db = prismaDouble();
    db.users.push({ id: "u1", status: "active", strikeCount: 2 });
    await svc(db).resetStrikes("u1");
    expect(db.users[0].strikeCount).toBe(0);
    expect(db.users[0].status).toBe("active");
  });

  it("returns user detail with counts", async () => {
    const db = prismaDouble();
    db.users.push({ id: "u1", status: "active", role: "freelancer", email: "a@b.com" });
    db.profiles.push({ userId: "u1", slug: "u-1", displayName: "U", category: "x", isVisible: true });
    const detail: any = await svc(db).getUserDetail("u1");
    expect(detail.email).toBe("a@b.com");
    expect(detail.profile.slug).toBe("u-1");
    expect(detail.postCount).toBe(0);
    expect(detail.conversationCount).toBe(0);
  });

  it("404s detail / reset / ban on an unknown user", async () => {
    await expect(svc(prismaDouble()).getUserDetail("nope")).rejects.toThrow(NotFoundException);
    await expect(svc(prismaDouble()).resetStrikes("nope")).rejects.toThrow(NotFoundException);
    await expect(svc(prismaDouble()).ban("admin1", "nope")).rejects.toThrow(NotFoundException);
  });

  it("deletes a user and cleans up their storage folders", async () => {
    const db = prismaDouble();
    db.users.push({ id: "u2", role: "freelancer" });
    const { service, pub, sec } = makeService(db);
    await service.deleteUser("admin1", "u2");
    expect(db.users.find((u: any) => u.id === "u2")).toBeUndefined();
    expect(pub.removeUserDir).toHaveBeenCalledWith("u2");
    expect(sec.removeUserDir).toHaveBeenCalledWith("u2");
  });

  it("won't let an admin delete themselves or another admin", async () => {
    const db = prismaDouble();
    db.users.push({ id: "admin1", role: "admin" }, { id: "admin2", role: "admin" });
    await expect(svc(db).deleteUser("admin1", "admin1")).rejects.toThrow(BadRequestException);
    await expect(svc(db).deleteUser("admin1", "admin2")).rejects.toThrow(ForbiddenException);
  });

  it("404s deleting an unknown user", async () => {
    await expect(svc(prismaDouble()).deleteUser("admin1", "nope")).rejects.toThrow(NotFoundException);
  });
});
