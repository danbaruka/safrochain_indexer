import { Entity, PrimaryColumn, Column, OneToMany, OneToOne } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { VestingAccount } from "./vesting-account.entity";
import { Proposal } from "./proposal.entity";
import { ProposalDeposit } from "./proposal-deposit.entity";
import { ProposalVote } from "./proposal-vote.entity";

@Entity("account")
export class Account {
  @ApiProperty({
    description: "Account address",
    example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @PrimaryColumn({ type: "text" })
  address: string;

  @OneToMany(() => VestingAccount, (vesting) => vesting.account)
  vestingAccounts?: VestingAccount[];

  @OneToMany(() => Proposal, (proposal) => proposal.proposer)
  proposals?: Proposal[];

  @OneToMany(() => ProposalDeposit, (deposit) => deposit.depositor)
  proposalDeposits?: ProposalDeposit[];

  @OneToMany(() => ProposalVote, (vote) => vote.voter)
  proposalVotes?: ProposalVote[];
}
