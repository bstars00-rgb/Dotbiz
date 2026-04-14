---
title: "DOTBIZ B2B Hotel Booking System — Functional Specification"
subtitle: "v1.0 | 2026-03-28"
author: "Planning Plugin (Auto-generated)"
---

\newpage

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



ewpage


## 4. Screen Definitions

@layout: _shared/main-layout

---

### Screen: Login

**Purpose**: 이메일/비밀번호 기반 로그인 화면

**Entry Points**: 앱 최초 접근, 세션 만료 시

**Layout**:
```
+--------------------------------------------------+
| [ Header ]                                       |
| - Logo (DOTBIZ)             - DarkModeToggle     |
+--------------------------------------------------+
| [ Login Form ]                                   |
|                                                  |
|   - AnimatedBackground (Tech 스타일)             |
|                                                  |
|   +------------------------------------------+   |
|   | - EmailInput                             |   |
|   | - PasswordInput                          |   |
|   | - RememberMeCheckbox                     |   |
|   | - LoginButton                            |   |
|   | - ForgotPasswordLink                     |   |
|   | - RegisterLink                           |   |
|   +------------------------------------------+   |
|                                                  |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| Logo | Image | DOTBIZ 브랜드 로고 |
| DarkModeToggle | Button | 🌙/☀️ 다크/라이트 모드 전환 |
| AnimatedBackground | Canvas | Tech 스타일 애니메이션 배경 |
| EmailInput | Input | 이메일 입력, Remember Me 시 자동완성 |
| PasswordInput | Input | 비밀번호 입력, show/hide 토글 |
| RememberMeCheckbox | Checkbox | localStorage에 이메일 저장 |
| LoginButton | Button | 로그인 실행 |
| ForgotPasswordLink | Link | 비밀번호 재설정 화면으로 이동 |
| RegisterLink | Link | 회원가입 페이지로 이동 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 로그인 | LoginButton 클릭 | 자격증명 검증 → Dashboard 이동 |
| 비밀번호 찾기 | ForgotPasswordLink 클릭 | 비밀번호 재설정 화면 이동 |
| 회원가입 | RegisterLink 클릭 | Registration 페이지 이동 |
| 다크모드 전환 | DarkModeToggle 클릭 | 테마 전환, localStorage 저장 |

---

### Screen: Registration

**Purpose**: 3-Step 회원가입 프로세스

**Entry Points**: Login 화면의 RegisterLink

**Layout**:
```
+--------------------------------------------------+
| [ Header ]                                       |
| - Logo                      - DarkModeToggle     |
+--------------------------------------------------+
| [ StepIndicator ]                                |
| - Step1(회사정보)  Step2(사용자)  Step3(계약동의) |
+--------------------------------------------------+
| [ FormContent ]                                  |
|                                                  |
|   Step 1:                                        |
|   - CompanyNameInput                             |
|   - BusinessRegNoInput                           |
|   - BusinessTypeSelect (선불/후불)               |
|   - AddressInput                                 |
|   - PhoneInput                                   |
|   - CompanyEmailInput                            |
|                                                  |
|   Step 2:                                        |
|   - FullNameInput                                |
|   - PositionInput                                |
|   - UserEmailInput                               |
|   - PasswordInput                                |
|   - MobileInput                                  |
|   - LanguageSelect                               |
|                                                  |
|   Step 3:                                        |
|   - TermsCheckbox (B2B 이용약관)                 |
|   - ContractDownloadButton                       |
|                                                  |
+--------------------------------------------------+
| [ FormActions ]                                  |
| - BackButton                - NextButton         |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| StepIndicator | Stepper | 현재 단계 표시 (1/2/3) |
| CompanyNameInput | Input | 회사명 입력 (필수) |
| BusinessRegNoInput | Input | 사업자등록번호 (필수) |
| BusinessTypeSelect | Select | 선불/후불 업체 유형 |
| AddressInput | Input | 주소 입력 |
| PhoneInput | Input | 전화번호 입력 |
| CompanyEmailInput | Input | 회사 이메일 (필수) |
| FullNameInput | Input | 이름 (필수) |
| PositionInput | Input | 직책 |
| UserEmailInput | Input | 사용자 이메일 (필수) |
| PasswordInput | Input | 비밀번호 (필수, 8~128자, 영문+숫자+특수문자) |
| PasswordConfirmInput | Input | 비밀번호 확인 (PasswordInput과 일치 필수) |
| MobileInput | Input | 휴대폰 번호 |
| LanguageSelect | Select | 선호 언어 (5개) |
| TermsCheckbox | Checkbox | B2B 이용약관 동의 (필수) |
| ContractDownloadButton | Button | 계약서 PDF 다운로드 |
| BackButton | Button | 이전 Step 이동 |
| NextButton | Button | 다음 Step / 완료 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 다음 단계 | NextButton 클릭 | 필수 필드 검증 → 다음 Step |
| 이전 단계 | BackButton 클릭 | 이전 Step으로 이동 (입력 유지) |
| 계약서 다운로드 | ContractDownloadButton 클릭 | PDF 파일 다운로드 |
| 가입 완료 | Step 3 완료 | Pending 상태 안내 메시지 표시 |

---

### Screen: Dashboard

**Purpose**: KPI 요약 및 비즈니스 분석 대시보드

