import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class AddressDto {
  @ApiProperty({
    description: "Account address",
    example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}

export class AddressResponseDto {
  @ApiProperty({
    description: "Account address",
    example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  address: string;

  @ApiProperty({
    description: "Account type",
    example: "BaseAccount",
  })
  type: string;

  @ApiProperty({
    description: "Account balance",
    example: [{ denom: "uatom", amount: "1000000" }],
  })
  balance: any[];

  @ApiProperty({
    description: "Vesting information",
    example: {
      type: "DelayedVestingAccount",
      original_vesting: [{ denom: "uatom", amount: "500000" }],
      end_time: "2024-12-31T23:59:59Z",
    },
  })
  vesting?: any;

  @ApiProperty({
    description: "Account statistics",
    example: {
      total_transactions: 150,
      total_sent: "5000000",
      total_received: "7500000",
      first_transaction: "2023-01-01T00:00:00Z",
      last_transaction: "2023-12-01T10:30:00Z",
    },
  })
  statistics: any;

  @ApiProperty({
    description: "Recent transactions",
    example: [
      {
        hash: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
        height: 12345,
        timestamp: "2023-12-01T10:30:00Z",
        type: "send",
        amount: [{ denom: "uatom", amount: "100000" }],
      },
    ],
  })
  recent_transactions: any[];

  @ApiProperty({
    description: "Governance participation",
    example: {
      proposals_voted: 5,
      proposals_proposed: 1,
      total_deposits: [{ denom: "uatom", amount: "1000000" }],
    },
  })
  governance?: any;
}
