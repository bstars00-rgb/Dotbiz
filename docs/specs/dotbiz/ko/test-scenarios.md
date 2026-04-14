## 6. Non-Functional Requirements

### 6.1 Performance
- 페이지 로드 시간: < 2초
- 호텔 검색 응답 시간: < 1초
- AI 어시스턴트 응답 시간: < 5초
- DOM 렌더링 최적화: 가상 스크롤링 또는 지연 로딩 적용 (대량 데이터)
- 이미지 지연 로딩: 호텔 이미지 Lazy Loading 적용

**성능 테스트 기준 조건**:
- 호텔 데이터: 50개 이상 (아시아 주요 도시)
- 예약 데이터: 200건 이상 (LocalStorage ~2MB 수준)
- 동시 탭: 2개 (동일 브라우저 내)
- 측정 지점: Performance.now() 기반 (버튼 클릭 → 화면 렌더링 완료)

### 6.2 Security
- 비밀번호 암호화 저장 (SHA-256 해시 또는 bcrypt 시뮬레이션)
- 세션 타임아웃: 30분 무활동 시 자동 로그아웃
- 역할 기반 접근제어 (RBAC): Master/OP 권한 분리
- XSS 방지: 사용자 입력 이스케이프
- CSRF 토큰: 폼 제출 시 적용 (Mock API 연동 시)
- Claude API 키 관리: TBD (프록시 서버 경유 권장)

### 6.3 Accessibility
- 이번 버전에서 접근성은 미고려 (향후 WCAG 2.1 AA 적용 계획)

### 6.4 Internationalization
- 5개 언어 전체 번역 구현: English, 한국어, 日本語, 中文, Tiếng Việt
- i18n 키-값 구조로 번역 파일 분리
- 날짜/숫자/통화 포맷: locale 기반 자동 포맷팅
- RTL 레이아웃: 미지원 (대상 언어 없음)

### 6.5 Compatibility
- Chrome, Safari, Firefox, Edge 최신 버전
- 모바일 브라우저 기본 지원
- 최소 해상도: 1024px (데스크톱 최적화)
- 태블릿 대응 (반응형 레이아웃)

### 6.6 Availability
- 목표 Uptime: 99.9%
- 장애 복구 시간: < 4시간

### 6.7 Data Storage
- LocalStorage 기반 (JSON 데이터)
- 최대 저장 용량: 5MB (브라우저 제한)
- 데이터 구조 버전 관리: 스키마 마이그레이션 지원
- **5MB 초과 대응**: 오래된 캐시 데이터(검색 히스토리, AI 대화 히스토리) 자동 정리, 필수 데이터(예약, 사용자, 설정) 우선 보존
- **저장 실패 시**: ERR-STORAGE-001 에러 표시, 캐시 정리 후 재시도
- **멀티탭 동기화**: StorageEvent 리스너로 탭 간 데이터 동기화 (즐겨찾기, 알림 읽음 상태 등)

---

## 7. Test Scenarios

### TS-AUTH: 인증 및 계정

#### TS-AUTH-001: 정상 로그인
**Given**: 유효한 이메일/비밀번호를 가진 사용자가 로그인 화면에 있다
**When**: 이메일과 비밀번호를 입력하고 로그인 버튼을 클릭한다
**Then**: Dashboard 화면으로 이동하고, 사이드바에 사용자 이름이 표시된다

#### TS-AUTH-002: 잘못된 자격증명 로그인
**Given**: 로그인 화면에 있다
**When**: 잘못된 비밀번호를 입력하고 로그인 버튼을 클릭한다
**Then**: "이메일 또는 비밀번호가 올바르지 않습니다" 에러 메시지가 표시된다

#### TS-AUTH-003: Pending 상태 계정 로그인
**Given**: Pending 상태인 계정으로 로그인 시도
**When**: 유효한 자격증명을 입력하고 로그인 버튼을 클릭한다
**Then**: "계정 승인 대기 중입니다" 메시지가 표시되고 Dashboard로 이동하지 않는다

#### TS-AUTH-004: Remember Me 기능
**Given**: 로그인 화면에서 Remember Me를 체크하고 로그인한다
**When**: 로그아웃 후 다시 로그인 화면에 접근한다
**Then**: 이메일 필드에 이전에 입력한 이메일이 자동으로 채워져 있다

