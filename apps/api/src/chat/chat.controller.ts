import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { StartConversationDto } from "./dto/start-conversation.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthedUser } from "../auth/strategies/jwt.strategy";

/** All routes require a session (global JwtAuthGuard). */
@Controller("conversations")
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post()
  start(@CurrentUser() user: AuthedUser, @Body() dto: StartConversationDto) {
    return this.chat.start(user, dto.freelancerId);
  }

  @Get()
  listMine(@CurrentUser() user: AuthedUser) {
    return this.chat.listMine(user.id);
  }

  @Get(":id/messages")
  messages(@CurrentUser() user: AuthedUser, @Param("id") id: string) {
    return this.chat.getMessages(user.id, id);
  }

  /** REST send — also works without a live socket. The gateway broadcasts. */
  @Post(":id/messages")
  send(@CurrentUser() user: AuthedUser, @Param("id") id: string, @Body() dto: SendMessageDto) {
    return this.chat.sendMessage(user, id, dto.body);
  }

  /** Marks the thread read up to now for the current user (clears its unread badge). */
  @Post(":id/read")
  @HttpCode(204)
  read(@CurrentUser() user: AuthedUser, @Param("id") id: string) {
    return this.chat.markRead(user.id, id);
  }
}
