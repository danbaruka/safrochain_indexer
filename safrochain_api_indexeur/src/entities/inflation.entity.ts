import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("inflation")
export class Inflation {
  @PrimaryColumn({ type: "boolean", default: true })
  one_row_id: boolean;

  @Column({ type: "decimal" })
  value: number;

  @Column({ type: "bigint" })
  height: number;
}
