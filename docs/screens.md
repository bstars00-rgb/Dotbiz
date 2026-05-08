# DOTBIZ 화면 명세서 (Screens)

**작성일**: 2026-05-08
**대상**: 개발팀, 디자이너, QA
**총 화면 수**: 27개 + 인증 2개

---

## 📐 공통 레이아웃

### MainLayout (`/app/*`)
- **Top Bar**: 로고, 메뉴, 통화/언어, 알림, 다크모드, 사용자
- **Sidebar** (좌측): WORK / ADMIN / RESOURCES 그룹
- **Outlet** (메인): 라우트별 콘텐츠 (ErrorBoundary 감싸짐)
- **Footer**: About Us / Terms / Follow Us

### Standalone (`/login`, `/register`)
- 풀스크린, 헤더/사이드바 없음

---

## 🏠 WORK 화면

### S-01. Dashboard

**경로**: `/app/dashboard`
**권한**: All

| 영역 | 컴포넌트 | 데이터 소스 |
|------|---------|-----------|
| KPI 카드 4종 | Card | `dashboardKpis` |
| 12-Month TTV Trend | Recharts BarChart | `ttvTrend` (Apr-25 ~ Mar-26) |
| Destination Booking % | DonutChart | `destinationStats` |
| Top Hotels | List | `bestsellingHotels` |
| My Activities | Timeline | `myActivities` |

**상태**: success / loading (Skeleton) / error (Alert)

---

### S-02. Find Hotel

**경로**: `/app/find-hotel`

| 영역 | 컴포넌트 | 비고 |
|------|---------|------|
| Hero (다크 그라디언트) | div | "Find Your Perfect Hotel" |
| Search Bar | Input + DatePicker + RoomPicker | `placeholder="City / Landmark / District / Hotel / Code"` |
| Search Dropdown | absolute panel | Hotel Code (숫자) / Region / Hotel / POI 4섹션 |
| Recent Searches | Card grid 3열 | localStorage |
| Active ELS Boosters | Card 6개 (1.0~1.25×) | `HOTEL_POINTS_BOOSTS` |
| Promo Banner | clickable | Singapore Spring Sale 등 |
| Featured Hotels | grid | `hotels.filter(h => h.isFeatured)` |

**상태**: empty (첫 방문) / success / loading

---

### S-03. Search Results

**경로**: `/app/search-results`
**Query**: `?q=&checkin=&checkout=&rooms=&adults=&children=`

| 영역 | 비고 |
|------|------|
| Filter Sidebar | 별점 / 가격대 / 편의시설 / 브랜드 |
| Sort Bar | 가격↑ / 가격↓ / 별점 / 리뷰 |
| Hotel Card List | 가격, 무료 취소, ELS 적립 예상 |
| Pagination | 20개씩 |

---

### S-04. Hotel Detail

**경로**: `/app/hotel/:hotelId`

| 영역 | 비고 |
|------|------|
| Search Bar (재검색) | Destination/Date/Room (Nationality 제거됨) |
| Hero Image | 메인 + 갤러리 |
| Tabs | Overview / Rooms / Reviews / Policy |
| Rooms Table | Room Type / Bed / Meal / Billing Sum |
| Rate Plan Copy | 텍스트 복사 (고객 공유) |
| Booking 버튼 | 객실별 |

---

### S-05. Booking Form

**경로**: `/app/booking/form`
**Query**: hotelId, roomId, dates...

| 영역 | 비고 |
|------|------|
| Booking Summary | 호텔/객실/날짜/금액 |
| Travelers Table | Rooms/Gender/LocalName/Last+First/ChildBirthday (Nationality 제거됨) |
| Expected ELS | "+X.X ELS" 간결 표시 |
| Billing Rate Card | PREPAY/POSTPAY 분기 표시 |
| ELS Discount Panel | OP만 표시, Tier별 차등 비율 |
| PaymentDialog | Non-refundable / TL 경과 시 PG 카드 |
| Special Request 안내 | "티켓 시스템으로만 처리" |
| 24h Draft 표시 | localStorage 자동 저장 안내 |

---

### S-06. Booking Confirm

**경로**: `/app/booking/confirm`

| 영역 | 비고 |
|------|------|
| 정산 안내 | POSTPAY: "다음 정산 주기에 청구" / PREPAY: "결제 완료" or "데드라인까지 결제" |
| 정책 안내 | "수정 불가, 취소 후 재예약" + "요청은 티켓으로" |
| Confirmation Number | DOTBIZ + 호텔 |

