import ImageRepository from './ImageRepository';
import Image, { IImage } from '../models/Image';

jest.mock('/src/models/Image');

describe('ImageRepository', () => {
  let repository: ImageRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new ImageRepository(Image);
  });

  describe('findById', () => {
    it('should return the image if found', async () => {
      const mockImage = {
        _id: '123',
        url: 'http://example.com/image.jpg',
        name: 'example',
      } as IImage;
      const spyFindById = jest.spyOn(Image, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockReturnValueOnce(mockImage),
      } as any);

      const result = await repository.findById('123');
      expect(spyFindById).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockImage);
    });

    it('should return null if the image is not found', async () => {
      const spyFindById = jest.spyOn(Image, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      const result = await repository.findById('123');
      expect(spyFindById).toHaveBeenCalledWith('123');
      expect(result).toBeNull();
    });

    it('should throw an error if findById fails', async () => {
      jest.spyOn(Image, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error('Database error')),
      } as any);

      await expect(repository.findById('123')).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('create', () => {
    it('should create and return the image', async () => {
      const mockImage = { url: 'http://example.com/image.jpg' } as IImage;
      const spyCreate = jest.spyOn(Image, 'create').mockResolvedValueOnce(mockImage as any);

      const result = await repository.create(mockImage);
      expect(spyCreate).toHaveBeenCalledWith(mockImage);
      expect(result).toEqual(mockImage);
    });

    it('should throw an error if create fails', async () => {
      const mockImage = { url: 'http://example.com/image.jpg' } as IImage;
      jest.spyOn(Image, 'create').mockRejectedValueOnce(new Error('Database error'));

      await expect(repository.create(mockImage)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle edge case where the image object is empty', async () => {
      const emptyImage = {} as IImage;
      const spyCreate = jest.spyOn(Image, 'create').mockResolvedValueOnce({
        ...emptyImage,
      } as any);

      const result = await repository.create(emptyImage);
      expect(spyCreate).toHaveBeenCalledWith(emptyImage);
      expect(result).toEqual(emptyImage);
    });
  });
});
