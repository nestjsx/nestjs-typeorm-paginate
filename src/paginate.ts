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

export async function paginateQueryBuilder<T, CustomMetaType = IPaginationMeta>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
): Promise<Pagination<T, CustomMetaType>> {
  const [page, limit, route, paginationType, countQueries, cacheOption] =
    resolveOptions(options);

  const itemsPromise = (PaginationTypeEnum.LIMIT_AND_OFFSET === paginationType
    ? queryBuilder.limit(limit).offset((page - 1) * limit)
    : queryBuilder.take(limit).skip((page - 1) * limit))
    .cache(cacheOption)
    .getMany();

  const countPromise = countQueries ? queryBuilder.cache(cacheOption).getCount() : Promise.resolve(0);

  const [items, total] = await Promise.all([itemsPromise, countPromise]);

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

/**
 * @deprecated paginateRaw() is now integrated into paginateQueryBuilder().
 * Please use paginateQueryBuilder() directly for raw queries.
 */
export async function paginateRaw<T, CustomMetaType = IPaginationMeta>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
): Promise<Pagination<T, CustomMetaType>> {
  console.warn("DEPRECATION WARNING: paginateRaw() is deprecated. Use paginateQueryBuilder() instead.");
  return paginateQueryBuilder(queryBuilder, options);
}

/**
 * @deprecated paginateRawAndEntities() is now handled within paginateQueryBuilder().
 * Please use paginateQueryBuilder() and manually fetch raw results using getRawMany().
 */
export async function paginateRawAndEntities<T, CustomMetaType = IPaginationMeta>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
): Promise<[Pagination<T, CustomMetaType>, Partial<T>[]]> {
  console.warn("DEPRECATION WARNING: paginateRawAndEntities() is deprecated. Use paginateQueryBuilder() and getRawMany() instead.");
  const paginationResult = await paginateQueryBuilder(queryBuilder, options);
  const rawResults = await queryBuilder.getRawMany();
  return [paginationResult, rawResults];
}

/**
 * @deprecated paginateRepository() is now handled within paginateQueryBuilder().
 * Please use paginateQueryBuilder() with a repository's queryBuilder.
 */
export async function paginateRepository<T, CustomMetaType = IPaginationMeta>(
  repository: Repository<T>,
  options: IPaginationOptions<CustomMetaType>,
  searchOptions?: FindOptionsWhere<T> | FindManyOptions<T>,
): Promise<Pagination<T, CustomMetaType>> {
  console.warn("DEPRECATION WARNING: paginateRepository() is deprecated. Use paginateQueryBuilder() instead.");
  const queryBuilder = repository.createQueryBuilder("entity");
  if (searchOptions) {
    queryBuilder.where(searchOptions);
  }
  return paginateQueryBuilder(queryBuilder, options);
}

// Helper function to resolve pagination options
function resolveOptions(
  options: IPaginationOptions<any>,
): [number, number, string, PaginationTypeEnum, boolean, TypeORMCacheType] {
  const page = resolveNumericOption(options, 'page', DEFAULT_PAGE);
  const limit = resolveNumericOption(options, 'limit', DEFAULT_LIMIT);
  const route = options.route;
  const paginationType =
    options.paginationType || PaginationTypeEnum.LIMIT_AND_OFFSET;
  const countQueries =
    typeof options.countQueries !== 'undefined' ? options.countQueries : true;
  const cacheQueries = options.cacheQueries || false;

  return [page, limit, route, paginationType, countQueries, cacheQueries];
}

// Helper function to handle numeric pagination parameters
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