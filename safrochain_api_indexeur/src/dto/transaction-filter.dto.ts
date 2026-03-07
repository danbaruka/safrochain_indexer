import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsArray,
  IsDateString,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";

export enum TransactionSortBy {
  HEIGHT = "height",
  TIMESTAMP = "timestamp",
  GAS_USED = "gas_used",
  GAS_WANTED = "gas_wanted",
  FEE = "fee",
}

export enum TransactionSortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export class TransactionFilterDto {
  @ApiProperty({
    description: "Filter by transaction success status",
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  success?: boolean;

  @ApiProperty({
    description: "Filter by minimum block height",
    required: false,
    example: 1000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  min_height?: number;

  @ApiProperty({
    description: "Filter by maximum block height",
    required: false,
    example: 5000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  max_height?: number;

  @ApiProperty({
    description: "Filter by minimum gas used",
    required: false,
    example: 10000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  min_gas_used?: number;

  @ApiProperty({
    description: "Filter by maximum gas used",
    required: false,
    example: 100000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  max_gas_used?: number;

  @ApiProperty({
    description: "Filter by minimum gas wanted",
    required: false,
    example: 10000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  min_gas_wanted?: number;

  @ApiProperty({
    description: "Filter by maximum gas wanted",
    required: false,
    example: 100000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  max_gas_wanted?: number;

  @ApiProperty({
    description: "Filter by minimum fee amount",
    required: false,
    example: "1000",
  })
  @IsOptional()
  @IsString()
  min_fee_amount?: string;

  @ApiProperty({
    description: "Filter by maximum fee amount",
    required: false,
    example: "10000",
  })
  @IsOptional()
  @IsString()
  max_fee_amount?: string;

  @ApiProperty({
    description: "Filter by fee denomination",
    required: false,
    example: "usaf",
  })
  @IsOptional()
  @IsString()
  fee_denom?: string;

  @ApiProperty({
    description: "Filter by memo content (partial match)",
    required: false,
    example: "test",
  })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiProperty({
    description: "Filter by signer address",
    required: false,
    example: "safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @IsOptional()
  @IsString()
  signer?: string;

  @ApiProperty({
    description: "Filter by message types",
    required: false,
    example: [
      "cosmos.bank.v1beta1.MsgSend",
      "cosmos.staking.v1beta1.MsgDelegate",
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  message_types?: string[];

  @ApiProperty({
    description: "Filter by involved addresses",
    required: false,
    example: ["safro1abc123def456ghi789jkl012mno345pqr678stu"],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addresses?: string[];

  @ApiProperty({
    description: "Filter by validator address",
    required: false,
    example: "safrovaloper1xyz789abc123def456ghi789jkl012mno345pqr",
  })
  @IsOptional()
  @IsString()
  validator?: string;

  @ApiProperty({
    description: "Filter transactions from this date",
    required: false,
    example: "2023-01-01T00:00:00Z",
  })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiProperty({
    description: "Filter transactions until this date",
    required: false,
    example: "2023-12-31T23:59:59Z",
  })
  @IsOptional()
  @IsDateString()
  date_to?: string;

  @ApiProperty({
    description: "Number of results to return",
    required: false,
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

  @ApiProperty({
    description: "Number of results to skip",
    required: false,
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;

  @ApiProperty({
    description:
      "Cursor for pagination (block height). Use next_cursor from previous response. O(1) for deep pages.",
    required: false,
    example: 12345,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  cursor?: number;

  @ApiProperty({
    description: "Sort by field",
    required: false,
    enum: TransactionSortBy,
    example: TransactionSortBy.HEIGHT,
  })
  @IsOptional()
  @IsEnum(TransactionSortBy)
  sort_by?: TransactionSortBy = TransactionSortBy.HEIGHT;

  @ApiProperty({
    description: "Sort order",
    required: false,
    enum: TransactionSortOrder,
    example: TransactionSortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(TransactionSortOrder)
  sort_order?: TransactionSortOrder = TransactionSortOrder.DESC;
}

export class TransactionSearchDto {
  @ApiProperty({
    description: "Search query (searches in hash, memo, and message content)",
    required: false,
    example: "proposal",
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    description: "Number of results to return",
    required: false,
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

  @ApiProperty({
    description: "Number of results to skip",
    required: false,
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}

export class TransactionStatisticsDto {
  @ApiProperty({
    description: "Total number of transactions",
    example: 15000,
  })
  total_transactions: number;

  @ApiProperty({
    description: "Number of successful transactions",
    example: 14850,
  })
  successful_transactions: number;

  @ApiProperty({
    description: "Number of failed transactions",
    example: 150,
  })
  failed_transactions: number;

  @ApiProperty({
    description: "Success rate percentage",
    example: 99.0,
  })
  success_rate: number;

  @ApiProperty({
    description: "Total gas used",
    example: "15000000000",
  })
  total_gas_used: string;

  @ApiProperty({
    description: "Total gas wanted",
    example: "20000000000",
  })
  total_gas_wanted: string;

  @ApiProperty({
    description: "Average gas used per transaction",
    example: "1000000",
  })
  avg_gas_used: string;

  @ApiProperty({
    description: "Average gas wanted per transaction",
    example: "1333333",
  })
  avg_gas_wanted: string;

  @ApiProperty({
    description: "Total fees paid",
    example: [
      {
        denom: "usaf",
        amount: "1500000000",
      },
    ],
  })
  total_fees: any[];

  @ApiProperty({
    description: "Most common message types",
    example: [
      { type: "cosmos.bank.v1beta1.MsgSend", count: 5000 },
      { type: "cosmos.staking.v1beta1.MsgDelegate", count: 3000 },
    ],
  })
  top_message_types: Array<{ type: string; count: number }>;

  @ApiProperty({
    description: "Most active addresses",
    example: [
      { address: "safro1abc123def456ghi789jkl012mno345pqr678stu", count: 100 },
    ],
  })
  top_addresses: Array<{ address: string; count: number }>;

  @ApiProperty({
    description: "Daily transaction volume",
    example: {
      "2023-01-01": 100,
      "2023-01-02": 150,
    },
  })
  daily_volume: Record<string, number>;

  @ApiProperty({
    description: "Hourly transaction volume for the last 24 hours",
    example: {
      "2023-01-01T00:00:00Z": 5,
      "2023-01-01T01:00:00Z": 8,
    },
  })
  hourly_volume: Record<string, number>;
}

export class TransactionAnalyticsDto {
  @ApiProperty({
    description: "Transaction volume over time",
    example: [{ date: "2023-01-01", count: 100, gas_used: "1000000000" }],
  })
  volume_over_time: Array<{
    date: string;
    count: number;
    gas_used: string;
    fees: any[];
  }>;

  @ApiProperty({
    description: "Gas efficiency analysis",
    example: {
      avg_efficiency: 0.85,
      min_efficiency: 0.1,
      max_efficiency: 1.0,
    },
  })
  gas_efficiency: {
    avg_efficiency: number;
    min_efficiency: number;
    max_efficiency: number;
  };

  @ApiProperty({
    description: "Fee analysis by denomination",
    example: [
      { denom: "usaf", total_amount: "1000000000", avg_amount: "100000" },
    ],
  })
  fee_analysis: Array<{
    denom: string;
    total_amount: string;
    avg_amount: string;
    min_amount: string;
    max_amount: string;
  }>;

  @ApiProperty({
    description: "Message type distribution",
    example: [
      { type: "cosmos.bank.v1beta1.MsgSend", count: 5000, percentage: 33.33 },
    ],
  })
  message_type_distribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}
