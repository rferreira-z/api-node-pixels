import cron from 'node-cron';
import { Worker } from 'worker_threads';
import app from './app';
import config from './config/config';
import { logger } from './helpers/logger';
import path from 'path';

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

if (config.nodeEnv === 'development') {
  logger.info(`Running in development mode`);
}

if (config.worker.enabled) {
  // Schedule a cron job to run every period of time (.env)
  cron.schedule(config.worker.period, () => {
    logger.info('Running worker task every 30 minutes...');
    const worker = new Worker(path.resolve(__dirname, 'workers/worker.js')); // Path to your worker file
    worker.postMessage({
      type: 'start',
      data: null,
    });
    
    worker.on('message', (msg) => {
      logger.info(`Worker message: ${msg}`);
    });
    worker.on('error', (err) => {
      logger.error(`Worker error: ${err}`);
    });
    worker.on('exit', (code) => {
      if (code !== 0) {
        logger.error(`Worker exited with code ${code}`);
      }
    });
   
  });
}
