# Settlement Page — Functional Spec

> **Status**: Implemented in DOTBIZ customer portal.
> **Last updated**: 2026-04-24
> **Related**: [Deposit.md](./Deposit.md) · [MultiEntity.md](./MultiEntity.md) · [AlertSystem.md](./AlertSystem.md)

---

## 1. Overview

The Settlement page is the customer Master's command center for money flow with OhMyHotel: invoices, credit line, outstanding balances, top-ups, and payment records.

**Access**: Master role only.
**Route**: `/app/settlement`

The structure adapts to billing type:

| POSTPAY tabs | PREPAY tabs |
|---|---|
| Invoices | Pending Payment |
| Billing Details | Invoices |
| | Billing Details |

Aging cards appear on the Invoices tab for POSTPAY only.

---

## 2. Credit Line card (unified)

Single card at the top of the page showing contract-level credit state. Replaces the former split between "Deposit Utilization" and "Credit Utilization".

### Fields
- **Credit Limit** = `contract.creditLimit ?? depositAmount × creditMultiplier ?? depositAmount`
- **Used** = outstanding balance (sum of unpaid invoice balances)
- **Available** = `max(0, limit − used)`
- **Thresholds**: Low and Critical levels (see [Deposit.md §7b](./Deposit.md))

### Visual
- Progress bar with:
  - Color: green → amber (>50%) → orange (low threshold breached) → red (critical)
  - Amber dashed marker at low threshold position
  - Red dashed marker at critical threshold position
- 5 columns (when leverage > 1): Collateral / Credit Limit / Used / Available / Alert at
- 4 columns (when 1:1 Floating): Credit Limit / Used / Available / Alert at
- Badge: `2× leverage` / `Credit by Company` / (nothing for Floating 1:1)

### CTA (type-aware)
| Deposit Type | Button |
|---|---|
| Floating Deposit | **Top Up Deposit** → wire-based top-up dialog |
| Bank Guarantee / Guarantee Deposit / Insurance | **Request Increase** → AM request toast |
| Credit by Company | **Request Credit Increase** → AM request |
| No Deposit | **Set Up Deposit** (amber info card) |

### Recent Top-Up Requests footer
Floating Deposit only. Shows up to 3 recent top-ups with status (Pending / Matched / Expired / Manual Review) and ref codes.

---

## 3. Contract selector (multi-entity support)

For customers with multiple contracts (e.g. GOTADI with OhMyHotel SG USD + OhMyHotel VN VND), a dropdown appears in the page header:

- Options include each contract (`🇸🇬 OhMyHotel SG · USD · POSTPAY`, etc.) plus "All contracts (Summary)"
- Selection filters every tab (Invoices / AR / Billing / Credit Line card)
- Currency display adapts to the selected contract (USD / VND / JPY etc.)
- Decimal formatting: VND / JPY = 0 decimals, others = 2 decimals
- Single-contract customers still see the selector (structure unified regardless of count — one contract shows as the only option)

---

## 4. Invoices tab

### POSTPAY Aging cards
Four clickable KPI cards at the top showing unpaid invoice totals by bucket. Aging calculated from `invoice.dueDate`, using pinned demo today `2026-04-22`:

| Bucket | Condition |
|---|---|
| **Current** | `dueDate > today` |
| **1-30 Days** | `1 ≤ today − dueDate ≤ 30` |
| **31-60 Days** | `31 ≤ today − dueDate ≤ 60` |
| **60+ Days** | `today − dueDate > 60` |

Paid / Reconciled invoices are excluded from all buckets. Click a card to filter the invoice list to that bucket; click again or the × chip to clear.

### Invoice list
Columns: Invoice No / Type / Period / Booking/Hotel / Count / Currency / Due / Status / Total / Paid / Balance / First Insert / Last Update / Actions

Row click → Invoice Detail page.
Row actions: PDF preview · Detail drill-in.

### Filter bar
- Status: All / Issued / Paid / Overdue
- Aging filter chip (set by clicking an aging card)

---

## 5. Billing Details tab

Per-booking billing line items. Each bill row represents a single booking fee, cancellation fee, or adjustment.

### Search form (two-tier state — Draft + Applied)
Search only applies when the user presses **Search** (or Enter). Live field edits don't re-filter.

