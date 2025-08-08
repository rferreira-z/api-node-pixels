import { createCanvas } from 'canvas';
import {
  createPixelCanvas,
  checkPixelsRarity,
  generateRandomNumberInRange,
} from './pixelHelpers';


jest.mock('canvas', () => ({
  createCanvas: jest.fn((width, height) => ({
    width,
    height,
    getContext: jest.fn(() => ({
      fillStyle: '',
      fillRect: jest.fn(),
      drawImage: jest.fn(),
    })),
  })),
}));

describe('createPixelCanvas', () => {
  it('should return a valid pixel string and canvas object', () => {
    const size = 10;
    const [pixels, canvas] = createPixelCanvas(size);

    expect(typeof pixels).toBe('string');
    expect(pixels.length).toBe(25); // 5x5 grid
    expect(canvas).toHaveProperty('width', 5 * size + 4 * size);
    expect(canvas).toHaveProperty('height', 5 * size + 4 * size);
  });

  it('should call createCanvas with correct dimensions', () => {
    const size = 20;
    createPixelCanvas(size);

    expect(createCanvas).toHaveBeenCalledWith(5 * size, 5 * size);
    expect(createCanvas).toHaveBeenCalledWith(
      5 * size + 4 * size,
      5 * size + 4 * size,
    );
  });

  it('should fill the canvas with the correct colors', () => {
    const size = 15;
    const mockCtx = {
      fillStyle: '',
      fillRect: jest.fn(),
      drawImage: jest.fn(),
    };
    (createCanvas as jest.Mock).mockReturnValueOnce({
      getContext: jest.fn(() => mockCtx),
      width: 5 * size,
      height: 5 * size,
    });

    createPixelCanvas(size);

    expect(mockCtx.fillRect).toHaveBeenCalled();
    expect(mockCtx.fillStyle).toBeDefined();
  });

  it('should handle edge case where size is 0', () => {
    expect(() => createPixelCanvas(0)).toThrow();
  });

  it('should handle edge case where size is negative', () => {
    expect(() => createPixelCanvas(-10)).toThrow();
  });
});

describe('checkPixelsRarity', () => {
  it('should return "Impossible" for a string with all "2"s', () => {
    const pixels = '2222222222222222222222222';
    const [rarity, odds] = checkPixelsRarity(pixels);

    expect(rarity).toBe('Impossible');
    expect(odds).toBeCloseTo(0, 10);
  });

  it('should return "Common" for a string with balanced "0"s and "1"s', () => {
    const pixels = '0101010101010101010101010';
    const [rarity, odds] = checkPixelsRarity(pixels);

    expect(rarity).toBe('Common');
    expect(odds).toBeGreaterThan(0.1);
  });

  it('should throw an error for a string with length not equal to 25', () => {
    expect(() => checkPixelsRarity('000')).toThrow(
      'Pixels string must be exactly 25 characters long.',
    );
  });

  it('should handle edge case with no "2"s', () => {
    const pixels = '0000000000111111111100000';
    const [rarity, odds] = checkPixelsRarity(pixels);

    expect(rarity).toBe('Uncommon');
    expect(odds).toBeGreaterThan(0);
  });

  it('should handle edge case with all "0"s', () => {
    const pixels = '0000000000000000000000000';
    const [rarity, odds] = checkPixelsRarity(pixels);

    expect(rarity).toBe('Impossible');
    expect(odds).toBeGreaterThan(0);
  });

  it('should handle edge case with all "1"s', () => {
    const pixels = '1111111111111111111111111';
    const [rarity, odds] = checkPixelsRarity(pixels);

    expect(rarity).toBe('Impossible');
    expect(odds).toBeGreaterThan(0);
  });

  it('should handle edge case with no exactly 2 "2"s', () => {
    const pixels = '0000000000111111111100022';
    const [rarity, odds] = checkPixelsRarity(pixels);

    expect(rarity).toBe('Nearly Impossible');
    expect(odds).toBeGreaterThan(0);
  });
});
describe('generateRandomNumberInRange', () => {
  it('should return a number within the specified range', () => {
    const range = 10;
    for (let i = 0; i < 100; i++) {
      const randomNumber = generateRandomNumberInRange(range);
      expect(randomNumber).toBeGreaterThanOrEqual(1);
      expect(randomNumber).toBeLessThanOrEqual(range);
    }
  });

  it('should return 1 when the range is 1', () => {
    const range = 1;
    const randomNumber = generateRandomNumberInRange(range);
    expect(randomNumber).toBe(1);
  });

  it('should throw an error if the range is less than or equal to 0', () => {
    expect(() => generateRandomNumberInRange(0)).toThrow();
    expect(() => generateRandomNumberInRange(-5)).toThrow();
  });

  it('should produce different numbers over multiple calls', () => {
    const range = 100;
    const results = new Set();
    for (let i = 0; i < 100; i++) {
      results.add(generateRandomNumberInRange(range));
    }
    expect(results.size).toBeGreaterThan(1); // Ensure randomness
  });

  it('should reproduce avg scenario with big amount of calls', () => {
    const calls = 10000;
    const range = 100;
    let sum = 0;
    for (let i = 0; i < calls; i++) {
      sum += generateRandomNumberInRange(range);
    }
    expect(Math.floor(sum / calls)).toBeGreaterThan(45); // Ensure randomness
    expect(Math.floor(sum / calls)).toBeLessThan(55); // Ensure randomness
  });
});
