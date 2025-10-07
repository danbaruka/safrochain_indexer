import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  IsArray,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";
import { DateFilterDto } from "../common/dto/date-filter.dto";
import { DateSerializer } from "../common/utils/date-serializer.util";

export enum TokenSortBy {
  NAME = "name",
  DENOM = "denom",
  PRICE = "price",
  MARKET_CAP = "market_cap",
  LAST_UPDATED = "last_updated",
}

export enum TokenSortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export class TokenListDto extends DateFilterDto {
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
    description: "Filter by token name",
    example: "Safro",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Filter by denomination",
    example: "usaf",
  })
  @IsOptional()
  @IsString()
  denom?: string;

  @ApiPropertyOptional({
    description: "Filter by price ID",
    example: "safro",
  })
  @IsOptional()
  @IsString()
  price_id?: string;

  @ApiPropertyOptional({
    description: "Filter by minimum price",
    example: 0.01,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price_min?: number;

  @ApiPropertyOptional({
    description: "Filter by maximum price",
    example: 100.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price_max?: number;

  @ApiPropertyOptional({
    description: "Filter by token names",
    example: ["Safro", "Bitcoin"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  names?: string[];

  @ApiPropertyOptional({
    description: "Filter by denominations",
    example: ["usaf", "ubtc"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  denoms?: string[];

  @ApiPropertyOptional({
    description: "Sort by field",
    enum: TokenSortBy,
    example: TokenSortBy.PRICE,
  })
  @IsOptional()
  sort_by?: TokenSortBy = TokenSortBy.NAME;

  @ApiPropertyOptional({
    description: "Sort order",
    enum: TokenSortOrder,
    example: TokenSortOrder.DESC,
  })
  @IsOptional()
  sort_order?: TokenSortOrder = TokenSortOrder.ASC;
}

export class TokenResponseDto {
  @ApiProperty({
    description: "Token name",
    example: "Safro",
  })
  name: string;

  @ApiProperty({
    description: "Token description",
    example: "The native token of SafroChain",
  })
  description: string;

  @ApiProperty({
    description: "Token symbol",
    example: "SAFRO",
  })
  symbol: string;

  @ApiProperty({
    description: "Token logo URL",
    example: "https://example.com/safro-logo.png",
  })
  logo?: string;

  @ApiProperty({
    description: "Token website",
    example: "https://safrochain.com",
  })
  website?: string;

  @ApiProperty({
    description: "Token units",
    example: [
      {
        denom: "usaf",
        exponent: 6,
        aliases: ["safro", "SAFRO"],
        price_id: "safro",
      },
    ],
  })
  units: any[];

  @ApiProperty({
    description: "Current price information",
    example: {
      price: 0.05,
      market_cap: 1000000,
      volume_24h: 50000,
      change_24h: 0.02,
    },
  })
  price_info?: any;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;
}

export class TokenUnitListDto extends DateFilterDto {
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
    description: "Filter by token name",
    example: "Safro",
  })
  @IsOptional()
  @IsString()
  token_name?: string;

  @ApiPropertyOptional({
    description: "Filter by denomination",
    example: "usaf",
  })
  @IsOptional()
  @IsString()
  denom?: string;

  @ApiPropertyOptional({
    description: "Filter by price ID",
    example: "safro",
  })
  @IsOptional()
  @IsString()
  price_id?: string;

  @ApiPropertyOptional({
    description: "Filter by minimum exponent",
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  exponent_min?: number;

  @ApiPropertyOptional({
    description: "Filter by maximum exponent",
    example: 18,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  exponent_max?: number;

  @ApiPropertyOptional({
    description: "Filter by denominations",
    example: ["usaf", "ubtc"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  denoms?: string[];
}

export class TokenUnitResponseDto {
  @ApiProperty({
    description: "Token name",
    example: "Safro",
  })
  token_name: string;

  @ApiProperty({
    description: "Denomination",
    example: "usaf",
  })
  denom: string;

  @ApiProperty({
    description: "Exponent for the denomination",
    example: 6,
  })
  exponent: number;

  @ApiProperty({
    description: "Aliases for the denomination",
    example: ["safro", "SAFRO"],
  })
  aliases?: string[];

  @ApiProperty({
    description: "Price ID for external price feeds",
    example: "safro",
  })
  price_id?: string;

  @ApiProperty({
    description: "Token information",
    example: {
      name: "Safro",
      symbol: "SAFRO",
      description: "The native token of SafroChain",
    },
  })
  token?: any;
}

export class TokenPriceListDto extends DateFilterDto {
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
    description: "Filter by price ID",
    example: "safro",
  })
  @IsOptional()
  @IsString()
  price_id?: string;

  @ApiPropertyOptional({
    description: "Filter by minimum price",
    example: 0.01,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price_min?: number;

  @ApiPropertyOptional({
    description: "Filter by maximum price",
    example: 100.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price_max?: number;

  @ApiPropertyOptional({
    description: "Filter by price IDs",
    example: ["safro", "bitcoin"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  price_ids?: string[];
}

export class TokenPriceResponseDto {
  @ApiProperty({
    description: "Price ID",
    example: "safro",
  })
  price_id: string;

  @ApiProperty({
    description: "Current price",
    example: 0.05,
  })
  price: number;

  @ApiProperty({
    description: "Market cap",
    example: 1000000,
  })
  market_cap?: number;

  @ApiProperty({
    description: "24h volume",
    example: 50000,
  })
  volume_24h?: number;

  @ApiProperty({
    description: "24h price change",
    example: 0.02,
  })
  change_24h?: number;

  @ApiProperty({
    description: "Price last updated",
    example: "2023-12-01T10:30:00Z",
  })
  @DateSerializer()
  last_updated: Date;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;
}

export class TokenPriceHistoryListDto extends DateFilterDto {
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
    description: "Filter by price ID",
    example: "safro",
  })
  @IsOptional()
  @IsString()
  price_id?: string;

  @ApiPropertyOptional({
    description: "Filter by minimum price",
    example: 0.01,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price_min?: number;

  @ApiPropertyOptional({
    description: "Filter by maximum price",
    example: 100.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price_max?: number;

  @ApiPropertyOptional({
    description: "Filter by price IDs",
    example: ["safro", "bitcoin"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  price_ids?: string[];

  @ApiPropertyOptional({
    description: "Time interval for price history",
    example: "1h",
  })
  @IsOptional()
  @IsString()
  interval?: string;
}

export class TokenPriceHistoryResponseDto {
  @ApiProperty({
    description: "Price ID",
    example: "safro",
  })
  price_id: string;

  @ApiProperty({
    description: "Price at this time",
    example: 0.05,
  })
  price: number;

  @ApiProperty({
    description: "Market cap at this time",
    example: 1000000,
  })
  market_cap?: number;

  @ApiProperty({
    description: "Volume at this time",
    example: 50000,
  })
  volume?: number;

  @ApiProperty({
    description: "Price timestamp",
    example: "2023-12-01T10:30:00Z",
  })
  @DateSerializer()
  timestamp: Date;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;
}

export class TokenStatisticsDto {
  @ApiProperty({
    description: "Total number of tokens",
    example: 25,
  })
  total_tokens: number;

  @ApiProperty({
    description: "Total number of token units",
    example: 50,
  })
  total_token_units: number;

  @ApiProperty({
    description: "Total market cap",
    example: 50000000,
  })
  total_market_cap: number;

  @ApiProperty({
    description: "Total 24h volume",
    example: 1000000,
  })
  total_volume_24h: number;

  @ApiProperty({
    description: "Top tokens by market cap",
    example: [
      {
        name: "Safro",
        denom: "usaf",
        market_cap: 25000000,
        price: 0.05,
      },
    ],
  })
  top_tokens_by_market_cap: Array<{
    name: string;
    denom: string;
    market_cap: number;
    price: number;
  }>;

  @ApiProperty({
    description: "Top tokens by volume",
    example: [
      {
        name: "Safro",
        denom: "usaf",
        volume_24h: 500000,
        price: 0.05,
      },
    ],
  })
  top_tokens_by_volume: Array<{
    name: string;
    denom: string;
    volume_24h: number;
    price: number;
  }>;

  @ApiProperty({
    description: "Price changes in last 24h",
    example: {
      gainers: 15,
      losers: 8,
      unchanged: 2,
    },
  })
  price_changes_24h: {
    gainers: number;
    losers: number;
    unchanged: number;
  };

  @ApiProperty({
    description: "Average price change",
    example: 0.02,
  })
  average_price_change: number;
}
