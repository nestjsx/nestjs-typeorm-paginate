export interface IPaginationOptions {
  /**
   * the amount of items to be requested per page
   */
  limit: number;
  /**
   * the page that is requested
   */
  page: number;
  /**
   * a babasesic route for generating links (i.e., WITHOUT query params)
   */
  route?: string;
}

export interface IPaginationLinks {
  /**
   * a link to the "first" page
   */
  readonly first?: string,
  /**
   * a link to the "previous" page
   */
  readonly previous?: string,
  /**
   * a link to the "next" page
   */
  readonly next?: string,
  /**
   * a link to the "last" page
   */
  readonly last?: string,
}