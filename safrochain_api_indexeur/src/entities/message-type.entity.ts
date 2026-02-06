import { Entity, PrimaryColumn, Column } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity("message_type")
export class MessageType {
  @ApiProperty({
    description: "Message type identifier",
    example: "cosmos.bank.v1beta1.MsgSend",
  })
  @PrimaryColumn({ type: "text" })
  type: string;

  @ApiProperty({
    description: "Module name",
    example: "bank",
  })
  @Column({ type: "text" })
  module: string;

  @ApiProperty({
    description: "Human-readable label",
    example: "Send",
  })
  @Column({ type: "text" })
  label: string;

  @ApiProperty({
    description: "Block height when this type was first seen",
    example: 12345,
  })
  @Column({ type: "bigint" })
  height: number;
}
