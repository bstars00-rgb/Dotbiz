# 다음 세션 작업 목록

> **저장일**: 2026-04-17

## 작업 예정 항목

### 1. 전체 평점 재측정
- **기획 점수** 재평가 (현재 89/100 A-)
- **QA 점수** 재평가 (현재 88/100 A-)
- 오늘 추가된 기능 반영:
  - PREPAY/POSTPAY 정산 구조
  - 바우처 A4 레이아웃 + 5개국어
  - 예약 상세 DIDA 스타일
  - CreateTicketDialog (6 카테고리 + 하위 옵션)
  - Pay Channel / Booking Source 컬럼
  - 사이드바 슬라이드 토글
  - postpay@dotbiz.com / prepay@dotbiz.com 계정
- DIDA 기능 커버리지 재계산

### 2. 티켓 시스템 재점검
- `/app/tickets` 페이지 (TicketManagementPage) 전면 검수
- CreateTicketDialog와 티켓 페이지 연동 확인
- 티켓 상세/타임라인 UI 개선
- 챗봇 연동 준비 (AI 응답 시뮬레이션)
- 티켓 상태 워크플로우 (Pending → Processing → Resolved)
- 예약별 티켓 필터링

### 3. 인보이스 프레임 설계
- 현재 SettlementPage에 Invoices 탭 존재 (검수 필요)
- 인보이스 PDF 레이아웃 (A4, DIDA 참고)
- 필요 항목:
  - 인보이스 번호, 발행일, 납부기한
  - 회사 정보 (공급자/공급받는자)
  - 예약 목록 상세 (체크인/아웃, 금액)
  - 공급가액, VAT, 총액
  - 결제 방법, 계좌 정보
  - 세금계산서 형식 (한국 기업용)
- 언어별 지원 (바우처처럼 5개국어)

## 현재 상태 요약
- **배포 URL**: https://bstars00-rgb.github.io/Dotbiz/
- **로그인**:
  - POSTPAY: postpay@dotbiz.com / postpay123
  - PREPAY: prepay@dotbiz.com / prepay123
  - Master: master@dotbiz.com / master123
  - OP: op@dotbiz.com / op123
- **총 커밋**: 48개+ (오늘만)
- **페이지**: 27개
- **컴포넌트**: 33개 (11 커스텀 + 22 UI)
- **테스트**: 31개 (모두 통과)
