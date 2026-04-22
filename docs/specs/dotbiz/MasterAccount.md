# Master Account (Team Management) — Functional Spec

> **Status**: Implemented in DOTBIZ customer portal. Formerly labeled "Client Management" / "Team".
> **Last updated**: 2026-04-24
> **Related**: [Permissions.md](./Permissions.md) · [AlertSystem.md](./AlertSystem.md)

---

## 1. Overview

The **Master Account** page is the Master user's dashboard for managing company-level resources:

- **Sub-accounts** — invite / activate / deactivate team members
- **Payment Cards** — company-shared PG cards for PREPAY bookings (PREPAY only)
- **Voucher Setting** — guest-facing voucher branding (logo / contact / apply scope)

Route: `/app/client` (URL unchanged from old "Client Management" for bookmark compatibility)
Role guard: `hasRole(["Master"])` — OPs and Accounting users cannot access this page.

---

## 2. What is NOT on this page (by design)

### Departments — REMOVED
Customer team structure is flat. Role + Booking Scope + Notification Scope are the only organizational primitives. No department concept in data or UI.

### Coupons — REMOVED
Not part of DOTBIZ MVP. Mock kept for future use.

### Balance Details — MOVED to Settlement
Credit / Deferred Credit summary was duplicated here. Single source of truth is now the Credit Line card on the Settlement page.

### OP Management — MOVED from My Account to Master Account > Sub-accounts
Previously split across two pages with diverging data models (OP mgmt had Share Ratio, Client Mgmt had Role/Department). Unified under Sub-accounts.

---

## 3. Sub-accounts tab

### Behaviour
- Lists the current customer's team members only (tenant-isolated by `customerCompanyId`)
- Columns: Name · Email · Role · Booking Scope · Notif. Scope · Status · Last Login · Actions
- Filters: free-text search (name/email) + status (All / Active / Pending / Deactivated)
- Row actions:
  - **Active → Deactivate** (with `AlertDialog` confirmation, sets status=Deactivated, terminates sessions)
  - **Deactivated → Activate** (instant, sets status=Active)
  - **Pending → Resend Invitation** (re-sends setup email)

### Add Sub-account dialog

| Field | Notes |
|---|---|
| Full Name | Required |
| Email (login ID) | Required, unique per company, becomes the user's login |
| Role | `OP` / `Accounting` / `Master` |
| Booking Scope | `own` (OP default) / `all` (Accounting/Master default) |
| Notification Scope | `own` / `all-company` / `accounting-only` |

**Password**: Master does NOT set a password. An invitation email with a one-time setup link (valid 72 hours) is sent; the new user sets their own password on first access. This prevents Masters from knowing other users' credentials.

### Info banner
> "Role & permission defaults are set by your OhMyHotel AM at onboarding. Master can adjust here, but opening defaults come from ELLIS so you don't have to set them from scratch."

