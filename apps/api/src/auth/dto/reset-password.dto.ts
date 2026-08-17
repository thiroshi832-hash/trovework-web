import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  @MinLength(16, { message: "Invalid or expired reset link." })
  @MaxLength(200)
  token!: string;

  // Same policy as registration — keep the two in step.
  @IsString()
  @MinLength(8, { message: "Use at least 8 characters." })
  @MaxLength(128)
  @Matches(/[A-Za-z]/, { message: "Include at least one letter." })
  @Matches(/\d/, { message: "Include at least one number." })
  password!: string;
}
