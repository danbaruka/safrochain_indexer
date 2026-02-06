import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Validator } from "./validator.entity";

@Entity("validator_commission")
export class ValidatorCommission {
  @ApiProperty({
    description: "Validator consensus address",
    example: "safrovalcons1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @PrimaryColumn({ type: "text" })
  validator_address: string;

  @ApiProperty({
    description: "Commission rate",
    example: 0.05,
  })
  @Column({ type: "decimal" })
  commission: number;

  @ApiProperty({
    description: "Minimum self delegation amount",
    example: 1000000,
  })
  @Column({ type: "bigint" })
  min_self_delegation: number;

  @ApiProperty({
    description: "Block height when this commission was recorded",
    example: 12345,
  })
  @Column({ type: "bigint" })
  height: number;

  @OneToOne(() => Validator, (validator) => validator.commission)
  @JoinColumn({ name: "validator_address" })
  validator?: Validator;
}
