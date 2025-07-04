import {
  IPaginationLinks,
  IPaginationMeta,
  IPaginationOptionsRoutingLabels,
  ObjectLiteral,
} from './interfaces';
import { Pagination } from './pagination';

export function createPaginationObject<
  T,
  CustomMetaType extends ObjectLiteral = IPaginationMeta,
>({
  items,
  totalItems,
  currentPage,
  limit,
  route,
  metaTransformer,
  routingLabels,
}: {
  items: T[];
  totalItems?: number;
  currentPage: number;
  limit: number;
  route?: string;
  metaTransformer?: (meta: IPaginationMeta) => CustomMetaType;
  routingLabels?: IPaginationOptionsRoutingLabels;
}): Pagination<T, CustomMetaType> {
  const totalPages =
    totalItems !== undefined ? Math.ceil(totalItems / limit) : undefined;

  const hasFirstPage = route;
  const hasPreviousPage = route && currentPage > 1;
  const hasNextPage =
    route && totalItems !== undefined && currentPage < totalPages;
  const hasLastPage = route && totalItems !== undefined && totalPages > 0;

  const limitLabel =
    routingLabels && routingLabels.limitLabel
      ? routingLabels.limitLabel
      : 'limit';

  const pageLabel =
    routingLabels && routingLabels.pageLabel ? routingLabels.pageLabel : 'page';

  const isAbsoluteRoute = URL.canParse(route)
  const baseUrl = new URL(route, 'https://example.test')

  const routes: IPaginationLinks =
    totalItems !== undefined
      ? {
          first: hasFirstPage ? buildPageUrl(baseUrl, {page: 0, pageLabel, limitLabel, limit, isRelative: !isAbsoluteRoute }) : '',
          previous: hasPreviousPage
            ? buildPageUrl(baseUrl, { page: currentPage - 1, pageLabel, limit, limitLabel, isRelative: !isAbsoluteRoute})
            : '',
          next: hasNextPage
            ? buildPageUrl(baseUrl, { page: currentPage + 1, pageLabel, limit, limitLabel, isRelative: !isAbsoluteRoute})
            : '',
          last: hasLastPage
            ? buildPageUrl(baseUrl, { page: totalPages, pageLabel, limit, limitLabel, isRelative: !isAbsoluteRoute})
            : '',
        }
      : undefined;

  const meta: IPaginationMeta = {
    totalItems,
    itemCount: items.length,
    itemsPerPage: limit,
    totalPages,
    currentPage: currentPage,
  };

  const links = route ? routes : undefined;

  if (metaTransformer)
    return new Pagination<T, CustomMetaType>(
      items,
      metaTransformer(meta),
      links,
    );

  // @ts-ignore
  return new Pagination<T, CustomMetaType>(items, meta, links);
}

function buildPageUrl(base: URL, params: { pageLabel: string, page: number, limitLabel: string, limit: number, isRelative: boolean}): string {
  const workingUrl = new URL(base);
  if (params.page < 1) {
    workingUrl.searchParams.delete(params.pageLabel)
  } else {
    workingUrl.searchParams.set(params.pageLabel, params.page.toString())
  }
  workingUrl.searchParams.set(params.limitLabel, params.limit.toString())
  return params.isRelative ? `${workingUrl.pathname}${workingUrl.search}${workingUrl.hash}` : workingUrl.toString();
}