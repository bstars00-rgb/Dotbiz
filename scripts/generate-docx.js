const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType, PageNumber, PageBreak, LevelFormat } = require("docx");
const fs = require("fs");

const ORANGE = "FF6000";
const DARK = "1a1a2e";
const GRAY = "666666";
const LIGHT_GRAY = "F5F5F5";
const WHITE = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function makeDoc(title, subtitle, sections) {
  return new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: "Arial", color: DARK }, paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial", color: ORANGE }, paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, font: "Arial", color: DARK }, paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
      ]
    },
    numbering: {
      config: [
        { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      ]
    },
    sections: [{
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1200, bottom: 1200, left: 1200 } }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ORANGE, space: 4 } },
            children: [
              new TextRun({ text: "DOTBIZ", font: "Arial", bold: true, size: 18, color: ORANGE }),
              new TextRun({ text: " \u2014 OhMyHotel B2B Hotel Booking Platform", font: "Arial", size: 16, color: GRAY }),
            ]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "CONFIDENTIAL \u2014 ", font: "Arial", size: 16, color: GRAY }),
              new TextRun({ text: "Page ", font: "Arial", size: 16, color: GRAY }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: GRAY }),
            ]
          })]
        })
      },
      children: [
        // Title page
        new Paragraph({ spacing: { before: 2400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "DOTBIZ", font: "Arial", bold: true, size: 56, color: ORANGE })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "OhMyHotel B2B Hotel Booking Platform", font: "Arial", size: 28, color: DARK })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: title, font: "Arial", bold: true, size: 36, color: DARK })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: subtitle, font: "Arial", size: 22, color: GRAY })] }),
        new Paragraph({ children: [new PageBreak()] }),
        ...sections,
      ]
    }]
  });
}

function h1(text) { return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] }); }
function h2(text) { return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] }); }
function h3(text) { return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] }); }
function p(text, opts = {}) { return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, size: 22, ...opts })] }); }
function bold(text) { return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, size: 22, bold: true })] }); }
function bullet(text) { return new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text, size: 22 })] }); }
function numbered(text, ref = "numbers") { return new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text, size: 22 })] }); }

function makeTable(headers, rows, colWidths) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        children: headers.map((h, i) => new TableCell({
          borders, width: { size: colWidths[i], type: WidthType.DXA }, margins: cellMargins,
          shading: { fill: DARK, type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: WHITE, font: "Arial" })] })]
        }))
      }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, i) => new TableCell({
          borders, width: { size: colWidths[i], type: WidthType.DXA }, margins: cellMargins,
          shading: ri % 2 === 0 ? { fill: LIGHT_GRAY, type: ShadingType.CLEAR } : undefined,
          children: [new Paragraph({ children: [new TextRun({ text: String(cell), size: 20, font: "Arial" })] })]
        }))
      }))
    ]
  });
}

