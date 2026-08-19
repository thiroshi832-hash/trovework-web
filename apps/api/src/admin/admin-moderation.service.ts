import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PublicStorageService } from "../storage/public-storage.service";
import { SecuredStorageService } from "../storage/secured-storage.service";

/**
 * Read-mostly oversight for admins. Strikes and the 3-strike ban are applied
 * automatically at scan time (see PostsService), so these are audit views plus
 * the one manual override an admin genuinely needs: reinstating a banned user.
 */
@Injectable()
export class AdminModerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly publicStorage: PublicStorageService,
    private readonly securedStorage: SecuredStorageService,
  ) {}

  /** All accounts, newest first, for the admin users list. */
  listUsers(take = 200) {
    return this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        phoneVerified: true,
        idVerified: true,
        createdAt: true,
      },
    });
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

  /** Recent contact-info violations, newest first. */
  listViolations(take = 100) {
    return this.prisma.violation.findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: {
        user: { select: { id: true, fullName: true, email: true, strikeCount: true, status: true } },
        post: { select: { id: true, title: true } },
      },
    });
  }

  /** Posts the scanner blocked, with their author. */
  listBlockedPosts() {
    return this.prisma.post.findMany({
      where: { status: "blocked" },
      orderBy: { updatedAt: "desc" },
      include: { author: { select: { id: true, fullName: true, email: true } } },
    });
  }

  /** Currently-banned accounts. */
  listBannedUsers() {
    return this.prisma.user.findMany({
      where: { status: "banned" },
      orderBy: { updatedAt: "desc" },
      select: { id: true, fullName: true, email: true, role: true, strikeCount: true, updatedAt: true },
    });
  }

  /** Lifts a ban and clears the strike count so the account starts fresh. */
  async reinstate(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found.");
    if (user.status !== "banned") throw new BadRequestException("That account isn't banned.");
    await this.prisma.user.update({ where: { id: userId }, data: { status: "active", strikeCount: 0 } });
  }
}
