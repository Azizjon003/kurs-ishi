import { Router, Request, Response } from 'express';

export const healthRouter = Router();

/**
 * GET /health
 * Health check endpoint
 */
healthRouter.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    },
    node: process.version
  });
});

/**
 * GET /health/ready
 * Readiness check endpoint
 */
healthRouter.get('/ready', (req: Request, res: Response) => {
  // Add any readiness checks here (database connections, etc.)
  const isReady = true;

  if (isReady) {
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /health/live
 * Liveness check endpoint
 */
healthRouter.get('/live', (req: Request, res: Response) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});