#### TS-AUTH-005: 세션 타임아웃
**Given**: 로그인 상태에서 30분 동안 아무 활동이 없다
**When**: 화면에서 아무 동작을 시도한다
**Then**: 로그인 화면으로 리다이렉트되고 세션 만료 메시지가 표시된다

#### TS-AUTH-006: 3-Step 회원가입
**Given**: 등록 화면의 Step 1에 있다
**When**: 모든 필수 정보를 입력하고 Step 3까지 완료한다
**Then**: Pending 상태로 계정이 생성되고 안내 메시지가 표시된다

#### TS-AUTH-007: 회원가입 필수 필드 검증
**Given**: 등록 화면의 Step 1에서 Company Name을 비운 채로
**When**: Next 버튼을 클릭한다
**Then**: Company Name 필드에 에러 표시가 나타나고 Step 2로 이동하지 않는다

#### TS-AUTH-008: Master OP 관리
**Given**: Master 계정으로 My Account에 접근한다
**When**: OP 추가 버튼을 클릭하고 정보를 입력한다
**Then**: 새 OP 계정이 생성되고 OP 목록에 표시된다

#### TS-AUTH-009: Master 권한 접근제어
**Given**: Master 계정으로 로그인한다
**When**: Settlement 메뉴를 클릭한다
**Then**: Settlement 페이지가 정상적으로 표시된다

#### TS-AUTH-010: OP 권한 접근제어
**Given**: OP 계정으로 로그인한다
**When**: 사이드바를 확인한다
**Then**: Settlement 메뉴가 표시되지 않는다

---

### TS-SEARCH: 호텔 검색

#### TS-SEARCH-001: 기본 호텔 검색
**Given**: Find Hotel 화면에 있다
**When**: 목적지(상하이), 체크인/아웃 날짜, 객실 수를 입력하고 검색한다
**Then**: 조건에 맞는 호텔 목록이 List View로 표시된다

#### TS-SEARCH-002: 자동완성 기능
**Given**: Find Hotel의 목적지 입력 필드에 "Shang"을 입력한다
**When**: 타이핑 중에 자동완성 목록이 표시된다
**Then**: "Shanghai" 등 관련 도시/호텔이 드롭다운에 나타난다

#### TS-SEARCH-003: 필터 적용
**Given**: Search Results에 호텔 목록이 표시되어 있다
**When**: 별점 5 Star 필터를 선택한다
**Then**: 5성급 호텔만 표시된다

#### TS-SEARCH-004: 정렬 변경
**Given**: Search Results에 호텔 목록이 표시되어 있다
**When**: 정렬을 "가격 오름차순"으로 변경한다
**Then**: 호텔 목록이 가격이 낮은 순서로 재정렬된다

#### TS-SEARCH-005: Map View 전환
**Given**: Search Results가 List View로 표시되어 있다
**When**: Map View 버튼을 클릭한다
**Then**: Leaflet.js 지도가 표시되고 호텔 위치에 가격 마커가 표시된다

#### TS-SEARCH-006: Map View 마커 상호작용
**Given**: Map View가 표시되어 있다
**When**: 호텔 마커를 클릭한다
**Then**: 팝업에 호텔 이미지, 이름, 평점, 남은 객실 수가 표시되고, 사이드바에서 해당 호텔이 하이라이트된다

#### TS-SEARCH-007: 즐겨찾기 토글
**Given**: Search Results에서 호텔 카드를 보고 있다
**When**: 별표 아이콘을 클릭한다
**Then**: 별표가 채워지고 Find Hotel 즐겨찾기 섹션에 추가된다

#### TS-SEARCH-008: 검색 결과 없음
**Given**: Find Hotel에서 매우 제한적인 조건을 입력한다
**When**: 검색 버튼을 클릭한다
**Then**: "조건에 맞는 호텔이 없습니다" 메시지가 표시된다

---

### TS-HOTEL: 호텔 상세

#### TS-HOTEL-001: 호텔 상세 페이지 로드
**Given**: Search Results에서 호텔 카드를 클릭한다
**When**: Hotel Detail 페이지가 로드된다
**Then**: Hero 섹션, Rooms 탭(기본 활성), Breadcrumb이 정상 표시된다

#### TS-HOTEL-002: 탭 전환
**Given**: Hotel Detail의 Rooms 탭에 있다
**When**: Policies 탭을 클릭한다
**Then**: Policies 탭 콘텐츠(체크인/아웃 시간, 취소 정책 등)가 표시된다

