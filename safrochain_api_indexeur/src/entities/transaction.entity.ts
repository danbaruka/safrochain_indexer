import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Block } from "./block.entity";
import { Message } from "./message.entity";

@Entity("transaction")
export class Transaction {
  @ApiProperty({
    description: "Transaction hash",
    example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
  })
  @PrimaryColumn({ type: "text" })
  hash: string;

  @ApiProperty({
    description: "Block height where transaction was included",
    example: 12345,
  })
  @Column({ type: "bigint" })
  height: number;

  @ApiProperty({
    description: "Whether the transaction was successful",
    example: true,
  })
  @Column({ type: "boolean" })
  success: boolean;

  @ApiProperty({
    description: "Transaction messages (JSON)",
    example: '[{"type": "/cosmos.bank.v1beta1.MsgSend", "value": {...}}]',
  })
  @Column({ type: "json" })
  messages: any[];

  @ApiProperty({
    description: "Transaction memo",
    example: "Transfer to Alice",
  })
  @Column({ type: "text", nullable: true })
  memo?: string;

  @ApiProperty({
    description: "Transaction signatures",
    example: ["signature1", "signature2"],
  })
  @Column({ type: "text", array: true })
  signatures: string[];

  @ApiProperty({
    description: "Signer information (JSON)",
    example: '[{"public_key": {...}, "mode_info": {...}}]',
  })
  @Column({ type: "jsonb" })
  signer_infos: any[];

  @ApiProperty({
    description: "Transaction fee (JSON)",
    example:
      '{"amount": [{"denom": "uatom", "amount": "1000"}], "gas_limit": "200000"}',
  })
  @Column({ type: "jsonb" })
  fee: any;

  @ApiProperty({
    description: "Gas wanted",
    example: 200000,
  })
  @Column({ type: "bigint", default: 0 })
  gas_wanted: number;

  @ApiProperty({
    description: "Gas used",
    example: 150000,
  })
  @Column({ type: "bigint", default: 0 })
  gas_used: number;

  @ApiProperty({
    description: "Raw transaction log",
    example: "success",
  })
  @Column({ type: "text", nullable: true })
  raw_log?: string;

  @ApiProperty({
    description: "Structured transaction logs (JSON)",
    example: '[{"msg_index": 0, "log": "", "events": [...]}]',
  })
  @Column({ type: "jsonb", nullable: true })
  logs?: any[];

  @ApiProperty({
    description: "Partition ID for database partitioning",
    example: 0,
  })
  @Column({ type: "bigint", default: 0 })
  partition_id: number;

  @ManyToOne(() => Block, (block) => block.transactions)
  @JoinColumn({ name: "height" })
  block?: Block;

  @OneToMany(() => Message, (message) => message.transaction)
  messages_entities?: Message[];
}
