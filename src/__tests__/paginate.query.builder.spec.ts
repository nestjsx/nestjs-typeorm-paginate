import { DataSource, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { paginate } from './../paginate';
import { Pagination } from '../pagination';
import { baseOrmConfigs } from './base-orm-config';
import { TestEntity } from './test.entity';
import { PaginationTypeEnum } from '../interfaces';
import { TestRelatedEntity } from './test-related.entity';

describe('Paginate with queryBuilder', () => {
  let dataSource: DataSource;
  let runner: QueryRunner;
  let queryBuilder: SelectQueryBuilder<TestEntity>;
  let testRelatedQueryBuilder: SelectQueryBuilder<TestRelatedEntity>;

  beforeEach(async () => {
    dataSource = new DataSource({ ...baseOrmConfigs });
    runner = dataSource.createQueryRunner();

    await dataSource.initialize();
    await runner.startTransaction();

    queryBuilder = runner.manager.createQueryBuilder(TestEntity, 't');
    testRelatedQueryBuilder = runner.manager.createQueryBuilder(
      TestRelatedEntity,
      'tr',
    );
  });

  afterEach(async () => {
    await runner.rollbackTransaction();
    await dataSource.destroy();
  });

  it('Can call paginate', async () => {
    const result = await paginate(queryBuilder, { limit: 10, page: 1 });
    expect(result).toBeInstanceOf(Pagination);
  });

  it('Can use paginationType take', async () => {
    const result = await paginate(queryBuilder, {
      limit: 10,
      page: 1,
      paginationType: PaginationTypeEnum.LIMIT_AND_OFFSET,
    });
    expect(result).toBeInstanceOf(Pagination);
  });

  it('Can call paginate with no count queries', async () => {
    const result = await paginate(queryBuilder, {
      limit: 10,
      page: 1,
      paginationType: PaginationTypeEnum.LIMIT_AND_OFFSET,
      countQueries: false,
    });

    expect(result).toBeInstanceOf(Pagination);
    expect(result.meta.totalItems).toBe(undefined);
    expect(result.meta.totalPages).toBe(undefined);
  });

  it('Can count with params', async () => {
    queryBuilder.where('id = :id', { id: 1 });

    const result = await paginate(queryBuilder, {
      limit: 10,
      page: 1,
      paginationType: PaginationTypeEnum.LIMIT_AND_OFFSET,
    });

    expect(result).toBeInstanceOf(Pagination);
    expect(result.meta.totalItems).toBe(1);
    expect(result.meta.totalPages).toBe(1);
  });

  it('Can count with having', async () => {
    queryBuilder.having('id > 1');

    const result = await paginate(queryBuilder, {
      limit: 10,
      page: 1,
      paginationType: PaginationTypeEnum.LIMIT_AND_OFFSET,
    });

    expect(result).toBeInstanceOf(Pagination);
    expect(result.meta.totalItems).toBe(9);
    expect(result.meta.totalPages).toBe(1);
  });

  it('Can paginate with joins', async () => {
    await testRelatedQueryBuilder
      .createQueryBuilder()
      .insert()
      .into(TestRelatedEntity)
      .values([
        { id: 1, testId: 1 },
        { id: 2, testId: 1 },
        { id: 3, testId: 1 },
      ])
      .execute();

    const qb = queryBuilder.leftJoinAndSelect('t.related', 'r');

    const result = await paginate(qb, { limit: 5, page: 1 });

    expect(result).toBeInstanceOf(Pagination);
    expect(result.meta.totalItems).toEqual(10);
  });
});
