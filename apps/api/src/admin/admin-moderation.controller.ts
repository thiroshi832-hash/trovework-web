import { Controller, Delete, Get, HttpCode, Param, Post, Query } from "@nestjs/common";
import { AdminModerationService, type PageOpts } from "./admin-moderation.service";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthedUser } from "../auth/strategies/jwt.strategy";

/** Parses ?take/?skip into a clamped-later PageOpts, ignoring junk. */
function pageOpts(take?: string, skip?: string): PageOpts {
  const n = (v?: string) => {
    const parsed = Number(v);
    return v != null && Number.isFinite(parsed) ? parsed : undefined;
  };
  return { take: n(take), skip: n(skip) };
}

/** Every route here is admin-only (global JwtAuthGuard + this @Roles). */
@Roles("admin")
@Controller("admin")
export class AdminModerationController {
  constructor(private readonly moderation: AdminModerationService) {}

  @Get("violations")
  violations(@Query("take") take?: string, @Query("skip") skip?: string) {
    return this.moderation.listViolations(pageOpts(take, skip));
  }

  @Get("posts/blocked")
  blockedPosts(@Query("take") take?: string, @Query("skip") skip?: string) {
    return this.moderation.listBlockedPosts(pageOpts(take, skip));
  }

  // Static /users/... routes are declared before the /users/:id param route so
  // Express doesn't match "banned" as an :id.
  @Get("users/banned")
  bannedUsers(@Query("take") take?: string, @Query("skip") skip?: string) {
    return this.moderation.listBannedUsers(pageOpts(take, skip));
  }

  @Get("users")
  users(
    @Query("take") take?: string,
    @Query("skip") skip?: string,
    @Query("q") q?: string,
    @Query("status") status?: string,
  ) {
    return this.moderation.listUsers({ ...pageOpts(take, skip), q, status });
  }

  @Get("users/:id")
  userDetail(@Param("id") id: string) {
    return this.moderation.getUserDetail(id);
  }

  @Post("users/:id/ban")
  @HttpCode(200)
  ban(@CurrentUser() admin: AuthedUser, @Param("id") id: string) {
    return this.moderation.ban(admin.id, id);
  }

  @Post("users/:id/reinstate")
  @HttpCode(200)
  reinstate(@Param("id") id: string) {
    return this.moderation.reinstate(id);
  }

  @Post("users/:id/verify")
  @HttpCode(200)
  markVerified(@CurrentUser() admin: AuthedUser, @Param("id") id: string) {
    return this.moderation.markVerified(admin.id, id);
  }

  @Post("users/:id/reset-strikes")
  @HttpCode(200)
  resetStrikes(@Param("id") id: string) {
    return this.moderation.resetStrikes(id);
  }

  @Delete("users/:id")
  @HttpCode(204)
  deleteUser(@CurrentUser() admin: AuthedUser, @Param("id") id: string) {
    return this.moderation.deleteUser(admin.id, id);
  }
}
