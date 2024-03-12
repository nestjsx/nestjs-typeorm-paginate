import { SelectQueryBuilder } from 'typeorm';
import {
  IPaginationMeta,
  IPaginationOptions,
  PaginationTypeEnum,
} from './interfaces';
import { Pagination } from './pagination';
import { resolveOptions } from './resolve.options';
import { countQuery } from './count.query';
import { createPaginationObject } from './create-pagination';

export const paginateRawAndEntities = async <
  T,
  CustomMetaType = IPaginationMeta,
>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
): Promise<[Pagination<T, CustomMetaType>, Partial<T>[]]> => {
  const [page, limit, route, paginationType, countQueries, cacheOption] =
    resolveOptions(options);

  const promises: [
    Promise<{ entities: T[]; raw: T[] }>,
    Promise<number> | undefined,
  ] = [
    (paginationType === PaginationTypeEnum.LIMIT_AND_OFFSET
      ? queryBuilder.limit(limit).offset((page - 1) * limit)
      : queryBuilder.take(limit).skip((page - 1) * limit)
    )
      .cache(cacheOption)
      .getRawAndEntities<T>(),
    undefined,
  ];

  if (countQueries) {
    promises[1] = countQuery(queryBuilder, cacheOption);
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
};
