import { Router, Request, Response } from 'express';
import { JobQueue } from '../services/job-queue.js';
import { CreateWorkflowRequestSchema, ValidationError, NotFoundError } from '../types/index.js';
import { z } from 'zod';
import { createReadStream, existsSync } from 'fs';
import { basename } from 'path';

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
  router.delete('/:jobId', (req: Request, res: Response) => {
    const { jobId } = req.params;
    const deleted = jobQueue.deleteJob(jobId);

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
  router.post('/:jobId/cancel', (req: Request, res: Response) => {
    const { jobId } = req.params;
    const cancelled = jobQueue.cancelJob(jobId);

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

    if (!job.result?.documentPath) {
      throw new NotFoundError('Document not found');
    }

    const documentPath = job.result.documentPath;

    if (!existsSync(documentPath)) {
      throw new NotFoundError('Document file not found on server');
    }

    const fileName = basename(documentPath);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const fileStream = createReadStream(documentPath);
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
