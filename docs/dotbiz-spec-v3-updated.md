# DOTBIZ 기능 명세서 v3 (Updated 2026-05-08)

**프로젝트**: DOTBIZ — Supplier Architecture for Global B2B Hotels
**버전**: 3.0 (2026-05-08 갱신)
**상태**: 결재 완료 24건 반영

---

## 1. 비즈니스 정의

### 1.1 포지셔닝

| 항목 | 정의 |
|------|------|
| **카테고리** | Supplier Architecture for Global B2B Hotels |
| **NOT** | 베드뱅크 / 어그리게이터 / OTA |
| **차별화** | 호텔 직거래 공급 구조, OhMyHotel 다국가 법인 운영 |

### 1.2 사용자 분류

| 역할 | 그룹 | 책임 |
|------|------|------|
| **Master** | 고객사 (자사 직원) | 자사 OP/계약 관리, 분쟁 검토, 자사 전체 가시성 |
| **OP** | 고객사 | 예약 작성/조회, ELS 보유 (개인) |
| **Accounting** | 고객사 | 정산 조회, 입금 매칭 |
| **EllisOP** | ELLIS (위탁 운영) | 모든 고객사 티켓/분쟁 처리 |

**삭제됨**: ~~EllisAdmin~~ (시스템 관리는 ELLIS 백오피스 또는 별도 CMS)

---

## 2. 핵심 도메인

### 2.1 Booking (예약)

#### 룰
- **수정 불가** — 취소 후 재예약만
- **Cash basis** — 입금일 기준 매출 인식
- **FX lock at booking** — 예약 시점 환율 영구 고정
- **24h Draft** — BookingForm localStorage 자동 저장
- **Non-refundable** — 즉시 PG 카드결제 (송금 불가)

#### 상태 (BookingStatus)
- `Confirmed` (확정)
- `Cancelled` (취소)
- `Pending` (보류, PREPAY 결제 대기)

#### Source
- 데이터 모델 보존 (CSV 분석용)
- **UI 필터는 폐기** (API 연동사 자동 분리)

### 2.2 Settlement (정산)

#### 모델

| | PREPAY (선불) | POSTPAY (후불) |
|---|---|---|
| 디포짓 | 없음 | 6종 중 1 (필수) |
| 인보이스 | 예약당 1건 | 정산주기 단위 집계 |
| 결제 | TL 데드라인까지 | Net-30 (Net-45까지 협상) |
| Non-refundable | 즉시 PG 카드 | 가능 |
| 미결제 시 | 예약 미확정 | 신용 한도 동결 단계 |

#### 디포짓 6종
1. Credit by Company
2. Floating Deposit (예약 시 자동 차감)
3. Guarantee Deposit
4. Guarantee Insurance
5. Bank Guarantee
6. **No Deposit** (대표이사 승인 + 정량 3 + 정성 2 충족)

#### AR Aging (6 buckets)

| 단계 | 조치 |
|------|------|
| Current | 입금 기한 도래 전 |
| 1-30일 | 자동 이메일 reminder |
| 31-60일 | 두 번째 알림 + EllisOP 알림 |
| **60일** | **신규 예약 한도 50% 축소** (소프트 동결) |
| 61-90일 | Master 직접 협의 요청 |
| **90일** | **완전 동결** + 법무 검토 |
| 90+ | Write-off (대표이사 결재) |

#### 분쟁 (Dispute)
- **자동 인정 없음** — 모든 분쟁 수동 검토
- **결재선 4단계** (금액별)

| 금액 (USD) | 결재선 | SLA |
|-----------|--------|-----|
| < $1,000 | Master 단독 | 당일 |
| $1,000 ~ 10,000 | Master + Accounting | 24h |
| $10,000 ~ 50,000 | Accounting + EllisOP | 48h |
| $50,000+ | 대표이사 | 72h |
| Critical (시스템) | 별도 트랙 | 24x7 |

#### 환율
- **6통화 운영**: USD / KRW / JPY / CNY / VND / SGD
- **신규 통화 추가** = 소스마켓 추가 시 동시 결재
- **환차손 헷징**: 자연헷지 (JPY 매출-비용 매칭) + 3개월 롤링 Forward (50%)

#### Voucher / Invoice
- **Voucher QR 미사용**
- **Invoice 보존 7년** (전자세금계산서법)
- **자동 발송**: ELLIS 백엔드 (DOTBIZ는 read-only)
- **첨부**: PDF + CSV 분리
- **다운로드 권한**: 로그인 + RBAC (cross-tenant 차단)
- **언어**: 사용자 i18n locale 자동

