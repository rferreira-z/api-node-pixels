import { Canvas, createCanvas } from 'canvas';
import { Decimal } from 'decimal.js';

export const generateRandomNumberInRange = (range: number): number => {
  if (range <= 0) {
    throw new Error('range must be a positive number');
  }
  return Math.floor(Math.random() * range) + 1;
};

const generateRandomPixels = (): string => {
  let sequence = '';

  for (let i = 0; i < 25; i++) {
    var rand = generateRandomNumberInRange(10000);
    if (rand < 5000) {
      sequence += '0';
      continue;
    }
    if (rand > 5000) {
      sequence += '1';
      continue;
    }

    sequence += '2';
  }

  return sequence;
};

export const createPixelCanvas = (size: number): [string, Canvas] => {
  if (size <= 0) {
    throw new Error('Size cannot be zero or negative.');
  }

  const canvasSize = 5 * size;

  const largeCanvas = createCanvas(
    canvasSize + 4 * size,
    canvasSize + 4 * size,
  ); // Add padding
  const largeCtx = largeCanvas.getContext('2d');
  largeCtx.fillStyle = '#000000';
  largeCtx.fillRect(0, 0, largeCanvas.width, largeCanvas.height);
  largeCtx.fillStyle = '#FFFFFF';
  largeCtx.fillRect(
    size,
    size,
    largeCanvas.width - size * 2,
    largeCanvas.height - size * 2,
  );

  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext('2d');
  const pixels = generateRandomPixels();
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      let color = '#000000';

      const currentValue = pixels[i + j * 5];
      if (currentValue === '0') {
        color = '#000000';
      } else if (currentValue === '1') {
        color = '#FFFFFF';
      } else if (currentValue === '2') {
        color = '#FF0000';
      }

      ctx.fillStyle = color;
      ctx.fillRect(i * size, j * size, size, size);
    }
  }

  largeCtx.drawImage(canvas, size * 2, size * 2, canvas.width, canvas.height);
  return [pixels, largeCanvas];
};

export const checkPixelsRarity = (pixels: string): [string, number] => {
  if (pixels.length !== 25) {
    throw new Error('Pixels string must be exactly 25 characters long.');
  }
  const [zeros, ones, twos] = countRepeatedPixels(pixels);

  const odds: Decimal = calculateOdds(zeros, ones, twos);

  if (odds.toNumber() < new Decimal('0.0000001').toNumber()) {
    return ['Impossible', odds.toNumber()];
  } else if (odds.toNumber() < new Decimal('0.00001').toNumber()) {
    return ['Nearly Impossible', odds.toNumber()];
  } else if (odds.toNumber() < new Decimal('0.001').toNumber()) {
    return ['Rare', odds.toNumber()];
  } else if (odds.toNumber() < new Decimal('0.05').toNumber()) {
    return ['Hard', odds.toNumber()];
  } else if (odds.toNumber() < new Decimal('0.1').toNumber()) {
    return ['Uncommon', odds.toNumber()];
  }
  return ['Common', odds.toNumber()];
};

const countRepeatedPixels = (pixels: String): number[] => {
  // 0 , 1 or 2
  const counts: Record<string, number> = {};
  for (const pixel of pixels) {
    counts[pixel] = (counts[pixel] || 0) + 1;
  }
  return [counts['0'], counts['1'], counts['2']];
};

const calculateOdds = (zeros: number, ones: number, twos: number): Decimal => {
  // Set precision
  Decimal.set({ precision: 50 });

  // Probabilities
  const p0 = new Decimal('0.4999');
  const p1 = new Decimal('0.4999');
  const p2 = new Decimal('0.0001');

  // Calculate total probability
  const total = 25;
  const x0 = zeros || 0;
  const x1 = ones || 0;
  const x2 = twos || 0; // Ensure x2 is defined
  let totalProb = new Decimal(0);

  const coeff = comb(total, x0)
    .mul(comb(total - x0, x1))
    .mul(comb(total - x0 - x1, x2));

  const prob = p0.pow(x0).mul(p1.pow(x1)).mul(p2.pow(x2));
  totalProb = totalProb.add(coeff.mul(prob));

  return totalProb;
};

// Helper function for factorial
const factorial = (n: number) => {
  if (n === 0 || n === 1) return Decimal(1);
  let result = Decimal(1);
  for (let i = 2; i <= n; i++) {
    result = result.mul(i);
  }
  return result;
};

// Helper function for combination: C(n, k)
const comb = (n: number, k: number) => {
  if (k > n || k < 0) return Decimal(0);
  return factorial(n).div(factorial(k).mul(factorial(n - k)));
};
