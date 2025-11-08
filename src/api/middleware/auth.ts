import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../types/index.js';

/**
 * API Key Authentication Middleware
 */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const validApiKey = process.env.API_KEY;

  // If no API key is configured, allow all requests
  if (!validApiKey) {
    return next();
  }

  // Check if API key is provided
  if (!apiKey) {
    throw new UnauthorizedError('API key is required. Provide it via X-API-Key header or apiKey query parameter');
  }

  // Validate API key
  if (apiKey !== validApiKey) {
    throw new UnauthorizedError('Invalid API key');
  }

  next();
}

/**
 * Optional API Key Authentication
 * Allows requests without API key but adds user info if valid key is provided
 */
export function optionalApiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const validApiKey = process.env.API_KEY;

  if (apiKey && validApiKey && apiKey === validApiKey) {
    // Add authenticated flag to request
    (req as any).authenticated = true;
  }

  next();
}
