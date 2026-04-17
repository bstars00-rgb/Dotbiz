const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType, PageNumber, PageBreak, LevelFormat } = require("docx");
const fs = require("fs");

const O = "FF6000", D = "1a1a2e", G = "666666", LG = "F5F5F5", W = "FFFFFF";
const b = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const bs = { top: b, bottom: b, left: b, right: b };
const cm = { top: 50, bottom: 50, left: 80, right: 80 };

function tbl(headers, rows, cw) {
  const tw = cw.reduce((a, b) => a + b, 0);
  return new Table({ width: { size: tw, type: WidthType.DXA }, columnWidths: cw, rows: [
    new TableRow({ children: headers.map((h, i) => new TableCell({ borders: bs, width: { size: cw[i], type: WidthType.DXA }, margins: cm, shading: { fill: D, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, color: W, font: "Arial" })] })] })) }),
    ...rows.map((row, ri) => new TableRow({ children: row.map((cell, i) => new TableCell({ borders: bs, width: { size: cw[i], type: WidthType.DXA }, margins: cm, shading: ri % 2 === 0 ? { fill: LG, type: ShadingType.CLEAR } : undefined, children: [new Paragraph({ children: [new TextRun({ text: String(cell), size: 18, font: "Arial" })] })] })) }))
  ]});
}

function h1(t) { return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] }); }
function h2(t) { return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] }); }
function h3(t) { return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] }); }
function p(t, o = {}) { return new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: t, size: 20, ...o })] }); }
function bl(t) { return new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 50 }, children: [new TextRun({ text: t, size: 20 })] }); }

