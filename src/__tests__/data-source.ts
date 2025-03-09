import { DataSource } from 'typeorm';
import { TestEntity } from './test.entity';
import { TestRelatedEntity } from './test-related.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:', // Using in-memory SQLite database
  entities: [TestEntity, TestRelatedEntity],
  synchronize: true,
  logging: false,
  // Enable these options for better testing experience
  dropSchema: true,
  migrations: [],
  // Add SQLite-specific settings
  enableWAL: true,
  busyErrorRetry: 1000,
});
