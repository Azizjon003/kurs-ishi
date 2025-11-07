# Agent'lar Uchun Yo'riqnoma - Jadval, Rasm va Formula Yozish

## 📊 Jadval (Table) Yaratish

### Markdown Jadval Formati

Agent'lar markdown table formatida yozishi kerak. Word generator avtomatik professional jadvallarga aylantiradi.

**Format:**
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### Jadval Qachon Ishlatiladi

1. **Taqqosiy Tahlil** (Comparison Analysis)
2. **Statistik Ma'lumotlar** (Statistical Data)
3. **Texnik Xususiyatlar** (Technical Specifications)
4. **Mahsulot/Yechim Taqqoslash** (Product/Solution Comparison)

### Misol: Taqqosiy Tahlil Jadvali

```markdown
DLP yechimlarining taqqosiy tahlili quyidagi jadvalda keltirilgan:

| Yechim | Narx (yiliga) | Market Share | Asosiy Xususiyatlar | Kamchiliklar |
|--------|---------------|--------------|---------------------|--------------|
| Symantec DLP | $150-200/endpoint | 24% | Network, endpoint, cloud qo'llab-quvvatlash; 300+ fayl turi; Advanced content detection | Murakkab konfiguratsiya; yuqori narx |
| McAfee TotalProtection | $180-220/endpoint | 19% | Cloud-native arxitektura; AWS, Azure integratsiya; ML classification | Resource-intensive; false positive 20-25% |
| Forcepoint DLP | $140-170/endpoint | 15% | User behavior analytics; Insider threat detection; Psychological profiling | Limited cloud support; agent overhead |
```

**Natija:** Bu matn avtomatik professional jadvallarga aylanadi Word hujjatida!

## 🖼️ Diagram/Rasm Tavsifi

### Diagram Marker Format

Agent diagram/arxitektura tavsifini quyidagi formatda yozadi:

```markdown
[DIAGRAM: Diagram tavsifi bu yerda]
```

### Diagram Turlari

1. **Arxitektura Diagrammalari** - Tizim arxitekturasi
2. **Flowchart'lar** - Jarayon oqimi
3. **ER Diagrammalar** - Ma'lumotlar bazasi
4. **Network Topology** - Tarmoq tuzilishi
5. **UML Diagrammalar** - OOP dizayn

### Misol: Arxitektura Diagramma

```markdown
Taklif etilayotgan arxitektura 5 qatlamdan iborat:

[DIAGRAM: 5-qatlamli arxitektura diagrammasi. Eng pastda Data Collection Layer (Apache Kafka 3.6, 3-node cluster, 100K queries/sec). Ikkinchi qatlamda Analysis Layer (Python 3.11 microservices, TensorFlow 2.15 LSTM, 30-50ms latency, 6 pods parallel processing). Uchinchi qatlamda Decision Layer (Spring Boot 3.2, business rules engine, 50K decisions/sec). To'rtinchi qatlamda Enforcement Layer (ModSecurity 3.x WAF, RESTful API, 200ms blocking time). Eng yuqorida Management Layer (React 18.x dashboard, PostgreSQL 16 policy storage, Elasticsearch 8.11 logs, Redis 7.2 caching). Qatlamlar orasida ok'lar ma'lumot oqimini ko'rsatadi: TCP 9092 (Kafka), HTTP REST (services orasida), WebSocket (real-time dashboard).]

Har bir qatlam o'zining vazifasini bajaradi...
```

**Natija:**
- Diagram tavsifi border bilan ajratilgan placeholder sifatida ko'rinadi
- Professional formatlangan
- Aniq va batafsil tavsif

## 🔢 Formula/Tenglamalar

### Formula Marker Format

```markdown
[FORMULA: formula matni]
```

### Formula Misollari

#### 1. Matematik Formula

```markdown
False positive rate'ni quyidagi formula bilan hisoblaymiz:

[FORMULA: FPR = FP / (FP + TN) × 100%]

Bu yerda FP - false positive soni, TN - true negative soni.
```

#### 2. Statistik Formula

```markdown
ROI hisoblash formulasi:

[FORMULA: ROI = ((Foyda - Xarajat) / Xarajat) × 100%]

3 yillik ROI: ((2,840,000 - 580,000) / 580,000) × 100% = 389.7%
```

