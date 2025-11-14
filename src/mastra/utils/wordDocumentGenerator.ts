import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  PageBreak,
  convertInchesToTwip,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  VerticalAlign,
  Shading,
  ShadingType,
} from "docx";
import * as fs from "fs";
import * as path from "path";
import {
  createAcademicTable,
  createDiagramDescription,
  createFormulaDisplay,
  createCodeBlock,
  parseEnhancedContent,
  convertLatexToUnicode,
  TableData,
  DiagramData,
  FormulaData,
  CodeBlockData,
} from "./advancedWordFeatures";
import { createChapterHeaderImage } from "./imageUtils";

/**
 * Interface for section data structure
 */
interface Section {
  title: string;
  content: string;
  researchedDatas?: string;
}

/**
 * Interface for chapter data structure
 */
interface Chapter {
  chapterTitle: string;
  sections: Section[];
  imageUrl?: string; // Optional chapter header image
}

/**
 * Interface for course paper data structure
 */
interface CoursePaperData {
  name: string;
  chapterTitle: string;
  language: string;
  introduction: string;
  conclusion: string;
  bibliography: string;
  chapters: Chapter[];
  // Optional metadata for cover page
  universityName?: string;
  facultyName?: string;
  departmentName?: string;
  studentName?: string;
  studentCourse?: number;
  subjectName?: string;
  advisorName?: string;
}

/**
 * Professional Word document generator for academic course papers
 *
 * Creates properly formatted academic documents with:
 * - Times New Roman 14pt font
 * - 1.5 line spacing
 * - Justified text alignment
 * - Proper margins (2.5cm)
 * - Academic structure with page breaks
 *
 * @param data - Course paper data structure
 * @param outputPath - Output file path (optional, defaults to current directory)
 * @returns Path to generated document
 */
export async function generateWordDocument(
  data: CoursePaperData,
  outputPath?: string
): Promise<string> {
  try {
    // Sanitize filename
    const safeFileName = sanitizeFileName(data.name);
    const fileName = `kurs_ishi_${safeFileName}.docx`;
    const filePath = outputPath
      ? path.join(outputPath, fileName)
      : path.join(process.cwd(), fileName);

    // Get language-specific headers
    const langHeaders = getLanguageHeaders(data.language);

    // Pre-generate chapter content with images (async operations)
    console.log("📝 Generating chapters with images...");
    const chapter1Content = await createChapterContent(data.chapters[0], 1);
    const chapter2Content = await createChapterContent(data.chapters[1], 2);
    const chapter3Content = await createChapterContent(data.chapters[2], 3);
    console.log("✅ All chapters generated successfully");

    // Create document with academic formatting
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(0.98), // 2.5 cm
                right: convertInchesToTwip(0.98),
                bottom: convertInchesToTwip(0.98),
                left: convertInchesToTwip(0.98),
              },
            },
          },
          children: [
            // Cover Page
            ...createCoverPage(
              data.name,
              data.universityName,
              data.facultyName,
              data.departmentName,
              data.studentName,
              data.studentCourse,
              data.subjectName,
              data.advisorName
            ),
            createPageBreak(),

            // Table of Contents (Plan)
            ...createTableOfContents(data, langHeaders),
            createPageBreak(),

            // Introduction (Kirish)
            createHeading1(langHeaders.introduction),
            ...createParagraphs(data.introduction),
            createPageBreak(),

            // Chapter I - Theory (Nazariy asoslar)
            ...chapter1Content,
            createPageBreak(),

            // Chapter II - Analysis (Amaliy/Tahliliy qism)
            ...chapter2Content,
            createPageBreak(),

            // Chapter III - Improvements (Takomillashtirish takliflari)
            ...chapter3Content,
            createPageBreak(),

            // Conclusion (Xulosa)
            createHeading1(langHeaders.conclusion),
            ...createParagraphs(data.conclusion),
            createPageBreak(),

            // Bibliography (Foydalanilgan adabiyotlar)
            createHeading1(langHeaders.bibliography),
            ...createBibliography(data.bibliography),
          ],
        },
      ],
    });

    // Generate and save document
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);

    console.log(`✅ Word document successfully created: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error("❌ Error creating Word document:", error);
    throw new Error(
      `Failed to generate Word document: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get language-specific headers for document sections
 */
function getLanguageHeaders(language: string) {
  const headers: Record<string, Record<string, string>> = {
    uzbek: {
      tableOfContents: "MUNDARIJA",
      introduction: "KIRISH",
      conclusion: "XULOSA",
      bibliography: "FOYDALANILGAN ADABIYOTLAR",
    },
    english: {
      tableOfContents: "TABLE OF CONTENTS",
      introduction: "INTRODUCTION",
      conclusion: "CONCLUSION",
      bibliography: "BIBLIOGRAPHY",
    },
    russian: {
      tableOfContents: "СОДЕРЖАНИЕ",
      introduction: "ВВЕДЕНИЕ",
      conclusion: "ЗАКЛЮЧЕНИЕ",
      bibliography: "СПИСОК ЛИТЕРАТУРЫ",
    },
  };

  const lang = language.toLowerCase();
  return headers[lang] || headers.uzbek;
}

/**
 * Sanitize filename to remove special characters
 */
function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_\s-]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase()
    .substring(0, 50);
}

