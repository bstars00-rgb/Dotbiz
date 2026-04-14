# DOTBIZ B2B 호텔 예약 시스템 — Functional Specification

> **Status**: FINALIZED
> **Author**: Planning Plugin (Auto-generated)
> **Created**: 2026-03-28T09:00:00Z
> **Last Updated**: 2026-03-28T12:00:00Z

---

## 1. Overview

### 1.1 Purpose
DOTBIZ는 AI 기반의 차세대 B2B 호텔 예약 플랫폼으로, Operating Partner(OP)에게 직관적이고 효율적인 예약 경험을 제공한다. Net Rate 공급 모델을 통해 파트너사의 마진 자율성을 확보하고, 업체 유형별(선불/후불) 최적화된 결제 프로세스와 실시간 운영 도구를 제공하여 업무 효율을 극대화한다.

이번 스펙은 기존 프로토타입과 동일한 기능을 실 개발용으로 재구현하기 위한 것이며, 프론트엔드(Vanilla JS SPA) + Mock API 구조로 구현한다. 데이터 저장은 LocalStorage + JSON 방식을 유지한다.

### 1.2 Target Users

| 역할 | 설명 | 주요 기능 |
|------|------|----------|
| Master | 업체 관리자 | 전체 OP 관리, 정산 권한, OP 성과 비교, 모든 예약 조회 |
| OP (Operating Partner) | 실무 담당자 | 호텔 검색/예약, 고객 응대, 개인 실적 확인, 본인 예약만 조회 |

**Admin 역할 불필요**: 업체 가입 승인 등은 시스템 외부(내부 프로세스)에서 수동 처리한다.

### 1.3 Success Metrics

| KPI | 목표 | 측정 방법 |
|-----|------|----------|
| 페이지 로드 시간 | < 2초 | Performance API |
| 호텔 검색 응답 시간 | < 1초 | 검색 실행~결과 표시 |
| AI 응답 시간 | < 5초 | Claude API 호출~응답 표시 |
| 예약 전환율 | 측정 가능 | Booking Conversion Funnel |
| 시스템 가용성 | 99.9% | Uptime 모니터링 |

---

## 2. User Stories

| ID | Role | Goal | Priority |
|----|------|------|----------|
| US-001 | OP | 이메일/비밀번호로 로그인하여 시스템에 접근한다 | P0 |
| US-002 | 신규업체 | 3-Step 회원가입을 통해 계정을 생성한다 | P0 |
| US-003 | OP | 목적지, 날짜, 인원 조건으로 호텔을 검색한다 | P0 |
| US-004 | OP | 검색 결과를 리스트/지도 뷰로 확인하고 필터/정렬한다 | P0 |
| US-005 | OP | 호텔 상세 정보를 확인하고 객실을 선택한다 | P0 |
| US-006 | OP | 게스트 정보를 입력하고 예약을 확정한다 | P0 |
| US-007 | OP | 예약 완료 후 바우처를 다운로드/이메일 발송한다 | P0 |
| US-008 | OP | 예약 목록에서 전체 예약을 조회/필터링/관리한다 | P0 |
| US-009 | OP | 예약을 취소하고 환불 정보를 확인한다 | P0 |
| US-010 | OP | 캘린더 뷰로 월별 예약 현황을 시각화한다 | P1 |
| US-011 | Master | 월별 정산 내역을 확인하고 인보이스를 관리한다 | P0 |
| US-012 | Master | 미수금(Accounts Receivable)을 관리하고 결제 처리한다 | P0 |
| US-013 | OP | AI 어시스턴트로 자연어 호텔 검색 및 예약 분석한다 | P1 |
| US-014 | OP | 알림 센터에서 중요 알림을 확인하고 조치한다 | P1 |
| US-015 | OP/Master | 대시보드에서 KPI와 비즈니스 분석을 확인한다 | P1 |
| US-016 | OP | OP Points로 리워드 상품을 교환한다 | P2 |
| US-017 | OP | Support Chat으로 예약 관련 문의를 처리한다 | P2 |
| US-018 | OP | FAQ Board에서 자주 묻는 질문을 확인한다 | P2 |
| US-019 | Master | OP 계정을 생성/수정/비활성화하고 Share 비율을 설정한다 | P0 |
| US-020 | OP | 자주 예약하는 호텔을 즐겨찾기에 저장한다 | P1 |
| US-021 | OP | 다크모드/언어/통화를 설정한다 | P1 |
| US-022 | OP | 취소된 예약을 재예약(Re-book)한다 | P1 |
| US-023 | Master | OP별 실적을 비교 분석한다 | P1 |
| US-024 | OP | 포인트를 같은 업체 내 다른 OP에게 이전한다 | P2 |

---

## 3. Functional Requirements

### FR-AUTH: 인증 및 계정

#### FR-AUTH-001: 로그인
**Description**: 이메일/비밀번호 기반 로그인 시스템