| Field | Notes |
|---|---|
| Date Type | Booking Date · Due Date · Settlement Date |
| From / To | Date-range pickers |
| Bill Type | All · Hotel Booking · Cancellation Fee · Adjustment |
| Bill ID / Booking ID | Free-text substring match |
| Invoice No | Substring match on invoiceNo |

Pending-changes indicator: orange "Search" button + inline hint when draft differs from applied.

### Table columns
Bill ID · Invoice No · Type · Booking ID · Hotel · Amount (contract currency) · **Booking Date** · Due · Settled · Status

### CSV export
Includes tenant company name in filename, timestamp for uniqueness. Columns match the table plus Currency.

---

## 6. Pending Payment tab (PREPAY only)

Per-booking unsettled items with payment deadlines. Lists PREPAY bookings awaiting card or wire payment.

### Columns
- Booking Code · Hotel · Guest · Check-in · Cancel Deadline · Payment Deadline · Amount · Status · Actions

### Filters
- Deadline chips: All / Today / 7 days / Custom
- Today's Action KPI row: Overdue / Today / This Week buckets

### Bulk pay
Checkbox multi-select → orange **Pay N bookings** sticky action bar → PaymentDialog opens with combined total → PG card payment simulation → bookings marked Fully Paid in bulk.

Single-booking pay: Pay Now button in each row.

---

## 7. Payment terms (ELLIS-configurable)

### Fields
| Field | Range | Default |
|---|---|---|
| `settlementCycle` | Monthly · Bi-weekly · Weekly | Bi-weekly |
| `paymentDueDays` | 0–31 | **5** |

Defaults set by AM at onboarding. Per-contract overrides allowed for negotiated terms (Net-14, Net-30).

`dueDate = issuedDate + paymentDueDays`

### Overdue escalation (Net-5 baseline)
See [AlertSystem.md §4b](./AlertSystem.md). Reminder schedule: D-2 soft → D+0 overdue → D+3 · D+7 (SMS + AM cc) · D+10 (new-booking block) · D+15 (Finance cc).

---

## 8. PREPAY-specific rules

- **Full amount only** — no partial payments supported
- Payment methods: PG card (immediate) or wire transfer (with ref code, manual match)
- Saved company cards from Master Account > Payment Cards available at checkout
- Deadline auto-cancel at D+0 17:00 (contract timezone) → `booking_auto_cancelled` P0 alert
- Booking cannot be modified post-creation — cancel + rebook is the only path

---

## 9. Accounts Receivable (REMOVED)

The AR tab is gone. It was redundant with Invoices (both represented unpaid POSTPAY debt) and its per-booking aging was the wrong semantic (aging should be measured from invoice dueDate, not booking creation). The aging breakdown moved to the Invoices tab as clickable KPI cards; the per-booking drill-down remains available via Invoice Detail page → Linked Bookings.

---

## 10. Data model references

- `contracts` — contract terms + credit leverage + thresholds
- `invoices` (InvoiceWithMatch) — aggregate invoices with match status, disputed amounts, entity routing
- `billingDetails` (BillingLineItem) — per-booking bill rows
- `topUpRequests` — deposit top-up state machine
- `bookings` — with `hotelConfirmCode` for guest check-in reference

---

## 11. Acceptance Criteria

- [ ] Master-only access; OP / Accounting get Access Restricted
- [ ] Credit Line card renders correctly for all deposit types (Floating, BG, GD, Insurance, Credit by Company, None)
- [ ] Leverage contracts show Collateral column; Floating hides it
- [ ] Aging cards sum outstanding unpaid invoices only; paid invoices never appear in any bucket
- [ ] Aging buckets correctly categorize based on `today − dueDate`
- [ ] Clicking aging card filters invoice list; click-again clears
- [ ] Contract selector filters invoices, billing, AR (removed), and credit line display
- [ ] Multi-currency invoices display in their own `contractCurrency`, not a fixed symbol
- [ ] Billing Details search applies ONLY on Search button / Enter key — not on keystroke
- [ ] PREPAY Pending Payment deadline chips filter correctly and bulk-pay works
- [ ] Net-5 is the default paymentDueDays; per-contract overrides respected
