import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types/index.js';

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  console.error('[Error]', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle ApiError
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.name,
      message: error.message,
      details: error.details,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    path: req.path
  });
}
