import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StakingController } from "./staking.controller";
import { StakingService } from "./staking.service";
import { StakingPool } from "../../entities/staking-pool.entity";
import { StakingParams } from "../../entities/staking-params.entity";
import { ValidatorSigningInfo } from "../../entities/validator-signing-info.entity";
import { CommunityPool } from "../../entities/community-pool.entity";
import { DistributionParams } from "../../entities/distribution-params.entity";
import { SlashingParams } from "../../entities/slashing-params.entity";
import { MintParams } from "../../entities/mint-params.entity";
import { Inflation } from "../../entities/inflation.entity";
import { GovParams } from "../../entities/gov-params.entity";
import { Message } from "../../entities/message.entity";
import { MessageParserService } from "../../common/services/message-parser.service";
import { DateFilterService } from "../../common/services/date-filter.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StakingPool,
      StakingParams,
      ValidatorSigningInfo,
      CommunityPool,
      DistributionParams,
      SlashingParams,
      MintParams,
      Inflation,
      GovParams,
      Message,
    ]),
  ],
  controllers: [StakingController],
  providers: [StakingService, MessageParserService, DateFilterService],
  exports: [StakingService],
})
export class StakingModule {}
