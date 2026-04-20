/* Tax Engine
 * --------------------------------------------------------------
 * Given seller / buyer / hotel context + amount, compute:
 *   - applicable VAT rate & amount
 *   - withholding tax (if any)
 *   - lodging tax (hotel country)
 *   - reverse charge obligation flag (for buyer)
 *   - e-invoice format to issue
 *   - compliance notes (human-readable)
 *
 * Core rules (simplified; not legal advice):
 *   R1. Domestic (same country seller↔buyer) → Standard VAT rate
 *   R2. Cross-border B2B service export → Zero-rated (from seller's country)
 *   R3. Buyer may need Reverse Charge in own country if eligible
 *   R4. Korean withholding tax 3.3% applies only to KR↔KR B2B services
 *   R5. Exempt buyers (e.g. Hong Kong with no GST) → no output VAT
 */

import type { CompanyTaxProfile } from "@/mocks/companies";
import { taxRules, type CountryCode, type EInvoiceSystem, type VatScheme } from "@/mocks/taxProfiles";

export interface TaxContext {
  seller: CompanyTaxProfile;    /* 공급자 (OhMyHotel) */
  buyer: CompanyTaxProfile;     /* 고객사 (B2B 에이전시) */
  hotelCountry?: CountryCode;   /* 체류 호텔 국가 (optional, lodging tax 계산용) */
  amount: number;               /* Pre-tax amount (supply value) */
  serviceType?: "Hotel" | "Package" | "Cancellation Fee" | "Commission";
  currency?: string;
}

export interface TaxBreakdown {
  supply: number;                /* 공급가액 */
  vatRate: number;               /* 적용 세율 */
  vat: number;                   /* 부가세 */
  lodgingTax: number;            /* 호텔 체류세 */
  lodgingTaxRate: number;
  withholding: number;           /* 원천징수액 */
  withholdingRate: number;
  total: number;                 /* 공급가 + VAT + lodging (청구액) */
  netPayable: number;            /* total - withholding (고객 실제 송금액) */
  scheme: VatScheme;
  invoiceFormat: EInvoiceSystem;
  isCrossBorder: boolean;
  reverseChargeRequired: boolean;
  currency: string;
  notes: string[];
  /* For audit trail */
  rulesApplied: string[];
}

