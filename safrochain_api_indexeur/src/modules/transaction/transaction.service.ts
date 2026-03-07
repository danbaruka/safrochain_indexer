import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  SelectQueryBuilder,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  In,
} from "typeorm";
import { Transaction } from "../../entities/transaction.entity";
import { Message } from "../../entities/message.entity";
import { Block } from "../../entities/block.entity";
import { TransactionResponseDto } from "../../dto/transaction.dto";
import { TransactionListDto } from "../../dto/transaction.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import {
  TransactionFilterDto,
  TransactionSearchDto,
  TransactionStatisticsDto,
  TransactionAnalyticsDto,
  TransactionCountsDto,
  TransactionSortBy,
  TransactionSortOrder,
} from "../../dto/transaction-filter.dto";
import { MessageParserService } from "../../common/services/message-parser.service";
import { serializeDates } from "../../common/utils/date-serializer.util";
import {
  buildPaginationMeta,
  normalizeOffsetPagination,
  normalizePagePagination,
} from "../../common/utils/pagination.util";

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
    private messageParserService: MessageParserService,
    private configService: ConfigService
  ) {}

  async getTransactionByHash(hash: string): Promise<TransactionResponseDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { hash },
      relations: ["block"],
    });

    if (!transaction) {
      throw new Error(`Transaction with hash ${hash} not found`);
    }

    // Get messages from transaction JSON or message table
    let messages: any[] = [];
    let involvedAddresses = new Set<string>();

    if (transaction.messages && transaction.messages.length > 0) {
      // Use messages from transaction JSON column
      messages = transaction.messages.map((msg: any, index: number) => ({
        type: msg["@type"] || msg.type || "unknown",
        value: msg,
        index: index,
        involved_addresses: this.extractAddressesFromMessage(msg),
      }));

      // Extract involved addresses
      messages.forEach((message) => {
        message.involved_addresses.forEach((addr: string) =>
          involvedAddresses.add(addr)
        );
      });
    } else {
      // Fallback to message table
      const dbMessages = await this.messageRepository.find({
        where: { transaction_hash: hash },
        order: { index: "ASC" },
      });

      messages = dbMessages.map((message) => ({
        type: message.type,
        value: message.value,
        index: message.index,
        involved_addresses: message.involved_accounts_addresses,
      }));

      dbMessages.forEach((message) => {
        message.involved_accounts_addresses.forEach((addr) =>
          involvedAddresses.add(addr)
        );
      });
    }

    // Calculate total fee
    const totalFee = this.calculateTotalFee(transaction.fee);

    const response = {
      hash: transaction.hash,
      height: transaction.height,
      block_hash: transaction.block?.hash || "",
      timestamp: transaction.block?.timestamp || new Date(),
      success: transaction.success,
      fee: totalFee,
      gas: {
        wanted: transaction.gas_wanted,
        used: transaction.gas_used,
        limit: transaction.gas_wanted,
      },
      memo: transaction.memo,
      messages: messages,
      logs: transaction.logs || [],
      involved_addresses: Array.from(involvedAddresses),
      involved_addresses_count: involvedAddresses.size,
      signer_infos: transaction.signer_infos,
      message_count: messages.length,
      message_types: [...new Set(messages.map((m) => m.type))],
      categories: [
        ...new Set(
          messages.map((m) => {
            const parsedMessage = this.messageParserService.parseMessage(
              m.type,
              m.value,
              m.involved_addresses
            );
            return parsedMessage.module;
          })
        ),
      ],
    };

    return serializeDates(response);
  }

  async getTransactions(
    filters: TransactionListDto
  ): Promise<PaginatedResponseDto<any>> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.block", "block")
      .orderBy("transaction.height", "DESC");

    // Apply filters
    if (filters.address) {
      queryBuilder.andWhere(
        "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.partition_id = transaction.partition_id AND :address = ANY(m.involved_accounts_addresses))",
        { address: filters.address }
      );
    }

    if (filters.message_type) {
      queryBuilder.andWhere(
        "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.partition_id = transaction.partition_id AND m.type = :messageType)",
        { messageType: filters.message_type }
      );
    }

    if (filters.success !== undefined) {
      queryBuilder.andWhere("transaction.success = :success", {
        success: filters.success,
      });
    }

    const { limit } = normalizePagePagination(filters, this.configService);

    // Cursor-based pagination only: no COUNT queries
    if (filters.cursor) {
      queryBuilder.andWhere("transaction.height < :cursor", {
        cursor: filters.cursor,
      });
    }
    queryBuilder.limit(limit);

    const transactions = await queryBuilder.getMany();
    const hasNext = transactions.length === limit;
    const nextCursor =
      hasNext && transactions.length > 0
        ? transactions[transactions.length - 1].height
        : undefined;

    const hashesNeedingPreload = transactions.filter(
      (tx) => !tx.messages || tx.messages.length === 0
    ).map((tx) => tx.hash);
    const messageMap = await this.preloadMessagesByHash(hashesNeedingPreload);

    // Process transactions for response
    const processedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        // Get messages from transaction JSON or message table
        let messages: any[] = [];
        let involvedAddresses = new Set<string>();

        if (transaction.messages && transaction.messages.length > 0) {
          // Use messages from transaction JSON column
          messages = transaction.messages.map((msg: any, index: number) => ({
            type: msg["@type"] || msg.type || "unknown",
            value: msg,
            index: index,
            involved_addresses: this.extractAddressesFromMessage(msg),
          }));

          // Extract involved addresses
          messages.forEach((message) => {
            message.involved_addresses.forEach((addr: string) =>
              involvedAddresses.add(addr)
            );
          });
        } else {
          const dbMessages = messageMap.get(transaction.hash) || [];
          messages = dbMessages.map((message) => ({
            type: message.type,
            value: message.value,
            index: message.index,
            involved_addresses: message.involved_accounts_addresses,
          }));

          dbMessages.forEach((message) => {
            message.involved_accounts_addresses.forEach((addr) =>
              involvedAddresses.add(addr)
            );
          });
        }

        return {
          hash: transaction.hash,
          height: transaction.height,
          block_hash: transaction.block?.hash || "",
          timestamp: transaction.block?.timestamp,
          success: transaction.success,
          gas_used: transaction.gas_used,
          gas_wanted: transaction.gas_wanted,
          fee: this.calculateTotalFee(transaction.fee),
          memo: transaction.memo,
          messages: messages,
          logs: transaction.logs || [],
          involved_addresses: Array.from(involvedAddresses),
          involved_addresses_count: involvedAddresses.size,
          signer_infos: transaction.signer_infos || [],
          message_count: messages.length,
          message_types: [...new Set(messages.map((m) => m.type))],
          categories: [
            ...new Set(
              messages.map((m) => {
                const parsedMessage = this.messageParserService.parseMessage(
                  m.type,
                  m.value,
                  m.involved_addresses
                );
                return parsedMessage.module;
              })
            ),
          ],
        };
      })
    );

    return {
      data: processedTransactions,
      meta: buildPaginationMeta(1, limit, -1, nextCursor),
    };
  }

  async getTransactionMessages(hash: string) {
    const messages = await this.messageRepository.find({
      where: { transaction_hash: hash },
      order: { index: "ASC" },
    });

    return messages.map((message) => ({
      index: message.index,
      type: message.type,
      value: message.value,
      involved_addresses: message.involved_accounts_addresses,
    }));
  }

  async getTransactionStatistics(hash: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { hash },
      relations: ["block"],
    });

    if (!transaction) {
      throw new Error(`Transaction with hash ${hash} not found`);
    }

    const messages = await this.messageRepository.find({
      where: { transaction_hash: hash },
    });

    const messageTypes = [...new Set(messages.map((m) => m.type))];
    const involvedAddresses = new Set<string>();
    messages.forEach((message) => {
      message.involved_accounts_addresses.forEach((addr) =>
        involvedAddresses.add(addr)
      );
    });

    return {
      hash: transaction.hash,
      height: transaction.height,
      timestamp: transaction.block?.timestamp,
      success: transaction.success,
      gas_efficiency:
        transaction.gas_wanted > 0
          ? transaction.gas_used / transaction.gas_wanted
          : 0,
      message_count: messages.length,
      message_types: messageTypes,
      involved_addresses_count: involvedAddresses.size,
      involved_addresses: Array.from(involvedAddresses),
      fee: this.calculateTotalFee(transaction.fee),
      logs_count: transaction.logs ? transaction.logs.length : 0,
    };
  }

  private calculateTotalFee(fee: any): any[] {
    if (!fee || !fee.amount) return [];

    if (Array.isArray(fee.amount)) {
      return fee.amount;
    }

    return [fee.amount];
  }

  // Advanced Transaction Filtering
  async getTransactionsAdvanced(
    filters: TransactionFilterDto
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    const { page, limit, offset } = normalizeOffsetPagination(
      filters,
      this.configService
    );

    const useCursor =
      filters.cursor &&
      (filters.sort_by === TransactionSortBy.HEIGHT || !filters.sort_by);

    // Cursor-based path: O(1) for deep pages, no count query
    if (useCursor) {
      const queryBuilder = this.buildTransactionQuery(filters);
      queryBuilder.andWhere("transaction.height < :cursor", {
        cursor: filters.cursor,
      });
      const sortField = this.getSortField(
        filters.sort_by || TransactionSortBy.HEIGHT
      );
      queryBuilder
        .orderBy(sortField, filters.sort_order || TransactionSortOrder.DESC)
        .limit(limit);

      const transactions = await queryBuilder.getMany();
      const hasNext = transactions.length === limit;
      const nextCursor =
        hasNext && transactions.length > 0
          ? transactions[transactions.length - 1].height
          : undefined;

      const hashesNeedingPreload = transactions.filter(
        (tx) => !tx.messages || tx.messages.length === 0
      ).map((tx) => tx.hash);
      const messageMap = await this.preloadMessagesByHash(hashesNeedingPreload);

      const processedTransactions = await Promise.all(
        transactions.map((tx) =>
          this.processTransactionResponse(tx, messageMap)
        )
      );

      return {
        data: processedTransactions,
        meta: buildPaginationMeta(1, limit, -1, nextCursor),
      };
    }

    const queryBuilder = this.buildTransactionQuery(filters);

    // Apply sorting
    const sortField = this.getSortField(
      filters.sort_by || TransactionSortBy.HEIGHT
    );
    queryBuilder.orderBy(
      sortField,
      filters.sort_order || TransactionSortOrder.DESC
    );
    queryBuilder.limit(limit).offset(offset);

    const transactions = await queryBuilder.getMany();
    const hasNext = transactions.length === limit;
    const nextCursor =
      hasNext &&
      transactions.length > 0 &&
      (filters.sort_by === TransactionSortBy.HEIGHT || !filters.sort_by)
        ? transactions[transactions.length - 1].height
        : undefined;

    const hashesNeedingPreload = transactions.filter(
      (tx) => !tx.messages || tx.messages.length === 0
    ).map((tx) => tx.hash);
    const messageMap = await this.preloadMessagesByHash(hashesNeedingPreload);

    const processedTransactions = await Promise.all(
      transactions.map((tx) => this.processTransactionResponse(tx, messageMap))
    );

    return {
      data: processedTransactions,
      meta: buildPaginationMeta(1, limit, -1, nextCursor, hasNext),
    };
  }

  // Transaction Search
  async searchTransactions(
    search: TransactionSearchDto
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    const { limit, offset } = normalizeOffsetPagination(
      search,
      this.configService
    );

    const queryBuilder = this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.block", "block")
      .leftJoin("transaction.messages_entities", "message");
    if (search.q) {
      queryBuilder.andWhere(
        "(transaction.hash ILIKE :query OR transaction.memo ILIKE :query OR message.value::text ILIKE :query)",
        { query: `%${search.q}%` }
      );
    }
    queryBuilder
      .orderBy("transaction.height", "DESC")
      .limit(limit)
      .offset(offset);

    const transactions = await queryBuilder.getMany();
    const hasNext = transactions.length === limit;
    const nextCursor =
      hasNext && transactions.length > 0
        ? transactions[transactions.length - 1].height
        : undefined;

    const hashesNeedingPreload = transactions.filter(
      (tx) => !tx.messages || tx.messages.length === 0
    ).map((tx) => tx.hash);
    const messageMap = await this.preloadMessagesByHash(hashesNeedingPreload);

    const processedTransactions = await Promise.all(
      transactions.map((tx) => this.processTransactionResponse(tx, messageMap))
    );

    return {
      data: processedTransactions,
      meta: buildPaginationMeta(1, limit, -1, nextCursor),
    };
  }

  // Transactions by Message Type
  async getTransactionsByMessageType(
    messageType: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    const { limit: safeLimit, offset: safeOffset } =
      normalizeOffsetPagination({ limit, offset }, this.configService);

    const queryBuilder = this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.block", "block")
      .leftJoin("transaction.messages_entities", "message")
      .where(
        "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.type = :messageType)"
      )
      .setParameter("messageType", messageType)
      .orderBy("transaction.height", "DESC")
      .limit(safeLimit)
      .offset(safeOffset);

    const transactions = await queryBuilder.getMany();
    const hasNext = transactions.length === safeLimit;
    const nextCursor =
      hasNext && transactions.length > 0
        ? transactions[transactions.length - 1].height
        : undefined;

    const hashesNeedingPreload = transactions.filter(
      (tx) => !tx.messages || tx.messages.length === 0
    ).map((tx) => tx.hash);
    const messageMap = await this.preloadMessagesByHash(hashesNeedingPreload);

    const processedTransactions = await Promise.all(
      transactions.map((tx) => this.processTransactionResponse(tx, messageMap))
    );

    return {
      data: processedTransactions,
      meta: buildPaginationMeta(1, safeLimit, -1, nextCursor),
    };
  }

  // Transactions by Validator
  async getTransactionsByValidator(
    validatorAddress: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    const { limit: safeLimit, offset: safeOffset } =
      normalizeOffsetPagination({ limit, offset }, this.configService);

    const queryBuilder = this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.block", "block")
      .leftJoin("transaction.messages_entities", "message")
      .where(
        "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND :validatorAddress = ANY(m.involved_accounts_addresses))"
      )
      .setParameter("validatorAddress", validatorAddress)
      .orderBy("transaction.height", "DESC")
      .limit(safeLimit)
      .offset(safeOffset);

    const transactions = await queryBuilder.getMany();
    const hasNext = transactions.length === safeLimit;
    const nextCursor =
      hasNext && transactions.length > 0
        ? transactions[transactions.length - 1].height
        : undefined;

    const hashesNeedingPreload = transactions.filter(
      (tx) => !tx.messages || tx.messages.length === 0
    ).map((tx) => tx.hash);
    const messageMap = await this.preloadMessagesByHash(hashesNeedingPreload);

    const processedTransactions = await Promise.all(
      transactions.map((tx) => this.processTransactionResponse(tx, messageMap))
    );

    return {
      data: processedTransactions,
      meta: buildPaginationMeta(1, safeLimit, -1, nextCursor),
    };
  }

  // Transactions by Block Range
  async getTransactionsByBlockRange(
    minHeight: number,
    maxHeight: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    const { limit: rangeLimit, offset: rangeOffset } =
      normalizeOffsetPagination({ limit, offset }, this.configService);

    const queryBuilder = this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.block", "block")
      .where("transaction.height BETWEEN :minHeight AND :maxHeight")
      .setParameters({ minHeight, maxHeight })
      .orderBy("transaction.height", "DESC")
      .limit(rangeLimit)
      .offset(rangeOffset);

    const transactions = await queryBuilder.getMany();
    const hasNext = transactions.length === rangeLimit;
    const nextCursor =
      hasNext && transactions.length > 0
        ? transactions[transactions.length - 1].height
        : undefined;

    const hashesNeedingPreload = transactions.filter(
      (tx) => !tx.messages || tx.messages.length === 0
    ).map((tx) => tx.hash);
    const messageMap = await this.preloadMessagesByHash(hashesNeedingPreload);

    const processedTransactions = await Promise.all(
      transactions.map((tx) => this.processTransactionResponse(tx, messageMap))
    );

    return {
      data: processedTransactions,
      meta: buildPaginationMeta(1, rangeLimit, -1, nextCursor),
    };
  }

  // Transaction counts (last 24h and 7d)
  async getTransactionCountsRecent(): Promise<TransactionCountsDto> {
    const [last24hResult, last7dResult] = await Promise.all([
      this.transactionRepository
        .createQueryBuilder("transaction")
        .innerJoin("transaction.block", "block")
        .where("block.timestamp >= NOW() - INTERVAL '24 hours'")
        .getCount(),
      this.transactionRepository
        .createQueryBuilder("transaction")
        .innerJoin("transaction.block", "block")
        .where("block.timestamp >= NOW() - INTERVAL '7 days'")
        .getCount(),
    ]);

    return {
      last_24h: last24hResult,
      last_7d: last7dResult,
    };
  }

  // Global Transaction Statistics (placeholder - no full-table scans)
  async getGlobalTransactionStatistics(): Promise<TransactionStatisticsDto> {
    return {
      total_transactions: 0,
      successful_transactions: 0,
      failed_transactions: 0,
      success_rate: 0,
      total_gas_used: "0",
      total_gas_wanted: "0",
      avg_gas_used: "0",
      avg_gas_wanted: "0",
      total_fees: [],
      top_message_types: [],
      top_addresses: [],
      daily_volume: {},
      hourly_volume: {},
    };
  }

  // Transaction Analytics (placeholder - no full-table scans)
  async getTransactionAnalytics(): Promise<TransactionAnalyticsDto> {
    return {
      volume_over_time: [],
      gas_efficiency: {
        avg_efficiency: 0,
        min_efficiency: 0,
        max_efficiency: 0,
      },
      fee_analysis: [],
      message_type_distribution: [],
    };
  }

  // Helper Methods
  private buildTransactionQuery(
    filters: TransactionFilterDto
  ): SelectQueryBuilder<Transaction> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.block", "block")
      .leftJoin("transaction.messages_entities", "message");

    // Apply filters
    if (filters.success !== undefined) {
      queryBuilder.andWhere("transaction.success = :success", {
        success: filters.success,
      });
    }

    if (filters.min_height) {
      queryBuilder.andWhere("transaction.height >= :minHeight", {
        minHeight: filters.min_height,
      });
    }

    if (filters.max_height) {
      queryBuilder.andWhere("transaction.height <= :maxHeight", {
        maxHeight: filters.max_height,
      });
    }

    if (filters.min_gas_used) {
      queryBuilder.andWhere("transaction.gas_used >= :minGasUsed", {
        minGasUsed: filters.min_gas_used,
      });
    }

    if (filters.max_gas_used) {
      queryBuilder.andWhere("transaction.gas_used <= :maxGasUsed", {
        maxGasUsed: filters.max_gas_used,
      });
    }

    if (filters.min_gas_wanted) {
      queryBuilder.andWhere("transaction.gas_wanted >= :minGasWanted", {
        minGasWanted: filters.min_gas_wanted,
      });
    }

    if (filters.max_gas_wanted) {
      queryBuilder.andWhere("transaction.gas_wanted <= :maxGasWanted", {
        maxGasWanted: filters.max_gas_wanted,
      });
    }

    if (filters.memo) {
      queryBuilder.andWhere("transaction.memo ILIKE :memo", {
        memo: `%${filters.memo}%`,
      });
    }

    if (filters.signer) {
      queryBuilder.andWhere("transaction.signer_infos::text ILIKE :signer", {
        signer: `%${filters.signer}%`,
      });
    }

    if (filters.message_types && filters.message_types.length > 0) {
      queryBuilder.andWhere(
        "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.type = ANY(:messageTypes))",
        { messageTypes: filters.message_types }
      );
    }

    if (filters.addresses && filters.addresses.length > 0) {
      queryBuilder.andWhere(
        "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.involved_accounts_addresses && :addresses)",
        { addresses: filters.addresses }
      );
    }

    if (filters.validator) {
      queryBuilder.andWhere(
        "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND :validator = ANY(m.involved_accounts_addresses))",
        { validator: filters.validator }
      );
    }

    if (filters.date_from || filters.date_to) {
      if (filters.date_from) {
        queryBuilder.andWhere("block.timestamp >= :dateFrom", {
          dateFrom: new Date(filters.date_from),
        });
      }
      if (filters.date_to) {
        queryBuilder.andWhere("block.timestamp <= :dateTo", {
          dateTo: new Date(filters.date_to),
        });
      }
    }

    return queryBuilder;
  }

  private getSortField(sortBy: TransactionSortBy): string {
    switch (sortBy) {
      case TransactionSortBy.HEIGHT:
        return "transaction.height";
      case TransactionSortBy.TIMESTAMP:
        return "block.timestamp";
      case TransactionSortBy.GAS_USED:
        return "transaction.gas_used";
      case TransactionSortBy.GAS_WANTED:
        return "transaction.gas_wanted";
      case TransactionSortBy.FEE:
        return "transaction.fee";
      default:
        return "transaction.height";
    }
  }

  private async preloadMessagesByHash(
    hashes: string[]
  ): Promise<Map<string, Message[]>> {
    if (hashes.length === 0) {
      return new Map();
    }

    const messages = await this.messageRepository.find({
      where: { transaction_hash: In(hashes) },
      order: { index: "ASC" },
    });

    const messageMap = new Map<string, Message[]>();
    messages.forEach((message) => {
      const list = messageMap.get(message.transaction_hash) || [];
      list.push(message);
      messageMap.set(message.transaction_hash, list);
    });

    return messageMap;
  }

  private async processTransactionResponse(
    transaction: Transaction,
    messageMap?: Map<string, Message[]>
  ): Promise<TransactionResponseDto> {
    // Get messages from transaction JSON or message table
    let messages: any[] = [];
    let involvedAddresses = new Set<string>();

    if (transaction.messages && transaction.messages.length > 0) {
      // Use messages from transaction JSON column
      messages = transaction.messages.map((msg: any, index: number) => ({
        type: msg["@type"] || msg.type || "unknown",
        value: msg,
        index: index,
        involved_addresses: this.extractAddressesFromMessage(msg),
      }));

      // Extract involved addresses
      messages.forEach((message) => {
        message.involved_addresses.forEach((addr: string) =>
          involvedAddresses.add(addr)
        );
      });
    } else {
      // Fallback to message table (prefer preloaded map)
      const dbMessages =
        messageMap?.get(transaction.hash) ??
        (await this.messageRepository.find({
          where: { transaction_hash: transaction.hash },
          order: { index: "ASC" },
        }));

      messages = dbMessages.map((message) => ({
        type: message.type,
        value: message.value,
        index: message.index,
        involved_addresses: message.involved_accounts_addresses,
      }));

      dbMessages.forEach((message) => {
        message.involved_accounts_addresses.forEach((addr) =>
          involvedAddresses.add(addr)
        );
      });
    }

    const totalFee = this.calculateTotalFee(transaction.fee);

    return {
      hash: transaction.hash,
      height: transaction.height,
      block_hash: transaction.block?.hash || "",
      timestamp: transaction.block?.timestamp || new Date(),
      success: transaction.success,
      fee: totalFee,
      gas: {
        wanted: transaction.gas_wanted,
        used: transaction.gas_used,
        limit: transaction.gas_wanted,
      },
      memo: transaction.memo,
      messages: messages,
      logs: transaction.logs || [],
      involved_addresses: Array.from(involvedAddresses),
      involved_addresses_count: involvedAddresses.size,
      signer_infos: transaction.signer_infos,
      message_count: messages.length,
      message_types: [...new Set(messages.map((m) => m.type))],
      categories: [
        ...new Set(
          messages.map((m) => {
            const parsedMessage = this.messageParserService.parseMessage(
              m.type,
              m.value,
              m.involved_addresses
            );
            return parsedMessage.module;
          })
        ),
      ],
    };
  }

  private async getGasStatistics() {
    const result = await this.transactionRepository
      .createQueryBuilder("transaction")
      .select([
        "SUM(transaction.gas_used) as total_gas_used",
        "SUM(transaction.gas_wanted) as total_gas_wanted",
        "AVG(transaction.gas_used) as avg_gas_used",
        "AVG(transaction.gas_wanted) as avg_gas_wanted",
      ])
      .getRawOne();

    return {
      total_gas_used: result.total_gas_used || "0",
      total_gas_wanted: result.total_gas_wanted || "0",
      avg_gas_used: Math.round(Number(result.avg_gas_used) || 0).toString(),
      avg_gas_wanted: Math.round(Number(result.avg_gas_wanted) || 0).toString(),
    };
  }

  private async getFeeStatistics() {
    // This would need more complex logic to aggregate fees by denomination
    // For now, return a simple structure
    return [
      {
        denom: "usaf",
        amount: "0",
      },
    ];
  }

  private async getMessageTypeStatistics() {
    const result = await this.messageRepository
      .createQueryBuilder("message")
      .select("message.type", "type")
      .addSelect("COUNT(*)", "count")
      .groupBy("message.type")
      .orderBy("count", "DESC")
      .limit(10)
      .getRawMany();

    return result.map((row) => ({
      type: row.type,
      count: parseInt(row.count),
    }));
  }

  private async getAddressStatistics() {
    const result = await this.messageRepository
      .createQueryBuilder("message")
      .select("unnest(message.involved_accounts_addresses)", "address")
      .addSelect("COUNT(*)", "count")
      .groupBy("address")
      .orderBy("count", "DESC")
      .limit(10)
      .getRawMany();

    return result.map((row) => ({
      address: row.address,
      count: parseInt(row.count),
    }));
  }

  private async getDailyVolume() {
    const result = await this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoin("transaction.block", "block")
      .select("DATE(block.timestamp)", "date")
      .addSelect("COUNT(*)", "count")
      .groupBy("DATE(block.timestamp)")
      .orderBy("date", "DESC")
      .limit(30)
      .getRawMany();

    const volume: Record<string, number> = {};
    result.forEach((row) => {
      volume[row.date] = parseInt(row.count);
    });

    return volume;
  }

  private async getHourlyVolume() {
    const result = await this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoin("transaction.block", "block")
      .select("DATE_TRUNC('hour', block.timestamp)", "hour")
      .addSelect("COUNT(*)", "count")
      .where("block.timestamp >= NOW() - INTERVAL '24 hours'")
      .groupBy("DATE_TRUNC('hour', block.timestamp)")
      .orderBy("hour", "DESC")
      .getRawMany();

    const volume: Record<string, number> = {};
    result.forEach((row) => {
      volume[row.hour] = parseInt(row.count);
    });

    return volume;
  }

  private async getVolumeOverTime() {
    const result = await this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoin("transaction.block", "block")
      .select("DATE(block.timestamp)", "date")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(transaction.gas_used)", "gas_used")
      .groupBy("DATE(block.timestamp)")
      .orderBy("date", "DESC")
      .limit(30)
      .getRawMany();

    return result.map((row) => ({
      date: row.date,
      count: parseInt(row.count),
      gas_used: row.gas_used || "0",
      fees: [], // Would need more complex logic
    }));
  }

  private async getGasEfficiencyAnalysis() {
    const result = await this.transactionRepository
      .createQueryBuilder("transaction")
      .select([
        "AVG(transaction.gas_used::float / NULLIF(transaction.gas_wanted, 0)) as avg_efficiency",
        "MIN(transaction.gas_used::float / NULLIF(transaction.gas_wanted, 0)) as min_efficiency",
        "MAX(transaction.gas_used::float / NULLIF(transaction.gas_wanted, 0)) as max_efficiency",
      ])
      .getRawOne();

    return {
      avg_efficiency: Number(result.avg_efficiency) || 0,
      min_efficiency: Number(result.min_efficiency) || 0,
      max_efficiency: Number(result.max_efficiency) || 0,
    };
  }

  private async getFeeAnalysis() {
    // This would need more complex logic to analyze fees by denomination
    return [
      {
        denom: "usaf",
        total_amount: "0",
        avg_amount: "0",
        min_amount: "0",
        max_amount: "0",
      },
    ];
  }

  private async getMessageTypeDistribution() {
    const total = await this.messageRepository.count();
    const result = await this.messageRepository
      .createQueryBuilder("message")
      .select("message.type", "type")
      .addSelect("COUNT(*)", "count")
      .groupBy("message.type")
      .orderBy("count", "DESC")
      .getRawMany();

    return result.map((row) => ({
      type: row.type,
      count: parseInt(row.count),
      percentage:
        total > 0
          ? Number(((parseInt(row.count) / total) * 100).toFixed(2))
          : 0,
    }));
  }

  private extractAddressesFromMessage(message: any): string[] {
    const addresses = new Set<string>();

    // Common address fields in Cosmos messages
    const addressFields = [
      "proposer",
      "depositor",
      "voter",
      "delegator_address",
      "validator_address",
      "from_address",
      "to_address",
      "sender",
      "receiver",
      "granter",
      "grantee",
      "authority",
      "admin",
      "owner",
      "creator",
      "signer",
      "payer",
    ];

    const extractAddresses = (obj: any) => {
      if (
        typeof obj === "string" &&
        (obj.startsWith("addr_") ||
          obj.startsWith("cosmos") ||
          obj.startsWith("safro"))
      ) {
        addresses.add(obj);
      } else if (typeof obj === "object" && obj !== null) {
        for (const key in obj) {
          if (addressFields.includes(key) && typeof obj[key] === "string") {
            addresses.add(obj[key]);
          } else {
            extractAddresses(obj[key]);
          }
        }
      }
    };

    extractAddresses(message);
    return Array.from(addresses);
  }
}
