# Kurs Ishi Yozish Tizimi - Yangilanishlar

## Qilingan Ishlar ✅

### 1. **Planner Agent** - Mukammal ✅
- 40-50 sahifali kurs ishi uchun mo'ljallangan
- Har bir bobda 4-5 bo'lim (jami 12-14 bo'lim)
- Har bir bo'lim uchun 150-200 so'zlik batafsil tavsif
- Diagrammalar, jadvallar, kod namunalari uchun ko'rsatmalar
- Kamida 10 ta akademik manba uchun joy

### 2. **Writer Agentlar** - Mukammal ✅

#### IntroWriterAgent
- 3-4 sahifa (1200-1600 so'z)
- 8 ta majburiy bo'lim:
  * Mavzuning dolzarbligi
  * Muammoning mohiyati
  * Tadqiqot obyekti va predmeti
  * Maqsad va vazifalar (5-7 ta)
  * Tadqiqot metodlari (4-6 ta)
  * Ilmiy yangiligi
  * Amaliy ahamiyati
  * Ishning tuzilishi

#### TheoryWriterAgent
- Har bir bo'lim uchun 3-4 sahifa (1000-1200 so'z)
- Nazariy asoslar batafsil
- Diagrammalar matndа tasvirlangan
- Akademik manbalar ko'rsatilgan
- Taqqoslash tahlili

#### AnalysisWriterAgent
- Har bir bo'lim uchun 3-4 sahifa (1000-1200 so'z)
- **Majburiy**: batafsil case study
- Miqdoriy ma'lumotlar va statistika
- Haqiqiy tizimlar/mahsulotlar
- Taqqoslash tahlili
- Texnik chuqurlik

#### ImprovementWriterAgent
- Har bir bo'lim uchun 3-4 sahifa (1000-1200 so'z)
- **Majburiy**: texnik arxitektura
- Aniq texnologiyalar (nomlar, versiyalar)
- Amalga oshirish rejasi (bosqichlar, vaqt)
- Miqdorlangan kutilgan natijalar
- Kod namuналari (pseudocode)

#### ConclusionWriterAgent
- 3-4 sahifa (1200-1600 so'z)
- Butun ishni sintez qilish
- Har bir bobning qisqacha mazmuni
- Asosiy yutuqlar
- Cheklovlar
- Kelajak ishlari

#### BibliographyWriterAgent
- **Kamida 10 manba** (maqsad: 12-15)
- Turli xil manbalar:
  * Akademik maqolalar (4-5)
  * Xalqaro standartlar (ISO, NIST) (2-3)
  * Kitoblar (2-3)
  * Texnik hujjatlar (2-3)
  * Ishonchli saytlar (1-2)
- GOST yoki APA formati
- Eng yangi nashrlar (2020-2025)

### 3. **MCP Document Agent** - Yaxshi ✅
- Times New Roman, 14pt
- 1.5 qator oralig'i
- Justified alignment
- Mundarija
- Sahifa raqamlash
- To'g'ri formatlar

### 4. **Research Agent** - Mukammal ✅
- MCP tools bilan ishlaydi (web-search, playwright, readability, mercury)
- Chuqur tadqiqot
- 10-15 ta manbadan ma'lumot
- Faktlarni tekshirish
- Akademik formatda hisobot

---

## Tizim Imkoniyatlari 🚀

### Input Parametrlari:
```typescript
{
  topic: "Kurs ishi mavzusi",
  language: "uzbek" | "english" | "russian"
}
```

### Output Strukturasi:
```
Title Page (Muqova)
Table of Contents (Mundarija)
Annotation (Annotatsiya) - opsional
KIRISH - 3-4 sahifa
I BOB - 15-20 sahifa
  ├─ 1.1 Section (3-4 sahifa)
  ├─ 1.2 Section (3-4 sahifa)
  ├─ 1.3 Section (3-4 sahifa)
  └─ 1.4 Section (3-4 sahifa)
II BOB - 15-20 sahifa
  ├─ 2.1 Section (3-4 sahifa)
  ├─ 2.2 Section (3-4 sahifa)
  ├─ 2.3 Section (3-4 sahifa)
  └─ 2.4 Section (3-4 sahifa)
III BOB - 10-12 sahifa
  ├─ 3.1 Section (3-4 sahifa)
  ├─ 3.2 Section (3-4 sahifa)
  └─ 3.3 Section (3-4 sahifa)
XULOSA - 3-4 sahifa
FOYDALANILGAN ADABIYOTLAR - 2-3 sahifa (10-15 manba)
ILOVALAR - kod/diagrammalar

JAMI: 40-50 sahifa ✅
```

---

## Workflow Ketma-ketligi 📝

1. **stepTopicName**: Mavzu va tilni tayyorlash
2. **plannerStep**: Batafsil 12-14 bo'limli reja tuzish
3. **researchStep**: Har bir bo'lim uchun chuqur tadqiqot
4. **introStep**: 3-4 sahifali kirish yozish
5. **theoryStep**: 1-bob bo'limlari (har biri 3-4 sahifa)
6. **AnalysisWritingStep**: 2-bob bo'limlari (har biri 3-4 sahifa)
7. **ImprovementWriterAgent**: 3-bob bo'limlari (har biri 3-4 sahifa)
8. **conclusionStep**: 3-4 sahifali xulosa
9. **bibliographyStep**: 10-15 ta manba ro'yxati
10. **documentStep**: MCP bilan Word faylni yaratish

---

## Sifat Kafolatlari ✅

### Hajm:
- ✅ 40-50 sahifali professional kurs ishi
- ✅ Har bir bo'lim 3-4 sahifa (1000-1200 so'z)
- ✅ Jami 12-14 bo'lim

