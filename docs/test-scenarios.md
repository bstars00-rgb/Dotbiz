# DOTBIZ 테스트 시나리오 (Test Scenarios)

**작성일**: 2026-05-08
**대상**: QA, 개발팀
**자동 테스트**: vitest 215/215 passing
**수동 테스트 시나리오**: 60+ 케이스

---

## 🎯 우선순위 분류

| 우선순위 | 의미 | 표기 |
|---------|------|------|
| **P0** | 핵심 비즈니스 로직 (예약/정산/ELS) | 🔴 |
| **P1** | 주요 기능 (검색/리워드/티켓) | 🟡 |
| **P2** | 부가 기능 (블로그/FAQ/지도) | 🟢 |

---

## 🔐 인증

### TC-AUTH-01 🔴 로그인
**Given** 데모 계정 `master@dotbiz.com / master123`
**When** 로그인 시도
**Then**
- ✅ Dashboard로 이동
- ✅ 사이드바에 Master 권한 메뉴 표시 (Master Account 포함)
- ✅ Top right에 "TravelCo Inter..." 회사명 표시

### TC-AUTH-02 🔴 권한별 메뉴 분기
**Given** 각 역할로 로그인
**Then**
- Master: 자사 OP/계약 관리 메뉴 ✅
- OP: ELS Wallet 메뉴 ✅
- Accounting: 정산 전체, 자사 OP 관리 X
- EllisOP: 모든 회사 티켓 처리 메뉴

### TC-AUTH-03 🟡 Cross-tenant 차단
**Given** Master(comp-001) 로그인
**When** comp-002 데이터 직접 URL 접근
**Then** ✅ 403 또는 빈 결과

---

## 🔍 검색 / 호텔

### TC-SEARCH-01 🟡 일반 검색
**Given** Find Hotel 페이지
**When** "Seoul" 입력
**Then**
- ✅ Region 섹션에 "Seoul, South Korea" 표시
- ✅ POI 섹션에 "Gangnam, Myeongdong" 표시
- ✅ Hotel 섹션에 Seoul 호텔 5개 표시

### TC-SEARCH-02 🟡 Hotel Code 검색 (신규)
**Given** Find Hotel 페이지
**When** "1001586" 입력
**Then**
- ✅ "Hotel Code (1 matches)" 섹션이 **최상단**에 표시
- ✅ "1001586 · Grand Hyatt Seoul" 표시
- ✅ 클릭 시 즉시 호텔 상세 페이지로 이동

### TC-SEARCH-03 🟡 부분 코드 검색
**When** "100" 입력
**Then** ✅ "100"으로 시작하는 모든 호텔 코드 매칭

### TC-SEARCH-04 🟢 Date Picker 야간 보정
**Given** Check-in 미래 날짜 선택
**When** Check-out이 Check-in 이전인 경우
**Then** ✅ Check-out 자동으로 Check-in + 1일

### TC-SEARCH-05 🟢 Active ELS Boosters
**Given** Find Hotel 진입
**Then**
- ✅ 부스터 호텔 6개 카드 표시 (1.0~1.25× 배율)
- ✅ 사용자 Tier 배율 × Boost로 정확한 ELS 표시
- ✅ 만료된 부스터는 자동 제외

---

## 📅 예약

### TC-BOOK-01 🔴 PREPAY Free Cancel 예약
**Given** 호텔 선택, Free Cancel 객실
**When** Booking Form 진입
**Then**
- ✅ "PREPAY" 배지 표시
- ✅ "결제 데드라인까지 송금/카드 결제" 안내
- ✅ "Create" 버튼 (PaymentDialog 안 뜸)

### TC-BOOK-02 🔴 PREPAY Non-refundable 예약
**Given** Non-refundable 객실
**When** Create 시도
**Then**
- ✅ "Pay & Book" 버튼으로 변경
- ✅ 클릭 시 PaymentDialog 즉시 오픈
- ✅ 카드 결제 시뮬 → 성공 토스트 → confirm 페이지

### TC-BOOK-03 🔴 POSTPAY 예약
**Given** Master/Accounting 계정 (POSTPAY 회사)
**When** Booking Form 진입
**Then**
- ✅ "POSTPAY · Net-30" 배지 표시
- ✅ "다음 정산 주기에 청구" 안내
- ✅ Create 버튼 즉시 활성

