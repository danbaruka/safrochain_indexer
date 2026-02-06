import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Validator } from "./validator.entity";

@Entity("validator_voting_power")
export class ValidatorVotingPower {
  @ApiProperty({
    description: "Validator consensus address",
    example: "safrovalcons1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @PrimaryColumn({ type: "text" })
  validator_address: string;

  @ApiProperty({
    description: "Validator voting power",
    example: 1000000000,
  })
  @Column({ type: "bigint" })
  voting_power: number;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  @Column({ type: "bigint" })
  height: number;

  @OneToOne(() => Validator, (validator) => validator.votingPower)
  @JoinColumn({ name: "validator_address" })
  validator?: Validator;
}
