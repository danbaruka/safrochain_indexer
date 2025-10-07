import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AddressController } from "./address.controller";
import { AddressService } from "./address.service";
import { Account } from "../../entities/account.entity";
import { VestingAccount } from "../../entities/vesting-account.entity";
import { Transaction } from "../../entities/transaction.entity";
import { Message } from "../../entities/message.entity";
import { Proposal } from "../../entities/proposal.entity";
import { ProposalDeposit } from "../../entities/proposal-deposit.entity";
import { ProposalVote } from "../../entities/proposal-vote.entity";
import { MessageParserService } from "../../common/services/message-parser.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      VestingAccount,
      Transaction,
      Message,
      Proposal,
      ProposalDeposit,
      ProposalVote,
    ]),
  ],
  controllers: [AddressController],
  providers: [AddressService, MessageParserService],
  exports: [AddressService],
})
export class AddressModule {}
