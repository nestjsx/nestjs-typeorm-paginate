import { Connection, SelectQueryBuilder } from "typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule, getConnectionToken } from "@nestjs/typeorm";

import { CategoryEntity } from "./category.entity";
import { CommentEntity } from "./comment.entity";
import { Pagination } from "../pagination";
import { PostEntity } from "./post.entity";
import { paginate } from "./../paginate";

describe("Paginate with queryBuilder", () => {
  let app: TestingModule;
  let connection: Connection;
  let queryBuilder: SelectQueryBuilder<PostEntity>;

  beforeAll(async ()=>{
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          entities: [PostEntity, CommentEntity, CategoryEntity],
          host: "localhost",
          port: 3306,
          type: "mysql",
          username: "root",
          password: "",
          database: "test",
          logging: false
        })
      ]
    }).compile();
    connection = app.get(getConnectionToken());
  });
  
  afterAll(()=>{
    app.close();
  });

  it("Can call paginate", async () => {
    queryBuilder = connection.createQueryBuilder(PostEntity, "post");
    const result = await paginate(queryBuilder, { limit: 10, page: 1 });
    expect(result).toBeInstanceOf(Pagination);
  });
  
  it("Query page 1", async () => {
    queryBuilder = connection.createQueryBuilder(PostEntity, "post").leftJoinAndSelect("post.comments", "text").leftJoinAndSelect("post.categories", "name")
    const result = await paginate(queryBuilder, { limit: 10, page: 1 });
    expect(result.meta.totalPages).toEqual(2);
    expect(result.meta.itemCount).toEqual(10);
    expect(result.meta.totalItems).toEqual(15);
  });
  it("Query page 2", async () => {
    queryBuilder = connection.createQueryBuilder(PostEntity, "post").leftJoinAndSelect("post.comments", "text").leftJoinAndSelect("post.categories", "name")
    const result = await paginate(queryBuilder, { limit: 10, page: 2 });
    expect(result.meta.totalPages).toEqual(2);
    expect(result.meta.itemCount).toEqual(5);
    expect(result.meta.totalItems).toEqual(15);
  });
});