// ═══════════════════════════════════════
// Document 1: CEO Report
// ═══════════════════════════════════════
async function generateCEOReport() {
  const doc = makeDoc(
    "1\uCC28 \uC9C4\uD589 \uBCF4\uACE0\uC11C",
    "2026\uB144 4\uC6D4 17\uC77C | \uAE30\uD68D/\uAC1C\uBC1C\uD300 \u2192 \uB300\uD45C\uC774\uC0AC",
    [
      h1("1. \uD504\uB85C\uC81D\uD2B8 \uAC1C\uC694"),
      p("DOTBIZ\uB294 OhMyHotel\uC758 B2B \uD638\uD154 \uC608\uC57D \uD3EC\uD138\uB85C, \uAE30\uC874 DIDA B2B \uD3EC\uD138\uC744 \uBCA4\uCE58\uB9C8\uD0B9\uD558\uC5EC \uC790\uC0AC \uD50C\uB7AB\uD3FC\uC73C\uB85C \uAD6C\uCD95\uD558\uB294 \uD504\uB85C\uC81D\uD2B8\uC785\uB2C8\uB2E4. \uD604\uC7AC \uD504\uB860\uD2B8\uC5D4\uB4DC \uD504\uB85C\uD1A0\uD0C0\uC785 \uB2E8\uACC4\uB85C, \uC804\uCCB4 UI/UX\uB97C \uAD6C\uD604\uD558\uC5EC \uC2E4\uC81C \uC11C\uBE44\uC2A4\uC640 \uB3D9\uC77C\uD55C \uC0AC\uC6A9\uC790 \uACBD\uD5D8\uC744 \uAC80\uC99D\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4."),
      p("\uB370\uBAA8 URL: https://bstars00-rgb.github.io/Dotbiz/", { color: ORANGE, bold: true }),

      h1("2. \uD604\uC7AC \uC9C4\uD589 \uC0C1\uD669"),
      h2("2.1 \uC804\uCCB4 \uC218\uCE58"),
      makeTable(["\uD56D\uBAA9", "\uC218\uCE58"], [
        ["\uCD1D \uD398\uC774\uC9C0", "26\uAC1C"], ["\uCEF4\uD3EC\uB10C\uD2B8", "36\uAC1C"], ["\uBAA9\uB370\uC774\uD130 \uD30C\uC77C", "14\uAC1C"],
        ["\uD14C\uC2A4\uD2B8 \uCF54\uB4DC", "31\uAC1C (4 \uD30C\uC77C)"], ["DIDA \uAE30\uB2A5 \uCEE4\uBC84\uB9AC\uC9C0", "95.6% (65/68)"],
        ["\uAE30\uD68D \uC810\uC218", "89/100 (A-)"], ["QA \uC810\uC218", "88/100 (A-)"], ["\uC624\uB298 \uCEE4\uBC0B \uC218", "34\uAC1C"],
      ], [4800, 4800]),

      h2("2.2 \uB370\uBAA8 \uACC4\uC815"),
      makeTable(["\uD0C0\uC785", "Email", "Password", "\uC124\uBA85"], [
        ["\uD6C4\uBD88 (POSTPAY)", "demo", "demo", "\uC77C\uBC18 \uD6C4\uBD88\uC815\uC0B0 \uACE0\uAC1D"],
        ["\uC120\uBD88 (PREPAY)", "prepay@dotbiz.com", "prepay123", "\uC120\uBD88\uC815\uC0B0 \uACE0\uAC1D (PG \uACB0\uC81C)"],
      ], [2000, 2800, 1800, 3000]),

      h1("3. \uD575\uC2EC \uAE30\uB2A5 \uAD6C\uD604 \uD604\uD669"),
      h2("3.1 \uD638\uD154 \uAC80\uC0C9 \uBC0F \uC608\uC57D (100%)"),
      makeTable(["\uAE30\uB2A5", "\uC0C1\uD0DC", "\uC124\uBA85"], [
        ["\uD638\uD154 \uAC80\uC0C9", "\uC644\uB8CC", "\uB3C4\uC2DC/\uD638\uD154 \uC790\uB3D9\uC644\uC131, 7\uAC1C \uD544\uD130, \uC9C0\uB3C4 \uAC80\uC0C9"],
        ["\uD638\uD154 \uC0C1\uC138", "\uC644\uB8CC", "\uB8F8 \uD14C\uC774\uBE14 (rowspan), \uD504\uB85C\uBAA8\uC158, Sold Out"],
        ["\uC608\uC57D \uC0DD\uC131", "\uC644\uB8CC", "Booker/Traveler/\uC694\uCCAD\uC0AC\uD56D, \uC815\uC0B0 \uD0C0\uC785\uBCC4 \uBD84\uAE30"],
        ["\uC608\uC57D \uB9AC\uBDF0", "\uC644\uB8CC", "\uC2E4\uC81C \uB370\uC774\uD130 \uC5F0\uB3D9 (\uD638\uD154/\uC694\uAE08/\uAC8C\uC2A4\uD2B8)"],
        ["\uC608\uC57D \uC644\uB8CC", "\uC644\uB8CC", "ELLIS \uCF54\uB4DC \uC0DD\uC131, \uBC14\uC6B0\uCC98 \uB2E4\uC6B4\uB85C\uB4DC"],
      ], [2400, 1200, 6000]),

      h2("3.2 PREPAY / POSTPAY \uC815\uC0B0 \uAD6C\uC870"),
      bold("\uB2F7\uBE44\uC988 \uD575\uC2EC \uBE44\uC988\uB2C8\uC2A4 \uAD6C\uC870\uB97C \uD504\uB85C\uD1A0\uD0C0\uC785\uC5D0 \uBC18\uC601:"),
      makeTable(["\uAD6C\uBD84", "POSTPAY (\uD6C4\uBD88)", "PREPAY (\uC120\uBD88)"], [
        ["\uB514\uD3EC\uC9D3", "Floating Deposit \uB4F1 6\uC885", "\uC5C6\uC74C"],
        ["\uC815\uC0B0 \uC8FC\uAE30", "Monthly/Bi-weekly/Weekly", "\uC989\uC2DC \uACB0\uC81C"],
        ["\uC608\uC57D \uC0DD\uC131", "Create \u2192 \uD6C4\uBD88 \uC815\uC0B0", "Pay & Book \u2192 PG \uCE74\uB4DC\uACB0\uC81C"],
        ["Non-refundable", "\uC608\uC57D \uAC00\uB2A5 (\uD6C4\uBD88)", "\uACB0\uC81C \uD6C4 \uC608\uC57D \uAC00\uB2A5"],
        ["\uCE74\uB4DC \uC800\uC7A5", "\u2014", "\uCCAB \uACB0\uC81C \uC2DC \uC800\uC7A5 \uBB38\uC758 \u2192 \uC7AC\uC0AC\uC6A9"],
      ], [2400, 3600, 3600]),

      bold("\uACF5\uD1B5 \uC815\uCC45:"),
      bullet("\uC608\uC57D \uC218\uC815 \uBD88\uAC00 (Amend \uBC84\uD2BC \uC81C\uAC70)"),
      bullet("\uCDE8\uC18C \uAC00\uB2A5 \uC608\uC57D \u2192 \uCDE8\uC18C \uD6C4 \uC7AC\uC608\uC57D"),
      bullet("Non-refundable \u2192 \uCDE8\uC18C \uBD88\uAC00"),
      bullet("\uC694\uCCAD\uC0AC\uD56D \uBCC0\uACBD \u2192 \uD2F0\uCF13 \uC2DC\uC2A4\uD15C\uC73C\uB85C\uB9CC"),

      h2("3.3 \uC608\uC57D \uAD00\uB9AC \u2014 DIDA \uC2A4\uD0C0\uC77C \uC804\uBA74 \uAC1C\uD3B8"),
      makeTable(["\uAE30\uB2A5", "\uC0C1\uD0DC", "\uC124\uBA85"], [
        ["\uD544\uD130", "\uC644\uB8CC", "DIDA \uB808\uC774\uC544\uC6C3 (Date/ELLIS Code/Status/Payment)"],
        ["\uD14C\uC774\uBE14 \uCEEC\uB7FC", "\uC644\uB8CC", "16\uAC1C \uCEEC\uB7FC (Booking Date~Dispute)"],
        ["\uC2DC\uAC04 \uD45C\uC2DC", "\uC644\uB8CC", "bookingDate, cancelDeadline\uC5D0 HH:MM"],
        ["\uD398\uC774\uC9C0\uB124\uC774\uC158", "\uC644\uB8CC", "20/40/60/80/100\uAC74"],
        ["\uBC30\uCE58 \uC791\uC5C5", "\uC644\uB8CC", "Export Hotel Bookings, Confirmation, Voucher, Invoice"],
        ["\uC608\uC57D \uC0C1\uC138", "\uC644\uB8CC", "DIDA \uC2A4\uD0C0\uC77C \uBAA8\uB2EC (Booker/Billing/Cancel Policy)"],
        ["\uCE94\uC2AC \uAE30\uB2A5", "\uC644\uB8CC", "\uC2E4\uC81C \uC0C1\uD0DC \uBCC0\uACBD, \uB370\uB4DC\uB77C\uC778 \uACBD\uACFC \uC2DC \uACBD\uACE0"],
        ["\uD2F0\uCF13 \uC5F0\uB3D9", "\uC644\uB8CC", "\uAC01 \uC608\uC57D\uBCC4 Ticket \uBC84\uD2BC"],
      ], [2400, 1200, 6000]),

      h1("4. \uAE30\uC220 \uC2A4\uD0DD"),
      makeTable(["\uACC4\uCE35", "\uAE30\uC220"], [
        ["\uD504\uB808\uC784\uC6CC\uD06C", "React 19 + TypeScript"],
        ["\uBE4C\uB4DC", "Vite 8 + vite-plugin-singlefile"],
        ["\uC2A4\uD0C0\uC77C\uB9C1", "Tailwind CSS 4 + shadcn/ui"],
        ["\uCC28\uD2B8", "Recharts (Bar, Area, Pie, Line)"],
        ["\uC9C0\uB3C4", "Leaflet + react-leaflet + OpenStreetMap"],
        ["\uD14C\uC2A4\uD2B8", "Vitest + React Testing Library"],
        ["\uBC30\uD3EC", "GitHub Pages (\uB2E8\uC77C HTML \uD30C\uC77C)"],
      ], [3200, 6400]),

      h1("5. \uB0A8\uC740 \uC791\uC5C5 (\uBC31\uC5D4\uB4DC \uC5F0\uB3D9 \uD544\uC694)"),
      makeTable(["\uAE30\uB2A5", "\uC6B0\uC120\uC21C\uC704", "\uC124\uBA85"], [
        ["ELLIS API \uC5F0\uB3D9", "\uB192\uC74C", "\uC2E4\uC81C \uC608\uC57D \uB370\uC774\uD130, \uACE0\uAC1D \uC124\uC815 \uB3D9\uAE30\uD654"],
        ["PG \uACB0\uC81C \uC5F0\uB3D9", "\uB192\uC74C", "\uC120\uBD88 \uACE0\uAC1D \uC2E4\uC81C \uCE74\uB4DC \uACB0\uC81C \uCC98\uB9AC"],
        ["\uC2E4\uC2DC\uAC04 \uAC00\uC6A9\uC131", "\uB192\uC74C", "\uD638\uD154/\uB8F8 \uC2E4\uC2DC\uAC04 \uC7AC\uACE0 \uD655\uC778"],
        ["\uC774\uBA54\uC77C \uC54C\uB9BC", "\uC911\uAC04", "\uC608\uC57D \uD655\uC778, \uCDE8\uC18C, \uACB0\uC81C \uC54C\uB9BC"],
        ["AI \uCC57\uBD07 \uC5F0\uB3D9", "\uC911\uAC04", "\uD2F0\uCF13 \uC2DC\uC2A4\uD15C\uACFC \uCC57\uBD07 \uD1B5\uD569"],
      ], [2800, 1600, 5200]),

      h1("6. \uD5A5\uD6C4 \uC77C\uC815 (\uC548)"),
      makeTable(["\uB2E8\uACC4", "\uAE30\uAC04", "\uB0B4\uC6A9"], [
        ["1\uB2E8\uACC4 (\uD604\uC7AC)", "4\uC6D4", "\uD504\uB860\uD2B8\uC5D4\uB4DC \uD504\uB85C\uD1A0\uD0C0\uC785 \uC644\uB8CC + \uC0AC\uC6A9\uC790 \uD53C\uB4DC\uBC31"],
        ["2\uB2E8\uACC4", "5\uC6D4", "ELLIS API \uC5F0\uB3D9 + \uBC31\uC5D4\uB4DC \uAC1C\uBC1C \uC2DC\uC791"],
        ["3\uB2E8\uACC4", "6~7\uC6D4", "PG \uACB0\uC81C \uC5F0\uB3D9 + \uBCA0\uD0C0 \uD14C\uC2A4\uD2B8"],
        ["4\uB2E8\uACC4", "8\uC6D4", "\uC815\uC2DD \uC624\uD508"],
      ], [2400, 1600, 5600]),

      h1("7. \uC694\uCCAD \uC0AC\uD56D"),
      numbered("\uD504\uB85C\uD1A0\uD0C0\uC785 \uAC80\uD1A0: \uB370\uBAA8 URL\uC5D0\uC11C \uC9C1\uC811 \uC0AC\uC6A9\uD574\uBCF4\uC2DC\uACE0 \uD53C\uB4DC\uBC31 \uBD80\uD0C1\uB4DC\uB9BD\uB2C8\uB2E4"),
      numbered("\uBE44\uC988\uB2C8\uC2A4 \uB85C\uC9C1 \uD655\uC778: PREPAY/POSTPAY \uC815\uC0B0 \uAD6C\uC870\uAC00 \uC2E4\uC81C \uC6B4\uC601 \uC815\uCC45\uACFC \uC77C\uCE58\uD558\uB294\uC9C0 \uD655\uC778 \uD544\uC694"),
      numbered("\uC6B0\uC120\uC21C\uC704 \uC870\uC728: ELLIS API vs PG \uACB0\uC81C \uC5F0\uB3D9 \uC911 \uBA3C\uC800 \uC9C4\uD589\uD560 \uD56D\uBAA9 \uACB0\uC815 \uD544\uC694"),
      numbered("\uB514\uC790\uC778 \uB9AC\uBDF0: DIDA \uBCA4\uCE58\uB9C8\uD0B9 \uAE30\uBC18\uC774\uB098, DOTBIZ\uB9CC\uC758 \uCC28\uBCC4\uD654 \uD3EC\uC778\uD2B8 \uB17C\uC758 \uD544\uC694"),

      p(""),
      p("\uBCF8 \uBCF4\uACE0\uC11C\uB294 \uD504\uB85C\uD1A0\uD0C0\uC785 \uC9C4\uD589 \uD604\uD669\uC744 \uAE30\uBC18\uC73C\uB85C \uC791\uC131\uB418\uC5C8\uC73C\uBA70, \uC2E4\uC81C \uC11C\uBE44\uC2A4 \uAC1C\uBC1C \uC2DC \uBCC0\uACBD\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4.", { italics: true, color: GRAY }),
    ]
  );
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("docs/CEO_Report_v1_2026-04-17.docx", buffer);
  console.log("Created: CEO_Report_v1_2026-04-17.docx");
}

