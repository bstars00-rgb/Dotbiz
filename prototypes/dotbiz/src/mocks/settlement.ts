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
  /* ── Adjustment 추적 필드 (2026-04-30 결정 #3) ──
   * Adjustment는 ELLIS만 발행. 출처(분쟁 인정/내부 검토)와 사유를 명시.
   * 고객사는 자유 수정 불가 — 이의제기만 가능. */
  adjustmentSource?: "DisputeAccepted" | "EllisInternal" | "HotelClaim" | "ContractAmendment";
  sourceDisputeId?: string;   /* DisputeAccepted 출처일 때 disp-XXX 매칭 */
  reasonNote?: string;        /* "Grand Hyatt Seoul $40 차액 환원 (분쟁 인정)" 등 */
  issuedBy?: string;          /* ELLIS 담당자 email */
  /* ── FX rate lock (2026-04-30 결정 #5) ──
   * 환율은 ELLIS에 예약이 들어오는 시점에 lock-in. 정산이 한 달 후여도 booking 시점 환율 적용.
   * USD 환산이 아닌 통화일 때 의미 있음. lockedFxRate × amount = USD 환산 금액. */
  lockedFxRate?: number;      /* 1 unit of `currency` = N USD (예: KRW일 경우 0.000727) */
  fxLockedAt?: string;        /* 예약 발생 시점 (booking createdAt) */
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
  { billId: "BILL-2026-0010", billType: "Adjustment", bookingId: "K26032014532H01", hotelName: "Grand Hyatt Seoul", amount: -45, currency: "USD", createdDate: "2026-04-12", dueDate: "2026-04-30", settlementDate: "2026-04-15", status: "Settled", invoiceNo: "INV-2026-0089", customerCompanyId: "comp-001", contractId: "ctr-001-sg", adjustmentSource: "DisputeAccepted", sourceDisputeId: "disp-002", reasonNote: "ANA Osaka cancellation fee 조정 누락 인정 — 차액 환원", issuedBy: "david.park@ohmyhotel.com" },

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

  /* ── Extra bill lines for the additional demo invoices (aging variety) ── */
  /* TravelCo */
  { billId: "BILL-2026-0200", billType: "Hotel Booking", bookingId: "K26041511201H01", hotelName: "Fairmont Singapore", amount: 2240, currency: "USD", createdDate: "2026-04-15", dueDate: "2026-04-25", settlementDate: "", status: "Pending", invoiceNo: "INV-2026-0142", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },
  { billId: "BILL-2026-0201", billType: "Hotel Booking", bookingId: "K26041209084H01", hotelName: "Banyan Tree Seoul",  amount: 960,  currency: "USD", createdDate: "2026-04-12", dueDate: "2026-04-25", settlementDate: "", status: "Pending", invoiceNo: "INV-2026-0142", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },
  { billId: "BILL-2026-0202", billType: "Adjustment",     bookingId: "K26041209084H01", hotelName: "Banyan Tree Seoul",  amount: 2150, currency: "USD", createdDate: "2026-04-20", dueDate: "2026-04-25", settlementDate: "", status: "Pending", invoiceNo: "INV-2026-0142", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },
  { billId: "BILL-2026-0210", billType: "Hotel Booking", bookingId: "K26030514523H01", hotelName: "The Westin Chosun Seoul", amount: 1320, currency: "USD", createdDate: "2026-03-05", dueDate: "2026-04-10", settlementDate: "", status: "Pending", invoiceNo: "INV-2026-0118", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },
  { billId: "BILL-2026-0211", billType: "Hotel Booking", bookingId: "K26022814451H01", hotelName: "JW Marriott Seoul",  amount: 680,  currency: "USD", createdDate: "2026-02-28", dueDate: "2026-04-10", settlementDate: "", status: "Pending", invoiceNo: "INV-2026-0118", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },
  { billId: "BILL-2026-0212", billType: "Adjustment",     bookingId: "K26030514523H01", hotelName: "The Westin Chosun Seoul", amount: 2180, currency: "USD", createdDate: "2026-04-05", dueDate: "2026-04-10", settlementDate: "", status: "Pending", invoiceNo: "INV-2026-0118", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },
  { billId: "BILL-2026-0220", billType: "Hotel Booking", bookingId: "K26021810302H01", hotelName: "Conrad Manila Bay",  amount: 780,  currency: "USD", createdDate: "2026-02-18", dueDate: "2026-03-15", settlementDate: "2026-03-25", status: "Settled", invoiceNo: "INV-2026-0101", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },
  { billId: "BILL-2026-0221", billType: "Adjustment",     bookingId: "K26021810302H01", hotelName: "Conrad Manila Bay",  amount: 2300, currency: "USD", createdDate: "2026-03-05", dueDate: "2026-03-15", settlementDate: "", status: "Pending", invoiceNo: "INV-2026-0101", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },
  { billId: "BILL-2026-0230", billType: "Hotel Booking", bookingId: "K26042210125H01", hotelName: "W Seoul Walkerhill", amount: 990,  currency: "USD", createdDate: "2026-04-18", dueDate: "2026-04-23", settlementDate: "2026-04-21", status: "Settled", invoiceNo: "INV-2026-0156", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },
  { billId: "BILL-2026-0231", billType: "Adjustment",     bookingId: "K26042210125H01", hotelName: "W Seoul Walkerhill", amount: 1980, currency: "USD", createdDate: "2026-04-19", dueDate: "2026-04-23", settlementDate: "2026-04-21", status: "Settled", invoiceNo: "INV-2026-0156", customerCompanyId: "comp-001", contractId: "ctr-001-sg" },

  /* Asia Tours (PREPAY) */
  { billId: "BILL-2026-0310", billType: "Hotel Booking", bookingId: "K26042109553H01", hotelName: "Hyatt Regency Tokyo", amount: 1650, currency: "USD", createdDate: "2026-04-21", dueDate: "2026-04-28", settlementDate: "2026-04-21", status: "Settled", invoiceNo: "INV-2026-PRE-0210", customerCompanyId: "comp-002", contractId: "ctr-002-sg" },
  { billId: "BILL-2026-0311", billType: "Hotel Booking", bookingId: "K26040813104H01", hotelName: "Capella Hanoi",       amount: 820,  currency: "USD", createdDate: "2026-04-08", dueDate: "2026-04-18", settlementDate: "2026-04-08", status: "Settled", invoiceNo: "INV-2026-PRE-0212", customerCompanyId: "comp-002", contractId: "ctr-002-sg" },
  { billId: "BILL-2026-0312", billType: "Hotel Booking", bookingId: "K26041617051H01", hotelName: "The Ritz-Carlton Tokyo", amount: 3800, currency: "USD", createdDate: "2026-04-20", dueDate: "2026-05-10", settlementDate: "", status: "Pending", invoiceNo: "INV-2026-PRE-0215", customerCompanyId: "comp-002", contractId: "ctr-002-sg" },

  /* GOTADI SG */
  { billId: "BILL-SG-0010-020", billType: "Hotel Booking", bookingId: "K26041408382H01", hotelName: "Mandarin Oriental Hong Kong", amount: 2100, currency: "USD", createdDate: "2026-04-14", dueDate: "2026-04-23", settlementDate: "", status: "Pending", invoiceNo: "INV-SG-2026-1158", customerCompanyId: "comp-010", contractId: "ctr-010-sg" },
  { billId: "BILL-SG-0010-021", billType: "Hotel Booking", bookingId: "K26041813420H01", hotelName: "The Okura Tokyo",              amount: 2880, currency: "USD", createdDate: "2026-04-18", dueDate: "2026-04-23", settlementDate: "", status: "Pending", invoiceNo: "INV-SG-2026-1158", customerCompanyId: "comp-010", contractId: "ctr-010-sg" },
  { billId: "BILL-SG-0010-030", billType: "Hotel Booking", bookingId: "K26041008488H01", hotelName: "Novotel Shanghai Pudong",      amount: 270,  currency: "USD", createdDate: "2026-04-01", dueDate: "2026-04-06", settlementDate: "", status: "Pending", invoiceNo: "INV-SG-2026-1088", customerCompanyId: "comp-010", contractId: "ctr-010-sg" },
  { billId: "BILL-SG-0010-031", billType: "Hotel Booking", bookingId: "K26040610124H01", hotelName: "Park Hyatt Busan",             amount: 5930, currency: "USD", createdDate: "2026-04-01", dueDate: "2026-04-06", settlementDate: "", status: "Pending", invoiceNo: "INV-SG-2026-1088", customerCompanyId: "comp-010", contractId: "ctr-010-sg" },
  { billId: "BILL-SG-0010-040", billType: "Hotel Booking", bookingId: "K26040311051H01", hotelName: "Four Seasons Bali at Sayan",   amount: 3400, currency: "USD", createdDate: "2026-03-05", dueDate: "2026-03-10", settlementDate: "", status: "Pending", invoiceNo: "INV-SG-2026-1050", customerCompanyId: "comp-010", contractId: "ctr-010-sg" },

  /* GOTADI VN */
  { billId: "BILL-VN-0010-020", billType: "Hotel Booking", bookingId: "K26040509155H01", hotelName: "Sofitel Saigon Plaza",  amount: 195000000, currency: "VND", createdDate: "2026-04-05", dueDate: "2026-04-25", settlementDate: "", status: "Pending", invoiceNo: "INV-VN-2026-0455", customerCompanyId: "comp-010", contractId: "ctr-010-vn" },
  { billId: "BILL-VN-0010-021", billType: "Hotel Booking", bookingId: "K26042016224H01", hotelName: "Metropole Hanoi",       amount: 85000000,  currency: "VND", createdDate: "2026-04-20", dueDate: "2026-04-25", settlementDate: "", status: "Pending", invoiceNo: "INV-VN-2026-0455", customerCompanyId: "comp-010", contractId: "ctr-010-vn" },
  { billId: "BILL-VN-0010-030", billType: "Hotel Booking", bookingId: "K26041915201H01", hotelName: "Pan Pacific Hanoi",     amount: 115000000, currency: "VND", createdDate: "2026-04-03", dueDate: "2026-04-08", settlementDate: "2026-04-12", status: "Settled", invoiceNo: "INV-VN-2026-0445", customerCompanyId: "comp-010", contractId: "ctr-010-vn" },
  { billId: "BILL-VN-0010-031", billType: "Adjustment",     bookingId: "K26041915201H01", hotelName: "Pan Pacific Hanoi",     amount: 75000000,  currency: "VND", createdDate: "2026-04-04", dueDate: "2026-04-08", settlementDate: "", status: "Pending", invoiceNo: "INV-VN-2026-0445", customerCompanyId: "comp-010", contractId: "ctr-010-vn" },
  { billId: "BILL-VN-0010-040", billType: "Hotel Booking", bookingId: "",                 hotelName: "Historical aggregate", amount: 330000000, currency: "VND", createdDate: "2026-03-01", dueDate: "2026-03-06", settlementDate: "2026-03-05", status: "Settled", invoiceNo: "INV-VN-2026-0401", customerCompanyId: "comp-010", contractId: "ctr-010-vn" },

  /* VVC (PREPAY) */
  { billId: "BILL-SG-0011-020", billType: "Hotel Booking", bookingId: "K26041209084H01", hotelName: "Banyan Tree Seoul",           amount: 960,  currency: "USD", createdDate: "2026-04-12", dueDate: "2026-04-22", settlementDate: "2026-04-13", status: "Settled", invoiceNo: "INV-SG-PRE-2026-3062", customerCompanyId: "comp-011", contractId: "ctr-011-sg" },
  { billId: "BILL-SG-0011-021", billType: "Hotel Booking", bookingId: "K26041408382H01", hotelName: "Mandarin Oriental Hong Kong", amount: 2100, currency: "USD", createdDate: "2026-04-14", dueDate: "2026-04-28", settlementDate: "", status: "Pending", invoiceNo: "INV-SG-PRE-2026-3070", customerCompanyId: "comp-011", contractId: "ctr-011-sg" },
  { billId: "BILL-VN-0011-020", billType: "Hotel Booking", bookingId: "K26042016224H01", hotelName: "Metropole Hanoi",             amount: 165000000, currency: "VND", createdDate: "2026-04-20", dueDate: "2026-05-05", settlementDate: "", status: "Pending", invoiceNo: "INV-VN-PRE-2026-0521", customerCompanyId: "comp-011", contractId: "ctr-011-vn" },
];

