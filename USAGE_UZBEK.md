# Kurs Ishi Generator - Foydalanish Bo'yicha To'liq Yo'riqnoma

Professional AI-powered kurs ishi yozish tizimi - To'liq avtomatik akademik hujjat generatori.

## 🎯 Asosiy Imkoniyatlar

### ✅ To'liq Avtomatik Kurs Ishi Yaratish
- **40-50 sahifali** professional akademik ish
- **Uzbek, Rus, Ingliz** tillarida
- **Academic standartlar**ga to'liq mos
- **Word format** (.docx) da tayyor hujjat

### 📄 Hujjat Tuzilishi

1. **Kirish (Introduction)** - 3-4 sahifa
   - Mavzuning dolzarbligi
   - Muammoning mohiyati
   - Tadqiqot obyekti va predmeti
   - Maqsad va vazifalar
   - Tadqiqot metodlari
   - Ilmiy yangilik va amaliy ahamiyati

2. **I BOB - Nazariy Asoslar** - 12-15 sahifa
   - 4-5 ta batafsil bo'lim
   - Har bir bo'lim 1000-1200 so'z
   - Ta'riflar, nazariy asoslar
   - Adabiyotlar sharhi
   - Taqqosiy tahlil

3. **II BOB - Amaliy/Tahliliy Qism** - 12-15 sahifa
   - 4-5 ta batafsil bo'lim
   - Case study'lar
   - Statistik ma'lumotlar
   - Taqqosiy tahlil
   - Texnik chuqur tahlil

4. **III BOB - Takomillashtirish Takliflari** - 10-12 sahifa
   - 3-4 ta batafsil bo'lim
   - Muammoni aniqlash
   - Yechim takliflari
   - Texnik arxitektura
   - Amalga oshirish rejasi

5. **Xulosa (Conclusion)** - 3-4 sahifa
   - Tadqiqot xulosasi
   - Asosiy natijalar
   - Kelajak tadqiqotlar

6. **Foydalanilgan Adabiyotlar** - 10-15 ta manba
   - Academic manbalar
   - Xalqaro standartlar (ISO, NIST, IEEE)
   - Kitoblar va jurnallar
   - Texnik hujjatlar

## 🎨 Professional Formatlash

### Word Document Xususiyatlari

