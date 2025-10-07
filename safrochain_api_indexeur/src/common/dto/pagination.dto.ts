import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsInt, Min, Max } from "class-validator";

export class PaginationDto {
  @ApiPropertyOptional({
    description: "Page number (starts from 1)",
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page",
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  get offset(): number {
    return ((this.page || 1) - 1) * (this.limit || 20);
  }
}

export class PaginationMetaDto {
  @ApiPropertyOptional({
    description: "Current page number",
    example: 1,
  })
  page: number;

  @ApiPropertyOptional({
    description: "Number of items per page",
    example: 20,
  })
  limit: number;

  @ApiPropertyOptional({
    description: "Total number of items",
    example: 1000,
  })
  total: number;

  @ApiPropertyOptional({
    description: "Total number of pages",
    example: 50,
  })
  totalPages: number;

  @ApiPropertyOptional({
    description: "Whether there is a next page",
    example: true,
  })
  hasNext: boolean;

  @ApiPropertyOptional({
    description: "Whether there is a previous page",
    example: false,
  })
  hasPrev: boolean;

  constructor(page: number, limit: number, total: number) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrev = page > 1;
  }
}

export class PaginatedResponseDto<T> {
  @ApiPropertyOptional({
    description: "Array of data items",
  })
  data: T[];

  @ApiPropertyOptional({
    description: "Pagination metadata",
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;

  constructor(data: T[], page: number, limit: number, total: number) {
    this.data = data;
    this.meta = new PaginationMetaDto(page, limit, total);
  }
}
