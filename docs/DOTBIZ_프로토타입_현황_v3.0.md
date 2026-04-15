# DOTBIZ B2B 호텔 예약 시스템 — 프로토타입 현황 명세서 v3.0

> **Status**: PROTOTYPE COMPLETE (DIDA 82%+ Coverage)
> **Last Updated**: 2026-04-15
> **Tech Stack**: React 19 + TypeScript + Vite + Tailwind CSS 4 + shadcn/ui + Recharts + Framer Motion + Leaflet

---

## 1. 시스템 개요

DOTBIZ는 OhMyHotel이 운영하는 AI 기반 B2B 호텔 예약 플랫폼. Direct 호텔 + 서드파티(DIDA, Hotelbeds) 연동으로 50+ 공급사 실시간 요금 비교. DIDA B2B 포탈 기능 82% 커버.

---

## 2. 전체 기능 구조 (26 라우트)

```
🔐 Login / Register
│
└── 📱 App (MainLayout: 사이드바 + 헤더 + 푸터)
    │
    ├── 📊 Dashboard (/app/dashboard) ← Home
    │   ├── [Overview] KPI, OP Points, Daily Stats, TTV, Destination %, Bestselling Hotels
    │   ├── [Booking Statistics] 월별 Confirmed/Cancelled/Deferred
    │   ├── [Cancellation] 취소율 Line + 사유 Pie
    │   ├── [Daily Booking] Area 차트 (Count/Amount)
    │   └── [Year-End] 3개년 비교 + YoY 성장률
    │
    ├── 🔍 Find Hotel (/app/find-hotel)
    │   ├── 🗺️ Map Search (/app/map-search) ← Leaflet + OpenStreetMap
    │   └── 🏨 Search Results (/app/search-results)
    │       └── 🏠 Hotel Detail (/app/hotel/:id) ← 새 탭
    │           ├── 🗺️ Hotel Map View (팝업) — 주변 호텔/관광지
    │           ├── 💰 Markup Sharing (/app/markup-sharing) ← 새 탭
    │           └── 📝 Booking Form → Confirm → Complete
    │
    ├── 📋 Bookings (/app/bookings) — 15건, 9종 필터, Batch, Card뷰
    ├── 💰 Settlement (/app/settlement) — 6탭, Applications, Billing Details
    ├── 🎫 Tickets (/app/tickets) — CS 티켓 8건, 처리 이력 타임라인
    ├── 👥 Client Mgmt (/app/client) — 서브계정/부서/잔액/바우처
    ├── 🔔 Notifications (/app/notifications)
    ├── ❓ FAQ Board (/app/faq)
    ├── 👤 My Account (/app/my-account)
    ├── 🎁 Rewards Mall (/app/rewards)
    ├── 📝 OhMy Blog (/app/blog)
    └── 📞 Contact Us (/app/contact)
```

---

## 3. 페이지별 상세 기능

### 3.1 통합 검색바 (모든 검색 페이지 동일)
- **DestinationSearch**: 도시 탭 (7개 지역 4컬럼) + REGION 자동완성 (23개 도시 + "N hotels nearby") + HOTEL 자동완성 + 검색어 하이라이트
- **DateRangePicker**: 2개월 캘린더, `<<` `<` `>` `>>` 네비게이션, 선택 범위 오렌지 원형, nights 뱃지
- **Rooms/Nationality**: 드롭다운
- **Search 필수**: 날짜 변경만으로는 요금 미변경, Search 클릭해야 적용
- **날짜 전달**: 모든 페이지 간 URL params로 checkin/checkout 전달

### 3.2 Dashboard (5탭 통합)
- **Overview**: KPI 4개 (기간/날짜기준/Custom 필터), OP Points, Daily Booking Statistics (메트릭/Area차트), 12-Month TTV Trend, Destination Booking % (Country/City 도넛+테이블), Bestselling Hotels (16개국 × 20개 = 320개)
- **Booking Statistics**: 월별 Confirmed/Cancelled/Deferred Bar 차트
- **Cancellation**: 취소율 KPI + Line 차트 + 사유별 Pie
- **Daily Booking**: Area 차트 (Count/Amount 토글)
- **Year-End**: 3개년 비교 Bar + YoY 성장률 테이블

### 3.3 호텔 검색 (FindHotelPage)
- 메인 검색바 (위와 동일)
- 최근 검색 / Free Cancellation / Upcoming Bookings 위젯
- Recommended Accommodations

