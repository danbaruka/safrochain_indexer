import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { GovernanceService } from "./governance.service";
import {
  ProposalListDto,
  ProposalResponseDto,
  ProposalVoteDto,
  ProposalVoteListDto,
  ProposalVoteResponseDto,
  ProposalDepositDto,
  ProposalDepositListDto,
  ProposalDepositResponseDto,
  GovernanceStatisticsDto,
} from "../../dto/governance.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";

@ApiTags("Governance")
@Controller("governance")
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Get("proposals")
  @ApiOperation({
    summary: "Get proposals list with comprehensive filtering",
    description:
      "Retrieve paginated list of governance proposals with advanced filtering by status, proposer, search terms, and comprehensive date filtering.",
  })
  @ApiQuery({
    name: "page",
    description: "Page number",
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: "limit",
    description: "Number of items per page",
    example: 20,
    required: false,
  })
  @ApiQuery({
    name: "status",
    description: "Filter by proposal status",
    enum: [
      "PROPOSAL_STATUS_DEPOSIT_PERIOD",
      "PROPOSAL_STATUS_VOTING_PERIOD",
      "PROPOSAL_STATUS_PASSED",
      "PROPOSAL_STATUS_REJECTED",
      "PROPOSAL_STATUS_FAILED",
    ],
    required: false,
  })
  @ApiQuery({
    name: "proposer",
    description: "Filter by proposer address",
    example: "safro1abc123def456ghi789jkl012mno345pqr678stu",
    required: false,
  })
  @ApiQuery({
    name: "search",
    description: "Search in title and description",
    example: "validator commission",
    required: false,
  })
  @ApiQuery({
    name: "ids",
    description: "Filter by proposal IDs",
    example: [1, 2, 3],
    required: false,
  })
  @ApiQuery({
    name: "sort_by",
    description: "Sort by field",
    enum: [
      "id",
      "submit_time",
      "deposit_end_time",
      "voting_start_time",
      "voting_end_time",
    ],
    required: false,
  })
  @ApiQuery({
    name: "sort_order",
    description: "Sort order",
    enum: ["ASC", "DESC"],
    required: false,
  })
  // Date filtering parameters
  @ApiQuery({
    name: "date_from",
    description: "Filter records from this date (ISO 8601 format)",
    required: false,
    example: "2023-01-01T00:00:00Z",
  })
  @ApiQuery({
    name: "date_to",
    description: "Filter records until this date (ISO 8601 format)",
    required: false,
    example: "2023-12-31T23:59:59Z",
  })
  @ApiQuery({
    name: "date_exact",
    description: "Filter by exact date (ISO 8601 format)",
    required: false,
    example: "2023-06-15T12:00:00Z",
  })
  @ApiQuery({
    name: "year",
    description: "Filter by specific year",
    required: false,
    example: 2023,
  })
  @ApiQuery({
    name: "month",
    description: "Filter by specific month (1-12)",
    required: false,
    example: 6,
  })
  @ApiQuery({
    name: "day",
    description: "Filter by specific day of month (1-31)",
    required: false,
    example: 15,
  })
  @ApiQuery({
    name: "day_of_week",
    description: "Filter by specific day of week (0-6, Sunday=0)",
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: "hour",
    description: "Filter by specific hour (0-23)",
    required: false,
    example: 14,
  })
  @ApiQuery({
    name: "minute",
    description: "Filter by specific minute (0-59)",
    required: false,
    example: 30,
  })
  @ApiQuery({
    name: "second",
    description: "Filter by specific second (0-59)",
    required: false,
    example: 45,
  })
  @ApiQuery({
    name: "time_from",
    description: "Filter by time range - start time (HH:MM:SS format)",
    required: false,
    example: "09:00:00",
  })
  @ApiQuery({
    name: "time_to",
    description: "Filter by time range - end time (HH:MM:SS format)",
    required: false,
    example: "17:00:00",
  })
  @ApiQuery({
    name: "relative_value",
    description: "Filter records from N units ago (relative date)",
    required: false,
    example: 7,
  })
  @ApiQuery({
    name: "relative_unit",
    description: "Unit for relative date filtering",
    enum: ["days", "weeks", "months", "years"],
    required: false,
    example: "days",
  })
  @ApiQuery({
    name: "date_range_type",
    description: "Filter by date range type",
    enum: ["range", "exact", "relative"],
    required: false,
    example: "range",
  })
  @ApiQuery({
    name: "date_pattern",
    description: "Filter by specific date patterns (YYYY-MM-DD format)",
    required: false,
    example: "2023-06-15",
  })
  @ApiQuery({
    name: "date_format",
    description: "Filter by date format (ISO, Unix timestamp, etc.)",
    required: false,
    example: "ISO",
  })
  @ApiQuery({
    name: "timezone",
    description: "Filter by timezone (IANA timezone identifier)",
    required: false,
    example: "UTC",
  })
  @ApiQuery({
    name: "weekday_only",
    description: "Filter for weekdays only (Monday-Friday)",
    required: false,
    example: false,
  })
  @ApiQuery({
    name: "weekend_only",
    description: "Filter for weekends only (Saturday-Sunday)",
    required: false,
    example: false,
  })
  @ApiQuery({
    name: "business_days_only",
    description: "Filter for business days only",
    required: false,
    example: false,
  })
  @ApiQuery({
    name: "quarter",
    description: "Filter by quarter (1-4)",
    required: false,
    example: 2,
  })
  @ApiQuery({
    name: "season",
    description: "Filter by season",
    enum: ["spring", "summer", "autumn", "winter"],
    required: false,
    example: "summer",
  })
  @ApiQuery({
    name: "fiscal_year",
    description: "Filter by fiscal year",
    required: false,
    example: 2023,
  })
  @ApiQuery({
    name: "fiscal_quarter",
    description: "Filter by fiscal quarter (1-4)",
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: "leap_years_only",
    description: "Filter for leap years only",
    required: false,
    example: false,
  })
  @ApiQuery({
    name: "date_range_start",
    description: "Start of custom date range (ISO 8601 format)",
    required: false,
    example: "2023-01-01T00:00:00Z",
  })
  @ApiQuery({
    name: "date_range_end",
    description: "End of custom date range (ISO 8601 format)",
    required: false,
    example: "2023-12-31T23:59:59Z",
  })
  @ApiQuery({
    name: "date_range_label",
    description: "Label for custom date range",
    required: false,
    example: "Q1 2023",
  })
  @ApiResponse({
    status: 200,
    description:
      "Proposals retrieved successfully with comprehensive filtering",
    type: PaginatedResponseDto<ProposalResponseDto>,
  })
  async getProposals(@Query() filters: ProposalListDto) {
    return await this.governanceService.getProposals(filters);
  }

  @Get("proposals/:id")
  @ApiOperation({
    summary: "Get proposal by ID",
    description:
      "Retrieve detailed information about a specific governance proposal.",
  })
  @ApiParam({
    name: "id",
    description: "Proposal ID",
    example: 1,
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Proposal retrieved successfully",
    type: ProposalResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Proposal not found",
  })
  async getProposalById(@Param() params: ProposalVoteDto) {
    const proposal = await this.governanceService.getProposalById(params.id);
    if (!proposal) {
      throw new HttpException("Proposal not found", HttpStatus.NOT_FOUND);
    }
    return proposal;
  }

  @Get("votes")
  @ApiOperation({
    summary: "Get proposal votes with comprehensive filtering",
    description:
      "Retrieve paginated list of proposal votes with advanced filtering by proposal, voter, option, and comprehensive date filtering.",
  })
  @ApiQuery({
    name: "page",
    description: "Page number",
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: "limit",
    description: "Number of items per page",
    example: 20,
    required: false,
  })
  @ApiQuery({
    name: "proposal_id",
    description: "Filter by proposal ID",
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: "voter",
    description: "Filter by voter address",
    example: "safro1abc123def456ghi789jkl012mno345pqr678stu",
    required: false,
  })
  @ApiQuery({
    name: "option",
    description: "Filter by vote option",
    enum: [
      "VOTE_OPTION_YES",
      "VOTE_OPTION_ABSTAIN",
      "VOTE_OPTION_NO",
      "VOTE_OPTION_NO_WITH_VETO",
    ],
    required: false,
  })
  @ApiQuery({
    name: "voters",
    description: "Filter by voter addresses",
    example: ["safro1abc123...", "safro1def456..."],
    required: false,
  })
  // Date filtering parameters (same as proposals)
  @ApiQuery({
    name: "date_from",
    description: "Filter records from this date (ISO 8601 format)",
    required: false,
    example: "2023-01-01T00:00:00Z",
  })
  @ApiQuery({
    name: "date_to",
    description: "Filter records until this date (ISO 8601 format)",
    required: false,
    example: "2023-12-31T23:59:59Z",
  })
  @ApiResponse({
    status: 200,
    description: "Votes retrieved successfully with comprehensive filtering",
    type: PaginatedResponseDto<ProposalVoteResponseDto>,
  })
  async getProposalVotes(@Query() filters: ProposalVoteListDto) {
    return await this.governanceService.getProposalVotes(filters);
  }

  @Get("deposits")
  @ApiOperation({
    summary: "Get proposal deposits with comprehensive filtering",
    description:
      "Retrieve paginated list of proposal deposits with advanced filtering by proposal, depositor, amount, and comprehensive date filtering.",
  })
  @ApiQuery({
    name: "page",
    description: "Page number",
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: "limit",
    description: "Number of items per page",
    example: 20,
    required: false,
  })
  @ApiQuery({
    name: "proposal_id",
    description: "Filter by proposal ID",
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: "depositor",
    description: "Filter by depositor address",
    example: "safro1abc123def456ghi789jkl012mno345pqr678stu",
    required: false,
  })
  @ApiQuery({
    name: "depositors",
    description: "Filter by depositor addresses",
    example: ["safro1abc123...", "safro1def456..."],
    required: false,
  })
  @ApiQuery({
    name: "amount_min",
    description: "Filter by minimum amount",
    example: "1000000",
    required: false,
  })
  @ApiQuery({
    name: "amount_max",
    description: "Filter by maximum amount",
    example: "10000000",
    required: false,
  })
  @ApiQuery({
    name: "denom",
    description: "Filter by denomination",
    example: "usaf",
    required: false,
  })
  // Date filtering parameters (same as proposals)
  @ApiQuery({
    name: "date_from",
    description: "Filter records from this date (ISO 8601 format)",
    required: false,
    example: "2023-01-01T00:00:00Z",
  })
  @ApiQuery({
    name: "date_to",
    description: "Filter records until this date (ISO 8601 format)",
    required: false,
    example: "2023-12-31T23:59:59Z",
  })
  @ApiResponse({
    status: 200,
    description: "Deposits retrieved successfully with comprehensive filtering",
    type: PaginatedResponseDto<ProposalDepositResponseDto>,
  })
  async getProposalDeposits(@Query() filters: ProposalDepositListDto) {
    return await this.governanceService.getProposalDeposits(filters);
  }

  @Get("statistics")
  @ApiOperation({
    summary: "Get governance statistics",
    description:
      "Retrieve comprehensive statistics about governance proposals, votes, and deposits.",
  })
  @ApiResponse({
    status: 200,
    description: "Governance statistics retrieved successfully",
    type: GovernanceStatisticsDto,
  })
  async getGovernanceStatistics() {
    return await this.governanceService.getGovernanceStatistics();
  }
}
