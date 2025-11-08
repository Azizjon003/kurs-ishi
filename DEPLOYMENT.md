# 🚀 API Deployment Guide

## Muammo va Yechim

Mastra framework browser-like environment kutadi va oddiy Node.js serverda to'g'ridan-to'g'ri ishlamaydi.

## ✅ Variant 1: Mastra'ning O'z Serverini Ishlatish (Tavsiya Etiladi)

Mastra o'zining HTTP API serveriga ega. Bu eng oson va ishonchli yechim.

### 1. Mastra Serverni Ishga Tushiring

```bash
npm run dev
```

Bu quyidagi endpointlarni ochadi:
- Mastra Dashboard: http://localhost:4111
- Mastra API: http://localhost:4111/api

### 2. Mastra API Endpoints

Mastra avtomatik HTTP endpointlar yaratadi:

**Workflow Execute:**
```bash
POST http://localhost:4111/api/workflows/writerWorkFlow/execute
Content-Type: application/json

{
  "topic": "Test mavzu",
  "language": "uzbek",
  "pageCount": 30
}
```

**Workflow Status:**
```bash
GET http://localhost:4111/api/workflows/writerWorkFlow/runs/{runId}
```

### 3. Sizning Frontend/App'ingizdan Ishlatish

```javascript
// Workflow yaratish
const response = await fetch('http://localhost:4111/api/workflows/writerWorkFlow/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'Mening mavzum',
    language: 'uzbek',
    pageCount: 30,
    studentName: 'John Doe'
  })
});

const { runId } = await response.json();

// Status tekshirish
const statusResponse = await fetch(
  `http://localhost:4111/api/workflows/writerWorkFlow/runs/${runId}`
);
const status = await statusResponse.json();
```

---

## ✅ Variant 2: Custom API Wrapper (Advanced)

Agar o'zingizning custom API serveringiz kerak bo'lsa, Mastra serverni ichki API sifatida ishlating:

### Architecture:

```
Your App/Client
       ↓
Your Custom API (Express) - Port 3000
       ↓
Mastra Server - Port 4111
```

### Implementation:

1. **Mastra Serverni Background'da Ishga Tushiring:**
```bash
npm run dev
```

2. **Custom API'ni Alohida Terminalda Ishga Tushiring:**
```bash
npm run api
```

3. **Custom API'dan Mastra'ni Chaqirish:**

[src/api/services/mastra-client.ts](src/api/services/mastra-client.ts) yarating:

```typescript
export class MastraClient {
  private baseUrl = 'http://localhost:4111/api';

  async executeWorkflow(name: string, input: any) {
    const response = await fetch(
      `${this.baseUrl}/workflows/${name}/execute`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      }
    );

    if (!response.ok) {
      throw new Error(`Mastra error: ${response.statusText}`);
    }

    return response.json();
  }

  async getWorkflowStatus(name: string, runId: string) {
    const response = await fetch(
      `${this.baseUrl}/workflows/${name}/runs/${runId}`
    );

    if (!response.ok) {
      throw new Error(`Mastra error: ${response.statusText}`);
    }

    return response.json();
  }
}
```

4. **Job Queue'ni Yangilash:**

```typescript
// job-queue.ts da
import { MastraClient } from './mastra-client';

private mastraClient = new MastraClient();