/**
 * Create cover page with university format
 */
function createCoverPage(
  topic: string,
  universityName: string = "O'ZBEKISTONDA MILLIY UNIVERSITETI",
  facultyName: string = "Matematika fakulteti",
  departmentName: string = '"Amaliy matematika" yo\'nalishi',
  studentName: string = "FAYZIYEV JAHONGIR KAMOL O'G'LINING",
  studentCourse: number = 4,
  subjectName: string = "MATEMATIKA",
  advisorName?: string
): Paragraph[] {
  return [
    // Ministry header
    new Paragraph({
      children: [
        new TextRun({
          text: "O'ZBEKISTON RESPUBLIKASI OLIY TA'LIM, FAN VA INNOVATSIYALAR VAZIRLIGI",
          font: "Times New Roman",
          size: 24, // 12pt
          bold: false,
          color: "000000",
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),

    // University name
    new Paragraph({
      children: [
        new TextRun({
          text: universityName.toUpperCase(),
          font: "Times New Roman",
          size: 28, // 14pt
          bold: true,
          color: "000000",
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),

    // Faculty
    new Paragraph({
      children: [
        new TextRun({
          text: facultyName,
          font: "Times New Roman",
          size: 28, // 14pt
          color: "000000",
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),

    // Department and course
    new Paragraph({
      children: [
        new TextRun({
          text: `${departmentName} ${studentCourse}-kurs talabasi`,
          font: "Times New Roman",
          size: 28, // 14pt
          color: "000000",
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),

    // Author name
    new Paragraph({
      children: [
        new TextRun({
          text: studentName.toUpperCase(),
          font: "Times New Roman",
          size: 28, // 14pt
          bold: true,
          color: "000000",
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),

    // Subject
    new Paragraph({
      children: [
        new TextRun({
          text: `${subjectName.toUpperCase()} FANIDAN TAYYORLAGAN`,
          font: "Times New Roman",
          size: 28, // 14pt
          color: "000000",
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),

    // Main title - KURS ISHI
    new Paragraph({
      children: [
        new TextRun({
          text: "KURS ISHI",
          font: "Times New Roman",
          size: 48, // 24pt
          bold: true,
          color: "000000",
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),

    // Topic title
    new Paragraph({
      children: [
        new TextRun({
          text: `Mavzu: ${topic}`,
          font: "Times New Roman",
          size: 28, // 14pt
          bold: false,
          color: "000000",
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),

    // Spacer
    new Paragraph({
      text: "",
    }),

    // Scientific advisor
    new Paragraph({
      children: [
        new TextRun({
          text: `Ilmiy rahbari: ${advisorName ? advisorName : "______"}`,
          font: "Times New Roman",
          size: 28, // 14pt
          color: "000000",
        }),
      ],
      alignment: AlignmentType.RIGHT,
      indent: {
        right: convertInchesToTwip(1),
      },
    }),

    // Spacer for bottom
    new Paragraph({
      text: "",
    }),

    // City and year
    new Paragraph({
      children: [
        new TextRun({
          text: `Toshkent - ${new Date().getFullYear()}`,
          font: "Times New Roman",
          size: 28, // 14pt
          bold: false,
          color: "000000",
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
  ];
}

/**
 * Create main title paragraph (for internal use)
 */
function createMainTitle(title: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: title.toUpperCase(),
        font: "Times New Roman",
        size: 32, // 16pt for main title
        bold: true,
        color: "000000", // Black color
      }),
    ],
    alignment: AlignmentType.CENTER,
  });
}

/**
 * Create heading level 1 paragraph (Chapter headings)
 */
function createHeading1(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        font: "Times New Roman",
        size: 28, // 14pt
        bold: true,
        color: "000000", // Black color
      }),
    ],
    alignment: AlignmentType.CENTER,
  });
}

/**
 * Create heading level 2 paragraph (Section headings)
 */
function createHeading2(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        font: "Times New Roman",
        size: 28, // 14pt
        bold: true,
        color: "000000", // Black color
      }),
    ],
    alignment: AlignmentType.JUSTIFIED,
  });
}

/**
 * Create page break
 */
function createPageBreak(): Paragraph {
  return new Paragraph({
    children: [new PageBreak()],
  });
}

/**
 * Create table of contents
 */
function createTableOfContents(
  data: CoursePaperData,
  langHeaders: Record<string, string>
): Paragraph[] {
  const paragraphs: Paragraph[] = [
    createHeading1(langHeaders.tableOfContents),
    new Paragraph({
      text: "",
    }),
  ];

  // Introduction
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: langHeaders.introduction,
          font: "Times New Roman",
          size: 28, // 14pt
          color: "000000",
        }),
      ],
      alignment: AlignmentType.JUSTIFIED,
    })
  );

  // Chapters
  data.chapters.forEach((chapter, index) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: chapter.chapterTitle.toUpperCase(),
            font: "Times New Roman",
            size: 28, // 14pt
            bold: true,
            color: "000000",
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: convertInchesToTwip(0.3) },
      })
    );

    // Sections
    chapter.sections.forEach((section) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.title,
              font: "Times New Roman",
              size: 28, // 14pt
              color: "000000",
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          indent: { left: convertInchesToTwip(0.6) },
        })
      );
    });
  });

  // Conclusion
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: langHeaders.conclusion,
          font: "Times New Roman",
          size: 28, // 14pt
          color: "000000",
        }),
      ],
      alignment: AlignmentType.JUSTIFIED,
    })
  );

  // Bibliography
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: langHeaders.bibliography,
          font: "Times New Roman",
          size: 28, // 14pt
          color: "000000",
        }),
      ],
      alignment: AlignmentType.JUSTIFIED,
    })
  );

  return paragraphs;
}

