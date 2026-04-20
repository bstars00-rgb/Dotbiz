/* E-Invoice submission log — tracks per-country tax authority integration status.
 * Each record represents an outbound invoice submission to the buyer's
 * country-specific e-invoice system (NTS, JP-Invoice, Fapiao, VN-eHoaDon, IRAS).
 */

import type { EInvoiceSystem } from "./taxProfiles";

export type EInvoiceStatus = "Draft" | "Submitted" | "Approved" | "Rejected" | "Cancelled" | "Amended";

export interface EInvoiceRecord {
  id: string;
  invoiceNo: string;          /* DOTBIZ internal invoice */
  buyerCompanyId: string;
  buyerCountry: string;
  system: EInvoiceSystem;
  externalId?: string;        /* Tax authority approval number (NTS 승인번호, JP Invoice No., Fapiao code 등) */
  status: EInvoiceStatus;
  submittedAt: string;
  approvedAt?: string;
  rejectedReason?: string;
  amount: number;
  currency: string;
  vatScheme: string;
  errors?: string[];
}

export const eInvoiceLog: EInvoiceRecord[] = [
  /* 🇰🇷 Korea NTS */
  {
    id: "ei-001", invoiceNo: "INV-2026-0089", buyerCompanyId: "comp-001", buyerCountry: "South Korea",
    system: "NTS", externalId: "202604010000001-12345678-9abcdef0",
    status: "Approved", submittedAt: "2026-04-01 10:15:00", approvedAt: "2026-04-01 10:15:47",
    amount: 4180, currency: "USD", vatScheme: "Standard",
  },
  {
    id: "ei-002", invoiceNo: "INV-2026-0067", buyerCompanyId: "comp-001", buyerCountry: "South Korea",
    system: "NTS", externalId: "202603010000002-12345678-9abcdef1",
    status: "Approved", submittedAt: "2026-03-01 09:00:00", approvedAt: "2026-03-01 09:00:33",
    amount: 3850, currency: "USD", vatScheme: "Standard",
  },
  {
    id: "ei-003", invoiceNo: "INV-2026-0130", buyerCompanyId: "comp-001", buyerCountry: "South Korea",
    system: "NTS", status: "Draft",
    submittedAt: "",
    amount: 10630, currency: "USD", vatScheme: "Standard",
  },

  /* 🇯🇵 Japan Invoice (Sakura Travel) */
  {
    id: "ei-004", invoiceNo: "INV-2026-JP-0012", buyerCompanyId: "comp-003", buyerCountry: "Japan",
    system: "JP-Invoice", externalId: "JP-T1234567890123-202604-0012",
    status: "Approved", submittedAt: "2026-04-03 11:00:00", approvedAt: "2026-04-03 11:02:15",
    amount: 3200, currency: "USD", vatScheme: "Zero-rated",
  },
  {
    id: "ei-005", invoiceNo: "INV-2026-JP-0013", buyerCompanyId: "comp-003", buyerCountry: "Japan",
    system: "JP-Invoice", status: "Submitted",
    submittedAt: "2026-04-18 14:30:00",
    amount: 5400, currency: "USD", vatScheme: "Zero-rated",
  },

  /* 🇨🇳 China Fapiao (Dragon Holidays) */
  {
    id: "ei-006", invoiceNo: "INV-2026-CN-0008", buyerCompanyId: "comp-004", buyerCountry: "China",
    system: "Fapiao", externalId: "FP-SH-31000045672589",
    status: "Approved", submittedAt: "2026-04-05 09:20:00", approvedAt: "2026-04-05 09:48:30",
    amount: 7800, currency: "USD", vatScheme: "Zero-rated",
  },
  {
    id: "ei-007", invoiceNo: "INV-2026-CN-0009", buyerCompanyId: "comp-004", buyerCountry: "China",
    system: "Fapiao", status: "Rejected",
    submittedAt: "2026-04-17 11:10:00",
    rejectedReason: "Buyer 사업자번호(统一社会信用代码) 첫 자리 오류. 국세청 발급 원본 확인 후 재제출 요청.",
    amount: 1500, currency: "USD", vatScheme: "Zero-rated",
    errors: ["Invalid buyer tax ID format"],
  },

  /* 🇻🇳 Vietnam eHoaDon (Saigon Trips) */
  {
    id: "ei-008", invoiceNo: "INV-2026-VN-0021", buyerCompanyId: "comp-005", buyerCountry: "Vietnam",
    system: "VN-eHoaDon", externalId: "VN-0012345-K26/001",
    status: "Approved", submittedAt: "2026-04-08 16:00:00", approvedAt: "2026-04-08 16:03:22",
    amount: 2700, currency: "USD", vatScheme: "Zero-rated",
  },

  /* 🇸🇬 Singapore IRAS (Lion City Travel) — not mandatory, PDF only */
  {
    id: "ei-009", invoiceNo: "INV-2026-SG-0005", buyerCompanyId: "comp-006", buyerCountry: "Singapore",
    system: "IRAS", status: "Submitted",
    submittedAt: "2026-04-12 10:00:00",
    amount: 4900, currency: "USD", vatScheme: "Zero-rated",
  },

  /* 🇭🇰 Hong Kong — no e-invoice system */
  {
    id: "ei-010", invoiceNo: "INV-2026-HK-0003", buyerCompanyId: "comp-007", buyerCountry: "Hong Kong",
    system: "None", status: "Approved",
    submittedAt: "2026-04-10 14:00:00", approvedAt: "2026-04-10 14:00:00",
    amount: 1800, currency: "USD", vatScheme: "Exempt",
  },
];

