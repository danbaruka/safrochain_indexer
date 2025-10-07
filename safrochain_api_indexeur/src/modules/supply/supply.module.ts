import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SupplyController } from "./supply.controller";
import { SupplyService } from "./supply.service";
import { Supply } from "../../entities/supply.entity";
import { Block } from "../../entities/block.entity";
import { DateFilterService } from "../../common/services/date-filter.service";

@Module({
  imports: [TypeOrmModule.forFeature([Supply, Block])],
  controllers: [SupplyController],
  providers: [SupplyService, DateFilterService],
  exports: [SupplyService],
})
export class SupplyModule {}
