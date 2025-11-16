/**
 * Academic Paper Generator Workflow with Parallel Processing & Dynamic Page Management
 *
 * This workflow generates academic course papers with the following features:
 *
 * 1. PARALLEL RESEARCH: All sections across all chapters are researched simultaneously
 *    - Uses Promise.all() to research multiple sections concurrently
 *    - Significantly reduces research time for papers with many sections
 *
 * 2. PARALLEL CONTENT WRITING: All chapters and their sections are written in parallel
 *    - Theory, Analysis, and Improvement chapters process simultaneously
 *    - Within each chapter, all sections are also written in parallel
 *    - Double-level parallelization for maximum performance
 *
 * 3. DYNAMIC PAGE COUNT MANAGEMENT: Content length adapts to target page count
 *    - Automatically calculates pages per section based on total target pages
 *    - Introduction: ~5% of total pages
 *    - Main content: Distributed evenly across all sections
 *    - Conclusion: ~5% of total pages
 *    - Example: 50 pages → ~2-3 pages intro, ~40 pages content, ~2-3 pages conclusion
 *
 * 4. RICH CONTENT FORMATTING: Includes tables, formulas, and diagrams
 *    - Theory chapters: Mathematical formulas, definitions, comparative tables
 *    - Analysis chapters: Data tables, case studies, statistical information
 *    - Improvement chapters: Architecture diagrams, budget tables, timelines
 *
 * 5. QUALITY EVALUATION: Each section is evaluated and can be regenerated up to 2 times
 *
 * Based on Mastra AI workflow best practices for parallel execution
 * Reference: https://mastra.ai/docs/workflows/control-flow
 */

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { topicAgent } from "../agents/topic-agent";
import { plannerAgent } from "../agents/plannerAgent";
import { researchAgent } from "../agents/reaserachAgent";
import { introWriterAgent } from "../agents/introWriterAgent";
import { theoryWriterAgent } from "../agents/theoryWriterAgent";
import { analysisWriterAgent } from "../agents/analysisWriterAgent";
import { improvementWriterAgent } from "../agents/improvementWriterAgent";
import { conclusionWriterAgent } from "../agents/conclusionWriterAgent";
import { bibliographyWriterAgent } from "../agents/bibliographyWriterAgent";
import { generateWordDocument } from "../utils/wordDocumentGenerator";
import {
  evaluateIntroduction,
  evaluateChapterSection,
  evaluateConclusion,
  generateEvaluationReport,
  EvaluationResult,
} from "../utils/contentEvaluator";
import {
  calculatePageCount,
  generatePageCountReport,
  validatePageCount,
} from "../utils/pageCounter";

// Metadata schema for cover page - spread this into all step schemas
const metadataFields = {
  universityName: z.string().optional(),
  facultyName: z.string().optional(),
  departmentName: z.string().optional(),
  studentName: z.string().optional(),
  studentCourse: z.number().optional(),
  subjectName: z.string().optional(),
  advisorName: z.string().optional(),
};

// Helper to extract metadata from input
const extractMetadata = (inputData: any) => ({
  universityName: inputData.universityName,
  facultyName: inputData.facultyName,
  departmentName: inputData.departmentName,
  studentName: inputData.studentName,
  studentCourse: inputData.studentCourse,
  subjectName: inputData.subjectName,
  advisorName: inputData.advisorName,
});

const stepTopicName = createStep({
  id: "step-topic-name",
  description: "Prepare topic, language, page count and metadata",
  inputSchema: z.object({
    topic: z.string(),
    language: z.string(),
    pageCount: z.number().optional(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
  }),
  outputSchema: z.object({
    name: z.string(),
    language: z.string(),
    pageCount: z.number(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }
    return {
      name: inputData.topic,
      language: inputData.language,
      pageCount: inputData.pageCount || 30,
      universityName: inputData.universityName,
      facultyName: inputData.facultyName,
      departmentName: inputData.departmentName,
      studentName: inputData.studentName,
      studentCourse: inputData.studentCourse,
      subjectName: inputData.subjectName,
      advisorName: inputData.advisorName,
    };
  },
});

const plannerStep = createStep({
  id: "planner-step",
  description: "Plan the content",
  inputSchema: z.object({
    name: z.string(),
    language: z.string(),
    pageCount: z.number(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
  }),
  outputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    pageCount: z.number(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
          })
        ),
      })
    ),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }
    const prompt = `Create a detailed academic plan for the following topic in ${inputData.language} language:

Topic: ${inputData.name}

REQUIREMENTS:
- Create exactly 3 main chapters
- Each chapter should have 3-4 sections
- Follow academic standards

IMPORTANT RESTRICTIONS:
✗ DO NOT create sections named "Kirish" (Introduction)
✗ DO NOT create sections named "Xulosa" (Conclusion)
✗ DO NOT create sections named "Adabiyotlar" (References)
✗ These will be added separately

Structure the paper with meaningful section titles that cover the topic comprehensively.`;

    const plan = await plannerAgent.generate(
      [{ role: "user", content: prompt }],
      {
        structuredOutput: {
          schema: z.object({
            chapterTitle: z.string(),
            chapters: z.array(
              z.object({
                chapterTitle: z.string(),
                sections: z.array(
                  z.object({
                    title: z.string(),
                  })
                ),
              })
            ),
          }),
        },
      }
    );

    return {
      name: inputData.name,
      ...JSON.parse(plan.text),
      language: inputData.language,
      pageCount: inputData.pageCount,
      universityName: inputData.universityName,
      facultyName: inputData.facultyName,
      departmentName: inputData.departmentName,
      studentName: inputData.studentName,
      studentCourse: inputData.studentCourse,
      subjectName: inputData.subjectName,
      advisorName: inputData.advisorName,
    };
  },
});

