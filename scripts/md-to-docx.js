/* ─────────────────────────────────────────────────────────────────────
 * Markdown → DOCX converter
 *
 * Simple, dependency-minimal converter for DOTBIZ review documents.
 * Handles: headings (H1-H4), paragraphs, bold, italic, inline code,
 *          bullet lists, numbered lists, tables (with alignment),
 *          blockquotes, code blocks, horizontal rules, links.
 *
 * Not supported (not needed for our docs):
 *   - images, nested lists deeper than 2 levels, task lists, HTML,
 *     footnotes, math.
 *
 * Usage:
 *   node scripts/md-to-docx.js <input.md> <output.docx>
 * ───────────────────────────────────────────────────────────────────── */

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, LevelFormat, PageBreak,
} = require("docx");
const fs = require("fs");
const path = require("path");

/* ── Branding ── */
const ORANGE = "FF6000";
const DARK = "1a1a2e";
const GRAY = "666666";
const LIGHT = "F5F5F5";
const MUTED = "999999";

const tableBorder = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
const tableBorders = {
  top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder,
  insideHorizontal: tableBorder, insideVertical: tableBorder,
};

/* ─────────────────────────────────────────────────────────────
 * Inline formatting — handles **bold**, *italic*, `code`, [text](url)
 * Returns array of { text, style } — callers build TextRun with extra overrides.
 * ───────────────────────────────────────────────────────────── */
