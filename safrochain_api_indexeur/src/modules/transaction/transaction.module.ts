import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TransactionController } from "./transaction.controller";
import { TransactionService } from "./transaction.service";
import { Transaction } from "../../entities/transaction.entity";
import { Message } from "../../entities/message.entity";
import { Block } from "../../entities/block.entity";
import { MessageParserService } from "../../common/services/message-parser.service";

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Message, Block])],
  controllers: [TransactionController],
  providers: [TransactionService, MessageParserService],
  exports: [TransactionService],
})
export class TransactionModule {}
