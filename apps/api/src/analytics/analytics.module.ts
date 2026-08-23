import { Module } from "@nestjs/common";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { IpIntelService } from "./ip-intel.service";

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, IpIntelService],
})
export class AnalyticsModule {}
