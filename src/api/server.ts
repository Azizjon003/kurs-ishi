import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import { JobQueue } from "./services/job-queue.js";
import { workflowRouter } from "./routes/workflow.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { docsRouter } from "./routes/docs.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { apiKeyAuth } from "./middleware/auth.js";
import { requestLogger } from "./middleware/logger.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.API_PORT || 3000;
const API_VERSION = "v1";

export class APIServer {
  private app: Express;
  private jobQueue: JobQueue;

  constructor() {
    this.app = express();
    this.jobQueue = new JobQueue();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
        credentials: true,
      })
    );

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Request logging
    this.app.use(requestLogger);
  }

  private setupRoutes(): void {
    // Health check (no auth required)
    this.app.use("/health", healthRouter);

    // API documentation (no auth required)
    this.app.use("/docs", docsRouter);

    // API routes (with auth)
    const apiRouter = express.Router();

    // Apply API key authentication to all API routes
    if (process.env.REQUIRE_API_KEY === "true") {
      apiRouter.use(apiKeyAuth);
    }

    // Workflow routes
    apiRouter.use("/workflow", workflowRouter(this.jobQueue));

    // Mount API router
    this.app.use(`/api/${API_VERSION}`, apiRouter);

    // Root route
    this.app.get("/", (req: Request, res: Response) => {
      res.json({
        name: "Academic Paper Generator API",
        version: API_VERSION,
        description: "REST API for generating academic course papers",
        documentation: `/docs`,
        endpoints: {
          health: "/health",
          docs: "/docs",
          api: `/api/${API_VERSION}`,
        },
      });
    });
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: "Not Found",
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString(),
      });
    });

    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      this.app.listen(PORT, () => {
        console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Academic Paper Generator API                            ║
╠═══════════════════════════════════════════════════════════╣
║   Status:        Running ✓                                ║
║   Port:          ${PORT}                                  ║
║   Version:       ${API_VERSION}                           ║
║   Environment:   ${process.env.NODE_ENV || "development"} ║
║                                                           ║
║   Endpoints:                                              ║
║   - Health:      http://localhost:${PORT}/health          ║
║   - Docs:        http://localhost:${PORT}/docs            ║
║   - API:         http://localhost:${PORT}/api/${API_VERSION} ║
╚═══════════════════════════════════════════════════════════╝
        `);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  }

  public getApp(): Express {
    return this.app;
  }

  public getJobQueue(): JobQueue {
    return this.jobQueue;
  }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new APIServer();
  server.start();
}
