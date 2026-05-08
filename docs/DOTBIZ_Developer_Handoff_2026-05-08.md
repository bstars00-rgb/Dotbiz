# DOTBIZ 개발팀 인수인계 문서 (Developer Handoff)

**작성일**: 2026-05-08
**대상**: 개발팀
**버전**: 인수인계 v1.0
**기반 커밋**: `21436d1` (main)
**라이브 URL**: https://bstars00-rgb.github.io/Dotbiz/

---

## 0. 한눈에 보기

| 항목 | 내용 |
|------|------|
| **프로젝트** | DOTBIZ — Supplier Architecture for Global B2B Hotels |
| **포지셔닝** | 베드뱅크/어그리게이터 X · 호텔 직거래 공급 구조 |
| **고객** | OP/Master/Accounting (자사 직원) + EllisOP (운영 위탁) |
| **스택** | React 19 + TypeScript + Vite + Tailwind + HashRouter |
| **테스트** | vitest **215/215 passing** |
| **번들** | code-split, vendor 분리 (~535KB main) |
| **배포** | GitHub Pages (gh-pages 브랜치) |
| **저장소** | https://github.com/bstars00-rgb/Dotbiz |

---

## 1. 프로젝트 구조

```
prototypes/dotbiz/
├── src/
│   ├── App.tsx                    # 라우트 정의
│   ├── pages/                     # 27개 페이지 (16,100 LOC)
│   ├── components/                # 공통 컴포넌트
│   │   ├── ErrorBoundary.tsx     # 페이지별 에러 격리
│   │   ├── PaymentDialog.tsx     # PG 결제 시뮬레이션
│   │   └── GroupBookingDialog.tsx
│   ├── mocks/                     # 22개 mock 데이터 (도메인 모델)
│   │   ├── rewards.ts            # ELS / Tier / POLICY_CHANGELOG
│   │   ├── settlement.ts         # PREPAY / POSTPAY 인보이스
│   │   ├── hotels.ts             # 24 hotels + hotelCode
│   │   └── ...
│   ├── contexts/                  # AuthContext, I18nContext, TicketsContext
│   ├── hooks/                     # useScreenState, useTabParam, useFormValidation
│   ├── i18n/                      # EN/KO/JA/ZH/VI 다국어
│   ├── lib/                       # download, alertRouting
│   └── test/                      # 22개 테스트 파일
├── docs/
│   └── specs/dotbiz/
│       └── Admin_Out_Of_Scope.md  # ELLIS/CMS 분리 명세
└── package.json
```

---

## 2. 기능 인벤토리 (27개 페이지)

### 🏠 Work (고객사 사용)

