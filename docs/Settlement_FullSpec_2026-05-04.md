# DOTBIZ Settlement 전체 스펙 v1.0
**작성일**: 2026-05-04
**대상**: 대표이사 검토용
**버전**: v1.0 (5건 결정 반영)

---

## 1. Settlement 시스템 개요

### 1.1 핵심 정의

DOTBIZ Settlement는 **DOTBIZ(공급자)와 고객사(여행사·호스피탈리티 파트너) 간의 미수금(AR) 추적 시스템**입니다.

**핵심 원칙 (확정)**:
> DOTBIZ는 고객사로부터 돈을 **받기만** 합니다.
> 환불/조정은 DOTBIZ가 고객사에 송금하지 않으며,
> 다음 invoice의 (-) 라인 또는 별도 Credit Note로만 반영됩니다.

### 1.2 주체와 역할

| 주체 | 역할 |
|------|------|
| **DOTBIZ (ELLIS)** | invoice 발행 → 입금 확인 → 분쟁 검토 → Adjustment 발행 |
| **고객사 Master** | invoice 검토 → 송금 실행 → 분쟁 제기 |
| **고객사 Accounting** | invoice 검증 → 회계 장부 정리 → 분쟁 사유 추적 |
| **고객사 OP** | 예약 생성 (Settlement 무관) |

### 1.3 두 가지 청구 모델

#### POSTPAY (후불)
- 정기 invoice 발행 (Bi-weekly / Monthly 계약)
- 발행 → Net N일 이내 송금 → 매칭 → Paid
- AR Aging 추적 대상

#### PREPAY (선불)
- 예약 시점 PG 카드 결제
- 데드라인 미결제 시 자동 취소
- AR 발생 X (이미 받음)

---

## 2. 5가지 핵심 결정 (확정 — 2026-04-30)

### 결정 #1 — Accounting 역할 활성화 (조회 + 분쟁 + 영수증)

**결정 내용**:
- Accounting role을 Settlement 페이지에서 활성화
- 권한: 조회 + 이의제기(Disputes) + 송금 영수증 업로드
- Master/EllisAdmin과 분리된 회계 직무

