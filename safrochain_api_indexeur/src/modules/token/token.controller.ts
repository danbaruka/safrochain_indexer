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
import { TokenService } from "./token.service";
import {
  TokenListDto,
  TokenResponseDto,
  TokenUnitListDto,
  TokenUnitResponseDto,
  TokenPriceListDto,
  TokenPriceResponseDto,
  TokenPriceHistoryListDto,
  TokenPriceHistoryResponseDto,
  TokenStatisticsDto,
} from "../../dto/token.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";

@ApiTags("Token")
@Controller("token")
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  @ApiOperation({
    summary: "Get tokens list with comprehensive filtering",
    description:
      "Retrieve paginated list of tokens with advanced filtering by name, symbol, and comprehensive date filtering.",
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
    name: "name",
    description: "Filter by token name",
    example: "Safro",
    required: false,
  })
  @ApiQuery({
    name: "names",
    description: "Filter by token names",
    example: ["Safro", "Bitcoin"],
    required: false,
  })
  @ApiQuery({
    name: "sort_by",
    description: "Sort by field",
    enum: ["name", "denom", "price", "market_cap", "last_updated"],
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
    description: "Tokens retrieved successfully with comprehensive filtering",
    type: PaginatedResponseDto<TokenResponseDto>,
  })
  async getTokens(@Query() filters: TokenListDto) {
    return await this.tokenService.getTokens(filters);
  }

  @Get(":name")
  @ApiOperation({
    summary: "Get token by name",
    description: "Retrieve detailed information about a specific token.",
  })
  @ApiParam({
    name: "name",
    description: "Token name",
    example: "Safro",
    type: "string",
  })
  @ApiResponse({
    status: 200,
    description: "Token retrieved successfully",
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Token not found",
  })
  async getTokenByName(@Param("name") name: string) {
    const token = await this.tokenService.getTokenByName(name);
    if (!token) {
      throw new HttpException("Token not found", HttpStatus.NOT_FOUND);
    }
    return token;
  }

  @Get("units")
  @ApiOperation({
    summary: "Get token units with comprehensive filtering",
    description:
      "Retrieve paginated list of token units with advanced filtering by token, denomination, and comprehensive date filtering.",
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
    name: "token_name",
    description: "Filter by token name",
    example: "Safro",
    required: false,
  })
  @ApiQuery({
    name: "denom",
    description: "Filter by denomination",
    example: "usaf",
    required: false,
  })
  @ApiQuery({
    name: "price_id",
    description: "Filter by price ID",
    example: "safro",
    required: false,
  })
  @ApiQuery({
    name: "denoms",
    description: "Filter by denominations",
    example: ["usaf", "ubtc"],
    required: false,
  })
  @ApiQuery({
    name: "exponent_min",
    description: "Filter by minimum exponent",
    example: 0,
    required: false,
  })
  @ApiQuery({
    name: "exponent_max",
    description: "Filter by maximum exponent",
    example: 18,
    required: false,
  })
  // Date filtering parameters (same as tokens)
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
    description:
      "Token units retrieved successfully with comprehensive filtering",
    type: PaginatedResponseDto<TokenUnitResponseDto>,
  })
  async getTokenUnits(@Query() filters: TokenUnitListDto) {
    return await this.tokenService.getTokenUnits(filters);
  }

  @Get("prices")
  @ApiOperation({
    summary: "Get token prices with comprehensive filtering",
    description:
      "Retrieve paginated list of token prices with advanced filtering by price ID, price range, and comprehensive date filtering.",
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
    name: "price_id",
    description: "Filter by price ID",
    example: "safro",
    required: false,
  })
  @ApiQuery({
    name: "price_ids",
    description: "Filter by price IDs",
    example: ["safro", "bitcoin"],
    required: false,
  })
  @ApiQuery({
    name: "price_min",
    description: "Filter by minimum price",
    example: 0.01,
    required: false,
  })
  @ApiQuery({
    name: "price_max",
    description: "Filter by maximum price",
    example: 100.0,
    required: false,
  })
  // Date filtering parameters (same as tokens)
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
    description:
      "Token prices retrieved successfully with comprehensive filtering",
    type: PaginatedResponseDto<TokenPriceResponseDto>,
  })
  async getTokenPrices(@Query() filters: TokenPriceListDto) {
    return await this.tokenService.getTokenPrices(filters);
  }

  @Get("prices/history")
  @ApiOperation({
    summary: "Get token price history with comprehensive filtering",
    description:
      "Retrieve paginated list of token price history with advanced filtering by price ID, price range, and comprehensive date filtering.",
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
    name: "price_id",
    description: "Filter by price ID",
    example: "safro",
    required: false,
  })
  @ApiQuery({
    name: "price_ids",
    description: "Filter by price IDs",
    example: ["safro", "bitcoin"],
    required: false,
  })
  @ApiQuery({
    name: "price_min",
    description: "Filter by minimum price",
    example: 0.01,
    required: false,
  })
  @ApiQuery({
    name: "price_max",
    description: "Filter by maximum price",
    example: 100.0,
    required: false,
  })
  @ApiQuery({
    name: "interval",
    description: "Time interval for price history",
    example: "1h",
    required: false,
  })
  // Date filtering parameters (same as tokens)
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
    description:
      "Token price history retrieved successfully with comprehensive filtering",
    type: PaginatedResponseDto<TokenPriceHistoryResponseDto>,
  })
  async getTokenPriceHistory(@Query() filters: TokenPriceHistoryListDto) {
    return await this.tokenService.getTokenPriceHistory(filters);
  }

  @Get("statistics")
  @ApiOperation({
    summary: "Get token statistics",
    description:
      "Retrieve comprehensive statistics about tokens, prices, and market data.",
  })
  @ApiResponse({
    status: 200,
    description: "Token statistics retrieved successfully",
    type: TokenStatisticsDto,
  })
  async getTokenStatistics() {
    return await this.tokenService.getTokenStatistics();
  }
}
