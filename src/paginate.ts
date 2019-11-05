import {
  Repository,
  FindConditions,
  FindManyOptions,
  SelectQueryBuilder
} from "typeorm";
import { Pagination } from "./pagination";
import { IPaginationOptions } from "./interfaces";

export async function paginate<T>(repository: Repository<T>, options: IPaginationOptions, searchOptions?: FindConditions<T> | FindManyOptions<T>): Promise<Pagination<T>>;
export async function paginate<T>(queryBuilder: SelectQueryBuilder<T>, options: IPaginationOptions): Promise<Pagination<T>>;

export async function paginate<T>(
  repositoryOrQueryBuilder: Repository<T> | SelectQueryBuilder<T>,
  options: IPaginationOptions,
  searchOptions?: FindConditions<T> | FindManyOptions<T>
) {
  return repositoryOrQueryBuilder instanceof Repository
    ? paginateRepo<T>(repositoryOrQueryBuilder, options, searchOptions)
    : paginateQueryBuilder(repositoryOrQueryBuilder, options);
}

function createPaginationObject<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
  route?: string
) {
  const isNext = route && total / limit >= page + 1;
  const isPrevious = route && page > 0;
  const routes = {
    next: isNext ? `${route}?page=${page + 2}&limit=${limit}` : "",
    previous: isPrevious ? `${route}?page=${page}&limit=${limit}` : ""
  };

  return new Pagination(
    items,
    items.length,
    total,
    Math.ceil(total / limit),
    routes.next,
    routes.previous
  );
}

function resolveOptions(options: IPaginationOptions): [number, number, string] {
  const page =
    options.page > 0 ? options.page - 1 : options.page < 0 ? 0 : options.page;
  const limit = options.limit;
  const route = options.route;

  return [page, limit, route];
}

async function paginateRepo<T>(
  repository: Repository<T>,
  options: IPaginationOptions,
  searchOptions?: FindConditions<T> | FindManyOptions<T>
): Promise<Pagination<T>> {
  const [page, limit, route] = resolveOptions(options);

  const [items, total] = await repository.findAndCount({
    skip: page * limit,
    take: limit,
    ...searchOptions
  });

  return createPaginationObject<T>(items, total, page, limit, route);
}

async function paginateQueryBuilder<T>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions
): Promise<Pagination<T>> {
  const [page, limit, route] = resolveOptions(options);

  const [items, total] = await queryBuilder
    .take(limit)
    .skip(page * limit)
    .getManyAndCount();

  return createPaginationObject<T>(items, total, page, limit, route);
}
