export enum PaginationTypeEnum {
  LIMIT_AND_OFFSET = 'limit',
  TAKE_AND_SKIP = 'take',
}

export enum CountQueryTypeEnum {
  RAW = 'raw',
  ENTITY = 'entity',
}

export interface IPaginationOptions<CustomMetaType = IPaginationMeta> {
  /**
   * @default 10
   * the amount of items to be requested per page
   */
  limit: number | string;

  /**
   * @default 1
   * the page that is requested
   */
  page: number | string;

  /**
   * a basic route for generating links (i.e., WITHOUT query params)
   */
  route?: string;

  /**
   * For transforming the default meta data to a custom type
   */
  metaTransformer?: (meta: IPaginationMeta) => CustomMetaType;

  /**
   * routingLabels for append in links (limit or/and page)
   */
  routingLabels?: IPaginationOptionsRoutingLabels;

  /**
   * @default PaginationTypeEnum.LIMIT
   * Used for changing query method to take/skip (defaults to limit/offset if no argument supplied)
   */
  paginationType?: PaginationTypeEnum;

  /**
   * @default true
   * Turn off pagination count total queries. itemCount, totalItems, itemsPerPage and totalPages will be undefined
   */
  countQueries?: boolean;

  /**
   * @default CountQueryTypeEnum.RAW
   * Used for count query with countQuery(builder, cacheOptions) which is RAW or builder.getCount() which is ENTITY
   */
  countQueryType?: CountQueryTypeEnum;

  /**
   * @default false
   * @link https://orkhan.gitbook.io/typeorm/docs/caching
   *
   * Enables or disables query result caching.
   */
  cacheQueries?: TypeORMCacheType;
}

export type TypeORMCacheType =
  | boolean
  | number
  | {
      id: any;
      milliseconds: number;
    };

export interface ObjectLiteral {
  [s: string]: any;
}

export interface IPaginationMeta extends ObjectLiteral {
  /**
   * the amount of items on this specific page
   */
  itemCount: number;
  /**
   * the total amount of items
   */
  totalItems?: number;
  /**
   * the amount of items that were requested per page
   */
  itemsPerPage: number;
  /**
   * the total amount of pages in this paginator
   */
  totalPages?: number;
  /**
   * the current page this paginator "points" to
   */
  currentPage: number;
}

export interface IPaginationLinks {
  /**
   * a link to the "first" page
   */
  first?: string;
  /**
   * a link to the "previous" page
   */
  previous?: string;
  /**
   * a link to the "next" page
   */
  next?: string;
  /**
   * a link to the "last" page
   */
  last?: string;
}

export interface IPaginationOptionsRoutingLabels {
  /**
   * the limit text to append in router string
   */
  limitLabel?: string;

  /**
   * the page text to append in router string
   */
  pageLabel?: string;
}
