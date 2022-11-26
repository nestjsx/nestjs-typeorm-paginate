import { Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { TestEntity } from './test.entity';

@Entity()
export class TestPivotEntity {
  @PrimaryColumn()
  id: number;

  @ManyToMany(() => TestEntity, (tests) => tests.testPivots)
  tests: TestEntity[];
}
