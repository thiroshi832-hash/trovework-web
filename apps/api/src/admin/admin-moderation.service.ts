import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Read-mostly oversight for admins. Strikes and the 3-strike ban are applied
 * automatically at scan time (see PostsService), so these are audit views plus
 * the one manual override an admin genuinely needs: reinstating a banned user.
 */
@Injectable()
export class AdminModerationService {
  constructor(private readonly prisma: PrismaService) {}

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
