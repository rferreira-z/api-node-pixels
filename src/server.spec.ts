import cron from 'node-cron';
import { Worker } from 'worker_threads';
import app from './app';
import { logger } from './helpers/logger';
import path from 'path';
import config from './config/config';

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));
jest.mock('worker_threads', () => ({
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    postMessage: jest.fn(),
  })),
}));
jest.mock('./helpers/logger');
jest.mock('./app', () => ({
  listen: jest.fn().mockImplementation((_, callback) => callback && callback()),
}));

jest.mock('path', () => ({
  resolve: jest.fn(),
}));

describe('Server', () => {
  const spyOn = jest.fn();
  const spyPostMessage = jest.fn();
  beforeAll(() => {
    jest.clearAllMocks();

    (Worker as unknown as jest.Mock).mockImplementation(() => ({
      on: spyOn,
      postMessage: spyPostMessage,
    }));
    config.nodeEnv = 'development';
    config.worker.enabled = true;
    require('./server');
  });

  afterAll(() => {
    jest.resetModules();
    config.nodeEnv = 'test';
    config.worker.enabled = false;
  });

  it('should start the server and log the correct message', () => {
    expect(app.listen).toHaveBeenCalledWith(3000, expect.any(Function));
    const listenCallback = (app.listen as jest.Mock).mock.calls[0][1];
    listenCallback();
    expect(logger.info).toHaveBeenCalledWith('Server running on port 3000');
  });

  it('should log development mode message if nodeEnv is development', () => {
    expect(logger.info).toHaveBeenCalledWith('Running in development mode');
  });

  it('should schedule a cron job and create a worker when worker is enabled', () => {
    expect(cron.schedule).toHaveBeenCalledWith(
      '*/1 * * * *',
      expect.any(Function),
    );
    const cronCallback = (cron.schedule as jest.Mock).mock.calls[0][1];
    cronCallback();

    expect(path.resolve).toHaveBeenCalledWith(
      expect.anything(),
      'workers/worker.js',
    );
    expect(Worker).toHaveBeenCalled();

    expect(spyOn).toHaveBeenCalledWith('message', expect.any(Function));
    expect(spyOn).toHaveBeenCalledWith('error', expect.any(Function));
    expect(spyOn).toHaveBeenCalledWith('exit', expect.any(Function));
    expect(spyPostMessage).toHaveBeenCalledWith({ type: 'start', data: null });

  });

    it('should log worker messages, errors, and exit codes', () => {
      const cronCallback = (cron.schedule as jest.Mock).mock.calls[0][1];
      cronCallback();

      const messageCallback = spyOn.mock.calls.find(
        (call) => call[0] === 'message',
      )[1];
      const errorCallback = spyOn.mock.calls.find(
        (call) => call[0] === 'error',
      )[1];
      const exitCallback = spyOn.mock.calls.find(
        (call) => call[0] === 'exit',
      )[1];

      messageCallback('Test message');
      expect(logger.info).toHaveBeenCalledWith('Worker message: Test message');

      errorCallback(new Error('Test error'));
      expect(logger.error).toHaveBeenCalledWith(
        'Worker error: Error: Test error',
      );

      exitCallback(1);
      expect(logger.error).toHaveBeenCalledWith('Worker exited with code 1');
      config.worker.enabled = false;
    });
});

describe('config.worker is disabled', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should not schedule a cron job if worker is disabled', () => {
    jest.mock('./config/config', () => ({
      port: 3000,
      nodeEnv: 'development',
      worker: {
        enabled: false,
        period: '*/30 * * * *',
      },
    }));

    require('./server');

    expect(cron.schedule).not.toHaveBeenCalled();
    expect(Worker).not.toHaveBeenCalled();
  });
});