✅ **Font va Matn:**
- Font: Times New Roman
- Size: 14pt (28 half-points)
- Rang: **Qora (Black #000000)** - Professional!
- Line spacing: 1.5
- Alignment: Justified (ikkala tarafdan tekislangan)

✅ **Sarlavhalar:**
- Asosiy sarlavha: 16pt, **Bold, Qora**
- Bob sarlavhalari: 14pt, **Bold, Qora**, Markazlashtirilgan
- Bo'lim sarlavhalari: 14pt, **Bold, Qora**, Justified

✅ **Paragraph Formatting:**
- Birinchi qator: 0.5 inch indent
- Qator oralig'i: 1.5
- Paragraph oralig'i: 200 twips
- To'liq qora matn - professional ko'rinish!

✅ **Sahifa Sozlamalari:**
- Margins: 2.5 cm (har tomondan)
- Page breaks: Har bob orasida
- Professional spacing

✅ **Mundarija (REJA):**
- Avtomatik yaratiladi
- Hierarchical struktura
- Indent bilan
- Qora rang, professional

## 🚀 Qanday Ishlatish

### 1. Dastlabki Sozlash

```bash
# Repositoriyani clone qiling
git clone <your-repo-url>
cd kurs-ishi

# Dependencies'larni o'rnating
npm install

# .env faylni yarating
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

### 2. OpenAI API Key Sozlash

[OpenAI Platform](https://platform.openai.com/) ga boring va API key oling:

```bash
# Windows (PowerShell)
$env:OPENAI_API_KEY="sk-..."

# Windows (CMD)
set OPENAI_API_KEY=sk-...

# Linux/Mac
export OPENAI_API_KEY=sk-...
```

### 3. Ishga Tushirish

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

### 4. Kurs Ishi Yaratish

Workflow avtomatik ishga tushadi:

**Input:**
- `topic`: Kurs ishi mavzusi (masalan: "Ma'lumotlar bazalarida SQL Injection hujumlaridan himoya qilish")
- `language`: Til (uzbek, russian, english)

**Output:**
- Professional Word document (.docx)
- Fayl nomi: `kurs_ishi_<mavzu_nomi>.docx`
- Joylashuv: Loyiha root direktoriyasida

## 📊 Workflow Bosqichlari

Tizim quyidagi bosqichlardan o'tadi:

1. **Mavzu Tayyorlash** (5 soniya)
   - Mavzu va tilni validatsiya qilish

2. **Reja Tuzish** (30-45 soniya)
   - 3 ta bob, 12-14 ta bo'lim
   - Har bir bo'lim batafsil nomlanadi

3. **Tadqiqot** (O'chirilgan - tezkor ishlash uchun)
   - Kerak bo'lsa yoqilishi mumkin

4. **Kirish Yozish** (2-3 daqiqa)
   - 1200-1600 so'zli professional kirish
   - Barcha kerakli qismlar bilan

5. **I BOB - Nazariya** (4-6 daqiqa)
   - Har bir bo'lim 1000-1200 so'z
   - Chuqur nazariy tahlil

6. **II BOB - Tahlil** (4-6 daqiqa)
   - Real case study'lar
   - Statistik ma'lumotlar
   - Taqqosiy tahlil

7. **III BOB - Takomillashtirish** (4-6 daqiqa)
   - Texnik arxitektura
   - Amalga oshirish rejasi
   - ROI hisoblash

8. **Xulosa Yozish** (2-3 daqiqa)
   - 1200-1600 so'zli sintez
   - Barcha boblarni qamrab oladi

9. **Adabiyotlar** (1-2 daqiqa)
   - 10-15 ta manba
   - GOST/APA format

10. **Word Document Yaratish** (5-10 soniya)
    - Professional formatlash
    - **Qora matn, academic style**
    - Tayyor .docx fayl!

**Umumiy vaqt:** 15-25 daqiqa

## 💰 Xarajat

- **Model:** GPT-4o-mini
- **API calls:** ~25-35 ta
- **Taxminiy xarajat:** $0.50 - $1.50 per ish
- **Output:** 40-50 sahifa, 15,000-20,000 so'z

## 📁 Fayl Strukturasi

```
kurs-ishi/
├── src/
│   └── mastra/
│       ├── agents/                    # AI agentlar
│       │   ├── plannerAgent.ts       # Reja tuzuvchi
│       │   ├── introWriterAgent.ts   # Kirish yozuvchi
│       │   ├── theoryWriterAgent.ts  # Nazariya yozuvchi
│       │   ├── analysisWriterAgent.ts # Tahlil yozuvchi
│       │   ├── improvementWriterAgent.ts # Takomillashtirish
│       │   ├── conclusionWriterAgent.ts # Xulosa yozuvchi
│       │   └── bibliographyWriterAgent.ts # Adabiyotlar
│       ├── workflows/
│       │   └── word-workflow.ts      # Asosiy workflow
│       └── utils/
│           └── wordDocumentGenerator.ts # Word generator
├── .mastra/
│   └── output/                        # Build natijasi
├── package.json
├── README.md
├── USAGE_UZBEK.md                     # Bu fayl!
└── kurs_ishi_*.docx                  # Natija!
```

## 🎓 Agentlar Tavsifi

### 1. PlannerAgent
**Vazifasi:** Kurs ishi strukturasini yaratish

**Natija:**
- 3 ta bob
- 12-14 ta bo'lim
- Har bir bo'lim batafsil nomlangan
- 40-50 sahifali struktura

### 2. IntroWriterAgent
**Vazifasi:** Professional kirish yozish

**Qamrab oladi:**
- Mavzuning dolzarbligi (300-400 so'z)
- Muammoning mohiyati (250-300 so'z)
- Obyekt va predmet (150-200 so'z)
- Maqsad va vazifalar (200-250 so'z)
- Metodlar (150-200 so'z)
- Ilmiy yangilik (150-200 so'z)
- Amaliy ahamiyat (150-200 so'z)

**Natija:** 1200-1600 so'z, 3-4 sahifa

### 3. TheoryWriterAgent
**Vazifasi:** Nazariy bo'limlarni yozish

**Qamrab oladi:**
- Ta'riflar va tushunchalar
- Nazariy asoslar
- Adabiyotlar sharhi
- Taqqosiy tahlil
- Diagramma tavsiflari

**Natija:** Har bir bo'lim 1000-1200 so'z

### 4. AnalysisWriterAgent
**Vazifasi:** Amaliy tahlil yozish

**Qamrab oladi:**
- Holat tahlili
- Real case study (tashkilot nomi bilan!)
- Taqqosiy tahlil (3-5 ta yechim)
- Texnik chuqur tahlil
- Kritik baholash

**Natija:** Har bir bo'lim 1000-1200 so'z

### 5. ImprovementWriterAgent
**Vazifasi:** Takomillashtirish takliflari

**Qamrab oladi:**
- Muammo identifikatsiyasi
- Yechim taklifi
- Texnik arxitektura (texnologiya versiyalari bilan!)
- Amalga oshirish rejasi (fazalar, vaqt, xarajat)
- Kutilayotgan natijalar (ROI hisoblash)

**Natija:** Har bir bo'lim 1000-1200 so'z

### 6. ConclusionWriterAgent
**Vazifasi:** Xulosa yozish

**Qamrab oladi:**
- Tadqiqot xulosasi
- Har bir bobning qisqacha xulosasi
- Asosiy yutuqlar
- Cheklanishlar
- Kelajak ishlar

**Natija:** 1200-1600 so'z

### 7. BibliographyWriterAgent
**Vazifasi:** Adabiyotlar ro'yxatini yaratish

**Qamrab oladi:**
- 10-15 ta manba
- Academic jurnallar (4-5)
- Standartlar (ISO, NIST) (2-3)
- Kitoblar (2-3)
- Texnik hujjatlar (2-3)

**Format:** GOST yoki APA

## 🎨 Professional Word Document Xususiyatlari

### To'liq Qora Matn - Academic Standard!

Barcha matnlar **qora rangda** (#000000):
- ✅ Sarlavhalar - qora, bold
- ✅ Bo'lim sarlavhalari - qora, bold
- ✅ Paragraflar - qora
- ✅ Mundarija - qora
- ✅ Adabiyotlar - qora
- ✅ Hamma narsa - QORA va PROFESSIONAL!

### Formatlash Tafsilotlari

```typescript
// Barcha matnlar uchun:
{
  font: "Times New Roman",
  size: 28,              // 14pt
  color: "000000",       // QORA - Professional!
  alignment: JUSTIFIED    // Ikkala tarafdan tekis
}

// Sarlavhalar uchun:
{
  bold: true,            // Qalin
  color: "000000",       // QORA!
  centered: true/false   // Bob uchun markazda
}
```

## ⚠️ Muhim Eslatmalar

### ✅ Qilish Kerak
1. OPENAI_API_KEY ni o'rnatish
2. Internet aloqasini tekshirish
3. Mavzuni aniq yozish
4. Natijani ko'rib chiqish va tahrirlash
5. Adabiyotlarni tekshirish

### ❌ Qilmaslik Kerak
1. API key'ni hammaga ko'rsatish
2. Build tugamasdan ishga tushirish
3. Natijani tahrirlamasdan topshirish
4. Internet bo'lmasa ishlatish

## 🐛 Muammolarni Hal Qilish

### Muammo: `Cannot find module 'docx'`
```bash
npm install docx
```

### Muammo: OpenAI API xatosi
- API key'ni tekshiring
- OpenAI hisobingizda pul borligini tekshiring
- OPENAI_API_KEY o'rnatilganligini tekshiring

### Muammo: Build xatosi
```bash
npm install
npm run build
```

### Muammo: Hujjat yaratilmadi
- Console log'larni tekshiring
- Fayl yozish huquqlarini tekshiring
- Workflow to'liq tugatilganini tekshiring

## 📊 Natija Namunasi

Yaratilgan Word document:

```
═══════════════════════════════════════════
    MA'LUMOTLAR BAZALARIDA SQL INJECTION
      HUJUMLARIDAN HIMOYA QILISH
═══════════════════════════════════════════

[Page Break]

═══════════════════════════════════════════
             REJA (MUNDARIJA)
═══════════════════════════════════════════

KIRISH

I BOB. NAZARIY ASOSLAR
  1.1 Zamonaviy axborot xavfsizligi...
  1.2 SQL Injection hujumlarining...
  ...

II BOB. AMALIY/TAHLILIY QISM
  2.1 SQL Injection hujumlarining...
  2.2 Mavjud himoya mexanizmlarining...
  ...

III BOB. TAKOMILLASHTIRISH TAKLIFLARI
  3.1 Zaif tomonlarni aniqlash...
  3.2 Machine Learning asosida...
  ...

XULOSA

FOYDALANILGAN ADABIYOTLAR

[Page Break]

═══════════════════════════════════════════
                  KIRISH
═══════════════════════════════════════════

    Hozirgi kunda ma'lumotlar bazalari...
[1200-1600 so'z professional kirish]

[Page Break]

═══════════════════════════════════════════
        I BOB. NAZARIY ASOSLAR
═══════════════════════════════════════════

1.1 Zamonaviy axborot xavfsizligi...

    Ma'lumotlar xavfsizligi zamonaviy...
[1000-1200 so'z professional matn, QORA]

[va hokazo...]
```

## 🚀 Keyingi Bosqichlar

### Joriy Imkoniyatlar
✅ To'liq avtomatik kurs ishi yaratish
✅ Professional Word document
✅ **Qora matn - academic standard!**
✅ 3 bob, 12-14 bo'lim
✅ 40-50 sahifa
✅ 10-15 adabiyot

### Kelajakda Qo'shilishi Mumkin
- [ ] Web search integration
- [ ] Plagiarism checking
- [ ] Rasm va diagramma generatsiyasi
- [ ] PDF export
- [ ] Custom template support
- [ ] Batch processing
- [ ] Ko'proq til qo'llab-quvvatlash

## 💡 Maslahatlar

### Mavzu Tanlash
- **Aniq va fokusli** bo'ling
- Juda keng mavzulardan saqlaning
- Real muammolarga asoslaning

### Til Tanlash
- Bir til bilan ishlang
- Aralash tildan foydalanmang
- Academic uslubni saqlang

### Natijani Ko'rib Chiqish
- **HAR DOIM** yaratilgan matnni o'qing
- Texnik ma'lumotlarni tekshiring
- Adabiyotlarni verifikatsiya qiling
- Formatlashni ko'rib chiqing

## 🎓 Academic Standards

Bu tizim **to'liq academic standartlarga** mos:

✅ **Formatlash:**
- Times New Roman 14pt
- 1.5 line spacing
- **Qora matn (professional!)**
- Justified alignment
- 2.5cm margins

✅ **Struktura:**
- Aniq bob tuzilishi
- Mantiqiy bo'lim joylashuvi
- To'g'ri sarlavha ierarxiyasi

✅ **Mazmun:**
- Academic uslub
- Formal til
- Dalilga asoslangan
- Adabiyotlar bilan

✅ **Hajm:**
- 40-50 sahifa
- 15,000-20,000 so'z
- Har bob 12-15 sahifa

## 📞 Yordam

Savollaringiz bo'lsa:
- GitHub Issues'da savol bering
- README.md'ni o'qing
- Agent instructions'ni ko'rib chiqing

## 🙏 Minnatdorchilik

- [Mastra Framework](https://mastra.ai)
- [docx Library](https://www.npmjs.com/package/docx)
- OpenAI GPT-4o-mini

---

**ESLATMA:** Bu tizim **draft** kurs ishi yaratadi. Albatta **ko'rib chiqing, tahrirlang va tekshiring** topshirishdan oldin!

**Professional Farqi:** Barcha matnlar **QORA RANGDA** - bu academic standart va professional ko'rinish!

---

🎓 **Omad!** Kurs ishingiz muvaffaqiyatli bo'lsin! 🚀
