import { IsIn, IsString, MaxLength, MinLength } from "class-validator";

/** The fields a new Google user must supply that Google doesn't provide. */
export class CompleteGoogleDto {
  @IsIn(["client", "freelancer"], { message: "Choose whether you are a client or a freelancer." })
  role!: "client" | "freelancer";

  @IsString() @MinLength(2) @MaxLength(80)
  country!: string;

  @IsString() @MinLength(2) @MaxLength(80)
  state!: string;

  @IsString() @MinLength(2) @MaxLength(12)
  postalCode!: string;
}