/* ── Invoices (확장) ──
 * `bookingIds`: 이 인보이스에 포함된 예약 ID 목록 (aggregate per period)
 * `receivedAmount` / `paymentDate`: 실제 입금 기록 (POSTPAY 핵심)
 * `matchStatus`: Full=전액 일치, Partial=차액 존재(분쟁 의심), Unpaid=미입금
 * `disputedBookingIds`: 분쟁으로 확인된 예약 (입금에서 제외된 건)
 */
export type InvoiceMatchStatus = "Unpaid" | "Partial" | "Full" | "Reconciled";

/* ════════════════════════════════════════════════════════════════════
 * Payment Method 정책 (2026-05-08 확정)
 *
 * 정책: PG 수수료는 100% 고객 부담 (DOTBIZ 흡수 0%).
 *       Option C Hybrid (Booking-style) — 검색·리스트는 단일가, 결제 단계에서 분리.
 *
 * 권역별 결제수단 매트릭스. 수수료는 실측 데이터 (웹 리서치 2026-05-08):
 *   - 한국 가상계좌: 건당 250원 (≈ 0.025%)
 *   - 한국 PG 카드 (Toss/KCP/이니시스): 2.1~3.3%
 *   - 일본 Stripe: 3.6% domestic + 1.5% intl
 *   - 싱가포르 PayNow: 0%
 *   - 싱가포르 Stripe: 3.4% + S$0.50
 *   - 홍콩 FPS: 0%
 *   - 중국 Alipay/WeChat (B2B): 1~2% 추정
 *   - 베트남 VNPay: 1.5~2.5%
 *   - 동남아 Xendit: 3% + $0.30
 *   - SWIFT (cross-border): 0.1% + 정액 $25~50
 *   - 송금 (Bank transfer): 0%
 * ════════════════════════════════════════════════════════════════════ */
