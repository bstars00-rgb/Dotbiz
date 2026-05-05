# DOTBIZ Settlement 상세 명세서 v1.0
**작성일**: 2026-05-04
**대상**: 기술 검토용 (개발팀 / CFO / 회계법인)
**버전**: v1.0

---

## A. 데이터 스키마 (DB 설계 권장안)

### A.1 `billing_line_items` 테이블

```sql
CREATE TABLE billing_line_items (
  bill_id              VARCHAR(20) PRIMARY KEY,        -- "BILL-2026-0001"
  bill_type            ENUM('Hotel Booking', 'Cancellation Fee', 'Adjustment') NOT NULL,
  booking_id           VARCHAR(20) NOT NULL,           -- ELLIS code 매칭
  hotel_name           VARCHAR(200) NOT NULL,
  amount               DECIMAL(15,2) NOT NULL,         -- 음수 가능 (Adjustment)
  currency             CHAR(3) NOT NULL,               -- USD/KRW/JPY/CNY/VND/SGD
  created_date         DATE NOT NULL,
  due_date             DATE NOT NULL,
  settlement_date      DATE NULL,                      -- NULL=Pending
  status               ENUM('Settled', 'Pending', 'Overdue') NOT NULL,
  invoice_no           VARCHAR(30) NOT NULL,
  customer_company_id  VARCHAR(20) NOT NULL,
  contract_id          VARCHAR(20) NULL,

  -- 결정 #3: Adjustment 추적 (NULL이면 일반 line)
  adjustment_source    ENUM('DisputeAccepted','EllisInternal','HotelClaim','ContractAmendment') NULL,
  source_dispute_id    VARCHAR(20) NULL,               -- "disp-XXX" 매칭
  reason_note          TEXT NULL,
  issued_by            VARCHAR(120) NULL,              -- ELLIS 담당자 email

  -- 결정 #5: FX lock
  locked_fx_rate       DECIMAL(15,6) NULL,             -- 1 unit currency = N USD
  fx_locked_at         TIMESTAMP NULL,

  INDEX idx_invoice (invoice_no),
  INDEX idx_company (customer_company_id),
  INDEX idx_dispute (source_dispute_id),
  INDEX idx_status_due (status, due_date)              -- AR Aging 계산용
);
```

### A.2 `invoice_disputes` 테이블

```sql
CREATE TABLE invoice_disputes (
  id                   VARCHAR(30) PRIMARY KEY,        -- "disp-XXX"
  invoice_no           VARCHAR(30) NOT NULL,
  customer_company_id  VARCHAR(20) NOT NULL,
  raised_by            VARCHAR(120) NOT NULL,          -- 사용자 email
  raised_at            TIMESTAMP NOT NULL,
  reason               ENUM('AmountMismatch','BookingNotMine','DuplicateCharge',
                            'AdjustmentMissing','TaxIncorrect','Other') NOT NULL,
  description          TEXT NOT NULL,
  affected_booking_ids JSON NOT NULL,                  -- ["bk-001", ...]
  disputed_amount      DECIMAL(15,2) NOT NULL,
  status               ENUM('Open','UnderReview','Accepted','Rejected','Withdrawn') NOT NULL,
  ticket_id            VARCHAR(30) NULL,               -- 자동 생성된 ticket
  resolved_at          TIMESTAMP NULL,
  resolution           TEXT NULL,

  INDEX idx_invoice (invoice_no),
  INDEX idx_company (customer_company_id),
  INDEX idx_status (status),
  INDEX idx_ticket (ticket_id)
);
```

### A.3 `payment_receipts` 테이블

