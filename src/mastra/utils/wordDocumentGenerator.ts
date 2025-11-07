import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  PageBreak,
  convertInchesToTwip,
} from "docx";
import * as fs from "fs";
import * as path from "path";

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
            // Main Title
            createMainTitle(data.chapterTitle),
            createPageBreak(),

            // Table of Contents (Plan)
            ...createTableOfContents(data),
            createPageBreak(),

            // Introduction (Kirish)
            createHeading1("KIRISH"),
            ...createParagraphs(data.introduction),
            createPageBreak(),

            // Chapter I - Theory (Nazariy asoslar)
            ...createChapterContent(data.chapters[0], 1),
            createPageBreak(),

            // Chapter II - Analysis (Amaliy/Tahliliy qism)
            ...createChapterContent(data.chapters[1], 2),
            createPageBreak(),

            // Chapter III - Improvements (Takomillashtirish takliflari)
            ...createChapterContent(data.chapters[2], 3),
            createPageBreak(),

            // Conclusion (Xulosa)
            createHeading1("XULOSA"),
            ...createParagraphs(data.conclusion),
            createPageBreak(),

            // Bibliography (Foydalanilgan adabiyotlar)
            createHeading1("FOYDALANILGAN ADABIYOTLAR"),
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
 * Create main title paragraph
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
    spacing: {
      before: 240,
      after: 480,
    },
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
    spacing: {
      before: 360, // Extra space before chapter
      after: 280,
    },
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
    spacing: {
      before: 280,
      after: 200,
    },
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
function createTableOfContents(data: CoursePaperData): Paragraph[] {
  const paragraphs: Paragraph[] = [
    createHeading1("REJA (MUNDARIJA)"),
    new Paragraph({
      text: "",
      spacing: { after: 200 },
    }),
  ];

  // Introduction
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "KIRISH",
          font: "Times New Roman",
          size: 28, // 14pt
          color: "000000",
        }),
      ],
      spacing: { after: 120 },
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
        spacing: { after: 100, before: 100 },
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
          spacing: { after: 80 },
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
          text: "XULOSA",
          font: "Times New Roman",
          size: 28, // 14pt
          color: "000000",
        }),
      ],
      spacing: { after: 120, before: 120 },
      alignment: AlignmentType.JUSTIFIED,
    })
  );

  // Bibliography
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "FOYDALANILGAN ADABIYOTLAR",
          font: "Times New Roman",
          size: 28, // 14pt
          color: "000000",
        }),
      ],
      spacing: { after: 120 },
      alignment: AlignmentType.JUSTIFIED,
    })
  );

  return paragraphs;
}

/**
 * Create paragraphs from text content
 * Handles markdown formatting and long text blocks
 */
function createParagraphs(text: string): Paragraph[] {
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
          after: 200
        },
      }),
    ];
  }

  // Clean markdown symbols
  const cleanText = text
    .replace(/#{1,6}\s/g, "") // Remove markdown headers
    .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold markdown
    .replace(/\*(.+?)\*/g, "$1") // Remove italic markdown
    .replace(/`{1,3}(.+?)`{1,3}/g, "$1") // Remove code blocks
    .trim();

  // Split into paragraphs (by double newline or single newline)
  const paragraphs = cleanText
    .split(/\n\n+|\n/)
    .filter((p) => p.trim() !== "")
    .map(
      (paragraph) =>
        new Paragraph({
          children: [
            new TextRun({
              text: paragraph.trim(),
              font: "Times New Roman",
              size: 28, // 14pt = 28 half-points
              color: "000000", // Black color
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360, // 1.5 line spacing
            after: 200,
          },
          indent: {
            firstLine: convertInchesToTwip(0.5), // First line indent
          },
        })
    );

  return paragraphs;
}

/**
 * Create chapter content with sections
 */
function createChapterContent(
  chapter: Chapter,
  chapterNumber: number
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Chapter title
  paragraphs.push(createHeading1(chapter.chapterTitle.toUpperCase()));

  // Sections
  chapter.sections.forEach((section) => {
    // Section title
    paragraphs.push(createHeading2(section.title));

    // Section content
    if (section.content && section.content.trim() !== "") {
      paragraphs.push(...createParagraphs(section.content));
    } else {
      paragraphs.push(
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
            after: 200
          },
        })
      );
    }

    // Add spacing between sections
    paragraphs.push(
      new Paragraph({
        text: "",
        spacing: { after: 240 },
      })
    );
  });

  return paragraphs;
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
            after: 150,
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
