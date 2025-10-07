import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("validator_signing_info")
export class ValidatorSigningInfo {
  @PrimaryColumn()
  validator_address: string;

  @Column({ type: "bigint" })
  start_height: number;

  @Column({ type: "bigint" })
  index_offset: number;

  @Column({ type: "timestamp" })
  jailed_until: Date;

  @Column({ type: "boolean" })
  tombstoned: boolean;

  @Column({ type: "bigint" })
  missed_blocks_counter: number;

  @Column({ type: "bigint" })
  height: number;
}
