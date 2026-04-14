const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat,
} = require("docx");

// ─── Color constants ───
const PRIMARY = "EA580C";
const HEADER_BG = "1F2937";
const HEADER_TEXT = "FFFFFF";
const ROW_ALT = "FFF7ED";
const BORDER_COLOR = "D1D5DB";

// ─── Helpers ───
const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function heading(text, level) {
  return new Paragraph({ heading: level, spacing: { before: 300, after: 150 }, children: [new TextRun({ text, bold: true, font: "Arial" })] });
}

function bodyText(text, opts = {}) {
  return new Paragraph({ spacing: { after: 120 }, ...opts, children: [new TextRun({ text, font: "Arial", size: 22, ...opts.run })] });
}

function bulletItem(text, ref = "bullets", level = 0) {
  return new Paragraph({ numbering: { reference: ref, level }, spacing: { after: 60 }, children: [new TextRun({ text, font: "Arial", size: 22 })] });
}

function headerCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, margins: cellMargins,
    shading: { fill: HEADER_BG, type: ShadingType.CLEAR },
    verticalAlign: "center",
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: HEADER_TEXT, font: "Arial", size: 20 })] })]
  });
}

function dataCell(text, width, alt = false) {
  const opts = { borders, width: { size: width, type: WidthType.DXA }, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: text || "", font: "Arial", size: 20 })] })] };
  if (alt) opts.shading = { fill: ROW_ALT, type: ShadingType.CLEAR };
  return new TableCell(opts);
}

function simpleTable(headers, rows, colWidths) {
  const tw = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: tw, type: WidthType.DXA }, columnWidths: colWidths,
    rows: [
      new TableRow({ children: headers.map((h, i) => headerCell(h, colWidths[i])) }),
      ...rows.map((row, ri) => new TableRow({ children: row.map((c, ci) => dataCell(c, colWidths[ci], ri % 2 === 1)) }))
    ]
  });
}

// ─── Build Document ───
const children = [];

// Cover page
children.push(new Paragraph({ spacing: { before: 3000 }, alignment: AlignmentType.CENTER, children: [] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "DOTBIZ", font: "Arial", size: 72, bold: true, color: PRIMARY })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "B2B Hotel Booking System", font: "Arial", size: 36, color: "6B7280" })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Functional Specification", font: "Arial", size: 32, bold: true })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "v1.0 | 2026-03-28", font: "Arial", size: 24, color: "9CA3AF" })] }));

children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [] }));
children.push(simpleTable(
  ["Item", "Detail"],
  [
    ["Status", "FINALIZED"],
    ["Author", "Planning Plugin (Auto-generated)"],
    ["Working Language", "Korean (ko)"],
    ["Target Users", "Master / OP (Operating Partner)"],
    ["Tech Stack", "Vanilla JS SPA + Mock API + LocalStorage"],
    ["Screens", "17 screens (incl. shared layout)"],
    ["Review Rounds", "2 (Planner 8/10, Tester 7/10)"],
  ],
  [3000, 6360]
));

children.push(new PageBreak());

// TOC placeholder
children.push(heading("Table of Contents", HeadingLevel.HEADING_1));
children.push(bodyText("(Word에서 참조 > 목차 삽입으로 자동 생성하세요)"));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ═══ 1. Overview ═══
children.push(heading("1. Overview", HeadingLevel.HEADING_1));
children.push(heading("1.1 Purpose", HeadingLevel.HEADING_2));
children.push(bodyText("DOTBIZ is an AI-powered next-generation B2B hotel booking platform that provides Operating Partners (OPs) with an intuitive and efficient booking experience. Through the Net Rate supply model, it ensures partner margin autonomy, optimized payment processes by business type (prepaid/postpaid), and real-time operational tools."));
children.push(bodyText("This specification covers the reimplementation of the existing prototype into a production-ready system using a Frontend (Vanilla JS SPA) + Mock API architecture with LocalStorage-based data persistence."));

children.push(heading("1.2 Target Users", HeadingLevel.HEADING_2));
children.push(simpleTable(
  ["Role", "Description", "Key Functions"],
  [
    ["Master", "Company administrator", "Full OP management, settlement access, performance comparison, all bookings"],
    ["OP", "Operating Partner", "Hotel search/booking, customer service, personal performance, own bookings only"],
  ],
  [1500, 3000, 4860]
));
children.push(bodyText("No Admin role required. Company registration approval is handled through an internal manual process."));

