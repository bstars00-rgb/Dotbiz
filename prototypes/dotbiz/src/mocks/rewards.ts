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
  const firstBookingTx = txs.filter(t => t.type === "Earned-Booking").sort((a, b) => a.date.localeCompare(b.date))[0];
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
 * Company Pool — 회사 단위 ELS 풀 (Master만 운용)
 * ════════════════════════════════════════════════════════════════════
 * 개념:
 *   • 개인 OP ELS와 별개의 회사 단위 풀
 *   • 적립 트리거: 정산 우수, 분쟁 0건, B2C Featured 리뷰, 회사 단위 미션 등
 *     (수치는 추후 결정 — 마케팅팀 협의)
 *   • 운용 권한: Master만. OP는 조회 불가
 *   • 사용 출구: OP 분배 / Charity 기부 / 회사 이벤트 / Spending(예약 차감)에 매칭
 *   • 양도 정책: 회사 외부로는 송금 불가 (개인 ELS와 동일 비양도)
 *
 * 회사 구성 패턴별 동작:
 *   • Master + OP 다수 → 모든 적립은 OP 개인. Company Pool은 정산 보너스 등 별도 트리거만.
 *   • Solo Master (OP 0명) → Master가 OP 역할 겸업, 개인 ELS로 적립.
 *     Company Pool도 함께 보유 (정산 보너스 등). isSoloMasterCompany() 헬퍼 참조.
 */

export interface CompanyPool {
  customerCompanyId: string;
  balance: number;
  totalEarned: number;       /* 회사 차원 누적 (정산 우수, B2C Featured 리뷰 등 — 추후) */
  totalDistributed: number;  /* OP에게 분배된 누적 */
  totalCharity: number;      /* 기부된 누적 */
  lastActivityDate: string;
}

export const companyPools: CompanyPool[] = [
  /* 시드 데이터는 골격만 — 적립 트리거/금액은 추후 결정 */
  { customerCompanyId: "comp-001", balance: 0,  totalEarned: 0,  totalDistributed: 0,  totalCharity: 0,  lastActivityDate: "2026-04-01" },
  { customerCompanyId: "comp-002", balance: 0,  totalEarned: 0,  totalDistributed: 0,  totalCharity: 0,  lastActivityDate: "2026-04-01" },
  { customerCompanyId: "comp-010", balance: 0,  totalEarned: 0,  totalDistributed: 0,  totalCharity: 0,  lastActivityDate: "2026-04-01" },
  { customerCompanyId: "comp-011", balance: 0,  totalEarned: 0,  totalDistributed: 0,  totalCharity: 0,  lastActivityDate: "2026-04-01" },
];

export function companyPoolFor(companyId: string): CompanyPool | null {
  return companyPools.find(p => p.customerCompanyId === companyId) || null;
}

export type CompanyPoolTxType =
  | "Earned-Settlement"      /* 정산 우수 보너스 (수치 추후) */
  | "Earned-NoDispute"       /* 분쟁 0건 (수치 추후) */
  | "Earned-Review-Featured" /* B2C에서 Featured된 리뷰 (수치 추후) */
  | "Earned-Mission"         /* 회사 단위 월간 미션 (수치 추후) */
  | "Distributed-To-OP"      /* Master가 OP에게 분배 */
  | "Charity-Donation"       /* 자선 기부 */
  | "Company-Event";         /* 회사 이벤트 사용 */

export interface CompanyPoolTransaction {
  id: string;
  customerCompanyId: string;
  date: string;
  type: CompanyPoolTxType;
  description: string;
  amount: number;            /* + earn / - spend */
  balance: number;
  actorEmail?: string;       /* 운용자(Master) email */
  recipientEmail?: string;   /* OP 분배 시 */
}

export const companyPoolTransactions: CompanyPoolTransaction[] = [
  /* 시드 비어 둠 — 트리거/수치 미정 */
];

export function companyPoolHistoryFor(companyId: string): CompanyPoolTransaction[] {
  return companyPoolTransactions
    .filter(t => t.customerCompanyId === companyId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/* ════════════════════════════════════════════════════════════════════
 * Earner 자격 — OP만, but Solo Master는 예외
 * ════════════════════════════════════════════════════════════════════
 * 규칙:
 *   • 일반: OP role만 ELS 적립. Master/Accounting은 0.
 *   • 예외: 회사에 OP가 0명이면 Master가 운영자 겸업으로 간주, ELS 적립 가능.
 *   • Accounting은 어떤 경우에도 적립 X (회계 분리 원칙).
 *
 * 이 헬퍼는 적립 트리거에서 호출. 사용처:
 *   - BookingCompletePage (예약 완료 보상)
 *   - HotelDetailPage (리뷰 보상)
 *   - 미래의 모든 earning 경로 (일일 로그인, 미션, 친구 초대 등)
 */
export interface EarnerCheckUser {
  email: string;
  role: string;
  customerCompanyId?: string;
}

export function isEarnEligible(user: EarnerCheckUser, companyOps: EarnerCheckUser[]): boolean {
  if (user.role === "Accounting") return false;
  if (user.role === "OP") return true;
  if (user.role === "Master") {
    /* Solo Master 예외: 같은 회사에 OP가 0명일 때만 적립 가능 */
    const opCount = companyOps.filter(u => u.role === "OP").length;
    return opCount === 0;
  }
  return false;
}

/* ════════════════════════════════════════════════════════════════════
 * Charity Organizations — Spending 출구 #2
 * ════════════════════════════════════════════════════════════════════
 * ELS를 자선 단체에 기부 (Master는 Company Pool에서, OP는 개인 ELS에서)
 * 매칭 비율(예: 1 ELS → $1 기부) 및 파트너 단체는 추후 결정.
 */
export interface CharityOrg {
  id: string;
  name: string;
  cause: string;             /* 단체 카테고리 */
  region: string;            /* 활동 지역 */
  description: string;
  logoUrl?: string;
  totalReceived: number;     /* 누적 기부 금액 (USD 환산 placeholder) */
}

export const charityOrgs: CharityOrg[] = [
  /* 골격만 — 실제 파트너십은 추후 마케팅팀 협의 */
  { id: "char-001", name: "Hotel Staff Education Fund (SE Asia)", cause: "Education", region: "Southeast Asia", description: "동남아 호텔 직원 자녀 학자금 지원 (예시)", totalReceived: 0 },
  { id: "char-002", name: "Tourism Worker Relief",                cause: "Relief",    region: "Global",         description: "재난·팬데믹 시 관광업 종사자 긴급 구호 (예시)",  totalReceived: 0 },
  { id: "char-003", name: "Sustainable Hospitality Initiative",   cause: "ESG",       region: "Global",         description: "친환경 호텔 운영 전환 지원 (예시)",                totalReceived: 0 },
];

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
  /** Solo Master 회사일 때 동일 적용 */
  enabled: boolean;
  /** Company Pool 사용 가능 여부 (Master만) */
  allowCompanyPool: boolean;
}

export const ELS_REDEEM_AT_BOOKING_POLICY: ElsRedeemAtBookingPolicy = {
  maxRedeemRatio: 0.05,   /* 잠정 5% — 추후 결정 */
  elsToUsdRate: 1.0,
  enabled: true,
  allowCompanyPool: true,
};
