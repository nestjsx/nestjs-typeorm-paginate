# nestjs typeorm pagination

I made this quick package to limit the amout of times I was implementing this functionality. 

## Install 

```bash
$ yarn add somepackageIhaventdeployedyet
```

## Usage

```ts
import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {SomeEntity} from './entities';
import {paginate, Pagination, PaginationOptionsInterface} from 'somepackageIhaventdeployedyet';

@Injectable()
export class SomeService {
  constructor (
    @InjectRepository(SomeEntity) private readonly repository: Repository<SomeEntity>,
  ) {}

  async paginate(options: PaginationOptions): Promise<Pagination<SomeEntity>> {
    return await paginate(this.repository, options);
  }
}
```

### Example response

```json
{
  "items": [], // Array of SomeEntity
  "itemCount": 0, // total in items array
  "total": 0, // total count of SomeEntity,
  "pageCount": 0, // total number of pages 
  "next": "http://somepath.com?page=3", // next url to call with page=page++ || blank if no next
  "previous": "", // previous page to call with page=page--  || blank if no previous
}
```