import { reviewCountFor } from "@/mocks/reviews";

/* ───────────────────────────────────────────────────────────────────────
 * Rewards Mall — Country-Local OP Reward System
 *
 * Model: each OP (the booking creator) personally owns the points they earn.
 * Points convert to digital, online-only products supplied locally per country
 * (no shipping, no FX). Rates are fixed per country — no daily FX swings.
 *
 * Points earn rate (per 1 P):
 *   KR  — 1,000 KRW
 *   JP  — 100 JPY
 *   CN  — 5 CNY
 *   VN  — 15,000 VND
 *   SG  — 1 SGD
 *   US  — 1 USD (fallback for international USD contracts)
 *
 * So 1 P ≈ US$1 worth of local purchasing power. Earn rate is decoupled from
 * live FX so an OP's P never fluctuates day-to-day.
 * ─────────────────────────────────────────────────────────────────────── */

export type CountryCode = "KR" | "JP" | "CN" | "VN" | "SG" | "US";

export const POINTS_EARN_RATE: Record<CountryCode, { currency: string; amountPerPoint: number; localeLabel: string; flag: string }> = {
  KR: { currency: "KRW", amountPerPoint: 1000,  localeLabel: "₩1,000 per Point",  flag: "🇰🇷" },
  JP: { currency: "JPY", amountPerPoint: 100,   localeLabel: "¥100 per Point",     flag: "🇯🇵" },
  CN: { currency: "CNY", amountPerPoint: 5,     localeLabel: "¥5 per Point",       flag: "🇨🇳" },
  VN: { currency: "VND", amountPerPoint: 15000, localeLabel: "₫15,000 per Point",  flag: "🇻🇳" },
  SG: { currency: "SGD", amountPerPoint: 1,     localeLabel: "S$1 per Point",      flag: "🇸🇬" },
  US: { currency: "USD", amountPerPoint: 1,     localeLabel: "US$1 per Point",     flag: "🌐" },
};

/* ── Map company country string → country code for the rewards system ── */
export function countryCodeFor(country?: string): CountryCode {
  if (!country) return "US";
  const c = country.toLowerCase();
  if (c.includes("korea")) return "KR";
  if (c.includes("japan")) return "JP";
  if (c.includes("china")) return "CN";
  if (c.includes("vietnam")) return "VN";
  if (c.includes("singapore")) return "SG";
  return "US";
}

/* ── Rewards product catalog ──
 * ALL digital / online-only (no shipping). Each product is only redeemable
 * by OPs in the matching countryCode. */
export type RewardCategory = "Coffee" | "Food" | "Transport" | "Shopping" | "Streaming" | "MobilePay" | "Beauty";

export interface RewardProduct {
  id: string;
  countryCode: CountryCode;
  supplierRegion: string;  /* where the supplier entity is incorporated */
  brand: string;
  name: string;
  description: string;
  category: RewardCategory;
  pointsCost: number;
  faceValue: number;
  faceCurrency: string;
  /* Visual */
  emoji: string;
  gradient: string;
  deliveryMethod: "email-code" | "in-app-voucher" | "barcode";
  /* Popularity — rolling 30-day redemption rank per country.
   * In production, computed nightly from redeemedVouchers.
   * "bestSeller" = top 15% of country catalog by redemptions. */
  isBestSeller?: boolean;
  /* Monthly redemption count (for tooltip/social proof) */
  monthlyRedemptions?: number;
  /** ── Tier 잠금 (2026-04 신규) ──
   * 이 상품을 리딤하려면 도달해야 할 최소 Tier.
   * undefined = 모두 가능 (Bronze 포함).
   * Tier 가시성은 항상 보임 (잠금 표시) — 승급 동기 부여. */
  minTier?: Tier;
}

export const rewardProducts: RewardProduct[] = [
  /* ═════════ KR — Korea (local suppliers) ═════════ */
  { id: "kr-starbucks-5k",   countryCode: "KR", supplierRegion: "Korea", brand: "Starbucks",     name: "스타벅스 아메리카노",      description: "Tall Americano 기프티콘, 전국 매장 사용 가능", category: "Coffee",    pointsCost: 10,   faceValue: 4500,     faceCurrency: "KRW", emoji: "☕", gradient: "linear-gradient(135deg, #006241, #1e3932)", deliveryMethod: "email-code", isBestSeller: true, monthlyRedemptions: 1842 },
  { id: "kr-starbucks-tx",   countryCode: "KR", supplierRegion: "Korea", brand: "Starbucks",     name: "스타벅스 디저트 세트",      description: "아메리카노 + 조각케이크 세트 기프티콘",     category: "Coffee",    pointsCost: 14,   faceValue: 11000,    faceCurrency: "KRW", emoji: "🍰", gradient: "linear-gradient(135deg, #006241, #a97c50)", deliveryMethod: "email-code" },
  { id: "kr-kakao-taxi",     countryCode: "KR", supplierRegion: "Korea", brand: "Kakao T",       name: "카카오T 블루 5,000원",      description: "카카오T 블루 택시 쿠폰 5,000원",              category: "Transport", pointsCost: 10,   faceValue: 5000,     faceCurrency: "KRW", emoji: "🚕", gradient: "linear-gradient(135deg, #FEE500, #3C1E1E)", deliveryMethod: "in-app-voucher" },
  { id: "kr-cgv",            countryCode: "KR", supplierRegion: "Korea", brand: "CGV",           name: "CGV 영화 관람권",          description: "CGV 2D 일반 영화 1매",                         category: "Entertainment" as RewardCategory, pointsCost: 20, faceValue: 14000, faceCurrency: "KRW", emoji: "🎬", gradient: "linear-gradient(135deg, #dc0000, #1a1a1a)", deliveryMethod: "email-code" },
  { id: "kr-baemin",         countryCode: "KR", supplierRegion: "Korea", brand: "배달의민족",      name: "배민 상품권 10,000원",      description: "배달의민족 배달 주문 10,000원 상품권",        category: "Food",      pointsCost: 14,   faceValue: 10000,    faceCurrency: "KRW", emoji: "🍱", gradient: "linear-gradient(135deg, #00c9a7, #004d40)", deliveryMethod: "in-app-voucher", isBestSeller: true, monthlyRedemptions: 1203 },
  { id: "kr-naverpay-20k",   countryCode: "KR", supplierRegion: "Korea", brand: "네이버페이",      name: "네이버페이 포인트 20,000",   description: "네이버페이 20,000 포인트 충전 (즉시 사용)",   category: "MobilePay", pointsCost: 28,   faceValue: 20000,    faceCurrency: "KRW", emoji: "💚", gradient: "linear-gradient(135deg, #03C75A, #0e5c2f)", deliveryMethod: "in-app-voucher", isBestSeller: true, monthlyRedemptions: 987 },
  { id: "kr-oliveyoung",     countryCode: "KR", supplierRegion: "Korea", brand: "올리브영",        name: "올리브영 15,000원 상품권",   description: "온라인/오프라인 매장 사용 가능",               category: "Beauty",    pointsCost: 20,   faceValue: 15000,    faceCurrency: "KRW", emoji: "💄", gradient: "linear-gradient(135deg, #82d400, #2d5500)", deliveryMethod: "email-code" },
  { id: "kr-tving",          countryCode: "KR", supplierRegion: "Korea", brand: "TVING",         name: "TVING 스탠다드 1개월",      description: "TVING 스탠다드 플랜 1개월 이용권",             category: "Streaming", pointsCost: 20,   faceValue: 13900,    faceCurrency: "KRW", emoji: "📺", gradient: "linear-gradient(135deg, #e4002b, #8b0000)", deliveryMethod: "email-code" },
  { id: "kr-coupang-30k",    countryCode: "KR", supplierRegion: "Korea", brand: "쿠팡",           name: "쿠팡 상품권 30,000원",      description: "쿠팡 전 상품 사용 가능 상품권",                category: "Shopping",  pointsCost: 40,   faceValue: 30000,    faceCurrency: "KRW", emoji: "🛒", gradient: "linear-gradient(135deg, #f74b0d, #8b2a06)", deliveryMethod: "email-code" },

  /* ═════════ JP — Japan ═════════ */
  { id: "jp-starbucks",      countryCode: "JP", supplierRegion: "Japan", brand: "Starbucks JP",  name: "スターバックス ドリンクチケット",   description: "Any drink Tall size, all stores in Japan",     category: "Coffee",    pointsCost: 10,   faceValue: 700,      faceCurrency: "JPY", emoji: "☕", gradient: "linear-gradient(135deg, #006241, #1e3932)", deliveryMethod: "email-code", isBestSeller: true, monthlyRedemptions: 624 },
  { id: "jp-rakuten",        countryCode: "JP", supplierRegion: "Japan", brand: "楽天ポイント",     name: "楽天ポイント 2,000",          description: "2,000 Rakuten points for online shopping",    category: "Shopping",  pointsCost: 28,   faceValue: 2000,     faceCurrency: "JPY", emoji: "🛍️", gradient: "linear-gradient(135deg, #bf0000, #660000)", deliveryMethod: "in-app-voucher" },
  { id: "jp-ubereats",       countryCode: "JP", supplierRegion: "Japan", brand: "Uber Eats JP",  name: "Uber Eats 1,500円クーポン",   description: "Uber Eats 1,500円 off on any order",          category: "Food",      pointsCost: 20,   faceValue: 1500,     faceCurrency: "JPY", emoji: "🍜", gradient: "linear-gradient(135deg, #06c167, #003d1f)", deliveryMethod: "in-app-voucher" },
  { id: "jp-amazon-3k",      countryCode: "JP", supplierRegion: "Japan", brand: "Amazon JP",     name: "Amazon ギフト券 3,000円",     description: "Amazon.co.jp ギフト券",                        category: "Shopping",  pointsCost: 40,   faceValue: 3000,     faceCurrency: "JPY", emoji: "📦", gradient: "linear-gradient(135deg, #ff9900, #232f3e)", deliveryMethod: "email-code" },
  { id: "jp-suica",          countryCode: "JP", supplierRegion: "Japan", brand: "Suica",         name: "Suica チャージ 2,000円",      description: "Mobile Suica charge (iOS/Android)",           category: "Transport", pointsCost: 28,   faceValue: 2000,     faceCurrency: "JPY", emoji: "🚇", gradient: "linear-gradient(135deg, #00a550, #004d24)", deliveryMethod: "in-app-voucher" },
  { id: "jp-netflix",        countryCode: "JP", supplierRegion: "Japan", brand: "Netflix JP",    name: "Netflix プリペイド 1,500円",  description: "Netflix JP prepaid card",                     category: "Streaming", pointsCost: 20,   faceValue: 1500,     faceCurrency: "JPY", emoji: "🎬", gradient: "linear-gradient(135deg, #e50914, #221f1f)", deliveryMethod: "email-code" },

  /* ═════════ CN — China (Hong Kong supplier) ═════════ */
  { id: "cn-wechat-50",      countryCode: "CN", supplierRegion: "Hong Kong", brand: "WeChat Pay",   name: "微信红包 50元",              description: "WeChat 红包 50元, instant credit",             category: "MobilePay", pointsCost: 14,   faceValue: 50,       faceCurrency: "CNY", emoji: "💬", gradient: "linear-gradient(135deg, #07c160, #004d1e)", deliveryMethod: "in-app-voucher" },
  { id: "cn-alipay-100",     countryCode: "CN", supplierRegion: "Hong Kong", brand: "Alipay",       name: "支付宝充值 100元",           description: "Alipay account top-up 100 CNY",                category: "MobilePay", pointsCost: 28,   faceValue: 100,      faceCurrency: "CNY", emoji: "💳", gradient: "linear-gradient(135deg, #1677ff, #002d6b)", deliveryMethod: "in-app-voucher" },
  { id: "cn-meituan-30",     countryCode: "CN", supplierRegion: "Hong Kong", brand: "Meituan",      name: "美团外卖券 30元",             description: "Meituan food delivery voucher",                category: "Food",      pointsCost: 10,   faceValue: 30,       faceCurrency: "CNY", emoji: "🥟", gradient: "linear-gradient(135deg, #ffc300, #806000)", deliveryMethod: "in-app-voucher" },
  { id: "cn-jd-150",         countryCode: "CN", supplierRegion: "Hong Kong", brand: "JD.com",       name: "京东 E-card 150元",          description: "JD.com store credit",                          category: "Shopping",  pointsCost: 40,   faceValue: 150,      faceCurrency: "CNY", emoji: "🛍️", gradient: "linear-gradient(135deg, #e1251b, #7a0e0a)", deliveryMethod: "email-code" },
  { id: "cn-didi-25",        countryCode: "CN", supplierRegion: "Hong Kong", brand: "DiDi",         name: "滴滴出行 25元",               description: "DiDi ride credit 25 CNY",                      category: "Transport", pointsCost: 10,   faceValue: 25,       faceCurrency: "CNY", emoji: "🚗", gradient: "linear-gradient(135deg, #ff6900, #663000)", deliveryMethod: "in-app-voucher" },
  { id: "cn-iqiyi",          countryCode: "CN", supplierRegion: "Hong Kong", brand: "iQiyi",        name: "爱奇艺 VIP 1个月",            description: "iQiyi VIP membership 1 month",                 category: "Streaming", pointsCost: 10,   faceValue: 40,       faceCurrency: "CNY", emoji: "📺", gradient: "linear-gradient(135deg, #00be06, #004d02)", deliveryMethod: "email-code" },

  /* ═════════ VN — Vietnam ═════════ */
  { id: "vn-grab-food-100k", countryCode: "VN", supplierRegion: "Vietnam",   brand: "Grab",         name: "GrabFood voucher 100k VND",  description: "100,000 VND off on GrabFood orders",           category: "Food",      pointsCost: 10,   faceValue: 100000,   faceCurrency: "VND", emoji: "🍲", gradient: "linear-gradient(135deg, #00b14f, #003c1b)", deliveryMethod: "in-app-voucher", isBestSeller: true, monthlyRedemptions: 512 },
  { id: "vn-grab-bike-50k",  countryCode: "VN", supplierRegion: "Vietnam",   brand: "Grab",         name: "GrabBike 50k VND",          description: "50,000 VND off a GrabBike ride",              category: "Transport", pointsCost: 10,   faceValue: 50000,    faceCurrency: "VND", emoji: "🏍️", gradient: "linear-gradient(135deg, #00b14f, #003c1b)", deliveryMethod: "in-app-voucher" },
  { id: "vn-shopee-200k",    countryCode: "VN", supplierRegion: "Vietnam",   brand: "Shopee VN",    name: "Shopee voucher 200k VND",    description: "Shopee VN 200k VND shopping voucher",          category: "Shopping",  pointsCost: 20,   faceValue: 200000,   faceCurrency: "VND", emoji: "🛒", gradient: "linear-gradient(135deg, #ee4d2d, #6e1c10)", deliveryMethod: "email-code" },
  { id: "vn-momo-150k",      countryCode: "VN", supplierRegion: "Vietnam",   brand: "Momo",         name: "Momo 150k VND 충전",         description: "Momo wallet top-up 150,000 VND",               category: "MobilePay", pointsCost: 14,   faceValue: 150000,   faceCurrency: "VND", emoji: "💜", gradient: "linear-gradient(135deg, #a50064, #4a002c)", deliveryMethod: "in-app-voucher" },
  { id: "vn-highlands",      countryCode: "VN", supplierRegion: "Vietnam",   brand: "Highlands Coffee", name: "Highlands 60k VND",      description: "Highlands Coffee 60,000 VND voucher",          category: "Coffee",    pointsCost: 10,   faceValue: 60000,    faceCurrency: "VND", emoji: "☕", gradient: "linear-gradient(135deg, #8b2d00, #3d1400)", deliveryMethod: "email-code" },

  /* ═════════ SG — Singapore ═════════ */
  { id: "sg-grab-5",         countryCode: "SG", supplierRegion: "Singapore", brand: "Grab",         name: "Grab S$5 voucher",           description: "Use on GrabFood, GrabCar, or GrabMart",        category: "Transport", pointsCost: 10,   faceValue: 5,        faceCurrency: "SGD", emoji: "🚕", gradient: "linear-gradient(135deg, #00b14f, #003c1b)", deliveryMethod: "in-app-voucher" },
  { id: "sg-foodpanda-10",   countryCode: "SG", supplierRegion: "Singapore", brand: "Foodpanda",    name: "Foodpanda S$10",             description: "S$10 off any Foodpanda order",                 category: "Food",      pointsCost: 14,   faceValue: 10,       faceCurrency: "SGD", emoji: "🐼", gradient: "linear-gradient(135deg, #d70f64, #5a0329)", deliveryMethod: "in-app-voucher" },
  { id: "sg-ntuc-20",        countryCode: "SG", supplierRegion: "Singapore", brand: "NTUC FairPrice", name: "FairPrice S$20",           description: "FairPrice supermarket e-voucher",              category: "Shopping",  pointsCost: 28,   faceValue: 20,       faceCurrency: "SGD", emoji: "🛒", gradient: "linear-gradient(135deg, #e30613, #6b0309)", deliveryMethod: "email-code" },
  { id: "sg-starbucks-sg",   countryCode: "SG", supplierRegion: "Singapore", brand: "Starbucks SG", name: "Starbucks S$6",              description: "Any drink Tall size",                          category: "Coffee",    pointsCost: 10,   faceValue: 6,        faceCurrency: "SGD", emoji: "☕", gradient: "linear-gradient(135deg, #006241, #1e3932)", deliveryMethod: "email-code" },

  /* ═════════ US (International USD-contract fallback) ═════════ */
  { id: "us-starbucks-10",   countryCode: "US", supplierRegion: "USA",       brand: "Starbucks",    name: "Starbucks US$10",            description: "Starbucks eGift, redeemable at US stores",     category: "Coffee",    pointsCost: 14,   faceValue: 10,       faceCurrency: "USD", emoji: "☕", gradient: "linear-gradient(135deg, #006241, #1e3932)", deliveryMethod: "email-code" },
  { id: "us-amazon-25",      countryCode: "US", supplierRegion: "USA",       brand: "Amazon",       name: "Amazon US$25",               description: "Amazon.com eGift card",                        category: "Shopping",  pointsCost: 34,   faceValue: 25,       faceCurrency: "USD", emoji: "📦", gradient: "linear-gradient(135deg, #ff9900, #232f3e)", deliveryMethod: "email-code" },

  /* ═════════ 프리미엄 라인 — 모든 사용자 redeem 가능 (Tier 잠금 없음, 2026-05-06 결정 #6) ═════════ */
  { id: "kr-shilla-50k",     countryCode: "KR", supplierRegion: "Korea",     brand: "신라호텔",       name: "신라호텔 케이크 50,000원",   description: "신라호텔 패스트리 부티크 케이크 상품권",       category: "Shopping",  pointsCost: 70,   faceValue: 50000,    faceCurrency: "KRW", emoji: "🍰", gradient: "linear-gradient(135deg, #c9a96e, #5d4a2a)", deliveryMethod: "email-code" },
  { id: "vn-spa-luxury",     countryCode: "VN", supplierRegion: "Vietnam",   brand: "Park Hyatt Spa", name: "Park Hyatt Spa Day Pass",    description: "Park Hyatt Saigon Spa 데이패스 (실제 SKU 추후)",  category: "Beauty",    pointsCost: 80,   faceValue: 1500000,  faceCurrency: "VND", emoji: "💆", gradient: "linear-gradient(135deg, #d4af37, #5c4a1f)", deliveryMethod: "email-code" },
  { id: "kr-michelin",       countryCode: "KR", supplierRegion: "Korea",     brand: "Michelin Star",  name: "미쉐린 1스타 디너 1인",       description: "선정 식당 디너 코스 1인 (실제 파트너십 추후)", category: "Food",      pointsCost: 160,  faceValue: 200000,   faceCurrency: "KRW", emoji: "🍽️", gradient: "linear-gradient(135deg, #1e3a8a, #0a1535)", deliveryMethod: "email-code" },
];

