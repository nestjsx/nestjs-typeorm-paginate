import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule, getConnectionToken } from "@nestjs/typeorm";
import { Connection, SelectQueryBuilder } from "typeorm";
import { paginate } from "./../paginate";
import { Pagination } from "../pagination";
import { TestEntity } from "./test.entity";

describe("Paginate with queryBuilder", () => {
  let app: TestingModule;
  let connection: Connection;
  let queryBuilder: SelectQueryBuilder<TestEntity>;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          entities: [TestEntity],
          host: "localhost",
          port: 3306,
          type: "mysql",
          username: "root",
          password: "",
          database: "test"
        })
      ]
    }).compile();
    connection = app.get(getConnectionToken());
    queryBuilder = connection.createQueryBuilder(TestEntity, "t");
  });

  afterEach(() => {
    app.close();
  });

  it("Can call paginate", async () => {
    const result = await paginate(queryBuilder, { limit: 10, page: 1 });
    expect(result).toBeInstanceOf(Pagination);
  });
});
