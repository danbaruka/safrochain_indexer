import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("mint_params")
export class MintParams {
  @PrimaryColumn({ type: "boolean", default: true })
  one_row_id: boolean;

  @Column({ type: "jsonb" })
  params: any;

  @Column({ type: "bigint" })
  height: number;
}
