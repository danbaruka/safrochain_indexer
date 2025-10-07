import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";
import { MessageCategory } from "../common/types/message.type";
import { DateFilterDto } from "../common/dto/date-filter.dto";

export class MessageTypeDto {
  @ApiProperty({
    description: "Message type",
    example: "/cosmos.bank.v1beta1.MsgSend",
  })
  @IsString()
  @IsNotEmpty()
  type: string;
}

export class MessageResponseDto {
  @ApiProperty({
    description: "Transaction hash",
    example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
  })
  transaction_hash: string;

  @ApiProperty({
    description: "Message index in transaction",
    example: 0,
  })
  index: number;

  @ApiProperty({
    description: "Message type",
    example: "/cosmos.bank.v1beta1.MsgSend",
  })
  type: string;

  @ApiProperty({
    description: "Module name",
    example: "bank",
  })
  module: string;

  @ApiProperty({
    description: "Human-readable label",
    example: "Send",
  })
  label: string;

  @ApiProperty({
    description: "Message description",
    example: "Send coins from one account to another",
  })
  description: string;

  @ApiProperty({
    description: "Message category",
    example: "bank",
    enum: MessageCategory,
  })
  category: MessageCategory;

  @ApiProperty({
    description: "Message value (JSON)",
    example: {
      from_address: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
      to_address: "addr_safro1xyz789uvw012rst345mno678pqr901stu234vwx",
      amount: [{ denom: "usaf", amount: "100000" }],
    },
  })
  value: any;

  @ApiProperty({
    description: "Parsed amount information",
    example: [{ denom: "usaf", amount: "100000" }],
  })
  amount?: any[];

  @ApiProperty({
    description: "Array of involved account addresses",
    example: [
      "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
      "addr_safro1xyz789uvw012rst345mno678pqr901stu234vwx",
    ],
  })
  involved_addresses: string[];

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;

  @ApiProperty({
    description: "Partition ID for database partitioning",
    example: 0,
  })
  partition_id: number;
}

export class MessageListDto extends DateFilterDto {
  @ApiProperty({
    description: "Page number",
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: "Number of items per page",
    example: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({
    description: "Filter by message type",
    example: "/cosmos.bank.v1beta1.MsgSend",
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: "Filter by module",
    example: "bank",
    required: false,
  })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiProperty({
    description: "Filter by category",
    example: "bank",
    enum: MessageCategory,
    required: false,
  })
  @IsOptional()
  @IsEnum(MessageCategory)
  category?: MessageCategory;

  @ApiProperty({
    description: "Filter by involved address",
    example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: "Filter by multiple message types",
    example: [
      "/cosmos.bank.v1beta1.MsgSend",
      "/cosmos.staking.v1beta1.MsgDelegate",
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  types?: string[];

  @ApiProperty({
    description: "Filter by multiple modules",
    example: ["bank", "staking"],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modules?: string[];

  @ApiProperty({
    description: "Filter by minimum height",
    example: 10000,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  height_from?: number;

  @ApiProperty({
    description: "Filter by maximum height",
    example: 20000,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  height_to?: number;

  @ApiProperty({
    description: "Filter by denomination",
    example: "usaf",
    required: false,
  })
  @IsOptional()
  @IsString()
  denom?: string;

  @ApiProperty({
    description: "Filter by minimum amount",
    example: "1000000",
    required: false,
  })
  @IsOptional()
  @IsString()
  amount_min?: string;

  @ApiProperty({
    description: "Filter by maximum amount",
    example: "10000000",
    required: false,
  })
  @IsOptional()
  @IsString()
  amount_max?: string;
}

export class MessageTypeInfoDto {
  @ApiProperty({
    description: "Message type identifier",
    example: "/cosmos.bank.v1beta1.MsgSend",
  })
  type: string;

  @ApiProperty({
    description: "Module name",
    example: "bank",
  })
  module: string;

  @ApiProperty({
    description: "Human-readable label",
    example: "Send",
  })
  label: string;

  @ApiProperty({
    description: "Message description",
    example: "Send coins from one account to another",
  })
  description: string;

  @ApiProperty({
    description: "Message category",
    example: "bank",
    enum: MessageCategory,
  })
  category: MessageCategory;

  @ApiProperty({
    description: "Message fields",
    example: [
      {
        name: "from_address",
        type: "string",
        description: "Sender address",
        required: true,
      },
      {
        name: "to_address",
        type: "string",
        description: "Recipient address",
        required: true,
      },
    ],
  })
  fields: any[];

  @ApiProperty({
    description: "Number of times this message type has been used",
    example: 1500,
  })
  usage_count: number;
}

export class MessageStatisticsDto {
  @ApiProperty({
    description: "Total number of messages",
    example: 15000,
  })
  total_messages: number;

  @ApiProperty({
    description: "Number of unique message types",
    example: 25,
  })
  unique_types: number;

  @ApiProperty({
    description: "Most common message type",
    example: "/cosmos.bank.v1beta1.MsgSend",
  })
  most_common_type: string;

  @ApiProperty({
    description: "Count of most common message type",
    example: 5000,
  })
  most_common_type_count: number;

  @ApiProperty({
    description: "Message count by module",
    example: {
      bank: 8000,
      staking: 4000,
      governance: 2000,
      distribution: 1000,
    },
  })
  modules: { [module: string]: number };

  @ApiProperty({
    description: "Message count by category",
    example: {
      bank: 8000,
      staking: 4000,
      governance: 2000,
      distribution: 1000,
    },
  })
  categories: { [category: string]: number };

  @ApiProperty({
    description: "Daily message volume",
    example: {
      "2023-12-01": 150,
      "2023-12-02": 200,
      "2023-12-03": 175,
    },
  })
  daily_volume: { [date: string]: number };

  @ApiProperty({
    description: "Top addresses by message count",
    example: [
      {
        address: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
        count: 500,
      },
      {
        address: "addr_safro1xyz789uvw012rst345mno678pqr901stu234vwx",
        count: 300,
      },
    ],
  })
  top_addresses: { address: string; count: number }[];
}
