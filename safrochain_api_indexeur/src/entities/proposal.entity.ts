import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Account } from "./account.entity";
import { ProposalDeposit } from "./proposal-deposit.entity";
import { ProposalVote } from "./proposal-vote.entity";
import { ProposalTallyResult } from "./proposal-tally-result.entity";

@Entity("proposal")
export class Proposal {
  @ApiProperty({
    description: "Proposal ID",
    example: 1,
  })
  @PrimaryColumn({ type: "integer" })
  id: number;

  @ApiProperty({
    description: "Proposal title",
    example: "Increase Validator Commission Rate",
  })
  @Column({ type: "text" })
  title: string;

  @ApiProperty({
    description: "Proposal description",
    example:
      "This proposal aims to increase the maximum validator commission rate from 10% to 15%...",
  })
  @Column({ type: "text" })
  description: string;

  @ApiProperty({
    description: "Proposal metadata",
    example:
      '{"title": "Increase Validator Commission Rate", "authors": ["validator1"]}',
  })
  @Column({ type: "text" })
  metadata: string;

  @ApiProperty({
    description: "Proposal content (JSON)",
    example: '[{"type": "/cosmos.gov.v1beta1.TextProposal", "value": {...}}]',
  })
  @Column({ type: "jsonb" })
  content: any[];

  @ApiProperty({
    description: "Proposal submit time",
    example: "2023-12-01T10:00:00Z",
  })
  @Column({ type: "timestamp" })
  submit_time: Date;

  @ApiProperty({
    description: "Deposit end time",
    example: "2023-12-08T10:00:00Z",
  })
  @Column({ type: "timestamp", nullable: true })
  deposit_end_time?: Date;

  @ApiProperty({
    description: "Voting start time",
    example: "2023-12-08T10:00:00Z",
  })
  @Column({ type: "timestamp", nullable: true })
  voting_start_time?: Date;

  @ApiProperty({
    description: "Voting end time",
    example: "2023-12-15T10:00:00Z",
  })
  @Column({ type: "timestamp", nullable: true })
  voting_end_time?: Date;

  @ApiProperty({
    description: "Proposer address",
    example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @Column({ type: "text" })
  proposer_address: string;

  @ApiProperty({
    description: "Proposal status",
    example: "PROPOSAL_STATUS_PASSED",
  })
  @Column({ type: "text", nullable: true })
  status?: string;

  @ManyToOne(() => Account, (account) => account.proposals)
  @JoinColumn({ name: "proposer_address" })
  proposer?: Account;

  @OneToMany(() => ProposalDeposit, (deposit) => deposit.proposal)
  deposits?: ProposalDeposit[];

  @OneToMany(() => ProposalVote, (vote) => vote.proposal)
  votes?: ProposalVote[];

  @OneToMany(() => ProposalTallyResult, (tally) => tally.proposal)
  tallyResults?: ProposalTallyResult[];
}