function tokenizeInline(text) {
  const patterns = [
    { regex: /\*\*([^*]+?)\*\*/, style: { bold: true } },
    { regex: /__([^_]+?)__/,      style: { bold: true } },
    { regex: /`([^`]+?)`/,        style: { code: true } },
    { regex: /\*([^*]+?)\*/,      style: { italics: true } },
    { regex: /_([^_]+?)_/,        style: { italics: true } },
    { regex: /~~([^~]+?)~~/,      style: { strike: true } },
    { regex: /\[([^\]]+)\]\(([^)]+)\)/, style: { link: true } },
  ];
  function tok(str) {
    if (!str) return [];
    let earliest = null;
    let earliestPattern = null;
    for (const p of patterns) {
      const m = str.match(p.regex);
      if (m && (earliest === null || m.index < earliest.index)) {
        earliest = m;
        earliestPattern = p;
      }
    }
    if (!earliest) return [{ text: str, style: {} }];
    const before = str.slice(0, earliest.index);
    const after = str.slice(earliest.index + earliest[0].length);
    const matched = earliestPattern.style.link
      ? { text: earliest[1], style: { link: true, url: earliest[2] } }
      : { text: earliest[1], style: earliestPattern.style };
    return [
      ...(before ? [{ text: before, style: {} }] : []),
      matched,
      ...tok(after),
    ];
  }
  return tok(text);
}

function tokenToRun(t, override = {}) {
  const opts = { text: t.text, font: "Arial", size: 22, ...override };
  if (t.style.bold) opts.bold = true;
  if (t.style.italics) opts.italics = true;
  if (t.style.strike) opts.strike = true;
  if (t.style.code) {
    opts.font = "Consolas";
    opts.shading = { type: ShadingType.CLEAR, fill: LIGHT, color: "auto" };
    opts.color = "c7254e";
  }
  if (t.style.link) {
    opts.color = "2563eb";
    opts.underline = {};
  }
  /* Override wins */
  if (override.bold !== undefined) opts.bold = override.bold;
  if (override.italics !== undefined) opts.italics = override.italics;
  if (override.color) opts.color = override.color;
  if (override.size) opts.size = override.size;
  if (override.font) opts.font = override.font;
  return new TextRun(opts);
}

function parseInline(text, override) {
  return tokenizeInline(text).map(t => tokenToRun(t, override || {}));
}

/* ─────────────────────────────────────────────────────────────
 * Table parser — converts a markdown table into a docx Table
 * ───────────────────────────────────────────────────────────── */
function parseTable(lines, startIdx) {
  const rows = [];
  let i = startIdx;
  while (i < lines.length && lines[i].trim().startsWith("|")) {
    rows.push(lines[i].trim());
    i++;
  }
  if (rows.length < 2) return null;

  /* Split cells, strip wrapping pipes */
  const splitRow = (r) => r.replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim());
  const headerCells = splitRow(rows[0]);
  const alignRow = splitRow(rows[1]);
  const bodyRows = rows.slice(2).map(splitRow);

  /* Alignment from separator row: :--, :--:, --: */
  const aligns = alignRow.map(cell => {
    const left = cell.startsWith(":");
    const right = cell.endsWith(":");
    if (left && right) return AlignmentType.CENTER;
    if (right) return AlignmentType.RIGHT;
    return AlignmentType.LEFT;
  });

  const mkCell = (text, align, isHeader) => new TableCell({
    borders: tableBorders,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    shading: isHeader ? { type: ShadingType.CLEAR, fill: DARK, color: "auto" } : undefined,
    children: [new Paragraph({
      alignment: align,
      children: isHeader
        ? [new TextRun({ text, font: "Arial", size: 20, bold: true, color: "FFFFFF" })]
        : parseInline(text, { size: 20 }),
    })],
  });

  const headerRow = new TableRow({
    tableHeader: true,
    children: headerCells.map((c, i) => mkCell(c, aligns[i] || AlignmentType.LEFT, true)),
  });
  const dataRows = bodyRows.map(cells => new TableRow({
    children: cells.map((c, i) => mkCell(c, aligns[i] || AlignmentType.LEFT, false)),
  }));

  return {
    table: new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...dataRows],
    }),
    nextIdx: i,
  };
}

/* ─────────────────────────────────────────────────────────────
 * Main markdown parser
 * ───────────────────────────────────────────────────────────── */
function parseMarkdown(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const children = [];
  let i = 0;

  /* Skip leading blockquote frontmatter-like blocks (> lines at top) */
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    /* Empty line — small spacer */
    if (!trimmed) {
      i++;
      continue;
    }

    /* Horizontal rule */
    if (/^[-*_]{3,}$/.test(trimmed)) {
      children.push(new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ORANGE, space: 4 } },
        children: [new TextRun({ text: " " })],
        spacing: { before: 120, after: 120 },
      }));
      i++;
      continue;
    }

    /* Headings */
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const headingMap = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
      };
      const sizeMap = { 1: 36, 2: 28, 3: 24, 4: 22, 5: 20, 6: 20 };
      const colorMap = { 1: DARK, 2: ORANGE, 3: DARK, 4: GRAY, 5: GRAY, 6: MUTED };
      children.push(new Paragraph({
        heading: headingMap[level] || HeadingLevel.HEADING_6,
        spacing: { before: level === 1 ? 400 : 280, after: level === 1 ? 200 : 140 },
        children: [new TextRun({
          text,
          font: "Arial",
          size: sizeMap[level] || 22,
          bold: true,
          color: colorMap[level] || DARK,
        })],
      }));
      i++;
      continue;
    }

    /* Table */
    if (trimmed.startsWith("|") && i + 1 < lines.length && /^\|[\s\-:|]+\|?$/.test(lines[i + 1].trim())) {
      const result = parseTable(lines, i);
      if (result) {
        children.push(result.table);
        /* Small spacer after table */
        children.push(new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 120 } }));
        i = result.nextIdx;
        continue;
      }
    }

    /* Blockquote — "> " prefix */
    if (trimmed.startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      const text = quoteLines.join(" ");
      children.push(new Paragraph({
        indent: { left: 360 },
        border: { left: { style: BorderStyle.SINGLE, size: 18, color: ORANGE, space: 12 } },
        spacing: { before: 100, after: 100 },
        shading: { type: ShadingType.CLEAR, fill: "FFF8F0", color: "auto" },
        children: parseInline(text, { italics: true, color: GRAY }),
      }));
      continue;
    }

    /* Code block — ``` fenced */
    if (trimmed.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; /* skip closing ``` */
      children.push(new Paragraph({
        shading: { type: ShadingType.CLEAR, fill: LIGHT, color: "auto" },
        spacing: { before: 100, after: 100 },
        children: codeLines.flatMap((ln, idx) => {
          const runs = [new TextRun({ text: ln, font: "Consolas", size: 18, color: "333333" })];
          if (idx < codeLines.length - 1) runs.push(new TextRun({ text: "\n", break: 1 }));
          return runs;
        }),
      }));
      continue;
    }

    /* Unordered list item */
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
    if (ulMatch) {
      const indent = Math.floor(ulMatch[1].length / 2);
      children.push(new Paragraph({
        numbering: { reference: "bullets", level: Math.min(indent, 2) },
        spacing: { before: 40, after: 40 },
        children: parseInline(ulMatch[2]),
      }));
      i++;
      continue;
    }

    /* Ordered list item */
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (olMatch) {
      const indent = Math.floor(olMatch[1].length / 2);
      children.push(new Paragraph({
        numbering: { reference: "numbers", level: Math.min(indent, 2) },
        spacing: { before: 40, after: 40 },
        children: parseInline(olMatch[2]),
      }));
      i++;
      continue;
    }

    /* Regular paragraph — collect consecutive non-empty lines */
    const paraLines = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !lines[i].trim().match(/^(#{1,6}\s|[-*+]\s|\d+\.\s|\||>|```|[-*_]{3,}$)/)) {
      paraLines.push(lines[i]);
      i++;
    }
    const paraText = paraLines.join(" ");
    children.push(new Paragraph({
      spacing: { before: 80, after: 80, line: 320 },
      children: parseInline(paraText),
    }));
  }

  return children;
}

