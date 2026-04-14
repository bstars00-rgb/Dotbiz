# DOTBIZ B2B 호텔 예약 시스템 — 프로토타입 현황 명세서 v2.0

> **Status**: PROTOTYPE COMPLETE
> **Last Updated**: 2026-04-11
> **Tech Stack**: React 19 + TypeScript + Vite + Tailwind CSS 4 + shadcn/ui + Recharts + Framer Motion

---

## 1. 시스템 개요

### 1.1 프로젝트 소개
DOTBIZ는 OhMyHotel이 운영하는 AI 기반 차세대 B2B 호텔 예약 플랫폼이다. Operating Partner(OP)에게 전 세계 호텔을 검색, 비교, 예약할 수 있는 통합 환경을 제공한다. Direct 호텔 계약뿐 아니라 DIDA, Hotelbeds 등 서드파티 공급사도 연동하여 50+ 공급사의 실시간 요금을 비교할 수 있다.

### 1.2 사용자 역할

| 역할 | 설명 |
|------|------|
| Master | 업체 관리자 — 전체 OP 관리, 정산 권한, 모든 예약 조회 |
| OP | Operating Partner 실무 담당자 — 호텔 검색/예약, 고객 응대 |

### 1.3 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 19.2.4, TypeScript, Vite 8.0 |
| UI | Tailwind CSS 4.2.2, shadcn/ui (@base-ui/react), Lucide Icons |
| 차트 | Recharts (BarChart, AreaChart, PieChart) |
| 애니메이션 | Framer Motion (페이지 전환) |
| 라우팅 | React Router 7.13.2 (HashRouter) |
| 상태관리 | React Context (AuthContext) + useState/useMemo |
| 빌드 | Vite + vite-plugin-singlefile |

---

## 2. 전체 기능 구조

```
🔐 Login (/login)
🔐 Register (/register)
│
└── 📱 App (MainLayout: 사이드바 + 헤더 + 푸터)
    │
    ├── 📊 Dashboard (/app/dashboard) ← Home
    │
    ├── 🔍 Find Hotel (/app/find-hotel)
    │   └── 🏨 Search Results (/app/search-results?q=도시명)
    │       └── 🏠 Hotel Detail (/app/hotel/:id) ← 새 탭
    │           └── 📝 Booking Form → Confirm → Complete
    │
    ├── 📋 Bookings (/app/bookings)
    ├── 💰 Settlement (/app/settlement) — Master only
    ├── 🔔 Notifications (/app/notifications)
    ├── ❓ FAQ Board (/app/faq)
    ├── 👤 My Account (/app/my-account)
    ├── 🎁 Rewards Mall (/app/rewards)
    ├── 📝 OhMy Blog (/app/blog)
    └── 📞 Contact Us (/app/contact) ← Footer에서 진입
    
    ── Footer (모든 페이지 하단) ──
       About Us | Terms & Conditions | Follow Us
       OHMYHOTEL GLOBAL PTE. LTD. 사업자 정보
```

### 2.1 페이지 네비게이션 규칙
- **도시 검색** → 항상 **같은 탭**에서 Search Results 로드
- **호텔 디테일** → 항상 **새 탭**에서 열림 (OP가 여러 호텔 비교 가능)
- **Home (DOTBIZ 로고/Home 클릭)** → Dashboard로 이동

---

## 3. 페이지별 상세 기능

### 3.1 로그인 (LoginPage)
- 이메일/비밀번호 로그인
- Remember me, Forgot password
- 약관 동의 체크박스 (DOTBIZ Platform Service Agreement, Privacy Policy)
- 데모 계정: master@dotbiz.com / master123, op@dotbiz.com / op123, demo / demo
- 다크모드 토글
- 언어 선택 (EN)
- 로그인 상태 localStorage 유지

### 3.2 회원가입 (RegistrationPage)
- 2-Step 폼 (Account Info → Company Info)
- 파일 업로드 (사업자등록증)
- 이메일/비밀번호 유효성 검사
- Toast 알림

### 3.3 대시보드 (DashboardPage)

#### 3.3.1 글로벌 필터
- **Date Basis**: Booking Date / Check-in / Check-out
- **Period**: This Month, Last Month, Last 30 Days, This Quarter, Last Quarter, This Year, Custom
- **Custom 선택 시**: From~To 날짜 입력 표시

#### 3.3.2 KPI 카드 (4개)
- Total Bookings, Revenue (TTV), Room Nights, Avg Booking Value
- 변화율 뱃지 (+12% 등) + 비교 기준 라벨 ("vs last month")
- Period 변경 시 라벨 자동 업데이트

#### 3.3.3 OP Points
- Balance / Earned / Used + Rewards Mall 링크

