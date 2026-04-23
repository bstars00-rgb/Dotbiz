export type BillingType = "PREPAY" | "POSTPAY";
export type DepositType = "Credit by Company" | "Floating Deposit" | "Guarantee Deposit" | "Guarantee Insurance" | "Bank Guarantee" | "No Deposit";
export type SettlementCycle = "Monthly" | "Bi-weekly" | "Weekly";

/* How the customer sends bookings to DOTBIZ.
 * UI   — OPs book via the DOTBIZ web app
 * API  — Booking engine connects via /v1/bookings endpoints (no human touch)
 * Both — Mixed channel (OP can also book manually as fallback) */
export type IntegrationType = "UI" | "API" | "Both";

export interface Company {
  id: string;
  name: string;
  businessRegNo: string;
  businessType: "Prepaid" | "Postpaid";
  billingType: BillingType;
  address: string;
  phone: string;
  email: string;
  contractDate: string;
  /* POSTPAY only */
  depositType?: DepositType;
  depositAmount?: number;
  settlementCycle?: SettlementCycle;
  paymentDueDays?: number;
  /* ELLIS sync info */
  ellisSyncDate: string;
  /* Contract currency — fixed at contract signing. Customer is invoiced in this currency. */
  contractCurrency: "USD" | "KRW" | "JPY" | "CNY" | "VND" | "SGD";
  country: string;
  /* Integration channel — how bookings flow in. Used by anomaly alerts
   * to phrase messages correctly ("API silent" vs "no UI activity") and
   * by admin dashboards to track channel health. */
  integrationType: IntegrationType;
  /* Rough baseline booking pace per day (for anomaly thresholds).
   * In production this is auto-computed from a rolling 30-day mean. */
  bookingBaselinePerDay: number;
}

export const companies: Company[] = [
  {
    id: "comp-001", name: "TravelCo International", businessRegNo: "123-45-67890",
    businessType: "Postpaid", billingType: "POSTPAY",
    address: "123 Gangnam-daero, Seoul", phone: "02-1234-5678", email: "info@travelco.com",
    contractDate: "2024-03-15", ellisSyncDate: "2026-04-15",
    depositType: "Floating Deposit", depositAmount: 50000, settlementCycle: "Bi-weekly", paymentDueDays: 5,
    contractCurrency: "USD", country: "South Korea",
    integrationType: "UI", bookingBaselinePerDay: 8,
  },
  {
    id: "comp-002", name: "Asia Tours Ltd.", businessRegNo: "234-56-78901",
    businessType: "Prepaid", billingType: "PREPAY",
    address: "456 Teheran-ro, Seoul", phone: "02-2345-6789", email: "info@asiatours.com",
    contractDate: "2024-06-01", ellisSyncDate: "2026-04-15",
    contractCurrency: "USD", country: "South Korea",
    integrationType: "UI", bookingBaselinePerDay: 5,
  },
  {
    id: "comp-003", name: "Sakura Travel Japan", businessRegNo: "T1234567890123",
    businessType: "Postpaid", billingType: "POSTPAY",
    address: "2-1-1 Nihonbashi, Chuo-ku, Tokyo", phone: "+81-3-1234-5678", email: "info@sakura-travel.co.jp",
    contractDate: "2024-09-01", ellisSyncDate: "2026-04-15",
    depositType: "Bank Guarantee", depositAmount: 100000, settlementCycle: "Bi-weekly", paymentDueDays: 5,
    contractCurrency: "JPY", country: "Japan",
    integrationType: "Both", bookingBaselinePerDay: 15,
  },
  {
    id: "comp-004", name: "Dragon Holidays (Shanghai)", businessRegNo: "91310000MA1FL12345",
    businessType: "Postpaid", billingType: "POSTPAY",
    address: "1376 Nanjing Xi Lu, Jing'an, Shanghai", phone: "+86-21-5555-1234", email: "contact@dragon-holidays.cn",
    contractDate: "2025-01-15", ellisSyncDate: "2026-04-15",
    depositType: "Guarantee Deposit", depositAmount: 80000, settlementCycle: "Bi-weekly", paymentDueDays: 5,
    contractCurrency: "CNY", country: "China",
    integrationType: "API", bookingBaselinePerDay: 22,
  },
  {
    id: "comp-005", name: "Saigon Trips Vietnam", businessRegNo: "0312345678",
    businessType: "Prepaid", billingType: "PREPAY",
    address: "99 Nguyen Hue, District 1, HCMC", phone: "+84-28-3333-5555", email: "hello@saigontrips.vn",
    contractDate: "2025-03-10", ellisSyncDate: "2026-04-15",
    contractCurrency: "USD", country: "Vietnam",
    integrationType: "UI", bookingBaselinePerDay: 4,
  },
  /* ── NEW multi-entity demo customers ── */
  {
    id: "comp-010", name: "GOTADI", businessRegNo: "0315647892",
    businessType: "Postpaid", billingType: "POSTPAY",
    address: "194 Hoa Hung, Ward 13, District 10, Ho Chi Minh City, Vietnam",
    phone: "+84-28-3864-7892", email: "ops@gotadi.vn",
    contractDate: "2025-08-01", ellisSyncDate: "2026-04-20",
    depositType: "Floating Deposit", depositAmount: 40000, settlementCycle: "Bi-weekly", paymentDueDays: 5,
    contractCurrency: "USD", country: "Vietnam",
    integrationType: "API", bookingBaselinePerDay: 12,
  },
  {
    id: "comp-011", name: "Vietnam Vacation Co", businessRegNo: "0412987456",
    businessType: "Prepaid", billingType: "PREPAY",
    address: "72 Ly Thuong Kiet, Hoan Kiem, Hanoi, Vietnam",
    phone: "+84-24-3934-5678", email: "billing@vnvacation.com",
    contractDate: "2025-11-15", ellisSyncDate: "2026-04-20",
    contractCurrency: "USD", country: "Vietnam",
    integrationType: "API", bookingBaselinePerDay: 48,
  },

  {
    id: "comp-006", name: "Lion City Travel Pte Ltd", businessRegNo: "201312345K",
    businessType: "Postpaid", billingType: "POSTPAY",
    address: "80 Robinson Road, #10-01, Singapore", phone: "+65-6888-1234", email: "sales@lioncitytravel.sg",
    contractDate: "2024-07-20", ellisSyncDate: "2026-04-15",
    depositType: "Floating Deposit", depositAmount: 60000, settlementCycle: "Bi-weekly", paymentDueDays: 5,
    contractCurrency: "SGD", country: "Singapore",
    integrationType: "Both", bookingBaselinePerDay: 10,
  },
];

export const currentCompany = companies[0];
