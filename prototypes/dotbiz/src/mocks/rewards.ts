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
}

export const rewardProducts: RewardProduct[] = [
  /* ═════════ KR — Korea (local suppliers) ═════════ */
  { id: "kr-starbucks-5k",   countryCode: "KR", supplierRegion: "Korea", brand: "Starbucks",     name: "스타벅스 아메리카노",      description: "Tall Americano 기프티콘, 전국 매장 사용 가능", category: "Coffee",    pointsCost: 3,    faceValue: 4500,     faceCurrency: "KRW", emoji: "☕", gradient: "linear-gradient(135deg, #006241, #1e3932)", deliveryMethod: "email-code", isBestSeller: true, monthlyRedemptions: 1842 },
  { id: "kr-starbucks-tx",   countryCode: "KR", supplierRegion: "Korea", brand: "Starbucks",     name: "스타벅스 디저트 세트",      description: "아메리카노 + 조각케이크 세트 기프티콘",     category: "Coffee",    pointsCost: 8,    faceValue: 11000,    faceCurrency: "KRW", emoji: "🍰", gradient: "linear-gradient(135deg, #006241, #a97c50)", deliveryMethod: "email-code" },
  { id: "kr-kakao-taxi",     countryCode: "KR", supplierRegion: "Korea", brand: "Kakao T",       name: "카카오T 블루 5,000원",      description: "카카오T 블루 택시 쿠폰 5,000원",              category: "Transport", pointsCost: 3,    faceValue: 5000,     faceCurrency: "KRW", emoji: "🚕", gradient: "linear-gradient(135deg, #FEE500, #3C1E1E)", deliveryMethod: "in-app-voucher" },
  { id: "kr-cgv",            countryCode: "KR", supplierRegion: "Korea", brand: "CGV",           name: "CGV 영화 관람권",          description: "CGV 2D 일반 영화 1매",                         category: "Entertainment" as RewardCategory, pointsCost: 10, faceValue: 14000, faceCurrency: "KRW", emoji: "🎬", gradient: "linear-gradient(135deg, #dc0000, #1a1a1a)", deliveryMethod: "email-code" },
  { id: "kr-baemin",         countryCode: "KR", supplierRegion: "Korea", brand: "배달의민족",      name: "배민 상품권 10,000원",      description: "배달의민족 배달 주문 10,000원 상품권",        category: "Food",      pointsCost: 7,    faceValue: 10000,    faceCurrency: "KRW", emoji: "🍱", gradient: "linear-gradient(135deg, #00c9a7, #004d40)", deliveryMethod: "in-app-voucher", isBestSeller: true, monthlyRedemptions: 1203 },
  { id: "kr-naverpay-20k",   countryCode: "KR", supplierRegion: "Korea", brand: "네이버페이",      name: "네이버페이 포인트 20,000",   description: "네이버페이 20,000 포인트 충전 (즉시 사용)",   category: "MobilePay", pointsCost: 14,   faceValue: 20000,    faceCurrency: "KRW", emoji: "💚", gradient: "linear-gradient(135deg, #03C75A, #0e5c2f)", deliveryMethod: "in-app-voucher", isBestSeller: true, monthlyRedemptions: 987 },
  { id: "kr-oliveyoung",     countryCode: "KR", supplierRegion: "Korea", brand: "올리브영",        name: "올리브영 15,000원 상품권",   description: "온라인/오프라인 매장 사용 가능",               category: "Beauty",    pointsCost: 10,   faceValue: 15000,    faceCurrency: "KRW", emoji: "💄", gradient: "linear-gradient(135deg, #82d400, #2d5500)", deliveryMethod: "email-code" },
  { id: "kr-tving",          countryCode: "KR", supplierRegion: "Korea", brand: "TVING",         name: "TVING 스탠다드 1개월",      description: "TVING 스탠다드 플랜 1개월 이용권",             category: "Streaming", pointsCost: 10,   faceValue: 13900,    faceCurrency: "KRW", emoji: "📺", gradient: "linear-gradient(135deg, #e4002b, #8b0000)", deliveryMethod: "email-code" },
  { id: "kr-coupang-30k",    countryCode: "KR", supplierRegion: "Korea", brand: "쿠팡",           name: "쿠팡 상품권 30,000원",      description: "쿠팡 전 상품 사용 가능 상품권",                category: "Shopping",  pointsCost: 20,   faceValue: 30000,    faceCurrency: "KRW", emoji: "🛒", gradient: "linear-gradient(135deg, #f74b0d, #8b2a06)", deliveryMethod: "email-code" },

  /* ═════════ JP — Japan ═════════ */
  { id: "jp-starbucks",      countryCode: "JP", supplierRegion: "Japan", brand: "Starbucks JP",  name: "スターバックス ドリンクチケット",   description: "Any drink Tall size, all stores in Japan",     category: "Coffee",    pointsCost: 5,    faceValue: 700,      faceCurrency: "JPY", emoji: "☕", gradient: "linear-gradient(135deg, #006241, #1e3932)", deliveryMethod: "email-code", isBestSeller: true, monthlyRedemptions: 624 },
  { id: "jp-rakuten",        countryCode: "JP", supplierRegion: "Japan", brand: "楽天ポイント",     name: "楽天ポイント 2,000",          description: "2,000 Rakuten points for online shopping",    category: "Shopping",  pointsCost: 14,   faceValue: 2000,     faceCurrency: "JPY", emoji: "🛍️", gradient: "linear-gradient(135deg, #bf0000, #660000)", deliveryMethod: "in-app-voucher" },
  { id: "jp-ubereats",       countryCode: "JP", supplierRegion: "Japan", brand: "Uber Eats JP",  name: "Uber Eats 1,500円クーポン",   description: "Uber Eats 1,500円 off on any order",          category: "Food",      pointsCost: 10,   faceValue: 1500,     faceCurrency: "JPY", emoji: "🍜", gradient: "linear-gradient(135deg, #06c167, #003d1f)", deliveryMethod: "in-app-voucher" },
  { id: "jp-amazon-3k",      countryCode: "JP", supplierRegion: "Japan", brand: "Amazon JP",     name: "Amazon ギフト券 3,000円",     description: "Amazon.co.jp ギフト券",                        category: "Shopping",  pointsCost: 20,   faceValue: 3000,     faceCurrency: "JPY", emoji: "📦", gradient: "linear-gradient(135deg, #ff9900, #232f3e)", deliveryMethod: "email-code" },
  { id: "jp-suica",          countryCode: "JP", supplierRegion: "Japan", brand: "Suica",         name: "Suica チャージ 2,000円",      description: "Mobile Suica charge (iOS/Android)",           category: "Transport", pointsCost: 14,   faceValue: 2000,     faceCurrency: "JPY", emoji: "🚇", gradient: "linear-gradient(135deg, #00a550, #004d24)", deliveryMethod: "in-app-voucher" },
  { id: "jp-netflix",        countryCode: "JP", supplierRegion: "Japan", brand: "Netflix JP",    name: "Netflix プリペイド 1,500円",  description: "Netflix JP prepaid card",                     category: "Streaming", pointsCost: 10,   faceValue: 1500,     faceCurrency: "JPY", emoji: "🎬", gradient: "linear-gradient(135deg, #e50914, #221f1f)", deliveryMethod: "email-code" },

  /* ═════════ CN — China (Hong Kong supplier) ═════════ */
  { id: "cn-wechat-50",      countryCode: "CN", supplierRegion: "Hong Kong", brand: "WeChat Pay",   name: "微信红包 50元",              description: "WeChat 红包 50元, instant credit",             category: "MobilePay", pointsCost: 7,    faceValue: 50,       faceCurrency: "CNY", emoji: "💬", gradient: "linear-gradient(135deg, #07c160, #004d1e)", deliveryMethod: "in-app-voucher" },
  { id: "cn-alipay-100",     countryCode: "CN", supplierRegion: "Hong Kong", brand: "Alipay",       name: "支付宝充值 100元",           description: "Alipay account top-up 100 CNY",                category: "MobilePay", pointsCost: 14,   faceValue: 100,      faceCurrency: "CNY", emoji: "💳", gradient: "linear-gradient(135deg, #1677ff, #002d6b)", deliveryMethod: "in-app-voucher" },
  { id: "cn-meituan-30",     countryCode: "CN", supplierRegion: "Hong Kong", brand: "Meituan",      name: "美团外卖券 30元",             description: "Meituan food delivery voucher",                category: "Food",      pointsCost: 4,    faceValue: 30,       faceCurrency: "CNY", emoji: "🥟", gradient: "linear-gradient(135deg, #ffc300, #806000)", deliveryMethod: "in-app-voucher" },
  { id: "cn-jd-150",         countryCode: "CN", supplierRegion: "Hong Kong", brand: "JD.com",       name: "京东 E-card 150元",          description: "JD.com store credit",                          category: "Shopping",  pointsCost: 20,   faceValue: 150,      faceCurrency: "CNY", emoji: "🛍️", gradient: "linear-gradient(135deg, #e1251b, #7a0e0a)", deliveryMethod: "email-code" },
  { id: "cn-didi-25",        countryCode: "CN", supplierRegion: "Hong Kong", brand: "DiDi",         name: "滴滴出行 25元",               description: "DiDi ride credit 25 CNY",                      category: "Transport", pointsCost: 3,    faceValue: 25,       faceCurrency: "CNY", emoji: "🚗", gradient: "linear-gradient(135deg, #ff6900, #663000)", deliveryMethod: "in-app-voucher" },
  { id: "cn-iqiyi",          countryCode: "CN", supplierRegion: "Hong Kong", brand: "iQiyi",        name: "爱奇艺 VIP 1个月",            description: "iQiyi VIP membership 1 month",                 category: "Streaming", pointsCost: 5,    faceValue: 40,       faceCurrency: "CNY", emoji: "📺", gradient: "linear-gradient(135deg, #00be06, #004d02)", deliveryMethod: "email-code" },

  /* ═════════ VN — Vietnam ═════════ */
  { id: "vn-grab-food-100k", countryCode: "VN", supplierRegion: "Vietnam",   brand: "Grab",         name: "GrabFood voucher 100k VND",  description: "100,000 VND off on GrabFood orders",           category: "Food",      pointsCost: 5,    faceValue: 100000,   faceCurrency: "VND", emoji: "🍲", gradient: "linear-gradient(135deg, #00b14f, #003c1b)", deliveryMethod: "in-app-voucher", isBestSeller: true, monthlyRedemptions: 512 },
  { id: "vn-grab-bike-50k",  countryCode: "VN", supplierRegion: "Vietnam",   brand: "Grab",         name: "GrabBike 50k VND",          description: "50,000 VND off a GrabBike ride",              category: "Transport", pointsCost: 3,    faceValue: 50000,    faceCurrency: "VND", emoji: "🏍️", gradient: "linear-gradient(135deg, #00b14f, #003c1b)", deliveryMethod: "in-app-voucher" },
  { id: "vn-shopee-200k",    countryCode: "VN", supplierRegion: "Vietnam",   brand: "Shopee VN",    name: "Shopee voucher 200k VND",    description: "Shopee VN 200k VND shopping voucher",          category: "Shopping",  pointsCost: 10,   faceValue: 200000,   faceCurrency: "VND", emoji: "🛒", gradient: "linear-gradient(135deg, #ee4d2d, #6e1c10)", deliveryMethod: "email-code" },
  { id: "vn-momo-150k",      countryCode: "VN", supplierRegion: "Vietnam",   brand: "Momo",         name: "Momo 150k VND 충전",         description: "Momo wallet top-up 150,000 VND",               category: "MobilePay", pointsCost: 7,    faceValue: 150000,   faceCurrency: "VND", emoji: "💜", gradient: "linear-gradient(135deg, #a50064, #4a002c)", deliveryMethod: "in-app-voucher" },
  { id: "vn-highlands",      countryCode: "VN", supplierRegion: "Vietnam",   brand: "Highlands Coffee", name: "Highlands 60k VND",      description: "Highlands Coffee 60,000 VND voucher",          category: "Coffee",    pointsCost: 3,    faceValue: 60000,    faceCurrency: "VND", emoji: "☕", gradient: "linear-gradient(135deg, #8b2d00, #3d1400)", deliveryMethod: "email-code" },

  /* ═════════ SG — Singapore ═════════ */
  { id: "sg-grab-5",         countryCode: "SG", supplierRegion: "Singapore", brand: "Grab",         name: "Grab S$5 voucher",           description: "Use on GrabFood, GrabCar, or GrabMart",        category: "Transport", pointsCost: 3,    faceValue: 5,        faceCurrency: "SGD", emoji: "🚕", gradient: "linear-gradient(135deg, #00b14f, #003c1b)", deliveryMethod: "in-app-voucher" },
  { id: "sg-foodpanda-10",   countryCode: "SG", supplierRegion: "Singapore", brand: "Foodpanda",    name: "Foodpanda S$10",             description: "S$10 off any Foodpanda order",                 category: "Food",      pointsCost: 7,    faceValue: 10,       faceCurrency: "SGD", emoji: "🐼", gradient: "linear-gradient(135deg, #d70f64, #5a0329)", deliveryMethod: "in-app-voucher" },
  { id: "sg-ntuc-20",        countryCode: "SG", supplierRegion: "Singapore", brand: "NTUC FairPrice", name: "FairPrice S$20",           description: "FairPrice supermarket e-voucher",              category: "Shopping",  pointsCost: 14,   faceValue: 20,       faceCurrency: "SGD", emoji: "🛒", gradient: "linear-gradient(135deg, #e30613, #6b0309)", deliveryMethod: "email-code" },
  { id: "sg-starbucks-sg",   countryCode: "SG", supplierRegion: "Singapore", brand: "Starbucks SG", name: "Starbucks S$6",              description: "Any drink Tall size",                          category: "Coffee",    pointsCost: 4,    faceValue: 6,        faceCurrency: "SGD", emoji: "☕", gradient: "linear-gradient(135deg, #006241, #1e3932)", deliveryMethod: "email-code" },

  /* ═════════ US (International USD-contract fallback) ═════════ */
  { id: "us-starbucks-10",   countryCode: "US", supplierRegion: "USA",       brand: "Starbucks",    name: "Starbucks US$10",            description: "Starbucks eGift, redeemable at US stores",     category: "Coffee",    pointsCost: 7,    faceValue: 10,       faceCurrency: "USD", emoji: "☕", gradient: "linear-gradient(135deg, #006241, #1e3932)", deliveryMethod: "email-code" },
  { id: "us-amazon-25",      countryCode: "US", supplierRegion: "USA",       brand: "Amazon",       name: "Amazon US$25",               description: "Amazon.com eGift card",                        category: "Shopping",  pointsCost: 17,   faceValue: 25,       faceCurrency: "USD", emoji: "📦", gradient: "linear-gradient(135deg, #ff9900, #232f3e)", deliveryMethod: "email-code" },
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
export type Tier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

export interface TierDef {
  name: Tier;
  minBookings: number;
  maxBookings: number;       /* exclusive upper bound (Diamond = Infinity) */
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
    minBookings: 0, maxBookings: 50,
    multiplier: 1.0,
    color: "#a16b3f", colorSoft: "#a16b3f18",
    gradient: "linear-gradient(135deg, #d4a373, #a16b3f, #6d4424)",
    ring: "#c69266", glow: "#a16b3f33",
    icon: "🥉",
    tagline: "The beginning of a long journey",
    globalPct: 42,
    perks: ["1.0× ELS earn rate", "Standard support"],
  },
  {
    name: "Silver",
    minBookings: 50, maxBookings: 200,
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
    minBookings: 200, maxBookings: 500,
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
    minBookings: 500, maxBookings: 1500,
    multiplier: 1.3,
    color: "#7c7aa7", colorSoft: "#8b9dc320",
    gradient: "linear-gradient(135deg, #e0e7ff, #a5b4fc, #6366f1)",
    ring: "#a5b4fc", glow: "#6366f144",
    icon: "💠",
    tagline: "Among the best",
    globalPct: 5,
    perks: ["1.3× ELS earn rate", "Dedicated account manager", "VIP room upgrades"],
  },
  {
    name: "Diamond",
    minBookings: 1500, maxBookings: Number.POSITIVE_INFINITY,
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

/* ── ELS (Ellis Coin) constants ──
 * ELS is the coin-style rebrand of OP personal points. 1 ELS = 1 USD (peg).
 * Builds on the earn-rate table above — the underlying ledger is the same
 * state (balance / totalEarned / totalUsed); we just surface it as coins
 * with transfer capability added on top. */
export const ELS_USD_PEG = 1;                   /* 1 ELS = 1 USD */
export const ELS_TRANSFER_FEE_PCT = 0;          /* free transfers (P2P) */
export const ELS_DAILY_TRANSFER_LIMIT = 1000;   /* anti-abuse: 1,000 ELS / day / user */

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
  { id: "first-send",     category: "First",     rarity: "Rare",      emoji: "💸", title: "First Send",          hint: "Send ELS to another OP for the first time",        accent: "#FF6000", globalEarnedPct: 24,  bonusEls: 15 },
  { id: "first-receive",  category: "First",     rarity: "Rare",      emoji: "📬", title: "First Receive",       hint: "Receive ELS from a teammate",                      accent: "#06D6A0", globalEarnedPct: 22,  bonusEls: 15 },
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
  const firstBookingTx = txs.filter(t => t.type === "Earned-Booking").sort((a, b) => a.date.localeCompare(b.date))[0];
  const firstRedeemTx  = txs.filter(t => t.type === "Used-Redeem").sort((a, b) => a.date.localeCompare(b.date))[0];
  const firstSendTx    = txs.filter(t => t.type === "Sent-Transfer").sort((a, b) => a.date.localeCompare(b.date))[0];
  const firstRecvTx    = txs.filter(t => t.type === "Received-Transfer").sort((a, b) => a.date.localeCompare(b.date))[0];

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
      case "first-send":
        earned = !!firstSendTx;
        progress = firstSendTx ? 1 : 0;
        progressLabel = "Send ELS once";
        earnedAt = firstSendTx?.date;
        break;
      case "first-receive":
        earned = !!firstRecvTx;
        progress = firstRecvTx ? 1 : 0;
        progressLabel = "Receive ELS once";
        earnedAt = firstRecvTx?.date;
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
  "first-send",        /* Rare    — new coin mechanic */
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
 * Applied as `floor(usd * ELS_BOOKING_EARN_RATE)`.
 * 0.01 = 1 ELS per $100. Tunable. */
export const ELS_BOOKING_EARN_RATE = 0.01;

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
  return b;
}

/* Compute expected ELS for a booking: base × tier × hotel boost.
 * Base earn rate is cost-calibrated to 1 ELS per $100 (0.01/$). */
export function estimatedElsForBooking(params: {
  usdValue: number;
  bookingCount: number;       /* for tier */
  hotelId?: string;
}): { base: number; tierMultiplier: number; hotelBoost: number; total: number; breakdown: string } {
  const base = Math.max(1, Math.round(params.usdValue * ELS_BOOKING_EARN_RATE));
  const tier = tierFor(params.bookingCount);
  const boost = params.hotelId ? hotelPointsBoost(params.hotelId) : null;
  const hotelBoost = boost?.multiplier ?? 1;
  const total = Math.max(1, Math.round(base * tier.multiplier * hotelBoost));
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
export type PointsTxType = "Earned-Booking" | "Earned-Welcome" | "Earned-Milestone" | "Earned-Tier-Bonus" | "Used-Redeem" | "Received-Transfer" | "Sent-Transfer" | "Expired";
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
  /* For Received-Transfer / Sent-Transfer */
  counterpartyEmail?: string;
  counterpartyName?: string;
  transferReason?: string;
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

  /* ── Cross-OP ELS transfers (new) ── */
  { id: "ptx-300", userEmail: "master@dotbiz.com", date: "2026-04-18", type: "Sent-Transfer",     description: "Sent 20 ELS to Mai (GOTADI)",              amount: -20, balance: 185, counterpartyEmail: "mai@gotadi.com",       counterpartyName: "Tran Thi Mai",  transferReason: "Thanks for the Hanoi handover" },
  { id: "ptx-301", userEmail: "mai@gotadi.com",    date: "2026-04-18", type: "Received-Transfer", description: "Received 20 ELS from James (TravelCo)",    amount: 20,  balance: 56,  counterpartyEmail: "master@dotbiz.com",   counterpartyName: "James Park",    transferReason: "Thanks for the Hanoi handover" },
  { id: "ptx-302", userEmail: "op@dotbiz.com",     date: "2026-04-12", type: "Received-Transfer", description: "Received 10 ELS from Jennifer (Asia Tours)", amount: 10,  balance: 96,  counterpartyEmail: "prepay@dotbiz.com",    counterpartyName: "Jennifer Wu",   transferReason: "Shared booking reward split" },
  { id: "ptx-303", userEmail: "prepay@dotbiz.com", date: "2026-04-12", type: "Sent-Transfer",     description: "Sent 10 ELS to Sarah (TravelCo)",          amount: -10, balance: 64,  counterpartyEmail: "op@dotbiz.com",        counterpartyName: "Sarah Kim",     transferReason: "Shared booking reward split" },
];

/* ── Directory of ELS-eligible recipients (all users with points state) ──
 * Real implementation: ELLIS /api/users/search?q=... endpoint.
 * For prototype, the union of userPointsState entries + their display names
 * gathered from the matching SubAccount rows. */
export function elsDirectoryFor(): { email: string; name: string; company: string; country: string }[] {
  /* Synthesize from userPointsState — name is derived from the matching
   * mock SubAccount via a lightweight lookup; we avoid tight coupling by
   * inlining a small mapping here. */
  const NAMES: Record<string, { name: string; company: string; country: string }> = {
    "master@dotbiz.com":     { name: "James Park",     company: "TravelCo International", country: "🇰🇷 Korea" },
    "op@dotbiz.com":         { name: "Sarah Kim",      company: "TravelCo International", country: "🇰🇷 Korea" },
    "accounting@dotbiz.com": { name: "Daniel Choi",    company: "TravelCo International", country: "🇰🇷 Korea" },
    "kevin@travelco.com":    { name: "Kevin Lee",      company: "TravelCo International", country: "🇰🇷 Korea" },
    "emma@travelco.com":     { name: "Emma Wilson",    company: "TravelCo International", country: "🇰🇷 Korea" },
    "daniel@travelco.com":   { name: "Daniel Choi",    company: "TravelCo International", country: "🇰🇷 Korea" },
    "prepay@dotbiz.com":     { name: "Jennifer Wu",    company: "Asia Tours Ltd.",        country: "🇰🇷 Korea" },
    "hiroshi@asiatours.com": { name: "Hiroshi Sato",   company: "Asia Tours Ltd.",        country: "🇰🇷 Korea" },
    "alex@asiatours.com":    { name: "Alex Chen",      company: "Asia Tours Ltd.",        country: "🇰🇷 Korea" },
    "gotadi@dotbiz.com":     { name: "Nguyen Van An",  company: "GOTADI",         country: "🇻🇳 Vietnam" },
    "mai@gotadi.com":        { name: "Tran Thi Mai",   company: "GOTADI",         country: "🇻🇳 Vietnam" },
    "phong@gotadi.com":      { name: "Le Quoc Phong",  company: "GOTADI",         country: "🇻🇳 Vietnam" },
    "linh@gotadi.com":       { name: "Pham Thuy Linh", company: "GOTADI",         country: "🇻🇳 Vietnam" },
    "vvc@dotbiz.com":        { name: "Vu Thi Hoa",     company: "Vietnam Vacation Co",   country: "🇻🇳 Vietnam" },
    "anh@vietnamvacation.vn":{ name: "Dang Minh Anh",  company: "Vietnam Vacation Co",   country: "🇻🇳 Vietnam" },
  };
  return Object.keys(userPointsState).map(email => ({
    email,
    ...(NAMES[email] || { name: email.split("@")[0], company: "—", country: "—" }),
  }));
}

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
