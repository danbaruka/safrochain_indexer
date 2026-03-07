import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Block } from "../../entities/block.entity";
import { Transaction } from "../../entities/transaction.entity";
import { Validator } from "../../entities/validator.entity";
import { BlockResponseDto, BlockListDto } from "../../dto/block.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import { DateFilterService } from "../../common/services/date-filter.service";
import { serializeDates } from "../../common/utils/date-serializer.util";
import { MessageParserService } from "../../common/services/message-parser.service";

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Validator)
    private validatorRepository: Repository<Validator>,
    private dateFilterService: DateFilterService,
    private messageParserService: MessageParserService
  ) {}

  async getBlockByHeight(height: string): Promise<BlockResponseDto> {
    const block = await this.blockRepository.findOne({
      where: { height: parseInt(height) },
      relations: ["proposer"],
    });

    if (!block) {
      throw new Error(`Block with height ${height} not found`);
    }

    // Get block statistics
    const statistics = await this.getBlockStatistics(block.height);

    // Get recent transactions in the block
    const transactions = await this.getBlockTransactions(block.height, 10);

    return {
      height: block.height,
      hash: block.hash,
      num_txs: block.num_txs,
      total_gas: block.total_gas,
      proposer_address: block.proposer_address,
      timestamp: block.timestamp,
      proposer: block.proposer
        ? {
            consensus_address: block.proposer.consensus_address,
            operator_address: "", // This would need to be fetched from validator_info
            moniker: "", // This would need to be fetched from validator_description
          }
        : null,
      statistics,
      transactions,
    };
  }

  async getBlockByHash(hash: string): Promise<BlockResponseDto> {
    const block = await this.blockRepository.findOne({
      where: { hash },
      relations: ["proposer"],
    });

    if (!block) {
      throw new Error(`Block with hash ${hash} not found`);
    }

    // Get block statistics
    const statistics = await this.getBlockStatistics(block.height);

    // Get recent transactions in the block
    const transactions = await this.getBlockTransactions(block.height, 10);

    const response = {
      height: block.height,
      hash: block.hash,
      num_txs: block.num_txs,
      total_gas: block.total_gas,
      proposer_address: block.proposer_address,
      timestamp: block.timestamp,
      proposer: block.proposer
        ? {
            consensus_address: block.proposer.consensus_address,
            operator_address: "",
            moniker: "",
          }
        : null,
      statistics,
      transactions,
    };

    return serializeDates(response);
  }

  async getBlocks(filters: BlockListDto): Promise<PaginatedResponseDto<any>> {
    const queryBuilder = this.blockRepository
      .createQueryBuilder("block")
      .orderBy("block.height", "DESC");

    // Apply filters
    if (filters.proposer) {
      queryBuilder.andWhere("block.proposer_address = :proposer", {
        proposer: filters.proposer,
      });
    }

    if (filters.min_txs !== undefined) {
      queryBuilder.andWhere("block.num_txs >= :min_txs", {
        min_txs: filters.min_txs,
      });
    }

    if (filters.max_txs !== undefined) {
      queryBuilder.andWhere("block.num_txs <= :max_txs", {
        max_txs: filters.max_txs,
      });
    }

    // Apply date filters using the date filter service
    this.dateFilterService.applyDateFilters(
      queryBuilder,
      filters,
      "block.timestamp"
    );

    // Apply pagination - run data and count in parallel (limit clamped to 100)
    const limit = Math.min(Math.max(filters.limit || 20, 1), 100);
    const offset = ((filters.page || 1) - 1) * limit;

    const [blocks, countRaw] = await Promise.all([
      queryBuilder.clone().offset(offset).limit(limit).getMany(),
      queryBuilder
        .clone()
        .select("COUNT(*)", "count")
        .getRawOne<{ count: string }>(),
    ]);
    const total = parseInt(countRaw?.count ?? "0", 10);

    // Process blocks for response
    const processedBlocks = blocks.map((block) => ({
      height: block.height,
      hash: block.hash,
      num_txs: block.num_txs,
      total_gas: block.total_gas,
      proposer_address: block.proposer_address,
      timestamp: block.timestamp,
      proposer: block.proposer_address
        ? {
            consensus_address: block.proposer_address,
            operator_address: "",
            moniker: "",
          }
        : null,
    }));

    return {
      data: processedBlocks,
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

  private async getBlockStatistics(height: number) {
    const transactions = await this.transactionRepository.find({
      where: { height },
      take: 1000,
    });

    const totalFees = transactions.reduce((acc, tx) => {
      if (tx.fee && tx.fee.amount) {
        const fees = Array.isArray(tx.fee.amount)
          ? tx.fee.amount
          : [tx.fee.amount];
        fees.forEach((fee) => {
          const existing = acc.find((f) => f.denom === fee.denom);
          if (existing) {
            existing.amount = (
              BigInt(existing.amount) + BigInt(fee.amount)
            ).toString();
          } else {
            acc.push({ ...fee });
          }
        });
      }
      return acc;
    }, []);

    const successfulTxs = transactions.filter((tx) => tx.success).length;
    const averageGasPerTx =
      transactions.length > 0
        ? transactions.reduce((sum, tx) => sum + tx.gas_used, 0) /
          transactions.length
        : 0;

    return {
      total_fees: totalFees,
      average_gas_per_tx: Math.round(averageGasPerTx),
      success_rate:
        transactions.length > 0 ? successfulTxs / transactions.length : 0,
    };
  }

  private async getBlockTransactions(height: number, limit: number) {
    const transactions = await this.transactionRepository.find({
      where: { height },
      order: { hash: "ASC" },
      take: limit,
    });

    return transactions.map((tx) => {
      // Get messages from transaction JSON or message table
      let messages: any[] = [];
      let involvedAddresses = new Set<string>();
      let messageTypes = new Set<string>();
      let categories = new Set<string>();

      if (tx.messages && tx.messages.length > 0) {
        // Use messages from transaction JSON column
        messages = tx.messages.map((msg: any, index: number) => ({
          type: msg["@type"] || msg.type || "unknown",
          value: msg,
          index: index,
          involved_addresses: this.extractAddressesFromMessage(msg),
        }));

        // Extract involved addresses, message types, and categories
        messages.forEach((message) => {
          message.involved_addresses.forEach((addr: string) =>
            involvedAddresses.add(addr)
          );
          messageTypes.add(message.type);

          const parsedMessage = this.messageParserService.parseMessage(
            message.type,
            message.value,
            message.involved_addresses
          );
          categories.add(parsedMessage.module);
        });
      }

      return {
        hash: tx.hash,
        success: tx.success,
        gas_used: tx.gas_used,
        messages: messages,
        logs: tx.logs || [],
        involved_addresses: Array.from(involvedAddresses),
        involved_addresses_count: involvedAddresses.size,
        message_count: messages.length,
        message_types: Array.from(messageTypes),
        categories: Array.from(categories),
      };
    });
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
}
