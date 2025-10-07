import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Validator } from "./validator.entity";

@Entity("validator_description")
export class ValidatorDescription {
  @ApiProperty({
    description: "Validator consensus address",
    example: "cosmosvalcons1abc123def456ghi789jkl012mno345pqr678stu",
  })
  @PrimaryColumn({ type: "text" })
  validator_address: string;

  @ApiProperty({
    description: "Validator moniker (name)",
    example: "Cosmos Validator",
  })
  @Column({ type: "text", nullable: true })
  moniker?: string;

  @ApiProperty({
    description: "Validator identity",
    example: "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6",
  })
  @Column({ type: "text", nullable: true })
  identity?: string;

  @ApiProperty({
    description: "Validator avatar URL",
    example: "https://example.com/avatar.png",
  })
  @Column({ type: "text", nullable: true })
  avatar_url?: string;

  @ApiProperty({
    description: "Validator website",
    example: "https://cosmosvalidator.com",
  })
  @Column({ type: "text", nullable: true })
  website?: string;

  @ApiProperty({
    description: "Security contact information",
    example: "security@cosmosvalidator.com",
  })
  @Column({ type: "text", nullable: true })
  security_contact?: string;

  @ApiProperty({
    description: "Validator details",
    example: "Professional validator with 99.9% uptime",
  })
  @Column({ type: "text", nullable: true })
  details?: string;

  @ApiProperty({
    description: "Block height when this description was recorded",
    example: 12345,
  })
  @Column({ type: "bigint" })
  height: number;

  @OneToOne(() => Validator, (validator) => validator.description)
  @JoinColumn({ name: "validator_address" })
  validator?: Validator;
}