#### TS-HOTEL-003: 객실 필터
**Given**: Rooms 탭에 여러 객실이 표시되어 있다
**When**: Meal Plan 필터를 "Breakfast"로 변경한다
**Then**: 조식 포함 객실만 표시된다

#### TS-HOTEL-004: 객실 선택
**Given**: Rooms 탭에서 객실 카드를 보고 있다
**When**: Select 버튼을 클릭한다
**Then**: Booking Form 화면으로 이동하고 선택한 객실 정보가 사이드바에 표시된다

---

### TS-BOOK: 예약 프로세스

#### TS-BOOK-001: 게스트 정보 입력 및 예약 진행
**Given**: Booking Form (Step 1)에 있다
**When**: 필수 게스트 정보를 모두 입력하고 Continue를 클릭한다
**Then**: Booking Confirm (Step 2) 화면으로 이동한다

#### TS-BOOK-002: 필수 정보 미입력 검증
**Given**: Booking Form에서 First Name을 비운 채로
**When**: Continue 버튼을 클릭한다
**Then**: First Name 필드에 에러 표시가 나타나고 다음 단계로 이동하지 않는다

#### TS-BOOK-003: 약관 동의 후 예약 확정
**Given**: Booking Confirm (Step 2)에 있다
**When**: Terms & Conditions 체크박스를 체크하고 Confirm Booking을 클릭한다
**Then**: ELLIS Code가 생성되고 Booking Complete (Step 3) 화면으로 이동한다

#### TS-BOOK-004: 약관 미동의 시 버튼 비활성화
**Given**: Booking Confirm에서 약관 체크박스가 미체크 상태
**When**: Confirm Booking 버튼을 확인한다
**Then**: 버튼이 비활성화(disabled) 상태이다

#### TS-BOOK-005: ELLIS Code 형식 검증
**Given**: 예약이 완료되었다
**When**: 생성된 ELLIS Code를 확인한다
**Then**: K + YYMMDD + HHMMSS + H + NN 형식이다 (예: K260208111020H01)

#### TS-BOOK-006: 바우처 다운로드
**Given**: Booking Complete 화면에 있다
**When**: 바우처 다운로드 버튼을 클릭한다
**Then**: PDF 파일이 다운로드되고 ELLIS Code, 호텔 정보, QR 코드가 포함되어 있다

#### TS-BOOK-007: 예약 취소 프로세스
**Given**: Booking Detail 모달에서 Confirmed 상태 예약을 보고 있다
**When**: Cancel 버튼을 클릭하고 취소 사유를 선택하고 확인한다
**Then**: 예약 상태가 Cancelled로 변경되고 알림이 생성된다

#### TS-BOOK-008: Non-Refundable 예약 취소
**Given**: Non-Refundable 예약의 상세 모달에 있다
**When**: Cancel 버튼을 클릭한다
**Then**: "이 예약은 취소가 불가능합니다 (Non-Refundable)" 메시지가 표시된다

#### TS-BOOK-009: 재예약 (Re-book)
**Given**: 취소된 예약의 완료 화면에 있다
**When**: Re-book 버튼을 클릭한다
**Then**: 동일 호텔 상세 페이지로 이동하고 기존 날짜가 유지된다

---

### TS-BKG: 예약 관리

#### TS-BKG-001: 예약 리스트 표시
**Given**: Bookings 페이지에 접근한다
**When**: 페이지가 로드된다
**Then**: 14개 컬럼 테이블에 예약 목록이 표시된다

#### TS-BKG-002: 다중 필터 적용
**Given**: Bookings 필터 패널에서 Booking Status를 "Confirmed", Date Type을 "Check In Date"로 설정
**When**: Search 버튼을 클릭한다
**Then**: 해당 조건에 맞는 예약만 테이블에 표시된다

#### TS-BKG-003: 필터 초기화
**Given**: 여러 필터가 적용된 상태
**When**: Reset 버튼을 클릭한다
**Then**: 모든 필터가 초기값으로 돌아가고 전체 예약이 표시된다

#### TS-BKG-004: 예약 상세 모달 열기
**Given**: 예약 테이블에서 예약 행이 보인다
**When**: 행을 클릭한다
**Then**: 9개 섹션이 포함된 예약 상세 모달이 열린다

