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
import { ValidatorService } from "./validator.service";
import {
  ValidatorAddressDto,
  ValidatorResponseDto,
  ValidatorListDto,
} from "../../dto/validator.dto";

@ApiTags("Validator")
@Controller("validator")
export class ValidatorController {
  constructor(private readonly validatorService: ValidatorService) {}

  @Get(":address")
  @ApiOperation({
    summary: "Get validator by consensus address",
    description:
      "Retrieve comprehensive information about a specific validator including status, commission, voting power, and statistics.",
  })
  @ApiParam({
    name: "address",
    description: "Validator consensus address",
    example: "cosmosvalcons1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @ApiResponse({
    status: 200,
    description: "Validator information retrieved successfully",
    type: ValidatorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Validator not found",
  })
  async getValidator(
    @Param() params: ValidatorAddressDto
  ): Promise<ValidatorResponseDto> {
    try {
      return await this.validatorService.getValidatorByAddress(params.address);
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
    summary: "Get validators list",
    description:
      "Retrieve paginated list of validators with optional filtering by status, jailed status, and search terms.",
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
    description:
      "Filter by validator status (0=Bonded, 1=Unbonding, 2=Unbonded, 3=Jailed)",
    example: 0,
    required: false,
  })
  @ApiQuery({
    name: "jailed",
    description: "Filter by jailed status",
    example: false,
    required: false,
  })
  @ApiQuery({
    name: "search",
    description: "Search by moniker, operator address, or consensus address",
    example: "Cosmos",
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: "Validators retrieved successfully",
  })
  async getValidators(@Query() filters: ValidatorListDto) {
    return await this.validatorService.getValidators(filters);
  }

