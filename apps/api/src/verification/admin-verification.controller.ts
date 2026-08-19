import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
  StreamableFile,
} from "@nestjs/common";
import type { Response } from "express";
import { VerificationService } from "./verification.service";
import { ReviewDto } from "./dto/review.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthedUser } from "../auth/strategies/jwt.strategy";

/** Every route here is admin-only (global JwtAuthGuard + this @Roles). */
@Roles("admin")
@Controller("admin/verifications")
export class AdminVerificationController {
  constructor(private readonly verification: VerificationService) {}

  @Get()
  listPending() {
    return this.verification.listPending();
  }

  /**
   * Serves one ID/selfie image for review. Behind the admin guard and never
   * cached, since the secured store is deliberately not public. The <img> tag
   * carries the admin's httpOnly cookie, which the global JwtAuthGuard checks.
   */
  @Get(":id/image/:kind")
  async image(
    @Param("id") id: string,
    @Param("kind") kind: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    if (kind !== "front" && kind !== "back" && kind !== "selfie") {
      throw new BadRequestException("Unknown image.");
    }
    const { buffer, contentType } = await this.verification.getReviewImage(id, kind);
    res.set({ "Content-Type": contentType, "Cache-Control": "private, no-store" });
    return new StreamableFile(buffer);
  }

  @Post(":id/approve")
  @HttpCode(200)
  approve(@CurrentUser() admin: AuthedUser, @Param("id") id: string) {
    return this.verification.approve(admin.id, id);
  }

  @Post(":id/reject")
  @HttpCode(200)
  reject(@CurrentUser() admin: AuthedUser, @Param("id") id: string, @Body() dto: ReviewDto) {
    return this.verification.reject(admin.id, id, dto.note);
  }
}
