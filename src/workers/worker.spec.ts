import { parentPort } from 'worker_threads';
import { logger } from '../helpers/logger';
import ImageService from '../services/ImageService';

// jest.mock('../services/ImageService', () =>
//   jest.fn().mockImplementation(() => ({
//     createPixelImage: jest.fn().mockResolvedValue({}),
//   })),
// );
jest.mock('../services/ImageService'); // Mock the entire class

jest.mock('../helpers/logger');

jest.mock('worker_threads', () => ({
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    postMessage: jest.fn(),
  })),
  parentPort: {
    on: jest.fn(),
    postMessage: jest.fn(),
  },
}));

describe('Worker', () => {
  const mockImageService = ImageService as jest.Mock;
  const spyCreatePixelImage = jest.fn().mockResolvedValue({});
  beforeEach(() => {});

  beforeAll(() => {
    jest.clearAllMocks();
    mockImageService.mockImplementation(() => ({
      createPixelImage: spyCreatePixelImage,
    }));
    require('./worker');
  });

  it('should log a message when the worker starts', () => {
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Worker thread started with PID'),
    );
  });

  it('should process the "start" message and create an image', async () => {
    expect(parentPort?.on).toHaveBeenCalled();
    const messageHandler =
      (parentPort?.on as jest.Mock).mock.calls[0][1] || jest.fn();
    await messageHandler({ type: 'start', data: {} });

    expect(parentPort?.postMessage).toHaveBeenCalledWith(
      'Worker thread: Performing nft creation...',
    );
    expect(spyCreatePixelImage).toHaveBeenCalled();
    expect(parentPort?.postMessage).toHaveBeenCalledWith({
      type: 'result',
      data: expect.anything(),
    });
  });
  it('should handle errors during image creation', async () => {
    const mockError = new Error('Image creation failed');
    spyCreatePixelImage.mockRejectedValue(mockError);
    require('./worker');

    const messageHandler =
      (parentPort?.on as jest.Mock).mock.calls[0][1] || jest.fn();
    await messageHandler({ type: 'start', data: {} });

    expect(parentPort?.postMessage).toHaveBeenCalledWith({
      type: 'error',
      data: mockError.message,
    });
  });
});