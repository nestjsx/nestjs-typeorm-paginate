import {Repository} from 'typeorm';
import { Pagination } from 'pagination';
import { PaginationOptionsInterface } from 'interfaces';

export default async <T>(repository: Repository<T>, options: PaginationOptionsInterface): Promise<Pagination<T>> => {
  const [items, total] = await repository.findAndCount({
    take: options.limit,
    skip: options.page,
  });

  let routes = {
    next: '',
    previous: '',
  };
  if (options.route) {
    if ((total / options.limit) >= options.page) {
      routes.next = `${options.route}?page=${options.page++}`;
    }

    if (options.page > 1) {
      routes.previous = `${options.route}?page=${options.page--}`;
    }
  }

  return new Pagination(items, items.length, total, total / options.limit, routes.next, routes.previous);
};
