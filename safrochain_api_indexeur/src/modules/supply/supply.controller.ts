import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { SupplyService } from "./supply.service";
import {
  SupplyListDto,
  SupplyResponseDto,
  SupplyStatisticsDto,
} from "../../dto/supply.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";

@ApiTags("Supply")
@Controller("supply")
export class SupplyController {
  constructor(private readonly supplyService: SupplyService) {}

  @Get()
  @ApiOperation({
    summary: "Get supply list with comprehensive filtering",
    description:
      "Retrieve paginated list of token supply with advanced filtering by denomination, amount, height, and comprehensive date filtering.",
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
    name: "denom",
    description: "Filter by denomination",
    example: "usaf",
    required: false,
  })
  @ApiQuery({
    name: "denoms",
    description: "Filter by denominations",
    example: ["usaf", "ubtc"],
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
    example: "1000000000",
    required: false,
  })
  @ApiQuery({
    name: "height_min",
    description: "Filter by minimum height",
    example: 10000,
    required: false,
  })
  @ApiQuery({
    name: "height_max",
    description: "Filter by maximum height",
    example: 20000,
    required: false,
  })
  @ApiQuery({
    name: "sort_by",
    description: "Sort by field",
    enum: ["denom", "amount", "height"],
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
    description: "Supply retrieved successfully with comprehensive filtering",
    type: PaginatedResponseDto<SupplyResponseDto>,
  })
  async getSupply(@Query() filters: SupplyListDto) {
    return await this.supplyService.getSupply(filters);
  }

  @Get("latest")
  @ApiOperation({
    summary: "Get latest supply",
    description: "Retrieve the latest token supply for all denominations.",
  })
  @ApiResponse({
    status: 200,
    description: "Latest supply retrieved successfully",
    type: [SupplyResponseDto],
  })
  async getLatestSupply() {
    return await this.supplyService.getLatestSupply();
  }

  @Get("denom/:denom")
  @ApiOperation({
    summary: "Get supply by denomination",
    description: "Retrieve supply history for a specific denomination.",
  })
  @ApiParam({
    name: "denom",
    description: "Denomination",
    example: "usaf",
    type: "string",
  })
  @ApiResponse({
    status: 200,
    description: "Supply by denomination retrieved successfully",
    type: [SupplyResponseDto],
  })
  async getSupplyByDenom(@Param("denom") denom: string) {
    return await this.supplyService.getSupplyByDenom(denom);
  }

  @Get("statistics")
  @ApiOperation({
    summary: "Get supply statistics",
    description:
      "Retrieve comprehensive statistics about token supply, distribution, and growth.",
  })
  @ApiResponse({
    status: 200,
    description: "Supply statistics retrieved successfully",
    type: SupplyStatisticsDto,
  })
  async getSupplyStatistics() {
    return await this.supplyService.getSupplyStatistics();
  }
}