const researchStep = createStep({
  id: "research-step",
  description: "Research the content in parallel for all sections",
  inputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    pageCount: z.number(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
          })
        ),
      })
    ),
  }),
  outputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    pageCount: z.number(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            researchedDatas: z.string(),
          })
        ),
      })
    ),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    console.log("\n" + "=".repeat(60));
    console.log("🔬 RESEARCHING ALL SECTIONS IN PARALLEL");
    console.log("=".repeat(60));

    const inputDatas: any = { ...inputData };

    // Process all chapters and their sections in parallel
    const allResearchPromises = inputData.chapters.flatMap(
      (chapter, chapterIndex) =>
        chapter.sections.map(async (section, sectionIndex) => {
          console.log(
            `📖 Researching: ${chapter.chapterTitle} - ${section.title}`
          );

          const sectionText = `Research this section in ${inputData.language} language:\n\nTitle: ${section.title}\n\nChapter: ${chapter.chapterTitle}`;
          const researchData = await researchAgent.generate([
            {
              role: "user",
              content: sectionText,
            },
          ]);

          return {
            chapterIndex,
            sectionIndex,
            researchedDatas: researchData.text,
          };
        })
    );

    // Wait for all research to complete
    const allResearchResults = await Promise.all(allResearchPromises);

    // Update the data structure with research results
    allResearchResults.forEach(
      ({ chapterIndex, sectionIndex, researchedDatas }) => {
        inputDatas.chapters[chapterIndex].sections[sectionIndex][
          "researchedDatas"
        ] = researchedDatas;
      }
    );

    console.log(
      `✅ All ${allResearchResults.length} sections researched in parallel!`
    );

    return inputDatas;
  },
});

