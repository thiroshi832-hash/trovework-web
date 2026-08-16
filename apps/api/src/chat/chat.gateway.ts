import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { PrismaService } from "../prisma/prisma.service";
import { ChatService, type ChatActor } from "./chat.service";
import { SendMessageDto } from "./dto/send-message.dto";
import type { AccessTokenPayload } from "../auth/auth.service";

const room = (conversationId: string) => `conversation:${conversationId}`;

/**
 * Real-time delivery on top of the REST chat core. The gateway authenticates,
 * authorizes room membership, and broadcasts — but every rule (who may open a
 * chat, who may post to it) lives in ChatService, so REST and WS enforce the
 * same thing. CORS mirrors the HTTP app: the one web origin, with credentials
 * so the auth cookie rides along on the handshake.
 */
@WebSocketGateway({
  namespace: "/chat",
  cors: { origin: process.env.WEB_ORIGIN ?? "http://localhost:3000", credentials: true },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;
  private readonly log = new Logger("ChatGateway");

  constructor(
    private readonly chat: ChatService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /** Reject the connection unless it carries a valid session cookie. */
  async handleConnection(client: Socket): Promise<void> {
    try {
      const user = await this.authenticate(client);
      client.data.user = user;
    } catch {
      client.emit("error", { message: "Unauthorized" });
      client.disconnect(true);
    }
  }

  @SubscribeMessage("conversation:join")
  async onJoin(@ConnectedSocket() client: Socket, @MessageBody() body: { conversationId?: string }) {
    const user = this.userOf(client);
    const conversationId = body?.conversationId;
    if (!conversationId) throw new WsException("conversationId is required.");

    // Same membership check the REST layer uses; throws 404 if not a party.
    await this.chat.assertParticipant(user.id, conversationId);
    await client.join(room(conversationId));
    return { joined: conversationId };
  }

  @SubscribeMessage("message:send")
  async onMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(new ValidationPipe({ whitelist: true, transform: true }))
    body: SendMessageDto & { conversationId?: string },
  ) {
    const user = this.userOf(client);
    if (!body.conversationId) throw new WsException("conversationId is required.");

    const message = await this.chat.sendMessage(user, body.conversationId, body.body);
    // Fan out to everyone in the room, including the sender's other tabs.
    this.server.to(room(body.conversationId)).emit("message:new", message);
    return message;
  }

  /* -------------------------------- internals ------------------------------ */

  private userOf(client: Socket): ChatActor {
    const user = client.data.user as ChatActor | undefined;
    if (!user) throw new WsException("Unauthorized.");
    return user;
  }

  private async authenticate(client: Socket): Promise<ChatActor> {
    const token = this.tokenFromCookie(client.handshake.headers.cookie);
    if (!token) throw new Error("no token");

    const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
      secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
    });

    // Read fresh, like the HTTP strategy — a ban or verification takes effect at once.
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, status: true, idVerified: true, phoneVerified: true },
    });
    if (!user || user.status === "banned") throw new Error("invalid user");
    return user as ChatActor;
  }

  private tokenFromCookie(cookie?: string): string | null {
    if (!cookie) return null;
    for (const part of cookie.split(";")) {
      const [k, ...v] = part.trim().split("=");
      if (k === "access_token") return decodeURIComponent(v.join("="));
    }
    return null;
  }
}
