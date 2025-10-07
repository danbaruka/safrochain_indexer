import { Entity, PrimaryColumn, Column } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity("genesis")
export class Genesis {
  @ApiProperty({
    description: "Single row identifier",
    example: true,
  })
  @PrimaryColumn({ type: "boolean", default: true })
  one_row_id: boolean;

  @ApiProperty({
    description: "Chain ID",
    example: "safrochain-1",
  })
  @Column({ type: "text" })
  chain_id: string;

  @ApiProperty({
    description: "Genesis time",
    example: "2023-01-01T00:00:00Z",
  })
  @Column({ type: "timestamp" })
  time: Date;

  @ApiProperty({
    description: "Initial block height",
    example: 1,
  })
  @Column({ type: "bigint" })
  initial_height: number;
}
