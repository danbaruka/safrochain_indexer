import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Proposal } from "./proposal.entity";
import { Account } from "./account.entity";
import { Coin } from "../common/types/coin.type";

@Entity("proposal_deposit")
export class ProposalDeposit {
  @ApiProperty({
    description: "Proposal ID",
    example: 1,
  })
  @PrimaryColumn({ type: "integer" })
  proposal_id: number;

  @ApiProperty({
    description: "Depositor address",
    example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @PrimaryColumn({ type: "text" })
  depositor_address: string;

  @ApiProperty({
    description: "Transaction hash",
    example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
  })
  @PrimaryColumn({ type: "text" })
  transaction_hash: string;

  @ApiProperty({
    description: "Deposit amount",
    example: [{ denom: "uatom", amount: "1000000" }],
  })
  @Column({ type: "jsonb" })
  amount: Coin[];

  @ApiProperty({
    description: "Deposit timestamp",
    example: "2023-12-01T10:30:00Z",
  })
  @Column({ type: "timestamp", nullable: true })
  timestamp?: Date;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  @Column({ type: "bigint" })
  height: number;

  @ManyToOne(() => Proposal, (proposal) => proposal.deposits)
  @JoinColumn({ name: "proposal_id" })
  proposal?: Proposal;

  @ManyToOne(() => Account, (account) => account.proposalDeposits)
  @JoinColumn({ name: "depositor_address" })
  depositor?: Account;
}
