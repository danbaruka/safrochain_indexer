import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Transaction } from "./transaction.entity";
import { Validator } from "./validator.entity";

@Entity("block")
export class Block {
  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  @PrimaryColumn({ type: "bigint" })
  height: number;

  @ApiProperty({
    description: "Block hash",
    example: "ABC123DEF456GHI789JKL012MNO345PQR678STU",
  })
  @Column({ type: "text", unique: true })
  hash: string;

  @ApiProperty({
    description: "Number of transactions in the block",
    example: 150,
  })
  @Column({ type: "integer", default: 0 })
  num_txs: number;

  @ApiProperty({
    description: "Total gas used in the block",
    example: 50000000,
  })
  @Column({ type: "bigint", default: 0 })
  total_gas: number;

  @ApiProperty({
    description: "Block proposer address",
    example: "addr_safro1validator123def456ghi789jkl012mno345pqr",
  })
  @Column({ type: "text", nullable: true })
  proposer_address?: string;

  @ApiProperty({
    description: "Block timestamp",
    example: "2023-12-01T10:30:00Z",
  })
  @Column({ type: "timestamp without time zone" })
  timestamp: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.block)
  transactions?: Transaction[];

  @ManyToOne(() => Validator, (validator) => validator.proposedBlocks)
  @JoinColumn({ name: "proposer_address" })
  proposer?: Validator;
}
