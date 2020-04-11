"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const pagination_1 = require("./pagination");
function paginate(repositoryOrQueryBuilder, options, searchOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        return repositoryOrQueryBuilder instanceof typeorm_1.Repository
            ? paginateRepository(repositoryOrQueryBuilder, options, searchOptions)
            : paginateQueryBuilder(repositoryOrQueryBuilder, options);
    });
}
exports.paginate = paginate;
function createPaginationObject(items, totalItems, currentPage, limit, route) {
    const totalPages = Math.ceil(totalItems / limit);
    const hasFirstPage = route;
    const hasPreviousPage = route && currentPage > 1;
    const hasNextPage = route && currentPage < totalPages;
    const hasLastPage = route;
    const symbol = route && new RegExp(/\?/).test(route) ? '&' : '?';
    const routes = {
        first: hasFirstPage ? `${route}${symbol}limit=${limit}` : '',
        previous: hasPreviousPage
            ? `${route}${symbol}page=${currentPage - 1}&limit=${limit}`
            : '',
        next: hasNextPage
            ? `${route}${symbol}page=${currentPage + 1}&limit=${limit}`
            : '',
        last: hasLastPage
            ? `${route}${symbol}page=${totalPages}&limit=${limit}`
            : '',
    };
    return new pagination_1.Pagination(items, {
        totalItems: totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: totalPages,
        currentPage: currentPage,
    }, routes);
}
function resolveOptions(options) {
    const page = options.page;
    const limit = options.limit;
    const route = options.route;
    return [page, limit, route];
}
function paginateRepository(repository, options, searchOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const [page, limit, route] = resolveOptions(options);
        if (page < 1) {
            return createPaginationObject([], 0, page, limit, route);
        }
        const [items, total] = yield repository.findAndCount(Object.assign({ skip: limit * (page - 1), take: limit }, searchOptions));
        return createPaginationObject(items, total, page, limit, route);
    });
}
function paginateQueryBuilder(queryBuilder, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const [page, limit, route] = resolveOptions(options);
        const [items, total] = yield queryBuilder
            .take(limit)
            .skip((page - 1) * limit)
            .getManyAndCount();
        return createPaginationObject(items, total, page, limit, route);
    });
}
