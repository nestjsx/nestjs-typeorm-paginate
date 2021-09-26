import { Repository, FindManyOptions } from 'typeorm';

export class MockRepository extends Repository<any> {
  items = [];
  constructor(entityAmount: number) {
    super();
    for (let i = 0; i < entityAmount; i++) this.items.push(new Entity());
  }

  findAndCount = async (
    options?: FindManyOptions<any>,
  ): Promise<[any[], number]> => {
    const startIndex = options.skip;
    const endIndex = startIndex + options.take;

    const localItems = this.items.slice(startIndex, endIndex);
    return [localItems, this.items.length];
  };
}

export class Entity {}