export type PaymentMethodCategory =
  | "bank_transfer"     /* 송금 (0% 수수료) */
  | "virtual_account"   /* 가상계좌 (한국 표준) */
  | "card_local"        /* Local PG 카드 */
  | "card_global"       /* Global PG 카드 (Stripe 등) */
  | "qr_payment"        /* QR 결제 (PayNow/FPS/Alipay/WeChat/VNPay) */
  | "swift_wire";       /* 국제 송금 */

export type PaymentRegion =
  | "KR"            /* 한국 */
  | "GREATER_CHINA" /* 중국·대만·홍콩 */
  | "SEA"           /* 베트남·태국·인도네시아·필리핀 */
  | "SG_MY"         /* 싱가포르·말레이시아 */
  | "JP"            /* 일본 */
  | "GLOBAL";       /* 글로벌 (Cross-border) */

export interface PaymentMethodOption {
  id: string;
  region: PaymentRegion;
  category: PaymentMethodCategory;
  name: string;            /* 사용자 표시명: "Toss Virtual Account" */
  provider: string;        /* "KG이니시스" / "Stripe" / "Alipay" 등 */
  /** 수수료 계산:
   * - flatFee: 정액 (KRW, 한국 가상계좌 250원 등)
   * - percent: 비율 (0.034 = 3.4%) */
  flatFee?: number;
  flatFeeCurrency?: string;
  percentFee?: number;
  /** Fixed surcharge in payment currency (e.g. $0.30 Xendit) */
  fixedSurcharge?: number;
  fixedSurchargeCurrency?: string;
  description: string;     /* "건당 250원 (≈0.025%)" 같은 안내 */
  icon: string;            /* emoji */
  isFree: boolean;         /* 0% 수수료 여부 (UI 강조용) */
  isRecommended?: boolean; /* 권역별 추천 */
}

/** 권역·결제수단 카탈로그 — Booking Form / PaymentDialog 표시 */
export const PAYMENT_METHODS: PaymentMethodOption[] = [
  /* ── 한국 ── */
  { id: "kr-virtual", region: "KR", category: "virtual_account", name: "가상계좌 (Virtual Account)", provider: "KG이니시스/KCP/토스", flatFee: 250, flatFeeCurrency: "KRW", percentFee: 0, description: "건당 250원 (≈0.025%) · 한국 표준", icon: "🏦", isFree: false, isRecommended: true },
  { id: "kr-transfer", region: "KR", category: "bank_transfer", name: "무통장 입금 (Bank Transfer)", provider: "직접 송금", percentFee: 0, description: "수수료 없음", icon: "💸", isFree: true },
  { id: "kr-card-local", region: "KR", category: "card_local", name: "신용카드 (Local)", provider: "Toss/KCP/이니시스", percentFee: 0.028, description: "2.1~3.3% (평균 2.8%)", icon: "💳", isFree: false },
  /* ── 대중화권 (중국·대만·홍콩) ── */
  { id: "hk-fps", region: "GREATER_CHINA", category: "qr_payment", name: "FPS (Hong Kong)", provider: "HKMA", percentFee: 0, description: "수수료 없음 · 홍콩 표준", icon: "🇭🇰", isFree: true, isRecommended: true },
  { id: "cn-alipay", region: "GREATER_CHINA", category: "qr_payment", name: "Alipay", provider: "Ant Group", percentFee: 0.015, description: "약 1~2% (B2B 머천트)", icon: "💙", isFree: false, isRecommended: true },
  { id: "cn-wechat", region: "GREATER_CHINA", category: "qr_payment", name: "WeChat Pay", provider: "Tencent", percentFee: 0.015, description: "약 1~2% (B2B 머천트)", icon: "💚", isFree: false },
  { id: "cn-unionpay", region: "GREATER_CHINA", category: "card_local", name: "UnionPay", provider: "UnionPay", percentFee: 0.02, description: "약 1.5~2.5%", icon: "💳", isFree: false },
  /* ── 베트남·동남아 ── */
  { id: "vn-vnpay", region: "SEA", category: "qr_payment", name: "VNPay QR", provider: "VNPay", percentFee: 0.02, description: "약 1.5~2.5% (베트남)", icon: "🇻🇳", isFree: false, isRecommended: true },
  { id: "th-promptpay", region: "SEA", category: "qr_payment", name: "PromptPay", provider: "Bank of Thailand", percentFee: 0, description: "수수료 없음 · 태국 표준", icon: "🇹🇭", isFree: true },
  { id: "sea-xendit", region: "SEA", category: "card_global", name: "Card (Xendit)", provider: "Xendit", percentFee: 0.03, fixedSurcharge: 0.30, fixedSurchargeCurrency: "USD", description: "3% + $0.30 · 인도네시아·필리핀", icon: "💳", isFree: false },
  { id: "sea-2c2p", region: "SEA", category: "card_global", name: "2C2P Cross-border", provider: "2C2P (Ant Group)", percentFee: 0.025, description: "약 2~3% · 동남아 통합", icon: "🌏", isFree: false },
  /* ── 싱가포르·말레이시아 ── */
  { id: "sg-paynow", region: "SG_MY", category: "qr_payment", name: "PayNow", provider: "ABS Singapore", percentFee: 0, description: "수수료 없음 · 싱가포르 표준", icon: "🇸🇬", isFree: true, isRecommended: true },
  { id: "my-duitnow", region: "SG_MY", category: "qr_payment", name: "DuitNow", provider: "PayNet Malaysia", percentFee: 0, description: "수수료 없음 · 말레이시아 표준", icon: "🇲🇾", isFree: true, isRecommended: true },
  { id: "sg-stripe", region: "SG_MY", category: "card_global", name: "Credit Card", provider: "Stripe SG", percentFee: 0.034, fixedSurcharge: 0.50, fixedSurchargeCurrency: "SGD", description: "3.4% + S$0.50 (국제카드 +1% +FX 2%)", icon: "💳", isFree: false },
  /* ── 일본 ── */
  { id: "jp-virtual", region: "JP", category: "virtual_account", name: "Virtual Account (Japan)", provider: "GMO/Stripe", percentFee: 0.005, description: "약 0.5% · 일본 가상계좌", icon: "🇯🇵", isFree: false, isRecommended: true },
  { id: "jp-stripe", region: "JP", category: "card_global", name: "Credit Card", provider: "Stripe Japan", percentFee: 0.036, description: "3.6% domestic + 1.5% intl", icon: "💳", isFree: false },
  /* ── 글로벌 (Cross-border 대형 거래) ── */
  { id: "global-swift", region: "GLOBAL", category: "swift_wire", name: "SWIFT Wire Transfer", provider: "은행 직송금", percentFee: 0.001, fixedSurcharge: 35, fixedSurchargeCurrency: "USD", description: "0.1% + $25~50 · 대형 송금 권장", icon: "🌐", isFree: false },
  { id: "global-eximbay", region: "GLOBAL", category: "card_global", name: "Eximbay Cross-border", provider: "Eximbay (Korea)", percentFee: 0.035, description: "약 0.2~5% (방식별, 다통화 정산)", icon: "💱", isFree: false },
];

