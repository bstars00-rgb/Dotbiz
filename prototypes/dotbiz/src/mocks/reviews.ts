/* ───────────────────────────────────────────────────────────────────────
 * OP Hotel Reviews — OPs review hotels, earn ELS, and the reviews feed
 * forward into a B2C discovery layer.
 *
 * Why it works:
 *   • OPs are hotel experts — they handle hundreds/thousands of stays
 *   • Professional reviews (vs consumer reviews) are more actionable
 *   • Reward small ELS → spam-resistant (quality-gated approval)
 *   • Aggregate at scale → 1,000 OPs × ~5 hotels each = ~5,000 signals
 *   • Syndicate to B2C → network effect: more reviews attract more OPs
 *
 * Reward schedule (per approved review):
 *   • Base: +3 ELS (minimum 80 chars body, 1+ tip)
 *   • Quality bonus: +2 ELS (4+ tips OR 300+ chars)
 *   • Photo bonus: +2 ELS (at least 1 photo attached)
 *   • First review: +5 ELS bonus
 *   • Helpful votes: +1 ELS per 10 votes (capped at +5/review)
 *   • Monthly reward cap: 5 approved reviews (prevents spam farming)
 *
 * Production invariants:
 *   • 1 review per (user, hotel) — enforced server-side
 *   • Moderation queue (3 statuses: Pending → Approved/Rejected)
 *   • Verified stays only get the "✓ Verified Stay" badge
 *   • Helpful vote anti-abuse: 1 vote per (reviewer_user, viewer_user)
 * ─────────────────────────────────────────────────────────────────────── */

export type ReviewStatus = "Pending" | "Approved" | "Rejected";

export interface HotelReview {
  id: string;
  hotelId: string;
  /* Reviewer */
  reviewerEmail: string;
  reviewerName: string;
  reviewerCompany: string;
  reviewerCountry: string;        /* e.g. "🇰🇷 Korea" */
  /* Content */
  rating: 1 | 2 | 3 | 4 | 5;     /* overall stars */
  title: string;
  body: string;
  /* Tips — structured knowledge bites (searchable, syndicable) */
  tips: string[];
  /* Photos — data URLs for prototype; CDN URLs in production.
   * Max 4 per review, max 2MB each. Moderated. */
  photos?: string[];
  /* Meta */
  verifiedStay: boolean;          /* did this reviewer actually book this hotel */
  stayedAt?: string;              /* ISO date of stay */
  helpfulVotes: number;
  submittedAt: string;
  approvedAt?: string;
  status: ReviewStatus;
  elsAwarded: number;             /* how much ELS was credited after approval */
  /* Legal consent (for B2C syndication) — required at submission.
   * If false, review visible in B2B context only (not syndicated). */
  syndicationConsent: boolean;
  consentedAt?: string;            /* ISO datetime of consent */
  /* Moderation record (set on Approve/Reject by Content Manager) */
  moderatedBy?: string;            /* email of moderator */
  moderatedAt?: string;
  moderationNote?: string;         /* reason (esp. for Reject) or comment */
  /* Auto-flags raised during pre-moderation (AI + heuristics) */
  autoFlags?: string[];            /* e.g. "short-body", "no-tips", "low-confidence-spam" */
}

/* Generated SVG "photo" placeholders for seeded demo reviews.
 * In prod: CDN URLs of user-uploaded images. */
function seedPhoto(label: string, color1: string, color2: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color1}"/><stop offset="1" stop-color="${color2}"/></linearGradient></defs>
    <rect width="400" height="300" fill="url(#g)"/>
    <text x="200" y="155" font-family="sans-serif" font-size="22" fill="white" text-anchor="middle" font-weight="700" opacity="0.92">${label}</text>
    <text x="200" y="185" font-family="sans-serif" font-size="11" fill="white" text-anchor="middle" opacity="0.7">OP-uploaded photo · moderated</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

