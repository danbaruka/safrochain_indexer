import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Token } from "./token.entity";

@Entity("token_unit")
export class TokenUnit {
  @ApiProperty({
    description: "Token name",
    example: "Safro",
  })
  @PrimaryColumn({ type: "text" })
  token_name: string;

  @ApiProperty({
    description: "Denomination",
    example: "usaf",
  })
  @Column({ type: "text", unique: true })
  denom: string;

  @ApiProperty({
    description: "Exponent for the denomination",
    example: 6,
  })
  @Column({ type: "int" })
  exponent: number;

  @ApiProperty({
    description: "Aliases for the denomination",
    example: ["safro", "SAFRO"],
  })
  @Column({ type: "text", array: true, nullable: true })
  aliases?: string[];

  @ApiProperty({
    description: "Price ID for external price feeds",
    example: "safro",
  })
  @Column({ type: "text", nullable: true })
  price_id?: string;

  @ManyToOne(() => Token, (token) => token.units)
  @JoinColumn({ name: "token_name" })
  token?: Token;
}
