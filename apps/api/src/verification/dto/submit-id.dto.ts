import { IsString, Matches, MaxLength, MinLength } from "class-validator";

/** The typed personal info; the images arrive as multipart files. */
export class SubmitIdDto {
  @IsString() @MinLength(2) @MaxLength(120)
  fullName!: string;

  @IsString() @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "Date of birth must be YYYY-MM-DD." })
  dob!: string;

  @IsString() @MinLength(3) @MaxLength(64)
  idNumber!: string;
}
