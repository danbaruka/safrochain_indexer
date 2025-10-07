import { Column, PrimaryColumn } from 'typeorm';

export abstract class BaseEntity {
  @Column({ name: 'height', type: 'bigint' })
  height: number;
}

export abstract class OneRowEntity {
  @PrimaryColumn({ name: 'one_row_id', type: 'boolean', default: true })
  oneRowId: boolean;

  @Column({ name: 'height', type: 'bigint' })
  height: number;
}
