import { Controller, Delete, Get, HttpCode, Param, Post } from "@nestjs/common";
import { AdminModerationService } from "./admin-moderation.service";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthedUser } from "../auth/strategies/jwt.strategy";

/** Every route here is admin-only (global JwtAuthGuard + this @Roles). */
@Roles("admin")
@Controller("admin")
export class AdminModerationController {
  constructor(private readonly moderation: AdminModerationService) {}

  @Get("violations")
  violations() {
    return this.moderation.listViolations();
  }

  @Get("posts/blocked")
  blockedPosts() {
    return this.moderation.listBlockedPosts();
  }

  @Get("users/banned")
  bannedUsers() {
    return this.moderation.listBannedUsers();
  }

  @Post("users/:id/reinstate")
  @HttpCode(200)
  reinstate(@Param("id") id: string) {
    return this.moderation.reinstate(id);
  }

  @Get("users")
  users() {
    return this.moderation.listUsers();
  }

  @Delete("users/:id")
  @HttpCode(204)
  deleteUser(@CurrentUser() admin: AuthedUser, @Param("id") id: string) {
    return this.moderation.deleteUser(admin.id, id);
  }
}
