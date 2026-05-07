# Admin Out of Scope (DOTBIZ 운영 범위 제외)

**확정일**: 2026-05-07
**결정자**: ellis@ohmyhotel.com

## 배경

DOTBIZ는 고객사(여행사)의 OP/Master/Accounting이 사용하는 B2B 호텔 예약 플랫폼이다.
DOTBIZ는 **자체 어드민(시스템 관리)을 운영하지 않는다**. 시스템 관리는 ELLIS 백오피스 또는
별도 경량 CMS 앱이 담당한다.

## 제외된 기능 (DOTBIZ에서 삭제)

### 1. ELS 경제 관리 (AdminEconomicsPage)
- ELS 적립률, Tier 배율, 상품 가격, Hotel Boost cap 등 정책 파라미터 튜닝
- POLICY_CHANGELOG 조회/관리
- 리스크 대시보드 (Deferred Liability, 부정 패턴)

**대체 위치**: ELLIS 백오피스의 "Rewards Economics" 모듈 (별도 DB / 별도 권한 체계)

### 2. 리뷰 모더레이션 (AdminReviewsPage)
- 리뷰 자동 모더레이션 룰 설정
- 리뷰 takedown / publish / reject 처리
- 리뷰 보상 ELS 정산

**대체 위치**: ELLIS 또는 별도 Content Management System (CMS) 앱
- 콘텐츠 정책팀(법무·CS 협업)이 운영
- DOTBIZ와는 분리된 권한·DB

### 3. 블로그/캠페인 관리 (잠재 후보)
- OhMyBlog 글 작성·수정·발행
- 캠페인 페이지 콘텐츠 편집

**대체 위치**: 동일 CMS

## DOTBIZ에 유지되는 기능

| 기능 | 사용자 | 비고 |
|------|--------|------|
| 호텔 검색·예약 | OP | 핵심 |
| 정산 (Settlement) | Master/Accounting | AR Aging, Invoice 매칭 |
| 티켓 (Customer Tickets) | OP/Master + EllisOP 처리 | 고객사가 ELLIS와 소통 |
| 리워드 몰 (Rewards Mall) | OP | ELS 사용/적립 표시 |
| 회사 관리 (Client Management) | Master | 자사 OP/계약 관리 |
| My Account | All | 개인 설정 |

## 데이터 흐름 (참고)

```
[DOTBIZ 클라이언트] ──예약 데이터──> [DOTBIZ DB]
                                      │
                                      ├──ELS 적립 트리거──> [ELLIS Rewards Economics 모듈]
                                      │                     ↑
                                      │                     │ (정책 튜닝)
                                      │                  [ELLIS Backoffice / CMS 앱]
                                      │
                                      └──리뷰 작성──> [ELLIS / CMS 모더레이션 큐]
```

## 향후 작업 (별도 트랙)

- [ ] ELLIS Rewards Economics 모듈 스펙 작성
- [ ] CMS 앱 MVP 정의 (리뷰 모더레이션 + 블로그 + 캠페인)
- [ ] DOTBIZ ↔ ELLIS API 정의 (정책 read-only fetch, 적립 이벤트 push)
- [ ] EllisAdmin 역할 DOTBIZ에서 완전 제거 (현재 isInternal flag로 흔적 남음)

## 영향받는 파일 (2026-05-07 정리)

### 삭제됨
- `src/pages/AdminEconomicsPage.tsx`
- `src/pages/AdminReviewsPage.tsx`
- `src/test/adminPages.test.tsx`

### 수정됨
- `src/pages/MainLayout.tsx` — CMS 섹션 제거
- `src/App.tsx` — admin 라우트 2개 제거

### 잔존 (참고용)
- `src/mocks/rewards.ts` — POLICY_CHANGELOG, Tier/Boost 상수 정의 (도메인 모델로 보존, ELLIS 이전 시 재사용)
- `src/mocks/reviews.ts` — Review/AutoMod 타입 (동일)
- 위 데이터는 DOTBIZ에서 read-only로만 표시, 어드민 편집 UI 없음
