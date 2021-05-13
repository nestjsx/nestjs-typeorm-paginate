import { IPaginationLinks, IPaginationMeta, ObjectLiteral } from './interfaces';

export class Pagination<
  PaginationObject,
  T extends ObjectLiteral = IPaginationMeta,
> {
  constructor(
    /**
     * a list of items to be returned
     */
    public readonly items: PaginationObject[],
    /**
     * associated meta information (e.g., counts)
     */
    public readonly meta: T,
    /**
     * associated links
     */
    public readonly links?: IPaginationLinks,
  ) {}
}
