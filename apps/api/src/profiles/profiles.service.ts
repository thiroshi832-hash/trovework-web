import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { FreelancerProfile } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PermissionService, type Principal } from "../permission/permission.service";
import { ReviewsService } from "../reviews/reviews.service";
import { UpsertProfileDto } from "./dto/upsert-profile.dto";
import { SearchDto } from "./dto/search.dto";

export interface ProfileOwner {
  id: string;
  role: string;
  status: string;
  idVerified: boolean;
}

/** The gated handles, split out so it's obvious what must never leak. */
const CONTACT_FIELDS = ["contactTelegram", "contactDiscord", "contactWhatsapp"] as const;

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permission: PermissionService,
    private readonly reviews: ReviewsService,
  ) {}

  /* --------------------------------- write --------------------------------- */

  async upsert(owner: ProfileOwner, dto: UpsertProfileDto): Promise<FreelancerProfile> {
    if (owner.role !== "freelancer") throw new ForbiddenException("Only freelancers have a profile.");
    if (owner.status === "banned") throw new ForbiddenException("This account has been suspended.");

    const existing = await this.prisma.freelancerProfile.findUnique({ where: { userId: owner.id } });

    // Visibility tracks ID verification (FR-V-5), not something the user sets.
    const data = {
      displayName: dto.displayName,
      category: dto.category,
      headline: dto.headline ?? null,
      bio: dto.bio ?? null,
      availability: dto.availability ?? null,
      skills: dto.skills ?? [],
      hourlyRate: dto.hourlyRate ?? null,
      contactTelegram: dto.contactTelegram ?? null,
      contactDiscord: dto.contactDiscord ?? null,
      contactWhatsapp: dto.contactWhatsapp ?? null,
      isVisible: owner.idVerified,
    };

    if (existing) {
      return this.prisma.freelancerProfile.update({ where: { userId: owner.id }, data });
    }
    // Slug is set once, on first save, and never changes — links stay stable.
    const slug = await this.uniqueSlug(dto.displayName);
    return this.prisma.freelancerProfile.create({ data: { userId: owner.id, slug, ...data } });
  }

  async getMine(userId: string): Promise<FreelancerProfile> {
    const profile = await this.prisma.freelancerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException("You haven't created a profile yet.");
    return profile;
  }

  /**
   * Points the profile photo at an already-stored asset. Requires an existing
   * profile so the photo can't be attached before the freelancer has saved one.
   * Returns the old path (if any) so the caller can clean it up.
   */
  async setPhoto(owner: ProfileOwner, photoPath: string): Promise<{ photoPath: string; previous: string | null }> {
    if (owner.role !== "freelancer") throw new ForbiddenException("Only freelancers have a profile.");
    if (owner.status === "banned") throw new ForbiddenException("This account has been suspended.");

    const existing = await this.prisma.freelancerProfile.findUnique({ where: { userId: owner.id } });
    if (!existing) throw new NotFoundException("Create your profile before adding a photo.");
    // Capture before the update — the row object may be mutated in place.
    const previous = existing.photoPath;

    await this.prisma.freelancerProfile.update({ where: { userId: owner.id }, data: { photoPath } });
    return { photoPath, previous };
  }

  /* --------------------------------- read ---------------------------------- */

  /**
   * A public profile, by slug. Hidden freelancers 404. Contact handles are
   * attached ONLY for a verified client (NFR-SEC-3); the rating aggregate and
   * recent reviews are public.
   */
  async getPublicBySlug(viewer: Principal | null, slug: string) {
    const profile = await this.prisma.freelancerProfile.findUnique({ where: { slug } });
    if (!profile || !profile.isVisible) throw new NotFoundException("Freelancer not found.");

    const canSeeContact = this.permission.canViewContactInfo(viewer, profile.userId);
    const [agg] = [(await this.reviews.aggregateFor([profile.userId])).get(profile.userId)];
    const reviews = await this.reviews.listFor(profile.userId);

    // Their live service listings — never drafts or blocked ones.
    const posts = await this.prisma.post.findMany({
      where: { authorId: profile.userId, status: "active" },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, description: true, category: true, priceFrom: true, updatedAt: true },
    });

    return {
      ...this.shape(profile, canSeeContact),
      rating: agg?.average ?? 0,
      reviewCount: agg?.count ?? 0,
      reviews,
      posts,
    };
  }

  /** Search visible freelancers. Never returns contact handles. */
  async search(filters: SearchDto) {
    const take = filters.take ?? 20;
    const profiles = await this.prisma.freelancerProfile.findMany({
      where: {
        isVisible: true,
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.skill ? { skills: { has: filters.skill } } : {}),
        ...(filters.q
          ? {
              OR: [
                { displayName: { contains: filters.q, mode: "insensitive" } },
                { headline: { contains: filters.q, mode: "insensitive" } },
                { bio: { contains: filters.q, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(filters.minPrice != null || filters.maxPrice != null
          ? {
              hourlyRate: {
                ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
                ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
              },
            }
          : {}),
      },
      take,
      skip: filters.skip ?? 0,
    });

    const agg = await this.reviews.aggregateFor(profiles.map((p) => p.userId));
    const withRatings = profiles.map((p) => ({
      ...this.shape(p, false),
      rating: agg.get(p.userId)?.average ?? 0,
      reviewCount: agg.get(p.userId)?.count ?? 0,
    }));

    // Rating feeds sort order (FR-RV-2); recency breaks ties.
    withRatings.sort(
      (a, b) => b.rating - a.rating || +new Date(b.updatedAt) - +new Date(a.updatedAt),
    );
    return withRatings;
  }

  /* -------------------------------- internals ------------------------------ */

  private shape(profile: FreelancerProfile, withContact: boolean) {
    if (withContact) return profile;
    const copy: Record<string, unknown> = { ...profile };
    for (const f of CONTACT_FIELDS) delete copy[f];
    return copy as FreelancerProfile;
  }

  /** slugify(displayName), with a numeric suffix if that slug is taken. */
  private async uniqueSlug(displayName: string): Promise<string> {
    const base =
      displayName
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 40) || "freelancer";

    let candidate = base;
    for (let n = 2; ; n++) {
      const taken = await this.prisma.freelancerProfile.findUnique({ where: { slug: candidate } });
      if (!taken) return candidate;
      candidate = `${base}-${n}`;
    }
  }
}
