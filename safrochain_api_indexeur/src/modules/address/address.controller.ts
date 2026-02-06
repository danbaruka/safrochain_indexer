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
import { AddressService } from "./address.service";
import { AddressDto, AddressResponseDto } from "../../dto/address.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import {
  AddressTransactionFilterDto,
  AddressTransactionResponseDto,
  AddressTransactionStatisticsDto,
} from "../../dto/address-transaction-filter.dto";

@ApiTags("Address")
@Controller("address")
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get(":address")
  @ApiOperation({
    summary: "Get comprehensive address information",
    description:
      "Retrieve detailed information about a specific address including balance, vesting, transactions, and governance participation.",
  })
  @ApiParam({
    name: "address",
    description: "Account address",
    example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @ApiResponse({
    status: 200,
    description: "Address information retrieved successfully",
    type: AddressResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Address not found",
  })
  async getAddressInfo(
    @Param() params: AddressDto
  ): Promise<AddressResponseDto> {
    try {
      return await this.addressService.getAddressInfo(params.address);
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

  @Get(":address/transactions")
  @ApiOperation({
    summary: "Get address transactions",
    description:
      "Retrieve paginated list of transactions for a specific address with detailed information.",
  })
  @ApiParam({
    name: "address",
    description: "Account address",
    example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
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
    description: "Address transactions retrieved successfully",
    type: PaginatedResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Address not found",
  })
  async getAddressTransactions(
    @Param() params: AddressDto,
    @Query() pagination: PaginationDto
  ): Promise<PaginatedResponseDto<any>> {
    try {
      return await this.addressService.getAddressTransactions(
        params.address,
        pagination
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

  @Get(":address/balance")
  @ApiOperation({
    summary: "Get address balance",
    description: "Retrieve current balance for a specific address.",
  })
  @ApiParam({
    name: "address",
    description: "Account address",
    example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @ApiResponse({
    status: 200,
    description: "Address balance retrieved successfully",
    schema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
        },
        balance: {
          type: "array",
          items: {
            type: "object",
            properties: {
              denom: { type: "string", example: "uatom" },
              amount: { type: "string", example: "1000000" },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Address not found",
  })
  async getAddressBalance(@Param() params: AddressDto) {
    try {
      const addressInfo = await this.addressService.getAddressInfo(
        params.address
      );
      return {
        address: addressInfo.address,
        balance: addressInfo.balance,
      };
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

  @Get(":address/vesting")
  @ApiOperation({
    summary: "Get address vesting information",
    description:
      "Retrieve vesting account information if the address is a vesting account.",
  })
  @ApiParam({
    name: "address",
    description: "Account address",
    example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @ApiResponse({
    status: 200,
    description: "Vesting information retrieved successfully",
    schema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
        },
        vesting: {
          type: "object",
          properties: {
            type: { type: "string", example: "DelayedVestingAccount" },
            original_vesting: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  denom: { type: "string", example: "uatom" },
                  amount: { type: "string", example: "1000000" },
                },
              },
            },
            end_time: { type: "string", example: "2024-12-31T23:59:59Z" },
            start_time: { type: "string", example: "2023-01-01T00:00:00Z" },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Address not found",
  })
  async getAddressVesting(@Param() params: AddressDto) {
    try {
      const addressInfo = await this.addressService.getAddressInfo(
        params.address
      );
      return {
        address: addressInfo.address,
        vesting: addressInfo.vesting,
      };
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

  @Get(":address/governance")
  @ApiOperation({
    summary: "Get address governance participation",
    description:
      "Retrieve governance participation statistics for a specific address.",
  })
  @ApiParam({
    name: "address",
    description: "Account address",
    example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @ApiResponse({
    status: 200,
    description: "Governance participation retrieved successfully",
    schema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
        },
        governance: {
          type: "object",
          properties: {
            proposals_voted: { type: "number", example: 5 },
            proposals_proposed: { type: "number", example: 1 },
            total_deposits: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  denom: { type: "string", example: "uatom" },
                  amount: { type: "string", example: "1000000" },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Address not found",
  })
  async getAddressGovernance(@Param() params: AddressDto) {
    try {
      const addressInfo = await this.addressService.getAddressInfo(
        params.address
      );
      return {
        address: addressInfo.address,
        governance: addressInfo.governance,
      };
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

  @Get(":address/transactions/advanced")
  @ApiOperation({
    summary: "Get address transactions with advanced filtering",
    description:
      "Retrieve paginated list of transactions for a specific address with comprehensive filtering options including success status, gas usage, message types, direction, amounts, dates, and search functionality.",
  })
  @ApiParam({
    name: "address",
    description: "Account address",
    example: "safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @ApiQuery({
    name: "success",
    description: "Filter by transaction success status",
    required: false,
    example: true,
  })
  @ApiQuery({
    name: "min_height",
    description: "Filter by minimum block height",
    required: false,
    example: 1000,
  })
  @ApiQuery({
    name: "max_height",
    description: "Filter by maximum block height",
    required: false,
    example: 5000,
  })
  @ApiQuery({
    name: "min_gas_used",
    description: "Filter by minimum gas used",
    required: false,
    example: 10000,
  })
  @ApiQuery({
    name: "max_gas_used",
    description: "Filter by maximum gas used",
    required: false,
    example: 100000,
  })
  @ApiQuery({
    name: "min_gas_wanted",
    description: "Filter by minimum gas wanted",
    required: false,
    example: 10000,
  })
  @ApiQuery({
    name: "max_gas_wanted",
    description: "Filter by maximum gas wanted",
    required: false,
    example: 100000,
  })
  @ApiQuery({
    name: "memo",
    description: "Filter by memo content (partial match)",
    required: false,
    example: "test",
  })
  @ApiQuery({
    name: "message_types",
    description: "Filter by message types",
    required: false,
    example: ["cosmos.bank.v1beta1.MsgSend"],
    type: [String],
  })
  @ApiQuery({
    name: "modules",
    description: "Filter by message modules",
    required: false,
    example: ["bank", "staking"],
    type: [String],
  })
  @ApiQuery({
    name: "direction",
    description: "Filter by transaction direction",
    required: false,
    example: "sent",
    enum: ["sent", "received", "both"],
  })
  @ApiQuery({
    name: "min_amount",
    description: "Filter by minimum amount transferred",
    required: false,
    example: "1000000",
  })
  @ApiQuery({
    name: "max_amount",
    description: "Filter by maximum amount transferred",
    required: false,
    example: "10000000",
  })
  @ApiQuery({
    name: "denom",
    description: "Filter by denomination",
    required: false,
    example: "usaf",
  })
  @ApiQuery({
    name: "date_from",
    description: "Filter transactions from this date",
    required: false,
    example: "2023-01-01T00:00:00Z",
  })
  @ApiQuery({
    name: "date_to",
    description: "Filter transactions until this date",
    required: false,
    example: "2023-12-31T23:59:59Z",
  })
  @ApiQuery({
    name: "search",
    description: "Search in transaction hash, memo, or message content",
    required: false,
    example: "proposal",
  })
  @ApiQuery({
    name: "sender_only",
    description: "Include only transactions where address is the sender",
    required: false,
    example: false,
  })
  @ApiQuery({
    name: "receiver_only",
    description: "Include only transactions where address is the receiver",
    required: false,
    example: false,
  })
  @ApiQuery({
    name: "include_failed",
    description: "Include failed transactions",
    required: false,
    example: true,
  })
  @ApiQuery({
    name: "include_messages",
    description: "Include message details",
    required: false,
    example: true,
  })
  @ApiQuery({
    name: "include_logs",
    description: "Include transaction logs",
    required: false,
    example: false,
  })
  @ApiQuery({
    name: "sort_by",
    description: "Sort by field",
    required: false,
    example: "height",
    enum: ["height", "timestamp", "gas_used", "gas_wanted", "fee"],
  })
  @ApiQuery({
    name: "sort_order",
    description: "Sort order",
    required: false,
    example: "DESC",
    enum: ["ASC", "DESC"],
  })
  @ApiQuery({
    name: "limit",
    description: "Number of results to return (1-100)",
    required: false,
    example: 20,
  })
  @ApiQuery({
    name: "offset",
    description: "Number of results to skip (>=0)",
    required: false,
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description:
      "Address transactions retrieved successfully with advanced filtering",
    type: PaginatedResponseDto<AddressTransactionResponseDto>,
  })
  @ApiResponse({
    status: 404,
    description: "Address not found",
  })
  async getAddressTransactionsAdvanced(
    @Param() params: AddressDto,
    @Query() filters: AddressTransactionFilterDto
  ): Promise<PaginatedResponseDto<AddressTransactionResponseDto>> {
    try {
      return await this.addressService.getAddressTransactionsAdvanced(
        params.address,
        filters
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

  @Get(":address/transactions/statistics")
  @ApiOperation({
    summary: "Get address transaction statistics",
    description:
      "Retrieve comprehensive transaction statistics for a specific address including success rates, gas usage, fees, direction analysis, message type distribution, counterparty analysis, and volume trends.",
  })
  @ApiParam({
    name: "address",
    description: "Account address",
    example: "safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @ApiResponse({
    status: 200,
    description: "Address transaction statistics retrieved successfully",
    type: AddressTransactionStatisticsDto,
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(120)
  @ApiResponse({
    status: 404,
    description: "Address not found",
  })
  async getAddressTransactionStatistics(
    @Param() params: AddressDto
  ): Promise<AddressTransactionStatisticsDto> {
    try {
      return await this.addressService.getAddressTransactionStatistics(
        params.address
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
}