```sql
CREATE TABLE payment_receipts (
  id                   VARCHAR(30) PRIMARY KEY,        -- "rcp-XXX"
  invoice_no           VARCHAR(30) NOT NULL,
  customer_company_id  VARCHAR(20) NOT NULL,
  uploaded_by          VARCHAR(120) NOT NULL,
  uploaded_at          TIMESTAMP NOT NULL,
  amount               DECIMAL(15,2) NOT NULL,
  currency             CHAR(3) NOT NULL,
  remitted_date        DATE NOT NULL,
  bank_reference       VARCHAR(100) NULL,
  file_name            VARCHAR(255) NOT NULL,
  file_url             VARCHAR(500) NOT NULL,          -- S3 / CDN URL
  notes                TEXT NULL,
  status               ENUM('Pending-Match','Matched','Mismatched') NOT NULL,
  matched_at           TIMESTAMP NULL,
  matched_by           VARCHAR(120) NULL,              -- ELLIS 입금팀 email

  INDEX idx_invoice (invoice_no),
  INDEX idx_company (customer_company_id),
  INDEX idx_status (status)
);
```

### A.4 `tickets` 확장 (Invoice Dispute 타입)

```sql
ALTER TABLE tickets
  ADD COLUMN linked_dispute_id  VARCHAR(30) NULL,
  ADD COLUMN linked_invoice_no  VARCHAR(30) NULL,
  ADD INDEX idx_linked_dispute (linked_dispute_id);

-- ticket_type ENUM에 'Invoice Dispute' 추가
```

---

## B. API 엔드포인트 (REST)

### B.1 분쟁 (Disputes)

```
POST   /api/v1/disputes
  body: { invoiceNo, reason, description, affectedBookingIds, disputedAmount }
  auth: Master | Accounting (본인 회사 invoice만)
  → response: { dispute, ticket } (양방향 자동 생성)

GET    /api/v1/disputes?company={id}&status={...}
  auth: Master | Accounting (본인 회사 only) | EllisOP | EllisAdmin (전체)

GET    /api/v1/disputes/{id}
  auth: 위와 동일 + 작성자 본인

POST   /api/v1/disputes/{id}/resolve  (EllisOP 전용)
  body: { decision: 'Accepted' | 'Rejected', resolution }
  → response: dispute (status 업데이트, ticket 자동 close)

POST   /api/v1/disputes/{id}/withdraw  (Master | Accounting)
  → response: dispute (status: Withdrawn)
```

### B.2 영수증 (Payment Receipts)

```
POST   /api/v1/receipts
  body: multipart/form-data { invoiceNo, amount, currency, remittedDate,
         bankReference, file (PDF/JPG, max 10MB), notes }
  auth: Master | Accounting (본인 회사 only)
  → response: receipt (status: Pending-Match)

GET    /api/v1/receipts?company={id}
  auth: Master | Accounting (본인) | EllisAdmin

POST   /api/v1/receipts/{id}/match  (ELLIS 입금팀 only)
  body: { matched: boolean, note }
  → response: receipt (status: Matched / Mismatched)
                      → 매칭 시 invoice.matchStatus 자동 업데이트
```

### B.3 AR Aging

```
GET    /api/v1/ar-aging/{companyId}?asOf={date}
  auth: Master | Accounting (본인) | EllisAdmin
  → response: {
      total: number,
      byBucket: { Current: {amount, count}, "1-30": ..., "Disputed": ... },
      badDebtAmount: number,
      disputedAmount: number,
      oldestDaysOverdue: number,
      entries: ARAgingEntry[]
    }
```

### B.4 알림 트리거 (Cron)

```
[Daily 06:00 KST]
  Cron: /internal/jobs/postpay-deadline-alerts
  Logic:
    - SELECT * FROM invoices WHERE billing_type='POSTPAY' AND status!='Paid'
    - For each invoice:
        days_until_due = due_date - today
        if days_until_due == 7  → emit postpay_invoice_d7
        if days_until_due == 3  → emit postpay_invoice_d3 (P0)
        if days_until_due == 1  → emit postpay_invoice_d1 (P0)
        if days_until_due == 0  → emit postpay_invoice_dday (P0 + SMS)
        if days_until_due < 0:
          days_overdue = today - due_date
          if days_overdue == 1   → emit postpay_overdue_d1
          if days_overdue == 7   → emit postpay_overdue_d7  (undisableable)
          if days_overdue == 30  → emit postpay_overdue_d30 (undisableable + SMS)
```

