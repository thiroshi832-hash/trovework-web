import { Controller, Get, HttpCode, Post, Query, Req, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { AnalyticsService } from "./analytics.service";
import { Public } from "../auth/decorators/public.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { clientIp } from "../common/client-ip";

const VISITOR_COOKIE = "visitor_id";

/** Parses ?take/?skip into numbers, ignoring junk. */
function num(v?: string): number | undefined {
  const n = Number(v);
  return v != null && Number.isFinite(n) ? n : undefined;
}

@Controller()
export class AnalyticsController {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Public: called on page load to count a visit. A random visitor id lives in
   * an httpOnly cookie (no personal data) so repeat visits the same day aren't
   * double-counted. Fire-and-forget from the client.
   */
  @Public()
  @Post("analytics/visit")
  @HttpCode(204)
  async visit(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    let visitorId = req.cookies?.[VISITOR_COOKIE] as string | undefined;
    if (!visitorId) {
      visitorId = randomUUID();
      res.cookie(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        secure: this.config.get<string>("NODE_ENV") !== "development",
        sameSite: "lax",
        path: "/",
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
    }
    const userAgent = (req.headers["user-agent"] ?? null)?.slice(0, 512) ?? null;
    await this.analytics.recordVisit(visitorId, clientIp(req), userAgent);
  }

  /** Admin-only: visitor totals for the dashboard. */
  @Roles("admin")
  @Get("admin/analytics")
  stats() {
    return this.analytics.stats();
  }

  /** Admin-only: paginated visitor history with IP intelligence. */
  @Roles("admin")
  @Get("admin/analytics/visits")
  visits(@Query("take") take?: string, @Query("skip") skip?: string) {
    return this.analytics.listVisits({ take: num(take), skip: num(skip) });
  }
}
