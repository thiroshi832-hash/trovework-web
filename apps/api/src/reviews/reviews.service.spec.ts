import { ForbiddenException } from "@nestjs/common";
import { ReviewsService, type Reviewer } from "./reviews.service";
import type { PrismaService } from "../prisma/prisma.service";

function prismaDouble() {
  const conversations: any[] = [];
  const reviews: any[] = [];
  const db: any = {
    conversations,
    reviews,
    conversation: {
      findFirst: jest.fn(async ({ where }: any) => {
        const [a, b] = where.OR;
        return (
          conversations.find(
            (c) =>
              (c.clientId === a.clientId && c.freelancerId === a.freelancerId) ||
              (c.clientId === b.clientId && c.freelancerId === b.freelancerId),
          ) ?? null
        );
      }),
    },
    review: {
      upsert: jest.fn(async ({ where, create, update }: any) => {
        const existing = reviews.find((r) => r.fromId === where.fromId_toId.fromId && r.toId === where.fromId_toId.toId);
        if (existing) {
          Object.assign(existing, update);
          return existing;
        }
        const r = { id: `r${reviews.length + 1}`, ...create };
        reviews.push(r);
        return r;
      }),
      groupBy: jest.fn(async ({ where }: any) => {
        const ids: string[] = where.toId.in;
        return ids
          .map((id) => {
            const mine = reviews.filter((r) => r.toId === id);
            if (!mine.length) return null;
            return { toId: id, _avg: { rating: mine.reduce((s, r) => s + r.rating, 0) / mine.length }, _count: { rating: mine.length } };
          })
          .filter(Boolean);
      }),
    },
  };
  return db;
}

const makeService = (db: ReturnType<typeof prismaDouble>) => new ReviewsService(db as unknown as PrismaService);
const author: Reviewer = { id: "c1", status: "active" };

function seedConversation(db: ReturnType<typeof prismaDouble>, clientId = "c1", freelancerId = "f1") {
  db.conversations.push({ id: "conv1", clientId, freelancerId });
}

describe("ReviewsService — create", () => {
  it("lets you review someone you've conversed with", async () => {
    const db = prismaDouble();
    seedConversation(db);
    const r = await makeService(db).create(author, "f1", 5, "Excellent work.");
    expect(r.rating).toBe(5);
    expect(db.reviews).toHaveLength(1);
  });

  it("works in the other direction too (freelancer reviews client)", async () => {
    const db = prismaDouble();
    seedConversation(db, "c1", "f1");
    const freelancer: Reviewer = { id: "f1", status: "active" };
    const r = await makeService(db).create(freelancer, "c1", 4);
    expect(r.toId).toBe("c1");
  });

  // FR-RV-1: only after contact.
  it("refuses a review of someone you've never conversed with", async () => {
    const db = prismaDouble();
    await expect(makeService(db).create(author, "stranger", 5)).rejects.toThrow(/worked with/i);
  });

  it("refuses reviewing yourself", async () => {
    const db = prismaDouble();
    await expect(makeService(db).create(author, "c1", 5)).rejects.toThrow(/yourself/i);
  });

  it("refuses a banned author", async () => {
    const db = prismaDouble();
    seedConversation(db);
    await expect(makeService(db).create({ ...author, status: "banned" }, "f1", 5)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it("updates rather than stacks a second review of the same person", async () => {
    const db = prismaDouble();
    seedConversation(db);
    const svc = makeService(db);
    await svc.create(author, "f1", 3, "ok");
    await svc.create(author, "f1", 5, "changed my mind");
    expect(db.reviews).toHaveLength(1);
    expect(db.reviews[0].rating).toBe(5);
  });
});

describe("ReviewsService — aggregateFor", () => {
  it("averages and counts, rounded to one decimal", async () => {
    const db = prismaDouble();
    seedConversation(db, "c1", "f1");
    seedConversation(db, "c2", "f1");
    db.reviews.push({ fromId: "c1", toId: "f1", rating: 5 }, { fromId: "c2", toId: "f1", rating: 4 });
    const agg = await makeService(db).aggregateFor(["f1"]);
    expect(agg.get("f1")).toEqual({ average: 4.5, count: 2 });
  });

  it("returns an empty map for no ids", async () => {
    const db = prismaDouble();
    expect((await makeService(db).aggregateFor([])).size).toBe(0);
  });

  it("omits users with no reviews", async () => {
    const db = prismaDouble();
    const agg = await makeService(db).aggregateFor(["nobody"]);
    expect(agg.has("nobody")).toBe(false);
  });
});
