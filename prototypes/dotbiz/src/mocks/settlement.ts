export const monthlySummary = {
  totalNetCost: 48750,
  roomNights: 423,
  avgNetPerNight: 115,
};

export const dailyDetails = [
  { date: "2026-03-01", bookingCount: 5, roomNights: 14, netCost: 1620 },
  { date: "2026-03-02", bookingCount: 3, roomNights: 8, netCost: 960 },
  { date: "2026-03-03", bookingCount: 7, roomNights: 18, netCost: 2070 },
  { date: "2026-03-04", bookingCount: 4, roomNights: 11, netCost: 1265 },
  { date: "2026-03-05", bookingCount: 6, roomNights: 16, netCost: 1840 },
];

/* ── Settlement Applications (정산 신청 대상 예약) ── */
export const settlementApplications = [
  { id: "sa-001", bookingDate: "2026-03-15", ellisCode: "ELS-2026-00128", hotelName: "Hotel Nikko Bangkok", checkIn: "2026-03-18", amount: 780, settlementStatus: "Eligible" as const },
  { id: "sa-002", bookingDate: "2026-03-20", ellisCode: "ELS-2026-00142", hotelName: "Grand Hyatt Seoul", checkIn: "2026-04-10", amount: 840, settlementStatus: "Eligible" as const },
  { id: "sa-003", bookingDate: "2026-03-22", ellisCode: "ELS-2026-00155", hotelName: "Shilla Stay Mapo", checkIn: "2026-04-15", amount: 580, settlementStatus: "Pending" as const },
  { id: "sa-004", bookingDate: "2026-03-28", ellisCode: "ELS-2026-00183", hotelName: "The Peninsula Shanghai", checkIn: "2026-04-20", amount: 1140, settlementStatus: "Eligible" as const },
  { id: "sa-005", bookingDate: "2026-03-30", ellisCode: "ELS-2026-00191", hotelName: "Marina Bay Sands", checkIn: "2026-04-15", amount: 840, settlementStatus: "Eligible" as const },
  { id: "sa-006", bookingDate: "2026-04-02", ellisCode: "ELS-2026-00212", hotelName: "Four Seasons Bali at Sayan", checkIn: "2026-04-30", amount: 2900, settlementStatus: "Pending" as const },
  { id: "sa-007", bookingDate: "2026-04-10", ellisCode: "ELS-2026-00248", hotelName: "Novotel Shanghai Pudong", checkIn: "2026-04-06", amount: 270, settlementStatus: "Applied" as const },
  { id: "sa-008", bookingDate: "2026-04-08", ellisCode: "ELS-2026-00240", hotelName: "Raffles Singapore", checkIn: "2026-04-28", amount: 1650, settlementStatus: "Eligible" as const },
];

