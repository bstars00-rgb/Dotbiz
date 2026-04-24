/* ───────────────────────────────────────────────────────────────────────
 * Approval Matrix — governance layer for tunable economics
 *
 * Any change that moves money (ELS reward pool, Shop pricing, promo
 * multipliers, tier thresholds) must go through an approval chain.
 * The matrix below is the source of truth for "who approves what".
 *
 * Principle: the larger the potential budget impact, the higher the
 * required sign-off. CEO is required for anything that directly changes
 * the ELS→USD liability curve.
 * ─────────────────────────────────────────────────────────────────────── */

export type ApproverRole =
  | "CEO"              /* 대표이사 */
  | "CFO"              /* 재무이사 */
  | "CMO"              /* 마케팅이사 */
  | "CPO"              /* 상품이사 */
  | "Marketing Manager"
  | "Content Manager"
  | "ELLIS Admin";

export type ApprovalCategory =
  | "Economics"        /* earn rate, tier multipliers, peg */
  | "Promotions"       /* hotel boosts, seasonal campaigns */
  | "Shop Catalog"     /* product pricing, add/remove items */
  | "Gamification"     /* stamps, bonuses */
  | "Policy"           /* rewards policy, transfer limits */
  | "Content";         /* review moderation */

export type ApprovalImpact = "Low" | "Medium" | "High" | "Critical";

export interface ApprovalItem {
  /* Machine-readable key (maps to a configuration field) */
  key: string;
  category: ApprovalCategory;
  label: string;
  description: string;
  /* Current value (formatted for display) */
  currentValue: string;
  /* Who must approve — ordered chain (all must sign off) */
  approvers: ApproverRole[];
  impact: ApprovalImpact;
  /* How often this is typically reviewed */
  reviewCadence: string;
  /* Estimated monthly budget impact of a 10% change */
  budgetImpactHint: string;
}

