import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Account } from "./account.entity";
import { VestingPeriod } from "./vesting-period.entity";
import { Coin } from "../common/types/coin.type";

@Entity("vesting_account")
export class VestingAccount {
  @ApiProperty({
    description: "Vesting account ID",
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: "Vesting account type",
    example: "DelayedVestingAccount",
  })
  @Column({ type: "text" })
  type: string;

  @ApiProperty({
    description: "Account address",
    example: "addr_safro1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @Column({ type: "text" })
  address: string;

  @ApiProperty({
    description: "Original vesting coins",
    example: [{ denom: "uatom", amount: "1000000" }],
  })
  @Column({ type: "jsonb" })
  original_vesting: Coin[];

  @ApiProperty({
    description: "Vesting end time",
    example: "2024-12-31T23:59:59Z",
  })
  @Column({ type: "timestamp without time zone" })
  end_time: Date;

  @ApiProperty({
    description: "Vesting start time",
    example: "2023-01-01T00:00:00Z",
  })
  @Column({ type: "timestamp without time zone", nullable: true })
  start_time?: Date;

  @ManyToOne(() => Account, (account) => account.vestingAccounts)
  @JoinColumn({ name: "address" })
  account?: Account;

  @OneToMany(() => VestingPeriod, (period) => period.vestingAccount)
  vestingPeriods?: VestingPeriod[];
}