/* ── Billing Details (정산 내역) ── */
export const billingDetails = [
  { billId: "BILL-2026-0001", billType: "Hotel Booking" as const, bookingId: "ELS-2026-00128", hotelName: "Hotel Nikko Bangkok", amount: 780, createdDate: "2026-03-20", dueDate: "2026-04-05", settlementDate: "2026-04-03", status: "Settled" as const },
  { billId: "BILL-2026-0002", billType: "Hotel Booking" as const, bookingId: "ELS-2026-00142", hotelName: "Grand Hyatt Seoul", amount: 840, createdDate: "2026-03-25", dueDate: "2026-04-10", settlementDate: "2026-04-08", status: "Settled" as const },
  { billId: "BILL-2026-0003", billType: "Cancellation Fee" as const, bookingId: "ELS-2026-00112", hotelName: "ANA Crowne Plaza Osaka", amount: 65, createdDate: "2026-03-18", dueDate: "2026-04-02", settlementDate: "2026-04-01", status: "Settled" as const },
  { billId: "BILL-2026-0004", billType: "Hotel Booking" as const, bookingId: "ELS-2026-00155", hotelName: "Shilla Stay Mapo", amount: 580, createdDate: "2026-03-28", dueDate: "2026-04-12", settlementDate: "", status: "Pending" as const },
  { billId: "BILL-2026-0005", billType: "Hotel Booking" as const, bookingId: "ELS-2026-00183", hotelName: "The Peninsula Shanghai", amount: 1140, createdDate: "2026-04-01", dueDate: "2026-04-15", settlementDate: "", status: "Pending" as const },
  { billId: "BILL-2026-0006", billType: "Adjustment" as const, bookingId: "ELS-2026-00128", hotelName: "Hotel Nikko Bangkok", amount: -45, createdDate: "2026-04-02", dueDate: "2026-04-16", settlementDate: "2026-04-10", status: "Settled" as const },
  { billId: "BILL-2026-0007", billType: "Hotel Booking" as const, bookingId: "ELS-2026-00191", hotelName: "Marina Bay Sands", amount: 840, createdDate: "2026-04-03", dueDate: "2026-04-17", settlementDate: "", status: "Pending" as const },
  { billId: "BILL-2026-0008", billType: "Hotel Booking" as const, bookingId: "ELS-2026-00212", hotelName: "Four Seasons Bali at Sayan", amount: 2900, createdDate: "2026-04-05", dueDate: "2026-04-19", settlementDate: "", status: "Overdue" as const },
  { billId: "BILL-2026-0009", billType: "Cancellation Fee" as const, bookingId: "ELS-2026-00231", hotelName: "Park Hyatt Busan", amount: 130, createdDate: "2026-04-11", dueDate: "2026-04-25", settlementDate: "", status: "Pending" as const },
  { billId: "BILL-2026-0010", billType: "Hotel Booking" as const, bookingId: "ELS-2026-00240", hotelName: "Raffles Singapore", amount: 1650, createdDate: "2026-04-12", dueDate: "2026-04-26", settlementDate: "", status: "Pending" as const },
];

/* ── Invoices (확장) ──
 * `bookingIds`: 이 인보이스에 포함된 예약 ID 목록 (aggregate per period)
 * `receivedAmount` / `paymentDate`: 실제 입금 기록 (POSTPAY 핵심)
 * `matchStatus`: Full=전액 일치, Partial=차액 존재(분쟁 의심), Unpaid=미입금
 * `disputedBookingIds`: 분쟁으로 확인된 예약 (입금에서 제외된 건)
 */
export type InvoiceMatchStatus = "Unpaid" | "Partial" | "Full" | "Reconciled";

export interface InvoiceWithMatch {
  invoiceNo: string;
  period: string;
  status: "Issued" | "Paid" | "Overdue" | "Partial";
  supplyAmount: number;
  vat: number;
  total: number;
  /* 계약 통화 — 고객사와 계약 시 고정. 환율 손익 계산 안 함. */
  contractCurrency: "USD" | "KRW" | "JPY" | "CNY" | "VND" | "SGD";
  issuedDate: string;
  dueDate: string;
  /* Settlement Detail */
  bookingIds: string[];
  receivedAmount: number;
  paymentDate: string;
  matchStatus: InvoiceMatchStatus;
  disputedBookingIds: string[];
  disputedAmount: number;
  remarks?: string;
  /* Carry-over from previous cycle */
  carriedOverBookingIds?: string[];
  carriedOverFrom?: string;
  carriedOverAmount?: number;
  /* Billing type tag — POSTPAY = 월 집계, PREPAY = 예약당 1건 */
  billingType: "POSTPAY" | "PREPAY";
  customerCompanyId?: string;
}

/* Invoices:
 *  POSTPAY = 정산 주기별 집계 인보이스 (1건에 여러 예약)
 *  PREPAY  = 예약당 1건 (선불이라 예약 확정 전 결제)
 */