**Business Rules**:
- BR-001: 로그인 성공 시 Dashboard 화면으로 이동
- BR-002: Remember Me 체크 시 localStorage에 이메일 저장
- BR-003: 역할 기반 접근제어 (Master는 Settlement 접근 가능, OP는 불가)
- BR-004: 세션 타임아웃 30분

**Input Validation**:
- 이메일: 최대 254자 (RFC 5321), 이메일 형식 검증
- 비밀번호: 최대 128자
- 로그인 실패 5회 연속 시 계정 잠금 (30분 후 자동 해제 또는 Master가 수동 해제)
- 세션 타임아웃: 30분 무활동 (마우스 이동, 키보드 입력, API 호출을 활동으로 간주)
- 타임아웃 5분 전 경고 팝업 표시: "세션 연장" 버튼 포함, 클릭 시 타임아웃 30분 리셋. 팝업 무시 시 5분 후 세션 만료. 팝업 표시 중 사용자 활동(키보드/마우스) 감지 시 팝업 자동 닫힘 + 타이머 리셋
- 타임아웃 발생 시 작성 중이던 폼 데이터는 sessionStorage에 임시 보존, 재로그인 후 복원 시도

**Acceptance Criteria**:
- [ ] AC-001: 유효한 이메일/비밀번호로 로그인 성공
- [ ] AC-002: 잘못된 자격증명 시 에러 메시지 표시
- [ ] AC-003: Remember Me 체크 후 재방문 시 이메일 자동 입력
- [ ] AC-004: 다크모드 토글 버튼이 로그인 화면에 표시
- [ ] AC-004a: 5회 연속 로그인 실패 시 계정 잠금 메시지 표시

#### FR-AUTH-005: 비밀번호 찾기/재설정
**Description**: 비밀번호 분실 시 이메일 기반 재설정

**Business Rules**:
- BR-100: Login 화면에 "Forgot Password?" 링크 제공
- BR-101: 등록된 이메일 입력 → 재설정 링크 발송 (Mock: 시뮬레이션 — 즉시 재설정 화면으로 이동)
- BR-102: 새 비밀번호 입력 (8자 이상, 영문+숫자+특수문자)
- BR-103: 비밀번호 확인 필드 필수
- BR-104: 재설정 완료 후 Login 화면으로 이동

**Acceptance Criteria**:
- [ ] AC-050: 등록된 이메일로 재설정 요청 시 재설정 화면 표시
- [ ] AC-051: 미등록 이메일로 요청 시 에러 메시지 (보안상 동일 메시지 권장)
- [ ] AC-052: 새 비밀번호 설정 후 로그인 가능

---

#### FR-AUTH-002: 자가 가입 (Self-Registration)
**Description**: 3-Step 회원가입 프로세스

**Business Rules**:
- BR-005: Step 1 — 회사 정보 (Company Name, Business Registration No., Business Type(선불/후불), Address, Phone, Email)
- BR-006: Step 2 — 사용자 정보 (Full Name, Position, Email, Password, Mobile, Preferred Language)
- BR-007: Step 3 — B2B 이용약관 체크박스, 자동 계약서 생성 및 다운로드
- BR-008: 완료 시 Pending 상태로 계정 생성 (내부 수동 승인 필요)
- BR-105: 가입 완료 후 "승인 대기 중" 안내 화면 표시 → 5초 후 Login 화면 자동 이동 (또는 "로그인으로 이동" 버튼)
- BR-106: 승인 완료 시 이메일 발송 시뮬레이션 (Mock: 즉시 Active 상태 전환 가능)

**Input Validation**:
- Company Name: 필수, 최대 100자
- Business Registration No.: 필수, 자유형식 (국가별 상이), 최대 20자
- Email: 필수, 이메일 형식, 중복 검사 (Step 2 Next 클릭 시 검증)
- Password: 필수, 8~128자, 영문+숫자+특수문자, PasswordConfirm 필드 일치 필요
- Phone/Mobile: 숫자+하이픈, 최대 20자

**Acceptance Criteria**:
- [ ] AC-005: 각 Step 필수 필드 검증 (위 규칙 기반)
- [ ] AC-006: Step 3에서 약관 동의 체크 시 계약서 PDF 다운로드 가능
- [ ] AC-007: 완료 후 Pending 상태 안내 메시지 표시, 5초 후 Login 이동
- [ ] AC-007a: 이메일 중복 시 ERR-REG-001 에러 표시
- [ ] AC-007b: 비밀번호/비밀번호 확인 불일치 시 에러 표시

#### FR-AUTH-003: 계정 관리 (My Account)
**Description**: 사용자/업체 정보 관리

**Business Rules**:
- BR-009: 개인정보 수정 (이름, 연락처, 비밀번호)
- BR-010: 업체 정보 조회 (Business Type, 계약일)
- BR-011: 선불업체 — 등록 법인카드 목록, 기본카드 설정
- BR-012: 후불업체 — Floating Deposit 잔액, Credit Line 한도

