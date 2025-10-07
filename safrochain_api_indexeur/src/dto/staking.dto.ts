import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";

export class StakingPoolDto {
  @ApiProperty({
    description: "Bonded tokens amount",
    example: "1000000000000",
  })
  bonded_tokens: string;

  @ApiProperty({
    description: "Not bonded tokens amount",
    example: "500000000000",
  })
  not_bonded_tokens: string;

  @ApiProperty({
    description: "Unbonding tokens amount",
    example: "100000000000",
  })
  unbonding_tokens: string;

  @ApiProperty({
    description: "Staked not bonded tokens amount",
    example: "200000000000",
  })
  staked_not_bonded_tokens: string;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;
}

export class StakingParamsDto {
  @ApiProperty({
    description: "Staking parameters",
    example: {
      unbonding_time: "1814400s",
      max_validators: 100,
      max_entries: 7,
      historical_entries: 10000,
      bond_denom: "asafro",
    },
  })
  params: any;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;
}

export class DelegationDto {
  @ApiProperty({
    description: "Delegator address",
    example: "safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  delegator_address: string;

  @ApiProperty({
    description: "Validator address",
    example: "safrovaloper1xyz789abc123def456ghi789jkl012mno345pqr",
  })
  validator_address: string;

  @ApiProperty({
    description: "Delegation amount",
    example: "1000000",
  })
  amount: string;

  @ApiProperty({
    description: "Denomination",
    example: "asafro",
  })
  denom: string;

  @ApiProperty({
    description: "Transaction hash",
    example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
  })
  transaction_hash: string;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;

  @ApiProperty({
    description: "Timestamp",
    example: "2023-01-01T00:00:00Z",
  })
  timestamp: Date;
}

export class UndelegationDto {
  @ApiProperty({
    description: "Delegator address",
    example: "safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  delegator_address: string;

  @ApiProperty({
    description: "Validator address",
    example: "safrovaloper1xyz789abc123def456ghi789jkl012mno345pqr",
  })
  validator_address: string;

  @ApiProperty({
    description: "Undelegation amount",
    example: "1000000",
  })
  amount: string;

  @ApiProperty({
    description: "Denomination",
    example: "asafro",
  })
  denom: string;

  @ApiProperty({
    description: "Completion time",
    example: "2023-01-15T00:00:00Z",
  })
  completion_time: Date;

  @ApiProperty({
    description: "Transaction hash",
    example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
  })
  transaction_hash: string;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;

  @ApiProperty({
    description: "Timestamp",
    example: "2023-01-01T00:00:00Z",
  })
  timestamp: Date;
}

export class RedelegationDto {
  @ApiProperty({
    description: "Delegator address",
    example: "safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  delegator_address: string;

  @ApiProperty({
    description: "Source validator address",
    example: "safrovaloper1xyz789abc123def456ghi789jkl012mno345pqr",
  })
  validator_src_address: string;

  @ApiProperty({
    description: "Destination validator address",
    example: "safrovaloper1abc123def456ghi789jkl012mno345pqr678stu",
  })
  validator_dst_address: string;

  @ApiProperty({
    description: "Redelegation amount",
    example: "1000000",
  })
  amount: string;

  @ApiProperty({
    description: "Denomination",
    example: "asafro",
  })
  denom: string;

  @ApiProperty({
    description: "Completion time",
    example: "2023-01-15T00:00:00Z",
  })
  completion_time: Date;

  @ApiProperty({
    description: "Transaction hash",
    example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
  })
  transaction_hash: string;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;

  @ApiProperty({
    description: "Timestamp",
    example: "2023-01-01T00:00:00Z",
  })
  timestamp: Date;
}

export class WithdrawalDto {
  @ApiProperty({
    description: "Delegator address",
    example: "safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  delegator_address: string;

  @ApiProperty({
    description: "Validator address",
    example: "safrovaloper1xyz789abc123def456ghi789jkl012mno345pqr",
  })
  validator_address: string;

  @ApiProperty({
    description: "Withdrawal amount",
    example: "1000000",
  })
  amount: string;

  @ApiProperty({
    description: "Denomination",
    example: "asafro",
  })
  denom: string;

  @ApiProperty({
    description: "Transaction hash",
    example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
  })
  transaction_hash: string;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;

  @ApiProperty({
    description: "Timestamp",
    example: "2023-01-01T00:00:00Z",
  })
  timestamp: Date;
}

export class ValidatorSigningInfoDto {
  @ApiProperty({
    description: "Validator address",
    example: "safrovalcons1xyz789abc123def456ghi789jkl012mno345pqr",
  })
  validator_address: string;

  @ApiProperty({
    description: "Start height",
    example: 1,
  })
  start_height: number;

  @ApiProperty({
    description: "Index offset",
    example: 0,
  })
  index_offset: number;

  @ApiProperty({
    description: "Jailed until timestamp",
    example: "2023-01-01T00:00:00Z",
  })
  jailed_until: Date;

  @ApiProperty({
    description: "Whether validator is tombstoned",
    example: false,
  })
  tombstoned: boolean;

  @ApiProperty({
    description: "Missed blocks counter",
    example: 0,
  })
  missed_blocks_counter: number;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;
}

export class CommunityPoolDto {
  @ApiProperty({
    description: "Community pool coins",
    example: [
      {
        denom: "asafro",
        amount: "1000000000000",
      },
    ],
  })
  coins: any[];

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;
}

export class DistributionParamsDto {
  @ApiProperty({
    description: "Distribution parameters",
    example: {
      community_tax: "0.020000000000000000",
      base_proposer_reward: "0.010000000000000000",
      bonus_proposer_reward: "0.040000000000000000",
      withdraw_addr_enabled: true,
    },
  })
  params: any;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;
}

export class SlashingParamsDto {
  @ApiProperty({
    description: "Slashing parameters",
    example: {
      signed_blocks_window: "100",
      min_signed_per_window: "0.050000000000000000",
      downtime_jail_duration: "600s",
      slash_fraction_double_sign: "0.050000000000000000",
      slash_fraction_downtime: "0.000100000000000000",
    },
  })
  params: any;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;
}

export class MintParamsDto {
  @ApiProperty({
    description: "Mint parameters",
    example: {
      mint_denom: "asafro",
      inflation_rate_change: "0.130000000000000000",
      inflation_max: "0.200000000000000000",
      inflation_min: "0.070000000000000000",
      goal_bonded: "0.670000000000000000",
      blocks_per_year: "6311520",
    },
  })
  params: any;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;
}

export class InflationDto {
  @ApiProperty({
    description: "Inflation rate",
    example: "0.07",
  })
  value: number;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;
}

export class GovParamsDto {
  @ApiProperty({
    description: "Governance parameters",
    example: {
      min_deposit: [
        {
          denom: "asafro",
          amount: "10000000",
        },
      ],
      max_deposit_period: "172800s",
      voting_period: "172800s",
      quorum: "0.334000000000000000",
      threshold: "0.500000000000000000",
      veto_threshold: "0.334000000000000000",
    },
  })
  params: any;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;
}
