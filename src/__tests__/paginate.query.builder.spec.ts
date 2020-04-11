import { Connection, SelectQueryBuilder } from "typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule, getConnectionToken } from "@nestjs/typeorm";

import { CategoryEntity } from "./category.entity";
import { CommentEntity } from "./comment.entity";
import { Pagination } from "../pagination";
import { PostEntity } from "./post.entity";
import { paginate } from "./../paginate";

async function seedData(postAmount){
  const category1 = await CategoryEntity.create({name: 'category 1'}).save();
  const category2 = await CategoryEntity.create({name: 'category 2'}).save();
  for(let i =0; i< postAmount; i++){
    let post = await PostEntity.create({title: `Title ${i+1}`, categories: [category1, category2]}).save()
    
    await CommentEntity.create({
      postId: post.id,
      text: `Comment 1 of post ${i+1}`
    }).save()
    await CommentEntity.create({
      postId: post.id,
      text: `Comment 2 of post ${i+1}`
    }).save()
  }
}

async function cleanUp(connection){
  await connection
    .createQueryBuilder()
    .delete()
    .from(CommentEntity)
    .execute();
  await connection
    .createQueryBuilder()
    .delete()
    .from(CategoryEntity)
    .execute();
  await connection
    .createQueryBuilder()
    .delete()
    .from(PostEntity)
    .execute();
}

describe("Paginate with queryBuilder", () => {
  let app: TestingModule;
  let connection: Connection;
  let queryBuilder: SelectQueryBuilder<PostEntity>;
  let postAmount = 15;
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
    await seedData(postAmount)
  });
  
  afterAll(async ()=>{
    await cleanUp(connection)
    app.close();
  });

  it("Can call paginate", async () => {
    queryBuilder = connection.createQueryBuilder(PostEntity, "post");
    const result = await paginate(queryBuilder, { limit: 10, page: 1 });
    expect(result).toBeInstanceOf(Pagination);
  });
  
  it("Query page 1 use QueryBuilder with relations", async () => {
    queryBuilder = connection.createQueryBuilder(PostEntity, "post").leftJoinAndSelect("post.comments", "text").leftJoinAndSelect("post.categories", "name")
    
    let limit = 10;
    let totalPages = Math.ceil(postAmount/limit);
    const result = await paginate(queryBuilder, { limit: limit, page: 1 });
    expect(result.meta.totalPages).toEqual(totalPages);
    expect(result.meta.totalItems).toEqual(postAmount);
    expect(result.meta.currentPage).toEqual(1);
  });
  it("Query page 2 use QueryBuilder with relations", async () => {
    queryBuilder = connection.createQueryBuilder(PostEntity, "post").leftJoinAndSelect("post.comments", "text").leftJoinAndSelect("post.categories", "name")
    
    let limit = 10;
    let totalPages = Math.ceil(postAmount/limit);
    const result = await paginate(queryBuilder, { limit: limit, page: 2 });
    expect(result.meta.totalPages).toEqual(totalPages);
    expect(result.meta.totalItems).toEqual(postAmount);
    expect(result.meta.currentPage).toEqual(2);
  });
});
