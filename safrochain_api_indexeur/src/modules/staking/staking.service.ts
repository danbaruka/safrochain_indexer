import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { StakingPool } from "../../entities/staking-pool.entity";
import { StakingParams } from "../../entities/staking-params.entity";
import { ValidatorSigningInfo } from "../../entities/validator-signing-info.entity";
import { CommunityPool } from "../../entities/community-pool.entity";
import { DistributionParams } from "../../entities/distribution-params.entity";
import { SlashingParams } from "../../entities/slashing-params.entity";
import { MintParams } from "../../entities/mint-params.entity";
import { Inflation } from "../../entities/inflation.entity";
import { GovParams } from "../../entities/gov-params.entity";
import { Message } from "../../entities/message.entity";
import { MessageParserService } from "../../common/services/message-parser.service";
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

@Injectable()
export class StakingService {
  constructor(
    @InjectRepository(StakingPool)
    private stakingPoolRepository: Repository<StakingPool>,
    @InjectRepository(StakingParams)
    private stakingParamsRepository: Repository<StakingParams>,
    @InjectRepository(ValidatorSigningInfo)
    private validatorSigningInfoRepository: Repository<ValidatorSigningInfo>,
    @InjectRepository(CommunityPool)
    private communityPoolRepository: Repository<CommunityPool>,
    @InjectRepository(DistributionParams)
    private distributionParamsRepository: Repository<DistributionParams>,
    @InjectRepository(SlashingParams)
    private slashingParamsRepository: Repository<SlashingParams>,
    @InjectRepository(MintParams)
    private mintParamsRepository: Repository<MintParams>,
    @InjectRepository(Inflation)
    private inflationRepository: Repository<Inflation>,
    @InjectRepository(GovParams)
    private govParamsRepository: Repository<GovParams>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private messageParserService: MessageParserService
  ) {}

  // Staking Pool APIs
  async getStakingPool(): Promise<StakingPoolDto> {
    const pool = await this.stakingPoolRepository.findOne({
      where: { one_row_id: true },
      order: { height: "DESC" },
    });

    if (!pool) {
      throw new Error("Staking pool not found");
    }

    return {
      bonded_tokens: pool.bonded_tokens,
      not_bonded_tokens: pool.not_bonded_tokens,
      unbonding_tokens: pool.unbonding_tokens,
      staked_not_bonded_tokens: pool.staked_not_bonded_tokens,
      height: pool.height,
    };
  }

  async getStakingParams(): Promise<StakingParamsDto> {
    const params = await this.stakingParamsRepository.findOne({
      where: { one_row_id: true },
      order: { height: "DESC" },
    });

    if (!params) {
      throw new Error("Staking parameters not found");
    }

    return {
      params: params.params,
      height: params.height,
    };
  }

  private static readonly MAX_PAGE_SIZE = 100;

