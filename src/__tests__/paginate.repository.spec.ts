import { paginate } from './../index';
import { Pagination } from '../pagination';
import { PaginationTypeEnum } from '../interfaces';
import { Entity, MockRepository } from './mocks';

describe('Test paginate function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Can call method', async () => {
    const mockRepository = new MockRepository(0);

    const results = await paginate<any>(mockRepository, {
      limit: 10,
      page: 1,
    });

    expect(results).toBeInstanceOf(Pagination);
  });

  it('Calls to `find` & `count` should be correct (with explicit `where` clause)', async () => {
    const mockRepository = new MockRepository(0);
    const paginateOpts = {
        limit: 8,
        page: 2,
      };
      const findCondition = {
          where: {foo: 'bar'},
          orderBy: {
              foo: 'ASC'
          }
      }

    paginate<any>(mockRepository, {...paginateOpts}, findCondition);

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(mockRepository.find).toHaveBeenCalledWith(expect.objectContaining({skip: 8, take: 8, ...findCondition}));
    expect(mockRepository.count).toHaveBeenCalledTimes(1);
    expect(mockRepository.count).toHaveBeenCalledWith(expect.objectContaining(findCondition.where));
  });

  it('Calls to `find` & `count` should be correct (with implicit `where` clause)', async () => {
    const mockRepository = new MockRepository(0);
    const paginateOpts = {
        limit: 8,
        page: 2,
      };
      const findCondition = {foo: 'bar'};

    paginate<any>(mockRepository, {...paginateOpts}, findCondition);

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(mockRepository.find).toHaveBeenCalledWith(expect.objectContaining({skip: 8, take: 8, where: findCondition}));
    expect(mockRepository.count).toHaveBeenCalledTimes(1);
    expect(mockRepository.count).toHaveBeenCalledWith(expect.objectContaining(findCondition));
  });

  it('Item length should be correct', async () => {
    const mockRepository = new MockRepository(10);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 1,
    });

    expect(results.items.length).toBe(4);
    expect(results.meta.itemCount).toBe(4);
  });

  it('Page count should be correct', async () => {
    const mockRepository = new MockRepository(10);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 1,
    });

    expect(results.meta.totalPages).toBe(3);
  });

  it('Particular page count should be correct', async () => {
    const mockRepository = new MockRepository(5);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 1,
    });

    expect(results.meta.totalPages).toBe(2);
  });

  it('Routes return successfully', async () => {
    const mockRepository = new MockRepository(10);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 2,
      route: 'http://example.com/something',
    });

    expect(results.links.first).toBe('http://example.com/something?limit=4');
    expect(results.links.previous).toBe(
      'http://example.com/something?page=1&limit=4',
    );
    expect(results.links.next).toBe(
      'http://example.com/something?page=3&limit=4',
    );
    expect(results.links.last).toBe(
      'http://example.com/something?page=3&limit=4',
    );
  });

  it('Routes return successfully using custom pageLabel and limitLabel', async () => {
    const mockRepository = new MockRepository(10);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 2,
      route: 'http://example.com/something',
      routingLabels: {
        limitLabel: 'page-size',
        pageLabel: 'current-page',
      },
    });

    expect(results.links.first).toBe(
      'http://example.com/something?page-size=4',
    );
    expect(results.links.previous).toBe(
      'http://example.com/something?current-page=1&page-size=4',
    );
    expect(results.links.next).toBe(
      'http://example.com/something?current-page=3&page-size=4',
    );
    expect(results.links.last).toBe(
      'http://example.com/something?current-page=3&page-size=4',
    );
  });

  it('Routes return successfully using custom pageLabel', async () => {
    const mockRepository = new MockRepository(10);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 2,
      route: 'http://example.com/something',
      routingLabels: {
        pageLabel: 'current-page',
      },
    });

    expect(results.links.first).toBe('http://example.com/something?limit=4');
    expect(results.links.previous).toBe(
      'http://example.com/something?current-page=1&limit=4',
    );
    expect(results.links.next).toBe(
      'http://example.com/something?current-page=3&limit=4',
    );
    expect(results.links.last).toBe(
      'http://example.com/something?current-page=3&limit=4',
    );
  });

  it('Routes return successfully using custom limitLabel', async () => {
    const mockRepository = new MockRepository(10);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 2,
      route: 'http://example.com/something',
      routingLabels: {
        limitLabel: 'page-size',
      },
    });

    expect(results.links.first).toBe(
      'http://example.com/something?page-size=4',
    );
    expect(results.links.previous).toBe(
      'http://example.com/something?page=1&page-size=4',
    );
    expect(results.links.next).toBe(
      'http://example.com/something?page=3&page-size=4',
    );
    expect(results.links.last).toBe(
      'http://example.com/something?page=3&page-size=4',
    );
  });

  it('Route previous return successfully blank', async () => {
    const mockRepository = new MockRepository(10);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 1,
      route: 'http://example.com/something',
    });

    expect(results.links.first).toBe('http://example.com/something?limit=4');
    expect(results.links.previous).toBe('');
    expect(results.links.next).toBe(
      'http://example.com/something?page=2&limit=4',
    );
    expect(results.links.last).toBe(
      'http://example.com/something?page=3&limit=4',
    );
  });

  it('Route next return successfully blank', async () => {
    const mockRepository = new MockRepository(10);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 3,
      route: 'http://example.com/something',
    });

    expect(results.links.first).toBe('http://example.com/something?limit=4');
    expect(results.links.previous).toBe(
      'http://example.com/something?page=2&limit=4',
    );
    expect(results.links.next).toBe('');
    expect(results.links.last).toBe(
      'http://example.com/something?page=3&limit=4',
    );
  });

  it('returns page 2 as the next one for a input page of "1"', async () => {
    const mockRepository = new MockRepository(10);

    const results = await paginate<Entity>(mockRepository, {
      limit: '4',
      page: '1',
      route: 'http://example.com/something',
    });

    expect(results.links.first).toBe('http://example.com/something?limit=4');
    expect(results.links.previous).toBe('');
    expect(results.links.next).toBe(
      'http://example.com/something?page=2&limit=4',
    );
    expect(results.links.last).toBe(
      'http://example.com/something?page=3&limit=4',
    );
  });

  it('replaces a bad limit with the default of 10', async () => {
    const mockRepository = new MockRepository(15);

    const consoleMock = jest
      .spyOn(console, 'warn')
      .mockImplementationOnce(() => {});

    const results = await paginate<Entity>(mockRepository, {
      limit: 'x',
      page: 2,
      route: 'http://example.com/something',
    });

    expect(results.items.length).toBe(5);
    expect(results.links.first).toBe('http://example.com/something?limit=10');
    expect(results.links.previous).toBe(
      'http://example.com/something?page=1&limit=10',
    );
    expect(results.links.next).toBe('');
    expect(results.links.last).toBe(
      'http://example.com/something?page=2&limit=10',
    );
    expect(consoleMock).toHaveBeenCalledWith(
      'Query parameter "limit" with value "x" was resolved as "NaN", please validate your query input! Falling back to default "10".',
    );
  });

  it('replaces an alphabetic page with the default of 1', async () => {
    const mockRepository = new MockRepository(10);

    const consoleMock = jest
      .spyOn(console, 'warn')
      .mockImplementationOnce(() => {});

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 'x',
      route: 'http://example.com/something',
    });

    expect(results.items.length).toBe(4);
    expect(results.links.first).toBe('http://example.com/something?limit=4');
    expect(results.links.previous).toBe('');
    expect(results.links.next).toBe(
      'http://example.com/something?page=2&limit=4',
    );
    expect(results.links.last).toBe(
      'http://example.com/something?page=3&limit=4',
    );
    expect(consoleMock).toHaveBeenCalledWith(
      'Query parameter "page" with value "x" was resolved as "NaN", please validate your query input! Falling back to default "1".',
    );
  });

  it('replaces a decimal page with the default of 1', async () => {
    const mockRepository = new MockRepository(10);

    const consoleMock = jest
      .spyOn(console, 'warn')
      .mockImplementationOnce(() => {});

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 2.2,
      route: 'http://example.com/something',
    });

    expect(results.items.length).toBe(4);
    expect(results.links.first).toBe('http://example.com/something?limit=4');
    expect(results.links.previous).toBe('');
    expect(results.links.next).toBe(
      'http://example.com/something?page=2&limit=4',
    );
    expect(results.links.last).toBe(
      'http://example.com/something?page=3&limit=4',
    );
    expect(consoleMock).toHaveBeenCalledWith(
      'Query parameter "page" with value "2.2" was resolved as "2.2", please validate your query input! Falling back to default "1".',
    );
  });

  it('replaces a negative page with the default of 1', async () => {
    const mockRepository = new MockRepository(10);

    const consoleMock = jest
      .spyOn(console, 'warn')
      .mockImplementationOnce(() => {});

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: '-2',
      route: 'http://example.com/something',
    });

    expect(results.items.length).toBe(4);
    expect(results.links.first).toBe('http://example.com/something?limit=4');
    expect(results.links.previous).toBe('');
    expect(results.links.next).toBe(
      'http://example.com/something?page=2&limit=4',
    );
    expect(results.links.last).toBe(
      'http://example.com/something?page=3&limit=4',
    );
    expect(consoleMock).toHaveBeenCalledWith(
      'Query parameter "page" with value "-2" was resolved as "-2", please validate your query input! Falling back to default "1".',
    );
  });

  it('Can pass FindConditions', async () => {
    const mockRepository = new MockRepository(2);

    const results = await paginate<Entity>(
      mockRepository,
      {
        limit: 4,
        page: 1,
      },
      {
        where: {
          test: 1,
        },
      },
    );

    expect(results).toBeTruthy();
  });

  it('Correctly paginates through the results', async () => {
    const mockRepository = new MockRepository(10);

    // get first page
    let results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 1,
    });
    expect(results.meta.itemCount).toBe(4);
    expect(results.meta.currentPage).toBe(1);
    expect(results.meta.itemsPerPage).toBe(4);

    // get second page
    results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 2,
    });
    expect(results.meta.itemCount).toBe(4);
    expect(results.meta.currentPage).toBe(2);
    expect(results.meta.itemsPerPage).toBe(4);

    // get third page
    results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 3,
    });
    expect(results.meta.itemCount).toBe(2);
    expect(results.meta.currentPage).toBe(3);
    expect(results.meta.itemsPerPage).toBe(4);
  });

  it('Can resolve correct path', async () => {
    const mockRepository = new MockRepository(10);

    let results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 1,
      route: '/test?test=test',
    });

    expect(results.links.next).toBe('/test?test=test&page=2&limit=4');
  });

  it('when page is 0, return empty pagination object', async () => {
    const mockRepository = new MockRepository(10);

    let results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 0,
      route: '/test?test=test',
    });

    expect(results.items.length).toBe(0);
    expect(results.links.first).toBe('/test?test=test&limit=4');
    expect(results.links.previous).toBe('');
    expect(results.links.next).toBe('');
    expect(results.links.last).toBe('');
  });

  it('Can use skip and take', async () => {
    const mockRepository = new MockRepository(10);

    let results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 0,
      route: '/test?test=test',
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    });

    expect(results.items.length).toBe(0);
    expect(results.links.first).toBe('/test?test=test&limit=4');
    expect(results.links.previous).toBe('');
    expect(results.links.next).toBe('');
    expect(results.links.last).toBe('');
  });

  it('Can call paginate with no count queries', async () => {
    const mockRepository = new MockRepository(10);

    const results = await paginate<any>(mockRepository, {
      limit: 10,
      page: 1,
      countQueries: false,
    });

    expect(results).toBeInstanceOf(Pagination);
    expect(results.items.length).toBe(10);
    expect(results.meta.totalItems).toBe(undefined);
    expect(results.meta.totalPages).toBe(undefined);
  });
});
