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

    const sortField = filters.sort_by || TokenSortBy.NAME;
    const sortOrder = filters.sort_order || TokenSortOrder.ASC;
    queryBuilder.orderBy(`token.${sortField}`, sortOrder);

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const tokens = await queryBuilder.getMany();
    const hasNext = tokens.length === limit;

    const processedTokens = await Promise.all(
      tokens.map((token) => this.processTokenResponse(token))
    );

    return new PaginatedResponseDto(
      processedTokens,
      page,
      limit,
      -1,
      hasNext
    );
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

    queryBuilder.orderBy("unit.denom", "ASC");

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const units = await queryBuilder.getMany();
    const hasNext = units.length === limit;

    const processedUnits = units.map((unit) =>
      this.processTokenUnitResponse(unit)
    );

    return new PaginatedResponseDto(
      processedUnits,
      page,
      limit,
      -1,
      hasNext
    );
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

    queryBuilder.orderBy("price.last_updated", "DESC");

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const prices = await queryBuilder.getMany();
    const hasNext = prices.length === limit;

    const processedPrices = prices.map((price) =>
      this.processTokenPriceResponse(price)
    );

    return new PaginatedResponseDto(
      processedPrices,
      page,
      limit,
      -1,
      hasNext
    );
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

    queryBuilder.orderBy("history.timestamp", "DESC");

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const history = await queryBuilder.getMany();
    const hasNext = history.length === limit;

    const processedHistory = history.map((item) =>
      this.processTokenPriceHistoryResponse(item)
    );

    return new PaginatedResponseDto(
      processedHistory,
      page,
      limit,
      -1,
      hasNext
    );
  }

  async getTokenStatistics(): Promise<TokenStatisticsDto> {
    return serializeDates({
      total_tokens: 0,
      total_token_units: 0,
      total_market_cap: 0,
      total_volume_24h: 0,
      top_tokens_by_market_cap: [],
      top_tokens_by_volume: [],
      price_changes_24h: {
        gainers: 0,
        losers: 0,
        unchanged: 0,
      },
      average_price_change: 0,
    });
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
