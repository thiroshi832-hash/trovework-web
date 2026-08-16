import { Controller, Get } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { Public } from "../auth/decorators/public.decorator";

/** Public taxonomy — the browse filter and new-post picker read this. */
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Public()
  @Get()
  list() {
    return this.categories.listActive();
  }
}
