# Top-Up Deposit — Functional Spec

> **Status**: NEW — feature exists in DOTBIZ prototype but **NOT in ELLIS** yet.
> **Owner**: ELLIS team must implement backend.
> **Affects**: Floating Deposit type only. Other deposit types (Bank Guarantee, Insurance, Guarantee Deposit, Credit by Company) have no top-up flow — the limit is set by external instruments / contract amendments.
> **Last updated**: 2026-04-20

---

## 1. Business Background

POSTPAY customers with **Floating Deposit** type pre-fund a credit pool from which their unpaid invoices draw. As bookings accumulate and the available balance shrinks, the customer needs to "top up" (wire more funds) to keep booking. Without this flow, a customer must:
1. Email finance for bank info
2. Wire money manually
3. Email proof and hope for fast attribution
4. Wait 3-5 days for finance to manually match the wire to their account

**The new flow** introduces a unique reference code per top-up request, eliminating manual attribution.

---

## 2. User Flow (DOTBIZ side — already implemented)

### 2.1 Trigger
Customer clicks "Top Up Deposit" button. Available trigger points:
- Top of Settlement page when **available balance ≤ 30%** (`Top Up Deposit` red button)
- Top of Settlement page when **available balance 31-50%** (outline button, soft nudge)
- Anytime via the deposit utilization card

