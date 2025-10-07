import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { VestingAccount } from "./vesting-account.entity";
import { Coin } from "../common/types/coin.type";

@Entity("vesting_period")
export class VestingPeriod {
  @ApiProperty({
    description: "Vesting account ID",
    example: 1,
  })
  @PrimaryColumn({ type: "bigint" })
  vesting_account_id: number;

  @ApiProperty({
    description: "Period order",
    example: 1,
  })
  @PrimaryColumn({ type: "bigint" })
  period_order: number;

  @ApiProperty({
    description: "Period length in seconds",
    example: 31536000,
  })
  @Column({ type: "bigint" })
  length: number;

  @ApiProperty({
    description: "Amount to vest in this period",
    example: [{ denom: "uatom", amount: "100000" }],
  })
  @Column({ type: "jsonb" })
  amount: Coin[];

  @ManyToOne(
    () => VestingAccount,
    (vestingAccount) => vestingAccount.vestingPeriods
  )
  @JoinColumn({ name: "vesting_account_id" })
  vestingAccount?: VestingAccount;
}