---

## C. 비즈니스 룰 (필수)

### C.1 AR Aging 분류 (`bucketFor`)

```typescript
function bucketFor(daysOverdue: number, hasOpenDispute: boolean): ARAgingBucket {
  if (hasOpenDispute) return "Disputed";       // 분쟁 우선
  if (daysOverdue < 0) return "Current";        // 미도래
  if (daysOverdue <= 30) return "1-30";
  if (daysOverdue <= 60) return "31-60";
  if (daysOverdue <= 90) return "61-90";
  return "90+";                                 // 악성 미수금
}
```

### C.2 Adjustment 출처 강제

**필수 필드** (DB CHECK constraint):
- `bill_type = 'Adjustment'` 인 모든 row → `adjustment_source IS NOT NULL`
- `adjustment_source = 'DisputeAccepted'` → `source_dispute_id IS NOT NULL`
- `adjustment_source IS NOT NULL` → `issued_by IS NOT NULL`

### C.3 Dispute 자동 ticket 생성

```python
def create_dispute(invoice_no, raised_by, reason, description, ...):
    with transaction():
        dispute = InvoiceDispute.create(...)
        ticket = Ticket.create(
            id=generate_ticket_id(),
            ticket_type='Invoice Dispute',
            booking_id=affected_booking_ids[0],
            priority='High' if disputed_amount > 500 else 'Medium',
            status='Pending',
            description=f"{invoice_no} — {description}",
            linked_dispute_id=dispute.id,
            linked_invoice_no=invoice_no,
        )
        dispute.ticket_id = ticket.id
        dispute.save()

        # 알림 자동 발송
        emit_alert(
            type='dispute_opened',
            customer_company_id=...,
            ref_type='invoice',
            ref_id=invoice_no,
        )

        # ELLIS Settlement 팀 라우팅
        auto_assign_ticket(ticket, queue='settlement-team')

    return dispute, ticket
```

### C.4 Ticket 종결 → Dispute 동기화

```python
def update_ticket_status(ticket_id, new_status, by):
    ticket.status = new_status
    ticket.save()

    # Invoice Dispute 자동 동기화
    if ticket.linked_dispute_id and new_status in ('Completed', 'Rejected'):
        dispute = InvoiceDispute.get(ticket.linked_dispute_id)
        if dispute.status not in ('Accepted', 'Rejected'):  # idempotent
            dispute.status = 'Accepted' if new_status == 'Completed' else 'Rejected'
            dispute.resolved_at = now()
            dispute.resolution = (
                f"티켓 {ticket_id} 종결 — 분쟁 인정. 다음 invoice 조정 라인 (-) 발행 예정."
                if new_status == 'Completed'
                else f"티켓 {ticket_id} 종결 — 분쟁 기각. invoice 금액 유지."
            )
            dispute.save()

            # 분쟁 인정 시 자동 Adjustment 발행 (manual 검토 후)
            if new_status == 'Completed':
                queue_adjustment_creation(dispute)
```

### C.5 FX Rate Lock

```python
def create_booking_billing_line(booking, hotel_rate, currency):
    # 결정 #5: 예약 시점에 환율 lock
    fx_rate = fx_service.get_rate(currency, 'USD', at=booking.created_at)
    return BillingLineItem.create(
        amount=hotel_rate,
        currency=currency,
        locked_fx_rate=fx_rate,         # 정산 시점에 변경 불가
        fx_locked_at=booking.created_at,
        ...
    )
```

---

## D. 권한 체크 (RBAC)

### D.1 Settlement Page (목록)

```typescript
// 가드 (page mount 시점)
if (!hasRole(["Master", "Accounting"])) {
  return <AccessRestricted />;
}
const isAccounting = user.role === "Accounting";

// 액션별 가드
const canIssueInvoice = isMaster;                       // Master only
const canMarkPaid = isMaster;                            // 데모 (실무는 ELLIS)
const canRaiseDispute = isMaster || isAccounting;
const canUploadReceipt = isMaster || isAccounting;
```