#### TS-BKG-005: Excel 내보내기
**Given**: 필터가 적용된 예약 목록이 표시되어 있다
**When**: Excel Export 버튼을 클릭한다
**Then**: 현재 필터 조건의 데이터가 .xlsx 파일로 다운로드된다

#### TS-BKG-006: 일괄 바우처 다운로드
**Given**: 여러 예약을 체크박스로 선택한다
**When**: Bulk Voucher 버튼을 클릭한다
**Then**: 선택한 예약들의 바우처가 다운로드된다

#### TS-BKG-007: 캘린더 뷰 이벤트 표시
**Given**: Calendar 탭에 있다
**When**: 예약이 있는 월이 표시된다
**Then**: Check-in(파랑), Check-out(노랑), Stay(초록), Cancelled(빨강), Deadline(분홍) 이벤트가 색상으로 표시된다

#### TS-BKG-008: 캘린더 셀 +N more 표시
**Given**: 한 날짜에 4개 이상의 이벤트가 있다
**When**: 해당 날짜 셀을 확인한다
**Then**: 3개 이벤트와 "+1 more" 텍스트가 표시된다

#### TS-BKG-009: 페이지 사이즈 변경
**Given**: 예약 리스트가 기본 20건으로 표시되어 있다
**When**: 페이지 사이즈를 50으로 변경한다
**Then**: 한 페이지에 최대 50건이 표시된다

---

### TS-PAY: 결제 시스템

#### TS-PAY-001: 선불업체 법인카드 결제
**Given**: 선불업체 OP가 Non-Refundable 객실을 예약한다
**When**: 법인카드를 선택하고 예약을 확정한다
**Then**: 즉시 결제 처리 (시뮬레이션)되고 예약이 Confirmed 상태가 된다

#### TS-PAY-002: Reserve Now Pay Later
**Given**: 선불업체 OP가 Refundable 객실을 예약한다
**When**: RNPL 옵션을 선택하고 예약을 확정한다
**Then**: 결제 없이 예약이 확정되고, Accounts Receivable에 표시된다

#### TS-PAY-003: RNPL Cancel Deadline 초과 자동 취소
**Given**: 선불업체의 RNPL 예약이 Cancel Deadline을 초과했고 미결제 상태
**When**: 시스템이 Deadline을 확인한다
**Then**: 경고 알림 발송 후 자동 취소된다

#### TS-PAY-004: 후불업체 Floating Deposit 결제
**Given**: 후불업체 OP가 예약하고 Deposit 옵션을 선택한다
**When**: 예약을 확정한다
**Then**: Deposit 잔액에서 예약 금액이 차감된다

#### TS-PAY-005: Deposit 잔액 부족
**Given**: 후불업체의 Deposit 잔액이 예약 금액보다 적다
**When**: Deposit 결제를 시도한다
**Then**: "잔액이 부족합니다" 메시지와 함께 Credit Line 사용 옵션이 안내된다

#### TS-PAY-006: Credit Line 한도 초과
**Given**: 후불업체의 Credit Line 한도가 초과된 상태
**When**: 예약을 시도한다
**Then**: "신용한도를 초과했습니다" 메시지가 표시되고 예약이 진행되지 않는다

#### TS-PAY-007: Low Deposit 경고
**Given**: 후불업체의 Deposit 잔액이 $5,000 미만이다
**When**: 시스템이 잔액을 확인한다
**Then**: Critical 우선순위 알림이 생성된다

---

### TS-SET: 정산 시스템

#### TS-SET-001: Monthly Settlement 조회
**Given**: Master 계정으로 Settlement > Monthly 탭에 접근한다
**When**: 2026년 2월을 선택한다
**Then**: 해당 월의 Total Net Cost, Room Nights, Avg Net/Night 및 일별 상세가 표시된다

#### TS-SET-002: 인보이스 PDF 다운로드
**Given**: Invoices 탭에서 Issued 상태의 인보이스를 확인한다
**When**: PDF 다운로드 버튼을 클릭한다
**Then**: 공급가액, VAT(10%), 합계가 포함된 PDF가 다운로드된다

#### TS-SET-003: 미수금 개별 결제
**Given**: AR 탭에 미결제 건이 있다
**When**: 해당 건의 결제 버튼을 클릭하고 결제를 완료한다
**Then**: Payment Status가 Fully Paid로 변경된다

