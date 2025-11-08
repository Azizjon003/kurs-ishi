# 🚀 Quick Start Guide - Academic Paper Generator API

Get started with the API in under 5 minutes!

## 📦 Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
# Copy the example env file
cp .env.api.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=your_key_here
```

## ▶️ Start the API Server

```bash
npm run api
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║   Academic Paper Generator API                            ║
╠═══════════════════════════════════════════════════════════╣
║   Status:        Running ✓                                ║
║   Port:          3000                                     ║
║   Version:       v1                                       ║
...
```

## 🧪 Test the API

### 1. Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-11-08T12:00:00.000Z",
  "uptime": 5.123,
  "memory": { "used": 45, "total": 128, "unit": "MB" },
  "node": "v20.9.0"
}
```

### 2. Create Your First Paper

```bash
curl -X POST http://localhost:3000/api/v1/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Matematik kutilma va dispersiya",
    "language": "uzbek",
    "pageCount": 30,
    "studentName": "Test Student"
  }'
```

Expected response:
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

**Save the `jobId`!** You'll need it to check status.

### 3. Check Job Status

```bash
# Replace JOB_ID with the ID from step 2
curl http://localhost:3000/api/v1/workflow/JOB_ID
```

Response when processing:
```json
{
  "success": true,
  "data": {
    "jobId": "123e4567-e89b-12d3-a456-426614174000",
    "status": "processing",
    "progress": 45,
    "currentStep": "Writing introduction",
    "createdAt": "2024-11-08T12:00:00.000Z",
    "startedAt": "2024-11-08T12:00:05.000Z"
  }
}
```

### 4. Download Document

Once status is `completed`, download your paper:

```bash
curl http://localhost:3000/api/v1/workflow/JOB_ID/download -o my_paper.docx
```

## 📱 Full Example with Auto-Wait

Here's a complete example that waits for completion:

```bash
#!/bin/bash

# Create job and extract jobId
RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "SQL Injection in Web Applications",
    "language": "english",
    "pageCount": 25
  }')

JOB_ID=$(echo $RESPONSE | jq -r '.data.jobId')
echo "Job created: $JOB_ID"

# Wait for completion
while true; do
  STATUS=$(curl -s http://localhost:3000/api/v1/workflow/$JOB_ID | jq -r '.data.status')
  PROGRESS=$(curl -s http://localhost:3000/api/v1/workflow/$JOB_ID | jq -r '.data.progress')

  echo "Status: $STATUS ($PROGRESS%)"

  if [ "$STATUS" = "completed" ]; then
    echo "Downloading document..."
    curl http://localhost:3000/api/v1/workflow/$JOB_ID/download -o paper.docx
    echo "Done! Document saved as paper.docx"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "Job failed!"
    break
  fi

  sleep 5
done
```

## 🔑 Using API Key Authentication (Optional)

1. **Enable API key in `.env`:**
```env
REQUIRE_API_KEY=true
API_KEY=my_secret_key_12345
```

2. **Restart the server**

3. **Include API key in requests:**
```bash
curl -X POST http://localhost:3000/api/v1/workflow \
  -H "X-API-Key: my_secret_key_12345" \
  -H "Content-Type: application/json" \
  -d '{"topic": "Test", "language": "uzbek"}'
```

## 🌐 View Documentation

Open your browser and visit:

- **Interactive Docs**: http://localhost:3000/docs
- **Swagger UI**: http://localhost:3000/docs/swagger
- **OpenAPI Spec**: http://localhost:3000/docs/openapi

## 💻 Use from Your Code

### JavaScript/TypeScript

```typescript
const response = await fetch('http://localhost:3000/api/v1/workflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'My Research Topic',
    language: 'english',
    pageCount: 30
  })
});

const { data } = await response.json();
console.log('Job ID:', data.jobId);
```

### Python

```python
import requests

response = requests.post(
    'http://localhost:3000/api/v1/workflow',
    json={
        'topic': 'My Research Topic',
        'language': 'english',
        'pageCount': 30
    }
)

job_id = response.json()['data']['jobId']
print(f'Job ID: {job_id}')
```

### PHP

```php
<?php
$data = [
    'topic' => 'My Research Topic',
    'language' => 'english',
    'pageCount' => 30
];

$ch = curl_init('http://localhost:3000/api/v1/workflow');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$result = json_decode($response, true);

echo 'Job ID: ' . $result['data']['jobId'];
?>
```

## 🎯 Common Use Cases

### 1. Generate Multiple Papers

```bash
# Create 3 papers with different topics
for topic in "Topic 1" "Topic 2" "Topic 3"; do
  curl -X POST http://localhost:3000/api/v1/workflow \
    -H "Content-Type: application/json" \
    -d "{\"topic\": \"$topic\", \"language\": \"uzbek\"}"
done
```

### 2. Check All Jobs

```bash
curl http://localhost:3000/api/v1/workflow
```

### 3. Get Queue Statistics

```bash
curl http://localhost:3000/api/v1/workflow/queue/stats
```

## ⚙️ Advanced Configuration

### Run on Different Port

```bash
API_PORT=8080 npm run api
```

### Enable Development Mode with Auto-Reload

```bash
npm run api:dev
```

### Production Mode

```bash
npm run api:prod
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
API_PORT=8080 npm run api
```

### OpenAI API Key Error

Make sure your `.env` file has a valid OpenAI API key:
```env
OPENAI_API_KEY=sk-...
```

### CORS Issues

Add your frontend URL to `.env`:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 📚 Next Steps

- Read the [full API documentation](./API_README.md)
- Check the [client examples](./examples/api-client-example.ts)
- Explore [Swagger UI](http://localhost:3000/docs/swagger) for interactive testing
- Set up webhooks for job completion notifications

## 🆘 Need Help?

- Check the [API_README.md](./API_README.md) for detailed documentation
- Visit http://localhost:3000/docs for interactive docs
- Open an issue on GitHub

---

**Happy paper generating! 📝✨**
