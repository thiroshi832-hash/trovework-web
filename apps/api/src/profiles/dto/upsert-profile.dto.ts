import {
  ArrayMaxSize, IsArray, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength,
} from "class-validator";

export class UpsertProfileDto {
  @IsString() @MinLength(2) @MaxLength(80)
  displayName!: string;

  @IsString() @MinLength(2) @MaxLength(60)
  category!: string;

  @IsOptional() @IsString() @MaxLength(120)
  headline?: string;

  @IsOptional() @IsString() @MaxLength(2000)
  bio?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  skills?: string[];

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(100000)
  hourlyRate?: number;

  @IsOptional() @IsString() @MaxLength(40)
  availability?: string;

  // Gated contact handles. Stored on the profile, released only to verified clients.
  @IsOptional() @IsString() @MaxLength(64)
  contactTelegram?: string;

  @IsOptional() @IsString() @MaxLength(64)
  contactDiscord?: string;

  @IsOptional() @IsString() @MaxLength(64)
  contactWhatsapp?: string;

  // A LinkedIn handle or profile URL is longer than a chat username, so the cap
  // is bigger. Still a gated contact field like the others.
  @IsOptional() @IsString() @MaxLength(200)
  contactLinkedin?: string;
}
