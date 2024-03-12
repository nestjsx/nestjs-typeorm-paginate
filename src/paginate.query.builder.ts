import { SelectQueryBuilder } from "typeorm";
import {
  IPaginationMeta,
  IPaginationOptions,
  PaginationTypeEnum,
} from "./interfaces";
import { Pagination } from "./pagination";
import { resolveOptions } from "./resolve.options";
import { countQuery } from "./count.query";
import { createPaginationObject } from "./create-pagination";

export const paginateQueryBuilder = async <T, CustomMetaType = IPaginationMeta>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
): Promise<Pagination<T, CustomMetaType>> => {
  const [page, limit, route, paginationType, countQueries, cacheOption] =
    resolveOptions(options);

  const promises: [Promise<T[]>, Promise<number> | undefined] = [
    (PaginationTypeEnum.LIMIT_AND_OFFSET === paginationType
      ? queryBuilder.limit(limit).offset((page - 1) * limit)
      : queryBuilder.take(limit).skip((page - 1) * limit)
    )
      .cache(cacheOption)
      .getMany(),
    undefined,
  ];

  if (countQueries) {
    promises[1] = countQuery(queryBuilder, cacheOption);
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
};
