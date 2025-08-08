import fs from 'fs';
import ImageService from './ImageService';
import ImageRepository from '../repositories/ImageRepository';
import NftService from './NftService';
import {
  createPixelCanvas,
  checkPixelsRarity,
} from '../helpers/pixelHelpers';
import config from '../config/config';

jest.mock('fs');
jest.mock('path');
jest.mock('../repositories/ImageRepository');
jest.mock('./NftService');
jest.mock('../helpers/pixelHelpers');

const mockImageRepository =
  new ImageRepository() as jest.Mocked<ImageRepository>;
const mockNftService = new NftService() as jest.Mocked<NftService>;

describe('ImageService', () => {
  let imageService: ImageService;

  beforeEach(() => {
    jest.clearAllMocks();
    imageService = new ImageService();
    (imageService as any).imageRepository = mockImageRepository;
    (imageService as any).nftService = mockNftService;
  });

  describe('getImageById', () => {
    it('should return the image when found', async () => {
      const mockImage = { id: '1', name: 'test', url: 'url' };
      mockImageRepository.findById.mockResolvedValue(mockImage);

      const result = await imageService.getImageById('1');
      expect(result).toEqual(mockImage);
      expect(mockImageRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should return null when the image is not found', async () => {
      mockImageRepository.findById.mockResolvedValue(null);

      const result = await imageService.getImageById('1');
      expect(result).toBeNull();
    });
  });

  describe('createPixelImage', () => {
    it('should create a pixel image and save it to the repository', async () => {
      const mockImageData = { name: 'test', description: '', url: '' };
      const mockPixels = '0101010101010101010101010';
      const mockCanvas = { toBuffer: jest.fn(() => Buffer.from('mockBuffer')) };
      const mockRarity = 'Common';
      const mockOdds = 0.5;

      (createPixelCanvas as jest.Mock).mockReturnValue([
        mockPixels,
        mockCanvas,
      ]);
      (checkPixelsRarity as jest.Mock).mockReturnValue([mockRarity, mockOdds]);
      mockImageRepository.create.mockResolvedValue(mockImageData);

      const result = await imageService.createPixelImage(mockImageData);

      expect(createPixelCanvas).toHaveBeenCalledWith(32);
      expect(checkPixelsRarity).toHaveBeenCalledWith(mockPixels);
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockImageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining('test-Common'),
          description: expect.stringContaining(
            'Pixels: 0101010101010101010101010',
          ),
        }),
      );
      expect(result).toEqual(mockImageData);
    });

    it('should publish metadata when PUBLISH_ON_CHAIN is true', async () => {
      const mockImageData = { name: 'test', description: '', url: '' };
      const mockPixels = '0101010101010101010101010';
      const mockCanvas = { toBuffer: jest.fn(() => Buffer.from('mockBuffer')) };
      const mockRarity = 'Common';
      const mockOdds = 0.5;
      const mockCid = 'mockCid';

      (createPixelCanvas as jest.Mock).mockReturnValue([
        mockPixels,
        mockCanvas,
      ]);
      (checkPixelsRarity as jest.Mock).mockReturnValue([mockRarity, mockOdds]);
      mockImageRepository.create.mockResolvedValue(mockImageData);
      mockNftService.sendFileToPinata.mockResolvedValue(mockCid);

      config.publishOnChain = true;

      const result = await imageService.createPixelImage(mockImageData);

      expect(mockNftService.sendFileToPinata).toHaveBeenCalled();
      expect(mockImageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining(mockCid),
        }),
      );
      expect(result).toEqual(mockImageData);
    });

    it('should throw an error for invalid imageData', async () => {
      await expect(
        imageService.createPixelImage(null as any),
      ).rejects.toThrow();
    });
  });

  describe('publishOnChain', () => {
    it('should upload the image and metadata to Pinata', async () => {
      const mockFileName = 'test.png';
      const mockMetadata = { name: 'test', description: '', attributes: [] };
      const mockCid = 'mockCid';

      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('mockBuffer'));
      mockNftService.sendFileToPinata.mockResolvedValue(mockCid);
      mockNftService.mintNFT.mockResolvedValue();

      const result = await imageService.publishOnChain(
        mockFileName,
        mockMetadata,
      );

      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining(mockFileName),
      );
      expect(mockNftService.sendFileToPinata).toHaveBeenCalledTimes(2);
      expect(mockNftService.mintNFT).toHaveBeenCalledWith(
        expect.stringContaining(mockCid),
      );
      expect(result).toBe(mockCid);
    });

    it('should handle errors during file upload', async () => {
      const mockFileName = 'test.png';
      const mockMetadata = { name: 'test', description: '', attributes: [] };

      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('mockBuffer'));
      mockNftService.sendFileToPinata.mockRejectedValue(
        new Error('Upload failed'),
      );

      await expect(
        imageService.publishOnChain(mockFileName, mockMetadata),
      ).rejects.toThrow('Upload failed');
    });
  });
});