**Entry Points**: 로그인 후 기본 화면, 사이드바 메뉴

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ]                                       |
| - SearchGlobal  - CurrencySelect  - LangSelect  |
| - DarkModeToggle  - NotificationBell  - Profile  |
+--------------------------------------------------+
| [ Sidebar ]    || [ MainContent ]                |
| - Logo         ||                                |
| - NavMenu:     || [ KPICards ]                   |
|   AI Assistant || - TotalBookings  - Revenue     |
|   Find Hotel   || - RoomNights  - AvgBookingVal  |
|   Dashboard    ||                                |
|   Bookings     || [ OPPointsWidget ]             |
|   Settlement*  || - Balance - Earned - Used       |
|   Notifications||                                |
|   FAQ Board    || [ TopHotels ]  || [ TTVTrend ] |
|   My Account   || - Hotel List   || - BarChart   |
|   Rewards Mall ||                                |
|                || [ BookingFunnel ]               |
|                || - FunnelChart                   |
|                ||                                |
|                || [ HotelProfitability ]          |
|                || - ProfitTable                   |
|                ||                                |
|                || [ OPPerformance ]  (Master)     |
|                || - ComparisonTable               |
|                ||                                |
|                || [ MyPerformance ]  (OP)         |
|                || - GaugeBars                     |
+--------------------------------------------------+
```
*Settlement은 Master 전용

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| Sidebar | Navigation | 메뉴 항목, 현재 페이지 하이라이트 |
| TopBar | Header | 검색, 통화/언어/다크모드, 알림, 프로필 |
| KPICards | Card Grid | 4개 KPI + 전기 대비 증감률, 기간 필터 |
| OPPointsWidget | Card | 포인트 현황 컴팩트 위젯 |
| TopHotels | Table | 상위 5개 호텔 (건수, 금액) |
| TTVTrend | Chart | 12개월 CSS 바 차트 |
| BookingFunnel | Chart | 5단계 전환율 퍼널 |
| HotelProfitability | Table | 호텔별 수익성 (상위 5개) |
| OPPerformance | Table | OP별 실적 비교 (Master 전용) |
| MyPerformance | GaugeBar | 개인 KPI (OP 전용) |
| NotificationBell | Button | 알림 센터 이동, 미읽음 배지 |
| CurrencySelect | Dropdown | 10개 통화 선택 |
| LangSelect | Dropdown | 5개 언어 선택 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 기간 필터 변경 | KPICards 필터 선택 | 전체 위젯 데이터 갱신 |
| Rewards Mall 이동 | OPPointsWidget 링크 클릭 | Rewards Mall 페이지 이동 |
| 메뉴 이동 | Sidebar 메뉴 클릭 | 해당 페이지로 Hash 라우팅 |

---

### Screen: Find Hotel

**Purpose**: 호텔 검색 진입점 및 즐겨찾기

**Entry Points**: 사이드바 메뉴 "Find Hotel"

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ SearchForm ]                    |
|             || - DestinationInput (자동완성)      |
|             || - CheckInPicker  - CheckOutPicker |
|             || - NightsDisplay                   |
|             || - RoomsSelect  - AdultsSelect     |
|             || - ChildrenSelect  - ChildAgeInputs|
|             || - NationalitySelect               |
|             || - SearchButton                    |
|             ||                                   |
|             || [ FavoriteHotels ]                |
|             || - FavoriteHotelCard (반복)         |
|             ||                                   |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| DestinationInput | Autocomplete | 도시/랜드마크/호텔명 자동완성 (아시아 주요 도시) |
| CheckInPicker | DatePicker | 체크인 날짜 선택 |
| CheckOutPicker | DatePicker | 체크아웃 날짜 선택 |
| NightsDisplay | Display | Nights 자동 계산 표시 |
| RoomsSelect | Select | 객실 수 선택 |
| AdultsSelect | Select | 성인 수 선택 |
| ChildrenSelect | Select | 어린이 수 선택 |
| ChildAgeInputs | Input[] | 어린이 연령 개별 입력 (동적 생성) |
| NationalitySelect | Select | 국적 선택 |
| SearchButton | Button | 검색 실행 |
| FavoriteHotelCard | Card | 즐겨찾기 호텔 카드 (이미지, 이름, 별점) |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 검색 실행 | SearchButton 클릭 | Search Results 페이지 이동 |
| 즐겨찾기 호텔 클릭 | FavoriteHotelCard 클릭 | Hotel Detail 페이지 이동 |
| 어린이 수 변경 | ChildrenSelect 변경 | ChildAgeInputs 동적 추가/제거 |

---

### Screen: Search Results

**Purpose**: 호텔 검색 결과 (List View + Map View)

**Entry Points**: Find Hotel 검색 실행

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ CompactSearchBar ]              |
|             || - Destination - Dates - Rooms     |
|             || - ModifyButton                    |
|             ||                                   |
|             || [ ViewToggle ]                    |
|             || - ListViewBtn  - MapViewBtn       |
|             || - SortDropdown                    |
|             || - ResultCount                     |
|             ||                                   |
|             || [ FilterSidebar ] || [ Results ]  |
|             || - StarRating     || (List View)   |
|             || - PriceRange     || - HotelCard   |
|             || - AreaFilter     ||   (반복)      |
|             || - AmenityFilter  ||               |
|             ||                  || (Map View)    |
|             ||                  || - LeafletMap  |
|             ||                  || - MapSidebar  |
|             ||                                   |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| CompactSearchBar | Form | 검색 조건 수정 가능한 컴팩트 바 |
| ViewToggle | ButtonGroup | List ↔ Map 뷰 전환 |
| SortDropdown | Dropdown | 추천순, 가격순(↑↓), 평점순 |
| ResultCount | Display | 검색 결과 건수 |
| FilterSidebar | Panel | 별점/가격/지역/어메니티 필터 |
| StarRating | CheckboxGroup | 5/4/3 Star 필터 |
| PriceRange | RangeSlider | $100 이하 ~ $300+ |
| AreaFilter | CheckboxGroup | 지역별 필터 |
| AmenityFilter | CheckboxGroup | Free Cancellation, Breakfast, Pool 등 |
| HotelCard | Card | 호텔 이미지, 이름, 별점, 평점, 가격, 배지, 즐겨찾기 |
| LeafletMap | Map | Leaflet.js 인터랙티브 지도 |
| MapSidebar | Panel | 지도 옆 호텔 리스트 (마커 연동) |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 뷰 전환 | ViewToggle 클릭 | List ↔ Map 전환 |
| 필터 적용 | 필터 항목 변경 | 결과 즉시 필터링 |
| 정렬 변경 | SortDropdown 변경 | 결과 즉시 재정렬 |
| 호텔 선택 | HotelCard 클릭 | Hotel Detail 이동 |
| 즐겨찾기 | 별표 클릭 | 즐겨찾기 토글 |
| 마커 클릭 | 지도 마커 클릭 | 팝업 표시 + 리스트 하이라이트 |

---

### Screen: Hotel Detail

**Purpose**: 호텔 정보 및 객실 선택 (4개 탭)

**Entry Points**: Search Results 호텔 카드 클릭, AI 추천 호텔 클릭

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ Breadcrumb ]                    |
|             || - Home > Search > HotelName       |
|             ||                                   |
|             || [ CompactSearchBar ]              |
|             || - Dates - Rooms - ModifyButton    |
|             ||                                   |
|             || [ HeroSection ]                   |
|             || - HotelImage  - HotelName         |
|             || - StarBadge  - RatingBadge        |
|             || - FavoriteButton                  |
|             ||                                   |
|             || [ TabNavigation ]                 |
|             || - RoomsTab  - OverviewTab         |
|             || - PoliciesTab  - FacilitiesTab    |
|             ||                                   |
|             || [ TabContent ]                    |
|             || (Rooms Tab)                       |
|             || - RoomFilter                      |
|             ||   - RoomTypeSelect                |
|             ||   - BedTypeSelect                 |
|             ||   - PriceRangeSelect              |
|             ||   - MealPlanSelect                |
|             ||   - RefundableCheckbox            |
|             || - RoomCard (반복)                  |
|             ||   - RoomName  - BedType           |
|             ||   - MaxGuests  - CancelPolicy     |
|             ||   - MealIncluded  - Price         |
|             ||   - SelectButton                  |
|             ||                                   |
|             || (Overview Tab)                    |
|             || - HotelDescription                |
|             || - Highlights  - Location           |
|             ||                                   |
|             || (Policies Tab)                    |
|             || - CheckInOut  - CancelPolicy      |
|             || - ChildPolicy  - PetPolicy        |
|             || - SmokingPolicy                   |
|             ||                                   |
|             || (Facilities Tab)                  |
|             || - FacilityGroup (반복)             |
|             ||   - CategoryTitle                 |
|             ||   - FacilityItem (아이콘+텍스트)   |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| Breadcrumb | Navigation | 계층 네비게이션 |
| HeroSection | Section | 호텔 이미지, 이름, 별점, 평점 |
| FavoriteButton | Button | 즐겨찾기 토글 |
| TabNavigation | Tabs | 4개 탭 전환 |
| RoomFilter | FilterBar | Room Type, Bed Type, Price, Meal, Refundable |
| RoomCard | Card | 객실 정보 + Select 버튼 |
| SelectButton | Button | 객실 선택 → 예약 폼 이동 |
| HotelDescription | Text | 호텔 소개 텍스트 |
| FacilityGroup | List | 카테고리별 시설 목록 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 탭 전환 | TabNavigation 클릭 | 해당 탭 콘텐츠 표시 |
| 객실 필터 | RoomFilter 변경 | 객실 목록 실시간 필터링 |
| 객실 선택 | SelectButton 클릭 | Booking Form 이동 |
| 검색 수정 | CompactSearchBar ModifyButton | 날짜/객실 수 변경 |

---

### Screen: Booking Form (Step 1)

**Purpose**: 게스트 정보 입력 및 결제수단 선택

**Entry Points**: Hotel Detail 객실 Select 버튼

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ BookingStepIndicator ]           |
|             || - Step1(정보) Step2(확인) Step3(완료)|
|             ||                                   |
|             || [ GuestForm ]  || [ BookingSummary]|
|             || - FirstName    || - HotelName     |
|             || - LastName     || - RoomType      |
|             || - Email        || - CheckIn/Out   |
|             || - Mobile       || - Nights        |
|             || - SpecialReq   || - Guests        |
|             ||                || - RoomRate      |
|             || [ PaymentMethod]| - Tax           |
|             || (선불업체)     || - Total          |
|             || - CardSelect   ||                 |
|             || - RNPLOption   ||                 |
|             || (후불업체)     ||                 |
|             || - DepositOption||                 |
|             || - CreditOption ||                 |
|             ||                ||                 |
|             || [ FormActions ]                   |
|             || - BackButton   - ContinueButton   |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| BookingStepIndicator | Stepper | 예약 진행 단계 표시 (1/2/3) |
| FirstNameInput | Input | 게스트 이름 (필수) |
| LastNameInput | Input | 게스트 성 (필수) |
| EmailInput | Input | 게스트 이메일 (필수) |
| MobileInput | Input | 게스트 연락처 |
| SpecialRequests | Textarea | 특별 요청사항 |
| BookingSummary | Card | 예약 요약 (호텔, 객실, 날짜, 가격) |
| CardSelect | Select | 등록 법인카드 선택 (선불업체) |
| RNPLOption | Radio | Reserve Now Pay Later (선불업체) |
| DepositOption | Radio | Floating Deposit 차감 (후불업체) |
| CreditOption | Radio | Credit Line 사용 (후불업체) |
| ContinueButton | Button | 다음 단계 이동 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 계속 | ContinueButton 클릭 | 필수 필드 검증 → Booking Confirm 이동 |
| 뒤로 | BackButton 클릭 | Hotel Detail 복귀 |

---

### Screen: Booking Confirm (Step 2)

**Purpose**: 최종 예약 확인 및 약관 동의

**Entry Points**: Booking Form 계속 버튼

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ BookingStepIndicator ]           |
|             ||                                   |
|             || [ ReviewSection ]                 |
|             || - HotelInfo                       |
|             || - DateInfo                        |
|             || - RoomInfo                        |
|             || - GuestInfo                       |
|             ||                                   |
|             || [ PriceDetail ]                   |
|             || - RoomRate                        |
|             || - TaxAmount                       |
|             || - TotalAmount                     |
|             ||                                   |
|             || [ CancelPolicyInfo ]              |
|             ||                                   |
|             || [ TermsCheckbox ]                 |
|             || - Terms & Conditions 동의          |
|             ||                                   |
|             || [ FormActions ]                   |
|             || - BackButton  - ConfirmButton     |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| ReviewSection | Section | 예약 정보 요약 (호텔, 날짜, 객실, 게스트) |
| PriceDetail | Table | Room Rate, Tax, Total 상세 |
| CancelPolicyInfo | Info | 취소 정책 안내 |
| TermsCheckbox | Checkbox | 약관 동의 (필수) |
| ConfirmButton | Button | 예약 확정 (약관 동의 시 활성화) |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 약관 동의 | TermsCheckbox 체크 | ConfirmButton 활성화 |
| 예약 확정 | ConfirmButton 클릭 | ELLIS Code 생성 → Booking Complete 이동 |
| 뒤로 | BackButton 클릭 | Booking Form 복귀 |

---

### Screen: Booking Complete (Step 3)

**Purpose**: 예약 성공 화면

**Entry Points**: Booking Confirm 예약 확정

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ SuccessMessage ]                |
|             || - SuccessIcon                     |
|             || - SuccessText                     |
|             || - ELLISCode                       |
|             ||                                   |
|             || [ BookingDetail ]                 |
|             || - HotelInfo                       |
|             || - DateInfo                        |
|             || - RoomInfo                        |
|             || - GuestInfo                       |
|             || - PaymentInfo                     |
|             ||                                   |
|             || [ ActionButtons ]                 |
|             || - VoucherDownload                 |
|             || - VoucherEmail                    |
|             || - MyBookingsButton                |
|             || - NewBookingButton                |
|             || - RebookButton (취소 시)           |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| SuccessIcon | Icon | 체크마크 성공 아이콘 |
| ELLISCode | Display | ELLIS Booking Code 표시 (K+YYMMDD+HHMMSS+H+NN) |
| BookingDetail | Section | 예약 상세 정보 |
| VoucherDownload | Button | 바우처 PDF 다운로드 |
| VoucherEmail | Button | 바우처 이메일 발송 |
| MyBookingsButton | Button | 예약 목록 이동 |
| NewBookingButton | Button | 새 검색 이동 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 바우처 다운로드 | VoucherDownload 클릭 | PDF 파일 다운로드 |
| 바우처 이메일 | VoucherEmail 클릭 | 게스트 이메일로 발송 |
| 예약 목록 | MyBookingsButton 클릭 | Bookings 페이지 이동 |
| 새 예약 | NewBookingButton 클릭 | Find Hotel 이동 |

---

### Screen: Bookings

**Purpose**: 예약 리스트, 캘린더 뷰, Support Chat (3탭)

**Entry Points**: 사이드바 메뉴 "Bookings"

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ TabBar ]                        |
|             || - BookingListTab - CalendarTab     |
|             || - SupportChatTab                  |
|             ||                                   |
|             || (Booking List Tab)                |
|             || [ FilterPanel ]                   |
|             || - DateTypeSelect                  |
|             || - DateRangePicker                 |
|             || - ELLISCodeInput                  |
|             || - BookingStatusSelect             |
|             || - PaymentStatusSelect             |
|             || - SearchBySelect + SearchInput    |
|             || - CountrySelect                   |
|             || - HotelNameInput                  |
|             || - SearchBtn  - ResetBtn           |
|             ||                                   |
|             || [ ActionBar ]                     |
|             || - ExcelExportBtn                  |
|             || - BulkVoucherBtn                  |
|             || - PageSizeSelect (20/50/100)      |
|             ||                                   |
|             || [ BookingTable ]                  |
|             || - SelectAllCheckbox               |
|             || - 14 Column Table (반복)           |
|             || - Pagination                      |
|             ||                                   |
|             || (Calendar Tab)                    |
|             || [ CalendarHeader ]                |
|             || - MonthNav (Prev/Today/Next)      |
|             || [ MonthlyStats ]                  |
|             || - Confirmed - Cancelled           |
|             || - RoomNights - NetCost - Unpaid   |
|             || [ CalendarGrid ]                  |
|             || - 7-column grid                   |
|             || - EventBadge (색상별)              |
|             || [ UpcomingCheckins ]              |
|             || - Next 5 check-ins table          |
|             ||                                   |
|             || (Support Chat Tab)                |
|             || [ ChatList ]  || [ ChatArea ]     |
|             || - ChatRoom    || - Messages       |
|             ||   (반복)      || - InputBar       |
|             ||               || - AttachButton   |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| TabBar | Tabs | 예약목록 / 캘린더 / 채팅 전환 |
| FilterPanel | Form | 다중 조건 필터 |
| DateTypeSelect | Select | Booking/Cancel/CheckIn/CheckOut/Deadline/Stay |
| BookingStatusSelect | Select | Confirmed/Cancelled/Pending/No-show/Completed |
| PaymentStatusSelect | Select | 6가지 결제 상태 |
| BookingTable | DataTable | 14개 컬럼, 체크박스, 페이지네이션 |
| ExcelExportBtn | Button | .xlsx 내보내기 |
| BulkVoucherBtn | Button | 선택 예약 일괄 바우처 다운로드 |
| CalendarGrid | Calendar | 월별 그리드, 이벤트 색상 배지 |
| MonthlyStats | Card Grid | 월간 통계 5개 카드 |
| UpcomingCheckins | Table | 향후 5건 체크인 (D-day 색상) |
| ChatList | List | 채팅방 목록 |
| ChatArea | Panel | 메시지 영역 + 입력창 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 탭 전환 | TabBar 클릭 | 해당 탭 콘텐츠 표시 |
| 필터 적용 | SearchBtn 클릭 | 필터 조건으로 검색 |
| 필터 초기화 | ResetBtn 클릭 | 모든 필터 초기화 |
| 예약 상세 | 테이블 행 클릭 | 예약 상세 모달 열기 |
| Excel 내보내기 | ExcelExportBtn 클릭 | .xlsx 파일 다운로드 |
| 일괄 바우처 | BulkVoucherBtn 클릭 | 선택 예약 바우처 다운로드 |
| 캘린더 이벤트 | EventBadge 클릭 | 예약 상세 모달 열기 |
| 채팅 메시지 | 전송 버튼 클릭 | 메시지 발송 |

---

### Screen: Booking Detail Modal

**Purpose**: 예약 전체 정보 조회 (9개 섹션 모달)

**Entry Points**: Bookings 테이블 행 클릭, ELLIS Code 붙여넣기

**Layout**:
```
+------------------------------------------+
| [ ModalHeader ]                          |
| - Title (ELLIS Code)   - CloseButton    |
+------------------------------------------+
| [ BookingSummary ]                       |
| - Status  - BookingDate  - ELLISCode    |
+------------------------------------------+
| [ HotelInfo ]                            |
| - HotelName  - Address  - Contact       |
+------------------------------------------+
| [ RoomDetails ]                          |
| - RoomType  - Guests  - Rate            |
+------------------------------------------+
| [ GuestInfo ]                            |
| - Name  - Email  - Mobile               |
+------------------------------------------+
| [ PaymentInfo ]                          |
| - Amount  - Status  - Method            |
+------------------------------------------+
| [ CancelPolicy ]                         |
| - Deadline  - Fee                        |
+------------------------------------------+
| [ SpecialRequests ]                      |
| - RequestText                            |
+------------------------------------------+
| [ BookingTimeline ]                      |
| - Created  - Confirmed  - Paid          |
+------------------------------------------+
| [ Actions ]                              |
| - VoucherBtn - ReceiptBtn               |
| - CancelBtn  - ModifyBtn                |
+------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| ModalHeader | Header | ELLIS Code 표시 + 닫기 버튼 |
| BookingSummary | Section | 예약 상태, 날짜, 코드 |
| HotelInfo | Section | 호텔명, 주소, 연락처 |
| RoomDetails | Section | 객실 타입, 인원, 요금 |
| GuestInfo | Section | 게스트 정보 |
| PaymentInfo | Section | 결제 금액, 상태, 방법 |
| CancelPolicy | Section | 취소 데드라인, 수수료 |
| BookingTimeline | Timeline | 예약 이벤트 타임라인 |
| VoucherBtn | Button | 바우처 PDF 다운로드 |
| ReceiptBtn | Button | 영수증 PDF 다운로드 |
| CancelBtn | Button | 예약 취소 모달 열기 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 바우처 다운로드 | VoucherBtn 클릭 | PDF 다운로드 |
| 영수증 다운로드 | ReceiptBtn 클릭 | PDF 다운로드 |
| 예약 취소 | CancelBtn 클릭 | 취소 확인 모달 열기 |
| 닫기 | CloseButton 클릭 | 모달 닫기 |

