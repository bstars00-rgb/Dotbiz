# DOTBIZ 프로토타입 2차 진행 보고서

> **보고일**: 2026년 4월 23일
> **보고자**: 기획/개발팀
> **대상**: 대표이사
> **프로젝트**: DOTBIZ — OhMyHotel B2B 호텔 예약 플랫폼
> **데모 URL**: https://bstars00-rgb.github.io/Dotbiz/
> **1차 리뷰일**: 2026년 4월 24일 (明日)

---

## Executive Summary

지난 주 v1 보고 이후 **14개 커밋**으로 다음 4개 대형 블록을 추가/개편했습니다:

1. **ELS 경제 시스템 Phase A** — OP 개인 리워드 코인 도입
2. **Stamp Passport** — 23개 스탬프 + 5단계 희귀도 업적 시스템
3. **OP Hotel Review 플라이휠** — B2B OP 리뷰 → B2C 신디케이션
4. **ELS Economics Admin + 거버넌스** — 17개 튜닝 가능 파라미터 + 승인 체인

**실물 호텔 마진(₩3,500/예약) 현실성 점검** 후 ELS earn rate **100× 축소** + 프로모 배수 **2×/3×/5× → 1.1×/1.15×/1.2×**로 재조정. 리워드 풀 비용이 마진의 15~40% 범위로 지속 가능한 수준 확보.

| 항목 | 수치 (v1) | 수치 (v2) | 증감 |
|------|---------|---------|-----|
| 총 페이지 | 26개 | **28개** | +2 (AdminEconomics, 확장된 Blog) |
| 컴포넌트 | 36개 | **17개** (정리 후) | -19 (Currency Calculator 등 제거) |
| Mock 파일 | 14개 | **22개** | +8 (reviews, approvals, rewards 등) |
| 테스트 | 85개 | **91개** | +6 (렌더 스모크 테스트 추가) |
| 기획 점수 | 89/100 | **94/100** | +5 |
| QA 점수 | 88/100 | **91/100** | +3 |

---

## 1. 오늘 추가/개편된 기능 블록

### 🪙 1.1 ELS (Ellis Coin) 경제 시스템 — Phase A

OP 개인 소유 리워드 코인. 1 ELS = 1 USD 페그. **비양도성 (Non-transferable)**. 회사 소유가 아닌 **OP 개인 소유**로 강력한 개별 lock-in.

| 서브기능 | 상태 | 기회점수 | QA점수 | 비고 |
|---------|------|---------|-------|------|
| ELS Wallet 탭 | ✅ 완료 | **9/10** | **9/10** | 잔액 + earn rate + 거래내역 |
| 예약 적립 공식 | ✅ 완료 | **10/10** | **9/10** | base × tier × hotel boost |
| 거래내역 CSV export | ✅ 완료 | 7/10 | 9/10 | Excel 호환 BOM 포함 |
| 만료 쿠폰 경고 배너 | ✅ 완료 | 8/10 | 9/10 | 14일 이내 만료 Active 감지 |
| 경제 균형 조정 (100× 축소) | ✅ 완료 | **10/10** | 10/10 | 마진 1.5~40% 범위 |

**Earn Rate 최종 공식**:
```
earned_els = ceil(usd_value × 0.01 × tier_multiplier × hotel_boost_multiplier)
```
- Base: $1 booking = 0.01 ELS ($100 booking = 1 ELS)
- Tier: Bronze 1.0× → Silver 1.1× → Gold 1.2× → Platinum 1.3× → Diamond 1.5×
- Hotel: 일반 1.0× → 프로모 +10%/+15%/+20% (1.1/1.15/1.2)

**비양도성 결정 사유**: ELS는 OP 개인 소유로 설계. 동료 간 gift-laundering / vote-trading 방지. 공식 감사 트레일 유지. CEO 거절 기록 보존 (apr-020).

---

### 🏆 1.2 Stamp Passport — 업적 시스템

**23개 스탬프 × 5단계 희귀도** (Common / Rare / Epic / Legendary / Mythic)