### 2.2 Step 1 — Amount Entry
- Input: requested top-up amount (currency = customer's contract currency)
- Min: 1,000 (configurable)
- Quick-select buttons: 10,000 / 20,000 / 50,000

### 2.3 Step 2 — Wire Instructions
DOTBIZ generates a **unique Reference Code** (`TUP-YYYYMMDD-XXXX`) and shows:
- Bank details (bank, SWIFT, account holder, account number, address)
- Reference code (large, copyable, highlighted)
- Amount the customer should wire
- Expiry: 7 days from creation
- Critical warning: **"You MUST include this code in the wire memo"**

### 2.4 Step 3 — Submitted
On confirmation, DOTBIZ:
- Calls `POST /api/topup-requests` (ELLIS) — see §3
- Shows success state with the ref code reminder
- Email notification to the customer's billing email (TODO — email stub)

---

## 3. Backend Requirements (ELLIS — TO BE IMPLEMENTED)

### 3.1 Data Model

```sql
CREATE TABLE topup_requests (
  id                BIGINT PRIMARY KEY,
  customer_id       VARCHAR(32) NOT NULL,    -- FK companies.id
  ref_code          VARCHAR(24) NOT NULL UNIQUE,
  requested_amount  DECIMAL(14,2) NOT NULL,
  currency          VARCHAR(3)  NOT NULL,    -- USD / KRW / JPY etc.
  requested_at      TIMESTAMP   NOT NULL,
  expires_at        TIMESTAMP   NOT NULL,    -- requested_at + 7 days
  status            VARCHAR(16) NOT NULL,    -- Pending | Confirmed | Expired | Manual Review | Cancelled
  confirmed_amount  DECIMAL(14,2),           -- actual amount received (may differ)
  confirmed_at      TIMESTAMP,
  confirmed_by      VARCHAR(64),             -- 'BANK_API' or finance staff name
  bank_ref          VARCHAR(128),            -- external bank wire reference
  notes             TEXT,
  created_by        VARCHAR(64),             -- API_USER or staff
  CONSTRAINT topup_status_check CHECK (status IN ('Pending','Confirmed','Expired','Manual Review','Cancelled'))
);

CREATE INDEX idx_topup_customer ON topup_requests(customer_id, status);
CREATE INDEX idx_topup_refcode ON topup_requests(ref_code);
```

### 3.2 Reference Code Format

```
TUP-YYYYMMDD-XXXX
```
- `TUP` — fixed prefix
- `YYYYMMDD` — request date (UTC)
- `XXXX` — 4-char random alphanumeric, **uppercase**, no `0/O/1/I/L` (visual confusion in wire memos)

Generator should ensure uniqueness (retry on collision).

### 3.3 API Endpoints

#### `POST /api/topup-requests`
Create a new top-up request.
- **Auth**: customer Master/OP role
- **Body**: `{ amount: number, currency: string }`
- **Response**: `{ id, refCode, expiresAt, bankInfo: {bankName, swift, accountHolder, accountNumber} }`
- Side effects:
  - Insert into `topup_requests` with `status=Pending`
  - Send email to customer's billing email with the same info shown in DOTBIZ

#### `GET /api/topup-requests?customerId=...&status=...`
List requests for a customer.
- Default: last 30 days
- Filter by status

#### `POST /api/topup-requests/:id/confirm`
Manual confirmation by finance staff (UI on ELLIS admin).
- **Body**: `{ confirmedAmount, bankRef, notes? }`
- Side effects:
  - Update `topup_requests` row: `status=Confirmed`
  - Insert into `deposit_ledger` (+ amount, type='Top-Up', ref=topup id)
  - Update `companies.deposit_balance` += confirmedAmount
  - Send confirmation email + in-app notification

#### `POST /api/topup-requests/:id/cancel`
Customer or staff cancels.

### 3.4 Auto-Match (Future Enhancement)

When bank API integration is in place:
1. Bank webhook arrives for incoming wire (sender, amount, memo, bank ref)
2. Service parses memo for `TUP-YYYYMMDD-XXXX` regex
3. If match found and amount within ±$5 tolerance → auto-confirm
4. If memo missing or amount mismatch → flag as `Manual Review`, alert finance team
5. Daily scheduler: expire any Pending requests older than `expires_at`

---

## 4. Edge Cases

| Case | Behavior |
|---|---|
| Customer wires WITHOUT ref code | Status: `Manual Review`. Finance team must investigate (sender name, amount, recent requests) and manually attribute. SLA: 3-5 business days. |
| Customer wires WRONG amount (e.g., 19,500 instead of 20,000) | Status: `Manual Review` if outside ±$5. Finance can confirm with adjusted amount. |
| Customer wires AFTER expiry | Status: `Manual Review`. Treat as new manual deposit, ask customer to create a new request OR finance manually credits. |
| TWO customers happen to use same memo (collision) | Generator MUST guarantee uniqueness — see §3.2. Index uniqueness enforces this at DB level. |
| Customer cancels mid-flight (no wire sent yet) | Status: `Cancelled`. Ref code retired. |
| Wire sent twice with same ref code | First wire confirms. Second triggers `Manual Review` — likely duplicate, refund or apply as fresh credit. |

---

## 5. UI Surfaces (DOTBIZ)

| Surface | Element | Behavior |
|---|---|---|
| Settlement page header (deposit card) | "Top Up Deposit" button (Floating Deposit only, when usage ≥ 70%) | Opens TopUpDepositDialog |
| Settlement page header (deposit card) | Mid-utilization (50-70%) outline button | Same dialog |
| Settlement page header (deposit card) | "Recent Top-Up Requests" mini-list (last 3) | Read-only status display |
| Notifications page | New top-up confirmation entry | TODO — depends on notifications feature |

---

## 6. Other Deposit Types — NO Top-Up Flow

These types DO **NOT** trigger the dialog. Their CTA buttons send a **request notification** to OhMyHotel account manager (offline coordination):

| Deposit Type | CTA Action |
|---|---|
| Credit by Company | Toast: "Credit increase request sent — account manager will respond in 2 business days" |
| Guarantee Deposit | Toast: "Guarantee increase request sent — contract amendment to follow" |
| Guarantee Insurance | Toast: "Insurance increase noted — coordinate with your insurer" |
| Bank Guarantee | Toast: "Bank guarantee increase noted — coordinate with your bank" |
| No Deposit | Toast: "Deposit setup request sent — our team will guide options" |

These need a corresponding ELLIS workflow (likely a new `account_manager_requests` table) but are out of scope for this spec.

---

## 7. Out of Scope (Explicit)

- Credit card top-up via PG (only bank wire supported in v1)
- Multi-currency wires (request currency = contract currency only)
- Partial confirmations (one wire = one confirmation)
- Refunds of overpayment (handle as deposit balance > usage; auto-applied to next invoice)
- Customer self-service cancellation after wire sent
- Tax invoice issuance for the top-up itself (top-up = pre-payment, not a taxable supply; invoiced via subsequent bookings)

---

## 8. Acceptance Criteria

- [ ] Customer can create a top-up request and immediately see bank info + ref code
- [ ] Ref code is unique across the system
- [ ] Pending request is visible in "Recent Top-Up Requests" list
- [ ] After finance confirms in ELLIS admin, customer's deposit balance increases by `confirmedAmount`
- [ ] Customer receives email + in-app notification on confirmation
- [ ] Pending requests auto-expire after 7 days (status → `Expired`)
- [ ] Wire missing the ref code surfaces in finance team's `Manual Review` queue
- [ ] All transitions logged in audit trail (who, when, before/after)
