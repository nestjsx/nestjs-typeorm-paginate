# nestjs typeorm paginate

<a href="https://travis-ci.org/nestjsx/nestjs-typeorm-paginate"><img src="https://travis-ci.org/nestjsx/nestjs-typeorm-paginate.svg?branch=master"/></a>
<a href="https://www.npmjs.com/package/nestjs-typeorm-paginate"><img src="https://img.shields.io/npm/v/nestjs-typeorm-paginate.svg"/></a>
<a href='https://coveralls.io/github/nestjsx/nestjs-typeorm-paginate?branch=master'><img src='https://coveralls.io/repos/github/nestjsx/nestjs-typeorm-paginate/badge.svg?branch=master' alt='Coverage Status' /></a>

I made this quick package to limit the amout of times I was implementing this functionality. 

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

### Example response

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
  "itemCount": 10, 
  "total": 20,
  "pageCount": 2, 
  "next": "http://cats.com/cats?page=2",
  "previous": ""
}
```
`items` An array of SomeEntity  
`itemCount` Length of items array  
`total` The total amount of SomeEntity  
`pageCount` total number of pages (total / limit)  
`next` a url for the next page to call | Blank if no page to call  
`previous` a url for the previous page to call | Blank if no previous to call  

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
