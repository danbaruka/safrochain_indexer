import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ValidatorController } from "./validator.controller";
import { ValidatorService } from "./validator.service";
import { Validator } from "../../entities/validator.entity";
import { ValidatorInfo } from "../../entities/validator-info.entity";
import { ValidatorDescription } from "../../entities/validator-description.entity";
import { ValidatorCommission } from "../../entities/validator-commission.entity";
import { ValidatorVotingPower } from "../../entities/validator-voting-power.entity";
import { ValidatorStatus } from "../../entities/validator-status.entity";
import { Block } from "../../entities/block.entity";
import { DateFilterService } from "../../common/services/date-filter.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Validator,
      ValidatorInfo,
      ValidatorDescription,
      ValidatorCommission,
      ValidatorVotingPower,
      ValidatorStatus,
      Block,
    ]),
  ],
  controllers: [ValidatorController],
  providers: [ValidatorService, DateFilterService],
  exports: [ValidatorService],
})
export class ValidatorModule {}