export const invoices: InvoiceWithMatch[] = [
  /* ── POSTPAY: TravelCo International (comp-001, USD) ── */
  {
    invoiceNo: "INV-2026-0089", period: "Mar 2026", status: "Partial",
    supplyAmount: 3800, vat: 380, total: 4180, contractCurrency: "USD",
    issuedDate: "2026-04-01", dueDate: "2026-04-30",
    bookingIds: ["bk-001", "bk-002", "bk-003", "bk-007", "bk-008"],
    receivedAmount: 2820,
    paymentDate: "2026-04-15",
    matchStatus: "Partial",
    disputedBookingIds: ["bk-002", "bk-003"],
    disputedAmount: 1360,
    remarks: "Customer remittance missing 2 items — auto-detected and tagged as dispute",
    billingType: "POSTPAY", customerCompanyId: "comp-001",
  },
  {
    invoiceNo: "INV-2026-0067", period: "Feb 2026", status: "Paid",
    supplyAmount: 3500, vat: 350, total: 3850, contractCurrency: "USD",
    issuedDate: "2026-03-01", dueDate: "2026-03-31",
    bookingIds: ["bk-004"],
    receivedAmount: 3850, paymentDate: "2026-03-20",
    matchStatus: "Full", disputedBookingIds: [], disputedAmount: 0,
    billingType: "POSTPAY", customerCompanyId: "comp-001",
  },
  {
    invoiceNo: "INV-2026-0130", period: "Apr 2026", status: "Issued",
    supplyAmount: 9664, vat: 966, total: 10630, contractCurrency: "USD",
    issuedDate: "2026-05-01", dueDate: "2026-05-31",
    bookingIds: ["bk-009", "bk-010", "bk-011", "bk-012", "bk-013", "bk-014", "bk-015"],
    receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    carriedOverBookingIds: [], carriedOverFrom: "INV-2026-0089", carriedOverAmount: 0,
    billingType: "POSTPAY", customerCompanyId: "comp-001",
  },

  /* ── POSTPAY: Sakura Travel Japan (comp-003, JPY 계약) ── */
  {
    invoiceNo: "INV-2026-JP-0012", period: "Mar 2026", status: "Paid",
    supplyAmount: 495000, vat: 0, total: 495000, contractCurrency: "JPY",
    issuedDate: "2026-04-03", dueDate: "2026-05-03",
    bookingIds: ["bk-005"],
    receivedAmount: 495000, paymentDate: "2026-04-25",
    matchStatus: "Full", disputedBookingIds: [], disputedAmount: 0,
    billingType: "POSTPAY", customerCompanyId: "comp-003",
  },

  /* ── POSTPAY: Dragon Holidays Shanghai (comp-004, CNY 계약) ── */
  {
    invoiceNo: "INV-2026-CN-0008", period: "Mar 2026 H2", status: "Paid",
    supplyAmount: 56550, vat: 0, total: 56550, contractCurrency: "CNY",
    issuedDate: "2026-04-05", dueDate: "2026-04-19",
    bookingIds: ["bk-007"],
    receivedAmount: 56550, paymentDate: "2026-04-18",
    matchStatus: "Full", disputedBookingIds: [], disputedAmount: 0,
    billingType: "POSTPAY", customerCompanyId: "comp-004",
  },

  /* ── PREPAY: Asia Tours Ltd (comp-002) — 예약당 1건 ── */
  {
    invoiceNo: "INV-2026-PRE-0201", period: "bk-014 Raffles Singapore", status: "Issued",
    supplyAmount: 1650, vat: 0, total: 1650, contractCurrency: "USD",
    issuedDate: "2026-04-08", dueDate: "2026-04-25",
    bookingIds: ["bk-014"],
    receivedAmount: 825,  /* partial prepay */
    paymentDate: "2026-04-08",
    matchStatus: "Partial", disputedBookingIds: [], disputedAmount: 0,
    remarks: "PREPAY · Per-booking invoice · 50% prepaid, awaiting remainder",
    billingType: "PREPAY", customerCompanyId: "comp-002",
  },
  {
    invoiceNo: "INV-2026-PRE-0205", period: "bk-009 Park Hyatt Saigon", status: "Issued",
    supplyAmount: 920, vat: 0, total: 920, contractCurrency: "USD",
    issuedDate: "2026-04-01", dueDate: "2026-04-20",
    bookingIds: ["bk-009"],
    receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    remarks: "PREPAY · Payment deadline imminent (D-Day) — auto-reminders in progress",
    billingType: "PREPAY", customerCompanyId: "comp-002",
  },
  {
    invoiceNo: "INV-2026-PRE-0198", period: "bk-006 Lotte Hanoi", status: "Paid",
    supplyAmount: 360, vat: 0, total: 360, contractCurrency: "USD",
    issuedDate: "2026-03-26", dueDate: "2026-04-04",
    bookingIds: ["bk-006"],
    receivedAmount: 360, paymentDate: "2026-04-02",
    matchStatus: "Full", disputedBookingIds: [], disputedAmount: 0,
    billingType: "PREPAY", customerCompanyId: "comp-002",
  },

  /* ── Historical ── */
  {
    invoiceNo: "INV-2026-0045", period: "Jan 2026", status: "Paid",
    supplyAmount: 32000, vat: 3200, total: 35200, contractCurrency: "USD",
    issuedDate: "2026-02-01", dueDate: "2026-02-28",
    bookingIds: [], receivedAmount: 35200, paymentDate: "2026-02-22",
    matchStatus: "Full", disputedBookingIds: [], disputedAmount: 0,
    billingType: "POSTPAY", customerCompanyId: "comp-001",
  },
  {
    invoiceNo: "INV-2025-0076", period: "Oct 2025", status: "Overdue",
    supplyAmount: 26700, vat: 2670, total: 29400, contractCurrency: "USD",
    issuedDate: "2025-11-01", dueDate: "2025-11-30",
    bookingIds: [], receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    remarks: "60+ days overdue — assign to collections team",
    billingType: "POSTPAY", customerCompanyId: "comp-001",
  },
];