/* ── Milestones ──
 * Cumulative booking count triggers. Fires once per milestone per user. */
export interface Milestone {
  key: "welcome" | "m10" | "m50" | "m100" | "m500";
  requiredBookings: number;
  bonusPoints: number;
  title: string;
  description: string;
  emoji: string;
}
export const MILESTONES: Milestone[] = [
  { key: "welcome", requiredBookings: 1,   bonusPoints: 3,     title: "First Booking",    description: "Your first DOTBIZ booking — welcome!",           emoji: "🎉" },
  { key: "m10",     requiredBookings: 10,  bonusPoints: 1,     title: "10 Bookings",      description: "You're getting the hang of it.",                  emoji: "🌱" },
  { key: "m50",     requiredBookings: 50,  bonusPoints: 5,     title: "50 Bookings",      description: "You're a booking pro.",                          emoji: "⭐" },
  { key: "m100",    requiredBookings: 100, bonusPoints: 15,    title: "100 Bookings",     description: "Century club. Unlocks Gold tier.",                emoji: "🎖️" },
  { key: "m500",    requiredBookings: 500, bonusPoints: 100,   title: "500 Bookings",     description: "Hall of Fame. Unlocks Platinum tier.",            emoji: "🏆" },
];

/* ── Tier system ──
 * Based on cumulative bookingCount. Multiplier applied on top of base earn. */
export type Tier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Emerald" | "Diamond";

export interface TierDef {
  name: Tier;
  /* ── 단순 매출 기반 임계값 (2026-05-06 결정) ──
   * 누적 매출(USD) 기준. booking count는 부가 정보로만 사용. */
  minRevenueUsd: number;
  maxRevenueUsd: number;     /* exclusive upper bound (Diamond = Infinity) */
  /* Legacy: minBookings / maxBookings — 기존 코드 호환용 (deprecated) */
  minBookings: number;
  maxBookings: number;
  multiplier: number;
  /* Refined palette — sophisticated rather than gamer-garish */
  color: string;             /* primary accent */
  colorSoft: string;         /* hero tint */
  gradient: string;          /* emblem + backdrop gradient */
  ring: string;              /* metal ring color */
  glow: string;              /* ambient glow */
  icon: string;              /* compact fallback emoji */
  tagline: string;           /* brand-style subtitle */
  globalPct: number;         /* % of global OPs in this tier */
  perks: string[];           /* membership benefits */
}

/* Refined 5-tier ladder — Bronze → Silver → Gold → Platinum → Diamond.
 * Colors chosen to evoke jewelry / premium metals, not gamer RGB. */
export const TIERS: TierDef[] = [
  {
    name: "Bronze",
    minRevenueUsd: 0, maxRevenueUsd: 10_000,
    minBookings: 0, maxBookings: 50,    /* legacy */
    multiplier: 1.0,
    color: "#a16b3f", colorSoft: "#a16b3f18",
    gradient: "linear-gradient(135deg, #d4a373, #a16b3f, #6d4424)",
    ring: "#c69266", glow: "#a16b3f33",
    icon: "🥉",
    tagline: "The beginning of a long journey",
    globalPct: 41,
    perks: ["1.0× ELS earn rate", "Standard support"],
  },
  {
    name: "Silver",
    minRevenueUsd: 10_000, maxRevenueUsd: 50_000,
    minBookings: 50, maxBookings: 200,    /* legacy */
    multiplier: 1.1,
    color: "#64748b", colorSoft: "#64748b18",
    gradient: "linear-gradient(135deg, #e2e8f0, #cbd5e1, #64748b)",
    ring: "#cbd5e1", glow: "#94a3b833",
    icon: "🥈",
    tagline: "Building a reputation",
    globalPct: 34,
    perks: ["1.1× ELS earn rate", "Priority email support", "Early promo access"],
  },
  {
    name: "Gold",
    minRevenueUsd: 50_000, maxRevenueUsd: 200_000,
    minBookings: 200, maxBookings: 500,    /* legacy */
    multiplier: 1.2,
    color: "#b8861b", colorSoft: "#eab30820",
    gradient: "linear-gradient(135deg, #fef3c7, #fbbf24, #b8861b)",
    ring: "#eab308", glow: "#eab30844",
    icon: "🥇",
    tagline: "A trusted name",
    globalPct: 18,
    perks: ["1.2× ELS earn rate", "Priority email + chat", "Exclusive hotel promos"],
  },
  {
    name: "Platinum",
    minRevenueUsd: 200_000, maxRevenueUsd: 500_000,
    minBookings: 500, maxBookings: 1000,    /* legacy */
    multiplier: 1.3,
    color: "#7c7aa7", colorSoft: "#8b9dc320",
    gradient: "linear-gradient(135deg, #e0e7ff, #a5b4fc, #6366f1)",
    ring: "#a5b4fc", glow: "#6366f144",
    icon: "💠",
    tagline: "Among the best",
    globalPct: 4,
    perks: ["1.3× ELS earn rate", "Dedicated account manager", "VIP room upgrades"],
  },
  {
    name: "Emerald",
    minRevenueUsd: 500_000, maxRevenueUsd: 1_000_000,
    minBookings: 1000, maxBookings: 1500,    /* legacy */
    multiplier: 1.4,
    color: "#059669", colorSoft: "#10b98120",
    gradient: "linear-gradient(135deg, #d1fae5, #6ee7b7, #059669)",
    ring: "#6ee7b7", glow: "#10b98155",
    icon: "💚",
    tagline: "Excellence in motion",
    globalPct: 2,
    perks: ["1.4× ELS earn rate", "Priority concierge support", "Premium hotel partnership"],
  },
  {
    name: "Diamond",
    minRevenueUsd: 1_000_000, maxRevenueUsd: Number.POSITIVE_INFINITY,
    minBookings: 1500, maxBookings: Number.POSITIVE_INFINITY,    /* legacy */
    multiplier: 1.5,
    color: "#0891b2", colorSoft: "#06b6d420",
    gradient: "linear-gradient(135deg, #ecfeff, #67e8f9, #0891b2)",
    ring: "#67e8f9", glow: "#06b6d455",
    icon: "💎",
    tagline: "Rarefied air · the top echelon",
    globalPct: 1,
    perks: ["1.5× ELS earn rate", "Dedicated concierge", "Invite-only events", "Bespoke room requests"],
  },
];

/* ──────────────────────────────────────────────────────────────────
 * Tier 단순 매출 기반 룩업 (2026-05-06 결정)
 *
 * 임계값 (누적 매출 USD):
 *   Bronze    $0 ~ $9,999
 *   Silver    $10,000 ~ $49,999
 *   Gold      $50,000 ~ $199,999
 *   Platinum  $200,000 ~ $999,999
 *   Diamond   $1,000,000+
 * ────────────────────────────────────────────────────────────────── */
export function tierForRevenue(revenueUsd: number): TierDef {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (revenueUsd >= TIERS[i].minRevenueUsd) return TIERS[i];
  }
  return TIERS[0];
}

/* ──────────────────────────────────────────────────────────────────
 * Tier별 차등 강등 조건 (2026-05-06 결정)
 *
 * 3개월 단위 점검. 분기 매출이 아래 임계값 미만이면 한 단계 강등.
 * Bronze는 이미 최저이므로 강등 없음.
 *
 * "갈수록 어려워지도록" — 위 tier일수록 유지에 더 큰 매출 필요.
 * 임계값은 진입 매출의 25%로 설정 (분기 = 연 1/4).
 * ────────────────────────────────────────────────────────────────── */
export const TIER_QUARTERLY_RETENTION_USD: Record<Tier, number> = {
  Bronze: 0,           /* 강등 없음 */
  Silver: 2_500,       /* $10K × 25% */
  Gold: 12_500,        /* $50K × 25% */
  Platinum: 50_000,    /* $200K × 25% */
  Emerald: 125_000,    /* $500K × 25% */
  Diamond: 250_000,    /* $1M × 25% */
};

/** 강등 grace 기간 — 1단계 강등 시 30일 회복 기회 */
export const TIER_DEMOTION_GRACE_DAYS = 30;

/* ──────────────────────────────────────────────────────────────────
 * 로얄티 스탬프 활동 기준 (2026-05-06 결정)
 *
 * 1-Year Anniversary 같은 로얄티 스탬프는 단순 가입기간이 아니라
 * 최근 3개월 활동(매출)이 tier 강등 임계값 이상일 때만 부여.
 *
 * 강등조건과 동일 — 갈수록 어려워지도록.
 * ────────────────────────────────────────────────────────────────── */
export const STAMP_ACTIVITY_REQUIREMENT_USD: Record<Tier, number> = {
  ...TIER_QUARTERLY_RETENTION_USD,    /* 강등조건과 동일 값 */
};

/** 로얄티 스탬프 활동 기준 충족 여부 — 부여/유지 검사에 사용 */
export function isLoyaltyStampEligible(
  currentTier: Tier,
  last3moRevenueUsd: number,
): boolean {
  return last3moRevenueUsd >= STAMP_ACTIVITY_REQUIREMENT_USD[currentTier];
}

/* ── 레거시: bookingCount 단일축 (호환용) ──
 * 신규 코드는 tierForComposite() / tierForRolling() 사용 권장. */
