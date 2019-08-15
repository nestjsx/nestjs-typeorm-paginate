<p align="center"><img src="https://avatars1.githubusercontent.com/u/43827489?s=400&u=45ac0ac47d40b6d8f277c96bdf00244c10508aef&v=4"/></p>
<p align="center">
  <a href="https://travis-ci.org/nestjsx/nestjs-typeorm-paginate"><img src="https://travis-ci.org/nestjsx/nestjs-typeorm-paginate.svg?branch=master"/></a>
  <a href="https://www.npmjs.com/package/nestjs-typeorm-paginate"><img src="https://img.shields.io/npm/v/nestjs-typeorm-paginate.svg"/></a>
  <a href='https://coveralls.io/github/nestjsx/nestjs-typeorm-paginate?branch=master'><img src='https://coveralls.io/repos/github/nestjsx/nestjs-typeorm-paginate/badge.svg?branch=master' alt='Coverage Status' /></a>
  <img src="https://flat.badgen.net/dependabot/nestjsx/nestjs-config?icon=dependabot" />
  <img src="https://camo.githubusercontent.com/a34cfbf37ba6848362bf2bee0f3915c2e38b1cc1/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5052732d77656c636f6d652d627269676874677265656e2e7376673f7374796c653d666c61742d737175617265" />
  <a href="https://github.com/juliandavidmr/awesome-nestjs#components--libraries"><img src="https://raw.githubusercontent.com/nestjsx/crud/master/img/awesome-nest.svg?sanitize=true" alt="Awesome Nest" /></a>
  <a href="https://github.com/nestjs/nest"><img src="https://raw.githubusercontent.com/nestjsx/crud/master/img/nest-powered.svg?sanitize=true" alt="Nest Powered" /></a>
</p>

<h1 align="center">Nestjs Typeorm paginate</h1>

Pagination helper method for TypeORM repostiories or queryBuilders with strict typings

## Install 

```bash
$ yarn add nestjs-typeorm-paginate
```

## Usage

##### Service
```ts
import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {CatEntity} from './entities';
import {paginate, Pagination, IPaginationOptions} from 'nestjs-typeorm-paginate';

@Injectable()
export class CatService {
  constructor (
    @InjectRepository(CatEntity) private readonly repository: Repository<CatEntity>,
  ) {}

  async paginate(options: IPaginationOptions): Promise<Pagination<CatEntity>> {
    return await paginate<CatEntity>(this.repository, options);
  }
}
```

###### QueryBuilder

```ts
import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {CatEntity} from './entities';
import {paginate, Pagination, IPaginationOptions} from 'nestjs-typeorm-paginate';

@Injectable()
export class CatService {
  constructor (
    @InjectRepository(CatEntity) private readonly repository: Repository<CatEntity>,
  ) {}

  async paginate(options: IPaginationOptions): Promise<Pagination<CatEntity>> {
    const queryBuilder = this.repository.createQueryBuilder('c');
    queryBuilder.order('c.name', 'DESC'); // Or whatever you need to do

    return await paginate<CatEntity>(quertBuilder, options);
  }
}
```

##### Controller
```ts
import {Controller, Get, Query} from '@nestjs/common';
import {CatService} from './cat.service';

@Controller('cats')
export class CatsController {
  constructor(private readonly catService: CatService) {}
  @Get('')
  async index(@Query('page') page: number = 0, @Query('limit') limit: number = 10) {
    limit = limit > 100 ? 100 : limit;
    return await this.catService.paginate({page, limit, route: 'http://cats.com/cats',});
  }
}
```

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

## Find Parameters

```ts
@Injectable()
export class CatService {
  constructor (
    @InjectRepository(CatEntity) private readonly repository: Repository<CatEntity>,
  ) {}

  async paginate(options: IPaginationOptions): Promise<Pagination<CatEntity>> {
    return await paginate<CatEntity>(this.repository, options, {
        lives: 9,
    });
  }
}
```