/* ── Payment Match Log (입금 매칭 이력) ──
 * 고객사 입금 시 자동 매칭 알고리즘 실행 기록.
 * OP/회계팀이 수동 VLOOKUP 대신 자동으로 차액 감지.
 */
export interface PaymentMatchLog {
  id: string;
  invoiceNo: string;
  receivedAmount: number;
  expectedAmount: number;
  variance: number;
  detectedExclusions: string[];
  matchedAt: string;
  matchedBy: string;  /* OP name who ran match */
  status: "Auto-matched" | "Manual-review" | "Resolved";
  vlookupTimeSavedMinutes: number;
  /* Master approval workflow */
  approvalStatus: "Pending Master" | "Approved" | "Rejected";
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  opNote?: string;  /* OP's note when submitting for approval */
}

export const paymentMatchLog: PaymentMatchLog[] = [
  {
    id: "pml-001", invoiceNo: "INV-2026-0089",
    expectedAmount: 4180, receivedAmount: 2820, variance: 1360,
    detectedExclusions: ["bk-002", "bk-003"],
    matchedAt: "2026-04-15 14:22:05", matchedBy: "Sarah Kim (OP)",
    status: "Auto-matched",
    vlookupTimeSavedMinutes: 45,
    approvalStatus: "Pending Master",  /* Awaiting Master approval — demo */
    opNote: "2 disputes auto-detected. Shilla Stay room type mismatch is already under discussion in ticket TK-2026-007.",
  },
  {
    id: "pml-002", invoiceNo: "INV-2026-0067",
    expectedAmount: 3850, receivedAmount: 3850, variance: 0,
    detectedExclusions: [],
    matchedAt: "2026-03-20 10:15:30", matchedBy: "Sarah Kim (OP)",
    status: "Auto-matched",
    vlookupTimeSavedMinutes: 15,
    approvalStatus: "Approved",
    approvedBy: "James Park (Master)",
    approvedAt: "2026-03-20 11:02:18",
  },
];

/* ── Payment Deadline Reminder Log (PREPAY) ──
 * 자동 스케줄러가 결제 데드라인 D-7/3/1/Overdue 시점에 발송한 알림 이력.
 * 실제 프로덕션에서는 cron job이 매일 돌며 조건 충족 시 생성.
 */
export type ReminderType = "D-7" | "D-3" | "D-1" | "D-Day" | "Overdue";
export type ReminderChannel = "Email" | "In-app" | "SMS";
export type ReminderStatus = "Sent" | "Delivered" | "Opened" | "Failed" | "Scheduled";

export interface PaymentReminder {
  id: string;
  bookingId: string;
  ellisCode: string;
  guestName: string;
  hotelName: string;
  amount: number;
  deadline: string;
  type: ReminderType;
  channel: ReminderChannel;
  recipient: string;  /* email or phone */
  sentAt: string;
  status: ReminderStatus;
  openedAt?: string;
  note?: string;
}

