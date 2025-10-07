import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("gov_params")
export class GovParams {
  @PrimaryColumn({ type: "boolean", default: true })
  one_row_id: boolean;

  @Column({ type: "jsonb" })
  params: any;

  @Column({ type: "bigint" })
  height: number;
}