/* ─────────────────────────────────────────────────────────────
 * Document builder
 * ───────────────────────────────────────────────────────────── */
function makeDoc(title, bodyChildren) {
  return new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 36, bold: true, font: "Arial", color: DARK },
          paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: "Arial", color: ORANGE },
          paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: "Arial", color: DARK },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 } },
        { id: "Heading4", name: "Heading 4", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 22, bold: true, font: "Arial", color: GRAY },
          paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 3 } },
      ],
    },
    numbering: {
      config: [
        { reference: "bullets", levels: [
          { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
          { level: 2, format: LevelFormat.BULLET, text: "\u25AA", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 2160, hanging: 360 } } } },
        ] },
        { reference: "numbers", levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.LOWER_LETTER, text: "%2.", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
        ] },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1200, bottom: 1200, left: 1200 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ORANGE, space: 4 } },
            children: [
              new TextRun({ text: "DOTBIZ", font: "Arial", bold: true, size: 18, color: ORANGE }),
              new TextRun({ text: " — OhMyHotel B2B Hotel Booking Platform", font: "Arial", size: 16, color: GRAY }),
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Confidential · Internal Use Only", font: "Arial", size: 16, color: MUTED })],
          })],
        }),
      },
      children: bodyChildren,
    }],
  });
}

/* ─────────────────────────────────────────────────────────────
 * Main
 * ───────────────────────────────────────────────────────────── */
async function convert(inputPath, outputPath) {
  const md = fs.readFileSync(inputPath, "utf-8");
  const children = parseMarkdown(md);
  const title = path.basename(inputPath, ".md");
  const doc = makeDoc(title, children);
  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buf);
  console.log(`✓ ${inputPath}`);
  console.log(`  → ${outputPath} (${(buf.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  const [inputPath, outputPath] = process.argv.slice(2);
  if (!inputPath || !outputPath) {
    console.error("Usage: node scripts/md-to-docx.js <input.md> <output.docx>");
    process.exit(1);
  }
  await convert(inputPath, outputPath);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