#### TS-SET-004: 미수금 일괄 결제
**Given**: AR 탭에서 여러 미결제 건을 체크박스로 선택한다
**When**: 일괄 결제 버튼을 클릭한다
**Then**: 선택된 모든 건의 결제가 처리된다

---

### TS-AI: AI Booking Assistant

#### TS-AI-001: 자연어 호텔 추천
**Given**: AI 위젯을 열고 있다
**When**: "푸동 지역 5성급 $250 이하 조식 포함" 메시지를 입력한다
**Then**: 조건에 맞는 호텔 카드가 응답에 표시되고, 카드 클릭 시 Hotel Detail로 이동한다

#### TS-AI-002: 예약 분석 요청
**Given**: AI 위젯을 열고 있다
**When**: "내 예약 현황 분석해줘" 메시지를 입력한다
**Then**: 총 예약 건수, 지출, 호텔별 빈도 등 분석 결과가 표시된다

#### TS-AI-003: Quick Action 사용
**Given**: AI 위젯의 Quick Actions이 보인다
**When**: "🏨 호텔 추천" 버튼을 클릭한다
**Then**: 해당 프롬프트가 자동 입력되고 AI 응답이 표시된다

#### TS-AI-004: API 연결 실패 Fallback
**Given**: Claude API 연결이 실패한 상태
**When**: 호텔 추천을 요청한다
**Then**: 로컬 호텔 데이터 기반 대체 응답이 표시되고 "제한된 서비스" 안내가 함께 표시된다

#### TS-AI-005: 위젯 최소화/복원
**Given**: AI 위젯이 열려 있다
**When**: 최소화 버튼을 클릭한다
**Then**: 위젯이 플로팅 버튼으로 축소되고, 다시 클릭하면 이전 대화가 유지된 채 복원된다

---

### TS-NOTI: 알림 센터

#### TS-NOTI-001: 알림 목록 표시
**Given**: 알림 센터에 접근한다
**When**: 페이지가 로드된다
**Then**: Summary 카드와 알림 목록이 우선순위 순으로 표시된다

#### TS-NOTI-002: 알림 클릭 이동
**Given**: Check-in 알림이 있다
**When**: 해당 알림을 클릭한다
**Then**: 해당 예약 상세 모달이 열리고 알림이 읽음 처리된다

#### TS-NOTI-003: 전체 읽음 처리
**Given**: 미읽음 알림이 여러 개 있다
**When**: 전체 읽음 버튼을 클릭한다
**Then**: 모든 알림이 읽음 상태로 변경된다

#### TS-NOTI-004: 알림 설정 변경
**Given**: 알림 설정에서 Promotional Offers가 OFF 상태
**When**: 토글을 ON으로 변경한다
**Then**: 설정이 즉시 반영되고 프로모션 알림을 수신한다

---

### TS-DASH: 대시보드

#### TS-DASH-001: KPI 카드 기간 필터
**Given**: Dashboard에 접근한다
**When**: 기간 필터를 "Last Month"로 변경한다
**Then**: 모든 KPI 카드와 위젯이 해당 기간 데이터로 갱신된다

#### TS-DASH-002: Master OP Performance 표시
**Given**: Master 계정으로 Dashboard에 접근한다
**When**: 페이지를 확인한다
**Then**: OP Performance Comparison 위젯이 표시되고, 🥇🥈🥉 순위가 보인다

#### TS-DASH-003: OP My Performance 표시
**Given**: OP 계정으로 Dashboard에 접근한다
**When**: 페이지를 확인한다
**Then**: My Performance KPIs 게이지 바가 표시되고, OP Performance는 표시되지 않는다

---

### TS-PTS: OP Points

#### TS-PTS-001: 포인트 적립 확인
**Given**: 예약이 완료되었다
**When**: Rewards Mall 페이지의 포인트 잔액을 확인한다
**Then**: 예약 금액 기반으로 포인트가 적립되어 있다

#### TS-PTS-002: 상품 교환
**Given**: Rewards Mall에서 상품을 확인한다
**When**: 잔액이 충분한 상품의 Redeem 버튼을 클릭한다
**Then**: 교환 확인 모달이 표시되고, 확인 시 잔액이 차감된다

#### TS-PTS-003: 포인트 잔액 부족 교환 시도
**Given**: 잔액보다 비싼 상품을 선택한다
**When**: Redeem 버튼을 클릭한다
**Then**: "포인트가 부족합니다" 메시지가 표시된다

