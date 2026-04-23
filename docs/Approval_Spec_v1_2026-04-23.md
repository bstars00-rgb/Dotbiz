# DOTBIZ ELS 경제 시스템 — 승인 매트릭스 명세서

> **버전**: v1.0
> **작성일**: 2026년 4월 23일
> **배포**: `/app/admin/els-economics` (Master role gated, ELLIS 이관 전 임시)

---

## 목적

DOTBIZ의 ELS (Ellis Coin) 경제와 관련된 **17개 튜닝 가능 파라미터**와, 각 파라미터를 변경하려면 **누구의 승인이 필요한지**를 정의합니다. 돈이 움직이는 모든 변경은 추적·감사 가능한 워크플로우를 거쳐야 합니다.

---

## 1. 승인자 역할 (Approver Roles)

| 역할 | 한국어 | 주 책임 | 색상 |
|-----|-------|--------|-----|
| **CEO** | 대표이사 | 모든 Critical 변경의 최종 결재 | 🟠 #FF6000 |
| **CFO** | 재무이사 | 예산 · 부채 · 수익 영향 승인 | 🔵 #118AB2 |
| **CMO** | 마케팅이사 | 프로모션 · 게임화 전략 | 🟣 #8b5cf6 |
| **CPO** | 상품이사 | 카탈로그 · 공급사 계약 | 🟢 #06D6A0 |
| **Marketing Manager** | 마케팅팀 실무 | 프로모 실행 · 샵 가격 | 연보라 |
| **Content Manager** | 콘텐츠팀 실무 | 리뷰 모더레이션 · 컨텐츠 | 🟡 #eab308 |
| **ELLIS Admin** | 시스템 운영 | 운영 파라미터 · 데이터 동기화 | 회색 |

---

## 2. Impact 등급 (Impact Tier)

| 등급 | 색상 | 기준 | 승인 체인 |
|------|------|------|----------|
| 🔴 **Critical** | 핑크/오렌지 | 돈 흐름 직접 변경 · 부채 커브 이동 | **CFO → CEO** 2단 필수 |
| 🟡 **High** | 골드 | 예산·전략 영향 큼 | 3단 (CMO/CPO + CFO + CEO) |
| 🔵 **Medium** | 시안 | 운영 레벨 | CMO 또는 CFO 단독 |
| ⚪ **Low** | 회색 | 일상 운영 | Manager 단독 |

---

## 3. 17개 승인 필요 항목

### 🔴 Economics 카테고리 (5개)

#### 3.1 ELS_BOOKING_EARN_RATE
- **라벨**: ELS Booking Earn Rate
- **설명**: 예약 $1당 지급 ELS — 리워드 풀 비용의 핵심 레버
- **현재값**: `0.01 ELS / $1` (= 1 ELS per $100)
- **Impact**: **Critical**
- **승인 체인**: CFO → CEO
- **검토 주기**: Quarterly
- **예산 영향**: +10% 상향 → 총 ELS 부채 +10% (~₩30M/월 at scale)

#### 3.2 ELS_USD_PEG
- **라벨**: ELS ↔ USD Peg
- **설명**: 1 ELS의 USD 상환 가치
- **현재값**: `1 ELS = 1 USD`
- **Impact**: **Critical**
- **승인 체인**: CFO → CEO
- **검토 주기**: Annual (거의 없음)
- **주의**: 변경 시 기존 ELS 재고 전체 재가격 — breaking change

#### 3.3 TIER_MULTIPLIERS
- **라벨**: 티어별 earn 배수
- **설명**: Bronze 1.0× / Silver 1.1× / Gold 1.2× / Platinum 1.3× / Diamond 1.5×
- **현재값**: `1.0 / 1.1 / 1.2 / 1.3 / 1.5`
- **Impact**: High
- **승인 체인**: CMO → CFO → CEO
- **검토 주기**: Semi-annual
- **예산 영향**: 평균 +0.1 상향 → ELS 풀 비용 +8%

