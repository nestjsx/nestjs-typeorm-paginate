import { PrimaryColumn, Entity } from 'typeorm';

@Entity()
export class TestEntity {
  @PrimaryColumn()
  id: number;
}