/**
 * Create paragraphs from text content with enhanced support for tables, diagrams, formulas
 * Handles markdown formatting, tables, diagrams, and formulas
 */
function createParagraphs(text: string): (Paragraph | Table)[] {
  if (!text || text.trim() === "") {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: "Bu bo'lim keyinroq to'ldiriladi.",
            font: "Times New Roman",
            size: 28, // 14pt
            color: "000000", // Black color
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        spacing: {
          line: 360, // 1.5 line spacing
        },
      }),
    ];
  }

  // Parse content for enhanced elements (tables, diagrams, formulas)
  const elements = parseEnhancedContent(text);
  const result: (Paragraph | Table)[] = [];

  for (const element of elements) {
    if (element.type === "table") {
      // Add table
      const tableElements = createAcademicTable(element.data);
      result.push(...tableElements);
    } else if (element.type === "diagram") {
      // Add diagram description
      const diagramParas = createDiagramDescription(element.data);
      result.push(...diagramParas);
    } else if (element.type === "formula") {
      // Add formula display
      const formulaParas = createFormulaDisplay(element.data);
      result.push(...formulaParas);
    } else if (element.type === "code") {
      // Add code block
      const codeParas = createCodeBlock(element.data);
      result.push(...codeParas);
    } else {
      // Regular text - process inline code and clean markdown
      let cleanText = element.data
        .replace(/#{1,6}\s/g, "") // Remove markdown headers
        .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold markdown
        .replace(/\*(.+?)\*/g, "$1") // Remove italic markdown
        .trim();

      // Split into paragraphs and process inline code and formulas
      const paragraphs = cleanText
        .split(/\n\n+|\n/)
        .filter((p) => p.trim() !== "")
        .map((paragraph) => {
          const textRuns: TextRun[] = [];

          // First, split by [FORMULA: ...] pattern
          const formulaParts = paragraph.split(/(\[FORMULA:\s*[^\]]+\])/g);

          for (const formulaPart of formulaParts) {
            if (formulaPart.startsWith("[FORMULA:")) {
              // Extract LaTeX formula from [FORMULA: latex_code]
              const latexMatch = formulaPart.match(/\[FORMULA:\s*([^\]]+)\]/);
              if (latexMatch) {
                const latexCode = latexMatch[1].trim();
                const convertedFormula = convertLatexToUnicode(latexCode);
                textRuns.push(
                  new TextRun({
                    text: convertedFormula,
                    font: "Cambria Math",
                    size: 28, // 14pt
                    color: "000000",
                    italics: true,
                  })
                );
              }
            } else {
              // Process inline code: `code` → monospace font
              const parts = formulaPart.split(/(`[^`]+`)/g);

              for (const part of parts) {
                if (part.startsWith("`") && part.endsWith("`")) {
                  // Inline code
                  textRuns.push(
                    new TextRun({
                      text: part.slice(1, -1), // Remove backticks
                      font: "Courier New",
                      size: 26, // 13pt (slightly smaller)
                      color: "C7254E", // Red-ish color for code
                      shading: {
                        type: ShadingType.SOLID,
                        color: "F9F2F4", // Light pink background
                      },
                    })
                  );
                } else if (part.trim()) {
                  // Detect inline LaTeX formulas and convert to Unicode
                  // Check if contains LaTeX commands: \frac, \sum, \int, Greek letters, etc.
                  const hasLatex = /\\[a-zA-Z]+/.test(part);

                  if (hasLatex) {
                    // Convert LaTeX to Unicode
                    const convertedText = convertLatexToUnicode(part);
                    textRuns.push(
                      new TextRun({
                        text: convertedText,
                        font: "Times New Roman",
                        size: 28, // 14pt
                        color: "000000", // Black color
                      })
                    );
                  } else {
                    // Regular text without LaTeX
                    textRuns.push(
                      new TextRun({
                        text: part,
                        font: "Times New Roman",
                        size: 28, // 14pt
                        color: "000000", // Black color
                      })
                    );
                  }
                }
              }
            }
          }

          return new Paragraph({
            children: textRuns,
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              line: 360, // 1.5 line spacing
            },
            indent: {
              firstLine: convertInchesToTwip(0.5), // First line indent
            },
          });
        });

      result.push(...paragraphs);
    }
  }

  return result;
}

/**
 * Create chapter content with sections
 * Supports tables, diagrams, formulas, and images
 */
async function createChapterContent(
  chapter: Chapter,
  chapterNumber: number
): Promise<(Paragraph | Table)[]> {
  const elements: (Paragraph | Table)[] = [];

  // Chapter title
  elements.push(createHeading1(chapter.chapterTitle.toUpperCase()));

  // Add chapter header image if available
  if (chapter.imageUrl) {
    const imageParas = await createChapterHeaderImage(
      chapter.imageUrl,
      chapter.chapterTitle
    );
    elements.push(...imageParas);
  }

  // Sections
  chapter.sections.forEach((section) => {
    // Section title
    elements.push(createHeading2(section.title));

    // Section content
    if (section.content && section.content.trim() !== "") {
      elements.push(...createParagraphs(section.content));
    } else {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Bu bo'lim keyinroq to'ldiriladi.",
              font: "Times New Roman",
              size: 28, // 14pt
              color: "000000", // Black color
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360, // 1.5 line spacing
          },
        })
      );
    }

    // Add spacing between sections
    elements.push(
      new Paragraph({
        text: "",
      })
    );
  });

  return elements;
}

/**
 * Create bibliography section
 */
function createBibliography(bibliographyText: string): Paragraph[] {
  if (!bibliographyText || bibliographyText.trim() === "") {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: "1. Adabiyotlar keyinroq qo'shiladi.",
            font: "Times New Roman",
            size: 28, // 14pt
            color: "000000", // Black color
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        spacing: {
          line: 360, // 1.5 line spacing
          after: 200
        },
      }),
    ];
  }

  // Clean and split bibliography entries
  const cleanText = bibliographyText
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .trim();

  const entries = cleanText
    .split(/\n/)
    .filter((entry) => entry.trim() !== "")
    .map(
      (entry, index) =>
        new Paragraph({
          children: [
            new TextRun({
              text: entry.trim().startsWith(`${index + 1}.`)
                ? entry.trim()
                : `${index + 1}. ${entry.trim()}`,
              font: "Times New Roman",
              size: 28, // 14pt
              color: "000000", // Black color
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360, // 1.5 line spacing
          },
          indent: {
            left: convertInchesToTwip(0.5),
            hanging: convertInchesToTwip(0.25),
          },
        })
    );

  return entries;
}

/**
 * Format text content for academic style
 * Removes markdown and ensures proper formatting
 */
export function formatAcademicText(text: string): string {
  if (!text) return "";

  return text
    .replace(/#{1,6}\s/g, "") // Remove markdown headers
    .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.+?)\*/g, "$1") // Remove italic
    .replace(/`{3}[\s\S]*?`{3}/g, "") // Remove code blocks
    .replace(/`(.+?)`/g, "$1") // Remove inline code
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remove links but keep text
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, "") // Remove images
    .replace(/^\s*[-*+]\s/gm, "") // Remove bullet points
    .replace(/^\s*\d+\.\s/gm, "") // Remove numbered lists
    .trim();
}
