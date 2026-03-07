import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseInterceptors,
} from "@nestjs/common";
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { BlockService } from "./block.service";
import {
  BlockHeightDto,
  BlockHashDto,
  BlockResponseDto,
  BlockListDto,
} from "../../dto/block.dto";
import { DateFilterService } from "../../common/services/date-filter.service";

@ApiTags("Block")
@Controller("block")
export class BlockController {
  constructor(
    private readonly blockService: BlockService,
    private readonly dateFilterService: DateFilterService
  ) {}

  @Get("height/:height")
  @ApiOperation({
    summary: "Get block by height",
    description:
      "Retrieve detailed information about a specific block including proposer, transactions, and statistics.",
  })
  @ApiParam({
    name: "height",
    description: "Block height",
    example: "12345",
  })
  @ApiResponse({
    status: 200,
    description: "Block retrieved successfully",
    type: BlockResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Block not found",
  })
  async getBlockByHeight(
    @Param() params: BlockHeightDto
  ): Promise<BlockResponseDto> {
    try {
      return await this.blockService.getBlockByHeight(params.height);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
          error: "Not Found",
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Get("hash/:hash")
  @ApiOperation({
    summary: "Get block by hash",
    description:
      "Retrieve detailed information about a specific block using its hash.",
  })
  @ApiParam({
    name: "hash",
    description: "Block hash",
    example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
  })
  @ApiResponse({
    status: 200,
    description: "Block retrieved successfully",
    type: BlockResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Block not found",
  })
  async getBlockByHash(
    @Param() params: BlockHashDto
  ): Promise<BlockResponseDto> {
    try {
      return await this.blockService.getBlockByHash(params.hash);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
          error: "Not Found",
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: "Get blocks list with comprehensive date filtering",
    description:
      "Retrieve paginated list of blocks with comprehensive date filtering including relative dates, business days, seasons, fiscal periods, and more.",
  })
  @ApiQuery({
    name: "page",
    description: "Page number",
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: "limit",
    description: "Number of items per page (1-100, default 20)",
    example: 20,
    required: false,
  })
  @ApiQuery({
    name: "cursor",
    description:
      "Cursor for pagination (block height). Use next_cursor from previous response.",
    example: 12345,
    required: false,
  })
  @ApiQuery({
    name: "proposer",
    description: "Filter by proposer address",
    example: "safrovalcons1abc123def456ghi789jkl012mno345pqr678stu",
    required: false,
  })
  @ApiQuery({
    name: "min_txs",
    description: "Minimum number of transactions",
    example: 100,
    required: false,
  })
  @ApiQuery({
    name: "max_txs",
    description: "Maximum number of transactions",
    example: 200,
    required: false,
  })
  // Add comprehensive date filtering query parameters
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
    required: false,
    example: "days",
    enum: ["minutes", "hours", "days", "weeks", "months", "years"],
  })
  @ApiQuery({
    name: "business_days_only",
    description: "Filter by business days only (exclude weekends)",
    required: false,
    example: false,
  })
  @ApiQuery({
    name: "weekdays",
    description: "Filter by specific weekdays (comma-separated: 0-6)",
    required: false,
    example: "1,2,3,4,5",
  })
  @ApiQuery({
    name: "months",
    description: "Filter by specific months (comma-separated: 1-12)",
    required: false,
    example: "1,2,3,4,5,6,7,8,9,10,11,12",
  })
  @ApiQuery({
    name: "years",
    description: "Filter by specific years (comma-separated)",
    required: false,
    example: "2022,2023,2024",
  })
  @ApiQuery({
    name: "quarters",
    description: "Filter by specific quarters (1-4)",
    required: false,
    example: "1,2,3,4",
  })
  @ApiQuery({
    name: "season",
    description: "Filter by seasonal patterns (spring, summer, fall, winter)",
    required: false,
    example: "summer",
  })
  @ApiQuery({
    name: "fiscal_year",
    description: "Filter by fiscal year (if applicable)",
    required: false,
    example: 2023,
  })
  @ApiQuery({
    name: "fiscal_quarter",
    description: "Filter by fiscal quarter (1-4)",
    required: false,
    example: 2,
  })
  @ApiQuery({
    name: "leap_years_only",
    description: "Filter by leap years only",
    required: false,
    example: false,
  })
  @ApiQuery({
    name: "custom_ranges",
    description: "Filter by specific date ranges (custom ranges)",
    required: false,
    example: "2023-01-01,2023-03-31,2023-07-01,2023-09-30",
  })
  @ApiQuery({
    name: "date_offset",
    description: "Filter by date offset (days to add/subtract)",
    required: false,
    example: "-30",
  })
  @ApiQuery({
    name: "valid_dates_only",
    description: "Filter by date validation (valid dates only)",
    required: false,
    example: true,
  })
  @ApiResponse({
    status: 200,
    description:
      "Blocks retrieved successfully with comprehensive date filtering",
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(120)
  async getBlocks(@Query() filters: BlockListDto) {
    return await this.blockService.getBlocks(filters);
  }
}