(async () => {
  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 20 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 30, bold: true, font: "Arial", color: D }, paragraph: { spacing: { before: 300, after: 180 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, font: "Arial", color: O }, paragraph: { spacing: { before: 240, after: 140 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 22, bold: true, font: "Arial", color: D }, paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 2 } },
      ]
    },
    numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1200, right: 1000, bottom: 1000, left: 1000 } } },
      headers: { default: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: O, space: 3 } }, children: [new TextRun({ text: "DOTBIZ", bold: true, size: 16, color: O }), new TextRun({ text: " \u2014 Full Feature Specification v3.0", size: 14, color: G })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CONFIDENTIAL \u2014 Page ", size: 14, color: G }), new TextRun({ children: [PageNumber.CURRENT], size: 14, color: G })] })] }) },
      children: [
        // ═══ COVER PAGE ═══
        new Paragraph({ spacing: { before: 2000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "DOTBIZ", bold: true, size: 60, color: O })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "OhMyHotel B2B Hotel Booking Platform", size: 28, color: D })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 200 }, children: [new TextRun({ text: "\uC885\uD569 \uAE30\uB2A5 \uBA85\uC138\uC11C & \uC2A4\uD399 v3.0", bold: true, size: 36, color: D })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Full Feature Specification", size: 24, color: G })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600 }, children: [new TextRun({ text: "2026\uB144 4\uC6D4 17\uC77C | 27\uAC1C \uD398\uC774\uC9C0 | 68\uAC1C \uBC88\uC5ED\uD0A4 | 95.6% DIDA \uCEE4\uBC84\uB9AC\uC9C0", size: 20, color: G })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: "https://bstars00-rgb.github.io/Dotbiz/", size: 20, color: O, bold: true })] }),
        new Paragraph({ children: [new PageBreak()] }),

        // ═══ 1. OVERVIEW ═══
        h1("1. \uD504\uB85C\uC81D\uD2B8 \uAC1C\uC694"),
        p("DOTBIZ\uB294 OhMyHotel\uC758 B2B \uD638\uD154 \uC608\uC57D \uD3EC\uD138\uB85C, DIDA B2B \uD3EC\uD138\uC744 \uBCA4\uCE58\uB9C8\uD0B9\uD558\uC5EC \uAD6C\uCD95\uD558\uB294 \uC790\uC0AC \uD50C\uB7AB\uD3FC\uC785\uB2C8\uB2E4."),
        tbl(["\uD56D\uBAA9", "\uC218\uCE58"], [
          ["\uCD1D \uD398\uC774\uC9C0", "27\uAC1C (25 \uB808\uC774\uC544\uC6C3 + 2 \uB3C5\uB9BD)"], ["\uCEF4\uD3EC\uB10C\uD2B8", "33\uAC1C (11 \uCEE4\uC2A4\uD140 + 22 UI)"],
          ["\uBAA9\uB370\uC774\uD130", "14\uD30C\uC77C (1,039\uC904)"], ["\uD14C\uC2A4\uD2B8", "31\uAC1C (4\uD30C\uC77C)"],
          ["i18n \uBC88\uC5ED\uD0A4", "68\uAC1C (5\uAC1C \uC5B8\uC5B4)"], ["DIDA \uCEE4\uBC84\uB9AC\uC9C0", "95.6% (65/68)"],
          ["\uAE30\uD68D\uC810\uC218", "89/100 (A-)"], ["QA\uC810\uC218", "88/100 (A-)"],
        ], [4000, 6200]),

        // ═══ 2. TECH STACK ═══
        h1("2. \uAE30\uC220 \uC2A4\uD0DD"),
        tbl(["Layer", "Technology"], [
          ["Framework", "React 19 + TypeScript"], ["Build", "Vite 8 + vite-plugin-singlefile"],
          ["Styling", "Tailwind CSS 4 + shadcn/ui"], ["Routing", "React Router 7 (HashRouter)"],
          ["Charts", "Recharts (Bar, Area, Pie, Line)"], ["Maps", "Leaflet + react-leaflet + OpenStreetMap"],
          ["Animation", "Framer Motion"], ["Notifications", "Sonner (toast)"],
          ["State", "React Context (Auth, I18n) + useState + URL params + sessionStorage"],
          ["Testing", "Vitest + React Testing Library"], ["Deploy", "GitHub Pages (single HTML, ~1.9MB)"],
        ], [3000, 7200]),

        // ═══ 3. AUTHENTICATION ═══
        h1("3. \uC778\uC99D \uBC0F \uACC4\uC815"),
        h2("3.1 \uB85C\uADF8\uC778 (LoginPage)"),
        bl("Email/Password \uC785\uB825 + Show/Hide \uBE44\uBC00\uBC88\uD638"), bl("Remember me \uCCB4\uD06C\uBC15\uC2A4"),
        bl("\uC774\uC6A9\uC57D\uAD00 \uB3D9\uC758 (Privacy Policy / Service Agreement \uC804\uBB38 \uD3EC\uD568)"),
        bl("\uC5D0\uB7EC \uC0C1\uD0DC: \uACC4\uC815 \uB300\uAE30, \uACC4\uC815 \uC7A0\uAE40"), bl("\uB2E4\uD06C\uBAA8\uB4DC / \uC5B8\uC5B4 \uC120\uD0DD\uAE30"),
        bl("\uC560\uB2C8\uBA54\uC774\uC158 \uADF8\uB77C\uB514\uC5B8\uD2B8 \uC88C\uCE21 \uD328\uB110"),

        h2("3.2 \uD68C\uC6D0\uAC00\uC785 (RegistrationPage)"),
        bl("3\uB2E8\uACC4 \uB9C8\uBC95\uC0AC: (1) \uD68C\uC0AC\uC815\uBCF4 (2) \uB2F4\uB2F9\uC790\uC815\uBCF4 (3) \uC57D\uAD00\uB3D9\uC758"),
        bl("\uBB38\uC11C \uCCA8\uBD80 (\uCD5C\uB300 5\uAC1C, 10MB, JPG/PNG/PDF)"),
        bl("\uBE44\uBC00\uBC88\uD638 \uAC15\uB3C4 \uAC80\uC99D (8\uC790 \uC774\uC0C1)"),

        h2("3.3 \uC0AC\uC6A9\uC790 \uACC4\uC815"),
        tbl(["Email", "Password", "Role", "Billing Type"], [
          ["master@dotbiz.com", "master123", "Master", "POSTPAY"],
          ["op@dotbiz.com", "op123", "OP", "POSTPAY"],
          ["demo", "demo", "Master", "POSTPAY"],
          ["prepay@dotbiz.com", "prepay123", "Master", "PREPAY"],
        ], [3000, 2000, 1600, 1600]),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══ 4. HOTEL SEARCH ═══
        h1("4. \uD638\uD154 \uAC80\uC0C9 \uD50C\uB85C\uC6B0"),
        h2("4.1 FindHotelPage"),
        bl("\uD788\uC5B4\uB85C \uC139\uC158: \uC560\uB2C8\uBA54\uC774\uC158 \uADF8\uB77C\uB514\uC5B8\uD2B8 \uBC30\uACBD"),
        bl("\uAC80\uC0C9\uBC14: Destination(\uC790\uB3D9\uC644\uC131 7\uAC1C \uC9C0\uC5ED\uD0ED) + \uB0A0\uC9DC(\uB4C0\uC5BC \uCE98\uB9B0\uB354) + \uAC1D\uC2E4/\uC778\uC6D0 + \uAD6D\uC801(18\uAC1C\uAD6D)"),
        bl("Recent Searches: \uCD5C\uB300 6\uAC1C, localStorage, \uAC1C\uBCC4 \uC0AD\uC81C, \uB0A0\uC9DC \uBCF4\uC815, \uC790\uB3D9 \uC800\uC7A5"),
        bl("\uD1B5\uACC4 \uCE74\uB4DC: Free Cancellation(24h/3d) + Upcoming Bookings(24h/3d) \u2014 \uC2E4\uC81C \uB370\uC774\uD130 \uAE30\uBC18 \uB3D9\uC801 \uACC4\uC0B0"),
        bl("\uD504\uB85C\uBAA8 \uBC30\uB108: Singapore Spring Sale"),
        bl("Recommended Accommodations: 3\uAC1C \uCE60\uD398\uC778 \uCE74\uB4DC"),
        bl("Trending Now: 12\uAC1C \uD0DC\uADF8 (NEW/HOT \uBC43\uC9C0)"),
        bl("Favorite Hotels, Popular Destinations(8\uAC1C \uB3C4\uC2DC), Hotel Gallery"),

        h2("4.2 SearchResultsPage"),
        bl("7\uAC1C \uC0AC\uC774\uB4DC\uBC14 \uD544\uD130: \uC704\uCE58, \uC131\uAE09, \uAC00\uACA9(\uB4C0\uC5BC \uC2AC\uB77C\uC774\uB354), \uC2DC\uC124, \uBE0C\uB79C\uB4DC, \uD504\uB85C\uBAA8\uC158, \uD3EC\uC778\uD2B8"),
        bl("\uC815\uB82C: Hot/Featured/Favorite/\uAC00\uACA9\u2191\u2193/\uC131\uAE09\u2191\u2193"),
        bl("\uD398\uC774\uC9C0\uB124\uC774\uC158 + Go-to \uC785\uB825"),
        bl("\uBBF8\uB2C8\uB9F5 \u2192 \uC9C0\uB3C4 \uAC80\uC0C9 \uC5F0\uACB0"),

        h2("4.3 MapSearchPage"),
        bl("Leaflet \uC804\uCCB4 \uD654\uBA74 \uC9C0\uB3C4 + \uBC88\uD638 \uB9C8\uCEE4 (DivIcon)"),
        bl("\uC0AC\uC774\uB4DC\uBC14: \uD638\uD154 \uB9AC\uC2A4\uD2B8 + \uC815\uB82C/\uD544\uD130"),
        bl("\uD31D\uC5C5 \uCE74\uB4DC: \uD638\uD154\uBA85, \uC131\uAE09, \uB9AC\uBDF0, \uAC00\uACA9, View Hotel & Reserve \uBC84\uD2BC"),
        bl("30\uAC1C+ \uB3C4\uC2DC \uC88C\uD45C \uB0B4\uC7A5"),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══ 5. HOTEL DETAIL ═══
        h1("5. \uD638\uD154 \uC0C1\uC138 (HotelDetailPage)"),
        bl("\uC774\uBBF8\uC9C0 \uAC24\uB7EC\uB9AC: \uBA54\uC778(55%) + 4\uC378\uB124\uC77C + \uBBF8\uB2C8 Leaflet \uC9C0\uB3C4"),
        bl("\uC561\uC158 \uBC84\uD2BC: Price Markup Sharing(\uC0C8\uD0ED) / Monthly Rates(\uC0C8\uD0ED) / Favorite"),
        bl("4\uAC1C \uD0ED: Rooms / Overview / Policies / Facilities"),

        h3("Rooms \uD0ED"),
        bl("\uD544\uD130: Room type / Bed type / Price / Meal / Refundable"),
        bl("\uCEEC\uB7FC: \uB8F8\uC774\uBBF8\uC9C0+\uC774\uB984 / Confirm Type / Capacity / Bed&Meal / Cancel Policy / Price / Reserve"),
        bl("Show More/Hide \uD1A0\uAE00 (2\uAC1C \uC774\uC0C1 \uBCC0\uD615 \uC2DC)"),
        bl("Sold Out \uD45C\uC2DC + \uB2E4\uC774\uC5BC\uB85C\uADF8"),
        bl("Dynamic PKG Promotion \uBE68\uAC04 \uBC43\uC9C0"),
        bl("PriceDisplay: \uBC15\uB2F9 + \uCD1D\uC561 + Package Only \uD0DC\uADF8"),
        bl("Applied Dates \uD328\uD134: Search \uBC84\uD2BC \uD074\uB9AD\uC2DC\uB9CC \uC694\uAE08 \uBCC0\uACBD"),

        h3("Overview \uD0ED"),
        bl("AI-Enhanced \uC18C\uAC1C\uBB38 + AI Location Insights(4\uAC1C \uCE74\uB4DC) + AI Guest Reviews Summary"),

        h3("\uCD94\uAC00 \uAE30\uB2A5"),
        bl("HotelLoadingDialog: \uACF5\uAE09\uC5C5\uCCB4 \uB808\uC774\uD2B8 \uD398\uCE6D \uC560\uB2C8\uBA54\uC774\uC158"),
        bl("CurrencyCalculator: 10\uAC1C \uD1B5\uD654 \uD50C\uB85C\uD305 \uC704\uC82F"),
        bl("View Map \uC624\uBC84\uB808\uC774 (\uC804\uCCB4\uD654\uBA74 Leaflet)"),
        bl("Recommended Properties: 4\uAC1C \uCE74\uB4DC"),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══ 6. BOOKING FLOW ═══
        h1("6. \uC608\uC57D \uD50C\uB85C\uC6B0"),
        h2("6.1 BookingFormPage"),
        bl("Booker: Name*, Email*, Mobile(\uAD6D\uAC00\uCF54\uB4DC), Seller Code"),
        bl("Booking Detail: \uCCB4\uD06C\uC778/\uC544\uC6C3, \uC9C0\uC5ED, \uD638\uD154, \uB8F8, \uC2DD\uC0AC, \uCDE8\uC18C\uC815\uCC45"),
        bl("Travelers: Room/Gender/\uD604\uC9C0\uC5B4\uC774\uB984/\uC601\uBB38\uC774\uB984(\uB300\uBB38\uC790)/\uC544\uB3D9\uC0DD\uC77C"),
        bl("Special Request: 5\uAC1C \uCCB4\uD06C\uBC15\uC2A4 + \uCCB4\uD06C\uC778\uC2DC\uAC04 + \uC790\uC720\uD14D\uC2A4\uD2B8"),
        bl("Billing Rate: PREPAY/POSTPAY \uBC43\uC9C0 + \uC815\uC0B0\uC870\uAC74 + \uCD1D\uC561"),
        bl("PREPAY Non-refundable: Pay & Book \u2192 PaymentDialog \u2192 Complete"),
        bl("POSTPAY: Create \u2192 Confirm \u2192 Review"),
        bl("sessionStorage \uC790\uB3D9\uC800\uC7A5 (\uBB34\uB4DC\uAC00\uAE30 \uC2DC \uBCF5\uC6D0)"),

        h2("6.2 PaymentDialog"),
        bl("\uCE74\uB4DC\uBC88\uD638 (16\uC790\uB9AC \uC790\uB3D9\uD3EC\uB9F7), \uB9CC\uB8CC\uC77C(MM/YY), CVV, \uC18C\uC720\uC790\uBA85"),
        bl("\uBE0C\uB79C\uB4DC \uC790\uB3D9\uAC10\uC9C0 (Visa/Mastercard/Amex/Discover)"),
        bl("\uCE74\uB4DC \uC800\uC7A5 \uBB38\uC758 \u2192 localStorage\uC5D0 \uC800\uC7A5 \u2192 \uB2E4\uC74C \uACB0\uC81C \uC2DC \uC120\uD0DD \uC0AC\uC6A9"),
        bl("My Account > Card Management \uD0ED\uC5D0\uC11C \uAD00\uB9AC/\uC0AD\uC81C"),

        h2("6.3 BookingConfirmPage (Review)"),
        bl("3\uB2E8\uACC4 \uC778\uB514\uCF00\uC774\uD130 (Guest Info / Review / Complete)"),
        bl("Booker + Booking Detail + Travelers + Special Request + Billing Rate"),
        bl("\uC815\uC0B0 \uD0C0\uC785 \uC548\uB0B4 (PREPAY/POSTPAY)"),
        bl("\uCDE8\uC18C/\uC218\uC815 \uBD88\uAC00 \uC815\uCC45 \uC548\uB0B4"),

        h2("6.4 BookingCompletePage"),
        bl("ELLIS \uCF54\uB4DC \uC0DD\uC131 + \uC131\uACF5 \uCCB4\uD06C\uB9C8\uD06C"),
        bl("Download Voucher / Email Voucher / My Bookings / New Booking"),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══ 7. BOOKINGS MANAGEMENT ═══
        h1("7. \uC608\uC57D \uAD00\uB9AC (BookingsPage)"),
        h2("7.1 \uD544\uD130 (DIDA \uC2A4\uD0C0\uC77C)"),
        bl("Date Type + From~To / ELLIS BKG Code / BKG Status / Payment Status"),
        bl("Booker Name / Hotel Name / Seller BKG Code"),
        bl("Search \uBC84\uD2BC \uD074\uB9AD\uC2DC\uB9CC \uD544\uD130 \uC801\uC6A9 (Applied Filters \uD328\uD134)"),
        bl("Quick Filter: free_cancel_24h, free_cancel_3d, upcoming_24h, upcoming_3d (URL params)"),

        h2("7.2 \uD14C\uC774\uBE14 \uCEEC\uB7FC (16\uAC1C)"),
        bl("\u2611 | Booking Date | ELLIS Booking Code | Seller Booking Code | Booking Status | Payment Status | Hotel Name | Client Cancel DL | Check-in Date/Nts | Room Type/Count | 1st Traveler Name | B.Currency | B.Sum Amt | BKG Cancel Date | Invoice No. | Dispute | Ticket"),

        h2("7.3 \uAE30\uB2A5"),
        bl("ELLIS Code \uD074\uB9AD \u2192 \uC0C1\uC138 \uBAA8\uB2EC (\uD589 \uD074\uB9AD\uC740 \uBB34\uC2DC)"),
        bl("ELLIS Code \uBCF5\uC0AC \uBC84\uD2BC (\uD074\uB9BD\uBCF4\uB4DC)"),
        bl("\uD398\uC774\uC9C0\uB124\uC774\uC158: 20/40/60/80/100\uAC74, \uD398\uC774\uC9C0 \uBC88\uD638 \uB124\uBE44\uAC8C\uC774\uC158"),
        bl("Batch Operation: Export Bookings/Confirmation Letter/Voucher/Invoice, Obtain hotel confirm number"),
        bl("\uAC01 \uC608\uC57D\uBCC4 Ticket \uBC84\uD2BC \u2192 \uD2F0\uCF13 \uC2DC\uC2A4\uD15C \uC5F0\uB3D9"),

        h2("7.4 \uC608\uC57D \uC0C1\uC138 \uBAA8\uB2EC (1200px)"),
        bl("OMH Reservation number"),
        bl("Booker: Name / Email / Tel / Seller Booking Code"),
        bl("Reservation Details: Status, Check-in/out[NTS], Region, Hotel, Rooms, Room Type, Meal, Cancel D/L"),
        bl("Cancel / Voucher / Invoice \uBC84\uD2BC"),
        bl("Travelers \uD14C\uC774\uBE14"),
        bl("Billing & Payment: \uACB0\uC81C\uCC44\uB110 + Billing total + Balance"),
        bl("Cancellation Policy \uD14C\uC774\uBE14: Your Local Time / Property time / Days Left / Fee (Refundable/Non-Refundable)"),
        bl("\uCE94\uC2AC: \uB370\uB4DC\uB77C\uC778 \uC804 \u2192 \uB2E4\uC774\uC5BC\uB85C\uADF8, \uB370\uB4DC\uB77C\uC778 \uD6C4 \u2192 \uACBD\uACE0 \uD1A0\uC2A4\uD2B8"),
        bl("\uC2E4\uC81C \uC0C1\uD0DC \uBCC0\uACBD (Cancelled + cancelDate + Refunded)"),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══ 8. PREPAY/POSTPAY ═══
        h1("8. PREPAY / POSTPAY \uC815\uC0B0 \uAD6C\uC870"),
        tbl(["\uAD6C\uBD84", "POSTPAY (\uD6C4\uBD88)", "PREPAY (\uC120\uBD88)"], [
          ["\uB514\uD3EC\uC9D3", "Credit by Company / Floating Deposit / Guarantee Deposit / Guarantee Insurance / Bank Guarantee / No Deposit", "\uC5C6\uC74C"],
          ["\uC815\uC0B0 \uC8FC\uAE30", "Monthly / Bi-weekly / Weekly", "\uC989\uC2DC \uACB0\uC81C"],
          ["\uACB0\uC81C \uBC29\uBC95", "\uD6C4\uBD88 \uC815\uC0B0 (Net-30 \uB4F1)", "PG \uCE74\uB4DC\uACB0\uC81C"],
          ["\uC608\uC57D \uC0DD\uC131", "Create \u2192 \uD6C4\uBD88", "Pay & Book \u2192 \uCE74\uB4DC\uACB0\uC81C \u2192 Complete"],
          ["Non-refundable", "\uC608\uC57D \uAC00\uB2A5", "\uACB0\uC81C \uD6C4 \uC608\uC57D"],
          ["\uCE74\uB4DC \uC800\uC7A5", "\u2014", "\uCCAB \uACB0\uC81C \uC2DC \uC800\uC7A5 \uBB38\uC758"],
          ["ELLIS \uC5F0\uB3D9", "\uC124\uC815\uAC12 \uB3D9\uAE30\uD654", "\uC124\uC815\uAC12 \uB3D9\uAE30\uD654"],
        ], [2000, 4100, 4100]),

        p("\uACF5\uD1B5 \uC815\uCC45:", { bold: true }),
        bl("\uC608\uC57D \uC218\uC815 \uBD88\uAC00 (Amend \uBC84\uD2BC \uC81C\uAC70) \u2014 \uCDE8\uC18C \uD6C4 \uC7AC\uC608\uC57D\uB9CC \uAC00\uB2A5"),
        bl("Non-refundable \u2192 \uCDE8\uC18C \uBD88\uAC00"),
        bl("\uC694\uCCAD\uC0AC\uD56D \uBCC0\uACBD \u2192 \uD2F0\uCF13 \uC2DC\uC2A4\uD15C\uC73C\uB85C\uB9CC"),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══ 9. DASHBOARD ═══
        h1("9. \uB300\uC2DC\uBCF4\uB4DC (DashboardPage)"),
        bl("5\uAC1C \uD0ED: Overview / Booking Statistics / Cancellation / Daily Booking / Year-End"),
        bl("KPI \uCE74\uB4DC: Total Bookings / Revenue(TTV) / Room Nights / Avg Booking Value"),
        bl("\uCC28\uD2B8: BarChart, AreaChart, PieChart, LineChart (Recharts)"),
        bl("Destination Booking %: \uAD6D\uAC00/\uB3C4\uC2DC \uD1A0\uAE00, \uC6D4\uBCC4 \uBE44\uAD50"),
        bl("Bestselling Hotel Rankings: 320\uAC1C \uD638\uD154, 16\uAC1C\uAD6D \uD544\uD130"),
        bl("Account Level \uD544\uD130: All / Master / Sub-accounts"),
        bl("Period: This Month / Last Month / Last 30 Days / Quarter / Year / Custom"),

        // ═══ 10. SETTLEMENT ═══
        h1("10. \uC815\uC0B0 (SettlementPage)"),
        bl("6\uAC1C \uD0ED: Applications / Billing Details / Invoices / Accounts Receivable / OP Points / Purchase by Hotel"),
        bl("AR Aging: Current / 1-30 Days / 31-60 Days / 60+ Days"),
        bl("Invoice: \uC6D4\uBCC4 \uBC1C\uD589, \uACF5\uAE09\uAC00+VAT, PDF \uB2E4\uC6B4\uB85C\uB4DC"),
        bl("Pay Selected / Bulk Pay \uAE30\uB2A5"),

        // ═══ 11. CLIENT MANAGEMENT ═══
        h1("11. \uACE0\uAC1D \uAD00\uB9AC (ClientManagementPage)"),
        bl("5\uAC1C \uD0ED: Sub-Accounts / Departments / Balance / Voucher Setting / API Keys"),
        bl("Sub-Account: \uAC80\uC0C9, \uC0C1\uD0DC/\uBD80\uC11C \uD544\uD130, \uCD94\uAC00 \uB2E4\uC774\uC5BC\uB85C\uADF8"),
        bl("Balance: \uC2E0\uC6A9\uC794\uACE0 + \uC774\uC5F0\uC2E0\uC6A9 + \uAC70\uB798\uB0B4\uC5ED"),

        // ═══ 12. MY ACCOUNT ═══
        h1("12. \uB0B4 \uACC4\uC815 (MyAccountPage)"),
        bl("6\uAC1C \uD0ED: Profile / Security / Notification Settings / Card Management / Coupons / OP Management"),
        bl("Card Management: \uC800\uC7A5\uB41C \uCE74\uB4DC \uBAA9\uB85D, \uC0AD\uC81C, \uBE0C\uB79C\uB4DC/\uB9C8\uC9C0\uB9C9 4\uC790\uB9AC/\uB9CC\uB8CC\uC77C"),

        // ═══ 13. ADDITIONAL ═══
        h1("13. \uAE30\uD0C0 \uD398\uC774\uC9C0"),
        tbl(["\uD398\uC774\uC9C0", "\uAE30\uB2A5"], [
          ["TicketManagementPage", "\uD2F0\uCF13 \uBAA9\uB85D/\uC0C1\uC138/\uD0C0\uC784\uB77C\uC778, \uC608\uC57D\uBCC4 \uD2F0\uCF13 \uC0DD\uC131"],
          ["NotificationsPage", "\uCE74\uD14C\uACE0\uB9AC\uBCC4 \uD544\uD130, \uC54C\uB9BC \uC124\uC815 8\uAC1C \uD1A0\uAE00"],
          ["FaqBoardPage", "\uAC80\uC0C9 + \uCE74\uD14C\uACE0\uB9AC \uD0ED + \uC544\uCF54\uB514\uC5B8 Q&A"],
          ["RewardsMallPage", "\uD3EC\uC778\uD2B8 \uC794\uC561, \uC0C1\uD488 \uADF8\uB9AC\uB4DC, \uAD50\uD658/\uC804\uD658"],
          ["CampaignPage", "\uCE94\uD398\uC778 \uC0C1\uC138 (\uAD6D\uAC00/\uB3C4\uC2DC \uD544\uD130, \uD638\uD154 \uADF8\uB9AC\uB4DC)"],
          ["OhMyBlogPage", "\uBE14\uB85C\uADF8 \uBAA9\uB85D + \uAE30\uC0AC \uC0C1\uC138"],
          ["ContactUsPage", "\uACE0\uAC1D\uC13C\uD130 \uC5F0\uB77D\uCC98 (\uD55C\uAD6D/\uAE00\uB85C\uBC8C)"],
          ["MarkupSharingPage", "\uB8F8\uBCC4 \uB9C8\uD06C\uC5C5 % \uC785\uB825, \uACAC\uC801 \uBBF8\uB9AC\uBCF4\uAE30, PDF"],
          ["MonthlyRatePage", "\uC6D4\uBCC4 \uCE98\uB9B0\uB354 \uC694\uAE08\uD45C + CSV \uB2E4\uC6B4\uB85C\uB4DC"],
          ["FavoritesPage", "\uC990\uACA8\uCC3E\uAE30 \uD638\uD154 \uADF8\uB9AC\uB4DC"],
        ], [3200, 7000]),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══ 14. UI/UX ═══
        h1("14. UI/UX \uBC0F \uACF5\uD1B5 \uAE30\uB2A5"),
        h2("14.1 \uB808\uC774\uC544\uC6C3"),
        bl("\uC0C1\uB2E8 \uD5E4\uB354: DIDA \uC2A4\uD0C0\uC77C \uB2E4\uD06C \uADF8\uB77C\uB514\uC5B8\uD2B8 + Find Hotel/Bookings \uD0ED"),
        bl("\uC0AC\uC774\uB4DC\uBC14: \uD584\uBC84\uAC70 \uBA54\uB274\uB85C \uC2AC\uB77C\uC774\uB4DC \uC228\uAE30\uAE30/\uBCF4\uC774\uAE30 (localStorage \uC0C1\uD0DC \uC800\uC7A5)"),
        bl("\uBAA8\uBC14\uC77C: Sheet \uB4DC\uB85C\uC5B4 (<768px)"),
        bl("\uB2E4\uD06C\uBAA8\uB4DC: \uD1A0\uAE00 + localStorage \uC601\uC18D"),
        bl("\uD398\uC774\uC9C0 \uD2B8\uB79C\uC9C0\uC158: framer-motion AnimatePresence"),

        h2("14.2 i18n"),
        bl("5\uAC1C \uC5B8\uC5B4: EN / KO / JA / ZH / VI"),
        bl("68\uAC1C \uBC88\uC5ED\uD0A4: \uB124\uBE44\uAC8C\uC774\uC158(13) + \uBC84\uD2BC(10) + \uB300\uC2DC\uBCF4\uB4DC(13) + \uC608\uC57D(9) + \uD638\uD154(5) + \uB808\uC774\uBE14(10) + \uD398\uC774\uC9C0\uD0C0\uC774\uD2C0(8)"),
        bl("\uC5B8\uC5B4 \uC120\uD0DD\uAE30: \uD5E4\uB354 + \uB85C\uADF8\uC778 \uD398\uC774\uC9C0"),

        h2("14.3 \uD654\uD3D0/\uD1B5\uD654"),
        bl("\uD654\uD3D8\uB2E8\uC704: ELLIS\uC5D0\uC11C \uC124\uC815 \u2192 \uC77D\uAE30 \uC804\uC6A9 (USD \uD45C\uC2DC)"),
        bl("CurrencyCalculator: 10\uAC1C \uD1B5\uD654 \uC2E4\uC2DC\uAC04 \uBCC0\uD658 (\uD638\uD154 \uC0C1\uC138 \uD398\uC774\uC9C0)"),

        h2("14.4 \uC0C1\uD0DC \uAD00\uB9AC"),
        bl("\uBAA8\uB4E0 \uD398\uC774\uC9C0: loading / empty / error / success 4\uAC1C \uC0C1\uD0DC"),
        bl("StateToolbar: \uAC1C\uBC1C\uC6A9 \uC0C1\uD0DC \uC804\uD658 \uB3C4\uAD6C"),
        bl("\uC5ED\uD560 \uAD00\uB9AC: Master / OP (Settlement, Client Mgmt \uC811\uADFC \uC81C\uD55C)"),

        // ═══ 15. MOCK DATA ═══
        h1("15. \uBAA9\uB370\uC774\uD130 \uD604\uD669"),
        tbl(["\uD30C\uC77C", "\uB808\uCF54\uB4DC", "\uC124\uBA85"], [
          ["hotels.ts", "24\uAC1C", "\uC544\uC2DC\uC544 \uC804\uC5ED \uD638\uD154 (lat/lng, \uBE0C\uB79C\uB4DC, \uC131\uAE09, \uB9AC\uBDF0)"],
          ["rooms.ts", "24\uAC1C+", "\uD638\uD154\uBCC4 \uB8F8 \uD0C0\uC785 + \uBCC0\uD615 (25\uAC1C \uD544\uB4DC)"],
          ["bookings.ts", "15\uAC1C", "\uC608\uC57D \uB370\uC774\uD130 (29\uAC1C \uD544\uB4DC, HH:MM \uD3EC\uD568)"],
          ["companies.ts", "2\uAC1C", "POSTPAY + PREPAY \uD68C\uC0AC"],
          ["dashboard.ts", "320+", "\uBCA0\uC2A4\uD2B8\uC140\uB9C1 \uD638\uD154 (16\uAC1C\uAD6D)"],
          ["settlement.ts", "8\uAC1C export", "\uBE4C\uB9C1, \uC778\uBCF4\uC774\uC2A4, AR, \uD3EC\uC778\uD2B8"],
          ["clientManagement.ts", "8\uAC1C export", "\uC11C\uBE0C\uACC4\uC815, \uBD80\uC11C, \uC794\uC561, \uBC14\uC6B0\uCC98"],
          ["tickets.ts", "8\uAC1C", "6\uAC1C \uD2F0\uCF13 \uD0C0\uC785, \uD0C0\uC784\uB77C\uC778"],
        ], [2800, 1600, 5800]),

        p(""),
        p("\uBCF8 \uBB38\uC11C\uB294 DOTBIZ \uD504\uB85C\uD1A0\uD0C0\uC785\uC758 100% \uAE30\uB2A5\uC744 \uBE60\uC9D0\uC5C6\uC774 \uAE30\uC220\uD55C \uC885\uD569 \uBA85\uC138\uC11C\uC785\uB2C8\uB2E4.", { italics: true, color: G }),
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("docs/DOTBIZ_Full_Spec_v3.0.docx", buffer);
  console.log("Created: DOTBIZ_Full_Spec_v3.0.docx (" + Math.round(buffer.length / 1024) + "KB)");
})();
