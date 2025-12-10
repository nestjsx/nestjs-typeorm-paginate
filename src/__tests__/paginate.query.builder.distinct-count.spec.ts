import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, TypeOrmModule } from '@nestjs/typeorm';
import { Connection, QueryRunner } from 'typeorm';
import { paginate } from '../paginate';
import { baseOrmConfigs } from './base-orm-config';
import { TestEntity } from './test.entity';
import { TestRelatedEntity } from './test-related.entity';

describe('Paginate counts with joins', () => {
  let app: TestingModule;
  let connection: Connection;
  let runner: QueryRunner;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...baseOrmConfigs,
          dropSchema: true,
          synchronize: true,
        }),
      ],
    }).compile();

    connection = app.get(getConnectionToken());
    runner = connection.createQueryRunner();

    await runner.manager
      .createQueryBuilder()
      .insert()
      .into(TestEntity)
      .values([{ id: 1 }, { id: 2 }])
      .execute();

    await runner.manager
      .createQueryBuilder()
      .insert()
      .into(TestRelatedEntity)
      .values([
        { id: 1, testId: 1 },
        { id: 2, testId: 1 },
        { id: 3, testId: 1 },
        { id: 4, testId: 2 },
      ])
      .execute();
  });

  afterAll(async () => {
    await runner.release();
    await app.close();
  });

  it('counts distinct root entities even when joins duplicate rows', async () => {
    const qb = runner.manager
      .createQueryBuilder(TestEntity, 't')
      .leftJoinAndSelect('t.related', 'r')
      .orderBy('t.id', 'ASC');

    const result = await paginate(qb, { limit: 10, page: 1 });

    expect(result.items.map(({ id }) => id)).toEqual([1, 2]);
    expect(result.meta.totalItems).toBe(2);
    expect(result.meta.totalPages).toBe(1);
  });
});
