import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { AdminModerationService } from "./admin-moderation.service";
import type { PrismaService } from "../prisma/prisma.service";
import type { PublicStorageService } from "../storage/public-storage.service";
import type { SecuredStorageService } from "../storage/secured-storage.service";

function prismaDouble() {
  const users: any[] = [];
  const posts: any[] = [];
  const violations: any[] = [];
  return {
    users,
    posts,
    violations,
    violation: {
      findMany: jest.fn(async () => violations),
    },
    post: {
      findMany: jest.fn(async ({ where }: any) => posts.filter((p) => p.status === where.status)),
    },
    user: {
      findMany: jest.fn(async ({ where }: any = {}) =>
        where?.status ? users.filter((u) => u.status === where.status) : [...users],
      ),
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
  it("lists only blocked posts", async () => {
    const db = prismaDouble();
    db.posts.push({ id: "p1", status: "blocked" }, { id: "p2", status: "active" });
    const list = await svc(db).listBlockedPosts();
    expect(list.map((p: any) => p.id)).toEqual(["p1"]);
  });

  it("lists only banned users", async () => {
    const db = prismaDouble();
    db.users.push({ id: "u1", status: "banned" }, { id: "u2", status: "active" });
    const list = await svc(db).listBannedUsers();
    expect(list.map((u: any) => u.id)).toEqual(["u1"]);
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

  it("404s reinstating an unknown user", async () => {
    await expect(svc(prismaDouble()).reinstate("nope")).rejects.toThrow(NotFoundException);
  });

  it("lists all users, not just banned ones", async () => {
    const db = prismaDouble();
    db.users.push({ id: "u1", status: "active" }, { id: "u2", status: "banned" });
    const list = await svc(db).listUsers();
    expect(list.map((u: any) => u.id).sort()).toEqual(["u1", "u2"]);
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

  it("won't let an admin delete themselves", async () => {
    const db = prismaDouble();
    db.users.push({ id: "admin1", role: "admin" });
    await expect(svc(db).deleteUser("admin1", "admin1")).rejects.toThrow(BadRequestException);
  });

  it("won't delete another admin", async () => {
    const db = prismaDouble();
    db.users.push({ id: "admin2", role: "admin" });
    await expect(svc(db).deleteUser("admin1", "admin2")).rejects.toThrow(ForbiddenException);
  });

  it("404s deleting an unknown user", async () => {
    await expect(svc(prismaDouble()).deleteUser("admin1", "nope")).rejects.toThrow(NotFoundException);
  });
});