| 페이지 | 경로 | 핵심 기능 |
|--------|------|----------|
| Dashboard | `/app/dashboard` | KPI 4종 (예약 중심), TTV Trend, 목적지 비중 |
| Find Hotel | `/app/find-hotel` | 통합 검색 (Region/Hotel/POI/**Code**), Active ELS Boosters |
| Search Results | `/app/search-results` | 호텔 리스트, 필터 |
| Hotel Detail | `/app/hotel/:id` | 호텔 상세, 객실, 요금 |
| Booking Form | `/app/booking/form` | 예약 작성 (PREPAY/POSTPAY 분기, ELS 결제, 24h draft) |
| Booking Confirm | `/app/booking/confirm` | 확인 + 정산 안내 |
| Booking Complete | `/app/booking/complete` | 완료 + Voucher |
| Bookings | `/app/bookings` | 예약 목록 (8 컬럼, 행 클릭 → 상세 다이얼로그) |
| Settlement | `/app/settlement` | 정산 (AR Aging, Invoice 매칭) |
| Settlement Detail | `/app/settlement/invoice/:id` | 인보이스 상세 |
| Tickets | `/app/tickets` | 티켓 (OP 작성, EllisOP 처리) |

### 👤 Admin (자사 운영)

| 페이지 | 경로 | 권한 |
|--------|------|------|
| Notifications | `/app/notifications` | All |
| Master Account | `/app/client` | Master (자사 OP/계약 관리) |
| My Account | `/app/my-account` | All |

### 📚 Resources

| 페이지 | 경로 | 권한 |
|--------|------|------|
| FAQ Board | `/app/faq` | All |
| OhMy Blog | `/app/blog` | All |
| Rewards Mall | `/app/rewards` | OP (Wallet/Stamps/Shop/Vault) |
| Campaign | `/app/campaign/:id` | All |

### 🛠 추가 기능

| 페이지 | 경로 | 비고 |
|--------|------|------|
| Map Search | `/app/map-search` | 지도 검색 |
| Hotel Map View | `/app/hotel-map` | 지도 뷰 |
| Markup Sharing | `/app/markup-sharing` | 마크업 공유 |
| Favorites | `/app/favorites` | 즐겨찾기 |
| Monthly Rate | `/app/monthly-rates` | 월별 요금 |
| Contact | `/app/contact` | 문의 |

### ❌ DOTBIZ에서 삭제됨 (ELLIS/CMS로 이전)

| 페이지 | 사유 |
|--------|------|
| ~~AdminEconomicsPage~~ | ELLIS 백오피스로 이전 |
| ~~AdminReviewsPage~~ | ELLIS 또는 별도 CMS |
| ~~Risk Dashboard~~ | ELLIS 내부 |

→ 명세서: `docs/specs/dotbiz/Admin_Out_Of_Scope.md`

---

## 3. 핵심 도메인 모델

### 3-1. ELS (리워드 통화)

| 상수 | 값 | 위치 |
|------|------|------|
| `ELS_BOOKING_EARN_RATE` | **0.005** (0.5%) | `mocks/rewards.ts` |
| `ELS_USD_PEG` | 1.0 (1 ELS = 1 USD) | 동 |
| `MIN_REDEEM_ELS` | **10** | 동 |
| `ELS_EXPIRY_MONTHS` | 24 | 동 |
| `MAX_HOTEL_BOOST` | **1.25×** (Hard Cap) | 동 |

**적립 트리거**:
- 예약 ELS → **체크아웃 시점** (`Earned-Checkout` 트랜잭션)
- 리뷰 ELS → **리뷰 작성 즉시** (`Earned-Review`)
- 회수 정책: **영구 보존** (분쟁/리뷰 takedown 등 어떤 사유로도 회수 X)

### 3-2. Tier System (6단계, 단순 매출 USD 기반)

| Tier | 배율 | 매출 (USD) | 분기 강등 임계 | 분포 |
|------|------|----------|---------------|------|
| Bronze | 1.0× | $0+ | — | 41% |
| Silver | 1.1× | $10K+ | $2,500 | 34% |
| Gold | 1.2× | $50K+ | $12,500 | 18% |
| Platinum | 1.3× | $200K+ | $50,000 | 4% |
| **Emerald** ✨ | **1.4×** | **$500K+** | **$125,000** | **2%** |
| Diamond | 1.5× | $1M+ | $250,000 | 1% |

**SSOT**: `TIERS` 배열. `TIER_ORDER = TIERS.map(t => t.name)` 자동 동기화.

⚠️ **신규 tier 추가 시 반드시 확인할 곳**:
- `Record<Tier, X>` 타입의 모든 매핑 객체
- `BookingFormPage.tsx` `tierBasedRatio`
- `AdminEconomicsPage.tsx` (현재 삭제됨, ELLIS 이전 시 동일 패턴)

### 3-3. Settlement Model

```
PREPAY (선불)              POSTPAY (후불)
──────                     ──────
디포짓 없음                디포짓 등록 필수 (6종)
예약당 1건 인보이스        정산주기 단위 집계
TL 데드라인까지 결제       Net-30 (협상 시 Net-45)
결제 없으면 예약 미확정    신뢰 기반
Non-refundable: 즉시 PG    Non-refundable 가능
```

**핵심 규칙**:
- **수정 불가** (취소 후 재예약만)
- Cash basis 회계 (입금일 기준)
- FX lock at booking (예약 시점 환율 영구 고정)
- Invoice 보존 7년 (법정)

### 3-4. Hotel Boost

| 항목 | 값 |
|------|------|
| `MAX_HOTEL_BOOST` | **1.25×** (시스템 Hard Cap) |
| `clampBoost()` | 자동 cap 적용 |
| 마진 영향 (Diamond + 1.25×) | 0.9375% 환원 = 마진 13.4% / 실질 마진 6.06% |

---

## 4. POLICY_CHANGELOG 16건 (영구 기록)

`mocks/rewards.ts` 하단 `POLICY_CHANGELOG` 배열에 모든 정책 변경 영구 보존.

### 2026-05-06: Rewards 9건
1. ELS 적립률 1% → 0.5%
2. MIN_REDEEM_ELS = 10 도입
3. Tier 단순 매출 기반 변경
4. 강등 분기 단위 + 차등
5. 로얄티 스탬프 활동 기준
6. Shop tier 잠금 폐기
7. 쿠폰 수동 발급
8. Tier 6단계 (Emerald 추가)
9. Hotel Boost Hard Cap 1.5× → 1.25×
10. ELS 영구 보존 (회수 X)
11. 적립 트리거 체크아웃 / 리뷰 즉시

### 2026-05-07: CEO 1단계 Settlement 결재 8건
1. PG 수수료 — DOTBIZ 부담
2. 분쟁 자동 인정 — 없음
3. No Deposit — 대표이사 승인
4. 신규 통화 — 소스마켓 추가 시
5. Net-30 상한 — 45일 (60일 금지)
6. 환차손 — 분기 정산
7. AR 90+일 Write-off — 대표이사
8. 디포짓 종류 — 6종 유지

### 2026-05-08: CEO 2단계 Settlement 결재 8건 (Sage 권장)
1. PG 흡수 모델 — Tier별 차등
2. 헷징 — 자연헷지 + Forward
3. 신용 동결 — 2단계 (60/90일)
4. Net-45 결재 — TTV 규모별
5. No Deposit 기준 — 정량 3 + 정성 2
6. No Deposit 양식 — 자동평가
7. 분쟁 결재선 — 4단계
8. 분쟁 SLA — 영업시간 + Critical 24x7

→ 상세는 `docs/Settlement_CEO_Inspection_2026-05-07.md`, `2026-05-08.md`

---

## 5. 권한 / RBAC

| 역할 | 설명 | 핵심 권한 |
|------|------|----------|
| **Master** | 자사 대표 | 자사 전체 조회, 분쟁 검토, OP 관리 |
| **OP** | 예약 담당자 | 예약 작성/조회 (본인), ELS 보유 |
| **Accounting** | 자사 회계 | 정산 조회, 입금 매칭, 분쟁 검토 |
| **EllisOP** | ELLIS 운영 (위탁) | 모든 회사 티켓/분쟁 처리 |
| ~~EllisAdmin~~ | DOTBIZ에서 삭제됨 | — (ELLIS 백오피스로 이전) |

**Cross-tenant 차단**: Master/Accounting/OP는 본인 회사 데이터만 접근.

---

## 6. 다국어 (i18n)

지원 언어: **EN / KO / JA / ZH / VI**

- `src/i18n/strings.ts` 단일 진실 소스
- `useI18n()` hook으로 `t("key")` 호출
- 사용자 locale 자동 감지 (LoginPage 선택 가능)
- Voucher/Invoice 발송 언어도 사용자 locale 기반

---

## 7. 테스트

### 분포 (215개)

| 영역 | 파일 | 개수 |
|------|------|------|
| Tier System | `tierSystem.test.ts` | 21 |
| Rewards Mall | `rewardsMall.test.ts` | 8 |
| Booking Policy | `bookingFormPolicy.test.ts` | ~20 |
| i18n 누락 감사 | `i18n.test.ts` | ~10 |
| ErrorBoundary | `errorBoundary.test.tsx` | ~5 |
| Telemetry | `telemetry.test.tsx` | ~5 |
| 기타 | (16개 파일) | ~146 |

### 실행

```bash
cd prototypes/dotbiz
npm test                    # vitest run (one-shot)
npm run test:watch          # watch 모드
```

---

## 8. 빌드 / 배포

### 로컬 빌드

```bash
cd prototypes/dotbiz
npm install
npm run build               # tsc + vite build (dist/)
npm run dev                 # 로컬 dev 서버
```

### 프로덕션 배포 (gh-pages)

```bash
cd prototypes/dotbiz
npx vite build              # dist/ 갱신
npx gh-pages -d dist -b gh-pages -m "Deploy: <메시지>"
```

⚠️ **자주 빠지는 함정**: 빌드를 하지 않고 `gh-pages` 명령만 실행하면 stale dist가 배포됨.
**반드시 `vite build` → `gh-pages` 순서**.

### 빌드 산출물

```
dist/assets/
  index-XXX.js           # 메인 번들 (~110KB)
  react-vendor-XXX.js    # React 라이브러리
  vendor-XXX.js          # 기타 라이브러리
  charts-XXX.js          # Recharts (~400KB)
  maps-XXX.js            # Leaflet (~150KB)
  animation-XXX.js       # Framer Motion
  [PageName]-XXX.js      # 페이지별 lazy chunk
```

---

## 9. 핵심 원칙 (절대 지킬 것)

1. **구조 통일** — 계정 타입/역할 분기 UI 금지, 데이터만 변경
2. **수정 불가 / 취소 후 재예약** — 감사 추적성 확보
3. **ELS는 OP 개인만** — 양도 X, 영구 보존
4. **단일 진실 소스 (SSOT)** — TIERS / hotels / settlement 등
5. **신규 필드는 optional 우선** — `field?: T` → 자동 `?.X` 강제
6. **`Record<Tier, X>` 강제** — TS가 누락 enum 케이스 잡아냄
7. **ELLIS/CMS 분리 원칙** — DOTBIZ 안에 시스템 관리 페이지 추가 금지
8. **API 파트너 최소 범위** — 자기 API 예약 확인만 (BookingsPage)
9. **Cross-tenant 차단** — Master/OP/Accounting은 자사만
10. **POLICY_CHANGELOG에 영구 기록** — 정책 변경 시 before/after/reason

---

## 10. 알려진 빌드 에러 (사전 존재)

`tsc --noEmit` 시 다음 파일에 타입 에러 존재 (vite build는 통과):

| 파일 | 에러 |
|------|------|
| `AlertPreferencesPanel.tsx:143` | Select onChange 타입 불일치 |
| `InvoiceEmailDialog.tsx:51` | EntityId 타입 |
| `alertRouting.ts:74` | 비교 타입 오류 |
| `settlement.ts:959` | currency property 누락 |
| `BookingsPage.tsx:1031,1040` | cancellationPolicy 미정의 |
| `MainLayout.tsx:82` | "cms" 타입 (해결됨, 잔존 가능) |
| `SettlementDetailPage.tsx:285` | InvoiceWithMatch 타입 호환 |
| `SettlementPage.tsx:1155` | 동일 |
| `telemetry.test.tsx` | Bomb JSX 타입 |
| `vite.config.ts:79` | test 옵션 |

→ vite build는 성공. 점진적 정리 권장.

---

## 11. 향후 작업 (실무 반영 큐)

### CFO 협업
- [ ] PG 수수료 차등 가격 시뮬레이션
- [ ] JPY 매출-비용 매칭 분석
- [ ] 환차손 분기 정산 자동화

### ELLIS 협업
- [ ] No Deposit 자동평가서 양식
- [ ] 분쟁 결재선 시스템 등록
- [ ] Critical 분쟁 24x7 운영 가이드
- [ ] ELS Economics 모듈 (DOTBIZ에서 이전)
- [ ] Review Moderation 모듈 (ELLIS/CMS)

### 코드 정리
- [ ] 사전 존재 빌드 에러 정리
- [ ] AR Aging 60일 트리거 단계 추가
- [ ] Floating Deposit 50% 알림
- [ ] Sage 모니터링 대시보드 (JPY 70% 분산 추적)

### 장기 (IPO 단계)
- [ ] Cash basis + Accrual 병행
- [ ] 디포짓 4종 단순화 (Insurance + Bank Guarantee 통합)

---

## 12. 문서 인덱스

### 명세 (Spec)

| 파일 | 내용 |
|------|------|
| `docs/Settlement_FullSpec_2026-05-04.md` | Settlement 전체 명세 |
| `docs/Settlement_Specification_2026-05-04.md` | 실무 명세 |
| `docs/Settlement_CEO_Report_2026-05-04.md` | 대표이사 종합 보고 |
| `docs/Settlement_CEO_Inspection_2026-05-07.md` | 1단계 결재 (8건) |
| `docs/Settlement_CEO_Inspection_2026-05-08.md` | 2단계 결재 (8건, Sage) |
| `docs/Approval_Spec_v1_2026-04-23.md` | 결재 시스템 |
| `docs/DIDA_Gap_Analysis_v2.0.md` | DIDA 비교 |
| `docs/Data_Model_Spec.md` | 데이터 모델 |
| `docs/Screen_Flow_Diagram.md` | 화면 흐름 |
| `docs/DOTBIZ_프로토타입_명세서_v2.0.md` | 프로토타입 명세 |
| `docs/DOTBIZ_프로토타입_현황_v3.0.md` | 현황 |
| `prototypes/dotbiz/docs/specs/dotbiz/Admin_Out_Of_Scope.md` | ELLIS/CMS 분리 명세 |

### 보고서 (Report)

| 파일 | 내용 |
|------|------|
| `docs/CEO_Report_v1_2026-04-17.md` | 1차 종합 보고 |
| `docs/CEO_Report_v2_2026-04-23.md` | 2차 종합 보고 |
| `docs/CHANGELOG_2026-04-16.md` | 변경 이력 |
| `docs/Review_Demo_Script_2026-04-24.md` | 데모 스크립트 |
| **`docs/DOTBIZ_Developer_Handoff_2026-05-08.md`** | **본 문서** |

### Word 출력본 (.docx)

위 .md 파일 중 결재용은 `docs/md-to-docx.js`로 .docx 변환 가능.

---

## 13. 컨택 포인트

| 영역 | 담당 |
|------|------|
| 도메인 모델 변경 | Tier/ELS/Settlement는 POLICY_CHANGELOG 추가 필수 |
| ELLIS/CMS 이전 | `Admin_Out_Of_Scope.md` 참조 |
| 빌드/배포 | `prototypes/dotbiz/` 디렉토리에서 작업 |
| 테스트 | `npm test` (215/215 통과 유지) |

---

**문서 위치**: `docs/DOTBIZ_Developer_Handoff_2026-05-08.md`
**현재 라이브 커밋**: `21436d1`