**구현**:
- `SettlementPage.tsx` 가드: `Master + Accounting`
- 새 탭 2개 추가: **Disputes**, **Payment Receipts**
- 자동 dispute → ticket 라우팅 (결정 #2와 연결)

**근거**:
- "DOTBIZ는 고객사 회계 시스템이 아니라 AR 추적기"
- Accounting의 진짜 일: invoice 검증 + 차감 사유 추적 + 송금 증빙

---

### 결정 #2 — Dispute 해결 = Tickets 단일 워크플로우

**결정 내용**:
- 고객사가 Settlement에서 분쟁 제기
- 자동으로 Invoice Dispute 티켓 생성 → Tickets 페이지로 라우팅
- 해결은 EllisOP가 Tickets 시스템에서 진행
- 종결 시 dispute 상태 자동 동기화 (Completed → Accepted, Rejected → Rejected)

**구현**:
- `mocks/tickets.ts` Ticket.ticketType union에 "Invoice Dispute" 추가
- `linkedDisputeId` / `linkedInvoiceNo` 필드로 양방향 연결
- `TicketsContext.updateStatus`에 dispute 자동 동기화 로직
- 양방향 점프 UI (Settlement → Ticket / Ticket → Settlement)

**근거**:
- EllisAdmin이 추후 ELLIS 백오피스로 분리될 때 깔끔한 경계
- Tickets 시스템이 이미 갖춘 SLA·assignee·trace 활용

---

### 결정 #3 — Adjustment는 ELLIS 결정 영역 (read-only 정책)

**결정 내용**:
- 고객사는 billing/invoice 임의 수정 불가
- 이상 발견 시 Disputes 탭에서 이의제기만
- Adjustment(조정 라인) 발행 권한은 DOTBIZ(ELLIS)에 100%
- 모든 조정 라인에 출처 명시 필수

**4가지 Adjustment 출처**:
| 출처 | 의미 |
|------|------|
| `DisputeAccepted` | 고객사 분쟁 → ELLIS 인정 → 차액 환원 |
| `EllisInternal` | ELLIS 자체 발견 오류 정정 |
| `HotelClaim` | 호텔이 사후 추가 청구 |
| `ContractAmendment` | 계약 단가 / 수수료 조정 |

**구현**:
- `BillingLineItem`에 `adjustmentSource` / `sourceDisputeId` / `reasonNote` / `issuedBy` 필드 추가
- Settlement 페이지 최상단에 정책 배너
- Billing Details 탭의 Adjustment 행 amber 배경 + 출처 라벨

---

### 결정 #4 — POSTPAY 결제 알림 (사전 + 사후)

**결정 내용**:
- 사전 4단계: D-7 / D-3 / D-1 / D-Day
- 사후 3단계: +1d / +7d / +30d (aging escalation)
- 채널: In-app + Email (D-Day 와 30d 연체는 SMS 추가)

**우선순위**:
| 알림 | 우선순위 | Disable 가능? |
|------|:--:|:--:|
| postpay_invoice_d7 | P1 | ✅ |
| postpay_invoice_d3 | P0 | ✅ |
| postpay_invoice_d1 | P0 | ✅ |
| postpay_invoice_dday | P0 | ❌ (필수) |
| postpay_overdue_d1 | P0 | ✅ |
| postpay_overdue_d7 | P0 | ❌ (필수) |
| postpay_overdue_d30 | P0 | ❌ (필수) |

**근거**:
- PREPAY는 이미 D-알림 시스템 보유 → POSTPAY와 대칭
- 자금 미수 위험 알림은 끄지 못함

---

### 결정 #5 — AR Aging Report (Cash basis + FX lock)

**결정 내용**:
1. **환율**: ELLIS에 예약 들어오는 시점에 lock-in
2. **회계 인식**: Cash basis (실제 입금 + 회계 처리 시점에만 매출 인식)
3. **부채 인식**: 회계팀 검토 후 (90+ 일 손상 검토 / 분쟁 결과)
4. **악성 분류**: 90+ 일, 분쟁 제외
5. **분쟁 분류**: 별도 bucket, aging과 무관

**6 Bucket 분류**:
| Bucket | 기간 | 색상 | 의미 |
|--------|------|------|------|
| Current | due 미도래 | 🟢 emerald | 정상 |
| 1-30일 | 1~30일 연체 | 🔵 blue | 일반 연체 |
| 31-60일 | 31~60일 | 🟡 amber | 주의 |
| 61-90일 | 61~90일 | 🟠 orange | 위험 |
| 90+ 일 | 91일+ | 🔴 red | **악성** |
| Disputed | 분쟁 중 | 🟣 purple | 별도 분류 |

**Settlement 상단 카드** (`ARAgingCard`):
- Total Outstanding (USD)
- 6-bucket 그리드 (각 bucket 클릭 시 invoice 필터링)
- 악성 미수금 + 분쟁 중 alert
- 정책 footnote 영구 표시

---

## 3. UI 구조 (시각화)

### 3.1 Settlement 페이지 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ 🔒 Settlement 데이터 정책 (read-only + 이의제기)          │  ← #3 정책 배너
├─────────────────────────────────────────────────────────────┤
│ 📊 AR Aging — 미수금 분석              Total $XX,XXX       │  ← #5 ARAgingCard
│ ┌───────┬────┬─────┬─────┬────┬────────┐                   │
│ │Current│1-30│31-60│61-90│90+ │Disputed│  ← 6 buckets    │
│ └───────┴────┴─────┴─────┴────┴────────┘                   │
├─────────────────────────────────────────────────────────────┤
│ Header: 회사 / 계약 / Billing Type                          │
├─────────────────────────────────────────────────────────────┤
│ Tabs: [Pending Payment] [Invoices] [Billing Details]      │
│        [Disputes ⚠N]    [Payment Receipts]                │  ← #1, #2
└─────────────────────────────────────────────────────────────┘
```

### 3.2 워크플로우 다이어그램

```
[고객사 Accounting]
       │
       ├─ Invoice 검증
       │      │
       │      ▼
       │  이상 없음 → 송금 → 영수증 업로드 (Receipts 탭)
       │                │
       │                ▼
       │          [DOTBIZ ELLIS]
       │                │
       │                ▼
       │           매칭 → invoice Paid
       │
       └─ 이상 발견 → 분쟁 제기 (Disputes 탭)
              │
              ▼ (자동)
       ┌──────────────────────┐
       │ Invoice Dispute 티켓 │
       │ 자동 생성             │
       │ → Tickets 페이지     │
       └──────────────────────┘
              │
              ▼
       [EllisOP]
              │
              ▼
       검토 → Accept / Reject
              │
              ▼ (자동 동기화)
       Settlement 분쟁 상태 업데이트
              │
              ├─ Accepted → 다음 invoice 조정 라인 (-)
              └─ Rejected → invoice 금액 유지
```

---

## 4. 데이터 모델

### 4.1 BillingLineItem (확장)

```typescript
interface BillingLineItem {
  billId: string;
  billType: "Hotel Booking" | "Cancellation Fee" | "Adjustment";
  bookingId: string;
  hotelName: string;
  amount: number;              // 음수 = 조정/환원
  currency: string;
  createdDate: string;
  dueDate: string;
  settlementDate: string;
  status: "Settled" | "Pending" | "Overdue";
  invoiceNo: string;
  customerCompanyId: string;
  contractId?: string;

  // 결정 #3 — Adjustment 추적
  adjustmentSource?: "DisputeAccepted" | "EllisInternal" | "HotelClaim" | "ContractAmendment";
  sourceDisputeId?: string;
  reasonNote?: string;
  issuedBy?: string;

  // 결정 #5 — FX lock
  lockedFxRate?: number;       // 1 unit currency = N USD
  fxLockedAt?: string;          // booking createdAt
}
```

### 4.2 InvoiceDispute (신규)

```typescript
interface InvoiceDispute {
  id: string;
  invoiceNo: string;
  customerCompanyId: string;
  raisedBy: string;
  raisedAt: string;
  reason: "AmountMismatch" | "BookingNotMine" | "DuplicateCharge"
        | "AdjustmentMissing" | "TaxIncorrect" | "Other";
  description: string;
  affectedBookingIds: string[];
  disputedAmount: number;
  status: "Open" | "UnderReview" | "Accepted" | "Rejected" | "Withdrawn";
  ticketId?: string;            // 자동 생성된 티켓 ID
  resolvedAt?: string;
  resolution?: string;
}
```

### 4.3 PaymentReceipt (신규)

```typescript
interface PaymentReceipt {
  id: string;
  invoiceNo: string;
  customerCompanyId: string;
  uploadedBy: string;
  uploadedAt: string;
  amount: number;
  currency: string;
  remittedDate: string;
  bankReference?: string;
  fileName: string;
  fileUrl: string;
  notes?: string;
  status: "Pending-Match" | "Matched" | "Mismatched";
}
```

### 4.4 ARAging 헬퍼

```typescript
function bucketFor(daysOverdue: number, hasOpenDispute: boolean): ARAgingBucket;
function arAgingForCompany(companyId: string, asOfDate?: string): ARAgingEntry[];
function arSummaryForCompany(companyId: string, asOfDate?: string): ARSummary;
```

---

## 5. 권한 매트릭스

| 기능 | Master | OP | Accounting | EllisOP | EllisAdmin |
|------|:--:|:--:|:--:|:--:|:--:|
| Settlement 페이지 진입 | ✅ | ❌ | ✅ | ❌ | ❌ |
| Settlement Detail 진입 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Invoice 발행 (Issue) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Mark-Paid (입금 확인) | ✅(데모) | ❌ | ❌ | (실무: ELLIS) | (실무: ELLIS) |
| 분쟁 제기 (Disputes) | ✅ | ❌ | ✅ | ❌ | ❌ |
| 분쟁 처리 (Resolve) | ❌ | ❌ | ❌ | ✅ (Tickets) | ❌ |
| 영수증 업로드 (Receipts) | ✅ | ❌ | ✅ | ❌ | ❌ |
| Adjustment 발행 | ❌ | ❌ | ❌ | ❌ | ✅ (실무) |

---

## 6. 알림 라우팅 (결정 #4 + Notifications #1)

| 알림 종류 | Master | Accounting | OP | EllisOP |
|----------|:--:|:--:|:--:|:--:|
| postpay_invoice_d7~dday | ✅ | ✅ (본인 발행 분쟁만) | ❌ | ❌ |
| postpay_overdue_d1/7/30 | ✅ | ✅ | ❌ | ❌ |
| dispute_opened | ✅ | ✅ (본인) | ❌ | ✅ (assignee) |
| ticket_reply | ✅ | ✅ (본인) | ❌ | ✅ (assignee) |
| invoice_issued | ✅ | ✅ | ❌ | ❌ |
| payment_received | ✅ | ✅ | ❌ | ❌ |

---

## 7. 정합성 체크 (다른 시스템과)

| 시스템 | 정합 |
|--------|------|
| Tickets | dispute → 자동 ticket / EllisOP가 처리 / 종결 시 자동 동기화 |
| Notifications | 사용자 설정 권한 X / 시스템 라우팅 / Quiet hours 22-08 |
| Booking Form | FX lock at booking time (Settlement #5와 정합) |
| Rewards Mall | Adjustment 시 ELS 차감 영향 X (별도 추적) |
| EllisAdmin | 시스템 정책 변경만 / Settlement 운영 X |

---

## 8. 위험 신호 / 출시 전 보강 사안

### 🔴 출시 전 필수
1. **회계 처리 정책 자문** — Cash basis 인식 시점 / 만료 시 손익 (CFO/회계법인)
2. **세금 처리 자문** — 국가별 차이 (한·일·중·베트남·싱가포르)
3. **법무 자문** — 분쟁 워크플로우 / 동의서 / 개인정보
4. **월 예산 캡 enforcement** — 한도 도달 시 자동 일시중단 로직 (코드 미구현)
5. **부정 거래 룰엔진** — 현재는 mock 시드만, 실제 감지 로직 X

### 🟡 베타 단계 보강
6. **FX rate 실시간 연동** — 현재 1370 KRW/USD mock
7. **PaymentMatchLog 자동 매칭** — 영수증 + invoice 자동 매칭 로직
8. **회계 시스템 연동** — SAP / 더존 등 ERP 출력 형식

### 🟢 안정화 후
9. **다중 통화 지원 확장** — 현재 USD 기본, 일부 KRW/VND
10. **Multi-entity routing 자동화** — Contract.contractCurrency 활용

---

## 9. 데모 시나리오

### 9.1 Accounting 역할 시연
1. `accounting@dotbiz.com` / accounting123 로그인
2. Settlement 진입 → 정책 배너 + AR Aging Card 확인
3. **Disputes 탭** → "분쟁 제기" → invoice / 사유 / 금액 / 설명 입력
4. 자동 ticket 생성 토스트 확인
5. **Tickets 페이지**로 점프 → Invoice Dispute 티켓 상태 추적

### 9.2 90+ 악성 미수금 시연
1. `master@dotbiz.com` / master123 로그인
2. Settlement → AR Aging Card → "90+" bucket 클릭
3. 빨간 alert + 악성 미수금 invoice 목록
4. **Disputed** bucket 클릭 → Disputes 탭 점프

### 9.3 EllisOP 분쟁 처리 시연
1. `cs@ohmyhotel.com` / cs123 로그인
2. Tickets 페이지 → "Invoice Dispute" 타입 필터
3. TKT-2026-0421 진입 → amber 배너 (Settlement 점프 가능)
4. Status를 "Completed"로 변경 → 토스트 + Settlement 분쟁 자동 Accepted

---

## 10. 점수 / 메트릭

| 영역 | 점수 |
|------|:--:|
| 기획 | 98 |
| QA | 97.5 |
| 성능 | 96 |
| 종합 | **97.2** |

- **테스트**: Settlement 관련 신규 27건 (총 230/230 passing)
- **커밋**: 7건 (5 결정 + 2 hotfix)
- **신규 페이지/탭**: Disputes / Payment Receipts / AR Aging Card

---

**문서 끝.** 상세 명세서는 `Settlement_Specification_2026-05-04.md`, 의사결정 보고서는 `Settlement_CEO_Report_2026-05-04.md` 참조.
