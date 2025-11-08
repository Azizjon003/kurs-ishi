import {
  Paragraph,
  TextRun,
  AlignmentType,
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

/**
 * Interface for table data
 */
export interface TableData {
  headers: string[];
  rows: string[][];
  caption?: string;
}

/**
 * Interface for diagram/figure
 */
export interface DiagramData {
  title: string;
  description: string;
  figureNumber?: string;
}

/**
 * Interface for formula
 */
export interface FormulaData {
  formula: string;
  description?: string;
  number?: string;
}

/**
 * Interface for code block
 */
export interface CodeBlockData {
  code: string;
  language?: string;
  caption?: string;
}

/**
 * Create a professional academic table
 *
 * @param tableData - Table structure with headers and rows
 * @returns Table element with proper formatting
 */
export function createAcademicTable(tableData: TableData): (Table | Paragraph)[] {
  const elements: (Table | Paragraph)[] = [];

  // Add caption if provided
  if (tableData.caption) {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: tableData.caption,
            font: "Times New Roman",
            size: 28, // 14pt
            bold: true,
            color: "000000",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: {
          before: 200,
          after: 120,
        },
      })
    );
  }

  // Create table
  const table = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    },
    rows: [
      // Header row
      new TableRow({
        tableHeader: true,
        children: tableData.headers.map(
          (header) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: header,
                      font: "Times New Roman",
                      size: 28, // 14pt
                      bold: true,
                      color: "000000",
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: {
                type: ShadingType.SOLID,
                color: "E0E0E0", // Light gray for header
              },
              verticalAlign: VerticalAlign.CENTER,
              margins: {
                top: convertInchesToTwip(0.05),
                bottom: convertInchesToTwip(0.05),
                left: convertInchesToTwip(0.08),
                right: convertInchesToTwip(0.08),
              },
            })
        ),
      }),
      // Data rows
      ...tableData.rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cell,
                          font: "Times New Roman",
                          size: 28, // 14pt
                          color: "000000",
                        }),
                      ],
                      alignment: AlignmentType.LEFT,
                    }),
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                  margins: {
                    top: convertInchesToTwip(0.05),
                    bottom: convertInchesToTwip(0.05),
                    left: convertInchesToTwip(0.08),
                    right: convertInchesToTwip(0.08),
                  },
                })
            ),
          })
      ),
    ],
  });

  elements.push(table);

  // Add spacing after table
  elements.push(
    new Paragraph({
      text: "",
      spacing: { after: 200 },
    })
  );

  return elements;
}

/**
 * Create diagram/figure placeholder with description
 *
 * @param diagramData - Diagram information
 * @returns Paragraphs describing the diagram
 */
export function createDiagramDescription(
  diagramData: DiagramData
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Figure title
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: diagramData.figureNumber
            ? `${diagramData.figureNumber}. ${diagramData.title}`
            : diagramData.title,
          font: "Times New Roman",
          size: 28, // 14pt
          bold: true,
          color: "000000",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: {
        before: 200,
        after: 120,
      },
    })
  );

  // Placeholder box for diagram
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "[Diagram: " + diagramData.description + "]",
          font: "Times New Roman",
          size: 26, // 13pt
          italics: true,
          color: "666666", // Gray color for placeholder
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 120,
      },
      border: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
      },
    })
  );

  // Description
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: diagramData.description,
          font: "Times New Roman",
          size: 26, // 13pt
          color: "000000",
        }),
      ],
      alignment: AlignmentType.JUSTIFIED,
      spacing: {
        after: 200,
      },
      indent: {
        firstLine: convertInchesToTwip(0.5),
      },
    })
  );

  return paragraphs;
}

/**
 * Convert LaTeX formula to Unicode mathematical symbols
 *
 * @param latex - LaTeX formula string
 * @returns Unicode formatted string
 */
