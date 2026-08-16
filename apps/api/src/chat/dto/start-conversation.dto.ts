import { IsString, IsUUID } from "class-validator";

export class StartConversationDto {
  @IsString() @IsUUID()
  freelancerId!: string;
}