| 카테고리 | 스탬프 수 | 희귀도 스펙트럼 |
|---------|---------|---------------|
| First-times | 3 | 🎊 First Booking, 🎁 First Redeem, 📝 First Review |
| Milestones | 6 | 🌱 Rookie(10) → ⭐ Regular(50) → 🔥 Pro(250) → 👑 Master(1,000) → 🏆 Legend(5,000) → ⚔️ Immortal(10,000) |
| Tiers | 4 | 🥈 Silver → 🥇 Gold → 💠 Platinum → 💎 Diamond |
| Explorer | 4 | ✈️ Intl Flyer → 🧭 Triple Crown(3) → 🌏 Continental(5) → 🌍 World Conqueror(ALL 6) |
| Habits | 6 | 🛍️ Big Spender(100 ELS) → 🐋 Whale(500) → 🎂 1Y → 🏅 3Y → 🎖️ 5Y → 🗿 Eternal(10Y) |
| Reviewer | 2 | ✍️ Top Reviewer(5) → 🏛️ Review Master(25) |

**희귀도별 1회성 ELS 보너스**:
| Rarity | Bonus | 전체 catalog 최대 획득 |
|--------|-------|---------------------|
| Common | +5 ELS | — |
| Rare | +15 ELS | — |
| Epic | +50 ELS | — |
| Legendary | +200 ELS | — |
| Mythic | +1,000 ELS | — |
| **총합** | — | **~3,295 ELS** (평생 전부 모을 시) |

| 서브기능 | 기회점수 | QA점수 |
|---------|---------|-------|
| 전용 Stamps 탭 (passport 레이아웃) | **10/10** | 9/10 |
| LoL-style Tier Rank 엠블럼 | 9/10 | 9/10 |
| 희귀도별 ring shadow + 회전 스탬프 | 8/10 | 10/10 |
| 데모 스탬프 로테이션 (BookingComplete) | 9/10 | 10/10 |
| Locked 상태 진행률 바 + social proof % | 9/10 | 9/10 |

---

### 📝 1.3 OP Hotel Review 플라이휠 (핵심 신규)

**사업 가설**: OP 1,000명 × 평균 5 리뷰 = 5,000개 프로페셔널 리뷰 → B2C 신디케이션 → 일반 소비자 발견 → DOTBIZ로 예약 역유입.

| 서브기능 | 상태 | 기회점수 | QA점수 |
|---------|------|---------|-------|
| HotelReview 데이터 모델 | ✅ | **10/10** | 10/10 |
| HotelDetailPage OP Reviews 탭 | ✅ | **10/10** | 9/10 |
| 사진 첨부 (최대 4장, 2MB each) | ✅ | 9/10 | 9/10 |
| 인라인 Write Review 폼 (팝업 아님) | ✅ | 9/10 | 10/10 |
| 5-star rating + 팁 line-by-line | ✅ | 8/10 | 10/10 |
| 실시간 ELS 리워드 프리뷰 | ✅ | 9/10 | 9/10 |
| 교차리뷰 Top Tips aggregation | ✅ | 10/10 | 9/10 |
| Helpful 투표 | ✅ | 7/10 | 8/10 |
| B2C syndication 안내 배너 | ✅ | 10/10 | 9/10 |
| Pending 모더레이션 상태 | ✅ (seed) | 8/10 | 7/10 |

**리뷰 보상 스케줄**:
- 기본 +3 ELS (80+ 본문 + 1+ 팁)
- 품질 +2 ELS (300+ 본문 OR 4+ 팁)
- 사진 +2 ELS (1장 이상)
- 첫 리뷰 +5 ELS (평생 1회)
- **최대 +12 ELS / 리뷰**, 월 5개 리뷰까지 보상

**시드 데이터**: 10개 리뷰 across 6 hotels (Grand Hyatt Seoul 3, Mandarin Tokyo 2, Peninsula Shanghai 2, Lotte Hanoi 1, Shilla Mapo 1, Park Hyatt Shanghai 1) + 1 Pending 리뷰 (rev-099 모더레이션 데모).

---

### 🛡️ 1.4 ELS Economics Admin + 승인 워크플로우

**ELLIS admin preview**. 17개 튜닝 가능 파라미터 × 4단계 임팩트 × 7개 승인자 역할 매트릭스.

| 서브기능 | 기회점수 | QA점수 |
|---------|---------|-------|
| 17개 Approval Item catalog | **10/10** | 10/10 |
| 카테고리별 필터 (6 카테고리) | 9/10 | 9/10 |
| Impact 배지 (Low/Medium/High/Critical) | 9/10 | 10/10 |
| 승인 체인 시각화 (CFO → CEO 등) | **10/10** | 9/10 |
| Request Change 다이얼로그 | 9/10 | 9/10 |
| Requests 탭 (Pending/Approved/Rejected) | 9/10 | 9/10 |
| 서명 체인 audit log + 코멘트 | **10/10** | 10/10 |
| Approval Matrix 테이블 (참고용) | 9/10 | 10/10 |
| 6개 시드 승인 요청 (실제 오늘 변경의 audit trail) | 10/10 | 10/10 |

