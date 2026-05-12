# DOTBIZ 결제 비즈니스 룰 + PREPAY→POSTPAY 전환 전략

**작성일**: 2026-05-08
**대상**: 대표이사, CFO, 개발팀
**상태**: 결재 완료, 코드 반영 완료 (`239d652` + 후속 커밋)

---

## 1️⃣ 결제 수단별 확정 시점 분석

| 결제수단 | 확정 속도 | Non-refundable 가능? | 적용 가능 케이스 |
|---------|---------|-------------------|---------------|
| 신용카드 (PG) | **즉시** | ✅ | 모든 PREPAY |
| Alipay / WeChat / QR | **즉시** | ✅ | 모든 PREPAY |
| PayNow / FPS / DuitNow | **즉시** | ✅ | 모든 PREPAY |
| **가상계좌** | ⚠️ 입금 대기 | ❌ | **Free Cancel만** |
| **무통장 입금** | ❌ 1~2영업일 | ❌ | **Free Cancel만** |
| **SWIFT Wire** | ❌ 1~3영업일 | ❌ | **Free Cancel만** |

**원칙**: Non-refundable 예약은 결제가 즉시 확정되어야 호텔 allotment 보장 가능 → 실시간 결제수단만 허용.

---

## 2️⃣ 정산 모델 × 예약 정책 매트릭스

| 고객 정산 | 예약 정책 | 결제 시점 | 결제수단 UI | 허용 결제수단 |
|---------|---------|---------|----------|------------|
| **POSTPAY** | Free Cancel | 정산 주기 일괄 | **숨김** | 디포짓 기반 (선택 불필요) |
| **POSTPAY** | Non-refundable | 정산 주기 일괄 | **숨김** | 동일 |
| **PREPAY** | Free Cancel (TL 전) | TL까지 결제 | **전체 표시** | 카드 / QR / 가상계좌 / 송금 모두 가능 |
| **PREPAY** | Non-refundable | **즉시 결제** | **표시 + 일부 disabled** | **카드 / QR만** |
| **PREPAY** | TL 경과 | 즉시 결제 | **표시 + 일부 disabled** | 동일 |

### UI 동작
- **POSTPAY 고객**: "정산 주기 일괄 결제" 안내 카드 표시, 결제수단 선택 미노출
- **PREPAY + Free Cancel**: 권역별 모든 결제수단 활성
- **PREPAY + Non-refundable**: 권역별 결제수단 표시하되 가상계좌·송금·SWIFT는 **disabled + "환불 불가 예약 시 사용 불가" 안내**

---

## 3️⃣ 비즈니스 모델 — PREPAY → POSTPAY 전환 전략

### 핵심 통찰

> PREPAY는 **진입 단계** / POSTPAY는 **성장 단계**
> 거래량 증가 시 자연스럽게 POSTPAY 전환 유도가 BM 핵심

### 단계별 진화 경로 (Migration Path)

```
┌─────────────────────────────────────────────────────────────┐
│  Stage 0: PREPAY (진입)                                      │
│  • 신규 / 신뢰 미형성                                          │
│  • 매 예약 결제                                                │
│  • 거래 규모 한계 (자금 부담)                                   │
│  • Non-refundable은 카드/QR만                                 │
└────────────────────────┬────────────────────────────────────┘
                         │ 3~6개월, TTV 1억원+
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  Stage 1: POSTPAY + Floating Deposit                         │
│  • 신용 기반 전환                                              │
│  • 매번 결제 부담 X                                            │
│  • 거래량 ↑ + 운영 효율 ↑                                      │
│  • Non-refundable 자유롭게 가능                                │
└────────────────────────┬────────────────────────────────────┘
                         │ 12개월, TTV 10억원+
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  Stage 2: POSTPAY + Bank Guarantee                           │
│  • 대형사 신뢰 단계                                            │
│  • 자금 효율 ↑ (디포짓 → 보증서)                                │
└────────────────────────┬────────────────────────────────────┘
                         │ 24개월, 60일+ Overdue 0건, TTV 12개월 10억+
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  Stage 3: No Deposit (대표이사 승인)                          │
│  • 최상위 신뢰 (정량 3 + 정성 2)                                │
│  • 12개월마다 재평가                                            │
└─────────────────────────────────────────────────────────────┘
```

### 자동 전환 트리거 (시스템 알림)

| 트리거 | 조건 | 액션 |
|--------|------|------|
| PREPAY 운영 6개월+ 월 평균 5건+ | 신뢰 형성 | "POSTPAY 전환 제안" 이메일 자동 |
| 12개월 운영 + TTV 1억원+ | 신용 등급 형성 | Master에게 디포짓 제안 알림 |
| Free Cancel 비율 90%+ + Overdue 0건 | 결제 행동 양호 | 자동 평가 점수 +20점 |
| Master 신청 + 디포짓 등록 | 전환 요청 | EllisOP 검토 워크플로우 |

