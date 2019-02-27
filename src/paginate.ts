import { Repository, FindConditions } from 'typeorm';
import { Pagination } from './pagination';
import { IPaginationOptions } from './interfaces';

export async function paginate<T>(
  repository: Repository<T>,
  options: IPaginationOptions,
  searchOptions?: FindConditions<T>,
): Promise<Pagination<T>> {
  const page = options.page > 0 ? options.page - 1 : options.page < 0 ? 0 : options.page;
  const limit = options.limit;
  const route = options.route;

  delete options.page;
  delete options.limit;
  delete options.route;

  const [items, total] = await repository.findAndCount({
    skip: page,
    take: limit,
    ...(searchOptions as object),
  });

  const isNext = route && (total / limit >= (page + 1));
  const isPrevious = route && page > 0;
  let routes = {
    next: isNext ? `${route}?page=${page + 2}` : '',
    previous: isPrevious ? `${route}?page=${page}` : '',
  };

  return new Pagination(
    items,
    items.length,
    total,
    Math.round(total / limit),
    routes.next,
    routes.previous
  );
}