/** 결제수단 → 수수료 계산 헬퍼.
 *
 * 반환값:
 *   - feeAmount: 결제수단 통화 기준 수수료액
 *   - feeUsd: USD 환산 (FX 1.0 추정, 실제는 환율 적용)
 *   - displayText: 사용자 표시용 ("USD 25.00 (2.5%)") */
export function calcPaymentFee(method: PaymentMethodOption, baseAmountUsd: number): {
  feeUsd: number;
  feePercent: number;
  displayText: string;
} {
  const percent = method.percentFee || 0;
  const surcharge = method.fixedSurcharge || 0;
  /* flatFee는 KRW 등 결제 통화 기준 → 별도 환산 필요 (간이) */
  let flatUsd = 0;
  if (method.flatFee && method.flatFeeCurrency === "KRW") {
    flatUsd = method.flatFee / 1380; /* approx KRW→USD */
  } else if (method.flatFee && method.flatFeeCurrency === "USD") {
    flatUsd = method.flatFee;
  }
  /* fixedSurcharge는 보통 USD 또는 SGD. 단순화 위해 USD 처리 */
  const fixedUsd = method.fixedSurchargeCurrency === "SGD" ? surcharge * 0.74 : surcharge;
  const feeUsd = baseAmountUsd * percent + fixedUsd + flatUsd;
  const feePercent = baseAmountUsd > 0 ? feeUsd / baseAmountUsd : 0;
  const displayText = method.isFree
    ? "Free (0%)"
    : `USD ${feeUsd.toFixed(2)} (${(feePercent * 100).toFixed(2)}%)`;
  return { feeUsd, feePercent, displayText };
}

