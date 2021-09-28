import {
  Repository,
  FindManyOptions,
  SelectQueryBuilder,
  ObjectLiteral,
} from 'typeorm';
import { Pagination } from './pagination';
import {
  IPaginationMeta,
  IPaginationOptions,
  PaginationTypeEnum,
} from './interfaces';
import { createPaginationObject } from './create-pagination';

const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

export async function paginate<T, CustomMetaType = IPaginationMeta>(
  repository: Repository<T>,
  options: IPaginationOptions<CustomMetaType>,
  searchOptions?: FindManyOptions<T>,
): Promise<Pagination<T, CustomMetaType>>;
export async function paginate<T, CustomMetaType = IPaginationMeta>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
): Promise<Pagination<T, CustomMetaType>>;

export async function paginate<T, CustomMetaType = IPaginationMeta>(
  repositoryOrQueryBuilder: Repository<T> | SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
  searchOptions?: FindManyOptions<T>,
) {
  return repositoryOrQueryBuilder instanceof Repository
    ? paginateRepository<T, CustomMetaType>(
        repositoryOrQueryBuilder,
        options,
        searchOptions,
      )
    : paginateQueryBuilder<T, CustomMetaType>(
        repositoryOrQueryBuilder,
        options,
      );
}

export async function paginateRaw<
  T,
  CustomMetaType extends ObjectLiteral = IPaginationMeta,
>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
): Promise<Pagination<T, CustomMetaType>> {
  const [page, limit, route, paginationType] = resolveOptions(options);

  const totalQueryBuilder = queryBuilder.clone();
  const [items, total] = await Promise.all([
    (paginationType === PaginationTypeEnum.LIMIT_AND_OFFSET
      ? queryBuilder.limit(limit).offset((page - 1) * limit)
      : queryBuilder.take(limit).skip((page - 1) * limit)
    ).getRawMany<T>(),
    totalQueryBuilder.getCount(),
  ]);

  return createPaginationObject<T, CustomMetaType>({
    items,
    totalItems: total,
    currentPage: page,
    limit,
    route,
    metaTransformer: options.metaTransformer,
    routingLabels: options.routingLabels,
  });
}

export async function paginateRawAndEntities<
  T,
  CustomMetaType = IPaginationMeta,
>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
): Promise<[Pagination<T, CustomMetaType>, Partial<T>[]]> {
  const [page, limit, route, paginationType] = resolveOptions(options);

  const totalQueryBuilder = queryBuilder.clone();

  const [itemObject, total] = await Promise.all([
    (paginationType === PaginationTypeEnum.LIMIT_AND_OFFSET
      ? queryBuilder.limit(limit).offset((page - 1) * limit)
      : queryBuilder.take(limit).skip((page - 1) * limit)
    ).getRawAndEntities<T>(),
    totalQueryBuilder.getCount(),
  ]);

  return [
    createPaginationObject<T, CustomMetaType>({
      items: itemObject.entities,
      totalItems: total,
      currentPage: page,
      limit,
      route,
      metaTransformer: options.metaTransformer,
      routingLabels: options.routingLabels,
    }),
    itemObject.raw,
  ];
}

function resolveOptions(
  options: IPaginationOptions<any>,
): [number, number, string, PaginationTypeEnum] {
  const page = resolveNumericOption(options, 'page', DEFAULT_PAGE);
  const limit = resolveNumericOption(options, 'limit', DEFAULT_LIMIT);
  const route = options.route;
  const paginationType =
    options.paginationType || PaginationTypeEnum.LIMIT_AND_OFFSET;

  return [page, limit, route, paginationType];
}

function resolveNumericOption(
  options: IPaginationOptions<any>,
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

async function paginateRepository<T, CustomMetaType = IPaginationMeta>(
  repository: Repository<T>,
  options: IPaginationOptions<CustomMetaType>,
  searchOptions?: FindManyOptions<T>,
): Promise<Pagination<T, CustomMetaType>> {
  const [page, limit, route] = resolveOptions(options);

  if (page < 1) {
    return createPaginationObject<T, CustomMetaType>({
      items: [],
      totalItems: 0,
      currentPage: page,
      limit,
      route,
      metaTransformer: options.metaTransformer,
      routingLabels: options.routingLabels,
    });
  }

  const [items, total] = await repository.findAndCount({
    skip: limit * (page - 1),
    take: limit,
    ...searchOptions,
  });

  return createPaginationObject<T, CustomMetaType>({
    items,
    totalItems: total,
    currentPage: page,
    limit,
    route,
    metaTransformer: options.metaTransformer,
    routingLabels: options.routingLabels,
  });
}

async function paginateQueryBuilder<T, CustomMetaType = IPaginationMeta>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
): Promise<Pagination<T, CustomMetaType>> {
  const [page, limit, route, paginationType] = resolveOptions(options);

  const [items, total] = await (paginationType ===
  PaginationTypeEnum.LIMIT_AND_OFFSET
    ? queryBuilder.limit(limit).offset((page - 1) * limit)
    : queryBuilder.take(limit).skip((page - 1) * limit)
  ).getManyAndCount();

  return createPaginationObject<T, CustomMetaType>({
    items,
    totalItems: total,
    currentPage: page,
    limit,
    route,
    metaTransformer: options.metaTransformer,
    routingLabels: options.routingLabels,
  });
}