children.push(heading("1.3 Success Metrics", HeadingLevel.HEADING_2));
children.push(simpleTable(
  ["KPI", "Target", "Method"],
  [
    ["Page load time", "< 2 seconds", "Performance API"],
    ["Search response time", "< 1 second", "Search execution to results"],
    ["AI response time", "< 5 seconds", "Claude API call to response"],
    ["System uptime", "99.9%", "Monitoring"],
  ],
  [3000, 2500, 3860]
));

children.push(new PageBreak());

// ═══ 2. User Stories ═══
children.push(heading("2. User Stories", HeadingLevel.HEADING_1));
const stories = [
  ["US-001", "OP", "Log in with email/password", "P0"],
  ["US-002", "New Company", "Complete 3-step registration", "P0"],
  ["US-003", "OP", "Search hotels by destination, date, guests", "P0"],
  ["US-004", "OP", "View results in list/map with filters", "P0"],
  ["US-005", "OP", "View hotel details and select rooms", "P0"],
  ["US-006", "OP", "Enter guest info and confirm booking", "P0"],
  ["US-007", "OP", "Download/email voucher after booking", "P0"],
  ["US-008", "OP", "View/filter/manage all bookings", "P0"],
  ["US-009", "OP", "Cancel bookings and view refund info", "P0"],
  ["US-010", "OP", "Calendar view of monthly bookings", "P1"],
  ["US-011", "Master", "View monthly settlement and invoices", "P0"],
  ["US-012", "Master", "Manage accounts receivable", "P0"],
  ["US-013", "OP", "AI natural language hotel search", "P1"],
  ["US-014", "OP", "View and act on notifications", "P1"],
  ["US-015", "Both", "Dashboard KPI and analytics", "P1"],
  ["US-016", "OP", "Redeem rewards with OP Points", "P2"],
  ["US-017", "OP", "Support chat for booking inquiries", "P2"],
  ["US-018", "OP", "Browse FAQ board", "P2"],
  ["US-019", "Master", "Create/edit/deactivate OP accounts", "P0"],
  ["US-020", "OP", "Save favorite hotels", "P1"],
  ["US-021", "OP", "Configure dark mode/language/currency", "P1"],
  ["US-022", "OP", "Re-book cancelled bookings", "P1"],
  ["US-023", "Master", "Compare OP performance", "P1"],
  ["US-024", "OP", "Transfer points to other OPs", "P2"],
];
children.push(simpleTable(["ID", "Role", "Goal", "Priority"], stories, [1000, 1200, 5360, 1800]));

children.push(new PageBreak());

// ═══ 3. Functional Requirements ═══
children.push(heading("3. Functional Requirements", HeadingLevel.HEADING_1));

// --- AUTH ---
children.push(heading("3.1 Authentication & Account (FR-AUTH)", HeadingLevel.HEADING_2));

children.push(heading("FR-AUTH-001: Login", HeadingLevel.HEADING_3));
children.push(bodyText("Email/password-based login with animated tech-style background."));
children.push(bulletItem("Remember Me checkbox (email saved to localStorage)"));
children.push(bulletItem("Role-based access control (Master: Settlement accessible, OP: not)"));
children.push(bulletItem("Session timeout: 30 min inactivity (mouse/keyboard/API = activity)"));
children.push(bulletItem("5-min warning popup with 'Extend Session' button; click resets 30 min timer"));
children.push(bulletItem("Form data preserved in sessionStorage on timeout; restored after re-login"));
children.push(bulletItem("Account lock after 5 consecutive failed logins (30 min auto-unlock or Master manual unlock)"));
children.push(bulletItem("Dark mode toggle on login screen"));