### TC-BOOK-04 🔴 24h Draft 자동 저장
**Given** Booking Form 작성 중
**When** 페이지 이탈 후 24시간 이내 재진입
**Then** ✅ Travelers 데이터 복원 + "Draft 복원됨" 토스트

### TC-BOOK-05 🔴 Travelers Nationality 컬럼
**Then** ✅ Nationality 컬럼 **없음** (제거됨)
- 컬럼: Rooms / Gender / Local Name / Last+First / Child Birthday

### TC-BOOK-06 🔴 Expected ELS 표시
**Given** $1000 예약, Diamond user, 1.15× boost
**Then**
- ✅ "+8.6 ELS" 표시 (소수점 1자리)
- ✅ ~~"≈ US$8.6.00"~~ ~~breakdown~~ **표시 X** (간결)

### TC-BOOK-07 🔴 ELS 결제 차감 (OP만)
**Given** OP 계정, 잔액 50 ELS
**When** Booking Form 진입
**Then**
- ✅ "ELS 결제 차감" 패널 표시
- Master/Accounting로는 ✅ 패널 미표시

### TC-BOOK-08 🟡 FX Lock
**Given** 예약 시점 1 USD = 1300 KRW
**When** 다음날 환율 변동
**Then** ✅ 인보이스 환율은 1300 그대로 유지

---

## 📋 Bookings (목록)

### TC-LIST-01 🔴 8 컬럼 표시
**Then** ✅ 19컬럼 → 8컬럼으로 축소
**컬럼**: 날짜 / 예약번호 / 호텔 / 체크인 / Nights / 금액 / 상태 / 액션

### TC-LIST-02 🟡 Source 필터 폐기
**Then** ✅ "All Sources / UI Booking / API Integration" chip **없음**

### TC-LIST-03 🔴 행 클릭 → 상세 다이얼로그
**Given** 행 아무거나 클릭
**Then** ✅ 다이얼로그 오픈 (좌우 스크롤 없이 상세 정보)

### TC-LIST-04 🔴 Amend 제거
**Then**
- ✅ "Amend Booking" 버튼 **없음**
- ✅ 안내: "예약 수정은 불가합니다. 취소 후 재예약하세요."

### TC-LIST-05 🔴 취소 정책 분기
- Free Cancel + 데드라인 미경과 → ✅ Cancel 버튼 활성
- Non-refundable → ✅ Cancel 버튼 비활성 + "Non-refundable: 취소 불가"
- 데드라인 경과 → ✅ "데드라인 경과: 결제 필요" 안내

### TC-LIST-06 🟡 Quick Stats
**Then**
- ✅ Free Cancellation 24h/3d 카운트
- ✅ Upcoming Bookings 24h/3d 카운트

---

## 💰 Settlement

### TC-STL-01 🔴 PREPAY/POSTPAY 분기
- POSTPAY: ✅ Net-30 표시 + 정산 주기 카드
- PREPAY: ✅ "Pending Payment" 탭 + Pay Now 버튼

### TC-STL-02 🔴 AR Aging 6 buckets
**Then** ✅ Current / 1-30 / 31-60 / 61-90 / 90+ / Disputed 시각화

### TC-STL-03 🔴 신용 동결 트리거 (2단계)
- 60일: ✅ 신규 예약 한도 50% 축소 (소프트 동결) + 협의 요청 알림
- 90일: ✅ 완전 동결 + 법무 검토 알림

### TC-STL-04 🔴 입금 매칭
**Given** Invoice $1000 → 입금 $1000
**Then** ✅ status: Reconciled

### TC-STL-05 🔴 Cash basis
**Given** 인보이스 발행일 12/30, 입금일 1/3
**Then** ✅ 매출 인식: 1월 (입금일 기준)

### TC-STL-06 🔴 분쟁 결재선 (4단계)
| 금액 | 결재 |
|------|------|
| $500 | ✅ Master 단독 |
| $5,000 | ✅ Master + Accounting |
| $25,000 | ✅ Accounting + EllisOP |
| $100,000 | ✅ 대표이사 |

### TC-STL-07 🔴 Credit Note 발행
**Given** 분쟁 인정
**Then**
- ✅ Credit Note **별도 발행**
- ✅ 원본 Invoice **수정 X**
- ✅ Dispute 사유 영구 보존 (status 전환만)

