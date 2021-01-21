import {
  Repository,
  FindConditions,
  FindManyOptions,
  SelectQueryBuilder,
} from 'typeorm';
import { Pagination } from './pagination';
import {
  PaginationOptionsInterface,
  RepositoryPaginationOptionsInterface,
} from './interfaces';
import { createPaginationObject } from './create-pagination';

const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

const isRepositoryOptions = <T>(
  options: RepositoryPaginationOptionsInterface<T> | PaginationOptionsInterface,
): options is RepositoryPaginationOptionsInterface<T> =>
  options.hasOwnProperty('searchOptions');

export async function paginate<T>(
  repository: Repository<T>,
  options: RepositoryPaginationOptionsInterface<T>,
): Promise<Pagination<T>>;
export async function paginate<T>(
  queryBuilder: SelectQueryBuilder<T>,
  options: PaginationOptionsInterface,
): Promise<Pagination<T>>;

export async function paginate<T>(
  repositoryOrQueryBuilder: Repository<T> | SelectQueryBuilder<T>,
  options: PaginationOptionsInterface | RepositoryPaginationOptionsInterface<T>,
) {
  return repositoryOrQueryBuilder instanceof Repository
    ? paginateRepository<T>(
        repositoryOrQueryBuilder,
        options,
        isRepositoryOptions(options) && options.searchOptions,
      )
    : paginateQueryBuilder(repositoryOrQueryBuilder, options);
}

export async function paginateRaw<T>(
  queryBuilder: SelectQueryBuilder<T>,
  options: PaginationOptionsInterface,
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
  options: PaginationOptionsInterface,
): Promise<[Pagination<T>, Partial<T>[]]> {
  const [page, limit, route] = resolveOptions(options);

  const totalQueryBuilder = queryBuilder.clone();

  const [itemObject, total] = await Promise.all([
    queryBuilder
      .limit(limit)
      .offset((page - 1) * limit)
      .getRawAndEntities<T>(),
    totalQueryBuilder.getCount(),
  ]);

  return [
    createPaginationObject<T>(itemObject.entities, total, page, limit, route),
    itemObject.raw,
  ];
}

function resolveOptions(
  options: PaginationOptionsInterface,
): [number, number, string] {
  const page = resolveNumericOption(options, 'page', DEFAULT_PAGE);
  const limit = resolveNumericOption(options, 'limit', DEFAULT_LIMIT);
  const route = options.route;

  return [page, limit, route];
}

function resolveNumericOption(
  options: PaginationOptionsInterface,
  key: 'page' | 'limit',
  defaultValue: number,
): number {
  const value = options[key];
  const resolvedValue = Number(value);

  if (Number.isInteger(resolvedValue) && resolvedValue >= 0)
    return resolvedValue;

  console.warn(
    `Query parameter "${key}" with value "${value}" was resolved as "${resolvedValue}", please validate your query input! Falling back to default "${defaultValue}".`,
  );
  return defaultValue;
}

async function paginateRepository<T>(
  repository: Repository<T>,
  options: PaginationOptionsInterface,
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
  options: PaginationOptionsInterface,
): Promise<Pagination<T>> {
  const [page, limit, route] = resolveOptions(options);

  const [items, total] = await queryBuilder
    .take(limit)
    .skip((page - 1) * limit)
    .getManyAndCount();

  return createPaginationObject<T>(items, total, page, limit, route);
}
