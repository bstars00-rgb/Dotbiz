# Multi-Entity & Contract Routing — Functional Spec

> **Status**: NEW — DOTBIZ implements UI; ELLIS must add contract layer + booking-routing engine.
> **Last updated**: 2026-04-20

---

## 1. Why Multi-Entity?

OhMyHotel operates as 5 legal entities across Asia. Vietnamese tax law requires that **VN hotels sold to a VN-based customer must be invoiced by a VN entity** (domestic VAT 10%). Other Asian markets currently route everything through Singapore HQ as international B2B service exports (zero-rated).

So a single customer (e.g. GOTADI Vietnam) needs **two contracts**:
1. With **OhMyHotel SG** for non-VN hotels (USD, international, GST zero-rated)
2. With **OhMyHotel VN** for VN hotels (VND, domestic, VAT 10% included)

---

## 2. OhMyHotel Legal Entities

| Entity ID | Country | Currency | Tax System | Contract Issuer? | HQ |
|---|---|---|---|---|---|
| `omh-sg` | 🇸🇬 Singapore | USD | GST 9% (export 0%) · IRAS | ✅ Yes | ✅ Yes |
| `omh-vn` | 🇻🇳 Vietnam | VND | VAT 10% · VN-eHoaDon | ✅ Yes | — |
| `omh-kr` | 🇰🇷 Korea | KRW | VAT 10% + WHT 3.3% · NTS | ❌ Not yet | — |
| `omh-jp` | 🇯🇵 Japan | JPY | Consumption 10% · JP-Invoice | ❌ Not yet | — |
| `omh-hk` | 🇭🇰 Hong Kong | HKD | No VAT/GST | ❌ Not yet | — |

`isContractIssuer = false` entities exist corporately (for hotel-side payouts, payroll, etc.) but customers do **not** sign contracts with them. KR/JP/HK hotel bookings flow through the customer's SG contract.

This may change in the future if other markets adopt similar local-VAT requirements (e.g. Indonesia e-Faktur).

---

## 3. Data Model (ELLIS — TO BE IMPLEMENTED)

### `oh_entities` table
Stores the 5 legal entities.

```sql
CREATE TABLE oh_entities (
  id              VARCHAR(16) PRIMARY KEY,    -- 'omh-sg' | 'omh-vn' | …
  legal_name      VARCHAR(255) NOT NULL,
  short_name      VARCHAR(64) NOT NULL,
  country         CHAR(2) NOT NULL,
  tax_id          VARCHAR(64) NOT NULL,
  tax_id_label    VARCHAR(64) NOT NULL,        -- 'UEN' | 'Mã số thuế' | …
  address         TEXT NOT NULL,
  phone           VARCHAR(32),
  default_currency VARCHAR(3) NOT NULL,
  bank_name       VARCHAR(128) NOT NULL,
  bank_swift      VARCHAR(16) NOT NULL,
  bank_account    VARCHAR(64) NOT NULL,
  bank_holder     VARCHAR(255) NOT NULL,
  bank_address    TEXT,
  einvoice_system VARCHAR(32),
  is_hq           BOOLEAN NOT NULL DEFAULT FALSE,
  is_contract_issuer BOOLEAN NOT NULL DEFAULT FALSE,
  refcode_prefix  VARCHAR(4) NOT NULL          -- 'SG' | 'VN' | …
);
```

### `contracts` table
Customer ↔ Entity link with full settlement terms per pair.