#### 3.3.4 Daily Booking Statistics
- **메트릭 선택**: Booking Count / Booking Amount / Number of Nights
- **Date Basis**: Booking Date / Check-in / Check-out
- **날짜 범위**: From~To + days 뱃지
- **Area 차트** (Recharts) + Total / Daily Avg / Peak 요약

#### 3.3.5 12-Month TTV Trend
- Recharts BarChart (12개월)
- 마지막 월 강조 (100% opacity)
- 툴팁 (USD 포맷)

#### 3.3.6 Destination Booking Percentage
- **뷰 전환**: Country/Region ↔ City
- **월별 기간 필터**: From month ~ To month
- **도넛 차트** (PieChart) + 컬러 범례
- **테이블**: Country/City, Bookings, %, Amount, Nights

#### 3.3.7 OhMyHotel Bestselling Hotel Rankings
- **16개 국가/지역**: Japan, South Korea, Thailand, China, Hong Kong, Taiwan, UAE, UK, France, Singapore, US, Vietnam, Australia, Germany, Indonesia, Canada
- **각 국가 20개 호텔** (총 320개)
- **국가 필터 드롭다운** (알파벳순)
- **테이블**: Index (1~3위 컬러 뱃지), Hotel Name, Star Rating, City, Country/Region, Supplier (Direct/DIDA/Hotelbeds)

### 3.4 호텔 검색 (FindHotelPage)

#### 3.4.1 메인 검색바
- **Destination**: 도시/호텔명 자동완성 + 도시 탭 드롭다운 (Top Cities, Southeast Asia, Asia, America, Europe, Oceania, Mid East/Africa)
- **Check-In / Check-Out**: 커스텀 2개월 캘린더 + nights 계산
- **Rooms, Per Room**: ±버튼 드롭다운 (Rooms 1~9, Adults 1~5/room, Children 0~4 + 나이 선택)
- **Nationality**: 드롭다운 선택
- 🔍 검색 버튼 (오렌지 라운드)

#### 3.4.2 최근 검색 / 인기 도시
- 최근 검색 이력 카드 (날짜, 가격)
- Free Cancellation / Upcoming Bookings 위젯
- Recommended Accommodations 카드

### 3.5 검색 결과 (SearchResultsPage)

#### 3.5.1 검색바 (메인과 동일)
- DestinationSearch (도시/호텔 자동완성 + 탭 드롭다운)
- DateRangePicker (커스텀 캘린더)
- Rooms / Nationality 드롭다운
- **도시 선택** → 같은 탭 재로드, **호텔 선택** → 새 탭

#### 3.5.2 정렬 탭
- Hot, Featured, Favorite, Price Lowest, Price Highest, Star Lowest, Star Highest

#### 3.5.3 사이드바 필터
- **Search by Property Name**: 호텔명 텍스트 검색
- **Mini Map**: 마커 표시
- **Hotel Location**: 도시별 동적 지역 (22개 도시 × 지역명)
- **Star**: Economy, 3 Star/Comfort, 4 Star/Premium, 5 Star/Luxury
- **Price/Night**: 듀얼 레인지 슬라이더 (USD)
- **Hotel Features**: Amazing Swimming Pool, Family, KTV, Free Parking 등 18개
- **Hotel Brand**: Independent, Marriott, Hilton, IHG, Hyatt, Accor 등 20개
- **Hotel Promotion**: Gift Box, Promotion
- **Multiple Points**: Multiple Points
- **Reset All** 버튼 (필터 활성 시)
- 모든 필터: 토글 선택 + 오렌지 하이라이트 + 실시간 결과 수 변경

#### 3.5.4 호텔 카드
- 순번 뱃지, Featured 뱃지, 즐겨찾기 하트
- 호텔명, 별점, 리뷰 스코어
- 태그: Free Cancellation, Multiple Points, Gift Box, Promotion, Pool, Spa, WiFi 등
- Brand 라벨 (Independent 제외)
- 호텔 설명
- 가격 (From USD) + Details 버튼
- **호텔 클릭** → 새 탭에서 Hotel Detail 열림

### 3.6 호텔 디테일 (HotelDetailPage)

#### 3.6.1 로딩 팝업
- 새 탭 진입 시 2~3초 로딩 다이얼로그
- 유머러스한 메시지 랜덤 전환 ("Searching 50+ suppliers...", "Brewing the perfect room rates..." 등)
- 공급사 카운터 (0/54 → 54/54)
- 프로그레스 바 애니메이션

#### 3.6.2 검색바 (메인과 동일)
- 동일한 DestinationSearch + DateRangePicker
- 도시 재검색 → 같은 탭 Search Results, 호텔 선택 → 새 탭

#### 3.6.3 호텔 정보
- 브레드크럼 (Find Hotel / Search Results / 호텔명)
- 메인 이미지 (55%) + 4개 썸네일
- 호텔명, 별점, 리뷰 스코어/뱃지, 지역
- Favorite / Share 버튼