### 2.3 ELS (리워드 통화)

#### 핵심 파라미터
| 항목 | 값 |
|------|------|
| 1 ELS = 1 USD | 고정 페그 |
| 적립률 | **0.5%** (예약액 대비) |
| 최소 redeem | **10 ELS** |
| 만료 | 24개월 (마지막 활동 기준) |
| 양도 | 불가 |
| 회수 | **영구 보존 (절대 회수 X)** |

#### 적립 트리거
| 종류 | 시점 | 트랜잭션 타입 |
|------|------|--------------|
| 예약 ELS | **체크아웃 (post-stay)** | `Earned-Checkout` |
| 리뷰 ELS | **리뷰 작성 즉시** | `Earned-Review` |
| Welcome | 가입 시 | `Earned-Welcome` |
| Milestone | 도달 시 | `Earned-Milestone` |
| Tier 도달 | 승급 시 | (Stamp만, ELS 0) |

#### Tier (6단계, 단순 매출 USD)

| Tier | 배율 | 임계 | 분기 강등 | 분포 |
|------|------|------|----------|------|
| Bronze | 1.0× | $0+ | — | 41% |
| Silver | 1.1× | $10K+ | $2,500 | 34% |
| Gold | 1.2× | $50K+ | $12,500 | 18% |
| Platinum | 1.3× | $200K+ | $50,000 | 4% |
| **Emerald** | **1.4×** | **$500K+** | **$125,000** | **2%** |
| Diamond | 1.5× | $1M+ | $250,000 | 1% |

**강등 정책**: 3개월 단위 점검, Tier별 차등, 30일 grace

#### Hotel Boost
- **Hard Cap**: **1.25×** (시스템 절대 한도)
- 마진 7% 가정 시 Diamond + 1.25× = 실질 마진 6.06% 안전
- 호텔별 boost 등록 시 cap 자동 clamp

#### Shop 정책
- **Tier 잠금 폐기** (모든 사용자가 모든 상품 redeem 가능)
- **쿠폰 자동 발급 X** — 운영팀 24h 내 수동
- **가격 노출 금지** (Face value 비공개)
- 단위 표기: "ELS" (P 폐기)

### 2.4 Hotel

| 필드 | 설명 |
|------|------|
| `id` | 내부 ID (htl-001 형식) |
| **`hotelCode`** | **외부 코드 (6~7자리 숫자, optional)** |
| `name`, `area`, `starRating`, `reviewScore` | 기본 정보 |
| `price`, `currency` | 가격 (계약 통화) |
| `cancellationPolicy` | Free / Non-refundable |
| `lat`, `lng` | 지도 좌표 |

**검색**: Region / Hotel Name / POI / **Hotel Code** (숫자 입력 시 최상단)

---

## 3. RBAC (권한 매트릭스)

| 기능 | Master | OP | Accounting | EllisOP |
|------|--------|------|----------|---------|
| 자사 예약 조회 | ✅ | ✅ (본인) | ✅ | ✅ (모든 회사) |
| 예약 작성 | ✅ | ✅ | ❌ | ✅ |
| 예약 취소 | ✅ | ✅ (본인) | ❌ | ✅ |
| 정산 조회 | ✅ | ❌ | ✅ | ✅ |
| 입금 매칭 | ❌ | ❌ | ✅ | ✅ |
| 디포짓 등록 | ❌ | ❌ | ❌ | ✅ |
| 분쟁 검토 | ✅ | ❌ | ✅ | ✅ |
| 자사 OP 관리 | ✅ | ❌ | ❌ | ❌ |
| 티켓 작성 | ✅ | ✅ | ✅ | ❌ |
| 티켓 처리 | ❌ | ❌ | ❌ | ✅ |
| ELS 보유 | ❌ | ✅ | ❌ | ❌ |
| ELS 적립 | ❌ | ✅ | ❌ | ❌ |
| ELS Redeem | ❌ | ✅ | ❌ | ❌ |

**Cross-tenant 차단**: Master/OP/Accounting은 자사 회사만.

---

## 4. 다국어 (i18n)

지원 언어: **EN / KO / JA / ZH / VI** (5종)

