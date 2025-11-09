import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { weatherWorkflow } from "./workflows/weather-workflow";
import { weatherAgent } from "./agents/weather-agent";
import {
  toolCallAppropriatenessScorer,
  completenessScorer,
  translationScorer,
} from "./scorers/weather-scorer";
import { topicAgent } from "./agents/topic-agent";
import { researchAgent } from "./agents/reaserachAgent";
import { plannerAgent } from "./agents/plannerAgent";
import { introWriterAgent } from "./agents/introWriterAgent";
import { analysisWriterAgent } from "./agents/analysisWriterAgent";
import { improvementWriterAgent } from "./agents/improvementWriterAgent";
import { conclusionWriterAgent } from "./agents/conclusionWriterAgent";
import { bibliographyWriterAgent } from "./agents/bibliographyWriterAgent";
import { MCPDocumentAgent } from "./agents/mcpDocumentAgent";
import { writerWorkFlow } from "./workflows/word-workflow";

export const mastra = new Mastra({
  workflows: { weatherWorkflow, writerWorkFlow },
  agents: {
    topicAgent,
    researchAgent,
    plannerAgent,
    introWriterAgent,
    analysisWriterAgent,
    improvementWriterAgent,
    conclusionWriterAgent,
    bibliographyWriterAgent,
    // MCPDocumentAgent,
  },
  // mcpServers: [mcpServers.getServers().browser],
  scorers: {
    toolCallAppropriatenessScorer,
    completenessScorer,
    translationScorer,
  },
  storage: new LibSQLStore({
    // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  telemetry: {
    // Telemetry is deprecated and will be removed in the Nov 4th release
    enabled: false,
  },
  observability: {
    // Enables DefaultExporter and CloudExporter for AI tracing
    default: { enabled: true },
  },
});
