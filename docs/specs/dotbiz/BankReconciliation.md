# Bank Reconciliation — Functional Spec (Backend / ELLIS-only)

> **Status**: NEW — backend-only feature; no DOTBIZ customer UI.
> Used by OhMyHotel finance team to match incoming wires to invoices and top-up requests.
> **Last updated**: 2026-04-20

---

## 1. Background

OhMyHotel receives wires from POSTPAY customers (invoice settlement) and PREPAY customers (Floating Deposit top-ups). The finance team must:
1. Identify which customer each wire belongs to.
2. Apply it to the right invoice / deposit ledger row.
3. Flag mismatches (wrong amount, missing memo, unknown sender).

Manual reconciliation by spreadsheet VLOOKUP is the current pain point. This spec defines the system that replaces it.

---

## 2. Sources of Incoming Wires

| Source | Frequency | Format |
|---|---|---|
| Bank statement CSV (manual upload) | Daily / weekly | Bank-specific schema (Citi, KB, etc.) |
| Bank API webhook (future) | Real-time | JSON push from bank |
| Manual entry by finance | Ad-hoc | Form input |

---

## 3. Reconciliation Algorithm

```
FOR EACH incoming_wire:
  
  1. PARSE wire memo for reference codes
     - TUP-YYYYMMDD-XXXX → top-up request
     - INV-YYYY-XXXX     → invoice payment
  
  2. IF top-up code found:
       request = topup_requests.find(refCode = code)
       IF request EXISTS AND status = 'Pending':
         IF abs(wire.amount - request.requestedAmount) <= TOLERANCE ($5):
           ► auto-confirm (status='Confirmed', confirmedAmount, bankRef, ledger entry)
         ELSE:
           ► flag for manual review (amount mismatch)
       ELSE:
         ► flag for manual review (unknown / expired code)
  
  3. ELSIF invoice code found:
       invoice = invoices.find(invoiceNo = code)
       IF invoice EXISTS:
         apply wire.amount to invoice.receivedAmount
         IF invoice.receivedAmount = invoice.total:
           ► invoice.matchStatus = 'Full'
         ELIF invoice.receivedAmount < invoice.total:
           ► invoice.matchStatus = 'Partial' (compute variance, flag for OP review)
         ELSE:
           ► overpayment (flag, hold for refund/credit)
  
  4. ELSE no code found:
       Try fuzzy match by sender_name + amount + recent_invoices
       Highest-confidence candidate < 0.8 → manual review queue
```

`TOLERANCE` = $5 (configurable). Most banks have small wire fees that customers can't always predict.

---

## 4. Subset-sum (POSTPAY partial payments)

When a customer wires LESS than invoice.total (intentionally excluded items):

```
variance = invoice.total - wire.amount

Find subset S of invoice.bookingIds where SUM(b.amount for b in S) = variance ± TOLERANCE

IF unique subset found:
  ► Suggested-excluded list for finance to review.
  ► Finance can:
       (a) Confirm exclusions → mark each booking disputed (manual,
           same path as ticket-driven dispute, see DisputeResolution.md)
       (b) Override → variance treated as short-pay, customer follow-up
ELSE:
  ► No clear match → manual review (could be partial fee, FX cost, etc.)
```

This is the "VLOOKUP killer" — automating what finance was doing in Excel.

---

## 5. Data Model

```sql
CREATE TABLE bank_wires (
  id              BIGINT PRIMARY KEY,
  bank_account    VARCHAR(64) NOT NULL,    -- our receiving account
  wire_date       DATE NOT NULL,
  amount          DECIMAL(14,2) NOT NULL,
  currency        VARCHAR(3) NOT NULL,
  sender_name     VARCHAR(128),
  sender_account  VARCHAR(64),
  bank_ref        VARCHAR(128) NOT NULL,   -- unique from bank
  memo            TEXT,
  source          VARCHAR(16) NOT NULL,    -- 'CSV' | 'API' | 'MANUAL'
  imported_at     TIMESTAMP NOT NULL,
  imported_by     VARCHAR(64) NOT NULL,
  status          VARCHAR(16) NOT NULL,    -- 'Unmatched' | 'Auto-matched' | 'Manual-matched' | 'Hold'
  match_type      VARCHAR(32),             -- 'Top-Up' | 'Invoice Full' | 'Invoice Partial' | 'Overpay' | 'Fuzzy'
  matched_at      TIMESTAMP,
  matched_by      VARCHAR(64),
  matched_ref     VARCHAR(64),             -- topup_request.id or invoice.invoiceNo
  notes           TEXT,
  CONSTRAINT bank_wires_status CHECK (status IN ('Unmatched','Auto-matched','Manual-matched','Hold'))
);

CREATE INDEX idx_bank_wires_status ON bank_wires(status, wire_date DESC);
CREATE INDEX idx_bank_wires_bankref ON bank_wires(bank_ref);
```

---

## 6. API / Admin UI (TO BE IMPLEMENTED — ELLIS only)

### `POST /api/admin/bank-wires/import`
Upload bank statement CSV. Parses rows, runs algorithm §3, persists results.

### `GET /api/admin/bank-wires?status=Unmatched`
List wires for finance team queue.

### `POST /api/admin/bank-wires/:id/match`
Manual match. Body: `{ matchType, matchedRef, notes? }`

### `POST /api/admin/bank-wires/:id/hold`
Park for further investigation.

---

## 7. Bank Format Adapters (TO BE IMPLEMENTED)

Each bank exports CSV in different schema. Need pluggable parser:

```ts
interface BankAdapter {
  bankCode: string;
  parse(csvContent: string): BankWire[];
}

// Example: Citi Singapore
const citiSGAdapter: BankAdapter = {
  bankCode: 'CITI-SG',
  parse: (csv) => { /* maps Citi-specific columns */ }
};
```

Initial supported banks: Citibank Singapore, KB Kookmin (KR), Shinhan (KR). Others added per customer demand.

---

## 8. Notifications

| Event | Recipient | Channel |
|---|---|---|
| Wire auto-matched | Customer + Finance | Email |
| Wire flagged for manual review | Finance team | In-app + Slack |
| Top-up confirmed | Customer Master | Email + in-app |
| Overpayment detected | Finance + Customer | Email |

---

## 9. KPIs (Finance Dashboard — admin only)

- Auto-match rate (target: >85%)
- Average time-to-match (target: <4 hours after wire arrival)
- Manual-review backlog
- Unmatched wires older than 7 days (require escalation)

---

## 10. Out of Scope

- Outgoing wires (payouts to hotels) — separate spec
- Direct debit / auto-pay
- Cryptocurrency settlements
- FX conversion at our end (customer wires in contract currency)

---

## 11. Why this is NOT a customer-facing feature

The customer never sees this surface. From their perspective:
- They wire money with the right reference code → eventually deposit/invoice updates.
- If something goes wrong (wrong amount, missing code), they get a notification asking them to act.

Showing the bank-wire queue to customers would expose other customers' data (cross-tenant) and add no value to them.

---

## 12. Acceptance Criteria

- [ ] CSV upload from at least 2 supported banks works end-to-end
- [ ] Top-up auto-match rate ≥ 95% when ref code present
- [ ] Invoice partial-payment subset-sum suggestion shown for finance review
- [ ] Manual override always available
- [ ] Every match (auto or manual) creates an `audit_log` entry
- [ ] Customer notified within 5 minutes of confirmation
- [ ] Finance dashboard KPIs computed daily
