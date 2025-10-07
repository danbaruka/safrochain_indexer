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
  ApiParam,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";
import { StakingService } from "./staking.service";
import { PaginationDto } from "../../common/dto/pagination.dto";
import {
  StakingPoolDto,
  StakingParamsDto,
  DelegationDto,
  UndelegationDto,
  RedelegationDto,
  WithdrawalDto,
  ValidatorSigningInfoDto,
  CommunityPoolDto,
  DistributionParamsDto,
  SlashingParamsDto,
  MintParamsDto,
  InflationDto,
  GovParamsDto,
} from "../../dto/staking.dto";

@ApiTags("Staking")
@Controller("staking")
export class StakingController {
  constructor(private readonly stakingService: StakingService) {}

  // Staking Pool APIs
  @Get("pool")
  @ApiOperation({ summary: "Get staking pool information" })
  @ApiResponse({
    status: 200,
    description: "Staking pool data",
    type: StakingPoolDto,
  })
  async getStakingPool(): Promise<StakingPoolDto> {
    try {
      return await this.stakingService.getStakingPool();
    } catch (error) {
      throw new HttpException(
        `Failed to get staking pool: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("params")
  @ApiOperation({ summary: "Get staking parameters" })
  @ApiResponse({
    status: 200,
    description: "Staking parameters",
    type: StakingParamsDto,
  })
  async getStakingParams(): Promise<StakingParamsDto> {
    try {
      return await this.stakingService.getStakingParams();
    } catch (error) {
      throw new HttpException(
        `Failed to get staking parameters: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Delegation APIs
  @Get("delegations/address/:address")
  @ApiOperation({ summary: "Get delegations by address" })
  @ApiParam({ name: "address", description: "Delegator address" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of results to return",
  })
  @ApiQuery({
    name: "offset",
    required: false,
    description: "Number of results to skip",
  })
  @ApiResponse({
    status: 200,
    description: "List of delegations",
    type: [DelegationDto],
  })
  async getDelegationsByAddress(
    @Param("address") address: string,
    @Query() pagination: PaginationDto
  ): Promise<DelegationDto[]> {
    try {
      return await this.stakingService.getDelegationsByAddress(
        address,
        pagination.limit,
        pagination.offset
      );
    } catch (error) {
      throw new HttpException(
        `Failed to get delegations: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("delegations/validator/:validatorAddress")
  @ApiOperation({ summary: "Get delegations by validator" })
  @ApiParam({ name: "validatorAddress", description: "Validator address" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of results to return",
  })
  @ApiQuery({
    name: "offset",
    required: false,
    description: "Number of results to skip",
  })
  @ApiResponse({
    status: 200,
    description: "List of delegations",
    type: [DelegationDto],
  })
  async getDelegationsByValidator(
    @Param("validatorAddress") validatorAddress: string,
    @Query() pagination: PaginationDto
  ): Promise<DelegationDto[]> {
    try {
      return await this.stakingService.getDelegationsByValidator(
        validatorAddress,
        pagination.limit,
        pagination.offset
      );
    } catch (error) {
      throw new HttpException(
        `Failed to get delegations: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Undelegation APIs
  @Get("undelegations/address/:address")
  @ApiOperation({ summary: "Get undelegations by address" })
  @ApiParam({ name: "address", description: "Delegator address" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of results to return",
  })
  @ApiQuery({
    name: "offset",
    required: false,
    description: "Number of results to skip",
  })
  @ApiResponse({
    status: 200,
    description: "List of undelegations",
    type: [UndelegationDto],
  })
  async getUndelegationsByAddress(
    @Param("address") address: string,
    @Query() pagination: PaginationDto
  ): Promise<UndelegationDto[]> {
    try {
      return await this.stakingService.getUndelegationsByAddress(
        address,
        pagination.limit,
        pagination.offset
      );
    } catch (error) {
      throw new HttpException(
        `Failed to get undelegations: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("undelegations/validator/:validatorAddress")
  @ApiOperation({ summary: "Get undelegations by validator" })
  @ApiParam({ name: "validatorAddress", description: "Validator address" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of results to return",
  })
  @ApiQuery({
    name: "offset",
    required: false,
    description: "Number of results to skip",
  })
  @ApiResponse({
    status: 200,
    description: "List of undelegations",
    type: [UndelegationDto],
  })
  async getUndelegationsByValidator(
    @Param("validatorAddress") validatorAddress: string,
    @Query() pagination: PaginationDto
  ): Promise<UndelegationDto[]> {
    try {
      return await this.stakingService.getUndelegationsByValidator(
        validatorAddress,
        pagination.limit,
        pagination.offset
      );
    } catch (error) {
      throw new HttpException(
        `Failed to get undelegations: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Redelegation APIs
  @Get("redelegations/address/:address")
  @ApiOperation({ summary: "Get redelegations by address" })
  @ApiParam({ name: "address", description: "Delegator address" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of results to return",
  })
  @ApiQuery({
    name: "offset",
    required: false,
    description: "Number of results to skip",
  })
  @ApiResponse({
    status: 200,
    description: "List of redelegations",
    type: [RedelegationDto],
  })
  async getRedelegationsByAddress(
    @Param("address") address: string,
    @Query() pagination: PaginationDto
  ): Promise<RedelegationDto[]> {
    try {
      return await this.stakingService.getRedelegationsByAddress(
        address,
        pagination.limit,
        pagination.offset
      );
    } catch (error) {
      throw new HttpException(
        `Failed to get redelegations: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Withdrawal APIs
  @Get("withdrawals/address/:address")
  @ApiOperation({ summary: "Get withdrawals by address" })
  @ApiParam({ name: "address", description: "Delegator address" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of results to return",
  })
  @ApiQuery({
    name: "offset",
    required: false,
    description: "Number of results to skip",
  })
  @ApiResponse({
    status: 200,
    description: "List of withdrawals",
    type: [WithdrawalDto],
  })
  async getWithdrawalsByAddress(
    @Param("address") address: string,
    @Query() pagination: PaginationDto
  ): Promise<WithdrawalDto[]> {
    try {
      return await this.stakingService.getWithdrawalsByAddress(
        address,
        pagination.limit,
        pagination.offset
      );
    } catch (error) {
      throw new HttpException(
        `Failed to get withdrawals: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("withdrawals/validator/:validatorAddress")
  @ApiOperation({ summary: "Get withdrawals by validator" })
  @ApiParam({ name: "validatorAddress", description: "Validator address" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of results to return",
  })
  @ApiQuery({
    name: "offset",
    required: false,
    description: "Number of results to skip",
  })
  @ApiResponse({
    status: 200,
    description: "List of withdrawals",
    type: [WithdrawalDto],
  })
  async getWithdrawalsByValidator(
    @Param("validatorAddress") validatorAddress: string,
    @Query() pagination: PaginationDto
  ): Promise<WithdrawalDto[]> {
    try {
      return await this.stakingService.getWithdrawalsByValidator(
        validatorAddress,
        pagination.limit,
        pagination.offset
      );
    } catch (error) {
      throw new HttpException(
        `Failed to get withdrawals: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Validator Signing Info APIs
  @Get("validator/:validatorAddress/signing-info")
  @ApiOperation({ summary: "Get validator signing information" })
  @ApiParam({ name: "validatorAddress", description: "Validator address" })
  @ApiResponse({
    status: 200,
    description: "Validator signing info",
    type: ValidatorSigningInfoDto,
  })
  async getValidatorSigningInfo(
    @Param("validatorAddress") validatorAddress: string
  ): Promise<ValidatorSigningInfoDto> {
    try {
      return await this.stakingService.getValidatorSigningInfo(
        validatorAddress
      );
    } catch (error) {
      throw new HttpException(
        `Failed to get validator signing info: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("validators/signing-info")
  @ApiOperation({ summary: "Get all validators signing information" })
  @ApiResponse({
    status: 200,
    description: "List of validator signing info",
    type: [ValidatorSigningInfoDto],
  })
  async getAllValidatorSigningInfo(): Promise<ValidatorSigningInfoDto[]> {
    try {
      return await this.stakingService.getAllValidatorSigningInfo();
    } catch (error) {
      throw new HttpException(
        `Failed to get validator signing info: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Community Pool APIs
  @Get("community-pool")
  @ApiOperation({ summary: "Get community pool information" })
  @ApiResponse({
    status: 200,
    description: "Community pool data",
    type: CommunityPoolDto,
  })
  async getCommunityPool(): Promise<CommunityPoolDto> {
    try {
      return await this.stakingService.getCommunityPool();
    } catch (error) {
      throw new HttpException(
        `Failed to get community pool: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Distribution Parameters APIs
  @Get("distribution-params")
  @ApiOperation({ summary: "Get distribution parameters" })
  @ApiResponse({
    status: 200,
    description: "Distribution parameters",
    type: DistributionParamsDto,
  })
  async getDistributionParams(): Promise<DistributionParamsDto> {
    try {
      return await this.stakingService.getDistributionParams();
    } catch (error) {
      throw new HttpException(
        `Failed to get distribution parameters: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Slashing Parameters APIs
  @Get("slashing-params")
  @ApiOperation({ summary: "Get slashing parameters" })
  @ApiResponse({
    status: 200,
    description: "Slashing parameters",
    type: SlashingParamsDto,
  })
  async getSlashingParams(): Promise<SlashingParamsDto> {
    try {
      return await this.stakingService.getSlashingParams();
    } catch (error) {
      throw new HttpException(
        `Failed to get slashing parameters: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Mint Parameters APIs
  @Get("mint-params")
  @ApiOperation({ summary: "Get mint parameters" })
  @ApiResponse({
    status: 200,
    description: "Mint parameters",
    type: MintParamsDto,
  })
  async getMintParams(): Promise<MintParamsDto> {
    try {
      return await this.stakingService.getMintParams();
    } catch (error) {
      throw new HttpException(
        `Failed to get mint parameters: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Inflation APIs
  @Get("inflation")
  @ApiOperation({ summary: "Get current inflation rate" })
  @ApiResponse({
    status: 200,
    description: "Inflation data",
    type: InflationDto,
  })
  async getInflation(): Promise<InflationDto> {
    try {
      return await this.stakingService.getInflation();
    } catch (error) {
      throw new HttpException(
        `Failed to get inflation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Governance Parameters APIs
  @Get("gov-params")
  @ApiOperation({ summary: "Get governance parameters" })
  @ApiResponse({
    status: 200,
    description: "Governance parameters",
    type: GovParamsDto,
  })
  async getGovParams(): Promise<GovParamsDto> {
    try {
      return await this.stakingService.getGovParams();
    } catch (error) {
      throw new HttpException(
        `Failed to get governance parameters: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Statistics APIs
  @Get("statistics")
  @ApiOperation({ summary: "Get staking statistics" })
  @ApiResponse({
    status: 200,
    description: "Staking statistics",
    schema: {
      type: "object",
      properties: {
        total_delegations: { type: "number" },
        total_undelegations: { type: "number" },
        total_redelegations: { type: "number" },
        total_withdrawals: { type: "number" },
        active_validators: { type: "number" },
      },
    },
  })
  async getStakingStatistics() {
    try {
      return await this.stakingService.getStakingStatistics();
    } catch (error) {
      throw new HttpException(
        `Failed to get staking statistics: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