### Guardrails (production)
- Cannot demote or deactivate the LAST Master in a company (validation error)
- Cannot self-demote (Master cannot change own role)
- All role changes logged to `audit_log`
- `role_changed` alert fires on successful change (see AlertSystem.md #22 deferred → permissions module)

---

## 4. Payment Cards tab (PREPAY only)

### Visibility
- Shown only when `activeCompany.billingType === "PREPAY"`
- POSTPAY customers don't see this tab (they settle via invoice wires, no card needed)

### Behaviour
- Maximum **3 cards** per company (`MAX_SAVED_CARDS = 3`)
- Company-scoped — any team member making a PREPAY booking can select any saved card
- Sources:
  - Added here via **Add Card** dialog (manual entry)
  - Auto-saved during PREPAY booking checkout when user ticks "Save card for future use"

### Add Card dialog
| Field | Validation |
|---|---|
| Card Number | 13-16 digits, auto-format `XXXX XXXX XXXX XXXX`, brand detection (Visa/Mastercard/Amex/Discover) |
| Expiry (MM/YY) | `/^\d{2}\/\d{2}$/`, auto-slash after MM |
| CVC | 3-4 digits, password-masked |
| Cardholder Name | Required, auto-uppercase |

### Limit-reached state
When 3 cards saved: Add Card button disabled + amber alert
> "Maximum 3 cards reached. Remove an existing card to add a new one."

### Storage
Prototype: `localStorage` under `dotbiz_saved_cards`. Production: company-scoped PG tokens via ELLIS with PCI-DSS compliance; only last 4 visible.

---

## 5. Voucher Setting tab

### Fields (controlled form, live preview)
- Company Name (required)
- Phone
- Email
- Address
- **Company Logo** (real file upload, PNG/JPG, 2MB max, FileReader → data URL, removable)
- **Enable Voucher Branding** toggle
- **Apply Scope** radio cards:
  - `All Bookings` — branding on every voucher automatically
  - `Manual Selection` — per-booking OP decides whether to apply (for internal-staff vs client-facing trips)

### Removed fields
- `QQ` — China-specific messenger, not relevant to DOTBIZ's B2B hotel context

### Live preview
Full A4-style voucher rendered to the right of the form. Updates in real-time as user edits:
- Serif font (Georgia) for document feel
- Letterhead: logo + company name + voucher number + issue date
- Guest / Confirmation / Check-in / Check-out grid
- Hotel box (name, address, phone)
- Room / Rooms / Guests grid
- "Important" notes (ID check, times, cancellation)
- Branded footer (when enabled) or OhMyHotel-default fallback (when disabled)

### Hotel Confirmation No. placement
Preview shows `HC-GHS-9821` as sample with caption "(issued by hotel after accepting booking)". Real voucher uses the actual `booking.hotelConfirmCode`; shows "Pending" badge until hotel responds.

---

## 6. Data Model (ELLIS mapping)

```sql
-- Users (sub-accounts) — see Permissions.md for full schema
users(id, customer_company_id, email, name, role, booking_scope,
      notification_scope, status, created_at, last_login_at)

-- Saved cards (company-scoped)
payment_cards(id, customer_company_id, pg_token, last4, brand, expiry,
              holder_name, created_by_user, created_at)

-- Voucher settings (1:1 per customer)
voucher_settings(customer_company_id PRIMARY KEY, company_name, phone,
                 email, address, logo_url, enabled, apply_scope,
                 updated_by, updated_at)
```

API endpoints (prototype shortcuts shown; production via ELLIS):
- `GET /api/sub-accounts` (scoped to current Master's company)
- `POST /api/sub-accounts/invite`
- `PATCH /api/sub-accounts/:id/status`
- `POST /api/sub-accounts/:id/resend-invite`
- `GET /api/payment-cards`
- `POST /api/payment-cards` (max 3 check)
- `DELETE /api/payment-cards/:id`
- `GET /api/voucher-settings`
- `PUT /api/voucher-settings`
- `POST /api/voucher-settings/logo` (multipart upload)

---

## 7. Acceptance Criteria

- [ ] Only Master role can access /app/client; OP / Accounting get Access Restricted
- [ ] Sub-accounts filtered strictly by current user's customer_company_id
- [ ] Add Sub-account sends invite email with setup link (72h expiry)
- [ ] Master NEVER sees a password field for sub-account users
- [ ] Deactivate is a destructive action — confirmation dialog + session termination
- [ ] Reactivate is a one-click action (no confirmation needed)
- [ ] Last Master cannot be deactivated / demoted
- [ ] Payment Cards tab hidden for POSTPAY customers
- [ ] Payment Cards enforces MAX_SAVED_CARDS = 3
- [ ] Voucher Setting logo upload validates file type (PNG/JPG) and size (≤ 2MB)
- [ ] Voucher Preview renders live as form fields change
- [ ] Departments do not exist anywhere in the UI or data model
