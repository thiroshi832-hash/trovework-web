import { AnalyticsService } from "./analytics.service";
import type { PrismaService } from "../prisma/prisma.service";

type UpsertArg = { where: { visitorId_day: { visitorId: string } }; update: unknown };

function makeService() {
  let lastUpsert: UpsertArg | undefined;
  const upsert = jest.fn(async (arg: UpsertArg) => {
    lastUpsert = arg;
  });
  const count = jest.fn(async () => 5);
  const groupBy = jest.fn(async () => [
    { day: new Date("2026-08-22"), _count: { _all: 3 } },
    { day: new Date("2026-08-23"), _count: { _all: 5 } },
  ]);
  const queryRaw = jest.fn(async () => [{ count: BigInt(42) }]);
  const db = { visit: { upsert, count, groupBy }, $queryRaw: queryRaw };
  return {
    svc: new AnalyticsService(db as unknown as PrismaService),
    upsert,
    getLastUpsert: () => lastUpsert,
  };
}

describe("AnalyticsService", () => {
  it("records a visit idempotently per (visitor, day)", async () => {
    const { svc, upsert, getLastUpsert } = makeService();
    await svc.recordVisit("v1");
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(getLastUpsert()?.where.visitorId_day.visitorId).toBe("v1");
    expect(getLastUpsert()?.update).toEqual({}); // no-op on repeat
  });

  it("returns today's count, all-time total, and a daily series", async () => {
    const { svc } = makeService();
    const s = await svc.stats();
    expect(s.today).toBe(5);
    expect(s.total).toBe(42);
    expect(s.daily).toEqual([
      { day: "2026-08-22", count: 3 },
      { day: "2026-08-23", count: 5 },
    ]);
  });
});