export function tierFor(bookingCount: number): TierDef {
  for (let i = TIERS.length - 1; i >= 0; i--) if (bookingCount >= TIERS[i].minBookings) return TIERS[i];
  return TIERS[0];
}
export function nextTier(bookingCount: number): TierDef | null {
  const current = tierFor(bookingCount);
  const idx = TIERS.findIndex(t => t.name === current.name);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

/* ══════════════════════════════════════════════════════════════════════
 * 복합 Tier 스코어 — booking 수 + 매출 가산
 *
 * 결정 (2026-04):
 *   • 단일 booking count는 부적절 (수량은 많지만 매출 적은 OP가 Diamond되는 역설)
 *   • 복합 지표: weighted average of normalized booking + normalized revenue
 *   • 가중치는 어드민에서 튜닝 가능, 기본 70:30 (수량 우선, 단가 보정)
 *
 * 매출 정규화: USD 환산 매출을 booking-equivalent 단위로 변환.
 *   "USD per booking-equivalent" (USD_PER_BOOKING_EQ) 상수로 환산.
 *   기본 $200 (잠정 — 마케팅·CFO 협의 후 확정).
 *   예) revenue $20,000 → 100 booking-eq
 * ══════════════════════════════════════════════════════════════════════ */
export interface CompositeTierWeights {
  bookingWeight: number;   /* 0..1 */
  revenueWeight: number;   /* 0..1, bookingWeight + revenueWeight = 1 */
  usdPerBookingEq: number; /* 매출 정규화 환산 단가 (USD) */
}

export const DEFAULT_COMPOSITE_WEIGHTS: CompositeTierWeights = {
  bookingWeight: 0.7,
  revenueWeight: 0.3,
  usdPerBookingEq: 200,    /* 잠정 — 글로벌 평균 객단가에 맞춰 추후 결정 */
};

export interface TierScoreInputs {
  bookingCount: number;
  totalRevenueUsd: number;
}

/** 복합 스코어 계산 — booking + revenue를 booking-equivalent 단위로 합성. */
export function compositeTierScore(
  inputs: TierScoreInputs,
  weights: CompositeTierWeights = DEFAULT_COMPOSITE_WEIGHTS,
): number {
  const revenueAsBookingEq = inputs.totalRevenueUsd / weights.usdPerBookingEq;
  return inputs.bookingCount * weights.bookingWeight + revenueAsBookingEq * weights.revenueWeight;
}

/** 복합 스코어 기반 Tier 산정 (강등 미적용 — 평생 누적). */
export function tierForComposite(
  inputs: TierScoreInputs,
  weights: CompositeTierWeights = DEFAULT_COMPOSITE_WEIGHTS,
): TierDef {
  const score = compositeTierScore(inputs, weights);
  return tierFor(score);
}

/* ══════════════════════════════════════════════════════════════════════
 * Rolling 12-month + Status Retention (강등 정책)
 *
 * 결정 (2026-04):
 *   • 강등 정책 도입. 휴면 OP의 영구 Diamond 부채 방지.
 *   • 산정: 직전 N개월(기본 12)의 booking + revenue 복합 스코어
 *   • Status Retention: 작년 도달 tier에서 한 단계 떨어졌을 때
 *     "grace period"(기본 12개월) 동안 이전 tier 유지.
 *     2단계 이상 떨어지면 즉시 강등.
 *
 * 사용:
 *   const rank = tierForRolling(state, config);
 *   rank.tier        ← 실제 적용 tier (retention 반영)
 *   rank.rawTier     ← retention 미적용 raw 결과
 *   rank.isRetained  ← grace 효과로 유지 중인지
 * ══════════════════════════════════════════════════════════════════════ */
export interface RollingTierConfig {
  /** Rolling 윈도우 길이 (개월). 기본 12. */
  windowMonths: number;
  /** Status retention grace 길이 (개월). 0이면 즉시 강등. */
  gracePeriodMonths: number;
  /** 복합 스코어 가중치. */
  weights: CompositeTierWeights;
  /** 강등 활성화 여부. false면 평생 최고 tier 유지 (legacy 호환). */
  enabled: boolean;
}

export const DEFAULT_ROLLING_CONFIG: RollingTierConfig = {
  windowMonths: 12,
  gracePeriodMonths: 12,
  weights: DEFAULT_COMPOSITE_WEIGHTS,
  enabled: true,
};

export interface RollingTierResult {
  tier: TierDef;          /* 적용 tier (retention 반영) */
  rawTier: TierDef;       /* 12mo 스코어로 산정한 원본 */
  retainedTier: TierDef | null;  /* grace로 유지 중인 이전 tier */
  isRetained: boolean;    /* retention 효과 적용됐는지 */
  isDemotion: boolean;    /* 작년보다 강등됐는지 */
  score: number;          /* 12mo 복합 스코어 */
  retainedUntil: string | null;
}

export function tierForRolling(
  state: Pick<UserPointsState, "last12moBookings" | "last12moRevenueUsd" | "totalRevenueUsd" | "bookingCount" | "retainedTier" | "retainedUntil">,
  config: RollingTierConfig = DEFAULT_ROLLING_CONFIG,
): RollingTierResult {
  /* enabled = false → 평생 누적으로 산정 (legacy) */
  if (!config.enabled) {
    const lifetime = tierForComposite(
      { bookingCount: state.bookingCount, totalRevenueUsd: state.totalRevenueUsd },
      config.weights,
    );
    return {
      tier: lifetime, rawTier: lifetime, retainedTier: null,
      isRetained: false, isDemotion: false,
      score: compositeTierScore({ bookingCount: state.bookingCount, totalRevenueUsd: state.totalRevenueUsd }, config.weights),
      retainedUntil: null,
    };
  }

  const score = compositeTierScore(
    { bookingCount: state.last12moBookings, totalRevenueUsd: state.last12moRevenueUsd },
    config.weights,
  );
  const rawTier = tierFor(score);
  const retainedTierName = state.retainedTier;
  const now = new Date().toISOString().slice(0, 10);
  const retentionActive = !!(retainedTierName && state.retainedUntil && state.retainedUntil > now);

  if (!retentionActive) {
    return {
      tier: rawTier, rawTier, retainedTier: null,
      isRetained: false, isDemotion: false, score,
      retainedUntil: null,
    };
  }

  /* retention 활성: grace 동안은 retainedTier 유지, 단 raw가 retained보다 높으면 raw 사용 */
  const retained = TIERS.find(t => t.name === retainedTierName) || rawTier;
  const retainedIdx = TIERS.findIndex(t => t.name === retained.name);
  const rawIdx = TIERS.findIndex(t => t.name === rawTier.name);
  const useRetained = retainedIdx > rawIdx;
  return {
    tier: useRetained ? retained : rawTier,
    rawTier,
    retainedTier: retained,
    isRetained: useRetained,
    isDemotion: rawIdx < retainedIdx,
    score,
    retainedUntil: state.retainedUntil || null,
  };
}

/* ══════════════════════════════════════════════════════════════════════
 * Tier 도달 보상 정책 (이중보상 제거)
 *
 * 결정 (2026-04):
 *   • Tier 도달 = Stamp 부여 (tier-silver / tier-gold / tier-platinum / tier-diamond)
 *     보상은 Stamp의 bonusEls (희귀도 기반) 일원화.
 *   • Tier 자체는 "지속 혜택"만 — multiplier (1.0× ~ 1.5×) + perks
 *   • 별도의 "Welcome to Silver! +N ELS" 일회성 보너스 알림 금지.
 *
 * 즉, Tier-up 순간 사용자가 받는 것:
 *   1) 이 booking부터 적용되는 새 multiplier (지속)
 *   2) tier-* Stamp + Stamp의 bonusEls (1회성)
 *   ❌ 별도의 "tier 진급 축하 ELS" 없음
 * ══════════════════════════════════════════════════════════════════════ */
export const TIER_REACH_REWARD_POLICY = {
  /** Tier 도달 시 별도 ELS 일회성 보너스 지급하지 않음 (Stamp로 일원화). */
  oneTimeElsBonus: 0,
  /** Tier 도달 시 자동 Stamp 부여 (tier-silver/gold/...). */
  awardStamp: true,
  /** 향후 Tier 진급 전용 perk (예: 환영 쿠폰)는 여기 추가. 현재 비어있음. */
  perkUnlocks: [] as string[],
} as const;

/* ══════════════════════════════════════════════════════════════════════
 * Tier 잠금 상품 (Reward Unlock) 헬퍼
 *
 * 결정 (2026-04):
 *   • Multiplier 격차 미묘 보완책. Tier가 올라갈수록 "잠금 해제"되는 상품.
 *   • Bronze: 기본 카탈로그만 보임
 *   • Silver: + Streaming/Shopping 일부 잠금 해제
 *   • Gold:   + 프리미엄 상품권 (대형 e-commerce 등)
 *   • Platinum: + 호텔 부티크/스파 등 럭셔리 라인
 *   • Diamond:  + 미쉐린 디너 등 Apex Experience
 *   • 잠긴 상품은 "보이지만 클릭 시 잠금 표시" — 승급 동기 부여
 *   • 실제 SKU·매핑은 마케팅팀 협의 후 확정.
 * ══════════════════════════════════════════════════════════════════════ */

/** Tier 정렬 순서 — TIERS 배열 자체를 단일 진실 소스로 사용.
 * 신규 tier 추가 시 TIERS만 갱신하면 자동으로 반영됨 (별도 동기화 불필요). */
const TIER_ORDER: Tier[] = TIERS.map(t => t.name);

/** Tier rank 비교: a >= b 이면 true */
export function tierAtLeast(a: Tier, b: Tier): boolean {
  return TIER_ORDER.indexOf(a) >= TIER_ORDER.indexOf(b);
}

/** ── DEPRECATED (2026-05-06 결정 #6 — Shop tier 잠금 기능 삭제) ──
 * 모든 사용자가 모든 상품 redeem 가능. 잠금 X.
 * 호출 호환을 위해 함수 시그니처는 유지하되 항상 true 반환. */
export function canRedeemProduct(_userTier: Tier, _product: RewardProduct): boolean {
  return true;
}

/** @deprecated — Tier 잠금 기능 삭제됨. 빈 결과 반환. */
export function lockedProductsByTier(_userTier: Tier, _products: RewardProduct[]): Record<Tier, RewardProduct[]> {
  return { Bronze: [], Silver: [], Gold: [], Platinum: [], Emerald: [], Diamond: [] };
}

/* ══════════════════════════════════════════════════════════════════════
 * TIER DIVISIONS — LoL-style sub-ranks within each tier (III → II → I)
 *
 * Each tier is split into 3 divisions. Booking within the tier advances
 * the OP through the divisions. Moving from Tier-I to the next tier's
 * III is the "promotion" moment.
 *
 * Intentionally NOT called "Challenger/Grandmaster" to avoid esports
 * connotations — we use Roman numerals which feel more like watchmaker
 * complications or luxury membership levels.
 * ══════════════════════════════════════════════════════════════════════ */
export type Division = "III" | "II" | "I";

export interface TierRank {
  tier: TierDef;
  division: Division;
  /* Progress within current division (0..1) */
  progressInDivision: number;
  bookingsToNextDivision: number;
  /* Label of what's next ("Silver II" or "Promote to Gold") */
  nextLabel: string;
  /* Simulated global ranking */
  rank: number;
  totalOps: number;
  percentile: number;    /* e.g. 12 means "top 12%" */
}

/* Simulated global OP population for percentile calculations */
export const GLOBAL_OP_POPULATION = 847;

export function tierDivisionFor(bookingCount: number): TierRank {
  const tier = tierFor(bookingCount);
  const tierSpan = (tier.maxBookings === Number.POSITIVE_INFINITY ? tier.minBookings * 2 : tier.maxBookings) - tier.minBookings;
  const divSize = tierSpan / 3;
  const offset = bookingCount - tier.minBookings;
  /* Division assignment: III = lowest band, I = highest band */
  let division: Division;
  let divStart: number;
  if (offset < divSize)          { division = "III"; divStart = tier.minBookings; }
  else if (offset < 2 * divSize) { division = "II";  divStart = tier.minBookings + divSize; }
  else                           { division = "I";   divStart = tier.minBookings + 2 * divSize; }

  const progressInDivision = Math.min(1, (bookingCount - divStart) / divSize);
  const bookingsToNextDivision = Math.max(0, Math.ceil(divStart + divSize - bookingCount));

  let nextLabel: string;
  if (division === "I") {
    const nt = nextTier(bookingCount);
    nextLabel = nt ? `Promote to ${nt.name}` : "Apex — no further rank";
  } else {
    const nextDiv: Division = division === "III" ? "II" : "I";
    nextLabel = `${tier.name} ${nextDiv}`;
  }

  /* Percentile simulation: log-ish distribution mapped so:
   *   Bronze III (0 bookings)         → bottom 100%
   *   Silver III (50)                  → top ~60%
   *   Gold III (200)                   → top ~22%
   *   Platinum III (500)               → top ~6%
   *   Diamond III (1500)               → top ~1%
   */
  const anchors: Array<[number, number]> = [
    [0, 100], [10, 85], [50, 60], [100, 45], [200, 22], [350, 13],
    [500, 6], [1000, 2.5], [1500, 1], [3000, 0.3], [10000, 0.1],
  ];
  let percentile = 100;
  for (let i = 1; i < anchors.length; i++) {
    const [x1, y1] = anchors[i - 1];
    const [x2, y2] = anchors[i];
    if (bookingCount <= x2) {
      const t = (bookingCount - x1) / (x2 - x1);
      percentile = y1 + (y2 - y1) * t;
      break;
    }
    if (i === anchors.length - 1) percentile = y2;
  }
  percentile = Math.max(0.1, Math.round(percentile * 10) / 10);

  const rank = Math.max(1, Math.round((percentile / 100) * GLOBAL_OP_POPULATION));

  return {
    tier, division, progressInDivision, bookingsToNextDivision, nextLabel,
    rank, totalOps: GLOBAL_OP_POPULATION, percentile,
  };
}

/* ── Per-user points state ──
 * Keyed by email. Seeded with realistic demo data per OP.
 * In production: rewards_points_state table (row per user). */
export interface UserPointsState {
  userEmail: string;
  customerCompanyId: string;
  countryCode: CountryCode;
  balance: number;
  totalEarned: number;
  totalUsed: number;
  bookingCount: number;
  milestonesReached: string[]; /* e.g. ["welcome", "m10"] */
  joinedAt: string;
  /* ── Tier 산정용 추가 필드 (2026-04 신규) ──
   * Tier는 단일축(누적 booking 수)이 아닌 booking + 매출 복합 지표로 산정.
   * 강등(롤링 12개월)을 위해 최근 12개월 윈도우 별도 추적.
   * 신규 OP 시드는 0으로 두고 booking 거래 시 누적. */
  totalRevenueUsd: number;       /* 평생 누적 매출 (USD 환산) */
  last12moBookings: number;      /* 직전 12개월 booking 수 */
  last12moRevenueUsd: number;    /* 직전 12개월 매출 (USD) */
  /* ── 분기 활동 (2026-05-06 결정 — Tier별 차등 강등 + 스탬프 활동 기준) ── */
  last3moBookings: number;       /* 직전 3개월 booking 수 */
  last3moRevenueUsd: number;     /* 직전 3개월 매출 (USD) — 강등 점검용 */
  /** Status retention — Tier 강등 시 1년 grace 부여한 OP는 retention된 tier가 표시됨.
   * null이면 grace 없음. */
  retainedTier?: Tier | null;
  retainedUntil?: string | null;
}

/* ── Mock 시드 — 누적 booking 수 × 평균 객단가(USD)로 totalRevenueUsd 산출.
 * 평균 객단가는 OP별 다르게 설정해 "수량은 적지만 매출 큰" 사례 시뮬레이션:
 *   master:   84건 × $250 = $21,000   (KR 일반)
 *   op:       47건 × $180 = $8,460
 *   kevin:    18건 × $620 = $11,160   ← 수량 적지만 럭셔리 위주
 *   gotadi:   62건 × $130 = $8,060    (VN 평균 단가 낮음)
 * 직전 12개월(rolling)은 누적의 60-80% 가정.
 */
export const userPointsState: Record<string, UserPointsState> = {
  /* TravelCo (Korea) */
  "master@dotbiz.com":       { userEmail: "master@dotbiz.com",       customerCompanyId: "comp-001", countryCode: "KR", balance: 185,  totalEarned: 242,  totalUsed: 57,  bookingCount: 84,  milestonesReached: ["welcome", "m10", "m50"], joinedAt: "2024-03-15", totalRevenueUsd: 21000, last12moBookings: 64, last12moRevenueUsd: 16800, last3moBookings: 18, last3moRevenueUsd: 4200 },
  "op@dotbiz.com":           { userEmail: "op@dotbiz.com",           customerCompanyId: "comp-001", countryCode: "KR", balance: 96,   totalEarned: 132,  totalUsed: 36,  bookingCount: 47,  milestonesReached: ["welcome", "m10"],         joinedAt: "2024-04-02", totalRevenueUsd: 8460,  last12moBookings: 38, last12moRevenueUsd: 7100,  last3moBookings: 11, last3moRevenueUsd: 1900 },
  "kevin@travelco.com":      { userEmail: "kevin@travelco.com",      customerCompanyId: "comp-001", countryCode: "KR", balance: 42,   totalEarned: 55,   totalUsed: 13,  bookingCount: 18,  milestonesReached: ["welcome", "m10"],         joinedAt: "2025-06-10", totalRevenueUsd: 11160, last12moBookings: 18, last12moRevenueUsd: 11160, last3moBookings: 5,  last3moRevenueUsd: 3100 },
  "emma@travelco.com":       { userEmail: "emma@travelco.com",       customerCompanyId: "comp-001", countryCode: "KR", balance: 28,   totalEarned: 31,   totalUsed: 3,   bookingCount: 11,  milestonesReached: ["welcome", "m10"],         joinedAt: "2025-09-08", totalRevenueUsd: 2200,  last12moBookings: 11, last12moRevenueUsd: 2200,  last3moBookings: 4,  last3moRevenueUsd: 800 },
  "daniel@travelco.com":     { userEmail: "daniel@travelco.com",     customerCompanyId: "comp-001", countryCode: "KR", balance: 8,    totalEarned: 8,    totalUsed: 0,   bookingCount: 2,   milestonesReached: ["welcome"],                 joinedAt: "2025-11-20", totalRevenueUsd: 360,   last12moBookings: 2,  last12moRevenueUsd: 360,   last3moBookings: 1,  last3moRevenueUsd: 180 },
  /* Asia Tours (Korea, PREPAY) */
  "prepay@dotbiz.com":       { userEmail: "prepay@dotbiz.com",       customerCompanyId: "comp-002", countryCode: "KR", balance: 64,   totalEarned: 89,   totalUsed: 25,  bookingCount: 32,  milestonesReached: ["welcome", "m10"],         joinedAt: "2024-06-01", totalRevenueUsd: 7680,  last12moBookings: 24, last12moRevenueUsd: 5800,  last3moBookings: 7,  last3moRevenueUsd: 1700 },
  "hiroshi@asiatours.com":   { userEmail: "hiroshi@asiatours.com",   customerCompanyId: "comp-002", countryCode: "KR", balance: 18,   totalEarned: 22,   totalUsed: 4,   bookingCount: 9,   milestonesReached: ["welcome"],                 joinedAt: "2024-08-12", totalRevenueUsd: 1620,  last12moBookings: 6,  last12moRevenueUsd: 1100,  last3moBookings: 1,  last3moRevenueUsd: 200 },
  /* GOTADI (Vietnam) */
  "gotadi@dotbiz.com":       { userEmail: "gotadi@dotbiz.com",       customerCompanyId: "comp-010", countryCode: "VN", balance: 112,  totalEarned: 165,  totalUsed: 53,  bookingCount: 62,  milestonesReached: ["welcome", "m10", "m50"], joinedAt: "2024-09-15", totalRevenueUsd: 8060,  last12moBookings: 48, last12moRevenueUsd: 6400,  last3moBookings: 14, last3moRevenueUsd: 1900 },
  "mai@gotadi.com":          { userEmail: "mai@gotadi.com",          customerCompanyId: "comp-010", countryCode: "VN", balance: 56,   totalEarned: 73,   totalUsed: 17,  bookingCount: 29,  milestonesReached: ["welcome", "m10"],         joinedAt: "2024-10-01", totalRevenueUsd: 3770,  last12moBookings: 22, last12moRevenueUsd: 2900,  last3moBookings: 6,  last3moRevenueUsd: 800 },
  "phong@gotadi.com":        { userEmail: "phong@gotadi.com",        customerCompanyId: "comp-010", countryCode: "VN", balance: 38,   totalEarned: 48,   totalUsed: 10,  bookingCount: 21,  milestonesReached: ["welcome", "m10"],         joinedAt: "2024-10-01", totalRevenueUsd: 2730,  last12moBookings: 18, last12moRevenueUsd: 2400,  last3moBookings: 5,  last3moRevenueUsd: 700 },
  "linh@gotadi.com":         { userEmail: "linh@gotadi.com",         customerCompanyId: "comp-010", countryCode: "VN", balance: 22,   totalEarned: 22,   totalUsed: 0,   bookingCount: 8,   milestonesReached: ["welcome"],                 joinedAt: "2025-02-14", totalRevenueUsd: 1040,  last12moBookings: 8,  last12moRevenueUsd: 1040,  last3moBookings: 2,  last3moRevenueUsd: 260 },
  /* VVC (Vietnam, PREPAY) */
  "vvc@dotbiz.com":          { userEmail: "vvc@dotbiz.com",          customerCompanyId: "comp-011", countryCode: "VN", balance: 48,   totalEarned: 62,   totalUsed: 14,  bookingCount: 25,  milestonesReached: ["welcome", "m10"],         joinedAt: "2025-01-20", totalRevenueUsd: 3250,  last12moBookings: 25, last12moRevenueUsd: 3250,  last3moBookings: 6,  last3moRevenueUsd: 800 },
  /* Accounting (demo) */
  "accounting@dotbiz.com":   { userEmail: "accounting@dotbiz.com",   customerCompanyId: "comp-001", countryCode: "KR", balance: 0,    totalEarned: 0,    totalUsed: 0,   bookingCount: 0,   milestonesReached: [],                          joinedAt: "2025-11-20", totalRevenueUsd: 0,     last12moBookings: 0,  last12moRevenueUsd: 0,     last3moBookings: 0,  last3moRevenueUsd: 0 },
};

/* ── ELS (Ellis Coin) constants ──
 * ELS is the coin-style rebrand of OP personal points. 1 ELS = 1 USD (peg).
 *
 * NON-TRANSFERABLE by design: ELS is personal, tied to the earning OP.
 * No P2P send/receive — each OP's wallet is isolated, preventing
 * gift-laundering / vote-trading between colleagues and keeping the
 * reward pool attribution clean. */
export const ELS_USD_PEG = 1;                   /* 1 ELS = 1 USD */

/* ELS 만료 정책 — 부채 관리 + 활성 사용 장려 차원.
 * Earn-Booking 거래로부터 N개월 후 미사용 ELS는 자동 만료.
 * Transfer·Stamp 보너스도 동일 규칙 적용.
 * 24개월 = 업계 표준 (항공마일 1-3년, 백화점 포인트 5년 등 평균).
 *
 * 이 값은 ELS_EXPIRY_POLICY 승인 항목으로 CFO→CEO 결재 후 변경. */
export const ELS_EXPIRY_MONTHS = 24;

/** 한 거래(=earn)의 만료일 반환. */
export function elsExpiryDate(earnedDate: string): string {
  const d = new Date(earnedDate);
  d.setMonth(d.getMonth() + ELS_EXPIRY_MONTHS);
  return d.toISOString().slice(0, 10);
}

/** 만료 임박(default: 90일 이내) ELS 합계 계산. */
export function expiringElsFor(userEmail: string, daysThreshold = 90): { amount: number; soonestDate: string | null } {
  const now = new Date();
  const threshold = new Date(now.getTime() + daysThreshold * 86400000);
  let amount = 0;
  let soonest: string | null = null;
  for (const t of pointsTransactions) {
    if (t.userEmail !== userEmail) continue;
    if (t.amount <= 0) continue;    /* only positive earn transactions can expire */
    const exp = elsExpiryDate(t.date);
    const expD = new Date(exp);
    if (expD >= now && expD <= threshold) {
      amount += t.amount;
      if (!soonest || exp < soonest) soonest = exp;
    }
  }
  return { amount, soonestDate: soonest };
}

/* ══════════════════════════════════════════════════════════════════════
 * STAMPS — passport-style achievement trail
 *
 * Stamps are immutable footprints of an OP's journey. Each stamp is a
 * one-time event (unlike tiers which can go up/down with activity). They
 * derive from the user's state + transaction history so we don't have to
 * maintain a separate ledger — each call to `earnedStampsFor` produces
 * the same result for the same inputs.
 *
 * Categories:
 *   🎯 First-times   (first booking, first redeem, first send, first receive)
 *   🏆 Milestones    (10 / 50 / 100 / 500 bookings)
 *   👑 Tiers         (reach Silver / Gold / Platinum)
 *   🌍 Explorer      (first international booking, 5 countries booked)
 *   🔥 Habits        (big spender, loyal — anniversary)
 * ══════════════════════════════════════════════════════════════════════ */

export type StampCategory = "First" | "Milestone" | "Tier" | "Explorer" | "Habit";
export type StampRarity = "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";

export interface StampDef {
  id: string;
  category: StampCategory;
  rarity: StampRarity;
  emoji: string;
  title: string;
  hint: string;                /* how to earn (public) */
  accent: string;              /* stamp ink color */
  /* Social proof (seeded pct of global OPs who have earned this) — tunes the
   * "conquest" feeling; Mythic should be <1%, Legendary <5%, Epic <15%. */
  globalEarnedPct: number;
  /* One-time ELS bonus credited the moment the stamp is earned.
   * Rarity-scaled: Common 5 · Rare 15 · Epic 50 · Legendary 200 · Mythic 1000.
   * These stack with booking earn + transfers — pure upside. */
  bonusEls: number;
}

/* Standard reward by rarity (used for calc + UI hints) */
export const STAMP_BONUS_BY_RARITY: Record<StampRarity, number> = {
  Common:    5,
  Rare:      15,
  Epic:      50,
  Legendary: 200,
  Mythic:    1000,
};

/* Rarity metadata — ring style, glow, chip color */
export const RARITY_META: Record<StampRarity, { label: string; color: string; ringShadow: string; order: number }> = {
  Common:    { label: "Common",    color: "#94a3b8", ringShadow: "0 0 0 2px #94a3b8",                                                            order: 1 },
  Rare:      { label: "Rare",      color: "#3b82f6", ringShadow: "0 0 0 2px #3b82f6, 0 0 12px #3b82f655",                                        order: 2 },
  Epic:      { label: "Epic",      color: "#a855f7", ringShadow: "0 0 0 2px #a855f7, 0 0 16px #a855f766",                                        order: 3 },
  Legendary: { label: "Legendary", color: "#eab308", ringShadow: "0 0 0 2px #eab308, 0 0 20px #eab30877, 0 0 32px #eab30833",                    order: 4 },
  Mythic:    { label: "Mythic",    color: "#FF6000", ringShadow: "0 0 0 2px #FF6000, 0 0 24px #FF600088, 0 0 40px #EF476F55, 0 0 60px #FFD16633", order: 5 },
};

/* ══════════════════════════════════════════════════════════════════════
 * STAMP CATALOG — tuned for "정복감" (conquest feeling)
 *
 * Philosophy:
 *   • First-times are easy entry drugs (4 stamps, all COMMON)
 *   • Milestones go 10 → 50 → 250 → 1,000 → 5,000 → 10,000 bookings.
 *     A 1,000-booking single OP is already legendary territory.
 *   • Tier stamps go Silver → Gold → Platinum → Diamond.
 *   • Explorer stamps reward geography diversification.
 *   • Habit stamps reward loyalty (1Y → 3Y → 5Y → 10Y) and big spending.
 *
 * The point: OPs should NEVER be able to 100% the passport in a few
 * months. Some stamps (Mythic) should take 5+ years of hard loyalty.
 * That's what makes them fight to book every trip through us.
 * ══════════════════════════════════════════════════════════════════════ */
export const STAMPS: StampDef[] = [
  /* ── First-times (all Common — entry-level onboarding) ── */
  { id: "first-booking",  category: "First",     rarity: "Common",    emoji: "🎊", title: "First Booking",       hint: "Complete your very first booking",                 accent: "#FF6000", globalEarnedPct: 94,  bonusEls: 5 },
  { id: "first-redeem",   category: "First",     rarity: "Common",    emoji: "🎁", title: "First Redeem",        hint: "Spend ELS on your first reward",                   accent: "#FF6000", globalEarnedPct: 71,  bonusEls: 5 },
  { id: "first-review",   category: "First",     rarity: "Rare",      emoji: "📝", title: "First Review",        hint: "Write your first hotel review",                    accent: "#118AB2", globalEarnedPct: 18,  bonusEls: 15 },

  /* ── Milestones (the grind — this is where OPs compete) ── */
  { id: "m10",            category: "Milestone", rarity: "Common",    emoji: "🌱", title: "Rookie",              hint: "Reach 10 cumulative bookings",                     accent: "#06D6A0", globalEarnedPct: 68,  bonusEls: 5 },
  { id: "m50",            category: "Milestone", rarity: "Rare",      emoji: "⭐", title: "Regular",             hint: "Reach 50 cumulative bookings",                     accent: "#FFD166", globalEarnedPct: 34,  bonusEls: 15 },
  { id: "m250",           category: "Milestone", rarity: "Epic",      emoji: "🔥", title: "Pro",                 hint: "Reach 250 cumulative bookings",                    accent: "#EF476F", globalEarnedPct: 11,  bonusEls: 50 },
  { id: "m1000",          category: "Milestone", rarity: "Legendary", emoji: "👑", title: "Master",              hint: "Reach 1,000 cumulative bookings",                  accent: "#8b5cf6", globalEarnedPct: 3,   bonusEls: 200 },
  { id: "m5000",          category: "Milestone", rarity: "Mythic",    emoji: "🏆", title: "Legend",              hint: "Reach 5,000 cumulative bookings — ultra-rare",     accent: "#FF6000", globalEarnedPct: 0.4, bonusEls: 1000 },
  { id: "m10000",         category: "Milestone", rarity: "Mythic",    emoji: "⚔️", title: "Immortal",            hint: "Reach 10,000 bookings — fewer than 10 OPs ever",   accent: "#EF476F", globalEarnedPct: 0.1, bonusEls: 1000 },

  /* ── Tiers ── */
  { id: "tier-silver",    category: "Tier",      rarity: "Rare",      emoji: "🥈", title: "Silver Tier",         hint: "Earn 1.1× multiplier (50 bookings)",               accent: "#94a3b8", globalEarnedPct: 34,  bonusEls: 15 },
  { id: "tier-gold",      category: "Tier",      rarity: "Epic",      emoji: "🥇", title: "Gold Tier",           hint: "Earn 1.2× multiplier (200 bookings)",              accent: "#eab308", globalEarnedPct: 13,  bonusEls: 50 },
  { id: "tier-platinum",  category: "Tier",      rarity: "Legendary", emoji: "💠", title: "Platinum Tier",       hint: "Earn 1.3× multiplier (500 bookings)",              accent: "#8b5cf6", globalEarnedPct: 5,   bonusEls: 200 },
  { id: "tier-diamond",   category: "Tier",      rarity: "Mythic",    emoji: "💎", title: "Diamond Tier",        hint: "Exclusive 1.5× — reach 1,500 bookings",            accent: "#06D6A0", globalEarnedPct: 0.8, bonusEls: 1000 },

  /* ── Explorer (geographic diversification) ── */
  { id: "explorer-intl",  category: "Explorer",  rarity: "Common",    emoji: "✈️", title: "International Flyer", hint: "Book a hotel outside your home country",           accent: "#118AB2", globalEarnedPct: 62,  bonusEls: 5 },
  { id: "explorer-3ctry", category: "Explorer",  rarity: "Rare",      emoji: "🧭", title: "Triple Crown",        hint: "Book hotels in 3 different countries",             accent: "#118AB2", globalEarnedPct: 28,  bonusEls: 15 },
  { id: "explorer-5ctry", category: "Explorer",  rarity: "Epic",      emoji: "🌏", title: "Continental",         hint: "Book hotels in 5 different countries",             accent: "#118AB2", globalEarnedPct: 9,   bonusEls: 50 },
  { id: "explorer-all6",  category: "Explorer",  rarity: "Legendary", emoji: "🌍", title: "World Conqueror",     hint: "Book in ALL 6 supported countries — near impossible", accent: "#EF476F", globalEarnedPct: 1.2, bonusEls: 200 },

  /* ── Habits (long-game loyalty) ── */
  { id: "big-spender",    category: "Habit",     rarity: "Rare",      emoji: "🛍️", title: "Big Spender",         hint: "Redeem 100+ ELS total",                            accent: "#EF476F", globalEarnedPct: 19,  bonusEls: 15 },
  { id: "whale",          category: "Habit",     rarity: "Epic",      emoji: "🐋", title: "Whale",               hint: "Redeem 500+ ELS total",                            accent: "#118AB2", globalEarnedPct: 4,   bonusEls: 50 },
  { id: "voucher-hoard",  category: "Habit",     rarity: "Rare",      emoji: "🧧", title: "Voucher Collector",   hint: "Hold 5+ active vouchers at once",                  accent: "#FF6000", globalEarnedPct: 15,  bonusEls: 15 },
  { id: "anniversary-1y", category: "Habit",     rarity: "Common",    emoji: "🎂", title: "1-Year Anniversary",  hint: "Stay active for 1 full year",                      accent: "#EF476F", globalEarnedPct: 52,  bonusEls: 5 },
  { id: "loyal-3y",       category: "Habit",     rarity: "Epic",      emoji: "🏅", title: "3-Year Veteran",      hint: "Stay active for 3 years",                          accent: "#a855f7", globalEarnedPct: 12,  bonusEls: 50 },
  { id: "veteran-5y",     category: "Habit",     rarity: "Legendary", emoji: "🎖️", title: "5-Year Elite",        hint: "Stay active for 5 years",                          accent: "#eab308", globalEarnedPct: 3,   bonusEls: 200 },
  { id: "eternal-10y",    category: "Habit",     rarity: "Mythic",    emoji: "🗿", title: "Eternal",             hint: "10 years with DOTBIZ — legendary loyalty",         accent: "#FF6000", globalEarnedPct: 0.2, bonusEls: 1000 },

  /* ── Reviewer (new category — contribute to knowledge pool) ── */
  { id: "top-reviewer",   category: "Habit",     rarity: "Epic",      emoji: "✍️", title: "Top Reviewer",        hint: "Write 5 hotel reviews (quality-approved)",         accent: "#118AB2", globalEarnedPct: 7,   bonusEls: 50 },
  { id: "review-master",  category: "Habit",     rarity: "Legendary", emoji: "🏛️", title: "Review Master",       hint: "Write 25 approved hotel reviews",                  accent: "#a855f7", globalEarnedPct: 1.5, bonusEls: 200 },
];

export interface EarnedStamp {
  stamp: StampDef;
  earned: boolean;
  earnedAt?: string;      /* ISO date when the stamp was pressed */
  progress?: number;       /* 0..1 — user's current progress towards this stamp (for locked ones) */
  progressLabel?: string; /* e.g. "47 / 250 bookings" */
}

/* Derive earned stamps from a user's state.
 * We take a deterministic snapshot view: same user state → same stamp set.
 * For the prototype the earnedAt dates are computed from joinedAt + plausible
 * offsets so the passport looks lived-in. */
export function earnedStampsFor(userEmail: string): EarnedStamp[] {
  const u = userPointsState[userEmail];
  if (!u) return STAMPS.map(s => ({ stamp: s, earned: false, progress: 0 }));

  const joined = new Date(u.joinedAt);
  const addDays = (d: Date, days: number) => {
    const nd = new Date(d);
    nd.setDate(nd.getDate() + days);
    return nd.toISOString().slice(0, 10);
  };

  /* Derive from transaction history for first-times */
  const txs = pointsTransactions.filter(t => t.userEmail === userEmail);
  const firstBookingTx = txs.filter(t => t.type === "Earned-Checkout").sort((a, b) => a.date.localeCompare(b.date))[0];
  const firstRedeemTx  = txs.filter(t => t.type === "Used-Redeem").sort((a, b) => a.date.localeCompare(b.date))[0];

  const now = new Date();
  const yearsSinceJoin = (now.getTime() - joined.getTime()) / (365.25 * 86400000);

  /* Helpers for progress bars on locked stamps */
  const pctTowards = (current: number, target: number) => Math.min(1, Math.max(0, current / target));
  const labelBookings = (t: number) => `${u.bookingCount.toLocaleString()} / ${t.toLocaleString()} bookings`;
  const labelRedeem   = (t: number) => `${u.totalUsed.toLocaleString()} / ${t.toLocaleString()} ELS redeemed`;
  const labelYears    = (t: number) => `${yearsSinceJoin.toFixed(1)} / ${t} years`;

  return STAMPS.map(s => {
    let earned = false;
    let earnedAt: string | undefined;
    let progress = 0;
    let progressLabel: string | undefined;

    switch (s.id) {
      /* First-times */
      case "first-booking":
        earned = u.bookingCount >= 1;
        progress = pctTowards(u.bookingCount, 1);
        progressLabel = labelBookings(1);
        earnedAt = firstBookingTx?.date ?? (earned ? addDays(joined, 3) : undefined);
        break;
      case "first-redeem":
        earned = u.totalUsed > 0;
        progress = u.totalUsed > 0 ? 1 : 0;
        progressLabel = "Redeem once";
        earnedAt = firstRedeemTx?.date ?? (earned ? addDays(joined, 14) : undefined);
        break;
      /* Milestones (the grind) */
      case "m10":
        earned = u.bookingCount >= 10;      progress = pctTowards(u.bookingCount, 10);     progressLabel = labelBookings(10);
        earnedAt = earned ? addDays(joined, 45) : undefined; break;
      case "m50":
        earned = u.bookingCount >= 50;      progress = pctTowards(u.bookingCount, 50);     progressLabel = labelBookings(50);
        earnedAt = earned ? addDays(joined, 180) : undefined; break;
      case "m250":
        earned = u.bookingCount >= 250;     progress = pctTowards(u.bookingCount, 250);    progressLabel = labelBookings(250);
        earnedAt = earned ? addDays(joined, 500) : undefined; break;
      case "m1000":
        earned = u.bookingCount >= 1000;    progress = pctTowards(u.bookingCount, 1000);   progressLabel = labelBookings(1000);
        earnedAt = earned ? addDays(joined, 1200) : undefined; break;
      case "m5000":
        earned = u.bookingCount >= 5000;    progress = pctTowards(u.bookingCount, 5000);   progressLabel = labelBookings(5000);
        earnedAt = earned ? addDays(joined, 2400) : undefined; break;
      case "m10000":
        earned = u.bookingCount >= 10000;   progress = pctTowards(u.bookingCount, 10000);  progressLabel = labelBookings(10000);
        earnedAt = earned ? addDays(joined, 3600) : undefined; break;

      /* Tiers */
      case "tier-silver":
        earned = u.bookingCount >= 50;      progress = pctTowards(u.bookingCount, 50);     progressLabel = labelBookings(50);
        earnedAt = earned ? addDays(joined, 180) : undefined; break;
      case "tier-gold":
        earned = u.bookingCount >= 200;     progress = pctTowards(u.bookingCount, 200);    progressLabel = labelBookings(200);
        earnedAt = earned ? addDays(joined, 540) : undefined; break;
      case "tier-platinum":
        earned = u.bookingCount >= 500;     progress = pctTowards(u.bookingCount, 500);    progressLabel = labelBookings(500);
        earnedAt = earned ? addDays(joined, 900) : undefined; break;
      case "tier-diamond":
        earned = u.bookingCount >= 1500;    progress = pctTowards(u.bookingCount, 1500);   progressLabel = labelBookings(1500);
        earnedAt = earned ? addDays(joined, 1500) : undefined; break;

      /* Explorer — heuristic from booking count (real impl would count distinct countries booked) */
      case "explorer-intl":
        earned = u.bookingCount >= 10;      progress = pctTowards(u.bookingCount, 10);     progressLabel = "Book 1 abroad";
        earnedAt = earned ? addDays(joined, 60) : undefined; break;
      case "explorer-3ctry":
        earned = u.bookingCount >= 25;      progress = pctTowards(u.bookingCount, 25);     progressLabel = "3 countries";
        earnedAt = earned ? addDays(joined, 120) : undefined; break;
      case "explorer-5ctry":
        earned = u.bookingCount >= 50;      progress = pctTowards(u.bookingCount, 50);     progressLabel = "5 countries";
        earnedAt = earned ? addDays(joined, 200) : undefined; break;
      case "explorer-all6":
        earned = u.bookingCount >= 150;     progress = pctTowards(u.bookingCount, 150);    progressLabel = "All 6 countries";
        earnedAt = earned ? addDays(joined, 450) : undefined; break;

      /* Habits */
      case "big-spender":
        earned = u.totalUsed >= 100;        progress = pctTowards(u.totalUsed, 100);       progressLabel = labelRedeem(100);
        earnedAt = earned ? addDays(joined, 240) : undefined; break;
      case "whale":
        earned = u.totalUsed >= 500;        progress = pctTowards(u.totalUsed, 500);       progressLabel = labelRedeem(500);
        earnedAt = earned ? addDays(joined, 700) : undefined; break;
      case "voucher-hoard":
        /* Approximated: proxy via totalEarned since vouchersFor is loaded separately in UI */
        earned = u.totalEarned >= 60;        progress = pctTowards(u.totalEarned, 60);      progressLabel = "Hold 5+ active vouchers";
        earnedAt = earned ? addDays(joined, 300) : undefined; break;
      case "anniversary-1y":
        earned = yearsSinceJoin >= 1;       progress = pctTowards(yearsSinceJoin, 1);      progressLabel = labelYears(1);
        earnedAt = earned ? addDays(joined, 365) : undefined; break;
      case "loyal-3y":
        earned = yearsSinceJoin >= 3;       progress = pctTowards(yearsSinceJoin, 3);      progressLabel = labelYears(3);
        earnedAt = earned ? addDays(joined, 365 * 3) : undefined; break;
      case "veteran-5y":
        earned = yearsSinceJoin >= 5;       progress = pctTowards(yearsSinceJoin, 5);      progressLabel = labelYears(5);
        earnedAt = earned ? addDays(joined, 365 * 5) : undefined; break;
      case "eternal-10y":
        earned = yearsSinceJoin >= 10;      progress = pctTowards(yearsSinceJoin, 10);     progressLabel = labelYears(10);
        earnedAt = earned ? addDays(joined, 365 * 10) : undefined; break;

      /* Reviewer stamps — uses approvedReviewsFor count (declared in reviews.ts, called lazily) */
      case "first-review": {
        const n = reviewCountFor(userEmail);
        earned = n >= 1;
        progress = pctTowards(n, 1);
        progressLabel = `${n} / 1 reviews`;
        earnedAt = earned ? addDays(joined, 90) : undefined;
        break;
      }
      case "top-reviewer": {
        const n = reviewCountFor(userEmail);
        earned = n >= 5;
        progress = pctTowards(n, 5);
        progressLabel = `${n} / 5 reviews`;
        earnedAt = earned ? addDays(joined, 200) : undefined;
        break;
      }
      case "review-master": {
        const n = reviewCountFor(userEmail);
        earned = n >= 25;
        progress = pctTowards(n, 25);
        progressLabel = `${n} / 25 reviews`;
        earnedAt = earned ? addDays(joined, 600) : undefined;
        break;
      }
    }

    return { stamp: s, earned, earnedAt, progress, progressLabel };
  });
}

/* Returns the list of stamps the user has earned but NOT yet been shown
 * a celebration for — keyed by localStorage on the client side. Server
 * implementation would track this in a `stamp_celebrations_seen` table. */
export function unseenStampsFor(userEmail: string, seenIds: string[]): EarnedStamp[] {
  return earnedStampsFor(userEmail).filter(e => e.earned && !seenIds.includes(e.stamp.id));
}

/* ══════════════════════════════════════════════════════════════════════
 * DEMO STAMP ROTATION — for prototype showcase
 *
 * In production, celebration popups fire only on genuine state transitions.
 * But for the prototype demo, every existing mock user already has many
 * stamps earned (bookingCount 10~84), so the popup would never re-fire.
 *
 * The rotation below simulates "just earned" stamps on each successive
 * booking completion, cycling through a curated variety so reviewers can
 * see how the UX feels for different rarities + categories.
 *
 * Consumed by BookingCompletePage via a sessionStorage counter.
 * ══════════════════════════════════════════════════════════════════════ */
export const DEMO_STAMP_ROTATION: string[] = [
  /* Start easy, escalate to rare — mimics a natural unlock journey */
  "first-booking",     /* Common  — the welcome moment */
  "m10",               /* Common  — early milestone */
  "explorer-intl",     /* Common  — first abroad booking */
  "big-spender",       /* Rare    — spending milestone */
  "tier-silver",       /* Rare    — tier up */
  "anniversary-1y",    /* Common  — loyalty year */
  "m50",               /* Rare    — mid-grind */
  "explorer-3ctry",    /* Rare    — geographic spread */
  "m250",              /* Epic    — the grind pays off */
  "tier-gold",         /* Epic    — big tier jump */
  "whale",             /* Epic    — heavy redeemer */
  "loyal-3y",          /* Epic    — long-timer */
  "m1000",             /* Legendary — conquest */
  "tier-platinum",     /* Legendary */
  "veteran-5y",        /* Legendary */
  "explorer-all6",     /* Legendary — geography master */
  "m5000",             /* Mythic  — ultra rare */
  "tier-diamond",      /* Mythic */
  "eternal-10y",       /* Mythic  — the ultimate */
  "m10000",            /* Mythic  — fewer than 10 OPs ever */
];

/* Given a counter (monotonic bookings completed this session + user's
 * seed offset), return the next stamp in the demo rotation. */
export function demoStampForBooking(counter: number): EarnedStamp | null {
  const id = DEMO_STAMP_ROTATION[counter % DEMO_STAMP_ROTATION.length];
  const stamp = STAMPS.find(s => s.id === id);
  if (!stamp) return null;
  return {
    stamp,
    earned: true,
    earnedAt: new Date().toISOString().slice(0, 10),
    progress: 1,
    progressLabel: stamp.hint,
  };
}

/* ══════════════════════════════════════════════════════════════════════
 * ELS EARN ECONOMICS — tuned to real hotel margin
 *
 * DOTBIZ net margin per ₩100,000 booking ≈ ₩3,500 (3.5%, 7-8% markup
 * minus inter-branch settlement).
 *
 * At the initial design rate (1 ELS per $1 booking) a $200 Peninsula
 * booking × Gold(1.2×) × 3× promo would award 720 ELS = $720 in reward
 * liability against ~$5 margin → unsustainable.
 *
 * NEW: 0.01 ELS per $1 booking (100× reduction).
 * Paired with small promo multipliers (1.1× / 1.15× / 1.2×) instead of
 * 2×/3×/5× so the reward pool stays within 20-40% of margin even on
 * stacked scenarios.
 *
 * These are CONFIGURATION CONSTANTS — ELLIS admin will tune per budget.
 * ══════════════════════════════════════════════════════════════════════ */

/** ELS earned per $1 of booking value at Bronze/no-promo baseline.
 * 0.005 = 0.5 ELS per $100. (2026-05-06 결정 — 1%에서 0.5%로 단순화).
 *
 * 변경 이력은 POLICY_CHANGELOG 참조. */
export const ELS_BOOKING_EARN_RATE = 0.005;

/** 최소 사용 가능 ELS 임계값 (2026-05-06 신규).
 * 잔액이 이 값 미만이면 redeem 불가. UI에서 disabled 처리. */
export const MIN_REDEEM_ELS = 10;

/** 호텔 부스트 최대 배율 (Hard Cap, 2026-05-06 신규).
 *
 * 마진 7% 가정에서 보수적 한계:
 *   • Diamond (1.5×) + boost 1.25× = 0.9375% 적립 (마진의 13.4% 환원)
 *   • 실질 마진 6.06% 유지 (안전 영역 + 마케팅 예산 여유)
 *
 * 단일 호텔 캠페인의 boost는 절대 이 값을 초과하지 못한다.
 * AdminEconomicsPage에서 튜닝 가능. 변경 시 POLICY_CHANGELOG 기록.
 *
 * 변경 이력:
 *   2026-05-06 최초 도입: 1.5×
 *   2026-05-06 보수적 조정: 1.5× → 1.25× (실질 마진 6% 사수) */
export const MAX_HOTEL_BOOST = 1.25;

/** Boost 안전 적용 — Hard Cap 초과분은 cap으로 clamp. */
export function clampBoost(multiplier: number, cap: number = MAX_HOTEL_BOOST): number {
  if (multiplier <= 1.0) return 1.0;
  return Math.min(multiplier, cap);
}

export interface HotelPointsBoost {
  hotelId: string;
  /** Multiplier applied to base ELS on top of tier multiplier.
   * Range kept tight (1.05–1.25) because promo hotels use the same
   * 7-8% markup — there's no extra margin to fund 2×+ rewards. */
  multiplier: number;
  label: string;        /* short marketing label shown to OPs */
  reason: string;       /* internal note for OP — why this boost exists */
  expiresAt: string;    /* ISO date — after this, back to 1× */
}

export const HOTEL_POINTS_BOOSTS: HotelPointsBoost[] = [
  { hotelId: "htl-001", multiplier: 1.1,  label: "+10% ELS", reason: "Hyatt spring push — Seoul",     expiresAt: "2026-05-31" },
  { hotelId: "htl-005", multiplier: 1.15, label: "+15% ELS", reason: "Mandarin Oriental exclusive",   expiresAt: "2026-05-15" },
  { hotelId: "htl-007", multiplier: 1.15, label: "+15% ELS", reason: "Peninsula Shanghai launch",     expiresAt: "2026-06-30" },
  { hotelId: "htl-009", multiplier: 1.1,  label: "+10% ELS", reason: "Park Hyatt loyalty week",       expiresAt: "2026-05-10" },
  { hotelId: "htl-010", multiplier: 1.1,  label: "+10% ELS", reason: "Marriott JW promo",             expiresAt: "2026-05-20" },
  { hotelId: "htl-006", multiplier: 1.2,  label: "+20% ELS", reason: "Flash: Hanoi high-season boost", expiresAt: "2026-04-30" },
];

export function hotelPointsBoost(hotelId: string): HotelPointsBoost | null {
  const b = HOTEL_POINTS_BOOSTS.find(x => x.hotelId === hotelId);
  if (!b) return null;
  if (new Date(b.expiresAt) < new Date()) return null;   /* expired */
  /* Hard Cap 적용 — 등록값이 cap을 초과해도 cap으로 clamp (안전장치) */
  return { ...b, multiplier: clampBoost(b.multiplier) };
}

/* Compute expected ELS for a booking: base × tier × hotel boost.
 * Base earn rate: 0.5 ELS per $100 (0.005/$ — 2026-05-06 결정).
 * 정수화 X — 소수점 허용 (예: $100 → 0.5 ELS).
 * floor 0 허용 — $20 미만 예약은 0 ELS도 가능.
 *
 * ⚠️ 적립 트리거: 체크아웃 시점 (post-stay), NOT 예약 확정 시점.
 * 트랜잭션 타입은 "Earned-Checkout" — 취소/노쇼 예약은 적립되지 않음.
 * (호텔 로열티 표준 정합: Hilton/Marriott 모두 stay 완료 시 적립)
 * 이 함수는 "예상 적립액"을 계산해 BookingForm에 표시할 뿐, 실제 적립은
 * checkout 이벤트가 트리거. */
export function estimatedElsForBooking(params: {
  usdValue: number;
  bookingCount: number;       /* for tier */
  hotelId?: string;
}): { base: number; tierMultiplier: number; hotelBoost: number; total: number; breakdown: string } {
  const base = params.usdValue * ELS_BOOKING_EARN_RATE;       /* 소수점 유지 */
  const tier = tierFor(params.bookingCount);
  const boost = params.hotelId ? hotelPointsBoost(params.hotelId) : null;
  const hotelBoost = boost?.multiplier ?? 1;
  /* 0.1 단위로 반올림 (소수점 1자리) */
  const total = Math.round(base * tier.multiplier * hotelBoost * 10) / 10;
  const parts = [`${base} base (1 ELS / $100)`];
  if (tier.multiplier > 1) parts.push(`${tier.multiplier}× ${tier.name}`);
  if (hotelBoost > 1) parts.push(`${boost!.label} hotel promo`);
  return { base, tierMultiplier: tier.multiplier, hotelBoost, total, breakdown: parts.join(" · ") };
}

/* Utility: format ELS balance with USD peg */
export function formatEls(amount: number): { els: string; usd: string } {
  return {
    els: `${amount.toLocaleString()} ELS`,
    usd: `≈ US$${(amount * ELS_USD_PEG).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  };
}

/* ── Points transactions (per-user history) ── */
export type PointsTxType = "Earned-Checkout" | "Earned-Review" | "Earned-Welcome" | "Earned-Milestone" | "Earned-Tier-Bonus" | "Used-Redeem" | "Expired";
export interface PointsTransaction {
  id: string;
  userEmail: string;
  date: string;
  type: PointsTxType;
  description: string;
  amount: number;
  balance: number;
  bookingId?: string;
  productId?: string;
}

export const pointsTransactions: PointsTransaction[] = [
  /* TravelCo master (KR) */
  { id: "ptx-001", userEmail: "master@dotbiz.com", date: "2026-04-20", type: "Earned-Checkout",  description: "Booking K26041511201H01 · Fairmont SG",     amount: 2, balance: 185, bookingId: "bk-016" },
  { id: "ptx-002", userEmail: "master@dotbiz.com", date: "2026-04-15", type: "Used-Redeem",     description: "Redeemed CGV 영화 관람권",                amount: -14, balance: 183, productId: "kr-cgv" },
  { id: "ptx-003", userEmail: "master@dotbiz.com", date: "2026-04-10", type: "Earned-Checkout",  description: "Booking K26031016208H01 · ANA Osaka",       amount: 3,  balance: 197, bookingId: "bk-004" },
  { id: "ptx-004", userEmail: "master@dotbiz.com", date: "2026-03-28", type: "Earned-Milestone",description: "🌱 10 Bookings milestone",                amount: 1,  balance: 194, },
  { id: "ptx-005", userEmail: "master@dotbiz.com", date: "2026-03-20", type: "Earned-Checkout",  description: "Booking K26032014532H01 · Grand Hyatt Seoul", amount: 1, balance: 193, bookingId: "bk-001" },
  /* OP @ TravelCo */
  { id: "ptx-101", userEmail: "op@dotbiz.com",     date: "2026-04-18", type: "Earned-Checkout",  description: "Booking K26041209084H01 · Banyan Tree Seoul",amount: 1,  balance: 96,  bookingId: "bk-017" },
  { id: "ptx-102", userEmail: "op@dotbiz.com",     date: "2026-04-10", type: "Used-Redeem",     description: "Redeemed 스타벅스 아메리카노",              amount: -5, balance: 95, productId: "kr-starbucks-5k" },
  { id: "ptx-103", userEmail: "op@dotbiz.com",     date: "2026-04-01", type: "Earned-Checkout",  description: "Booking K26040109301H01 · Park Hyatt Saigon", amount: 1, balance: 100, bookingId: "bk-009" },
  /* GOTADI master (VN) */
  { id: "ptx-201", userEmail: "gotadi@dotbiz.com", date: "2026-04-20", type: "Earned-Checkout",  description: "Booking K26042016224H01 · Metropole Hanoi", amount: 11, balance: 112, bookingId: "bk-023" },
  { id: "ptx-202", userEmail: "gotadi@dotbiz.com", date: "2026-04-15", type: "Used-Redeem",     description: "Redeemed GrabFood 100k VND",              amount: -7, balance: 101, productId: "vn-grab-food-100k" },
  { id: "ptx-203", userEmail: "gotadi@dotbiz.com", date: "2026-04-05", type: "Earned-Milestone",description: "⭐ 50 Bookings milestone",                amount: 5,  balance: 108, },
  { id: "ptx-204", userEmail: "gotadi@dotbiz.com", date: "2026-04-01", type: "Earned-Checkout",  description: "Booking K26040109301H01 · Park Hyatt Saigon", amount: 13, balance: 103, bookingId: "bk-009" },
];

export function pointsHistoryFor(userEmail: string): PointsTransaction[] {
  return pointsTransactions
    .filter(t => t.userEmail === userEmail)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/* ── Redeemed vouchers (user's coupon vault) ── */
export interface RedeemedVoucher {
  id: string;
  userEmail: string;
  productId: string;
  productName: string;
  brand: string;
  pointsCost: number;
  faceValue: number;
  faceCurrency: string;
  voucherCode: string;
  redeemedAt: string;
  expiresAt: string;
  status: "Active" | "Used" | "Expired";
}

export const redeemedVouchers: RedeemedVoucher[] = [
  { id: "vch-001", userEmail: "master@dotbiz.com", productId: "kr-cgv",            productName: "CGV 영화 관람권",    brand: "CGV",        pointsCost: 14, faceValue: 14000,  faceCurrency: "KRW", voucherCode: "CGV-9K4T-2XQB-7M3V", redeemedAt: "2026-04-15", expiresAt: "2026-07-15", status: "Active" },
  { id: "vch-002", userEmail: "op@dotbiz.com",     productId: "kr-starbucks-5k",   productName: "스타벅스 아메리카노", brand: "Starbucks",  pointsCost: 5,  faceValue: 4500,   faceCurrency: "KRW", voucherCode: "SB-AMR-82N9-KP4H", redeemedAt: "2026-04-10", expiresAt: "2026-07-10", status: "Active" },
  { id: "vch-003", userEmail: "gotadi@dotbiz.com", productId: "vn-grab-food-100k", productName: "GrabFood 100k VND",  brand: "Grab",       pointsCost: 7,  faceValue: 100000, faceCurrency: "VND", voucherCode: "GRAB-VN-FD-2K9M", redeemedAt: "2026-04-15", expiresAt: "2026-06-15", status: "Active" },
  { id: "vch-004", userEmail: "master@dotbiz.com", productId: "kr-kakao-taxi",     productName: "카카오T 블루 5,000원", brand: "Kakao T",   pointsCost: 5,  faceValue: 5000,   faceCurrency: "KRW", voucherCode: "KKT-BL-7HQ2-X4NP", redeemedAt: "2026-02-28", expiresAt: "2026-05-28", status: "Used" },
  /* ── Expiring-soon seeds (≤14 days from 2026-04-23 today) ── */
  { id: "vch-005", userEmail: "master@dotbiz.com", productId: "kr-oliveyoung",     productName: "올리브영 15,000원 상품권", brand: "올리브영",   pointsCost: 15, faceValue: 15000,  faceCurrency: "KRW", voucherCode: "OY-5K-HG2T-P48Q", redeemedAt: "2026-01-28", expiresAt: "2026-04-28", status: "Active" },
  { id: "vch-006", userEmail: "master@dotbiz.com", productId: "kr-tving",          productName: "TVING 스탠다드 1개월",    brand: "TVING",     pointsCost: 14, faceValue: 13900,  faceCurrency: "KRW", voucherCode: "TV-STD-9P2K-X5M7", redeemedAt: "2026-02-02", expiresAt: "2026-05-02", status: "Active" },
  { id: "vch-007", userEmail: "prepay@dotbiz.com", productId: "kr-starbucks-5k",   productName: "스타벅스 아메리카노",      brand: "Starbucks", pointsCost: 5,  faceValue: 4500,   faceCurrency: "KRW", voucherCode: "SB-AMR-3P9H-N7KQ", redeemedAt: "2026-02-04", expiresAt: "2026-05-04", status: "Active" },
  { id: "vch-008", userEmail: "gotadi@dotbiz.com", productId: "vn-grab-food-100k", productName: "GrabFood 100k VND",       brand: "Grab",      pointsCost: 7,  faceValue: 100000, faceCurrency: "VND", voucherCode: "GRAB-VN-FD-8X2N", redeemedAt: "2026-02-01", expiresAt: "2026-05-01", status: "Active" },
];

export function vouchersFor(userEmail: string): RedeemedVoucher[] {
  return redeemedVouchers.filter(v => v.userEmail === userEmail).sort((a, b) => b.redeemedAt.localeCompare(a.redeemedAt));
}

/* ── Helper: compute estimated points for a booking ── */
export function estimatedPointsFor(amount: number, bookingCurrency: string, tier: TierDef): number {
  const code = (Object.keys(POINTS_EARN_RATE) as CountryCode[]).find(
    c => POINTS_EARN_RATE[c].currency === bookingCurrency
  ) || "US";
  const rate = POINTS_EARN_RATE[code];
  const base = Math.floor(amount / rate.amountPerPoint);
  return Math.floor(base * tier.multiplier);
}

/* ── Legacy shim (kept for older imports) ── */
export const pointsHistory = pointsTransactions.slice(0, 5);

/* ════════════════════════════════════════════════════════════════════
 * Earner 자격 규칙 — OP만 (2026-04 결정)
 * ════════════════════════════════════════════════════════════════════
 * 규칙 (단순화):
 *   • OP role만 ELS 적립
 *   • Master는 절대 적립 불가 (관리 역할 — 부정 사용 방지)
 *   • Accounting은 절대 적립 불가 (회계 분리)
 *   • EllisAdmin은 내부 직원 (적립 불가)
 *
 * 회사 패턴 — 솔로 마스터(OP 0명):
 *   • Master 본인은 적립 불가
 *   • 따라서 회사는 최소 1명의 OP 계정을 등록해야 함
 *   • 등록 전까지 적립 트리거는 작동하지 않음 (예약 시 ELS 0)
 *   • UI에서 Master에게 "OP 계정을 등록하세요" 배너 표시
 *
 * 이전 버전(Solo Master 예외 적립)은 Company Pool과 함께 폐기.
 * 단순화 + 권한 분리 명확화 + 부정 사용 방지가 목적.
 *
 * 이 헬퍼는 모든 적립 트리거에서 호출:
 *   - BookingCompletePage (예약 완료 보상)
 *   - HotelDetailPage (리뷰 보상)
 *   - 미래의 모든 earning 경로 (미션, 친구 초대 등)
 */
export interface EarnerCheckUser {
  email: string;
  role: string;
  customerCompanyId?: string;
}

export function isEarnEligible(user: EarnerCheckUser): boolean {
  /* OP만 적립. 그 외 모든 role(Master / Accounting / EllisAdmin)은 불가. */
  return user.role === "OP";
}

/** 회사에 OP가 등록되어 있는지 — Master 어카운트에서 OP 등록 유도 배너용 */
export function companyHasOps(companyOps: EarnerCheckUser[]): boolean {
  return companyOps.some(u => u.role === "OP");
}

/* ════════════════════════════════════════════════════════════════════
 * Risk Metrics — 어드민 리스크 대시보드
 * ════════════════════════════════════════════════════════════════════
 * Deferred Liability(미지급 ELS 부채) 추적, 적립/사용/만료 트렌드,
 * 부정 거래 패턴 플래그. ELLIS Admin만 조회.
 *
 * 실제 계산은 거래내역 집계로 이뤄지지만, 프로토타입에서는 mock으로 표시.
 */
export interface RiskSnapshot {
  asOfDate: string;
  totalDeferredEls: number;          /* 모든 OP balance 합계 */
  totalDeferredUsd: number;          /* USD 환산 (1 ELS = 1 USD peg) */
  totalDeferredKrw: number;          /* KRW 환산 (회계용, FX는 mock) */
  monthlyAccrualEls: number;         /* 이번 달 적립 */
  monthlyRedemptionEls: number;      /* 이번 달 사용 */
  monthlyExpiredEls: number;         /* 이번 달 만료 소멸 */
  monthlyNetDelta: number;           /* 적립 - 사용 - 만료 = 부채 증감 */
  forecastNext30dExpiry: number;     /* 향후 30일 내 만료 예상 */
  budgetUtilizationPct: number;      /* 월 예산 캡 대비 사용률 */
}

export const riskSnapshot: RiskSnapshot = {
  asOfDate: "2026-04-29",
  totalDeferredEls: 717,       /* userPointsState balance 총합 (수치는 mock) */
  totalDeferredUsd: 717,
  totalDeferredKrw: 982_290,   /* @ 1370 KRW/USD mock */
  monthlyAccrualEls: 38,
  monthlyRedemptionEls: 27,
  monthlyExpiredEls: 0,
  monthlyNetDelta: 11,
  forecastNext30dExpiry: 14,
  budgetUtilizationPct: 0,     /* 예산 캡 미설정 시 0 */
};

/* 부정 거래 / 비정상 패턴 플래그 — Admin 검토 대상 */
export type FraudFlagSeverity = "Low" | "Medium" | "High";
export type FraudFlagStatus = "Open" | "Reviewing" | "Dismissed" | "Confirmed";

export interface FraudFlag {
  id: string;
  detectedAt: string;
  userEmail: string;
  customerCompanyId: string;
  pattern: string;             /* "동일 IP 대량 적립" / "비정상 리뷰 빈도" 등 */
  severity: FraudFlagSeverity;
  status: FraudFlagStatus;
  evidence: string;            /* 짧은 설명 + 데이터 포인트 */
  involvedAmount: number;      /* 의심 ELS 금액 */
  reviewerEmail?: string;
  resolvedAt?: string;
  resolution?: string;
}

export const fraudFlags: FraudFlag[] = [
  {
    id: "fraud-001", detectedAt: "2026-04-26", userEmail: "phong@gotadi.com", customerCompanyId: "comp-010",
    pattern: "단기간 다중 리뷰 작성", severity: "Medium", status: "Reviewing",
    evidence: "24시간 내 5개 호텔 리뷰 작성 (평균 1개/주)",
    involvedAmount: 22, reviewerEmail: "ellis@ohmyhotel.com",
  },
  {
    id: "fraud-002", detectedAt: "2026-04-24", userEmail: "kevin@travelco.com", customerCompanyId: "comp-001",
    pattern: "예약 직후 취소 후 재예약", severity: "Low", status: "Open",
    evidence: "동일 호텔 3회 예약-취소 사이클, 각 사이클 ELS 적립 의심",
    involvedAmount: 6,
  },
  {
    id: "fraud-003", detectedAt: "2026-04-20", userEmail: "test@dotbiz.com", customerCompanyId: "comp-001",
    pattern: "동일 디바이스 다중 계정", severity: "High", status: "Confirmed",
    evidence: "user-agent + IP 매칭 4계정 동일 → 적립 합산 무효 처리됨",
    involvedAmount: 48, reviewerEmail: "ellis@ohmyhotel.com",
    resolvedAt: "2026-04-22", resolution: "ELS 회수, 계정 정지",
  },
];

/* ════════════════════════════════════════════════════════════════════
 * Spending 출구 — 예약 시 ELS 차감 옵션
 * ════════════════════════════════════════════════════════════════════
 * BookingFormPage에서 사용. 예약 금액의 일부를 ELS로 결제.
 * 비율(예: 최대 5%까지 ELS로) 및 환산(예: 1 ELS = $1)은 추후 결정.
 */
export interface ElsRedeemAtBookingPolicy {
  /** 예약 금액 대비 최대 ELS 사용 비율 (0.0~1.0). 추후 결정. */
  maxRedeemRatio: number;
  /** 1 ELS의 결제 차감 금액 USD. 1 ELS = 1 USD peg면 1.0 */
  elsToUsdRate: number;
  /** 정책 활성화 여부 */
  enabled: boolean;
}

export const ELS_REDEEM_AT_BOOKING_POLICY: ElsRedeemAtBookingPolicy = {
  maxRedeemRatio: 0.05,   /* 잠정 5% — 추후 결정 */
  elsToUsdRate: 1.0,
  enabled: true,
};

/* ════════════════════════════════════════════════════════════════════
 * ELS 영구 보존 정책 (2026-05-06 결정 #4)
 * ════════════════════════════════════════════════════════════════════
 * 한 번 적립된 ELS는 어떤 경우에도 회수 불가 (전체 시스템 동일 적용):
 *   • 리뷰가 takedown / 삭제돼도 → 받은 ELS 유지
 *   • 분쟁 인정으로 invoice 조정돼도 → 적립된 ELS 유지
 *   • OP 퇴사 / 계정 비활성화 → balance 그대로 보존 (단, 신규 적립 X)
 *   • 부정 적립 적발 시에만 → ELLIS Admin 수동 클로백 (예외)
 *
 * 만료 정책(ELS_EXPIRY_MONTHS=24)은 별개 — 적립 후 N개월 미사용 시 소멸.
 * 만료는 시간 흐름이며, 상기 "회수"는 액션 기반 환수와 구분.
 */
export const ELS_PERMANENT_RETENTION = true;

/** ELS 클로백이 가능한 유일한 사유 — ELLIS Admin 결정 + 부정 적발 시. */
export type ElsClawbackReason =
  | "FraudDetected"          /* 부정 적립 적발 */
  | "DuplicateAccount"       /* 동일 디바이스 다중 계정 */
  | "SystemError";           /* 시스템 오작동으로 잘못 적립 */

/* ════════════════════════════════════════════════════════════════════
 * POLICY CHANGELOG (정책 변경 이력)
 * ════════════════════════════════════════════════════════════════════
 * 정책 변경 시 변경 전/후를 영구 보존. AdminEconomicsPage의 "변경 이력" 탭에
 * 표시되어 추후 변경 이력 추적 가능.
 *
 * 사용자 결정 (2026-05-06): "추후 변경하면 변경 전 내용도 보일 수 있도록"
 */
export interface PolicyChange {
  changedAt: string;       /* ISO date */
  changedBy: string;       /* ELLIS staff email */
  category: "ELS Earning" | "Tier System" | "Stamp" | "Shop" | "Membership Demotion" | "Other";
  field: string;           /* 변경된 정책 이름 */
  before: string;          /* 변경 전 값 */
  after: string;           /* 변경 후 값 */
  reason: string;          /* 변경 사유 */
}

export const POLICY_CHANGELOG: PolicyChange[] = [
  {
    changedAt: "2026-05-06",
    changedBy: "ellis@ohmyhotel.com",
    category: "ELS Earning",
    field: "ELS_BOOKING_EARN_RATE",
    before: "0.01 (1%)",
    after: "0.005 (0.5%)",
    reason: "단순화 + 마진 보호. $100 호텔 예약 시 0.5 ELS 적립.",
  },
  {
    changedAt: "2026-05-06",
    changedBy: "ellis@ohmyhotel.com",
    category: "ELS Earning",
    field: "MIN_REDEEM_ELS",
    before: "(제한 없음)",
    after: "10 ELS",
    reason: "최소 사용 임계값 도입. 잔액 10 ELS 미만은 redeem 불가.",
  },
  {
    changedAt: "2026-05-06",
    changedBy: "ellis@ohmyhotel.com",
    category: "Tier System",
    field: "Tier 임계값",
    before: "복합 score (booking 70% + revenue 30%, USD/booking-eq $200)",
    after: "단순 매출 기반 (Bronze $0 / Silver $10K / Gold $50K / Platinum $200K / Diamond $1M)",
    reason: "단순화. 매출 = 비즈니스 임팩트 직결.",
  },
  {
    changedAt: "2026-05-06",
    changedBy: "ellis@ohmyhotel.com",
    category: "Membership Demotion",
    field: "강등 점검 주기",
    before: "Rolling 12개월 + 12개월 grace",
    after: "분기(3개월) 점검 + 30일 grace",
    reason: "되도록 빠른 정리 — 비활성 OP에 대한 매출 손실 차단.",
  },
  {
    changedAt: "2026-05-06",
    changedBy: "ellis@ohmyhotel.com",
    category: "Membership Demotion",
    field: "강등 임계값",
    before: "일률 적용 (모든 tier 동일)",
    after: "Tier별 차등: Silver $2.5K / Gold $12.5K / Platinum $50K / Diamond $250K (분기 매출)",
    reason: "위 tier일수록 유지에 더 큰 매출 필요 — 갈수록 어려워지도록.",
  },
  {
    changedAt: "2026-05-06",
    changedBy: "ellis@ohmyhotel.com",
    category: "Stamp",
    field: "로얄티 스탬프 활동 기준",
    before: "단순 가입 기간 (1-Year Anniversary 등)",
    after: "최근 3개월 매출 ≥ tier 강등 임계값 (활동 기반)",
    reason: "비활성 OP에게 단순 시간 기반 스탬프 부여 차단. 강등조건과 동일 기준.",
  },
  {
    changedAt: "2026-05-06",
    changedBy: "ellis@ohmyhotel.com",
    category: "Shop",
    field: "Tier 잠금 상품",
    before: "minTier별 점진적 해제 (Bronze→Diamond)",
    after: "삭제 (모든 tier 모든 상품 사용 가능)",
    reason: "기능 단순화. Tier 보상은 multiplier로 충분.",
  },
  {
    changedAt: "2026-05-06",
    changedBy: "ellis@ohmyhotel.com",
    category: "Shop",
    field: "Redeem 흐름",
    before: "쿠폰 코드 자동 발급 (시스템)",
    after: "OP 어드민에서 수동 발급 (RedeemRequest 큐)",
    reason: "시스템 복잡도 감소. 모바일 전송 가능 상품 위주로 진열.",
  },
  {
    changedAt: "2026-05-06",
    changedBy: "ellis@ohmyhotel.com",
    category: "Other",
    field: "ELS 회수 정책",
    before: "리뷰 takedown / 분쟁 / 클로백 등 다중 회수 경로",
    after: "영구 보존 (전체 시스템) — 부정 적발 시에만 ELLIS Admin 수동 클로백",
    reason: "단순화 + OP 신뢰 보장.",
  },
  {
    changedAt: "2026-05-06",
    changedBy: "ellis@ohmyhotel.com",
    category: "ELS Earning",
    field: "적립 트리거",
    before: "예약 확정 시점 (booking confirmation)",
    after: "체크아웃 시점 (post-stay) — Earned-Checkout 트랜잭션",
    reason: "취소·노쇼 리스크 제거. 호텔 로열티 표준(Hilton/Marriott) 정합. 실제 stay 완료한 예약만 ELS 적립.",
  },
  {
    changedAt: "2026-05-06",
    changedBy: "ellis@ohmyhotel.com",
    category: "Tier System",
    field: "Tier 6단계 확장",
    before: "5단계 (Bronze/Silver/Gold/Platinum/Diamond)",
    after: "6단계 — Emerald 1.4× 추가 ($500K~$1M, Platinum↔Diamond 사이)",
    reason: "중간 사용자 유인 강화. 마진 환원율 0.7%로 안전 영역.",
  },
  {
    changedAt: "2026-05-06",
    changedBy: "ellis@ohmyhotel.com",
    category: "ELS Earning",
    field: "리뷰 ELS 적립 트리거",
    before: "리뷰 승인 후 적립",
    after: "리뷰 작성 즉시 적립 (Earned-Review 트랜잭션)",
    reason: "리뷰는 작성 자체가 가치 있는 행위. 승인 대기 없이 즉시 인정. takedown 시에도 ELS는 영구 보존 (회수 X).",
  },
  {
    changedAt: "2026-05-06",
    changedBy: "ellis@ohmyhotel.com",
    category: "Hotel Boost",
    field: "Hotel Boost Hard Cap",
    before: "캡 1.25× (튜닝 가능, 시스템 절대 한도 없음)",
    after: "MAX_HOTEL_BOOST = 1.5× (시스템 절대 한도) · 어드민 cap도 1.5× 초과 불가",
    reason: "마진 7% 가정에서 Diamond + boost 1.5× = 실질 마진 5.87% 사수 (안전 영역). hotelPointsBoost() 호출 시 자동 clamp.",
  },
  {
    changedAt: "2026-05-06",
    changedBy: "ellis@ohmyhotel.com",
    category: "Hotel Boost",
    field: "Hotel Boost Hard Cap",
    before: "MAX_HOTEL_BOOST = 1.5×",
    after: "MAX_HOTEL_BOOST = 1.25× (보수적 조정)",
    reason: "마진 7% 가정에서 Diamond + boost 1.25× = 실질 마진 6.06% (보다 안전). 마케팅 예산 여유 확보 + 향후 cap 상향 옵션 보존.",
  },
  /* ──────────────── 2026-05-07 대표이사 검수 결재 ──────────────── */
  {
    changedAt: "2026-05-07",
    changedBy: "CEO",
    category: "Settlement",
    field: "PG 수수료 부담 주체",
    before: "미결정",
    after: "DOTBIZ 부담 + 마진에 반영 (가격에 흡수)",
    reason: "고객사에 추가 청구하지 않고 DOTBIZ 마진에 흡수. 카드 결제 가격은 송금 대비 약간 높게 책정해 PG 수수료 비용 상쇄.",
  },
  {
    changedAt: "2026-05-07",
    changedBy: "CEO",
    category: "Settlement",
    field: "분쟁 자동 인정 정책",
    before: "(검토 중) 일정 금액 이하 자동 인정 옵션",
    after: "자동 인정 없음 — 모든 분쟁 수동 검토",
    reason: "금액 임계값 기반 자동 처리는 부정 사용 / 정책 우회 리스크. 모든 분쟁은 Master/Accounting/EllisOP 사안별 검토.",
  },
  {
    changedAt: "2026-05-07",
    changedBy: "CEO",
    category: "Settlement",
    field: "No Deposit 적용 기준",
    before: "(검토 중) 매출 임계 + 신용 점수 자동 부여",
    after: "대표이사 승인 (케이스별 결재)",
    reason: "자동 부여 시 통제 약화. 케이스별 대표이사 결재 후 ELLIS Admin 등록. 사유 + 결재일 영구 기록.",
  },
  {
    changedAt: "2026-05-07",
    changedBy: "CEO",
    category: "Settlement",
    field: "신규 통화 추가 트리거",
    before: "(검토 중) CFO 단독 결재",
    after: "소스마켓 추가 시 동시 결재 (대표이사)",
    reason: "통화만 별도 추가 X. 신규 시장 진출 결재와 통화 추가를 통합 처리. 시장 없이 통화만 추가하는 경우 차단.",
  },
  {
    changedAt: "2026-05-07",
    changedBy: "CEO",
    category: "Settlement",
    field: "Net-30 협상 상한",
    before: "(검토 중) 30~60일",
    after: "45일까지 (60일 절대 초과 금지)",
    reason: "표준 Net-30, 대형사 협상 시 최대 45일까지 허용. 60일 초과는 회수 리스크.",
  },
  {
    changedAt: "2026-05-07",
    changedBy: "CEO",
    category: "Settlement",
    field: "환차손 회계 처리 주기",
    before: "(검토 중) 매월/분기/연간",
    after: "분기 정산 (CFO 운영)",
    reason: "매월은 운영 비용 과다, 연간은 가시성 부족. 분기 단위가 적정.",
  },
  {
    changedAt: "2026-05-07",
    changedBy: "CEO",
    category: "Settlement",
    field: "AR 90+일 Write-off 결재선",
    before: "(검토 중) CFO/대표이사",
    after: "대표이사 결재",
    reason: "악성 미수 손실 처리는 대표이사 결재 사항.",
  },
  {
    changedAt: "2026-05-07",
    changedBy: "CEO",
    category: "Settlement",
    field: "디포짓 종류",
    before: "(검토 중) 단순화 vs 6종 유지",
    after: "6종 유지 (Credit by Company, Floating, Guarantee Deposit, Insurance, Bank Guarantee, No Deposit)",
    reason: "고객사 다양성 대응. 단순화 시 옵션 부족.",
  },
  /* ──────────────── 2026-05-08 Sage CFO 권장안 8건 채택 ──────────────── */
  {
    changedAt: "2026-05-08",
    changedBy: "CEO (Sage CFO 권장안)",
    category: "Settlement",
    field: "PG 수수료 흡수 모델",
    before: "DOTBIZ 부담 (방식 미정)",
    after: "Tier별 차등 흡수 + 결제수단 차등 가격: Non-refundable 100% 흡수 + 마진 1.5%p 추가 확보 / Free Cancel은 송금 유지 + 카드 정가 / 표시가는 단일",
    reason: "평균 마진 7% 방어 + 노쇼 리스크 동시 차단. Non-refundable의 호텔 마진 8~12% 활용해 PG 수수료 흡수 가능.",
  },
  {
    changedAt: "2026-05-08",
    changedBy: "CEO (Sage CFO 권장안)",
    category: "Settlement",
    field: "환차손 헷징 정책",
    before: "분기 정산 (CFO 운영, 수단 미정)",
    after: "자연헷지 우선 + 3개월 롤링 Forward 보완: 1단계 JPY 매출-비용 매칭 (비용 0) / 2단계 잔여 USD/JPY Forward (0.3~0.5%) / Option 배제",
    reason: "Option은 비용 대비 효익 낮음. Forward 50% 헷지로 변동성 50% 축소 + 자연헷지로 비용 최소화.",
  },
  {
    changedAt: "2026-05-08",
    changedBy: "CEO (Sage CFO 권장안)",
    category: "Settlement",
    field: "신용 한도 동결 트리거",
    before: "(검토 중) 60일 vs 90일 단일 임계값",
    after: "2단계 트리거: 60일 = 신규 예약 한도 50% 축소 (소프트 동결) + 협의 요청 / 90일 = 완전 동결 + 법무 검토",
    reason: "단일 60일은 영업 관계 손상, 단일 90일은 회수 지연. 단계적 압박으로 균형.",
  },
  {
    changedAt: "2026-05-08",
    changedBy: "CEO (Sage CFO 권장안)",
    category: "Settlement",
    field: "Net-45 적용 결재 방식",
    before: "(검토 중) 케이스별 결재 vs Master 위임",
    after: "TTV 규모별 차등: 월 TTV 5억원+ 대형사는 케이스별 대표이사 결재 / 5억원 미만은 Master 위임 + 분기 보고",
    reason: "대형 리스크는 통제, 소형은 운영 속도 확보. 60일 절대 금지 재확인.",
  },
  {
    changedAt: "2026-05-08",
    changedBy: "CEO (Sage CFO 권장안)",
    category: "Settlement",
    field: "No Deposit 적용 기준",
    before: "(검토 중) 정량 단일 vs 케이스별",
    after: "정량 3종 (AND) + 정성 2종 (AND): 월 TTV 10억원+ (12개월) / 거래기간 24개월+ / 60일+ Overdue 0건 / 회사 평판 / 대표이사 면담. 12개월마다 재평가.",
    reason: "객관 정량 + 정성 판단 결합. 자동 평가서 출력 후 대표이사 결재로 차별 시비 차단.",
  },
  {
    changedAt: "2026-05-08",
    changedBy: "CEO (Sage CFO 권장안)",
    category: "Settlement",
    field: "No Deposit 결재 양식",
    before: "(미작성)",
    after: "자동 평가서 + 결재 양식 통합: 회사명 / TTV 12개월 자동 / 거래기간 자동 / Aging 이력 자동 + Master 추천 사유 / 대표이사 의견 / 결재일",
    reason: "ELLIS Admin 양식으로 통합 (No Deposit 신청 → 자동평가 → 결재 → 등록).",
  },
  {
    changedAt: "2026-05-08",
    changedBy: "CEO (Sage CFO 권장안)",
    category: "Settlement",
    field: "분쟁 결재선 (금액대별)",
    before: "(미정) 자동 인정 없음만 확정",
    after: "4단계: <$1K Master 단독 (당일) / $1K~10K Master+Accounting (24h) / $10K~50K Accounting+EllisOP (48h) / $50K+ 대표이사 (72h). 시스템 분쟁(Sanha 등)은 별도 트랙.",
    reason: "결재선 단순화로 처리 속도 확보 + 금액대별 통제 강도 차등.",
  },
  {
    changedAt: "2026-05-08",
    changedBy: "CEO (Sage CFO 권장안)",
    category: "Settlement",
    field: "분쟁 SLA 운영 기준",
    before: "(검토 중) High 4h / Medium 24h / Low 72h",
    after: "현재 안 유지 + 영업시간(KR/JP 9-18시) 기준 명확화. Critical(부정결제·시스템장애) 24x7 별도 트랙. 월 분쟁 50건 초과 시 인력 증원 트리거.",
    reason: "KR+JP 9시간 커버. 한국 야간은 JP 인력 활용으로 SLA 사수.",
  },
  /* ──────────────── 2026-05-08 PM Critical Update — 마진율 가정 재검토 ──────────────── */
  {
    changedAt: "2026-05-08",
    changedBy: "CEO Critical Update",
    category: "Settlement",
    field: "마진율 가정",
    before: "Gross Margin 7% (Sage 분석 기반)",
    after: "Gross Margin 3.5~4% (실측 기반)",
    reason: "이전 결재의 마진 7% 가정은 낙관적. 실제 3.5~4%이므로 ELS/CMS/PG 비용 모델 전반 재계산 필요. Diamond + 1.25× boost + Global PG 시 역마진 발생 가능.",
  },
  {
    changedAt: "2026-05-08",
    changedBy: "CEO Critical Update",
    category: "Settlement",
    field: "PG 전략 — 국가별 분리 검토",
    before: "단일 글로벌 PG (Eximbay) 전제, 3.5~4% 수수료",
    after: "국가별 Local PG 우선 + Global PG fallback. 마켓 리서치 착수 (2주). 한국 Toss/KCP, 중국 Alipay/WeChat 등 1.5~2.5% 협상 목표.",
    reason: "글로벌 PG 단독 시 카드 결제 역마진. Local PG로 평균 2% 절감 시 break-even 가능.",
  },
  {
    changedAt: "2026-05-08",
    changedBy: "CEO Critical Update",
    category: "Hotel Boost",
    field: "호텔 자부담 의무",
    before: "호텔 자부담 비율 미정 (DOTBIZ 흡수 가능)",
    after: "호텔 자부담 100% 필수 검토 (마진 4% 기준 DOTBIZ 흡수 불가)",
    reason: "마진 4% 환경에서 Diamond + 1.25× boost = 환원율 23.5%. DOTBIZ 흡수 불가. 호텔 마케팅 예산으로 100% 부담 시에만 운영.",
  },
  {
    changedAt: "2026-05-08",
    changedBy: "CEO Critical Update",
    category: "Security",
    field: "보안 강화 트랙 신설",
    before: "보안 정책 산발적",
    after: "별도 트랙 신설: 3rd-party 침투 테스트 / PCI-DSS / RBAC 강화 / Audit Log / 2FA / 결제 토큰화",
    reason: "현재 보안 취약. 마진 영향 받지 않는 별도 예산 책정.",
  },
  {
    changedAt: "2026-05-08",
    changedBy: "CEO Market Research",
    category: "Settlement",
    field: "PG 모델 — 경쟁사 벤치마크",
    before: "단일 모델 (DOTBIZ 흡수 + 가격 반영) 가정",
    after: "하이브리드 모델 검증: TBO 방식(고객 부담) + Ratehawk 방식(가격 포함)을 거래 유형/고객 규모별로 분기. Non-refundable·소형 고객은 Ratehawk, POSTPAY 카드 협의·대형 고객은 TBO 적용 검토.",
    reason: "TBO는 결제수수료를 고객사에 별도 청구, Ratehawk는 호텔 가격에 포함. 두 거대 공급사의 시장 검증된 패턴. DOTBIZ는 거래 유형별로 두 모델 분기로 마진 안전 + 가격 경쟁력 모두 확보.",
  },
  {
    changedAt: "2026-05-08",
    changedBy: "CEO Market Research",
    category: "Settlement",
    field: "비-PG 결제 방식 도입 검토",
    before: "PG 카드 결제 단일 가정",
    after: "5개 카테고리 15종 결제 방식 리서치: 송금/가상계좌/SWIFT (Bank) + Open Account/BNPL/Factoring/Insurance (Credit) + Bank Guarantee/LC/Escrow (Collateral) + Pre-funded Wallet/Top-up (Pre-funded) + Alipay/WeChat/PayNow (Alternative). 한국·일본 가상계좌, 중국 Alipay/WeChat 우선 도입 권장.",
    reason: "PG 단일 의존 시 마진 압박. 한국 가상계좌 0.5~1%, 중국 Alipay 1~2%, Pre-funded Wallet 0% 등 PG 대체 옵션으로 평균 결제 수수료 2% 이하 달성 가능. 마진 4% 기준 안전 영역 확보.",
  },
  {
    changedAt: "2026-05-08",
    changedBy: "CEO Web Research",
    category: "Settlement",
    field: "결제 수수료 실측 데이터",
    before: "추정치 기반 분석",
    after: "웹 리서치 실측 확보: 한국 가상계좌 건당 250원(0.025%) / 한국 PG 카드 2.1~3.3% / Stripe 일본 3.6%+국제1.5% / Stripe 싱가포르 3.4%+S$0.50 / Eximbay 0.2~5% / Alipay 국제카드 3% / Trade Credit Insurance 0.1~0.5% / WebBeds Net-21 + Floating Deposit/Bank Guarantee 강제 / Ratehawk Net rate + Pay By Link",
    reason: "추정에서 실측으로. 한국 가상계좌 PG 대비 ~150배 저렴 확인. Stripe 일본 3.6%로 마진 4% 잠식 확정. Trade Credit Insurance 0.5% 이하로 No Deposit 대체 합리성 확인. Hokodo 폐업(2025-11) → Billie/Mondu/Resolve 대안 검토 필요.",
  },
  {
    changedAt: "2026-05-08",
    changedBy: "CEO Business Structure",
    category: "Settlement",
    field: "결제 전략 v3 — 권역별 + 본사·지사 구조",
    before: "PG 모델 단일 분석 (계약/입금 주체 미반영)",
    after: "본사 SG / 지사 KR·JP·VN(+HK 예정) / 4개 세일즈 권역 (KR·대중화·동남아·SG+MY) / Model C 하이브리드 수금: 현지 지사 수금 후 SG 본사 송금. 권역별 결제 수단 매트릭스 확정. 평균 결제 수수료 1.0% 달성 가능.",
    reason: "DOTBIZ 실제 비즈니스 구조 반영. 계약/입금 주체 SG라는 점이 결제 모델 핵심 제약. 현지 지사 활용 시 가상계좌 0.025%, Alipay 1~2%, PayNow 0%, VNPay 1.5~2.5% 활용. 마진 4% 환경에서 Net +1.4% 확보.",
  },
  /* ──────────────── 2026-05-08 PG 수수료 정책 전면 변경 — 고객 100% 부담 ──────────────── */
  {
    changedAt: "2026-05-08",
    changedBy: "CEO Final Decision",
    category: "Settlement",
    field: "PG 수수료 부담 주체 — 정책 전면 변경",
    before: "DOTBIZ 부담 + 마진에 반영 (이전 1단계 결재) / Tier별 차등 흡수 (이전 2단계 Sage 권장)",
    after: "고객 100% 부담 (DOTBIZ 흡수 0%). 표시 방식: Option C Hybrid (Booking-style) — 검색·리스트는 호텔 정가 단일가, 결제 단계에서 결제수단 선택 시 PG 수수료 자동 표시, 인보이스 라인 분리.",
    reason: "마진 3.5~4% 환경에서 DOTBIZ가 PG 흡수 시 역마진 위험 (글로벌 PG 3.5~4% / Stripe 일본 3.6% / Eximbay 최대 5%). 고객 100% 부담으로 마진 사수 + 결제수단 선택 자유 부여 (송금 0% / QR 0~2% / 카드 2~3% 등). Option A(판매가 포함)는 결제수단별 수수료 차이 크고 송금 고객 손해 발생하여 부적합. Option C가 가격 비교·UX·회계 모두 최적.",
  },
  {
    changedAt: "2026-05-08",
    changedBy: "CEO Final Decision",
    category: "Settlement",
    field: "이전 PG 부담 결재 무효화",
    before: "2026-05-07 #1 'PG 수수료 DOTBIZ 부담' / 2026-05-08 #9 'Tier별 차등 흡수' / 2026-05-08 #11 'PG 흡수 모델 Tier별'",
    after: "위 3건 모두 무효. PG 수수료는 100% 고객 부담 + Option C Hybrid 표시. POLICY_CHANGELOG 영구 기록으로 변경 이력 보존.",
    reason: "마진 가정 7% → 3.5~4% 실측 반영 후 정책 재설계. 흡수 모델은 어떤 변형이든 마진 잠식 불가피. 시장 벤치마크(TBO·Booking·Expedia 모두 고객 부담) 부합.",
  },
];
