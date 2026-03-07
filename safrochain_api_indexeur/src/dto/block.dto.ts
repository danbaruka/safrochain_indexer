import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";
import { DateFilterDto } from "../common/dto/date-filter.dto";
import { DateSerializer } from "../common/utils/date-serializer.util";

export class BlockHeightDto {
  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  @IsString()
  @IsNotEmpty()
  height: string;
}

export class BlockHashDto {
  @ApiProperty({
    description: "Block hash",
    example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
  })
  @IsString()
  @IsNotEmpty()
  hash: string;
}

export class BlockResponseDto {
  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;

  @ApiProperty({
    description: "Block hash",
    example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
  })
  hash: string;

  @ApiProperty({
    description: "Number of transactions in the block",
    example: 150,
  })
  num_txs: number;

  @ApiProperty({
    description: "Total gas used in the block",
    example: 50000000,
  })
  total_gas: number;

  @ApiProperty({
    description: "Block proposer address",
    example: "safrovalcons1abc123def456ghi789jkl012mno345pqr678stu",
  })
  proposer_address: string;

  @ApiProperty({
    description: "Block timestamp",
    example: "2023-12-01T10:30:00Z",
  })
  @DateSerializer()
  timestamp: Date;

  @ApiProperty({
    description: "Block proposer information",
    example: {
      consensus_address:
        "safrovalcons1abc123def456ghi789jkl012mno345pqr678stu",
      operator_address: "safrovaloper1abc123def456ghi789jkl012mno345pqr678stu",
      moniker: "Safrochain Validator",
    },
  })
  proposer: any;

  @ApiProperty({
    description: "Block statistics",
    example: {
      total_fees: [{ denom: "uatom", amount: "15000" }],
      average_gas_per_tx: 333333,
      success_rate: 0.98,
    },
  })
  statistics: any;

  @ApiProperty({
    description: "Recent transactions in the block",
    example: [
      {
        hash: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
        success: true,
        gas_used: 150000,
        messages: ["cosmos.bank.v1beta1.MsgSend"],
      },
    ],
  })
  transactions: any[];
}

export class BlockListDto extends DateFilterDto {
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
    description:
      "Cursor for pagination (block height). Use next_cursor from previous response.",
    example: 12345,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cursor?: number;

  @ApiProperty({
    description: "Filter by proposer address",
    example: "safrovalcons1abc123def456ghi789jkl012mno345pqr678stu",
    required: false,
  })
  @IsOptional()
  @IsString()
  proposer?: string;

  @ApiProperty({
    description: "Minimum number of transactions",
    example: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  min_txs?: number;

  @ApiProperty({
    description: "Maximum number of transactions",
    example: 200,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  max_txs?: number;
}
