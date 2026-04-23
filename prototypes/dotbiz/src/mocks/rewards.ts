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
}

export const rewardProducts: RewardProduct[] = [
  /* ═════════ KR — Korea (local suppliers) ═════════ */
  { id: "kr-starbucks-5k",   countryCode: "KR", supplierRegion: "Korea", brand: "Starbucks",     name: "스타벅스 아메리카노",      description: "Tall Americano 기프티콘, 전국 매장 사용 가능", category: "Coffee",    pointsCost: 5,    faceValue: 4500,     faceCurrency: "KRW", emoji: "☕", gradient: "linear-gradient(135deg, #006241, #1e3932)", deliveryMethod: "email-code" },
  { id: "kr-starbucks-tx",   countryCode: "KR", supplierRegion: "Korea", brand: "Starbucks",     name: "스타벅스 디저트 세트",      description: "아메리카노 + 조각케이크 세트 기프티콘",     category: "Coffee",    pointsCost: 12,   faceValue: 11000,    faceCurrency: "KRW", emoji: "🍰", gradient: "linear-gradient(135deg, #006241, #a97c50)", deliveryMethod: "email-code" },
  { id: "kr-kakao-taxi",     countryCode: "KR", supplierRegion: "Korea", brand: "Kakao T",       name: "카카오T 블루 5,000원",      description: "카카오T 블루 택시 쿠폰 5,000원",              category: "Transport", pointsCost: 5,    faceValue: 5000,     faceCurrency: "KRW", emoji: "🚕", gradient: "linear-gradient(135deg, #FEE500, #3C1E1E)", deliveryMethod: "in-app-voucher" },
  { id: "kr-cgv",            countryCode: "KR", supplierRegion: "Korea", brand: "CGV",           name: "CGV 영화 관람권",          description: "CGV 2D 일반 영화 1매",                         category: "Entertainment" as RewardCategory, pointsCost: 14, faceValue: 14000, faceCurrency: "KRW", emoji: "🎬", gradient: "linear-gradient(135deg, #dc0000, #1a1a1a)", deliveryMethod: "email-code" },
  { id: "kr-baemin",         countryCode: "KR", supplierRegion: "Korea", brand: "배달의민족",      name: "배민 상품권 10,000원",      description: "배달의민족 배달 주문 10,000원 상품권",        category: "Food",      pointsCost: 10,   faceValue: 10000,    faceCurrency: "KRW", emoji: "🍱", gradient: "linear-gradient(135deg, #00c9a7, #004d40)", deliveryMethod: "in-app-voucher" },
  { id: "kr-naverpay-20k",   countryCode: "KR", supplierRegion: "Korea", brand: "네이버페이",      name: "네이버페이 포인트 20,000",   description: "네이버페이 20,000 포인트 충전 (즉시 사용)",   category: "MobilePay", pointsCost: 20,   faceValue: 20000,    faceCurrency: "KRW", emoji: "💚", gradient: "linear-gradient(135deg, #03C75A, #0e5c2f)", deliveryMethod: "in-app-voucher" },
  { id: "kr-oliveyoung",     countryCode: "KR", supplierRegion: "Korea", brand: "올리브영",        name: "올리브영 15,000원 상품권",   description: "온라인/오프라인 매장 사용 가능",               category: "Beauty",    pointsCost: 15,   faceValue: 15000,    faceCurrency: "KRW", emoji: "💄", gradient: "linear-gradient(135deg, #82d400, #2d5500)", deliveryMethod: "email-code" },
  { id: "kr-tving",          countryCode: "KR", supplierRegion: "Korea", brand: "TVING",         name: "TVING 스탠다드 1개월",      description: "TVING 스탠다드 플랜 1개월 이용권",             category: "Streaming", pointsCost: 14,   faceValue: 13900,    faceCurrency: "KRW", emoji: "📺", gradient: "linear-gradient(135deg, #e4002b, #8b0000)", deliveryMethod: "email-code" },
  { id: "kr-coupang-30k",    countryCode: "KR", supplierRegion: "Korea", brand: "쿠팡",           name: "쿠팡 상품권 30,000원",      description: "쿠팡 전 상품 사용 가능 상품권",                category: "Shopping",  pointsCost: 30,   faceValue: 30000,    faceCurrency: "KRW", emoji: "🛒", gradient: "linear-gradient(135deg, #f74b0d, #8b2a06)", deliveryMethod: "email-code" },

  /* ═════════ JP — Japan ═════════ */
  { id: "jp-starbucks",      countryCode: "JP", supplierRegion: "Japan", brand: "Starbucks JP",  name: "スターバックス ドリンクチケット",   description: "Any drink Tall size, all stores in Japan",     category: "Coffee",    pointsCost: 7,    faceValue: 700,      faceCurrency: "JPY", emoji: "☕", gradient: "linear-gradient(135deg, #006241, #1e3932)", deliveryMethod: "email-code" },
  { id: "jp-rakuten",        countryCode: "JP", supplierRegion: "Japan", brand: "楽天ポイント",     name: "楽天ポイント 2,000",          description: "2,000 Rakuten points for online shopping",    category: "Shopping",  pointsCost: 20,   faceValue: 2000,     faceCurrency: "JPY", emoji: "🛍️", gradient: "linear-gradient(135deg, #bf0000, #660000)", deliveryMethod: "in-app-voucher" },
  { id: "jp-ubereats",       countryCode: "JP", supplierRegion: "Japan", brand: "Uber Eats JP",  name: "Uber Eats 1,500円クーポン",   description: "Uber Eats 1,500円 off on any order",          category: "Food",      pointsCost: 15,   faceValue: 1500,     faceCurrency: "JPY", emoji: "🍜", gradient: "linear-gradient(135deg, #06c167, #003d1f)", deliveryMethod: "in-app-voucher" },
  { id: "jp-amazon-3k",      countryCode: "JP", supplierRegion: "Japan", brand: "Amazon JP",     name: "Amazon ギフト券 3,000円",     description: "Amazon.co.jp ギフト券",                        category: "Shopping",  pointsCost: 30,   faceValue: 3000,     faceCurrency: "JPY", emoji: "📦", gradient: "linear-gradient(135deg, #ff9900, #232f3e)", deliveryMethod: "email-code" },
  { id: "jp-suica",          countryCode: "JP", supplierRegion: "Japan", brand: "Suica",         name: "Suica チャージ 2,000円",      description: "Mobile Suica charge (iOS/Android)",           category: "Transport", pointsCost: 20,   faceValue: 2000,     faceCurrency: "JPY", emoji: "🚇", gradient: "linear-gradient(135deg, #00a550, #004d24)", deliveryMethod: "in-app-voucher" },
  { id: "jp-netflix",        countryCode: "JP", supplierRegion: "Japan", brand: "Netflix JP",    name: "Netflix プリペイド 1,500円",  description: "Netflix JP prepaid card",                     category: "Streaming", pointsCost: 15,   faceValue: 1500,     faceCurrency: "JPY", emoji: "🎬", gradient: "linear-gradient(135deg, #e50914, #221f1f)", deliveryMethod: "email-code" },

  /* ═════════ CN — China (Hong Kong supplier) ═════════ */
  { id: "cn-wechat-50",      countryCode: "CN", supplierRegion: "Hong Kong", brand: "WeChat Pay",   name: "微信红包 50元",              description: "WeChat 红包 50元, instant credit",             category: "MobilePay", pointsCost: 10,   faceValue: 50,       faceCurrency: "CNY", emoji: "💬", gradient: "linear-gradient(135deg, #07c160, #004d1e)", deliveryMethod: "in-app-voucher" },
  { id: "cn-alipay-100",     countryCode: "CN", supplierRegion: "Hong Kong", brand: "Alipay",       name: "支付宝充值 100元",           description: "Alipay account top-up 100 CNY",                category: "MobilePay", pointsCost: 20,   faceValue: 100,      faceCurrency: "CNY", emoji: "💳", gradient: "linear-gradient(135deg, #1677ff, #002d6b)", deliveryMethod: "in-app-voucher" },
  { id: "cn-meituan-30",     countryCode: "CN", supplierRegion: "Hong Kong", brand: "Meituan",      name: "美团外卖券 30元",             description: "Meituan food delivery voucher",                category: "Food",      pointsCost: 6,    faceValue: 30,       faceCurrency: "CNY", emoji: "🥟", gradient: "linear-gradient(135deg, #ffc300, #806000)", deliveryMethod: "in-app-voucher" },
  { id: "cn-jd-150",         countryCode: "CN", supplierRegion: "Hong Kong", brand: "JD.com",       name: "京东 E-card 150元",          description: "JD.com store credit",                          category: "Shopping",  pointsCost: 30,   faceValue: 150,      faceCurrency: "CNY", emoji: "🛍️", gradient: "linear-gradient(135deg, #e1251b, #7a0e0a)", deliveryMethod: "email-code" },
  { id: "cn-didi-25",        countryCode: "CN", supplierRegion: "Hong Kong", brand: "DiDi",         name: "滴滴出行 25元",               description: "DiDi ride credit 25 CNY",                      category: "Transport", pointsCost: 5,    faceValue: 25,       faceCurrency: "CNY", emoji: "🚗", gradient: "linear-gradient(135deg, #ff6900, #663000)", deliveryMethod: "in-app-voucher" },
  { id: "cn-iqiyi",          countryCode: "CN", supplierRegion: "Hong Kong", brand: "iQiyi",        name: "爱奇艺 VIP 1个月",            description: "iQiyi VIP membership 1 month",                 category: "Streaming", pointsCost: 8,    faceValue: 40,       faceCurrency: "CNY", emoji: "📺", gradient: "linear-gradient(135deg, #00be06, #004d02)", deliveryMethod: "email-code" },

  /* ═════════ VN — Vietnam ═════════ */
  { id: "vn-grab-food-100k", countryCode: "VN", supplierRegion: "Vietnam",   brand: "Grab",         name: "GrabFood voucher 100k VND",  description: "100,000 VND off on GrabFood orders",           category: "Food",      pointsCost: 7,    faceValue: 100000,   faceCurrency: "VND", emoji: "🍲", gradient: "linear-gradient(135deg, #00b14f, #003c1b)", deliveryMethod: "in-app-voucher" },
  { id: "vn-grab-bike-50k",  countryCode: "VN", supplierRegion: "Vietnam",   brand: "Grab",         name: "GrabBike 50k VND",          description: "50,000 VND off a GrabBike ride",              category: "Transport", pointsCost: 4,    faceValue: 50000,    faceCurrency: "VND", emoji: "🏍️", gradient: "linear-gradient(135deg, #00b14f, #003c1b)", deliveryMethod: "in-app-voucher" },
  { id: "vn-shopee-200k",    countryCode: "VN", supplierRegion: "Vietnam",   brand: "Shopee VN",    name: "Shopee voucher 200k VND",    description: "Shopee VN 200k VND shopping voucher",          category: "Shopping",  pointsCost: 14,   faceValue: 200000,   faceCurrency: "VND", emoji: "🛒", gradient: "linear-gradient(135deg, #ee4d2d, #6e1c10)", deliveryMethod: "email-code" },
  { id: "vn-momo-150k",      countryCode: "VN", supplierRegion: "Vietnam",   brand: "Momo",         name: "Momo 150k VND 충전",         description: "Momo wallet top-up 150,000 VND",               category: "MobilePay", pointsCost: 10,   faceValue: 150000,   faceCurrency: "VND", emoji: "💜", gradient: "linear-gradient(135deg, #a50064, #4a002c)", deliveryMethod: "in-app-voucher" },
  { id: "vn-highlands",      countryCode: "VN", supplierRegion: "Vietnam",   brand: "Highlands Coffee", name: "Highlands 60k VND",      description: "Highlands Coffee 60,000 VND voucher",          category: "Coffee",    pointsCost: 4,    faceValue: 60000,    faceCurrency: "VND", emoji: "☕", gradient: "linear-gradient(135deg, #8b2d00, #3d1400)", deliveryMethod: "email-code" },

  /* ═════════ SG — Singapore ═════════ */
  { id: "sg-grab-5",         countryCode: "SG", supplierRegion: "Singapore", brand: "Grab",         name: "Grab S$5 voucher",           description: "Use on GrabFood, GrabCar, or GrabMart",        category: "Transport", pointsCost: 5,    faceValue: 5,        faceCurrency: "SGD", emoji: "🚕", gradient: "linear-gradient(135deg, #00b14f, #003c1b)", deliveryMethod: "in-app-voucher" },
  { id: "sg-foodpanda-10",   countryCode: "SG", supplierRegion: "Singapore", brand: "Foodpanda",    name: "Foodpanda S$10",             description: "S$10 off any Foodpanda order",                 category: "Food",      pointsCost: 10,   faceValue: 10,       faceCurrency: "SGD", emoji: "🐼", gradient: "linear-gradient(135deg, #d70f64, #5a0329)", deliveryMethod: "in-app-voucher" },
  { id: "sg-ntuc-20",        countryCode: "SG", supplierRegion: "Singapore", brand: "NTUC FairPrice", name: "FairPrice S$20",           description: "FairPrice supermarket e-voucher",              category: "Shopping",  pointsCost: 20,   faceValue: 20,       faceCurrency: "SGD", emoji: "🛒", gradient: "linear-gradient(135deg, #e30613, #6b0309)", deliveryMethod: "email-code" },
  { id: "sg-starbucks-sg",   countryCode: "SG", supplierRegion: "Singapore", brand: "Starbucks SG", name: "Starbucks S$6",              description: "Any drink Tall size",                          category: "Coffee",    pointsCost: 6,    faceValue: 6,        faceCurrency: "SGD", emoji: "☕", gradient: "linear-gradient(135deg, #006241, #1e3932)", deliveryMethod: "email-code" },

  /* ═════════ US (International USD-contract fallback) ═════════ */
  { id: "us-starbucks-10",   countryCode: "US", supplierRegion: "USA",       brand: "Starbucks",    name: "Starbucks US$10",            description: "Starbucks eGift, redeemable at US stores",     category: "Coffee",    pointsCost: 10,   faceValue: 10,       faceCurrency: "USD", emoji: "☕", gradient: "linear-gradient(135deg, #006241, #1e3932)", deliveryMethod: "email-code" },
  { id: "us-amazon-25",      countryCode: "US", supplierRegion: "USA",       brand: "Amazon",       name: "Amazon US$25",               description: "Amazon.com eGift card",                        category: "Shopping",  pointsCost: 25,   faceValue: 25,       faceCurrency: "USD", emoji: "📦", gradient: "linear-gradient(135deg, #ff9900, #232f3e)", deliveryMethod: "email-code" },
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
export type Tier = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface TierDef {
  name: Tier;
  minBookings: number;
  multiplier: number;
  color: string;
  icon: string;
}
export const TIERS: TierDef[] = [
  { name: "Bronze",   minBookings: 0,   multiplier: 1.0, color: "#a16b3f", icon: "🥉" },
  { name: "Silver",   minBookings: 50,  multiplier: 1.1, color: "#94a3b8", icon: "🥈" },
  { name: "Gold",     minBookings: 200, multiplier: 1.2, color: "#eab308", icon: "🥇" },
  { name: "Platinum", minBookings: 500, multiplier: 1.3, color: "#8b5cf6", icon: "💎" },
];
export function tierFor(bookingCount: number): TierDef {
  for (let i = TIERS.length - 1; i >= 0; i--) if (bookingCount >= TIERS[i].minBookings) return TIERS[i];
  return TIERS[0];
}
export function nextTier(bookingCount: number): TierDef | null {
  const current = tierFor(bookingCount);
  const idx = TIERS.findIndex(t => t.name === current.name);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
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
}

export const userPointsState: Record<string, UserPointsState> = {
  /* TravelCo (Korea) */
  "master@dotbiz.com":       { userEmail: "master@dotbiz.com",       customerCompanyId: "comp-001", countryCode: "KR", balance: 185,  totalEarned: 242,  totalUsed: 57,  bookingCount: 84,  milestonesReached: ["welcome", "m10", "m50"], joinedAt: "2024-03-15" },
  "op@dotbiz.com":           { userEmail: "op@dotbiz.com",           customerCompanyId: "comp-001", countryCode: "KR", balance: 96,   totalEarned: 132,  totalUsed: 36,  bookingCount: 47,  milestonesReached: ["welcome", "m10"],         joinedAt: "2024-04-02" },
  "kevin@travelco.com":      { userEmail: "kevin@travelco.com",      customerCompanyId: "comp-001", countryCode: "KR", balance: 42,   totalEarned: 55,   totalUsed: 13,  bookingCount: 18,  milestonesReached: ["welcome", "m10"],         joinedAt: "2025-06-10" },
  "emma@travelco.com":       { userEmail: "emma@travelco.com",       customerCompanyId: "comp-001", countryCode: "KR", balance: 28,   totalEarned: 31,   totalUsed: 3,   bookingCount: 11,  milestonesReached: ["welcome", "m10"],         joinedAt: "2025-09-08" },
  "daniel@travelco.com":     { userEmail: "daniel@travelco.com",     customerCompanyId: "comp-001", countryCode: "KR", balance: 8,    totalEarned: 8,    totalUsed: 0,   bookingCount: 2,   milestonesReached: ["welcome"],                 joinedAt: "2025-11-20" },
  /* Asia Tours (Korea, PREPAY) */
  "prepay@dotbiz.com":       { userEmail: "prepay@dotbiz.com",       customerCompanyId: "comp-002", countryCode: "KR", balance: 64,   totalEarned: 89,   totalUsed: 25,  bookingCount: 32,  milestonesReached: ["welcome", "m10"],         joinedAt: "2024-06-01" },
  "hiroshi@asiatours.com":   { userEmail: "hiroshi@asiatours.com",   customerCompanyId: "comp-002", countryCode: "KR", balance: 18,   totalEarned: 22,   totalUsed: 4,   bookingCount: 9,   milestonesReached: ["welcome"],                 joinedAt: "2024-08-12" },
  /* GOTADI (Vietnam) */
  "gotadi@dotbiz.com":       { userEmail: "gotadi@dotbiz.com",       customerCompanyId: "comp-010", countryCode: "VN", balance: 112,  totalEarned: 165,  totalUsed: 53,  bookingCount: 62,  milestonesReached: ["welcome", "m10", "m50"], joinedAt: "2024-09-15" },
  "mai@gotadi.com":          { userEmail: "mai@gotadi.com",          customerCompanyId: "comp-010", countryCode: "VN", balance: 56,   totalEarned: 73,   totalUsed: 17,  bookingCount: 29,  milestonesReached: ["welcome", "m10"],         joinedAt: "2024-10-01" },
  "phong@gotadi.com":        { userEmail: "phong@gotadi.com",        customerCompanyId: "comp-010", countryCode: "VN", balance: 38,   totalEarned: 48,   totalUsed: 10,  bookingCount: 21,  milestonesReached: ["welcome", "m10"],         joinedAt: "2024-10-01" },
  "linh@gotadi.com":         { userEmail: "linh@gotadi.com",         customerCompanyId: "comp-010", countryCode: "VN", balance: 22,   totalEarned: 22,   totalUsed: 0,   bookingCount: 8,   milestonesReached: ["welcome"],                 joinedAt: "2025-02-14" },
  /* VVC (Vietnam, PREPAY) */
  "vvc@dotbiz.com":          { userEmail: "vvc@dotbiz.com",          customerCompanyId: "comp-011", countryCode: "VN", balance: 48,   totalEarned: 62,   totalUsed: 14,  bookingCount: 25,  milestonesReached: ["welcome", "m10"],         joinedAt: "2025-01-20" },
  /* Accounting (demo) */
  "accounting@dotbiz.com":   { userEmail: "accounting@dotbiz.com",   customerCompanyId: "comp-001", countryCode: "KR", balance: 0,    totalEarned: 0,    totalUsed: 0,   bookingCount: 0,   milestonesReached: [],                          joinedAt: "2025-11-20" },
};

/* ── Points transactions (per-user history) ── */
export type PointsTxType = "Earned-Booking" | "Earned-Welcome" | "Earned-Milestone" | "Earned-Tier-Bonus" | "Used-Redeem" | "Expired";
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
  { id: "ptx-001", userEmail: "master@dotbiz.com", date: "2026-04-20", type: "Earned-Booking",  description: "Booking K26041511201H01 · Fairmont SG",     amount: 2, balance: 185, bookingId: "bk-016" },
  { id: "ptx-002", userEmail: "master@dotbiz.com", date: "2026-04-15", type: "Used-Redeem",     description: "Redeemed CGV 영화 관람권",                amount: -14, balance: 183, productId: "kr-cgv" },
  { id: "ptx-003", userEmail: "master@dotbiz.com", date: "2026-04-10", type: "Earned-Booking",  description: "Booking K26031016208H01 · ANA Osaka",       amount: 3,  balance: 197, bookingId: "bk-004" },
  { id: "ptx-004", userEmail: "master@dotbiz.com", date: "2026-03-28", type: "Earned-Milestone",description: "🌱 10 Bookings milestone",                amount: 1,  balance: 194, },
  { id: "ptx-005", userEmail: "master@dotbiz.com", date: "2026-03-20", type: "Earned-Booking",  description: "Booking K26032014532H01 · Grand Hyatt Seoul", amount: 1, balance: 193, bookingId: "bk-001" },
  /* OP @ TravelCo */
  { id: "ptx-101", userEmail: "op@dotbiz.com",     date: "2026-04-18", type: "Earned-Booking",  description: "Booking K26041209084H01 · Banyan Tree Seoul",amount: 1,  balance: 96,  bookingId: "bk-017" },
  { id: "ptx-102", userEmail: "op@dotbiz.com",     date: "2026-04-10", type: "Used-Redeem",     description: "Redeemed 스타벅스 아메리카노",              amount: -5, balance: 95, productId: "kr-starbucks-5k" },
  { id: "ptx-103", userEmail: "op@dotbiz.com",     date: "2026-04-01", type: "Earned-Booking",  description: "Booking K26040109301H01 · Park Hyatt Saigon", amount: 1, balance: 100, bookingId: "bk-009" },
  /* GOTADI master (VN) */
  { id: "ptx-201", userEmail: "gotadi@dotbiz.com", date: "2026-04-20", type: "Earned-Booking",  description: "Booking K26042016224H01 · Metropole Hanoi", amount: 11, balance: 112, bookingId: "bk-023" },
  { id: "ptx-202", userEmail: "gotadi@dotbiz.com", date: "2026-04-15", type: "Used-Redeem",     description: "Redeemed GrabFood 100k VND",              amount: -7, balance: 101, productId: "vn-grab-food-100k" },
  { id: "ptx-203", userEmail: "gotadi@dotbiz.com", date: "2026-04-05", type: "Earned-Milestone",description: "⭐ 50 Bookings milestone",                amount: 5,  balance: 108, },
  { id: "ptx-204", userEmail: "gotadi@dotbiz.com", date: "2026-04-01", type: "Earned-Booking",  description: "Booking K26040109301H01 · Park Hyatt Saigon", amount: 13, balance: 103, bookingId: "bk-009" },
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