#### 3. Algoritmik Ifodalash

```markdown
Query tahlil vaqti:

[FORMULA: T_total = T_kafka + T_analysis + T_decision + T_enforcement]

[FORMULA: T_total ≤ 100ms (95th percentile)]
```

## 📝 Domain-Specific Yozish

### 1. Texnologiya Nomlash

**HAR DOIM** version raqamlarini ko'rsating:

✅ **TO'G'RI:**
- Python 3.11
- TensorFlow 2.15
- PostgreSQL 16
- Apache Kafka 3.6
- Spring Boot 3.2
- React 18.x
- Redis 7.2

❌ **NOTO'G'RI:**
- Python
- TensorFlow
- Database
- Message queue
- Backend framework

### 2. Performance Metrics

**HAR DOIM** aniq raqamlar bilan:

✅ **TO'G'RI:**
- 100,000 queries/second
- <50ms latency
- 95% detection accuracy
- 99.99% availability
- $150-200 per endpoint/year

❌ **NOTO'G'RI:**
- High throughput
- Low latency
- Good accuracy
- Highly available
- Affordable pricing

### 3. Real Organizations/Products

**HAR DOIM** real nom va ma'lumotlar:

✅ **TO'G'RI:**
- Symantec DLP (24% market share, $150-200/endpoint)
- Equifax data breach 2017 (106M records)
- Capital One breach 2019 ($270M cost)
- NIST SP 800-53 Rev. 5
- ISO/IEC 27001:2013

❌ **NOTO'G'RI:**
- A popular DLP solution
- A major company breach
- A recent incident
- Industry standard
- Common framework

### 4. Soha bo'yicha Terminologiya

#### IT Security sohasida:

```markdown
SQL Injection hujumlarining tasnifi:

| Turi | Tavsif | Misol | Zarar darajasi |
|------|---------|-------|----------------|
| Classic SQL Injection | Direct query manipulation | ' OR '1'='1 | Yuqori |
| Blind SQL Injection | Boolean-based inference | ' AND 1=1-- | O'rtacha |
| Time-based Blind | Delay-based detection | ' AND SLEEP(5)-- | O'rtacha |
| Union-based | UNION operator abuse | ' UNION SELECT * FROM users-- | Yuqori |
| Error-based | Database error exploitation | ' AND 1=CONVERT(int, @@version)-- | O'rtacha |
```

#### Data Science sohasida:

```markdown
ML model performance ko'rsatkichlari:

| Metrika | Qiymat | Izoh |
|---------|--------|------|
| Accuracy | 96.2% | Overall to'g'ri bashorat |
| Precision | 94.8% | Positive bashoratlarda to'g'rilik |
| Recall | 97.1% | Haqiqiy positive'larni topish |
| F1 Score | 95.9% | Precision va Recall balansi |
| AUC-ROC | 0.98 | Classification sifati |
| Training time | 48 hours | 4x NVIDIA A100 GPU |
```

#### Business/Finance sohasida:

```markdown
3 yillik moliyaviy prognoz:

| Yil | Xarajat | Foyda | Net ROI | Cumulative ROI |
|-----|---------|-------|---------|----------------|
| Yil 1 | $580,000 | $975,000 | 68.1% | 68.1% |
| Yil 2 | $120,000 | $1,072,500 | 793.8% | 253.0% |
| Yil 3 | $120,000 | $1,179,750 | 883.1% | 389.7% |
```

## 🎯 Agent'lar Uchun Amaliy Ko'rsatmalar

### Theory Writer Agent

