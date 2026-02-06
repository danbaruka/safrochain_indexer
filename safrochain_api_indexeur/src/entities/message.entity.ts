import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Transaction } from "./transaction.entity";

@Entity("message")
export class Message {
  @ApiProperty({
    description: "Transaction hash",
    example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
  })
  @PrimaryColumn({ type: "text" })
  transaction_hash: string;

  @ApiProperty({
    description: "Message index in transaction",
    example: 0,
  })
  @PrimaryColumn({ type: "bigint" })
  index: number;

  @ApiProperty({
    description: "Message type",
    example: "cosmos.bank.v1beta1.MsgSend",
  })
  @Column({ type: "text" })
  type: string;

  @ApiProperty({
    description: "Message value (JSON)",
    example:
      '{"from_address": "addr_safro1...", "to_address": "addr_safro1...", "amount": [...]}',
  })
  @Column({ type: "json" })
  value: any;

  @ApiProperty({
    description: "Array of involved account addresses",
    example: [
      "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
      "addr_safro1xyz789uvw012rst345mno678pqr901stu234vwx",
    ],
  })
  @Column({ type: "text", array: true })
  involved_accounts_addresses: string[];

  @ApiProperty({
    description: "Partition ID for database partitioning",
    example: 0,
  })
  @Column({ type: "bigint", default: 0 })
  partition_id: number;

  @ApiProperty({
    description: "Block height",
    example: 12345,
  })
  @Column({ type: "bigint" })
  height: number;

  @ManyToOne(() => Transaction, (transaction) => transaction.messages_entities)
  @JoinColumn([
    { name: "transaction_hash", referencedColumnName: "hash" },
    { name: "partition_id", referencedColumnName: "partition_id" },
  ])
  transaction?: Transaction;
}
