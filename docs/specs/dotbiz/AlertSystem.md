# Alert System — Functional Spec

> **Status**: NEW. Not in ELLIS today. Customer-facing taxonomy + delivery + preference UI.
> **Last updated**: 2026-04-21
> **Related**: [Deposit.md](./Deposit.md) · [TopUpDeposit.md](./TopUpDeposit.md) · [DisputeResolution.md](./DisputeResolution.md)

---

## 1. Overview

DOTBIZ surfaces operational events (invoices issued, deadlines approaching, credit running low, hotel cancellations, etc.) through a unified **Alert** pipeline. Every alert has:

- A **type** (`credit_low`, `invoice_overdue`, `prepay_deadline_d3`, …)
- A **category** (Settlement / Booking / Dispute / Account / System)
- A **priority** (P0 Critical / P1 Important / P2 Useful / P3 Future)
- **Channels** it was sent through (In-app / Email / SMS / Slack)
- An optional **deep link** (`actionPath`) to the relevant resource

Alerts appear in the bell-icon popover (unread count badge) and on the dedicated `/app/notifications` page. Users manage per-type and per-channel preferences in **My Account → Notifications**.

---

## 2. Alert Taxonomy

### P0 — Critical (never silently ignored)

| Type | Category | Trigger | Default channels | Undisableable |
|---|---|---|---|---|
| `credit_low` | Settlement | `creditAvailable ≤ creditLowThreshold` | In-app, Email | No |
| `credit_critical` | Settlement | `creditAvailable ≤ creditCriticalThreshold` | In-app, Email, SMS | **Yes** (Email minimum — SMS & in-app optional) |
| `invoice_overdue` | Settlement | Invoice past `dueDate` (escalating ladder) | In-app, Email (SMS from D+7) | No |
| `topup_expired` | Settlement | 7 days with no matching wire (D+5 pre-reminder first) | In-app, Email | **Yes** (Email minimum) |
| `prepay_deadline_d7` | Booking | 7 days before PREPAY deadline | In-app, Email | No |
| `prepay_deadline_d3` | Booking | 3 days before PREPAY deadline | In-app, Email | No |
| `prepay_deadline_d1` | Booking | 1 day before PREPAY deadline | In-app, Email | No |
| `prepay_deadline_dday` | Booking | Day of PREPAY deadline | In-app, Email, SMS | **Yes** |
| `booking_auto_cancelled` | Booking | PREPAY deadline passed, auto-cancel executed | In-app, Email, SMS | **Yes** (Email minimum) |
| `booking_cancelled_by_hotel` | Booking | Hotel reports overbooking/cancel | In-app, Email, SMS | **Yes** |
| `partial_payment_detected` | Settlement | Wire amount < invoice.total | In-app, Email | No |

### P1 — Important

| Type | Category | Trigger | Default channels |
|---|---|---|---|
| `topup_confirmed` | Settlement | Wire matched to ref code | In-app, Email |
| `invoice_issued` | Settlement | New invoice created | In-app, Email |
| `invoice_due_soon` | Settlement | D-2 before `dueDate` — soft reminder | In-app, Email |
| `topup_pending_reminder` | Settlement | D+5 — top-up requested, no wire yet | In-app, Email |
| `payment_received` | Settlement | Payment reconciled | In-app |
| `dispute_opened` | Dispute | Customer dispute raised (via OP) | In-app, Email |
| `dispute_resolved` | Dispute | Dispute closed | In-app, Email |
| `ticket_reply` | Dispute | Support ticket has a new reply | In-app |
| `checkin_tomorrow` | Booking | Check-in date = T+1 | In-app, Email (default off) |
| `credit_note_issued` | Settlement | Credit note generated | In-app, Email |

### P2 — Useful

| Type | Category | Trigger | Default channels |
|---|---|---|---|
| `subaccount_added` | Account | Master adds a sub-user | In-app |
| `role_changed` | Account | User role modified | In-app, Email |
| `contract_amendment` | Account | Settlement cycle/terms changed | In-app, Email |

---

## 3. Priority Semantics

| Priority | Examples | UX treatment |
|---|---|---|
| **P0** | Credit critical, Payment deadline today, Hotel cancelled | Red left-border, bold title, SMS in addition to in-app, bypasses quiet hours |
| **P1** | Invoice issued, Ticket reply | Amber border (if unread), in-app + email |
| **P2** | Sub-account added | Neutral styling, in-app primary |
| **P3** | Reserved for future non-urgent announcements | — |

