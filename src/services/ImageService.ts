import fs from 'fs';
import ImageRepository from '../repositories/ImageRepository';
import { IImage } from '../models/Image';
import { checkPixelsRarity, createPixelCanvas } from '../helpers/pixelHelpers';
import config from '../config/config';
import path from 'path';
import NftService, { NFTMetadata } from './NftService';
import {logger} from '../helpers/logger';

class ImageService {
  private imageRepository: ImageRepository;
  private nftService: NftService;

  constructor() {
    this.imageRepository = new ImageRepository();
    this.nftService = new NftService();
  }

  async getImageById(id: string): Promise<IImage | null> {
    return this.imageRepository.findById(id);
  }

  async createPixelImage(imageData: IImage): Promise<IImage> {
    logger.info(`Creating pixel image with name: ${imageData.name}`);
    const size = 32;
    const [pixels, largeCanvas] = createPixelCanvas(size);

    const [rarity, odds] = checkPixelsRarity(pixels);
    
    const fileName = `${imageData.name}-${rarity}-${Date.now()}`;

    const buffer = largeCanvas.toBuffer('image/png');

    fs.writeFileSync(
      `${path.join(__dirname, `../${config.outputDir}`)}/pixels/${fileName}.png`,
      buffer,
    );
    imageData.url = `/static/pixels/${fileName}.png`;
    if (config.publishOnChain) {
        const cid = await this.publishOnChain(fileName, {
            name: `${imageData.name} - ${pixels}`,
            description: '',
            attributes: [{
                trait_type: 'Rarity',
                value: 'Common',
            },
            {
                trait_type: 'Red Pixels',
                value: 0,
            }],
        });
        imageData.url = `${config.pinata.url}/${cid}`;
    }

    imageData.name = fileName;  
    imageData.description = `Pixels: ${pixels}, Rarity: ${rarity}, Chance: ${odds.toFixed(10)}, Odds: ${Math.floor(1/odds)}`;
    logger.info(`Creating pixel image with final: ${imageData.name}`);
    return this.imageRepository.create(imageData);
  }

  async publishOnChain(fileName: string, metadata: Omit<NFTMetadata, 'image'>): Promise<String> {
    const imageFile = fs.readFileSync(
        `${path.join(__dirname, `../${config.outputDir}`)}/pixels/${fileName}.png`,
      );
      const cid = await this.nftService.sendFileToPinata(
        new File([imageFile], fileName, { type: 'image/png' }),
      );
  
      const metadataWithURI: NFTMetadata = {
        ...metadata,
        image: `${config.pinata.url}/${cid}`,
      };
      const metadataFile = new File(
        [Buffer.from(JSON.stringify(metadataWithURI))],
        `${fileName}.json`,
        { type: 'application/json' },
      );
  
      const metadataCid = await this.nftService.sendFileToPinata(metadataFile);
  
      await this.nftService.mintNFT(`${config.pinata.url}/${metadataCid}`);

      return metadataCid;
  }
}

export default ImageService;
