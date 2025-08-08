import express from 'express';
import mongoose from 'mongoose';
import imageRoutes from './routes/imageRoutes';
import { errorHandler } from './middlewares/errorHandler';
import config from './config/config';
import path from 'path';
import fs from 'fs';
import pinoHttp from 'pino-http';
import { logger } from './helpers/logger';

// Directory to store generated images
const OUTPUT_DIR = config.outputDir;

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const app = express();

// Use pino-http middleware for request logging
app.use(pinoHttp({
  logger: logger, // Use your custom pino logger instance
  // Optional: Add custom serializers or hooks
  genReqId: (req) => req.headers['x-request-id'] || Math.random().toString(36).substring(2, 15),
}));
app.use(express.json());


mongoose
  .connect(config.mongoURI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch((err) => logger.error('Failed to connect to MongoDB', err));

// Routes
app.use('/api/image', imageRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

// Serve static files from the 'public' directory
logger.info('Serving static files from:', path.join(__dirname, `/${OUTPUT_DIR}`));
app.use('/static', express.static(path.join(__dirname, `/${OUTPUT_DIR}`)));

export default app;