**Acceptance Criteria**:
- [ ] AC-008: 변경사항 즉시 반영
- [ ] AC-009: 업체 유형별 결제 정보 섹션이 다르게 표시

#### FR-AUTH-004: Multi-OP 시스템
**Description**: 한 업체 내 다수 OP 계정 관리 (Master 전용)

**Business Rules**:
- BR-013: Master가 OP 계정 생성/수정/비활성화
- BR-014: OP별 독립 로그인 (이메일/비밀번호)
- BR-015: OP별 Share 비율 설정 (포인트 분배용)
- BR-016: OP별 예약 실적 조회
- BR-017: 업체당 OP 수 제한 없음
- BR-107: OP 비활성화 시: 기존 예약 데이터 보존 (Master 조회 가능), 신규 예약 생성 불가, 기존 예약 알림은 Master에게 전달
- BR-108: Share 비율 변경 시: 변경 이후 적립 포인트부터 새 비율 적용 (기존 내역 소급 적용 없음)

**Acceptance Criteria**:
- [ ] AC-010: 각 OP는 자신의 예약만 조회 (Master는 전체)
- [ ] AC-011: Master가 OP Share 비율을 변경하면 즉시 반영 (신규 적립분부터)
- [ ] AC-011a: 비활성화된 OP의 예약이 Master 목록에 계속 표시
- [ ] AC-011b: 비활성화된 OP로 로그인 시 ERR-AUTH-003 표시

---

### 예약 상태 전환 다이어그램 (Booking Status)

```
[Pending] --결제완료(선불)/확인(후불)--> [Confirmed]
[Pending] --취소요청--> [Cancelled]
[Confirmed] --취소요청--> [Cancelled]
[Confirmed] --체크아웃일 경과--> [Completed]
[Confirmed] --체크인일 경과+미입실--> [No-show]
[Cancelled] --재예약(Re-book)--> 새 예약 [Pending] 생성 (원본 Cancelled 유지)
```

**상태 전환 규칙**:
- Pending → Confirmed: 선불업체 결제 완료 시, 후불업체 Deposit/Credit 확인 시
- Pending → Cancelled: 사용자 취소 또는 선불업체 RNPL Deadline 초과 자동 취소
- Confirmed → Cancelled: 사용자 취소 (수수료 정책 적용)
- Confirmed → Completed: 체크아웃 날짜 + 1일 자동 전환 (시스템)
- Confirmed → No-show: 체크인 날짜 + 1일, 미입실 시 수동 전환 (Master 또는 시스템)
- **비가역 전환**: Cancelled, Completed, No-show에서 다른 상태로 전환 불가
- **Re-book**: Cancelled 예약에서 새로운 독립 예약 생성 (원본 상태 유지)

### 결제 상태 전환 (Payment Status)

6가지 결제 상태 정의:
1. **Not Paid**: 미결제 (RNPL 예약 초기 상태)
2. **Partially Paid**: 부분 결제 (분할 결제 진행 중)
3. **Fully Paid**: 완납
4. **Refunded**: 전액 환불 (취소 후 전액 환불 시)
5. **Partially Refunded**: 부분 환불 (취소 수수료 차감 후 환불)
6. **Pending**: 결제 처리 중 (PG 응답 대기)

```
[Not Paid] --전액결제--> [Fully Paid]
[Not Paid] --부분결제--> [Partially Paid]
[Partially Paid] --잔액결제--> [Fully Paid]
[Fully Paid] --전액환불--> [Refunded]
[Fully Paid] --부분환불(수수료차감)--> [Partially Refunded]
[Pending] --결제성공--> [Fully Paid]
[Pending] --결제실패--> [Not Paid]
```

### 취소 수수료 데이터 구조

각 호텔/객실의 취소 정책 데이터:
```json
{
  "cancellationPolicy": {
    "type": "free_cancel" | "partial_refund" | "non_refundable",
    "freeCancelBeforeDays": 3,
    "penalties": [
      { "daysBeforeCheckIn": 3, "feeType": "percent", "feeValue": 0 },
      { "daysBeforeCheckIn": 1, "feeType": "percent", "feeValue": 50 },
      { "daysBeforeCheckIn": 0, "feeType": "percent", "feeValue": 100 }
    ]
  }
}
```
- **Free Cancel**: freeCancelBeforeDays 이전 취소 시 수수료 0%
- **Partial Refund**: 구간별 수수료율 적용 (위 penalties 배열)
- **Non-Refundable**: 취소 시 전액(100%) 수수료 부과. Cancel 버튼 클릭 시 "100% 수수료가 부과됩니다. 그래도 취소하시겠습니까?" 경고 모달 표시 후 사용자 확인 시 취소 진행
- 경계값: freeCancelBeforeDays 당일 00:00:00 기준 (체크인일 기준 N일 전 자정)
- 결제 실패 시: 예약은 생성되지 않으며 Booking Form으로 복귀 (다른 카드 선택/재시도 가능)

