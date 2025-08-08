import { Model } from 'mongoose';

interface IBaseRepository<T> {
    findById(id: string): Promise<T | null>;
    create(entity: T): Promise<T>;
  }

class BaseRepository<T> implements IBaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async create(entity: T): Promise<T> {
    return this.model.create(entity);
  }
}

export default BaseRepository;
