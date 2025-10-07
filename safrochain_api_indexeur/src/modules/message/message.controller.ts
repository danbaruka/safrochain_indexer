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
import { MessageService } from "./message.service";
import {
  MessageResponseDto,
  MessageListDto,
  MessageTypeInfoDto,
  MessageStatisticsDto,
} from "../../dto/message.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import { DateFilterService } from "../../common/services/date-filter.service";

@ApiTags("Message")
@Controller("message")
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly dateFilterService: DateFilterService
  ) {}

  @Get()
  @ApiOperation({
    summary: "Get messages list with comprehensive date filtering",
    description:
      "Retrieve paginated list of messages with advanced filtering by type, module, category, address, and comprehensive date filtering including relative dates, business days, seasons, fiscal periods, and more.",
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
    name: "type",
    description: "Filter by message type",
    example: "/cosmos.bank.v1beta1.MsgSend",
    required: false,
  })
  @ApiQuery({
    name: "module",
    description: "Filter by module",
    example: "bank",
    required: false,
  })
  @ApiQuery({
    name: "category",
    description: "Filter by category",
    example: "bank",
    required: false,
  })
  @ApiQuery({
    name: "address",
    description: "Filter by involved address",
    example: "cosmos1abc123def456ghi789jkl012mno345pqr678stu",
    required: false,
  })
  @ApiQuery({
    name: "types",
    description: "Filter by multiple message types",
    example: [
      "/cosmos.bank.v1beta1.MsgSend",
      "/cosmos.staking.v1beta1.MsgDelegate",
    ],
    required: false,
  })
  @ApiQuery({
    name: "modules",
    description: "Filter by multiple modules",
    example: ["bank", "staking"],
    required: false,
  })
  @ApiQuery({
    name: "height_from",
    description: "Filter by minimum height",
    example: 10000,
    required: false,
  })
  @ApiQuery({
    name: "height_to",
    description: "Filter by maximum height",
    example: 20000,
    required: false,
  })
  @ApiQuery({
    name: "denom",
    description: "Filter by denomination",
    example: "usaf",
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
      "Messages retrieved successfully with comprehensive date filtering",
  })
  async getMessages(@Query() filters: MessageListDto) {
    return await this.messageService.getMessages(filters);
  }

  @Get("types")
  @ApiOperation({
    summary: "Get message types",
    description:
      "Retrieve all available message types with their descriptions, categories, and usage statistics.",
  })
  @ApiResponse({
    status: 200,
    description: "Message types retrieved successfully",
    type: [MessageTypeInfoDto],
  })
  async getMessageTypes(): Promise<MessageTypeInfoDto[]> {
    return await this.messageService.getMessageTypes();
  }

  @Get("types/:type")
  @ApiOperation({
    summary: "Get message type information",
    description:
      "Retrieve detailed information about a specific message type including fields and usage statistics.",
  })
  @ApiParam({
    name: "type",
    description: "Message type",
    example: "/cosmos.bank.v1beta1.MsgSend",
  })
  @ApiResponse({
    status: 200,
    description: "Message type information retrieved successfully",
    type: MessageTypeInfoDto,
  })
  @ApiResponse({
    status: 404,
    description: "Message type not found",
  })
  async getMessageTypeInfo(
    @Param("type") type: string
  ): Promise<MessageTypeInfoDto | null> {
    const typeInfo = await this.messageService.getMessageTypeInfo(type);

    if (!typeInfo) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Message type ${type} not found`,
          error: "Not Found",
        },
        HttpStatus.NOT_FOUND
      );
    }

    return typeInfo;
  }

  @Get("statistics")
  @ApiOperation({
    summary: "Get message statistics",
    description:
      "Retrieve comprehensive statistics about messages including usage by type, module, category, and daily volume.",
  })
  @ApiResponse({
    status: 200,
    description: "Message statistics retrieved successfully",
    type: MessageStatisticsDto,
  })
  async getMessageStatistics(): Promise<MessageStatisticsDto> {
    return await this.messageService.getMessageStatistics();
  }

  @Get("address/:address")
  @ApiOperation({
    summary: "Get messages by address",
    description:
      "Retrieve all messages involving a specific address with pagination.",
  })
  @ApiParam({
    name: "address",
    description: "Account address",
    example: "cosmos1abc123def456ghi789jkl012mno345pqr678stu",
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
  @ApiResponse({
    status: 200,
    description: "Address messages retrieved successfully",
  })
  async getMessagesByAddress(
    @Param("address") address: string,
    @Query() pagination: { page?: number; limit?: number }
  ) {
    return await this.messageService.getMessagesByAddress(address, pagination);
  }

  @Get("type/:type")
  @ApiOperation({
    summary: "Get messages by type",
    description: "Retrieve all messages of a specific type with pagination.",
  })
  @ApiParam({
    name: "type",
    description: "Message type",
    example: "/cosmos.bank.v1beta1.MsgSend",
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
  @ApiResponse({
    status: 200,
    description: "Type messages retrieved successfully",
  })
  async getMessagesByType(
    @Param("type") type: string,
    @Query() pagination: { page?: number; limit?: number }
  ) {
    return await this.messageService.getMessagesByType(type, pagination);
  }

  @Get("search")
  @ApiOperation({
    summary: "Search messages",
    description:
      "Search messages by content, type, or involved addresses with pagination.",
  })
  @ApiQuery({
    name: "q",
    description: "Search query",
    example: "cosmos1abc123def456ghi789jkl012mno345pqr678stu",
    required: true,
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
  @ApiResponse({
    status: 200,
    description: "Search results retrieved successfully",
  })
  async searchMessages(
    @Query("q") query: string,
    @Query() pagination: { page?: number; limit?: number }
  ) {
    if (!query) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Search query is required",
          error: "Bad Request",
        },
        HttpStatus.BAD_REQUEST
      );
    }

    return await this.messageService.searchMessages(query, pagination);
  }

  @Get("modules")
  @ApiOperation({
    summary: "Get message modules",
    description:
      "Retrieve all available message modules with their usage statistics.",
  })
  @ApiResponse({
    status: 200,
    description: "Message modules retrieved successfully",
    schema: {
      type: "object",
      properties: {
        modules: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", example: "bank" },
              label: { type: "string", example: "Bank" },
              description: { type: "string", example: "Banking operations" },
              message_count: { type: "number", example: 5000 },
              message_types: { type: "number", example: 3 },
            },
          },
        },
      },
    },
  })
  async getMessageModules() {
    const types = await this.messageService.getMessageTypes();
    const stats = await this.messageService.getMessageStatistics();

    const modules = new Map<string, any>();

    types.forEach((type) => {
      if (!modules.has(type.module)) {
        modules.set(type.module, {
          name: type.module,
          label: type.module.charAt(0).toUpperCase() + type.module.slice(1),
          description: `${
            type.module.charAt(0).toUpperCase() + type.module.slice(1)
          } operations`,
          message_count: stats.modules[type.module] || 0,
          message_types: 0,
        });
      }
      modules.get(type.module).message_types++;
    });

    return {
      modules: Array.from(modules.values()),
    };
  }

  @Get("categories")
  @ApiOperation({
    summary: "Get message categories",
    description:
      "Retrieve all available message categories with their usage statistics.",
  })
  @ApiResponse({
    status: 200,
    description: "Message categories retrieved successfully",
    schema: {
      type: "object",
      properties: {
        categories: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", example: "bank" },
              label: { type: "string", example: "Bank" },
              description: { type: "string", example: "Banking operations" },
              message_count: { type: "number", example: 5000 },
              message_types: { type: "number", example: 3 },
            },
          },
        },
      },
    },
  })
  async getMessageCategories() {
    const types = await this.messageService.getMessageTypes();
    const stats = await this.messageService.getMessageStatistics();

    const categories = new Map<string, any>();

    types.forEach((type) => {
      if (!categories.has(type.category)) {
        categories.set(type.category, {
          name: type.category,
          label: type.category.charAt(0).toUpperCase() + type.category.slice(1),
          description: `${
            type.category.charAt(0).toUpperCase() + type.category.slice(1)
          } operations`,
          message_count: stats.categories[type.category] || 0,
          message_types: 0,
        });
      }
      categories.get(type.category).message_types++;
    });

    return {
      categories: Array.from(categories.values()),
    };
  }
}