---

### S-07. Booking Complete

**경로**: `/app/booking/complete`

| 영역 | 비고 |
|------|------|
| 완료 메시지 + 체크 아이콘 | |
| Voucher 다운로드 | PDF (QR 미사용) |
| Invoice 다운로드 | PDF + CSV 분리 |
| ELS 적립 안내 | "체크아웃 시 적립 예정" |

---

### S-08. Bookings (목록)

**경로**: `/app/bookings`

| 영역 | 비고 |
|------|------|
| Quick Filters | All / Confirmed / Cancelled / Pending |
| ~~Source 필터~~ | **폐기됨** (UI/API 구분 불필요) |
| Quick Stats | Free Cancellation 24h/3d, Upcoming 24h/3d |
| 8 컬럼 리스트 | 날짜/예약번호/호텔/체크인/Nights/금액/상태/액션 |
| 행 클릭 | → 상세 다이얼로그 |
| 다이얼로그 액션 | Cancel (Free Cancel만) / View Detail / 티켓 생성 |

**핵심 정책**:
- ~~Amend Booking 버튼~~ — 제거됨
- Non-refundable 취소 차단 + 안내 메시지
- 데드라인 경과 = 취소 차단 + 결제 안내

---

### S-09. Settlement

**경로**: `/app/settlement`

| 영역 | 비고 |
|------|------|
| 정산 타입 배지 | "POSTPAY - Monthly" / "PREPAY" |
| AR Aging 카드 | 6 buckets 시각화 |
| Floating Deposit 잔액 | 자동 차감 추적 |
| Pending Payment 탭 | PREPAY 미결제 (Pay Now 버튼) |
| Invoice 탭 | 발행 인보이스 목록 |
| Receipt 탭 | 입금 기록 |
| CSV Export | 회계 보고용 |

---

### S-10. Settlement Detail

**경로**: `/app/settlement/invoice/:invoiceNo`

| 영역 | 비고 |
|------|------|
| Invoice 헤더 | 발행일/번호/금액/통화 |
| 라인 아이템 | Booking별 |
| Payment 매칭 | 받은 금액 vs 청구 |
| Dispute 영역 | 사유 영구 보존, status 전환 |
| Credit Note 발행 | 별도 (원본 수정 X) |

---

### S-11. Tickets

**경로**: `/app/tickets`

| 영역 | 비고 |
|------|------|
| 티켓 목록 | OP 작성 (자사) / EllisOP 처리 (모든 회사) |
| 우선순위 | High 4h / Medium 24h / Low 72h (영업시간) |
| Critical 트랙 | 부정결제·시스템장애 24x7 |
| Trace Log | AI-assisted 처리 기록 |
| Settlement Dispute | 정산 분쟁은 티켓 트랙 |

---

## 👤 ADMIN 화면

### S-12. Notifications

**경로**: `/app/notifications`

| 영역 | 비고 |
|------|------|
| 카테고리 필터 | Booking/Payment/Ticket/Settlement/Topup/Contract |
| 알림 목록 | 시간/제목/설명/우선순위 |
| Mark as Read | 일괄/개별 |
| Quiet Hours 설정 | AlertPreferencesPanel |

---

### S-13. Master Account / Client Management

**경로**: `/app/client`
**권한**: Master 전용

| 탭 | 비고 |
|----|------|
| OP 관리 | 등록/수정/삭제, 0명 경고 배너 |
| 계약 관리 | Contract per OhMyHotel Entity |
| **Billing Settings** | PREPAY/POSTPAY 선택, 디포짓 종류, 정산 주기, Net-N |
| 자사 OP 0명 시 | "OP를 추가하지 않으면 ELS 적립 작동 X" 배너 |

---

### S-14. My Account

**경로**: `/app/my-account`

| 영역 | 비고 |
|------|------|
| Profile | 이름/이메일/전화 |
| Language | EN/KO/JA/ZH/VI 선택 |
| Theme | Light/Dark |
| Password 변경 | (UI만) |

---

## 📚 RESOURCES 화면

### S-15. FAQ Board

**경로**: `/app/faq`

| 영역 | 비고 |
|------|------|
| 카테고리 탭 | 검색/예약/정산/결제/기타 |
| 검색바 | 질문/답변 텍스트 |
| Q&A 아코디언 | 펼침/접기 |

---

### S-16. OhMy Blog

**경로**: `/app/blog`, `/app/blog/:articleId`

