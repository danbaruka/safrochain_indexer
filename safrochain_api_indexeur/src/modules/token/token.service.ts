import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Token } from "../../entities/token.entity";
import { TokenUnit } from "../../entities/token-unit.entity";
import { TokenPrice } from "../../entities/token-price.entity";
import { TokenPriceHistory } from "../../entities/token-price-history.entity";
import {
  TokenListDto,
  TokenResponseDto,
  TokenUnitListDto,
  TokenUnitResponseDto,
  TokenPriceListDto,
  TokenPriceResponseDto,
  TokenPriceHistoryListDto,
  TokenPriceHistoryResponseDto,
  TokenStatisticsDto,
  TokenSortBy,
  TokenSortOrder,
} from "../../dto/token.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import { DateFilterService } from "../../common/services/date-filter.service";
import { serializeDates } from "../../common/utils/date-serializer.util";

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    @InjectRepository(TokenUnit)
    private tokenUnitRepository: Repository<TokenUnit>,
    @InjectRepository(TokenPrice)
    private tokenPriceRepository: Repository<TokenPrice>,
    @InjectRepository(TokenPriceHistory)
    private tokenPriceHistoryRepository: Repository<TokenPriceHistory>,
    private dateFilterService: DateFilterService
  ) {}

  async getTokens(
    filters: TokenListDto
  ): Promise<PaginatedResponseDto<TokenResponseDto>> {
    const queryBuilder = this.tokenRepository
      .createQueryBuilder("token")
      .leftJoinAndSelect("token.units", "units")
      .leftJoinAndSelect("units.token", "unitToken");

    // Apply filters
    if (filters.name) {
      queryBuilder.andWhere("token.name ILIKE :name", {
        name: `%${filters.name}%`,
      });
    }

    if (filters.names && filters.names.length > 0) {
      queryBuilder.andWhere("token.name IN (:...names)", {
        names: filters.names,
      });
    }

    // Apply date filters
    this.dateFilterService.applyDateFilters(
      queryBuilder,
      filters,
      "token.height"
    );

    // Apply sorting
    const sortField = filters.sort_by || TokenSortBy.NAME;
    const sortOrder = filters.sort_order || TokenSortOrder.ASC;
    queryBuilder.orderBy(`token.${sortField}`, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const tokens = await queryBuilder.getMany();

    // Process responses
    const processedTokens = await Promise.all(
      tokens.map((token) => this.processTokenResponse(token))
    );

    return new PaginatedResponseDto(processedTokens, page, limit, total);
  }

  async getTokenByName(name: string): Promise<TokenResponseDto | null> {
    const token = await this.tokenRepository
      .createQueryBuilder("token")
      .leftJoinAndSelect("token.units", "units")
      .leftJoinAndSelect("units.token", "unitToken")
      .where("token.name = :name", { name })
      .getOne();

    if (!token) {
      return null;
    }

    return this.processTokenResponse(token);
  }

  async getTokenUnits(
    filters: TokenUnitListDto
  ): Promise<PaginatedResponseDto<TokenUnitResponseDto>> {
    const queryBuilder = this.tokenUnitRepository
      .createQueryBuilder("unit")
      .leftJoinAndSelect("unit.token", "token");

    // Apply filters
    if (filters.token_name) {
      queryBuilder.andWhere("unit.token_name = :tokenName", {
        tokenName: filters.token_name,
      });
    }

    if (filters.denom) {
      queryBuilder.andWhere("unit.denom = :denom", {
        denom: filters.denom,
      });
    }

    if (filters.price_id) {
      queryBuilder.andWhere("unit.price_id = :priceId", {
        priceId: filters.price_id,
      });
    }

    if (filters.denoms && filters.denoms.length > 0) {
      queryBuilder.andWhere("unit.denom IN (:...denoms)", {
        denoms: filters.denoms,
      });
    }

    if (filters.exponent_min !== undefined) {
      queryBuilder.andWhere("unit.exponent >= :exponentMin", {
        exponentMin: filters.exponent_min,
      });
    }

    if (filters.exponent_max !== undefined) {
      queryBuilder.andWhere("unit.exponent <= :exponentMax", {
        exponentMax: filters.exponent_max,
      });
    }

    // Apply date filters
    this.dateFilterService.applyDateFilters(
      queryBuilder,
      filters,
      "unit.token_name" // Using token_name as a proxy for date filtering
    );

    // Apply sorting
    queryBuilder.orderBy("unit.denom", "ASC");

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const units = await queryBuilder.getMany();

    // Process responses
    const processedUnits = units.map((unit) =>
      this.processTokenUnitResponse(unit)
    );

    return new PaginatedResponseDto(processedUnits, page, limit, total);
  }

  async getTokenPrices(
    filters: TokenPriceListDto
  ): Promise<PaginatedResponseDto<TokenPriceResponseDto>> {
    const queryBuilder = this.tokenPriceRepository
      .createQueryBuilder("price")
      .leftJoinAndSelect("price.tokenUnit", "tokenUnit");

    // Apply filters
    if (filters.price_id) {
      queryBuilder.andWhere("price.price_id = :priceId", {
        priceId: filters.price_id,
      });
    }

    if (filters.price_ids && filters.price_ids.length > 0) {
      queryBuilder.andWhere("price.price_id IN (:...priceIds)", {
        priceIds: filters.price_ids,
      });
    }

    if (filters.price_min !== undefined) {
      queryBuilder.andWhere("price.price >= :priceMin", {
        priceMin: filters.price_min,
      });
    }

    if (filters.price_max !== undefined) {
      queryBuilder.andWhere("price.price <= :priceMax", {
        priceMax: filters.price_max,
      });
    }

    // Apply date filters
    this.dateFilterService.applyDateFilters(
      queryBuilder,
      filters,
      "price.last_updated"
    );

    // Apply sorting
    queryBuilder.orderBy("price.last_updated", "DESC");

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const prices = await queryBuilder.getMany();

    // Process responses
    const processedPrices = prices.map((price) =>
      this.processTokenPriceResponse(price)
    );

    return new PaginatedResponseDto(processedPrices, page, limit, total);
  }

  async getTokenPriceHistory(
    filters: TokenPriceHistoryListDto
  ): Promise<PaginatedResponseDto<TokenPriceHistoryResponseDto>> {
    const queryBuilder = this.tokenPriceHistoryRepository
      .createQueryBuilder("history")
      .leftJoinAndSelect("history.tokenUnit", "tokenUnit");

    // Apply filters
    if (filters.price_id) {
      queryBuilder.andWhere("history.price_id = :priceId", {
        priceId: filters.price_id,
      });
    }

    if (filters.price_ids && filters.price_ids.length > 0) {
      queryBuilder.andWhere("history.price_id IN (:...priceIds)", {
        priceIds: filters.price_ids,
      });
    }

    if (filters.price_min !== undefined) {
      queryBuilder.andWhere("history.price >= :priceMin", {
        priceMin: filters.price_min,
      });
    }

    if (filters.price_max !== undefined) {
      queryBuilder.andWhere("history.price <= :priceMax", {
        priceMax: filters.price_max,
      });
    }

    // Apply date filters
    this.dateFilterService.applyDateFilters(
      queryBuilder,
      filters,
      "history.timestamp"
    );

    // Apply sorting
    queryBuilder.orderBy("history.timestamp", "DESC");

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const history = await queryBuilder.getMany();

    // Process responses
    const processedHistory = history.map((item) =>
      this.processTokenPriceHistoryResponse(item)
    );

    return new PaginatedResponseDto(processedHistory, page, limit, total);
  }

  async getTokenStatistics(): Promise<TokenStatisticsDto> {
    // Get total tokens
    const totalTokens = await this.tokenRepository.count();

    // Get total token units
    const totalTokenUnits = await this.tokenUnitRepository.count();

    // Get current prices for statistics
    const prices = await this.tokenPriceRepository
      .createQueryBuilder("price")
      .leftJoinAndSelect("price.tokenUnit", "tokenUnit")
      .getMany();

    // Calculate statistics
    const totalMarketCap = prices.reduce((sum, price) => {
      return sum + (price.market_cap || 0);
    }, 0);

    const totalVolume24h = 0; // volume_24h not available in entity

    // Top tokens by market cap
    const topTokensByMarketCap = prices
      .filter((price) => price.market_cap)
      .sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0))
      .slice(0, 10)
      .map((price) => ({
        name: price.tokenUnit?.token?.name || "Unknown",
        denom: price.tokenUnit?.denom || "unknown",
        market_cap: price.market_cap || 0,
        price: price.price,
      }));

    // Top tokens by volume (not available in entity)
    const topTokensByVolume = [];

    // Price changes analysis (not available in entity)
    const gainers = 0;
    const losers = 0;
    const unchanged = prices.length;
    const averagePriceChange = 0;

    const response = {
      total_tokens: totalTokens,
      total_token_units: totalTokenUnits,
      total_market_cap: totalMarketCap,
      total_volume_24h: totalVolume24h,
      top_tokens_by_market_cap: topTokensByMarketCap,
      top_tokens_by_volume: topTokensByVolume,
      price_changes_24h: {
        gainers,
        losers,
        unchanged,
      },
      average_price_change: averagePriceChange,
    };

    return serializeDates(response);
  }

  private async processTokenResponse(token: Token): Promise<TokenResponseDto> {
    // Get current price information
    const priceInfo = await this.tokenPriceRepository
      .createQueryBuilder("price")
      .leftJoinAndSelect("price.tokenUnit", "tokenUnit")
      .where("tokenUnit.token_name = :tokenName", { tokenName: token.name })
      .orderBy("price.last_updated", "DESC")
      .getOne();

    const response = {
      name: token.name,
      description: "", // Not available in entity
      symbol: "", // Not available in entity
      logo: "", // Not available in entity
      website: "", // Not available in entity
      units:
        token.units?.map((unit) => ({
          denom: unit.denom,
          exponent: unit.exponent,
          aliases: unit.aliases,
          price_id: unit.price_id,
        })) || [],
      price_info: priceInfo
        ? {
            price: priceInfo.price,
            market_cap: priceInfo.market_cap,
            volume_24h: 0, // Not available in entity
            change_24h: 0, // Not available in entity
          }
        : undefined,
      height: 0, // Not available in entity
    };

    return serializeDates(response);
  }

  private processTokenUnitResponse(unit: TokenUnit): TokenUnitResponseDto {
    const response = {
      token_name: unit.token_name,
      denom: unit.denom,
      exponent: unit.exponent,
      aliases: unit.aliases,
      price_id: unit.price_id,
      token: unit.token
        ? {
            name: unit.token.name,
            symbol: "", // Not available in entity
            description: "", // Not available in entity
          }
        : undefined,
    };

    return serializeDates(response);
  }

  private processTokenPriceResponse(price: TokenPrice): TokenPriceResponseDto {
    const response = {
      price_id: price.unit_name, // Using unit_name as price_id
      price: price.price,
      market_cap: price.market_cap,
      volume_24h: 0, // Not available in entity
      change_24h: 0, // Not available in entity
      last_updated: price.timestamp,
      height: 0, // Not available in entity
    };

    return serializeDates(response);
  }

  private processTokenPriceHistoryResponse(
    history: TokenPriceHistory
  ): TokenPriceHistoryResponseDto {
    const response = {
      price_id: history.unit_name || "", // Using unit_name as price_id
      price: history.price,
      market_cap: history.market_cap,
      volume: 0, // Not available in entity
      timestamp: history.timestamp,
      height: 0, // Not available in entity
    };

    return serializeDates(response);
  }
}