const introStep = createStep({
  id: "intro-step",
  description: "Write the introduction with quality evaluation",
  inputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    pageCount: z.number(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            researchedDatas: z.string(),
          })
        ),
      })
    ),
  }),
  outputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    pageCount: z.number(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
    introduction: z.string(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            researchedDatas: z.string(),
          })
        ),
      })
    ),
    introductionEvaluation: z.object({
      passed: z.boolean(),
      score: z.number(),
      details: z.string(),
      attempts: z.number(),
    }),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    console.log("\n" + "=".repeat(60));
    console.log("✍️  WRITING INTRODUCTION");
    console.log("=".repeat(60));

    const inputDatas: any = inputData;
    let attempts = 0;
    let currentIntro = "";
    let evaluation: EvaluationResult | undefined;

    // Calculate target length for introduction (typically 1-2 pages)
    const introPages = Math.max(1, Math.ceil(inputData.pageCount * 0.05)); // 5% of total pages
    const introWords = introPages * 280;

    console.log(
      `📖 Introduction target: ~${introPages} pages (${introWords} words)`
    );

    // Try up to 3 times to get quality content
    while (attempts < 3) {
      attempts++;

      const prompt =
        attempts === 1
          ? `Write a comprehensive academic introduction (KIRISH) in ${inputData.language} language for this course paper:

PAPER STRUCTURE:
${JSON.stringify(
  {
    name: inputDatas.name,
    chapterTitle: inputDatas.chapterTitle,
    chapters: inputDatas.chapters.map((ch: any) => ({
      chapterTitle: ch.chapterTitle,
      sections: ch.sections.map((s: any) => s.title),
    })),
  },
  null,
  2
)}

CONTENT REQUIREMENTS:
- Target length: Approximately ${introWords} words (~${introPages} pages)
- Language: ${inputData.language}

CRITICAL STRUCTURE - The introduction MUST include these specific sections in order:

1. **Mavzuning dolzarbligi** (Relevance/Importance of the Topic) [30-35% of introduction]
   - Explain why this topic is important and relevant today
   - Provide multiple reasons (birinchidan, ikkinchidan, uchinchidan, to'rtinchidan...)
   - Connect the topic to current issues, practical needs, or scientific developments
   - Explain the significance for the field of study
   - Discuss contemporary relevance and modern applications

2. **Hisobotning maqsad va vazifalari** (Goals and Objectives of the Report) [25-30% of introduction]
   - Clearly state the main goal (maqsad) of the research
   - List specific objectives (vazifalar) as bullet points or numbered list
   - Each objective should be clear, specific, and measurable
   - Objectives should flow logically from the stated goal
   - Typically 5-7 specific objectives

3. **Hisobotning ilmiy yangiligi** (Scientific Novelty of the Report) [20-25% of introduction]
   - Explain what is new or original about this research
   - Describe unique contributions to the field
   - Highlight new methodologies, approaches, or perspectives
   - Explain how this work differs from previous research
   - Present as bullet points for clarity

4. **Hisobotning amaliy ahamiyati** (Practical Significance) [Optional, 10-15%]
   - Explain practical applications of the research
   - Describe how findings can be used in practice
   - Mention potential beneficiaries

5. **Hisobotning tuzilishi** (Structure of the Report) [10-15% of introduction]
   - Briefly outline the paper structure
   - Mention introduction, chapters, conclusion, bibliography
   - Give 1-2 sentence summary of each chapter's content

FORMATTING GUIDELINES:
✓ Use clear section headings for each part (Mavzuning dolzarbligi:, Hisobotning maqsad va vazifalari:, etc.)
✓ Use bullet points or numbered lists for objectives and novelty points
✓ Write in paragraphs within each section
✓ Maintain formal academic tone
✓ Use specific, concrete language (avoid vague terms)
✓ Provide sufficient detail for each section

ACADEMIC STANDARDS:
✓ Formal academic writing style
✓ Logical flow and coherent structure
✓ Neutral, objective tone
✓ Comprehensive coverage of all required sections
✓ Proper academic terminology
✓ Clear, well-organized presentation

Example structure (follow this format):

Mavzuning dolzarbligi: [Topic] masalasini o'rganish bir qator sabablarga ko'ra hozirgi kunda ham dolzarb ahamiyatga ega:
Birinchidan, ...
Ikkinchidan, ...
Uchinchidan, ...
To'rtinchidan, ...

Hisobotning maqsad va vazifalari: Mazkur hisobotning asosiy maqsadi ...
Ushbu maqsadga erishish uchun quyidagi vazifalar belgilandi:
- ...
- ...
- ...

Hisobotning ilmiy yangiligi: Mazkur hisobotning ilmiy yangiligi quyidagilarida namoyon bo'ladi:
- ...
- ...
- ...

Write a detailed, well-structured introduction of approximately ${introPages} pages following the exact structure above.`
          : `Rewrite and improve the academic introduction (KIRISH) in ${inputData.language} language:

PAPER: ${inputDatas.name}

PREVIOUS QUALITY SCORE: ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}%

IMPROVEMENT FEEDBACK:
${evaluation?.details ?? ""}

TARGET LENGTH: ${introWords} words (~${introPages} pages)

CRITICAL: Maintain the required structure with these sections:
1. Mavzuning dolzarbligi (Relevance/Importance of the Topic)
2. Hisobotning maqsad va vazifalari (Goals and Objectives of the Report)
3. Hisobotning ilmiy yangiligi (Scientific Novelty of the Report)
4. Hisobotning amaliy ahamiyati (Practical Significance) [Optional]
5. Hisobotning tuzilishi (Structure of the Report)

REQUIREMENTS:
- Use clear section headings (Mavzuning dolzarbligi:, Hisobotning maqsad va vazifalari:, etc.)
- Use numbered reasons for relevance (Birinchidan, Ikkinchidan, Uchinchidan...)
- List objectives as bullet points or numbered list
- List novelty points as bullet points
- Maintain formal academic tone

Address all feedback points above while following the exact structure required for academic introductions.`;

      const introduction = await introWriterAgent.generate([
        {
          role: "user",
          content: prompt,
        },
      ]);
      currentIntro = introduction.text;

      // Evaluate the introduction
      evaluation = await evaluateIntroduction(currentIntro, inputData.name);

      // If passed, we're done
      if (evaluation?.passed) {
        console.log(
          `✅ Introduction passed quality check on attempt ${attempts}! Score: ${((evaluation.overallScore ?? 0) * 100).toFixed(1)}%`
        );
        break;
      }

      // If not passed and we have retries left, continue
      if (attempts < 3) {
        console.log(
          `⚠️  Introduction quality: ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}% (below 80%)`
        );
        console.log(
          `🔄 Regenerating introduction (attempt ${attempts + 1})...`
        );
      } else {
        console.log(
          `⚠️  Introduction accepted after 3 attempts with score: ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}%`
        );
      }
    }

    inputDatas["introduction"] = currentIntro;
    inputDatas["introductionEvaluation"] = {
      passed: evaluation?.passed ?? false,
      score: evaluation?.overallScore ?? 0,
      details: evaluation?.details ?? "No evaluation performed",
      attempts,
    };

    return inputDatas;
  },
});

