import { parentPort } from 'worker_threads';
import ImageService from '../services/ImageService';
import { IImage } from '../models/Image';
import { logger } from '../helpers/logger';

if (parentPort) {
  logger.info(
    `Worker thread started with PID: ${process.pid}. Performing nft creation...`,
  );

  parentPort.on('message', async (message: { type: string; data: any }) => {
    if (message.type === 'start') {
      parentPort?.postMessage('Worker thread: Performing nft creation...');
      try {
        const newImage: IImage = {
          name: 'pixels',
          url: `http://example.com/pixels`,
        };
        const imageService = new ImageService();
        const createdImage = await imageService.createPixelImage(newImage);
        parentPort?.postMessage({ type: 'result', data: createdImage });
      } catch (error: any) {
        parentPort?.postMessage({ type: 'error', data: error.message });
      }
    }
  });
} else {
  logger.error(
    'Worker thread: parentPort is null. This script should be run as a worker.',
  );
}
