import { createClient } from '@libsql/client';
import type { Job } from '../types/index.js';

export class Database {
  private client: ReturnType<typeof createClient>;
  private initialized = false;

  constructor(dbPath: string = './data/jobs.db') {
    // Create local SQLite database
    this.client = createClient({
      url: `file:${dbPath}`
    });
  }

  /**
   * Initialize database and create tables
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create jobs table
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS jobs (
          id TEXT PRIMARY KEY,
          status TEXT NOT NULL,
          input TEXT NOT NULL,
          created_at TEXT NOT NULL,
          started_at TEXT,
          completed_at TEXT,
          progress INTEGER DEFAULT 0,
          current_step TEXT,
          result TEXT,
          error TEXT
        )
      `);

      console.log('[Database] Database initialized successfully');
      this.initialized = true;
    } catch (error) {
      console.error('[Database] Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Save or update a job
   */
  async saveJob(job: Job): Promise<void> {
    try {
      await this.client.execute({
        sql: `
          INSERT OR REPLACE INTO jobs (
            id, status, input, created_at, started_at, completed_at,
            progress, current_step, result, error
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          job.id,
          job.status,
          JSON.stringify(job.input),
          job.createdAt.toISOString(),
          job.startedAt?.toISOString() || null,
          job.completedAt?.toISOString() || null,
          job.progress,
          job.currentStep || null,
          job.result ? JSON.stringify(job.result) : null,
          job.error || null
        ]
      });
    } catch (error) {
      console.error('[Database] Failed to save job:', error);
      throw error;
    }
  }

  /**
   * Get a job by ID
   */
  async getJob(jobId: string): Promise<Job | null> {
    try {
      const result = await this.client.execute({
        sql: 'SELECT * FROM jobs WHERE id = ?',
        args: [jobId]
      });

      if (result.rows.length === 0) {
        return null;
      }

      return this.rowToJob(result.rows[0]);
    } catch (error) {
      console.error('[Database] Failed to get job:', error);
      throw error;
    }
  }

  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<Job[]> {
    try {
      const result = await this.client.execute(
        'SELECT * FROM jobs ORDER BY created_at DESC'
      );

      return result.rows.map(row => this.rowToJob(row));
    } catch (error) {
      console.error('[Database] Failed to get all jobs:', error);
      throw error;
    }
  }

  /**
   * Delete a job
   */
  async deleteJob(jobId: string): Promise<boolean> {
    try {
      const result = await this.client.execute({
        sql: 'DELETE FROM jobs WHERE id = ?',
        args: [jobId]
      });

      return result.rowsAffected > 0;
    } catch (error) {
      console.error('[Database] Failed to delete job:', error);
      throw error;
    }
  }

  /**
   * Delete old completed jobs
   */
  async deleteOldJobs(cutoffDate: Date): Promise<number> {
    try {
      const result = await this.client.execute({
        sql: `
          DELETE FROM jobs
          WHERE (status = 'completed' OR status = 'failed')
          AND completed_at < ?
        `,
        args: [cutoffDate.toISOString()]
      });

      return result.rowsAffected;
    } catch (error) {
      console.error('[Database] Failed to delete old jobs:', error);
      throw error;
    }
  }

  /**
   * Get jobs by status
   */
  async getJobsByStatus(status: string): Promise<Job[]> {
    try {
      const result = await this.client.execute({
        sql: 'SELECT * FROM jobs WHERE status = ? ORDER BY created_at DESC',
        args: [status]
      });

      return result.rows.map(row => this.rowToJob(row));
    } catch (error) {
      console.error('[Database] Failed to get jobs by status:', error);
      throw error;
    }
  }

  /**
   * Convert database row to Job object
   */
  private rowToJob(row: any): Job {
    return {
      id: row.id as string,
      status: row.status as 'pending' | 'processing' | 'completed' | 'failed',
      input: JSON.parse(row.input as string),
      createdAt: new Date(row.created_at as string),
      startedAt: row.started_at ? new Date(row.started_at as string) : undefined,
      completedAt: row.completed_at ? new Date(row.completed_at as string) : undefined,
      progress: (row.progress as number) || 0,
      currentStep: row.current_step as string | undefined,
      result: row.result ? JSON.parse(row.result as string) : undefined,
      error: row.error as string | undefined
    };
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.client.close();
    console.log('[Database] Database connection closed');
  }
}