---

## 4. Channels

| Channel | Delivery | Notes |
|---|---|---|
| **In-app** | Bell popover + `/app/notifications` | Always enabled; cannot be removed for undisableable alerts |
| **Email** | SES / Postmark | HTML + plain-text; includes action button → `actionPath` |
| **SMS** | Twilio | P0 only; rate-limited to 5 / hour / user |
| **Slack** | Incoming webhook | Org-wide channel mapping (optional) |

### Delivery rules

1. Alert is always written to DB and in-app feed — external channels are additive.
2. **Quiet hours** (user-configurable window, e.g. 22:00–08:00 KST) suppress email/SMS for P1/P2; **P0 always delivers**.
3. Duplicate suppression: same `type + refType + refId` within 15 min → skip.
4. **Hysteresis** for threshold-based alerts (`credit_low`, `credit_critical`) — configured per alert-type in ELLIS (`alert_rules.hysteresis_pct`). Default 10%. Alert re-fires only after the metric recovers past `threshold × (1 + hysteresis_pct)`.

### Recipient resolution

- **Master role only** — sub-accounts (OP) do NOT receive alerts by default.
- If a customer company has **multiple Master users**, the alert is broadcast to **all Masters**.
- Recipients are resolved at fire-time (`users WHERE company_id = X AND role = 'Master'`) — not stored on the alert itself.
- (Future) per-Master opt-in to forward to specific OPs may be added — not in scope now.

### Threshold policy (internal)

Thresholds for `credit_low` / `credit_critical` are **internal OhMyHotel policy**, not customer-contract terms.

- Set by the **Sales team** in ELLIS admin as **explicit amounts** (not formulas / not % of limit).
  - Example: deposit 30,000 USD → sales sets low=10,000, critical=3,000 at their discretion
- Do **not** appear on the signed customer contract
- Customers cannot see or self-edit thresholds
- **No recovery notification** — when credit returns to healthy (above `threshold × (1+hysteresis)`), state is silently reset; the customer can verify live on the DOTBIZ Settlement page

### Deposit-level vs Contract-level scoping

A customer typically posts **one deposit in one convenient currency** (e.g. USD) even if they hold multiple contracts (SG USD + VN VND). The deposit is **shared** across the customer's contracts.

Therefore:
- `credit_low` / `credit_critical` alerts fire **once per deposit**, not per contract
- Alert body references the deposit (and its currency), not an individual contract
- Booking-time block (see below) applies across all contracts drawing on the shared deposit

(Edge case: if a customer exceptionally holds separate deposits per contract, each deposit generates its own alert chain. The default is shared.)

### Booking-time block rule

Independent from the low/critical thresholds, a booking is **hard-blocked** at creation time when:

```
deposit.available < booking.amount   (after FX conversion to deposit currency)
```

Example: 300 USD available, 350 USD booking → blocked. The thresholds warn the customer ahead of time; this rule is the final hard gate regardless of threshold state.

---

## 4b. Payment Terms (POSTPAY) — ELLIS-configurable

POSTPAY invoices are issued on a `settlementCycle` (Monthly / Bi-weekly / Weekly) and are due `paymentDueDays` later.

| Field | Range | Default | Configured by |
|---|---|---|---|
| `settlementCycle` | Monthly / Bi-weekly / Weekly | Bi-weekly | Sales (ELLIS admin, per contract) |
| `paymentDueDays` | **0 – 31** | **5** | Sales (ELLIS admin, per contract) |

`paymentDueDays = 5` means the customer must remit within 5 days of the invoice `issuedDate`. Historically Net-14/Net-30 were used, but the current default policy is **Net-5** (tight cycle → better cashflow, smaller exposure window).

Contracts negotiated with longer terms (e.g. Net-14 or Net-30) simply override `paymentDueDays` at the contract record. Invoice `dueDate` is computed as `issuedDate + paymentDueDays`.

### Invoice-overdue escalation (Net-5 baseline)

Reminder schedule fires off `dueDate`, not `issuedDate`. Each row is a separate alert record with `reminder_step`:

