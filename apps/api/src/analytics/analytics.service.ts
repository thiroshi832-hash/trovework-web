import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IpIntelService } from "./ip-intel.service";

/** UTC midnight for a date — the day key visits are bucketed by. */
function startOfDayUTC(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export interface VisitorStats {
  today: number;
  total: number;
  daily: { day: string; count: number }[];
  /** Registered accounts: all-time total and how many logged in today. */
  users: { total: number; activeToday: number };
}

/** One row of the admin visitor-history view. */
export interface VisitRow {
  id: string;
  at: string;
  ip: string | null;
  userAgent: string | null;
  country: string | null;
  hosting: boolean | null;
  proxy: boolean | null;
  classified: boolean;
}

export interface VisitPage {
  items: VisitRow[];
  total: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ipIntel: IpIntelService,
  ) {}

  /**
   * Records a visit for this visitor today. Idempotent per (visitor, day) via
   * the unique index, so repeat page loads the same day count once. The IP and
   * user agent are stored on the first hit of the day (create only) for the
   * admin history view.
   */
  async recordVisit(visitorId: string, ip?: string | null, userAgent?: string | null): Promise<void> {
    const day = startOfDayUTC();
    await this.prisma.visit.upsert({
      where: { visitorId_day: { visitorId, day } },
      create: { visitorId, day, ip: ip ?? null, userAgent: userAgent ?? null },
      update: {},
    });
  }

  /**
   * A page of individual visits, newest first, for the admin history view. Any
   * row on the page whose IP hasn't been classified yet is looked up now (once,
   * deduplicated) and the result cached on every row sharing that IP, so the
   * flags fill in as the admin pages through and are never re-queried.
   */
  async listVisits(opts: { take?: number; skip?: number } = {}): Promise<VisitPage> {
    const take = Math.min(Math.max(Math.trunc(opts.take ?? 25), 1), 100);
    const skip = Math.max(Math.trunc(opts.skip ?? 0), 0);

    const [rows, total] = await Promise.all([
      this.prisma.visit.findMany({
        orderBy: { createdAt: "desc" },
        take,
        skip,
        select: {
          id: true,
          ip: true,
          userAgent: true,
          ipCountry: true,
          ipHosting: true,
          ipProxy: true,
          classifiedAt: true,
          createdAt: true,
        },
      }),
      this.prisma.visit.count(),
    ]);

    const pending = rows.filter((r) => !r.classifiedAt && r.ip).map((r) => r.ip as string);
    if (pending.length) {
      const classes = await this.ipIntel.classifyMany(pending);
      if (classes.size) {
        const now = new Date();
        await Promise.all(
          [...classes].map(([ip, c]) =>
            this.prisma.visit.updateMany({
              where: { ip, classifiedAt: null },
              data: { ipHosting: c.hosting, ipProxy: c.proxy, ipCountry: c.country, classifiedAt: now },
            }),
          ),
        );
        // Reflect the fresh classification into the rows we're about to return.
        for (const r of rows) {
          const c = r.ip ? classes.get(r.ip) : undefined;
          if (c && !r.classifiedAt) {
            r.ipHosting = c.hosting;
            r.ipProxy = c.proxy;
            r.ipCountry = c.country;
            r.classifiedAt = now;
          }
        }
      }
    }

    return {
      total,
      items: rows.map((r) => ({
        id: r.id,
        at: r.createdAt.toISOString(),
        ip: r.ip,
        userAgent: r.userAgent,
        country: r.ipCountry,
        hosting: r.ipHosting,
        proxy: r.ipProxy,
        classified: !!r.classifiedAt,
      })),
    };
  }

  /** Today's unique visitors, all-time unique visitors, and a daily series. */
  async stats(days = 30): Promise<VisitorStats> {
    const today = startOfDayUTC();
    const since = new Date(today);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const [todayCount, totalRows, daily, userTotal, activeToday] = await Promise.all([
      this.prisma.visit.count({ where: { day: today } }),
      this.prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(DISTINCT "visitor_id") AS count FROM "visits"`,
      this.prisma.visit.groupBy({
        by: ["day"],
        where: { day: { gte: since } },
        _count: { _all: true },
        orderBy: { day: "asc" },
      }),
      this.prisma.user.count(),
      // Logged in today — includes registration, which stamps lastLoginAt too.
      this.prisma.user.count({ where: { lastLoginAt: { gte: today } } }),
    ]);

    return {
      today: todayCount,
      total: Number(totalRows[0]?.count ?? 0),
      daily: daily.map((d) => ({ day: d.day.toISOString().slice(0, 10), count: d._count._all })),
      users: { total: userTotal, activeToday },
    };
  }
}