export function calculateTax(ctx: TaxContext): TaxBreakdown {
  const sellerRule = taxRules[ctx.seller.country];
  const buyerRule = taxRules[ctx.buyer.country];
  const hotelRule = ctx.hotelCountry ? taxRules[ctx.hotelCountry] : undefined;

  const isCrossBorder = ctx.seller.country !== ctx.buyer.country;
  const currency = ctx.currency || "USD";

  let vatRate = 0;
  let scheme: VatScheme = ctx.buyer.vatScheme;
  const rulesApplied: string[] = [];
  const notes: string[] = [];

  /* Rule R5: Buyer is in country without VAT (HK) */
  if (buyerRule.vatStandardRate === 0 && !isCrossBorder) {
    scheme = "Exempt";
    vatRate = 0;
    rulesApplied.push("R5: Buyer country has no VAT/GST");
    notes.push(`${buyerRule.country}: VAT/GST 미도입 국가 — 상업인보이스로 처리`);
  }
  /* Rule R2: Cross-border B2B service export → Zero-rated */
  else if (isCrossBorder && sellerRule.crossBorderZeroRated) {
    scheme = "Zero-rated";
    vatRate = 0;
    rulesApplied.push("R2: Cross-border B2B service export — Zero-rated from seller's VAT law");
    notes.push(`${sellerRule.country} → ${buyerRule.country} 크로스보더 B2B 서비스 — ${sellerRule.vatNameEn} 영세율 적용`);
  }
  /* Rule R1: Domestic standard VAT */
  else {
    scheme = ctx.seller.vatScheme === "Exempt" ? "Exempt" : "Standard";
    vatRate = ctx.seller.vatRateOverride ?? sellerRule.vatStandardRate;
    rulesApplied.push("R1: Domestic — Standard VAT applied");
  }

  /* Override: if buyer has explicit vatScheme override and same country */
  if (!isCrossBorder && ctx.buyer.vatRateOverride !== undefined) {
    vatRate = ctx.buyer.vatRateOverride;
    rulesApplied.push("R-Override: Buyer-specific VAT rate");
  }

  const supply = ctx.amount;
  const vat = Math.round(supply * vatRate * 100) / 100;

  /* Rule R3: Reverse charge required by buyer? */
  let reverseChargeRequired = false;
  if (isCrossBorder && buyerRule.reverseChargeEligible && ctx.buyer.reverseChargeApplicable) {
    reverseChargeRequired = true;
    rulesApplied.push("R3: Buyer must apply Reverse Charge in own country");
    notes.push(`${buyerRule.country} Reverse Charge 적용 — 고객사가 자국에서 ${buyerRule.vatNameEn} 신고·납부`);
  }

  /* Rule R4: Korean withholding (KR↔KR B2B services) */
  let withholdingRate = 0;
  if (!isCrossBorder && ctx.seller.country === "KR" && ctx.buyer.country === "KR") {
    withholdingRate = sellerRule.withholdingRate; /* 0.033 */
    rulesApplied.push("R4: Korean WHT 3.3% — domestic service supply");
    notes.push(`${sellerRule.country} 원천징수 ${(withholdingRate * 100).toFixed(1)}% (사업소득) — 고객이 차감 후 송금`);
  }
  const withholding = Math.round(supply * withholdingRate * 100) / 100;

  /* Lodging tax (hotel country) — informational, usually paid at hotel directly */
  let lodgingTaxRate = 0;
  let lodgingTax = 0;
  if (hotelRule && ctx.serviceType === "Hotel") {
    /* We don't actually charge this here — just inform */
    lodgingTaxRate = 0;  /* typically collected by hotel, not by DOTBIZ */
    lodgingTax = 0;
    if (ctx.hotelCountry !== ctx.seller.country) {
      notes.push(`${hotelRule.country}: 호텔 체류세는 호텔에서 체크인 시 별도 청구 (DOTBIZ 인보이스 미포함)`);
    }
  }

  const total = supply + vat + lodgingTax;
  const netPayable = total - withholding;

  /* Determine e-invoice format (based on seller's country + buyer's system) */
  const invoiceFormat: EInvoiceSystem = sellerRule.eInvoiceSystem;

  return {
    supply,
    vatRate,
    vat,
    lodgingTax,
    lodgingTaxRate,
    withholding,
    withholdingRate,
    total,
    netPayable,
    scheme,
    invoiceFormat,
    isCrossBorder,
    reverseChargeRequired,
    currency,
    notes,
    rulesApplied,
  };
}

/* Format helper — show "VAT 10%" or "Zero-rated" badge */
export function formatVatLabel(breakdown: TaxBreakdown): string {
  if (breakdown.scheme === "Zero-rated") return "Zero-rated (0%)";
  if (breakdown.scheme === "Exempt") return "Exempt";
  if (breakdown.scheme === "Reverse-charge") return "Reverse Charge";
  return `VAT ${(breakdown.vatRate * 100).toFixed(0)}%`;
}

/* Format helper — e-invoice label */
export function formatInvoiceSystem(sys: EInvoiceSystem): string {
  const map: Record<EInvoiceSystem, string> = {
    "NTS": "🇰🇷 전자세금계산서 (NTS)",
    "JP-Invoice": "🇯🇵 適格請求書",
    "Fapiao": "🇨🇳 增值税发票",
    "VN-eHoaDon": "🇻🇳 Hóa đơn điện tử",
    "IRAS": "🇸🇬 IRAS InvoiceNow",
    "eFaktur": "🇮🇩 e-Faktur",
    "None": "Commercial Invoice",
  };
  return map[sys] || sys;
}
