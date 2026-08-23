import { AnalyticsService } from "./analytics.service";
import type { PrismaService } from "../prisma/prisma.service";

function makeService() {
  const upsert = jest.fn(async (_arg: unknown) => undefined);
  const count = jest.fn(async () => 5);
  const groupBy = jest.fn(async () => [
    { day: new Date("2026-08-22"), _count: { _all: 3 } },
    { day: new Date("2026-08-23"), _count: { _all: 5 } },
  ]);
  const queryRaw = jest.fn(async () => [{ count: BigInt(42) }]);
  const db = { visit: { upsert, count, groupBy }, $queryRaw: queryRaw };
  return { svc: new AnalyticsService(db as unknown as PrismaService), upsert, count, groupBy, queryRaw };
}

describe("AnalyticsService", () => {
  it("records a visit idempotently per (visitor, day)", async () => {
    const { svc, upsert } = makeService();
    await svc.recordVisit("v1");
    expect(upsert).toHaveBeenCalledTimes(1);
    const arg = upsert.mock.calls[0][0] as {
      where: { visitorId_day: { visitorId: string } };
      update: unknown;
    };
    expect(arg.where.visitorId_day.visitorId).toBe("v1");
    expect(arg.update).toEqual({}); // no-op on repeat
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
