import {
  Repository,
  FindConditions,
  FindManyOptions,
  SelectQueryBuilder,
} from 'typeorm';
import { Pagination } from './pagination';
import { IPaginationOptions } from './interfaces';
import { createPaginationObject } from './create-pagination';

export async function paginate<T>(
  repository: Repository<T>,
  options: IPaginationOptions,
  searchOptions?: FindConditions<T> | FindManyOptions<T>,
): Promise<Pagination<T>>;
export async function paginate<T>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions,
): Promise<Pagination<T>>;

export async function paginate<T>(
  repositoryOrQueryBuilder: Repository<T> | SelectQueryBuilder<T>,
  options: IPaginationOptions,
  searchOptions?: FindConditions<T> | FindManyOptions<T>,
) {
  return repositoryOrQueryBuilder instanceof Repository
    ? paginateRepository<T>(repositoryOrQueryBuilder, options, searchOptions)
    : paginateQueryBuilder(repositoryOrQueryBuilder, options);
}

export async function paginateRaw<T>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions,
): Promise<Pagination<T>> {
  const [page, limit, route] = resolveOptions(options);

  const totalQueryBuilder = queryBuilder.clone();
  const [items, total] = await Promise.all([
    queryBuilder
      .limit(limit)
      .offset((page - 1) * limit)
      .getRawMany<T>(),
    totalQueryBuilder.getCount(),
  ]);

  return createPaginationObject<T>(items, total, page, limit, route);
}

export async function paginateRawAndEntities<T>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions,
): Promise<Pagination<T>> {
  const [page, limit, route] = resolveOptions(options);

  const totalQueryBuilder = queryBuilder.clone();

  const [itemObject, total] = await Promise.all([
    queryBuilder
      .limit(limit)
      .offset((page - 1) * limit)
      .getRawAndEntities<T>(),
    totalQueryBuilder.getCount(),
  ]);

  return createPaginationObject<T>(
    itemObject.entities,
    total,
    page,
    limit,
    route,
    itemObject.raw,
  );
}

function resolveOptions(options: IPaginationOptions): [number, number, string] {
  const page = options.page;
  const limit = options.limit;
  const route = options.route;

  return [page, limit, route];
}

async function paginateRepository<T>(
  repository: Repository<T>,
  options: IPaginationOptions,
  searchOptions?: FindConditions<T> | FindManyOptions<T>,
): Promise<Pagination<T>> {
  const [page, limit, route] = resolveOptions(options);

  if (page < 1) {
    return createPaginationObject([], 0, page, limit, route);
  }

  const [items, total] = await repository.findAndCount({
    skip: limit * (page - 1),
    take: limit,
    ...searchOptions,
  });

  return createPaginationObject<T>(items, total, page, limit, route);
}

async function paginateQueryBuilder<T>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions,
): Promise<Pagination<T>> {
  const [page, limit, route] = resolveOptions(options);

  const [items, total] = await queryBuilder
    .take(limit)
    .skip((page - 1) * limit)
    .getManyAndCount();

  return createPaginationObject<T>(items, total, page, limit, route);
}