---

### Screen: Settlement

**Purpose**: 정산 시스템 (5개 탭, Master 전용)

**Entry Points**: 사이드바 메뉴 "Settlement" (Master만 접근)

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ SettlementTabs ]                |
|             || - Monthly - Invoices - AR          |
|             || - OPPoints - PurchaseByHotel      |
|             ||                                   |
|             || (Monthly Tab)                     |
|             || - MonthSelect                     |
|             || - SummaryCards (Net Cost,          |
|             ||   Room Nights, Avg Net/Night)     |
|             || - DailyDetailTable                |
|             || - ExportButtons (PDF/Excel)        |
|             ||                                   |
|             || (Invoices Tab)                    |
|             || - InvoiceList                     |
|             ||   - Status (Draft/Issued/Paid)    |
|             ||   - Amount (공급가/VAT/합계)       |
|             || - PDFDownload  - EmailSend        |
|             ||                                   |
|             || (AR Tab)                          |
|             || - UnpaidList                      |
|             ||   - CancelDeadline D-day          |
|             || - PayButton  - BulkPayButton      |
|             || - SplitPayOption                  |
|             ||                                   |
|             || (OP Points Tab)                   |
|             || - EarnHistory                     |
|             || - UseHistory                      |
|             || - TransferHistory                 |
|             || - Balance                         |
|             ||                                   |
|             || (Purchase by Hotel Tab)           |
|             || - HotelPurchaseTable              |
|             || - PurchaseChart                   |
|             || - PeriodFilter                    |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| SettlementTabs | Tabs | 5개 정산 탭 전환 |
| MonthSelect | Dropdown | 정산 월 선택 |
| SummaryCards | Card Grid | Total Net Cost, Room Nights, Avg Net/Night |
| DailyDetailTable | DataTable | 일별 정산 상세 |
| InvoiceList | DataTable | 인보이스 목록 (상태, 금액) |
| UnpaidList | DataTable | 미결제 건 목록 (D-day 표시) |
| PayButton | Button | 개별 결제 |
| BulkPayButton | Button | 일괄 결제 |
| HotelPurchaseTable | DataTable | 호텔별 구매 분석 |
| PurchaseChart | Chart | 구매 비중 차트 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 탭 전환 | SettlementTabs 클릭 | 해당 탭 콘텐츠 표시 |
| 월 변경 | MonthSelect 변경 | 해당 월 데이터 로드 |
| 개별 결제 | PayButton 클릭 | 결제 처리 → 상태 변경 |
| 일괄 결제 | BulkPayButton 클릭 | 선택 건 일괄 결제 |
| 인보이스 PDF | PDFDownload 클릭 | PDF 다운로드 |

