import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Validator } from "../../entities/validator.entity";
import { ValidatorInfo } from "../../entities/validator-info.entity";
import { ValidatorDescription } from "../../entities/validator-description.entity";
import { ValidatorCommission } from "../../entities/validator-commission.entity";
import { ValidatorVotingPower } from "../../entities/validator-voting-power.entity";
import { ValidatorStatus } from "../../entities/validator-status.entity";
import { Block } from "../../entities/block.entity";
import {
  ValidatorResponseDto,
  ValidatorListDto,
} from "../../dto/validator.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";

@Injectable()
export class ValidatorService {
  constructor(
    @InjectRepository(Validator)
    private validatorRepository: Repository<Validator>,
    @InjectRepository(ValidatorInfo)
    private validatorInfoRepository: Repository<ValidatorInfo>,
    @InjectRepository(ValidatorDescription)
    private validatorDescriptionRepository: Repository<ValidatorDescription>,
    @InjectRepository(ValidatorCommission)
    private validatorCommissionRepository: Repository<ValidatorCommission>,
    @InjectRepository(ValidatorVotingPower)
    private validatorVotingPowerRepository: Repository<ValidatorVotingPower>,
    @InjectRepository(ValidatorStatus)
    private validatorStatusRepository: Repository<ValidatorStatus>,
    @InjectRepository(Block)
    private blockRepository: Repository<Block>
  ) {}

  async getValidatorByAddress(address: string): Promise<ValidatorResponseDto> {
    const validator = await this.validatorRepository.findOne({
      where: { consensus_address: address },
    });

    if (!validator) {
      throw new Error(`Validator with address ${address} not found`);
    }

    // Get all validator information
    const [info, description, commission, votingPower, status] =
      await Promise.all([
        this.validatorInfoRepository.findOne({
          where: { consensus_address: address },
        }),
        this.validatorDescriptionRepository.findOne({
          where: { validator_address: address },
        }),
        this.validatorCommissionRepository.findOne({
          where: { validator_address: address },
        }),
        this.validatorVotingPowerRepository.findOne({
          where: { validator_address: address },
        }),
        this.validatorStatusRepository.findOne({
          where: { validator_address: address },
        }),
      ]);

    // Get validator statistics
    const statistics = await this.getValidatorStatistics(address);

    // Get recent activity
    const recentActivity = await this.getRecentActivity(address);

    return {
      consensus_address: validator.consensus_address,
      operator_address: info?.operator_address || "",
      consensus_pubkey: validator.consensus_pubkey,
      info: info
        ? {
            self_delegate_address: info.self_delegate_address,
            max_change_rate: info.max_change_rate,
            max_rate: info.max_rate,
          }
        : null,
      description: description
        ? {
            moniker: description.moniker,
            identity: description.identity,
            website: description.website,
            details: description.details,
            avatar_url: description.avatar_url,
            security_contact: description.security_contact,
          }
        : null,
      commission: commission
        ? {
            commission: commission.commission,
            min_self_delegation: commission.min_self_delegation,
          }
        : null,
      voting_power: votingPower
        ? {
            voting_power: votingPower.voting_power,
            height: votingPower.height,
          }
        : null,
      status: status
        ? {
            status: status.status,
            jailed: status.jailed,
            height: status.height,
          }
        : null,
      statistics,
      recent_activity: recentActivity,
    };
  }

  async getValidators(
    filters: ValidatorListDto
  ): Promise<PaginatedResponseDto<any>> {
    const queryBuilder = this.validatorRepository
      .createQueryBuilder("validator")
      .leftJoinAndSelect("validator.info", "info")
      .leftJoinAndSelect("validator.description", "description")
      .leftJoinAndSelect("validator.commission", "commission")
      .leftJoinAndSelect("validator.votingPower", "votingPower")
      .leftJoinAndSelect("validator.status", "status")
      .orderBy("votingPower.voting_power", "DESC");

    // Apply filters
    if (filters.status !== undefined) {
      queryBuilder.andWhere("status.status = :status", {
        status: filters.status,
      });
    }

    if (filters.jailed !== undefined) {
      queryBuilder.andWhere("status.jailed = :jailed", {
        jailed: filters.jailed,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        "(description.moniker ILIKE :search OR info.operator_address ILIKE :search OR validator.consensus_address ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    // Apply pagination - run data and count in parallel (limit clamped to 100)
    const limit = Math.min(Math.max(filters.limit || 20, 1), 100);
    const offset = ((filters.page || 1) - 1) * limit;

    const [validators, countRaw] = await Promise.all([
      queryBuilder.clone().offset(offset).limit(limit).getMany(),
      queryBuilder
        .clone()
        .select("COUNT(DISTINCT validator.consensus_address)", "count")
        .getRawOne<{ count: string }>(),
    ]);
    const total = parseInt(countRaw?.count ?? "0", 10);

    // Process validators for response
    const processedValidators = validators.map((validator) => ({
      consensus_address: validator.consensus_address,
      operator_address: validator.info?.operator_address || "",
      consensus_pubkey: validator.consensus_pubkey,
      moniker: validator.description?.moniker || "Unknown",
      status: validator.status?.status || 0,
      jailed: validator.status?.jailed || false,
      voting_power: validator.votingPower?.voting_power || 0,
      commission: validator.commission?.commission || 0,
      uptime: 99.9, // This would need to be calculated based on your uptime tracking
      rank: 0, // This would need to be calculated based on voting power
    }));

    return {
      data: processedValidators,
      meta: {
        page: filters.page || 1,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: (filters.page || 1) < Math.ceil(total / limit),
        hasPrev: (filters.page || 1) > 1,
      },
    };
  }

  private async getValidatorStatistics(address: string) {
    // Get blocks proposed by this validator
    const blocksProposed = await this.blockRepository.count({
      where: { proposer_address: address },
    });

    // This would need to be implemented based on your specific statistics tracking
    return {
      blocks_proposed: blocksProposed,
      uptime_percentage: 99.9,
      total_delegations: "50000000000",
      self_delegation: "1000000000",
      commission_rate: 0.05,
      max_commission_rate: 0.2,
      max_change_rate: 0.01,
    };
  }

  private async getRecentActivity(address: string) {
    // Get recent blocks proposed by this validator
    const recentBlocks = await this.blockRepository.find({
      where: { proposer_address: address },
      order: { height: "DESC" },
      take: 10,
    });

    return recentBlocks.map((block) => ({
      height: block.height,
      timestamp: block.timestamp,
      type: "block_proposal",
      hash: block.hash,
    }));
  }
}
