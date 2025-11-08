# 📚 Academic Paper Generator API

Professional REST API for generating academic course papers using AI. This API provides asynchronous job processing for creating well-structured academic documents in multiple languages.

## 🚀 Features

- **Asynchronous Processing**: Queue-based job system for handling long-running paper generation
- **Multi-language Support**: Generate papers in Uzbek, English, and Russian
- **Quality Evaluation**: Built-in content quality assessment with automatic regeneration
- **Progress Tracking**: Real-time progress updates for each job
- **Webhook Notifications**: Get notified when your paper is ready
- **Document Download**: Direct download of generated Word documents
- **OpenAPI/Swagger**: Complete API documentation with interactive testing
- **API Key Authentication**: Optional security for production environments

## 📋 Prerequisites

- Node.js >= 20.9.0
- NPM or Yarn
- OpenAI API key (for AI content generation)

## 🔧 Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd kurs-ishi
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
```

3. **Install additional API dependencies:**
```bash
npm install express cors
npm install -D @types/express @types/cors
```

4. **Configure environment variables:**

Create or update `.env` file:
```env
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# API Configuration
API_PORT=3000
NODE_ENV=development

# API Security (optional)
REQUIRE_API_KEY=false
API_KEY=your_secret_api_key_here

# CORS (optional)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 🏃 Running the API

### Development Mode

```bash
# Start the API server
node src/api/server.ts

# Or with ts-node
npx ts-node src/api/server.ts
```

### Production Mode

```bash
# Build TypeScript
npm run build

# Start the server
npm start
```

## 📖 API Documentation

### Interactive Documentation

Once the server is running, visit:

- **Main Docs**: http://localhost:3000/docs
- **Swagger UI**: http://localhost:3000/docs/swagger
- **OpenAPI Spec**: http://localhost:3000/docs/openapi

### Health Check

```bash
curl http://localhost:3000/health
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

If `REQUIRE_API_KEY=true`, include your API key in requests:

```bash
# Header method (recommended)
curl -H "X-API-Key: your_api_key_here" ...

# Query parameter method
curl "...?apiKey=your_api_key_here"
```

### Endpoints

#### 1. Create Workflow Job

**POST** `/api/v1/workflow`

Create a new academic paper generation job.

**Request Body:**
```json
{
  "topic": "Matematik kutilma va dispersiya",
  "language": "uzbek",
  "pageCount": 30,
  "studentName": "Alisher Navoiy",
  "studentCourse": 4,
  "universityName": "O'ZBEKISTON MILLIY UNIVERSITETI",
  "facultyName": "Matematika fakulteti",
  "departmentName": "Amaliy matematika yo'nalishi",
  "subjectName": "MATEMATIKA",
  "advisorName": "Professor Mirzo Ulug'bek",
  "webhookUrl": "https://your-app.com/webhook/job-complete"
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "jobId": "123e4567-e89b-12d3-a456-426614174000",
    "status": "pending",
    "message": "Workflow job created successfully"
  },
  "timestamp": "2024-11-08T12:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/workflow \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "topic": "Matematik kutilma va dispersiya",
    "language": "uzbek",
    "pageCount": 30,
    "studentName": "Alisher Navoiy"
  }'
```

---

#### 2. Get Job Status

**GET** `/api/v1/workflow/:jobId`

Get the status and result of a specific job.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "jobId": "123e4567-e89b-12d3-a456-426614174000",
    "status": "processing",
    "progress": 45,
    "currentStep": "Writing introduction",
    "createdAt": "2024-11-08T12:00:00.000Z",
    "startedAt": "2024-11-08T12:00:05.000Z",
    "completedAt": null,
    "result": null,
    "error": null
  },
  "timestamp": "2024-11-08T12:05:00.000Z"
}
```

**Job Statuses:**
- `pending`: Job is queued
- `processing`: Job is being processed
- `completed`: Job completed successfully
- `failed`: Job failed with error