---

### Screen: Notifications

**Purpose**: 알림 센터

**Entry Points**: 사이드바 메뉴, TopBar NotificationBell

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ SummaryCards ]                  |
|             || - Critical - Unread               |
|             || - Deadlines - Payments            |
|             ||                                   |
|             || [ NotificationTabs ]              |
|             || - All - Unread - Deadlines        |
|             || - Payment - CheckIn - Bookings    |
|             || - Cancelled - System              |
|             ||                                   |
|             || [ MarkAllReadButton ]             |
|             ||                                   |
|             || [ NotificationList ]              |
|             || - NotificationItem (반복)          |
|             ||   - PriorityBadge                 |
|             ||   - Icon  - Title  - Desc         |
|             ||   - Time  - ReadStatus            |
|             ||                                   |
|             || [ NotificationSettings ]          |
|             || - SettingsToggle (반복)            |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| SummaryCards | Card Grid | Critical/Unread/Deadlines/Payments 건수 |
| NotificationTabs | Tabs | 8개 카테고리 필터 |
| MarkAllReadButton | Button | 전체 읽음 처리 |
| NotificationItem | ListItem | 우선순위 배지, 제목, 설명, 시간, 읽음 상태 |
| PriorityBadge | Badge | Critical(빨강)/High(노랑)/Medium(초록)/Low(회색) |
| NotificationSettings | Form | 알림 수신 토글 목록 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 알림 클릭 | NotificationItem 클릭 | 관련 페이지 이동 + 읽음 처리 |
| 전체 읽음 | MarkAllReadButton 클릭 | 모든 알림 읽음 처리 |
| 탭 전환 | NotificationTabs 클릭 | 카테고리별 필터링 |
| 설정 변경 | SettingsToggle 변경 | 알림 수신 설정 즉시 반영 |