/* ═══════════ Seed reviews — spread across hotels/countries/OPs ═══════════ */
export const hotelReviews: HotelReview[] = [
  /* Grand Hyatt Seoul (htl-001) — 3 reviews */
  {
    id: "rev-001", hotelId: "htl-001",
    reviewerEmail: "master@dotbiz.com", reviewerName: "James Park",
    reviewerCompany: "TravelCo International", reviewerCountry: "🇰🇷 Korea",
    rating: 5, title: "Best business pick in Gangnam",
    body: "Hosted 3 executive delegations here over the past 6 months. Front desk handles group check-ins flawlessly, and the executive lounge on 23F is quiet enough for meetings. Pool opens at 6am — guests love it. Breakfast buffet rotation is wide enough for repeat stays.",
    tips: [
      "Request 20F+ for Han River view",
      "Avoid 3F–7F (pool noise in summer)",
      "Executive lounge on 23F opens 07:00",
      "Free shuttle to Coex runs :15/:45",
    ],
    verifiedStay: true, stayedAt: "2026-03-12",
    helpfulVotes: 47,
    photos: [
      seedPhoto("23F Executive Lounge", "#0f172a", "#334155"),
      seedPhoto("Han River view — 28F", "#1e3a8a", "#60a5fa"),
      seedPhoto("Breakfast buffet rotation", "#78350f", "#d97706"),
    ],
    submittedAt: "2026-03-18 14:20:00", approvedAt: "2026-03-18 22:00:00",
    status: "Approved", elsAwarded: 12,
    syndicationConsent: true, consentedAt: "2026-03-18 14:20:00",
  },
  {
    id: "rev-002", hotelId: "htl-001",
    reviewerEmail: "op@dotbiz.com", reviewerName: "Sarah Kim",
    reviewerCompany: "TravelCo International", reviewerCountry: "🇰🇷 Korea",
    rating: 4, title: "Consistent 5-star, minor nitpicks",
    body: "Placed 40+ bookings here last year. Rooms are immaculate and service is top-tier. Only caveat: walkways to the spa are long — flag this for elderly guests. Wedding traffic on weekends can jam the lobby.",
    tips: [
      "Avoid weekend check-ins if possible (wedding rush)",
      "Spa is a 5min walk from guest rooms",
      "Corner suites (XX) face Namsan — worth the upgrade",
    ],
    verifiedStay: true, stayedAt: "2026-02-05",
    helpfulVotes: 23,
    submittedAt: "2026-02-14 10:15:00", approvedAt: "2026-02-14 18:30:00",
    status: "Approved", elsAwarded: 8,
    syndicationConsent: true,
  },
  {
    id: "rev-003", hotelId: "htl-001",
    reviewerEmail: "prepay@dotbiz.com", reviewerName: "Jennifer Wu",
    reviewerCompany: "Asia Tours Ltd.", reviewerCountry: "🇰🇷 Korea",
    rating: 5, title: "Reliable for FIT + groups",
    body: "Handles both individual VIPs and 20+ pax tour groups. Concierge team speaks CN/JP/EN fluently. Airport transfer arranged within 30min of request.",
    tips: [
      "CN-speaking concierge on duty 24h",
      "Group arrival desk on B1 (not lobby)",
      "Early check-in possible before 12:00 with advance notice",
    ],
    verifiedStay: true, stayedAt: "2026-01-28",
    helpfulVotes: 31,
    submittedAt: "2026-02-02 09:00:00", approvedAt: "2026-02-02 16:45:00",
    status: "Approved", elsAwarded: 8,
    syndicationConsent: true,
  },

  /* Mandarin Oriental Tokyo (htl-005) — 2 reviews */
  {
    id: "rev-010", hotelId: "htl-005",
    reviewerEmail: "master@dotbiz.com", reviewerName: "James Park",
    reviewerCompany: "TravelCo International", reviewerCountry: "🇰🇷 Korea",
    rating: 5, title: "Worth the premium for C-suite trips",
    body: "Only used for executive-tier stays. The 38F skyline view is genuinely unmatched in Tokyo. Spa access is complimentary for suite guests — flag this clearly or guests miss it. Breakfast at Ventaglio is a highlight; reserve a day ahead.",
    tips: [
      "Suite guests get complimentary spa — always mention",
      "Reserve Ventaglio breakfast 24h ahead on weekends",
      "Skyline rooms on N-side (36F+) show Skytree",
      "Club lounge cocktail hour 17:30–19:30",
    ],
    verifiedStay: true, stayedAt: "2026-03-25",
    helpfulVotes: 58,
    photos: [
      seedPhoto("38F Skyline — Skytree view", "#0c4a6e", "#0ea5e9"),
      seedPhoto("Club lounge cocktail hour", "#7c2d12", "#ea580c"),
    ],
    submittedAt: "2026-03-30 13:00:00", approvedAt: "2026-03-30 20:15:00",
    status: "Approved", elsAwarded: 12,
    syndicationConsent: true, consentedAt: "2026-03-18 14:20:00",
  },
  {
    id: "rev-011", hotelId: "htl-005",
    reviewerEmail: "gotadi@dotbiz.com", reviewerName: "Nguyen Van An",
    reviewerCompany: "GOTADI", reviewerCountry: "🇻🇳 Vietnam",
    rating: 5, title: "Tokyo standard for our Vietnamese VIPs",
    body: "Our HCMC-based premium clients adore this property. Staff remembers repeat guests. Late arrivals (after 23:00) handled smoothly. Halal & vegan dining options are well documented.",
    tips: [
      "Halal menu on request (24h notice)",
      "VN-language concierge via phone (certain hours)",
      "Ginza location = 5min walk to major shopping",
    ],
    verifiedStay: true, stayedAt: "2026-03-01",
    helpfulVotes: 19,
    submittedAt: "2026-03-07 11:20:00", approvedAt: "2026-03-07 19:40:00",
    status: "Approved", elsAwarded: 8,
    syndicationConsent: true,
  },

  /* Peninsula Shanghai (htl-007) — 2 reviews */
  {
    id: "rev-020", hotelId: "htl-007",
    reviewerEmail: "master@dotbiz.com", reviewerName: "James Park",
    reviewerCompany: "TravelCo International", reviewerCountry: "🇰🇷 Korea",
    rating: 4, title: "Iconic but watch the deposit policy",
    body: "Bund views are incredible. Service is polished. One caveat: hotel places a large CNY deposit hold on cards at check-in — brief your guests or it causes surprise. Return is fast but may be 5-7 days.",
    tips: [
      "Cash deposit can be 2000+ CNY per room",
      "Hold release takes 5-7 business days",
      "Rooms facing Huangpu River = big price premium, worth it",
      "Afternoon tea at The Lobby requires booking",
    ],
    verifiedStay: true, stayedAt: "2026-02-18",
    helpfulVotes: 44,
    submittedAt: "2026-02-22 15:00:00", approvedAt: "2026-02-22 21:30:00",
    status: "Approved", elsAwarded: 10,
    syndicationConsent: true,
  },
  {
    id: "rev-021", hotelId: "htl-007",
    reviewerEmail: "op@dotbiz.com", reviewerName: "Sarah Kim",
    reviewerCompany: "TravelCo International", reviewerCountry: "🇰🇷 Korea",
    rating: 5, title: "Peninsula touch is unmatched",
    body: "Rolls Royce fleet, art deco interiors, spa is world-class. Good for honeymooners and high-end anniversaries. Valet team handles luggage transfer between hotels in same city.",
    tips: [
      "Request East Wing for river view",
      "Same-city luggage transfer available at no charge",
      "Spa booking 7 days in advance recommended",
    ],
    verifiedStay: true, stayedAt: "2026-01-22",
    helpfulVotes: 27,
    submittedAt: "2026-01-28 17:00:00", approvedAt: "2026-01-28 22:00:00",
    status: "Approved", elsAwarded: 8,
    syndicationConsent: true,
  },

  /* Lotte Hotel Hanoi (htl-006) — 1 review */
  {
    id: "rev-030", hotelId: "htl-006",
    reviewerEmail: "gotadi@dotbiz.com", reviewerName: "Nguyen Van An",
    reviewerCompany: "GOTADI", reviewerCountry: "🇻🇳 Vietnam",
    rating: 5, title: "Best high-floor views in Hanoi",
    body: "65F restaurant has the best skyline view in the city. Diplomatic district = quiet at night. Karaoke VIP rooms are spotlessly clean — unusual for the city. Pool is indoor+heated.",
    tips: [
      "Request 50F+ for West Lake view",
      "65F restaurant (Top of Hanoi) books up — reserve early",
      "Pool heated year-round",
      "Free shuttle to Hoan Kiem lake area",
    ],
    verifiedStay: true, stayedAt: "2026-03-05",
    helpfulVotes: 38,
    photos: [
      seedPhoto("65F — West Lake sunset", "#701a75", "#c084fc"),
      seedPhoto("Indoor heated pool", "#0f766e", "#14b8a6"),
      seedPhoto("Diplomatic district lobby", "#713f12", "#ca8a04"),
    ],
    submittedAt: "2026-03-10 10:00:00", approvedAt: "2026-03-10 18:00:00",
    status: "Approved", elsAwarded: 12,
    syndicationConsent: true, consentedAt: "2026-03-18 14:20:00",
  },

  /* Shilla Stay Mapo (htl-002) — 1 review (mid-tier) */
  {
    id: "rev-040", hotelId: "htl-002",
    reviewerEmail: "op@dotbiz.com", reviewerName: "Sarah Kim",
    reviewerCompany: "TravelCo International", reviewerCountry: "🇰🇷 Korea",
    rating: 4, title: "Great value in Hongdae",
    body: "Solid mid-tier pick. Rooms small by Western standards but well-designed. Walkable to Hongik University station in 5min. Breakfast is fine but not memorable — skip if not included.",
    tips: [
      "5min walk to Hongik Univ stn (Line 2, AREX)",
      "Request higher floor — lower floors face street noise",
      "Skip breakfast add-on; cafes nearby better value",
    ],
    verifiedStay: true, stayedAt: "2026-02-12",
    helpfulVotes: 15,
    submittedAt: "2026-02-18 12:00:00", approvedAt: "2026-02-18 20:00:00",
    status: "Approved", elsAwarded: 8,
    syndicationConsent: true,
  },

  /* Park Hyatt Shanghai (htl-009) — 1 review */
  {
    id: "rev-050", hotelId: "htl-009",
    reviewerEmail: "prepay@dotbiz.com", reviewerName: "Jennifer Wu",
    reviewerCompany: "Asia Tours Ltd.", reviewerCountry: "🇰🇷 Korea",
    rating: 5, title: "Tallest hotel rooms in Shanghai — no contest",
    body: "Rooms on 79-93F. Bathtubs facing the city skyline. Mist + cloud days common above 80F — factor this in when setting guest expectations. 100 Century Avenue Restaurant on 91F is a destination in itself.",
    tips: [
      "Cloud cover possible above 80F — advise flexibility",
      "Restaurant on 91F requires 2-week advance booking",
      "Club lounge is on 87F (not ground)",
      "Elevator 2-stage: lobby → sky lobby → guest floors",
    ],
    verifiedStay: true, stayedAt: "2026-02-25",
    helpfulVotes: 33,
    submittedAt: "2026-03-01 14:00:00", approvedAt: "2026-03-01 21:00:00",
    status: "Approved", elsAwarded: 10,
    syndicationConsent: true,
  },

  /* ═════════ Pending queue — demo moderation ═════════ */
  {
    id: "rev-099", hotelId: "htl-001",
    reviewerEmail: "accounting@dotbiz.com", reviewerName: "Daniel Choi",
    reviewerCompany: "TravelCo International", reviewerCountry: "🇰🇷 Korea",
    rating: 4, title: "Solid choice",
    body: "Clean and professional. Rooms are a good size. Pool is nice. Staff friendly. Would book again.",
    tips: ["Good location"],
    verifiedStay: false,
    helpfulVotes: 0,
    submittedAt: "2026-04-22 17:00:00",
    status: "Pending", elsAwarded: 0,
    syndicationConsent: true, consentedAt: "2026-04-22 17:00:00",
    autoFlags: ["short-body (94 chars, borderline)", "unverified-stay"],
  },
  {
    id: "rev-100", hotelId: "htl-004",
    reviewerEmail: "kevin@travelco.com", reviewerName: "Kevin Lee",
    reviewerCompany: "TravelCo International", reviewerCountry: "🇰🇷 Korea",
    rating: 5, title: "Best biz hotel ever!!!",
    body: "Amazing amazing amazing hotel. Best hotel ever. Everyone should book here. Click here for discount!!!",
    tips: ["Amazing", "Best"],
    verifiedStay: false,
    helpfulVotes: 0,
    submittedAt: "2026-04-23 11:30:00",
    status: "Pending", elsAwarded: 0,
    syndicationConsent: true, consentedAt: "2026-04-23 11:30:00",
    autoFlags: ["spam-phrases (repeated superlatives)", "promotional-language", "unverified-stay", "low-info-tips"],
  },
  {
    id: "rev-101", hotelId: "htl-007",
    reviewerEmail: "mai@gotadi.com", reviewerName: "Tran Thi Mai",
    reviewerCompany: "GOTADI", reviewerCountry: "🇻🇳 Vietnam",
    rating: 5, title: "Peninsula Shanghai — Vietnamese VIP standard",
    body: "Hosted 5 C-suite delegations from Ho Chi Minh here in Q1. Staff handles Chinese + Vietnamese fluently. Bund view rooms are worth the 25% premium. Afternoon tea at The Lobby books up 1 week out — reserve early.",
    tips: [
      "Request Bund-facing room (East Wing, 9F+)",
      "Afternoon tea requires 7-day advance booking",
      "VN-language concierge on duty during business hours",
      "Free Rolls Royce transfer within 3km radius",
    ],
    verifiedStay: true, stayedAt: "2026-03-28",
    helpfulVotes: 0,
    submittedAt: "2026-04-24 08:15:00",
    status: "Pending", elsAwarded: 0,
    syndicationConsent: true, consentedAt: "2026-04-24 08:15:00",
    autoFlags: [],
  },

  /* ═════════ Rejected — example with reason ═════════ */
  {
    id: "rev-200", hotelId: "htl-005",
    reviewerEmail: "emma@travelco.com", reviewerName: "Emma Wilson",
    reviewerCompany: "TravelCo International", reviewerCountry: "🇰🇷 Korea",
    rating: 1, title: "I hate this hotel",
    body: "Terrible terrible terrible. Staff was rude. I asked for upgrade and they said no. Worst experience ever. Do not book.",
    tips: ["Avoid"],
    verifiedStay: false,
    helpfulVotes: 0,
    submittedAt: "2026-04-10 14:00:00",
    status: "Rejected", elsAwarded: 0,
    syndicationConsent: true, consentedAt: "2026-04-10 14:00:00",
    autoFlags: ["unverified-stay", "low-info-tips", "potentially-biased"],
    moderatedBy: "content@ohmyhotel.com",
    moderatedAt: "2026-04-11 09:30:00",
    moderationNote: "Unverified stay + complaint appears to stem from upgrade refusal (policy compliance), not objective hotel quality. OP advised to resubmit with verified booking record if genuine issue. No ELS credited per policy.",
  },
];