### 통화 환율 처리

- **환율 소스**: 고정 환율 JSON 파일 (exchangeRates.json), 기준 통화 USD
- **환율 적용**: 표시 전용 변환, 결제/정산은 원래 통화(USD)로 저장
- **통화별 소수점**: KRW/JPY/VND → 0자리, USD/EUR/GBP/SGD/HKD/THB → 2자리, CNY → 2자리
- **환율 갱신**: 고정값이므로 갱신 불필요 (향후 API 연동 시 캐시 정책 추가)
- **예약 확정 시**: 원래 통화(USD) 금액으로 저장, 바우처/영수증에도 USD 기준 + 선택 통화 병기

### 다중 객실 예약 규칙

- 객실 2개 이상 예약 시: 대표 게스트(Primary Traveler) 1명만 입력 (간소화)
- 예약 리스트 "1st Traveler" 컬럼: Primary Traveler 이름 표시
- 각 객실에 동일 게스트 정보 적용
- 향후 확장: 객실별 개별 게스트 입력 기능

---

### FR-SEARCH: 호텔 검색

#### FR-SEARCH-001: Find Hotel 메인
**Description**: 호텔 검색 진입점

**Business Rules**:
- BR-018: 목적지 자동완성 — 아시아 주요 도시(상하이, 도쿄, 방콕, 싱가포르 등), 랜드마크, 호텔명
- BR-019: Check-in / Check-out 날짜 선택, Nights 자동 계산
- BR-020: Rooms / Adults / Children 선택기, 어린이 연령 개별 입력
- BR-021: 국적(Nationality) 선택
- BR-022: 즐겨찾기 호텔 섹션 표시

**Input Validation**:
- 체크인 날짜: 오늘 이후만 가능
- 체크아웃 날짜: 체크인 이후만 가능
- 최소 1박, 최대 30박
- 객실: 1~10개
- 성인: 1~10명 (객실당 최소 1명)
- 어린이: 0~10명, 연령 0~17세
- 체크인=체크아웃(0박) 불가

**Acceptance Criteria**:
- [ ] AC-012: 검색 버튼 클릭 시 결과 페이지 이동
- [ ] AC-013: 자동완성이 입력 중 실시간으로 표시
- [ ] AC-013a: 과거 날짜 체크인 선택 시 에러 표시
- [ ] AC-013b: 체크아웃 < 체크인 시 에러 표시

#### FR-SEARCH-002: 검색 결과 - List View
**Description**: 호텔 목록 표시

**Business Rules**:
- BR-023: 호텔 카드 — 이미지, 이름, 지역, 별점, 평점, 리뷰수, 가격(선택 통화)
- BR-024: FEATURED / FREE CANCEL 배지
- BR-025: 시설 태그 (WiFi, Pool, Spa, Gym)
- BR-026: 즐겨찾기 별표 토글
- BR-027: 필터 사이드바 — 별점, 가격 범위, 지역, 어메니티
- BR-028: 정렬 — 추천순, 가격순(↑↓), 평점순

- BR-028a: 검색 결과 표시 — JSON 데이터 전체 로드 후 프론트엔드 필터링/정렬/페이지네이션 (페이지당 20건, 무한 스크롤 또는 페이지네이션)

**Acceptance Criteria**:
- [ ] AC-014: 필터/정렬 변경 시 즉시 반영
- [ ] AC-015: 호텔 카드 클릭 시 상세 페이지 이동

#### FR-SEARCH-003: 검색 결과 - Map View
**Description**: Leaflet.js + OpenStreetMap 기반 지도 검색

**Business Rules**:
- BR-029: 가격 마커 (선택 통화 기준)
- BR-030: 마커 클릭 시 팝업 (이미지, 이름, 평점, 남은 객실 수)
- BR-031: 할인 마커 (빨간 점)
- BR-032: 사이드바 호텔 리스트 연동, 마커 ↔ 리스트 양방향 하이라이트

**Acceptance Criteria**:
- [ ] AC-016: "지도에서 호텔보기" 버튼으로 List ↔ Map 전환

#### FR-SEARCH-004: 즐겨찾기 호텔
**Description**: 자주 예약하는 호텔 저장

**Business Rules**:
- BR-033: 호텔 카드/상세 페이지에서 별표 클릭으로 토글
- BR-034: localStorage 기반 영구 저장

**Acceptance Criteria**:
- [ ] AC-017: 즐겨찾기 추가/제거 즉시 반영

---

### FR-HOTEL: 호텔 상세

#### FR-HOTEL-001: 호텔 상세 페이지
**Description**: 호텔 정보 및 객실 선택

**Business Rules**:
- BR-035: Breadcrumb 네비게이션
- BR-036: 컴팩트 검색바 (날짜/객실 수정 가능)
- BR-037: Hero 섹션 (이미지, 이름, 별점, 평점)
- BR-038: 4개 탭 — Rooms, Overview, Policies, Facilities