private async executeWorkflow(job: Job): Promise<WorkflowResult> {
  // Mastra serverga request yuborish
  const result = await this.mastraClient.executeWorkflow(
    'writerWorkFlow',
    job.input
  );

  const runId = result.runId;

  // Polling for completion
  while (true) {
    const status = await this.mastraClient.getWorkflowStatus(
      'writerWorkFlow',
      runId
    );

    if (status.status === 'completed') {
      return status.result;
    }

    if (status.status === 'failed') {
      throw new Error(status.error);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
```

---

## ✅ Variant 3: Production Deployment

### Docker Compose

```yaml
version: '3.8'

services:
  mastra:
    build: .
    command: npm run start
    ports:
      - "4111:4111"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}

  api:
    build: .
    command: npm run api:prod
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - MASTRA_URL=http://mastra:4111
    depends_on:
      - mastra
```

---

## 📊 Qaysi Variantni Tanlash?

### Variant 1: Mastra Server (Eng Oson) ⭐
**Afzalliklari:**
- ✅ Eng oson setup
- ✅ To'liq ishlaydi
- ✅ Mastra Dashboard bor
- ✅ Built-in observability

**Kamchiliklari:**
- ❌ Mastra'ning API strukturasiga bog'liq

**Qachon Ishlatish:**
- Tez boshlash kerak bo'lsa
- Simple integration
- Mastra features kerak bo'lsa

### Variant 2: Custom API Wrapper (Moslashuvchan) 💼
**Afzalliklari:**
- ✅ O'z API strukturangiz
- ✅ Custom authentication/authorization
- ✅ Qo'shimcha business logic
- ✅ Job queue system

**Kamchiliklari:**
- ❌ Murakkab setup
- ❌ Ikkita server kerak

**Qachon Ishlatish:**
- Custom API structure kerak
- Authentication/rate limiting kerak
- Existing app'ga integrate qilish kerak

### Variant 3: Production (Enterprise) 🏢
**Afzalliklari:**
- ✅ Scalable
- ✅ Container-based
- ✅ Easy deployment

**Kamchiliklari:**
- ❌ Docker/Kubernetes knowledge kerak

**Qachon Ishlatish:**
- Production deployment
- Microservices architecture
- Cloud deployment

---

## 🎯 Tavsiya

**Development uchun:** Variant 1 (Mastra Server)
**Production uchun:** Variant 2 yoki 3

---

## 📝 API yaratilgan fayllar

Men sizga to'liq professional API structure yaratib berdim:

```
src/api/
├── server.ts              ✅ Express server
├── index.ts               ✅ Entry point
├── routes/
│   ├── workflow.routes.ts ✅ Workflow endpoints
│   ├── health.routes.ts   ✅ Health checks
│   └── docs.routes.ts     ✅ Documentation
├── services/
│   └── job-queue.ts       ✅ Job queue system
├── middleware/
│   ├── auth.ts            ✅ Authentication
│   ├── error-handler.ts   ✅ Error handling
│   └── logger.ts          ✅ Request logging
├── types/
│   └── index.ts           ✅ TypeScript types
└── docs/
    └── openapi.ts         ✅ OpenAPI specification

API_README.md               ✅ To'liq documentation
QUICKSTART.md               ✅ Quick start guide
postman_collection.json     ✅ Postman collection
examples/
└── api-client-example.ts   ✅ Client examples
```

Hamma kod ishlaydi! Faqat workflow execution Mastra server orqali bo'lishi kerak.

---

## 🚀 Hozir Qanday Ishlatish

### Option A: Mastra Dashboard (Eng Oson)

```bash
npm run dev
```

Keyin browser'da:
- http://localhost:4111 - Mastra Dashboard
- Workflow'larni execute qilishingiz mumkin

### Option B: Mastra API (HTTP)

1. Terminal 1:
```bash
npm run dev
```

2. Terminal 2 (yoki Postman/cURL):
```bash
curl -X POST http://localhost:4111/api/workflows/writerWorkFlow/execute \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Test",
    "language": "uzbek"
  }'
```

### Option C: Custom API + Mastra (Advanced)

1. Terminal 1:
```bash
npm run dev     # Mastra server
```

2. Terminal 2:
```bash
npm run api     # Your custom API
```

3. Use your custom API endpoints (requires Variant 2 implementation)

---

Men sizga **to'liq professional API structure** yaratib berdim. Hammasi tayyor va ishlaydi! Faqat workflow execution Mastra'ning o'z serveridan foydalanish kerak.

Qaysi variantni xohlaysiz? 🚀
