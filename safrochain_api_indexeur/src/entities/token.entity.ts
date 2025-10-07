import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { TokenUnit } from "./token-unit.entity";

@Entity("token")
export class Token {
  @ApiProperty({
    description: "Token name",
    example: "Safro",
  })
  @PrimaryColumn({ type: "text" })
  name: string;

  @OneToMany(() => TokenUnit, (unit) => unit.token)
  units?: TokenUnit[];
}
