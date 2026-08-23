import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/** UTC midnight for a date — the day key visits are bucketed by. */
function startOfDayUTC(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export interface VisitorStats {
  today: number;
  total: number;
  daily: { day: string; count: number }[];
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records a visit for this visitor today. Idempotent per (visitor, day) via
   * the unique index, so repeat page loads the same day count once.
   */
  async recordVisit(visitorId: string): Promise<void> {
    const day = startOfDayUTC();
    await this.prisma.visit.upsert({
      where: { visitorId_day: { visitorId, day } },
      create: { visitorId, day },
      update: {},
    });
  }

  /** Today's unique visitors, all-time unique visitors, and a daily series. */
  async stats(days = 30): Promise<VisitorStats> {
    const today = startOfDayUTC();
    const since = new Date(today);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const [todayCount, totalRows, daily] = await Promise.all([
      this.prisma.visit.count({ where: { day: today } }),
      this.prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(DISTINCT "visitor_id") AS count FROM "visits"`,
      this.prisma.visit.groupBy({
        by: ["day"],
        where: { day: { gte: since } },
        _count: { _all: true },
        orderBy: { day: "asc" },
      }),
    ]);

    return {
      today: todayCount,
      total: Number(totalRows[0]?.count ?? 0),
      daily: daily.map((d) => ({ day: d.day.toISOString().slice(0, 10), count: d._count._all })),
    };
  }
}