// Combined parallel chapters step - replaces theoryStep, AnalysisWritingStep, and ImprovementWriterAgent
const parallelChaptersStep = createStep({
  id: "parallel-chapters-step",
  description: "Write Theory, Analysis, and Improvement chapters in parallel",
  inputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    pageCount: z.number(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
    introduction: z.string(),
    introductionEvaluation: z.any().optional(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            researchedDatas: z.string(),
          })
        ),
      })
    ),
  }),
  outputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    pageCount: z.number(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
    introduction: z.string(),
    introductionEvaluation: z.any().optional(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
            researchedDatas: z.string(),
            evaluation: z.any().optional(),
          })
        ),
      })
    ),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    console.log("\n" + "=".repeat(60));
    console.log("⚡ WRITING ALL CHAPTERS AND SECTIONS IN PARALLEL");
    console.log("=".repeat(60));

    const inputDatas: any = { ...inputData };

    // Calculate pages per section based on total page count
    // Formula: (Target Pages - Cover - Intro - Conclusion - Bibliography) / Total Sections
    const totalSections = inputData.chapters.reduce(
      (sum: number, ch: any) => sum + ch.sections.length,
      0
    );
    const contentPages = inputData.pageCount - 5; // Reserve 5 pages for intro, conclusion, bibliography, cover
    const pagesPerSection = Math.max(
      1,
      Math.floor(contentPages / totalSections)
    );

    console.log(`📊 Target: ${inputData.pageCount} pages total`);
    console.log(
      `📄 Content pages: ${contentPages} | Sections: ${totalSections}`
    );
    console.log(`📖 Pages per section: ~${pagesPerSection} pages`);

    // Process all three chapters in parallel
    const chapterPromises = inputData.chapters.map(
      async (chapter, chapterIndex) => {
        const chapterType =
          chapterIndex === 0
            ? "THEORY"
            : chapterIndex === 1
              ? "ANALYSIS"
              : "IMPROVEMENT";
        const agent =
          chapterIndex === 0
            ? theoryWriterAgent
            : chapterIndex === 1
              ? analysisWriterAgent
              : improvementWriterAgent;

        console.log(
          `\n📚 Starting ${chapterType} Chapter: ${chapter.chapterTitle}`
        );

        // Process all sections in this chapter in parallel
        const sectionPromises = chapter.sections.map(
          async (section: any, sectionIndex: number) => {
            console.log(
              `\n📝 ${chapterType} - Section ${sectionIndex + 1}: ${section.title}`
            );

            let attempts = 0;
            let currentContent = "";
            let evaluation: EvaluationResult | undefined;

            // Calculate target word count (roughly 250-300 words per page)
            const targetWords = pagesPerSection * 280;

            // Determine content requirements based on chapter type
            const contentRequirements =
              chapterIndex === 0
                ? "Include theoretical foundations, definitions, formulas (using mathematical notation), comparative tables, conceptual diagrams, and scholarly references."
                : chapterIndex === 1
                  ? "Include data analysis, comparison tables, case studies, statistical information, charts descriptions, and evidence-based findings."
                  : "Include improvement proposals, architecture diagrams, implementation tables, technology specifications, budget tables, timeline charts, and practical recommendations.";

            // Try up to 2 times per section
            while (attempts < 2) {
              attempts++;

              const prompt =
                attempts === 1
                  ? `You are writing a section for an academic course paper. Write comprehensive ${chapterType.toLowerCase()} content in ${inputData.language} language.

SECTION TITLE: ${section.title}
CHAPTER: ${chapter.chapterTitle}

RESEARCH DATA:
${section.researchedDatas || "No research data available"}

CONTENT REQUIREMENTS:
- Target length: Approximately ${targetWords} words (~${pagesPerSection} pages)
- Language: ${inputData.language}
- ${contentRequirements}
- Include specific examples and detailed explanations
- Maintain academic writing standards

FORMATTING GUIDELINES:
✓ Use tables for comparing data, specifications, or features
✓ Include mathematical formulas where relevant (describe them clearly)
✓ Reference diagrams and figures (describe their content)
✓ Use bullet points and numbered lists for clarity
✓ Provide detailed explanations, not just brief summaries

IMPORTANT RESTRICTIONS:
✗ DO NOT include "Kirish" (Introduction) section
✗ DO NOT include "Xulosa" (Conclusion) section
✗ DO NOT include "Foydalanilgan adabiyotlar" (References)
✗ DO NOT say "I'm sorry" or refuse to write
✗ Write ONLY the main content for this specific section

Write the complete section content now in ${inputData.language} language with approximately ${targetWords} words:`
                  : `Rewrite and improve the ${chapterType.toLowerCase()} content in ${inputData.language} language:

SECTION TITLE: ${section.title}
CHAPTER: ${chapter.chapterTitle}

PREVIOUS QUALITY SCORE: ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}%

IMPROVEMENT FEEDBACK:
${evaluation?.details ?? ""}

TARGET LENGTH: ${targetWords} words (~${pagesPerSection} pages)

REQUIREMENTS:
- ${contentRequirements}
- Address all feedback points above
- Maintain comprehensive, detailed coverage
- Ensure high academic quality

IMPORTANT RESTRICTIONS:
✗ DO NOT include "Kirish" (Introduction) subsection
✗ DO NOT include "Xulosa" (Conclusion) subsection
✗ DO NOT include separate References section
✗ DO NOT refuse to write or say sorry
✗ Write ONLY the main section content

Write the improved section content now in ${inputData.language} language:`;

              const content = await agent.generate([
                {
                  role: "user",
                  content: prompt,
                },
              ]);
              currentContent = content.text;

              // Evaluate the section
              evaluation = await evaluateChapterSection(
                currentContent,
                section.title,
                chapter.chapterTitle
              );

              // If passed or last attempt, break
              if (evaluation?.passed || attempts >= 2) {
                if (evaluation?.passed) {
                  console.log(
                    `  ✅ ${chapterType} section ${sectionIndex + 1} passed (${((evaluation.overallScore ?? 0) * 100).toFixed(1)}%)`
                  );
                } else {
                  console.log(
                    `  ⚠️  ${chapterType} section ${sectionIndex + 1} quality: ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}% (accepting best attempt)`
                  );
                }
                break;
              }

              console.log(
                `  🔄 Regenerating ${chapterType} section ${sectionIndex + 1}...`
              );
            }

            return {
              ...section,
              content: currentContent,
              evaluation: {
                passed: evaluation?.passed ?? false,
                score: evaluation?.overallScore ?? 0,
                details: evaluation?.details ?? "No evaluation performed",
                attempts,
              },
            };
          }
        );

        // Wait for all sections in this chapter to complete
        const processedSections = await Promise.all(sectionPromises);

        console.log(
          `✅ ${chapterType} Chapter completed with ${processedSections.length} sections!`
        );
        return processedSections;
      }
    );

    // Wait for all chapters to complete
    const allProcessedSections = await Promise.all(chapterPromises);

    // Update chapters with processed sections
    inputDatas.chapters = inputData.chapters.map((chapter, index) => ({
      ...chapter,
      sections: allProcessedSections[index],
    }));

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL CHAPTERS AND SECTIONS COMPLETED IN PARALLEL");
    console.log("=".repeat(60));

    return inputDatas;
  },
});