#### 3.4 TIER_THRESHOLDS
- **라벨**: 티어 승급 예약 임계값
- **설명**: Silver 50 / Gold 200 / Platinum 500 / Diamond 1,500 bookings
- **현재값**: `50 / 200 / 500 / 1,500`
- **Impact**: High
- **승인 체인**: CMO → CEO
- **검토 주기**: Annual
- **예산 영향**: 낮출수록 Silver+ OP 증가 → +2~5% 리워드 비용

#### 3.5 REWARD_POOL_BUDGET ⚠️ 현재 미설정
- **라벨**: 월 ELS 리워드 풀 예산 캡
- **설명**: 월 최대 지급 ELS 총량 — 초과 시 신규 지급 일시중단
- **현재값**: `Uncapped` ← **결재 대기 (apr-003)**
- **Impact**: **Critical** ⚠️
- **승인 체인**: CFO → CEO
- **검토 주기**: Annual with quarterly review
- **중요도**: Q2 OP 확대 전 **반드시 설정 필요**

---

### 🔵 Promotions 카테고리 (2개)

#### 3.6 HOTEL_POINTS_BOOSTS
- **라벨**: 호텔별 ELS 프로모 배수
- **설명**: 특정 호텔 예약 시 +10% / +15% / +20% ELS 추가 지급 (만료일 있음)
- **현재값**: `6개 활성 (1.1× ~ 1.2×)`
- **Impact**: Medium
- **승인 체인**: CMO
- **검토 주기**: Per campaign
- **예산 영향**: 프로모 호텔 1개 × 1.2× × 30일 ≈ ₩1.5M/월 추가

#### 3.7 PROMO_MAX_MULTIPLIER
- **라벨**: 프로모 배수 최대 캡
- **설명**: 단일 호텔 부스트의 hard ceiling (runaway 캠페인 방지)
- **현재값**: `1.25× (= +25% max)`
- **Impact**: High
- **승인 체인**: CFO → CEO
- **검토 주기**: Annual

---

### 🛒 Shop Catalog 카테고리 (3개)

#### 3.8 SHOP_PRODUCT_PRICE
- **라벨**: 상품 ELS 가격
- **설명**: 32개 상품 × 6개 국가의 ELS 가격
- **현재값**: `3 ~ 20 ELS 범위`
- **Impact**: Medium
- **승인 체인**: Marketing Manager → CMO
- **검토 주기**: Monthly
- **예산 영향**: 낮출수록 redemption 속도 ↑ → 현금 소진 ↑

#### 3.9 SHOP_NEW_ITEM
- **라벨**: 새 상품 등록
- **설명**: 리디머 가능 신규 상품 추가 (공급사 계약 필요)
- **현재값**: `32개 across 6 countries`
- **Impact**: Low
- **승인 체인**: Marketing Manager → CPO
- **검토 주기**: As supplier contracts signed

#### 3.10 SHOP_WHOLESALE_CONTRACT
- **라벨**: 공급사 도매 계약
- **설명**: 기프티콘 공급사와의 단가 협상 (DOTBIZ 상환 비용 직접 결정)
- **현재값**: `Giftishow, 카카오, Grab, Rakuten 등 활성`
- **Impact**: High
- **승인 체인**: CPO → CFO → CEO
- **검토 주기**: Per contract

---

### 🎮 Gamification 카테고리 (3개)

#### 3.11 STAMP_BONUS_SCALE
- **라벨**: 희귀도별 스탬프 보너스 ELS
- **설명**: Common 5 / Rare 15 / Epic 50 / Legendary 200 / Mythic 1,000
- **현재값**: `5 / 15 / 50 / 200 / 1,000`
- **Impact**: Medium
- **승인 체인**: CMO → CFO
- **검토 주기**: Semi-annual
- **예산 영향**: OP 1인당 평생 최대 ~3,295 ELS (23개 전부 획득 가정)

#### 3.12 NEW_STAMP
- **라벨**: 스탬프 추가/제거
- **설명**: 23개 passport 카탈로그 수정
- **현재값**: `23 active stamps`
- **Impact**: Medium
- **승인 체인**: CMO → CPO → CEO
- **검토 주기**: Rare

