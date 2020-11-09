import { IPaginationLinks, IPaginationMeta } from './interfaces';
import { Pagination } from './pagination';

export class PaginationWithRaw<PaginationObject> extends Pagination<
  PaginationObject
> {
  constructor(
    /**
     * a list of items to be returned
     */
    public readonly items: PaginationObject[],
    /**
     * a list of raw items when queried raw with entities
     */
    public readonly rawItems: any[],
    /**
     * associated meta information (e.g., counts)
     */
    public readonly meta: IPaginationMeta,
    /**
     * associated links
     */
    public readonly links: IPaginationLinks,
  ) {
    super(items, meta, links);
  }
}