---

### Screen: FAQ Board

**Purpose**: 자주 묻는 질문 조회

**Entry Points**: 사이드바 메뉴 "FAQ Board"

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ SearchBar ]                     |
|             || - SearchInput                     |
|             ||                                   |
|             || [ CategoryTabs ]                  |
|             || - All - Booking - Payment          |
|             || - Cancellation - Account           |
|             || - Technical                        |
|             ||                                   |
|             || [ FAQList ]                       |
|             || - FAQItem (반복, 아코디언)          |
|             ||   - QuestionTitle                 |
|             ||   - AnswerContent (펼침)           |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| SearchInput | Input | 키워드 검색 (제목+내용) |
| CategoryTabs | Tabs | 6개 카테고리 필터 |
| FAQItem | Accordion | 질문 클릭 시 답변 펼침/접기 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 검색 | SearchInput 입력 | 실시간 검색 결과 필터링 |
| 카테고리 전환 | CategoryTabs 클릭 | 해당 카테고리 FAQ만 표시 |
| FAQ 펼침 | QuestionTitle 클릭 | 답변 아코디언 토글 |

---

### Screen: My Account

**Purpose**: 사용자/업체 정보 관리

**Entry Points**: 사이드바 메뉴 "My Account", TopBar Profile

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ PersonalInfo ]                  |
|             || - NameInput  - EmailDisplay        |
|             || - PhoneInput  - PasswordChange    |
|             ||                                   |
|             || [ CompanyInfo ]                   |
|             || - CompanyName  - BusinessType     |
|             || - ContractDate                    |
|             ||                                   |
|             || [ PaymentInfo ]                   |
|             || (선불업체)                         |
|             || - CardList                        |
|             || - DefaultCardSetting              |
|             || - AddCardButton                   |
|             || (후불업체)                         |
|             || - DepositBalance                  |
|             || - CreditLineLimit                 |
|             ||                                   |
|             || [ OPManagement ] (Master 전용)    |
|             || - OPTable                         |
|             ||   - Name - Email - Status - Share |
|             || - AddOPButton                     |
|             || - EditOPButton  - DeactivateBtn   |
|             ||                                   |
|             || [ SaveButton ]                    |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| PersonalInfo | Form | 이름, 연락처, 비밀번호 변경 |
| CompanyInfo | Display | 업체 정보 (읽기전용) |
| CardList | List | 등록 법인카드 목록 (선불업체) |
| DepositBalance | Display | Floating Deposit 잔액 (후불업체) |
| CreditLineLimit | Display | Credit Line 한도 (후불업체) |
| OPTable | DataTable | OP 목록 (Master 전용) |
| AddOPButton | Button | OP 계정 추가 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 정보 저장 | SaveButton 클릭 | 변경사항 즉시 반영 |
| 카드 추가 | AddCardButton 클릭 | 카드 등록 모달 |
| OP 추가 | AddOPButton 클릭 | OP 생성 모달 |
| OP 비활성화 | DeactivateBtn 클릭 | OP 계정 비활성화 확인 |