/** 권역별 추천 결제수단 (UI 정렬용) */
export function paymentMethodsForRegion(region: PaymentRegion): PaymentMethodOption[] {
  const regional = PAYMENT_METHODS.filter(m => m.region === region);
  const global = PAYMENT_METHODS.filter(m => m.region === "GLOBAL");
  return [
    ...regional.sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0)),
    ...global,
  ];
}

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
    issuedDate: "2026-04-01", dueDate: "2026-04-06",
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
    issuedDate: "2026-03-01", dueDate: "2026-03-06",
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
    issuedDate: "2026-05-01", dueDate: "2026-05-06",
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
    issuedDate: "2026-04-03", dueDate: "2026-04-08",
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
    issuedDate: "2026-04-05", dueDate: "2026-04-10",
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
    receivedAmount: 0,
    paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    remarks: "PREPAY · Per-booking invoice · full amount due by deadline (partial payments not allowed)",
    billingType: "PREPAY", customerCompanyId: "comp-002", contractId: "ctr-002-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "API_USER", firstInsertTime: "2026-04-08 14:30:02",
    lastUpdateUser: "API_USER", lastUpdateTime: "2026-04-08 14:30:02",
    paidAmount: 0, balance: 1650, revenue: 82,
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
    issuedDate: "2026-04-01", dueDate: "2026-04-06",
    bookingIds: ["bk-001", "bk-004"], receivedAmount: 5400, paymentDate: "2026-04-12",
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
    issuedDate: "2026-05-01", dueDate: "2026-05-06",
    bookingIds: ["bk-008", "bk-007"], receivedAmount: 0, paymentDate: "",
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
    issuedDate: "2026-04-01", dueDate: "2026-04-06",
    bookingIds: ["bk-009", "bk-006"], receivedAmount: 448800000, paymentDate: "2026-04-15",
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
    issuedDate: "2026-05-01", dueDate: "2026-05-06",
    bookingIds: ["bk-012", "bk-009"], receivedAmount: 0, paymentDate: "",
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
    bookingIds: ["bk-003"], receivedAmount: 1200, paymentDate: "2026-04-12",
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
    bookingIds: ["bk-005"], receivedAmount: 0, paymentDate: "",
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
    bookingIds: ["bk-009"], receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    remarks: "PREPAY · Vietnam-local hotel · VAT 10% included · OhMyHotel VN",
    billingType: "PREPAY", customerCompanyId: "comp-011",
    contractId: "ctr-011-vn", ohmyhotelEntityId: "omh-vn",
    firstInsertUser: "API_USER", firstInsertTime: "2026-04-15 11:20:00",
    lastUpdateUser: "API_USER", lastUpdateTime: "2026-04-15 11:20:00",
    paidAmount: 0, balance: 33000000, revenue: 1500000,
  },

  /* ──────────────────────────────────────────────────────────────────
   * Additional mock invoices — demo today = 2026-04-22
   * Spans aging buckets (Current / 1-30 / 31-60 / 60+) + states (Issued/Paid/Partial/Overdue)
   * ────────────────────────────────────────────────────────────────── */

  /* ── TravelCo (comp-001) — POSTPAY SG USD — extra volume ── */
  /* Current: due 2026-04-25 (+3d ahead) */
  { invoiceNo: "INV-2026-0142", period: "Apr 2026 H1", status: "Issued",
    supplyAmount: 4864, vat: 486, total: 5350, contractCurrency: "USD",
    issuedDate: "2026-04-20", dueDate: "2026-04-25",
    bookingIds: ["bk-016","bk-017"], receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    billingType: "POSTPAY", customerCompanyId: "comp-001", contractId: "ctr-001-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-04-20 01:00:44",
    lastUpdateUser: "BATCH_USER", lastUpdateTime: "2026-04-20 01:00:44",
    paidAmount: 0, balance: 5350, revenue: 268,
  },
  /* 1-30 overdue: due 2026-04-10 → ~12d overdue */
  { invoiceNo: "INV-2026-0118", period: "Mar 2026 H2", status: "Issued",
    supplyAmount: 3800, vat: 380, total: 4180, contractCurrency: "USD",
    issuedDate: "2026-04-05", dueDate: "2026-04-10",
    bookingIds: ["bk-018","bk-026"], receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    remarks: "Payment overdue — AR aging 12 days",
    billingType: "POSTPAY", customerCompanyId: "comp-001", contractId: "ctr-001-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-04-05 01:00:40",
    lastUpdateUser: "Sarah Kim", lastUpdateTime: "2026-04-18 09:22:10",
    paidAmount: 0, balance: 4180, revenue: 209,
  },
  /* 31-60 overdue: due 2026-03-15 → ~38d overdue · Partial */
  { invoiceNo: "INV-2026-0101", period: "Feb 2026 H2", status: "Issued",
    supplyAmount: 2800, vat: 280, total: 3080, contractCurrency: "USD",
    issuedDate: "2026-03-10", dueDate: "2026-03-15",
    bookingIds: ["bk-019"], receivedAmount: 1200, paymentDate: "2026-03-25",
    matchStatus: "Partial", disputedBookingIds: [], disputedAmount: 0,
    remarks: "Partial payment — USD 1,880 still outstanding",
    billingType: "POSTPAY", customerCompanyId: "comp-001", contractId: "ctr-001-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-03-10 01:00:40",
    lastUpdateUser: "Sarah Kim", lastUpdateTime: "2026-04-01 14:20:00",
    paidAmount: 1200, balance: 1880, revenue: 154,
  },
  /* 60+ overdue: already have INV-2025-0076 (60+ overdue from Nov 2025) */

  /* Paid (historical, varied dates) */
  { invoiceNo: "INV-2026-0156", period: "Apr 2026 H2 (partial)", status: "Paid",
    supplyAmount: 2700, vat: 270, total: 2970, contractCurrency: "USD",
    issuedDate: "2026-04-18", dueDate: "2026-04-23",
    bookingIds: ["bk-025"], receivedAmount: 2970, paymentDate: "2026-04-21",
    matchStatus: "Full", disputedBookingIds: [], disputedAmount: 0,
    billingType: "POSTPAY", customerCompanyId: "comp-001", contractId: "ctr-001-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-04-18 01:00:41",
    lastUpdateUser: "API_USER", lastUpdateTime: "2026-04-21 16:44:02",
    paidAmount: 2970, balance: 0, revenue: 149,
  },

  /* ── Asia Tours (comp-002) — PREPAY USD — more per-booking invoices ── */
  { invoiceNo: "INV-2026-PRE-0210", period: "Apr 2026", status: "Paid",
    supplyAmount: 1650, vat: 0, total: 1650, contractCurrency: "USD",
    issuedDate: "2026-04-21", dueDate: "2026-04-28",
    bookingIds: ["bk-029"], receivedAmount: 1650, paymentDate: "2026-04-21",
    matchStatus: "Full", disputedBookingIds: [], disputedAmount: 0,
    remarks: "PREPAY · Hyatt Regency Tokyo · card paid same-day",
    billingType: "PREPAY", customerCompanyId: "comp-002", contractId: "ctr-002-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "API_USER", firstInsertTime: "2026-04-21 09:55:30",
    lastUpdateUser: "API_USER", lastUpdateTime: "2026-04-21 10:02:15",
    paidAmount: 1650, balance: 0, revenue: 83,
  },
  { invoiceNo: "INV-2026-PRE-0212", period: "Apr 2026", status: "Paid",
    supplyAmount: 820, vat: 0, total: 820, contractCurrency: "USD",
    issuedDate: "2026-04-08", dueDate: "2026-04-18",
    bookingIds: ["bk-030"], receivedAmount: 820, paymentDate: "2026-04-08",
    matchStatus: "Full", disputedBookingIds: [], disputedAmount: 0,
    remarks: "PREPAY · Capella Hanoi · subsequently cancelled — refund pending",
    billingType: "PREPAY", customerCompanyId: "comp-002", contractId: "ctr-002-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "API_USER", firstInsertTime: "2026-04-08 13:10:44",
    lastUpdateUser: "API_USER", lastUpdateTime: "2026-04-10 11:32:15",
    paidAmount: 820, balance: 0, revenue: 41,
  },
  { invoiceNo: "INV-2026-PRE-0215", period: "Apr 2026", status: "Issued",
    supplyAmount: 3800, vat: 0, total: 3800, contractCurrency: "USD",
    issuedDate: "2026-04-20", dueDate: "2026-05-10",
    bookingIds: ["bk-020"], receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    remarks: "PREPAY · Ritz-Carlton Tokyo · deadline D-18",
    billingType: "PREPAY", customerCompanyId: "comp-002", contractId: "ctr-002-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "API_USER", firstInsertTime: "2026-04-20 10:30:00",
    lastUpdateUser: "API_USER", lastUpdateTime: "2026-04-20 10:30:00",
    paidAmount: 0, balance: 3800, revenue: 190,
  },

  /* ── GOTADI (comp-010) — POSTPAY SG + VN — more breadth ── */
  /* SG Current */
  { invoiceNo: "INV-SG-2026-1158", period: "Apr 2026 H2", status: "Issued",
    supplyAmount: 4980, vat: 0, total: 4980, contractCurrency: "USD",
    issuedDate: "2026-04-18", dueDate: "2026-04-23",
    bookingIds: ["bk-024","bk-021"], receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    billingType: "POSTPAY", customerCompanyId: "comp-010", contractId: "ctr-010-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-04-18 01:00:42",
    lastUpdateUser: "BATCH_USER", lastUpdateTime: "2026-04-18 01:00:42",
    paidAmount: 0, balance: 4980, revenue: 249,
  },
  /* SG 1-30 overdue */
  { invoiceNo: "INV-SG-2026-1088", period: "Mar 2026 H2", status: "Issued",
    supplyAmount: 6200, vat: 0, total: 6200, contractCurrency: "USD",
    issuedDate: "2026-04-01", dueDate: "2026-04-06",
    bookingIds: ["bk-015","bk-013"], receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    remarks: "Overdue 16 days — escalation reminder D+10 sent",
    billingType: "POSTPAY", customerCompanyId: "comp-010", contractId: "ctr-010-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-04-01 01:00:40",
    lastUpdateUser: "Sarah Kim", lastUpdateTime: "2026-04-16 11:05:22",
    paidAmount: 0, balance: 6200, revenue: 310,
  },
  /* SG 31-60 overdue */
  { invoiceNo: "INV-SG-2026-1050", period: "Feb 2026 H2", status: "Issued",
    supplyAmount: 3400, vat: 0, total: 3400, contractCurrency: "USD",
    issuedDate: "2026-03-05", dueDate: "2026-03-10",
    bookingIds: ["bk-011"], receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    remarks: "Overdue 43 days — under AM review",
    billingType: "POSTPAY", customerCompanyId: "comp-010", contractId: "ctr-010-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-03-05 01:00:40",
    lastUpdateUser: "James Park", lastUpdateTime: "2026-04-10 15:30:11",
    paidAmount: 0, balance: 3400, revenue: 170,
  },
  /* VN Current */
  { invoiceNo: "INV-VN-2026-0455", period: "Apr 2026 H2", status: "Issued",
    supplyAmount: 254545455, vat: 25454545, total: 280000000, contractCurrency: "VND",
    issuedDate: "2026-04-20", dueDate: "2026-04-25",
    bookingIds: ["bk-022","bk-023"], receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    remarks: "Vietnam hotels · domestic VAT 10% · OhMyHotel VN",
    billingType: "POSTPAY", customerCompanyId: "comp-010", contractId: "ctr-010-vn", ohmyhotelEntityId: "omh-vn",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-04-20 01:00:40",
    lastUpdateUser: "BATCH_USER", lastUpdateTime: "2026-04-20 01:00:40",
    paidAmount: 0, balance: 280000000, revenue: 14000000,
  },
  /* VN 1-30 overdue (Partial) */
  { invoiceNo: "INV-VN-2026-0445", period: "Apr 2026 H1", status: "Issued",
    supplyAmount: 172727273, vat: 17272727, total: 190000000, contractCurrency: "VND",
    issuedDate: "2026-04-03", dueDate: "2026-04-08",
    bookingIds: ["bk-028"], receivedAmount: 85000000, paymentDate: "2026-04-12",
    matchStatus: "Partial", disputedBookingIds: [], disputedAmount: 0,
    remarks: "Partial payment received · VND 105M outstanding",
    billingType: "POSTPAY", customerCompanyId: "comp-010", contractId: "ctr-010-vn", ohmyhotelEntityId: "omh-vn",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-04-03 01:00:40",
    lastUpdateUser: "Tran Thuy Tien", lastUpdateTime: "2026-04-12 14:30:00",
    paidAmount: 85000000, balance: 105000000, revenue: 9500000,
  },
  /* VN Paid historical */
  { invoiceNo: "INV-VN-2026-0401", period: "Feb 2026", status: "Paid",
    supplyAmount: 300000000, vat: 30000000, total: 330000000, contractCurrency: "VND",
    issuedDate: "2026-03-01", dueDate: "2026-03-06",
    bookingIds: [], receivedAmount: 330000000, paymentDate: "2026-03-05",
    matchStatus: "Full", disputedBookingIds: [], disputedAmount: 0,
    billingType: "POSTPAY", customerCompanyId: "comp-010", contractId: "ctr-010-vn", ohmyhotelEntityId: "omh-vn",
    firstInsertUser: "BATCH_USER", firstInsertTime: "2026-03-01 01:00:40",
    lastUpdateUser: "API_USER", lastUpdateTime: "2026-03-05 14:22:00",
    paidAmount: 330000000, balance: 0, revenue: 16500000,
  },

  /* ── Vietnam Vacation Co (comp-011) — PREPAY SG + VN — more per-booking ── */
  { invoiceNo: "INV-SG-PRE-2026-3062", period: "Apr 2026", status: "Paid",
    supplyAmount: 960, vat: 0, total: 960, contractCurrency: "USD",
    issuedDate: "2026-04-12", dueDate: "2026-04-22",
    bookingIds: ["bk-017"], receivedAmount: 960, paymentDate: "2026-04-13",
    matchStatus: "Full", disputedBookingIds: [], disputedAmount: 0,
    billingType: "PREPAY", customerCompanyId: "comp-011", contractId: "ctr-011-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "API_USER", firstInsertTime: "2026-04-12 09:08:41",
    lastUpdateUser: "API_USER", lastUpdateTime: "2026-04-13 10:15:33",
    paidAmount: 960, balance: 0, revenue: 48,
  },
  { invoiceNo: "INV-SG-PRE-2026-3070", period: "Apr 2026", status: "Issued",
    supplyAmount: 2100, vat: 0, total: 2100, contractCurrency: "USD",
    issuedDate: "2026-04-14", dueDate: "2026-04-28",
    bookingIds: ["bk-024"], receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    remarks: "PREPAY · Mandarin Oriental HK · deadline D-6",
    billingType: "PREPAY", customerCompanyId: "comp-011", contractId: "ctr-011-sg", ohmyhotelEntityId: "omh-sg",
    firstInsertUser: "API_USER", firstInsertTime: "2026-04-14 08:38:29",
    lastUpdateUser: "API_USER", lastUpdateTime: "2026-04-14 08:38:29",
    paidAmount: 0, balance: 2100, revenue: 105,
  },
  { invoiceNo: "INV-VN-PRE-2026-0521", period: "Apr 2026", status: "Issued",
    supplyAmount: 150000000, vat: 15000000, total: 165000000, contractCurrency: "VND",
    issuedDate: "2026-04-20", dueDate: "2026-05-05",
    bookingIds: ["bk-023"], receivedAmount: 0, paymentDate: "",
    matchStatus: "Unpaid", disputedBookingIds: [], disputedAmount: 0,
    remarks: "PREPAY · Metropole Hanoi · VN VAT 10% · deadline D-13",
    billingType: "PREPAY", customerCompanyId: "comp-011", contractId: "ctr-011-vn", ohmyhotelEntityId: "omh-vn",
    firstInsertUser: "API_USER", firstInsertTime: "2026-04-20 16:22:41",
    lastUpdateUser: "API_USER", lastUpdateTime: "2026-04-20 16:22:41",
    paidAmount: 0, balance: 165000000, revenue: 8250000,
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

/* ════════════════════════════════════════════════════════════════════
 * Invoice Dispute & Payment Receipt — 2026-04-30 결정 #1 (Accounting 역할)
 * ════════════════════════════════════════════════════════════════════
 * 고객사 Accounting이 invoice를 검증하다 이상을 발견하면 분쟁 제기.
 * 분쟁은 자동으로 ticket으로 라우팅 → ELLIS가 검토 후 처리.
 * 송금 후엔 영수증을 첨부해 "송금했음" 증빙 (ELLIS가 입금 매칭 시 참고).
 *
 * DOTBIZ는 고객사로 돈을 보내지 않음. 모든 조정(Adjustment)은
 * 다음 invoice의 (-) 라인 또는 별도 credit note로 처리.
 */

export type InvoiceDisputeStatus = "Open" | "UnderReview" | "Accepted" | "Rejected" | "Withdrawn";
export type InvoiceDisputeReason =
  | "AmountMismatch"        // 금액 불일치
  | "BookingNotMine"        // 우리 예약 아님
  | "DuplicateCharge"       // 중복 청구
  | "AdjustmentMissing"     // 환불/조정 누락
  | "TaxIncorrect"          // 세금 오류
  | "Other";

export interface InvoiceDispute {
  id: string;
  invoiceNo: string;
  customerCompanyId: string;
  raisedBy: string;          // Accounting/Master email
  raisedAt: string;
  reason: InvoiceDisputeReason;
  description: string;
  affectedBookingIds: string[];
  disputedAmount: number;
  status: InvoiceDisputeStatus;
  ticketId?: string;         // 자동 생성된 티켓 (분쟁 → 티켓 라우팅)
  resolvedAt?: string;
  resolution?: string;
}

export const invoiceDisputes: InvoiceDispute[] = [
  {
    id: "disp-001",
    invoiceNo: "INV-2026-0089",
    customerCompanyId: "comp-001",
    raisedBy: "accounting@dotbiz.com",
    raisedAt: "2026-04-22",
    reason: "AmountMismatch",
    description: "Grand Hyatt Seoul 예약 금액이 계약 단가 대비 $40 초과 청구됨",
    affectedBookingIds: ["bk-001"],
    disputedAmount: 40,
    status: "UnderReview",
    ticketId: "TKT-2026-0421",
  },
  {
    id: "disp-002",
    invoiceNo: "INV-2026-0067",
    customerCompanyId: "comp-001",
    raisedBy: "accounting@dotbiz.com",
    raisedAt: "2026-03-25",
    reason: "AdjustmentMissing",
    description: "ANA Osaka 예약 취소 후 cancellation fee 처리는 됐으나 조정 라인 누락",
    affectedBookingIds: ["bk-004"],
    disputedAmount: 65,
    status: "Accepted",
    ticketId: "TKT-2026-0325",
    resolvedAt: "2026-04-02",
    resolution: "다음 invoice에 -$65 adjustment 라인 추가됨 (BILL-2026-0010)",
  },
];

export function disputesForInvoice(invoiceNo: string): InvoiceDispute[] {
  return invoiceDisputes.filter(d => d.invoiceNo === invoiceNo);
}

export function disputesForCompany(companyId: string): InvoiceDispute[] {
  return invoiceDisputes
    .filter(d => d.customerCompanyId === companyId)
    .sort((a, b) => b.raisedAt.localeCompare(a.raisedAt));
}

/* ── 송금 영수증 ──
 * 고객사가 송금 후 첨부. ELLIS는 입금 확인 시 참조.
 * 파일 자체는 별도 storage(여기선 mock URL).
 */
export interface PaymentReceipt {
  id: string;
  invoiceNo: string;
  customerCompanyId: string;
  uploadedBy: string;        // Accounting/Master email
  uploadedAt: string;
  amount: number;
  currency: string;
  remittedDate: string;      // 실제 송금일
  bankReference?: string;    // 송금 reference / 거래번호
  fileName: string;
  fileUrl: string;           // mock — 실제는 S3 등
  notes?: string;
  status: "Pending-Match" | "Matched" | "Mismatched";
}

export const paymentReceipts: PaymentReceipt[] = [
  {
    id: "rcp-001",
    invoiceNo: "INV-2026-0067",
    customerCompanyId: "comp-001",
    uploadedBy: "accounting@dotbiz.com",
    uploadedAt: "2026-03-30",
    amount: 1265,
    currency: "USD",
    remittedDate: "2026-03-30",
    bankReference: "WIRE-KEB-20260330-1842",
    fileName: "remittance-INV-0067.pdf",
    fileUrl: "/mock/receipts/remittance-INV-0067.pdf",
    notes: "ANA Osaka invoice 전액 송금",
    status: "Matched",
  },
  {
    id: "rcp-002",
    invoiceNo: "INV-2026-0130",
    customerCompanyId: "comp-001",
    uploadedBy: "accounting@dotbiz.com",
    uploadedAt: "2026-04-28",
    amount: 3030,
    currency: "USD",
    remittedDate: "2026-04-28",
    bankReference: "WIRE-KEB-20260428-2103",
    fileName: "remittance-INV-0130.pdf",
    fileUrl: "/mock/receipts/remittance-INV-0130.pdf",
    notes: "분쟁 중인 disp-001 ($40) 차감하고 송금",
    status: "Pending-Match",
  },
];

export function receiptsForInvoice(invoiceNo: string): PaymentReceipt[] {
  return paymentReceipts
    .filter(r => r.invoiceNo === invoiceNo)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export const DISPUTE_REASON_LABEL: Record<InvoiceDisputeReason, string> = {
  AmountMismatch: "금액 불일치",
  BookingNotMine: "우리 예약 아님",
  DuplicateCharge: "중복 청구",
  AdjustmentMissing: "조정 누락",
  TaxIncorrect: "세금 오류",
  Other: "기타",
};

/* ════════════════════════════════════════════════════════════════════
 * AR Aging Report — 2026-04-30 결정 #5
 * ════════════════════════════════════════════════════════════════════
 * 회계 인식: Cash basis (실제 입금 + 회계처리 시점에만 매출 인식).
 * 그 전까지 모든 invoice는 미수금(AR) 상태.
 * 기간이 길어질수록 회수 가능성 ↓ → bucket으로 분류.
 *
 * Bucket 기준 (due date로부터 경과일):
 *   • Current      : 미도래 (due > today)
 *   • 1-30 days    : 정상 연체 범위
 *   • 31-60 days   : 주의 — escalation
 *   • 61-90 days   : 위험 — 재독촉
 *   • 90+ days     : 악성 미수금 — 회계팀 손상 검토
 *   • Disputed     : 분쟁 중 (티켓 미해결) — 별도 분류
 *
 * 분쟁 건은 aging과 별개로 분리. 분쟁 인정/기각 후 다시 일반 bucket으로 환원.
 */

export type ARAgingBucket = "Current" | "1-30" | "31-60" | "61-90" | "90+" | "Disputed";

export interface ARAgingEntry {
  invoiceNo: string;
  customerCompanyId: string;
  outstandingAmount: number;     /* total - receivedAmount */
  currency: string;
  outstandingUsd: number;        /* lockedFxRate 적용 USD 환산 */
  dueDate: string;
  daysOverdue: number;           /* 음수면 미도래 (Current) */
  bucket: ARAgingBucket;
  hasDispute: boolean;
  disputedAmount: number;
  isBadDebt: boolean;            /* 90+ days = 악성 미수금 */
}

export function bucketFor(daysOverdue: number, hasOpenDispute: boolean): ARAgingBucket {
  if (hasOpenDispute) return "Disputed";
  if (daysOverdue < 0) return "Current";
  if (daysOverdue <= 30) return "1-30";
  if (daysOverdue <= 60) return "31-60";
  if (daysOverdue <= 90) return "61-90";
  return "90+";
}

/** 회사의 모든 invoice를 aging bucket별로 분류. asOfDate 기준 daysOverdue 계산. */
export function arAgingForCompany(
  companyId: string,
  asOfDate: string = new Date().toISOString().slice(0, 10),
): ARAgingEntry[] {
  const today = new Date(asOfDate);
  const myInvs = invoices.filter(i =>
    i.customerCompanyId === companyId &&
    i.matchStatus !== "Full" &&
    i.matchStatus !== "Reconciled",
  );
  const openDisputes = invoiceDisputes.filter(d =>
    d.customerCompanyId === companyId &&
    (d.status === "Open" || d.status === "UnderReview"),
  );

  return myInvs.map(inv => {
    const due = new Date(inv.dueDate);
    const daysOverdue = Math.floor((today.getTime() - due.getTime()) / 86400000);
    const outstanding = Math.max(0, inv.total - inv.receivedAmount);
    const disputesOnInv = openDisputes.filter(d => d.invoiceNo === inv.invoiceNo);
    const hasOpenDispute = disputesOnInv.length > 0;
    const disputedAmount = disputesOnInv.reduce((s, d) => s + d.disputedAmount, 0);
    const bucket = bucketFor(daysOverdue, hasOpenDispute);
    return {
      invoiceNo: inv.invoiceNo,
      customerCompanyId: companyId,
      outstandingAmount: outstanding,
      currency: inv.currency,
      outstandingUsd: outstanding,    /* invoice currency가 이미 USD로 정규화돼 있음 */
      dueDate: inv.dueDate,
      daysOverdue,
      bucket,
      hasDispute: hasOpenDispute,
      disputedAmount,
      isBadDebt: daysOverdue > 90 && !hasOpenDispute,
    };
  });
}

export interface ARSummary {
  total: number;                 /* 총 미수금 (USD) */
  byBucket: Record<ARAgingBucket, { amount: number; count: number }>;
  badDebtAmount: number;         /* 90+ days */
  disputedAmount: number;        /* 분쟁 중 별도 분류 */
  oldestDaysOverdue: number;
}

export function arSummaryForCompany(
  companyId: string,
  asOfDate?: string,
): ARSummary {
  const entries = arAgingForCompany(companyId, asOfDate);
  const empty: Record<ARAgingBucket, { amount: number; count: number }> = {
    "Current": { amount: 0, count: 0 },
    "1-30":    { amount: 0, count: 0 },
    "31-60":   { amount: 0, count: 0 },
    "61-90":   { amount: 0, count: 0 },
    "90+":     { amount: 0, count: 0 },
    "Disputed":{ amount: 0, count: 0 },
  };
  let badDebt = 0, disputed = 0, oldest = 0, total = 0;
  for (const e of entries) {
    empty[e.bucket].amount += e.outstandingUsd;
    empty[e.bucket].count += 1;
    total += e.outstandingUsd;
    if (e.isBadDebt) badDebt += e.outstandingUsd;
    if (e.bucket === "Disputed") disputed += e.outstandingUsd;
    if (e.daysOverdue > oldest) oldest = e.daysOverdue;
  }
  return { total, byBucket: empty, badDebtAmount: badDebt, disputedAmount: disputed, oldestDaysOverdue: oldest };
}
