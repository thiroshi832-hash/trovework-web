import { Module } from "@nestjs/common";
import { AdminModerationController } from "./admin-moderation.controller";
import { AdminModerationService } from "./admin-moderation.service";
import { PublicStorageService } from "../storage/public-storage.service";
import { SecuredStorageService } from "../storage/secured-storage.service";
import { IpIntelModule } from "../analytics/ip-intel.module";

@Module({
  imports: [IpIntelModule],
  controllers: [AdminModerationController],
  providers: [AdminModerationService, PublicStorageService, SecuredStorageService],
})
export class AdminModule {}