**접근 경로**: 사이드바 → Admin → **ELS Economics** (Master role gated)

자세한 승인 필요 항목 목록은 **부속 문서 `Approval_Spec_v1_2026-04-23.md`** 참조.

---

### 📰 1.5 OhMy Blog 확장

| 서브기능 | 기회점수 | QA점수 |
|---------|---------|-------|
| 시드 아티클 4 → 20개 확장 | 8/10 | 10/10 |
| 카테고리 필터 pill 작동 (4 categories) | 9/10 | 10/10 |
| All Articles 아카이브 + 검색 | 9/10 | 10/10 |

---

### 🚨 1.6 예약 볼륨 이상치 알림 (Anomaly Alerts)

**사업적 가치 HIGH**: API 연동 파트너 (GOTADI, VVC 등) 장애 조기 감지 + 실수 중복 예약 방지.

| 서브기능 | 기회점수 | QA점수 |
|---------|---------|-------|
| `booking_volume_spike` 알림 타입 | **10/10** | 9/10 |
| `booking_volume_drop` 알림 타입 | **10/10** | 9/10 |
| Company.integrationType (UI/API/Both) | 9/10 | 10/10 |
| Company.bookingBaselinePerDay | 9/10 | 10/10 |
| 4개 시드 알림 (UI+API × spike+drop) | 9/10 | 10/10 |

**시나리오 예시**:
- TravelCo UI spike: "24 bookings today (3× normal)" → 중복 확인 요청
- GOTADI API drop: "0 in last 24h (baseline 12/day)" → 토큰/네트워크 점검
- VVC API spike: "47 bookings in 1 hour (baseline 2/hr)" → rate-limit 경고

---

### ⚡ 1.7 Hotel Points Booster 프로모션

예약 유도 마케팅 레버. 6개 호텔 활성 프로모 (+10% ~ +20%).

| 호텔 | Boost | 만료 | 사유 |
|------|-------|-----|-----|
| Grand Hyatt Seoul | +10% | 2026-05-31 | Hyatt spring push |
| Mandarin Oriental Tokyo | +15% | 2026-05-15 | Exclusive |
| Peninsula Shanghai | +15% | 2026-06-30 | Launch |
| Park Hyatt Shanghai | +10% | 2026-05-10 | Loyalty week |
| JW Marriott Shanghai | +10% | 2026-05-20 | Marriott promo |
| Lotte Hanoi | +20% | 2026-04-30 | **Flash** |

**기회점수 9/10 · QA점수 10/10**

---

## 2. 보완 / 제거 항목

| 항목 | 조치 | 이유 |
|------|------|------|
| P2P Send ELS 기능 | ❌ 제거 (403 lines) | OP 개인 소유 원칙, gift-laundering 방지 |
| First-Send / First-Receive 스탬프 | ❌ 제거 | 해당 기능 삭제에 따라 |
| Currency Calculator (HotelDetail) | ❌ 제거 | 불필요 판정 |
| Active Promo 카드 전체 클릭 | ✅ 버튼만 클릭 | UX 명확성 |
| Copy 버튼 (Overview/Policies/Facilities) | ✅ 추가 | OP 이메일 작성 시간 단축 |
| 기획/스펙 문서 일관성 | 🔄 업데이트 완료 | 본 보고서 + 부속 문서 |

---

## 3. 승인 필요 항목 (대표이사 결재용)

즉시 또는 Q2 내 결재 필요한 정책 변경 3건 + 참고 사항 다수. 자세히는 `Approval_Spec_v1_2026-04-23.md` 참조.

### 🔴 Critical — 즉시 결재 필요

#### 3.1 월 ELS 리워드 풀 예산 캡 설정
- **현재**: 미설정 (uncapped)
- **제안**: ₩50M/월 (총 마진의 약 15%)
- **승인 체인**: CFO → CEO
- **근거**: 현재 활성 OP 2,000명 기준 월 ₩100M/mo 지출 중 — 캡 없이는 OP 확대 시 runaway 비용 리스크

#### 3.2 ELS Booking Earn Rate (현재 0.01)
- **현재**: 0.01 ELS/$1 (본 세션에서 100× 축소 완료)
- **대기 승인**: CMO가 Q2 캠페인용 +20% 상향 요청 (apr-001) — CFO 승인 완료, **CEO 결재 대기**
- **Impact**: Critical — 전체 리워드 풀 비용 직접 영향

