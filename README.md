# nestjs typeorm pagination

<a href="https://travis-ci.org/bashleigh/nestjs-pagination"><img src="https://travis-ci.org/bashleigh/nestjs-pagination.svg?branch=master"/></a>

I made this quick package to limit the amout of times I was implementing this functionality. 

## Install 

```bash
$ yarn add somepackageIhaventdeployedyet
```

## Usage

##### Service
```ts
import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {CatEntity} from './entities';
import {paginate, Pagination, PaginationOptionsInterface} from 'somepackageIhaventdeployedyet';

@Injectable()
export class CatService {
  constructor (
    @InjectRepository(CatEntity) private readonly repository: Repository<CatEntity>,
  ) {}

  async paginate(options: PaginationOptions): Promise<Pagination<CatEntity>> {
    return await paginate<CatEntity>(this.repository, options);
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
    return await this.catService.paginate({page, limit, route: 'http://cats.com/cats/',});
  }
}
```

### Example response

```json
{
  "items": [],
  "itemCount": 0, 
  "total": 0, 
  "pageCount": 0, 
  "next": "http://cats.com/cats/?page=3",
  "previous": "http://cats.com/cats?page=1", 
}
```
`items` An array of SomeEntity  
`itemCount` Length of items array  
`total` The total amount of SomeEntity  
`pageCount` total number of pages (total / limit)  
`next` a url for the next page to call | Blank if no page to call  
`previous` a url for the previous page to call | Blank if no previous to call  
