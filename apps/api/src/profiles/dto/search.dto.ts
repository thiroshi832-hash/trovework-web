import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class SearchDto {
  @IsOptional() @IsString()
  q?: string;

  /** Comma-separated categories (the browse UI allows several). */
  @IsOptional() @IsString()
  categories?: string;

  @IsOptional() @IsString()
  skill?: string;

  @IsOptional() @IsString()
  availability?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(5)
  minRating?: number;

  /** newest | rating | price_asc | price_desc */
  @IsOptional() @IsString()
  sort?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  minPrice?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  maxPrice?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
  take?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  skip?: number;
}
