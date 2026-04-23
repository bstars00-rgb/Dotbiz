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
  },

  /* Pending review (for moderation demo) */
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
  },
];

/* ── Helpers ── */

/** Approved reviews for a hotel (for display) */
export function reviewsFor(hotelId: string): HotelReview[] {
  return hotelReviews
    .filter(r => r.hotelId === hotelId && r.status === "Approved")
    .sort((a, b) => b.helpfulVotes - a.helpfulVotes);
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
