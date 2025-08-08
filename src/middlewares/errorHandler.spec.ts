import { Request, Response, NextFunction } from 'express';
import { errorHandler, AppError } from './errorHandler';

describe('errorHandler middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should handle an error with a custom status and message', () => {
    const error: AppError = {
      name: 'CustomError',
      message: 'Something went wrong',
      status: 400,
    };

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Something went wrong',
    });
  });

  it('should handle an error without a custom status and default to 500', () => {
    const error: AppError = {
      name: 'ServerError',
      message: 'Internal Server Error',
    };

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should log the error to the console', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const error: AppError = {
      name: 'TestError',
      message: 'Test error occurred',
    };

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(consoleSpy).toHaveBeenCalledWith(error);
    consoleSpy.mockRestore();
  });

  it('should not call next() in the error handler', () => {
    const error: AppError = {
      name: 'TestError',
      message: 'Test error occurred',
    };

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
  });
});