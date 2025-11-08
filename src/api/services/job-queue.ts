import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import { mastra } from '../../mastra/index.js';
import type { Job, CreateWorkflowRequest, WorkflowResult } from '../types/index.js';

// Polyfill browser APIs for Mastra
if (typeof global !== 'undefined' && !global.window) {
  (global as any).window = {};
  (global as any).document = {
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  if (!global.AbortController) {
    (global as any).AbortController = class {
      signal = { aborted: false, addEventListener: () => {}, removeEventListener: () => {} };
      abort() { this.signal.aborted = true; }
    };
  }
}

export class JobQueue extends EventEmitter {
  private jobs: Map<string, Job> = new Map();
  private processingJobs: Set<string> = new Set();
  private maxConcurrentJobs: number = 3;

  constructor() {
    super();
    this.startWorker();
  }

  /**
   * Add a new job to the queue
   */
  public async addJob(input: CreateWorkflowRequest): Promise<string> {
    const jobId = randomUUID();

    const job: Job = {
      id: jobId,
      status: 'pending',
      input,
      createdAt: new Date(),
      progress: 0,
    };

    this.jobs.set(jobId, job);
    this.emit('job:created', job);

    // Trigger processing
    this.processNextJob();

    return jobId;
  }

  /**
   * Get job by ID
   */
  public getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  public getAllJobs(): Job[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Delete a job
   */
  public deleteJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    // Don't delete if processing
    if (job.status === 'processing') {
      return false;
    }

    this.jobs.delete(jobId);
    this.emit('job:deleted', jobId);
    return true;
  }

  /**
   * Cancel a job
   */
  public cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === 'pending') {
      job.status = 'failed';
      job.error = 'Job cancelled by user';
      job.completedAt = new Date();
      this.emit('job:cancelled', job);
      return true;
    }

    return false;
  }

  /**
   * Process the next job in the queue
   */
  private async processNextJob(): Promise<void> {
    // Check if we can process more jobs
    if (this.processingJobs.size >= this.maxConcurrentJobs) {
      return;
    }

    // Find next pending job
    const pendingJob = Array.from(this.jobs.values()).find(
      job => job.status === 'pending'
    );

    if (!pendingJob) {
      return;
    }

    await this.processJob(pendingJob.id);
  }

  /**
   * Process a specific job
   */
  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'pending') {
      return;
    }

    try {
      // Mark as processing
      job.status = 'processing';
      job.startedAt = new Date();
      this.processingJobs.add(jobId);
      this.emit('job:started', job);

      console.log(`[JobQueue] Processing job ${jobId}...`);

      // Execute the workflow
      const result = await this.executeWorkflow(job);

      // Mark as completed
      job.status = 'completed';
      job.result = result;
      job.completedAt = new Date();
      job.progress = 100;
      this.processingJobs.delete(jobId);

      this.emit('job:completed', job);
      console.log(`[JobQueue] Job ${jobId} completed successfully`);

      // Send webhook if provided
      if (job.input.webhookUrl) {
        this.sendWebhook(job.input.webhookUrl, job);
      }

    } catch (error) {
      // Mark as failed
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
      job.completedAt = new Date();
      this.processingJobs.delete(jobId);

      this.emit('job:failed', job);
      console.error(`[JobQueue] Job ${jobId} failed:`, error);

      // Send webhook if provided
      if (job.input.webhookUrl) {
        this.sendWebhook(job.input.webhookUrl, job);
      }
    }

    // Process next job
    this.processNextJob();
  }

  /**
   * Execute the workflow
   */
  private async executeWorkflow(job: Job): Promise<WorkflowResult> {
    const { input } = job;

    // Create progress callback
    const onProgress = (step: string, progress: number) => {
      job.currentStep = step;
      job.progress = progress;
      this.emit('job:progress', job);
    };

    // Execute workflow with progress tracking
    const steps = [
      'Preparing topic and metadata',
      'Planning content structure',
      'Researching content',
      'Writing introduction',
      'Writing chapters (Theory, Analysis, Improvement)',
      'Writing conclusion',
      'Generating bibliography',
      'Creating quality report',
      'Calculating page count',
      'Generating Word document'
    ];

    let currentStepIndex = 0;
    const totalSteps = steps.length;

    // Mock progress updates (in real implementation, workflow would emit these)
    const progressInterval = setInterval(() => {
      if (currentStepIndex < totalSteps && job.status === 'processing') {
        onProgress(steps[currentStepIndex], (currentStepIndex / totalSteps) * 100);
        currentStepIndex++;
      }
    }, 5000); // Update every 5 seconds

    try {
      const workflow = mastra.getWorkflow('writerWorkFlow');
      const result = await workflow.execute({
        topic: input.topic,
        language: input.language,
        pageCount: input.pageCount,
        universityName: input.universityName,
        facultyName: input.facultyName,
        departmentName: input.departmentName,
        studentName: input.studentName,
        studentCourse: input.studentCourse,
        subjectName: input.subjectName,
        advisorName: input.advisorName,
      });

      clearInterval(progressInterval);

      return {
        name: result.name,
        chapterTitle: result.chapterTitle,
        language: result.language,
        introduction: result.introduction,
        conclusion: result.conclusion,
        bibliography: result.bibliography,
        documentPath: result.document,
        chapters: result.chapters,
        qualityReport: result.qualityReport,
        pageCountReport: result.pageCountReport,
      };
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(webhookUrl: string, job: Job): Promise<void> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Academic-Paper-Generator-API/1.0'
        },
        body: JSON.stringify({
          jobId: job.id,
          status: job.status,
          timestamp: new Date().toISOString(),
          result: job.result,
          error: job.error
        })
      });

      if (!response.ok) {
        console.error(`[JobQueue] Webhook failed for job ${job.id}: ${response.statusText}`);
      } else {
        console.log(`[JobQueue] Webhook sent successfully for job ${job.id}`);
      }
    } catch (error) {
      console.error(`[JobQueue] Error sending webhook for job ${job.id}:`, error);
    }
  }

  /**
   * Start background worker
   */
  private startWorker(): void {
    // Clean up old completed jobs every hour
    setInterval(() => {
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

      for (const [jobId, job] of this.jobs.entries()) {
        if (
          (job.status === 'completed' || job.status === 'failed') &&
          job.completedAt &&
          job.completedAt < cutoffTime
        ) {
          this.jobs.delete(jobId);
          console.log(`[JobQueue] Cleaned up old job ${jobId}`);
        }
      }
    }, 60 * 60 * 1000); // Every hour

    console.log('[JobQueue] Background worker started');
  }

  /**
   * Get queue statistics
   */
  public getStats() {
    const jobs = Array.from(this.jobs.values());

    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      maxConcurrent: this.maxConcurrentJobs,
      currentConcurrent: this.processingJobs.size,
    };
  }
}
