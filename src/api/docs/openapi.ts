export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Academic Paper Generator API',
    version: '1.0.0',
    description: 'REST API for generating academic course papers using AI',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'https://api.example.com',
      description: 'Production server'
    }
  ],
  tags: [
    {
      name: 'Workflow',
      description: 'Academic paper generation workflow operations'
    },
    {
      name: 'Health',
      description: 'Health check endpoints'
    }
  ],
  paths: {
    '/api/v1/workflow': {
      post: {
        tags: ['Workflow'],
        summary: 'Create a new workflow job',
        description: 'Creates a new academic paper generation job and returns a job ID',
        operationId: 'createWorkflow',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateWorkflowRequest'
              },
              examples: {
                uzbekExample: {
                  summary: 'Uzbek language paper',
                  value: {
                    topic: 'Matematik kutilma va dispersiya',
                    language: 'uzbek',
                    pageCount: 30,
                    studentName: 'Alisher Navoiy',
                    studentCourse: 4,
                    universityName: "O'ZBEKISTON MILLIY UNIVERSITETI",
                    facultyName: 'Matematika fakulteti'
                  }
                },
                englishExample: {
                  summary: 'English language paper',
                  value: {
                    topic: 'SQL Injection Vulnerabilities in Modern Web Applications',
                    language: 'english',
                    pageCount: 35,
                    studentName: 'John Doe',
                    studentCourse: 3
                  }
                }
              }
            }
          }
        },
        responses: {
          '202': {
            description: 'Job created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateWorkflowResponse'
                }
              }
            }
          },
          '400': {
            description: 'Invalid request data',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized - Invalid or missing API key',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        },
        security: [
          {
            ApiKeyAuth: []
          }
        ]
      },
      get: {
        tags: ['Workflow'],
        summary: 'Get all workflow jobs',
        description: 'Returns a paginated list of all workflow jobs',
        operationId: 'getWorkflows',
        parameters: [
          {
            name: 'status',
            in: 'query',
            description: 'Filter by job status',
            schema: {
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'failed']
            }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Number of results per page',
            schema: {
              type: 'integer',
              default: 50,
              minimum: 1,
              maximum: 100
            }
          },
          {
            name: 'offset',
            in: 'query',
            description: 'Number of results to skip',
            schema: {
              type: 'integer',
              default: 0,
              minimum: 0
            }
          }
        ],
        responses: {
          '200': {
            description: 'List of jobs',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/GetWorkflowsResponse'
                }
              }
            }
          }
        },
        security: [
          {
            ApiKeyAuth: []
          }
        ]
      }
    },
    '/api/v1/workflow/{jobId}': {
      get: {
        tags: ['Workflow'],
        summary: 'Get workflow job status',
        description: 'Returns the status and result of a specific job',
        operationId: 'getWorkflowStatus',
        parameters: [
          {
            name: 'jobId',
            in: 'path',
            required: true,
            description: 'Job ID',
            schema: {
              type: 'string',
              format: 'uuid'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Job status and result',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/WorkflowStatusResponse'
                }
              }
            }
          },
          '404': {
            description: 'Job not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        },
        security: [
          {
            ApiKeyAuth: []
          }
        ]
      },
      delete: {
        tags: ['Workflow'],
        summary: 'Delete workflow job',
        description: 'Deletes a completed or failed job',
        operationId: 'deleteWorkflow',
        parameters: [
          {
            name: 'jobId',
            in: 'path',
            required: true,
            description: 'Job ID',
            schema: {
              type: 'string',
              format: 'uuid'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Job deleted successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse'
                }
              }
            }
          },
          '404': {
            description: 'Job not found or cannot be deleted',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        },
        security: [
          {
            ApiKeyAuth: []
          }
        ]
      }
    },
    '/api/v1/workflow/{jobId}/cancel': {
      post: {
        tags: ['Workflow'],
        summary: 'Cancel workflow job',
        description: 'Cancels a pending job',
        operationId: 'cancelWorkflow',
        parameters: [
          {
            name: 'jobId',
            in: 'path',
            required: true,
            description: 'Job ID',
            schema: {
              type: 'string',
              format: 'uuid'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Job cancelled successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse'
                }
              }
            }
          },
          '404': {
            description: 'Job not found or cannot be cancelled',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        },
        security: [
          {
            ApiKeyAuth: []
          }
        ]
      }
    },
    '/api/v1/workflow/{jobId}/download': {
      get: {
        tags: ['Workflow'],
        summary: 'Download generated document',
        description: 'Downloads the generated Word document for a completed job',
        operationId: 'downloadDocument',
        parameters: [
          {
            name: 'jobId',
            in: 'path',
            required: true,
            description: 'Job ID',
            schema: {
              type: 'string',
              format: 'uuid'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Document file',
            content: {
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          },
          '404': {
            description: 'Job or document not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        },
        security: [
          {
            ApiKeyAuth: []
          }
        ]
      }
    },
    '/api/v1/workflow/queue/stats': {
      get: {
        tags: ['Workflow'],
        summary: 'Get queue statistics',
        description: 'Returns statistics about the job queue',
        operationId: 'getQueueStats',
        responses: {
          '200': {
            description: 'Queue statistics',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/QueueStatsResponse'
                }
              }
            }
          }
        },
        security: [
          {
            ApiKeyAuth: []
          }
        ]
      }
    },
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns health status of the API',
        operationId: 'healthCheck',
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse'
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for authentication'
      }
    },
    schemas: {
      CreateWorkflowRequest: {
        type: 'object',
        required: ['topic', 'language'],
        properties: {
          topic: {
            type: 'string',
            description: 'The topic of the course paper',
            example: 'Matematik kutilma va dispersiya'
          },
          language: {
            type: 'string',
            enum: ['uzbek', 'english', 'russian'],
            description: 'The language for writing the course paper',
            example: 'uzbek'
          },
          pageCount: {
            type: 'integer',
            minimum: 10,
            maximum: 100,
            default: 30,
            description: 'Target page count for the paper',
            example: 30
          },
          universityName: {
            type: 'string',
            description: 'University name',
            example: "O'ZBEKISTON MILLIY UNIVERSITETI"
          },
          facultyName: {
            type: 'string',
            description: 'Faculty name',
            example: 'Matematika fakulteti'
          },
          departmentName: {
            type: 'string',
            description: 'Department name',
            example: 'Amaliy matematika yo\'nalishi'
          },
          studentName: {
            type: 'string',
            description: 'Student full name',
            example: 'Alisher Navoiy'
          },
          studentCourse: {
            type: 'integer',
            minimum: 1,
            maximum: 7,
            description: 'Student course year',
            example: 4
          },
          subjectName: {
            type: 'string',
            description: 'Subject name',
            example: 'MATEMATIKA'
          },
          advisorName: {
            type: 'string',
            description: 'Scientific advisor name',
            example: 'Professor Mirzo Ulug\'bek'
          },
          webhookUrl: {
            type: 'string',
            format: 'uri',
            description: 'Webhook URL to receive job completion notification',
            example: 'https://your-app.com/webhook/job-complete'
          }
        }
      },
      CreateWorkflowResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object',
            properties: {
              jobId: {
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174000'
              },
              status: {
                type: 'string',
                example: 'pending'
              },
              message: {
                type: 'string',
                example: 'Workflow job created successfully'
              }
            }
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      WorkflowStatusResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean'
          },
          data: {
            type: 'object',
            properties: {
              jobId: {
                type: 'string',
                format: 'uuid'
              },
              status: {
                type: 'string',
                enum: ['pending', 'processing', 'completed', 'failed']
              },
              progress: {
                type: 'number',
                minimum: 0,
                maximum: 100
              },
              currentStep: {
                type: 'string'
              },
              createdAt: {
                type: 'string',
                format: 'date-time'
              },
              startedAt: {
                type: 'string',
                format: 'date-time'
              },
              completedAt: {
                type: 'string',
                format: 'date-time'
              },
              result: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  chapterTitle: { type: 'string' },
                  language: { type: 'string' },
                  documentPath: { type: 'string' }
                }
              },
              error: {
                type: 'string'
              }
            }
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      GetWorkflowsResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean'
          },
          data: {
            type: 'object',
            properties: {
              jobs: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    jobId: { type: 'string', format: 'uuid' },
                    status: { type: 'string' },
                    progress: { type: 'number' },
                    currentStep: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    topic: { type: 'string' },
                    language: { type: 'string' }
                  }
                }
              },
              pagination: {
                type: 'object',
                properties: {
                  total: { type: 'integer' },
                  limit: { type: 'integer' },
                  offset: { type: 'integer' },
                  hasMore: { type: 'boolean' }
                }
              }
            }
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      QueueStatsResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean'
          },
          data: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              pending: { type: 'integer' },
              processing: { type: 'integer' },
              completed: { type: 'integer' },
              failed: { type: 'integer' },
              maxConcurrent: { type: 'integer' },
              currentConcurrent: { type: 'integer' }
            }
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'healthy'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          uptime: {
            type: 'number'
          },
          memory: {
            type: 'object',
            properties: {
              used: { type: 'integer' },
              total: { type: 'integer' },
              unit: { type: 'string', example: 'MB' }
            }
          },
          node: {
            type: 'string'
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string'
          },
          message: {
            type: 'string'
          },
          details: {
            type: 'object'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          path: {
            type: 'string'
          }
        }
      }
    }
  }
};
