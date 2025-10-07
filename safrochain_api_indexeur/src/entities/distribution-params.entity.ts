import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("distribution_params")
export class DistributionParams {
  @PrimaryColumn({ type: "boolean", default: true })
  one_row_id: boolean;

  @Column({ type: "jsonb" })
  params: any;

  @Column({ type: "bigint" })
  height: number;
}