  @Get(":address/description")
  @ApiOperation({
    summary: "Get validator description",
    description:
      "Retrieve validator description information including moniker, website, and details.",
  })
  @ApiParam({
    name: "address",
    description: "Validator consensus address",
    example: "cosmosvalcons1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @ApiResponse({
    status: 200,
    description: "Validator description retrieved successfully",
    schema: {
      type: "object",
      properties: {
        consensus_address: {
          type: "string",
          example: "cosmosvalcons1abc123def456ghi789jkl012mno345pqr678stu",
        },
        description: {
          type: "object",
          properties: {
            moniker: { type: "string", example: "Cosmos Validator" },
            identity: {
              type: "string",
              example: "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6",
            },
            website: { type: "string", example: "https://cosmosvalidator.com" },
            details: {
              type: "string",
              example: "Professional validator with 99.9% uptime",
            },
            avatar_url: {
              type: "string",
              example: "https://example.com/avatar.png",
            },
            security_contact: {
              type: "string",
              example: "security@cosmosvalidator.com",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Validator not found",
  })
  async getValidatorDescription(@Param() params: ValidatorAddressDto) {
    try {
      const validator = await this.validatorService.getValidatorByAddress(
        params.address
      );
      return {
        consensus_address: validator.consensus_address,
        description: validator.description,
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

  @Get(":address/commission")
  @ApiOperation({
    summary: "Get validator commission",
    description:
      "Retrieve validator commission information including current rate and minimum self delegation.",
  })
  @ApiParam({
    name: "address",
    description: "Validator consensus address",
    example: "cosmosvalcons1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @ApiResponse({
    status: 200,
    description: "Validator commission retrieved successfully",
    schema: {
      type: "object",
      properties: {
        consensus_address: {
          type: "string",
          example: "cosmosvalcons1abc123def456ghi789jkl012mno345pqr678stu",
        },
        commission: {
          type: "object",
          properties: {
            commission: { type: "number", example: 0.05 },
            min_self_delegation: { type: "number", example: 1000000 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Validator not found",
  })
  async getValidatorCommission(@Param() params: ValidatorAddressDto) {
    try {
      const validator = await this.validatorService.getValidatorByAddress(
        params.address
      );
      return {
        consensus_address: validator.consensus_address,
        commission: validator.commission,
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

  @Get(":address/voting-power")
  @ApiOperation({
    summary: "Get validator voting power",
    description:
      "Retrieve current voting power and related information for a specific validator.",
  })
  @ApiParam({
    name: "address",
    description: "Validator consensus address",
    example: "cosmosvalcons1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @ApiResponse({
    status: 200,
    description: "Validator voting power retrieved successfully",
    schema: {
      type: "object",
      properties: {
        consensus_address: {
          type: "string",
          example: "cosmosvalcons1abc123def456ghi789jkl012mno345pqr678stu",
        },
        voting_power: {
          type: "object",
          properties: {
            voting_power: { type: "number", example: 1000000000 },
            height: { type: "number", example: 12345 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Validator not found",
  })
  async getValidatorVotingPower(@Param() params: ValidatorAddressDto) {
    try {
      const validator = await this.validatorService.getValidatorByAddress(
        params.address
      );
      return {
        consensus_address: validator.consensus_address,
        voting_power: validator.voting_power,
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

  @Get(":address/status")
  @ApiOperation({
    summary: "Get validator status",
    description:
      "Retrieve current status information for a specific validator including bonded status and jailed state.",
  })
  @ApiParam({
    name: "address",
    description: "Validator consensus address",
    example: "cosmosvalcons1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @ApiResponse({
    status: 200,
    description: "Validator status retrieved successfully",
    schema: {
      type: "object",
      properties: {
        consensus_address: {
          type: "string",
          example: "cosmosvalcons1abc123def456ghi789jkl012mno345pqr678stu",
        },
        status: {
          type: "object",
          properties: {
            status: { type: "number", example: 0 },
            jailed: { type: "boolean", example: false },
            height: { type: "number", example: 12345 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Validator not found",
  })
  async getValidatorStatus(@Param() params: ValidatorAddressDto) {
    try {
      const validator = await this.validatorService.getValidatorByAddress(
        params.address
      );
      return {
        consensus_address: validator.consensus_address,
        status: validator.status,
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

  @Get(":address/statistics")
  @ApiOperation({
    summary: "Get validator statistics",
    description:
      "Retrieve statistical information about a specific validator including blocks proposed, uptime, and delegation statistics.",
  })
  @ApiParam({
    name: "address",
    description: "Validator consensus address",
    example: "cosmosvalcons1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @ApiResponse({
    status: 200,
    description: "Validator statistics retrieved successfully",
    schema: {
      type: "object",
      properties: {
        consensus_address: {
          type: "string",
          example: "cosmosvalcons1abc123def456ghi789jkl012mno345pqr678stu",
        },
        statistics: {
          type: "object",
          properties: {
            blocks_proposed: { type: "number", example: 150 },
            uptime_percentage: { type: "number", example: 99.9 },
            total_delegations: { type: "string", example: "50000000000" },
            self_delegation: { type: "string", example: "1000000000" },
            commission_rate: { type: "number", example: 0.05 },
            max_commission_rate: { type: "number", example: 0.2 },
            max_change_rate: { type: "number", example: 0.01 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Validator not found",
  })
  async getValidatorStatistics(@Param() params: ValidatorAddressDto) {
    try {
      const validator = await this.validatorService.getValidatorByAddress(
        params.address
      );
      return {
        consensus_address: validator.consensus_address,
        statistics: validator.statistics,
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

  @Get(":address/activity")
  @ApiOperation({
    summary: "Get validator recent activity",
    description:
      "Retrieve recent activity for a specific validator including block proposals and other actions.",
  })
  @ApiParam({
    name: "address",
    description: "Validator consensus address",
    example: "cosmosvalcons1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @ApiResponse({
    status: 200,
    description: "Validator activity retrieved successfully",
    schema: {
      type: "object",
      properties: {
        consensus_address: {
          type: "string",
          example: "cosmosvalcons1abc123def456ghi789jkl012mno345pqr678stu",
        },
        recent_activity: {
          type: "array",
          items: {
            type: "object",
            properties: {
              height: { type: "number", example: 12345 },
              timestamp: { type: "string", example: "2023-12-01T10:30:00Z" },
              type: { type: "string", example: "block_proposal" },
              hash: {
                type: "string",
                example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Validator not found",
  })
  async getValidatorActivity(@Param() params: ValidatorAddressDto) {
    try {
      const validator = await this.validatorService.getValidatorByAddress(
        params.address
      );
      return {
        consensus_address: validator.consensus_address,
        recent_activity: validator.recent_activity,
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
}
