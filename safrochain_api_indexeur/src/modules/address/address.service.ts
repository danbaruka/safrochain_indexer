import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Account } from "../../entities/account.entity";
import { VestingAccount } from "../../entities/vesting-account.entity";
import { Transaction } from "../../entities/transaction.entity";
import { Message } from "../../entities/message.entity";
import { Proposal } from "../../entities/proposal.entity";
import { ProposalDeposit } from "../../entities/proposal-deposit.entity";
import { ProposalVote } from "../../entities/proposal-vote.entity";
import { AddressResponseDto } from "../../dto/address.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import {
  AddressTransactionFilterDto,
  AddressTransactionResponseDto,
  AddressTransactionStatisticsDto,
  AddressTransactionSortBy,
  AddressTransactionSortOrder,
} from "../../dto/address-transaction-filter.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import { MessageParserService } from "../../common/services/message-parser.service";
import { serializeDates } from "../../common/utils/date-serializer.util";
import {
  buildPaginationMeta,
  normalizeOffsetPagination,
  normalizePagePagination,
} from "../../common/utils/pagination.util";

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(VestingAccount)
    private vestingAccountRepository: Repository<VestingAccount>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Proposal)
    private proposalRepository: Repository<Proposal>,
    @InjectRepository(ProposalDeposit)
    private proposalDepositRepository: Repository<ProposalDeposit>,
    @InjectRepository(ProposalVote)
    private proposalVoteRepository: Repository<ProposalVote>,
    private messageParserService: MessageParserService,
    private configService: ConfigService
  ) {}

  async getAddressInfo(address: string): Promise<AddressResponseDto> {
    // Get account info
    const account = await this.accountRepository.findOne({
      where: { address },
      relations: ["vestingAccounts", "vestingAccounts.vestingPeriods"],
    });

    if (!account) {
      throw new Error(`Account with address ${address} not found`);
    }

    // Get vesting info
    const vestingAccount = await this.vestingAccountRepository.findOne({
      where: { address },
      relations: ["vestingPeriods"],
    });

    // Get transaction statistics
    const transactionStats = await this.getTransactionStatistics(address);

    // Get recent transactions
    const recentTransactions = await this.getRecentTransactions(address, 10);

    // Get governance participation
    const governanceStats = await this.getGovernanceStats(address);

    // Get balance (this would need to be implemented based on your balance tracking)
    const balance = await this.getAccountBalance(address);

    return {
      address: account.address,
      type: vestingAccount ? vestingAccount.type : "BaseAccount",
      balance,
      vesting: vestingAccount
        ? {
            type: vestingAccount.type,
            original_vesting: vestingAccount.original_vesting,
            end_time: vestingAccount.end_time,
            start_time: vestingAccount.start_time,
            periods: vestingAccount.vestingPeriods,
          }
        : undefined,
      statistics: transactionStats,
      recent_transactions: recentTransactions,
      governance: governanceStats,
    };
  }

  async getAddressTransactions(address: string, pagination: PaginationDto) {
    const { limit } = normalizePagePagination(pagination, this.configService);

    const dataQb = this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.block", "block")
      .where(
        "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.partition_id = transaction.partition_id AND :address = ANY(m.involved_accounts_addresses))",
        { address }
      )
      .orderBy("transaction.height", "DESC");

    if (pagination.cursor) {
      dataQb.andWhere("transaction.height < :cursor", {
        cursor: pagination.cursor,
      });
    }
    dataQb.limit(limit);

    const transactions = await dataQb.getMany();
    const hasNext = transactions.length === limit;
    const nextCursor =
      hasNext && transactions.length > 0
        ? transactions[transactions.length - 1].height
        : undefined;

    const processedTransactions = transactions.map((transaction) => {
      // Find messages that involve this address
      const relevantMessages =
        transaction.messages?.filter((msg: any) => {
          const msgStr = JSON.stringify(msg);
          return msgStr.includes(address);
        }) || [];

      // Get message types and amounts
      const messageTypes = relevantMessages.map((msg: any) =>
        this.getMessageType(msg["@type"] || msg.type || "unknown")
      );

      const amounts = relevantMessages.flatMap((msg: any) =>
        this.extractAmountFromMessage(
          msg,
          msg["@type"] || msg.type || "unknown"
        )
      );

      return {
        hash: transaction.hash,
        height: transaction.height,
        timestamp: transaction.block?.timestamp,
        type: messageTypes[0] || "unknown", // Use first message type
        amount: amounts,
        success: transaction.success,
        gas_used: transaction.gas_used,
        fee: transaction.fee,
        messages: relevantMessages,
        message_count: relevantMessages.length,
        message_types: [
          ...new Set(
            relevantMessages.map(
              (msg: any) => msg["@type"] || msg.type || "unknown"
            )
          ),
        ],
        involved_addresses: this.extractAddressesFromTransaction(
          transaction,
          address
        ),
      };
    });

    return {
      data: processedTransactions,
      meta: buildPaginationMeta(1, limit, -1, nextCursor),
    };
  }

  private async getTransactionStatistics(address: string) {
    return {
      total_transactions: 0,
      successful_transactions: 0,
      failed_transactions: 0,
      success_rate: 0,
      first_transaction: undefined,
      last_transaction: undefined,
    };
  }

  private async getRecentTransactions(address: string, limit: number) {
    const transactions = await this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.block", "block")
      .where(
        "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.partition_id = transaction.partition_id AND :address = ANY(m.involved_accounts_addresses))",
        { address }
      )
      .orderBy("transaction.height", "DESC")
      .limit(limit)
      .getMany();

    return transactions.map((transaction) => {
      // Find the first relevant message for type and amount
      const relevantMessage = transaction.messages?.find((msg: any) => {
        const msgStr = JSON.stringify(msg);
        return msgStr.includes(address);
      });

      return {
        hash: transaction.hash,
        height: transaction.height,
        timestamp: transaction.block?.timestamp,
        type: relevantMessage
          ? this.getMessageType(
              relevantMessage["@type"] || relevantMessage.type || "unknown"
            )
          : "unknown",
        amount: relevantMessage
          ? this.extractAmountFromMessage(
              relevantMessage,
              relevantMessage["@type"] || relevantMessage.type || "unknown"
            )
          : [],
        success: transaction.success,
      };
    });
  }

  private async getGovernanceStats(address: string) {
    return {
      proposals_voted: 0,
      proposals_proposed: 0,
      total_deposits: [],
    };
  }

  private async getAccountBalance(address: string) {
    // This would need to be implemented based on your balance tracking
    // For now, returning empty array
    return [];
  }

  private getMessageType(type: string): string {
    // Strip leading slash if present for compatibility
    const normalizedType = type.startsWith("/") ? type.slice(1) : type;
    const typeMap: { [key: string]: string } = {
      "cosmos.bank.v1beta1.MsgSend": "send",
      "cosmos.bank.v1beta1.MsgMultiSend": "multi_send",
      "cosmos.staking.v1beta1.MsgDelegate": "delegate",
      "cosmos.staking.v1beta1.MsgUndelegate": "undelegate",
      "cosmos.staking.v1beta1.MsgBeginRedelegate": "redelegate",
      "cosmos.gov.v1beta1.MsgSubmitProposal": "submit_proposal",
      "cosmos.gov.v1beta1.MsgVote": "vote",
      "cosmos.gov.v1beta1.MsgDeposit": "deposit",
    };
    return typeMap[normalizedType] || "unknown";
  }

  private extractAddressesFromMessage(message: any): string[] {
    const addresses = new Set<string>();
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

  private extractAddressesFromTransaction(
    transaction: any,
    targetAddress: string
  ): string[] {
    const addresses = new Set<string>();

    if (transaction.messages && transaction.messages.length > 0) {
      transaction.messages.forEach((msg: any) => {
        const msgAddresses = this.extractAddressesFromMessage(msg);
        msgAddresses.forEach((addr) => addresses.add(addr));
      });
    }

    return Array.from(addresses);
  }

  private extractAmountFromMessage(value: any, type: string): any[] {
    if (!value) return [];

    const normalizedType = type.startsWith("/") ? type.slice(1) : type;
    switch (normalizedType) {
      case "cosmos.bank.v1beta1.MsgSend":
        return value.amount || [];
      case "cosmos.staking.v1beta1.MsgDelegate":
      case "cosmos.staking.v1beta1.MsgUndelegate":
        return value.amount ? [value.amount] : [];
      case "cosmos.gov.v1beta1.MsgDeposit":
        return value.amount || [];
      default:
        return [];
    }
  }

  // Advanced Address Transaction Filtering
  async getAddressTransactionsAdvanced(
    address: string,
    filters: AddressTransactionFilterDto
  ): Promise<PaginatedResponseDto<AddressTransactionResponseDto>> {
    const { limit, offset } = normalizeOffsetPagination(
      filters,
      this.configService
    );

    const useCursor =
      filters.cursor &&
      (filters.sort_by === AddressTransactionSortBy.HEIGHT || !filters.sort_by);

    // Cursor-based path: O(1) for deep pages, no count query
    if (useCursor) {
      const queryBuilder = this.buildAddressTransactionQuery(address, filters);
      queryBuilder.andWhere("transaction.height < :cursor", {
        cursor: filters.cursor,
      });
      const sortField = this.getAddressTransactionSortField(
        filters.sort_by || AddressTransactionSortBy.HEIGHT
      );
      queryBuilder
        .orderBy(sortField, filters.sort_order || AddressTransactionSortOrder.DESC)
        .limit(limit);

      const transactions = await queryBuilder.getMany();
      const hasNext = transactions.length === limit;
      const nextCursor =
        hasNext && transactions.length > 0
          ? transactions[transactions.length - 1].height
          : undefined;

      const processedTransactions = await Promise.all(
        transactions.map((tx) =>
          this.processAddressTransactionResponse(tx, address, filters)
        )
      );

      return {
        data: processedTransactions,
        meta: buildPaginationMeta(1, limit, -1, nextCursor),
      };
    }

    const queryBuilder = this.buildAddressTransactionQuery(address, filters);

    // Apply sorting
    const sortField = this.getAddressTransactionSortField(
      filters.sort_by || AddressTransactionSortBy.HEIGHT
    );
    queryBuilder.orderBy(
      sortField,
      filters.sort_order || AddressTransactionSortOrder.DESC
    );
    queryBuilder.limit(limit).offset(offset);

    const transactions = await queryBuilder.getMany();
    const hasNext = transactions.length === limit;
    const nextCursor =
      hasNext &&
      transactions.length > 0 &&
      (filters.sort_by === AddressTransactionSortBy.HEIGHT || !filters.sort_by)
        ? transactions[transactions.length - 1].height
        : undefined;

    const processedTransactions = await Promise.all(
      transactions.map((tx) =>
        this.processAddressTransactionResponse(tx, address, filters)
      )
    );

    return {
      data: processedTransactions,
      meta: buildPaginationMeta(1, limit, -1, nextCursor, hasNext),
    };
  }

  // Address Transaction Statistics (placeholder - no full-table scans)
  async getAddressTransactionStatistics(
    address: string
  ): Promise<AddressTransactionStatisticsDto> {
    return {
      total_transactions: 0,
      successful_transactions: 0,
      failed_transactions: 0,
      success_rate: 0,
      total_gas_used: "0",
      total_gas_wanted: "0",
      avg_gas_efficiency: 0,
      total_fees: [],
      sent_transactions: 0,
      received_transactions: 0,
      both_transactions: 0,
      total_sent: "0",
      total_received: "0",
      top_message_types: [],
      top_counterparties: [],
      daily_volume: {},
      volume_by_type: {},
    };
  }

  // Helper Methods
  private buildAddressTransactionQuery(
    address: string,
    filters: AddressTransactionFilterDto
  ): SelectQueryBuilder<Transaction> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.block", "block")
      .where(
        "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.partition_id = transaction.partition_id AND :address = ANY(m.involved_accounts_addresses))",
        { address }
      );

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

    if (filters.message_types && filters.message_types.length > 0) {
      queryBuilder.andWhere(
        "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.partition_id = transaction.partition_id AND m.type = ANY(:messageTypes))",
        { messageTypes: filters.message_types }
      );
    }

    if (filters.modules && filters.modules.length > 0) {
      queryBuilder.andWhere(
        "EXISTS (SELECT 1 FROM message m JOIN message_type mt ON mt.type = m.type WHERE m.transaction_hash = transaction.hash AND m.partition_id = transaction.partition_id AND mt.module = ANY(:modules))",
        { modules: filters.modules }
      );
    }

    if (filters.direction) {
      switch (filters.direction) {
        case "sent":
          queryBuilder.andWhere(
            "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.partition_id = transaction.partition_id AND m.value->>'from_address' = :address)",
            { address }
          );
          break;
        case "received":
          queryBuilder.andWhere(
            "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.partition_id = transaction.partition_id AND m.value->>'to_address' = :address)",
            { address }
          );
          break;
      }
    }

    if (filters.sender_only) {
      queryBuilder.andWhere(
        "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.partition_id = transaction.partition_id AND m.value->>'from_address' = :address)",
        { address }
      );
    }

    if (filters.receiver_only) {
      queryBuilder.andWhere(
        "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.partition_id = transaction.partition_id AND m.value->>'to_address' = :address)",
        { address }
      );
    }

    if (filters.search) {
      queryBuilder.andWhere(
        "(transaction.hash ILIKE :search OR transaction.memo ILIKE :search OR EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.partition_id = transaction.partition_id AND m.value::text ILIKE :search))",
        { search: `%${filters.search}%` }
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

  private getAddressTransactionSortField(
    sortBy: AddressTransactionSortBy
  ): string {
    switch (sortBy) {
      case AddressTransactionSortBy.HEIGHT:
        return "transaction.height";
      case AddressTransactionSortBy.TIMESTAMP:
        return "block.timestamp";
      case AddressTransactionSortBy.GAS_USED:
        return "transaction.gas_used";
      case AddressTransactionSortBy.GAS_WANTED:
        return "transaction.gas_wanted";
      case AddressTransactionSortBy.FEE:
        return "transaction.fee";
      default:
        return "transaction.height";
    }
  }

  private async processAddressTransactionResponse(
    transaction: Transaction,
    address: string,
    filters: AddressTransactionFilterDto
  ): Promise<AddressTransactionResponseDto> {
    // Get messages from transaction JSON or message table
    let messages: any[] = [];
    let involvedAddresses = new Set<string>();
    let direction: "sent" | "received" | "both" = "both";
    let totalAmount = "0";
    let primaryDenom = "";
    const messageTypes = new Set<string>();
    const categories = new Set<string>();

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
        where: { transaction_hash: transaction.hash },
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

    const processedMessages = await Promise.all(
      messages.map(async (message) => {
        messageTypes.add(message.type);

        const parsedMessage = this.messageParserService.parseMessage(
          message.type,
          message.value,
          message.involved_addresses
        );
        categories.add(parsedMessage.module);

        let messageDirection: "sent" | "received" | undefined;
        let messageAmount = "0";
        let messageDenom = "";

        // Determine direction and amount for this message
        if (message.value) {
          const value = message.value as any;

          // Check for bank messages
          if (message.type.includes("bank")) {
            if (value.from_address === address) {
              messageDirection = "sent";
            } else if (value.to_address === address) {
              messageDirection = "received";
            }

            if (value.amount && Array.isArray(value.amount)) {
              const amount = value.amount[0];
              if (amount) {
                messageAmount = amount.amount || "0";
                messageDenom = amount.denom || "";
              }
            }
          }

          // Check for staking messages
          if (message.type.includes("staking")) {
            if (value.delegator_address === address) {
              messageDirection = "sent";
            }

            if (value.amount) {
              messageAmount = value.amount.amount || "0";
              messageDenom = value.amount.denom || "";
            }
          }
        }

        return {
          type: message.type,
          value: message.value,
          index: message.index,
          direction: messageDirection,
          amount: messageAmount,
          denom: messageDenom,
          involved_addresses: message.involved_addresses,
        };
      })
    );

    // Determine overall transaction direction
    const sentMessages = processedMessages.filter(
      (m) => m.direction === "sent"
    );
    const receivedMessages = processedMessages.filter(
      (m) => m.direction === "received"
    );

    if (sentMessages.length > 0 && receivedMessages.length > 0) {
      direction = "both";
    } else if (sentMessages.length > 0) {
      direction = "sent";
    } else if (receivedMessages.length > 0) {
      direction = "received";
    }

    // Calculate total amount
    const amounts = processedMessages
      .filter((m) => m.amount && m.amount !== "0")
      .map((m) => ({ amount: m.amount, denom: m.denom }));

    if (amounts.length > 0) {
      const groupedAmounts = amounts.reduce((acc, curr) => {
        if (!acc[curr.denom]) {
          acc[curr.denom] = "0";
        }
        acc[curr.denom] = (
          BigInt(acc[curr.denom]) + BigInt(curr.amount)
        ).toString();
        return acc;
      }, {} as Record<string, string>);

      const primaryAmount = Object.entries(groupedAmounts)[0];
      if (primaryAmount) {
        totalAmount = primaryAmount[1];
        primaryDenom = primaryAmount[0];
      }
    }

    const totalFee = this.calculateTotalFee(transaction.fee);
    const gasEfficiency =
      transaction.gas_wanted > 0
        ? transaction.gas_used / transaction.gas_wanted
        : 0;

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
        efficiency: Number(gasEfficiency.toFixed(4)),
      },
      memo: transaction.memo,
      messages: filters.include_messages ? processedMessages : [],
      logs: filters.include_logs ? transaction.logs || [] : [],
      involved_addresses: Array.from(involvedAddresses),
      involved_addresses_count: involvedAddresses.size,
      signer_infos: transaction.signer_infos,
      direction,
      total_amount: totalAmount,
      primary_denom: primaryDenom,
      message_count: messages.length,
      message_types: Array.from(messageTypes),
      categories: Array.from(categories),
    };

    return serializeDates(response);
  }

  private calculateTotalFee(fee: any): any[] {
    if (!fee || !fee.amount) return [];

    if (Array.isArray(fee.amount)) {
      return fee.amount;
    }

    return [fee.amount];
  }

  // Statistics helper methods
  private async getAddressTransactionCount(
    address: string,
    filters: any = {}
  ): Promise<number> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder("transaction")
      .where(
        "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.partition_id = transaction.partition_id AND :address = ANY(m.involved_accounts_addresses))",
        { address }
      );

    if (filters.success !== undefined) {
      queryBuilder.andWhere("transaction.success = :success", {
        success: filters.success,
      });
    }

    return queryBuilder.getCount();
  }

  private async getAddressGasStatistics(address: string) {
    const result = await this.transactionRepository
      .createQueryBuilder("transaction")
      .select([
        "SUM(transaction.gas_used) as total_gas_used",
        "SUM(transaction.gas_wanted) as total_gas_wanted",
        "AVG(transaction.gas_used::float / NULLIF(transaction.gas_wanted, 0)) as avg_efficiency",
      ])
      .where(
        "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.partition_id = transaction.partition_id AND :address = ANY(m.involved_accounts_addresses))",
        { address }
      )
      .getRawOne();

    return {
      total_gas_used: result.total_gas_used || "0",
      total_gas_wanted: result.total_gas_wanted || "0",
      avg_efficiency: Number(result.avg_efficiency) || 0,
    };
  }

  private async getAddressFeeStatistics(address: string) {
    // This would need more complex logic to aggregate fees by denomination
    return [
      {
        denom: "usaf",
        amount: "0",
      },
    ];
  }

  private async getAddressDirectionStatistics(address: string) {
    const [sent, received, both] = await Promise.all([
      this.transactionRepository
        .createQueryBuilder("transaction")
        .where(
          "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.partition_id = transaction.partition_id AND m.value->>'from_address' = :address)",
          { address }
        )
        .getCount(),

      this.transactionRepository
        .createQueryBuilder("transaction")
        .where(
          "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.partition_id = transaction.partition_id AND m.value->>'to_address' = :address)",
          { address }
        )
        .getCount(),

      this.transactionRepository
        .createQueryBuilder("transaction")
        .leftJoin("transaction.messages_entities", "message")
        .where(
          "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND :address = ANY(m.involved_accounts_addresses))"
        )
        .andWhere(
          "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.value::text LIKE :fromPattern)"
        )
        .andWhere(
          "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.value::text LIKE :toPattern)"
        )
        .setParameters({
          address,
          fromPattern: `%"from_address":"${address}"%`,
          toPattern: `%"to_address":"${address}"%`,
        })
        .getCount(),
    ]);

    return { sent, received, both };
  }

  private async getAddressAmountStatistics(address: string) {
    // This would need more complex logic to calculate sent/received amounts
    return {
      sent: "0",
      received: "0",
    };
  }

  private async getAddressMessageTypeStatistics(address: string) {
    // This is complex to implement with JSON queries, returning empty for now
    return [];
  }

  private async getAddressCounterpartyStatistics(address: string) {
    // This is complex to implement with JSON queries, returning empty for now
    return [];
  }

  private async getAddressDailyVolume(address: string) {
    const result = await this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoin("transaction.block", "block")
      .select("DATE(block.timestamp)", "date")
      .addSelect("COUNT(*)", "count")
      .where(
        "EXISTS (SELECT 1 FROM message m WHERE m.transaction_hash = transaction.hash AND m.partition_id = transaction.partition_id AND :address = ANY(m.involved_accounts_addresses))",
        { address }
      )
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

  private async getAddressVolumeByType(address: string) {
    // This is complex to implement with JSON queries, returning empty for now
    return {};
  }
}
