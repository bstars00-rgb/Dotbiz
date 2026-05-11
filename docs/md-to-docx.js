/**
 * Settlement 보고서 3종 → .docx 변환기
 *
 * 마크다운 → docx-js 직접 매핑.
 * Korean 텍스트 + 표 + 코드 블록 + 헤딩 + 리스트 모두 지원.
 *
 * 사용: node md-to-docx.js
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageOrientation, PageBreak
} = require('docx');

const FILES = [
  'Settlement_CEO_Critical_Update_2026-05-08.md',
];

/* ── 마크다운 인라인 파싱 (bold, code, italic) ── */
function parseInline(text) {
  const runs = [];
  let i = 0;
  let buffer = '';
  const flush = (style = {}) => {
    if (buffer) {
      runs.push(new TextRun({ text: buffer, font: 'Malgun Gothic', size: 20, ...style }));
      buffer = '';
    }
  };
  while (i < text.length) {
    /* **bold** */
    if (text.substring(i, i + 2) === '**') {
      flush();
      const end = text.indexOf('**', i + 2);
      if (end === -1) { buffer += text.substring(i); break; }
      runs.push(new TextRun({
        text: text.substring(i + 2, end),
        bold: true, font: 'Malgun Gothic', size: 20,
      }));
      i = end + 2;
      continue;
    }
    /* `code` */
    if (text[i] === '`') {
      flush();
      const end = text.indexOf('`', i + 1);
      if (end === -1) { buffer += text[i]; i++; continue; }
      runs.push(new TextRun({
        text: text.substring(i + 1, end),
        font: 'Consolas', size: 18,
        shading: { type: ShadingType.CLEAR, fill: 'F0F0F0' },
      }));
      i = end + 1;
      continue;
    }
    buffer += text[i];
    i++;
  }
  flush();
  return runs.length > 0 ? runs : [new TextRun({ text, font: 'Malgun Gothic', size: 20 })];
}

/* ── 표 파싱: --- 구분자 행 + 셀 행 ── */
function parseTable(lines, startIdx) {
  const rows = [];
  let i = startIdx;
  /* 헤더 행 */
  const headerCells = lines[i].split('|').slice(1, -1).map(c => c.trim());
  i++;
  /* 구분자 행 (스킵) */
  if (i < lines.length && /^\s*\|[\s\-:|]+\|\s*$/.test(lines[i])) i++;
  /* 데이터 행 */
  const dataRows = [];
  while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
    dataRows.push(lines[i].split('|').slice(1, -1).map(c => c.trim()));
    i++;
  }
  return { headerCells, dataRows, nextIdx: i };
}

function buildTable(headerCells, dataRows) {
  const colCount = headerCells.length;
  const tableWidth = 9360;       /* US Letter content width */
  const colWidth = Math.floor(tableWidth / colCount);
  const columnWidths = Array(colCount).fill(colWidth);
  /* 마지막 컬럼에 잔여 픽셀 보정 */
  columnWidths[colCount - 1] += tableWidth - colWidth * colCount;

  const border = { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headerCells.map((cell, idx) => new TableCell({
      borders,
      width: { size: columnWidths[idx], type: WidthType.DXA },
      shading: { fill: 'D5E8F0', type: ShadingType.CLEAR },
      margins: cellMargins,
      children: [new Paragraph({
        children: parseInline(cell).map(r => {
          /* 헤더는 굵게 */
          return new TextRun({ ...r.options, bold: true });
        }),
      })],
    })),
  });

  const bodyRows = dataRows.map(row => new TableRow({
    children: row.map((cell, idx) => new TableCell({
      borders,
      width: { size: columnWidths[idx] || colWidth, type: WidthType.DXA },
      margins: cellMargins,
      children: [new Paragraph({ children: parseInline(cell) })],
    })),
  }));

  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths,
    rows: [headerRow, ...bodyRows],
  });
}

