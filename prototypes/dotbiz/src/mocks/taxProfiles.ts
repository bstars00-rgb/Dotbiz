/* Country-level tax rules lookup.
 * Used by taxEngine to compute VAT / withholding / e-invoice format for a given transaction.
 * Data sourced from publicly available tax authority documentation (2024-2026).
 */

export type CountryCode = "KR" | "JP" | "CN" | "VN" | "SG" | "HK" | "TH" | "ID" | "MY" | "TW";

export type VatScheme = "Standard" | "Zero-rated" | "Exempt" | "Reverse-charge";

export type EInvoiceSystem =
  | "NTS"            /* 🇰🇷 한국 전자세금계산서 */
  | "JP-Invoice"     /* 🇯🇵 일본 適格請求書 (2023.10~) */
  | "Fapiao"         /* 🇨🇳 중국 增值税发票 */
  | "VN-eHoaDon"     /* 🇻🇳 베트남 Hóa đơn điện tử (Decree 123/2020) */
  | "IRAS"           /* 🇸🇬 싱가포르 GST e-invoice (InvoiceNow/PEPPOL) */
  | "eFaktur"        /* 🇮🇩 인니 */
  | "None";

export interface CountryTaxRule {
  country: string;
  countryCode: CountryCode;
  flag: string;
  vatName: string;         /* "부가가치세", "消費税", etc. */
  vatNameEn: string;       /* "VAT", "Consumption Tax", "GST", etc. */
  vatStandardRate: number; /* 0.10 = 10% */
  withholdingRate: number; /* domestic service only; 0 if not applicable */
  withholdingNote: string;
  eInvoiceSystem: EInvoiceSystem;
  eInvoiceMandatory: boolean;
  taxIdLabel: string;      /* "사업자등록번호", "Invoice Registration No", etc. */
  taxIdFormat: string;     /* Human-readable format */
  taxIdExample: string;
  currency: string;
  fiscalYearEnd: string;   /* "12-31" or "03-31" etc. */
  reverseChargeEligible: boolean;
  /* B2B cross-border 서비스 수출 시 공급자 국가에서 Zero-rate 가능 여부 */
  crossBorderZeroRated: boolean;
  notes: string[];
}

