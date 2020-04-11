import { Repository, FindConditions, FindManyOptions, SelectQueryBuilder } from 'typeorm';
import { Pagination } from './pagination';
import { IPaginationOptions } from './interfaces';
export declare function paginate<T>(repository: Repository<T>, options: IPaginationOptions, searchOptions?: FindConditions<T> | FindManyOptions<T>): Promise<Pagination<T>>;
export declare function paginate<T>(queryBuilder: SelectQueryBuilder<T>, options: IPaginationOptions): Promise<Pagination<T>>;