/* ── Helpers ── */

/** Approved reviews for a hotel (for display) */
export function reviewsFor(hotelId: string): HotelReview[] {
  return hotelReviews
    .filter(r => r.hotelId === hotelId && r.status === "Approved")
    .sort((a, b) => b.helpfulVotes - a.helpfulVotes);
}

/** Reviews by status — for moderation queue */
export function reviewsByStatus(status: ReviewStatus): HotelReview[] {
  return hotelReviews
    .filter(r => r.status === status)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

/** Pending queue — what moderators need to act on */
export function pendingReviews(): HotelReview[] {
  return reviewsByStatus("Pending");
}

/** Auto-flag heuristics for a newly submitted review.
 * Real implementation combines: ML NSFW classifier, text similarity
 * detection, user history, hotel context embedding, etc. */
export function autoFlagReview(params: {
  body: string;
  tips: string[];
  verifiedStay: boolean;
  hasPhotos: boolean;
}): string[] {
  const flags: string[] = [];
  const body = params.body.trim();
  /* Length */
  if (body.length < 100) flags.push("short-body");
  /* Promotional / spammy language */
  const spamPatterns = /(click here|discount|promo code|amazing amazing|best ever|do not book|horrible horrible)/i;
  if (spamPatterns.test(body)) flags.push("spam-phrases");
  /* Repeated superlatives */
  const repeats = body.match(/\b(\w+)(?:\s+\1){2,}\b/gi);
  if (repeats) flags.push("repeated-words");
  /* Low-info tips */
  const avgTipLen = params.tips.reduce((s, t) => s + t.length, 0) / Math.max(1, params.tips.length);
  if (params.tips.length > 0 && avgTipLen < 20) flags.push("low-info-tips");
  /* Unverified stay */
  if (!params.verifiedStay) flags.push("unverified-stay");
  /* No photos — less actionable for B2C */
  if (!params.hasPhotos) flags.push("no-photos");
  return flags;
}

/* ══════════════════════════════════════════════════════════════════════
 * 자동 모더레이션 엔진 — Moderation Automation
 *
 * 목표: 전체 리뷰의 ~85%를 인간 개입 없이 자동 처리 (OTA 업계 표준).
 *   • Auto-Approve: 명백히 통과 (품질 게이트 + 검증된 투숙 + flag 없음)
 *   • Auto-Reject: 명백히 스팸 (스팸 패턴 + 홍보 문구)
 *   • Manual Review: 경계선 케이스만 사람에게
 *
 * 처리 타겟: 90초 내 자동 판정 → 즉시 반영. 경계선은 <24h 사람 처리.
 * ══════════════════════════════════════════════════════════════════════ */

export interface AutoModerationRules {
  /** 자동 승인 최소 본문 길이 */
  autoApproveMinBody: number;
  /** 자동 승인 최소 팁 개수 */
  autoApproveMinTips: number;
  /** 자동 승인에 verified stay 필수 여부 */
  autoApproveRequireVerified: boolean;
  /** 자동 반려: 스팸 flag 개수 임계값 */
  autoRejectSpamFlagThreshold: number;
  /** 시스템 ON/OFF */
  enabled: boolean;
  /** Strict 모드 — 모호할 때 manual로 보내는 경향 높임 */
  strictMode: boolean;
}

export const DEFAULT_AUTO_MOD_RULES: AutoModerationRules = {
  autoApproveMinBody: 150,
  autoApproveMinTips: 2,
  autoApproveRequireVerified: true,
  autoRejectSpamFlagThreshold: 2,
  enabled: true,
  strictMode: false,
};

/* ── 규칙 영속화 (localStorage) ──
 * ELS 경제 관리에서 저장된 규칙을 리뷰 모더레이션 페이지가 읽음.
 * 프로토타입에선 localStorage로 페이지 간 공유.
 * 실제 운영에선 ELLIS DB에 저장되고 웹훅으로 전파. */
const AUTO_MOD_STORAGE_KEY = "dotbiz_auto_mod_rules";

export function loadAutoModRules(): AutoModerationRules {
  if (typeof window === "undefined") return { ...DEFAULT_AUTO_MOD_RULES };
  try {
    const raw = window.localStorage.getItem(AUTO_MOD_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_AUTO_MOD_RULES };
    const parsed = JSON.parse(raw);
    /* 기본값과 병합해서 누락된 필드 보완 */
    return { ...DEFAULT_AUTO_MOD_RULES, ...parsed };
  } catch {
    return { ...DEFAULT_AUTO_MOD_RULES };
  }
}

export function saveAutoModRules(rules: AutoModerationRules): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AUTO_MOD_STORAGE_KEY, JSON.stringify(rules));
  } catch {
    /* quota exceeded or disabled — fail silently in prototype */
  }
}

