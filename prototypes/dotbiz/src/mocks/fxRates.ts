/* FX Rates Mock — USD base rates per date.
 *
 * 실제: Korea Exim Bank API, BOK 매매기준율, 블룸버그 등 여러 소스 병행.
 * 여기선 간단히 월별 변동률로 시뮬레이션 (2026-01 ~ 2026-04).
 *
 * 용도:
 *  - 예약 시점 환율로 KRW 원가 고정 (fxRateBooking)
 *  - 정산 시점 환율로 USD 청구 (fxRateSettlement)
 *  - 월말 평가 환율로 미실현 손익 계산 (fxRateMonthEnd)
 */

export type Currency = "USD" | "KRW" | "JPY" | "CNY" | "VND" | "SGD" | "HKD" | "THB" | "IDR" | "TWD" | "MYR";

export interface FxRate {
  date: string;          /* YYYY-MM-DD */
  base: Currency;        /* Always "USD" */
  target: Currency;
  rate: number;          /* 1 USD = rate * target */
}

/* Monthly reference rates (end-of-month, mock)
 * Jan → Feb → Mar → Apr 변동 시뮬레이션
 */
export const fxHistory: FxRate[] = [
  /* KRW */
  { date: "2026-01-31", base: "USD", target: "KRW", rate: 1320.50 },
  { date: "2026-02-28", base: "USD", target: "KRW", rate: 1335.80 },
  { date: "2026-03-31", base: "USD", target: "KRW", rate: 1342.15 },
  { date: "2026-04-30", base: "USD", target: "KRW", rate: 1358.60 },  /* depreciation */

  /* JPY */
  { date: "2026-01-31", base: "USD", target: "JPY", rate: 148.20 },
  { date: "2026-02-28", base: "USD", target: "JPY", rate: 150.40 },
  { date: "2026-03-31", base: "USD", target: "JPY", rate: 152.85 },
  { date: "2026-04-30", base: "USD", target: "JPY", rate: 155.10 },

  /* CNY */
  { date: "2026-01-31", base: "USD", target: "CNY", rate: 7.18 },
  { date: "2026-02-28", base: "USD", target: "CNY", rate: 7.22 },
  { date: "2026-03-31", base: "USD", target: "CNY", rate: 7.25 },
  { date: "2026-04-30", base: "USD", target: "CNY", rate: 7.31 },

  /* VND */
  { date: "2026-01-31", base: "USD", target: "VND", rate: 24650 },
  { date: "2026-02-28", base: "USD", target: "VND", rate: 24750 },
  { date: "2026-03-31", base: "USD", target: "VND", rate: 24830 },
  { date: "2026-04-30", base: "USD", target: "VND", rate: 24920 },

  /* SGD */
  { date: "2026-01-31", base: "USD", target: "SGD", rate: 1.348 },
  { date: "2026-02-28", base: "USD", target: "SGD", rate: 1.352 },
  { date: "2026-03-31", base: "USD", target: "SGD", rate: 1.358 },
  { date: "2026-04-30", base: "USD", target: "SGD", rate: 1.363 },
];

/* Get rate closest to (but not after) the given date */
export function getFxRate(base: Currency, target: Currency, date: string): number {
  if (base === target) return 1;
  const candidates = fxHistory.filter(f => f.base === base && f.target === target && f.date <= date);
  if (candidates.length === 0) return 1;
  return candidates[candidates.length - 1].rate;
}

/* Current spot rate (assumed 2026-04-20 for demo) */
export const CURRENT_DATE = "2026-04-20";

/* Month-end rate for M2M valuation */
export function getMonthEndRate(base: Currency, target: Currency, yyyymm: string): number {
  const lastDay = new Date(`${yyyymm}-01`);
  lastDay.setMonth(lastDay.getMonth() + 1);
  lastDay.setDate(0);
  const key = lastDay.toISOString().slice(0, 10);
  return getFxRate(base, target, key);
}

/* FX Gain/Loss computation
 * gain = (settlementRate - bookingRate) × amountInTarget
 *
 * Example: $1,000 booking at KRW 1,320 → KRW 1,320,000 obligation frozen
 *          Settled at KRW 1,358 → customer paid $1,000, we convert to KRW 1,358,000
 *          Gain = 38,000 KRW (~$27.98 at current rate)
 */
export interface FxBreakdown {
  amountUsd: number;
  bookingRate: number;       /* USD→target at booking date */
  settlementRate: number;    /* USD→target at settlement date */
  monthEndRate?: number;     /* USD→target at month-end (for unrealized) */
  hotelCurrency: Currency;   /* 호텔 원가 통화 */
  bookingCostLocal: number;  /* amountUsd × bookingRate */
  settlementCostLocal: number;
  realizedGainLocal: number; /* difference when settled */
  realizedGainUsd: number;
  unrealizedGainLocal?: number;
  unrealizedGainUsd?: number;
}

export function calculateFx(params: {
  amountUsd: number;
  hotelCurrency: Currency;
  bookingDate: string;
  settlementDate?: string;
  asOfDate?: string;  /* For unrealized: month-end */
}): FxBreakdown {
  const bookingRate = getFxRate("USD", params.hotelCurrency, params.bookingDate);
  const bookingCostLocal = params.amountUsd * bookingRate;

  let settlementRate = bookingRate;
  let settlementCostLocal = bookingCostLocal;
  let realizedGainLocal = 0;

  if (params.settlementDate) {
    settlementRate = getFxRate("USD", params.hotelCurrency, params.settlementDate);
    settlementCostLocal = params.amountUsd * settlementRate;
    realizedGainLocal = settlementCostLocal - bookingCostLocal;
  }

  let unrealizedGainLocal: number | undefined;
  let unrealizedGainUsd: number | undefined;
  let monthEndRate: number | undefined;

  if (params.asOfDate && !params.settlementDate) {
    monthEndRate = getFxRate("USD", params.hotelCurrency, params.asOfDate);
    const mtmCostLocal = params.amountUsd * monthEndRate;
    unrealizedGainLocal = mtmCostLocal - bookingCostLocal;
    unrealizedGainUsd = unrealizedGainLocal / monthEndRate;
  }

  const realizedGainUsd = realizedGainLocal !== 0 ? realizedGainLocal / settlementRate : 0;

  return {
    amountUsd: params.amountUsd,
    bookingRate,
    settlementRate,
    monthEndRate,
    hotelCurrency: params.hotelCurrency,
    bookingCostLocal,
    settlementCostLocal,
    realizedGainLocal,
    realizedGainUsd,
    unrealizedGainLocal,
    unrealizedGainUsd,
  };
}

/* Monthly FX Gain/Loss summary (mock) */
export const fxSummary = {
  currentMonth: "2026-04",
  realizedGainUsd: 285.40,   /* 정산 완료 건 실현손익 */
  unrealizedGainUsd: -124.30, /* 미실현 (월말 평가) */
  largestGainBookingId: "bk-007",
  largestLossBookingId: "bk-010",
  totalExposureUsd: 48650,
  hedgeRatio: 0,  /* 헤지 미적용 */
};