### TC-STL-08 🟡 Voucher QR 미사용
**Then** ✅ Voucher PDF에 QR 코드 **없음**

### TC-STL-09 🟡 Invoice 다운로드
- ✅ PDF + CSV 분리
- ✅ Cross-tenant 차단 (다른 회사 invoice 다운로드 X)
- ✅ 사용자 locale 자동 적용 (EN/KO/JA/ZH/VI)

---

## 🎁 Rewards Mall

### TC-RWD-01 🔴 ELS 적립 트리거
- 예약 확정 시 ELS 적립 ❌
- ✅ **체크아웃 시점**에 적립 (Earned-Checkout)
- ✅ 리뷰 작성 즉시 (Earned-Review)

### TC-RWD-02 🔴 적립률
**Given** $100 예약, Bronze
**Then** ✅ +0.5 ELS (0.5%)

**Given** $100 예약, Diamond + 1.25× boost
**Then** ✅ +0.9 ELS (0.005 × 1.5 × 1.25)

### TC-RWD-03 🔴 Min Redeem 10 ELS
**Given** 잔액 8 ELS
**Then** ✅ "Min 10" 버튼 비활성 + 토스트: "최소 10 ELS부터 redeem 가능"

### TC-RWD-04 🔴 Tier 6단계
**Given** 매출 $600,000 user
**Then** ✅ Emerald (1.4×)

**Given** 매출 $1,500,000 user
**Then** ✅ Diamond (1.5×)

### TC-RWD-05 🔴 Tier 잠금 폐기
**Given** Bronze 사용자, 미쉐린 디너 (160 ELS) 상품
**Then** ✅ Tier 제한 없이 redeem 가능 (잔액만 체크)

### TC-RWD-06 🔴 가격 노출 금지
**Then**
- ✅ "Face: KRW 4,500" 표시 **없음**
- ✅ "≈ US$X" 환산 표시 **없음**
- ✅ 단위 "P" → "ELS" 변경

### TC-RWD-07 🔴 쿠폰 수동 발급
**Given** Redeem 클릭
**Then**
- ✅ 자동 코드 생성 X
- ✅ 안내: "운영팀 확인 후 24시간 이내 발송됩니다"

### TC-RWD-08 🔴 ELS 영구 보존
**Given** 리뷰 takedown 처리
**Then** ✅ "ELS 영구 보존" 안내 (clawback X)

### TC-RWD-09 🟡 Hotel Boost Hard Cap
**Given** 어드민(ELLIS)에서 boost 1.5× 입력 시도
**Then** ✅ 1.25× 자동 clamp + 거부 토스트

---

## 🎫 Tickets

### TC-TKT-01 🟡 SLA (영업시간)
- ✅ High 4h / Medium 24h / Low 72h (KR/JP 9-18시)
- ✅ Critical (부정결제·시스템) 24x7 별도 트랙

### TC-TKT-02 🟡 EllisOP 처리
**Given** EllisOP 로그인
**Then** ✅ 모든 회사 티켓 조회/처리 가능

### TC-TKT-03 🟡 자사 티켓
**Given** Master/OP 로그인
**Then** ✅ 자사 티켓만 조회

---

## 🌐 i18n / 다국어

### TC-I18N-01 🟡 5개 언어
**Then** ✅ EN/KO/JA/ZH/VI 전환 가능

### TC-I18N-02 🟡 Voucher/Invoice 언어
**Given** 사용자 locale: ja
**Then** ✅ Voucher/Invoice 자동 일본어 발송

### TC-I18N-03 🟡 i18n 누락 감사
**Then** ✅ 자동 테스트 통과 (모든 키가 5개 언어 모두 정의됨)

---

## 🛡 권한 / Cross-tenant

### TC-AUTH-04 🔴 자사 데이터만 조회
**Given** Master(comp-001) 로그인, Bookings 페이지
**Then** ✅ comp-002 예약 표시 안 됨

### TC-AUTH-05 🔴 EllisOP 전체 조회
**Given** EllisOP 로그인, 티켓 페이지
**Then** ✅ 모든 회사 티켓 표시

### TC-AUTH-06 🟡 OP는 본인 예약만
**Given** OP 로그인
**Then** ✅ 같은 회사 다른 OP의 예약 표시 안 됨