```markdown
MAVZU: DLP tizimlarining asosiy arxitekturasi

DLP tizimlarining uch qatlamli arxitekturasi quyidagicha tashkil etilgan:

[DIAGRAM: DLP uch qatlamli arxitekturasi. Birinchi qatlamda Data Discovery Layer (file repositories scanning, 100GB/hour per agent, 500+ predefined templates, content-aware pattern matching). Ikkinchi qatlamda Policy Engine Layer (rule definitions, 300+ out-of-box policies, custom policy builder, policy versioning, audit trail). Uchinchi qatlamda Enforcement Layer (block/allow decisions, logging, alerting, quarantine, encryption). Qatlamlar TLS 1.3 encrypted channels orqali bog'langan. Markaziy Management Server RESTful API orqali boshqaradi.]

Har bir qatlamning vazifalari:

1. **Data Discovery Layer** - Ma'lumotlar repositoriyalarini skanerlash
   - Scanning tezligi: 100GB/hour per agent
   - Qo'llab-quvvatlanadigan formatlar: 500+ (Office, PDF, images, archives)
   - Pattern matching: Regex, keywords, ML-based classification

2. **Policy Engine Layer** - Qoidalar boshqaruvi
   - 300+ tayyor shablon (GDPR, PCI DSS, HIPAA)
   - Custom policy builder
   - Real-time policy updates (5 minutes sync interval)

3. **Enforcement Layer** - Qoidalarni bajarish
   - Decision types: Block, Allow, Encrypt, Quarantine
   - Response time: <2ms latency
   - Integration: DLP agents at endpoints and network sensors

Qatlamlar orasidagi aloqa xavfsiz TLS 1.3 shifrlangan kanallar orqali amalga oshiriladi.
```

### Analysis Writer Agent

```markdown
MAVZU: DLP yechimlarining taqqosiy tahlili

Bozordagi yetakchi DLP yechimlarini taqqoslash:

| Vendor | Deployment | Pricing | Performance | Market Share | Key Features |
|--------|------------|---------|-------------|--------------|--------------|
| Symantec DLP | On-premise, Hybrid | $150-200/endpoint/year | 300+ file types; 2-3ms latency | 24% | Advanced content-aware; Extensive policy templates; 24/7 support |
| McAfee Total Protection | Cloud-native, On-premise | $180-220/endpoint/year | 2-3M events/sec; ML classification | 19% | Strong cloud integration; Zero-trust architecture; Auto-remediation |
| Forcepoint DLP | On-premise | $140-170/endpoint/year | User risk scoring; Behavioral analytics | 15% | Insider threat focus; Psychological profiling; Context-aware policies |
| Digital Guardian | Endpoint-focused | $160-190/endpoint/year | Deep visibility; Forensic analysis | 12% | Managed services option; No network sensors needed; Cloud-ready |
| Proofpoint DLP | Cloud-first | $12-15/user/month | Email/cloud focus; API integration | 8% | Email DLP leader; SaaS app coverage; Quick deployment (1-2 weeks) |

**Tahlil xulosasi:**

Bozor lideri Symantec DLP (24% share) keng qamrov va kuchli texnik qo'llab-quvvatlash bilan ajralib turadi. McAfee cloud-native yondashuvda kuchli (19% share), ML-based classification'ga e'tibor beradi. Forcepoint insider threat detection'da ixtisoslashgan (15% share).

Narx jihatidan Forcepoint eng arzon ($140-170), McAfee eng qimmat ($180-220). Cloud deployment uchun Proofpoint optimal ($12-15/user/month).

Performance bo'yicha McAfee eng yuqori throughput ko'rsatadi (2-3M events/sec), Symantec esa eng ko'p fayl turini qo'llab-quvvatlaydi (300+).
```

### Improvement Writer Agent