const conclusionStep = createStep({
  id: "conclusion-step",
  description: "Write the conclusion with quality evaluation",
  inputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    pageCount: z.number(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
    introduction: z.string(),
    introductionEvaluation: z.any().optional(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
            researchedDatas: z.string(),
            evaluation: z.any().optional(),
          })
        ),
      })
    ),
  }),
  outputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    pageCount: z.number(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
    introduction: z.string(),
    introductionEvaluation: z.any().optional(),
    conclusion: z.string(),
    conclusionEvaluation: z.object({
      passed: z.boolean(),
      score: z.number(),
      details: z.string(),
      attempts: z.number(),
    }),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
            researchedDatas: z.string(),
            evaluation: z.any().optional(),
          })
        ),
      })
    ),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    console.log("\n" + "=".repeat(60));
    console.log("✍️  WRITING CONCLUSION");
    console.log("=".repeat(60));

    const inputDatas: any = inputData;
    let attempts = 0;
    let currentConclusion = "";
    let evaluation: EvaluationResult | undefined;

    // Calculate target length for conclusion (typically 1-2 pages)
    const conclusionPages = Math.max(1, Math.ceil(inputData.pageCount * 0.05)); // 5% of total pages
    const conclusionWords = conclusionPages * 280;

    console.log(
      `📖 Conclusion target: ~${conclusionPages} pages (${conclusionWords} words)`
    );

    // Create paper summary for evaluation context
    const paperSummary = `
      Topic: ${inputData.name}
      Introduction: ${inputData.introduction.substring(0, 500)}...
      Chapters: ${inputData.chapters.map((c: any) => c.chapterTitle).join(", ")}
    `;

    // Try up to 3 times to get quality content
    while (attempts < 3) {
      attempts++;

      const prompt =
        attempts === 1
          ? `Write a comprehensive academic conclusion (XULOSA) in ${inputData.language} language for this course paper:

PAPER INFORMATION:
Topic: ${inputData.name}
Chapters: ${inputData.chapters.map((c: any) => c.chapterTitle).join(", ")}

CONTENT REQUIREMENTS:
- Target length: Approximately ${conclusionWords} words (~${conclusionPages} pages)
- Language: ${inputData.language}

CRITICAL STRUCTURE - The conclusion MUST include these specific sections in order:

1. **Brief Research Summary** [15-20% of content]
   - Start with 1-2 paragraphs summarizing the research topic and objectives
   - Keep it brief and to the point

2. **Main Conclusions/Findings** [40-45% of content]
   - Start with: "Tadqiqot natijalariga ko'ra quyidagi xulosalarga kelindi:" or similar
   - List findings using numbered format (Birinchidan, Ikkinchidan, Uchinchidan, To'rtinchidan, ...)
   - Minimum 4-5 main conclusions
   - Each conclusion should be 2-3 sentences covering findings from all chapters
   - Cover Theory chapter findings, Analysis chapter findings, and Improvement proposals

3. **Practical Recommendations** [20-25% of content]
   - Start with: "Tadqiqot natijalari asosida quyidagi tavsiyalar berildi:"
   - List recommendations as bullet points with dashes (-)
   - 4-6 actionable and specific recommendations
   - Each recommendation should be clear and practical

4. **Future Research Directions** [Optional, 10-15% of content]
   - Start with: "Kelajakda quyidagi yo'nalishlarda tadqiqotlarni chuqurlashtirish tavsiya etiladi:"
   - List future directions as bullet points with dashes (-)
   - 3-4 directions for future research

5. **Final Statement** [5-10% of content]
   - 1-2 sentences summarizing overall significance
   - Forward-looking perspective

FORMATTING GUIDELINES:
✓ Use numbered format for main conclusions (Birinchidan, Ikkinchidan, Uchinchidan...)
✓ Use bullet points (-) for recommendations and future directions
✓ Each bullet point ends with semicolon (;) except the last one which ends with period (.)
✓ Maintain formal academic tone
✓ Cover findings from ALL chapters

Example structure:

Mazkur kurs ishi [topic] masalasini har tomonlama o'rganishga bag'ishlandi. Tadqiqot davomida...

Tadqiqot natijalariga ko'ra quyidagi xulosalarga kelindi:
Birinchidan, ...
Ikkinchidan, ...
Uchinchidan, ...
To'rtinchidan, ...

Tadqiqot natijalari asosida quyidagi tavsiyalar berildi:
- ...;
- ...;
- ...

Kelajakda quyidagi yo'nalishlarda tadqiqotlarni chuqurlashtirish tavsiya etiladi:
- ...;
- ...

Ushbu tadqiqot natijalari...

Write a detailed, well-structured conclusion of approximately ${conclusionPages} pages following the exact structure above.`
          : `Rewrite and improve the academic conclusion (XULOSA) in ${inputData.language} language:

PAPER: ${inputData.name}

PREVIOUS QUALITY SCORE: ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}%

IMPROVEMENT FEEDBACK:
${evaluation?.details ?? ""}

TARGET LENGTH: ${conclusionWords} words (~${conclusionPages} pages)

CRITICAL: Maintain the required structure with these sections:
1. Brief Research Summary (1-2 paragraphs)
2. Main Conclusions/Findings (numbered: Birinchidan, Ikkinchidan, Uchinchidan...)
3. Practical Recommendations (bullet points with -)
4. Future Research Directions (bullet points with -)
5. Final Statement

REQUIREMENTS:
- Use numbered format for main conclusions (Birinchidan, Ikkinchidan...)
- Use bullet points (-) for recommendations and future directions
- Each bullet ends with semicolon (;) except the last one with period (.)
- Cover findings from ALL chapters (Theory, Analysis, Improvement)
- Maintain formal academic tone

Address all feedback points above while following the exact structure required for academic conclusions.`;

      const conclusion = await conclusionWriterAgent.generate([
        {
          role: "user",
          content: prompt,
        },
      ]);
      currentConclusion = conclusion.text;

      // Evaluate the conclusion
      evaluation = await evaluateConclusion(currentConclusion, paperSummary);

      // If passed, we're done
      if (evaluation?.passed) {
        console.log(
          `✅ Conclusion passed quality check on attempt ${attempts}! Score: ${((evaluation.overallScore ?? 0) * 100).toFixed(1)}%`
        );
        break;
      }

      // If not passed and we have retries left, continue
      if (attempts < 3) {
        console.log(
          `⚠️  Conclusion quality: ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}% (below 80%)`
        );
        console.log(`🔄 Regenerating conclusion (attempt ${attempts + 1})...`);
      } else {
        console.log(
          `⚠️  Conclusion accepted after 3 attempts with score: ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}%`
        );
      }
    }

    inputDatas["conclusion"] = currentConclusion;
    inputDatas["conclusionEvaluation"] = {
      passed: evaluation?.passed ?? false,
      score: evaluation?.overallScore ?? 0,
      details: evaluation?.details ?? "No evaluation performed",
      attempts,
    };

    return inputDatas;
  },
});
const bibliographyStep = createStep({
  id: "bibliography-step",
  description: "Write the bibliography",
  inputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    pageCount: z.number(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
    introduction: z.string(),
    introductionEvaluation: z.any().optional(),
    conclusion: z.string(),
    conclusionEvaluation: z.any().optional(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
            researchedDatas: z.string(),
            evaluation: z.any().optional(),
          })
        ),
      })
    ),
  }),
  outputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    pageCount: z.number(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
    introduction: z.string(),
    introductionEvaluation: z.any().optional(),
    conclusion: z.string(),
    conclusionEvaluation: z.any().optional(),
    bibliography: z.string(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
            researchedDatas: z.string(),
            evaluation: z.any().optional(),
          })
        ),
      })
    ),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    console.log("\n" + "=".repeat(60));
    console.log("📚 WRITING BIBLIOGRAPHY");
    console.log("=".repeat(60));

    const inputDatas: any = inputData;
    const prompt = `Create a properly formatted bibliography in ${inputData.language} language based on the following course paper content:\n\n${JSON.stringify(inputDatas)}`;
    const bibliography = await bibliographyWriterAgent.generate([
      {
        role: "user",
        content: prompt,
      },
    ]);
    inputDatas["bibliography"] = bibliography.text;
    return inputDatas;
  },
});

