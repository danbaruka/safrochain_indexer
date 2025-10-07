import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("community_pool")
export class CommunityPool {
  @PrimaryColumn({ type: "boolean", default: true })
  one_row_id: boolean;

  @Column({ type: "jsonb" })
  coins: any[];

  @Column({ type: "bigint" })
  height: number;
}