// ═══════════════════════════════════════
// Document 2: Gap Analysis
// ═══════════════════════════════════════
async function generateGapAnalysis() {
  const categories = [
    { name: "1. Hotel Search & Discovery", score: "14/14 = 100%", items: [
      ["1", "Destination search with autocomplete", "Done", "FindHotelPage"],
      ["2", "Date range picker (calendar)", "Done", "DateRangePicker"],
      ["3", "Room/Adult/Children selector", "Done", "FindHotelPage"],
      ["4", "Nationality selector", "Done", "FindHotelPage"],
      ["5", "Search results with hotel cards", "Done", "SearchResultsPage"],
      ["6", "Star rating filter", "Done", "SearchResultsPage"],
      ["7", "Price range filter (slider)", "Done", "SearchResultsPage"],
      ["8", "Brand filter", "Done", "SearchResultsPage"],
      ["9", "Meal type filter", "Done", "SearchResultsPage"],
      ["10", "Cancellation policy filter", "Done", "SearchResultsPage"],
      ["11", "Review score filter", "Done", "SearchResultsPage"],
      ["12", "Sort options", "Done", "SearchResultsPage"],
      ["13", "Map search with markers", "Done", "MapSearchPage"],
      ["14", "Pagination", "Done", "SearchResultsPage"],
    ]},
    { name: "2. Hotel Detail & Room Selection", score: "12/12 = 100%", items: [
      ["15", "Hotel image gallery", "Done", "HotelDetailPage"],
      ["16", "Hotel info (star, review, area)", "Done", "HotelDetailPage"],
      ["17", "Room type table with variants", "Done", "HotelDetailPage"],
      ["18", "Room filters", "Done", "HotelDetailPage"],
      ["19", "Confirm type display", "Done", "HotelDetailPage"],
      ["20", "OTA restriction warning", "Done", "HotelDetailPage"],
      ["21", "Cancellation policy per room", "Done", "HotelDetailPage"],
      ["22", "Price per night + total", "Done", "PriceDisplay"],
      ["23", "Show More/Less", "Done", "HotelDetailPage"],
      ["24", "Sold Out indicator", "Done", "HotelDetailPage"],
      ["25", "Dynamic PKG Promotion", "Done", "HotelDetailPage"],
      ["26", "Facilities list", "Done", "HotelDetailPage"],
    ]},
  ];

  const doc = makeDoc(
    "DIDA Gap Analysis v2.0",
    "DIDA B2B Portal vs DOTBIZ \u2014 Feature Coverage Report",
    [
      h1("DIDA B2B Portal vs DOTBIZ - Gap Analysis"),
      p("Overall Coverage: 95.6% (65/68 features)", { bold: true, color: ORANGE, size: 26 }),

      h1("Coverage Summary"),
      makeTable(["Category", "Coverage", "Score"], [
        ["Hotel Search & Discovery", "14/14", "100%"],
        ["Hotel Detail & Room Selection", "12/12", "100%"],
        ["Booking Flow", "6/6", "100%"],
        ["Booking Management", "5/5", "100%"],
        ["Dashboard & Data Center", "8/8", "100%"],
        ["Settlement & Finance", "4/4", "100%"],
        ["Account & Client Management", "5/5", "100%"],
        ["Support & Communication", "4/4", "100%"],
        ["Advanced Features", "7/10", "70%"],
        ["Total", "65/68", "95.6%"],
      ], [4000, 2000, 1600]),

      p("Note: The remaining 3 features require backend/API integration (Real-time API, Payment Gateway, Email Notifications).", { italics: true, color: GRAY }),

      h1("Category Breakdown"),
      ...categories.flatMap(cat => [
        h2(cat.name + " (" + cat.score + ")"),
        makeTable(["#", "DIDA Feature", "Status", "DOTBIZ Page"], cat.items, [600, 4000, 1000, 4000]),
      ]),

      h1("Key Differentiators (DOTBIZ Extras)"),
      makeTable(["Feature", "Description"], [
        ["AI-Enhanced Overview", "Hotel overview with AI-generated descriptions"],
        ["PREPAY/POSTPAY Billing", "Full billing structure with PG card simulation"],
        ["Saved Card Management", "Save cards on first payment, reuse on next"],
        ["Dark Mode", "Full dark mode with localStorage persistence"],
        ["Collapsible Sidebar", "Slide to hide/show via hamburger menu"],
        ["Recent Searches", "6 items, auto-save, date correction"],
        ["Per-Booking Ticket", "Create support ticket directly from booking"],
      ], [3200, 6400]),
    ]
  );
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("docs/DIDA_Gap_Analysis_v2.0.docx", buffer);
  console.log("Created: DIDA_Gap_Analysis_v2.0.docx");
}

