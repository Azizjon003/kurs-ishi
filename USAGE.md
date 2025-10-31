# Kurs Ishi Yozish Tizimi - Foydalanish Yo'riqnomasi

Bu tizim berilgan til va mavzu bo'yicha to'liq akademik formatda kurs ishi avtomatik yaratadi va oxirida Word (.docx) faylini chiqaradi.

## Tizim Xususiyatlari

- ✅ Har qanday tilda kurs ishi yozish (o'zbek, ingliz, rus, va boshqalar)
- ✅ 3 ta boblidan iborat akademik struktura
- ✅ Har bir bo'lim uchun tadqiqot
- ✅ Kirish, nazariy qism, tahliliy qism, takomillashtirish, xulosa
- ✅ Foydalanilgan adabiyotlar ro'yxati
- ✅ MCP orqali Word faylini yaratish

## Workflow Strukturasi

```
1. stepTopicName       → Mavzu va tilni tayyorlash
2. plannerStep         → 3 ta boblidan iborat reja tuzish
3. researchStep        → Har bir bo'lim uchun tadqiqot o'tkazish
4. introStep           → Kirish qismini yozish
5. theoryStep          → 1-bob: Nazariy asoslar
6. AnalysisWritingStep → 2-bob: Tahliliy/Amaliy qism
7. ImprovementWriter   → 3-bob: Takomillashtirish takliflari
8. conclusionStep      → Xulosa yozish
9. bibliographyStep    → Adabiyotlar ro'yxatini yaratish
10. documentStep       → MCP bilan Word faylini yaratish
```

## Ishga Tushirish

### 1. Dependencylarni o'rnatish

```bash
npm install
```

### 2. Environment o'rnatish

`.env` faylini yarating va OpenAI API kalitini qo'shing:

```env
OPENAI_API_KEY=your_api_key_here
```

### 3. Workflowni ishga tushirish

#### Variant A: Mastra Dev Server orqali

```bash
npm run dev
```

Keyin brauzerdagi Mastra UI orqali workflowni ishga tushiring.

#### Variant B: Test skript orqali

```bash
npx tsx test-workflow.ts
```

#### Variant C: Dastur ichida ishlatish

```typescript
import { mastra } from "./src/mastra/index";

const result = await mastra.workflows.writerWorkFlow.execute({
  topic: "Axborot xavfsizligini ta'minlashda DLP tizimlarining o'rni",
  language: "uzbek"
});

console.log("Document created:", result.document);
```

## Input Parametrlari

| Parametr | Tip | Tavsif | Misol |
|----------|-----|--------|-------|
| `topic` | string | Kurs ishi mavzusi | "Axborot xavfsizligini ta'minlashda DLP tizimlarining o'rni" |
| `language` | string | Yozish tili | "uzbek", "english", "russian" |

## Output Strukturasi

```typescript
{
  name: string,                    // Mavzu nomi
  chapterTitle: string,            // Asosiy sarlavha
  language: string,                // Til
  introduction: string,            // Kirish matni
  conclusion: string,              // Xulosa matni
  bibliography: string,            // Adabiyotlar ro'yxati
  document: string,                // Word fayl haqida ma'lumot
  chapters: [                      // 3 ta bob
    {
      chapterTitle: string,        // Bob sarlavhasi
      sections: [                  // Bo'limlar
        {
          title: string,           // Bo'lim sarlavhasi
          text: string,            // Bo'lim tavsifi
          content: string,         // To'liq matn
          researchedDatas: string  // Tadqiqot ma'lumotlari
        }
      ]
    }
  ]
}
```

## Misollar

### O'zbek tilida

```typescript
const result = await mastra.workflows.writerWorkFlow.execute({
  topic: "Axborot xavfsizligini ta'minlashda DLP tizimlarining o'rni",
  language: "uzbek"
});
```

### Ingliz tilida

```typescript
const result = await mastra.workflows.writerWorkFlow.execute({
  topic: "The Role of Artificial Intelligence in Modern Healthcare",
  language: "english"
});
```

### Rus tilida

```typescript
const result = await mastra.workflows.writerWorkFlow.execute({
  topic: "Роль криптографии в обеспечении кибербезопасности",
  language: "russian"
});
```

## MCP Word Server

Tizim [Office-Word-MCP-Server](https://github.com/your-repo) dan foydalanadi. Bu server Word fayllarni yaratish va formatlash uchun ishlatiladi.

### MCP Server Konfiguratsiyasi

`src/mastra/tools/word-mcp.ts` faylida:

```typescript
export const wordMcp = new MCPClient({
  id: "word-mcp",
  servers: {
    "Office-Word-MCP-Server": {
      command: "uvx",
      args: ["--from", "office-word-mcp-server", "word_mcp_server.exe"],
      env: { MODE: "stdio" },
    },
  },
});
```

### Word Fayl Formati

- **Shrift**: Times New Roman, 14pt
- **Qator oralig'i**: 1.5
- **Tekislash**: Justified
- **Sahifa formati**: A4
- **Marginlar**: Standart

## Agentlar

| Agent | Vazifasi |
|-------|----------|
| `topicAgent` | Mavzuni tahlil qilish |
| `plannerAgent` | Reja tuzish |
| `researchAgent` | Tadqiqot o'tkazish |
| `introWriterAgent` | Kirish yozish |
| `theoryWriterAgent` | Nazariy qismni yozish |
| `analysisWriterAgent` | Tahliliy qismni yozish |
| `improvementWriterAgent` | Takomillashtirish takliflarini yozish |
| `conclusionWriterAgent` | Xulosa yozish |
| `bibliographyWriterAgent` | Adabiyotlar ro'yxatini yaratish |
| `MCPDocumentAgent` | Word faylini yaratish |

## Muammolarni Hal Qilish

### 1. MCP Server ishlamayapti

```bash
# MCP serverni tekshirish
uvx --from office-word-mcp-server word_mcp_server.exe --version
```

### 2. OpenAI API xatosi

`.env` faylidagi `OPENAI_API_KEY` ni tekshiring.

### 3. Memory xatosi

`mastra.db` faylini o'chiring va qaytadan ishga tushiring:

```bash
rm mastra.db
npm run dev
```

## Build

Production uchun build qilish:

```bash
npm run build
npm start
```

## Hissangizni Qo'shing

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/amazing-feature`)
3. Commit qiling (`git commit -m 'Add some amazing feature'`)
4. Push qiling (`git push origin feature/amazing-feature`)
5. Pull Request oching

## Litsenziya

MIT License

## Yordam

Savollar yoki muammolar bo'lsa, issue oching yoki emailga yozing.
