import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma, type Post, type PostStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { scanPost } from "../moderation/contact-scan";
import { phoneVerificationRequired } from "../verification/phone-policy";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";

const STRIKE_BAN_THRESHOLD = 3; // FR-M-4: warn on 1 & 2, ban on 3.

export interface PostAuthor {
  id: string;
  role: string;
  status: string;
  phoneVerified: boolean;
  idVerified: boolean;
}

export interface WriteResult {
  post: Post;
  /** Present when the scanner blocked the post. */
  blocked?: {
    detectedText: string;
    strikeCount: number;
    banned: boolean;
    /** The message the editor should surface (FR-M-5). */
    message: string;
  };
}

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /* --------------------------------- create -------------------------------- */

  async create(author: PostAuthor, dto: CreatePostDto): Promise<WriteResult> {
    this.assertCanAuthor(author);
    if (dto.status === "active") this.assertCanPublish(author);

    const scan = scanPost(dto);

    if (!scan.clean) {
      // Persist the post as blocked so the user can see and fix it, then record
      // the violation and advance the strike count in one transaction.
      const post = await this.prisma.post.create({
        data: {
          authorId: author.id,
          title: dto.title,
          description: dto.description,
          category: dto.category,
          priceFrom: dto.priceFrom ?? null,
          status: "blocked",
          blockedReason: scan.detectedText,
        },
      });
      const strike = await this.recordViolation(author.id, post.id, scan.detectedText);
      return { post, blocked: { detectedText: scan.detectedText, ...strike } };
    }

    const post = await this.prisma.post.create({
      data: {
        authorId: author.id,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        priceFrom: dto.priceFrom ?? null,
        status: dto.status,
      },
    });
    return { post };
  }

  /* --------------------------------- update -------------------------------- */

  async update(author: PostAuthor, id: string, dto: UpdatePostDto): Promise<WriteResult> {
    this.assertCanAuthor(author);
    const existing = await this.prisma.post.findUnique({ where: { id } });
    if (!existing || existing.authorId !== author.id) {
      // Same 404 whether it's missing or someone else's — don't reveal which.
      throw new NotFoundException("Post not found.");
    }

    const nextStatus: PostStatus = dto.status ?? (existing.status === "blocked" ? "draft" : existing.status);
    if (nextStatus === "active") this.assertCanPublish(author);

    const merged = {
      title: dto.title ?? existing.title,
      description: dto.description ?? existing.description,
    };
    const scan = scanPost(merged);

    if (!scan.clean) {
      const post = await this.prisma.post.update({
        where: { id },
        data: {
          ...merged,
          category: dto.category ?? existing.category,
          priceFrom: dto.priceFrom ?? existing.priceFrom,
          status: "blocked",
          blockedReason: scan.detectedText,
        },
      });
      const strike = await this.recordViolation(author.id, post.id, scan.detectedText);
      return { post, blocked: { detectedText: scan.detectedText, ...strike } };
    }

    const post = await this.prisma.post.update({
      where: { id },
      data: {
        ...merged,
        category: dto.category ?? existing.category,
        priceFrom: dto.priceFrom ?? existing.priceFrom,
        status: nextStatus,
        blockedReason: null, // cleared once it scans clean again
      },
    });
    return { post };
  }

  /* --------------------------------- reads --------------------------------- */

  /** A freelancer's own posts, including drafts and blocked ones. */
  listMine(authorId: string) {
    return this.prisma.post.findMany({
      where: { authorId },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * One of the author's own posts, for the edit screen. A missing post and
   * someone else's post are the same 404 — we don't reveal which.
   */
  async getOwn(authorId: string, id: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post || post.authorId !== authorId) throw new NotFoundException("Post not found.");
    return post;
  }

  async remove(author: PostAuthor, id: string): Promise<void> {
    const existing = await this.prisma.post.findUnique({ where: { id } });
    if (!existing || existing.authorId !== author.id) throw new NotFoundException("Post not found.");
    await this.prisma.post.delete({ where: { id } });
  }

  /* -------------------------------- internals ------------------------------ */

  private assertCanAuthor(author: PostAuthor) {
    if (author.status === "banned") throw new ForbiddenException("This account has been suspended.");
    if (author.role !== "freelancer") throw new ForbiddenException("Only freelancers can create posts.");
  }

  /**
   * The publish gate: a live post needs ID verification, and phone verification
   * too when it's required (it isn't when no SMS provider is linked — see
   * phoneVerificationRequired — otherwise publishing would be impossible).
   */
  private assertCanPublish(author: PostAuthor) {
    if (phoneVerificationRequired(this.config) && !author.phoneVerified) {
      throw new ForbiddenException("Verify your phone number before publishing.");
    }
    if (!author.idVerified) throw new ForbiddenException("Verify your identity before publishing.");
  }

  /**
   * Logs the violation and advances the strike count atomically, banning the
   * account on the third (FR-M-3/4). Returned so the caller can tell the user
   * exactly where they stand.
   */
  private async recordViolation(userId: string, postId: string, detectedText: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.violation.create({ data: { userId, postId, detectedText } });

      const user = await tx.user.update({
        where: { id: userId },
        data: { strikeCount: { increment: 1 } },
        select: { strikeCount: true },
      });

      const banned = user.strikeCount >= STRIKE_BAN_THRESHOLD;
      if (banned) {
        await tx.user.update({ where: { id: userId }, data: { status: "banned" } });
      }

      return { strikeCount: user.strikeCount, banned, message: this.strikeMessage(user.strikeCount, banned) };
    });
  }

  private strikeMessage(strikeCount: number, banned: boolean): string {
    if (banned) {
      return "Your post contained contact information. This was your third violation, so your account has been suspended.";
    }
    const left = STRIKE_BAN_THRESHOLD - strikeCount;
    return `Your post can't be published because it contains contact information — sharing contact details off-platform isn't allowed. This is strike ${strikeCount} of ${STRIKE_BAN_THRESHOLD}; ${left} more will suspend your account. Remove the highlighted text and try again.`;
  }
}

// Re-exported so the controller can narrow Prisma errors without importing Prisma directly.
export { Prisma };
