export class Pagination<PaginationObject> {
  constructor(
    private readonly items: PaginationObject[],
    private readonly itemCount: number,
    private readonly totalItems: number,
    private readonly pageCount: number,
    private readonly next?: string,
    private readonly previous?: string
  ) {}
}