/* 실제 bk-005 (Mandarin Oriental $2250, DL 2026-04-19), bk-009 (Park Hyatt Saigon $920, DL 2026-04-20),
 * bk-014 (Raffles Singapore $1650, DL 2026-04-25) 등의 PREPAY 대상에 매칭되는 발송 이력 */
export const paymentReminders: PaymentReminder[] = [
  /* bk-009 Park Hyatt Saigon — DL 2026-04-20, 현재 2026-04-20 기준 D-Day */
  { id: "rmd-001", bookingId: "bk-009", ellisCode: "K26040109301H01", guestName: "David Park", hotelName: "Park Hyatt Saigon", amount: 920, deadline: "2026-04-20 17:00", type: "D-7", channel: "Email", recipient: "david@example.com", sentAt: "2026-04-13 09:00:00", status: "Opened", openedAt: "2026-04-13 14:22:11" },
  { id: "rmd-002", bookingId: "bk-009", ellisCode: "K26040109301H01", guestName: "David Park", hotelName: "Park Hyatt Saigon", amount: 920, deadline: "2026-04-20 17:00", type: "D-3", channel: "Email", recipient: "david@example.com", sentAt: "2026-04-17 09:00:00", status: "Delivered" },
  { id: "rmd-003", bookingId: "bk-009", ellisCode: "K26040109301H01", guestName: "David Park", hotelName: "Park Hyatt Saigon", amount: 920, deadline: "2026-04-20 17:00", type: "D-1", channel: "In-app", recipient: "david@example.com", sentAt: "2026-04-19 09:00:00", status: "Delivered" },
  { id: "rmd-004", bookingId: "bk-009", ellisCode: "K26040109301H01", guestName: "David Park", hotelName: "Park Hyatt Saigon", amount: 920, deadline: "2026-04-20 17:00", type: "D-Day", channel: "Email", recipient: "david@example.com", sentAt: "2026-04-20 08:00:00", status: "Sent", note: "Final reminder — payment required by 17:00 KST" },

  /* bk-014 Raffles Singapore — DL 2026-04-25, D-5 */
  { id: "rmd-005", bookingId: "bk-014", ellisCode: "K26040816352H01", guestName: "Michael Tan", hotelName: "Raffles Singapore", amount: 1650, deadline: "2026-04-25 17:00", type: "D-7", channel: "Email", recipient: "michael@example.com", sentAt: "2026-04-18 09:00:00", status: "Opened", openedAt: "2026-04-18 10:15:03" },

  /* bk-005 Mandarin Oriental — DL 2026-04-19, 이미 1일 경과 */
  { id: "rmd-006", bookingId: "bk-005", ellisCode: "K26032510083H01", guestName: "Robert Chen", hotelName: "Mandarin Oriental Tokyo", amount: 2250, deadline: "2026-04-19 17:00", type: "D-7", channel: "Email", recipient: "robert@example.com", sentAt: "2026-04-12 09:00:00", status: "Opened", openedAt: "2026-04-12 16:48:22" },
  { id: "rmd-007", bookingId: "bk-005", ellisCode: "K26032510083H01", guestName: "Robert Chen", hotelName: "Mandarin Oriental Tokyo", amount: 2250, deadline: "2026-04-19 17:00", type: "D-3", channel: "Email", recipient: "robert@example.com", sentAt: "2026-04-16 09:00:00", status: "Delivered" },
  { id: "rmd-008", bookingId: "bk-005", ellisCode: "K26032510083H01", guestName: "Robert Chen", hotelName: "Mandarin Oriental Tokyo", amount: 2250, deadline: "2026-04-19 17:00", type: "D-1", channel: "Email", recipient: "robert@example.com", sentAt: "2026-04-18 09:00:00", status: "Delivered" },
  { id: "rmd-009", bookingId: "bk-005", ellisCode: "K26032510083H01", guestName: "Robert Chen", hotelName: "Mandarin Oriental Tokyo", amount: 2250, deadline: "2026-04-19 17:00", type: "D-Day", channel: "SMS", recipient: "+86-138-1234-5678", sentAt: "2026-04-19 08:00:00", status: "Delivered" },
  { id: "rmd-010", bookingId: "bk-005", ellisCode: "K26032510083H01", guestName: "Robert Chen", hotelName: "Mandarin Oriental Tokyo", amount: 2250, deadline: "2026-04-19 17:00", type: "Overdue", channel: "Email", recipient: "robert@example.com", sentAt: "2026-04-20 09:00:00", status: "Sent", note: "Payment overdue. Booking will be auto-cancelled in 48 hours." },
];

