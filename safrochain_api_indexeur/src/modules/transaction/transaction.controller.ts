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
import { TransactionService } from "./transaction.service";
import {
  TransactionHashDto,
  TransactionResponseDto,
  TransactionListDto,
} from "../../dto/transaction.dto";
import {
  TransactionFilterDto,
  TransactionSearchDto,
  TransactionStatisticsDto,
  TransactionAnalyticsDto,
} from "../../dto/transaction-filter.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";

@ApiTags("Transaction")
@Controller("transaction")
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get(":hash")
  @ApiOperation({
    summary: "Get transaction by hash",
    description:
      "Retrieve detailed information about a specific transaction including all messages, logs, and metadata.",
  })
  @ApiParam({
    name: "hash",
    description: "Transaction hash",
    example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
  })
  @ApiResponse({
    status: 200,
    description: "Transaction retrieved successfully",
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Transaction not found",
  })
  async getTransaction(
    @Param() params: TransactionHashDto
  ): Promise<TransactionResponseDto> {
    try {
      return await this.transactionService.getTransactionByHash(params.hash);
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
    summary: "Get transactions list",
    description:
      "Retrieve paginated list of transactions with optional filtering by address, message type, and success status.",
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
    name: "address",
    description: "Filter by involved address",
    example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
    required: false,
  })
  @ApiQuery({
    name: "message_type",
    description: "Filter by message type",
    example: "/cosmos.bank.v1beta1.MsgSend",
    required: false,
  })
  @ApiQuery({
    name: "success",
    description: "Filter by success status",
    example: true,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: "Transactions retrieved successfully",
  })
  async getTransactions(@Query() filters: TransactionListDto) {
    return await this.transactionService.getTransactions(filters);
  }

  @Get(":hash/messages")
  @ApiOperation({
    summary: "Get transaction messages",
    description:
      "Retrieve all messages contained within a specific transaction.",
  })
  @ApiParam({
    name: "hash",
    description: "Transaction hash",
    example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
  })
  @ApiResponse({
    status: 200,
    description: "Transaction messages retrieved successfully",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "number", example: 0 },
          type: { type: "string", example: "/cosmos.bank.v1beta1.MsgSend" },
          value: { type: "object" },
          involved_addresses: {
            type: "array",
            items: { type: "string" },
            example: ["addr_safro1abc123def456ghi789jkl012mno345pqr678stu"],
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Transaction not found",
  })
  async getTransactionMessages(@Param() params: TransactionHashDto) {
    try {
      return await this.transactionService.getTransactionMessages(params.hash);
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

  @Get(":hash/statistics")
  @ApiOperation({
    summary: "Get transaction statistics",
    description:
      "Retrieve statistical information about a specific transaction including gas efficiency, message types, and involved addresses.",
  })
  @ApiParam({
    name: "hash",
    description: "Transaction hash",
    example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
  })
  @ApiResponse({
    status: 200,
    description: "Transaction statistics retrieved successfully",
    schema: {
      type: "object",
      properties: {
        hash: {
          type: "string",
          example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
        },
        height: { type: "number", example: 12345 },
        timestamp: { type: "string", example: "2023-12-01T10:30:00Z" },
        success: { type: "boolean", example: true },
        gas_efficiency: { type: "number", example: 0.75 },
        message_count: { type: "number", example: 2 },
        message_types: {
          type: "array",
          items: { type: "string" },
          example: [
            "/cosmos.bank.v1beta1.MsgSend",
            "/cosmos.staking.v1beta1.MsgDelegate",
          ],
        },
        involved_addresses_count: { type: "number", example: 3 },
        involved_addresses: {
          type: "array",
          items: { type: "string" },
          example: ["addr_safro1abc123def456ghi789jkl012mno345pqr678stu"],
        },
        fee: {
          type: "array",
          items: {
            type: "object",
            properties: {
              denom: { type: "string", example: "uatom" },
              amount: { type: "string", example: "1000" },
            },
          },
        },
        logs_count: { type: "number", example: 1 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Transaction not found",
  })
  async getTransactionStatistics(@Param() params: TransactionHashDto) {
    try {
      return await this.transactionService.getTransactionStatistics(
        params.hash
      );
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

  // Advanced Transaction Filtering
  @Get("advanced/filter")
  @ApiOperation({
    summary: "Advanced transaction filtering",
    description:
      "Filter transactions with comprehensive parameters including gas, fees, dates, message types, and more.",
  })
  @ApiResponse({
    status: 200,
    description: "Filtered transactions retrieved successfully",
    type: PaginatedResponseDto<TransactionResponseDto>,
  })
  async getTransactionsAdvanced(
    @Query() filters: TransactionFilterDto
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    try {
      return await this.transactionService.getTransactionsAdvanced(filters);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
          error: "Internal Server Error",
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Transaction Search
  @Get("search")
  @ApiOperation({
    summary: "Search transactions",
    description: "Search transactions by hash, memo, or message content.",
  })
  @ApiResponse({
    status: 200,
    description: "Search results retrieved successfully",
    type: PaginatedResponseDto<TransactionResponseDto>,
  })
  async searchTransactions(
    @Query() search: TransactionSearchDto
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    try {
      return await this.transactionService.searchTransactions(search);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
          error: "Internal Server Error",
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Transactions by Message Type
  @Get("message-type/:messageType")
  @ApiOperation({
    summary: "Get transactions by message type",
    description:
      "Retrieve all transactions containing a specific message type.",
  })
  @ApiParam({
    name: "messageType",
    description: "Message type to filter by",
    example: "/cosmos.bank.v1beta1.MsgSend",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of results to return",
    example: 20,
  })
  @ApiQuery({
    name: "offset",
    required: false,
    description: "Number of results to skip",
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: "Transactions retrieved successfully",
    type: PaginatedResponseDto<TransactionResponseDto>,
  })
  async getTransactionsByMessageType(
    @Param("messageType") messageType: string,
    @Query("limit") limit: number = 20,
    @Query("offset") offset: number = 0
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    try {
      return await this.transactionService.getTransactionsByMessageType(
        messageType,
        limit,
        offset
      );
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
          error: "Internal Server Error",
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Transactions by Validator
  @Get("validator/:validatorAddress")
  @ApiOperation({
    summary: "Get transactions by validator",
    description:
      "Retrieve all transactions involving a specific validator address.",
  })
  @ApiParam({
    name: "validatorAddress",
    description: "Validator address to filter by",
    example: "safrovaloper1xyz789abc123def456ghi789jkl012mno345pqr",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of results to return",
    example: 20,
  })
  @ApiQuery({
    name: "offset",
    required: false,
    description: "Number of results to skip",
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: "Transactions retrieved successfully",
    type: PaginatedResponseDto<TransactionResponseDto>,
  })
  async getTransactionsByValidator(
    @Param("validatorAddress") validatorAddress: string,
    @Query("limit") limit: number = 20,
    @Query("offset") offset: number = 0
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    try {
      return await this.transactionService.getTransactionsByValidator(
        validatorAddress,
        limit,
        offset
      );
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
          error: "Internal Server Error",
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Transactions by Block Range
  @Get("block-range/:minHeight/:maxHeight")
  @ApiOperation({
    summary: "Get transactions by block range",
    description:
      "Retrieve all transactions within a specific block height range.",
  })
  @ApiParam({
    name: "minHeight",
    description: "Minimum block height",
    example: 1000,
  })
  @ApiParam({
    name: "maxHeight",
    description: "Maximum block height",
    example: 5000,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of results to return",
    example: 20,
  })
  @ApiQuery({
    name: "offset",
    required: false,
    description: "Number of results to skip",
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: "Transactions retrieved successfully",
    type: PaginatedResponseDto<TransactionResponseDto>,
  })
  async getTransactionsByBlockRange(
    @Param("minHeight") minHeight: number,
    @Param("maxHeight") maxHeight: number,
    @Query("limit") limit: number = 20,
    @Query("offset") offset: number = 0
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    try {
      return await this.transactionService.getTransactionsByBlockRange(
        minHeight,
        maxHeight,
        limit,
        offset
      );
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
          error: "Internal Server Error",
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Global Transaction Statistics
  @Get("statistics/global")
  @ApiOperation({
    summary: "Get global transaction statistics",
    description:
      "Retrieve comprehensive statistics about all transactions including success rates, gas usage, top message types, and volume data.",
  })
  @ApiResponse({
    status: 200,
    description: "Global statistics retrieved successfully",
    type: TransactionStatisticsDto,
  })
  async getGlobalTransactionStatistics(): Promise<TransactionStatisticsDto> {
    try {
      return await this.transactionService.getGlobalTransactionStatistics();
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
          error: "Internal Server Error",
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Transaction Analytics
  @Get("analytics")
  @ApiOperation({
    summary: "Get transaction analytics",
    description:
      "Retrieve detailed analytics including volume over time, gas efficiency, fee analysis, and message type distribution.",
  })
  @ApiResponse({
    status: 200,
    description: "Analytics retrieved successfully",
    type: TransactionAnalyticsDto,
  })
  async getTransactionAnalytics(): Promise<TransactionAnalyticsDto> {
    try {
      return await this.transactionService.getTransactionAnalytics();
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
          error: "Internal Server Error",
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
