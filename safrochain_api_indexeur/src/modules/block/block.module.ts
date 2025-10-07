import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlockController } from "./block.controller";
import { BlockService } from "./block.service";
import { Block } from "../../entities/block.entity";
import { Transaction } from "../../entities/transaction.entity";
import { Validator } from "../../entities/validator.entity";
import { DateFilterService } from "../../common/services/date-filter.service";
import { MessageParserService } from "../../common/services/message-parser.service";

@Module({
  imports: [TypeOrmModule.forFeature([Block, Transaction, Validator])],
  controllers: [BlockController],
  providers: [BlockService, DateFilterService, MessageParserService],
  exports: [BlockService],
})
export class BlockModule {}
