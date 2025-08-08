import { Model } from 'mongoose';
import BaseRepository from './BaseRepository';

interface TestEntity {
  name: string;
  age: number;
}

describe('BaseRepository', () => {
  let mockModel: jest.Mocked<Model<TestEntity>>;
  let repository: BaseRepository<TestEntity>;

  beforeEach(() => {
    mockModel = {
      findById: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<Model<TestEntity>>;

    repository = new BaseRepository<TestEntity>(mockModel);
  });

  describe('findById', () => {
    it('should return the entity if found', async () => {
      const mockEntity = { name: 'John', age: 30 };
      mockModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockEntity),
      } as any);

      const result = await repository.findById('123');
      expect(mockModel.findById).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockEntity);
    });

    it('should return null if the entity is not found', async () => {
      mockModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      const result = await repository.findById('123');
      expect(mockModel.findById).toHaveBeenCalledWith('123');
      expect(result).toBeNull();
    });

    it('should throw an error if findById fails', async () => {
      mockModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error('Database error')),
      } as any);

      await expect(repository.findById('123')).rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('should create and return the entity', async () => {
      const mockEntity = { name: 'Jane', age: 25 } as any;
      mockModel.create.mockResolvedValueOnce(mockEntity);

      const result = await repository.create(mockEntity);
      expect(mockModel.create).toHaveBeenCalledWith(mockEntity);
      expect(result).toEqual(mockEntity);
    });

    it('should throw an error if create fails', async () => {
      const mockEntity = { name: 'Jane', age: 25 };
      mockModel.create.mockRejectedValueOnce(new Error('Database error'));

      await expect(repository.create(mockEntity)).rejects.toThrow('Database error');
    });
  });
});