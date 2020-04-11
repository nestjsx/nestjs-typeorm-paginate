"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Pagination {
    constructor(
    /**
     * a list of items to be returned
     */
    items, 
    /**
     * associated meta information (e.g., counts)
     */
    meta, 
    /**
     * associated links
     */
    links) {
        this.items = items;
        this.meta = meta;
        this.links = links;
    }
}
exports.Pagination = Pagination;
