import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ProfilesService } from "./profiles.service";
import { PublicStorageService } from "../storage/public-storage.service";
import { UpsertProfileDto } from "./dto/upsert-profile.dto";
import { SearchDto } from "./dto/search.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { Public } from "../auth/decorators/public.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthedUser } from "../auth/strategies/jwt.strategy";

type UploadedImage = { buffer: Buffer; originalname: string; mimetype: string; size: number };
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const ALLOWED_PHOTO = ["image/jpeg", "image/png", "image/webp"];

@Controller()
export class ProfilesController {
  constructor(
    private readonly profiles: ProfilesService,
    private readonly storage: PublicStorageService,
  ) {}

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

  /** Multipart single "photo" field. Stored publicly; sets profile.photoPath. */
  @Roles("freelancer")
  @Post("profile/photo")
  @UseInterceptors(FileInterceptor("photo", { limits: { fileSize: MAX_PHOTO_BYTES } }))
  async uploadPhoto(@CurrentUser() user: AuthedUser, @UploadedFile() photo?: UploadedImage) {
    if (!photo) throw new BadRequestException("Choose a photo to upload.");
    if (!ALLOWED_PHOTO.includes(photo.mimetype)) {
      throw new BadRequestException("Upload a JPEG, PNG or WebP image.");
    }

    const photoPath = await this.storage.save(user.id, "photo", {
      buffer: photo.buffer,
      originalName: photo.originalname,
    });
    const { previous } = await this.profiles.setPhoto(user, photoPath);
    // Reclaim the old file now that the DB points at the new one.
    if (previous) await this.storage.remove(previous);
    return { photoPath };
  }

  /* ------------------------------- browse ------------------------------ */
  // Any signed-in user may browse (client or freelancer, verified or not);
  // anonymous visitors are refused. Contact handles are still gated per-viewer,
  // so an unverified viewer sees the listing but never the contact details.

  @Get("freelancers")
  search(@Query() query: SearchDto) {
    return this.profiles.search(query);
  }

  // Public so the marketing landing page can show real verified freelancers.
  // Returns the same contact-stripped shape as search — no gated data leaks.
  // Declared before :slug so "featured" isn't matched as a slug.
  @Public()
  @Get("freelancers/featured")
  async featured() {
    return (await this.profiles.search({ take: 6 } as SearchDto)).items;
  }

  // The distinct skills across visible freelancers, for the browse filter.
  @Get("freelancers/skills")
  skills() {
    return this.profiles.listSkills();
  }

  @Get("freelancers/:slug")
  getPublic(@CurrentUser() viewer: AuthedUser, @Param("slug") slug: string) {
    return this.profiles.getPublicBySlug(viewer, slug);
  }
}