children.push(heading("FR-AUTH-002: Self-Registration (3-Step)", HeadingLevel.HEADING_3));
children.push(bodyText("Step 1: Company info (Name, Business Reg No., Type: Prepaid/Postpaid, Address, Phone, Email)"));
children.push(bodyText("Step 2: User info (Name, Position, Email, Password, Password Confirm, Mobile, Language)"));
children.push(bodyText("Step 3: Terms agreement + Contract PDF download"));
children.push(bulletItem("Pending status on completion (internal manual approval required)"));
children.push(bulletItem("Redirect to login after 5 sec with guidance message"));
children.push(bulletItem("Email duplicate check on Step 2 Next click"));
children.push(bulletItem("Password: 8-128 chars, letters+numbers+special chars"));

children.push(heading("FR-AUTH-003: My Account", HeadingLevel.HEADING_3));
children.push(bulletItem("Personal info edit (name, phone, password)"));
children.push(bulletItem("Company info view (Business Type, contract date)"));
children.push(bulletItem("Prepaid: registered corporate card list, default card setting"));
children.push(bulletItem("Postpaid: Floating Deposit balance, Credit Line limit"));

children.push(heading("FR-AUTH-004: Multi-OP System (Master only)", HeadingLevel.HEADING_3));
children.push(bulletItem("Master creates/edits/deactivates OP accounts (no limit on count)"));
children.push(bulletItem("Per-OP Share ratio for point distribution"));
children.push(bulletItem("Deactivated OP: existing bookings preserved (Master viewable), no new bookings"));
children.push(bulletItem("Share ratio change: applies to future earnings only (no retroactive)"));

children.push(heading("FR-AUTH-005: Password Reset", HeadingLevel.HEADING_3));
children.push(bulletItem("'Forgot Password?' link on Login screen"));
children.push(bulletItem("Email-based reset (Mock: simulated - instant redirect to reset screen)"));
children.push(bulletItem("Same message for registered/unregistered emails (security)"));

children.push(new PageBreak());

// --- State Transitions ---
children.push(heading("3.2 State Transition Diagrams", HeadingLevel.HEADING_2));

children.push(heading("Booking Status (5 states)", HeadingLevel.HEADING_3));
children.push(simpleTable(
  ["From", "To", "Trigger", "Note"],
  [
    ["Pending", "Confirmed", "Payment complete / Deposit confirmed", ""],
    ["Pending", "Cancelled", "User cancel / RNPL deadline auto-cancel", "Prepaid only: deadline exceeded"],
    ["Confirmed", "Cancelled", "User cancel", "Cancellation fee policy applies"],
    ["Confirmed", "Completed", "Checkout date + 1 day", "System auto"],
    ["Confirmed", "No-show", "Check-in date + 1 day, no show", "Master/system"],
    ["Cancelled", "(new) Pending", "Re-book creates NEW booking", "Original stays Cancelled"],
  ],
  [1800, 1800, 3200, 2560]
));
children.push(bodyText("Irreversible: Cancelled, Completed, No-show cannot transition to other states."));

children.push(heading("Payment Status (6 states)", HeadingLevel.HEADING_3));
children.push(simpleTable(
  ["From", "To", "Trigger"],
  [
    ["Not Paid", "Fully Paid", "Full payment"],
    ["Not Paid", "Partially Paid", "Partial payment"],
    ["Partially Paid", "Fully Paid", "Remaining balance paid"],
    ["Fully Paid", "Refunded", "Full refund after cancellation"],
    ["Fully Paid", "Partially Refunded", "Partial refund (fee deducted)"],
    ["Pending", "Fully Paid", "PG payment success"],
    ["Pending", "Not Paid", "PG payment failure / 30s timeout"],
  ],
  [2500, 2500, 4360]
));

children.push(new PageBreak());

// --- Cancellation Policy ---
children.push(heading("3.3 Cancellation Fee Structure", HeadingLevel.HEADING_2));
children.push(bodyText("Each hotel/room has a cancellation policy defined in data:"));
children.push(simpleTable(
  ["Policy Type", "Rule", "Fee"],
  [
    ["Free Cancel", "Before freeCancelBeforeDays (midnight basis)", "0%"],
    ["Partial Refund", "After free cancel deadline, before check-in", "50% (configurable per hotel)"],
    ["Non-Refundable", "Any time", "100% (warning modal shown, cancellation still possible)"],
    ["No-show", "After check-in date", "100%"],
  ],
  [2500, 4000, 2860]
));
children.push(bodyText("Boundary: freeCancelBeforeDays calculated from check-in date midnight (00:00:00) in browser local time."));
children.push(bodyText("Payment failure: Booking is NOT created; user returns to Booking Form."));