---

### Screen: Rewards Mall

**Purpose**: OP Points로 상품 교환

**Entry Points**: 사이드바 메뉴 "Rewards Mall", Dashboard OP Points Widget 링크

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ PointsBalance ]                 |
|             || - CurrentPoints  - UsedThisMonth  |
|             ||                                   |
|             || [ CategoryTabs ]                  |
|             || - All - GiftCards - Travel         |
|             || - Electronics - Lifestyle          |
|             || - Dining - Entertainment           |
|             ||                                   |
|             || [ ProductGrid ]                   |
|             || - ProductCard (반복)               |
|             ||   - ProductImage                  |
|             ||   - ProductName                   |
|             ||   - PointsCost                    |
|             ||   - RedeemButton                  |
|             ||                                   |
|             || [ PointsHistory ]                 |
|             || - HistoryTable                    |
|             || - PeriodFilter                    |
|             ||                                   |
|             || [ PointsTransfer ]                |
|             || - TargetOPSelect                  |
|             || - AmountInput                     |
|             || - ReasonInput                     |
|             || - TransferButton                  |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| PointsBalance | Card | 현재 잔액, 이번 달 사용량 |
| CategoryTabs | Tabs | 7개 상품 카테고리 |
| ProductCard | Card | 상품 이미지, 이름, 포인트 가격, 교환 버튼 |
| RedeemButton | Button | 상품 교환 (잔액 확인) |
| HistoryTable | DataTable | 적립/사용/이전 내역 |
| TargetOPSelect | Select | 같은 업체 내 OP 선택 |
| TransferButton | Button | 포인트 이전 실행 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 상품 교환 | RedeemButton 클릭 | 잔액 확인 → 교환 확인 모달 → 잔액 차감 |
| 카테고리 전환 | CategoryTabs 클릭 | 해당 카테고리 상품만 표시 |
| 포인트 이전 | TransferButton 클릭 | 확인 모달 → 이전 실행 |

