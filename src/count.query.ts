import { SelectQueryBuilder } from "typeorm";
import { TypeORMCacheType } from "./interfaces";

export const countQuery = async <T>(
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
    .select("COUNT(*)", "value")
    .from(`(${totalQueryBuilder.getQuery()})`, "uniqueTableAlias")
    .cache(cacheOption)
    .setParameters(queryBuilder.getParameters())
    .getRawOne<{ value: string }>();

  return Number(value);
};
