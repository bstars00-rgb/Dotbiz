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

/* ═══════════ 전체 승인 카탈로그 ═══════════ */
export const APPROVAL_ITEMS: ApprovalItem[] = [
  /* ── Economics (최고 민감도) ── */
  {
    key: "ELS_BOOKING_EARN_RATE",
    category: "Economics",
    label: "ELS 예약 적립률",
    description: "객실가 $1당 지급되는 ELS. 리워드 풀 비용의 핵심 레버.",
    currentValue: "0.01 ELS / $1 ($100 예약당 1 ELS)",
    approvers: ["CFO", "CEO"],
    impact: "Critical",
    reviewCadence: "분기별",
    budgetImpactHint: "10% 상향 시 총 ELS 부채 +10% (대규모 운영 시 약 ₩30M/월)",
  },
  {
    key: "ELS_USD_PEG",
    category: "Economics",
    label: "ELS ↔ USD 페그",
    description: "1 ELS의 USD 상환 가치. 변경 시 기존 부채가 일괄 재산정됨.",
    currentValue: "1 ELS = 1 USD",
    approvers: ["CFO", "CEO"],
    impact: "Critical",
    reviewCadence: "연 1회 (드물게)",
    budgetImpactHint: "Breaking change — 전체 ELS 재고를 즉시 재가격",
  },
  {
    key: "TIER_MULTIPLIERS",
    category: "Economics",
    label: "티어별 적립 배수",
    description: "Bronze 1.0× / Silver 1.1× / Gold 1.2× / Platinum 1.3× / Diamond 1.5×",
    currentValue: "1.0 / 1.1 / 1.2 / 1.3 / 1.5",
    approvers: ["CMO", "CFO", "CEO"],
    impact: "High",
    reviewCadence: "반기별",
    budgetImpactHint: "평균 +0.1 상향 시 ELS 풀 비용 +8%",
  },
  {
    key: "TIER_THRESHOLDS",
    category: "Economics",
    label: "티어 승급 임계값",
    description: "승급에 필요한 누적 예약 수 (Silver 50 / Gold 200 / Platinum 500 / Diamond 1,500)",
    currentValue: "50 / 200 / 500 / 1,500",
    approvers: ["CMO", "CEO"],
    impact: "High",
    reviewCadence: "연 1회",
    budgetImpactHint: "임계값 하향 시 Silver 이상 OP 증가 → 리워드 비용 +2~5%",
  },

  /* ── Promotions (운영) ── */
  {
    key: "HOTEL_POINTS_BOOSTS",
    category: "Promotions",
    label: "호텔 ELS 부스터",
    description: "호텔별 프로모 배수 (+10% / +15% / +20%), 만료일 있음.",
    currentValue: "활성 6개 (1.1× ~ 1.2×)",
    approvers: ["CMO"],
    impact: "Medium",
    reviewCadence: "캠페인 단위",
    budgetImpactHint: "호텔 1개 × 1.2× × 30일 ≈ 주당 GMV ₩500k 기여",
  },
  {
    key: "PROMO_MAX_MULTIPLIER",
    category: "Promotions",
    label: "프로모 배수 상한",
    description: "단일 호텔 부스트의 Hard ceiling (runaway 캠페인 방지).",
    currentValue: "1.25× (= +25% 상한)",
    approvers: ["CFO", "CEO"],
    impact: "High",
    reviewCadence: "연 1회",
    budgetImpactHint: "0.05 상향마다 예약당 최대 노출 증가",
  },

  /* ── Shop Catalog ── */
  {
    key: "SHOP_PRODUCT_PRICE",
    category: "Shop Catalog",
    label: "상품 ELS 가격",
    description: "상품별 ELS 가격 (6개국 × 32개 상품).",
    currentValue: "3 ~ 20 ELS 범위",
    approvers: ["Marketing Manager", "CMO"],
    impact: "Medium",
    reviewCadence: "월 1회",
    budgetImpactHint: "가격 하향 시 교환 속도↑ → 현금 소진↑",
  },
  {
    key: "SHOP_NEW_ITEM",
    category: "Shop Catalog",
    label: "신규 상품 등록",
    description: "새로운 교환 상품 추가 (공급사 계약 필요).",
    currentValue: "6개국 × 32개 상품",
    approvers: ["Marketing Manager", "CPO"],
    impact: "Low",
    reviewCadence: "공급사 계약 체결 시",
    budgetImpactHint: "프리미엄 가격대가 아니면 영향 경미",
  },
  {
    key: "SHOP_WHOLESALE_CONTRACT",
    category: "Shop Catalog",
    label: "공급사 도매 계약",
    description: "기프티콘 공급사와의 단가 협상 (DOTBIZ 상환 비용 직접 결정).",
    currentValue: "활성: Giftishow, 카카오, Grab, Rakuten 등",
    approvers: ["CPO", "CFO", "CEO"],
    impact: "High",
    reviewCadence: "계약 단위",
    budgetImpactHint: "도매 할인율이 직접 상환 비용을 감소시킴",
  },

  /* ── Gamification ── */
  {
    key: "STAMP_BONUS_SCALE",
    category: "Gamification",
    label: "스탬프 희귀도별 보너스",
    description: "Common 5 / Rare 15 / Epic 50 / Legendary 200 / Mythic 1,000 ELS",
    currentValue: "5 / 15 / 50 / 200 / 1,000",
    approvers: ["CMO", "CFO"],
    impact: "Medium",
    reviewCadence: "반기별",
    budgetImpactHint: "OP 1인당 평생 최대 ~3,295 ELS (전 스탬프 획득 시)",
  },
  {
    key: "NEW_STAMP",
    category: "Gamification",
    label: "스탬프 추가/제거",
    description: "23개 passport 카탈로그 수정.",
    currentValue: "활성 23개 스탬프",
    approvers: ["CMO", "CPO", "CEO"],
    impact: "Medium",
    reviewCadence: "드물게",
    budgetImpactHint: "신규 스탬프 × 희귀도 보너스 × OP 인구",
  },
  {
    key: "REVIEW_REWARD_FORMULA",
    category: "Gamification",
    label: "리뷰 보상 공식",
    description: "기본 +3 / 품질 +2 / 사진 +2 / 첫 리뷰 +5 (리뷰당 최대 +12 ELS, 월 5건 한도)",
    currentValue: "최대 +12 ELS, 월 5건",
    approvers: ["CMO", "CFO"],
    impact: "Low",
    reviewCadence: "반기별",
    budgetImpactHint: "활성 OP 100명 × 월 5 리뷰 × 10 ELS = 월 ₩5M 상한",
  },

  /* ── Policy ── */
  {
    key: "ELS_NON_TRANSFERABLE",
    category: "Policy",
    label: "ELS 양도 가능 여부",
    description: "OP 간 ELS 송금 허용 여부. 현재 비활성 (설계 원칙) — 개인 귀속 명확화, 동료 간 gift-laundering 방지.",
    currentValue: "양도 불가 (비활성)",
    approvers: ["CFO", "CEO"],
    impact: "Critical",
    reviewCadence: "드물게",
    budgetImpactHint: "활성 시 AML/담합 리스크 재도입",
  },
  {
    key: "ELS_EXPIRY_POLICY",
    category: "Policy",
    label: "ELS 만료 기간",
    description: "미사용 ELS 자동 만료 기간. 기본 24개월 (적립일부터). 활성 사용 유도와 OP 신뢰의 균형.",
    currentValue: "24개월 (기본)",
    approvers: ["CFO", "CEO"],
    impact: "High",
    reviewCadence: "연 1회",
    budgetImpactHint: "12개월 단축 시 부채 -40%. 36개월 연장 시 잔여 잔액 +30% 위험.",
  },
  {
    key: "REWARD_POOL_BUDGET",
    category: "Economics",
    label: "월 ELS 리워드 풀 예산 한도",
    description: "DOTBIZ가 월간 지급할 ELS 최대치. 한도 도달 시 차기 주기까지 신규 지급 일시중단.",
    currentValue: "미설정 (결재 필요)",
    approvers: ["CFO", "CEO"],
    impact: "Critical",
    reviewCadence: "연 1회 + 분기별 검토",
    budgetImpactHint: "이 자체가 예산 통제 — 설정이 필수",
  },

  /* ── Content ── */
  {
    key: "REVIEW_MODERATION",
    category: "Content",
    label: "호텔 리뷰 승인",
    description: "Pending 리뷰의 개별 인적 검수 (ELS 지급 + 게시 전 단계).",
    currentValue: "결재 대기 3건",
    approvers: ["Content Manager"],
    impact: "Low",
    reviewCadence: "매일",
    budgetImpactHint: "리뷰당 ELS 비용 상한선 존재 (최대 +12)",
  },
  {
    key: "REVIEW_TAKEDOWN",
    category: "Content",
    label: "리뷰 takedown / 분쟁",
    description: "이미 승인된 리뷰 제거 (OP 신고, 호텔 분쟁, 법적 요청 등).",
    currentValue: "이번 분기 takedown 0건",
    approvers: ["Content Manager", "CMO"],
    impact: "Low",
    reviewCadence: "신고 발생 시",
    budgetImpactHint: "ELS clawback 발생 가능",
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
  /* ── 결재 대기 큐 ── */
  {
    id: "apr-001",
    itemKey: "ELS_BOOKING_EARN_RATE",
    requestedBy: "cmo@ohmyhotel.com", requestedByName: "최진우 (마케팅이사)",
    requestedAt: "2026-04-22 10:30:00",
    currentValue: "0.01 ELS / $1",
    proposedValue: "0.012 ELS / $1 (+20%)",
    justification: "Q2 OP 참여 활성화 캠페인. 경쟁사가 1.2% 리베이트로 상향했음.",
    impactAnalysis: "예상 ELS 부채 월 +₩6M. 예상 예약 볼륨 +8% 증가로 마진 +₩9M 상쇄. 순 +₩3M/월.",
    status: "Pending", currentApprover: "CEO",
    signatures: [
      { approver: "CFO", approverName: "박수민 (재무이사)", signedAt: "2026-04-22 15:00:00", decision: "Approved", comment: "볼륨 증가 예측 고려 시 예산 영향은 수용 가능." },
    ],
  },
  {
    id: "apr-002",
    itemKey: "HOTEL_POINTS_BOOSTS",
    requestedBy: "marketing@ohmyhotel.com", requestedByName: "김지연 (마케팅팀)",
    requestedAt: "2026-04-23 09:15:00",
    currentValue: "활성 6개 (1.1× ~ 1.2×)",
    proposedValue: "htl-011 (Novotel Shanghai Pudong) × 1.1 추가, 30일간",
    justification: "파트너 호텔의 Q2 프로모 요청. 추가 커미션 없지만 OP 채널에서 +15% 볼륨 기대.",
    impactAnalysis: "약 20 예약/일 × 30일 × $150 × 0.01 × Gold 1.2 × 부스트 1.1 = 월 1,188 ELS 추가. 비용 ₩1.5M.",
    status: "Pending", currentApprover: "CMO",
    signatures: [],
  },
  {
    id: "apr-003",
    itemKey: "REWARD_POOL_BUDGET",
    requestedBy: "cfo@ohmyhotel.com", requestedByName: "박수민 (재무이사)",
    requestedAt: "2026-04-20 14:00:00",
    currentValue: "미설정",
    proposedValue: "월 ₩50M 한도 설정 (총 마진의 약 15%)",
    justification: "Q2 성장 전에 Hard cap 설정 필수. 한도 미설정 상태에서 OP 확대 시 비용 runaway 리스크.",
    impactAnalysis: "현재 활성 OP 2,000명 × 월평균 50 ELS = 월 ₩100M 지급 중 — 제안된 한도 초과. 전환 계획 필요.",
    status: "Pending", currentApprover: "CEO",
    signatures: [],
  },

  /* ── 처리 완료 이력 (Approved) ── */
  {
    id: "apr-010",
    itemKey: "ELS_BOOKING_EARN_RATE",
    requestedBy: "cfo@ohmyhotel.com", requestedByName: "박수민 (재무이사)",
    requestedAt: "2026-04-15 11:00:00",
    currentValue: "0.05 ELS / $1 (legacy)",
    proposedValue: "0.01 ELS / $1 (100× 축소)",
    justification: "초기 적립률이 경제적으로 지속 불가능 (Gold+프로모 시 마진의 58% 차지). 마진의 약 40% 수준으로 재조정.",
    impactAnalysis: "ELS 부채 월 약 ₩240M 감소. Shop 가격 30% 인하와 병행해 OP 체감 리워드는 유지.",
    status: "Approved", resolvedAt: "2026-04-16 16:30:00",
    signatures: [
      { approver: "CFO", approverName: "박수민 (재무이사)",  signedAt: "2026-04-15 11:00:00", decision: "Approved", comment: "본인 기안, 회계팀과 협의 후 진행." },
      { approver: "CEO", approverName: "이태훈 (대표이사)",  signedAt: "2026-04-16 16:30:00", decision: "Approved", comment: "동의. 향후 60일간 OP 이탈률 모니터링 필요." },
    ],
  },
  {
    id: "apr-011",
    itemKey: "HOTEL_POINTS_BOOSTS",
    requestedBy: "cmo@ohmyhotel.com", requestedByName: "최진우 (마케팅이사)",
    requestedAt: "2026-04-10 10:00:00",
    currentValue: "프로모 배수 2× / 3× / 5×",
    proposedValue: "1.1× / 1.15× / 1.2×로 하향",
    justification: "프로모 호텔도 동일 마크업 — 기존 2-5× 배수는 마진 검토 없이 과대 설정된 것으로 확인.",
    impactAnalysis: "프로모 최대 노출을 5×→1.2×로 축소. 프로모 예약당 ELS 발행 최악 케이스 ~76% 감소.",
    status: "Approved", resolvedAt: "2026-04-12 14:00:00",
    signatures: [
      { approver: "CMO", approverName: "최진우 (마케팅이사)",  signedAt: "2026-04-10 10:00:00", decision: "Approved" },
      { approver: "CFO", approverName: "박수민 (재무이사)",    signedAt: "2026-04-11 09:30:00", decision: "Approved", comment: "진작에 했어야 할 조정." },
      { approver: "CEO", approverName: "이태훈 (대표이사)",    signedAt: "2026-04-12 14:00:00", decision: "Approved" },
    ],
  },
  {
    id: "apr-012",
    itemKey: "SHOP_PRODUCT_PRICE",
    requestedBy: "marketing@ohmyhotel.com", requestedByName: "김지연 (마케팅팀)",
    requestedAt: "2026-04-16 15:00:00",
    currentValue: "한국 카탈로그: 5~30 ELS",
    proposedValue: "30~40% 인하 → 3~20 ELS",
    justification: "적립률 축소 후 OP가 상품을 살 수 없음. 비례 가격 인하로 engagement 유지.",
    impactAnalysis: "교환 속도 증가 → OP당 도매 비용 소폭 증가, 하지만 새 적립 속도와 균형 유지. Net 중립.",
    status: "Approved", resolvedAt: "2026-04-17 11:00:00",
    signatures: [
      { approver: "Marketing Manager", approverName: "김지연",         signedAt: "2026-04-16 15:00:00", decision: "Approved" },
      { approver: "CMO",               approverName: "최진우 (마케팅이사)", signedAt: "2026-04-17 11:00:00", decision: "Approved", comment: "다음 릴리스에 반영." },
    ],
  },

  /* ── 반려 이력 (Rejected) ── */
  {
    id: "apr-020",
    itemKey: "ELS_NON_TRANSFERABLE",
    requestedBy: "cmo@ohmyhotel.com", requestedByName: "최진우 (마케팅이사)",
    requestedAt: "2026-03-18 10:00:00",
    currentValue: "양도 불가 (비활성)",
    proposedValue: "P2P 송금 활성화 (일일 1,000 ELS 한도 + 1% 수수료)",
    justification: "팀 협업 기능 요청 — OP들이 핸드오버에 대한 보상을 공유하고 싶어함.",
    impactAnalysis: "Gift-laundering / 담합 리스크 재도입. AML/KYC 의무 추가. 수수료 수익 대규모 운영 시 월 ₩1M 예상 — 컴플라이언스 비용 대비 부족.",
    status: "Rejected", resolvedAt: "2026-03-20 09:00:00",
    signatures: [
      { approver: "CFO", approverName: "박수민 (재무이사)",  signedAt: "2026-03-19 11:00:00", decision: "Rejected", comment: "한계 수익으로 AML 노출 정당화 어려움." },
      { approver: "CEO", approverName: "이태훈 (대표이사)",  signedAt: "2026-03-20 09:00:00", decision: "Rejected", comment: "ELS는 획득한 OP 개인에 귀속. 명확한 귀속이 우선. 협업 장벽이 심각해지면 재논의 가능." },
    ],
  },
];

/* ═══════════ 직접 변경 이력 (parameter changelog) ═══════════
 * 이것이 실제로 프로덕트에 반영된 변경 기록. ELS 경제 관리 페이지의
 * "값 수정" 버튼으로 입력된 모든 변경이 여기 쌓인다.
 * 변경 전 반드시 승인번호(apr-xxx)를 참조해야 함. */
export interface ParameterChange {
  id: string;
  itemKey: string;
  appliedBy: string;            /* 적용한 ELLIS admin */
  appliedByName: string;
  appliedAt: string;             /* ISO datetime */
  previousValue: string;
  newValue: string;
  reason?: string;               /* 선택 비고 */
  /* 결재 참조는 이 프로토타입에서는 선택 — 실제 운영 시 감사 로그
   * 완전성을 위해 별도 시스템의 결재 ID를 저장하면 좋음 */
  approvalRef?: string;
}

export const parameterChanges: ParameterChange[] = [
  {
    id: "chg-001",
    itemKey: "ELS_BOOKING_EARN_RATE",
    appliedBy: "ellis@ohmyhotel.com",
    appliedByName: "박수민 (ELLIS Admin)",
    appliedAt: "2026-04-16 17:00:00",
    previousValue: "0.05 ELS / $1",
    newValue: "0.01 ELS / $1",
    approvalRef: "apr-010",
    reason: "결재 완료 후 즉시 프로덕션 반영. CEO 이태훈 서명 확인.",
  },
  {
    id: "chg-002",
    itemKey: "HOTEL_POINTS_BOOSTS",
    appliedBy: "ellis@ohmyhotel.com",
    appliedByName: "박수민 (ELLIS Admin)",
    appliedAt: "2026-04-12 15:30:00",
    previousValue: "2× / 3× / 5× (6개 호텔)",
    newValue: "1.1× / 1.15× / 1.2× (6개 호텔)",
    approvalRef: "apr-011",
    reason: "3단 결재 완료 후 6개 호텔 일괄 재설정.",
  },
  {
    id: "chg-003",
    itemKey: "SHOP_PRODUCT_PRICE",
    appliedBy: "content@ohmyhotel.com",
    appliedByName: "김지훈 (Content Manager)",
    appliedAt: "2026-04-17 14:00:00",
    previousValue: "한국 5~30 ELS",
    newValue: "한국 3~20 ELS (30% 인하)",
    approvalRef: "apr-012",
    reason: "32개 상품 일괄 업데이트. Giftishow 동기화 완료.",
  },
];

/* 특정 파라미터의 변경 이력 (최신순) */
export function changesForItem(itemKey: string): ParameterChange[] {
  return parameterChanges
    .filter(c => c.itemKey === itemKey)
    .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
}

/* 전체 이력 (최신순) */
export function allParameterChanges(): ParameterChange[] {
  return [...parameterChanges].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
}

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
