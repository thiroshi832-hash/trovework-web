import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { Public } from "../auth/decorators/public.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthedUser } from "../auth/strategies/jwt.strategy";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Post()
  create(@CurrentUser() user: AuthedUser, @Body() dto: CreateReviewDto) {
    return this.reviews.create(user, dto.toId, dto.rating, dto.comment);
  }

  // Reviews are public — they're part of a freelancer's public reputation.
  @Public()
  @Get("user/:userId")
  listFor(@Param("userId") userId: string) {
    return this.reviews.listFor(userId);
  }
}