// --- Currency ---
children.push(heading("3.4 Currency Exchange Handling", HeadingLevel.HEADING_2));
children.push(bulletItem("Source: Fixed exchange rate JSON file (exchangeRates.json), base currency USD"));
children.push(bulletItem("Display-only conversion; payments/settlements stored in USD"));
children.push(bulletItem("Decimal places: KRW/JPY/VND = 0, USD/EUR/GBP/SGD/HKD/THB/CNY = 2"));
children.push(bulletItem("Vouchers/receipts show USD base + selected currency equivalent"));

// --- Multi-room ---
children.push(heading("3.5 Multi-Room Booking Rules", HeadingLevel.HEADING_2));
children.push(bulletItem("2+ rooms: Only Primary Traveler (1 guest) input required"));
children.push(bulletItem("Same guest info applied to all rooms"));
children.push(bulletItem("'1st Traveler' column in booking list shows Primary Traveler"));

children.push(new PageBreak());

// --- SEARCH ---
children.push(heading("3.6 Hotel Search (FR-SEARCH)", HeadingLevel.HEADING_2));
children.push(heading("FR-SEARCH-001: Find Hotel", HeadingLevel.HEADING_3));
children.push(bulletItem("Destination autocomplete (Asia major cities, landmarks, hotel names)"));
children.push(bulletItem("Check-in/out date picker, Nights auto-calculation"));
children.push(bulletItem("Rooms/Adults/Children selector, child age individual input (0-17)"));
children.push(bulletItem("Validation: check-in >= today, checkout > checkin, min 1 night, max 30 nights"));
children.push(bulletItem("Nationality selector, Favorites section"));

children.push(heading("FR-SEARCH-002: List View", HeadingLevel.HEADING_3));
children.push(bulletItem("Hotel cards: image, name, area, stars, rating, reviews, price"));
children.push(bulletItem("Badges: FEATURED, FREE CANCEL"));
children.push(bulletItem("Filters: star rating, price range, area, amenities"));
children.push(bulletItem("Sort: recommended, price (asc/desc), rating"));
children.push(bulletItem("Pagination: 20 per page"));

children.push(heading("FR-SEARCH-003: Map View", HeadingLevel.HEADING_3));
children.push(bulletItem("Leaflet.js + OpenStreetMap interactive map"));
children.push(bulletItem("Price markers, popup on click (image, name, rating, remaining rooms)"));
children.push(bulletItem("Bidirectional highlight: marker <-> list"));

children.push(heading("FR-SEARCH-004: Favorites", HeadingLevel.HEADING_3));
children.push(bulletItem("Star toggle on hotel card/detail, localStorage persistence"));

children.push(new PageBreak());

// --- HOTEL DETAIL ---
children.push(heading("3.7 Hotel Detail (FR-HOTEL)", HeadingLevel.HEADING_2));
children.push(bulletItem("Breadcrumb navigation, compact search bar (date/room edit)"));
children.push(bulletItem("Hero section (image, name, stars, rating, favorite button)"));
children.push(bulletItem("4 tabs: Rooms, Overview, Policies, Facilities"));
children.push(bulletItem("Rooms tab: filters (Room Type, Bed Type, Price, Meal Plan, Refundable Only)"));
children.push(bulletItem("Room card: name, bed type, max guests, cancel policy, meal, price, Select button"));

// --- BOOKING ---
children.push(heading("3.8 Booking Process (FR-BOOK)", HeadingLevel.HEADING_2));
children.push(heading("Step 1: Booking Form", HeadingLevel.HEADING_3));
children.push(bulletItem("Guest: First/Last Name, Email, Mobile, Special Requests"));
children.push(bulletItem("Summary sidebar: hotel, room, dates, pricing"));
children.push(bulletItem("Prepaid: Corporate card select OR Reserve Now Pay Later"));
children.push(bulletItem("Postpaid: Deposit (full) OR Credit Line (full) - no mixed payment"));
children.push(bulletItem("Deposit insufficient: confirmation UI to switch to Credit Line"));