| Step (D+) | Alert | Channels | Action | Recipient |
|---|---|---|---|---|
| **D-2** | `invoice_due_soon` (NEW, P1) | In-app, Email | Soft reminder | Masters |
| **D+0** | `invoice_overdue` step=0 | In-app, Email | "Overdue — please remit" | Masters |
| **D+3** | `invoice_overdue` step=1 | In-app, Email | Strongly worded | Masters |
| **D+7** | `invoice_overdue` step=2 | In-app, Email, **SMS** | Warns of booking block at D+10 | Masters + AM cc |
| **D+10** | `invoice_overdue` step=3 | In-app, Email, SMS | **Auto-triggers new-booking block** | Masters + AM cc |
| **D+15** | `invoice_overdue` step=4 | Email | Final notice | Masters + AM + Finance |
| **D+30+** | Manual Sales/AM review | — | Ticket queue | Admin only |

Schedule is stored in `alert_rules.reminder_schedule_days = [0,3,7,10,15]` (per-type array, ELLIS-editable).

### Wording (non-legal, ticket-routing)

Overdue alert body follows 3 tones by step:

- **Soft (D+0, D+3)**: *"Invoice INV-xxx is past due. Please remit at your earliest convenience to keep your account in good standing."*
- **Warn (D+7)**: *"Your account is approaching restricted status. New bookings may be paused from D+10."*
- **Hard (D+10, D+15)**: *"Your account has been placed on credit hold. Please contact your account manager to resolve."*

All bodies include a **"Dispute this line? Open a support ticket"** link to protect the customer's right to contest.

### Disputed-amount handling

Overdue is calculated on **undisputed balance**:

```
undisputed = invoice.total - invoice.disputedAmount
net_overdue = MAX(0, undisputed - invoice.receivedAmount)

IF net_overdue > 0 AND NOW() > dueDate → fire
```

Alert body shows all 3 figures (total / undisputed overdue / disputed under review).

### Admin-side routing

At D+7 and beyond, a separate admin-side record is emitted via:

- `account_manager_id` on the contract → AM receives an internal notification (not in customer's in-app feed)
- D+15 also notifies Finance Director role

This admin flow is implemented by the same `alerts` table with `user_id = admin_user_id` and a flag `is_internal = true` that hides it from customer views.

---

---

## 4c. Top-Up Lifecycle — Expiry & Reminders

Flow:

```
Customer requests top-up → system allocates ref code (TUP-XX-YYYYMMDD-XXXX)
          ↓                              ↓
   topup_request.status = 'Pending'   UI toast (no alert — see §8b)
          ↓
   (wait for wire matching ref code)
          ↓ (if wire arrives within 7d)     ↓ (if no wire by D+5)
   status = 'Matched'                       topup_pending_reminder (P1)
   topup_confirmed alert (P1)                     ↓ (if no wire by D+7)
                                                 status = 'Expired'
                                                 topup_expired alert (P0, Locked)
                                                 ref code added to blacklist
```

### Parameters (ELLIS `alert_rules`)

| Setting | Default | Configurable |
|---|---|---|
| `topup_expired.expiry_days` | 7 | Yes (0–30) |
| `topup_pending_reminder.reminder_schedule_days` | `[5]` | Yes |
| `topup_expired.min_channels` | Email only | No (enforced) |

### Auto-action at D+7

- `topup_request.status := 'Expired'`
- ref code written to `topup_expired_refs` (blacklist) so any late wire goes to `topup_manual_review` (see next section)
- Customer's deposit balance untouched (nothing was ever added)

### Recipients

`Masters(company) ∪ {request.requester_user_id}` (deduplicated) — the user who initiated the request is always notified even if they are not a Master.

### Body example

> "Top-up request expired — USD 20,000 (TUP-SG-20260418-A4F7). No bank wire was received within 7 days. This reference code can no longer be used. Please create a new top-up request if you still wish to proceed."

**Action**: "New Top-Up" → opens Top-Up Dialog on Settlement page.

### Wire-matching failures — handled internally, no customer alert

When a bank wire arrives but the ref code is missing / wrong / expired, or the amount is off-tolerance, the wire is routed to **internal Finance review** without emitting any customer-facing alert.

Rationale:
- Customers are generally careful when wiring funds; false positives would generate anxiety without benefit.
- Top-up is meant to be done **ahead of time** — a day or two of reconciliation delay has no operational impact.
- OhMyHotel Finance reconciles the wire manually, either matches it to the customer's next request or returns the funds.
- When the wire is eventually matched, the existing `topup_confirmed` alert (P1) is emitted normally.

There is no `topup_manual_review` customer alert. The admin-side review queue is part of ELLIS operations, not the DOTBIZ customer portal.

---

## 4c-2. PREPAY Payment Policy — Full amount only

PREPAY bookings **always require the full booking amount** to be paid in a single transaction. Partial / split / deposit-style payments are **not supported** for PREPAY. This simplifies:

- Deadline alerts (`prepay_deadline_*`) — a booking is simply Paid or Unpaid, no partial state
- Cancellation/refund flow — single-transaction reversal
- Dispute handling — clean 1:1 match between payment and booking

The `paymentStatus` field for PREPAY bookings therefore only takes values `Not Paid` or `Fully Paid` (never `Partially Paid`). Any `Partially Paid` PREPAY rows in mocks are historical artifacts and should be treated as `Not Paid` for alert logic.

---

## 4c-3. Booking Immutability

**All booking records are permanent.** Bookings are NEVER deleted from the system — under any circumstance. Cancellations are expressed as status transitions:

```
bookingStatus: 'Confirmed' → 'Cancelled'
cancelDate:    set to transition timestamp
cancelledBy:   'customer' | 'hotel' | 'auto' | 'admin'
cancelReason:  free-text or enum (by type)
```

The original record — dates, guest, hotel, amount — stays queryable forever. This supports:
- Audit trail (financial, legal, tax)
- Dispute investigation (even years later)
- Cross-entity tax reconciliation (VN/KR/JP each require long-retention records)
- Historical analytics

Downstream systems (invoices, AR, settlement, deposit ledger) reference bookings by stable `id` and continue to work after cancellation.

UI surfacing cancelled bookings: shown with a muted / strikethrough row + "Cancelled" badge, filterable via a toggle.

---

## 4c-4. Hotel-Cancellation Handling (Case-by-Case)

When a hotel cancels a booking (triggering `booking_cancelled_by_hotel`), DOTBIZ does **not** perform any automatic financial action:

- No automatic refund
- No automatic credit note
- No automatic compensation / credit grant
- No hard promise about refund timeline or amount in the alert body

Why: hotel-side cancellations are operationally difficult (guest already in transit, alternative-sourcing, rebooking fees, force-majeure carve-outs). OhMyHotel maintains an **offline SLA / compensation framework** that Finance + AM teams apply case-by-case.

The alert's role is therefore limited to:
1. **Inform** the customer (and guest) immediately that the booking is cancelled
2. **Preserve** the booking record with `cancelledBy: 'hotel'` + reason code
3. **Route** the customer to support: "Open a support ticket — our team will coordinate refund and any compensation per our SLA"

The alert body does NOT include refund amounts or timelines. It simply says a ticket will be opened and the team will follow up.

Downstream events (credit note issuance, refund payment, compensation credit) happen only after manual review and emit their own standard alerts (`credit_note_issued`, `payment_received`) when Finance executes them.

---

## 4d. Partial Payment Detection (`partial_payment_detected`)

When a POSTPAY remittance arrives with `received_amount < invoice.total`, ELLIS fires one alert per invoice (first detection only).

### Detection

- Subset-sum analysis on invoice line items (booking-level) — deduce which booking(s) were excluded.
- Example: total 4,180 · received 2,820 · variance 1,360 → matches `{bk-002 580 + bk-003 780}` → body cites those two bookings as "appear excluded."

### Behavior

| Item | Rule |
|---|---|
| Fires | First detection per invoice · no re-fire on later top-ups to the same invoice |
| Auto-dispute | No — customer must file a ticket to formally disputes a line |
| Locked | No · default ON · default channels In-app + Email |
| Recipients | Masters + AM (admin is_internal alert) |
| Succession | Full payment → `payment_received` · Ticket filed → `dispute_opened` · Past dueDate unresolved → `invoice_overdue` |

### Body example

> "Partial payment detected on INV-2026-0089. Received USD 2,820 against USD 4,180. 2 bookings appear to have been excluded — please confirm via support if any of them are disputed: Shilla Stay Mapo (USD 580), Hotel Nikko Bangkok (USD 780)."

**Action**: "Open support ticket" → `/app/tickets/new?invoice=INV-xxx` (pre-fills ticket form).

### Rationale

Customers often intend to withhold payment for disputed bookings; this alert both (a) confirms the variance was observed correctly and (b) routes them to the proper ticket channel instead of letting the variance sit undeclared.

---

## 5. Data Model (ELLIS)

```sql
CREATE TABLE alerts (
  id                  BIGSERIAL PRIMARY KEY,
  type                VARCHAR(64) NOT NULL,
  category            VARCHAR(16) NOT NULL,
  priority            VARCHAR(4)  NOT NULL,             -- P0 | P1 | P2 | P3
  customer_company_id VARCHAR(32) NOT NULL,
  contract_id         VARCHAR(32),
  user_id             VARCHAR(64),                       -- NULL = broadcast to all users on the company
  title               VARCHAR(200) NOT NULL,
  body                TEXT NOT NULL,
  action_label        VARCHAR(64),
  action_path         VARCHAR(256),
  sent_via            VARCHAR(64) NOT NULL,              -- comma-joined channels
  ref_type            VARCHAR(32),                       -- invoice | booking | ticket | contract | topup
  ref_id              VARCHAR(64),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at             TIMESTAMPTZ,
  dismissed_at        TIMESTAMPTZ
);

CREATE INDEX idx_alerts_company_unread ON alerts(customer_company_id, created_at DESC)
  WHERE read_at IS NULL AND dismissed_at IS NULL;

CREATE TABLE alert_preferences (
  user_id       VARCHAR(64) NOT NULL,
  type          VARCHAR(64) NOT NULL,
  enabled       BOOLEAN     NOT NULL DEFAULT TRUE,
  channels      VARCHAR(64) NOT NULL,                    -- comma-joined
  PRIMARY KEY (user_id, type)
);

CREATE TABLE alert_quiet_hours (
  user_id   VARCHAR(64) PRIMARY KEY,
  enabled   BOOLEAN     NOT NULL DEFAULT FALSE,
  from_hm   VARCHAR(5)  NOT NULL DEFAULT '22:00',         -- HH:MM
  to_hm     VARCHAR(5)  NOT NULL DEFAULT '08:00',
  timezone  VARCHAR(40) NOT NULL DEFAULT 'Asia/Seoul'
);

-- Global per-type rules (editable in ELLIS admin, not by customers)
CREATE TABLE alert_rules (
  alert_type      VARCHAR(64) PRIMARY KEY,
  hysteresis_pct  NUMERIC(5,2) NOT NULL DEFAULT 10.00,   -- re-fire after recovery past threshold×(1+pct/100)
  dedupe_window_min INTEGER    NOT NULL DEFAULT 15,      -- suppress duplicate type+ref within window
  enabled         BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Per-contract threshold overrides (internal policy; set by Finance/Risk)
CREATE TABLE contract_alert_thresholds (
  contract_id     VARCHAR(32) NOT NULL,
  alert_type      VARCHAR(64) NOT NULL,
  threshold_value NUMERIC(14,2) NOT NULL,
  set_by          VARCHAR(64) NOT NULL,
  set_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (contract_id, alert_type)
);

-- State tracker for hysteresis (one row per contract × metric)
CREATE TABLE alert_state (
  contract_id    VARCHAR(32) NOT NULL,
  alert_type     VARCHAR(64) NOT NULL,
  last_fired_at  TIMESTAMPTZ,
  last_state     VARCHAR(16),          -- 'healthy' | 'low' | 'critical'
  PRIMARY KEY (contract_id, alert_type)
);
```

---

## 6. Trigger Sources (ELLIS workers)

| Alert family | Source |
|---|---|
| `credit_*`, `invoice_overdue` | Cron — every 5 min scans `contracts × invoices` |
| `topup_*` | Event — bank reconciliation worker |
| `prepay_deadline_*` | Cron — every 30 min (booking.deadline vs NOW) |
| `booking_cancelled_by_hotel` | Event — hotel PMS webhook |
| `invoice_issued`, `payment_received`, `credit_note_issued` | Event — settlement worker |
| `dispute_*`, `ticket_reply` | Event — ticket system |
| `subaccount_added`, `role_changed` | Event — auth service |
| `contract_amendment` | Event — contract admin |

---

## 7. API Endpoints

### `GET /api/alerts?unread=1&category=Settlement&limit=50`
Returns paginated alerts for the current user's company.

### `POST /api/alerts/:id/read`
Marks one alert read.

### `POST /api/alerts/read-all`
Marks all company alerts read.

### `GET /api/alerts/preferences`
Returns the current user's `alert_preferences` + `alert_quiet_hours`.

### `PUT /api/alerts/preferences`
Body: `{ preferences: [{type, enabled, channels}], quietHours: {...} }`
Server enforces `undisableable` list — if a user tries to disable a locked type, return 422.

---

## 8. User Preferences UI

Implemented at **My Account → Notifications** (`AlertPreferencesPanel` component):

- Grouped by category (Settlement / Booking / Dispute / Account / System)
- Per-row: priority badge, channel chips (In-app / Email / SMS / Slack), on/off switch
- **Locked** badge with 🔒 icon for undisableable alerts (switch hidden; channels still editable)
- For locked alerts, the **mandatory minimum channel** is alert-specific:
  - `credit_critical`: Email mandatory (SMS/In-app optional)
  - Other locked types: at least one channel must remain enabled
- Quiet hours toggle with from/to time pickers + timezone
- Save action (idempotent `PUT`)
- Reset defaults action

---

## 8b. Per-Alert Review Outcomes (live spec)

Consolidated decisions from the one-by-one review of each alert type. Where the earlier sections (§2–§4d) describe the taxonomy abstractly, this section records the finalised product decisions for each type.

### P0 Settlement

**`credit_low`** — Threshold is internal policy (Sales sets explicit amount in ELLIS, not in contract). Hysteresis configurable per-type in `alert_rules` (default 10%). Recipients: all Masters; no recovery notification (self-verify on DOTBIZ). Top-up CTA label varies by deposit type.

**`credit_critical`** — 🔒 Email mandatory (SMS/In-app optional). Booking-time hard block when `deposit.available < booking.amount` (FX converted). Deposit is shared across contracts for multi-contract customers → one alert chain. No recovery notification.

**`invoice_overdue`** — See §4b. Escalation ladder D+0 / D+3 / D+7 / D+10 / D+15. SMS from D+7. Auto new-booking block at D+10. Finance cc at D+15. Wording: soft → warn → hard (no "collections" phrasing). Disputed amount excluded from net-overdue calc.

**`topup_expired`** — 🔒 Email mandatory. D+5 `topup_pending_reminder` precedes. Auto-expire at D+7 with ref code blacklisted. Recipients: Masters ∪ requester.

**`partial_payment_detected`** — Subset-sum analysis cites excluded bookings by name. No auto-dispute (customer must file ticket). Not Locked; default ON; In-app + Email. Admin-side cc to AM via `is_internal`.

**`prepay_deadline_d7`** — PREPAY + free_cancel + TL-pending only. Body: card/wire options + free_cancel window notice. Not Locked. Masters + booking creator.

**`prepay_deadline_d3`** — Tone elevated to "caution." Shows **financial consequences** of cancel-vs-pay explicitly. Two CTAs: Pay now + Cancel booking. Orange left border.

**`prepay_deadline_d1`** — "Final reminder." Assumes free_cancel already passed (non-refundable). Single CTA "Pay now." "No refund" wording + forfeiture amount. Red border.

**`prepay_deadline_dday`** — 🔒 In-app + Email (SMS optional). Fires 08:00 contract-TZ + additional reminder 2h before deadline (same type, reminder_step). Post-deadline auto-cancel emits `booking_auto_cancelled` (NEW P0 type).

**`booking_cancelled_by_hotel`** — 🔒 In-app + Email + SMS all mandatory. **Booking records never deleted** — status transition only (see §4c-3). No auto-refund / auto-CN / auto-compensation — case-by-case via offline SLA (see §4c-4). Alert body never promises refund amount or timeline. Recipients: Masters + booking creator + guest email direct.

### P0 removed

**`topup_manual_review`** — Removed from customer taxonomy. Wire-matching failures are handled by Finance internally; no customer alert. Customers wire carefully; top-up is advance-planned so a day or two of recon delay is acceptable.

### P1 Settlement

**`topup_confirmed`** — Positive-info. In-app + Email. Masters + requester. Body = amount + ref code + post-recovery credit balance. Silently clears `credit_low/critical` hysteresis state. Tolerance-matched wires display received amount as primary.

**`topup_pending_reminder`** — D+5 pre-expiry. In-app + Email. Masters + requester.

**`invoice_due_soon`** — D-2 before POSTPAY invoice `dueDate`. In-app + Email. Soft tone.

**`invoice_issued`** — POSTPAY periodic issuance. In-app + Email (PDF attached). Masters only. Per-entity separate alerts for multi-contract customers (different legal entity / currency / bank account). Body footer routes disputes to ticket before due date.

**`payment_received`** — **In-app only by default** (Email/SMS opt-in). Masters + (PREPAY) booking creator. Silently clears overdue / partial / prepay_deadline alert chains. Per-entity for multi-contract. 15-min dedupe window.

**`credit_note_issued`** — In-app + Email (CN PDF attached). Masters + related ticket participants. Single Action → related invoice (no dedicated CN route — simplicity). Reason-code enum (dispute_resolved, hotel_cancellation, pricing_adjustment, goodwill_credit, other). Application mode stated: next invoice / current invoice / cash refund. Amount format: **explicit negative** ("USD -780").

### P1 Dispute

**`dispute_opened`** — Customer cannot self-dispute; OP flags after ticket review. Body: booking + reason + ticket. Action → ticket (not booking). Invoice `disputedAmount` auto-updates; cross-checked with `partial_payment_detected`. Re-fires only on Open→Resolved→Open re-transition.

**`dispute_resolved`** — Three body templates (Approved / Rejected / Partial). Approved/Partial auto-emits follow-up `credit_note_issued`. Rejected = re-dispute via **new ticket** (no reopen). Rejected + customer had withheld under partial_payment → net variance auto-converts to overdue. No SLA/timing in body.

**`ticket_reply`** — **In-app only by default** (Email/SMS opt-in). Recipients = ticket subscribers (not all Masters). 15-min dedupe for rapid back-and-forth. No separate `ticket_closed` type — last reply tagged "closed." Attachments surfaced as count only.

### P1 Booking

**`checkin_tomorrow`** — Default OFF. Digest format (one 08:00 alert per day summarising all next-day check-ins). In-app only. Recipients = booking creators / group coordinators (Masters not auto-subscribed). Surfaces "hotel confirmation code missing" warnings in body.

**`booking_confirmed`** — Removed from customer taxonomy. API-integrated customers pull confirmation state from ELLIS directly; manual customers can see Pending/Confirmed state on the Booking list via a badge. Alert adds no signal — removed to reduce noise.

**`tax_filing_reminder`** — Removed. Tax calendars are the customer's own responsibility (they have in-house or external accountants); OhMyHotel is not a tax advisor and wrong-date notifications create legal exposure without upside. Customers who need transaction data for filing can export it from My Account.

**`topup_requested`** — Removed. Request creation is acknowledged by UI toast; Master can see it in Top-up History. Separate alert is noise given the downstream lifecycle (`topup_pending_reminder` / `topup_confirmed` / `topup_expired`) already covers every meaningful transition.

### `booking_auto_cancelled` (P0 Booking, 🔒 Locked-Email)

Fires when ELLIS auto-cancel worker executes a PREPAY booking after the payment deadline passes with no payment. Body cites: cancellation fact, forfeited amount in contract currency, and guest-alternate-arrangements action. Recipients: Masters + booking creator + **guest email direct** (same pattern as `booking_cancelled_by_hotel`). Channels In-app + Email + SMS by default; Email is the mandatory minimum. Preceding D-7/D-3/D-1/D-day alerts are auto-dismissed. Booking record is preserved (status='Cancelled', cancelledBy='auto', cancelReason='payment_deadline_missed') per §4c-3 immutability rule. Race condition (payment attempted mid-deadline) routes to manual review and does NOT emit this alert.

---

## 9. Out of Scope

- Per-sub-account alert routing (org-wide for now)
- Custom alert types created by customers
- Mobile push notifications (future — SMS covers urgent mobile delivery today)
- Digest emails (future — daily rollup for P2)

---

## 10. Acceptance Criteria

- [ ] All 24 alert types fire from their respective triggers
- [ ] Undisableable types cannot be turned off via API (returns 422)
- [ ] Quiet hours suppress P1/P2 email/SMS; P0 always delivers
- [ ] `credit_low` rearms only after hysteresis (no re-fire while still in breach)
- [ ] Duplicate `type + refType + refId` suppressed within 15 min
- [ ] Bell badge count matches `alerts WHERE read_at IS NULL AND dismissed_at IS NULL` exactly
- [ ] `/api/alerts/read-all` completes in < 500 ms for 10k rows
- [ ] Clicking an alert with `actionPath` marks read + navigates atomically
- [ ] Reset-defaults restores the seed preferences table verbatim