#### TS-PTS-004: 포인트 이전
**Given**: Rewards Mall의 포인트 이전 섹션에서
**When**: 같은 업체 OP를 선택하고 금액과 사유를 입력하고 이전한다
**Then**: 포인트가 대상 OP에게 이전되고 히스토리에 기록된다

---

### TS-UI: UI/UX

#### TS-UI-001: 다크모드 전환
**Given**: 라이트 모드 상태에서
**When**: 헤더의 다크모드 토글 (🌙)을 클릭한다
**Then**: 전체 UI가 다크 테마로 전환되고 localStorage에 저장된다

#### TS-UI-002: 언어 변경
**Given**: 영어로 표시된 상태에서
**When**: 헤더의 언어 선택을 "한국어"로 변경한다
**Then**: 전체 UI 텍스트가 한국어로 변경된다

#### TS-UI-003: 통화 변경
**Given**: USD로 가격이 표시된 상태에서
**When**: 헤더의 통화 선택을 "KRW"로 변경한다
**Then**: 모든 가격이 KRW로 변환 표시된다

#### TS-UI-004: 반응형 레이아웃
**Given**: 데스크톱(1920px) 브라우저에서 표시 중
**When**: 브라우저 너비를 1024px로 줄인다
**Then**: 레이아웃이 반응형으로 조정되어 콘텐츠가 정상 표시된다

#### TS-UI-005: CI 컬러 적용
**Given**: 앱이 로드된 상태
**When**: 주요 버튼과 헤더를 확인한다
**Then**: Primary 컬러가 #FF6000(Orange), 성공 색상이 #009505(Green)으로 적용되어 있다

---

### TS-CHAT: Support Chat

#### TS-CHAT-001: ELLIS Code 자동 감지
**Given**: Support Chat에서 메시지를 입력한다
**When**: ELLIS Code (K260208111020H01)를 붙여넣는다
**Then**: "Booking detected" 알림과 함께 해당 예약 정보가 자동 로드된다

#### TS-CHAT-002: AI 챗봇 자동 응답
**Given**: 새 채팅을 시작한다
**When**: "예약 취소는 어떻게 하나요?" 메시지를 입력한다
**Then**: FAQ 기반 자동 응답이 즉시 표시된다

#### TS-CHAT-003: 담당자 에스컬레이션
**Given**: AI 챗봇이 응답할 수 없는 질문을 했다
**When**: "Connect to Agent" 버튼을 클릭한다
**Then**: 상담원 연결 상태로 변경되고, 상담원 정보가 표시된다

---

### TS-FAQ: FAQ Board

#### TS-FAQ-001: FAQ 검색
**Given**: FAQ Board에 접근한다
**When**: 검색 필드에 "cancel"을 입력한다
**Then**: 취소 관련 FAQ 항목만 필터링되어 표시된다

#### TS-FAQ-002: 카테고리 필터
**Given**: FAQ Board에 전체 항목이 표시되어 있다
**When**: "Payment" 카테고리 탭을 클릭한다
**Then**: Payment 관련 FAQ만 표시된다

#### TS-FAQ-003: 아코디언 토글
**Given**: FAQ 항목이 닫힌 상태
**When**: 질문 제목을 클릭한다
**Then**: 답변이 아코디언으로 펼쳐진다. 다시 클릭하면 접힌다

---

### TS-EDGE: Edge Case 및 경계값 테스트 (Round 1 리뷰 추가)

#### TS-EDGE-001: 과거 날짜 체크인 검색 차단
**Given**: Find Hotel 화면에 있다
**When**: 체크인 날짜를 어제 날짜로 설정하고 검색 버튼을 클릭한다
**Then**: ERR-SEARCH-003 에러 메시지가 표시되고 검색이 실행되지 않는다

#### TS-EDGE-002: 결제 실패 후 예약 상태 검증
**Given**: 선불업체 OP가 Non-Refundable 객실 예약 확정 단계에 있다
**When**: 법인카드 결제가 ERR-PAY-001로 실패한다
**Then**: 예약이 생성되지 않고 Booking Form으로 복귀한다. 다른 카드 선택 또는 재시도 가능

