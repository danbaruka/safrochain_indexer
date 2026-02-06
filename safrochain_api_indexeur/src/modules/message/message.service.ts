import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Message } from "../../entities/message.entity";
import { MessageType } from "../../entities/message-type.entity";
import { MessageParserService } from "../../common/services/message-parser.service";
import { DateFilterService } from "../../common/services/date-filter.service";
import {
  MessageResponseDto,
  MessageListDto,
  MessageTypeInfoDto,
  MessageStatisticsDto,
} from "../../dto/message.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import { MessageCategory } from "../../common/types/message.type";
import {
  buildPaginationMeta,
  normalizePagePagination,
} from "../../common/utils/pagination.util";

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(MessageType)
    private messageTypeRepository: Repository<MessageType>,
    private messageParserService: MessageParserService,
    private dateFilterService: DateFilterService,
    private configService: ConfigService
  ) {}

  async getMessages(
    filters: MessageListDto
  ): Promise<PaginatedResponseDto<MessageResponseDto>> {
    const queryBuilder = this.messageRepository
      .createQueryBuilder("message")
      .orderBy("message.height", "DESC");

    // Apply filters
    if (filters.type) {
      queryBuilder.andWhere("message.type = :type", { type: filters.type });
    }

    if (filters.types && filters.types.length > 0) {
      queryBuilder.andWhere("message.type IN (:...types)", {
        types: filters.types,
      });
    }

    if (filters.module) {
      const moduleTypes = this.messageParserService
        .getMessageTypesByModule(filters.module)
        .map((type) => type.type);
      if (moduleTypes.length > 0) {
        queryBuilder.andWhere("message.type IN (:...moduleTypes)", {
          moduleTypes,
        });
      }
    }

    if (filters.modules && filters.modules.length > 0) {
      const moduleTypes = filters.modules
        .flatMap((module) =>
          this.messageParserService.getMessageTypesByModule(module)
        )
        .map((type) => type.type);
      if (moduleTypes.length > 0) {
        queryBuilder.andWhere("message.type IN (:...moduleTypes)", {
          moduleTypes,
        });
      }
    }

    if (filters.category) {
      const categoryTypes = this.messageParserService
        .getMessageTypesByCategory(filters.category)
        .map((type) => type.type);
      if (categoryTypes.length > 0) {
        queryBuilder.andWhere("message.type IN (:...categoryTypes)", {
          categoryTypes,
        });
      }
    }

    if (filters.address) {
      queryBuilder.andWhere(
        ":address = ANY(message.involved_accounts_addresses)",
        {
          address: filters.address,
        }
      );
    }

    if (filters.height_from !== undefined) {
      queryBuilder.andWhere("message.height >= :height_from", {
        height_from: filters.height_from,
      });
    }

    if (filters.height_to !== undefined) {
      queryBuilder.andWhere("message.height <= :height_to", {
        height_to: filters.height_to,
      });
    }

    if (filters.denom) {
      queryBuilder.andWhere("message.value::text LIKE :denom", {
        denom: `%"denom":"${filters.denom}"%`,
      });
    }

    // Apply date filters using the date filter service
    this.dateFilterService.applyDateFilters(
      queryBuilder,
      filters,
      "message.timestamp"
    );

    const { page, limit, offset } = normalizePagePagination(
      filters,
      this.configService
    );
    queryBuilder.offset(offset).limit(limit);

    const [messages, total] = await queryBuilder.getManyAndCount();

    // Process messages for response
    const processedMessages = messages.map((message) => {
      const parsedMessage = this.messageParserService.parseMessage(
        message.type,
        message.value,
        message.involved_accounts_addresses
      );

      return {
        transaction_hash: message.transaction_hash,
        index: message.index,
        type: message.type,
        module: parsedMessage.module,
        label: parsedMessage.label,
        description: parsedMessage.description,
        category: parsedMessage.category,
        value: message.value,
        amount: parsedMessage.amount,
        involved_addresses: message.involved_accounts_addresses,
        height: message.height,
        partition_id: message.partition_id,
      };
    });

    return {
      data: processedMessages,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async getMessageTypes(): Promise<MessageTypeInfoDto[]> {
    const allTypes = this.messageParserService.getAllMessageTypes();

    // Get usage statistics from database
    const usageStats = await this.messageRepository
      .createQueryBuilder("message")
      .select("message.type", "type")
      .addSelect("COUNT(*)", "count")
      .groupBy("message.type")
      .getRawMany();

    const usageMap = new Map(
      usageStats.map((stat) => [stat.type, parseInt(stat.count)])
    );

    return allTypes.map((type) => ({
      type: type.type,
      module: type.module,
      label: type.label,
      description: type.description,
      category: type.category,
      fields: type.fields,
      usage_count: usageMap.get(type.type) || 0,
    }));
  }

  async getMessageTypeInfo(type: string): Promise<MessageTypeInfoDto | null> {
    const typeInfo = this.messageParserService.getMessageTypeInfo(type);

    if (!typeInfo) {
      return null;
    }

    // Get usage statistics
    const usageCount = await this.messageRepository.count({ where: { type } });

    return {
      type: typeInfo.type,
      module: typeInfo.module,
      label: typeInfo.label,
      description: typeInfo.description,
      category: typeInfo.category,
      fields: typeInfo.fields,
      usage_count: usageCount,
    };
  }

  async getMessageStatistics(): Promise<MessageStatisticsDto> {
    // Total messages
    const totalMessages = await this.messageRepository.count();

    // Unique types
    const uniqueTypes = await this.messageRepository
      .createQueryBuilder("message")
      .select("COUNT(DISTINCT message.type)", "count")
      .getRawOne();

    // Most common type
    const mostCommonType = await this.messageRepository
      .createQueryBuilder("message")
      .select("message.type", "type")
      .addSelect("COUNT(*)", "count")
      .groupBy("message.type")
      .orderBy("COUNT(*)", "DESC")
      .limit(1)
      .getRawOne();

    // Module statistics
    const moduleStats = await this.messageRepository
      .createQueryBuilder("message")
      .select("message.type", "type")
      .addSelect("COUNT(*)", "count")
      .groupBy("message.type")
      .getRawMany();

    const modules: { [module: string]: number } = {};
    const categories: { [category: string]: number } = {};

    moduleStats.forEach((stat) => {
      const typeInfo = this.messageParserService.getMessageTypeInfo(stat.type);
      if (typeInfo) {
        modules[typeInfo.module] =
          (modules[typeInfo.module] || 0) + parseInt(stat.count);
        categories[typeInfo.category] =
          (categories[typeInfo.category] || 0) + parseInt(stat.count);
      }
    });

    // Daily volume (last 30 days)
    const dailyVolume = await this.messageRepository
      .createQueryBuilder("message")
      .select("DATE(message.height)", "date")
      .addSelect("COUNT(*)", "count")
      .where("message.height >= :height", {
        height: await this.getHeightFromDaysAgo(30),
      })
      .groupBy("DATE(message.height)")
      .orderBy("DATE(message.height)", "DESC")
      .getRawMany();

    const dailyVolumeMap: { [date: string]: number } = {};
    dailyVolume.forEach((stat) => {
      dailyVolumeMap[stat.date] = parseInt(stat.count);
    });

    // Top addresses
    const topAddresses = await this.messageRepository
      .createQueryBuilder("message")
      .select("unnest(message.involved_accounts_addresses)", "address")
      .addSelect("COUNT(*)", "count")
      .groupBy("unnest(message.involved_accounts_addresses)")
      .orderBy("COUNT(*)", "DESC")
      .limit(10)
      .getRawMany();

    return {
      total_messages: totalMessages,
      unique_types: parseInt(uniqueTypes.count),
      most_common_type: mostCommonType?.type || "",
      most_common_type_count: parseInt(mostCommonType?.count || "0"),
      modules,
      categories,
      daily_volume: dailyVolumeMap,
      top_addresses: topAddresses.map((addr) => ({
        address: addr.address,
        count: parseInt(addr.count),
      })),
    };
  }

  async getMessagesByAddress(
    address: string,
    pagination: { page?: number; limit?: number }
  ) {
    const queryBuilder = this.messageRepository
      .createQueryBuilder("message")
      .where(":address = ANY(message.involved_accounts_addresses)", { address })
      .orderBy("message.height", "DESC");

    const { page, limit, offset } = normalizePagePagination(
      pagination,
      this.configService
    );
    queryBuilder.offset(offset).limit(limit);

    const [messages, total] = await queryBuilder.getManyAndCount();

    const processedMessages = messages.map((message) => {
      const parsedMessage = this.messageParserService.parseMessage(
        message.type,
        message.value,
        message.involved_accounts_addresses
      );

      return {
        transaction_hash: message.transaction_hash,
        index: message.index,
        type: message.type,
        module: parsedMessage.module,
        label: parsedMessage.label,
        description: parsedMessage.description,
        category: parsedMessage.category,
        value: message.value,
        amount: parsedMessage.amount,
        involved_addresses: message.involved_accounts_addresses,
        height: message.height,
        partition_id: message.partition_id,
      };
    });

    return {
      data: processedMessages,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async getMessagesByType(
    type: string,
    pagination: { page?: number; limit?: number }
  ) {
    const queryBuilder = this.messageRepository
      .createQueryBuilder("message")
      .where("message.type = :type", { type })
      .orderBy("message.height", "DESC");

    const { page, limit, offset } = normalizePagePagination(
      pagination,
      this.configService
    );
    queryBuilder.offset(offset).limit(limit);

    const [messages, total] = await queryBuilder.getManyAndCount();

    const processedMessages = messages.map((message) => {
      const parsedMessage = this.messageParserService.parseMessage(
        message.type,
        message.value,
        message.involved_accounts_addresses
      );

      return {
        transaction_hash: message.transaction_hash,
        index: message.index,
        type: message.type,
        module: parsedMessage.module,
        label: parsedMessage.label,
        description: parsedMessage.description,
        category: parsedMessage.category,
        value: message.value,
        amount: parsedMessage.amount,
        involved_addresses: message.involved_accounts_addresses,
        height: message.height,
        partition_id: message.partition_id,
      };
    });

    return {
      data: processedMessages,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async searchMessages(
    query: string,
    pagination: { page?: number; limit?: number }
  ) {
    const queryBuilder = this.messageRepository
      .createQueryBuilder("message")
      .where(
        "message.value::text ILIKE :query OR message.type ILIKE :query OR message.involved_accounts_addresses::text ILIKE :query",
        { query: `%${query}%` }
      )
      .orderBy("message.height", "DESC");

    const { page, limit, offset } = normalizePagePagination(
      pagination,
      this.configService
    );
    queryBuilder.offset(offset).limit(limit);

    const [messages, total] = await queryBuilder.getManyAndCount();

    const processedMessages = messages.map((message) => {
      const parsedMessage = this.messageParserService.parseMessage(
        message.type,
        message.value,
        message.involved_accounts_addresses
      );

      return {
        transaction_hash: message.transaction_hash,
        index: message.index,
        type: message.type,
        module: parsedMessage.module,
        label: parsedMessage.label,
        description: parsedMessage.description,
        category: parsedMessage.category,
        value: message.value,
        amount: parsedMessage.amount,
        involved_addresses: message.involved_accounts_addresses,
        height: message.height,
        partition_id: message.partition_id,
      };
    });

    return {
      data: processedMessages,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  private async getHeightFromDaysAgo(days: number): Promise<number> {
    // This is a simplified implementation
    // In a real scenario, you'd need to calculate the height based on block time
    const currentHeight = await this.messageRepository
      .createQueryBuilder("message")
      .select("MAX(message.height)", "max_height")
      .getRawOne();

    const estimatedHeight = currentHeight?.max_height || 0;
    const estimatedBlocksPerDay = 14400; // Assuming 6-second block time
    return Math.max(0, estimatedHeight - days * estimatedBlocksPerDay);
  }
}
