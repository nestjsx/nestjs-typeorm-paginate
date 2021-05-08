import { IPaginationLinks, IPaginationMeta, ObjectLiteral } from './interfaces';
import { Pagination } from './pagination';

export function createPaginationObject<
  T,
  CustomMetaType extends ObjectLiteral = IPaginationMeta
>({
  items,
  totalItems,
  currentPage,
  limit,
  route,
  metaTransformer,
}: {
  items: T[];
  totalItems: number;
  currentPage: number;
  limit: number;
  route?: string;
  metaTransformer?: (meta: IPaginationMeta) => CustomMetaType;
}): Pagination<T, CustomMetaType> {
  const totalPages = Math.ceil(totalItems / limit);

  const hasFirstPage = route;
  const hasPreviousPage = route && currentPage > 1;
  const hasNextPage = route && currentPage < totalPages;
  const hasLastPage = route && totalPages > 0;

  const symbol = route && new RegExp(/\?/).test(route) ? '&' : '?';

  const routes: IPaginationLinks = {
    first: hasFirstPage ? `${route}${symbol}limit=${limit}` : '',
    previous: hasPreviousPage
      ? `${route}${symbol}page=${currentPage - 1}&limit=${limit}`
      : '',
    next: hasNextPage
      ? `${route}${symbol}page=${currentPage + 1}&limit=${limit}`
      : '',
    last: hasLastPage
      ? `${route}${symbol}page=${totalPages}&limit=${limit}`
      : '',
  };

  const meta: IPaginationMeta = {
    totalItems: totalItems,
    itemCount: items.length,
    itemsPerPage: limit,

    totalPages: totalPages,
    currentPage: currentPage,
  };

  if (metaTransformer)
    return new Pagination<T, CustomMetaType>(
      items,
      metaTransformer(meta),
      route && routes,
    );

  // @ts-ignore
  return new Pagination<T, CustomMetaType>(items, meta, route && routes);
}
