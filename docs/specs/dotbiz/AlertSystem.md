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
| `credit_critical` | Settlement | `creditAvailable ≤ creditCriticalThreshold` | In-app, Email, SMS | **Yes** |
| `invoice_overdue` | Settlement | Invoice past `dueDate` | In-app, Email | No |
| `topup_expired` | Settlement | 7 days with no matching wire | In-app, Email | **Yes** |
| `topup_manual_review` | Settlement | Wire received, ref code missing/unclear | In-app, Email | No |
| `prepay_deadline_d7` | Booking | 7 days before PREPAY deadline | In-app, Email | No |
| `prepay_deadline_d3` | Booking | 3 days before PREPAY deadline | In-app, Email | No |
| `prepay_deadline_d1` | Booking | 1 day before PREPAY deadline | In-app, Email | No |
| `prepay_deadline_dday` | Booking | Day of PREPAY deadline | In-app, Email, SMS | **Yes** |
| `booking_cancelled_by_hotel` | Booking | Hotel reports overbooking/cancel | In-app, Email, SMS | **Yes** |
| `partial_payment_detected` | Settlement | Wire amount < invoice.total | In-app, Email | No |

### P1 — Important

| Type | Category | Trigger | Default channels |
|---|---|---|---|
| `topup_confirmed` | Settlement | Wire matched to ref code | In-app, Email |
| `invoice_issued` | Settlement | New invoice created | In-app, Email |
| `payment_received` | Settlement | Payment reconciled | In-app |
| `dispute_opened` | Dispute | Customer dispute raised (via OP) | In-app, Email |
| `dispute_resolved` | Dispute | Dispute closed | In-app, Email |
| `ticket_reply` | Dispute | Support ticket has a new reply | In-app |
| `checkin_tomorrow` | Booking | Check-in date = T+1 | In-app, Email (default off) |
| `booking_confirmed` | Booking | Hotel issued confirmation code | In-app (default off) |
| `credit_note_issued` | Settlement | Credit note generated | In-app, Email |

### P2 — Useful

| Type | Category | Trigger | Default channels |
|---|---|---|---|
| `subaccount_added` | Account | Master adds a sub-user | In-app |
| `role_changed` | Account | User role modified | In-app, Email |
| `contract_amendment` | Account | Settlement cycle/terms changed | In-app, Email |
| `tax_filing_reminder` | Settlement | Quarter-end tax window open | In-app (default off) |

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
4. Critical rearming: `credit_low` re-fires only after `available > creditLowThreshold + 10%` (hysteresis).

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
- **Locked** badge with 🔒 icon for undisableable alerts (switch hidden; channels still editable; cannot remove last channel)
- Quiet hours toggle with from/to time pickers + timezone
- Save action (idempotent `PUT`)
- Reset defaults action

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