/* ── 메인 변환 ── */
function convertMarkdown(md) {
  const lines = md.split('\n');
  const children = [];
  let i = 0;
  let inCodeBlock = false;
  let codeBuffer = [];

  while (i < lines.length) {
    const line = lines[i];

    /* 코드 블록 ``` */
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        children.push(new Paragraph({
          shading: { type: ShadingType.CLEAR, fill: 'F5F5F5' },
          spacing: { before: 80, after: 80 },
          children: [new TextRun({
            text: codeBuffer.join('\n'),
            font: 'Consolas',
            size: 18,
          })],
        }));
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      i++;
      continue;
    }
    if (inCodeBlock) { codeBuffer.push(line); i++; continue; }

    /* 헤딩 */
    if (line.startsWith('# ')) {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: line.substring(2), bold: true, size: 36, font: 'Malgun Gothic' })],
        spacing: { before: 400, after: 200 },
      }));
      i++; continue;
    }
    if (line.startsWith('## ')) {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: line.substring(3), bold: true, size: 30, font: 'Malgun Gothic' })],
        spacing: { before: 300, after: 150 },
      }));
      i++; continue;
    }
    if (line.startsWith('### ')) {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun({ text: line.substring(4), bold: true, size: 26, font: 'Malgun Gothic' })],
        spacing: { before: 240, after: 120 },
      }));
      i++; continue;
    }
    if (line.startsWith('#### ')) {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_4,
        children: [new TextRun({ text: line.substring(5), bold: true, size: 22, font: 'Malgun Gothic' })],
        spacing: { before: 200, after: 100 },
      }));
      i++; continue;
    }

    /* 표 — | ... | 시작 */
    if (line.trim().startsWith('|') && line.trim().endsWith('|') && line.includes('|', 1)) {
      const { headerCells, dataRows, nextIdx } = parseTable(lines, i);
      children.push(buildTable(headerCells, dataRows));
      children.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
      i = nextIdx;
      continue;
    }

    /* 수평선 --- */
    if (line.trim() === '---') {
      children.push(new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999', space: 1 } },
        spacing: { before: 100, after: 100 },
        children: [new TextRun({ text: '' })],
      }));
      i++; continue;
    }

    /* 리스트 — `- ` / `* ` / `1. ` */
    const ulMatch = line.match(/^(\s*)[-*] (.+)$/);
    if (ulMatch) {
      const indent = Math.floor(ulMatch[1].length / 2);
      children.push(new Paragraph({
        numbering: { reference: 'bullets', level: indent },
        children: parseInline(ulMatch[2]),
        spacing: { after: 60 },
      }));
      i++; continue;
    }
    const olMatch = line.match(/^(\s*)\d+\. (.+)$/);
    if (olMatch) {
      const indent = Math.floor(olMatch[1].length / 2);
      children.push(new Paragraph({
        numbering: { reference: 'numbers', level: indent },
        children: parseInline(olMatch[2]),
        spacing: { after: 60 },
      }));
      i++; continue;
    }

    /* 인용 > */
    if (line.startsWith('> ')) {
      children.push(new Paragraph({
        indent: { left: 720 },
        spacing: { after: 80 },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: 'FF6000', space: 12 } },
        children: parseInline(line.substring(2)),
      }));
      i++; continue;
    }

    /* 빈 줄 */
    if (line.trim() === '') {
      children.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
      i++; continue;
    }

    /* 일반 단락 */
    children.push(new Paragraph({
      children: parseInline(line),
      spacing: { after: 80 },
    }));
    i++;
  }

  return children;
}

/* ── 문서 생성 ── */
function createDocument(children) {
  return new Document({
    styles: {
      default: { document: { run: { font: 'Malgun Gothic', size: 20 } } },
    },
    numbering: {
      config: [
        { reference: 'bullets', levels: [
          { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
        ] },
        { reference: 'numbers', levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.LOWER_LETTER, text: '%2.', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
        ] },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },                                    /* US Letter */
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },             /* 1 inch */
        },
      },
      children,
    }],
  });
}

/* ── 메인 ── */
async function main() {
  for (const filename of FILES) {
    const inputPath = path.join(__dirname, filename);
    const outputPath = inputPath.replace(/\.md$/, '.docx');
    if (!fs.existsSync(inputPath)) {
      console.error(`✗ ${filename} 없음`); continue;
    }
    const md = fs.readFileSync(inputPath, 'utf-8');
    const children = convertMarkdown(md);
    const doc = createDocument(children);
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ ${filename} → ${path.basename(outputPath)} (${(buffer.length / 1024).toFixed(0)} KB)`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
