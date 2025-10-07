import { Entity, PrimaryColumn, Column } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Coin } from "../common/types/coin.type";

@Entity("supply")
export class Supply {
  @ApiProperty({
    description: "Single row identifier",
    example: true,
  })
  @PrimaryColumn({ type: "boolean", default: true })
  one_row_id: boolean;

  @ApiProperty({
    description: "Total supply coins",
    example: [{ denom: "usaf", amount: "1000000000000" }],
  })
  @Column({ type: "jsonb" })
  coins: Coin[];

  @ApiProperty({
    description: "Block height when this supply was recorded",
    example: 12345,
  })
  @Column({ type: "bigint" })
  height: number;
}
