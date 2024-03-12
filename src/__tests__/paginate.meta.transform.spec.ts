import { paginate } from "../index";
import { Pagination } from "../pagination";
import { MockRepository } from "./mocks";

describe("Custom Pagination Transformer", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Can return specific type when using custom meta type", async () => {
    const mockRepository = new MockRepository(0);

    class TestPaginationMetaClass {
      constructor(
        public readonly count: number,
        public readonly total: number,
        public readonly perPage: number,
        public readonly currentPage: number,
      ) {}
    }

    const results = await paginate<any, TestPaginationMetaClass>(
      mockRepository,
      {
        limit: 10,
        page: 1,
        metaTransformer: (meta): TestPaginationMetaClass =>
          new TestPaginationMetaClass(
            meta.itemCount,
            meta.totalItems || 0,
            meta.itemsPerPage,
            meta.currentPage,
          ),
      },
    );

    expect(results).toBeInstanceOf(Pagination);
    expect(results.meta).toBeInstanceOf(TestPaginationMetaClass);
    expect(results.meta).toHaveProperty("count");
    expect(results.meta).toHaveProperty("total");
    expect(results.meta).toHaveProperty("perPage");
    expect(results.meta).toHaveProperty("currentPage");
  });
});
