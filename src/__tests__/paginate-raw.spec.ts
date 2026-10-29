import { DataSource, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { paginateRaw } from '../paginate';
import { Pagination } from '../pagination';
import { baseOrmConfigs } from './base-orm-config';
import { TestEntity } from './test.entity';

interface RawQueryResult {
  id: string;
  sum: string;
}

describe('Test paginateRaw function', () => {
  let dataSource: DataSource;
  let runner: QueryRunner;
  let queryBuilder: SelectQueryBuilder<RawQueryResult>;

  let results: Pagination<RawQueryResult>;

  const totalItems = 10;

  beforeAll(async () => {
    dataSource = new DataSource({
      ...baseOrmConfigs,
      dropSchema: true,
      synchronize: true,
    });
    await dataSource.initialize();

    runner = dataSource.createQueryRunner();
    queryBuilder = runner.manager.createQueryBuilder<RawQueryResult>(
      TestEntity,
      't',
    );

    // Insert some registries on database
    for (let i = 1; i <= totalItems; i++) {
      await queryBuilder
        .insert()
        .into(TestEntity)
        .values({
          id: i,
        })
        .execute();
    }
  });

  afterAll(async () => {
    await queryBuilder.delete();
    await dataSource.destroy();
  });

  describe.each([
    [
      { limit: 10, page: 1 },
      {
        itemCount: 10,
        totalItems: 10,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      },
      {
        first: 'http://example.com/something?limit=10',
        previous: '',
        next: '',
        last: 'http://example.com/something?page=1&limit=10',
      },
    ],
    [
      { limit: 3, page: 2 },
      {
        itemCount: 3,
        totalItems: 10,
        itemsPerPage: 3,
        totalPages: 4,
        currentPage: 2,
      },
      {
        first: 'http://example.com/something?limit=3',
        previous: 'http://example.com/something?page=1&limit=3',
        next: 'http://example.com/something?page=3&limit=3',
        last: 'http://example.com/something?page=4&limit=3',
      },
    ],
    [
      {
        limit: 3,
        page: 2,
        routingLabels: { limitLabel: 'page-size', pageLabel: 'current-page' },
      },
      {
        itemCount: 3,
        totalItems: 10,
        itemsPerPage: 3,
        totalPages: 4,
        currentPage: 2,
      },
      {
        first: 'http://example.com/something?page-size=3',
        previous: 'http://example.com/something?current-page=1&page-size=3',
        next: 'http://example.com/something?current-page=3&page-size=3',
        last: 'http://example.com/something?current-page=4&page-size=3',
      },
    ],
    [
      { limit: 3, page: 2, routingLabels: { limitLabel: 'page-size' } },
      {
        itemCount: 3,
        totalItems: 10,
        itemsPerPage: 3,
        totalPages: 4,
        currentPage: 2,
      },
      {
        first: 'http://example.com/something?page-size=3',
        previous: 'http://example.com/something?page=1&page-size=3',
        next: 'http://example.com/something?page=3&page-size=3',
        last: 'http://example.com/something?page=4&page-size=3',
      },
    ],
    [
      { limit: 3, page: 2, routingLabels: { pageLabel: 'current-page' } },
      {
        itemCount: 3,
        totalItems: 10,
        itemsPerPage: 3,
        totalPages: 4,
        currentPage: 2,
      },
      {
        first: 'http://example.com/something?limit=3',
        previous: 'http://example.com/something?current-page=1&limit=3',
        next: 'http://example.com/something?current-page=3&limit=3',
        last: 'http://example.com/something?current-page=4&limit=3',
      },
    ],
  ])(
    'For options %j should return meta %j and links %j',
    (options, meta, links) => {
      beforeAll(async () => {
        queryBuilder
          .select('t.id', 'id')
          .addSelect('SUM(t.id)', 'sum')
          .groupBy('t.id');

        results = await paginateRaw(queryBuilder, {
          ...options,
          route: 'http://example.com/something',
        });
      });

      it('should return results', () => {
        expect(results).toBeInstanceOf(Pagination);
      });

      it('should return meta', () => {
        expect(results.meta).toStrictEqual(meta);
      });

      it('should return links', () => {
        expect(results.links).toStrictEqual(links);
      });
    },
  );

  it('Can call paginate with no count queries', async () => {
    const result = await paginateRaw(queryBuilder, {
      limit: 10,
      page: 1,
      countQueries: false,
    });

    expect(result).toBeInstanceOf(Pagination);
    expect(result.meta.totalItems).toBe(undefined);
    expect(result.meta.totalPages).toBe(undefined);
  });
});
