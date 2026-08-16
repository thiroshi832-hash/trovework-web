import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { FreelancerProfile } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PermissionService, type Principal } from "../permission/permission.service";
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
  ) {}

  /* --------------------------------- write --------------------------------- */

  async upsert(owner: ProfileOwner, dto: UpsertProfileDto): Promise<FreelancerProfile> {
    if (owner.role !== "freelancer") throw new ForbiddenException("Only freelancers have a profile.");
    if (owner.status === "banned") throw new ForbiddenException("This account has been suspended.");

    // Visibility is not the user's to set — it tracks ID verification (FR-V-5).
    // A profile can be built and saved before verification; it just stays hidden.
    const data = {
      displayName: dto.displayName,
      category: dto.category,
      headline: dto.headline ?? null,
      bio: dto.bio ?? null,
      skills: dto.skills ?? [],
      hourlyRate: dto.hourlyRate ?? null,
      contactTelegram: dto.contactTelegram ?? null,
      contactDiscord: dto.contactDiscord ?? null,
      contactWhatsapp: dto.contactWhatsapp ?? null,
      isVisible: owner.idVerified,
    };

    return this.prisma.freelancerProfile.upsert({
      where: { userId: owner.id },
      create: { userId: owner.id, ...data },
      update: data,
    });
  }

  /** The owner always sees their own profile in full, including contacts. */
  async getMine(userId: string): Promise<FreelancerProfile> {
    const profile = await this.prisma.freelancerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException("You haven't created a profile yet.");
    return profile;
  }

  /* --------------------------------- read ---------------------------------- */

  /**
   * A public profile. Hidden freelancers 404 (they are not browsable until
   * verified). Contact handles are attached ONLY when the viewer is a verified
   * client — the single check that upholds NFR-SEC-3, done here on the server
   * so the fields never reach the client app otherwise.
   */
  async getPublic(viewer: Principal | null, ownerUserId: string) {
    const profile = await this.prisma.freelancerProfile.findUnique({ where: { userId: ownerUserId } });
    if (!profile || !profile.isVisible) throw new NotFoundException("Freelancer not found.");

    const canSeeContact = this.permission.canViewContactInfo(viewer, ownerUserId);
    return this.shape(profile, canSeeContact);
  }

  /** Search visible freelancers. Never returns contact handles (list view). */
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
      orderBy: { updatedAt: "desc" },
      take,
      skip: filters.skip ?? 0,
    });

    return profiles.map((p) => this.shape(p, false));
  }

  /* -------------------------------- internals ------------------------------ */

  /** Returns the profile with contact handles stripped unless allowed. This is
   *  a deny-by-default shaper: the fields are removed unless `withContact`. */
  private shape(profile: FreelancerProfile, withContact: boolean) {
    if (withContact) return profile;
    const copy: Record<string, unknown> = { ...profile };
    for (const f of CONTACT_FIELDS) delete copy[f];
    return copy;
  }
}