#### 3.6.4 Rooms 탭
- **룸 필터**: Room type (호텔별 동적), Bed type (호텔별 동적), Price (가격 범위 자동 산출), Meal type, Refundable 체크박스, Clear
- **룸 테이블** (DiDA 스타일):
  - Room Image + Name + View more 링크
  - Confirm Type + OTA 판매 금지 아이콘 (🚫 hover 툴팁)
  - Bed Type / Meal Type
  - Cancellation Policy (Free/Non-Refundable/Partial)
  - Price (USD + KRW) + 📋 Copy 버튼 + Reserve now
  - Last N rooms 경고

#### 3.6.5 View More 팝업 (Dialog)
- 룸 이미지 + 이미지 네비게이션
- Floor, Size(m²), Window 여부, WiFi, Max Persons
- Children Policy
- Room Facilities 그리드

#### 3.6.6 Copy Rate Plan Info
- 📋 아이콘 클릭 → 클립보드 복사 + toast
- 포맷: Hotel Name, Address, Check-In/Out, Room Type, Bed Type, Meal, Price, Total

#### 3.6.7 Overview / Policies / Facilities 탭
- Overview: Opening Year, Phone, Total Rooms, Description
- Policies: Check-in/out, Restrictions, Age, Pets, ID, Children/Extra Bed, Smoking
- Facilities: 30개 시설 그리드

#### 3.6.8 Recommended Properties
- 다른 호텔 4개 카드 (맨 하단, 요금 테이블 아래)
- 클릭 → 새 탭

#### 3.6.9 환율 계산기 (플로팅)
- 우하단 플로팅 버튼 (🔢)
- Sheet 패널: USD 입력 → 10개 통화 변환 (KRW, JPY, CNY, VND, EUR, GBP, THB, SGD, HKD, TWD)
- 환율 표시 + 변환 금액

### 3.7 예약 플로우

#### 3.7.1 Booking Form (Step 1)
- 게스트 정보 (First Name, Last Name, Email)
- 3-Step 프로그레스 뱃지
- 유효성 검사

#### 3.7.2 Booking Confirm (Step 2)
- 주문 요약 (호텔, 룸, 날짜, 가격)
- 약관 동의 체크
- 결제 진행

#### 3.7.3 Booking Complete (Step 3)
- 성공 메시지 + ELLIS 코드
- 바우처 다운로드 / 이메일 발송
- Next Booking 버튼

### 3.8 예약 관리 (BookingsPage)
- Booking List / Calendar / Support Chat 탭
- 필터: Date Type, Booking Status, Payment Status, ELLIS Code
- Excel Export / Bulk Voucher
- 페이지네이션 (20건)
- 예약 상세 모달

### 3.9 정산 (SettlementPage) — Master Only
- 5개 탭: Monthly Summary, Daily Details, Invoices, Accounts Receivable, Points History, Purchase by Hotel
- 다운로드 기능

### 3.10 알림 (NotificationsPage)
- 우선순위별 분류 (Critical/High/Medium/Low)
- 카테고리별 탭 (Deadlines, Payment, CheckIn, Bookings, Cancelled, System)
- 읽음 처리

### 3.11 FAQ (FaqBoardPage)
- 검색 + 카테고리별 아코디언
- Booking, Payment, Cancellation, Account, Technical

### 3.12 내 계정 (MyAccountPage)
- Personal Info, Company Info
- OP Management, Team Members
- Security Settings

### 3.13 리워드몰 (RewardsMallPage)
- 포인트 잔액 / 사용 내역
- 카테고리별 상품 (GiftCards, Travel, Electronics 등)
- Redeem / Transfer 다이얼로그

### 3.14 블로그 (OhMyBlogPage)
- 여행 아티클 리스트
- 상세 뷰 (읽기 시간, 작성자 정보)

### 3.15 Contact Us (ContactUsPage)
- Hotel Customer Service (Korean Market + Global Market)
- Hotel Business Contact
- Office Locations (Seoul HQ + Singapore)
- 브레드크럼 Home → Dashboard

---

## 4. 공통 컴포넌트

### 4.1 MainLayout
- **헤더**: 통화(USD), 언어(EN), 다크모드, 알림(뱃지), 프로필
- **사이드바**: Find Hotel, Dashboard, Bookings, Settlement, Notifications, FAQ Board, My Account, Rewards Mall, OhMy Blog + 사용자 정보 + Logout
- **모바일 반응형**: 햄버거 메뉴 → 좌측 Sheet 드로어 (768px 이하)
- **Footer**: About Us, Terms, Follow Us + 사업자 정보
- **페이지 전환 애니메이션**: framer-motion fade+slide (0.2s)
- **ScrollToTop**: 라우트 변경 시 스크롤 복원

