import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import {
  evaluateIntroduction,
  evaluateChapterSection,
  evaluateConclusion,
  generateEvaluationReport,
  EvaluationResult,
} from "../utils/contentEvaluator";
import { introWriterAgent } from "../agents/introWriterAgent";
import { theoryWriterAgent } from "../agents/theoryWriterAgent";
import { analysisWriterAgent } from "../agents/analysisWriterAgent";
import { improvementWriterAgent } from "../agents/improvementWriterAgent";
import { conclusionWriterAgent } from "../agents/conclusionWriterAgent";

/**
 * Step to evaluate and optionally improve introduction
 */
const evaluateIntroStep = createStep({
  id: "evaluate-intro-step",
  description: "Evaluate introduction quality",
  inputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    introduction: z.string(),
    chapters: z.any(),
  }),
  outputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    introduction: z.string(),
    chapters: z.any(),
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
    console.log("🔍 EVALUATING INTRODUCTION QUALITY");
    console.log("=".repeat(60));

    let attempts = 0;
    let currentIntro = inputData.introduction;
    let evaluation: EvaluationResult;

    // Try up to 3 times to get quality content
    while (attempts < 3) {
      attempts++;

      // Evaluate current content
      evaluation = await evaluateIntroduction(currentIntro, inputData.name);

      // If passed, we're done
      if (evaluation.passed) {
        console.log(
          `✅ Introduction passed quality check on attempt ${attempts}!`
        );
        break;
      }

      // If not passed and we have retries left, regenerate
      if (attempts < 3) {
        console.log(
          `⚠️ Introduction quality: ${(evaluation.overallScore * 100).toFixed(1)}% (below 80%)`
        );
        console.log(`🔄 Regenerating introduction (attempt ${attempts + 1})...`);

        const prompt = `Write an academic introduction in ${inputData.language} language for the following course paper structure:\n\n${JSON.stringify({ name: inputData.name, chapterTitle: inputData.chapterTitle })}\n\nIMPORTANT: Ensure high quality, comprehensive coverage, neutral tone, and accurate information. Previous attempt scored ${(evaluation.overallScore * 100).toFixed(1)}%. Improve based on feedback: ${evaluation.details}`;

        const newIntro = await introWriterAgent.generate([
          {
            role: "user",
            content: prompt,
          },
        ]);

        currentIntro = newIntro.text;
      }
    }

    return {
      ...inputData,
      introduction: currentIntro,
      introductionEvaluation: {
        passed: evaluation!.passed,
        score: evaluation!.overallScore,
        details: evaluation!.details,
        attempts,
      },
    };
  },
});

/**
 * Step to evaluate all chapter sections
 */
const evaluateChaptersStep = createStep({
  id: "evaluate-chapters-step",
  description: "Evaluate all chapter sections quality",
  inputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    introduction: z.string(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
            researchedDatas: z.string().optional(),
          })
        ),
      })
    ),
    introductionEvaluation: z.any().optional(),
  }),
  outputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    introduction: z.string(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
            researchedDatas: z.string().optional(),
            evaluation: z
              .object({
                passed: z.boolean(),
                score: z.number(),
                details: z.string(),
                attempts: z.number(),
              })
              .optional(),
          })
        ),
      })
    ),
    introductionEvaluation: z.any().optional(),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    console.log("\n" + "=".repeat(60));
    console.log("🔍 EVALUATING CHAPTER SECTIONS QUALITY");
    console.log("=".repeat(60));

    const evaluatedChapters = await Promise.all(
      inputData.chapters.map(async (chapter, chapterIndex) => {
        console.log(`\nEvaluating ${chapter.chapterTitle}...`);

        const evaluatedSections = await Promise.all(
          chapter.sections.map(async (section, sectionIndex) => {
            console.log(`  Evaluating ${section.title}...`);

            let attempts = 0;
            let currentContent = section.content;
            let evaluation: EvaluationResult;

            // Try up to 2 times (limit to save time)
            while (attempts < 2) {
              attempts++;

              // Evaluate current content
              evaluation = await evaluateChapterSection(
                currentContent,
                section.title,
                chapter.chapterTitle
              );

              // If passed or last attempt, break
              if (evaluation.passed || attempts >= 2) {
                if (evaluation.passed) {
                  console.log(
                    `    ✅ Section passed (${(evaluation.overallScore * 100).toFixed(1)}%)`
                  );
                } else {
                  console.log(
                    `    ⚠️ Section quality: ${(evaluation.overallScore * 100).toFixed(1)}% (accepting best attempt)`
                  );
                }
                break;
              }

              // Regenerate if needed
              console.log(`    🔄 Regenerating section...`);

              const chapterAgents = [
                theoryWriterAgent,
                analysisWriterAgent,
                improvementWriterAgent,
              ];
              const agent = chapterAgents[chapterIndex] || theoryWriterAgent;

              const prompt = `Write content in ${inputData.language} language for this section:\n\n${JSON.stringify(section)}\n\nIMPORTANT: Previous attempt scored ${(evaluation.overallScore * 100).toFixed(1)}%. Improve: ${evaluation.details}`;

              const newContent = await agent.generate([
                {
                  role: "user",
                  content: prompt,
                },
              ]);

              currentContent = newContent.text;
            }

            return {
              ...section,
              content: currentContent,
              evaluation: {
                passed: evaluation!.passed,
                score: evaluation!.overallScore,
                details: evaluation!.details,
                attempts,
              },
            };
          })
        );

        return {
          ...chapter,
          sections: evaluatedSections,
        };
      })
    );

    return {
      ...inputData,
      chapters: evaluatedChapters,
    };
  },
});

