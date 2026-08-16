import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface Reviewer {
  id: string;
  status: string;
}

export interface Aggregate {
  average: number;
  count: number;
}

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Leave (or update) a review of someone you've been in contact with. The
   * "after contact" rule (FR-RV-1) is enforced by requiring a conversation
   * between the two — you can't rate a stranger. One review per direction,
   * so re-reviewing updates rather than stacks.
   */
  async create(author: Reviewer, toId: string, rating: number, comment?: string) {
    if (author.status === "banned") throw new ForbiddenException("This account has been suspended.");
    if (author.id === toId) throw new ForbiddenException("You can't review yourself.");

    const contact = await this.prisma.conversation.findFirst({
      where: {
        OR: [
          { clientId: author.id, freelancerId: toId },
          { clientId: toId, freelancerId: author.id },
        ],
      },
      select: { id: true },
    });
    if (!contact) throw new ForbiddenException("You can only review someone you've worked with.");

    return this.prisma.review.upsert({
      where: { fromId_toId: { fromId: author.id, toId } },
      create: { fromId: author.id, toId, rating, comment: comment ?? null },
      update: { rating, comment: comment ?? null },
    });
  }

  /** Reviews written about a user, newest first, with the author's name. */
  listFor(userId: string) {
    return this.prisma.review.findMany({
      where: { toId: userId },
      orderBy: { createdAt: "desc" },
      include: { from: { select: { id: true, fullName: true } } },
    });
  }

  /** Average + count per user, for a batch of ids (profiles, search results). */
  async aggregateFor(userIds: string[]): Promise<Map<string, Aggregate>> {
    const map = new Map<string, Aggregate>();
    if (userIds.length === 0) return map;

    const grouped = await this.prisma.review.groupBy({
      by: ["toId"],
      where: { toId: { in: userIds } },
      _avg: { rating: true },
      _count: { rating: true },
    });
    for (const g of grouped) {
      map.set(g.toId, {
        average: Math.round((g._avg.rating ?? 0) * 10) / 10,
        count: g._count.rating,
      });
    }
    return map;
  }
}