### D.2 Settlement Detail Page

```typescript
if (!hasRole(["Master", "OP", "Accounting", "EllisOP", "EllisAdmin"])) {
  return <AccessRestricted />;
}
```

### D.3 Disputes 탭

| Role | View | Create | Withdraw |
|------|:--:|:--:|:--:|
| Master | ✅ (전체 본인 회사) | ✅ | ✅ (본인 발행) |
| Accounting | ✅ (전체 본인 회사) | ✅ | ✅ (본인 발행) |
| OP | ❌ | ❌ | ❌ |
| EllisOP | ✅ (assignee 매칭) | ❌ (auto) | ❌ |
| EllisAdmin | ❌ | ❌ | ❌ |

### D.4 Tickets 페이지 (Invoice Dispute 처리)

| Role | View | Process (Accept/Reject) |
|------|:--:|:--:|
| OP | ❌ | ❌ |
| Master | ✅ (본인 회사) | ❌ (조회만) |
| Accounting | ✅ (본인 발행 dispute의 ticket) | ❌ |
| EllisOP | ✅ (전체) | ✅ |
| EllisAdmin | ❌ | ❌ |

---

## E. 알림 명세 (POSTPAY)

### E.1 사전 알림 (4단계)

```yaml
postpay_invoice_d7:
  trigger: due_date - today == 7
  priority: P1
  channels: [In-app, Email]
  recipients: [Master, Accounting]
  template:
    subject: "Invoice {invoice_no} due in 7 days"
    body: "USD {amount} due on {due_date}. Please prepare wire remittance."
    action: { label: "View invoice", path: "/app/settlement/invoice/{invoice_no}" }

postpay_invoice_d3:
  trigger: due_date - today == 3
  priority: P0
  channels: [In-app, Email]
  recipients: [Master, Accounting]
  template:
    subject: "Invoice {invoice_no} due in 3 days"
    body: "Wire processing typically takes 2 business days — please initiate today."
    action: { label: "Upload receipt", path: "/app/settlement?tab=receipts" }

postpay_invoice_d1:
  trigger: due_date - today == 1
  priority: P0
  channels: [In-app, Email]
  ...

postpay_invoice_dday:
  trigger: due_date - today == 0
  priority: P0
  channels: [In-app, Email, SMS]    # SMS 추가
  undisableable: true                # 끄기 불가
  ...
```

### E.2 사후 연체 (3단계)

```yaml
postpay_overdue_d1:
  trigger: today - due_date == 1
  priority: P0
  channels: [In-app, Email]
  recipients: [Master, Accounting]

postpay_overdue_d7:
  trigger: today - due_date == 7
  priority: P0
  channels: [In-app, Email]
  undisableable: true
  recipients: [Master, Accounting]
  internal_cc: [collections@ohmyhotel.com]   # 내부 escalation

postpay_overdue_d30:
  trigger: today - due_date == 30
  priority: P0
  channels: [In-app, Email, SMS]
  undisableable: true
  recipients: [Master, Accounting]
  internal_cc: [legal@ohmyhotel.com]         # 법무 통보
```

---

## F. 회계 처리 시점 (Cash Basis)

### F.1 매출 인식 (Revenue Recognition)

| 시점 | DOTBIZ 회계 처리 | 고객사 회계 처리 |
|------|----------------|----------------|
| 예약 생성 | (인식 X — booking only) | (인식 X) |
| Invoice 발행 | AR 증가 | AP 증가 |
| 송금 | (대기) | 현금 감소 |
| 입금 매칭 (Cash basis) | **매출 인식** + AR 감소 | 비용 인식 + AP 감소 |
| 분쟁 발생 | (대기 — 인식 보류) | (대기) |
| 분쟁 인정 (Adjustment) | 매출 차감 + 다음 invoice (-)라인 | 비용 차감 |
| 분쟁 기각 | 원래 인식 유지 | 원래 인식 유지 |
| 90+일 미수금 | 손상 검토 → 대손 충당금 | (해당 없음) |