### 3.4 검색 결과 (SearchResultsPage)
- 동일 검색바 + 7종 정렬 탭
- 사이드바: Property Name 검색, Mini Map (클릭→지도 새탭), Hotel Location (22개 도시 동적), Star, Price/Night (듀얼 슬라이더), Hotel Features (18개), Hotel Brand (20개), Promotion, Multiple Points
- 호텔 카드: 뱃지 (Free Cancellation, Multiple Points, Promotion, Brand), 새 탭 디테일

### 3.5 지도 검색 (MapSearchPage)
- **Leaflet + OpenStreetMap** 실제 지도
- 번호 원형 마커 (사이드바 리스트와 매칭)
- 마커 팝업: 호텔명/별점/가격 + "View Hotel" 버튼
- 사이드바: 호텔 리스트 + 필터 (Sort/Star/Price/Brand)
- DestinationSearch + DateRangePicker 검색바
- 30+ 도시 좌표 (매칭 호텔 없어도 도시 센터링)

### 3.6 호텔 디테일 (HotelDetailPage)
- 동일 검색바 + **Search 필수** (날짜 변경만으로 요금 미변경)
- Hero: 메인 이미지 + 3 썸네일 + **미니맵** (hover→"View Map" 팝업)
- **Hotel Map View 팝업**: 95vw×90vh 오버레이, 3km 반경 원, 주변 호텔 번호 마커, Nearby Hotels 사이드바
- **Rooms 탭**: 룸 필터 5종 (Room type/Bed/Price/Meal/Refundable), DiDA 스타일 테이블 (Confirm/OTA금지/Bed/Meal/Cancel/Price), View More 팝업, Copy Rate Plan, Per Night + Total 가격
- **Overview 탭**: AI-Enhanced (✨ 뱃지), Hotel Stats, Introduction, Location Insights (Transit/Dining/Business/Tourist), Guest Reviews Summary (세부 점수 + AI 요약)
- **Policies / Facilities 탭**
- **Price Markup Sharing** → 새 탭 전용 페이지
- **Recommended Properties** (맨 하단)
- **환율 계산기** (플로팅 버튼, 10개 통화)

### 3.7 Price Markup Sharing (MarkupSharingPage)
- 호텔 정보 카드 + 체크인/아웃/박수 (검색값 고정, 변경 불가)
- Custom Info Configuration (로고 업로드, 회사명, 전화 — Voucher Setting 연동)
- 룸별 체크박스 선택 (기본 빈 상태) + Markup % 입력 + Per Night / Total 계산
- Overview / Policies 편집 (contentEditable)
- **Quote Preview** (max-w-3xl): 호텔카드 + 마크업 적용 룸 + 회사로고
- **Download as PDF** (window.print → 실제 PDF 저장)

### 3.8 예약 플로우 (BookingFormPage → Confirm → Complete)
- **Create Hotel Booking** (DIDA 스타일)
  - Booker: 이름/이메일 자동 채우기 (회사/유저 DB), Mobile(국가번호), Seller Code
  - Booking Detail: 호텔/룸/날짜/박수/Bed/Meal/Cancel/Confirm 실제 데이터
  - Travelers 테이블: Room, Gender(M/F), Local Name, Last/First Name(EN 대문자), Child Birthday
  - Special Request: 체크박스 6종 + Expected Check-In Time + 커스텀 텍스트
  - Billing Rate: 실제 가격 × 박수
  - Notice + Create/Close 버튼 + 확인 다이얼로그

### 3.9 예약 관리 (BookingsPage) — DIDA 90%
- 필터 9종: Date Type(5), Booking/Payment Status, Payment Channel, ELLIS Code, Hotel Confirm Code, Hotel Name, Guest Name, Group Booking ID
- Batch Operation: Select All, Batch Cancel/Voucher/Export
- Export History 다이얼로그
- List/Card 뷰 전환
- 상세 모달 + 취소 다이얼로그
- 15건 목 데이터

### 3.10 정산 관리 (SettlementPage) — DIDA 80%
- **Applications**: 정산 신청 워크플로우 (체크박스 선택 → Apply Settlement)
- **Billing Details**: 날짜 유형 필터, Bill Type, Bill ID 검색, 10건
- **Invoices**: 상태 필터, PDF 다운로드, 6건
- **AR**: Aging 카드 (Current/30/60/90+), Select All, Pay Selected 다이얼로그
- **OP Points / Purchase by Hotel**

