import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GovernanceController } from "./governance.controller";
import { GovernanceService } from "./governance.service";
import { Proposal } from "../../entities/proposal.entity";
import { ProposalDeposit } from "../../entities/proposal-deposit.entity";
import { ProposalVote } from "../../entities/proposal-vote.entity";
import { ProposalTallyResult } from "../../entities/proposal-tally-result.entity";
import { DateFilterService } from "../../common/services/date-filter.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Proposal,
      ProposalDeposit,
      ProposalVote,
      ProposalTallyResult,
    ]),
  ],
  controllers: [GovernanceController],
  providers: [GovernanceService, DateFilterService],
  exports: [GovernanceService],
})
export class GovernanceModule {}
