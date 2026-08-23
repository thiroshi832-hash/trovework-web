import { Controller, Get, HttpCode, Post, Req, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { AnalyticsService } from "./analytics.service";
import { Public } from "../auth/decorators/public.decorator";
import { Roles } from "../auth/decorators/roles.decorator";

const VISITOR_COOKIE = "visitor_id";

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
    await this.analytics.recordVisit(visitorId);
  }

  /** Admin-only: visitor totals for the dashboard. */
  @Roles("admin")
  @Get("admin/analytics")
  stats() {
    return this.analytics.stats();
  }
}
