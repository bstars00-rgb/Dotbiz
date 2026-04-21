# Deposit Management — Functional Spec

> **Status**: Partially exists in ELLIS (deposit balance tracking only). Top-Up flow + utilization logic is NEW.
> **Last updated**: 2026-04-20

---

## 1. Overview

A POSTPAY customer carries a **deposit** as collateral against unpaid invoices. There are 6 deposit types, each with different operational semantics. DOTBIZ Settlement page surfaces **utilization (used / available)** in real time and routes the "increase limit" CTA to the right channel based on type.

---

## 2. Deposit Types

| Code | Type | Semantics | Limit-increase channel |
|---|---|---|---|
| `floating` | Floating Deposit | Pre-funded credit pool · drawn down per invoice | **DOTBIZ self-serve** wire transfer (see [TopUpDeposit.md](./TopUpDeposit.md)) |
| `credit_co` | Credit by Company | OhMyHotel-issued credit line | Account manager review (offline) |
| `guarantee_dep` | Guarantee Deposit | Contractual collateral · usually fixed | Contract amendment |
| `insurance` | Guarantee Insurance | Insurer-backed booking guarantee | External insurer |
| `bank_guarantee` | Bank Guarantee | Bank-issued letter of guarantee | External bank |
| `none` | No Deposit | No collateral | Onboarding (set up one of the above) |

---

## 3. Calculation

```
deposit.totalLimit  = company.depositAmount      (set by contract / top-ups)
deposit.used        = SUM(invoice.total - invoice.receivedAmount)
                       WHERE invoice.customerId = company.id
                         AND invoice.matchStatus IN ('Unpaid', 'Partial')
deposit.available   = MAX(0, totalLimit - used)
deposit.usagePct    = MIN(100, ROUND(used / totalLimit * 100))
```

Severity:
- `≥ 80%` → critical (red, block warning)
- `≥ 70%` → high (orange, top-up CTA)
- `≥ 50%` → moderate (orange, soft nudge)
- `< 50%` → healthy (green)

---

## 4. Booking-time Enforcement (TO BE IMPLEMENTED)

When a customer attempts to create a new booking:

```
IF company.billingType = 'POSTPAY' AND deposit.type != 'none' THEN
  IF (deposit.used + booking.amount) > deposit.totalLimit THEN
    BLOCK booking creation
    RETURN "Booking would exceed deposit limit. Available: ${available}. Top up or settle invoices to continue."
  ELSE
    PROCEED
  END
END
```

For `Credit by Company` and `none` types: same logic (use credit_limit field instead of deposit_amount).

---

## 5. Data Model (ELLIS)

```sql
ALTER TABLE companies ADD COLUMN deposit_type VARCHAR(32) NOT NULL DEFAULT 'none';
ALTER TABLE companies ADD COLUMN deposit_amount DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE companies ADD COLUMN deposit_currency VARCHAR(3) NOT NULL DEFAULT 'USD';

CREATE TABLE deposit_ledger (
  id           BIGINT PRIMARY KEY,
  customer_id  VARCHAR(32) NOT NULL,
  type         VARCHAR(32) NOT NULL,    -- 'Top-Up' | 'Invoice Charge' | 'Refund' | 'Adjustment' | 'Contract Amendment'
  amount       DECIMAL(14,2) NOT NULL,  -- positive = credit, negative = debit
  ref_table    VARCHAR(32),             -- 'topup_requests' | 'invoices' | etc.
  ref_id       VARCHAR(64),
  balance_after DECIMAL(14,2) NOT NULL,
  created_at   TIMESTAMP NOT NULL,
  created_by   VARCHAR(64) NOT NULL
);

CREATE INDEX idx_deposit_ledger_customer ON deposit_ledger(customer_id, created_at DESC);
```

`deposit_ledger` is append-only — every change to deposit balance is a new row, providing full audit trail.

---

## 6. API Endpoints (TO BE IMPLEMENTED)

### `GET /api/deposit/:customerId`
Returns: `{ type, totalLimit, used, available, usagePct, currency, lastTopUpAt }`

### `GET /api/deposit/:customerId/ledger?from=&to=&limit=`
Returns paginated ledger entries.

### `POST /api/bookings/:id/check-deposit` (called by booking creation)
Returns: `{ canBook: boolean, reason?: string, availableAfter?: number }`

---

## 7. UI Surfaces (DOTBIZ — already implemented)

- Settlement page header: **Deposit Utilization Card** (color-coded progress bar + 3 stat blocks: Total / Used / Available)
- Booking form (TODO): show available balance before submit
- Avatar dropdown: high-level Credit Balance / Deferred Credit Balance summary

---

## 8. Out of Scope

- Multi-currency deposits (1 deposit per customer in 1 currency)
- Deposit refunds upon contract termination (handled offline)
- Tier-based deposit (e.g., gold/silver) — not yet
- Deposit interest — not paid

---

## 9. Acceptance Criteria

- [ ] `GET /api/deposit/:customerId` returns correct used/available based on outstanding invoices
- [ ] `POST /api/bookings/:id/check-deposit` blocks bookings that would exceed limit
- [ ] Top-up confirmation triggers `deposit_ledger` insert with positive amount
- [ ] Invoice settlement triggers `deposit_ledger` insert with negative amount
- [ ] Settlement page utilization bar matches API value within 1 second
- [ ] Each deposit type's CTA routes to the correct workflow (DOTBIZ dialog / account-manager queue / contract amendment task)
