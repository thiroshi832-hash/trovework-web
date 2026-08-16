import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
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