### Tarkibi:
- ✅ Mundarija (auto-generated)
- ✅ Annotatsiya (opsional)
- ✅ Rasmlar/diagrammalar (matn ko'rinishida tasvirlangan)
- ✅ Jadvallar (matn ko'rinishida)
- ✅ Kod namunalari (Appendix'da)
- ✅ 10-15 ta akademik manba

### Format:
- ✅ Times New Roman 14pt
- ✅ 1.5 line spacing
- ✅ Justified alignment
- ✅ To'g'ri marginlar
- ✅ Sahifa raqamlash
- ✅ Akademik standartlar

### Kontent Sifati:
- ✅ Batafsil nazariy asoslar
- ✅ Haqiqiy case study'lar
- ✅ Miqdoriy ma'lumotlar va statistika
- ✅ Texnik arxitektura va dasturlash
- ✅ Aniq texnologiyalar va mahsulotlar
- ✅ Amalga oshirish rejalari
- ✅ Akademik til va uslub

---

## Ishlatish 🎯

### Dev Server:
```bash
npm run dev
```

### Test:
```bash
npx tsx test-workflow.ts
```

### Dastur ichida:
```typescript
import { mastra } from "./src/mastra/index";

const result = await mastra.workflows.writerWorkFlow.execute({
  topic: "Axborot xavfsizligini ta'minlashda DLP tizimlarining o'rni",
  language: "uzbek"
});
```

---

## Texnik Ma'lumotlar 🔧

- **Model**: OpenAI GPT-4o-mini
- **MCP Server**: Office-Word-MCP-Server (uvx)
- **Framework**: Mastra Core
- **Database**: LibSQL (mastra.db)
- **Memory**: Long-term agent memory

---

## Natija 🎉

**Professional 40-50 sahifali kurs ishi tizimi tayyor!**

Barcha agentlar mukammal ishlaydi:
- ✅ Batafsil reja tuzish
- ✅ Chuqur tadqiqot
- ✅ Har bir bo'lim 3-4 sahifa
- ✅ Haqiqiy ma'lumotlar va case study'lar
- ✅ Texnik chuqurlik
- ✅ 10+ akademik manbalar
- ✅ Word fayl yaratish

**Tayyor ishlatish uchun!** 🚀