### F.2 환율 처리 (FX Lock at Booking)

```
[예약 시점] booking.createdAt = 2026-04-15 14:30 KST
            FX rate = 1370.50 KRW/USD
            → billing_line.locked_fx_rate = 0.000730 USD/KRW
            → billing_line.fx_locked_at = 2026-04-15T14:30:00+09:00

[정산 시점] settlement_date = 2026-05-30
            현재 FX rate = 1395.20 KRW/USD (변동)
            → 정산 금액은 booking 시점 환율 사용 (변동 무관)
            → DOTBIZ가 환율 변동 위험 흡수 (또는 헤지)
```

### F.3 부채 인식 시점

| 단계 | 회계 분류 | 비고 |
|------|----------|------|
| Invoice 발행 ~ 송금 전 | **AR (미수금)** | 매출 미인식 |
| 송금 매칭 완료 | 현금 + 매출 인식 | Cash basis |
| 1-30일 연체 | AR (정상 연체) | 통상 회수 |
| 31-60일 연체 | AR + 회수 활동 강화 | |
| 61-90일 연체 | AR + 위험 분류 | |
| 90+일 연체 | **대손 충당금 검토** | 회계팀 판단 |
| 분쟁 중 | AR (별도 분류) | aging 무관 |
| 분쟁 인정 | 매출 차감 (다음 invoice -line) | |

---

## G. 보존 정책

| 데이터 | 보존 기간 | 비고 |
|--------|----------|------|
| Invoice | **7년** (회계법) | 영구 보존 후 read-only 아카이브 |
| Billing Lines | 7년 | invoice와 동일 |
| Disputes | 7년 | 영구 보존 |
| Payment Receipts | 7년 | 첨부 파일 포함 |
| Tickets (Invoice Dispute 타입) | 7년 | dispute 종결 후 |
| AR Aging snapshot | 매월 말 1회 (월별 영구 보존) | 회계 감사용 |
| Audit logs (moderatedBy 등) | 영구 | |

---

## H. 테스트 커버리지 (현재)

| 테스트 파일 | 케이스 수 | 영역 |
|------------|:--:|------|
| `disputeTicketSync.test.ts` | 5 | Dispute ↔ Ticket 양방향 |
| `postpayAlerts.test.ts` | 6 | POSTPAY 알림 4+3 단계 |
| `arAging.test.ts` | 12 | bucket 분류 + aging summary |
| `alertRouting.test.ts` | 17 | 라우팅 + Quiet hours + 그룹핑 |
| `bookingFormPolicy.test.ts` | 12 | FX lock 등 |

총 **52건 Settlement 관련 테스트** + 178건 기타 = **230 passing**

---

## I. 마이그레이션 단계

### Phase 1 (즉시 — 결정 반영 후)
- [ ] DB 스키마 신규 컬럼 추가 (`adjustmentSource`, `lockedFxRate` 등)
- [ ] InvoiceDispute / PaymentReceipt 신규 테이블
- [ ] Tickets 테이블 `linked_dispute_id` 컬럼 추가
- [ ] 기존 invoice/billing 데이터 backfill (`adjustmentSource='EllisInternal'` 기본값)

### Phase 2 (1개월 내)
- [ ] POSTPAY 알림 cron job 구현 (7단계)
- [ ] AR Aging snapshot 월별 생성
- [ ] Adjustment 자동 발행 워크플로우 (dispute Accepted → 다음 invoice -라인)

### Phase 3 (3개월 내 — 출시 전)
- [ ] CFO/회계법인 자문 반영
- [ ] 월 예산 캡 enforcement 로직
- [ ] FX rate 실시간 연동
- [ ] 부정 거래 룰엔진 (현재 mock)

### Phase 4 (출시 후)
- [ ] ERP 연동 (SAP / 더존)
- [ ] B2B 회계 시스템 연동 (고객사 시스템과 직결)
- [ ] 다중 통화 자동 헤지

---

**문서 끝.**
