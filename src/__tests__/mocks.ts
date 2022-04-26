import { Repository, FindManyOptions, EntityTarget, EntityManager } from 'typeorm';

export class MockRepository extends Repository<any> {
  items = [];
  constructor(entityAmount: number) {
    super({} as EntityTarget<{}>, {} as EntityManager);
    for (let i = 0; i < entityAmount; i++) this.items.push(new Entity());
  }

  findAndCount = async (
    options?: FindManyOptions<any>,
  ): Promise<[any[], number]> => {
    return [await this.find(options), await this.count(options)];
  };

  find = async (options?: FindManyOptions<any>): Promise<any[]> => {
    const startIndex = options.skip;
    const endIndex = startIndex + options.take;

    const localItems = this.items.slice(startIndex, endIndex);
    return localItems;
  };

  count = async (options?: FindManyOptions<any>): Promise<number> => {
    return this.items.length;
  };
}

export class Entity {}
