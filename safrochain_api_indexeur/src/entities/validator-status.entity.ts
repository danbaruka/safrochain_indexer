import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Validator } from "./validator.entity";

@Entity("validator_status")
export class ValidatorStatus {
  @ApiProperty({
    description: "Validator consensus address",
    example: "cosmosvalcons1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @PrimaryColumn({ type: "text" })
  validator_address: string;

  @ApiProperty({
    description:
      "Validator status (0=Bonded, 1=Unbonding, 2=Unbonded, 3=Jailed)",
    example: 0,
  })
  @Column({ type: "int" })
  status: number;

  @ApiProperty({
    description: "Whether the validator is jailed",
    example: false,
  })
  @Column({ type: "boolean" })
  jailed: boolean;

  @ApiProperty({
    description: "Block height when this status was recorded",
    example: 12345,
  })
  @Column({ type: "bigint" })
  height: number;

  @OneToOne(() => Validator, (validator) => validator.status)
  @JoinColumn({ name: "validator_address" })
  validator?: Validator;
}
