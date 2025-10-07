import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Proposal } from "./proposal.entity";

@Entity("proposal_tally_result")
export class ProposalTallyResult {
  @ApiProperty({
    description: "Proposal ID",
    example: 1,
  })
  @PrimaryColumn({ type: "integer" })
  proposal_id: number;

  @ApiProperty({
    description: "Number of YES votes",
    example: "5000000000000",
  })
  @Column({ type: "text" })
  yes: string;

  @ApiProperty({
    description: "Number of ABSTAIN votes",
    example: "100000000000",
  })
  @Column({ type: "text" })
  abstain: string;

  @ApiProperty({
    description: "Number of NO votes",
    example: "200000000000",
  })
  @Column({ type: "text" })
  no: string;

  @ApiProperty({
    description: "Number of NO_WITH_VETO votes",
    example: "50000000000",
  })
  @Column({ type: "text" })
  no_with_veto: string;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  @Column({ type: "bigint" })
  height: number;

  @ManyToOne(() => Proposal, (proposal) => proposal.tallyResults)
  @JoinColumn({ name: "proposal_id" })
  proposal?: Proposal;
}
