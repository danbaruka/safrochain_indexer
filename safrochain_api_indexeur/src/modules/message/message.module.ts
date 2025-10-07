import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";
import { Message } from "../../entities/message.entity";
import { MessageType } from "../../entities/message-type.entity";
import { MessageParserService } from "../../common/services/message-parser.service";
import { DateFilterService } from "../../common/services/date-filter.service";

@Module({
  imports: [TypeOrmModule.forFeature([Message, MessageType])],
  controllers: [MessageController],
  providers: [MessageService, MessageParserService, DateFilterService],
  exports: [MessageService, MessageParserService],
})
export class MessageModule {}
