import { IsIn, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

/** status is limited to what a user may set directly — never "blocked". */
export class CreatePostDto {
  @IsString() @MinLength(4) @MaxLength(120)
  title!: string;

  @IsString() @MinLength(20) @MaxLength(4000)
  description!: string;

  @IsString() @MinLength(2) @MaxLength(60)
  category!: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1_000_000)
  priceFrom?: number;

  @IsIn(["draft", "active"], { message: "A post can be saved as a draft or published." })
  status!: "draft" | "active";
}
