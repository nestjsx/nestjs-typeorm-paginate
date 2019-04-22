import { paginate } from "./../index";
import { Repository, FindManyOptions } from "typeorm";
import { Pagination } from "../pagination";

class MockRepository extends Repository<any> {

  items = [];
  constructor(entityAmount: number) {
    super();
    for (let i = 0; i < entityAmount; i++)
      this.items.push(new Entity());

  }

  findAndCount = async (options?: FindManyOptions<any>): Promise<[any[], number]> => {
    const localItems = this.items.slice(0, options.take);
    return [localItems, this.items.length];
  };
}

class Entity { }

describe("Test paginate function", () => {
  it("Can call method", async () => {
    const mockRepository = new MockRepository(0);

    const results = await paginate<any>(mockRepository, {
      limit: 10,
      page: 1,
    });

    expect(results).toBeInstanceOf(Pagination);
  });

  it("Item length should be correct", async () => {
    const mockRepository = new MockRepository(10);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 1,
    });

    expect(results.items.length).toBe(4);
    expect(results.itemCount).toBe(4);
  });

  it("Page count should be correct", async () => {
    const mockRepository = new MockRepository(10);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 1,
    });

    expect(results.pageCount).toBe(3);
  });

  it("Particular page count should be correct", async () => {
    const mockRepository = new MockRepository(5);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 1,
    });

    expect(results.pageCount).toBe(2);
  });

  it('Routes return successfully', async () => {
    const mockRepository = new MockRepository(10);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 2,
      route: 'http://example.com/something',
    });

    expect(results.next).toBe('http://example.com/something?page=3');
    expect(results.previous).toBe('http://example.com/something?page=1');
  });

  it('Route previous return successfully blank', async () => {
    const mockRepository = new MockRepository(10);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 1,
      route: 'http://example.com/something',
    });

    expect(results.next).toBe('http://example.com/something?page=2');
    expect(results.previous).toBe('');
  });

  it('Route next return successfully blank', async () => {
    const mockRepository = new MockRepository(10);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 3,
      route: 'http://example.com/something',
    });

    expect(results.next).toBe('');
    expect(results.previous).toBe('http://example.com/something?page=2');
  });

  it('Can pass FindConditions', async () => {
    const mockRepository = new MockRepository(2);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 1,
    }, {
        where: {
          test: 1,
        },
      });

    expect(results).toBeTruthy();
  });

  // TODO add more functionality mocks
});
