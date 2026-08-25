import { AnalyticsService } from "./analytics.service";
import type { PrismaService } from "../prisma/prisma.service";
import type { IpIntelService, IpClass } from "./ip-intel.service";

type UpsertArg = { where: { visitorId_day: { visitorId: string } }; create: Record<string, unknown>; update: unknown };

function makeService(opts: { visits?: any[]; classes?: Map<string, IpClass> } = {}) {
  let lastUpsert: UpsertArg | undefined;
  const upsert = jest.fn(async (arg: UpsertArg) => {
    lastUpsert = arg;
  });
  const groupBy = jest.fn(async () => [
    { day: new Date("2026-08-22"), _count: { _all: 3 } },
    { day: new Date("2026-08-23"), _count: { _all: 5 } },
  ]);
  // stats() runs several raw queries; distinguish them by their SQL text.
  const queryRaw = jest.fn(async (strings: TemplateStringsArray) => {
    const sql = Array.from(strings).join(" ");
    if (sql.includes("visitor_id")) return [{ count: BigInt(42) }];
    if (sql.includes("verified_at")) return [{ day: "2026-08-23", count: 2 }];
    if (sql.includes("login_events")) {
      return sql.includes("date_trunc") ? [{ day: "2026-08-23", count: 3 }] : [{ count: 3 }];
    }
    // signups daily (users + created_at)
    return [{ day: "2026-08-23", count: 4 }];
  });

  const visits: any[] = opts.visits ?? [];
  const findMany = jest.fn(async () => visits);
  const updateMany = jest.fn(async ({ where, data }: any) => {
    const affected = visits.filter((v) => v.ip === where.ip && v.classifiedAt == null);
    affected.forEach((v) => Object.assign(v, data));
    return { count: affected.length };
  });
  // count() is shared by stats() (today's count) and listVisits() (row total);
  // an empty visits list means the stats test, which expects 5.
  const count = jest.fn(async () => visits.length || 5);

  // user.count is called four times by stats(), distinguished by the filter.
  const userCount = jest.fn(async ({ where }: any = {}) => {
    if (!where) return 7; // registered total
    if (where.createdAt) return 1; // registered today
    if (where.idVerified) return 5; // verified total
    if (where.verifiedAt) return 2; // verified today
    return 0;
  });

  const db = {
    visit: { upsert, count, groupBy, findMany, updateMany },
    user: { count: userCount },
    $queryRaw: queryRaw,
  };
  const ipIntel = {
    classifyMany: jest.fn(async () => opts.classes ?? new Map<string, IpClass>()),
  };
  return {
    svc: new AnalyticsService(db as unknown as PrismaService, ipIntel as unknown as IpIntelService),
    upsert,
    findMany,
    updateMany,
    ipIntel,
    visits,
    getLastUpsert: () => lastUpsert,
  };
}

describe("AnalyticsService", () => {
  it("records a visit idempotently per (visitor, day), storing IP and UA on create", async () => {
    const { svc, upsert, getLastUpsert } = makeService();
    await svc.recordVisit("v1", "203.0.113.7", "Mozilla/5.0");
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(getLastUpsert()?.where.visitorId_day.visitorId).toBe("v1");
    expect(getLastUpsert()?.create.ip).toBe("203.0.113.7");
    expect(getLastUpsert()?.create.userAgent).toBe("Mozilla/5.0");
    expect(getLastUpsert()?.update).toEqual({}); // no-op on repeat
  });

  it("returns visitors, registrations, verifications and logins as today/total/daily", async () => {
    const { svc } = makeService();
    const s = await svc.stats();
    expect(s.visitors).toEqual({
      today: 5,
      total: 42,
      daily: [
        { day: "2026-08-22", count: 3 },
        { day: "2026-08-23", count: 5 },
      ],
    });
    expect(s.registered).toEqual({ today: 1, total: 7, daily: [{ day: "2026-08-23", count: 4 }] });
    expect(s.verified).toEqual({ today: 2, total: 5, daily: [{ day: "2026-08-23", count: 2 }] });
    // Logins have no all-time total, so total mirrors today.
    expect(s.logins).toEqual({ today: 3, total: 3, daily: [{ day: "2026-08-23", count: 3 }] });
  });

  it("classifies unclassified IPs on the page and caches the result on the row", async () => {
    const visits = [
      { id: "a", ip: "203.0.113.7", userAgent: "UA", ipCountry: null, ipHosting: null, ipProxy: null, classifiedAt: null, createdAt: new Date("2026-08-23T10:00:00Z") },
      { id: "b", ip: "198.51.100.9", userAgent: null, ipCountry: "US", ipHosting: false, ipProxy: false, classifiedAt: new Date(), createdAt: new Date("2026-08-23T09:00:00Z") },
    ];
    const classes = new Map<string, IpClass>([["203.0.113.7", { hosting: true, proxy: false, country: "DE" }]]);
    const { svc, ipIntel, updateMany } = makeService({ visits, classes });

    const page = await svc.listVisits({ take: 25, skip: 0 });

    // Only the unclassified row's IP was looked up.
    expect(ipIntel.classifyMany).toHaveBeenCalledWith(["203.0.113.7"]);
    expect(updateMany).toHaveBeenCalledTimes(1);
    const a = page.items.find((r) => r.id === "a")!;
    expect(a.hosting).toBe(true);
    expect(a.country).toBe("DE");
    expect(a.classified).toBe(true);
    expect(page.total).toBe(2);
  });

  it("skips the lookup entirely when every row is already classified", async () => {
    const visits = [
      { id: "b", ip: "198.51.100.9", userAgent: null, ipCountry: "US", ipHosting: false, ipProxy: false, classifiedAt: new Date(), createdAt: new Date() },
    ];
    const { svc, ipIntel } = makeService({ visits });
    await svc.listVisits();
    expect(ipIntel.classifyMany).not.toHaveBeenCalled();
  });
});
