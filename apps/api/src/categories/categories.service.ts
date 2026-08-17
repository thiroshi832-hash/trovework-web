import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { Category } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public: active categories in display order. */
  listActive(): Promise<Category[]> {
    return this.prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  }

  /** Admin: everything, including hidden ones. */
  listAll(): Promise<Category[]> {
    return this.prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const name = dto.name.trim();
    const slug = (dto.slug?.trim() || this.slugify(name));
    await this.assertUnique(name, slug);

    // Default to the end of the list when no explicit order is given.
    const sortOrder = dto.sortOrder ?? (await this.nextSortOrder());
    return this.prisma.category.create({
      data: { name, slug, sortOrder, isActive: dto.isActive ?? true },
    });
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Category not found.");

    const name = dto.name?.trim() ?? existing.name;
    const slug = dto.slug?.trim() ?? existing.slug;
    if (name !== existing.name || slug !== existing.slug) {
      await this.assertUnique(name, slug, id);
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        sortOrder: dto.sortOrder ?? existing.sortOrder,
        isActive: dto.isActive ?? existing.isActive,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Category not found.");
    // Listings keep their category string; this only removes it from the picker.
    await this.prisma.category.delete({ where: { id } });
  }

  /* -------------------------------- internals ------------------------------ */

  private async assertUnique(name: string, slug: string, exceptId?: string) {
    const clash = await this.prisma.category.findFirst({
      where: { OR: [{ name }, { slug }], ...(exceptId ? { NOT: { id: exceptId } } : {}) },
    });
    if (clash) throw new ConflictException("A category with that name or slug already exists.");
  }

  private async nextSortOrder(): Promise<number> {
    const last = await this.prisma.category.findFirst({ orderBy: { sortOrder: "desc" } });
    return (last?.sortOrder ?? -1) + 1;
  }

  private slugify(name: string): string {
    return (
      name
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 60) || "category"
    );
  }
}
