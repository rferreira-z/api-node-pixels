import { model, Schema } from 'mongoose';

export interface IImage {
  name: string;
  description?: string;
  url: string;
}

const imageSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    url: { type: String, required: true },
  },
  { collection: 'Image', timestamps: true },
);

const Image = model<IImage>('Image', imageSchema);

export default Image;