// ═══════════════════════════════════════
// Document 3: Spec
// ═══════════════════════════════════════
async function generateSpec() {
  const doc = makeDoc(
    "\uD504\uB85C\uD1A0\uD0C0\uC785 \uBA85\uC138\uC11C v2.0",
    "Prototype Specification \u2014 2026-04-17",
    [
      h1("1. Architecture Overview"),
      h2("1.1 Technology Stack"),
      makeTable(["Layer", "Technology"], [
        ["Framework", "React 19 + TypeScript"],
        ["Build", "Vite 8 + vite-plugin-singlefile"],
        ["Styling", "Tailwind CSS 4 + shadcn/ui"],
        ["Routing", "React Router 7 (HashRouter)"],
        ["Charts", "Recharts (Bar, Area, Pie, Line)"],
        ["Maps", "Leaflet + react-leaflet + OpenStreetMap"],
        ["Animation", "Framer Motion"],
        ["State", "React Context (Auth, I18n) + useState + URL params"],
        ["Dark Mode", "localStorage persistence + Tailwind dark class"],
        ["Testing", "Vitest + React Testing Library (31 tests)"],
      ], [3200, 6400]),

      h2("1.2 File Structure"),
      makeTable(["Directory", "Count", "Description"], [
        ["src/pages/", "26", "Page components"],
        ["src/components/", "36", "Reusable UI components (8 custom + 28 shadcn)"],
        ["src/mocks/", "14", "Mock data files"],
        ["src/contexts/", "2", "Auth + I18n contexts"],
        ["src/hooks/", "3", "useFormValidation, useMediaQuery, useScreenState"],
        ["src/i18n/", "1", "60+ translated strings (5 languages)"],
        ["src/test/", "4", "31 test cases"],
      ], [3000, 1200, 5400]),

      h1("2. Page Specifications (26 Pages)"),
      h2("2.1 Authentication"),
      bullet("LoginPage: Email/Password + Remember me + Dark mode + Language selector"),
      bullet("RegistrationPage: Multi-step company registration"),

      h2("2.2 Hotel Search Flow"),
      bullet("FindHotelPage: Search bar + Recent Searches (6) + Stats cards + Campaigns"),
      bullet("SearchResultsPage: 7 sidebar filters + Sort + Pagination"),
      bullet("MapSearchPage: Leaflet map + Numbered markers + Hotel list sidebar"),
      bullet("HotelDetailPage: Gallery + Room table + Price Markup Sharing + Monthly Rates"),

      h2("2.3 Booking Flow"),
      bullet("BookingFormPage: Booker/Travelers/Requests + PREPAY/POSTPAY billing"),
      bullet("BookingConfirmPage: Review with settlement type + Cancel/Modify policy"),
      bullet("BookingCompletePage: ELLIS code + Voucher download"),

      h2("2.4 Booking Management"),
      bullet("BookingsPage: DIDA-style filters + 16 columns + ELLIS code copy + Ticket button"),
      bullet("Detail modal: Booker/Reservation/Travelers/Billing/Cancellation Policy"),
      bullet("Cancel: actual state change + deadline enforcement"),
      bullet("Batch operations: Export Bookings/Confirmation/Voucher/Invoice"),

      h2("2.5 Dashboard (5 Tabs)"),
      bullet("Overview: KPI cards + Booking trend + Destination % + Top Hotels"),
      bullet("Booking Statistics: Monthly bar chart"),
      bullet("Cancellation Statistics: Monthly line chart + Pie chart"),
      bullet("Daily Booking Statistics: Area chart + Date filter"),
      bullet("Year-End Statistics: YoY comparison"),

      h2("2.6 Settlement (6 Tabs)"),
      bullet("Applications, Billing Details, Invoices, Accounts Receivable, OP Points, Purchase by Hotel"),

      h2("2.7 Client Management (5 Tabs)"),
      bullet("Sub-Accounts, Departments, Balance, Voucher Setting, API Keys"),

      h2("2.8 Additional Pages"),
      bullet("My Account (6 tabs): Profile, Security, Notifications, Card Management, Coupons, OP Mgmt"),
      bullet("Ticket Management: Timeline view + Per-booking ticket creation"),
      bullet("Notifications, FAQ Board, Rewards Mall, OhMy Blog, Contact Us"),
      bullet("Price Markup Sharing, Monthly Rate Table, Favorites"),

      h1("3. Business Logic"),
      h2("3.1 PREPAY/POSTPAY"),
      p("POSTPAY: Deposit (6 types) + Settlement cycle (M/Bi-W/W) + Net-30 days"),
      p("PREPAY: No deposit + PG card payment for non-refundable + Card save/reuse"),
      p("Settings synced from ELLIS (read-only in DOTBIZ)"),

      h2("3.2 Booking Policy"),
      bullet("No modification allowed (cancel and rebook only)"),
      bullet("Non-refundable: cannot cancel"),
      bullet("Free cancel: before deadline only"),
      bullet("Special requests: via Ticket system only"),

      h2("3.3 Multi-language (i18n)"),
      p("5 languages: EN, KO, JA, ZH, VI"),
      p("60+ translated strings for navigation, buttons, page titles, dashboard"),
      p("Language selector in header, persisted to localStorage"),

      h1("4. Deployment"),
      p("GitHub Pages: https://bstars00-rgb.github.io/Dotbiz/"),
      p("Build: npm run build (single HTML file via vite-plugin-singlefile)"),
      p("Router: HashRouter for GitHub Pages compatibility"),
    ]
  );
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("docs/DOTBIZ_Prototype_Spec_v2.0.docx", buffer);
  console.log("Created: DOTBIZ_Prototype_Spec_v2.0.docx");
}

// Run all
(async () => {
  await generateCEOReport();
  await generateGapAnalysis();
  await generateSpec();
  console.log("\nAll 3 documents created successfully!");
})();
