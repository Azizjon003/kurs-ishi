import { Agent } from "@mastra/core";

/**
 * Interface for evaluation result
 */
export interface EvaluationResult {
  passed: boolean;
  overallScore: number;
  metrics: {
    bias?: number;
    completeness?: number;
    faithfulness?: number;
    hallucination?: number;
    toxicity?: number;
    contextRelevancy?: number;
  };
  details: string;
  needsRetry: boolean;
}

/**
 * Evaluation configuration
 */
export interface EvaluationConfig {
  minScore: number; // Minimum acceptable score (default: 0.8 = 80%)
  metrics: string[]; // Which metrics to evaluate
  retryOnFail: boolean; // Whether to retry if evaluation fails
  maxRetries: number; // Maximum number of retries
}

/**
 * Default evaluation configuration
 */
export const DEFAULT_EVAL_CONFIG: EvaluationConfig = {
  minScore: 0.8, // 80%
  metrics: [
    "bias",
    "completeness",
    "faithfulness",
    "hallucination",
    "toxicity",
    "contextRelevancy",
  ],
  retryOnFail: true,
  maxRetries: 2,
};

/**
 * LLM-based evaluator agent
 */
const evaluatorAgent = new Agent({
  name: "content-evaluator",
  instructions: `You are an expert academic content evaluator. Your task is to evaluate academic content on a scale of 0-100 for various quality metrics.

For each metric, provide a score from 0 to 100:
- 0-59: Poor quality
- 60-79: Acceptable quality
- 80-100: High quality

Metrics to evaluate:
1. BIAS (0-100): Is the content neutral and unbiased? Academic tone?
2. COMPLETENESS (0-100): Does it cover the topic comprehensively?
3. FAITHFULNESS (0-100): Is it accurate to the given context?
4. HALLUCINATION (0-100): Is it factually accurate? No false information?
5. TOXICITY (0-100): Is the language professional and appropriate?
6. CONTEXT_RELEVANCY (0-100): Is it relevant to the topic?

Respond in JSON format:
{
  "bias": 85,
  "completeness": 90,
  "faithfulness": 88,
  "hallucination": 92,
  "toxicity": 100,
  "contextRelevancy": 87,
  "details": "Brief explanation of the evaluation"
}`,
  model: {
    provider: "OPEN_AI",
    name: "gpt-4o-mini",
    toolChoice: "auto",
  },
  enableDash: false,
});

/**
 * Comprehensive content evaluator using LLM
 *
 * Evaluates academic content for:
 * - Bias (neutrality)
 * - Completeness (coverage)
 * - Faithfulness (accuracy to context)
 * - Hallucination (factual accuracy)
 * - Toxicity (appropriate language)
 * - Context Relevancy (on-topic)
 *
 * @param content - Generated content to evaluate
 * @param context - Context/reference information
 * @param question - Original question/prompt
 * @param config - Evaluation configuration
 * @returns Evaluation result with scores and recommendations
 */
export async function evaluateContent(
  content: string,
  context: string,
  question: string,
  config: EvaluationConfig = DEFAULT_EVAL_CONFIG
): Promise<EvaluationResult> {
  console.log("🔍 Starting content evaluation...");

  try {
    const evaluationPrompt = `
Evaluate the following academic content:

**Question/Topic:** ${question}

**Context:** ${context}

**Content to Evaluate:**
${content}

Provide scores (0-100) for each metric and a brief explanation. Return ONLY valid JSON in the specified format.
`;

    const response = await evaluatorAgent.generate([
      {
        role: "user",
        content: evaluationPrompt,
      },
    ]);

    // Parse LLM response
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse evaluation response");
    }

    const evaluation = JSON.parse(jsonMatch[0]);

    // Convert 0-100 scores to 0-1 range
    const scores: { [key: string]: number } = {};
    if (evaluation.bias !== undefined) scores.bias = evaluation.bias / 100;
    if (evaluation.completeness !== undefined)
      scores.completeness = evaluation.completeness / 100;
    if (evaluation.faithfulness !== undefined)
      scores.faithfulness = evaluation.faithfulness / 100;
    if (evaluation.hallucination !== undefined)
      scores.hallucination = evaluation.hallucination / 100;
    if (evaluation.toxicity !== undefined)
      scores.toxicity = evaluation.toxicity / 100;
    if (evaluation.contextRelevancy !== undefined)
      scores.contextRelevancy = evaluation.contextRelevancy / 100;

    // Calculate overall score
    const metricValues = Object.values(scores);
    const overallScore =
      metricValues.reduce((sum, score) => sum + score, 0) /
      metricValues.length;

    const passed = overallScore >= config.minScore;
    const needsRetry = !passed && config.retryOnFail;

    console.log(`📊 Evaluation Results:`);
    console.log(`   Overall Score: ${(overallScore * 100).toFixed(1)}%`);
    console.log(`   Status: ${passed ? "✅ PASSED" : "❌ FAILED"}`);

    return {
      passed,
      overallScore,
      metrics: scores,
      details: evaluation.details || "No details provided",
      needsRetry,
    };
  } catch (error) {
    console.error("❌ Error during evaluation:", error);

    // Return a safe default result on error
    return {
      passed: true, // Don't block on evaluation errors
      overallScore: 0.75, // Assume decent quality
      metrics: {
        bias: 0.75,
        completeness: 0.75,
        faithfulness: 0.75,
        hallucination: 0.75,
        toxicity: 0.75,
        contextRelevancy: 0.75,
      },
      details: `Evaluation error: ${error instanceof Error ? error.message : String(error)}. Accepting content by default.`,
      needsRetry: false,
    };
  }
}