```sql
CREATE TABLE contracts (
  id                  VARCHAR(32) PRIMARY KEY,   -- e.g. 'ctr-010-vn'
  customer_id         VARCHAR(32) NOT NULL,      -- FK companies.id
  oh_entity_id        VARCHAR(16) NOT NULL,      -- FK oh_entities.id
  billing_type        VARCHAR(8)  NOT NULL,      -- 'PREPAY' | 'POSTPAY'
  contract_currency   VARCHAR(3)  NOT NULL,
  settlement_cycle    VARCHAR(16),               -- 'Weekly' | 'Bi-weekly' | 'Monthly' (POSTPAY)
  payment_due_days    INTEGER,                   -- 7 / 14 / 30 (POSTPAY)
  deposit_type        VARCHAR(32) NOT NULL,
  deposit_amount      DECIMAL(14,2),
  scope_type          VARCHAR(16) NOT NULL,      -- 'INTERNATIONAL' | 'LOCAL'
  scope_countries     TEXT,                      -- JSON array, only when LOCAL: ["VN"]
  contract_date       DATE NOT NULL,
  contract_doc_url    TEXT,                      -- signed PDF reference
  status              VARCHAR(16) NOT NULL DEFAULT 'Active', -- 'Active' | 'Suspended' | 'Terminated'
  created_at          TIMESTAMP NOT NULL,
  terminated_at       TIMESTAMP,
  UNIQUE (customer_id, oh_entity_id)             -- one contract per customer×entity pair
);

CREATE INDEX idx_contracts_customer ON contracts(customer_id, status);
```

### Foreign keys on `bookings` and `invoices`

```sql
ALTER TABLE bookings ADD COLUMN contract_id VARCHAR(32) NOT NULL;
ALTER TABLE bookings ADD COLUMN oh_entity_id VARCHAR(16) NOT NULL;  -- denormalized for fast filter
ALTER TABLE invoices ADD COLUMN contract_id VARCHAR(32) NOT NULL;
ALTER TABLE invoices ADD COLUMN oh_entity_id VARCHAR(16) NOT NULL;
```

---

## 4. Booking → Contract Routing (Algorithm)

When a customer creates a booking, ELLIS must auto-resolve which contract bills it:

```
function resolveContract(customerId, hotelCountry):
  contracts = SELECT * FROM contracts
              WHERE customer_id = customerId AND status = 'Active'

  # Rule 1: prefer LOCAL contract whose scope_countries includes hotel.country
  local = contracts.find(c =>
    c.scope_type = 'LOCAL' AND
    JSON_CONTAINS(c.scope_countries, hotelCountry)
  )
  if local: return local

  # Rule 2: fallback to INTERNATIONAL contract
  international = contracts.find(c.scope_type = 'INTERNATIONAL')
  if international: return international

  # Rule 3: no eligible contract — booking blocked
  raise NoEligibleContractError
```

### Examples

| Customer | Hotel Country | Resolved Contract |
|---|---|---|
| GOTADI (SG + VN contracts) | 🇻🇳 Vietnam | VN contract → invoiced by OhMyHotel VN in VND |
| GOTADI (SG + VN contracts) | 🇰🇷 Korea | SG contract → invoiced by OhMyHotel SG in USD |
| GOTADI (SG + VN contracts) | 🇯🇵 Japan | SG contract → invoiced by OhMyHotel SG in USD |
| TravelCo (SG only) | 🇻🇳 Vietnam | SG contract (no VN contract) → invoiced by OhMyHotel SG in USD |
| TravelCo (SG only) | 🇸🇬 Singapore | SG contract → SG ✅ |

> Note: TravelCo can still book Vietnamese hotels even without a VN contract — it just gets billed by SG with international VAT treatment. The customer doesn't get the local VN VAT break, but the booking goes through.

---

## 5. Booking-time Validation (TO BE IMPLEMENTED)

When customer attempts to create a booking:

```
1. resolved_contract = resolveContract(customer.id, hotel.country)
2. if resolved_contract is None: BLOCK with "No active contract for this market"
3. if resolved_contract.deposit_amount > 0:
     if (deposit_used + booking_amount) > deposit_amount:
       BLOCK with "Booking exceeds deposit limit on {entity.shortName} contract"
4. PROCEED → write booking with contract_id and oh_entity_id
```

---

## 6. Invoice Generation

POSTPAY scheduler runs per-contract (not per-customer):

```
FOR EACH active contract WHERE billing_type = 'POSTPAY':
  bookings = bookings WHERE contract_id = contract.id
                       AND not yet invoiced
                       AND check_in_date IN current cycle window
  IF bookings.count > 0:
    create invoice with:
      contract_id, oh_entity_id, currency = contract.currency
      bookings linked
      total = sum(bookings.amount)
    issue invoice via contract.oh_entity.einvoice_system
```