---

### Screen: AI Assistant (플로팅 위젯)

**Purpose**: AI 기반 호텔 추천, 예약 분석, 지역 가이드 (모든 화면에서 접근)

**Entry Points**: 화면 우하단 플로팅 버튼 클릭

**Layout**:
```
+----------------------------------+
| [ ChatHeader ]                   |
| - Title (AI Assistant)           |
| - MinimizeButton - CloseButton   |
+----------------------------------+
| [ QuickActions ]                 |
| - HotelRecommendBtn             |
| - BookingAnalysisBtn             |
| - AreaGuideBtn                   |
| - HelpBtn                        |
+----------------------------------+
| [ ChatMessages ]                 |
| - UserMessage (반복)             |
| - AIMessage (반복)               |
|   - TextResponse                 |
|   - HotelCard (클릭 가능)        |
|   - AnalysisChart                |
+----------------------------------+
| [ ChatInput ]                    |
| - MessageInput   - SendButton    |
+----------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| FloatingButton | FAB | 화면 우하단 고정, 클릭 시 위젯 열기 |
| ChatHeader | Header | 제목, 최소화/닫기 버튼 |
| QuickActions | ButtonGroup | 4개 빠른 실행 버튼 |
| ChatMessages | ScrollArea | 메시지 히스토리 |
| HotelCard | Card | 클릭 가능한 호텔 카드 (이름, 평점, 가격) |
| MessageInput | Input | 자연어 입력 |
| SendButton | Button | 메시지 전송 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 위젯 열기 | FloatingButton 클릭 | AI 채팅 위젯 표시 |
| Quick Action | QuickAction 버튼 클릭 | 해당 프롬프트 자동 입력 + 전송 |
| 메시지 전송 | SendButton 클릭 | Claude API 호출 → AI 응답 표시 |
| 호텔 카드 클릭 | HotelCard 클릭 | Hotel Detail 페이지 이동 |
| 최소화 | MinimizeButton 클릭 | FloatingButton으로 축소 |

---

## 5. Error Handling

| Error Code | Condition | User Message | Resolution |
|------------|-----------|--------------|------------|
| ERR-AUTH-001 | 잘못된 이메일/비밀번호 | "이메일 또는 비밀번호가 올바르지 않습니다" | 재입력 유도 |
| ERR-AUTH-002 | Pending 상태 계정 로그인 | "계정 승인 대기 중입니다. 관리자에게 문의하세요" | 내부 승인 프로세스 안내 |
| ERR-AUTH-003 | 비활성화된 계정 로그인 | "비활성화된 계정입니다. 관리자에게 문의하세요" | Master에게 연락 |
| ERR-AUTH-004 | 세션 타임아웃 (30분) | "세션이 만료되었습니다. 다시 로그인해 주세요" | Login 화면 리다이렉트 |
| ERR-SEARCH-001 | 검색 결과 없음 | "조건에 맞는 호텔이 없습니다. 검색 조건을 변경해 보세요" | 필터 조건 완화 안내 |
| ERR-SEARCH-002 | 필수 검색 조건 미입력 | "목적지와 날짜를 입력해 주세요" | 필수 필드 하이라이트 |
| ERR-BOOK-001 | 필수 게스트 정보 미입력 | "필수 항목을 모두 입력해 주세요" | 미입력 필드 하이라이트 |
| ERR-BOOK-002 | 객실 가용성 없음 | "선택한 객실이 더 이상 이용 가능하지 않습니다" | 다른 객실 선택 유도 |
| ERR-BOOK-003 | Non-Refundable 예약 취소 시도 | "Non-Refundable 예약입니다. 취소 시 100% 수수료가 부과됩니다. 그래도 취소하시겠습니까?" | 경고 모달 표시 → 확인 시 취소 진행, 취소 시 복귀 |
| ERR-PAY-001 | 법인카드 결제 실패 | "결제에 실패했습니다. 카드 정보를 확인해 주세요" | 다른 카드 선택 또는 재시도 |
| ERR-PAY-002 | Floating Deposit 잔액 부족 | "잔액이 부족합니다. 현재 잔액: ${amount}" | Credit Line 사용 또는 입금 안내 |
| ERR-PAY-003 | Credit Line 한도 초과 | "신용한도를 초과했습니다. 한도: ${limit}" | 한도 증액 요청 안내 |
| ERR-PAY-004 | Low Deposit 경고 | "보증금 잔액이 $5,000 미만입니다" | 입금 안내 (Critical 알림) |
| ERR-AI-001 | Claude API 연결 실패 | "AI 서비스에 일시적으로 연결할 수 없습니다" | Local Fallback 모드 전환 |
| ERR-AI-002 | API 응답 타임아웃 (5초) | "응답 시간이 초과되었습니다. 다시 시도해 주세요" | 재시도 버튼 |
| ERR-REG-001 | 중복 이메일 | "이미 등록된 이메일입니다" | 로그인 또는 다른 이메일 사용 |
| ERR-REG-002 | 비밀번호 강도 미달 | "비밀번호는 8자 이상, 영문+숫자+특수문자를 포함해야 합니다" | 비밀번호 재입력 |
| ERR-PTS-001 | 포인트 잔액 부족 | "포인트가 부족합니다. 현재 잔액: ${points}P" | 잔액 확인 |
| ERR-PTS-002 | 같은 업체 외 OP에게 이전 시도 | "같은 업체 내 OP에게만 이전 가능합니다" | 대상 재선택 |
| ERR-PAY-005 | Deposit + Credit Line 모두 부족 | "잔액과 신용한도가 모두 부족합니다" | 입금 또는 한도 증액 요청 |
| ERR-AUTH-005 | 계정 잠금 (5회 연속 로그인 실패) | "계정이 잠겼습니다. 30분 후 다시 시도하거나 관리자에게 문의하세요" | 30분 대기 또는 Master 수동 해제 |
| ERR-AUTH-006 | 비밀번호 재설정 - 미등록 이메일 | "입력하신 이메일로 재설정 안내를 발송했습니다" | 보안상 등록 여부 미공개, 동일 메시지 |
| ERR-STORAGE-001 | LocalStorage 쓰기 실패 (5MB 초과) | "저장 공간이 부족합니다. 오래된 데이터를 정리해 주세요" | 오래된 캐시 데이터 자동 정리 시도 |
| ERR-DOC-001 | 이메일 발송 실패 (Mock) | "이메일 발송에 실패했습니다. 다시 시도해 주세요" | 재시도 |
| ERR-SEARCH-003 | 과거 날짜 체크인 선택 | "체크인 날짜는 오늘 이후여야 합니다" | 날짜 재선택 |
| ERR-SEARCH-004 | 체크아웃이 체크인보다 빠름 | "체크아웃 날짜는 체크인 이후여야 합니다" | 날짜 재선택 |
| ERR-GENERAL-001 | 네트워크 오류 | "네트워크 연결을 확인해 주세요" | 연결 확인 후 재시도 |



ewpage


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