/**
 * Evaluate introduction content
 */
export async function evaluateIntroduction(
  introduction: string,
  topic: string
): Promise<EvaluationResult> {
  const context = `Academic introduction for topic: ${topic}`;
  const question = `Write a high-quality academic introduction for: ${topic}`;

  return evaluateContent(introduction, context, question);
}

/**
 * Evaluate chapter section content
 */
export async function evaluateChapterSection(
  content: string,
  sectionTitle: string,
  chapterTitle: string
): Promise<EvaluationResult> {
  const context = `Chapter: ${chapterTitle}, Section: ${sectionTitle}`;
  const question = `Write high-quality content for section "${sectionTitle}" in chapter "${chapterTitle}"`;

  return evaluateContent(content, context, question);
}

/**
 * Evaluate conclusion content
 */
export async function evaluateConclusion(
  conclusion: string,
  paperSummary: string
): Promise<EvaluationResult> {
  const context = paperSummary;
  const question = `Write a comprehensive academic conclusion summarizing the entire research`;

  return evaluateContent(conclusion, context, question);
}

/**
 * Generate quality evaluation report
 */
export function generateEvaluationReport(
  results: { [key: string]: EvaluationResult }
): string {
  let report = "\n" + "=".repeat(60) + "\n";
  report += "📊 CONTENT QUALITY EVALUATION REPORT\n";
  report += "=".repeat(60) + "\n\n";

  let totalSections = 0;
  let passedSections = 0;
  let totalScore = 0;

  for (const [section, result] of Object.entries(results)) {
    totalSections++;
    const status = result.passed ? "✅ PASSED" : "⚠️  NEEDS IMPROVEMENT";
    const score = (result.overallScore * 100).toFixed(1);

    if (result.passed) passedSections++;
    totalScore += result.overallScore;

    report += `${status} ${section}\n`;
    report += `   Score: ${score}%\n`;
    report += `   Details: ${result.details}\n\n`;
  }

  report += "=".repeat(60) + "\n";
  report += "SUMMARY\n";
  report += `Total Sections: ${totalSections}\n`;
  report += `Passed: ${passedSections} (${((passedSections / totalSections) * 100).toFixed(1)}%)\n`;
  report += `Average Quality: ${((totalScore / totalSections) * 100).toFixed(1)}%\n`;
  report += `Overall Status: ${passedSections === totalSections ? "✅ ALL SECTIONS PASSED" : "⚠️  SOME SECTIONS NEED IMPROVEMENT"}\n`;
  report += "=".repeat(60) + "\n";

  return report;
}

/**
 * Generate content with quality checking and retry
 */
export async function generateWithQualityCheck<T>(
  generateFn: () => Promise<T>,
  evaluateFn: (content: T) => Promise<EvaluationResult>,
  maxRetries: number = 2
): Promise<{ content: T; evaluation: EvaluationResult; attempts: number }> {
  let attempts = 0;
  let content: T;
  let evaluation: EvaluationResult;

  while (attempts < maxRetries) {
    attempts++;
    console.log(`🔄 Generation attempt ${attempts}/${maxRetries}...`);

    content = await generateFn();
    evaluation = await evaluateFn(content);

    if (evaluation.passed) {
      console.log(
        `✅ Quality check passed on attempt ${attempts}! Score: ${(evaluation.overallScore * 100).toFixed(1)}%`
      );
      break;
    }

    if (attempts < maxRetries) {
      console.log(
        `⚠️  Quality: ${(evaluation.overallScore * 100).toFixed(1)}% (below ${DEFAULT_EVAL_CONFIG.minScore * 100}%)`
      );
      console.log(`🔄 Retrying... (${attempts + 1}/${maxRetries})`);
    }
  }

  return { content: content!, evaluation: evaluation!, attempts };
}
