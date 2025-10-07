import { ApiProperty } from "@nestjs/swagger";
import { DateSerializer } from "../common/utils/date-serializer.util";

export class GenesisResponseDto {
  @ApiProperty({
    description: "Genesis chain ID",
    example: "safrochain-1",
  })
  chain_id: string;

  @ApiProperty({
    description: "Genesis time",
    example: "2023-01-01T00:00:00Z",
  })
  @DateSerializer()
  genesis_time: Date;

  @ApiProperty({
    description: "Initial height",
    example: 1,
  })
  initial_height: number;

  @ApiProperty({
    description: "Genesis hash",
    example: "ABC123DEF456GHI789JKL012MNO345PQR678STUVWXYZ",
  })
  genesis_hash: string;

  @ApiProperty({
    description: "App hash",
    example: "XYZ789UVW012RST345MNO678PQR901STU234VWX567YZA",
  })
  app_hash: string;

  @ApiProperty({
    description: "Genesis data (JSON)",
    example: {
      genesis_time: "2023-01-01T00:00:00Z",
      chain_id: "safrochain-1",
      initial_height: "1",
      app_hash: "",
      app_state: {},
    },
  })
  genesis_data: any;

  @ApiProperty({
    description: "Block height",
    example: 1,
  })
  height: number;
}