/* ═══════════ The complete approval catalog ═══════════ */
export const APPROVAL_ITEMS: ApprovalItem[] = [
  /* ── Economics (highest sensitivity) ── */
  {
    key: "ELS_BOOKING_EARN_RATE",
    category: "Economics",
    label: "ELS Booking Earn Rate",
    description: "How much ELS is credited per $1 of room value. The core lever for reward pool cost.",
    currentValue: "0.01 ELS / $1 (1 ELS per $100)",
    approvers: ["CFO", "CEO"],
    impact: "Critical",
    reviewCadence: "Quarterly",
    budgetImpactHint: "+10% rate → +10% of total ELS liability (~₩30M/월 at scale)",
  },
  {
    key: "ELS_USD_PEG",
    category: "Economics",
    label: "ELS ↔ USD Peg",
    description: "Redemption value of 1 ELS in USD. Changing breaks existing liabilities.",
    currentValue: "1 ELS = 1 USD",
    approvers: ["CFO", "CEO"],
    impact: "Critical",
    reviewCadence: "Annual (rare)",
    budgetImpactHint: "Breaking change: re-prices entire ELS stock overnight",
  },
  {
    key: "TIER_MULTIPLIERS",
    category: "Economics",
    label: "Tier Earn Multipliers",
    description: "Bronze 1.0× / Silver 1.1× / Gold 1.2× / Platinum 1.3× / Diamond 1.5×",
    currentValue: "1.0 / 1.1 / 1.2 / 1.3 / 1.5",
    approvers: ["CMO", "CFO", "CEO"],
    impact: "High",
    reviewCadence: "Semi-annual",
    budgetImpactHint: "+0.1 avg → ~8% of ELS pool cost",
  },
  {
    key: "TIER_THRESHOLDS",
    category: "Economics",
    label: "Tier Booking Thresholds",
    description: "Bookings required to promote (Silver 50, Gold 200, Platinum 500, Diamond 1500)",
    currentValue: "50 / 200 / 500 / 1,500",
    approvers: ["CMO", "CEO"],
    impact: "High",
    reviewCadence: "Annual",
    budgetImpactHint: "Lowering thresholds = more Silver+ OPs = +2-5% reward cost",
  },

  /* ── Promotions (operational) ── */
  {
    key: "HOTEL_POINTS_BOOSTS",
    category: "Promotions",
    label: "Hotel ELS Boost Multipliers",
    description: "Per-hotel promo multiplier (+10% / +15% / +20%) with expiry.",
    currentValue: "6 active boosts (1.1× ~ 1.2×)",
    approvers: ["CMO"],
    impact: "Medium",
    reviewCadence: "Per campaign",
    budgetImpactHint: "Adding 1 promo hotel × 1.2× for 30d ≈ ₩500k / week GMV volume",
  },
  {
    key: "PROMO_MAX_MULTIPLIER",
    category: "Promotions",
    label: "Max Promo Multiplier Cap",
    description: "Hard ceiling for any single hotel boost (prevents runaway campaigns).",
    currentValue: "1.25× (= +25% max)",
    approvers: ["CFO", "CEO"],
    impact: "High",
    reviewCadence: "Annual",
    budgetImpactHint: "Each 0.05 increase = higher max exposure per booking",
  },

  /* ── Shop Catalog ── */
  {
    key: "SHOP_PRODUCT_PRICE",
    category: "Shop Catalog",
    label: "Shop Product Pricing",
    description: "ELS cost per product (32 items across 6 countries).",
    currentValue: "3 ~ 20 ELS range",
    approvers: ["Marketing Manager", "CMO"],
    impact: "Medium",
    reviewCadence: "Monthly",
    budgetImpactHint: "Lowering = faster redemption = higher cash burn on vouchers",
  },
  {
    key: "SHOP_NEW_ITEM",
    category: "Shop Catalog",
    label: "New Product Listing",
    description: "Adding a new redeemable item (requires supplier contract).",
    currentValue: "32 items across 6 countries",
    approvers: ["Marketing Manager", "CPO"],
    impact: "Low",
    reviewCadence: "As supplier contracts signed",
    budgetImpactHint: "Negligible unless item is premium-priced",
  },
  {
    key: "SHOP_WHOLESALE_CONTRACT",
    category: "Shop Catalog",
    label: "Supplier Wholesale Contract",
    description: "Negotiated bulk rates with gift card suppliers (determines DOTBIZ cost per redemption).",
    currentValue: "Active: Giftishow, 카카오, Grab, Rakuten, …",
    approvers: ["CPO", "CFO", "CEO"],
    impact: "High",
    reviewCadence: "Per contract",
    budgetImpactHint: "Wholesale discount % directly reduces redemption cost",
  },

  /* ── Gamification ── */
  {
    key: "STAMP_BONUS_SCALE",
    category: "Gamification",
    label: "Stamp Bonus ELS (by rarity)",
    description: "Common 5 / Rare 15 / Epic 50 / Legendary 200 / Mythic 1000",
    currentValue: "5 / 15 / 50 / 200 / 1,000",
    approvers: ["CMO", "CFO"],
    impact: "Medium",
    reviewCadence: "Semi-annual",
    budgetImpactHint: "Total catalog max = 3,295 ELS per OP lifetime (if all earned)",
  },
  {
    key: "NEW_STAMP",
    category: "Gamification",
    label: "Add / Remove Stamps",
    description: "Modify the 25-stamp passport catalog.",
    currentValue: "25 active stamps",
    approvers: ["CMO", "CPO", "CEO"],
    impact: "Medium",
    reviewCadence: "Rare",
    budgetImpactHint: "Each new stamp × rarity bonus ELS × OP population",
  },
  {
    key: "REVIEW_REWARD_FORMULA",
    category: "Gamification",
    label: "Review Reward Schedule",
    description: "Base +3 / quality +2 / photo +2 / first +5 (max +12 ELS per review, 5/mo cap)",
    currentValue: "Max +12 ELS, cap 5/month",
    approvers: ["CMO", "CFO"],
    impact: "Low",
    reviewCadence: "Semi-annual",
    budgetImpactHint: "Active OP 100명 × 5 reviews × 10 ELS = ₩5M / month ceiling",
  },

  /* ── Policy ── */
  {
    key: "ELS_NON_TRANSFERABLE",
    category: "Policy",
    label: "ELS Transferability",
    description: "Whether OPs can send ELS to other OPs. Currently DISABLED by design — clean attribution, no gift-laundering between colleagues.",
    currentValue: "Non-transferable (disabled)",
    approvers: ["CFO", "CEO"],
    impact: "Critical",
    reviewCadence: "Rare",
    budgetImpactHint: "Enabling would reintroduce AML / collusion risk",
  },
  {
    key: "ELS_EXPIRY_POLICY",
    category: "Policy",
    label: "ELS Expiration Period",
    description: "How long until unused ELS expires. Default 24 months from earn date — balances active use incentive with OP trust.",
    currentValue: "24 months (default)",
    approvers: ["CFO", "CEO"],
    impact: "High",
    reviewCadence: "Annual",
    budgetImpactHint: "Shortening to 12m: liability -40%. Lengthening to 36m: +30% dormant balance risk.",
  },
  {
    key: "REWARD_POOL_BUDGET",
    category: "Economics",
    label: "Monthly ELS Reward Pool Budget Cap",
    description: "Maximum ELS DOTBIZ will fund per month. When hit, new rewards pause until next cycle.",
    currentValue: "Not set (uncapped — needs decision)",
    approvers: ["CFO", "CEO"],
    impact: "Critical",
    reviewCadence: "Annual with quarterly review",
    budgetImpactHint: "This IS the budget control — critical to establish",
  },

  /* ── Content ── */
  {
    key: "REVIEW_MODERATION",
    category: "Content",
    label: "Hotel Review Approval",
    description: "Individual Pending reviews requiring human approval before ELS credit + publication.",
    currentValue: "1 pending (rev-099)",
    approvers: ["Content Manager"],
    impact: "Low",
    reviewCadence: "Daily",
    budgetImpactHint: "Per-review ELS cost is bounded (max +12)",
  },
  {
    key: "REVIEW_TAKEDOWN",
    category: "Content",
    label: "Review Takedown / Dispute",
    description: "Remove an already-approved review (OP report, hotel dispute, legal).",
    currentValue: "0 takedowns this quarter",
    approvers: ["Content Manager", "CMO"],
    impact: "Low",
    reviewCadence: "As reported",
    budgetImpactHint: "May require ELS clawback",
  },
];