#### 3.13 REVIEW_REWARD_FORMULA
- **라벨**: 리뷰 보상 공식
- **설명**: +3 base / +2 quality / +2 photo / +5 first = 최대 +12 ELS, 월 5회 캡
- **현재값**: `Max +12 ELS, cap 5/month`
- **Impact**: Low
- **승인 체인**: CMO → CFO
- **검토 주기**: Semi-annual
- **예산 영향**: 활성 OP 100명 × 월 5 리뷰 × 10 ELS = ₩5M/월 상한

---

### 🔒 Policy 카테고리 (2개)

#### 3.14 ELS_NON_TRANSFERABLE ⚠️
- **라벨**: ELS 양도 가능 여부
- **설명**: OP-to-OP ELS 송금 허용 여부 (현재 비활성 원칙)
- **현재값**: `Non-transferable (disabled)`
- **Impact**: **Critical**
- **승인 체인**: CFO → CEO
- **검토 주기**: Rare
- **중요도**: 재활성 시 AML/KYC + 담합 리스크 재도입 — CEO 거절 사례 존재 (apr-020)

#### 3.15 ELS_EXPIRY_POLICY
- **라벨**: ELS 만료 정책
- **설명**: 미사용 ELS 자동 만료 기간 (현재: 무기한)
- **현재값**: `No expiry (indefinite)`
- **Impact**: High
- **승인 체인**: CFO → CEO
- **검토 주기**: Annual
- **예산 영향**: 2년 만료 도입 시 총 부채 ₩100M+ 감소 가능

---

### 📰 Content 카테고리 (2개)

#### 3.16 REVIEW_MODERATION
- **라벨**: 호텔 리뷰 승인
- **설명**: Pending 상태 리뷰의 개별 승인 (ELS 지급 + 게시 조건)
- **현재값**: `1 pending (rev-099)`
- **Impact**: Low
- **승인 체인**: Content Manager
- **검토 주기**: Daily
- **예산 영향**: 리뷰당 ELS 비용 상한 (max +12)

#### 3.17 REVIEW_TAKEDOWN
- **라벨**: 리뷰 게시물 삭제
- **설명**: 이미 승인된 리뷰 제거 (신고, 호텔 분쟁, 법적 이슈 등)
- **현재값**: `0 takedowns this quarter`
- **Impact**: Low
- **승인 체인**: Content Manager → CMO
- **검토 주기**: As reported
- **예산 영향**: ELS clawback 가능성

---

## 4. 승인 요청 라이프사이클

```
┌──────────┐   ┌──────────┐   ┌───────────────┐   ┌──────────┐
│ Request  │ → │ Pending  │ → │ Chain Approve │ → │ Applied  │
└──────────┘   └──────────┘   └───────────────┘   └──────────┘
                     ↓                 ↓
                 Withdrawn         Rejected
                     ↓                 ↓
                 ← 취소          ← audit log 영구 보존
```

**상태 세부**:
- **Pending**: 최소 1명의 승인자 서명 대기 중
- **Approved**: 모든 체인 승인자 서명 완료 → 변경 적용
- **Rejected**: 체인 중 한 명이라도 거절 → 즉시 종료, 이유 기록
- **Withdrawn**: 요청자가 자진 철회

**감사 로그 보존**: 상태, 각 서명의 시각/코멘트, 거절 사유 모두 영구 보존.

---

## 5. 실제 처리 사례 (Audit Trail)

### ✅ 완료 (Approved)

#### apr-010: ELS Earn Rate 100× 축소
- **요청자**: Su-min Park (CFO)
- **사유**: "Initial rate was economically unsustainable (~58% of margin at Gold+promo). Rebalance to ~40% of margin."
- **체인**: CFO (self-approved after accounting review) → CEO (agreed, 60d monitoring)
- **완료일**: 2026-04-16