#### FR-HOTEL-002: Rooms 탭
**Description**: 객실 목록 및 필터

**Business Rules**:
- BR-039: 필터 — Room Type, Bed Type, Price Range, Meal Plan, Refundable Only
- BR-040: 객실 카드 — 객실명, 베드 타입, 최대 인원, 취소 정책, 조식 포함 여부, 가격, Select 버튼

**Acceptance Criteria**:
- [ ] AC-018: 필터 변경 시 실시간 필터링

#### FR-HOTEL-003: Overview 탭
**Description**: 호텔 설명, 주요 하이라이트, 위치 정보

#### FR-HOTEL-004: Policies 탭
**Description**: Check-in/out 시간, 취소 정책, 어린이/유아/반려동물/흡연 정책

#### FR-HOTEL-005: Facilities 탭
**Description**: 카테고리별(General, Recreation, Business 등) 시설 목록, 아이콘 + 텍스트

---

### FR-BOOK: 예약 프로세스

#### FR-BOOK-001: 예약 폼 (Step 1)
**Description**: 게스트 정보 입력 및 결제수단 선택

**Business Rules**:
- BR-041: Guest Name (First/Last), Email, Mobile, Special Requests
- BR-042: 예약 요약 사이드바
- BR-043: 선불업체 — 등록 법인카드 선택 또는 Reserve Now Pay Later
- BR-044: 후불업체 — Floating Deposit 차감 또는 Credit Line 사용

**Acceptance Criteria**:
- [ ] AC-019: 필수 필드 검증 후 다음 단계 진행

#### FR-BOOK-002: 예약 확인 (Step 2)
**Description**: 최종 확인 및 약관 동의

**Business Rules**:
- BR-045: 예약 정보 요약 (호텔, 날짜, 객실, 게스트)
- BR-046: 가격 상세 (Room Rate, Tax, Total)
- BR-047: 취소 정책 안내
- BR-048: Terms & Conditions 체크박스 → Confirm Booking 버튼 활성화

#### FR-BOOK-003: 예약 완료 (Step 3)
**Description**: 예약 성공 화면

**Business Rules**:
- BR-049: 성공 아이콘 및 메시지
- BR-050: ELLIS Booking Code 생성 — 형식: `K` + `YYMMDD` + `HHMMSS` + `H` + `NN` (NN = 당일 순번 01~99, 브라우저 로컬 시간 자정 00:00:00 기준 01로 리셋. 충돌 발생 시 NN 자동 증가. 당일 100건 초과 시 NN을 3자리로 확장(100~999). 내부적으로 UUID 기반 고유 ID를 별도 관리하며, ELLIS Code는 표시용)
- BR-051: 바우처 다운로드/이메일 발송 버튼
- BR-052: My Bookings / New Booking 버튼

**Acceptance Criteria**:
- [ ] AC-020: 예약 목록에 즉시 반영

#### FR-BOOK-004: 예약 취소
**Description**: 예약 취소 프로세스

**Business Rules**:
- BR-053: 취소 사유 선택 (드롭다운)
- BR-054: 취소 수수료 자동 계산 (내부 데이터 기반 호텔별 정책 적용)
- BR-055: 환불 예정 금액 표시
- BR-056: 취소 확인 모달
- BR-057: 선불업체 — Cancel Deadline 초과 미결제 시 경고 후 자동 취소

**Acceptance Criteria**:
- [ ] AC-021: 취소 완료 시 상태 변경 및 알림 생성

#### FR-BOOK-005: 재예약 (Re-book)
**Description**: 취소된 예약 재예약

**Business Rules**:
- BR-058: 취소 완료 화면에서 Re-book 버튼
- BR-059: 동일 호텔 상세 페이지로 이동, 기존 날짜 정보 유지

---

### FR-BKG: 예약 관리

#### FR-BKG-001: 예약 리스트
**Description**: 전체 예약 조회 및 관리 (14개 컬럼 테이블)

**Business Rules**:
- BR-060: 컬럼 — 체크박스, Booking Date, ELLIS Code, Booking Status(Confirmed/Cancelled/Pending/No-show/Completed), Payment Status, Hotel Name, Cancel Deadline, Check-in & Nights, Room Type & Count, 1st Traveler, Currency, Sum Amount, Invoice No., Dispute
- BR-061: 페이지당 20/50/100건 선택

#### FR-BKG-002: 예약 필터
**Description**: 다중 조건 필터링

**Business Rules**:
- BR-062: Date Type 필터 — Booking/Cancel/Check In/Check Out/Cancel Deadline/Stay Date
- BR-063: 추가 필터 — ELLIS Code, Booking Status, Payment Status(6가지), Search By(Booker/Traveler/Mobile), Country, Hotel Name

#### FR-BKG-003: 예약 상세 모달
**Description**: 예약 전체 정보 조회 (9개 섹션)