  // Delegation APIs
  async getDelegationsByAddress(
    address: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<DelegationDto[]> {
    const safeLimit = Math.min(Math.max(limit ?? 20, 1), StakingService.MAX_PAGE_SIZE);
    const safeOffset = Math.max(offset ?? 0, 0);
    const messages = await this.messageRepository
      .createQueryBuilder("message")
      .leftJoinAndSelect("message.transaction", "transaction")
      .leftJoinAndSelect("transaction.block", "block")
      .where("message.type = :type", {
        type: "cosmos.staking.v1beta1.MsgDelegate",
      })
      .andWhere(":address = ANY(message.involved_accounts_addresses)", {
        address,
      })
      .orderBy("message.height", "DESC")
      .limit(safeLimit)
      .offset(safeOffset)
      .getMany();

    return messages.map((message) => {
      const parsedMessage = this.messageParserService.parseMessage(
        message.type,
        message.value,
        message.involved_accounts_addresses
      );
      const value = message.value as any;

      return {
        delegator_address: value.delegator_address || "",
        validator_address: value.validator_address || "",
        amount: value.amount?.amount || "0",
        denom: value.amount?.denom || "",
        transaction_hash: message.transaction_hash,
        height: message.height,
        timestamp: message.transaction?.block?.timestamp || new Date(),
      };
    });
  }

  async getDelegationsByValidator(
    validatorAddress: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<DelegationDto[]> {
    const safeLimit = Math.min(Math.max(limit ?? 20, 1), StakingService.MAX_PAGE_SIZE);
    const safeOffset = Math.max(offset ?? 0, 0);
    const messages = await this.messageRepository
      .createQueryBuilder("message")
      .leftJoinAndSelect("message.transaction", "transaction")
      .leftJoinAndSelect("transaction.block", "block")
      .where("message.type = :type", {
        type: "cosmos.staking.v1beta1.MsgDelegate",
      })
      .andWhere(
        ":validatorAddress = ANY(message.involved_accounts_addresses)",
        {
          validatorAddress,
        }
      )
      .orderBy("message.height", "DESC")
      .limit(safeLimit)
      .offset(safeOffset)
      .getMany();

    return messages.map((message) => {
      const value = message.value as any;

      return {
        delegator_address: value.delegator_address || "",
        validator_address: value.validator_address || "",
        amount: value.amount?.amount || "0",
        denom: value.amount?.denom || "",
        transaction_hash: message.transaction_hash,
        height: message.height,
        timestamp: message.transaction?.block?.timestamp || new Date(),
      };
    });
  }

  // Undelegation APIs
  async getUndelegationsByAddress(
    address: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<UndelegationDto[]> {
    const safeLimit = Math.min(Math.max(limit ?? 20, 1), StakingService.MAX_PAGE_SIZE);
    const safeOffset = Math.max(offset ?? 0, 0);
    const messages = await this.messageRepository
      .createQueryBuilder("message")
      .leftJoinAndSelect("message.transaction", "transaction")
      .leftJoinAndSelect("transaction.block", "block")
      .where("message.type = :type", {
        type: "cosmos.staking.v1beta1.MsgUndelegate",
      })
      .andWhere(":address = ANY(message.involved_accounts_addresses)", {
        address,
      })
      .orderBy("message.height", "DESC")
      .limit(safeLimit)
      .offset(safeOffset)
      .getMany();

    return messages.map((message) => {
      const value = message.value as any;

      return {
        delegator_address: value.delegator_address || "",
        validator_address: value.validator_address || "",
        amount: value.amount?.amount || "0",
        denom: value.amount?.denom || "",
        completion_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // Approximate
        transaction_hash: message.transaction_hash,
        height: message.height,
        timestamp: message.transaction?.block?.timestamp || new Date(),
      };
    });
  }

  async getUndelegationsByValidator(
    validatorAddress: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<UndelegationDto[]> {
    const safeLimit = Math.min(Math.max(limit ?? 20, 1), StakingService.MAX_PAGE_SIZE);
    const safeOffset = Math.max(offset ?? 0, 0);
    const messages = await this.messageRepository
      .createQueryBuilder("message")
      .leftJoinAndSelect("message.transaction", "transaction")
      .leftJoinAndSelect("transaction.block", "block")
      .where("message.type = :type", {
        type: "cosmos.staking.v1beta1.MsgUndelegate",
      })
      .andWhere(
        ":validatorAddress = ANY(message.involved_accounts_addresses)",
        {
          validatorAddress,
        }
      )
      .orderBy("message.height", "DESC")
      .limit(safeLimit)
      .offset(safeOffset)
      .getMany();

    return messages.map((message) => {
      const value = message.value as any;

      return {
        delegator_address: value.delegator_address || "",
        validator_address: value.validator_address || "",
        amount: value.amount?.amount || "0",
        denom: value.amount?.denom || "",
        completion_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // Approximate
        transaction_hash: message.transaction_hash,
        height: message.height,
        timestamp: message.transaction?.block?.timestamp || new Date(),
      };
    });
  }

  // Redelegation APIs
  async getRedelegationsByAddress(
    address: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<RedelegationDto[]> {
    const safeLimit = Math.min(Math.max(limit ?? 20, 1), StakingService.MAX_PAGE_SIZE);
    const safeOffset = Math.max(offset ?? 0, 0);
    const messages = await this.messageRepository
      .createQueryBuilder("message")
      .leftJoinAndSelect("message.transaction", "transaction")
      .leftJoinAndSelect("transaction.block", "block")
      .where("message.type = :type", {
        type: "cosmos.staking.v1beta1.MsgBeginRedelegate",
      })
      .andWhere(":address = ANY(message.involved_accounts_addresses)", {
        address,
      })
      .orderBy("message.height", "DESC")
      .limit(safeLimit)
      .offset(safeOffset)
      .getMany();

    return messages.map((message) => {
      const value = message.value as any;

      return {
        delegator_address: value.delegator_address || "",
        validator_src_address: value.validator_src_address || "",
        validator_dst_address: value.validator_dst_address || "",
        amount: value.amount?.amount || "0",
        denom: value.amount?.denom || "",
        completion_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // Approximate
        transaction_hash: message.transaction_hash,
        height: message.height,
        timestamp: message.transaction?.block?.timestamp || new Date(),
      };
    });
  }

  // Withdrawal APIs
  async getWithdrawalsByAddress(
    address: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<WithdrawalDto[]> {
    const safeLimit = Math.min(Math.max(limit ?? 20, 1), StakingService.MAX_PAGE_SIZE);
    const safeOffset = Math.max(offset ?? 0, 0);
    const messages = await this.messageRepository
      .createQueryBuilder("message")
      .leftJoinAndSelect("message.transaction", "transaction")
      .leftJoinAndSelect("transaction.block", "block")
      .where("message.type = :type", {
        type: "cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
      })
      .andWhere(":address = ANY(message.involved_accounts_addresses)", {
        address,
      })
      .orderBy("message.height", "DESC")
      .limit(safeLimit)
      .offset(safeOffset)
      .getMany();

    return messages.map((message) => {
      const value = message.value as any;

      return {
        delegator_address: value.delegator_address || "",
        validator_address: value.validator_address || "",
        amount: "0", // Withdrawal amount is not directly available in the message
        denom: "asafro", // Default denomination
        transaction_hash: message.transaction_hash,
        height: message.height,
        timestamp: message.transaction?.block?.timestamp || new Date(),
      };
    });
  }

  async getWithdrawalsByValidator(
    validatorAddress: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<WithdrawalDto[]> {
    const safeLimit = Math.min(Math.max(limit ?? 20, 1), StakingService.MAX_PAGE_SIZE);
    const safeOffset = Math.max(offset ?? 0, 0);
    const messages = await this.messageRepository
      .createQueryBuilder("message")
      .leftJoinAndSelect("message.transaction", "transaction")
      .leftJoinAndSelect("transaction.block", "block")
      .where("message.type = :type", {
        type: "cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
      })
      .andWhere(
        ":validatorAddress = ANY(message.involved_accounts_addresses)",
        {
          validatorAddress,
        }
      )
      .orderBy("message.height", "DESC")
      .limit(safeLimit)
      .offset(safeOffset)
      .getMany();

    return messages.map((message) => {
      const value = message.value as any;

      return {
        delegator_address: value.delegator_address || "",
        validator_address: value.validator_address || "",
        amount: "0", // Withdrawal amount is not directly available in the message
        denom: "asafro", // Default denomination
        transaction_hash: message.transaction_hash,
        height: message.height,
        timestamp: message.transaction?.block?.timestamp || new Date(),
      };
    });
  }

  // Validator Signing Info APIs
  async getValidatorSigningInfo(
    validatorAddress: string
  ): Promise<ValidatorSigningInfoDto> {
    const signingInfo = await this.validatorSigningInfoRepository.findOne({
      where: { validator_address: validatorAddress },
    });

    if (!signingInfo) {
      throw new Error("Validator signing info not found");
    }

    return {
      validator_address: signingInfo.validator_address,
      start_height: signingInfo.start_height,
      index_offset: signingInfo.index_offset,
      jailed_until: signingInfo.jailed_until,
      tombstoned: signingInfo.tombstoned,
      missed_blocks_counter: signingInfo.missed_blocks_counter,
      height: signingInfo.height,
    };
  }

  async getAllValidatorSigningInfo(): Promise<ValidatorSigningInfoDto[]> {
    const signingInfos = await this.validatorSigningInfoRepository.find({
      order: { height: "DESC" },
      take: 100,
    });

    return signingInfos.map((info) => ({
      validator_address: info.validator_address,
      start_height: info.start_height,
      index_offset: info.index_offset,
      jailed_until: info.jailed_until,
      tombstoned: info.tombstoned,
      missed_blocks_counter: info.missed_blocks_counter,
      height: info.height,
    }));
  }

  // Community Pool APIs
  async getCommunityPool(): Promise<CommunityPoolDto> {
    const pool = await this.communityPoolRepository.findOne({
      where: { one_row_id: true },
      order: { height: "DESC" },
    });

    if (!pool) {
      throw new Error("Community pool not found");
    }

    return {
      coins: pool.coins,
      height: pool.height,
    };
  }

  // Distribution Parameters APIs
  async getDistributionParams(): Promise<DistributionParamsDto> {
    const params = await this.distributionParamsRepository.findOne({
      where: { one_row_id: true },
      order: { height: "DESC" },
    });

    if (!params) {
      throw new Error("Distribution parameters not found");
    }

    return {
      params: params.params,
      height: params.height,
    };
  }

  // Slashing Parameters APIs
  async getSlashingParams(): Promise<SlashingParamsDto> {
    const params = await this.slashingParamsRepository.findOne({
      where: { one_row_id: true },
      order: { height: "DESC" },
    });

    if (!params) {
      throw new Error("Slashing parameters not found");
    }

    return {
      params: params.params,
      height: params.height,
    };
  }

  // Mint Parameters APIs
  async getMintParams(): Promise<MintParamsDto> {
    const params = await this.mintParamsRepository.findOne({
      where: { one_row_id: true },
      order: { height: "DESC" },
    });

    if (!params) {
      throw new Error("Mint parameters not found");
    }

    return {
      params: params.params,
      height: params.height,
    };
  }

  // Inflation APIs
  async getInflation(): Promise<InflationDto> {
    const inflation = await this.inflationRepository.findOne({
      where: { one_row_id: true },
      order: { height: "DESC" },
    });

    if (!inflation) {
      throw new Error("Inflation data not found");
    }

    return {
      value: inflation.value,
      height: inflation.height,
    };
  }

  // Governance Parameters APIs
  async getGovParams(): Promise<GovParamsDto> {
    const params = await this.govParamsRepository.findOne({
      where: { one_row_id: true },
      order: { height: "DESC" },
    });

    if (!params) {
      throw new Error("Governance parameters not found");
    }

    return {
      params: params.params,
      height: params.height,
    };
  }

  // Statistics APIs
  async getStakingStatistics() {
    const [
      totalDelegations,
      totalUndelegations,
      totalRedelegations,
      totalWithdrawals,
      activeValidators,
    ] = await Promise.all([
      this.messageRepository.count({
        where: { type: "cosmos.staking.v1beta1.MsgDelegate" },
      }),
      this.messageRepository.count({
        where: { type: "cosmos.staking.v1beta1.MsgUndelegate" },
      }),
      this.messageRepository.count({
        where: { type: "cosmos.staking.v1beta1.MsgBeginRedelegate" },
      }),
      this.messageRepository.count({
        where: {
          type: "cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
        },
      }),
      this.validatorSigningInfoRepository.count({
        where: { tombstoned: false },
      }),
    ]);

    return {
      total_delegations: totalDelegations,
      total_undelegations: totalUndelegations,
      total_redelegations: totalRedelegations,
      total_withdrawals: totalWithdrawals,
      active_validators: activeValidators,
    };
  }
}
