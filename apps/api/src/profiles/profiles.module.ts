import { Module } from "@nestjs/common";
import { ReviewsModule } from "../reviews/reviews.module";
import { ProfilesController } from "./profiles.controller";
import { ProfilesService } from "./profiles.service";
import { PublicStorageService } from "../storage/public-storage.service";

@Module({
  imports: [ReviewsModule],
  controllers: [ProfilesController],
  providers: [ProfilesService, PublicStorageService],
})
export class ProfilesModule {}