---

## 🚫 에러 / 엣지 케이스

### TC-ERR-01 🔴 ErrorBoundary 격리
**Given** 한 페이지에서 TypeError 발생
**Then**
- ✅ "페이지 오류" 카드 표시 (전체 앱 X)
- ✅ "이 페이지 다시 시도" / "대시보드로 돌아가기" 버튼
- ✅ 다른 페이지로 이동하면 정상 작동

### TC-ERR-02 🔴 신규 Tier 추가 안전성
**Given** Tier에 새 단계 추가
**Then** ✅ `Record<Tier, X>` 타입이 누락된 매핑 컴파일 에러로 검출

### TC-ERR-03 🔴 hotelCode 미부여 호텔
**Given** 신규 호텔 hotelCode 없음
**When** 검색 dropdown 오픈
**Then** ✅ crash 없음 (optional chaining)

### TC-ERR-04 🟡 빈 데이터 상태
**Given** 신규 가입 사용자 (예약 0건)
**Then** ✅ 빈 상태 안내 메시지 (crash X)

### TC-ERR-05 🟡 네트워크 오류
**Given** API 실패 (mock에서는 StateToolbar로 시뮬)
**Then** ✅ Alert + Retry 버튼

---

## ⚡ 성능

### TC-PERF-01 🟢 메인 번들 크기
**Then** ✅ < 535KB gzip (charts 별도 chunk)

### TC-PERF-02 🟢 페이지 lazy load
**Then** ✅ 각 페이지 별도 chunk (FindHotel 등 첫 진입 시 로드)

### TC-PERF-03 🟢 빌드 시간
**Then** ✅ vite build < 2초

---

## ♿ 접근성

### TC-A11Y-01 🟢 Skip Link
**Given** Tab 키
**Then** ✅ 첫 탭에서 "메인 콘텐츠로 바로가기" 표시

### TC-A11Y-02 🟢 키보드 내비게이션
**Then** ✅ 모든 인터랙티브 요소 Tab 키로 접근 가능

### TC-A11Y-03 🟢 ARIA Labels
**Then** ✅ 아이콘 버튼에 aria-label

---

## 📊 자동 테스트 (vitest)

```bash
cd prototypes/dotbiz
npm test
```

| 테스트 파일 | 개수 |
|------------|------|
| tierSystem.test.ts | 21 |
| rewardsMall.test.ts | 8 |
| bookingFormPolicy.test.ts | ~20 |
| i18n.test.ts | ~10 |
| errorBoundary.test.tsx | ~5 |
| telemetry.test.tsx | ~5 |
| 기타 (16개) | ~146 |
| **합계** | **215** |

**현재 상태**: ✅ 215/215 passing

---

## 🔧 회귀 테스트 우선순위 (배포 전 필수)

배포 전 반드시 확인:

1. 🔴 TC-AUTH-01 (로그인)
2. 🔴 TC-BOOK-01 (PREPAY Free Cancel)
3. 🔴 TC-BOOK-02 (PREPAY Non-refundable)
4. 🔴 TC-BOOK-03 (POSTPAY)
5. 🔴 TC-LIST-04 (Amend 제거 확인)
6. 🔴 TC-RWD-01 (체크아웃 적립)
7. 🔴 TC-STL-01 (정산 분기)
8. 🔴 TC-ERR-01 (ErrorBoundary)
9. 🟡 TC-SEARCH-02 (Hotel Code)
10. 🟡 TC-RWD-09 (Boost cap)

→ 모두 통과해야 release 가능.

---

## 📝 테스트 환경

| 환경 | URL |
|------|------|
| Production | https://bstars00-rgb.github.io/Dotbiz/ |
| Local Dev | http://localhost:5173/ (`npm run dev`) |
| Storybook | (없음) |

### 데모 계정

| 계정 | 비밀번호 | 역할 |
|------|---------|------|
| `master@dotbiz.com` | `master123` | Master |
| `op@dotbiz.com` | `op123` | OP |
| `accounting@dotbiz.com` | `accounting123` | Accounting |
| `ellis@ohmyhotel.com` | `ellis123` | EllisOP |

---

**문서 위치**: `docs/test-scenarios.md`
**짝 문서**: `docs/dotbiz-spec-v3-updated.md`, `docs/screens.md`
