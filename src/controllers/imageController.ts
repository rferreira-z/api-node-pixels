import { Request, Response, NextFunction } from 'express';
import { IImage } from '../models/Image';
import ImageService from '../services/ImageService';

export const createPixelImage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { name } = req.body;
      const newImage: IImage = {
        name,
        url: `http://example.com/${name}`,
      };
  
      const imageService = new ImageService();
      const createdImage = await imageService.createPixelImage(newImage);
  
      res.status(201).json(createdImage);
    } catch (error) {
      next(error);
    }
  };