import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsInt,
  IsArray,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";
import { DateFilterDto } from "../common/dto/date-filter.dto";
import { DateSerializer } from "../common/utils/date-serializer.util";

export enum SupplySortBy {
  DENOM = "denom",
  AMOUNT = "amount",
  HEIGHT = "height",
}

export enum SupplySortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export class SupplyListDto extends DateFilterDto {
  @ApiPropertyOptional({
    description: "Page number",
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page",
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: "Filter by denomination",
    example: "usaf",
  })
  @IsOptional()
  @IsString()
  denom?: string;

  @ApiPropertyOptional({
    description: "Filter by denominations",
    example: ["usaf", "ubtc"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  denoms?: string[];

  @ApiPropertyOptional({
    description: "Filter by minimum amount",
    example: "1000000",
  })
  @IsOptional()
  @IsString()
  amount_min?: string;

  @ApiPropertyOptional({
    description: "Filter by maximum amount",
    example: "1000000000",
  })
  @IsOptional()
  @IsString()
  amount_max?: string;

  @ApiPropertyOptional({
    description: "Filter by minimum height",
    example: 10000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  height_min?: number;

  @ApiPropertyOptional({
    description: "Filter by maximum height",
    example: 20000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  height_max?: number;

  @ApiPropertyOptional({
    description: "Sort by field",
    enum: SupplySortBy,
    example: SupplySortBy.DENOM,
  })
  @IsOptional()
  sort_by?: SupplySortBy = SupplySortBy.DENOM;

  @ApiPropertyOptional({
    description: "Sort order",
    enum: SupplySortOrder,
    example: SupplySortOrder.ASC,
  })
  @IsOptional()
  sort_order?: SupplySortOrder = SupplySortOrder.ASC;
}

export class SupplyResponseDto {
  @ApiProperty({
    description: "Denomination",
    example: "usaf",
  })
  denom: string;

  @ApiProperty({
    description: "Supply amount",
    example: "1000000000000",
  })
  amount: string;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;

  @ApiProperty({
    description: "Supply timestamp",
    example: "2023-12-01T10:30:00Z",
  })
  @DateSerializer()
  timestamp?: Date;
}

export class SupplyStatisticsDto {
  @ApiProperty({
    description: "Total number of supply records",
    example: 150,
  })
  total_records: number;

  @ApiProperty({
    description: "Total number of unique denominations",
    example: 25,
  })
  total_denominations: number;

  @ApiProperty({
    description: "Latest block height",
    example: 50000,
  })
  latest_height: number;

  @ApiProperty({
    description: "Supply by denomination",
    example: {
      usaf: "1000000000000",
      ubtc: "21000000",
    },
  })
  supply_by_denom: Record<string, string>;

  @ApiProperty({
    description: "Top denominations by supply",
    example: [
      {
        denom: "usaf",
        amount: "1000000000000",
        percentage: 95.5,
      },
    ],
  })
  top_denominations: Array<{
    denom: string;
    amount: string;
    percentage: number;
  }>;

  @ApiProperty({
    description: "Supply growth over time",
    example: {
      daily_growth: "1000000",
      weekly_growth: "7000000",
      monthly_growth: "30000000",
    },
  })
  supply_growth: {
    daily_growth: string;
    weekly_growth: string;
    monthly_growth: string;
  };

  @ApiProperty({
    description: "Supply distribution",
    example: {
      native_tokens: 95.5,
      other_tokens: 4.5,
    },
  })
  supply_distribution: {
    native_tokens: number;
    other_tokens: number;
  };

  @ApiProperty({
    description: "Historical supply data",
    example: [
      {
        height: 10000,
        total_supply: "500000000000",
        timestamp: "2023-01-01T00:00:00Z",
      },
    ],
  })
  historical_data: Array<{
    height: number;
    total_supply: string;
    timestamp: string;
  }>;
}