children.push(heading("Step 2: Booking Confirm", HeadingLevel.HEADING_3));
children.push(bulletItem("Review: hotel, dates, room, guest, price detail (Rate + Tax + Total)"));
children.push(bulletItem("Cancellation policy display"));
children.push(bulletItem("Terms checkbox -> Confirm button enabled"));

children.push(heading("Step 3: Booking Complete", HeadingLevel.HEADING_3));
children.push(bulletItem("ELLIS Booking Code: K + YYMMDD + HHMMSS + H + NN"));
children.push(bulletItem("NN = daily sequence 01-99, 3-digit extension for 100+ bookings"));
children.push(bulletItem("Reset at midnight (browser local time), UUID-based internal ID"));
children.push(bulletItem("Voucher download/email, My Bookings/New Booking buttons"));

children.push(heading("Cancellation (FR-BOOK-004)", HeadingLevel.HEADING_3));
children.push(bulletItem("Reason selection dropdown, auto fee calculation (hotel policy)"));
children.push(bulletItem("Non-Refundable: 100% fee warning modal, cancellation still possible"));
children.push(bulletItem("Prepaid RNPL: D-3, D-1 warnings, auto-cancel immediately at deadline"));

children.push(heading("Re-book (FR-BOOK-005)", HeadingLevel.HEADING_3));
children.push(bulletItem("Creates NEW independent booking (original stays Cancelled)"));
children.push(bulletItem("Navigates to same hotel detail with preserved dates"));

children.push(new PageBreak());

// --- BOOKING MANAGEMENT ---
children.push(heading("3.9 Booking Management (FR-BKG)", HeadingLevel.HEADING_2));
children.push(heading("Booking List (14 columns)", HeadingLevel.HEADING_3));
children.push(bodyText("Checkbox, Booking Date, ELLIS Code, Booking Status (5 states), Payment Status (6 states), Hotel Name, Cancel Deadline, Check-in & Nights, Room Type & Count, 1st Traveler, Currency, Amount, Invoice No., Dispute"));
children.push(bulletItem("Page size: 20/50/100 selectable"));
children.push(bulletItem("Filters: Date Type (6 options), ELLIS Code, Status, Payment, Search By, Country, Hotel"));
children.push(bulletItem("Excel export (.xlsx), Bulk voucher download"));

children.push(heading("Booking Detail Modal (9 sections)", HeadingLevel.HEADING_3));
children.push(bulletItem("Booking Summary, Hotel Info, Room Details, Guest Info, Payment Info"));
children.push(bulletItem("Cancellation Policy, Special Requests, Booking Timeline, Actions"));
children.push(bulletItem("Modify: guest info only (name/email/phone/requests), Confirmed/Pending only"));
children.push(bulletItem("ELLIS Code quick-lookup via TopBar GlobalSearch"));

children.push(heading("Calendar View", HeadingLevel.HEADING_3));
children.push(bulletItem("Monthly grid, event colors: Check-in(Blue), Check-out(Yellow), Stay(Green), Cancelled(Red), Deadline(Pink)"));
children.push(bulletItem("Max 3 events per cell, '+N more' click shows popup"));
children.push(bulletItem("Monthly stats: Confirmed, Cancelled, Room Nights, Net Cost, Unpaid"));
children.push(bulletItem("Upcoming Check-ins: next 5, D-day color coding"));

children.push(heading("Support Chat", HeadingLevel.HEADING_3));
children.push(bulletItem("Chat room list + message area (Bookings tab)"));
children.push(bulletItem("ELLIS Code auto-detection in chat"));
children.push(bulletItem("AI chatbot first response, Connect to Agent escalation"));

children.push(new PageBreak());

// --- SETTLEMENT ---
children.push(heading("3.10 Settlement System (FR-SET, Master only)", HeadingLevel.HEADING_2));
children.push(simpleTable(
  ["Tab", "Description", "Key Features"],
  [
    ["Monthly", "Monthly settlement details", "Month selector, summary cards, daily table, PDF/Excel"],
    ["Invoices", "Tax invoices", "Status: Draft/Issued/Paid, VAT 10%, PDF download, email"],
    ["AR", "Accounts Receivable", "Unpaid list, D-day display, individual/bulk/split payment"],
    ["OP Points", "Point settlement", "Earn/use/transfer history, balance"],
    ["Purchase by Hotel", "Hotel purchase analysis", "Total amount, count, avg, share %, chart"],
  ],
  [1800, 2800, 4760]
));
children.push(bulletItem("Split payment: min 10% of total, max 5 splits, status -> Partially Paid"));

