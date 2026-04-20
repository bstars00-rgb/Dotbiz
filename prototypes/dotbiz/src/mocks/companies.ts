import type { CountryCode, VatScheme } from "./taxProfiles";

export type BillingType = "PREPAY" | "POSTPAY";
export type DepositType = "Credit by Company" | "Floating Deposit" | "Guarantee Deposit" | "Guarantee Insurance" | "Bank Guarantee" | "No Deposit";
export type SettlementCycle = "Monthly" | "Bi-weekly" | "Weekly";

/* Per-company tax profile.
 * References taxRules[country] for country-level defaults, but allows
 * customer-specific overrides (e.g. Zero-rated status, custom VAT rate).
 */
export interface CompanyTaxProfile {
  country: CountryCode;
  taxId: string;                 /* 사업자번호 or 국가별 Tax ID */
  legalName: string;             /* 법인 정식 명칭 (인보이스에 기재) */
  vatScheme: VatScheme;          /* 기본값은 country 룰 따르되 override 가능 */
  vatRateOverride?: number;      /* exceptional rate */
  registeredForEInvoice: boolean;/* 전자인보이스 발행 대상 */
  eInvoiceRegNo?: string;        /* JP Invoice Registration No / VN Serial / CN Fapiao code 등 */
  reverseChargeApplicable: boolean;
  currency: string;
  notes?: string;
}

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
  /* ── Tax profile (신규) ── */
  taxProfile: CompanyTaxProfile;
}

export const companies: Company[] = [
  {
    id: "comp-001", name: "TravelCo International", businessRegNo: "123-45-67890",
    businessType: "Postpaid", billingType: "POSTPAY",
    address: "123 Gangnam-daero, Seoul", phone: "02-1234-5678", email: "info@travelco.com",
    contractDate: "2024-03-15", ellisSyncDate: "2026-04-15",
    depositType: "Floating Deposit", depositAmount: 50000, settlementCycle: "Monthly", paymentDueDays: 30,
    taxProfile: {
      country: "KR", taxId: "123-45-67890", legalName: "트래블코인터내셔널 주식회사",
      vatScheme: "Standard", registeredForEInvoice: true,
      reverseChargeApplicable: false, currency: "KRW",
      notes: "국내 B2B — 부가세 10% + 원천징수 3.3% 대상",
    },
  },
  {
    id: "comp-002", name: "Asia Tours Ltd.", businessRegNo: "234-56-78901",
    businessType: "Prepaid", billingType: "PREPAY",
    address: "456 Teheran-ro, Seoul", phone: "02-2345-6789", email: "info@asiatours.com",
    contractDate: "2024-06-01", ellisSyncDate: "2026-04-15",
    taxProfile: {
      country: "KR", taxId: "234-56-78901", legalName: "아시아투어스 주식회사",
      vatScheme: "Standard", registeredForEInvoice: true,
      reverseChargeApplicable: false, currency: "KRW",
    },
  },
  {
    id: "comp-003", name: "Sakura Travel Japan", businessRegNo: "T1234567890123",
    businessType: "Postpaid", billingType: "POSTPAY",
    address: "2-1-1 Nihonbashi, Chuo-ku, Tokyo", phone: "+81-3-1234-5678", email: "info@sakura-travel.co.jp",
    contractDate: "2024-09-01", ellisSyncDate: "2026-04-15",
    depositType: "Bank Guarantee", depositAmount: 100000, settlementCycle: "Monthly", paymentDueDays: 30,
    taxProfile: {
      country: "JP", taxId: "T1234567890123", legalName: "サクラトラベル株式会社",
      vatScheme: "Zero-rated", registeredForEInvoice: true, eInvoiceRegNo: "T1234567890123",
      reverseChargeApplicable: true, currency: "JPY",
      notes: "크로스보더 서비스 — 한국 VAT 영세율, 일본측 Reverse Charge 처리",
    },
  },
  {
    id: "comp-004", name: "Dragon Holidays (Shanghai)", businessRegNo: "91310000MA1FL12345",
    businessType: "Postpaid", billingType: "POSTPAY",
    address: "1376 Nanjing Xi Lu, Jing'an, Shanghai", phone: "+86-21-5555-1234", email: "contact@dragon-holidays.cn",
    contractDate: "2025-01-15", ellisSyncDate: "2026-04-15",
    depositType: "Guarantee Deposit", depositAmount: 80000, settlementCycle: "Bi-weekly", paymentDueDays: 14,
    taxProfile: {
      country: "CN", taxId: "91310000MA1FL12345", legalName: "上海龙假期旅游有限公司",
      vatScheme: "Zero-rated", registeredForEInvoice: true, eInvoiceRegNo: "FP-SH-2025-001",
      reverseChargeApplicable: false, currency: "CNY",
      notes: "Fapiao 발행 대상. Special Fapiao 요청 가능 (매입세액공제 목적).",
    },
  },
  {
    id: "comp-005", name: "Saigon Trips Vietnam", businessRegNo: "0312345678",
    businessType: "Prepaid", billingType: "PREPAY",
    address: "99 Nguyen Hue, District 1, HCMC", phone: "+84-28-3333-5555", email: "hello@saigontrips.vn",
    contractDate: "2025-03-10", ellisSyncDate: "2026-04-15",
    taxProfile: {
      country: "VN", taxId: "0312345678", legalName: "Công ty TNHH Du lịch Sài Gòn",
      vatScheme: "Zero-rated", registeredForEInvoice: true, eInvoiceRegNo: "VN-HD-0012345",
      reverseChargeApplicable: false, currency: "VND",
      notes: "전자인보이스 의무 (Decree 123/2020) — 베트남 Tax Code 10자리 확인 완료",
    },
  },
  {
    id: "comp-006", name: "Lion City Travel Pte Ltd", businessRegNo: "201312345K",
    businessType: "Postpaid", billingType: "POSTPAY",
    address: "80 Robinson Road, #10-01, Singapore", phone: "+65-6888-1234", email: "sales@lioncitytravel.sg",
    contractDate: "2024-07-20", ellisSyncDate: "2026-04-15",
    depositType: "Floating Deposit", depositAmount: 60000, settlementCycle: "Monthly", paymentDueDays: 30,
    taxProfile: {
      country: "SG", taxId: "201312345K", legalName: "Lion City Travel Pte. Ltd.",
      vatScheme: "Zero-rated", registeredForEInvoice: false,
      reverseChargeApplicable: true, currency: "SGD",
      notes: "IRAS InvoiceNow 미가입 — PDF 인보이스 전송",
    },
  },
  {
    id: "comp-007", name: "Victoria Harbour Tours (HK)", businessRegNo: "12345678",
    businessType: "Prepaid", billingType: "PREPAY",
    address: "Central, Hong Kong", phone: "+852-2555-8888", email: "info@victoria-tours.hk",
    contractDate: "2025-02-01", ellisSyncDate: "2026-04-15",
    taxProfile: {
      country: "HK", taxId: "12345678", legalName: "Victoria Harbour Tours Limited",
      vatScheme: "Exempt", registeredForEInvoice: false,
      reverseChargeApplicable: false, currency: "HKD",
      notes: "홍콩 VAT/GST 없음 — 상업인보이스로 처리",
    },
  },
];

export const currentCompany = companies[0];