**Business Rules**:
- BR-064: Booking Summary, Hotel Info, Room Details, Guest Info, Payment Info, Cancellation Policy, Special Requests, Booking Timeline, Actions(바우처/영수증/취소)
- BR-064a: 예약 수정(Modify): MVP에서는 게스트 정보(이름, 이메일, 연락처, Special Requests)만 수정 가능. 날짜/객실 변경은 취소 후 재예약으로 처리
- BR-065: 행 클릭 또는 ELLIS Code 붙여넣기로 열기 (TopBar GlobalSearch에 ELLIS Code 패턴 감지 기능 — ELLIS Code 입력 시 자동으로 해당 예약 상세 모달 열기)

#### FR-BKG-004: 캘린더 뷰
**Description**: 월별 예약 현황 시각화

**Business Rules**:
- BR-066: 월 네비게이션 (Prev/Today/Next)
- BR-067: 이벤트 색상 — Check-in(Blue), Check-out(Yellow), Stay(Green), Cancelled(Red), Cancel Deadline(Pink)
- BR-068: 셀당 최대 3개 이벤트, "+N more" 표시
- BR-069: 월간 통계 카드 (Confirmed, Cancelled, Room Nights, Net Cost, Unpaid)
- BR-070: Upcoming Check-ins 테이블 (향후 5건, D-day 색상)

#### FR-BKG-005: Excel 내보내기
**Description**: 현재 필터 적용된 예약 데이터 .xlsx 다운로드

#### FR-BKG-006: 일괄 바우처 다운로드
**Description**: 체크박스 다중 선택 → ZIP 또는 개별 다운로드

---

### FR-DOC: 바우처 및 문서

#### FR-DOC-001: 예약 바우처
**Description**: 호텔 제출용 예약 확인서 (PDF)

**Business Rules**:
- BR-071: ELLIS Code, 호텔 정보, 체크인/아웃, 게스트 정보, 객실 정보, 취소 정책, QR 코드
- BR-072: PDF 다운로드 및 이메일 발송 (html2pdf.js 등 외부 라이브러리 사용 허용)

#### FR-DOC-002: 영수증 (Receipt)
**Description**: 결제 확인서 PDF

#### FR-DOC-003: 취소 확인서
**Description**: 예약 취소 증빙 PDF

#### FR-DOC-004: B2B 계약서
**Description**: 가입 시 자동 생성되는 서비스 계약서 PDF

---

### FR-SET: 정산 시스템 (Master 전용)

#### FR-SET-001: Monthly Settlement
**Description**: 월별 정산 내역

**Business Rules**:
- BR-073: 월 선택 드롭다운
- BR-074: 정산 요약 카드 (Total Net Cost, Room Nights, Avg Net/Night)
- BR-075: 일별 상세 테이블
- BR-076: PDF/Excel 다운로드

#### FR-SET-002: Invoices (세금계산서)
**Description**: 월별 세금계산서 조회/발행

**Business Rules**:
- BR-077: 상태 — Draft, Issued, Paid
- BR-078: 공급가액, VAT(10%), 합계
- BR-079: 매월 자동 생성, 수동 발행 가능

#### FR-SET-003: Accounts Receivable (미수금)
**Description**: 미결제 예약 관리

**Business Rules**:
- BR-080: 미결제 건 목록, Cancel Deadline D-day 표시
- BR-081: 개별/일괄 결제, 분할 결제 옵션
- BR-081a: 분할 결제: 사용자가 결제 금액을 직접 입력 (최소 결제 금액 = 총액의 10%)
- BR-081b: 분할 시 Payment Status → Partially Paid, 잔여 금액 AR에 계속 표시
- BR-081c: 최대 분할 횟수: 5회
- BR-081d: 최종 결제 완료 시 Payment Status → Fully Paid
- BR-082: 선불업체 — 법인카드 결제, 후불업체 — Deposit 차감/계좌이체

#### FR-SET-004: OP Points Settlement
**Description**: 포인트 적립/사용/이전 내역 및 잔액

#### FR-SET-005: Purchase by Hotel
**Description**: 호텔별 구매 분석 (총 구매액, 건수, 평균 객단가, 비중, 차트)

---

### FR-PAY: 결제 시스템

#### FR-PAY-001: 선불업체 (Prepaid)
**Description**: 법인카드 PG 자동결제 + Reserve Now Pay Later

**Business Rules**:
- BR-083: Non-Refundable — 법인카드 즉시 결제 (PG 시뮬레이션)
- BR-084: Refundable — 예약 시 결제 없이 확정, Cancel Deadline 전까지 결제 필요
- BR-085: Cancel Deadline D-3, D-1에 경고 알림 사전 발송. Deadline 초과 즉시 자동 취소 (유예 기간 없음)

#### FR-PAY-002: 후불업체 (Credit)
**Description**: Floating Deposit + Credit Line

