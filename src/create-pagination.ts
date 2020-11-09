import { IPaginationLinks, IPaginationMeta } from './interfaces';
import { Pagination } from './pagination';
import { PaginationWithRaw } from './pagination-with-raw';

export function createPaginationObject<T>(
  items: T[],
  totalItems: number,
  currentPage: number,
  limit: number,
  route?: string,
  raw_items?: any[],
): Pagination<T> {
  const totalPages = Math.ceil(totalItems / limit);

  const hasFirstPage = route;
  const hasPreviousPage = route && currentPage > 1;
  const hasNextPage = route && currentPage < totalPages;
  const hasLastPage = route;

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

  return raw_items
    ? new PaginationWithRaw(items, raw_items, meta, routes)
    : new Pagination(items, meta, routes);
}
