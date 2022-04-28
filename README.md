<p align="center"><img src="https://avatars1.githubusercontent.com/u/43827489?s=400&u=45ac0ac47d40b6d8f277c96bdf00244c10508aef&v=4"/></p>
<p align="center">
  <img src="https://github.com/nestjsx/nestjs-typeorm-paginate/workflows/Tests/badge.svg"/>
  <a href="https://www.npmjs.com/package/nestjs-typeorm-paginate"><img src="https://img.shields.io/npm/v/nestjs-typeorm-paginate.svg"/></a>
  <a href='https://coveralls.io/github/nestjsx/nestjs-typeorm-paginate?branch=master'><img src='https://coveralls.io/repos/github/nestjsx/nestjs-typeorm-paginate/badge.svg?branch=master' alt='Coverage Status' /></a>
  <img src="https://camo.githubusercontent.com/a34cfbf37ba6848362bf2bee0f3915c2e38b1cc1/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5052732d77656c636f6d652d627269676874677265656e2e7376673f7374796c653d666c61742d737175617265" />
  <a href="https://github.com/juliandavidmr/awesome-nestjs#components--libraries"><img src="https://raw.githubusercontent.com/nestjsx/crud/master/img/awesome-nest.svg?sanitize=true" alt="Awesome Nest" /></a>
  <a href="https://github.com/nestjs/nest"><img src="https://raw.githubusercontent.com/nestjsx/crud/master/img/nest-powered.svg?sanitize=true" alt="Nest Powered" /></a>
  <a href="https://packagequality.com/#?package=nestjs-typeorm-paginate"><img src="https://packagequality.com/shield/nestjs-typeorm-paginate.svg" /></a>
  <a href="https://www.npmjs.com/org/nestjsx">
    <img src="https://img.shields.io/npm/dt/nestjs-typeorm-paginate.svg" alt="npm downloads" />
  </a>
</p>

<h1 align="center">Nestjs Typeorm paginate</h1>

Pagination helper method for TypeORM repositories or queryBuilders with strict typings

## Install

```bash
$ yarn add nestjs-typeorm-paginate
```
or
```bash
$ npm i nestjs-typeorm-paginate
```

> If you're using typeorm^0.2.6 please use nestjs-typeorm-paginate^3.2.0
> For typeorm^0.3.0 please use nestjs-typeorm-paginate^4.0.0

## Usage

##### Service

###### Repository

```ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CatEntity } from './entities';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class CatService {
  constructor(
    @InjectRepository(CatEntity)
    private readonly repository: Repository<CatEntity>,
  ) {}

  async paginate(options: IPaginationOptions): Promise<Pagination<CatEntity>> {
    return paginate<CatEntity>(this.repository, options);
  }
}
```

###### QueryBuilder

```ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CatEntity } from './entities';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class CatService {
  constructor(
    @InjectRepository(CatEntity)
    private readonly repository: Repository<CatEntity>,
  ) {}

  async paginate(options: IPaginationOptions): Promise<Pagination<CatEntity>> {
    const queryBuilder = this.repository.createQueryBuilder('c');
    queryBuilder.orderBy('c.name', 'DESC'); // Or whatever you need to do

    return paginate<CatEntity>(queryBuilder, options);
  }
}
```

##### Controller

```ts
import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { CatService } from './cat.service';
import { CatEntity } from './cat.entity';
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('cats')
export class CatsController {
  constructor(private readonly catService: CatService) {}
  @Get('')
  async index(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<Pagination<CatEntity>> {
    limit = limit > 100 ? 100 : limit;
    return this.catService.paginate({
      page,
      limit,
      route: 'http://cats.com/cats',
    });
  }
}
```

> If you use `ParseIntPipe` on the query params (as in the example), don't forget to also add `DefaultValuePipe`. See [issue 517](https://github.com/nestjsx/nestjs-typeorm-paginate/issues/517) for more info.

> the `route` property of the paginate options can also be the short version of an absolute path , In this case, it would be `/cats` instead of `http://cats.com/cats`

### Example Response

```json
{
  "items": [
    {
      "lives": 9,
      "type": "tabby",
      "name": "Bobby"
    },
    {
      "lives": 2,
      "type": "Ginger",
      "name": "Garfield"
    },
    {
      "lives": 6,
      "type": "Black",
      "name": "Witch's mate"
    },
    {
      "lives": 7,
      "type": "Purssian Grey",
      "name": "Alisdaya"
    },
    {
      "lives": 1,
      "type": "Alistair",
      "name": "ali"
    },
    ...
  ],
  "meta": {
    "itemCount": 10,
    "totalItems": 20,
    "itemsPerPage": 10,
    "totalPages": 5,
    "currentPage": 2
  },
  "links" : {
    "first": "http://cats.com/cats?limit=10",
    "previous": "http://cats.com/cats?page=1&limit=10",
    "next": "http://cats.com/cats?page=3&limit=10",
    "last": "http://cats.com/cats?page=5&limit=10"
  }
}
```

`items`: An array of SomeEntity

`meta.itemCount`: The length of items array (i.e., the amount of items on this page)
`meta.totalItems`: The total amount of SomeEntity matching the filter conditions
`meta.itemsPerPage`: The requested items per page (i.e., the `limit` parameter)