export function resetAutoModRules(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(AUTO_MOD_STORAGE_KEY);
  } catch { /* ignore */ }
}

export type ModerationDecision = "AutoApprove" | "AutoReject" | "ManualReview";

export interface AutoModerationResult {
  decision: ModerationDecision;
  confidence: number;           /* 0-1 */
  reasons: string[];             /* 사람이 읽을 수 있는 판정 근거 */
  passedRules: string[];
  failedRules: string[];
}

/** 리뷰에 대한 자동 모더레이션 결정.
 *
 * 결정 트리:
 *   1. Critical flag (spam-phrases, repeated-words, promotional) → Auto-Reject (confidence high)
 *   2. 모든 quality 조건 통과 (body 150+, tips 2+, verified) + flag 없음 → Auto-Approve
 *   3. 그 외 → Manual Review
 */
export function autoModerateDecision(
  review: Pick<HotelReview, "body" | "tips" | "verifiedStay" | "photos" | "rating">,
  rules: AutoModerationRules = DEFAULT_AUTO_MOD_RULES
): AutoModerationResult {
  const flags = autoFlagReview({
    body: review.body,
    tips: review.tips,
    verifiedStay: review.verifiedStay,
    hasPhotos: !!(review.photos && review.photos.length > 0),
  });
  const body = review.body.trim();
  const passedRules: string[] = [];
  const failedRules: string[] = [];
  const reasons: string[] = [];

  /* ── 단계 1: Auto-Reject 조건 ── */
  const criticalFlags = flags.filter(f =>
    f === "spam-phrases" || f === "repeated-words"
  );
  if (criticalFlags.length >= 1) {
    return {
      decision: "AutoReject",
      confidence: 0.95,
      reasons: [`스팸/홍보 패턴 감지: ${criticalFlags.join(", ")}`],
      passedRules: [],
      failedRules: criticalFlags,
    };
  }

  /* 1점 별점 + 짧은 본문 + unverified = 악의적 리뷰 가능성 → Auto-Reject */
  if (review.rating === 1 && body.length < 200 && !review.verifiedStay) {
    return {
      decision: "AutoReject",
      confidence: 0.85,
      reasons: ["1점 별점 + 짧은 본문 + 미검증 투숙 — 악의적 리뷰 가능성"],
      passedRules: [],
      failedRules: ["low-rating-unverified-short"],
    };
  }

  /* ── 단계 2: Auto-Approve 조건 ── */
  const checks = [
    {
      name: "본문 길이 ≥ " + rules.autoApproveMinBody,
      passed: body.length >= rules.autoApproveMinBody,
    },
    {
      name: `팁 개수 ≥ ${rules.autoApproveMinTips}`,
      passed: review.tips.length >= rules.autoApproveMinTips,
    },
    {
      name: "투숙 검증됨",
      passed: !rules.autoApproveRequireVerified || review.verifiedStay,
    },
    {
      name: "플래그 없음",
      passed: flags.filter(f => f !== "no-photos" && f !== "unverified-stay").length === 0,
    },
  ];

  checks.forEach(c => (c.passed ? passedRules : failedRules).push(c.name));

  const allPass = checks.every(c => c.passed);

  if (allPass) {
    /* Strict mode에서는 사진 없으면 Manual */
    if (rules.strictMode && (!review.photos || review.photos.length === 0)) {
      return {
        decision: "ManualReview",
        confidence: 0.70,
        reasons: ["Strict 모드: 사진 없는 리뷰는 사람 검토"],
        passedRules,
        failedRules: ["strict-no-photos"],
      };
    }
    return {
      decision: "AutoApprove",
      confidence: 0.92,
      reasons: ["모든 품질 게이트 통과"],
      passedRules,
      failedRules: [],
    };
  }

  /* ── 단계 3: Manual Review ── */
  reasons.push("경계선 케이스 — 사람 검수 필요");
  if (failedRules.length > 0) {
    reasons.push(`미충족: ${failedRules.join(", ")}`);
  }

  return {
    decision: "ManualReview",
    confidence: 0.50,
    reasons,
    passedRules,
    failedRules,
  };
}