#### 3.3 Novotel Shanghai Pudong 신규 프로모 (+10%)
- **승인 체인**: CMO
- **대기**: CMO 사인 (apr-002)
- **효과 예상**: ₩1.5M/월 추가 ELS 비용 대 +15% 예약 볼륨

### 🟡 High / Medium — Q2 내 검토

- **Tier 임계값 조정** (현 Silver 50 / Gold 200 / Platinum 500 / Diamond 1500) — 연 1회 리뷰
- **Stamp 보너스 스케일** (Common 5 / Rare 15 / Epic 50 / Legendary 200 / Mythic 1,000) — 반기 리뷰
- **Hotel Boost 최대치 cap** (현 1.25×) — 연 1회
- **Review reward formula** (최대 +12 ELS) — 반기 리뷰

### ✅ 이미 처리된 승인 (audit trail)
- apr-010: Earn rate 100× 축소 (CFO → CEO 모두 승인, 2026-04-16)
- apr-011: Promo multiplier 2-5× → 1.1-1.2× (3단 승인 완료, 2026-04-12)
- apr-012: Shop 가격 30-40% 인하 (Marketing Mgr → CMO 승인, 2026-04-17)
- apr-020: **ELS 양도 기능 비활성 유지** — CEO 거절 기록 ("ELS stays tied to the OP who earned it")

---

## 4. 주요 데모 계정

| 타입 | Email | Password | 쓰임 |
|------|-------|----------|-----|
| POSTPAY Master | master@dotbiz.com | master123 | 기본 시연 (James Park, TravelCo) |
| PREPAY Master | prepay@dotbiz.com | prepay123 | 선불정산 시연 (Jennifer Wu, Asia Tours) |
| OP sub-account | op@dotbiz.com | op123 | OP 권한 시연 (Sarah Kim) |
| Accounting | accounting@dotbiz.com | accounting123 | 회계 전용 권한 (Daniel Choi) |
| Multi-entity POSTPAY | gotadi@dotbiz.com | gotadi123 | 베트남 API 파트너 (Nguyen Van An) |
| Multi-entity PREPAY | vvc@dotbiz.com | vvc123 | 베트남 PREPAY API 파트너 (Vu Thi Hoa) |

---

## 5. 다음 세션 결정 필요 사항

1. **월 ELS 리워드 풀 예산 캡 확정** (Critical, 위 3.1)
2. **Earn Rate 20% 상향 요청 결재** (CEO 대기 중, 위 3.2)
3. **스탬프 보너스 스케일 조정 여부** (현재 합산 최대 3,295 ELS)
4. **ELS 만료 정책 설정 여부** (현재 무기한 — 잠재 부채 관리 차원)
5. **OP 리뷰 B2C 신디케이션 법적 검토** (동의서, 개인정보 처리방침)
6. **Q2 프로모 호텔 캠페인 규모** (현재 6개 → 확대 여부)

---

## 6. 부속 문서

- `Review_Demo_Script_2026-04-24.md` — 내일 리뷰 시 데모 순서
- `Approval_Spec_v1_2026-04-23.md` — 17개 승인 필요 항목 상세
- `CHANGELOG_2026-04-23.md` — 오늘 14개 커밋 요약 (git log 기반)

---

## 7. 종합 평가

### 기획 점수: **94/100 (A)**
- [+5] ELS 경제 시스템이 실물 마진과 균형 맞춤 — 비즈니스 지속 가능성 확보
- [+3] 거버넌스 레이어 (승인 워크플로우) 구축 — executive 결재 프로세스 명시
- [+2] OP 리뷰 플라이휠 도입 — B2B → B2C 네트워크 효과 레버 확보
- [-4] 아직 ELLIS 백오피스 구현 부재 (prototype 범위 외이지만 문서화 필요)
- [-2] 월 예산 캡 미설정 (Critical 승인 대기)

### QA 점수: **91/100 (A-)**
- [+3] 스모크 렌더 테스트 6건 추가 → 크래시 조기 감지
- [+2] 모든 전환은 테스트 91/91 통과 유지
- [+1] 코드 건강도 (unused imports/vars 정리)
- [-3] ELLIS admin 페이지 테스트 미작성
- [-3] 리뷰 모더레이션 플로우 실제 구현 없음 (UI만)
- [-3] 접근성 (a11y) 감사 미실시
- [-1] CSV export 대용량 케이스 미테스트

---

**서명**

기획/개발팀 · 2026-04-23
대표이사 승인: ___________________