export const taxRules: Record<CountryCode, CountryTaxRule> = {
  KR: {
    country: "South Korea",
    countryCode: "KR",
    flag: "🇰🇷",
    vatName: "부가가치세",
    vatNameEn: "VAT",
    vatStandardRate: 0.10,
    withholdingRate: 0.033,
    withholdingNote: "사업소득 원천징수 3.3% (소득세 3% + 지방세 0.3%)",
    eInvoiceSystem: "NTS",
    eInvoiceMandatory: true,
    taxIdLabel: "사업자등록번호",
    taxIdFormat: "###-##-#####",
    taxIdExample: "123-45-67890",
    currency: "KRW",
    fiscalYearEnd: "12-31",
    reverseChargeEligible: true,
    crossBorderZeroRated: true,
    notes: [
      "B2B 거래 시 전자세금계산서 발행 의무 (홈택스 NTS 승인)",
      "국외 B2B 서비스 공급은 영세율 (부가세 0%)",
      "국내 B2B 서비스 공급 시 공급받는자가 원천징수 후 송금",
    ],
  },
  JP: {
    country: "Japan",
    countryCode: "JP",
    flag: "🇯🇵",
    vatName: "消費税",
    vatNameEn: "Consumption Tax",
    vatStandardRate: 0.10,
    withholdingRate: 0,
    withholdingNote: "B2B 호텔서비스는 원천징수 없음 (Individual 거래만 해당)",
    eInvoiceSystem: "JP-Invoice",
    eInvoiceMandatory: true,
    taxIdLabel: "適格請求書発行事業者登録番号",
    taxIdFormat: "T + 13 digits",
    taxIdExample: "T1234567890123",
    currency: "JPY",
    fiscalYearEnd: "03-31",
    reverseChargeEligible: true,
    crossBorderZeroRated: true,
    notes: [
      "2023년 10월 1일부터 적격청구서(Invoice) 제도 도입",
      "Invoice Registration No.(T~) 미기재 시 매입세액공제 불가",
      "税率別内訳(10% / 8% 경감) 구분 필수",
    ],
  },
  CN: {
    country: "China",
    countryCode: "CN",
    flag: "🇨🇳",
    vatName: "增值税",
    vatNameEn: "VAT",
    vatStandardRate: 0.06,  /* 6% for lodging/services; goods can be 13% */
    withholdingRate: 0,
    withholdingNote: "중국 내 거래는 원천징수 없음. 크로스보더 서비스는 별도 규정.",
    eInvoiceSystem: "Fapiao",
    eInvoiceMandatory: true,
    taxIdLabel: "统一社会信用代码",
    taxIdFormat: "18 alphanumeric",
    taxIdExample: "91310000MA1FL12345",
    currency: "CNY",
    fiscalYearEnd: "12-31",
    reverseChargeEligible: false,
    crossBorderZeroRated: true,
    notes: [
      "发票(Fapiao) 국세청 발급 — Special(增值税专用发票) vs General(普通发票)",
      "Special Fapiao만 매입세액공제 가능",
      "호텔/여행 서비스는 6% 세율 (2024년 기준)",
    ],
  },
  VN: {
    country: "Vietnam",
    countryCode: "VN",
    flag: "🇻🇳",
    vatName: "Thuế GTGT",
    vatNameEn: "VAT",
    vatStandardRate: 0.10,
    withholdingRate: 0,
    withholdingNote: "Foreign Contractor Tax(FCT) 별도 적용 가능",
    eInvoiceSystem: "VN-eHoaDon",
    eInvoiceMandatory: true,
    taxIdLabel: "Mã số thuế",
    taxIdFormat: "10 digits",
    taxIdExample: "0312345678",
    currency: "VND",
    fiscalYearEnd: "12-31",
    reverseChargeEligible: false,
    crossBorderZeroRated: true,
    notes: [
      "Decree 123/2020: 2022년 7월부터 전자인보이스 전면 시행",
      "호텔/관광 서비스 10% 표준세율",
      "Tax code 10자리 국세청 검증 필수",
    ],
  },
  SG: {
    country: "Singapore",
    countryCode: "SG",
    flag: "🇸🇬",
    vatName: "GST",
    vatNameEn: "GST",
    vatStandardRate: 0.09,  /* 2024년 인상 */
    withholdingRate: 0,
    withholdingNote: "Non-resident 서비스는 Withholding Tax 15% 별도",
    eInvoiceSystem: "IRAS",
    eInvoiceMandatory: false,  /* 권장, 단 InvoiceNow 확대 중 */
    taxIdLabel: "GST Registration No",
    taxIdFormat: "UEN (Mxx-Txx or NNNNNNNNNX)",
    taxIdExample: "201312345K",
    currency: "SGD",
    fiscalYearEnd: "12-31",
    reverseChargeEligible: true,
    crossBorderZeroRated: true,
    notes: [
      "2024.01.01 GST 8% → 9% 인상",
      "Export of services (SG → 해외 B2B)는 Zero-rated",
      "IRAS InvoiceNow (PEPPOL) 네트워크 권장",
    ],
  },
  HK: {
    country: "Hong Kong",
    countryCode: "HK",
    flag: "🇭🇰",
    vatName: "없음",
    vatNameEn: "No VAT/GST",
    vatStandardRate: 0,
    withholdingRate: 0,
    withholdingNote: "Royalty에만 WHT 4.95% 적용",
    eInvoiceSystem: "None",
    eInvoiceMandatory: false,
    taxIdLabel: "Business Registration No",
    taxIdFormat: "8 digits",
    taxIdExample: "12345678",
    currency: "HKD",
    fiscalYearEnd: "03-31",
    reverseChargeEligible: false,
    crossBorderZeroRated: true,
    notes: [
      "홍콩은 VAT/GST 없음 — 단순 상업인보이스로 처리",
      "Profits Tax (법인세)만 적용",
    ],
  },
  TH: {
    country: "Thailand",
    countryCode: "TH",
    flag: "🇹🇭",
    vatName: "ภาษีมูลค่าเพิ่ม",
    vatNameEn: "VAT",
    vatStandardRate: 0.07,
    withholdingRate: 0.03,
    withholdingNote: "서비스 WHT 3% (국내 법인 간)",
    eInvoiceSystem: "None",
    eInvoiceMandatory: false,
    taxIdLabel: "Tax ID",
    taxIdFormat: "13 digits",
    taxIdExample: "0105556123456",
    currency: "THB",
    fiscalYearEnd: "12-31",
    reverseChargeEligible: true,
    crossBorderZeroRated: true,
    notes: [
      "전자세금계산서 선택적 (Paper/Electronic 병행)",
      "VAT 7% (2024년까지 경감 연장)",
    ],
  },
  ID: {
    country: "Indonesia",
    countryCode: "ID",
    flag: "🇮🇩",
    vatName: "PPN",
    vatNameEn: "VAT",
    vatStandardRate: 0.11,
    withholdingRate: 0.02,
    withholdingNote: "PPh 23 서비스 2%",
    eInvoiceSystem: "eFaktur",
    eInvoiceMandatory: true,
    taxIdLabel: "NPWP",
    taxIdFormat: "15 digits",
    taxIdExample: "01.234.567.8-901.000",
    currency: "IDR",
    fiscalYearEnd: "12-31",
    reverseChargeEligible: false,
    crossBorderZeroRated: true,
    notes: [
      "2022년 PPN 10% → 11% 인상 (2025년 12% 예정)",
      "e-Faktur 시스템 필수",
    ],
  },
  TW: {
    country: "Taiwan",
    countryCode: "TW",
    flag: "🇹🇼",
    vatName: "營業稅",
    vatNameEn: "Business Tax",
    vatStandardRate: 0.05,
    withholdingRate: 0.10,
    withholdingNote: "외국법인 서비스 대가 20% (조세조약으로 감면 가능)",
    eInvoiceSystem: "None",
    eInvoiceMandatory: true,  /* 統一發票 GUI */
    taxIdLabel: "統一編號",
    taxIdFormat: "8 digits",
    taxIdExample: "12345678",
    currency: "TWD",
    fiscalYearEnd: "12-31",
    reverseChargeEligible: false,
    crossBorderZeroRated: true,
    notes: [
      "統一發票 (Uniform Invoice) 제도 — 당첨 추첨 포함",
      "외국 서비스 공급 대상: 5% 적용 (cross-border 일반규정)",
    ],
  },
  MY: {
    country: "Malaysia",
    countryCode: "MY",
    flag: "🇲🇾",
    vatName: "SST",
    vatNameEn: "Sales and Service Tax",
    vatStandardRate: 0.08,  /* Service Tax 8% (2024.03.01~) */
    withholdingRate: 0,
    withholdingNote: "Non-resident 서비스 10%",
    eInvoiceSystem: "None",
    eInvoiceMandatory: false,  /* 2024.08 단계적 시행 중 */
    taxIdLabel: "SST Registration No",
    taxIdFormat: "A12-3456-78901234",
    taxIdExample: "W24-1905-32000123",
    currency: "MYR",
    fiscalYearEnd: "12-31",
    reverseChargeEligible: false,
    crossBorderZeroRated: true,
    notes: [
      "SST 체제 (GST 2018년 폐지)",
      "2024년 3월부터 Service Tax 6% → 8% 인상",
    ],
  },
};

/* Helper: get rule by country code */
export function getTaxRule(code: CountryCode): CountryTaxRule {
  return taxRules[code];
}

/* Helper: all active countries */
export const activeCountries: CountryCode[] = ["KR", "JP", "CN", "VN", "SG", "HK", "TH", "ID", "TW", "MY"];
