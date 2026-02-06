import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

export class ValidatorAddressDto {
  @ApiProperty({
    description: "Validator consensus address",
    example: "safrovalcons1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}

export class ValidatorResponseDto {
  @ApiProperty({
    description: "Validator consensus address",
    example: "safrovalcons1abc123def456ghi789jkl012mno345pqr678stu",
  })
  consensus_address: string;

  @ApiProperty({
    description: "Validator operator address",
    example: "safrovaloper1abc123def456ghi789jkl012mno345pqr678stu",
  })
  operator_address: string;

  @ApiProperty({
    description: "Validator consensus public key",
    example: "safrovalconspub1addwnpepq...",
  })
  consensus_pubkey: string;

  @ApiProperty({
    description: "Validator information",
    example: {
      self_delegate_address:
        "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
      max_change_rate: "0.01",
      max_rate: "0.20",
    },
  })
  info: any;

  @ApiProperty({
    description: "Validator description",
    example: {
      moniker: "Safrochain Validator",
      identity: "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6",
      website: "https://safrochain.com",
      details: "Professional validator with 99.9% uptime",
    },
  })
  description: any;

  @ApiProperty({
    description: "Validator commission",
    example: {
      commission: 0.05,
      min_self_delegation: 1000000,
    },
  })
  commission: any;

  @ApiProperty({
    description: "Validator voting power",
    example: {
      voting_power: 1000000000,
      height: 12345,
    },
  })
  voting_power: any;

  @ApiProperty({
    description: "Validator status",
    example: {
      status: 0,
      jailed: false,
      height: 12345,
    },
  })
  status: any;

  @ApiProperty({
    description: "Validator statistics",
    example: {
      blocks_proposed: 150,
      uptime_percentage: 99.9,
      total_delegations: "50000000000",
      self_delegation: "1000000000",
    },
  })
  statistics: any;

  @ApiProperty({
    description: "Recent activity",
    example: [
      {
        height: 12345,
        timestamp: "2023-12-01T10:30:00Z",
        type: "block_proposal",
        hash: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
      },
    ],
  })
  recent_activity: any[];
}

export class ValidatorListDto {
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
      "Filter by status (0=Bonded, 1=Unbonding, 2=Unbonded, 3=Jailed)",
    example: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @ApiProperty({
    description: "Filter by jailed status",
    example: false,
    required: false,
  })
  @IsOptional()
  jailed?: boolean;

  @ApiProperty({
    description: "Search by moniker",
    example: "Cosmos",
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
