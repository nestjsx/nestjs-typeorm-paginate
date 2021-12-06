import { Expose } from 'class-transformer';
import { IPaginationLinks, IPaginationMeta, ObjectLiteral } from './interfaces';

export class Pagination<
  PaginationObject,
  T extends ObjectLiteral = IPaginationMeta,
> {
  /**
   * a list of items to be returned
   */
  @Expose()
  public readonly items: PaginationObject[];
  /**
   * associated meta information (e.g., counts)
   */
  @Expose()
  public readonly meta: T;
  /**
   * associated links
   */
  @Expose()
  public readonly links?: IPaginationLinks;

  constructor(items: PaginationObject[], meta: T, links?: IPaginationLinks) {
    this.items = items;
    this.meta = meta;
    this.links = links;
  }
}
