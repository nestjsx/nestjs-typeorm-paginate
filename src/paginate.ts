import {
  Repository,
  FindManyOptions,
  SelectQueryBuilder,
  ObjectLiteral,
  FindOptionsWhere,
} from 'typeorm';
import { Pagination } from './pagination';
import {
  IPaginationMeta,
  IPaginationOptions,
  PaginationTypeEnum,
  TypeORMCacheType,
} from './interfaces';
import { createPaginationObject } from './create-pagination';

const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

export async function paginate<T, CustomMetaType = IPaginationMeta>(
  repository: Repository<T>,
  options: IPaginationOptions<CustomMetaType>,
  searchOptions?: FindOptionsWhere<T> | FindManyOptions<T>,
): Promise<Pagination<T, CustomMetaType>>;
export async function paginate<T, CustomMetaType = IPaginationMeta>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
): Promise<Pagination<T, CustomMetaType>>;

export async function paginate<T, CustomMetaType = IPaginationMeta>(
  repositoryOrQueryBuilder: Repository<T> | SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
  searchOptions?: FindOptionsWhere<T> | FindManyOptions<T>,
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
  let [
    page,
    limit,
    route,
    paginationType,
    countQueries,
    cacheOption,
    routingLatest,
  ] = resolveOptions(options);

  const promises: [Promise<number> | undefined | number, Promise<T[]>] = [
    undefined,
    Promise.resolve([]),
  ];

  // To re-routing latest page have items need to set countQueries & routingLabels to true
  if (routingLatest && countQueries) {
    let total = await countQuery(queryBuilder, cacheOption);

    // Recalculate the latest page that have items
    page =
      total / Number(limit) < Number(page)
        ? Math.ceil(total / Number(limit))
        : +page;

    promises[0] = Promise.resolve(total);
  }

  // Avoid duplicate count query
  if (countQueries && !routingLatest) {
    promises[0] = countQuery(queryBuilder, cacheOption);
  }

  promises[1] = (
    paginationType === PaginationTypeEnum.LIMIT_AND_OFFSET
      ? queryBuilder.limit(limit).offset((page - 1) * limit)
      : queryBuilder.take(limit).skip((page - 1) * limit)
  )
    .cache(cacheOption)
    .getRawMany<T>();

  const [total, items] = await Promise.all(promises);

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
  let [
    page,
    limit,
    route,
    paginationType,
    countQueries,
    cacheOption,
    routingLatest,
  ] = resolveOptions(options);

  const promises: [
    Promise<number> | undefined,
    Promise<{ entities: T[]; raw: T[] }>,
  ] = [
    undefined,
    Promise.resolve({
      entities: [],
      raw: [],
    }),
  ];

  // To re-routing latest page have items need to set countQueries & routingLabels to true
  if (routingLatest && countQueries) {
    let total = await countQuery(queryBuilder, cacheOption);

    // Recalculate the latest page that have items
    page =
      total / Number(limit) < Number(page)
        ? Math.ceil(total / Number(limit))
        : +page;

    promises[0] = Promise.resolve(total);
  }

  // Avoid duplicate count query
  if (countQueries && !routingLatest) {
    promises[0] = countQuery(queryBuilder, cacheOption);
  }

  promises[1] = (
    paginationType === PaginationTypeEnum.LIMIT_AND_OFFSET
      ? queryBuilder.limit(limit).offset((page - 1) * limit)
      : queryBuilder.take(limit).skip((page - 1) * limit)
  )
    .cache(cacheOption)
    .getRawAndEntities<T>();

  const [total, itemObject] = await Promise.all(promises);

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
): [
  number,
  number,
  string,
  PaginationTypeEnum,
  boolean,
  TypeORMCacheType,
  boolean,
] {
  const page = resolveNumericOption(options, 'page', DEFAULT_PAGE);
  const limit = resolveNumericOption(options, 'limit', DEFAULT_LIMIT);
  const route = options.route;
  const paginationType =
    options.paginationType || PaginationTypeEnum.LIMIT_AND_OFFSET;
  const countQueries =
    typeof options.countQueries !== 'undefined' ? options.countQueries : true;
  const cacheQueries = options.cacheQueries || false;
  const routingLatest = options.routingLatest || false;

  return [
    page,
    limit,
    route,
    paginationType,
    countQueries,
    cacheQueries,
    routingLatest,
  ];
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
  searchOptions?: FindOptionsWhere<T> | FindManyOptions<T>,
): Promise<Pagination<T, CustomMetaType>> {
  const [page, limit, route, paginationType, countQueries] =
    resolveOptions(options);

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

  const promises: [Promise<T[]>, Promise<number> | undefined] = [
    repository.find({
      skip: limit * (page - 1),
      take: limit,
      ...searchOptions,
    }),
    undefined,
  ];

  if (countQueries) {
    promises[1] = repository.count({
      ...searchOptions,
    });
  }

  const [items, total] = await Promise.all(promises);

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
  let [
    page,
    limit,
    route,
    paginationType,
    countQueries,
    cacheOption,
    routingLatest,
  ] = resolveOptions(options);

  const promises: [Promise<number> | undefined | number, Promise<T[]>] = [
    undefined,
    Promise.resolve([]),
  ];

  // To re-routing latest page have items need to set countQueries & routingLabels to true
  if (routingLatest && countQueries) {
    let total = await countQuery(queryBuilder, cacheOption);

    // Recalculate the latest page that have items
    page =
      total / Number(limit) < Number(page)
        ? Math.ceil(total / Number(limit))
        : +page;

    promises[0] = Promise.resolve(total);
  }

  // Avoid duplicate count query
  if (countQueries && !routingLatest) {
    promises[0] = countQuery(queryBuilder, cacheOption);
  }

  promises[1] = (
    PaginationTypeEnum.LIMIT_AND_OFFSET === paginationType
      ? queryBuilder.limit(limit).offset((page - 1) * limit)
      : queryBuilder.take(limit).skip((page - 1) * limit)
  )
    .cache(cacheOption)
    .getMany();

  const [total, items] = await Promise.all(promises);

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

const countQuery = async <T>(
  queryBuilder: SelectQueryBuilder<T>,
  cacheOption: TypeORMCacheType,
): Promise<number> => {
  const totalQueryBuilder = queryBuilder.clone();

  totalQueryBuilder
    .skip(undefined)
    .limit(undefined)
    .offset(undefined)
    .take(undefined)
    .orderBy(undefined);

  const { value } = await queryBuilder.connection
    .createQueryBuilder()
    .select('COUNT(*)', 'value')
    .from(`(${totalQueryBuilder.getQuery()})`, 'uniqueTableAlias')
    .cache(cacheOption)
    .setParameters(queryBuilder.getParameters())
    .getRawOne<{ value: string }>();

  return Number(value);
};
