import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  IsArray,
  IsDateString,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";
import { DateSerializer } from "../common/utils/date-serializer.util";

export enum AddressTransactionSortBy {
  HEIGHT = "height",
  TIMESTAMP = "timestamp",
  GAS_USED = "gas_used",
  GAS_WANTED = "gas_wanted",
  FEE = "fee",
}

export enum AddressTransactionSortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export class AddressTransactionFilterDto {
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
    description: "Filter by message types",
    required: false,
    example: [
      "/cosmos.bank.v1beta1.MsgSend",
      "/cosmos.staking.v1beta1.MsgDelegate",
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  message_types?: string[];

  @ApiProperty({
    description: "Filter by message modules",
    required: false,
    example: ["bank", "staking", "governance"],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modules?: string[];

  @ApiProperty({
    description: "Filter by transaction direction (sent, received, both)",
    required: false,
    example: "sent",
    enum: ["sent", "received", "both"],
  })
  @IsOptional()
  @IsString()
  direction?: "sent" | "received" | "both";

  @ApiProperty({
    description: "Filter by minimum amount transferred",
    required: false,
    example: "1000000",
  })
  @IsOptional()
  @IsString()
  min_amount?: string;

  @ApiProperty({
    description: "Filter by maximum amount transferred",
    required: false,
    example: "10000000",
  })
  @IsOptional()
  @IsString()
  max_amount?: string;

  @ApiProperty({
    description: "Filter by denomination",
    required: false,
    example: "usaf",
  })
  @IsOptional()
  @IsString()
  denom?: string;

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
    description: "Search in transaction hash, memo, or message content",
    required: false,
    example: "proposal",
  })
  @IsOptional()
  @IsString()
  search?: string;

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
    description: "Sort by field",
    required: false,
    enum: AddressTransactionSortBy,
    example: AddressTransactionSortBy.HEIGHT,
  })
  @IsOptional()
  @IsEnum(AddressTransactionSortBy)
  sort_by?: AddressTransactionSortBy = AddressTransactionSortBy.HEIGHT;

  @ApiProperty({
    description: "Sort order",
    required: false,
    enum: AddressTransactionSortOrder,
    example: AddressTransactionSortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(AddressTransactionSortOrder)
  sort_order?: AddressTransactionSortOrder = AddressTransactionSortOrder.DESC;

  @ApiProperty({
    description: "Include only transactions where address is the sender",
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  sender_only?: boolean;

  @ApiProperty({
    description: "Include only transactions where address is the receiver",
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  receiver_only?: boolean;

  @ApiProperty({
    description: "Include failed transactions",
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  include_failed?: boolean = true;

  @ApiProperty({
    description: "Group transactions by type",
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  group_by_type?: boolean;

  @ApiProperty({
    description: "Include message details",
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  include_messages?: boolean = true;

  @ApiProperty({
    description: "Include transaction logs",
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  include_logs?: boolean = false;
}

export class AddressTransactionResponseDto {
  @ApiProperty({
    description: "Transaction hash",
    example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
  })
  hash: string;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;

  @ApiProperty({
    description: "Block hash",
    example: "DEF456GHI789JKL012MNO345PQR678STUVWXYZABC123",
  })
  block_hash: string;

  @ApiProperty({
    description: "Transaction timestamp",
    example: "2023-01-01T00:00:00Z",
  })
  @DateSerializer()
  timestamp: Date;

  @ApiProperty({
    description: "Transaction success status",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "Transaction fee",
    example: [
      {
        denom: "usaf",
        amount: "28000",
      },
    ],
  })
  fee: any[];

  @ApiProperty({
    description: "Gas information",
    example: {
      wanted: 360506,
      used: 278992,
      limit: 360506,
      efficiency: 0.77,
    },
  })
  gas: {
    wanted: number;
    used: number;
    limit: number;
    efficiency: number;
  };

  @ApiProperty({
    description: "Transaction memo",
    example: "Test transaction",
  })
  memo: string;

  @ApiProperty({
    description: "Transaction messages",
    example: [
      {
        type: "/cosmos.bank.v1beta1.MsgSend",
        value: {
          from_address: "safro1abc123def456ghi789jkl012mno345pqr678stu",
          to_address: "safro1xyz789abc123def456ghi789jkl012mno345pqr",
          amount: [
            {
              denom: "usaf",
              amount: "1000000",
            },
          ],
        },
        index: 0,
      },
    ],
  })
  messages: Array<{
    type: string;
    value: any;
    index: number;
    direction?: "sent" | "received";
    amount?: string;
    denom?: string;
    involved_addresses?: string[];
  }>;

  @ApiProperty({
    description: "Transaction logs",
    example: [],
  })
  logs: any[];

  @ApiProperty({
    description: "All involved addresses",
    example: ["safro1abc123def456ghi789jkl012mno345pqr678stu"],
  })
  involved_addresses: string[];

  @ApiProperty({
    description: "Signer information",
    example: [
      {
        sequence: "0",
        mode_info: {
          single: {
            mode: "SIGN_MODE_DIRECT",
          },
        },
        public_key: {
          key: "A2+siD64fZj3m6Ft2xR8HmndEQZSN0vpmS/0z7cP95Vo",
          "@type": "/cosmos.crypto.secp256k1.PubKey",
        },
      },
    ],
  })
  signer_infos: any[];

  @ApiProperty({
    description: "Transaction direction for this address",
    example: "sent",
    enum: ["sent", "received", "both"],
  })
  direction: "sent" | "received" | "both";

  @ApiProperty({
    description: "Total amount involved for this address",
    example: "1000000",
  })
  total_amount: string;

  @ApiProperty({
    description: "Primary denomination",
    example: "usaf",
  })
  primary_denom: string;

  @ApiProperty({
    description: "Message count",
    example: 1,
  })
  message_count: number;

  @ApiProperty({
    description: "Unique message types",
    example: ["/cosmos.bank.v1beta1.MsgSend"],
  })
  message_types: string[];

  @ApiProperty({
    description: "Transaction categories",
    example: ["bank"],
  })
  categories: string[];

  @ApiProperty({
    description: "Count of involved addresses",
    example: 3,
  })
  involved_addresses_count: number;
}

export class AddressTransactionStatisticsDto {
  @ApiProperty({
    description: "Total transactions",
    example: 150,
  })
  total_transactions: number;

  @ApiProperty({
    description: "Successful transactions",
    example: 148,
  })
  successful_transactions: number;

  @ApiProperty({
    description: "Failed transactions",
    example: 2,
  })
  failed_transactions: number;

  @ApiProperty({
    description: "Success rate",
    example: 98.67,
  })
  success_rate: number;

  @ApiProperty({
    description: "Total gas used",
    example: "15000000",
  })
  total_gas_used: string;

  @ApiProperty({
    description: "Total gas wanted",
    example: "20000000",
  })
  total_gas_wanted: string;

  @ApiProperty({
    description: "Average gas efficiency",
    example: 0.75,
  })
  avg_gas_efficiency: number;

  @ApiProperty({
    description: "Total fees paid",
    example: [
      {
        denom: "usaf",
        amount: "420000",
      },
    ],
  })
  total_fees: any[];

  @ApiProperty({
    description: "Sent transactions count",
    example: 75,
  })
  sent_transactions: number;

  @ApiProperty({
    description: "Received transactions count",
    example: 60,
  })
  received_transactions: number;

  @ApiProperty({
    description: "Both sent and received transactions count",
    example: 15,
  })
  both_transactions: number;

  @ApiProperty({
    description: "Total amount sent",
    example: "50000000",
  })
  total_sent: string;

  @ApiProperty({
    description: "Total amount received",
    example: "30000000",
  })
  total_received: string;

  @ApiProperty({
    description: "Most common message types",
    example: [
      { type: "/cosmos.bank.v1beta1.MsgSend", count: 50 },
      { type: "/cosmos.staking.v1beta1.MsgDelegate", count: 30 },
    ],
  })
  top_message_types: Array<{ type: string; count: number }>;

  @ApiProperty({
    description: "Most active counterparties",
    example: [
      { address: "safro1xyz789abc123def456ghi789jkl012mno345pqr", count: 25 },
    ],
  })
  top_counterparties: Array<{ address: string; count: number }>;

  @ApiProperty({
    description: "Daily transaction volume",
    example: {
      "2023-01-01": 5,
      "2023-01-02": 8,
    },
  })
  daily_volume: Record<string, number>;

  @ApiProperty({
    description: "Transaction volume by type",
    example: {
      bank: 80,
      staking: 50,
      governance: 20,
    },
  })
  volume_by_type: Record<string, number>;
}
