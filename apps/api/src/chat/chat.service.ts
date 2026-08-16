import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { Conversation, Message } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PermissionService, type Role, type AccountStatus } from "../permission/permission.service";

export interface ChatActor {
  id: string;
  role: Role;
  status: AccountStatus;
  idVerified: boolean;
  phoneVerified: boolean;
}

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permission: PermissionService,
  ) {}

  /**
   * The 'Start chat' action — the enforcement point (FR-C-3). Only a verified
   * client may open a conversation, and only with a freelancer; the client↔
   * freelancer shape (never freelancer↔freelancer, FR-C-2) is guaranteed
   * because the opener is always the client and the target must be a freelancer.
   * Idempotent: re-opening returns the existing thread.
   */
  async start(viewer: ChatActor, freelancerId: string): Promise<Conversation> {
    const target = await this.prisma.user.findUnique({
      where: { id: freelancerId },
      select: { id: true, role: true, status: true },
    });
    if (!target || target.role !== "freelancer" || target.status !== "active") {
      throw new NotFoundException("Freelancer not found.");
    }

    // canStartChat encodes: active verified client → freelancer only.
    if (!this.permission.canStartChat(viewer, "freelancer")) {
      throw new ForbiddenException("Verify your identity to start a conversation.");
    }
    if (viewer.id === freelancerId) throw new ForbiddenException("You can't message yourself.");

    const existing = await this.prisma.conversation.findUnique({
      where: { clientId_freelancerId: { clientId: viewer.id, freelancerId } },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: { clientId: viewer.id, freelancerId },
    });
  }

  /** Threads the user is a party to, most-recent first. */
  listMine(userId: string) {
    return this.prisma.conversation.findMany({
      where: { OR: [{ clientId: userId }, { freelancerId: userId }] },
      orderBy: [{ lastMessageAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      include: {
        client: { select: { id: true, fullName: true } },
        freelancer: { select: { id: true, fullName: true } },
      },
    });
  }

  async getMessages(userId: string, conversationId: string): Promise<Message[]> {
    await this.assertParticipant(userId, conversationId);
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { sentAt: "asc" },
    });
  }

  /**
   * Persists a message. Either party may send once the conversation exists, but
   * only a participant, and not while banned. Returns the row so the gateway
   * can broadcast it.
   */
  async sendMessage(sender: ChatActor, conversationId: string, body: string): Promise<Message> {
    if (sender.status === "banned") throw new ForbiddenException("This account has been suspended.");
    await this.assertParticipant(sender.id, conversationId);

    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: { conversationId, senderId: sender.id, body },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      }),
    ]);
    return message;
  }

  /** Shared by REST and the socket gateway before joining a room or sending. */
  async assertParticipant(userId: string, conversationId: string): Promise<Conversation> {
    const convo = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!convo || (convo.clientId !== userId && convo.freelancerId !== userId)) {
      // Same 404 for missing and not-yours, so membership can't be probed.
      throw new NotFoundException("Conversation not found.");
    }
    return convo;
  }
}