`meta.totalPages`: The total amount of pages (based on the `limit`)
`meta.currentPage`: The current page this paginator "points" to

`links.first`: A URL for the first page to call | `""` (blank) if no `route` is defined
`links.previous`: A URL for the previous page to call | `""` (blank) if no previous to call
`links.next`: A URL for the next page to call | `""` (blank) if no page to call
`links.last`: A URL for the last page to call | `""` (blank) if no `route` is defined


> Do note that `links.first` may not have the 'page' query param defined

## Find Parameters

```ts
@Injectable()
export class CatService {
  constructor(
    @InjectRepository(CatEntity)
    private readonly repository: Repository<CatEntity>,
  ) {}

  async paginate(options: IPaginationOptions): Promise<Pagination<CatEntity>> {
    return paginate<CatEntity>(this.repository, options, {
      lives: 9,
    });
  }
}
```

## Eager loading

Eager loading should work with typeorm's eager property out the box. Like so

```typescript
import { Entity, OneToMany } from 'typeorm';

@Entity()
export class CatEntity {
  @OneToMany(t => TigerKingEntity, tigerKing.cats, {
    eager: true,
  })
  tigerKings: TigerKingEntity[];
}

// service
class CatService {
  constructor(private readonly repository: Repository<CatEntity>) {}

  async paginate(page: number, limit: number): Promise<Pagination<CatEntity>> {
    return paginate(this.repository, { page, limit });
  }
}
```

#### QueryBuilder

However, when using the query builder you'll have to hydrate the entities yourself. Here is a crude example that I've used in the past. It's not great but this is partially what typeORM will do.

```typescript
const results = paginate(queryBuilder, { page, limit });

return new Pagination(
  await Promise.all(
    results.items.map(async (item: SomeEntity) => {
      const hydrate = await this.someRepository.findByEntity(item);
      item.hydrated = hydrate;

      return item;
    }),
  ),
  results.meta,
  results.links,
);
```

## Raw queries

```typescript
const queryBuilder = this.repository
  .createQueryBuilder<{ type: string; totalLives: string }>('c')
  .select('c.type', 'type')
  .addSelect('SUM(c.lives)', 'totalLives')
  .groupBy('c.type')
  .orderBy('c.type', 'DESC'); // Or whatever you need to do

return paginateRaw(queryBuilder, options);
```

### Raw and Entities

A similar approach is used for TypeORM's `getRawAndEntities`

Let's assume there's a joined table that matches each cat with its cat toys.
And we want to bring how many toys each cat has.

```typescript

const queryBuilder = this.repository
  .createQueryBuilder<{ type: string; totalLives: string }>('cat')
    .leftJoinAndSelect('cat.toys', 'toys')
    .addSelect('COUNT(toys)::INTEGER', 'toyCount')
    .groupBy('cat.name');
```

This will allow us to get the paginated cats information with the additional raw query to build our actual response value.
The return pagination object will be the same, but you're now able to handle or map the results and the raw objects as needed.

```typescript
const [pagination, rawResults] = await paginateRawAndEntities(query, options);
pagination.items.map((item, index) => {
  // we can do what we need with the items and raw results here
  // change your items using rawResults.find(raw => raw.id === item.id)
});
return pagination;
```

#### Note about joined tables and raw values

Since the values of the raw results will include all the joined table items as queried, you must make sure to handle the items as needed for your use case. Refer to TypeORM's [getRawAndEntities](https://github.com/typeorm/typeorm/blob/920e7812cd9d405df921f9ae9ce52ba0a9743bea/src/query-builder/SelectQueryBuilder.ts#L1047) implementation as needed.

The rawResults array will look something like this:

```typescript
[
    { // Bobby appears 3 times due to the joined query
      "cat_lives": 9,
      "cat_type": "tabby",
      "cat_name": "Bobby",
      "toyCount": 3
    },
    {
      "cat_lives": 9,
      "cat_type": "tabby",
      "cat_name": "Bobby",
      "toyCount": 3
    },
    {
      "cat_lives": 9,
      "cat_type": "tabby",
      "cat_name": "Bobby",
      "toyCount": 3
    },
    {
      "cat_lives": 2,
      "cat_type": "Ginger",
      "cat_name": "Garfield",
      "toyCount": 1
    },
    ...
]
```

## Custom meta data transformer

If you wanted to alter the meta data that is returned from the pagination object. Then use the `metaTransformer` in the options like so

```ts

class CustomPaginationMeta {
  constructor(
    public readonly count: number,
    public readonly total: number,
  ) {}
}

return paginate<MyEntity, CustomPaginationMeta>(this.repository, { 
  page,
  limit,
  metaTransformer: (meta: IPaginationMeta): CustomPaginationMeta => new CustomPaginationMeta(
    meta.itemCount,
    meta.totalItems,
  ),
 });
```

This will result in the above returning `CustomPaginationMeta` in the `meta` property instead of the default `IPaginationMeta`.


## Custom links query params labels

If you want to alter the `limit` and/or `page` labels in meta links, then use `routingLabels` in the options like so

```ts

return paginate<MyEntity>(this.repository, { 
  page,
  limit,
  routingLabels: {
    limitLabel: 'page-size', // default: limit
    pageLabel: 'current-page', //default: page
  }
 });
```

This will result links like `http://example.com/something?current-page=1&page-size=3`.
