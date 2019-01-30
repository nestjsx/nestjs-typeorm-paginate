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
  "items": [],
  "itemCount": 0, 
  "total": 0, 
  "pageCount": 0, 
  "next": "http://somepath.com?page=2",
  "previous": "", 
}
```
`items` An array of SomeEntity  
`itemCount` Length of items array  
`total` The total amount of SomeEntity  
`pageCount` total number of pages (total / limit)  
`next` a url for the next page to call | Blank if no page to call  
`previous` a url for the previous page to call | Blank if no previous to call  
