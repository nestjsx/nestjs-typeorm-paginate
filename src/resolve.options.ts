import { DEFAULT_LIMIT, DEFAULT_PAGE } from './defaults';
import {
  IPaginationOptions,
  PaginationTypeEnum,
  TypeORMCacheType,
} from './interfaces';

const resolveNumericOption = (
  options: IPaginationOptions<any>,
  key: 'page' | 'limit',
  defaultValue: number,
): number => {
  const value = options[key];
  const resolvedValue = Number(value);

  if (Number.isInteger(resolvedValue) && resolvedValue >= 0)
    return resolvedValue;

  console.warn(
    `Query parameter "${key}" with value "${value}" was resolved as "${resolvedValue}", please validate your query input! Falling back to default "${defaultValue}".`,
  );
  return defaultValue;
};

export const resolveOptions = (
  options: IPaginationOptions<any>,
): [number, number, string, PaginationTypeEnum, boolean, TypeORMCacheType] => {
  const page = resolveNumericOption(options, 'page', DEFAULT_PAGE);
  const limit = resolveNumericOption(options, 'limit', DEFAULT_LIMIT);
  const route = options.route;
  const paginationType =
    options.paginationType || PaginationTypeEnum.LIMIT_AND_OFFSET;
  const countQueries =
    typeof options.countQueries !== 'undefined' ? options.countQueries : true;
  const cacheQueries = options.cacheQueries || false;

  return [page, limit, route, paginationType, countQueries, cacheQueries];
};
