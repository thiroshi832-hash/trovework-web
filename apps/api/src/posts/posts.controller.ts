import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthedUser } from "../auth/strategies/jwt.strategy";

/**
 * All routes require a freelancer (the global JwtAuthGuard + this @Roles).
 * The publish gate (phone + ID) is enforced inside the service, per action,
 * because it applies only when a post goes live — a draft may be saved first.
 */
@Roles("freelancer")
@Controller("posts")
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get("mine")
  listMine(@CurrentUser() user: AuthedUser) {
    return this.posts.listMine(user.id);
  }

  // Declared after "mine" so the static route wins over this param route.
  @Get(":id")
  getOne(@CurrentUser() user: AuthedUser, @Param("id") id: string) {
    return this.posts.getOwn(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: AuthedUser, @Body() dto: CreatePostDto) {
    return this.posts.create(user, dto);
  }

  @Put(":id")
  update(@CurrentUser() user: AuthedUser, @Param("id") id: string, @Body() dto: UpdatePostDto) {
    return this.posts.update(user, id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@CurrentUser() user: AuthedUser, @Param("id") id: string) {
    return this.posts.remove(user, id);
  }
}
