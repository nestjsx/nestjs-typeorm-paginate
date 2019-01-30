import { paginate } from "./../index";
import { Repository, FindManyOptions } from "typeorm";
import { Pagination } from "../pagination";

class MockRepository extends Repository<any> {}

class Entity {}

// TODO need a better way of mocking
const createMockRepository = (items: any[]): MockRepository => {
  const mock = new MockRepository();
  mock.findAndCount = async (
    options?: FindManyOptions<any>
  ): Promise<[any[], number]> => {
    const localItems = items.slice(0, options.take);
    return [localItems, items.length];
  };

  return mock;
};

describe("Test paginate function", () => {
  it("Can call method", async () => {
    const mockRepository = createMockRepository([]);

    const results = await paginate<any>(mockRepository, {
      limit: 10,
      page: 1
    });

    expect(results).toBeInstanceOf(Pagination);
  });

  it("Item length should be correct", async () => {
    const mockRepository = createMockRepository([
      new Entity(),
      new Entity(),
      new Entity(),
      new Entity(),
      new Entity(),
      new Entity(),
      new Entity(),
      new Entity(),
      new Entity(),
      new Entity()
    ]);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 1
    });

    expect(results.items.length).toBe(4);
    expect(results.itemCount).toBe(4);
  });

  it("Page count should be correct", async () => {
    const mockRepository = createMockRepository([
      new Entity(),
      new Entity(),
      new Entity(),
      new Entity(),
      new Entity(),
      new Entity(),
      new Entity(),
      new Entity(),
      new Entity(),
      new Entity()
    ]);

    const results = await paginate<Entity>(mockRepository, {
      limit: 4,
      page: 1
    });

    expect(results.pageCount).toBe(3);
  });

  // TODO add more functionality mocks
});
