import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TestRelatedEntity } from './test-related.entity';
import { TestEntity } from './test.entity';

export const baseOrmConfigs: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: [TestEntity, TestRelatedEntity],
  synchronize: true, // Ensure it's set according to your needs
  // Add SQLite-specific settings to handle concurrent connections
  enableWAL: true, // Enable Write-Ahead Logging
  busyErrorRetry: 1000, // Retry for 1 second if database is busy
};


