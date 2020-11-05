import { IPaginationLinks, IPaginationMeta } from './interfaces';

export class Pagination<PaginationObject> {
  constructor(
    /**
     * a list of items to be returned
     */
    public readonly items: PaginationObject[],
    /**
     * associated meta information (e.g., counts)
     */
    public readonly meta: IPaginationMeta,
    /**
     * associated links
     */
    public readonly links: IPaginationLinks,
    /**
    * a list of raw items when queried raw with entities
    */
    public readonly rawItems?: any[],
  ) {}
}
