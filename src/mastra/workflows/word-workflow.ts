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
import { MCPDocumentAgent } from "../agents/mcpDocumentAgent";

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
            text: z.string(),
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
                    text: z.string(),
                  })
                ),
              })
            ),
          }),
        },
      }
    );

    return { name: inputData.name, ...JSON.parse(plan.text), language: inputData.language };
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
            text: z.string(),
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
            text: z.string(),
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
        const sectionText = `Research this section in ${inputData.language} language:\n\n${section.title}: ${section.text}`;
        console.log(sectionText);
        let researchData = await researchAgent.generate([
          {
            role: "user",
            content: sectionText,
          },
        ]);

        inputDatas.chapters[i].sections[j]["researchedDatas"] =
          researchData.text;
        console.log(inputDatas.chapters[i].sections[j]);
      }
    }

    return inputDatas;
  },
});

const introStep = createStep({
  id: "intro-step",
  description: "Write the introduction",
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
            text: z.string(),
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
            text: z.string(),
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
    const prompt = `Write an academic introduction in ${inputData.language} language for the following course paper structure:\n\n${JSON.stringify(inputDatas)}`;
    const introduction = await introWriterAgent.generate([
      {
        role: "user",
        content: prompt,
      },
    ]);
    inputDatas["introduction"] = introduction.text;
    return inputDatas;
  },
});

const theoryStep = createStep({
  id: "theory-step",
  description: "Write the theory",
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
            text: z.string(),
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
            text: z.string(),
            content: z.string().optional(),
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
    const chaptesTherory = inputData.chapters[0];
    for (const [i, section] of chaptesTherory.sections.entries()) {
      const prompt = `Write the theoretical content in ${inputData.language} language for this section:\n\n${JSON.stringify(section)}`;
      const theory = await theoryWriterAgent.generate([
        {
          role: "user",
          content: prompt,
        },
      ]);
      inputDatas.chapters[0].sections[i].content = theory.text;
    }

    return inputDatas;
  },
});

const AnalysisWritingStep = createStep({
  id: "analysis-writing-step",
  description: "Write the analysis",
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
            text: z.string(),
            content: z.string().optional(),
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
            text: z.string(),
            content: z.string().optional(),
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
    const chaptersAnalysis = inputData.chapters[1];
    for (const [i, section] of chaptersAnalysis.sections.entries()) {
      const prompt = `Write the analytical content in ${inputData.language} language for this section:\n\n${JSON.stringify(section)}`;
      const analysis = await analysisWriterAgent.generate([
        {
          role: "user",
          content: prompt,
        },
      ]);
      inputDatas.chapters[1].sections[i].content = analysis.text;
    }

    return inputDatas;
  },
});

const ImprovementWriterAgent = createStep({
  id: "improvement-writing-step",
  description: "Write the improvement proposals",
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
            text: z.string(),
            content: z.string().optional(),
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
            text: z.string(),
            content: z.string(),
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
    const chaptersImprovement = inputData.chapters[2];
    for (const [i, section] of chaptersImprovement.sections.entries()) {
      const prompt = `Write improvement proposals in ${inputData.language} language for this section:\n\n${JSON.stringify(section)}`;
      const improvement = await improvementWriterAgent.generate([
        {
          role: "user",
          content: prompt,
        },
      ]);
      inputDatas.chapters[2].sections[i].content = improvement.text;
    }

    return inputDatas;
  },
});

const conclusionStep = createStep({
  id: "conclusion-step",
  description: "Write the conclusion",
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
            text: z.string(),
            content: z.string(),
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
    conclusion: z.string(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            text: z.string(),
            content: z.string(),
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
    const prompt = `Write an academic conclusion in ${inputData.language} language based on the following course paper content:\n\n${JSON.stringify(inputDatas)}`;
    const conclusion = await conclusionWriterAgent.generate([
      {
        role: "user",
        content: prompt,
      },
    ]);
    inputDatas["conclusion"] = conclusion.text;
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
    conclusion: z.string(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            text: z.string(),
            content: z.string(),
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
    conclusion: z.string(),
    bibliography: z.string(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            text: z.string(),
            content: z.string(),
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

const documentStep = createStep({
  id: "document-step",
  description: "Create Word document using MCP",
  inputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    introduction: z.string(),
    conclusion: z.string(),
    bibliography: z.string(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            text: z.string(),
            content: z.string(),
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
    conclusion: z.string(),
    bibliography: z.string(),
    document: z.string(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            text: z.string(),
            content: z.string(),
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
    const prompt = `Create a professional academic Word document in ${inputData.language} language using the MCP tools. Format the following content:\n\n${JSON.stringify({
      chapterTitle: inputData.chapterTitle,
      introduction: inputData.introduction,
      conclusion: inputData.conclusion,
      bibliography: inputData.bibliography,
      chapters: inputData.chapters,
    })}\n\nMake sure to follow proper academic formatting and use the MCP tools to create the .docx file.`;
    const document = await MCPDocumentAgent.generate([
      {
        role: "user",
        content: prompt,
      },
    ]);
    inputDatas["document"] = document.text;
    return inputDatas;
  },
});
const writerWorkFlow = createWorkflow({
  id: "writer-work-flow",
  inputSchema: z.object({
    topic: z.string().describe("The topic of the course paper"),
    language: z.string().describe("The language for writing the course paper (e.g., 'uzbek', 'english', 'russian')"),
  }),
  outputSchema: z.object({
    name: z.string(),
    chapterTitle: z.string(),
    language: z.string(),
    introduction: z.string(),
    conclusion: z.string(),
    bibliography: z.string(),
    document: z.string(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string(),
        sections: z.array(
          z.object({
            title: z.string(),
            text: z.string(),
            content: z.string(),
            researchedDatas: z.string(),
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
  .then(documentStep);

writerWorkFlow.commit();
export { writerWorkFlow };