export function convertLatexToUnicode(latex: string): string {
  let result = latex;

  // Remove LaTeX delimiters first
  result = result.replace(/\\\(/g, "").replace(/\\\)/g, "");
  result = result.replace(/\\\[/g, "").replace(/\\\]/g, "");
  result = result.replace(/\$/g, "");

  // Greek letters (more comprehensive)
  const greekLetters: { [key: string]: string } = {
    "\\alpha": "α", "\\beta": "β", "\\gamma": "γ", "\\delta": "δ",
    "\\epsilon": "ε", "\\varepsilon": "ε", "\\zeta": "ζ", "\\eta": "η",
    "\\theta": "θ", "\\vartheta": "θ", "\\iota": "ι", "\\kappa": "κ",
    "\\lambda": "λ", "\\mu": "μ", "\\nu": "ν", "\\xi": "ξ",
    "\\pi": "π", "\\varpi": "π", "\\rho": "ρ", "\\varrho": "ρ",
    "\\sigma": "σ", "\\varsigma": "ς", "\\tau": "τ", "\\upsilon": "υ",
    "\\phi": "φ", "\\varphi": "φ", "\\chi": "χ", "\\psi": "ψ", "\\omega": "ω",
    "\\Gamma": "Γ", "\\Delta": "Δ", "\\Theta": "Θ", "\\Lambda": "Λ",
    "\\Xi": "Ξ", "\\Pi": "Π", "\\Sigma": "Σ", "\\Upsilon": "Υ",
    "\\Phi": "Φ", "\\Psi": "Ψ", "\\Omega": "Ω"
  };

  // Mathematical operators
  const operators: { [key: string]: string } = {
    "\\times": "×", "\\cdot": "·", "\\div": "÷", "\\pm": "±", "\\mp": "∓",
    "\\leq": "≤", "\\le": "≤", "\\geq": "≥", "\\ge": "≥",
    "\\neq": "≠", "\\ne": "≠", "\\approx": "≈", "\\equiv": "≡",
    "\\sim": "∼", "\\propto": "∝", "\\infty": "∞",
    "\\partial": "∂", "\\nabla": "∇", "\\to": "→",
    "\\rightarrow": "→", "\\leftarrow": "←", "\\Rightarrow": "⇒", "\\Leftarrow": "⇐",
    "\\sum": "∑", "\\prod": "∏", "\\int": "∫",
    "\\oint": "∮", "\\iint": "∬", "\\iiint": "∭",
    "\\sqrt": "√", "\\in": "∈", "\\notin": "∉",
    "\\subset": "⊂", "\\supset": "⊃", "\\subseteq": "⊆", "\\supseteq": "⊇",
    "\\cap": "∩", "\\cup": "∪", "\\emptyset": "∅",
    "\\forall": "∀", "\\exists": "∃", "\\neg": "¬",
    "\\land": "∧", "\\lor": "∨", "\\angle": "∠",
    "\\perp": "⊥", "\\parallel": "∥", "\\ldots": "…", "\\cdots": "⋯"
  };

  // Replace Greek letters (order matters - longest first)
  const sortedGreek = Object.entries(greekLetters).sort((a, b) => b[0].length - a[0].length);
  for (const [latex, unicode] of sortedGreek) {
    result = result.replace(new RegExp(latex.replace(/\\/g, "\\\\"), "g"), unicode);
  }

  // Replace operators (order matters - longest first)
  const sortedOps = Object.entries(operators).sort((a, b) => b[0].length - a[0].length);
  for (const [latex, unicode] of sortedOps) {
    result = result.replace(new RegExp(latex.replace(/\\/g, "\\\\"), "g"), unicode);
  }

  // Handle fractions: \frac{a}{b} → a/b (using fraction slash)
  result = result.replace(/\\frac\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, (match, num, den) => {
    // Use fraction slash ⁄ for better visual
    // For simple single-digit fractions, use Unicode fractions if available
    const simpleNum = num.trim();
    const simpleDen = den.trim();

    // Unicode fraction mapping
    const unicodeFractions: { [key: string]: string } = {
      "1/2": "½", "1/3": "⅓", "2/3": "⅔",
      "1/4": "¼", "3/4": "¾",
      "1/5": "⅕", "2/5": "⅖", "3/5": "⅗", "4/5": "⅘",
      "1/6": "⅙", "5/6": "⅚",
      "1/7": "⅐", "1/8": "⅛", "3/8": "⅜", "5/8": "⅝", "7/8": "⅞",
      "1/9": "⅑", "1/10": "⅒"
    };

    const fractionKey = `${simpleNum}/${simpleDen}`;
    if (unicodeFractions[fractionKey]) {
      return unicodeFractions[fractionKey];
    }

    // For complex fractions, use cleaner format with fraction slash
    return `${num}⁄${den}`;
  });

  // Handle square root: \sqrt{x} → √(x) or \sqrt[n]{x} → ⁿ√(x)
  result = result.replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, (match, root, content) => {
    return `${root}√(${content})`;
  });
  result = result.replace(/\\sqrt\{([^}]+)\}/g, "√($1)");

  // Handle limits: \lim_{x \to a}
  result = result.replace(/\\lim/g, "lim");

  // Handle text inside \text{...}
  result = result.replace(/\\text\{([^}]+)\}/g, "$1");

  // Superscripts (for simple cases)
  const superscripts: { [key: string]: string } = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾",
    "a": "ᵃ", "b": "ᵇ", "c": "ᶜ", "d": "ᵈ", "e": "ᵉ",
    "f": "ᶠ", "g": "ᵍ", "h": "ʰ", "i": "ⁱ", "j": "ʲ",
    "k": "ᵏ", "l": "ˡ", "m": "ᵐ", "n": "ⁿ", "o": "ᵒ",
    "p": "ᵖ", "r": "ʳ", "s": "ˢ", "t": "ᵗ", "u": "ᵘ",
    "v": "ᵛ", "w": "ʷ", "x": "ˣ", "y": "ʸ", "z": "ᶻ"
  };

  // Subscripts
  const subscripts: { [key: string]: string } = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
    "a": "ₐ", "e": "ₑ", "h": "ₕ", "i": "ᵢ", "j": "ⱼ",
    "k": "ₖ", "l": "ₗ", "m": "ₘ", "n": "ₙ", "o": "ₒ",
    "p": "ₚ", "r": "ᵣ", "s": "ₛ", "t": "ₜ", "u": "ᵤ",
    "v": "ᵥ", "x": "ₓ"
  };

  // Handle superscripts: x^2 → x² or x^{10} → x¹⁰
  result = result.replace(/\^(\d|[+\-=()]|[a-z])/gi, (match, char) => {
    return superscripts[char] || `^${char}`;
  });
  result = result.replace(/\^\{([^}]+)\}/g, (match, content) => {
    return content.split("").map((c: string) => superscripts[c] || c).join("");
  });

  // Handle subscripts: x_i → xᵢ or x_{total} → x_total
  result = result.replace(/_(\d|[+\-=()]|[a-z])/gi, (match, char) => {
    return subscripts[char] || `_${char}`;
  });
  result = result.replace(/_{([^}]+)}/g, (match, content) => {
    // For longer subscripts, keep them as is with underscore
    if (content.length > 3) {
      return `_${content}`;
    }
    return content.split("").map((c: string) => subscripts[c] || c).join("");
  });

  // Clean up remaining LaTeX commands
  result = result.replace(/\\[a-zA-Z]+/g, "");

  // Clean up extra spaces and braces
  result = result.replace(/\s+/g, " ");
  result = result.replace(/[{}]/g, "");

  // Cleanup comma formatting in numbers
  result = result.replace(/(\d),(\d)/g, "$1,$2");

  return result.trim();
}