// --- PAYMENT ---
children.push(heading("3.11 Payment System (FR-PAY)", HeadingLevel.HEADING_2));
children.push(simpleTable(
  ["Type", "Method", "Rules"],
  [
    ["Prepaid - Card", "Corporate card PG auto-pay", "Non-Refundable: instant payment (PG simulation)"],
    ["Prepaid - RNPL", "Reserve Now Pay Later", "No payment at booking, pay before Cancel Deadline"],
    ["Postpaid - Deposit", "Floating Deposit deduction", "Real-time deduction, insufficient -> Credit Line offer UI"],
    ["Postpaid - Credit", "Credit Line", "Deposit-based limit, monthly settlement"],
    ["Low Deposit", "Warning", "Deposit < $5,000 -> Critical notification"],
  ],
  [2200, 2800, 4360]
));
children.push(bulletItem("Deposit + Credit mixed payment NOT allowed (choose one)"));
children.push(bulletItem("Both insufficient: ERR-PAY-005 displayed, booking blocked"));

children.push(new PageBreak());

// --- POINTS ---
children.push(heading("3.12 OP Points System (FR-PTS)", HeadingLevel.HEADING_2));
children.push(bulletItem("Auto-earn on booking completion (fixed rate from internal config)"));
children.push(bulletItem("Distribution by OP Share ratio"));
children.push(bulletItem("Rewards Mall: 6 categories, 20+ products"));
children.push(bulletItem("Transfer: same company OPs only, Master or self, min 1P, integer only"));
children.push(bulletItem("History: earn/use/transfer, period filter"));

// --- AI ---
children.push(heading("3.13 AI Booking Assistant (FR-AI, Floating Widget)", HeadingLevel.HEADING_2));
children.push(bulletItem("Natural language hotel recommendation (Claude API, method TBD)"));
children.push(bulletItem("Booking analysis (total bookings, spending, frequency, avg rate)"));
children.push(bulletItem("Area guide (region comparison, purpose-based recommendation)"));
children.push(bulletItem("Quick Actions: 4 preset buttons"));
children.push(bulletItem("Local Fallback: hotel recommendation only (max 5 cards, no text), analysis/guide show unavailable message"));

// --- NOTIFICATIONS ---
children.push(heading("3.14 Notification Center (FR-NOTI)", HeadingLevel.HEADING_2));
children.push(simpleTable(
  ["Notification Type", "Timing", "Priority"],
  [
    ["Cancel Deadline", "D-7, D-3, D-1", "Medium, High, Critical"],
    ["Check-in Reminder", "D-3, D-1", "Medium, High"],
    ["Payment Pending", "Booking creation", "Medium"],
    ["Booking Confirmed", "Confirmation", "Low"],
    ["Booking Cancelled", "Cancellation", "Low"],
    ["Low Deposit", "Balance check", "Critical"],
  ],
  [3000, 3000, 3360]
));
children.push(bulletItem("Dedup key prevents duplicate notifications"));
children.push(bulletItem("Frontend-based: scan bookings on page load, create if conditions met"));
children.push(bulletItem("8 category tabs, read/unread, settings toggles, summary cards"));

children.push(new PageBreak());

// --- DASHBOARD ---
children.push(heading("3.15 Dashboard (FR-DASH)", HeadingLevel.HEADING_2));
children.push(simpleTable(
  ["Widget", "Description", "Access"],
  [
    ["KPI Cards", "Total Bookings, Revenue(TTV), Room Nights, Avg Booking Value + trend", "All"],
    ["OP Points Widget", "Balance, monthly earned/used, Rewards Mall link", "All"],
    ["Top Hotels", "Top 5 hotels by bookings/amount", "All"],
    ["12-Month TTV Trend", "CSS bar chart, current month highlight", "All"],
    ["Booking Funnel", "Search->Views->Started->Confirmed->Completed", "All"],
    ["Hotel Profitability", "Avg Net/Night, count, trend per hotel", "All"],
    ["OP Performance", "Per-OP bookings/TTV/nights/avg + ranking", "Master only"],
    ["My Performance", "Success rate, response time, satisfaction, repeat rate gauges", "OP only"],
  ],
  [2500, 4500, 2360]
));

