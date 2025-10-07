import { Entity, PrimaryColumn, Column } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity("staking_pool")
export class StakingPool {
  @ApiProperty({
    description: "Single row identifier",
    example: true,
  })
  @PrimaryColumn({ type: "boolean", default: true })
  one_row_id: boolean;

  @ApiProperty({
    description: "Bonded tokens amount",
    example: "5000000000000",
  })
  @Column({ type: "text" })
  bonded_tokens: string;

  @ApiProperty({
    description: "Not bonded tokens amount",
    example: "1000000000000",
  })
  @Column({ type: "text" })
  not_bonded_tokens: string;

  @ApiProperty({
    description: "Unbonding tokens amount",
    example: "500000000000",
  })
  @Column({ type: "text" })
  unbonding_tokens: string;

  @ApiProperty({
    description: "Staked not bonded tokens amount",
    example: "100000000000",
  })
  @Column({ type: "text" })
  staked_not_bonded_tokens: string;

  @ApiProperty({
    description: "Block height when this pool was recorded",
    example: 12345,
  })
  @Column({ type: "bigint" })
  height: number;
}