#### TS-EDGE-003: Deposit 잔액 부족 시 Credit Line 전환 UI
**Given**: 후불업체 Deposit 잔액 $3,000, 예약금 $5,000
**When**: Deposit 옵션을 선택하고 예약 확정을 시도한다
**Then**: "Deposit 잔액이 부족합니다. Credit Line을 사용하시겠습니까?" 확인 UI가 표시된다

#### TS-EDGE-004: Deposit + Credit Line 모두 부족
**Given**: 후불업체 Deposit $1,000, Credit Line 잔여 한도 $2,000, 예약금 $5,000
**When**: 예약을 시도한다
**Then**: ERR-PAY-005 "잔액과 신용한도가 모두 부족합니다" 메시지가 표시된다

#### TS-EDGE-005: 취소 수수료 Free Cancel 경계값
**Given**: Free Cancel Deadline이 체크인 3일 전인 예약이 있다
**When**: 체크인 정확히 3일 전 00:00:00에 취소를 시도한다
**Then**: 취소 수수료 $0이 표시된다 (경계값 포함)

#### TS-EDGE-006: 비활성화된 OP 기존 예약 Master 조회
**Given**: 3건의 Confirmed 예약을 보유한 OP 계정이 있다
**When**: Master가 해당 OP를 비활성화한다
**Then**: 비활성화된 OP로의 로그인은 ERR-AUTH-003으로 차단되며, Master의 예약 목록에는 3건 예약이 계속 조회된다

#### TS-EDGE-007: 계정 잠금 (5회 연속 로그인 실패)
**Given**: 유효한 계정에 대해 연속으로 잘못된 비밀번호를 입력한다
**When**: 5회 연속 로그인 실패한다
**Then**: ERR-AUTH-005 메시지가 표시되고 30분간 로그인 시도 불가

#### TS-EDGE-008: LocalStorage 5MB 한계 도달
**Given**: LocalStorage를 4.9MB 이상 채운 상태에서 신규 예약을 시도한다
**When**: 예약 확정을 클릭한다
**Then**: ERR-STORAGE-001 메시지가 표시되고 캐시 자동 정리 후 재시도 안내

#### TS-EDGE-009: 세션 만료 중 예약 폼 데이터 처리
**Given**: OP가 Booking Form에서 게스트 정보를 입력하던 중 30분이 경과한다
**When**: Continue 버튼을 클릭한다
**Then**: 세션 만료 메시지 표시 → Login 이동 → 재로그인 후 sessionStorage에서 폼 데이터 복원 시도

#### TS-EDGE-010: 알림 중복 생성 방지
**Given**: Cancel Deadline D-1 알림이 이미 생성된 예약이 있다
**When**: 페이지를 새로고침하여 알림 생성 로직이 재실행된다
**Then**: 동일 예약에 대한 D-1 알림이 중복 생성되지 않는다

#### TS-EDGE-011: 멀티탭 LocalStorage 동기화
**Given**: 동일 OP 계정으로 2개의 브라우저 탭이 열려 있다
**When**: 탭 A에서 즐겨찾기를 추가한다
**Then**: 탭 B에서 새로고침 시 동기화된 즐겨찾기가 표시된다

#### TS-EDGE-012: 통화 변경 후 예약 확정 저장 금액 검증
**Given**: USD $200 객실을 조회하고 통화를 KRW로 변경한 상태
**When**: KRW 표시 가격으로 예약을 확정한다
**Then**: 예약 상세에 USD($200)로 저장되어 있고, KRW 환산 금액이 병기된다

#### TS-EDGE-013: 비밀번호 찾기 플로우
**Given**: Login 화면에서 ForgotPasswordLink를 클릭한다
**When**: 등록된 이메일을 입력하고 재설정을 요청한다
**Then**: 비밀번호 재설정 화면이 표시되고 새 비밀번호 설정 후 로그인 가능

#### TS-EDGE-014: Share 비율 변경 소급 미적용
**Given**: OP A의 Share 비율이 60%이고 포인트 적립 이력이 있다
**When**: Master가 Share 비율을 40%로 변경한다
**Then**: 기존 포인트 이력은 변경되지 않고 이후 적립분부터 40% 적용

#### TS-EDGE-015: 캘린더 +N more 클릭
**Given**: 한 날짜에 4개 이벤트가 있고 "+1 more"가 표시된다
**When**: "+1 more" 텍스트를 클릭한다
**Then**: 해당 날짜의 전체 이벤트 목록이 팝업으로 표시된다