// --- FAQ ---
children.push(heading("3.16 FAQ Board (FR-FAQ)", HeadingLevel.HEADING_2));
children.push(bulletItem("6 category tabs: All, Booking, Payment, Cancellation, Account, Technical"));
children.push(bulletItem("22+ articles, accordion expand/collapse"));
children.push(bulletItem("Keyword search (title + content), real-time filtering"));

// --- UI/UX ---
children.push(heading("3.17 UI/UX Requirements (FR-UI)", HeadingLevel.HEADING_2));
children.push(simpleTable(
  ["Feature", "Detail"],
  [
    ["Dark Mode", "CSS Variables, header toggle, localStorage"],
    ["Languages", "5 languages (EN, KO, JA, ZH, VI) - full translation"],
    ["Currencies", "10 currencies (USD, KRW, JPY, CNY, VND, EUR, GBP, THB, SGD, HKD)"],
    ["Responsive", "Desktop optimized (1024px+), tablet support"],
    ["CI Colors", "Primary #FF6000, Success #009505, Background #FCFCF8"],
  ],
  [2500, 6860]
));

children.push(new PageBreak());

// ═══ 4. Screen Inventory ═══
children.push(heading("4. Screen Inventory", HeadingLevel.HEADING_1));
children.push(simpleTable(
  ["#", "Screen", "Route", "Access"],
  [
    ["1", "Login", "/login", "Public"],
    ["2", "Registration", "/register", "Public"],
    ["3", "Dashboard", "/app/dashboard", "All"],
    ["4", "Find Hotel", "/app/find-hotel", "All"],
    ["5", "Search Results", "/app/search-results", "All"],
    ["6", "Hotel Detail", "/app/hotel/:id", "All"],
    ["7", "Booking Form", "/app/booking/form", "All"],
    ["8", "Booking Confirm", "/app/booking/confirm", "All"],
    ["9", "Booking Complete", "/app/booking/complete", "All"],
    ["10", "Bookings (List/Calendar/Chat)", "/app/bookings", "All"],
    ["11", "Settlement (5 tabs)", "/app/settlement", "Master"],
    ["12", "Notifications", "/app/notifications", "All"],
    ["13", "FAQ Board", "/app/faq", "All"],
    ["14", "My Account", "/app/my-account", "All"],
    ["15", "Rewards Mall", "/app/rewards", "All"],
    ["16", "AI Assistant (Floating)", "Overlay", "All"],
    ["17", "Shared Layout (Sidebar+TopBar)", "/app/*", "All"],
  ],
  [600, 3500, 3000, 2260]
));

children.push(new PageBreak());

// ═══ 5. Error Handling ═══
children.push(heading("5. Error Handling", HeadingLevel.HEADING_1));
children.push(simpleTable(
  ["Code", "Condition", "Message"],
  [
    ["ERR-AUTH-001", "Invalid email/password", "Invalid email or password"],
    ["ERR-AUTH-002", "Pending account login", "Account pending approval"],
    ["ERR-AUTH-003", "Deactivated account", "Account deactivated"],
    ["ERR-AUTH-004", "Session timeout (30min)", "Session expired, please re-login"],
    ["ERR-AUTH-005", "Account locked (5 failures)", "Account locked for 30 minutes"],
    ["ERR-AUTH-006", "Password reset email", "Reset instructions sent (same msg for all)"],
    ["ERR-SEARCH-001", "No results", "No hotels match your criteria"],
    ["ERR-SEARCH-003", "Past check-in date", "Check-in must be today or later"],
    ["ERR-SEARCH-004", "Checkout before checkin", "Checkout must be after check-in"],
    ["ERR-BOOK-001", "Missing required fields", "Please fill all required fields"],
    ["ERR-BOOK-002", "Room unavailable", "Selected room is no longer available"],
    ["ERR-BOOK-003", "Non-refundable cancel", "100% fee applies. Proceed?"],
    ["ERR-PAY-001", "Card payment failed", "Payment failed, check card info"],
    ["ERR-PAY-002", "Deposit insufficient", "Insufficient balance"],
    ["ERR-PAY-003", "Credit limit exceeded", "Credit limit exceeded"],
    ["ERR-PAY-005", "Both Deposit+Credit insufficient", "Both balance and credit insufficient"],
    ["ERR-STORAGE-001", "LocalStorage 5MB exceeded", "Storage full, cleaning old data"],
    ["ERR-AI-001", "Claude API connection failed", "AI service temporarily unavailable"],
    ["ERR-REG-001", "Duplicate email", "Email already registered"],
  ],
  [2000, 3200, 4160]
));

