/**
 * Page counting utility for course paper content
 *
 * Calculates approximate page count based on word count
 * Assumptions for Times New Roman 14pt, 1.5 line spacing:
 * - 1 page ≈ 250-300 words (average 275)
 */

export interface PageCountEstimate {
  totalWords: number;
  totalPages: number;
  introduction: { words: number; pages: number };
  conclusion: { words: number; pages: number };
  chapters: Array<{
    chapterTitle: string;
    words: number;
    pages: number;
    sections: Array<{
      title: string;
      words: number;
      pages: number;
    }>;
  }>;
  targetPages: number;
  difference: number;
  percentageOfTarget: number;
  meetsTarget: boolean;
}

/**
 * Count words in text (simple word count)
 */
function countWords(text: string): number {
  if (!text) return 0;
  // Remove extra whitespace and count words
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Convert word count to page count
 * Using average of 275 words per page for Times New Roman 14pt, 1.5 spacing
 */
function wordsToPages(words: number): number {
  const WORDS_PER_PAGE = 275;
  return Math.round((words / WORDS_PER_PAGE) * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate total page count estimate for course paper
 */
export function calculatePageCount(data: {
  introduction: string;
  conclusion: string;
  chapters: Array<{
    chapterTitle: string;
    sections: Array<{
      title: string;
      content: string;
    }>;
  }>;
  targetPages?: number;
}): PageCountEstimate {
  const targetPages = data.targetPages || 30;

  // Count introduction
  const introWords = countWords(data.introduction);
  const introPages = wordsToPages(introWords);

  // Count conclusion
  const conclusionWords = countWords(data.conclusion);
  const conclusionPages = wordsToPages(conclusionWords);

  // Count chapters
  const chaptersData = data.chapters.map(chapter => {
    const sections = chapter.sections.map(section => {
      const sectionWords = countWords(section.content);
      return {
        title: section.title,
        words: sectionWords,
        pages: wordsToPages(sectionWords),
      };
    });

    const chapterWords = sections.reduce((sum, s) => sum + s.words, 0);

    return {
      chapterTitle: chapter.chapterTitle,
      words: chapterWords,
      pages: wordsToPages(chapterWords),
      sections,
    };
  });

  // Calculate totals (add ~3 pages for cover, TOC, bibliography)
  const FIXED_PAGES = 3;
  const contentWords = introWords + conclusionWords +
    chaptersData.reduce((sum, ch) => sum + ch.words, 0);
  const contentPages = wordsToPages(contentWords);
  const totalPages = contentPages + FIXED_PAGES;

  const difference = totalPages - targetPages;
  const percentageOfTarget = Math.round((totalPages / targetPages) * 100);
  const meetsTarget = totalPages >= targetPages * 0.9; // Within 90% is acceptable

  return {
    totalWords: contentWords,
    totalPages,
    introduction: {
      words: introWords,
      pages: introPages,
    },
    conclusion: {
      words: conclusionWords,
      pages: conclusionPages,
    },
    chapters: chaptersData,
    targetPages,
    difference,
    percentageOfTarget,
    meetsTarget,
  };
}

/**
 * Generate a formatted report of page count
 */
export function generatePageCountReport(estimate: PageCountEstimate): string {
  const lines: string[] = [];

  lines.push("\n" + "=".repeat(60));
  lines.push("📄 PAGE COUNT ESTIMATE");
  lines.push("=".repeat(60));

  lines.push(`\nTarget Pages: ${estimate.targetPages} pages`);
  lines.push(`Actual Pages: ${estimate.totalPages} pages (${estimate.totalWords.toLocaleString()} words)`);
  lines.push(`Difference: ${estimate.difference >= 0 ? '+' : ''}${estimate.difference} pages`);
  lines.push(`Completion: ${estimate.percentageOfTarget}% of target`);
  lines.push(`Status: ${estimate.meetsTarget ? '✅ MEETS TARGET' : '⚠️  BELOW TARGET'}`);

  lines.push(`\n${"─".repeat(60)}`);
  lines.push("BREAKDOWN:");
  lines.push(`${"─".repeat(60)}`);

  lines.push(`\nIntroduction: ${estimate.introduction.pages} pages (${estimate.introduction.words} words)`);

  estimate.chapters.forEach((chapter, index) => {
    lines.push(`\nChapter ${index + 1}: ${chapter.chapterTitle}`);
    lines.push(`  Total: ${chapter.pages} pages (${chapter.words} words)`);
    chapter.sections.forEach((section, sIdx) => {
      lines.push(`  ${index + 1}.${sIdx + 1} ${section.title}: ${section.pages} pages (${section.words} words)`);
    });
  });

  lines.push(`\nConclusion: ${estimate.conclusion.pages} pages (${estimate.conclusion.words} words)`);
  lines.push(`\nFixed Pages (Cover, TOC, Bibliography): ~3 pages`);

  lines.push(`\n${"=".repeat(60)}`);

  if (!estimate.meetsTarget) {
    const wordsNeeded = Math.ceil((estimate.targetPages - estimate.totalPages) * 275);
    lines.push(`\n⚠️  NOTE: Need approximately ${wordsNeeded.toLocaleString()} more words`);
    lines.push(`   to reach target of ${estimate.targetPages} pages`);
    lines.push(`${"=".repeat(60)}`);
  }

  return lines.join('\n');
}

/**
 * Check if content meets page requirements
 */
export function validatePageCount(
  estimate: PageCountEstimate,
  minPages?: number,
  maxPages?: number
): { valid: boolean; message: string } {
  const min = minPages || estimate.targetPages * 0.9;
  const max = maxPages || estimate.targetPages * 1.1;

  if (estimate.totalPages < min) {
    return {
      valid: false,
      message: `Content too short: ${estimate.totalPages} pages (minimum: ${min} pages). Need ${Math.ceil((min - estimate.totalPages) * 275)} more words.`,
    };
  }

  if (estimate.totalPages > max) {
    return {
      valid: false,
      message: `Content too long: ${estimate.totalPages} pages (maximum: ${max} pages). Need to reduce by ${Math.ceil((estimate.totalPages - max) * 275)} words.`,
    };
  }

  return {
    valid: true,
    message: `Content length is appropriate: ${estimate.totalPages} pages (target: ${estimate.targetPages} pages)`,
  };
}
