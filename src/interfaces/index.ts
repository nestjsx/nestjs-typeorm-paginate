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