```markdown
MAVZU: ML-based SQL Injection detection tizimini joriy etish

**3.2 Texnik Arxitektura va Dizayn**

Taklif etilayotgan gibrid SQL Injection himoya tizimi quyidagi arxitekturada qurilgan:

[DIAGRAM: 5-qatlamli ML-based SQL Injection detection arxitekturasi. Layer 1 - Data Collection: Web application servers (Apache Tomcat 10.x) → Query agents (Node.js 20.x, <1ms overhead) → Kafka topics (16 partitions, 100K queries/sec throughput). Layer 2 - ML Analysis: 6 Python 3.11 microservice pods → TensorFlow 2.15 LSTM models (3-layer, 256 hidden units, 0.96 F1-score) → 30-50ms inference time. Layer 3 - Decision Engine: Spring Boot 3.2 → Rule engine (50K decisions/sec) → Confidence scoring (0-100). Layer 4 - Enforcement: ModSecurity 3.x WAF → Block/Allow decisions → <200ms enforcement. Layer 5 - Management: React 18.x dashboard → PostgreSQL 16 policies → Elasticsearch 8.11 logs → Redis 7.2 cache. Arrows show data flow with protocols (TCP 9092, HTTP REST, WebSocket).]

**Texnologiya Tanlash Asoslari:**

| Komponent | Texnologiya | Versiya | Sabab | Performance |
|-----------|-------------|---------|-------|-------------|
| Message Queue | Apache Kafka | 3.6 | High throughput, distributed, fault-tolerant | 100K+ queries/sec, <5ms latency |
| ML Framework | TensorFlow | 2.15 | Production-proven, GPU support, extensive library | 30-50ms inference, 96% accuracy |
| Microservices | Python | 3.11 | ML ecosystem, async support, rapid development | 15K queries/sec per pod |
| Decision Engine | Spring Boot | 3.2 | Enterprise-grade, robust, scalable | 50K decisions/sec |
| WAF | ModSecurity | 3.x | Open-source, OWASP CRS, customizable | <2ms decision time |
| Database | PostgreSQL | 16 | ACID compliance, JSON support, reliability | 10K writes/sec |
| Search Engine | Elasticsearch | 8.11 | Full-text search, real-time, scalable | 2-sec queries on 30-day logs |
| Cache | Redis | 7.2 | In-memory, sub-millisecond latency, pub/sub | <1ms lookups |

**Performance Taxminlari:**

Query Processing latency:

[FORMULA: T_total = T_kafka + T_analysis + T_decision + T_enforcement]

[FORMULA: T_total = 2ms + 45ms + 8ms + 200ms = 255ms]

95th percentile uchun:

[FORMULA: T_95 = 2ms + 50ms + 10ms + 200ms = 262ms]

Target: <300ms (user experience uchun qabul qilinadigan).

**Budget va Timeline:**

| Phase | Duration | Team | Cost | Deliverables |
|-------|----------|------|------|--------------|
| Phase 1: Preparation | 3-4 weeks | 6 FTE | $65K-80K | Architecture docs, environment setup |
| Phase 2: Development | 6-8 weeks | 6 FTE | $180K-230K | Trained ML model, integrated services |
| Phase 3: Pilot | 4 weeks | 4 FTE | $75K-95K | Staging deployment, tuning |
| Phase 4: Rollout | 6-8 weeks | 3 FTE | $90K-120K | Production deployment, training |
| Phase 5: Post-impl | Ongoing | 2 FTE | $40K-55K | Maintenance, monitoring |
| **TOTAL** | **19-24 weeks** | **-** | **$450K-580K** | **Production system** |
```

## ✅ Tekshirish Ro'yxati (Checklist)

Agent yozayotganda:

### Jadvallar uchun:
- [ ] Markdown table formatida yozilganmi?
- [ ] Barcha ustunlar nomlanganmi?
- [ ] Ma'lumotlar to'liqmi?
- [ ] 3+ qator bormi?
- [ ] Har bir cell ma'lumotlimi?

### Diagrammalar uchun:
- [ ] [DIAGRAM: ...] marker ishlatilganmi?
- [ ] Batafsil tavsif yozilganmi?
- [ ] Qatlamlar/komponentlar ko'rsatilganmi?
- [ ] Ma'lumot oqimi tushuntirilganmi?
- [ ] Texnologiya versiyalari ko'rsatilganmi?

### Formulalar uchun:
- [ ] [FORMULA: ...] marker ishlatilganmi?
- [ ] Formula aniq yozilganmi?
- [ ] O'zgaruvchilar tushuntirilganmi?
- [ ] Hisoblash misoli berilganmi?

### Domain-Specific uchun:
- [ ] Texnologiya versiyalari ko'rsatilganmi?
- [ ] Performance metrics aniq raqamlarmi?
- [ ] Real kompaniya/mahsulot nomlari ishlatilganmi?
- [ ] Statistik ma'lumotlar haqiqiyymi?
- [ ] Manba (source) ko'rsatilganmi?

---

**ESLATMA:** Bu formatlar avtomatik Word hujjatda professional jadvaller, diagram placeholder'lar va formula displaylariga aylanadi!
