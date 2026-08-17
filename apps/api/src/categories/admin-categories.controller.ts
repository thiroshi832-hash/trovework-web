import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { Roles } from "../auth/decorators/roles.decorator";

/** Every route here is admin-only (global JwtAuthGuard + this @Roles). */
@Roles("admin")
@Controller("admin/categories")
export class AdminCategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list() {
    return this.categories.listAll();
  }

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categories.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateCategoryDto) {
    return this.categories.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id") id: string) {
    return this.categories.remove(id);
  }
}
