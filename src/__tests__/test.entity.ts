import { PrimaryColumn, Entity, OneToMany } from 'typeorm';
import { TestRelatedEntity } from './test-related.entity';

@Entity()
export class TestEntity {
  @PrimaryColumn()
  id: number;

  @OneToMany(() => TestRelatedEntity, (related) => related.test)
  related: TestRelatedEntity[];
}
