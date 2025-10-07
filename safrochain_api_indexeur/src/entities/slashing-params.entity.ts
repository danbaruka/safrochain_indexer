import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("slashing_params")
export class SlashingParams {
  @PrimaryColumn({ type: "boolean", default: true })
  one_row_id: boolean;

  @Column({ type: "jsonb" })
  params: any;

  @Column({ type: "bigint" })
  height: number;
}
