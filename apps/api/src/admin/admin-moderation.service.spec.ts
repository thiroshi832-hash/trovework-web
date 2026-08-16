import { BadRequestException, NotFoundException } from "@nestjs/common";
import { AdminModerationService } from "./admin-moderation.service";
import type { PrismaService } from "../prisma/prisma.service";

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
      findMany: jest.fn(async ({ where }: any) => users.filter((u) => u.status === where.status)),
      findUnique: jest.fn(async ({ where }: any) => users.find((u) => u.id === where.id) ?? null),
      update: jest.fn(async ({ where, data }: any) => {
        const u = users.find((x) => x.id === where.id);
        Object.assign(u, data);
        return u;
      }),
    },
  };
}

const makeService = (db: ReturnType<typeof prismaDouble>) =>
  new AdminModerationService(db as unknown as PrismaService);

describe("AdminModerationService", () => {
  it("lists only blocked posts", async () => {
    const db = prismaDouble();
    db.posts.push({ id: "p1", status: "blocked" }, { id: "p2", status: "active" });
    const list = await makeService(db).listBlockedPosts();
    expect(list.map((p: any) => p.id)).toEqual(["p1"]);
  });

  it("lists only banned users", async () => {
    const db = prismaDouble();
    db.users.push({ id: "u1", status: "banned" }, { id: "u2", status: "active" });
    const list = await makeService(db).listBannedUsers();
    expect(list.map((u: any) => u.id)).toEqual(["u1"]);
  });

  it("reinstates a banned user and clears their strikes", async () => {
    const db = prismaDouble();
    db.users.push({ id: "u1", status: "banned", strikeCount: 3 });
    await makeService(db).reinstate("u1");
    expect(db.users[0].status).toBe("active");
    expect(db.users[0].strikeCount).toBe(0);
  });

  it("won't reinstate a user who isn't banned", async () => {
    const db = prismaDouble();
    db.users.push({ id: "u1", status: "active", strikeCount: 0 });
    await expect(makeService(db).reinstate("u1")).rejects.toThrow(BadRequestException);
  });

  it("404s reinstating an unknown user", async () => {
    await expect(makeService(prismaDouble()).reinstate("nope")).rejects.toThrow(NotFoundException);
  });
});