**cURL Example:**
```bash
curl http://localhost:3000/api/v1/workflow/123e4567-e89b-12d3-a456-426614174000 \
  -H "X-API-Key: your_api_key_here"
```

---

#### 3. Download Generated Document

**GET** `/api/v1/workflow/:jobId/download`

Download the generated Word document (only available for completed jobs).

**Response (200 OK):**
- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Binary file stream

**cURL Example:**
```bash
curl http://localhost:3000/api/v1/workflow/123e4567-e89b-12d3-a456-426614174000/download \
  -H "X-API-Key: your_api_key_here" \
  -o my_paper.docx
```

---

#### 4. List All Jobs

**GET** `/api/v1/workflow`

Get a paginated list of all jobs.

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `processing`, `completed`, `failed`)
- `limit` (optional): Number of results (default: 50, max: 100)
- `offset` (optional): Number of results to skip (default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "jobId": "123e4567-e89b-12d3-a456-426614174000",
        "status": "completed",
        "progress": 100,
        "currentStep": "Generating Word document",
        "createdAt": "2024-11-08T12:00:00.000Z",
        "startedAt": "2024-11-08T12:00:05.000Z",
        "completedAt": "2024-11-08T12:15:00.000Z",
        "topic": "Matematik kutilma va dispersiya",
        "language": "uzbek"
      }
    ],
    "pagination": {
      "total": 100,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    }
  },
  "timestamp": "2024-11-08T12:20:00.000Z"
}
```

**cURL Example:**
```bash
curl "http://localhost:3000/api/v1/workflow?status=completed&limit=10" \
  -H "X-API-Key: your_api_key_here"
```

---

#### 5. Cancel Job

**POST** `/api/v1/workflow/:jobId/cancel`

Cancel a pending job.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Job cancelled successfully",
  "timestamp": "2024-11-08T12:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/workflow/123e4567-e89b-12d3-a456-426614174000/cancel \
  -H "X-API-Key: your_api_key_here"
```

---

#### 6. Delete Job

**DELETE** `/api/v1/workflow/:jobId`

Delete a completed or failed job.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Job deleted successfully",
  "timestamp": "2024-11-08T12:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/workflow/123e4567-e89b-12d3-a456-426614174000 \
  -H "X-API-Key: your_api_key_here"
```

---

#### 7. Queue Statistics

**GET** `/api/v1/workflow/queue/stats`

Get job queue statistics.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "pending": 5,
    "processing": 3,
    "completed": 135,
    "failed": 7,
    "maxConcurrent": 3,
    "currentConcurrent": 2
  },
  "timestamp": "2024-11-08T12:00:00.000Z"
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/v1/workflow/queue/stats \
  -H "X-API-Key: your_api_key_here"
```

---

## 🔔 Webhook Notifications

You can optionally provide a `webhookUrl` when creating a job. The API will send a POST request to this URL when the job completes (either successfully or with an error).

**Webhook Payload:**
```json
{
  "jobId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "timestamp": "2024-11-08T12:15:00.000Z",
  "result": {
    "name": "Matematik kutilma va dispersiya",
    "documentPath": "/path/to/document.docx",
    ...
  },
  "error": null
}
```

## 🔒 Security Best Practices

1. **Use HTTPS in production**
2. **Enable API key authentication** (`REQUIRE_API_KEY=true`)
3. **Rotate API keys regularly**
4. **Set CORS allowed origins** (don't use `*` in production)
5. **Use environment variables** for sensitive data
6. **Implement rate limiting** (consider adding middleware)

## 📊 Monitoring & Logging

The API includes:
- Request/response logging to console
- Error tracking with stack traces
- Health check endpoints for monitoring tools
- Queue statistics for performance tracking

## 🐛 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Invalid request data",
  "details": {
    "field": "topic",
    "issue": "Required"
  },
  "timestamp": "2024-11-08T12:00:00.000Z",
  "path": "/api/v1/workflow"
}
```

**Common Error Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid API key)
- `404` - Not Found (job doesn't exist)
- `500` - Internal Server Error

## 🧪 Testing

### Test with cURL

```bash
# Create a test job
JOB_ID=$(curl -X POST http://localhost:3000/api/v1/workflow \
  -H "Content-Type: application/json" \
  -d '{"topic":"Test Topic","language":"uzbek"}' \
  | jq -r '.data.jobId')

