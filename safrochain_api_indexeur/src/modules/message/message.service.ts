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

    const { limit } = normalizePagePagination(filters, this.configService);

    if (filters.cursor) {
      queryBuilder.andWhere("message.height < :cursor", {
        cursor: filters.cursor,
      });
    }
    queryBuilder.limit(limit);

    const messages = await queryBuilder.getMany();
    const hasNext = messages.length === limit;
    const nextCursor =
      hasNext && messages.length > 0
        ? messages[messages.length - 1].height
        : undefined;

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
      meta: buildPaginationMeta(1, limit, -1, nextCursor),
    };
  }

  async getMessageTypes(): Promise<MessageTypeInfoDto[]> {
    const allTypes = this.messageParserService.getAllMessageTypes();

    return allTypes.map((type) => ({
      type: type.type,
      module: type.module,
      label: type.label,
      description: type.description,
      category: type.category,
      fields: type.fields,
      usage_count: 0,
    }));
  }

  async getMessageTypeInfo(type: string): Promise<MessageTypeInfoDto | null> {
    const typeInfo = this.messageParserService.getMessageTypeInfo(type);

    if (!typeInfo) {
      return null;
    }

    return {
      type: typeInfo.type,
      module: typeInfo.module,
      label: typeInfo.label,
      description: typeInfo.description,
      category: typeInfo.category,
      fields: typeInfo.fields,
      usage_count: 0,
    };
  }

  async getMessageStatistics(): Promise<MessageStatisticsDto> {
    return {
      total_messages: 0,
      unique_types: 0,
      most_common_type: "",
      most_common_type_count: 0,
      modules: {},
      categories: {},
      daily_volume: {},
      top_addresses: [],
    };
  }

  async getMessagesByAddress(
    address: string,
    pagination: { page?: number; limit?: number; cursor?: number }
  ) {
    const queryBuilder = this.messageRepository
      .createQueryBuilder("message")
      .where(":address = ANY(message.involved_accounts_addresses)", { address })
      .orderBy("message.height", "DESC");

    const { limit } = normalizePagePagination(pagination, this.configService);

    if (pagination.cursor) {
      queryBuilder.andWhere("message.height < :cursor", {
        cursor: pagination.cursor,
      });
    }
    queryBuilder.limit(limit);

    const messages = await queryBuilder.getMany();
    const hasNext = messages.length === limit;
    const nextCursor =
      hasNext && messages.length > 0
        ? messages[messages.length - 1].height
        : undefined;

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
      meta: buildPaginationMeta(1, limit, -1, nextCursor),
    };
  }

  async getMessagesByType(
    type: string,
    pagination: { page?: number; limit?: number; cursor?: number }
  ) {
    const queryBuilder = this.messageRepository
      .createQueryBuilder("message")
      .where("message.type = :type", { type })
      .orderBy("message.height", "DESC");

    const { limit } = normalizePagePagination(pagination, this.configService);

    if (pagination.cursor) {
      queryBuilder.andWhere("message.height < :cursor", {
        cursor: pagination.cursor,
      });
    }
    queryBuilder.limit(limit);

    const messages = await queryBuilder.getMany();
    const hasNext = messages.length === limit;
    const nextCursor =
      hasNext && messages.length > 0
        ? messages[messages.length - 1].height
        : undefined;

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
      meta: buildPaginationMeta(1, limit, -1, nextCursor),
    };
  }

  async searchMessages(
    query: string,
    pagination: { page?: number; limit?: number; cursor?: number }
  ) {
    const queryBuilder = this.messageRepository
      .createQueryBuilder("message")
      .where(
        "message.value::text ILIKE :query OR message.type ILIKE :query OR message.involved_accounts_addresses::text ILIKE :query",
        { query: `%${query}%` }
      )
      .orderBy("message.height", "DESC");

    const { limit } = normalizePagePagination(pagination, this.configService);

    if (pagination.cursor) {
      queryBuilder.andWhere("message.height < :cursor", {
        cursor: pagination.cursor,
      });
    }
    queryBuilder.limit(limit);

    const messages = await queryBuilder.getMany();
    const hasNext = messages.length === limit;
    const nextCursor =
      hasNext && messages.length > 0
        ? messages[messages.length - 1].height
        : undefined;

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
      meta: buildPaginationMeta(1, limit, -1, nextCursor),
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
