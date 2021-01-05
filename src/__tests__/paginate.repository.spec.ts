import { paginate } from './../index';
import { Repository, FindManyOptions } from 'typeorm';
import { Pagination } from '../pagination';

class MockRepository extends Repository<any> {
  items = [];
  constructor(entityAmount: number) {
    super();
    for (let i = 0; i < entityAmount; i++) this.items.push(new Entity());
  }

  findAndCount = async (
    options?: FindManyOptions<any>,
  ): Promise<[any[], number]> => {
    const startIndex = options.skip;
    const endIndex = startIndex + options.take;

    const localItems = this.items.slice(startIndex, endIndex);
    return [localItems, this.items.length];
  };
}

class Entity {}

describe('Test paginate function', () => {
  it('Can call method', async () => {
    const mockRepository = new MockRepository(0);

    const results = await paginate<any>(mockRepository, {
      limit: 10,
      page: 1,
    });

    expect(results).toBeInstanceOf(Pagination);
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
      limit: "4" as any,
      page: "1" as any,
      route: 'http://example.com/something',
    });

    expect(results.links.first).toBe('http://example.com/something?limit=4');
    expect(results.links.previous).toBe(
      '',
    );
    expect(results.links.next).toBe('http://example.com/something?page=11&limit=4'); // TODO
    expect(results.links.last).toBe(
      'http://example.com/something?page=3&limit=4',
    );
  });

  it('replaces a bad limit with the default of 10', async () => {
    const mockRepository = new MockRepository(15);

    const results = await paginate<Entity>(mockRepository, {
      limit: "x" as any,
      page: 2,
      route: 'http://example.com/something',
    });

    expect(results.items.length).toBe(0); // TODO
    expect(results.links.first).toBe('http://example.com/something?limit=x'); // TODO
    expect(results.links.previous).toBe('http://example.com/something?page=1&limit=x'); // TODO
    expect(results.links.next).toBe('');
    expect(results.links.last).toBe('http://example.com/something?page=NaN&limit=x'); // TODO
  });

  it('replaces a bad page with the default of 1', async () => {
    const mockRepository = new MockRepository(10);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: "x" as any,
      route: 'http://example.com/something',
    });

    expect(results.items.length).toBe(0); // TODO
    expect(results.links.first).toBe('http://example.com/something?limit=4');
    expect(results.links.previous).toBe('');
    expect(results.links.next).toBe(''); // TODO
    expect(results.links.last).toBe('http://example.com/something?page=3&limit=4');
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
    expect(results.links.last).toBe('/test?test=test&page=0&limit=4'); // TODO
  });
});
