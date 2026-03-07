import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Supply } from "../../entities/supply.entity";
import { Block } from "../../entities/block.entity";
import {
  SupplyListDto,
  SupplyResponseDto,
  SupplyStatisticsDto,
  SupplySortBy,
  SupplySortOrder,
} from "../../dto/supply.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import { DateFilterService } from "../../common/services/date-filter.service";
import { serializeDates } from "../../common/utils/date-serializer.util";

@Injectable()
export class SupplyService {
  constructor(
    @InjectRepository(Supply)
    private supplyRepository: Repository<Supply>,
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
    private dateFilterService: DateFilterService
  ) {}

  async getSupply(
    filters: SupplyListDto
  ): Promise<PaginatedResponseDto<SupplyResponseDto>> {
    const queryBuilder = this.supplyRepository
      .createQueryBuilder("supply")
      .leftJoinAndSelect("supply.block", "block");

    // Apply filters
    if (filters.denom) {
      queryBuilder.andWhere("supply.denom = :denom", {
        denom: filters.denom,
      });
    }

    if (filters.denoms && filters.denoms.length > 0) {
      queryBuilder.andWhere("supply.denom IN (:...denoms)", {
        denoms: filters.denoms,
      });
    }

    if (filters.amount_min) {
      queryBuilder.andWhere("supply.amount >= :amountMin", {
        amountMin: filters.amount_min,
      });
    }

    if (filters.amount_max) {
      queryBuilder.andWhere("supply.amount <= :amountMax", {
        amountMax: filters.amount_max,
      });
    }

    if (filters.height_min) {
      queryBuilder.andWhere("supply.height >= :heightMin", {
        heightMin: filters.height_min,
      });
    }

    if (filters.height_max) {
      queryBuilder.andWhere("supply.height <= :heightMax", {
        heightMax: filters.height_max,
      });
    }

    // Apply date filters using block timestamp
    this.dateFilterService.applyDateFilters(
      queryBuilder,
      filters,
      "block.timestamp"
    );

    const sortField = filters.sort_by || SupplySortBy.DENOM;
    const sortOrder = filters.sort_order || SupplySortOrder.ASC;
    queryBuilder.orderBy(`supply.${sortField}`, sortOrder);

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const supplyRecords = await queryBuilder.getMany();
    const hasNext = supplyRecords.length === limit;

    const processedSupply = supplyRecords.map((supply) =>
      this.processSupplyResponse(supply)
    );

    return new PaginatedResponseDto(
      processedSupply,
      page,
      limit,
      -1,
      hasNext
    );
  }

  async getLatestSupply(): Promise<SupplyResponseDto[]> {
    // Get the latest height
    const latestBlock = await this.blockRepository
      .createQueryBuilder("block")
      .orderBy("block.height", "DESC")
      .limit(1)
      .getOne();

    if (!latestBlock) {
      return [];
    }

    // Get supply for the latest height
    const supplyRecords = await this.supplyRepository
      .createQueryBuilder("supply")
      .leftJoinAndSelect("supply.block", "block")
      .where("supply.height = :height", { height: latestBlock.height })
      .orderBy("supply.denom", "ASC")
      .getMany();

    return supplyRecords.map((supply) => this.processSupplyResponse(supply));
  }

  async getSupplyByDenom(denom: string): Promise<SupplyResponseDto[]> {
    const supplyRecords = await this.supplyRepository
      .createQueryBuilder("supply")
      .leftJoinAndSelect("supply.block", "block")
      .where("supply.denom = :denom", { denom })
      .orderBy("supply.height", "DESC")
      .getMany();

    return supplyRecords.map((supply) => this.processSupplyResponse(supply));
  }

  async getSupplyStatistics(): Promise<SupplyStatisticsDto> {
    return serializeDates({
      total_records: 0,
      total_denominations: 0,
      latest_height: 0,
      supply_by_denom: {},
      top_denominations: [],
      supply_growth: {
        daily_growth: "0",
        weekly_growth: "0",
        monthly_growth: "0",
      },
      supply_distribution: {
        native_tokens: 0,
        other_tokens: 0,
      },
      historical_data: [],
    });
  }

  private processSupplyResponse(supply: Supply): SupplyResponseDto {
    // Return the first coin as the primary response
    const primaryCoin = supply.coins[0];
    const response = {
      denom: primaryCoin?.denom || "unknown",
      amount: primaryCoin?.amount || "0",
      height: supply.height,
      timestamp: new Date(), // Supply doesn't have timestamp
    };

    return serializeDates(response);
  }
}
