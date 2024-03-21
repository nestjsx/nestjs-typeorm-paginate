import { PrimaryColumn, Entity, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { TestPivotEntity } from './test-pivot.entity';
import { TestRelatedEntity } from './test-related.entity';

@Entity()
export class TestEntity {
  @PrimaryColumn()
  id: number;

  @OneToMany(() => TestRelatedEntity, (related) => related.test)
  related: TestRelatedEntity[];

  @ManyToMany(() => TestPivotEntity, (testPivots) => testPivots.tests)
  @JoinTable({
    name: 'test_test_pivot',
    joinColumn: {
      name: 'testId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'testPivotId',
      referencedColumnName: 'id',
    },
  })
  testPivots: TestPivotEntity[];
}