/**
 * Step to evaluate conclusion
 */
const evaluateConclusionStep = createStep({
  id: "evaluate-conclusion-step",
  description: "Evaluate conclusion quality",
  inputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    introduction: z.string(),
    conclusion: z.string(),
    chapters: z.any(),
    introductionEvaluation: z.any().optional(),
  }),
  outputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    introduction: z.string(),
    conclusion: z.string(),
    chapters: z.any(),
    introductionEvaluation: z.any().optional(),
    conclusionEvaluation: z.object({
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
    console.log("🔍 EVALUATING CONCLUSION QUALITY");
    console.log("=".repeat(60));

    let attempts = 0;
    let currentConclusion = inputData.conclusion;
    let evaluation: EvaluationResult;

    // Create paper summary for evaluation context
    const paperSummary = `
      Topic: ${inputData.name}
      Introduction: ${inputData.introduction.substring(0, 500)}...
      Chapters: ${inputData.chapters.map((c: any) => c.chapterTitle).join(", ")}
    `;

    // Try up to 3 times
    while (attempts < 3) {
      attempts++;

      // Evaluate current content
      evaluation = await evaluateConclusion(currentConclusion, paperSummary);

      // If passed, we're done
      if (evaluation.passed) {
        console.log(
          `✅ Conclusion passed quality check on attempt ${attempts}!`
        );
        break;
      }

      // Regenerate if needed
      if (attempts < 3) {
        console.log(
          `⚠️ Conclusion quality: ${(evaluation.overallScore * 100).toFixed(1)}%`
        );
        console.log(`🔄 Regenerating conclusion...`);

        const prompt = `Write an academic conclusion in ${inputData.language} language based on the following course paper content:\n\n${JSON.stringify({ name: inputData.name, chapters: inputData.chapters.map((c: any) => c.chapterTitle) })}\n\nIMPORTANT: Previous attempt scored ${(evaluation.overallScore * 100).toFixed(1)}%. Improve: ${evaluation.details}`;

        const newConclusion = await conclusionWriterAgent.generate([
          {
            role: "user",
            content: prompt,
          },
        ]);

        currentConclusion = newConclusion.text;
      }
    }

    return {
      ...inputData,
      conclusion: currentConclusion,
      conclusionEvaluation: {
        passed: evaluation!.passed,
        score: evaluation!.overallScore,
        details: evaluation!.details,
        attempts,
      },
    };
  },
});

/**
 * Step to generate final evaluation report
 */
const generateReportStep = createStep({
  id: "generate-report-step",
  description: "Generate quality evaluation report",
  inputSchema: z.object({
    name: z.string(),
    introduction: z.string(),
    conclusion: z.string(),
    chapters: z.any(),
    introductionEvaluation: z.any().optional(),
    conclusionEvaluation: z.any().optional(),
  }),
  outputSchema: z.object({
    name: z.string(),
    introduction: z.string(),
    conclusion: z.string(),
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
      name: inputData.name,
      introduction: inputData.introduction,
      conclusion: inputData.conclusion,
      chapters: inputData.chapters,
      qualityReport: report,
    };
  },
});

/**
 * Quality evaluation workflow
 * Can be used standalone or integrated into main workflow
 */
export const qualityEvaluationWorkflow = createWorkflow({
  id: "quality-evaluation-workflow",
  inputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    introduction: z.string(),
    conclusion: z.string(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
            researchedDatas: z.string().optional(),
          })
        ),
      })
    ),
  }),
  outputSchema: z.object({
    name: z.string(),
    introduction: z.string(),
    conclusion: z.string(),
    chapters: z.any(),
    qualityReport: z.string(),
  }),
})
  .then(evaluateIntroStep)
  .then(evaluateChaptersStep)
  .then(evaluateConclusionStep)
  .then(generateReportStep);

qualityEvaluationWorkflow.commit();
