import { IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @MinLength(2, { message: "Give the category a name." })
  @MaxLength(60)
  name!: string;

  // Optional — derived from the name when omitted. Lowercase, digits, dashes.
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: "Slug may use lowercase letters, numbers and dashes only." })
  @MaxLength(60)
  slug?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