### 3.11 티켓 관리 (TicketManagementPage) — DIDA 80%
- 요약 카드: Pending/Processing/Completed/Rejected
- 상태 탭 + 유형 필터 + 검색
- 8건 티켓 (각 2~4단계 처리 이력)
- 상세 다이얼로그: 정보 그리드 + Processing History 타임라인

### 3.12 클라이언트 관리 (ClientManagementPage) — DIDA 70%
- **Sub-accounts**: 8명, 상태/부서/키워드 필터, Add/Activate/Deactivate
- **Departments**: 6개, Add/Edit/Delete
- **Balance Details**: Credit/Deferred 카드, 10건 거래 내역, Export
- **Voucher Setting**: 회사 정보 + 로고 + Enable/Disable + 미리보기

### 3.13 기타 페이지
- **Notifications**: 우선순위별/카테고리별
- **FAQ Board**: 검색 + 카테고리 아코디언
- **My Account**: Personal/Company/Security
- **Rewards Mall**: 포인트 잔액/상품/Redeem/Transfer
- **OhMy Blog**: 아티클 리스트/상세
- **Contact Us**: Hotel Customer Service + Business Contact + Office Locations
- **Footer**: About Us (→ ohmyhotelnco.com 언어별), Terms, Follow Us

---

## 4. 공통 기능

| 기능 | 상세 |
|------|------|
| **다크모드** | localStorage 저장, 새 탭에서도 유지 (플래시 없음) |
| **모바일 반응형** | 768px 브레이크포인트, 햄버거 메뉴 드로어 |
| **페이지 전환** | framer-motion fade+slide (0.2s) |
| **ScrollToTop** | 라우트 변경 시 스크롤 복원 |
| **카드 호버** | shadow-md + -translate-y-0.5 |
| **버튼 프레스** | active:scale-[0.97] |

---

## 5. 기술 상세

| 항목 | 값 |
|------|-----|
| 빌드 크기 | ~1,816 KB (gzip ~522 KB) |
| 페이지 수 | 24개 |
| 라우트 수 | 26개 |
| 커스텀 컴포넌트 | 8개 |
| UI 컴포넌트 (shadcn) | 24개 |
| 목 데이터 파일 | 14개 |
| 호텔 데이터 | 24개 (Seoul/Busan/Tokyo/Osaka/Bangkok/Shanghai/Beijing/Singapore/HCMC/Bali/DaNang/Hanoi) |
| 호텔 랭킹 | 320개 (16개국 × 20개) |
| 지도 | Leaflet + OpenStreetMap (30+ 도시 좌표) |

---

## 6. DIDA B2B 커버리지

| 영역 | DIDA 기능 | DOTBIZ | 커버율 |
|------|----------|--------|-------|
| 호텔 검색/결과 | 12 | 12 | **100%** |
| 호텔 디테일 | 12 | 11 | **92%** |
| 예약 관리 | 9 | 8 | **89%** |
| 정산 관리 | 4 | 3 | **75%** |
| 티켓 관리 | 4 | 3 | **75%** |
| 계정 센터 | 6 | 3 | **50%** |
| 클라이언트 관리 | 4 | 4 | **100%** |
| 데이터 센터 | 5 | 5 | **100%** |
| 글로벌/메시지 | 8 | 6 | **75%** |
| **전체** | **64** | **55** | **~86%** |

---

## 7. 변경 이력

| 날짜 | 변경 |
|------|------|
| 2026-03-28 | v1.0 초기 기획서 |
| 2026-04-01 | 프로토타입 스캐폴딩 |
| 2026-04-11 | v2.0 프로토타입 고도화 |
| 2026-04-15 | **v3.0 DIDA 86% 커버** |
| | - 예약 관리 고도화 (56→89%) |
| | - 정산 관리 고도화 (25→75%) |
| | - 티켓 관리 신규 (0→75%) |
| | - 클라이언트 관리 신규 (0→100%) |
| | - 데이터 센터 통합 (Dashboard 5탭) |
| | - 지도 검색 (Leaflet + OpenStreetMap) |
| | - Hotel Map View 팝업 (주변 호텔/관광지) |
| | - Price Markup Sharing 전용 페이지 |
| | - 예약 폼 DIDA 스타일 재구현 |
| | - Overview AI-Enhanced 섹션 |
| | - 날짜 전달 전 페이지 통합 (URL params) |
| | - Search 필수 요금 갱신 구조 |
| | - 다크모드 localStorage 유지 |
| | - Beijing 호텔 6개 추가 (총 24개) |
| | - Footer 간소화 + About DOTBIZ 언어별 링크 |
