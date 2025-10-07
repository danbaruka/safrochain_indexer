import { Entity, PrimaryColumn, Column, OneToMany, OneToOne } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Block } from "./block.entity";
import { ValidatorInfo } from "./validator-info.entity";
import { ValidatorDescription } from "./validator-description.entity";
import { ValidatorCommission } from "./validator-commission.entity";
import { ValidatorVotingPower } from "./validator-voting-power.entity";
import { ValidatorStatus } from "./validator-status.entity";

@Entity("validator")
export class Validator {
  @ApiProperty({
    description: "Validator consensus address",
    example: "cosmosvalcons1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @PrimaryColumn({ type: "text" })
  consensus_address: string;

  @ApiProperty({
    description: "Validator consensus public key",
    example: "cosmosvalconspub1addwnpepq...",
  })
  @Column({ type: "text", unique: true })
  consensus_pubkey: string;

  @OneToMany(() => Block, (block) => block.proposer)
  proposedBlocks?: Block[];

  @OneToOne(() => ValidatorInfo, (info) => info.validator)
  info?: ValidatorInfo;

  @OneToOne(() => ValidatorDescription, (description) => description.validator)
  description?: ValidatorDescription;

  @OneToOne(() => ValidatorCommission, (commission) => commission.validator)
  commission?: ValidatorCommission;

  @OneToOne(() => ValidatorVotingPower, (votingPower) => votingPower.validator)
  votingPower?: ValidatorVotingPower;

  @OneToOne(() => ValidatorStatus, (status) => status.validator)
  status?: ValidatorStatus;
}
