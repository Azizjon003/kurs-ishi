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
  description: "Get the topic name",
  inputSchema: z.object({
    content: z.string(),
  }),
  outputSchema: z.object({
    name: z.string(),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }
    const topicNames = await topicAgent.generate(
      [
        {
          role: "user",
          content: inputData.content,
        },
      ],
      {
        structuredOutput: {
          schema: z.object({
            topicName: z.string(),
          }),
        },
      }
    );

    return {
      name: JSON.parse(topicNames.text).topicName,
    };
  },
});

const plannerStep = createStep({
  id: "planner-step",
  description: "Plan the content",
  inputSchema: z.object({
    name: z.string(),
  }),
  outputSchema: z.object({
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
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }
    const plan = await plannerAgent.generate(
      [{ role: "user", content: inputData.name }],
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

    return { ...JSON.parse(plan.text) };
  },
});

const researchStep = createStep({
  id: "research-step",
  description: "Research the content",
  inputSchema: z.object({
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
  outputSchema: z.object({
    chapterTitle: z.string(),
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
        const sectionText = `${section.title}: ${section.text}`;
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
    chapterTitle: z.string(),
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
    chapterTitle: z.string(),
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
    const introduction = await introWriterAgent.generate([
      {
        role: "user",
        content: JSON.stringify(inputDatas),
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
    chapterTitle: z.string(),
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
    chapterTitle: z.string(),
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
    const chaptesTherory = inputData.chapters[0];
    for (const [i, section] of chaptesTherory.sections.entries()) {
      const analysis = await theoryWriterAgent.generate([
        {
          role: "user",
          content: JSON.stringify(section),
        },
      ]);
      inputDatas.chapters[0].sections[i].content = analysis.text;
    }

    return inputDatas;
  },
});

const AnalysisWritingStep = createStep({
  id: "analysis-writing-step",
  description: "Write the analysis",
  inputSchema: z.object({
    chapterTitle: z.string(),
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
    chapterTitle: z.string(),
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
    const chaptesTherory = inputData.chapters[1];
    for (const [i, section] of chaptesTherory.sections.entries()) {
      const analysis = await analysisWriterAgent.generate([
        {
          role: "user",
          content: JSON.stringify(section),
        },
      ]);
      inputDatas.chapters[0].sections[i].content = analysis.text;
    }

    return inputDatas;
  },
});

const ImprovementWriterAgent = createStep({
  id: "analysis-writing-step",
  description: "Write the analysis",
  inputSchema: z.object({
    chapterTitle: z.string(),
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
    chapterTitle: z.string(),
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
    const chaptesTherory = inputData.chapters[2];
    for (const [i, section] of chaptesTherory.sections.entries()) {
      const improvement = await improvementWriterAgent.generate([
        {
          role: "user",
          content: JSON.stringify(section),
        },
      ]);
      inputDatas.chapters[0].sections[i].content = improvement.text;
    }

    return inputDatas;
  },
});

const conclusionStep = createStep({
  id: "conclusion-step",
  description: "Write the conclusion",
  inputSchema: z.object({
    chapterTitle: z.string(),
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
    chapterTitle: z.string(),
    introduction: z.string(),
    conclusion: z.string(),
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
    const conclusion = await conclusionWriterAgent.generate([
      {
        role: "user",
        content: JSON.stringify(inputDatas),
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
    chapterTitle: z.string(),
    introduction: z.string(),
    conclusion: z.string(),
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
    chapterTitle: z.string(),
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
    const bibliography = await bibliographyWriterAgent.generate([
      {
        role: "user",
        content: JSON.stringify(inputDatas),
      },
    ]);
    inputDatas["bibliography"] = bibliography.text;
    return inputDatas;
  },
});

const documentStep = createStep({
  id: "document-step",
  description: "Write the document",
  inputSchema: z.object({
    chapterTitle: z.string(),
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
            researchedDatas: z.string(),
          })
        ),
      })
    ),
  }),
  outputSchema: z.object({
    chapterTitle: z.string(),
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
    const document = await MCPDocumentAgent.generate([
      {
        role: "user",
        content: JSON.stringify({
          chapterTitle: inputData.chapterTitle,
          introduction: inputData.introduction,
          conclusion: inputData.conclusion,
          bibliography: inputData.bibliography,
          chapters: inputData.chapters,
        }),
      },
    ]);
    inputDatas["document"] = document.text;
    return inputDatas;
  },
});
const writerWorkFlow = createWorkflow({
  id: "writer-work-flow",
  inputSchema: z.object({
    content: z.string(),
  }),
  outputSchema: z.object({
    content: z.string(),
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