| 적용 영역 | 자동화 |
|---------|-------|
| UI 텍스트 | 사용자 locale |
| Voucher 발송 | 사용자 locale |
| Invoice 발송 | 사용자 locale |
| 알림 | 사용자 locale |
| OhMy Blog | 글마다 다국어 |

---

## 5. 비기능 요구사항

### 5.1 성능
- 메인 번들: **< 535KB gzip** (현재 달성)
- 코드 스플리팅: 페이지별 lazy chunk
- 빌드 시간: vite < 2초

### 5.2 접근성
- **A11y skip link** 메인 콘텐츠 바로가기
- 키보드 내비게이션 지원
- ARIA labels

### 5.3 에러 처리
- **ErrorBoundary** 페이지별 격리
- Telemetry hook (`window.__dotbizTelemetry`)
- 사용자에게 "이 페이지 다시 시도 / 대시보드로" 옵션

### 5.4 테스트
- vitest **215+ 테스트**
- i18n 누락 감사 테스트
- ErrorBoundary 동작 테스트
- Tier system 산정 정확성

---

## 6. ELLIS / CMS 분리 원칙

DOTBIZ는 **자체 어드민(시스템 관리)을 운영하지 않음**.

| 영역 | 위치 |
|------|------|
| ELS Economics 정책 튜닝 | ELLIS 백오피스 |
| Review Moderation | ELLIS / CMS |
| Risk Dashboard | ELLIS 내부 |
| 블로그/캠페인 관리 | CMS |

→ 명세: `prototypes/dotbiz/docs/specs/dotbiz/Admin_Out_Of_Scope.md`

---

## 7. 데이터 모델 SSOT (단일 진실 소스)

| 모델 | 위치 | 비고 |
|------|------|------|
| `Tier` 유니언 | `mocks/rewards.ts` | TIERS 배열에서 자동 파생 |
| `TIER_ORDER` | 동 | `TIERS.map(t => t.name)` |
| `Hotel` | `mocks/hotels.ts` | hotelCode optional |
| `InvoiceWithMatch` | `mocks/settlement.ts` | 수정 불가 원칙 |
| `POLICY_CHANGELOG` | `mocks/rewards.ts` | 16건 영구 |

**원칙**: 신규 enum/필드 추가 시 SSOT만 수정 → 자동 전파.

---

## 8. POLICY_CHANGELOG 16건 (요약)

### 2026-05-06 Rewards 9건
ELS 0.5% / Min Redeem 10 / Tier 단순매출 / 강등 차등 / 스탬프 활동기준 / Shop 잠금 폐기 / 쿠폰 수동 / Emerald 추가 / Hard Cap 1.25× / 영구보존 / 트리거 체크아웃·리뷰

### 2026-05-07 Settlement 1단계 8건 (CEO)
PG DOTBIZ 부담 / 분쟁 자동인정 X / No Deposit 대표 승인 / 통화 소스마켓 / Net-45 / 환차분기 / 90+ Write-off / 디포짓 6종

### 2026-05-08 Settlement 2단계 8건 (Sage)
PG Tier별 차등 / 헷징 자연+Forward / 신용동결 2단계 / Net-45 TTV별 / No Deposit 정량3+정성2 / 양식 자동평가 / 결재선 4단계 / SLA 영업시간+Critical 24x7

---

## 9. 핵심 원칙 (절대 지킬 것)

1. 구조 통일 — 계정 타입 분기 UI 금지
2. 수정 불가 — 취소 후 재예약만
3. ELS는 OP 개인만, 영구 보존
4. 단일 진실 소스 (SSOT)
5. 신규 필드는 optional 우선
6. `Record<Tier, X>` 강제 — TS가 누락 잡아냄
7. ELLIS/CMS 분리
8. API 파트너 최소 범위
9. Cross-tenant 차단
10. POLICY_CHANGELOG 영구 기록

---

## 10. 문서 인덱스

- 본 명세: `docs/dotbiz-spec-v3-updated.md`
- 화면 명세: `docs/screens.md`
- 테스트 시나리오: `docs/test-scenarios.md`
- 개발팀 핸드오프: `docs/DOTBIZ_Developer_Handoff_2026-05-08.md`
- 기능 인벤토리: `docs/DOTBIZ_Feature_Inventory_2026-05-08.md`
- Settlement 결재: `docs/Settlement_CEO_Inspection_2026-05-07.md`, `2026-05-08.md`
- ELLIS 분리: `prototypes/dotbiz/docs/specs/dotbiz/Admin_Out_Of_Scope.md`
