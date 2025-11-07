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

const stepTopicName = createStep({
  id: "step-topic-name",
  description: "Prepare topic and language",
  inputSchema: z.object({
    topic: z.string(),
    language: z.string(),
  }),
  outputSchema: z.object({
    name: z.string(),
    language: z.string(),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }
    return {
      name: inputData.topic,
      language: inputData.language,
    };
  },
});

const plannerStep = createStep({
  id: "planner-step",
  description: "Plan the content",
  inputSchema: z.object({
    name: z.string(),
    language: z.string(),
  }),
  outputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
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
    const prompt = `Create a detailed academic plan for the following topic in ${inputData.language} language:\n\nTopic: ${inputData.name}\n\nPlease structure the course paper according to academic standards with 3 main chapters.`;
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
    };
  },
});

const researchStep = createStep({
  id: "research-step",
  description: "Research the content",
  inputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
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
    const inputDatas: any = inputData;
    for (const [i, chapter] of inputData.chapters.entries()) {
      for (const [j, section] of chapter.sections.entries()) {
        const sectionText = `Research this section in ${inputData.language} language:\n\nTitle: ${section.title}`;
        console.log(sectionText);
        // let researchData = await researchAgent.generate([
        //   {
        //     role: "user",
        //     content: sectionText,
        //   },
        // ]);

        inputDatas.chapters[i].sections[j]["researchedDatas"] = "";
        // researchData.text;
        // console.log(inputDatas.chapters[i].sections[j]);
      }
    }

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

    // Try up to 3 times to get quality content
    while (attempts < 3) {
      attempts++;

      const prompt = attempts === 1
        ? `Write an academic introduction in ${inputData.language} language for the following course paper structure:\n\n${JSON.stringify(inputDatas)}\n\nIMPORTANT: Ensure high quality, comprehensive coverage, neutral tone, and accurate information.`
        : `Write an academic introduction in ${inputData.language} language for the following course paper structure:\n\n${JSON.stringify(inputDatas)}\n\nIMPORTANT: Ensure high quality, comprehensive coverage, neutral tone, and accurate information. Previous attempt scored ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}%. Improve based on feedback: ${evaluation?.details ?? ""}`;

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
        console.log(`✅ Introduction passed quality check on attempt ${attempts}! Score: ${((evaluation.overallScore ?? 0) * 100).toFixed(1)}%`);
        break;
      }

      // If not passed and we have retries left, continue
      if (attempts < 3) {
        console.log(`⚠️  Introduction quality: ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}% (below 80%)`);
        console.log(`🔄 Regenerating introduction (attempt ${attempts + 1})...`);
      } else {
        console.log(`⚠️  Introduction accepted after 3 attempts with score: ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}%`);
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

const theoryStep = createStep({
  id: "theory-step",
  description: "Write the theory with quality evaluation",
  inputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
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
    introduction: z.string(),
    introductionEvaluation: z.any().optional(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            content: z.string().optional(),
            researchedDatas: z.string(),
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
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    console.log("\n" + "=".repeat(60));
    console.log("✍️  WRITING THEORY CHAPTER");
    console.log("=".repeat(60));

    const inputDatas: any = inputData;
    const chaptesTherory = inputData.chapters[0];

    for (const [i, section] of chaptesTherory.sections.entries()) {
      console.log(`\n📝 Section: ${section.title}`);

      let attempts = 0;
      let currentContent = "";
      let evaluation: EvaluationResult | undefined;

      // Try up to 2 times per section
      while (attempts < 2) {
        attempts++;

        const prompt = attempts === 1
          ? `Write the theoretical content in ${inputData.language} language for this section:\n\n${JSON.stringify(section)}\n\nIMPORTANT: Ensure high quality, comprehensive coverage, neutral tone, and accurate information. Use tables, diagrams, and formulas where appropriate.`
          : `Write the theoretical content in ${inputData.language} language for this section:\n\n${JSON.stringify(section)}\n\nIMPORTANT: Previous attempt scored ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}%. Improve: ${evaluation?.details ?? ""}`;

        const theory = await theoryWriterAgent.generate([
          {
            role: "user",
            content: prompt,
          },
        ]);
        currentContent = theory.text;

        // Evaluate the section
        evaluation = await evaluateChapterSection(
          currentContent,
          section.title,
          chaptesTherory.chapterTitle
        );

        // If passed or last attempt, break
        if (evaluation?.passed || attempts >= 2) {
          if (evaluation?.passed) {
            console.log(`  ✅ Section passed (${((evaluation.overallScore ?? 0) * 100).toFixed(1)}%)`);
          } else {
            console.log(`  ⚠️  Section quality: ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}% (accepting best attempt)`);
          }
          break;
        }

        console.log(`  🔄 Regenerating section...`);
      }

      inputDatas.chapters[0].sections[i].content = currentContent;
      inputDatas.chapters[0].sections[i].evaluation = {
        passed: evaluation?.passed ?? false,
        score: evaluation?.overallScore ?? 0,
        details: evaluation?.details ?? "No evaluation performed",
        attempts,
      };
    }

    return inputDatas;
  },
});

const AnalysisWritingStep = createStep({
  id: "analysis-writing-step",
  description: "Write the analysis with quality evaluation",
  inputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    introduction: z.string(),
    introductionEvaluation: z.any().optional(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            content: z.string().optional(),
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
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            content: z.string().optional(),
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
    console.log("✍️  WRITING ANALYSIS CHAPTER");
    console.log("=".repeat(60));

    const inputDatas: any = inputData;
    const chaptersAnalysis = inputData.chapters[1];

    for (const [i, section] of chaptersAnalysis.sections.entries()) {
      console.log(`\n📝 Section: ${section.title}`);

      let attempts = 0;
      let currentContent = "";
      let evaluation: EvaluationResult | undefined;

      // Try up to 2 times per section
      while (attempts < 2) {
        attempts++;

        const prompt = attempts === 1
          ? `Write the analytical content in ${inputData.language} language for this section:\n\n${JSON.stringify(section)}\n\nIMPORTANT: Ensure high quality, comprehensive coverage, neutral tone, and accurate information. Use comparison tables, case studies, and data analysis where appropriate.`
          : `Write the analytical content in ${inputData.language} language for this section:\n\n${JSON.stringify(section)}\n\nIMPORTANT: Previous attempt scored ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}%. Improve: ${evaluation?.details ?? ""}`;

        const analysis = await analysisWriterAgent.generate([
          {
            role: "user",
            content: prompt,
          },
        ]);
        currentContent = analysis.text;

        // Evaluate the section
        evaluation = await evaluateChapterSection(
          currentContent,
          section.title,
          chaptersAnalysis.chapterTitle
        );

        // If passed or last attempt, break
        if (evaluation?.passed || attempts >= 2) {
          if (evaluation?.passed) {
            console.log(`  ✅ Section passed (${((evaluation.overallScore ?? 0) * 100).toFixed(1)}%)`);
          } else {
            console.log(`  ⚠️  Section quality: ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}% (accepting best attempt)`);
          }
          break;
        }

        console.log(`  🔄 Regenerating section...`);
      }

      inputDatas.chapters[1].sections[i].content = currentContent;
      inputDatas.chapters[1].sections[i].evaluation = {
        passed: evaluation?.passed ?? false,
        score: evaluation?.overallScore ?? 0,
        details: evaluation?.details ?? "No evaluation performed",
        attempts,
      };
    }

    return inputDatas;
  },
});

const ImprovementWriterAgent = createStep({
  id: "improvement-writing-step",
  description: "Write the improvement proposals with quality evaluation",
  inputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    introduction: z.string(),
    introductionEvaluation: z.any().optional(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            content: z.string().optional(),
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
    console.log("✍️  WRITING IMPROVEMENT CHAPTER");
    console.log("=".repeat(60));

    const inputDatas: any = inputData;
    const chaptersImprovement = inputData.chapters[2];

    for (const [i, section] of chaptersImprovement.sections.entries()) {
      console.log(`\n📝 Section: ${section.title}`);

      let attempts = 0;
      let currentContent = "";
      let evaluation: EvaluationResult | undefined;

      // Try up to 2 times per section
      while (attempts < 2) {
        attempts++;

        const prompt = attempts === 1
          ? `Write improvement proposals in ${inputData.language} language for this section:\n\n${JSON.stringify(section)}\n\nIMPORTANT: Ensure high quality, comprehensive coverage, neutral tone, and accurate information. Include architecture diagrams, technology specifications, budget tables, and implementation timelines where appropriate.`
          : `Write improvement proposals in ${inputData.language} language for this section:\n\n${JSON.stringify(section)}\n\nIMPORTANT: Previous attempt scored ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}%. Improve: ${evaluation?.details ?? ""}`;

        const improvement = await improvementWriterAgent.generate([
          {
            role: "user",
            content: prompt,
          },
        ]);
        currentContent = improvement.text;

        // Evaluate the section
        evaluation = await evaluateChapterSection(
          currentContent,
          section.title,
          chaptersImprovement.chapterTitle
        );

        // If passed or last attempt, break
        if (evaluation?.passed || attempts >= 2) {
          if (evaluation?.passed) {
            console.log(`  ✅ Section passed (${((evaluation.overallScore ?? 0) * 100).toFixed(1)}%)`);
          } else {
            console.log(`  ⚠️  Section quality: ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}% (accepting best attempt)`);
          }
          break;
        }

        console.log(`  🔄 Regenerating section...`);
      }

      inputDatas.chapters[2].sections[i].content = currentContent;
      inputDatas.chapters[2].sections[i].evaluation = {
        passed: evaluation?.passed ?? false,
        score: evaluation?.overallScore ?? 0,
        details: evaluation?.details ?? "No evaluation performed",
        attempts,
      };
    }

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

    // Create paper summary for evaluation context
    const paperSummary = `
      Topic: ${inputData.name}
      Introduction: ${inputData.introduction.substring(0, 500)}...
      Chapters: ${inputData.chapters.map((c: any) => c.chapterTitle).join(", ")}
    `;

    // Try up to 3 times to get quality content
    while (attempts < 3) {
      attempts++;

      const prompt = attempts === 1
        ? `Write an academic conclusion in ${inputData.language} language based on the following course paper content:\n\n${JSON.stringify({ name: inputData.name, chapters: inputData.chapters.map((c: any) => c.chapterTitle) })}\n\nIMPORTANT: Ensure high quality, comprehensive coverage, neutral tone, and accurate information. Summarize key findings and provide recommendations.`
        : `Write an academic conclusion in ${inputData.language} language based on the following course paper content:\n\n${JSON.stringify({ name: inputData.name, chapters: inputData.chapters.map((c: any) => c.chapterTitle) })}\n\nIMPORTANT: Previous attempt scored ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}%. Improve based on feedback: ${evaluation?.details ?? ""}`;

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
        console.log(`✅ Conclusion passed quality check on attempt ${attempts}! Score: ${((evaluation.overallScore ?? 0) * 100).toFixed(1)}%`);
        break;
      }

      // If not passed and we have retries left, continue
      if (attempts < 3) {
        console.log(`⚠️  Conclusion quality: ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}% (below 80%)`);
        console.log(`🔄 Regenerating conclusion (attempt ${attempts + 1})...`);
      } else {
        console.log(`⚠️  Conclusion accepted after 3 attempts with score: ${((evaluation?.overallScore ?? 0) * 100).toFixed(1)}%`);
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
    introduction: z.string(),
    introductionEvaluation: z.any().optional(),
    conclusion: z.string(),
    conclusionEvaluation: z.any().optional(),
    bibliography: z.string(),
    chapters: z.any(),
  }),
  outputSchema: z.object({
    name: z.string(),
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
  .then(theoryStep)
  .then(AnalysisWritingStep)
  .then(ImprovementWriterAgent)
  .then(conclusionStep)
  .then(bibliographyStep)
  .then(qualityReportStep)
  .then(documentStep);

writerWorkFlow.commit();
export { writerWorkFlow };
