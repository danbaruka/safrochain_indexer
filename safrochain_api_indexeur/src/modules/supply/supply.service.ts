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

    // Apply sorting
    const sortField = filters.sort_by || SupplySortBy.DENOM;
    const sortOrder = filters.sort_order || SupplySortOrder.ASC;
    queryBuilder.orderBy(`supply.${sortField}`, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const supplyRecords = await queryBuilder.getMany();

    // Process responses
    const processedSupply = supplyRecords.map((supply) =>
      this.processSupplyResponse(supply)
    );

    return new PaginatedResponseDto(processedSupply, page, limit, total);
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
    // Get total records
    const totalRecords = await this.supplyRepository.count();

    // Get total unique denominations
    const totalDenominations = await this.supplyRepository
      .createQueryBuilder("supply")
      .select("COUNT(DISTINCT supply.denom)", "count")
      .getRawOne();

    // Get latest height
    const latestHeight = await this.supplyRepository
      .createQueryBuilder("supply")
      .select("MAX(supply.height)", "height")
      .getRawOne();

    // Get latest supply by denomination
    const latestSupply = await this.supplyRepository
      .createQueryBuilder("supply")
      .leftJoinAndSelect("supply.block", "block")
      .where("supply.height = :height", { height: latestHeight.height })
      .orderBy("supply.denom", "ASC")
      .getMany();

    // Calculate supply by denomination
    const supplyByDenom = latestSupply.reduce((acc, supply) => {
      supply.coins.forEach((coin) => {
        acc[coin.denom] = coin.amount;
      });
      return acc;
    }, {});

    // Calculate total supply
    const totalSupply = latestSupply.reduce((sum, supply) => {
      return (
        sum +
        supply.coins.reduce((coinSum, coin) => {
          return coinSum + parseFloat(coin.amount);
        }, 0)
      );
    }, 0);

    // Calculate top denominations by supply
    const allCoins = latestSupply.flatMap((supply) => supply.coins);
    const topDenominations = allCoins
      .map((coin) => ({
        denom: coin.denom,
        amount: coin.amount,
        percentage:
          totalSupply > 0 ? (parseFloat(coin.amount) / totalSupply) * 100 : 0,
      }))
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
      .slice(0, 10);

    // Calculate supply growth (simplified - would need historical data)
    const supplyGrowth = {
      daily_growth: "0", // TODO: Calculate based on historical data
      weekly_growth: "0", // TODO: Calculate based on historical data
      monthly_growth: "0", // TODO: Calculate based on historical data
    };

    // Calculate supply distribution
    const nativeTokens = allCoins
      .filter((coin) => coin.denom === "usaf") // Assuming usaf is native
      .reduce((sum, coin) => sum + parseFloat(coin.amount), 0);

    const otherTokens = totalSupply - nativeTokens;

    const supplyDistribution = {
      native_tokens: totalSupply > 0 ? (nativeTokens / totalSupply) * 100 : 0,
      other_tokens: totalSupply > 0 ? (otherTokens / totalSupply) * 100 : 0,
    };

    // Get historical data (last 30 records)
    const historicalData = await this.supplyRepository
      .createQueryBuilder("supply")
      .leftJoinAndSelect("supply.block", "block")
      .orderBy("supply.height", "DESC")
      .limit(30)
      .getMany();

    const historicalDataProcessed = historicalData.map((supply) => ({
      height: supply.height,
      total_supply: supply.coins
        .reduce((sum, coin) => sum + parseFloat(coin.amount), 0)
        .toString(),
      timestamp: new Date().toISOString(), // Supply doesn't have timestamp
    }));

    const response = {
      total_records: totalRecords,
      total_denominations: parseInt(totalDenominations.count),
      latest_height: parseInt(latestHeight.height),
      supply_by_denom: supplyByDenom,
      top_denominations: topDenominations,
      supply_growth: supplyGrowth,
      supply_distribution: supplyDistribution,
      historical_data: historicalDataProcessed,
    };

    return serializeDates(response);
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
