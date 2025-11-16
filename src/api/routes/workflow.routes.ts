import { Router, Request, Response } from 'express';
import { JobQueue } from '../services/job-queue.js';
import { CreateWorkflowRequestSchema, ValidationError, NotFoundError } from '../types/index.js';
import { z } from 'zod';
import { createReadStream, existsSync } from 'fs';
import { basename, join } from 'path';

/**
 * Helper function to sanitize filename (matches logic in wordDocumentGenerator)
 */
function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_\s-]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase()
    .substring(0, 50);
}

export function workflowRouter(jobQueue: JobQueue): Router {
  const router = Router();

  /**
   * POST /api/v1/workflow
   * Create a new workflow job
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = CreateWorkflowRequestSchema.parse(req.body);

      // Add job to queue
      const jobId = await jobQueue.addJob(validatedData);

      res.status(202).json({
        success: true,
        data: {
          jobId,
          status: 'pending',
          message: 'Workflow job created successfully'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid request data', error.errors);
      }
      throw error;
    }
  });

  /**
   * GET /api/v1/workflow/:jobId
   * Get workflow job status
   */
  router.get('/:jobId', (req: Request, res: Response) => {
    const { jobId } = req.params;
    const job = jobQueue.getJob(jobId);

    if (!job) {
      throw new NotFoundError(`Job with ID ${jobId} not found`);
    }

    res.json({
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        currentStep: job.currentStep,
        createdAt: job.createdAt.toISOString(),
        startedAt: job.startedAt?.toISOString(),
        completedAt: job.completedAt?.toISOString(),
        result: job.result,
        error: job.error
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * GET /api/v1/workflow
   * Get all workflow jobs
   */
  router.get('/', (req: Request, res: Response) => {
    const { status, limit = 50, offset = 0 } = req.query;

    let jobs = jobQueue.getAllJobs();

    // Filter by status
    if (status && typeof status === 'string') {
      jobs = jobs.filter(job => job.status === status);
    }

    // Pagination
    const total = jobs.length;
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    jobs = jobs.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      data: {
        jobs: jobs.map(job => ({
          jobId: job.id,
          status: job.status,
          progress: job.progress,
          currentStep: job.currentStep,
          createdAt: job.createdAt.toISOString(),
          startedAt: job.startedAt?.toISOString(),
          completedAt: job.completedAt?.toISOString(),
          topic: job.input.topic,
          language: job.input.language
        })),
        pagination: {
          total,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < total
        }
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * DELETE /api/v1/workflow/:jobId
   * Delete a workflow job
   */
  router.delete('/:jobId', async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const deleted = await jobQueue.deleteJob(jobId);

    if (!deleted) {
      throw new NotFoundError(`Job with ID ${jobId} not found or cannot be deleted`);
    }

    res.json({
      success: true,
      message: 'Job deleted successfully',
      timestamp: new Date().toISOString()
    });
  });

  /**
   * POST /api/v1/workflow/:jobId/cancel
   * Cancel a pending workflow job
   */
  router.post('/:jobId/cancel', async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const cancelled = await jobQueue.cancelJob(jobId);

    if (!cancelled) {
      throw new NotFoundError(`Job with ID ${jobId} not found or cannot be cancelled`);
    }

    res.json({
      success: true,
      message: 'Job cancelled successfully',
      timestamp: new Date().toISOString()
    });
  });

  /**
   * GET /api/v1/workflow/:jobId/download
   * Download the generated document
   */
  router.get('/:jobId/download', (req: Request, res: Response) => {
    const { jobId } = req.params;
    const job = jobQueue.getJob(jobId);

    if (!job) {
      throw new NotFoundError(`Job with ID ${jobId} not found`);
    }

    if (job.status !== 'completed') {
      throw new ValidationError('Job is not completed yet');
    }

    // Try to get document path from result
    let documentPath = job.result?.documentPath;

    // If not found or file doesn't exist, try to construct path from topic
    if (!documentPath || !existsSync(documentPath)) {
      console.log(`[Download] Document path from result not found or invalid: ${documentPath}`);
      console.log(`[Download] Attempting to construct fallback path...`);

      const topic = job.input.topic;
      const safeFileName = sanitizeFileName(topic);
      const fileName = `kurs_ishi_${safeFileName}.docx`;

      // Construct full path using current working directory (same as document generator)
      documentPath = join(process.cwd(), fileName);

      console.log(`[Download] Constructed fallback path: ${documentPath}`);

      // If still not found, throw detailed error
      if (!existsSync(documentPath)) {
        throw new NotFoundError(
          `Document file not found on server.\n` +
          `Original path from result: ${job.result?.documentPath || 'N/A'}\n` +
          `Fallback path: ${documentPath}\n` +
          `Job ID: ${jobId}\n` +
          `Topic: ${topic}`
        );
      }
    }

    const fileName = basename(documentPath);

    console.log(`[Download] Serving file: ${documentPath}`);
    console.log(`[Download] Filename: ${fileName}`);

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Create file stream with error handling
    const fileStream = createReadStream(documentPath);

    fileStream.on('error', (error) => {
      console.error(`[Download] Error streaming file: ${error.message}`);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Failed to stream document file',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    fileStream.on('open', () => {
      console.log(`[Download] File stream opened successfully`);
    });

    fileStream.on('end', () => {
      console.log(`[Download] File stream completed`);
    });

    // Pipe the file to response
    fileStream.pipe(res);
  });

  /**
   * GET /api/v1/workflow/stats
   * Get queue statistics
   */
  router.get('/queue/stats', (req: Request, res: Response) => {
    const stats = jobQueue.getStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  });

  return router;
}
