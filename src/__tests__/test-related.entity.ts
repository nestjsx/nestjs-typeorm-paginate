import { PrimaryColumn, Entity, ManyToOne, Column } from 'typeorm';
import { TestEntity } from './test.entity';

@Entity()
export class TestRelatedEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  testId: number;

  @ManyToOne(() => TestEntity, (test) => test.related)
  test: TestEntity;
}
