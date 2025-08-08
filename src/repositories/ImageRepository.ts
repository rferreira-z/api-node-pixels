import { Model } from 'mongoose';
import Image, { IImage } from '../models/Image';
import BaseRepository from './BaseRepository';

class ImageRepository extends BaseRepository<IImage> {
  constructor(_: Model<IImage> = Image) {
    super(Image);
  }
}

export default ImageRepository;
