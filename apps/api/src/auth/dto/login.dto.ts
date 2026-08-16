import { IsEmail, IsString, MaxLength } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Enter a valid email address." })
  @MaxLength(254)
  email!: string;

  @IsString()
  @MaxLength(128)
  password!: string;
}