const qualityReportStep = createStep({
  id: "quality-report-step",
  description: "Generate comprehensive quality evaluation report",
  inputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    pageCount: z.number(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
    introduction: z.string(),
    introductionEvaluation: z.any().optional(),
    conclusion: z.string(),
    conclusionEvaluation: z.any().optional(),
    bibliography: z.string(),
    chapters: z.any(),
  }),
  outputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    pageCount: z.number(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
    introduction: z.string(),
    introductionEvaluation: z.any().optional(),
    conclusion: z.string(),
    conclusionEvaluation: z.any().optional(),
    bibliography: z.string(),
    chapters: z.any(),
    qualityReport: z.string(),
  }),
  execute: async ({ inputData }) => {
    console.log("\n" + "=".repeat(60));
    console.log("📊 GENERATING QUALITY REPORT");
    console.log("=".repeat(60));

    const evaluationResults: { [key: string]: EvaluationResult } = {};

    // Add introduction evaluation
    if (inputData.introductionEvaluation) {
      evaluationResults["Introduction"] = {
        passed: inputData.introductionEvaluation.passed,
        overallScore: inputData.introductionEvaluation.score,
        metrics: {},
        details: inputData.introductionEvaluation.details,
        needsRetry: false,
      };
    }

    // Add chapter section evaluations
    inputData.chapters.forEach((chapter: any) => {
      chapter.sections.forEach((section: any) => {
        if (section.evaluation) {
          evaluationResults[`${chapter.chapterTitle} - ${section.title}`] = {
            passed: section.evaluation.passed,
            overallScore: section.evaluation.score,
            metrics: {},
            details: section.evaluation.details,
            needsRetry: false,
          };
        }
      });
    });

    // Add conclusion evaluation
    if (inputData.conclusionEvaluation) {
      evaluationResults["Conclusion"] = {
        passed: inputData.conclusionEvaluation.passed,
        overallScore: inputData.conclusionEvaluation.score,
        metrics: {},
        details: inputData.conclusionEvaluation.details,
        needsRetry: false,
      };
    }

    const report = generateEvaluationReport(evaluationResults);
    console.log(report);

    return {
      ...inputData,
      qualityReport: report,
    };
  },
});