| 영역 | 비고 |
|------|------|
| 글 목록 | 썸네일/제목/요약/작성일 |
| 글 상세 | 마크다운 렌더 |
| 다국어 | 사용자 locale 자동 |

---

### S-17. Rewards Mall

**경로**: `/app/rewards`
**권한**: OP만 (다른 role은 Stamps/Shop만 조회)

| 탭 | 컴포넌트 | 비고 |
|----|---------|------|
| **Wallet** | Balance Card + Tier Card + Earn Rate + Activity Feed | LoL-style 6단계 진척도 |
| **Stamps** | Stamp Grid (rarity별) | 활동 기준 검증 |
| **Shop** | Product Grid | 가격 노출 X, Min 10 ELS, Tier 잠금 X |
| **Vault (My Coupons)** | Voucher List | Active/Used/Expired 필터 |

**Shop 정책 안내 배너**: "모든 상품은 등급 제한 없이 redeem 가능 · 최소 10 ELS · 운영팀 24시간 내 발급"

---

### S-18. Campaign

**경로**: `/app/campaign/:campaignId`

| 영역 | 비고 |
|------|------|
| Hero Banner | 시즌 프로모 |
| 호텔 큐레이션 | 카드 그리드 |

---

## 🛠 추가 기능 화면

### S-19. Map Search (`/app/map-search`)
- Leaflet 지도, 호텔 마커, 가격 라벨

### S-20. Hotel Map View (`/app/hotel-map`)
- 위치 기반 호텔 탐색, 지도+리스트 분할

### S-21. Markup Sharing (`/app/markup-sharing`)
- 마크업 공유 (B2B 협업)

### S-22. Favorites (`/app/favorites`)
- 즐겨찾기 호텔 그리드

### S-23. Monthly Rate (`/app/monthly-rates`)
- 월별 요금 추이, 시즌별 가격

### S-24. Contact (`/app/contact`)
- 이메일/전화 정보, 문의 양식

---

## 🔐 인증 화면

### S-25. Login (`/login`)

| 영역 | 비고 |
|------|------|
| 이메일/비밀번호 | |
| 데모 계정 4종 | master/op/accounting/ellis 빠른 로그인 |
| 언어 선택 | 로그인 전 |

### S-26. Registration (`/register`)

| 영역 | 비고 |
|------|------|
| 신규 OP/Master 가입 | |
| 약관 동의 | |
| 이메일 인증 (UI만) | |

---

## ❌ 삭제된 화면 (ELLIS/CMS로 이전)

| 화면 | 사유 | 이전 위치 |
|------|------|----------|
| ~~Admin Economics~~ | ELS 경제 튜닝 | ELLIS 백오피스 |
| ~~Admin Review Moderation~~ | 리뷰 모더레이션 | ELLIS 또는 CMS |
| ~~Risk Dashboard~~ | 리스크 추적 | ELLIS 내부 |

명세: `prototypes/dotbiz/docs/specs/dotbiz/Admin_Out_Of_Scope.md`

---

## 🎨 디자인 시스템

| 항목 | 값 |
|------|------|
| Primary Color | `#FF6000` (오렌지) |
| 보조 그라디언트 | `#FF6000` ↔ `#FF8C00` |
| 다크 배경 | `#1a1a2e` ~ `#0f3460` |
| 폰트 | Geist (variable) |
| 컴포넌트 | shadcn/ui (Radix 기반) |
| 아이콘 | lucide-react |

### Tier 색상

| Tier | 메인 컬러 | 아이콘 |
|------|---------|-------|
| Bronze | `#a16b3f` | 🥉 |
| Silver | `#64748b` | 🥈 |
| Gold | `#b8861b` | 🥇 |
| Platinum | `#7c7aa7` | 💠 |
| **Emerald** | **`#059669`** | **💚** |
| Diamond | `#0891b2` | 💎 |

---

## 📱 반응형 (Responsive)

| Breakpoint | 적용 |
|-----------|------|
| `< 640px` (mobile) | 사이드바 collapse, 단일 컬럼 |
| `640~1024px` (tablet) | 2열 그리드 |
| `> 1024px` (desktop) | 풀 사이드바, 3-4열 그리드 |

---

## ♿ 접근성

- A11y skip link (메인 콘텐츠 바로가기)
- ARIA labels (모든 인터랙티브 요소)
- 키보드 내비게이션
- Color contrast WCAG AA

---

**문서 위치**: `docs/screens.md`
**짝 문서**: `docs/dotbiz-spec-v3-updated.md`, `docs/test-scenarios.md`