/**
 * Create formula/equation display
 *
 * @param formulaData - Formula information
 * @returns Paragraphs with formatted formula
 */
export function createFormulaDisplay(formulaData: FormulaData): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Convert LaTeX to Unicode
  const unicodeFormula = convertLatexToUnicode(formulaData.formula);

  // Formula text (centered)
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: unicodeFormula,
          font: "Cambria Math", // Math font
          size: 28, // 14pt
          color: "000000",
        }),
        ...(formulaData.number
          ? [
              new TextRun({
                text: `     (${formulaData.number})`,
                font: "Times New Roman",
                size: 28,
                color: "000000",
              }),
            ]
          : []),
      ],
      alignment: AlignmentType.CENTER,
      spacing: {
        before: 160,
        after: 160,
      },
    })
  );

  // Description if provided
  if (formulaData.description) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: formulaData.description,
            font: "Times New Roman",
            size: 28,
            color: "000000",
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        spacing: {
          after: 200,
        },
        indent: {
          firstLine: convertInchesToTwip(0.5),
        },
      })
    );
  }

  return paragraphs;
}

/**
 * Create code block display
 *
 * @param codeData - Code block information
 * @returns Paragraphs with formatted code block
 */
export function createCodeBlock(codeData: CodeBlockData): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Add language caption if provided
  if (codeData.language) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Code (${codeData.language}):`,
            font: "Courier New",
            size: 24, // 12pt
            bold: true,
            color: "2C3E50",
          }),
        ],
        spacing: {
          before: 160,
          after: 80,
        },
      })
    );
  }

  // Code block with background
  const codeLines = codeData.code.split("\n");
  for (const line of codeLines) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: line || " ", // Empty line needs space
            font: "Courier New",
            size: 24, // 12pt
            color: "2C3E50",
          }),
        ],
        shading: {
          type: ShadingType.SOLID,
          color: "F5F5F5", // Light gray background
        },
        spacing: {
          after: 0,
          line: 276, // Single line spacing for code
        },
        indent: {
          left: convertInchesToTwip(0.3),
          right: convertInchesToTwip(0.3),
        },
        border: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
          left: { style: BorderStyle.SINGLE, size: 6, color: "3498DB" }, // Blue left border
          right: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
        },
      })
    );
  }

  // Add spacing after code block
  paragraphs.push(
    new Paragraph({
      text: "",
      spacing: { after: 200 },
    })
  );

  return paragraphs;
}

/**
 * Parse content and detect tables, formulas, diagrams, code blocks
 * Returns structured content elements
 */
export function parseEnhancedContent(content: string): {
  type: "text" | "table" | "diagram" | "formula" | "code";
  data: any;
}[] {
  const elements: {
    type: "text" | "table" | "diagram" | "formula" | "code";
    data: any;
  }[] = [];

  // First, extract code blocks ```language ... ```
  let processedContent = content;
  processedContent = processedContent.replace(/```(\w*)\n([\s\S]*?)```/g, (match, language, code) => {
    return `\n[CODE:${language || ""}]\n${code.trim()}\n[/CODE]\n`;
  });

  // Extract all formulas (LaTeX display \[...\] and inline \(...\))
  const formulaPlaceholders: string[] = [];

  // Extract display math \[ ... \] (can be multiline)
  processedContent = processedContent.replace(/\\\[([\s\S]*?)\\\]/g, (match, formula) => {
    const placeholder = `__FORMULA_${formulaPlaceholders.length}__`;
    formulaPlaceholders.push(formula.trim());
    return `\n[FORMULA: ${formula.trim()}]\n`;
  });

  // Extract inline math \( ... \)
  processedContent = processedContent.replace(/\\\((.*?)\\\)/g, (match, formula) => {
    const placeholder = `__FORMULA_${formulaPlaceholders.length}__`;
    formulaPlaceholders.push(formula.trim());
    return `[FORMULA: ${formula.trim()}]`;
  });

  // Split content by markers
  const lines = processedContent.split("\n");
  let currentText = "";
  let inTable = false;
  let tableLines: string[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLanguage = "";

  for (const line of lines) {
    // Detect code block start [CODE:language]
    if (line.trim().startsWith("[CODE:")) {
      if (currentText.trim()) {
        elements.push({ type: "text", data: currentText.trim() });
        currentText = "";
      }
      inCodeBlock = true;
      const match = line.match(/\[CODE:(\w*)\]/);
      codeLanguage = match ? match[1] : "";
      codeLines = [];
      continue;
    }
    // Detect code block end [/CODE]
    else if (line.trim() === "[/CODE]") {
      if (inCodeBlock) {
        elements.push({
          type: "code",
          data: {
            code: codeLines.join("\n"),
            language: codeLanguage,
          },
        });
        inCodeBlock = false;
        codeLines = [];
        codeLanguage = "";
      }
      continue;
    }
    // Inside code block
    else if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }
    // Detect table start (markdown table format)
    if (line.trim().match(/^\|.*\|$/)) {
      if (currentText.trim()) {
        elements.push({ type: "text", data: currentText.trim() });
        currentText = "";
      }
      inTable = true;
      tableLines.push(line);
    } else if (inTable) {
      if (line.trim().match(/^\|.*\|$/)) {
        tableLines.push(line);
      } else {
        // End of table
        if (tableLines.length >= 2) {
          // Parse table
          const tableData = parseMarkdownTable(tableLines);
          if (tableData) {
            elements.push({ type: "table", data: tableData });
          }
        }
        inTable = false;
        tableLines = [];
        currentText += line + "\n";
      }
    }
    // Detect diagram marker
    else if (line.trim().startsWith("[DIAGRAM:")) {
      if (currentText.trim()) {
        elements.push({ type: "text", data: currentText.trim() });
        currentText = "";
      }
      const match = line.match(/\[DIAGRAM:\s*(.+?)\]/);
      if (match) {
        elements.push({
          type: "diagram",
          data: {
            title: "Diagram",
            description: match[1],
          },
        });
      }
    }
    // Detect formula marker [FORMULA: ...]
    else if (line.trim().startsWith("[FORMULA:")) {
      if (currentText.trim()) {
        elements.push({ type: "text", data: currentText.trim() });
        currentText = "";
      }
      // Use greedy match to capture everything including nested brackets
      // Match from [FORMULA: to the LAST ] on the line
      const match = line.match(/\[FORMULA:\s*(.+)\]/);
      if (match) {
        elements.push({
          type: "formula",
          data: {
            formula: match[1].trim(),
          },
        });
      }
    } else {
      currentText += line + "\n";
    }
  }

  // Add remaining text
  if (currentText.trim()) {
    elements.push({ type: "text", data: currentText.trim() });
  }

  // Handle final table
  if (inTable && tableLines.length >= 2) {
    const tableData = parseMarkdownTable(tableLines);
    if (tableData) {
      elements.push({ type: "table", data: tableData });
    }
  }

  return elements;
}

/**
 * Parse markdown table format into TableData
 */
function parseMarkdownTable(lines: string[]): TableData | null {
  if (lines.length < 2) return null;

  // Remove leading/trailing pipes and split
  const parseRow = (line: string) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());

  const headers = parseRow(lines[0]);

  // Skip separator line (line with dashes)
  const dataLines = lines.slice(2);

  if (dataLines.length === 0) return null;

  const rows = dataLines.map(parseRow);

  return {
    headers,
    rows,
  };
}

/**
 * Detect if text contains comparative analysis or statistics
 * Returns structured data for table creation
 */
export function extractComparisonData(text: string): TableData | null {
  // Look for patterns like "X has Y, Z has W"
  // This is a simple heuristic - in real implementation, use NLP

  // Example: detect if text has multiple items with attributes
  const lines = text.split("\n");
  const dataLines = lines.filter(
    (line) =>
      line.includes(":") &&
      (line.toLowerCase().includes("features") ||
        line.toLowerCase().includes("pricing") ||
        line.toLowerCase().includes("vs") ||
        line.toLowerCase().includes("comparison"))
  );

  if (dataLines.length >= 2) {
    // Try to extract structured data
    // This is simplified - real implementation would be more sophisticated
    return null; // Placeholder for now
  }

  return null;
}