/** 대량 리뷰에 대한 자동 모더레이션 통계 */
export function autoModerationStats(reviews: HotelReview[], rules?: AutoModerationRules): {
  total: number;
  autoApprove: number;
  autoReject: number;
  manualReview: number;
  autoHandledPct: number;
} {
  const decisions = reviews.map(r => autoModerateDecision(r, rules));
  const autoApprove = decisions.filter(d => d.decision === "AutoApprove").length;
  const autoReject = decisions.filter(d => d.decision === "AutoReject").length;
  const manualReview = decisions.filter(d => d.decision === "ManualReview").length;
  const total = reviews.length;
  return {
    total,
    autoApprove,
    autoReject,
    manualReview,
    autoHandledPct: total > 0 ? Math.round(((autoApprove + autoReject) / total) * 100) : 0,
  };
}

/** Aggregate stats for a hotel — for summary row on detail page */
export function reviewStatsFor(hotelId: string): {
  count: number; avgRating: number; topTips: string[];
} {
  const approved = reviewsFor(hotelId);
  if (approved.length === 0) return { count: 0, avgRating: 0, topTips: [] };
  const avgRating = approved.reduce((s, r) => s + r.rating, 0) / approved.length;
  /* Flatten all tips, dedupe, take 5 */
  const tipCounts = new Map<string, number>();
  approved.forEach(r => r.tips.forEach(t => tipCounts.set(t, (tipCounts.get(t) || 0) + 1)));
  const topTips = [...tipCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tip]) => tip);
  return { count: approved.length, avgRating, topTips };
}

