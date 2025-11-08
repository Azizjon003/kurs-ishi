/**
 * Example API Client
 *
 * This example demonstrates how to use the Academic Paper Generator API
 * from your own application.
 */

interface CreateWorkflowRequest {
  topic: string;
  language: 'uzbek' | 'english' | 'russian';
  pageCount?: number;
  universityName?: string;
  facultyName?: string;
  departmentName?: string;
  studentName?: string;
  studentCourse?: number;
  subjectName?: string;
  advisorName?: string;
  webhookUrl?: string;
}

interface WorkflowStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: any;
  error?: string;
}

class AcademicPaperClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = 'http://localhost:3000', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    return headers;
  }

  /**
   * Create a new workflow job
   */
  async createWorkflow(request: CreateWorkflowRequest): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflow`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create workflow: ${error.message}`);
    }

    const data = await response.json();
    return data.data.jobId;
  }

  /**
   * Get workflow status
   */
  async getStatus(jobId: string): Promise<WorkflowStatus> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflow/${jobId}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get status: ${error.message}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Download the generated document
   */
  async downloadDocument(jobId: string, outputPath: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflow/${jobId}/download`, {
      headers: this.apiKey ? { 'X-API-Key': this.apiKey } : {}
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to download document: ${error.message}`);
    }

    // For Node.js environment
    if (typeof window === 'undefined') {
      const fs = await import('fs');
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(buffer));
    } else {
      // For browser environment
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputPath;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }

  /**
   * Cancel a pending job
   */
  async cancelJob(jobId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflow/${jobId}/cancel`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to cancel job: ${error.message}`);
    }
  }

  /**
   * Delete a job
   */
  async deleteJob(jobId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflow/${jobId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete job: ${error.message}`);
    }
  }

  /**
   * Wait for job completion and download document
   */
  async createAndWaitForCompletion(
    request: CreateWorkflowRequest,
    outputPath: string,
    onProgress?: (status: WorkflowStatus) => void
  ): Promise<WorkflowStatus> {
    // Create job
    const jobId = await this.createWorkflow(request);
    console.log(`Job created: ${jobId}`);

    // Poll for completion
    while (true) {
      const status = await this.getStatus(jobId);

      if (onProgress) {
        onProgress(status);
      }

      if (status.status === 'completed') {
        console.log('Job completed! Downloading document...');
        await this.downloadDocument(jobId, outputPath);
        console.log(`Document downloaded to: ${outputPath}`);
        return status;
      }

      if (status.status === 'failed') {
        throw new Error(`Job failed: ${status.error}`);
      }

      // Wait 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// ============================================================================
// Example Usage
// ============================================================================

async function example1_BasicUsage() {
  console.log('\n=== Example 1: Basic Usage ===\n');

  const client = new AcademicPaperClient('http://localhost:3000');

  try {
    // Create a workflow
    const jobId = await client.createWorkflow({
      topic: 'Matematik kutilma va dispersiya',
      language: 'uzbek',
      pageCount: 30,
      studentName: 'Alisher Navoiy',
      studentCourse: 4
    });

    console.log(`Job created: ${jobId}`);

    // Poll for status
    let status = await client.getStatus(jobId);
    console.log(`Status: ${status.status} (${status.progress}%)`);

    // When completed, download
    if (status.status === 'completed') {
      await client.downloadDocument(jobId, 'my_paper.docx');
      console.log('Document downloaded!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function example2_WithApiKey() {
  console.log('\n=== Example 2: With API Key ===\n');

  const client = new AcademicPaperClient(
    'http://localhost:3000',
    'your_api_key_here'
  );

  const jobId = await client.createWorkflow({
    topic: 'SQL Injection Vulnerabilities',
    language: 'english',
    pageCount: 35
  });

  console.log(`Job created: ${jobId}`);
}

async function example3_AutoWaitAndDownload() {
  console.log('\n=== Example 3: Auto Wait and Download ===\n');

  const client = new AcademicPaperClient('http://localhost:3000');

  try {
    const result = await client.createAndWaitForCompletion(
      {
        topic: 'Kiberxavfsizlik asoslari',
        language: 'uzbek',
        pageCount: 30
      },
      'kiberxavfsizlik.docx',
      (status) => {
        console.log(`Progress: ${status.progress}% - ${status.currentStep || 'Processing...'}`);
      }
    );

    console.log('Completed!', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function example4_BatchProcessing() {
  console.log('\n=== Example 4: Batch Processing ===\n');

  const client = new AcademicPaperClient('http://localhost:3000');

  const topics = [
    { topic: 'Topic 1', language: 'uzbek' as const },
    { topic: 'Topic 2', language: 'english' as const },
    { topic: 'Topic 3', language: 'russian' as const },
  ];

  // Create all jobs
  const jobIds = await Promise.all(
    topics.map(t => client.createWorkflow(t))
  );

  console.log('Created jobs:', jobIds);

  // Monitor all jobs
  const checkAll = async () => {
    const statuses = await Promise.all(
      jobIds.map(id => client.getStatus(id))
    );

    console.log('\nStatus Summary:');
    statuses.forEach((s, i) => {
      console.log(`  Job ${i + 1}: ${s.status} (${s.progress}%)`);
    });

    const allCompleted = statuses.every(s =>
      s.status === 'completed' || s.status === 'failed'
    );

    if (!allCompleted) {
      setTimeout(checkAll, 10000); // Check again in 10 seconds
    } else {
      console.log('\nAll jobs completed!');
    }
  };

  await checkAll();
}

// ============================================================================
// Run examples
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  // Uncomment the example you want to run:

  // example1_BasicUsage();
  // example2_WithApiKey();
  // example3_AutoWaitAndDownload();
  // example4_BatchProcessing();

  console.log(`
╔════════════════════════════════════════════════════════════╗
║  Academic Paper Generator API - Client Examples           ║
╠════════════════════════════════════════════════════════════╣
║  Uncomment one of the examples above to run it.            ║
║                                                            ║
║  Available examples:                                       ║
║  1. Basic Usage                                            ║
║  2. With API Key Authentication                            ║
║  3. Auto Wait and Download                                 ║
║  4. Batch Processing                                       ║
╚════════════════════════════════════════════════════════════╝
  `);
}

export { AcademicPaperClient, CreateWorkflowRequest, WorkflowStatus };
