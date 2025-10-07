import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsArray,
  IsBoolean,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";
import { DateFilterDto } from "../common/dto/date-filter.dto";
import { DateSerializer } from "../common/utils/date-serializer.util";

export enum ProposalStatus {
  DEPOSIT_PERIOD = "PROPOSAL_STATUS_DEPOSIT_PERIOD",
  VOTING_PERIOD = "PROPOSAL_STATUS_VOTING_PERIOD",
  PASSED = "PROPOSAL_STATUS_PASSED",
  REJECTED = "PROPOSAL_STATUS_REJECTED",
  FAILED = "PROPOSAL_STATUS_FAILED",
}

export enum VoteOption {
  VOTE_OPTION_YES = "VOTE_OPTION_YES",
  VOTE_OPTION_ABSTAIN = "VOTE_OPTION_ABSTAIN",
  VOTE_OPTION_NO = "VOTE_OPTION_NO",
  VOTE_OPTION_NO_WITH_VETO = "VOTE_OPTION_NO_WITH_VETO",
}

export enum GovernanceSortBy {
  ID = "id",
  SUBMIT_TIME = "submit_time",
  DEPOSIT_END_TIME = "deposit_end_time",
  VOTING_START_TIME = "voting_start_time",
  VOTING_END_TIME = "voting_end_time",
}

