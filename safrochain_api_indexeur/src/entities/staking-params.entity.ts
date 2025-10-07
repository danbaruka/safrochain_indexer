import { Entity, PrimaryColumn, Column } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity("staking_params")
export class StakingParams {
  @ApiProperty({
    description: "Single row identifier",
    example: true,
  })
  @PrimaryColumn({ type: "boolean", default: true })
  one_row_id: boolean;

  @ApiProperty({
    description: "Staking parameters (JSON)",
    example: {
      unbonding_time: "1814400s",
      max_validators: 100,
      max_entries: 7,
      historical_entries: 10000,
      bond_denom: "usaf",
    },
  })
  @Column({ type: "jsonb" })
  params: any;

  @ApiProperty({
    description: "Block height when these parameters were recorded",
    example: 12345,
  })
  @Column({ type: "bigint" })
  height: number;
}