**One invoice per contract per cycle**, never aggregating across contracts.

PREPAY: each booking gets its own invoice immediately upon confirmation.

---

## 7. UI (DOTBIZ — already implemented)

### Settlement page header
- Single-contract customer (most): no extra UI, badge shows the one contract's terms.
- Multi-contract customer: **"Contract:" dropdown** with options:
  - 📊 All contracts (Summary)
  - 🇸🇬 OhMyHotel SG · USD · POSTPAY
  - 🇻🇳 OhMyHotel VN · VND · POSTPAY

### Summary view (when "All contracts" selected)
Card with one tile per contract showing:
- Entity flag + short name
- Currency · billing type · cycle
- Scope badge (LOCAL/INTERNATIONAL)
- Invoice count, Total Issued, Outstanding (in contract currency)
- Click tile → switches to that contract's view

### Per-contract view (when one contract selected)
- Deposit Utilization Card uses contract's deposit type/amount/currency
- Invoices, Billing Details, AR all scoped to that contract
- Top-Up Dialog uses that contract's entity bank info + ref code prefix

### Top-Up Reference Code format
- Single-entity: `TUP-YYYYMMDD-XXXX`
- Multi-entity: `TUP-{ENTITY_PREFIX}-YYYYMMDD-XXXX` (e.g. `TUP-VN-20260420-A4F7`)

The entity prefix lets ELLIS reconciliation route incoming wires to the right entity's accounting books.

---

## 8. Tax Treatment by Routing

| Contract type | Customer location | Hotel location | Invoice from | VAT |
|---|---|---|---|---|
| INTERNATIONAL (SG) | Any | Any non-VN | OhMyHotel SG | Zero-rated (export of services) |
| LOCAL (VN) | Vietnam-based customer | Vietnam | OhMyHotel VN | VND VAT 10% (domestic supply) |
| LOCAL (future KR) | Korea-based customer | Korea | OhMyHotel KR | KRW VAT 10% + WHT 3.3% |

For DOTBIZ display: invoice.total = the all-in number customer wires (VAT internal).

---

## 9. Demo Accounts (for QA)

| Login | Customer | Contracts |
|---|---|---|
| `master@dotbiz.com` / `master123` | TravelCo International | SG only (POSTPAY) |
| `prepay@dotbiz.com` / `prepay123` | Asia Tours Ltd. | SG only (PREPAY) |
| **`gotadi@dotbiz.com` / `gotadi123`** | **GOTADI** | **SG + VN (POSTPAY × 2)** ← multi-entity demo |
| **`vvc@dotbiz.com` / `vvc123`** | **Vietnam Vacation Co** | **SG + VN (PREPAY × 2)** ← multi-entity demo |

---

## 10. Out of Scope

- Cross-contract invoice consolidation (each entity bills independently)
- Customer self-serve contract creation (always offline + DOTBIZ admin onboarding)
- Currency conversion at customer's request (each contract = one fixed currency)
- Inter-entity transfers (handled in OhMyHotel internal accounting)
- Automatic country-spread for KR/JP/HK if local entity becomes contract issuer (will need migration spec)

---

## 11. Acceptance Criteria

- [ ] Booking creation auto-resolves to correct contract by hotel country
- [ ] Booking with no eligible contract is blocked with explicit error
- [ ] POSTPAY scheduler creates one invoice per contract per cycle
- [ ] Invoice shows the issuing entity's full legal name + tax ID + bank info on PDF
- [ ] Top-Up wires to entity-specific bank account get auto-attributed via ref code prefix
- [ ] Customer Settlement page filters all invoices/bills/AR/deposit by selected contract
- [ ] "All contracts" summary view shows correct totals per contract in their native currency
- [ ] Existing single-contract customers (TravelCo etc.) see no change in UX
- [ ] Audit trail logs every booking → contract resolution decision