### POSTPAY 전환 평가 알고리즘 (제안)

```typescript
function evaluatePostpayEligibility(opStats: {
  monthsActive: number;
  monthlyBookings: number;
  totalTtvKrw: number;
  freeCancelRate: number;
  overdueCount: number;
}): { eligible: boolean; score: number; reason: string } {
  let score = 0;
  if (opStats.monthsActive >= 6) score += 20;
  if (opStats.monthsActive >= 12) score += 20;
  if (opStats.monthlyBookings >= 5) score += 20;
  if (opStats.totalTtvKrw >= 100_000_000) score += 15;
  if (opStats.freeCancelRate >= 0.9) score += 15;
  if (opStats.overdueCount === 0) score += 10;
  return {
    eligible: score >= 60,
    score,
    reason: score >= 60 ? "POSTPAY 전환 가능" : `${60 - score}점 부족`,
  };
}
```

---

## 4️⃣ 코드 구현 (2026-05-08 적용 완료)

### 변경 파일

1. **mocks/settlement.ts**
   - `PaymentMethodCategory`, `PaymentRegion` 유니언 신설
   - `PaymentMethodOption` 인터페이스 + 17종 카탈로그
   - `calcPaymentFee()`, `paymentMethodsForRegion()` 헬퍼

2. **pages/BookingFormPage.tsx**
   - `regionFromCountry()` 회사 국가 → 권역 자동 매핑
   - `INSTANT_PAYMENT_CATEGORIES`: card_local / card_global / qr_payment
   - `PaymentMethodSelector` 컴포넌트 (`requireInstantPayment` prop)
   - `PaymentMethodCard` 컴포넌트 (`disabled` 지원)
   - POSTPAY 고객은 안내 카드 표시, PREPAY는 셀렉터 표시
   - Non-refundable + PREPAY 시 delayed 수단 disabled + 경고 배너

3. **pages/BookingCompletePage.tsx**
   - Invoice 라인 분리: Hotel Charge / Payment Processing Fee / Total
   - 결제 수수료 별도 청구 안내

4. **pages/SettlementDetailPage.tsx**
   - Invoice Lines Breakdown 카드 신규
   - Line 1: Hotel Charge (97%) / Line 2: Payment Fee (3%) / Invoice Total

5. **mocks/rewards.ts** — POLICY_CHANGELOG 3건 추가
   - 결제 수단 × 정산 × 예약 정책 매트릭스
   - PREPAY→POSTPAY 전환 전략

---

## 5️⃣ 다음 개발 단계 (Phase 2)

### POSTPAY 전환 시스템 (별도 트랙)

1. **Master Account 페이지**: "POSTPAY 전환 제안" 위젯
   - 자동 평가 점수 시각화 (0~100점)
   - 부족 항목 안내 (예: "거래 6개월 더 필요")
   - 디포짓 등록 신청 버튼

2. **신규 라우트**: `/app/client/billing-upgrade`
   - 전환 신청 양식
   - 디포짓 종류 선택 (Floating / Bank Guarantee 등)
   - 첨부 서류 업로드 영역

3. **EllisOP 검토 워크플로우**
   - 티켓 시스템 통합 ("Billing Type Upgrade Request")
   - 자동 평가 결과 + Master 추천 사유 전달
   - EllisOP 결재 → 대표이사 보고 (No Deposit만)

4. **이메일 자동화** (CRM 트리거)
   - 6개월 도달 시 "POSTPAY 전환 안내"
   - TTV 1억 도달 시 "디포짓 등록 제안"
   - 12개월 + 신용 양호 시 "Bank Guarantee 전환 안내"

5. **자동 평가 알고리즘 코드화**
   - `mocks/clientManagement.ts`에 `evaluatePostpayEligibility()` 추가
   - 점수 시각화 게이지 UI

---

## 6️⃣ 결재 요청 사항

1. **결제 수단 매트릭스 확정** ✅ (이번 결재 완료, 코드 반영됨)
2. **PREPAY→POSTPAY 전환 단계 정의** ✅ (4단계 + 트리거)
3. **자동 전환 평가 알고리즘** 검토 (제안 점수 체계)
4. **CRM 자동 이메일 발송 워크플로우** 정의
5. **POSTPAY 전환 신청 UI 개발 우선순위** (Phase 2 착수)

---

**문서 위치**: `docs/Payment_Business_Rules_2026-05-08.md`
**관련 문서**:
- `Payment_Strategy_v3_2026-05-08.md` (v3.1, 100% 고객 부담)
- `Market_Research_PG_Models_2026-05-08.md` (15개 공급사 + 비-PG)
- `Settlement_CEO_Critical_Update_2026-05-08.md` (마진 4% 재검토)
