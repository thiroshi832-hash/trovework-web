import { Body, Controller, Get, Param, Put, Query } from "@nestjs/common";
import { ProfilesService } from "./profiles.service";
import { UpsertProfileDto } from "./dto/upsert-profile.dto";
import { SearchDto } from "./dto/search.dto";
import { Public } from "../auth/decorators/public.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthedUser } from "../auth/strategies/jwt.strategy";

@Controller()
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  /* ------------------------------- owner ------------------------------- */

  @Roles("freelancer")
  @Put("profile")
  upsert(@CurrentUser() user: AuthedUser, @Body() dto: UpsertProfileDto) {
    return this.profiles.upsert(user, dto);
  }

  @Roles("freelancer")
  @Get("profile/me")
  getMine(@CurrentUser() user: AuthedUser) {
    return this.profiles.getMine(user.id);
  }

  /* ------------------------------- public ------------------------------ */
  // @Public() here means "optional auth": anonymous browsing is allowed, but a
  // logged-in viewer is still attached so contact info can be gated per-viewer.

  @Public()
  @Get("freelancers")
  search(@Query() query: SearchDto) {
    return this.profiles.search(query);
  }

  @Public()
  @Get("freelancers/:slug")
  getPublic(@CurrentUser() viewer: AuthedUser | undefined, @Param("slug") slug: string) {
    return this.profiles.getPublicBySlug(viewer ?? null, slug);
  }
}