**Business Rules**:
- BR-086: Floating Deposit — 잔액 표시, 예약 시 실시간 차감
- BR-086a: Deposit 잔액 부족 시: 사용자에게 "Deposit 잔액이 부족합니다. Credit Line을 사용하시겠습니까?" 확인 UI 제공 (자동 전환 아님)
- BR-086b: Deposit + Credit 혼합 결제 불가 — 전액 Deposit 또는 전액 Credit Line 중 택1
- BR-086c: 양쪽 모두 부족 시 ERR-PAY-005 표시 (예약 불가)
- BR-087: Credit Line — Deposit 기반 신용한도, 한도 내 자유 예약, 월말 일괄 정산
- BR-088: Low Deposit 경고 — Deposit < $5,000 시 Critical 알림

---

### FR-PTS: OP Points 시스템

#### FR-PTS-001: 포인트 적립
**Description**: 예약 금액 기반 포인트 적립 (고정률, 내부 데이터에서 설정값 로드)

**Business Rules**:
- BR-089: 예약 완료 시 자동 적립
- BR-090: OP별 Share 비율에 따른 분배

#### FR-PTS-002: 포인트 사용 (Rewards Mall)
**Description**: 6개 카테고리, 20개+ 상품

#### FR-PTS-003: 포인트 이전
**Description**: 같은 업체 내 OP 간 포인트 이전 (Master 또는 본인만)

#### FR-PTS-004: 포인트 히스토리
**Description**: 적립/사용/이전 내역 조회, 기간 필터

---

### FR-AI: AI Booking Assistant (플로팅 위젯)

#### FR-AI-001: 자연어 호텔 추천
**Description**: Claude API 연동 자연어 호텔 검색 (API 호출 방식 TBD)

**Business Rules**:
- BR-091: 클릭 가능한 호텔 카드 응답
- BR-092: 호텔 카드 클릭 시 상세 페이지 이동

#### FR-AI-002: 예약 분석
**Description**: 사용자 예약 패턴 분석 (총 예약, 지출, 빈도, 평균 단가, 선호 지역)

#### FR-AI-003: 지역 가이드
**Description**: 여행 지역 정보 제공 (지역 특성, 목적별 추천, 교통 접근성)

#### FR-AI-004: Quick Actions
**Description**: 자주 사용하는 기능 바로가기 버튼 (호텔 추천, 예약 분석, 지역 가이드, 도움말)

#### FR-AI-005: Local Fallback
**Description**: API 연결 실패 시 로컬 호텔 데이터 기반 대체 응답

**Fallback 범위**:
- 호텔 추천 (FR-AI-001): 지원 — 로컬 JSON 데이터 기반 호텔 카드 최대 5개 반환 (텍스트 설명 없이 카드만)
- 예약 분석 (FR-AI-002): 미지원 — "현재 AI 서비스를 이용할 수 없습니다" 메시지
- 지역 가이드 (FR-AI-003): 미지원 — "현재 AI 서비스를 이용할 수 없습니다" 메시지
- Fallback 상태에서 "제한된 서비스 모드" 안내 배너 표시

---

### FR-NOTI: 알림 센터

#### FR-NOTI-001: 알림 목록
**Description**: 전체 알림 조회 (탭: All, Unread, Deadlines, Payment, Check-in, Bookings, Cancelled, System)

#### FR-NOTI-002: 알림 우선순위
**Description**: Critical(빨강) > High(노랑) > Medium(초록) > Low(회색)

#### FR-NOTI-003: 자동 알림 생성
**Description**: 조건 충족 시 자동 생성

**알림 생성 타이밍 기준**:
| 알림 유형 | 타이밍 | 우선순위 | 중복 방지 키 |
|----------|--------|---------|-------------|
| Cancel Deadline | D-7, D-3, D-1 | Medium, High, Critical | booking_id + type + D-N |
| Check-in Reminder | D-3, D-1 | Medium, High | booking_id + type + D-N |
| Payment Pending | 예약 생성 즉시 | Medium | booking_id + "payment" |
| Booking Confirmed | 예약 확정 즉시 | Low | booking_id + "confirmed" |
| Booking Cancelled | 취소 즉시 | Low | booking_id + "cancelled" |
| Low Deposit | 잔액 확인 시 | Critical | tenant_id + "low_deposit" |

- 동일 dedup_key로 알림이 이미 존재하면 중복 생성하지 않음

#### FR-NOTI-004: 알림 설정
**Description**: 알림 수신 토글 (Cancel Deadline, Check-in, Payment, Booking, Email, Promotional, System, Quiet Hours)

#### FR-NOTI-005: 알림 Summary 카드
**Description**: Critical/Unread/Deadlines/Payments 건수 요약

---

### FR-DASH: 대시보드

#### FR-DASH-001: KPI 카드
**Description**: Total Bookings, Revenue(TTV), Room Nights, Avg Booking Value + 전기 대비 증감률

#### FR-DASH-002: OP Points Widget
**Description**: 현재 잔액, 이번 달 적립/사용, Rewards Mall 바로가기

#### FR-DASH-003: Top Hotels
**Description**: 상위 5개 호텔, 예약 건수/총 금액