/* Country-level aggregates for dashboard */
export interface CountryTaxSummary {
  country: string;
  countryCode: string;
  flag: string;
  invoiceCount: number;
  totalAmount: number;
  totalVat: number;
  totalWithholding: number;
  eInvoiceApproved: number;
  eInvoicePending: number;
  eInvoiceRejected: number;
  system: EInvoiceSystem;
}

export const countrySummary: CountryTaxSummary[] = [
  { country: "South Korea",  countryCode: "KR", flag: "🇰🇷", invoiceCount: 3, totalAmount: 18660, totalVat: 1696, totalWithholding: 616, eInvoiceApproved: 2, eInvoicePending: 1, eInvoiceRejected: 0, system: "NTS" },
  { country: "Japan",        countryCode: "JP", flag: "🇯🇵", invoiceCount: 2, totalAmount: 8600,  totalVat: 0,    totalWithholding: 0,   eInvoiceApproved: 1, eInvoicePending: 1, eInvoiceRejected: 0, system: "JP-Invoice" },
  { country: "China",        countryCode: "CN", flag: "🇨🇳", invoiceCount: 2, totalAmount: 9300,  totalVat: 0,    totalWithholding: 0,   eInvoiceApproved: 1, eInvoicePending: 0, eInvoiceRejected: 1, system: "Fapiao" },
  { country: "Vietnam",      countryCode: "VN", flag: "🇻🇳", invoiceCount: 1, totalAmount: 2700,  totalVat: 0,    totalWithholding: 0,   eInvoiceApproved: 1, eInvoicePending: 0, eInvoiceRejected: 0, system: "VN-eHoaDon" },
  { country: "Singapore",    countryCode: "SG", flag: "🇸🇬", invoiceCount: 1, totalAmount: 4900,  totalVat: 0,    totalWithholding: 0,   eInvoiceApproved: 0, eInvoicePending: 1, eInvoiceRejected: 0, system: "IRAS" },
  { country: "Hong Kong",    countryCode: "HK", flag: "🇭🇰", invoiceCount: 1, totalAmount: 1800,  totalVat: 0,    totalWithholding: 0,   eInvoiceApproved: 1, eInvoicePending: 0, eInvoiceRejected: 0, system: "None" },
];

export const taxComplianceSummary = {
  totalInvoices: 10,
  totalAmount: 46960,
  totalVat: 1696,
  totalWithholding: 616,
  eInvoicePending: 3,
  eInvoiceRejected: 1,
  crossBorderCount: 7,
  domesticCount: 3,
  quarterlyReportStatus: "Q2-2026: Draft",
};