children.push(new PageBreak());

// ═══ 6. NFR ═══
children.push(heading("6. Non-Functional Requirements", HeadingLevel.HEADING_1));
children.push(simpleTable(
  ["Category", "Requirement"],
  [
    ["Performance", "Page load < 2s, Search < 1s, AI < 5s, Lazy loading, Virtual scroll"],
    ["Security", "Password hash, 30min session, RBAC, XSS prevention, CSRF tokens"],
    ["Accessibility", "Not in scope for this version"],
    ["i18n", "5 languages full translation, locale-based date/number formatting"],
    ["Compatibility", "Chrome, Safari, Firefox, Edge (latest), min 1024px"],
    ["Availability", "99.9% uptime, < 4h recovery"],
    ["Storage", "LocalStorage (5MB limit), auto-cleanup old cache, StorageEvent multi-tab sync"],
    ["Performance Test Baseline", "50+ hotels, 200+ bookings (~2MB), 2 concurrent tabs"],
  ],
  [2500, 6860]
));

children.push(new PageBreak());

// ═══ 7. Open Questions ═══
children.push(heading("7. Open Questions", HeadingLevel.HEADING_1));
children.push(simpleTable(
  ["ID", "Question", "Status"],
  [
    ["OQ-001", "Claude API call method (frontend direct vs proxy server)", "OPEN"],
    ["OQ-002", "OP Points earning rate default value", "OPEN"],
    ["OQ-003", "Point monetary value (1P = ? KRW)", "OPEN"],
    ["OQ-004", "Hotel data initial set size (recommend 50+)", "OPEN"],
    ["OQ-005", "Excel export library (SheetJS allowed?)", "OPEN"],
    ["OQ-006", "Support Chat mock behavior", "OPEN"],
    ["OQ-007", "Invoice auto-generation timing", "OPEN"],
  ],
  [1000, 6500, 1860]
));

// ═══ 8. Review History ═══
children.push(heading("8. Review History", HeadingLevel.HEADING_1));
children.push(simpleTable(
  ["Round", "Planner", "Tester", "Key Decisions"],
  [
    ["1", "7/10", "4/10", "Added: password reset, state diagrams, payment status 6 types, cancellation fee structure, currency handling, validation rules, ELLIS Code collision, multi-room rules, Deposit/Credit switch, split payment, OP deactivation, notification timing, AI fallback scope"],
    ["2", "8/10", "7/10", "Resolved: Non-Refundable cancel contradiction (warning + allow), ELLIS Code 100+ extension, session warning popup detail, RNPL auto-cancel timing"],
  ],
  [1000, 1200, 1200, 5960]
));

children.push(new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: "--- End of Document ---", font: "Arial", size: 22, color: "9CA3AF", italics: true })] }));

// ─── Build & Save ───
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: HEADER_BG },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: PRIMARY },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
      ] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        children: [
          new TextRun({ text: "DOTBIZ B2B Hotel Booking System — Functional Specification v1.0", font: "Arial", size: 18, color: "9CA3AF" }),
        ],
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Page ", font: "Arial", size: 18, color: "9CA3AF" }),
          new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "9CA3AF" }),
        ]
      })] })
    },
    children,
  }]
});

const outPath = "C:/Users/오오마켓/Desktop/DOTBIZ_기획서_v1.0.docx";
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("Created: " + outPath + " (" + Math.round(buf.length / 1024) + " KB)");
});