export const reminderSummary = {
  totalSentThisMonth: 47,
  openRate: 72.3,
  paymentAfterReminderRate: 84.5,
  autoCancelled: 2,
  scheduledToday: 6,
};

/* ── Dispute Summary KPI ── */
export const disputeSummary = {
  openCount: 2,
  openAmount: 1360,
  resolvedThisMonth: 3,
  avgResolutionDays: 5.2,
  vlookupTimeSavedThisMonth: 180,  /* minutes (3 hours) */
  autoMatchAccuracy: 98.5,  /* % */
};

/* ── Accounts Receivable (확장) ── */
export const accountsReceivable = [
  { id: "ar-001", ellisCode: "ELS-2026-00155", hotelName: "Shilla Stay Mapo", amount: 580, cancelDeadline: "2026-04-13", paymentStatus: "Not Paid" as const, agingDays: 5 },
  { id: "ar-002", ellisCode: "ELS-2026-00168", hotelName: "Mandarin Oriental Tokyo", amount: 2250, cancelDeadline: "2026-04-19", paymentStatus: "Not Paid" as const, agingDays: 0 },
  { id: "ar-003", ellisCode: "ELS-2026-00175", hotelName: "Lotte Hotel Hanoi", amount: 360, cancelDeadline: "2026-04-04", paymentStatus: "Not Paid" as const, agingDays: 15 },
  { id: "ar-004", ellisCode: "ELS-2026-00240", hotelName: "Raffles Singapore", amount: 1650, cancelDeadline: "2026-04-25", paymentStatus: "Not Paid" as const, agingDays: 0 },
  { id: "ar-005", ellisCode: "ELS-2026-00205", hotelName: "Park Hyatt Saigon", amount: 920, cancelDeadline: "2026-04-20", paymentStatus: "Partially Paid" as const, agingDays: 35 },
  { id: "ar-006", ellisCode: "ELS-2026-00225", hotelName: "InterContinental Da Nang", amount: 870, cancelDeadline: "2026-04-08", paymentStatus: "Not Paid" as const, agingDays: 62 },
];

export const pointsHistory = [
  { date: "2026-03-20", type: "Earned" as const, description: "Booking ELS-2026-00142 confirmed", amount: 840, balance: 24500 },
  { date: "2026-03-18", type: "Used" as const, description: "Redeemed Airport Lounge Pass", amount: -3000, balance: 23660 },
  { date: "2026-03-15", type: "Earned" as const, description: "Booking ELS-2026-00128 confirmed", amount: 780, balance: 26660 },
  { date: "2026-03-10", type: "Transfer" as const, description: "Transfer to Sarah Kim", amount: -500, balance: 25880 },
  { date: "2026-03-05", type: "Earned" as const, description: "Monthly bonus", amount: 1000, balance: 26380 },
];

export const purchaseByHotel = [
  { hotelName: "Grand Hyatt Seoul", totalAmount: 9520, bookingCount: 28, avgTransaction: 340, share: 19.5 },
  { hotelName: "Mandarin Oriental Tokyo", totalAmount: 8100, bookingCount: 15, avgTransaction: 540, share: 16.6 },
  { hotelName: "Hotel Nikko Bangkok", totalAmount: 5280, bookingCount: 22, avgTransaction: 240, share: 10.8 },
  { hotelName: "Shilla Stay Mapo", totalAmount: 4900, bookingCount: 35, avgTransaction: 140, share: 10.1 },
  { hotelName: "ANA Crowne Plaza Osaka", totalAmount: 3240, bookingCount: 18, avgTransaction: 180, share: 6.6 },
];