#### apr-011: 프로모 배수 2-5× → 1.1-1.2×
- **요청자**: Jin-woo Choi (CMO)
- **사유**: "Same markup applies to promo hotels — original 2-5× was a rounding error."
- **체인**: CMO → CFO → CEO
- **완료일**: 2026-04-12

#### apr-012: Shop 가격 30-40% 인하
- **요청자**: Ji-yeon Kim (Marketing Manager)
- **사유**: "After earn rate cut, OPs can't afford Shop items."
- **체인**: Marketing Manager → CMO
- **완료일**: 2026-04-17

### ⏳ 대기 중 (Pending)

#### apr-001: Earn Rate +20% 상향 (CMO 요청)
- **사유**: Q2 OP engagement 캠페인. 경쟁사 1.2% 리베이트 상향 대응.
- **영향 분석**: +₩6M/월 ELS 부채, +₩9M 마진 upside 예상, 순 +₩3M/월
- **상태**: CFO ✅ 승인 완료 → **CEO 결재 대기**

#### apr-002: Novotel Shanghai Pudong +10% 프로모 추가
- **상태**: CMO 대기

#### apr-003: 월 ELS 리워드 풀 예산 캡 설정
- **사유**: Q2 OP 확대 전 hard cap 필수
- **제안**: ₩50M/월
- **상태**: **CEO 결재 대기** ⚠️ Critical

### ❌ 거절 (Rejected)

#### apr-020: ELS P2P 송금 기능 활성화
- **요청자**: CMO
- **사유**: 팀 협업 기능 추가 요청
- **CFO 거절**: "AML exposure not justified by marginal revenue."
- **CEO 거절**: "ELS stays tied to the OP who earned it. Clean attribution wins."
- **완료일**: 2026-03-20

---

## 6. Q2 중 결재 필요 사항 (요약)

| 우선순위 | 항목 | 결재자 | 시점 |
|---------|------|-------|-----|
| 🔴 **1** | REWARD_POOL_BUDGET 캡 설정 | CFO → CEO | **즉시** |
| 🔴 **2** | ELS Earn Rate +20% (apr-001) | CEO | **즉시** |
| 🟡 3 | 프로모 호텔 Q2 확대 규모 | CMO | 4월 내 |
| 🟡 4 | ELS 만료 정책 도입 여부 | CFO → CEO | 5월 |
| 🔵 5 | Stamp 보너스 스케일 검토 | CMO → CFO | 반기말 (6월) |
| 🔵 6 | Tier 임계값 연례 검토 | CMO → CEO | 연말 (12월) |

---

## 7. 시스템 구현 위치

- **앱**: DOTBIZ 프로토타입 (Phase 1) → ELLIS admin (Phase 2)
- **경로**: `/app/admin/els-economics`
- **소스**:
  - `src/mocks/approvals.ts` — APPROVAL_ITEMS (17개), ApprovalRequest 모델, 6개 시드 요청
  - `src/pages/AdminEconomicsPage.tsx` — 3-tab UI (Parameters / Requests / Matrix)
- **접근**: Master role (Phase 1 demo) → 전용 Admin/Executive role (Phase 2)

---

## 8. 향후 확장 (Phase 2 ELLIS)

- **Email / Slack 결재 알림**: 대기 요청 발생 시 결재자에게 자동 전송
- **모바일 결재 앱**: 원격 승인 가능
- **Batch 변경**: 여러 파라미터 동시 제안 (예: earn rate + promo multiplier + cap 동시 조정)
- **Simulation mode**: 제안 변경 시 3개월 예측 (매출/비용 그래프)
- **Version control**: 파라미터 변경 이력 git-like diff 뷰
- **Role-based visibility**: Content Manager는 Content 카테고리만, Marketing은 Promo/Shop만

---

**문서 승인 사본 보관**:
- 원본 마크다운: `C:/Users/LENOVO/Desktop/Dotbiz/docs/Approval_Spec_v1_2026-04-23.md`
- 데이터 스키마: `src/mocks/approvals.ts` (TypeScript)
- UI 구현: `src/pages/AdminEconomicsPage.tsx`

**연락처**: 기획/개발팀
