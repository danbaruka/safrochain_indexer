import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Proposal } from "./proposal.entity";
import { Account } from "./account.entity";

@Entity("proposal_vote")
export class ProposalVote {
  @ApiProperty({
    description: "Proposal ID",
    example: 1,
  })
  @PrimaryColumn({ type: "integer" })
  proposal_id: number;

  @ApiProperty({
    description: "Voter address",
    example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @PrimaryColumn({ type: "text" })
  voter_address: string;

  @ApiProperty({
    description: "Vote option",
    example: "VOTE_OPTION_YES",
  })
  @PrimaryColumn({ type: "text" })
  option: string;

  @ApiProperty({
    description: "Vote weight",
    example: "1000000",
  })
  @Column({ type: "text" })
  weight: string;

  @ApiProperty({
    description: "Vote timestamp",
    example: "2023-12-10T10:30:00Z",
  })
  @Column({ type: "timestamp", nullable: true })
  timestamp?: Date;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  @Column({ type: "bigint" })
  height: number;

  @ManyToOne(() => Proposal, (proposal) => proposal.votes)
  @JoinColumn({ name: "proposal_id" })
  proposal?: Proposal;

  @ManyToOne(() => Account, (account) => account.proposalVotes)
  @JoinColumn({ name: "voter_address" })
  voter?: Account;
}
