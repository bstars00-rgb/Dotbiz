# Dispute Resolution — Functional Spec

> **Status**: Display layer exists in DOTBIZ. Backend lifecycle + ticket-driven flagging is NEW.
> **Last updated**: 2026-04-20

---

## 1. Background

When a customer believes a booking line on their invoice is wrong (rate mismatch, no-show contested, room type difference, etc.), they raise a **support ticket** — they cannot unilaterally mark the booking as disputed in our system. This protects OhMyHotel from arbitrary payment withholding.

OhMyHotel OP investigates the ticket. If valid, they (admin side) flag the booking as `disputed` so it surfaces on the customer's invoice with a "Yes" badge + remark.

---

## 2. Authority Model

| Action | Customer Master | Customer OP | OhMyHotel OP | OhMyHotel Master |
|---|:---:|:---:|:---:|:---:|
| Create dispute ticket | ✅ | ✅ | ✅ | ✅ |
| Mark booking `disputed = true` | ❌ | ❌ | ✅ | ✅ |
| Resolve dispute (mark Resolved) | ❌ | ❌ | ✅ | ✅ |
| Issue Credit Note | ❌ | ❌ | ❌ | ✅ |
| View dispute on own invoice | ✅ | ✅ | ✅ | ✅ |
| Withhold payment for disputed item | ✅ (de facto) | ✅ (de facto) | — | — |

**Note**: Customer can de-facto withhold payment by simply not wiring the disputed amount, which surfaces in OhMyHotel's payment-match queue (admin tool) — this is NOT a customer-facing feature in DOTBIZ.

---

## 3. Lifecycle

```
[Booking created]
       |
       v
[Customer notices issue with bill] → opens ticket via /app/tickets
       |
       v
[OhMyHotel OP reviews ticket]
       |
       ├── INVALID  → Ticket Resolved/Rejected · Booking unchanged · Customer notified
       |
       └── VALID    → OP marks booking.disputed=true on admin side
                            · disputeStatus = 'Open'
                            · disputeReason = (enum)
                            · disputeNote = (text)
                            · disputeTicketId = TK-xxx
                            · disputeDate = today
                      ↓
              [Booking shown as disputed on customer invoice]
                      ↓
       ┌──────────────┴──────────────┐
       v                              v
[Refund/CreditNote]              [Customer pays]
  · OhMyHotel Master issues CN     · disputeStatus = 'Resolved'
  · disputeStatus = 'Resolved'     · disputeResolvedDate = today
  · disputeResolvedDate = today    · invoice updated
  · invoice adjusted
```

---

## 4. Data Model (Booking-level fields)

Already in mock — needs ELLIS implementation:

```sql
ALTER TABLE bookings ADD COLUMN disputed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN dispute_status VARCHAR(16);  -- 'Open' | 'Resolved' | NULL
ALTER TABLE bookings ADD COLUMN dispute_reason VARCHAR(64);  -- enum (see §5)
ALTER TABLE bookings ADD COLUMN dispute_note TEXT;
ALTER TABLE bookings ADD COLUMN dispute_date DATE;
ALTER TABLE bookings ADD COLUMN dispute_resolved_date DATE;
ALTER TABLE bookings ADD COLUMN dispute_ticket_id VARCHAR(32);  -- FK tickets.id

CREATE INDEX idx_bookings_dispute ON bookings(disputed, dispute_status) WHERE disputed = TRUE;
```

---

## 5. Reason Enum

```ts
type DisputeReason =
  | "Room type mismatch"
  | "No show (guest didn't check in)"
  | "Rate higher than confirmation"
  | "Cancellation fee disputed"
  | "Hotel service complaint"
  | "Invoice amount mismatch"
  | "Other";
```

---

## 6. API Endpoints (TO BE IMPLEMENTED)

### `POST /api/admin/bookings/:id/dispute`
Mark a booking as disputed. **Admin role only.**
- Body: `{ reason, note?, ticketId }`
- Side effects: update booking row, append entry to `audit_log`, push notification to customer

### `POST /api/admin/bookings/:id/dispute/resolve`
Mark dispute as resolved. **Admin role only.**
- Body: `{ resolution: 'paid' | 'credit_note' | 'waived', notes? }`
- Side effects: update booking, optionally trigger Credit Note issuance, push notification

### `GET /api/customers/:id/disputes?status=Open`
Customer-facing read-only list of their open disputes.

---

## 7. UI Surfaces

### DOTBIZ (Customer-facing) — already implemented
- Invoice Detail → Linked Bookings → `Dispute` and `Dispute Remark` columns (read-only badges)
- Invoice Detail header → "Disputed (flagged)" KPI card
- Invoice Detail → "Dispute an item via Ticket" button → routes to `/app/tickets`
- Settlement page top header → "N open disputes · $X" KPI chip

### ELLIS (Admin-facing) — TO BE IMPLEMENTED
- Admin Tickets page → ticket detail screen → "Mark booking disputed" action
- Admin Disputes Queue (new) — list of all open disputes across customers, with quick resolve actions
- Admin Audit Trail — every dispute lifecycle event

---

## 8. Notifications (TO BE IMPLEMENTED)

| Trigger | Recipient | Channel |
|---|---|---|
| Customer raises ticket | OhMyHotel OP team | Email + in-app |
| OP marks booking disputed | Customer Master | Email + in-app |
| Dispute resolved | Customer Master | Email + in-app |
| Credit Note issued | Customer Master + Finance | Email + in-app |

---

## 9. Edge Cases

| Case | Handling |
|---|---|
| Customer raises ticket, OP rejects | Booking stays normal · ticket marked Rejected with reason |
| OP marks disputed but customer disagrees with reason | Customer can re-open ticket; admin updates note |
| Same booking disputed twice (different reasons) | Latest dispute overwrites previous · audit trail preserves history |
| Dispute resolved → customer wants to re-dispute later | New ticket required · dispute_status flips back to Open |
| Booking cancelled while disputed | Cancellation takes precedence · dispute auto-closed · no Credit Note needed |
| Invoice already paid when dispute raised | Refund via Credit Note (admin issues) |

---

## 10. Out of Scope

- Customer self-resolution
- Dispute on PREPAY bookings (PREPAY = paid up front; disputes go to refund flow handled separately)
- Multi-stage approval for dispute resolution (single OhMyHotel approver suffices)
- Automated dispute detection by ML/rules

---

## 11. Acceptance Criteria

- [ ] Customer cannot mark booking disputed via any DOTBIZ UI
- [ ] OhMyHotel admin can mark + resolve via admin endpoints
- [ ] Dispute appears on customer's Invoice Detail within 1 minute of admin action
- [ ] Customer notification sent on every status change
- [ ] Audit trail records every transition (who, when, before/after)
- [ ] Resolved disputes do NOT auto-cascade to next invoice (was a feature, removed — see CHANGELOG)