export enum GovernanceSortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export class ProposalListDto extends DateFilterDto {
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
    description: "Filter by proposal status",
    enum: ProposalStatus,
    example: ProposalStatus.VOTING_PERIOD,
  })
  @IsOptional()
  @IsEnum(ProposalStatus)
  status?: ProposalStatus;

  @ApiPropertyOptional({
    description: "Filter by proposer address",
    example: "safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @IsOptional()
  @IsString()
  proposer?: string;

  @ApiPropertyOptional({
    description: "Search in title and description",
    example: "validator commission",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Filter by proposal IDs",
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  ids?: number[];

  @ApiPropertyOptional({
    description: "Sort by field",
    enum: GovernanceSortBy,
    example: GovernanceSortBy.SUBMIT_TIME,
  })
  @IsOptional()
  @IsEnum(GovernanceSortBy)
  sort_by?: GovernanceSortBy = GovernanceSortBy.SUBMIT_TIME;

  @ApiPropertyOptional({
    description: "Sort order",
    enum: GovernanceSortOrder,
    example: GovernanceSortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(GovernanceSortOrder)
  sort_order?: GovernanceSortOrder = GovernanceSortOrder.DESC;
}

export class ProposalResponseDto {
  @ApiProperty({
    description: "Proposal ID",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "Proposal title",
    example: "Increase Validator Commission Rate",
  })
  title: string;

  @ApiProperty({
    description: "Proposal description",
    example:
      "This proposal aims to increase the maximum validator commission rate...",
  })
  description: string;

  @ApiProperty({
    description: "Proposal metadata",
    example:
      '{"title": "Increase Validator Commission Rate", "authors": ["validator1"]}',
  })
  metadata: string;

  @ApiProperty({
    description: "Proposal content",
    example: '[{"type": "/cosmos.gov.v1beta1.TextProposal", "value": {...}}]',
  })
  content: any[];

  @ApiProperty({
    description: "Proposal submit time",
    example: "2023-12-01T10:00:00Z",
  })
  @DateSerializer()
  submit_time: Date;

  @ApiPropertyOptional({
    description: "Deposit end time",
    example: "2023-12-08T10:00:00Z",
  })
  @DateSerializer()
  deposit_end_time?: Date;

  @ApiPropertyOptional({
    description: "Voting start time",
    example: "2023-12-08T10:00:00Z",
  })
  @DateSerializer()
  voting_start_time?: Date;

  @ApiPropertyOptional({
    description: "Voting end time",
    example: "2023-12-15T10:00:00Z",
  })
  @DateSerializer()
  voting_end_time?: Date;

  @ApiProperty({
    description: "Proposer address",
    example: "safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  proposer_address: string;

  @ApiProperty({
    description: "Proposal status",
    enum: ProposalStatus,
    example: ProposalStatus.VOTING_PERIOD,
  })
  status: ProposalStatus;

  @ApiProperty({
    description: "Final tally result",
    example: {
      yes: "1000000000",
      abstain: "500000000",
      no: "200000000",
      no_with_veto: "100000000",
    },
  })
  final_tally_result?: any;

  @ApiProperty({
    description: "Total deposit amount",
    example: [
      {
        denom: "usaf",
        amount: "1000000000",
      },
    ],
  })
  total_deposit?: any[];

  @ApiProperty({
    description: "Voting start height",
    example: 12345,
  })
  voting_start_height?: number;

  @ApiProperty({
    description: "Voting end height",
    example: 12400,
  })
  voting_end_height?: number;

  @ApiProperty({
    description: "Deposit end height",
    example: 12350,
  })
  deposit_end_height?: number;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;

  @ApiProperty({
    description: "Statistics",
    example: {
      total_votes: 150,
      total_depositors: 25,
      participation_rate: 0.75,
    },
  })
  statistics?: any;
}

export class ProposalVoteDto {
  @ApiProperty({
    description: "Proposal ID",
    example: 1,
  })
  @IsInt()
  @Type(() => Number)
  id: number;
}

export class ProposalVoteListDto extends DateFilterDto {
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
    description: "Filter by proposal ID",
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  proposal_id?: number;

  @ApiPropertyOptional({
    description: "Filter by voter address",
    example: "safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @IsOptional()
  @IsString()
  voter?: string;

  @ApiPropertyOptional({
    description: "Filter by vote option",
    enum: VoteOption,
    example: VoteOption.VOTE_OPTION_YES,
  })
  @IsOptional()
  @IsEnum(VoteOption)
  option?: VoteOption;

  @ApiPropertyOptional({
    description: "Filter by voter addresses",
    example: ["safro1abc123...", "safro1def456..."],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  voters?: string[];
}

export class ProposalVoteResponseDto {
  @ApiProperty({
    description: "Proposal ID",
    example: 1,
  })
  proposal_id: number;

  @ApiProperty({
    description: "Voter address",
    example: "safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  voter_address: string;

  @ApiProperty({
    description: "Vote option",
    enum: VoteOption,
    example: VoteOption.VOTE_OPTION_YES,
  })
  option: VoteOption;

  @ApiProperty({
    description: "Vote metadata",
    example: '{"reason": "This proposal benefits the network"}',
  })
  metadata?: string;

  @ApiProperty({
    description: "Vote submit time",
    example: "2023-12-10T14:30:00Z",
  })
  @DateSerializer()
  submit_time: Date;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;
}

export class ProposalDepositDto {
  @ApiProperty({
    description: "Proposal ID",
    example: 1,
  })
  @IsInt()
  @Type(() => Number)
  id: number;
}

export class ProposalDepositListDto extends DateFilterDto {
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
    description: "Filter by proposal ID",
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  proposal_id?: number;

  @ApiPropertyOptional({
    description: "Filter by depositor address",
    example: "safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @IsOptional()
  @IsString()
  depositor?: string;

  @ApiPropertyOptional({
    description: "Filter by depositor addresses",
    example: ["safro1abc123...", "safro1def456..."],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  depositors?: string[];

  @ApiPropertyOptional({
    description: "Filter by minimum amount",
    example: "1000000",
  })
  @IsOptional()
  @IsString()
  amount_min?: string;

  @ApiPropertyOptional({
    description: "Filter by maximum amount",
    example: "10000000",
  })
  @IsOptional()
  @IsString()
  amount_max?: string;

  @ApiPropertyOptional({
    description: "Filter by denomination",
    example: "usaf",
  })
  @IsOptional()
  @IsString()
  denom?: string;
}

export class ProposalDepositResponseDto {
  @ApiProperty({
    description: "Proposal ID",
    example: 1,
  })
  proposal_id: number;

  @ApiProperty({
    description: "Depositor address",
    example: "safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  depositor_address: string;

  @ApiProperty({
    description: "Deposit amount",
    example: [
      {
        denom: "usaf",
        amount: "1000000000",
      },
    ],
  })
  amount: any[];

  @ApiProperty({
    description: "Deposit submit time",
    example: "2023-12-05T09:15:00Z",
  })
  @DateSerializer()
  submit_time: Date;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  height: number;
}

export class GovernanceStatisticsDto {
  @ApiProperty({
    description: "Total number of proposals",
    example: 25,
  })
  total_proposals: number;

  @ApiProperty({
    description: "Proposals by status",
    example: {
      DEPOSIT_PERIOD: 2,
      VOTING_PERIOD: 1,
      PASSED: 15,
      REJECTED: 5,
      FAILED: 2,
    },
  })
  proposals_by_status: Record<string, number>;

  @ApiProperty({
    description: "Total number of votes",
    example: 1250,
  })
  total_votes: number;

  @ApiProperty({
    description: "Votes by option",
    example: {
      VOTE_OPTION_YES: 800,
      VOTE_OPTION_NO: 300,
      VOTE_OPTION_ABSTAIN: 100,
      VOTE_OPTION_NO_WITH_VETO: 50,
    },
  })
  votes_by_option: Record<string, number>;

  @ApiProperty({
    description: "Total number of depositors",
    example: 150,
  })
  total_depositors: number;

  @ApiProperty({
    description: "Total deposit amount",
    example: [
      {
        denom: "usaf",
        amount: "50000000000",
      },
    ],
  })
  total_deposit_amount: any[];

  @ApiProperty({
    description: "Average participation rate",
    example: 0.75,
  })
  average_participation_rate: number;

  @ApiProperty({
    description: "Most active proposers",
    example: [
      {
        address: "safro1abc123...",
        proposal_count: 5,
      },
    ],
  })
  most_active_proposers: Array<{
    address: string;
    proposal_count: number;
  }>;

  @ApiProperty({
    description: "Most active voters",
    example: [
      {
        address: "safro1def456...",
        vote_count: 20,
      },
    ],
  })
  most_active_voters: Array<{
    address: string;
    vote_count: number;
  }>;
}
