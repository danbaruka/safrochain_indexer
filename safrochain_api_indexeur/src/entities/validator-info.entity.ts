import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Validator } from "./validator.entity";

@Entity("validator_info")
export class ValidatorInfo {
  @ApiProperty({
    description: "Validator consensus address",
    example: "cosmosvalcons1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @PrimaryColumn({ type: "text" })
  consensus_address: string;

  @ApiProperty({
    description: "Validator operator address",
    example: "cosmosvaloper1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @Column({ type: "text", unique: true })
  operator_address: string;

  @ApiProperty({
    description: "Self delegate address",
    example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @Column({ type: "text", nullable: true })
  self_delegate_address?: string;

  @ApiProperty({
    description: "Maximum change rate",
    example: "0.01",
  })
  @Column({ type: "text" })
  max_change_rate: string;

  @ApiProperty({
    description: "Maximum rate",
    example: "0.20",
  })
  @Column({ type: "text" })
  max_rate: string;

  @ApiProperty({
    description: "Block height when this info was recorded",
    example: 12345,
  })
  @Column({ type: "bigint" })
  height: number;

  @OneToOne(() => Validator, (validator) => validator.info)
  @JoinColumn({ name: "consensus_address" })
  validator?: Validator;
}
