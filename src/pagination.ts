export class Pagination<PaginationObject> {
  constructor(
    /**
     * a list of items to be returned
     */
    public readonly items: PaginationObject[],
    /**
     * the amount of items on this specific page
     */
    public readonly itemCount: number,
    /**
     * the total amount of items
     */
    public readonly totalItems: number,
    /**
     * the amount of items that were requested per page
     */
    public readonly itemsPerPage: number,
    /**
     * the total amount of pages in this paginator
     */
    public readonly totalPages: number,
    /**
     * the current page this paginator "points" to
     */
    public readonly currentPage: number,
    /**
     * a link to the "first" page
     */
    public readonly first?: string,
    /**
     * a link to the "previous" page
     */
    public readonly previous?: string,
    /**
     * a link to the "next" page
     */
    public readonly next?: string,
    /**
     * a link to the "last" page
     */
    public readonly last?: string,
  ) {}
}
