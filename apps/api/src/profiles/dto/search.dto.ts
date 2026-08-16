import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class SearchDto {
  @IsOptional() @IsString()
  q?: string;

  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @IsString()
  skill?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  minPrice?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  maxPrice?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
  take?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  skip?: number;
}
