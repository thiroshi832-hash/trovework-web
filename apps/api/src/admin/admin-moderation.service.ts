import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PublicStorageService } from "../storage/public-storage.service";
import { SecuredStorageService } from "../storage/secured-storage.service";
import { IpIntelService } from "../analytics/ip-intel.service";

export interface PageOpts {
  take?: number;
  skip?: number;
}

/** A page of results plus the total, so the UI can show "x of N" and paginate. */
export interface Page<T> {
  items: T[];
  total: number;
}

/** Clamp paging so a client can't ask for everything or a negative offset. */
function paging(opts: PageOpts = {}): { take: number; skip: number } {
  return {
    take: Math.min(Math.max(Math.trunc(opts.take ?? 25), 1), 100),
    skip: Math.max(Math.trunc(opts.skip ?? 0), 0),
  };
}

const USER_CARD_SELECT = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  status: true,
  strikeCount: true,
  phoneVerified: true,
  idVerified: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

/**
 * Oversight and user management for admins. Strikes and the 3-strike ban are
 * applied automatically at scan time (see PostsService); these are the audit
 * views plus the manual overrides — suspend, reinstate, reset strikes, delete.
 */
@Injectable()
export class AdminModerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly publicStorage: PublicStorageService,
    private readonly securedStorage: SecuredStorageService,
    private readonly ipIntel: IpIntelService,
  ) {}

  /* --------------------------------- users --------------------------------- */

  /** A page of accounts, newest first, optionally filtered by search and status. */
  async listUsers(
    opts: PageOpts & { q?: string; status?: string } = {},
  ): Promise<Page<Prisma.UserGetPayload<{ select: typeof USER_CARD_SELECT }>>> {
    const { take, skip } = paging(opts);
    const q = opts.q?.trim();
    const where: Prisma.UserWhereInput = {
      ...(opts.status ? { status: opts.status as Prisma.EnumAccountStatusFilter["equals"] } : {}),
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { fullName: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, take, skip, select: USER_CARD_SELECT }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total };
  }

  /** A user with the extra context an admin wants before acting: profile + counts. */
  async getUserDetail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...USER_CARD_SELECT,
        phone: true,
        country: true,
        state: true,
        signupIp: true,
        lastLoginIp: true,
        lastLoginAt: true,
      },
    });
    if (!user) throw new NotFoundException("User not found.");

    const [profile, postCount, conversationCount, verification] = await Promise.all([
      this.prisma.freelancerProfile.findUnique({
        where: { userId },
        select: {
          slug: true,
          displayName: true,
          category: true,
          isVisible: true,
          photoPath: true,
          // Gated contact handles — hidden from clients until they're verified,
          // but an admin doing account oversight can always see them.
          contactTelegram: true,
          contactDiscord: true,
          contactWhatsapp: true,
          contactLinkedin: true,
        },
      }),
      this.prisma.post.count({ where: { authorId: userId } }),
      this.prisma.conversation.count({ where: { OR: [{ clientId: userId }, { freelancerId: userId }] } }),
      this.prisma.idVerification.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true, createdAt: true, idFrontPath: true, idBackPath: true, selfiePath: true },
      }),
    ]);

    // Expose which images exist and the record id to build view/download URLs —
    // never the raw filesystem paths.
    const latestVerification = verification
      ? {
          id: verification.id,
          status: verification.status,
          createdAt: verification.createdAt,
          hasFront: !!verification.idFrontPath,
          hasBack: !!verification.idBackPath,
          hasSelfie: !!verification.selfiePath,
        }
      : null;

    // Classify the sign-up and last-login IPs (VPS/VPN/proxy), best-effort. One
    // deduplicated lookup; a failure just leaves ipIntel empty.
    const ips = [user.signupIp, user.lastLoginIp].filter((v): v is string => !!v);
    const classes = ips.length ? await this.ipIntel.classifyMany(ips) : new Map();
    const ipIntel = Object.fromEntries(classes);

    return { ...user, profile, postCount, conversationCount, latestVerification, ipIntel };
  }

  /** Suspends an active account. Guarded against self and other admins. */
  async ban(actingAdminId: string, userId: string): Promise<void> {
    if (userId === actingAdminId) throw new BadRequestException("You can't suspend your own account.");
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, status: true } });
    if (!user) throw new NotFoundException("User not found.");
    if (user.role === "admin") throw new ForbiddenException("Admin accounts can't be suspended.");
    if (user.status === "banned") throw new BadRequestException("That account is already suspended.");
    await this.prisma.user.update({ where: { id: userId }, data: { status: "banned" } });
  }

  /** Lifts a ban and clears the strike count so the account starts fresh. */
  async reinstate(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found.");
    if (user.status !== "banned") throw new BadRequestException("That account isn't banned.");
    await this.prisma.user.update({ where: { id: userId }, data: { status: "active", strikeCount: 0 } });
  }

  /**
   * Manually marks a user phone- and ID-verified — for when an admin has vetted
   * their identity out of band, or an SMS/auto-check path failed them. Also
   * resolves the latest outstanding ID check to approved (stamping the admin as
   * reviewer) so the record leaves the review queue and matches the user's flags.
   */
  async markVerified(actingAdminId: string, userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phoneVerified: true, idVerified: true },
    });
    if (!user) throw new NotFoundException("User not found.");
    if (user.phoneVerified && user.idVerified) {
      throw new BadRequestException("That account is already phone- and ID-verified.");
    }
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { phoneVerified: true, idVerified: true, verifiedAt: new Date() },
      }),
      this.prisma.idVerification.updateMany({
        where: { userId, status: { not: "approved" } },
        data: {
          status: "approved",
          reviewedById: actingAdminId,
          reviewedAt: new Date(),
          reviewNote: "Manually verified by an administrator.",
        },
      }),
    ]);
  }

  /** Clears a user's strike count without touching their status. */
  async resetStrikes(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw new NotFoundException("User not found.");
    await this.prisma.user.update({ where: { id: userId }, data: { strikeCount: 0 } });
  }

  /**
   * Permanently deletes a user. Every table that references a user is ON DELETE
   * CASCADE, so their profile, posts, chats, reviews and verifications go with
   * the row; their uploaded files are then cleaned up best-effort. Guarded so an
   * admin can't delete themselves or another admin.
   */
  async deleteUser(actingAdminId: string, userId: string): Promise<void> {
    if (userId === actingAdminId) throw new BadRequestException("You can't delete your own account.");
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!user) throw new NotFoundException("User not found.");
    if (user.role === "admin") throw new ForbiddenException("Admin accounts can't be deleted here.");

    await this.prisma.user.delete({ where: { id: userId } });
    // Files aren't in the DB's cascade — remove the folders after the row is gone.
    await Promise.all([this.publicStorage.removeUserDir(userId), this.securedStorage.removeUserDir(userId)]);
  }

  /* ------------------------------- audit lists ----------------------------- */

  /** A page of contact-info violations, newest first. */
  async listViolations(opts: PageOpts = {}): Promise<Page<unknown>> {
    const { take, skip } = paging(opts);
    const [items, total] = await Promise.all([
      this.prisma.violation.findMany({
        orderBy: { createdAt: "desc" },
        take,
        skip,
        include: {
          user: { select: { id: true, fullName: true, email: true, strikeCount: true, status: true } },
          post: { select: { id: true, title: true } },
        },
      }),
      this.prisma.violation.count(),
    ]);
    return { items, total };
  }

  /** A page of posts the scanner blocked, with their author. */
  async listBlockedPosts(opts: PageOpts = {}): Promise<Page<unknown>> {
    const { take, skip } = paging(opts);
    const where = { status: "blocked" as const };
    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take,
        skip,
        include: { author: { select: { id: true, fullName: true, email: true } } },
      }),
      this.prisma.post.count({ where }),
    ]);
    return { items, total };
  }

  /** A page of currently-banned accounts. */
  async listBannedUsers(opts: PageOpts = {}): Promise<Page<unknown>> {
    const { take, skip } = paging(opts);
    const where = { status: "banned" as const };
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take,
        skip,
        select: { id: true, fullName: true, email: true, role: true, strikeCount: true, updatedAt: true },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total };
  }
}
