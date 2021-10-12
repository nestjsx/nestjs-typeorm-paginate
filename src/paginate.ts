import {
  Repository,
  FindManyOptions,
  SelectQueryBuilder,
  ObjectLiteral,
  FindConditions,
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
  searchOptions?: FindConditions<T> | FindManyOptions<T>,
): Promise<Pagination<T, CustomMetaType>>;
export async function paginate<T, CustomMetaType = IPaginationMeta>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
): Promise<Pagination<T, CustomMetaType>>;

export async function paginate<T, CustomMetaType = IPaginationMeta>(
  repositoryOrQueryBuilder: Repository<T> | SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
  searchOptions?: FindConditions<T> | FindManyOptions<T>,
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
  const [page, limit, route, paginationType, countQueries] =
    resolveOptions(options);

  const promises: [Promise<T[]>, Promise<number> | undefined] = [
    (paginationType === PaginationTypeEnum.LIMIT_AND_OFFSET
      ? queryBuilder.limit(limit).offset((page - 1) * limit)
      : queryBuilder.take(limit).skip((page - 1) * limit)
    ).getRawMany<T>(),
    undefined,
  ];

  if (countQueries) {
    promises[1] = countQuery(queryBuilder);
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

export async function paginateRawAndEntities<
  T,
  CustomMetaType = IPaginationMeta,
>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
): Promise<[Pagination<T, CustomMetaType>, Partial<T>[]]> {
  const [page, limit, route, paginationType, countQueries] =
    resolveOptions(options);

  const promises: [
    Promise<{ entities: T[]; raw: T[] }>,
    Promise<number> | undefined,
  ] = [
    (paginationType === PaginationTypeEnum.LIMIT_AND_OFFSET
      ? queryBuilder.limit(limit).offset((page - 1) * limit)
      : queryBuilder.take(limit).skip((page - 1) * limit)
    ).getRawAndEntities<T>(),
    undefined,
  ];

  if (countQueries) {
    promises[1] = countQuery(queryBuilder);
  }

  const [itemObject, total] = await Promise.all(promises);

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
): [number, number, string, PaginationTypeEnum, boolean] {
  const page = resolveNumericOption(options, 'page', DEFAULT_PAGE);
  const limit = resolveNumericOption(options, 'limit', DEFAULT_LIMIT);
  const route = options.route;
  const paginationType =
    options.paginationType || PaginationTypeEnum.LIMIT_AND_OFFSET;
  const countQueries =
    typeof options.countQueries !== 'undefined' ? options.countQueries : true;

  return [page, limit, route, paginationType, countQueries];
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
  searchOptions?: FindConditions<T> | FindManyOptions<T>,
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
  const [page, limit, route, paginationType, countQueries] =
    resolveOptions(options);

  const promises: [Promise<T[]>, Promise<number> | undefined] = [
    (PaginationTypeEnum.LIMIT_AND_OFFSET === paginationType
      ? queryBuilder.limit(limit).offset((page - 1) * limit)
      : queryBuilder.take(limit).skip((page - 1) * limit)
    ).getMany(),
    undefined,
  ];

  if (countQueries) {
    promises[1] = countQuery(queryBuilder);
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

const countQuery = async <T>(
  queryBuilder: SelectQueryBuilder<T>,
): Promise<number> => {
  const totalQueryBuilder = queryBuilder.clone();

  totalQueryBuilder
    .skip(undefined)
    .limit(undefined)
    .offset(undefined)
    .take(undefined);

  const { value } = await queryBuilder.connection
    .createQueryBuilder()
    .select('COUNT(*)', 'value')
    .from(`(${totalQueryBuilder.getQuery()})`, 'uniqueTableAlias')
    .setParameters(queryBuilder.getParameters())
    .getRawOne<{ value: string }>();

  return Number(value);
};