# Check status
curl http://localhost:3000/api/v1/workflow/$JOB_ID

# Download when complete
curl http://localhost:3000/api/v1/workflow/$JOB_ID/download -o paper.docx
```

### Test with JavaScript/Node.js

```javascript
// Create job
const response = await fetch('http://localhost:3000/api/v1/workflow', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key_here'
  },
  body: JSON.stringify({
    topic: 'Matematik kutilma va dispersiya',
    language: 'uzbek',
    pageCount: 30
  })
});

const { data } = await response.json();
const jobId = data.jobId;

// Poll for status
const checkStatus = async () => {
  const res = await fetch(`http://localhost:3000/api/v1/workflow/${jobId}`, {
    headers: { 'X-API-Key': 'your_api_key_here' }
  });
  const { data } = await res.json();

  if (data.status === 'completed') {
    // Download document
    window.location.href = `http://localhost:3000/api/v1/workflow/${jobId}/download`;
  } else if (data.status === 'processing') {
    console.log(`Progress: ${data.progress}% - ${data.currentStep}`);
    setTimeout(checkStatus, 5000); // Check again in 5 seconds
  }
};

checkStatus();
```

### Test with Python

```python
import requests
import time

# Create job
response = requests.post(
    'http://localhost:3000/api/v1/workflow',
    headers={'X-API-Key': 'your_api_key_here'},
    json={
        'topic': 'Matematik kutilma va dispersiya',
        'language': 'uzbek',
        'pageCount': 30
    }
)

job_id = response.json()['data']['jobId']

# Poll for completion
while True:
    status_response = requests.get(
        f'http://localhost:3000/api/v1/workflow/{job_id}',
        headers={'X-API-Key': 'your_api_key_here'}
    )

    data = status_response.json()['data']

    if data['status'] == 'completed':
        # Download document
        doc = requests.get(
            f'http://localhost:3000/api/v1/workflow/{job_id}/download',
            headers={'X-API-Key': 'your_api_key_here'}
        )
        with open('paper.docx', 'wb') as f:
            f.write(doc.content)
        print('Document downloaded!')
        break
    elif data['status'] == 'failed':
        print(f"Job failed: {data['error']}")
        break
    else:
        print(f"Progress: {data['progress']}% - {data['currentStep']}")
        time.sleep(5)
```

## 🚀 Deployment

### Docker (Recommended)

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "src/api/server.ts"]
```

Build and run:
```bash
docker build -t academic-paper-api .
docker run -p 3000:3000 --env-file .env academic-paper-api
```

### PM2 (Process Manager)

```bash
npm install -g pm2

pm2 start src/api/server.ts --name academic-paper-api
pm2 save
pm2 startup
```

## 📝 Request Schema

### Required Fields
- `topic` (string): The topic of the paper
- `language` (string): One of `uzbek`, `english`, `russian`

### Optional Fields
- `pageCount` (number): Target pages (10-100, default: 30)
- `universityName` (string): University name
- `facultyName` (string): Faculty name
- `departmentName` (string): Department name
- `studentName` (string): Student's full name
- `studentCourse` (number): Course year (1-7)
- `subjectName` (string): Subject/course name
- `advisorName` (string): Scientific advisor name
- `webhookUrl` (string): URL for completion notification

## 🆘 Support

For issues, questions, or contributions:
- GitHub Issues: [your-repo-url/issues]
- Email: support@example.com

## 📄 License

MIT License - see LICENSE file for details

---

**Made with ❤️ using Node.js, Express, and AI**
