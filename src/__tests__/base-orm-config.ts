import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TestPivotEntity } from './test-pivot.entity';
import { TestRelatedEntity } from './test-related.entity';
import { TestEntity } from './test.entity';

export const baseOrmConfigs: TypeOrmModuleOptions = {
  entities: [TestEntity, TestRelatedEntity, TestPivotEntity],
  host: 'localhost',
  port: 3306,
  type: 'mysql',
  username: 'root',
  password: '',
  database: 'test',
};