### 4.2 DestinationSearch
- 도시/호텔명 텍스트 입력
- 도시 탭 드롭다운 (7개 지역, 4컬럼 그리드)
- 호텔 자동완성 (이름 + 지역 표시)
- X 클리어 버튼

### 4.3 DateRangePicker
- Check-In / Check-Out 클릭 → 2개월 캘린더 드롭다운
- 선택 범위 오렌지 하이라이트
- Nights 뱃지 자동 계산
- 과거 날짜 비활성화

### 4.4 HotelLoadingDialog
- 유머러스한 로딩 메시지 (10개 랜덤)
- 공급사 카운터 애니메이션
- 프로그레스 바

### 4.5 CurrencyCalculator
- 플로팅 버튼 → Sheet 패널
- USD → 10개 통화 실시간 변환

### 4.6 Footer
- 다크 배경: About Us, Terms, Follow Us
- 라이트 배경: OHMYHOTEL GLOBAL 사업자 정보
- Contact Us 링크 → /app/contact

---

## 5. 디자인 시스템

### 5.1 색상
- Primary: #FF6000 (오렌지) / Dark mode: #60A5FA (블루)
- Success: #009505
- Warning: #FF8C00
- Error: #DC2626
- Background: #FAFAFA / Dark: #0F172A
- Card: #FFFFFF / Dark: #1E293B

### 5.2 타이포그래피
- Heading: DM Serif Display (serif)
- Body: Geist Variable (sans-serif)

### 5.3 반응형 브레이크포인트
- Mobile: < 768px (md)
- Desktop: >= 768px
- 모든 그리드: grid-cols-1 → md:grid-cols-2/3/4

### 5.4 마이크로 인터랙션
- `.card-hover`: hover:shadow-md + -translate-y-0.5
- 버튼: active:scale-[0.97]
- 페이지 전환: framer-motion opacity+y 애니메이션

---

## 6. 목 데이터 구조

### 6.1 Hotels (18개)
```typescript
interface Hotel {
  id, name, area, starRating, reviewScore, reviewCount,
  price, currency, description, amenities, features,
  brand, promotion, multiplePoints,
  isFeatured, hasFreeCancellation, isFavorite,
  checkInOutTimes, cancellationPolicy, childPolicy, petPolicy, smokingPolicy
}
```

### 6.2 Rooms
```typescript
interface Room {
  id, hotelId, name, bedType, bedCount, maxGuests, size,
  floor, hasWindow, facilities, otaRestricted,
  cancellationPolicy, mealIncluded, mealDetail,
  price, priceKRW, totalPrice, totalKRW,
  confirmType, remaining, photos
}
```

### 6.3 Dashboard
- KPI, Points, TTV Trend (12개월), Daily Stats (31일)
- Destination Stats (country 6개 + city 9개)
- Bestselling Hotels (16개국 × 20개 = 320개)
- Location Filters (22개 도시 × 지역명)

### 6.4 Bookings (6건)
- ELLIS 코드, 상태, 결제 상태, 게스트 정보

---

## 7. 빌드 정보

| 항목 | 값 |
|------|-----|
| 빌드 크기 | ~1,489 KB (gzip ~438 KB) |
| 페이지 수 | 19개 |
| 커스텀 컴포넌트 | 8개 |
| UI 컴포넌트 (shadcn) | 19개 |
| 라우트 수 | 21개 |
| 목 데이터 파일 | 9개 |
| 호텔 데이터 | 18개 호텔 + 320개 랭킹 |
| 지원 국가/지역 | 16개 |

---

## 8. 변경 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2026-03-28 | v1.0 초기 기획서 FINALIZED |
| 2026-04-01 | 프로토타입 스캐폴딩 (18개 페이지) |
| 2026-04-11 | v2.0 프로토타입 고도화 |
| | - 모바일 반응형 (햄버거 메뉴, 반응형 그리드) |
| | - 페이지 전환 애니메이션 (framer-motion) |
| | - Dashboard: KPI 필터 (기간/날짜기준/Custom), Daily Booking Statistics, Destination Booking %, Bestselling Hotels (16개국 × 20개) |
| | - Search Results: 7종 필터 + 가격 슬라이더 + Property Name 검색 |
| | - Hotel Detail: 룸 필터, View More 팝업, OTA 금지 아이콘, Copy Rate Plan, 환율 계산기, 로딩 팝업 |
| | - 통합 검색바: DestinationSearch + DateRangePicker (모든 페이지 동일) |
| | - Footer 전체 적용 |
| | - Contact Us 페이지 |
| | - AI Assistant 삭제 |
| | - Recharts 차트 (Bar, Area, Pie) |
| | - 호텔 카드 뱃지 (Multiple Points, Promotion, Brand) |
| | - 호텔 디테일 새 탭 오픈 |