/** Count of approved reviews authored by this OP (for reviewer stamps) */
export function reviewCountFor(userEmail: string): number {
  return hotelReviews.filter(r => r.reviewerEmail === userEmail && r.status === "Approved").length;
}

/** Total ELS awarded to this OP across all reviews */
export function reviewElsEarnedFor(userEmail: string): number {
  return hotelReviews
    .filter(r => r.reviewerEmail === userEmail && r.status === "Approved")
    .reduce((s, r) => s + r.elsAwarded, 0);
}

/** Preview ELS reward for a review being composed */
export function calculateReviewReward(params: {
  bodyLength: number;
  tipCount: number;
  photoCount: number;
  isFirst: boolean;
}): { els: number; breakdown: string[] } {
  const breakdown: string[] = [];
  let els = 0;
  /* Minimum quality gate */
  if (params.bodyLength < 80) {
    return { els: 0, breakdown: ["Needs 80+ character body to earn ELS"] };
  }
  if (params.tipCount < 1) {
    return { els: 0, breakdown: ["Needs at least 1 tip to earn ELS"] };
  }
  els += 3;
  breakdown.push("+3 ELS base (quality review)");
  /* Quality bonus */
  if (params.bodyLength >= 300 || params.tipCount >= 4) {
    els += 2;
    breakdown.push("+2 ELS quality bonus (detailed)");
  }
  /* Photo bonus */
  if (params.photoCount >= 1) {
    els += 2;
    breakdown.push("+2 ELS photo bonus (visual proof)");
  }
  /* First review */
  if (params.isFirst) {
    els += 5;
    breakdown.push("+5 ELS first-review bonus");
  }
  return { els, breakdown };
}

/* Photo upload constraints — enforced client-side, re-validated server-side */
export const REVIEW_MAX_PHOTOS = 4;
export const REVIEW_MAX_PHOTO_BYTES = 2 * 1024 * 1024;    /* 2 MB */

/** Convert a File to a base64 data URL for prototype storage.
 * Real implementation would upload to S3/Cloudflare R2 + store a CDN URL. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
