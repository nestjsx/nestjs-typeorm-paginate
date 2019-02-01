import { Repository, FindConditions } from "typeorm";
import { Pagination } from "./pagination";
import { PaginationOptionsInterface } from "./interfaces";

export async function paginate<T>(
  repository: Repository<T>,
  options: PaginationOptionsInterface,
  searchOptions?: FindConditions<T>,
): Promise<Pagination<T>> {
  const page = options.page > 0 ? options.page - 1 : options.page < 0 ? 0 : options.page;
  const limit = options.limit;
  const route = options.route;

  delete options.page;
  delete options.limit;
  delete options.route;

  const [items, total] = await repository.findAndCount({
    skip: page,
    take: limit,
    ...(searchOptions as object),
  });

  let routes = {
    next: "",
    previous: ""
  };
  if (route) {
    if (total / limit >= page) {
      routes.next = `${route}?page=${page + 1}`;
    }

    if (page > 1) {
      routes.previous = `${route}?page=${page - 1}`;
    }
  }

  return new Pagination(
    items,
    items.length,
    total,
    Math.round(total / limit),
    routes.next,
    routes.previous
  );
}