/* ═══════════ Approval requests (audit history + active queue) ═══════════ */
export type ApprovalStatus = "Pending" | "Approved" | "Rejected" | "Withdrawn";

export interface ApprovalRequest {
  id: string;
  itemKey: string;                /* references APPROVAL_ITEMS.key */
  requestedBy: string;            /* user email */
  requestedByName: string;
  requestedAt: string;            /* ISO datetime */
  /* Change payload */
  currentValue: string;
  proposedValue: string;
  justification: string;          /* why */
  impactAnalysis: string;         /* quantified expected effect */
  /* Approval chain progress */
  status: ApprovalStatus;
  currentApprover?: ApproverRole; /* who is next in chain */
  signatures: Array<{
    approver: ApproverRole;
    approverName: string;
    signedAt: string;
    decision: "Approved" | "Rejected";
    comment?: string;
  }>;
  resolvedAt?: string;
}

export const approvalRequests: ApprovalRequest[] = [
  /* ── Pending queue ── */
  {
    id: "apr-001",
    itemKey: "ELS_BOOKING_EARN_RATE",
    requestedBy: "cmo@ohmyhotel.com", requestedByName: "Jin-woo Choi (CMO)",
    requestedAt: "2026-04-22 10:30:00",
    currentValue: "0.01 ELS / $1",
    proposedValue: "0.012 ELS / $1 (+20%)",
    justification: "Q2 OP engagement campaign. Competing chain raised to 1.2% rebate.",
    impactAnalysis: "Est. +₩6M/month in ELS liability. Offset by projected +8% booking volume = +₩9M margin. Net +₩3M/month.",
    status: "Pending", currentApprover: "CEO",
    signatures: [
      { approver: "CFO", approverName: "Su-min Park (CFO)", signedAt: "2026-04-22 15:00:00", decision: "Approved", comment: "Budget impact acceptable given volume upside projection." },
    ],
  },
  {
    id: "apr-002",
    itemKey: "HOTEL_POINTS_BOOSTS",
    requestedBy: "marketing@ohmyhotel.com", requestedByName: "Ji-yeon Kim (Marketing Manager)",
    requestedAt: "2026-04-23 09:15:00",
    currentValue: "6 active (1.1× ~ 1.2×)",
    proposedValue: "Add htl-011 (Novotel Shanghai Pudong) × 1.1 for 30 days",
    justification: "Partner hotel sent request for Q2 push. No extra commission but expect +15% volume from OP channel.",
    impactAnalysis: "~20 bookings/day × 30d × $150 × 0.01 × 1.2 Gold × 1.1 boost = 1,188 ELS / month extra. Cost ₩1.5M.",
    status: "Pending", currentApprover: "CMO",
    signatures: [],
  },
  {
    id: "apr-003",
    itemKey: "REWARD_POOL_BUDGET",
    requestedBy: "cfo@ohmyhotel.com", requestedByName: "Su-min Park (CFO)",
    requestedAt: "2026-04-20 14:00:00",
    currentValue: "Uncapped",
    proposedValue: "Set cap at ₩50M / month (approx 15% of total margin)",
    justification: "Need hard cap before Q2 growth. Current uncapped exposure risks runaway cost if OP acquisition accelerates.",
    impactAnalysis: "At current 2,000 active OPs × avg 50 ELS/mo = ₩100M/mo issuance — already exceeds proposed cap. Transition plan needed.",
    status: "Pending", currentApprover: "CEO",
    signatures: [],
  },

  /* ── Recent history (approved) ── */
  {
    id: "apr-010",
    itemKey: "ELS_BOOKING_EARN_RATE",
    requestedBy: "cfo@ohmyhotel.com", requestedByName: "Su-min Park (CFO)",
    requestedAt: "2026-04-15 11:00:00",
    currentValue: "0.05 ELS / $1 (legacy)",
    proposedValue: "0.01 ELS / $1 (100× reduction)",
    justification: "Initial rate was economically unsustainable (~58% of margin at Gold+promo). Rebalance to ~40% of margin.",
    impactAnalysis: "Cuts ELS liability by ~₩240M/month. OP perceived reward still meaningful given Shop price cuts (~30%).",
    status: "Approved", resolvedAt: "2026-04-16 16:30:00",
    signatures: [
      { approver: "CFO", approverName: "Su-min Park (CFO)",       signedAt: "2026-04-15 11:00:00", decision: "Approved", comment: "Self-initiated; reviewed with accounting team." },
      { approver: "CEO", approverName: "Tae-hoon Lee (CEO)",       signedAt: "2026-04-16 16:30:00", decision: "Approved", comment: "Agreed. Monitor OP retention for 60 days." },
    ],
  },
  {
    id: "apr-011",
    itemKey: "HOTEL_POINTS_BOOSTS",
    requestedBy: "cmo@ohmyhotel.com", requestedByName: "Jin-woo Choi (CMO)",
    requestedAt: "2026-04-10 10:00:00",
    currentValue: "Promo multipliers 2× / 3× / 5×",
    proposedValue: "Reduce to 1.1× / 1.15× / 1.2×",
    justification: "Same markup applies to promo hotels — original 2-5× was a rounding error to margin check.",
    impactAnalysis: "Reduces max promo exposure from 5× to 1.2× → ~76% reduction in worst-case ELS issuance per promo booking.",
    status: "Approved", resolvedAt: "2026-04-12 14:00:00",
    signatures: [
      { approver: "CMO", approverName: "Jin-woo Choi (CMO)",      signedAt: "2026-04-10 10:00:00", decision: "Approved" },
      { approver: "CFO", approverName: "Su-min Park (CFO)",       signedAt: "2026-04-11 09:30:00", decision: "Approved", comment: "Long overdue." },
      { approver: "CEO", approverName: "Tae-hoon Lee (CEO)",       signedAt: "2026-04-12 14:00:00", decision: "Approved" },
    ],
  },
  {
    id: "apr-012",
    itemKey: "SHOP_PRODUCT_PRICE",
    requestedBy: "marketing@ohmyhotel.com", requestedByName: "Ji-yeon Kim (Marketing Manager)",
    requestedAt: "2026-04-16 15:00:00",
    currentValue: "Korean catalog: 5~30 ELS",
    proposedValue: "Reduce 30-40% → 3~20 ELS",
    justification: "After earn rate cut, OPs can't afford Shop items. Proportional price drop needed to preserve engagement.",
    impactAnalysis: "Faster redemption → slightly higher per-OP wholesale cost, but matches new earning pace. Net even.",
    status: "Approved", resolvedAt: "2026-04-17 11:00:00",
    signatures: [
      { approver: "Marketing Manager", approverName: "Ji-yeon Kim",    signedAt: "2026-04-16 15:00:00", decision: "Approved" },
      { approver: "CMO",               approverName: "Jin-woo Choi",    signedAt: "2026-04-17 11:00:00", decision: "Approved", comment: "Go live with next release." },
    ],
  },

  /* ── Rejected history ── */
  {
    id: "apr-020",
    itemKey: "ELS_NON_TRANSFERABLE",
    requestedBy: "cmo@ohmyhotel.com", requestedByName: "Jin-woo Choi (CMO)",
    requestedAt: "2026-03-18 10:00:00",
    currentValue: "Non-transferable (disabled)",
    proposedValue: "Enable P2P transfer with 1,000 ELS/day cap + 1% fee",
    justification: "Team collaboration feature request — OPs want to share rewards for handovers.",
    impactAnalysis: "Introduces gift-laundering / vote-trading risk. Adds AML/KYC obligation. Fee revenue estimated ₩1M/mo at scale — not worth the compliance overhead.",
    status: "Rejected", resolvedAt: "2026-03-20 09:00:00",
    signatures: [
      { approver: "CFO", approverName: "Su-min Park (CFO)",       signedAt: "2026-03-19 11:00:00", decision: "Rejected", comment: "AML exposure not justified by marginal revenue." },
      { approver: "CEO", approverName: "Tae-hoon Lee (CEO)",       signedAt: "2026-03-20 09:00:00", decision: "Rejected", comment: "ELS stays tied to the OP who earned it. Clean attribution wins. Re-raise only if collaboration blocker becomes material." },
    ],
  },
];

/* ═══════════ Helpers ═══════════ */

export function pendingApprovals(): ApprovalRequest[] {
  return approvalRequests.filter(r => r.status === "Pending");
}

export function approvalsByCategory(category: ApprovalCategory): ApprovalItem[] {
  return APPROVAL_ITEMS.filter(i => i.category === category);
}

export function approvalHistory(itemKey: string): ApprovalRequest[] {
  return approvalRequests
    .filter(r => r.itemKey === itemKey)
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
}

export function getApprovalItem(key: string): ApprovalItem | undefined {
  return APPROVAL_ITEMS.find(i => i.key === key);
}

/* Impact → UI chip color */
export const IMPACT_COLOR: Record<ApprovalImpact, string> = {
  Low:      "#64748b",
  Medium:   "#0891b2",
  High:     "#eab308",
  Critical: "#EF476F",
};

/* Approver role → UI badge color */
export const APPROVER_COLOR: Record<ApproverRole, string> = {
  CEO:                "#FF6000",
  CFO:                "#118AB2",
  CMO:                "#8b5cf6",
  CPO:                "#06D6A0",
  "Marketing Manager": "#a855f7",
  "Content Manager":   "#eab308",
  "ELLIS Admin":       "#64748b",
};
