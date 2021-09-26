import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TestEntity } from './test.entity';

export const baseOrmConfigs: TypeOrmModuleOptions = {
  entities: [TestEntity],
  host: 'localhost',
  port: 3306,
  type: 'mysql',
  username: 'root',
  password: '',
  database: 'test',
};