const pageCountStep = createStep({
  id: "page-count-step",
  description: "Calculate and validate page count",
  inputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    pageCount: z.number(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
    introduction: z.string(),
    introductionEvaluation: z.any().optional(),
    conclusion: z.string(),
    conclusionEvaluation: z.any().optional(),
    bibliography: z.string(),
    qualityReport: z.string(),
    chapters: z.any(),
  }),
  outputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    pageCount: z.number(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
    introduction: z.string(),
    introductionEvaluation: z.any().optional(),
    conclusion: z.string(),
    conclusionEvaluation: z.any().optional(),
    bibliography: z.string(),
    qualityReport: z.string(),
    pageCountReport: z.string(),
    chapters: z.any(),
  }),
  execute: async ({ inputData }) => {
    console.log("\n" + "=".repeat(60));
    console.log("📊 CALCULATING PAGE COUNT");
    console.log("=".repeat(60));

    // Calculate page count
    const pageEstimate = calculatePageCount({
      introduction: inputData.introduction,
      conclusion: inputData.conclusion,
      chapters: inputData.chapters,
      targetPages: inputData.pageCount,
    });

    // Generate and display report
    const report = generatePageCountReport(pageEstimate);
    console.log(report);

    // Validate page count
    const validation = validatePageCount(pageEstimate);
    console.log(`\n${validation.valid ? "✅" : "⚠️ "} ${validation.message}\n`);

    return {
      ...inputData,
      pageCountReport: report,
    };
  },
});

