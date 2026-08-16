import { IsEmail, IsIn, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail({}, { message: "Enter a valid email address." })
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8, { message: "Use at least 8 characters." })
  @MaxLength(128)
  @Matches(/[A-Za-z]/, { message: "Include at least one letter." })
  @Matches(/\d/, { message: "Include at least one number." })
  password!: string;

  @IsString()
  @MinLength(2, { message: "Enter your full name." })
  @MaxLength(120)
  fullName!: string;

  @IsIn(["client", "freelancer"], { message: "Choose whether you are a client or a freelancer." })
  role!: "client" | "freelancer";

  @IsString() @MinLength(2) @MaxLength(80)
  country!: string;

  @IsString() @MinLength(2) @MaxLength(80)
  state!: string;

  @IsString() @MinLength(2) @MaxLength(12)
  postalCode!: string;
}
