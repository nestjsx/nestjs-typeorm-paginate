import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getConnectionToken } from '@nestjs/typeorm';
import { Connection, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { paginate } from './../paginate';
import { Pagination } from '../pagination';
import { baseOrmConfigs } from './base-orm-config';
import { TestEntity } from './test.entity';
import { CountQueryTypeEnum, PaginationTypeEnum } from '../interfaces';
import { TestRelatedEntity } from './test-related.entity';
import { TestPivotEntity } from './test-pivot.entity';

describe('Paginate with queryBuilder', () => {
  let app: TestingModule;
  let connection: Connection;
  let runner: QueryRunner;
  let queryBuilder: SelectQueryBuilder<TestEntity>;
  let testRelatedQueryBuilder: SelectQueryBuilder<TestRelatedEntity>;
  let testPivotQueryBuilder: SelectQueryBuilder<TestPivotEntity>;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...baseOrmConfigs,
        }),
      ],
    }).compile();
    connection = app.get(getConnectionToken());
    runner = connection.createQueryRunner();
    await runner.startTransaction();

    queryBuilder = runner.manager.createQueryBuilder(TestEntity, 't');
    testRelatedQueryBuilder = runner.manager.createQueryBuilder(
      TestRelatedEntity,
      'tr',
    );
    testPivotQueryBuilder = runner.manager.createQueryBuilder(
      TestPivotEntity,
      'tp',
    );
  });

  afterEach(() => {
    runner.rollbackTransaction();
    app.close();
  });

  it('Can call paginate', async () => {
    const result = await paginate(queryBuilder, { limit: 10, page: 1 });
    expect(result).toBeInstanceOf(Pagination);
  });

  it('Can use paginationType take', async () => {
    const result = await paginate(queryBuilder, {
      limit: 10,
      page: 1,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
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

  it('Can paginate with countQueryType set to ENTITY', async () => {
    const pivot = (await testPivotQueryBuilder
      .where('tp.id = :id', { id: 1 })
      .getOne()) as TestPivotEntity;

    const testOne = await runner.manager
      .getRepository(TestEntity)
      .findOne({ where: { id: 1 } });
    const testTwo = await runner.manager
      .getRepository(TestEntity)
      .findOne({ where: { id: 2 } });

    if (testOne) {
      testOne.testPivots = [pivot];
    }

    if (testTwo) {
      testTwo.testPivots = [pivot];
    }

    await runner.manager.save([testOne, testTwo]);

    const qb = queryBuilder.innerJoinAndSelect(
      't.testPivots',
      'tp',
      't_tp.testPivotId = :id',
      { id: 1 },
    );

    const result = await paginate(qb, {
      limit: 10,
      page: 1,
      countQueryType: CountQueryTypeEnum.ENTITY,
    });

    expect(result).toBeInstanceOf(Pagination);
    expect(result.meta.totalItems).toEqual(2);
  });
});