const documentStep = createStep({
  id: "document-step",
  description: "Create Word document with professional academic formatting",
  inputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    introduction: z.string(),
    introductionEvaluation: z.any().optional(),
    conclusion: z.string(),
    conclusionEvaluation: z.any().optional(),
    bibliography: z.string(),
    qualityReport: z.string().optional(),
    pageCountReport: z.string().optional(),
    universityName: z.string().optional(),
    facultyName: z.string().optional(),
    departmentName: z.string().optional(),
    studentName: z.string().optional(),
    studentCourse: z.number().optional(),
    subjectName: z.string().optional(),
    advisorName: z.string().optional(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
            researchedDatas: z.string(),
            evaluation: z.any().optional(),
          })
        ),
      })
    ),
  }),
  outputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    introduction: z.string(),
    introductionEvaluation: z.any().optional(),
    conclusion: z.string(),
    conclusionEvaluation: z.any().optional(),
    bibliography: z.string(),
    qualityReport: z.string().optional(),
    document: z.string(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
            researchedDatas: z.string(),
            evaluation: z.any().optional(),
          })
        ),
      })
    ),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    try {
      console.log("📄 Starting Word document generation...");

      // Generate the Word document using our utility function
      const documentPath = await generateWordDocument({
        name: inputData.name,
        chapterTitle: inputData.chapterTitle,
        language: inputData.language,
        introduction: inputData.introduction,
        conclusion: inputData.conclusion,
        bibliography: inputData.bibliography,
        chapters: inputData.chapters,
        universityName: inputData.universityName,
        facultyName: inputData.facultyName,
        departmentName: inputData.departmentName,
        studentName: inputData.studentName,
        studentCourse: inputData.studentCourse,
        subjectName: inputData.subjectName,
        advisorName: inputData.advisorName,
      });

      console.log(`✅ Document successfully created at: ${documentPath}`);

      // Return the data with document path
      return {
        ...inputData,
        document: documentPath,
      };
    } catch (error) {
      console.error("❌ Error generating document:", error);
      throw new Error(
        `Failed to generate Word document: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
});
const writerWorkFlow = createWorkflow({
  id: "writer-work-flow",
  inputSchema: z.object({
    topic: z.string().describe("The topic of the course paper"),
    language: z
      .string()
      .describe(
        "The language for writing the course paper (e.g., 'uzbek', 'english', 'russian')"
      ),
    pageCount: z
      .number()
      .optional()
      .describe("Target page count for the paper (default: 30 pages)"),
    // Cover page metadata
    universityName: z
      .string()
      .optional()
      .describe("University name (default: O'ZBEKISTONDA MILLIY UNIVERSITETI)"),
    facultyName: z
      .string()
      .optional()
      .describe("Faculty name (default: Matematika fakulteti)"),
    departmentName: z
      .string()
      .optional()
      .describe("Department name (default: Amaliy matematika yo'nalishi)"),
    studentName: z.string().optional().describe("Student full name"),
    studentCourse: z
      .number()
      .optional()
      .describe("Student course year (default: 4)"),
    subjectName: z
      .string()
      .optional()
      .describe("Subject name (default: MATEMATIKA)"),
    advisorName: z.string().optional().describe("Scientific advisor name"),
  }),
  outputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    introduction: z.string(),
    introductionEvaluation: z.any().optional(),
    conclusion: z.string(),
    conclusionEvaluation: z.any().optional(),
    bibliography: z.string(),
    qualityReport: z.string().optional(),
    document: z.string(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
            researchedDatas: z.string(),
            evaluation: z.any().optional(),
          })
        ),
      })
    ),
  }),
})
  .then(stepTopicName)
  .then(plannerStep)
  .then(researchStep)
  .then(introStep)
  .then(parallelChaptersStep) // All chapters run in parallel now!
  .then(conclusionStep)
  .then(bibliographyStep)
  .then(qualityReportStep)
  .then(pageCountStep) // Check page count before generating document
  .then(documentStep);

writerWorkFlow.commit();
export { writerWorkFlow };