#### FR-DASH-004: 12개월 TTV 트렌드
**Description**: CSS 기반 바 차트, 현재 월 하이라이트

#### FR-DASH-005: Booking Conversion Funnel
**Description**: Searches → Room Views → Booking Started → Confirmed → Completed

#### FR-DASH-006: Hotel Profitability
**Description**: 호텔별 평균 Net/Night, 예약 건수, 추세

#### FR-DASH-007: OP Performance Comparison (Master 전용)
**Description**: OP별 예약 건수/TTV/Room Nights/평균 객단가 + 순위

#### FR-DASH-008: My Performance KPIs (OP 전용)
**Description**: Booking Success Rate, Avg Response Time, Satisfaction, Repeat Rate + 게이지 바

---

### FR-CHAT: Support Chat

#### FR-CHAT-001: 채팅 시스템
**Description**: 채팅방 목록, 메시지 영역, 입력창, 파일 첨부 (Bookings 페이지 내 탭)

#### FR-CHAT-002: ELLIS Code 자동 감지
**Description**: 채팅 내 ELLIS Code 패턴 감지 → 예약 정보 자동 로드

#### FR-CHAT-003: AI 챗봇 (1차 응대)
**Description**: FAQ 기반 자동 응답, 답변 불가 시 담당자 연결

#### FR-CHAT-004: 담당자 에스컬레이션
**Description**: Connect to Agent 버튼, 상담원 연결 상태 변경

---

### FR-FAQ: FAQ Board

#### FR-FAQ-001: FAQ 목록
**Description**: 카테고리 탭(All, Booking, Payment, Cancellation, Account, Technical), 22개+ 아티클, 아코디언

#### FR-FAQ-002: FAQ 검색
**Description**: 키워드 검색, 제목 + 내용 대상, 실시간 결과

---

### FR-UI: UI/UX

#### FR-UI-001: 다크모드
**Description**: CSS Variables 기반, 헤더 토글 (🌙/☀️), localStorage 저장

#### FR-UI-002: 언어 선택
**Description**: 5개 언어 (EN, KO, JA, ZH, VI), 헤더 드롭다운, 전체 번역 구현

#### FR-UI-003: 통화 선택
**Description**: 10개 통화 (USD, KRW, JPY, CNY, VND, EUR, GBP, THB, SGD, HKD)

#### FR-UI-004: 반응형 레이아웃
**Description**: 데스크톱 최적화(1024px+), 태블릿 대응

#### FR-UI-005: Ohmyhotel CI 적용
**Description**: Primary #FF6000, Success #009505, Background #FCFCF8

---

## Spec Files

| File | Contents |
|------|----------|
| `screens.md` | Screen Definitions, Error Handling |
| `test-scenarios.md` | Non-Functional Requirements, Test Scenarios |

---

## 8. Open Questions

| ID | Question | Context | Status |
|----|----------|---------|--------|
| OQ-001 | Claude API 호출 방식 (프론트엔드 직접 vs 프록시 서버) | 보안 이슈 — API 키가 프론트엔드에 노출될 수 있음 | OPEN |
| OQ-002 | OP Points 적립률 구체적 설정값 | 내부 데이터에서 가져오지만 Mock 기본값 필요 (예: 1%) | OPEN |
| OQ-003 | 포인트 화폐 가치 (1P = ?원) | Rewards Mall 상품 가격 설정에 필요 | OPEN |
| OQ-004 | 호텔 데이터 초기 세트 규모 | JSON 하드코딩 시 아시아 주요 도시 호텔 최소 50개 권장 | OPEN |
| OQ-005 | Excel 내보내기 라이브러리 | SheetJS 사용 허용 여부 (PDF는 html2pdf.js 허용 확정) | OPEN |
| OQ-006 | Support Chat Mock 동작 방식 | AI 챗봇만 동작, 담당자 연결 시 '현재 상담원 부재' 시뮬레이션 권장 | OPEN |
| OQ-007 | Invoice 자동 생성 타이밍 | 매월 1일 자동 Draft 생성, Master가 Issued 처리 — 확인 필요 | OPEN |

---

## 9. Review History

| Round | Planner Score | Tester Score | Key Decisions | Date |
|-------|---------------|--------------|---------------|------|
| 1 | 7/10 | 4/10 | 비밀번호 찾기 추가, 상태 전환 다이어그램, 결제 상태 6가지 정의, 취소 수수료 구조, 통화 환율, 유효성 검사, ELLIS Code 충돌, 다중 객실, Deposit/Credit 전환, 분할 결제, OP 비활성화, 알림 타이밍, AI Fallback | 2026-03-28 |
| 2 | 8/10 | 7/10 | Non-Refundable 취소 모순 해결(경고 후 취소 허용), ELLIS Code 100건+ 확장, 세션 경고 팝업 상세, RNPL 자동 취소 타이밍 확정 | 2026-03-28 |
