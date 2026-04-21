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

/* ── Billing Details ──
 * Each booking generates one or more billing line items (Hotel Booking / Cancellation Fee / Adjustment).
 * Tied to (a) bookingId via ELLIS code, and (b) invoiceNo so customer can drill from bill → invoice.
 * customerCompanyId scopes per logged-in customer (cross-tenant isolation).
 */
export interface BillingLineItem {
  billId: string;
  billType: "Hotel Booking" | "Cancellation Fee" | "Adjustment";
  bookingId: string;          /* ELLIS code (matches bookings.ellisCode) */
  hotelName: string;
  amount: number;
  currency: string;
  createdDate: string;
  dueDate: string;
  settlementDate: string;
  status: "Settled" | "Pending" | "Overdue";
  invoiceNo: string;          /* Which aggregate invoice this bill belongs to */
  customerCompanyId: string;  /* For tenant scoping */
  contractId?: string;        /* Multi-entity routing */
}

export const billingDetails: BillingLineItem[] = [
  /* ── POSTPAY TravelCo (comp-001) — INV-2026-0089 (Mar) ── */
  { billId: "BILL-2026-0001", billType: "Hotel Booking", bookingId: "K26032014532H01", hotelName: "Grand Hyatt Seoul", amount: 840, currency: "USD", createdDate: "2026-03-20", dueDate: "2026-04-30", settlementDate: "2026-04-15", status: "Settled", invoiceNo: "INV-2026-0089", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },
  { billId: "BILL-2026-0002", billType: "Hotel Booking", bookingId: "K26032209155H01", hotelName: "Shilla Stay Mapo", amount: 580, currency: "USD", createdDate: "2026-03-22", dueDate: "2026-04-30", settlementDate: "", status: "Pending", invoiceNo: "INV-2026-0089", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },
  { billId: "BILL-2026-0003", billType: "Hotel Booking", bookingId: "K26031511457H01", hotelName: "Hotel Nikko Bangkok", amount: 780, currency: "USD", createdDate: "2026-03-15", dueDate: "2026-04-30", settlementDate: "", status: "Pending", invoiceNo: "INV-2026-0089", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },
  { billId: "BILL-2026-0004", billType: "Hotel Booking", bookingId: "K26032813402H01", hotelName: "The Peninsula Shanghai", amount: 1140, currency: "USD", createdDate: "2026-03-28", dueDate: "2026-04-30", settlementDate: "2026-04-15", status: "Settled", invoiceNo: "INV-2026-0089", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },
  { billId: "BILL-2026-0005", billType: "Hotel Booking", bookingId: "K26033017227H01", hotelName: "Marina Bay Sands", amount: 840, currency: "USD", createdDate: "2026-03-30", dueDate: "2026-04-30", settlementDate: "2026-04-15", status: "Settled", invoiceNo: "INV-2026-0089", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },
  /* INV-2026-0067 (Feb 2026, paid) */
  { billId: "BILL-2026-0006", billType: "Hotel Booking", bookingId: "K26031016208H01", hotelName: "ANA Crowne Plaza Osaka", amount: 330, currency: "USD", createdDate: "2026-03-10", dueDate: "2026-03-31", settlementDate: "2026-03-20", status: "Settled", invoiceNo: "INV-2026-0067", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },
  { billId: "BILL-2026-0007", billType: "Cancellation Fee", bookingId: "K26031016208H01", hotelName: "ANA Crowne Plaza Osaka", amount: 65, currency: "USD", createdDate: "2026-03-18", dueDate: "2026-03-31", settlementDate: "2026-03-20", status: "Settled", invoiceNo: "INV-2026-0067", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },
  /* INV-2026-0130 (Apr in progress) */
  { billId: "BILL-2026-0008", billType: "Hotel Booking", bookingId: "K26040215182H01", hotelName: "Four Seasons Bali at Sayan", amount: 2900, currency: "USD", createdDate: "2026-04-02", dueDate: "2026-05-31", settlementDate: "", status: "Pending", invoiceNo: "INV-2026-0130", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },
  { billId: "BILL-2026-0009", billType: "Cancellation Fee", bookingId: "K26040514508H01", hotelName: "InterContinental Da Nang", amount: 130, currency: "USD", createdDate: "2026-04-09", dueDate: "2026-05-31", settlementDate: "", status: "Pending", invoiceNo: "INV-2026-0130", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },
  { billId: "BILL-2026-0010", billType: "Adjustment", bookingId: "K26032014532H01", hotelName: "Grand Hyatt Seoul", amount: -45, currency: "USD", createdDate: "2026-04-12", dueDate: "2026-04-30", settlementDate: "2026-04-15", status: "Settled", invoiceNo: "INV-2026-0089", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },

  /* ── PREPAY Asia Tours (comp-002) — Per-booking invoices ── */
  { billId: "BILL-2026-0101", billType: "Hotel Booking", bookingId: "K26040816352H01", hotelName: "Raffles Singapore", amount: 1650, currency: "USD", createdDate: "2026-04-08", dueDate: "2026-04-25", settlementDate: "", status: "Pending", invoiceNo: "INV-2026-PRE-0201", customerCompanyId: "comp-002", contractId: "ctr-002-sg" },
  { billId: "BILL-2026-0102", billType: "Hotel Booking", bookingId: "K26040109301H01", hotelName: "Park Hyatt Saigon", amount: 920, currency: "USD", createdDate: "2026-04-01", dueDate: "2026-04-20", settlementDate: "", status: "Pending", invoiceNo: "INV-2026-PRE-0205", customerCompanyId: "comp-002", contractId: "ctr-002-sg" },
  { billId: "BILL-2026-0103", billType: "Hotel Booking", bookingId: "K26032608558H01", hotelName: "Lotte Hotel Hanoi", amount: 360, currency: "USD", createdDate: "2026-03-26", dueDate: "2026-04-04", settlementDate: "2026-04-02", status: "Settled", invoiceNo: "INV-2026-PRE-0198", customerCompanyId: "comp-002", contractId: "ctr-002-sg" },

  /* ── GOTADI (comp-010) ── */
  /* SG contract bills (USD) — international hotels */
  { billId: "BILL-SG-0010-001", billType: "Hotel Booking", bookingId: "K26032014532H01", hotelName: "Grand Hyatt Seoul", amount: 2400, currency: "USD", createdDate: "2026-03-22", dueDate: "2026-04-30", settlementDate: "2026-04-12", status: "Settled", invoiceNo: "INV-SG-2026-1101", customerCompanyId: "comp-010", contractId: "ctr-010-sg" },
  { billId: "BILL-SG-0010-002", billType: "Hotel Booking", bookingId: "K26031016208H01", hotelName: "ANA Crowne Plaza Osaka", amount: 3000, currency: "USD", createdDate: "2026-03-12", dueDate: "2026-04-30", settlementDate: "2026-04-12", status: "Settled", invoiceNo: "INV-SG-2026-1101", customerCompanyId: "comp-010", contractId: "ctr-010-sg" },
  { billId: "BILL-SG-0010-003", billType: "Hotel Booking", bookingId: "K26033017227H01", hotelName: "Marina Bay Sands", amount: 4200, currency: "USD", createdDate: "2026-04-04", dueDate: "2026-05-31", settlementDate: "", status: "Pending", invoiceNo: "INV-SG-2026-1130", customerCompanyId: "comp-010", contractId: "ctr-010-sg" },
  { billId: "BILL-SG-0010-004", billType: "Hotel Booking", bookingId: "K26032813402H01", hotelName: "The Peninsula Shanghai", amount: 4000, currency: "USD", createdDate: "2026-04-08", dueDate: "2026-05-31", settlementDate: "", status: "Pending", invoiceNo: "INV-SG-2026-1130", customerCompanyId: "comp-010", contractId: "ctr-010-sg" },
  /* VN contract bills (VND) — Vietnam-local hotels */
  { billId: "BILL-VN-0010-001", billType: "Hotel Booking", bookingId: "K26040109301H01", hotelName: "Park Hyatt Saigon", amount: 168000000, currency: "VND", createdDate: "2026-03-25", dueDate: "2026-04-30", settlementDate: "2026-04-15", status: "Settled", invoiceNo: "INV-VN-2026-0420", customerCompanyId: "comp-010", contractId: "ctr-010-vn" },
  { billId: "BILL-VN-0010-002", billType: "Hotel Booking", bookingId: "K26032608558H01", hotelName: "Lotte Hotel Hanoi", amount: 240000000, currency: "VND", createdDate: "2026-03-28", dueDate: "2026-04-30", settlementDate: "2026-04-15", status: "Settled", invoiceNo: "INV-VN-2026-0420", customerCompanyId: "comp-010", contractId: "ctr-010-vn" },
  { billId: "BILL-VN-0010-003", billType: "Hotel Booking", bookingId: "K26040514508H01", hotelName: "InterContinental Da Nang", amount: 305000000, currency: "VND", createdDate: "2026-04-10", dueDate: "2026-05-31", settlementDate: "", status: "Pending", invoiceNo: "INV-VN-2026-0430", customerCompanyId: "comp-010", contractId: "ctr-010-vn" },
  { billId: "BILL-VN-0010-004", billType: "Hotel Booking", bookingId: "K26040109301H01", hotelName: "Park Hyatt Saigon", amount: 220000000, currency: "VND", createdDate: "2026-04-15", dueDate: "2026-05-31", settlementDate: "", status: "Pending", invoiceNo: "INV-VN-2026-0430", customerCompanyId: "comp-010", contractId: "ctr-010-vn" },

  /* ── Vietnam Vacation Co (comp-011) — PREPAY ── */
  /* SG contract per-booking */
  { billId: "BILL-SG-0011-001", billType: "Hotel Booking", bookingId: "K26031511457H01", hotelName: "Hotel Nikko Bangkok", amount: 1200, currency: "USD", createdDate: "2026-04-10", dueDate: "2026-04-20", settlementDate: "2026-04-12", status: "Settled", invoiceNo: "INV-SG-PRE-2026-3041", customerCompanyId: "comp-011", contractId: "ctr-011-sg" },
  { billId: "BILL-SG-0011-002", billType: "Hotel Booking", bookingId: "K26032510083H01", hotelName: "Mandarin Oriental Tokyo", amount: 2400, currency: "USD", createdDate: "2026-04-18", dueDate: "2026-04-28", settlementDate: "", status: "Pending", invoiceNo: "INV-SG-PRE-2026-3055", customerCompanyId: "comp-011", contractId: "ctr-011-sg" },
  /* VN contract per-booking */
  { billId: "BILL-VN-0011-001", billType: "Hotel Booking", bookingId: "K26040109301H01", hotelName: "Park Hyatt Saigon", amount: 33000000, currency: "VND", createdDate: "2026-04-15", dueDate: "2026-04-25", settlementDate: "", status: "Pending", invoiceNo: "INV-VN-PRE-2026-0512", customerCompanyId: "comp-011", contractId: "ctr-011-vn" },
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
  /* Billing type tag — POSTPAY = monthly aggregate, PREPAY = 1 per booking */
  billingType: "POSTPAY" | "PREPAY";
  customerCompanyId?: string;
  /* Multi-entity: which OhMyHotel entity issued this invoice (via contract) */
  contractId?: string;
  ohmyhotelEntityId?: string;  /* derived from contract for UI convenience */
  /* ── Audit metadata (DIDA-style) ── */
  firstInsertUser: string;      /* BATCH_USER = scheduler / API_USER = API call / human name */
  firstInsertTime: string;
  lastUpdateUser: string;
  lastUpdateTime: string;
  /* ── Summary totals (per-invoice aggregate) ── */
  paidAmount?: number;          /* alias for receivedAmount shown as Paid Amt */
  balance?: number;             /* total - paidAmount */
  revenue?: number;             /* our margin on this invoice */
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
    billingType: "POSTPAY", customerCompanyId: "comp-001", contractId: "ctr-001-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-04-01 01:00:40",
    lastUpdateUser: "Sarah Kim", lastUpdateTime: "2026-04-15 14:43:43",
    paidAmount: 2820, balance: 1360, revenue: 209,
  },
  {
    invoiceNo: "INV-2026-0067", period: "Feb 2026", status: "Paid",
    supplyAmount: 3500, vat: 350, total: 3850, contractCurrency: "USD",
    issuedDate: "2026-03-01", dueDate: "2026-03-31",
    bookingIds: ["bk-004"],
    receivedAmount: 3850, paymentDate: "2026-03-20",
    matchStatus: "Full", disputedBookingIds: [], disputedAmount: 0,
    billingType: "POSTPAY", customerCompanyId: "comp-001", contractId: "ctr-001-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-03-01 01:00:40",
    lastUpdateUser: "API_USER", lastUpdateTime: "2026-03-20 10:15:30",
    paidAmount: 3850, balance: 0, revenue: 192,
  },
  {
    invoiceNo: "INV-2026-0130", period: "Apr 2026", status: "Issued",
    supplyAmount: 9664, vat: 966, total: 10630, contractCurrency: "USD",
    issuedDate: "2026-05-01", dueDate: "2026-05-31",
    bookingIds: ["bk-009", "bk-010", "bk-011", "bk-012", "bk-013", "bk-014", "bk-015"],
    receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    billingType: "POSTPAY", customerCompanyId: "comp-001", contractId: "ctr-001-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-05-01 01:00:41",
    lastUpdateUser: "BATCH_USER", lastUpdateTime: "2026-05-01 02:02:03",
    paidAmount: 0, balance: 10630, revenue: 531,
  },

  /* ── POSTPAY: Sakura Travel Japan (comp-003, JPY 계약) ── */
  {
    invoiceNo: "INV-2026-JP-0012", period: "Mar 2026", status: "Paid",
    supplyAmount: 495000, vat: 0, total: 495000, contractCurrency: "JPY",
    issuedDate: "2026-04-03", dueDate: "2026-05-03",
    bookingIds: ["bk-005"],
    receivedAmount: 495000, paymentDate: "2026-04-25",
    matchStatus: "Full", disputedBookingIds: [], disputedAmount: 0,
    billingType: "POSTPAY", customerCompanyId: "comp-003", contractId: "ctr-003-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-04-03 01:00:40",
    lastUpdateUser: "Tran Thuy Tien", lastUpdateTime: "2026-04-25 10:43:43",
    paidAmount: 495000, balance: 0, revenue: 24750,
  },

  /* ── POSTPAY: Dragon Holidays Shanghai (comp-004, CNY contract) ── */
  {
    invoiceNo: "INV-2026-CN-0008", period: "Mar 2026 H2", status: "Paid",
    supplyAmount: 56550, vat: 0, total: 56550, contractCurrency: "CNY",
    issuedDate: "2026-04-05", dueDate: "2026-04-19",
    bookingIds: ["bk-007"],
    receivedAmount: 56550, paymentDate: "2026-04-18",
    matchStatus: "Full", disputedBookingIds: [], disputedAmount: 0,
    billingType: "POSTPAY", customerCompanyId: "comp-004", contractId: "ctr-004-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "API_USER", firstInsertTime: "2026-04-05 09:20:00",
    lastUpdateUser: "API_USER", lastUpdateTime: "2026-04-18 16:20:18",
    paidAmount: 56550, balance: 0, revenue: 2828,
  },

  /* ── PREPAY: Asia Tours Ltd (comp-002) — 1 invoice per booking ── */
  {
    invoiceNo: "INV-2026-PRE-0201", period: "Apr 2026", status: "Issued",
    supplyAmount: 1650, vat: 0, total: 1650, contractCurrency: "USD",
    issuedDate: "2026-04-08", dueDate: "2026-04-25",
    bookingIds: ["bk-014"],
    receivedAmount: 825,
    paymentDate: "2026-04-08",
    matchStatus: "Partial", disputedBookingIds: [], disputedAmount: 0,
    remarks: "PREPAY · Per-booking invoice · 50% prepaid, awaiting remainder",
    billingType: "PREPAY", customerCompanyId: "comp-002", contractId: "ctr-002-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "API_USER", firstInsertTime: "2026-04-08 14:30:02",
    lastUpdateUser: "Kevin Lee", lastUpdateTime: "2026-04-15 09:12:33",
    paidAmount: 825, balance: 825, revenue: 82,
  },
  {
    invoiceNo: "INV-2026-PRE-0205", period: "Apr 2026", status: "Issued",
    supplyAmount: 920, vat: 0, total: 920, contractCurrency: "USD",
    issuedDate: "2026-04-01", dueDate: "2026-04-20",
    bookingIds: ["bk-009"],
    receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    remarks: "PREPAY · Payment deadline imminent (D-Day) — auto-reminders in progress",
    billingType: "PREPAY", customerCompanyId: "comp-002", contractId: "ctr-002-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "API_USER", firstInsertTime: "2026-04-01 09:30:41",
    lastUpdateUser: "BATCH_USER", lastUpdateTime: "2026-04-20 08:00:00",
    paidAmount: 0, balance: 920, revenue: 46,
  },
  {
    invoiceNo: "INV-2026-PRE-0198", period: "Mar 2026", status: "Paid",
    supplyAmount: 360, vat: 0, total: 360, contractCurrency: "USD",
    issuedDate: "2026-03-26", dueDate: "2026-04-04",
    bookingIds: ["bk-006"],
    receivedAmount: 360, paymentDate: "2026-04-02",
    matchStatus: "Full", disputedBookingIds: [], disputedAmount: 0,
    billingType: "PREPAY", customerCompanyId: "comp-002", contractId: "ctr-002-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "API_USER", firstInsertTime: "2026-03-26 08:55:19",
    lastUpdateUser: "API_USER", lastUpdateTime: "2026-04-02 11:20:10",
    paidAmount: 360, balance: 0, revenue: 18,
  },

  /* ── Historical ── */
  {
    invoiceNo: "INV-2026-0045", period: "Jan 2026", status: "Paid",
    supplyAmount: 32000, vat: 3200, total: 35200, contractCurrency: "USD",
    issuedDate: "2026-02-01", dueDate: "2026-02-28",
    bookingIds: [], receivedAmount: 35200, paymentDate: "2026-02-22",
    matchStatus: "Full", disputedBookingIds: [], disputedAmount: 0,
    billingType: "POSTPAY", customerCompanyId: "comp-001", contractId: "ctr-001-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-02-01 01:00:40",
    lastUpdateUser: "James Park", lastUpdateTime: "2026-02-22 15:30:00",
    paidAmount: 35200, balance: 0, revenue: 1760,
  },
  {
    invoiceNo: "INV-2025-0076", period: "Oct 2025", status: "Overdue",
    supplyAmount: 26700, vat: 2670, total: 29400, contractCurrency: "USD",
    issuedDate: "2025-11-01", dueDate: "2025-11-30",
    bookingIds: [], receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    remarks: "60+ days overdue — assign to collections team",
    billingType: "POSTPAY", customerCompanyId: "comp-001", contractId: "ctr-001-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2025-11-01 01:00:40",
    lastUpdateUser: "Sarah Kim", lastUpdateTime: "2026-04-10 14:22:05",
    paidAmount: 0, balance: 29400, revenue: 1470,
  },

  /* ── GOTADI (comp-010) — POSTPAY multi-entity ── */
  /* SG contract — international hotels (USD) */
  {
    invoiceNo: "INV-SG-2026-1101", period: "Mar 2026", status: "Paid",
    supplyAmount: 5400, vat: 0, total: 5400, contractCurrency: "USD",
    issuedDate: "2026-04-01", dueDate: "2026-04-30",
    bookingIds: [], receivedAmount: 5400, paymentDate: "2026-04-12",
    matchStatus: "Full", disputedBookingIds: [], disputedAmount: 0,
    remarks: "International hotels (KR, JP) settled via OhMyHotel SG",
    billingType: "POSTPAY", customerCompanyId: "comp-010",
    contractId: "ctr-010-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-04-01 01:00:40",
    lastUpdateUser: "API_USER", lastUpdateTime: "2026-04-12 09:18:23",
    paidAmount: 5400, balance: 0, revenue: 270,
  },
  {
    invoiceNo: "INV-SG-2026-1130", period: "Apr 2026", status: "Issued",
    supplyAmount: 8200, vat: 0, total: 8200, contractCurrency: "USD",
    issuedDate: "2026-05-01", dueDate: "2026-05-31",
    bookingIds: [], receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    billingType: "POSTPAY", customerCompanyId: "comp-010",
    contractId: "ctr-010-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-05-01 01:00:40",
    lastUpdateUser: "BATCH_USER", lastUpdateTime: "2026-05-01 02:01:11",
    paidAmount: 0, balance: 8200, revenue: 410,
  },
  /* VN contract — Vietnam-local hotels (VND, domestic VAT 10%) */
  {
    invoiceNo: "INV-VN-2026-0420", period: "Mar 2026", status: "Paid",
    supplyAmount: 408000000, vat: 40800000, total: 448800000, contractCurrency: "VND",
    issuedDate: "2026-04-01", dueDate: "2026-04-30",
    bookingIds: [], receivedAmount: 448800000, paymentDate: "2026-04-15",
    matchStatus: "Full", disputedBookingIds: [], disputedAmount: 0,
    remarks: "Vietnam hotels — domestic VAT 10% included · OhMyHotel VN",
    billingType: "POSTPAY", customerCompanyId: "comp-010",
    contractId: "ctr-010-vn", ohmyhotelEntityId: "omh-vn",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-04-01 01:00:40",
    lastUpdateUser: "Tran Thuy Tien", lastUpdateTime: "2026-04-15 10:43:43",
    paidAmount: 448800000, balance: 0, revenue: 22440000,
  },
  {
    invoiceNo: "INV-VN-2026-0430", period: "Apr 2026", status: "Issued",
    supplyAmount: 525000000, vat: 52500000, total: 577500000, contractCurrency: "VND",
    issuedDate: "2026-05-01", dueDate: "2026-05-31",
    bookingIds: [], receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    remarks: "Vietnam hotels — domestic VAT 10% included · OhMyHotel VN",
    billingType: "POSTPAY", customerCompanyId: "comp-010",
    contractId: "ctr-010-vn", ohmyhotelEntityId: "omh-vn",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-05-01 01:00:40",
    lastUpdateUser: "BATCH_USER", lastUpdateTime: "2026-05-01 02:01:11",
    paidAmount: 0, balance: 577500000, revenue: 28875000,
  },

  /* ── Vietnam Vacation Co (comp-011) — PREPAY multi-entity ── */
  /* SG contract — per-booking (international hotels) */
  {
    invoiceNo: "INV-SG-PRE-2026-3041", period: "Apr 2026", status: "Paid",
    supplyAmount: 1200, vat: 0, total: 1200, contractCurrency: "USD",
    issuedDate: "2026-04-10", dueDate: "2026-04-20",
    bookingIds: [], receivedAmount: 1200, paymentDate: "2026-04-12",
    matchStatus: "Full", disputedBookingIds: [], disputedAmount: 0,
    remarks: "PREPAY · Per-booking · International (Bangkok hotel)",
    billingType: "PREPAY", customerCompanyId: "comp-011",
    contractId: "ctr-011-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "API_USER", firstInsertTime: "2026-04-10 14:22:18",
    lastUpdateUser: "API_USER", lastUpdateTime: "2026-04-12 11:08:00",
    paidAmount: 1200, balance: 0, revenue: 60,
  },
  {
    invoiceNo: "INV-SG-PRE-2026-3055", period: "Apr 2026", status: "Issued",
    supplyAmount: 2400, vat: 0, total: 2400, contractCurrency: "USD",
    issuedDate: "2026-04-18", dueDate: "2026-04-28",
    bookingIds: [], receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    remarks: "PREPAY · Per-booking · International (Tokyo hotel) · payment due in 8 days",
    billingType: "PREPAY", customerCompanyId: "comp-011",
    contractId: "ctr-011-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "API_USER", firstInsertTime: "2026-04-18 09:35:42",
    lastUpdateUser: "API_USER", lastUpdateTime: "2026-04-18 09:35:42",
    paidAmount: 0, balance: 2400, revenue: 120,
  },
  /* VN contract — per-booking (Vietnam local hotels) */
  {
    invoiceNo: "INV-VN-PRE-2026-0512", period: "Apr 2026", status: "Issued",
    supplyAmount: 30000000, vat: 3000000, total: 33000000, contractCurrency: "VND",
    issuedDate: "2026-04-15", dueDate: "2026-04-25",
    bookingIds: [], receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    remarks: "PREPAY · Vietnam-local hotel · VAT 10% included · OhMyHotel VN",
    billingType: "PREPAY", customerCompanyId: "comp-011",
    contractId: "ctr-011-vn", ohmyhotelEntityId: "omh-vn",
    firstInsertUser: "API_USER", firstInsertTime: "2026-04-15 11:20:00",
    lastUpdateUser: "API_USER", lastUpdateTime: "2026-04-15 11:20:00",
    paidAmount: 0, balance: 33000000, revenue: 1500000,
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
 * Auto-scheduler sends reminders at D-7 / D-3 / D-1 / D-Day (KST).
 * After D-Day, the booking is auto-cancelled — no overdue state.
 * 실제 프로덕션에서는 cron job이 매일 돌며 조건 충족 시 생성.
 */
export type ReminderType = "D-7" | "D-3" | "D-1" | "D-Day";
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
