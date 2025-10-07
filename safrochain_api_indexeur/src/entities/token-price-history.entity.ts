import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { TokenUnit } from "./token-unit.entity";

@Entity("token_price_history")
export class TokenPriceHistory {
  @ApiProperty({
    description: "Price history ID",
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: "Unit name (denomination)",
    example: "usaf",
  })
  @Column({ type: "text" })
  unit_name: string;

  @ApiProperty({
    description: "Token price in USD",
    example: 0.05,
  })
  @Column({ type: "decimal" })
  price: number;

  @ApiProperty({
    description: "Market cap",
    example: 1000000000,
  })
  @Column({ type: "bigint" })
  market_cap: number;

  @ApiProperty({
    description: "Price timestamp",
    example: "2023-12-01T10:30:00Z",
  })
  @Column({ type: "timestamp without time zone" })
  timestamp: Date;

  @ManyToOne(() => TokenUnit, (unit) => unit.denom)
  @JoinColumn({ name: "unit_name", referencedColumnName: "denom" })
  tokenUnit?: TokenUnit;
}
