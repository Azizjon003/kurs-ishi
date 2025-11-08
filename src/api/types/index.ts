import { z } from 'zod';

// Request schemas
export const CreateWorkflowRequestSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  language: z.enum(['uzbek', 'english', 'russian']).default('uzbek'),
  pageCount: z.number().min(10).max(100).optional().default(30),
  universityName: z.string().optional(),
  facultyName: z.string().optional(),
  departmentName: z.string().optional(),
  studentName: z.string().optional(),
  studentCourse: z.number().min(1).max(7).optional(),
  subjectName: z.string().optional(),
  advisorName: z.string().optional(),
  webhookUrl: z.string().url().optional(),
});

export type CreateWorkflowRequest = z.infer<typeof CreateWorkflowRequestSchema>;

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface WorkflowStatusResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  currentStep?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: WorkflowResult;
  error?: string;
}

export interface WorkflowResult {
  name: string;
  chapterTitle: string;
  language: string;
  introduction: string;
  conclusion: string;
  bibliography: string;
  documentPath: string;
  chapters: Chapter[];
  qualityReport?: string;
  pageCountReport?: string;
}

export interface Chapter {
  chapterTitle: string;
  sections: Section[];
}

export interface Section {
  title: string;
  content: string;
  researchedDatas: string;
  evaluation?: {
    passed: boolean;
    score: number;
    details: string;
    attempts: number;
  };
}

export interface Job {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input: CreateWorkflowRequest;
  result?: WorkflowResult;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  progress: number;
  currentStep?: string;
}

// Error types
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(500, message, details);
    this.name = 'InternalServerError';
  }
}
