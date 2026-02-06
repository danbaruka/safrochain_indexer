import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";
import { DateSerializer } from "../common/utils/date-serializer.util";

export class TransactionHashDto {
  @ApiProperty({
    description: "Transaction hash",
    example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
  })
  @IsString()
  @IsNotEmpty()
  hash: string;
}

export class TransactionResponseDto {
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
    example: "BLOCK123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
  })
  block_hash: string;

  @ApiProperty({
    description: "Block timestamp",
    example: "2023-12-01T10:30:00Z",
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
    example: [{ denom: "uatom", amount: "1000" }],
  })
  fee: any[];

  @ApiProperty({
    description: "Gas information",
    example: {
      wanted: 200000,
      used: 150000,
      limit: 200000,
    },
  })
  gas: any;

  @ApiProperty({
    description: "Transaction memo",
    example: "Transfer to Alice",
  })
  memo?: string;

  @ApiProperty({
    description: "Transaction messages",
    example: [
      {
        type: "cosmos.bank.v1beta1.MsgSend",
        value: {
          from_address: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
          to_address: "addr_safro1xyz789uvw012rst345mno678pqr901stu234vwx",
          amount: [{ denom: "uatom", amount: "100000" }],
        },
      },
    ],
  })
  messages: any[];

  @ApiProperty({
    description: "Transaction logs",
    example: [
      {
        msg_index: 0,
        log: "",
        events: [
          {
            type: "transfer",
            attributes: [
              {
                key: "recipient",
                value: "addr_safro1xyz789uvw012rst345mno678pqr901stu234vwx",
              },
              { key: "amount", value: "100000uatom" },
            ],
          },
        ],
      },
    ],
  })
  logs?: any[];

  @ApiProperty({
    description: "Involved addresses",
    example: [
      "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
      "addr_safro1xyz789uvw012rst345mno678pqr901stu234vwx",
    ],
  })
  involved_addresses: string[];

  @ApiProperty({
    description: "Signer information",
    example: [
      {
        public_key: {
          type: "cosmos.crypto.secp256k1.PubKey",
          value: "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6",
        },
        mode_info: { single: { mode: "SIGN_MODE_DIRECT" } },
        sequence: 1,
      },
    ],
  })
  signer_infos: any[];

  @ApiProperty({
    description: "Message count in transaction",
    example: 2,
  })
  message_count: number;

  @ApiProperty({
    description: "Unique message types in transaction",
    example: [
      "cosmos.bank.v1beta1.MsgSend",
      "cosmos.staking.v1beta1.MsgDelegate",
    ],
  })
  message_types: string[];

  @ApiProperty({
    description: "Count of involved addresses",
    example: 3,
  })
  involved_addresses_count: number;

  @ApiProperty({
    description: "Transaction categories",
    example: ["bank", "staking"],
  })
  categories: string[];
}

export class TransactionListDto {
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
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: "Filter by address",
    example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: "Filter by message type",
    example: "cosmos.bank.v1beta1.MsgSend",
    required: false,
  })
  @IsOptional()
  @IsString()
  message_type?: string;

  @ApiProperty({
    description: "Filter by success status",
    example: true,
    required: false,
  })
  @IsOptional()
  success?: boolean;
}
