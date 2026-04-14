<!-- Synced with ko version: 2026-03-28T00:00:00Z -->

# DOTBIZ B2B Hotel Booking System — Functional Specification

> **Status**: FINALIZED
> **Author**: Planning Plugin (Auto-generated)
> **Created**: 2026-03-28T09:00:00Z
> **Last Updated**: 2026-03-28T12:00:00Z

---

## 1. Overview

### 1.1 Purpose
DOTBIZ is an AI-powered next-generation B2B hotel booking platform that provides Operating Partners (OPs) with an intuitive and efficient booking experience. Through a Net Rate supply model, it ensures partner margin autonomy, and maximizes operational efficiency by offering payment processes optimized per business type (prepaid/postpaid) and real-time operational tools.

This spec is intended for re-implementing the same functionality as the existing prototype for production development, using a Frontend (Vanilla JS SPA) + Mock API architecture. Data storage will continue to use LocalStorage + JSON.

### 1.2 Target Users

| Role | Description | Key Functions |
|------|-------------|---------------|
| Master | Company administrator | Manage all OPs, settlement access, OP performance comparison, view all bookings |
| OP (Operating Partner) | Operations staff | Hotel search/booking, guest handling, personal performance tracking, view own bookings only |

**No Admin role required**: Actions such as company registration approval are handled manually outside the system (internal process).

### 1.3 Success Metrics

| KPI | Target | Measurement Method |
|-----|--------|--------------------|
| Page load time | < 2 seconds | Performance API |
| Hotel search response time | < 1 second | Search execution to result display |
| AI response time | < 5 seconds | Claude API call to response display |
| Booking conversion rate | Measurable | Booking Conversion Funnel |
| System availability | 99.9% | Uptime monitoring |

---

## 2. User Stories

| ID | Role | Goal | Priority |
|----|------|------|----------|
| US-001 | OP | Log in with email/password to access the system | P0 |
| US-002 | New company | Create an account through the 3-Step registration process | P0 |
| US-003 | OP | Search for hotels by destination, dates, and guest count | P0 |
| US-004 | OP | View search results in list/map view and apply filters/sorting | P0 |
| US-005 | OP | Review hotel details and select a room | P0 |
| US-006 | OP | Enter guest information and confirm a booking | P0 |
| US-007 | OP | Download or email a voucher after booking completion | P0 |
| US-008 | OP | View, filter, and manage all bookings from the booking list | P0 |
| US-009 | OP | Cancel a booking and review refund information | P0 |
| US-010 | OP | Visualize monthly booking status in a calendar view | P1 |
| US-011 | Master | Review monthly settlement details and manage invoices | P0 |
| US-012 | Master | Manage Accounts Receivable and process payments | P0 |
| US-013 | OP | Use the AI assistant for natural-language hotel search and booking analysis | P1 |
| US-014 | OP | Check and act on important notifications in the notification center | P1 |
| US-015 | OP/Master | View KPIs and business analytics on the dashboard | P1 |
| US-016 | OP | Redeem rewards with OP Points | P2 |
| US-017 | OP | Handle booking-related inquiries via Support Chat | P2 |
| US-018 | OP | Find answers to frequently asked questions in the FAQ Board | P2 |
| US-019 | Master | Create, edit, and deactivate OP accounts and configure Share ratios | P0 |
| US-020 | OP | Save frequently booked hotels to favorites | P1 |
| US-021 | OP | Configure dark mode, language, and currency settings | P1 |
| US-022 | OP | Re-book a cancelled reservation | P1 |
| US-023 | Master | Compare and analyze performance by OP | P1 |
| US-024 | OP | Transfer points to another OP within the same company | P2 |

---

## 3. Functional Requirements

### FR-AUTH: Authentication & Account

#### FR-AUTH-001: Login
**Description**: Email/password-based login system

**Business Rules**:
- BR-001: On successful login, navigate to the Dashboard screen
- BR-002: If Remember Me is checked, store the email in localStorage
- BR-003: Role-based access control (Master can access Settlement; OP cannot)
- BR-004: Session timeout after 30 minutes

**Input Validation**:
- Email: max 254 characters (RFC 5321), email format validation
- Password: max 128 characters
- Account lockout after 5 consecutive failed login attempts (auto-unlock after 30 minutes or manual unlock by Master)
- Session timeout: 30 minutes of inactivity (mouse movement, keyboard input, and API calls count as activity)
- Warning popup 5 minutes before timeout: includes "Extend Session" button; clicking it resets the timeout to 30 minutes. If the popup is ignored, the session expires in 5 minutes. If user activity (keyboard/mouse) is detected while the popup is visible, the popup closes automatically and the timer resets.
- On timeout, any form data being entered is temporarily preserved in sessionStorage, and restoration is attempted after re-login

**Acceptance Criteria**:
- [ ] AC-001: Successful login with valid email/password
- [ ] AC-002: Error message displayed for invalid credentials
- [ ] AC-003: Email auto-filled on re-visit when Remember Me was checked
- [ ] AC-004: Dark mode toggle button is visible on the login screen
- [ ] AC-004a: Account lock message displayed after 5 consecutive failed login attempts

#### FR-AUTH-005: Forgot Password / Password Reset
**Description**: Email-based password reset when password is forgotten

**Business Rules**:
- BR-100: Provide a "Forgot Password?" link on the Login screen
- BR-101: Enter registered email → send reset link (Mock: simulated — navigate immediately to the reset screen)
- BR-102: Enter new password (min 8 characters, letters + numbers + special characters)
- BR-103: Password confirmation field is required
- BR-104: Navigate to Login screen after reset is complete

**Acceptance Criteria**:
- [ ] AC-050: Reset screen is shown when a reset request is made with a registered email
- [ ] AC-051: Error message shown for unregistered email (same message recommended for security)
- [ ] AC-052: Login is possible after setting a new password

---

#### FR-AUTH-002: Self-Registration
**Description**: 3-Step registration process

**Business Rules**:
- BR-005: Step 1 — Company information (Company Name, Business Registration No., Business Type (prepaid/postpaid), Address, Phone, Email)
- BR-006: Step 2 — User information (Full Name, Position, Email, Password, Mobile, Preferred Language)
- BR-007: Step 3 — B2B Terms of Service checkbox, automatic contract generation and download
- BR-008: Account created in Pending status upon completion (requires internal manual approval)
- BR-105: After registration, show a "Pending approval" guidance screen → auto-redirect to Login screen after 5 seconds (or provide a "Go to Login" button)
- BR-106: Email notification simulation on approval (Mock: can immediately switch to Active status)

**Input Validation**:
- Company Name: required, max 100 characters
- Business Registration No.: required, free format (varies by country), max 20 characters
- Email: required, email format, duplicate check (validated when Next is clicked in Step 2)
- Password: required, 8–128 characters, letters + numbers + special characters, must match PasswordConfirm field
- Phone/Mobile: numbers + hyphens, max 20 characters

**Acceptance Criteria**:
- [ ] AC-005: Required field validation for each step (based on the above rules)
- [ ] AC-006: Contract PDF is downloadable after checking the terms in Step 3
- [ ] AC-007: Pending status guidance message shown after completion, auto-redirect to Login after 5 seconds
- [ ] AC-007a: ERR-REG-001 error shown for duplicate email
- [ ] AC-007b: Error shown when password and password confirmation do not match

#### FR-AUTH-003: Account Management (My Account)
**Description**: User and company information management

**Business Rules**:
- BR-009: Edit personal information (name, contact details, password)
- BR-010: View company information (Business Type, contract date)
- BR-011: Prepaid company — list of registered corporate cards, set default card
- BR-012: Postpaid company — Floating Deposit balance, Credit Line limit

**Acceptance Criteria**:
- [ ] AC-008: Changes are reflected immediately
- [ ] AC-009: Payment information section differs based on company type

#### FR-AUTH-004: Multi-OP System
**Description**: Management of multiple OP accounts within a single company (Master only)

**Business Rules**:
- BR-013: Master creates, edits, and deactivates OP accounts
- BR-014: Each OP has an independent login (email/password)
- BR-015: Configure Share ratio per OP (for points distribution)
- BR-016: View booking performance per OP
- BR-017: No limit on the number of OPs per company
- BR-107: On OP deactivation: existing booking data is preserved (viewable by Master), new bookings cannot be created, existing booking notifications are forwarded to Master
- BR-108: When Share ratio is changed: the new ratio applies from points earned after the change (no retroactive adjustment to existing records)

**Acceptance Criteria**:
- [ ] AC-010: Each OP can only view their own bookings (Master can view all)
- [ ] AC-011: Changing the OP Share ratio by Master takes effect immediately (from new earnings)
- [ ] AC-011a: Bookings of a deactivated OP continue to appear in the Master's booking list
- [ ] AC-011b: ERR-AUTH-003 is shown when attempting to log in as a deactivated OP

---

### Booking Status Transition Diagram

```
[Pending] --payment complete (prepaid) / confirmed (postpaid)--> [Confirmed]
[Pending] --cancellation request--> [Cancelled]
[Confirmed] --cancellation request--> [Cancelled]
[Confirmed] --checkout date passed--> [Completed]
[Confirmed] --check-in date passed + no show--> [No-show]
[Cancelled] --re-book--> new booking [Pending] created (original stays Cancelled)
```

**Status Transition Rules**:
- Pending → Confirmed: When prepaid company completes payment, or postpaid company confirms Deposit/Credit
- Pending → Cancelled: User cancellation or auto-cancellation when prepaid RNPL Deadline is exceeded
- Confirmed → Cancelled: User cancellation (cancellation fee policy applies)
- Confirmed → Completed: Automatic transition on checkout date + 1 day (system)
- Confirmed → No-show: Check-in date + 1 day, manual transition if no check-in (Master or system)
- **Irreversible transitions**: No transitions possible out of Cancelled, Completed, or No-show
- **Re-book**: Creates a new independent booking from a Cancelled booking (original status is preserved)

### Payment Status Transitions

6 payment status definitions:
1. **Not Paid**: Unpaid (initial state for RNPL bookings)
2. **Partially Paid**: Partial payment in progress (split payment ongoing)
3. **Fully Paid**: Paid in full
4. **Refunded**: Full refund (after cancellation with full refund)
5. **Partially Refunded**: Partial refund (after refund with cancellation fee deducted)
6. **Pending**: Payment processing (awaiting PG response)

```
[Not Paid] --full payment--> [Fully Paid]
[Not Paid] --partial payment--> [Partially Paid]
[Partially Paid] --remaining balance payment--> [Fully Paid]
[Fully Paid] --full refund--> [Refunded]
[Fully Paid] --partial refund (fee deducted)--> [Partially Refunded]
[Pending] --payment success--> [Fully Paid]
[Pending] --payment failure--> [Not Paid]
```

### Cancellation Fee Data Structure

Cancellation policy data per hotel/room:
```json
{
  "cancellationPolicy": {
    "type": "free_cancel" | "partial_refund" | "non_refundable",
    "freeCancelBeforeDays": 3,
    "penalties": [
      { "daysBeforeCheckIn": 3, "feeType": "percent", "feeValue": 0 },
      { "daysBeforeCheckIn": 1, "feeType": "percent", "feeValue": 50 },
      { "daysBeforeCheckIn": 0, "feeType": "percent", "feeValue": 100 }
    ]
  }
}
```
- **Free Cancel**: 0% fee when cancelled before freeCancelBeforeDays
- **Partial Refund**: Tiered fee rates applied (see penalties array above)
- **Non-Refundable**: 100% fee on cancellation. Clicking Cancel shows a warning modal — "A 100% fee will be charged. Are you sure you want to cancel?" — and cancellation proceeds upon user confirmation.
- Boundary value: Based on 00:00:00 on the day of freeCancelBeforeDays (midnight N days before check-in date)
- On payment failure: Booking is not created, and the user is returned to Booking Form (can select a different card or retry)

### Currency Exchange Rate Handling

- **Exchange rate source**: Fixed rate JSON file (exchangeRates.json), base currency USD
- **Exchange rate application**: Display-only conversion; payment/settlement stored in original currency (USD)
- **Decimal places by currency**: KRW/JPY/VND → 0 decimal places; USD/EUR/GBP/SGD/HKD/THB → 2 decimal places; CNY → 2 decimal places
- **Rate updates**: Not required since rates are fixed (cache policy to be added when API integration is implemented)
- **On booking confirmation**: Stored in original currency (USD); vouchers/receipts also show the USD amount alongside the selected currency

### Multiple Room Booking Rules

- For bookings of 2 or more rooms: Only one representative guest (Primary Traveler) needs to be entered (simplified)
- "1st Traveler" column in the booking list: Shows the Primary Traveler's name
- Same guest information applies to all rooms
- Future expansion: Individual guest input per room

---

### FR-SEARCH: Hotel Search

#### FR-SEARCH-001: Find Hotel Main
**Description**: Hotel search entry point

**Business Rules**:
- BR-018: Destination autocomplete — major Asian cities (Shanghai, Tokyo, Bangkok, Singapore, etc.), landmarks, hotel names
- BR-019: Check-in / Check-out date selection, Nights auto-calculated
- BR-020: Rooms / Adults / Children selectors, individual child age input
- BR-021: Nationality selection
- BR-022: Favorite hotels section displayed

**Input Validation**:
- Check-in date: Must be today or later
- Check-out date: Must be after check-in
- Minimum 1 night, maximum 30 nights
- Rooms: 1–10
- Adults: 1–10 (minimum 1 per room)
- Children: 0–10, age 0–17
- Check-in = Check-out (0 nights) not allowed

**Acceptance Criteria**:
- [ ] AC-012: Navigate to results page when Search button is clicked
- [ ] AC-013: Autocomplete suggestions shown in real time while typing
- [ ] AC-013a: Error shown when a past check-in date is selected
- [ ] AC-013b: Error shown when check-out < check-in

#### FR-SEARCH-002: Search Results — List View
**Description**: Hotel list display

**Business Rules**:
- BR-023: Hotel card — image, name, area, star rating, review score, review count, price (in selected currency)
- BR-024: FEATURED / FREE CANCEL badges
- BR-025: Amenity tags (WiFi, Pool, Spa, Gym)
- BR-026: Favorite star toggle
- BR-027: Filter sidebar — star rating, price range, area, amenities
- BR-028: Sort — Recommended, Price (↑↓), Rating

- BR-028a: Search result display — full JSON data loaded, then filtered/sorted/paginated on the frontend (20 items per page, infinite scroll or pagination)

**Acceptance Criteria**:
- [ ] AC-014: Filter/sort changes are immediately reflected
- [ ] AC-015: Clicking a hotel card navigates to the detail page

#### FR-SEARCH-003: Search Results — Map View
**Description**: Leaflet.js + OpenStreetMap-based map search

**Business Rules**:
- BR-029: Price markers (based on selected currency)
- BR-030: Click marker to show popup (image, name, rating, remaining rooms)
- BR-031: Discount markers (red dot)
- BR-032: Hotel list in sidebar linked to map; bidirectional highlighting between markers and list

**Acceptance Criteria**:
- [ ] AC-016: Toggle between List ↔ Map via "View hotels on map" button

#### FR-SEARCH-004: Favorite Hotels
**Description**: Save frequently booked hotels

**Business Rules**:
- BR-033: Toggle by clicking the star icon on hotel cards or detail pages
- BR-034: Permanently stored in localStorage

**Acceptance Criteria**:
- [ ] AC-017: Adding/removing favorites is immediately reflected

---

### FR-HOTEL: Hotel Detail

#### FR-HOTEL-001: Hotel Detail Page
**Description**: Hotel information and room selection

**Business Rules**:
- BR-035: Breadcrumb navigation
- BR-036: Compact search bar (dates/room count can be modified)
- BR-037: Hero section (image, name, star rating, review score)
- BR-038: 4 tabs — Rooms, Overview, Policies, Facilities

#### FR-HOTEL-002: Rooms Tab
**Description**: Room list and filters

**Business Rules**:
- BR-039: Filters — Room Type, Bed Type, Price Range, Meal Plan, Refundable Only
- BR-040: Room card — room name, bed type, max guests, cancellation policy, breakfast included, price, Select button

**Acceptance Criteria**:
- [ ] AC-018: Real-time filtering when filter is changed

#### FR-HOTEL-003: Overview Tab
**Description**: Hotel description, key highlights, and location information

#### FR-HOTEL-004: Policies Tab
**Description**: Check-in/out times, cancellation policy, children/infant/pet/smoking policies

#### FR-HOTEL-005: Facilities Tab
**Description**: Facilities list by category (General, Recreation, Business, etc.), icon + text

---

### FR-BOOK: Booking Process

#### FR-BOOK-001: Booking Form (Step 1)
**Description**: Guest information entry and payment method selection

**Business Rules**:
- BR-041: Guest Name (First/Last), Email, Mobile, Special Requests
- BR-042: Booking summary sidebar
- BR-043: Prepaid company — select registered corporate card or Reserve Now Pay Later
- BR-044: Postpaid company — deduct from Floating Deposit or use Credit Line

**Acceptance Criteria**:
- [ ] AC-019: Proceed to next step only after required field validation

#### FR-BOOK-002: Booking Confirmation (Step 2)
**Description**: Final review and terms agreement

**Business Rules**:
- BR-045: Booking information summary (hotel, dates, room, guest)
- BR-046: Price details (Room Rate, Tax, Total)
- BR-047: Cancellation policy notice
- BR-048: Terms & Conditions checkbox → activates the Confirm Booking button

#### FR-BOOK-003: Booking Complete (Step 3)
**Description**: Booking success screen

**Business Rules**:
- BR-049: Success icon and message
- BR-050: ELLIS Booking Code generation — format: `K` + `YYMMDD` + `HHMMSS` + `H` + `NN` (NN = daily sequence number 01–99, reset to 01 at local browser midnight 00:00:00. NN increments automatically on collision. If more than 100 bookings occur in a day, NN is expanded to 3 digits (100–999). A UUID-based unique ID is maintained internally; the ELLIS Code is for display purposes only.)
- BR-051: Voucher download / email send buttons
- BR-052: My Bookings / New Booking buttons

**Acceptance Criteria**:
- [ ] AC-020: Booking is immediately reflected in the booking list

#### FR-BOOK-004: Booking Cancellation
**Description**: Booking cancellation process

**Business Rules**:
- BR-053: Select cancellation reason (dropdown)
- BR-054: Automatic cancellation fee calculation (based on hotel-specific policies from internal data)
- BR-055: Display estimated refund amount
- BR-056: Cancellation confirmation modal
- BR-057: Prepaid company — automatic cancellation with warning when RNPL Cancel Deadline is exceeded without payment

**Acceptance Criteria**:
- [ ] AC-021: Status updated and notification created upon cancellation completion

#### FR-BOOK-005: Re-book
**Description**: Re-book a cancelled booking

**Business Rules**:
- BR-058: Re-book button on the cancellation completion screen
- BR-059: Navigate to the same hotel detail page with the original dates retained

---

### FR-BKG: Booking Management

#### FR-BKG-001: Booking List
**Description**: View and manage all bookings (14-column table)

**Business Rules**:
- BR-060: Columns — Checkbox, Booking Date, ELLIS Code, Booking Status (Confirmed/Cancelled/Pending/No-show/Completed), Payment Status, Hotel Name, Cancel Deadline, Check-in & Nights, Room Type & Count, 1st Traveler, Currency, Sum Amount, Invoice No., Dispute
- BR-061: Select 20/50/100 items per page

#### FR-BKG-002: Booking Filters
**Description**: Multi-condition filtering

**Business Rules**:
- BR-062: Date Type filter — Booking/Cancel/Check In/Check Out/Cancel Deadline/Stay Date
- BR-063: Additional filters — ELLIS Code, Booking Status, Payment Status (6 types), Search By (Booker/Traveler/Mobile), Country, Hotel Name

#### FR-BKG-003: Booking Detail Modal
**Description**: View full booking information (9 sections)

**Business Rules**:
- BR-064: Booking Summary, Hotel Info, Room Details, Guest Info, Payment Info, Cancellation Policy, Special Requests, Booking Timeline, Actions (voucher/receipt/cancel)
- BR-064a: Booking Modification (Modify): In MVP, only guest information (name, email, contact, Special Requests) can be modified. Date/room changes are handled by cancelling and re-booking.
- BR-065: Open by clicking a table row or pasting an ELLIS Code (ELLIS Code pattern detection in TopBar GlobalSearch — entering an ELLIS Code automatically opens the corresponding booking detail modal)

#### FR-BKG-004: Calendar View
**Description**: Monthly booking status visualization

**Business Rules**:
- BR-066: Month navigation (Prev/Today/Next)
- BR-067: Event colors — Check-in (Blue), Check-out (Yellow), Stay (Green), Cancelled (Red), Cancel Deadline (Pink)
- BR-068: Maximum 3 events per cell, "+N more" indicator
- BR-069: Monthly statistics cards (Confirmed, Cancelled, Room Nights, Net Cost, Unpaid)
- BR-070: Upcoming Check-ins table (next 5 bookings, D-day color coding)

#### FR-BKG-005: Excel Export
**Description**: Download currently filtered booking data as .xlsx

#### FR-BKG-006: Bulk Voucher Download
**Description**: Multi-select via checkboxes → ZIP or individual download

---

### FR-DOC: Vouchers and Documents

#### FR-DOC-001: Booking Voucher
**Description**: Booking confirmation document for hotel submission (PDF)

**Business Rules**:
- BR-071: ELLIS Code, hotel information, check-in/out, guest information, room information, cancellation policy, QR code
- BR-072: PDF download and email send (external libraries such as html2pdf.js are permitted)

#### FR-DOC-002: Receipt
**Description**: Payment confirmation PDF

#### FR-DOC-003: Cancellation Confirmation
**Description**: Booking cancellation evidence PDF

#### FR-DOC-004: B2B Service Agreement
**Description**: Service agreement PDF automatically generated at registration

---

### FR-SET: Settlement System (Master only)

#### FR-SET-001: Monthly Settlement
**Description**: Monthly settlement details

**Business Rules**:
- BR-073: Month selection dropdown
- BR-074: Settlement summary cards (Total Net Cost, Room Nights, Avg Net/Night)
- BR-075: Daily detail table
- BR-076: PDF/Excel download

#### FR-SET-002: Invoices
**Description**: View/issue monthly invoices

**Business Rules**:
- BR-077: Status — Draft, Issued, Paid
- BR-078: Supply amount, VAT (10%), total
- BR-079: Auto-generated monthly, manual issuance possible

#### FR-SET-003: Accounts Receivable
**Description**: Manage unpaid bookings

**Business Rules**:
- BR-080: List of unpaid items, Cancel Deadline D-day indicator
- BR-081: Individual/bulk payment, split payment option
- BR-081a: Split payment: user manually enters the payment amount (minimum payment = 10% of total)
- BR-081b: On split payment, Payment Status → Partially Paid; remaining amount continues to appear in AR
- BR-081c: Maximum number of split payments: 5
- BR-081d: Payment Status → Fully Paid upon final payment completion
- BR-082: Prepaid company — corporate card payment; postpaid company — Deposit deduction/bank transfer

#### FR-SET-004: OP Points Settlement
**Description**: Points earning/usage/transfer history and balance

#### FR-SET-005: Purchase by Hotel
**Description**: Purchase analysis by hotel (total purchase amount, count, average transaction value, share, chart)

---

### FR-PAY: Payment System

#### FR-PAY-001: Prepaid Company
**Description**: Corporate card PG auto-payment + Reserve Now Pay Later

**Business Rules**:
- BR-083: Non-Refundable — immediate corporate card payment (PG simulation)
- BR-084: Refundable — confirmed without payment at booking; payment required before Cancel Deadline
- BR-085: Warning notifications sent in advance at D-3 and D-1 before Cancel Deadline. Automatic cancellation immediately upon Deadline exceeded (no grace period)

#### FR-PAY-002: Postpaid Company (Credit)
**Description**: Floating Deposit + Credit Line

**Business Rules**:
- BR-086: Floating Deposit — balance display, real-time deduction on booking
- BR-086a: On insufficient Deposit balance: Present user with a confirmation UI — "Deposit balance is insufficient. Would you like to use the Credit Line?" (not an automatic switch)
- BR-086b: Mixed Deposit + Credit payment is not allowed — must choose either full Deposit or full Credit Line
- BR-086c: If both are insufficient, ERR-PAY-005 is shown (booking not possible)
- BR-087: Credit Line — credit limit based on Deposit, free bookings within the limit, consolidated settlement at month end
- BR-088: Low Deposit warning — Critical notification when Deposit < $5,000

---

### FR-PTS: OP Points System

#### FR-PTS-001: Points Earning
**Description**: Points earned based on booking amount (fixed rate, loaded from internal data settings)

**Business Rules**:
- BR-089: Automatically earned when a booking is completed
- BR-090: Distributed according to the Share ratio per OP

#### FR-PTS-002: Points Usage (Rewards Mall)
**Description**: 6 categories, 20+ products

#### FR-PTS-003: Points Transfer
**Description**: Transfer points between OPs within the same company (Master or self only)

#### FR-PTS-004: Points History
**Description**: View earning/usage/transfer history, period filter

---

### FR-AI: AI Booking Assistant (Floating Widget)

#### FR-AI-001: Natural-Language Hotel Recommendation
**Description**: Natural-language hotel search powered by Claude API (API call method TBD)

**Business Rules**:
- BR-091: Clickable hotel card response
- BR-092: Clicking a hotel card navigates to the detail page

#### FR-AI-002: Booking Analysis
**Description**: Analysis of user booking patterns (total bookings, spending, frequency, average transaction value, preferred destinations)

#### FR-AI-003: Area Guide
**Description**: Travel destination information (area characteristics, purpose-based recommendations, transport accessibility)

#### FR-AI-004: Quick Actions
**Description**: Shortcut buttons for frequently used functions (hotel recommendation, booking analysis, area guide, help)

#### FR-AI-005: Local Fallback
**Description**: Fallback response based on local hotel data when API connection fails

**Fallback scope**:
- Hotel recommendation (FR-AI-001): Supported — returns up to 5 hotel cards from local JSON data (cards only, no text description)
- Booking analysis (FR-AI-002): Not supported — "AI service is currently unavailable" message
- Area guide (FR-AI-003): Not supported — "AI service is currently unavailable" message
- A "Limited service mode" notice banner is displayed in fallback state

---

### FR-NOTI: Notification Center

#### FR-NOTI-001: Notification List
**Description**: View all notifications (tabs: All, Unread, Deadlines, Payment, Check-in, Bookings, Cancelled, System)

#### FR-NOTI-002: Notification Priority
**Description**: Critical (red) > High (yellow) > Medium (green) > Low (gray)

#### FR-NOTI-003: Automatic Notification Generation
**Description**: Auto-generated when conditions are met

**Notification generation timing:**
| Notification Type | Timing | Priority | Deduplication Key |
|-------------------|--------|----------|-------------------|
| Cancel Deadline | D-7, D-3, D-1 | Medium, High, Critical | booking_id + type + D-N |
| Check-in Reminder | D-3, D-1 | Medium, High | booking_id + type + D-N |
| Payment Pending | Immediately on booking creation | Medium | booking_id + "payment" |
| Booking Confirmed | Immediately on booking confirmation | Low | booking_id + "confirmed" |
| Booking Cancelled | Immediately on cancellation | Low | booking_id + "cancelled" |
| Low Deposit | When balance is checked | Critical | tenant_id + "low_deposit" |

- If a notification with the same dedup_key already exists, a duplicate is not created

#### FR-NOTI-004: Notification Settings
**Description**: Notification receive toggles (Cancel Deadline, Check-in, Payment, Booking, Email, Promotional, System, Quiet Hours)

#### FR-NOTI-005: Notification Summary Cards
**Description**: Summary of Critical/Unread/Deadlines/Payments counts

---

### FR-DASH: Dashboard

#### FR-DASH-001: KPI Cards
**Description**: Total Bookings, Revenue (TTV), Room Nights, Avg Booking Value + period-over-period change

#### FR-DASH-002: OP Points Widget
**Description**: Current balance, this month's earned/used, Rewards Mall shortcut

#### FR-DASH-003: Top Hotels
**Description**: Top 5 hotels, booking count/total amount

#### FR-DASH-004: 12-Month TTV Trend
**Description**: CSS-based bar chart, current month highlighted

#### FR-DASH-005: Booking Conversion Funnel
**Description**: Searches → Room Views → Booking Started → Confirmed → Completed

#### FR-DASH-006: Hotel Profitability
**Description**: Average Net/Night per hotel, booking count, trend

#### FR-DASH-007: OP Performance Comparison (Master only)
**Description**: Booking count/TTV/Room Nights/Avg transaction value per OP + ranking

#### FR-DASH-008: My Performance KPIs (OP only)
**Description**: Booking Success Rate, Avg Response Time, Satisfaction, Repeat Rate + gauge bars

---

### FR-CHAT: Support Chat

#### FR-CHAT-001: Chat System
**Description**: Chat room list, message area, input field, file attachment (tab within Bookings page)

#### FR-CHAT-002: ELLIS Code Auto-Detection
**Description**: Detect ELLIS Code pattern in chat → auto-load booking information

#### FR-CHAT-003: AI Chatbot (First Response)
**Description**: FAQ-based automatic responses; escalate to agent if no answer is available

#### FR-CHAT-004: Agent Escalation
**Description**: Connect to Agent button, change to agent-connected status

---

### FR-FAQ: FAQ Board

#### FR-FAQ-001: FAQ List
**Description**: Category tabs (All, Booking, Payment, Cancellation, Account, Technical), 22+ articles, accordion

#### FR-FAQ-002: FAQ Search
**Description**: Keyword search, targets title + content, real-time results

---

### FR-UI: UI/UX

#### FR-UI-001: Dark Mode
**Description**: CSS Variables-based, header toggle (🌙/☀️), stored in localStorage

#### FR-UI-002: Language Selection
**Description**: 5 languages (EN, KO, JA, ZH, VI), header dropdown, full translation implemented

#### FR-UI-003: Currency Selection
**Description**: 10 currencies (USD, KRW, JPY, CNY, VND, EUR, GBP, THB, SGD, HKD)

#### FR-UI-004: Responsive Layout
**Description**: Desktop-optimized (1024px+), tablet support

#### FR-UI-005: Ohmyhotel CI Applied
**Description**: Primary #FF6000, Success #009505, Background #FCFCF8

---

## Spec Files

| File | Contents |
|------|----------|
| `screens.md` | Screen Definitions, Error Handling |
| `test-scenarios.md` | Non-Functional Requirements, Test Scenarios |

---

## 8. Open Questions

| ID | Question | Context | Status |
|----|----------|---------|--------|
| OQ-001 | Claude API call method (frontend direct vs. proxy server) | Security concern — API key may be exposed on the frontend | OPEN |
| OQ-002 | Specific OP Points earning rate setting | Loaded from internal data, but a Mock default value is needed (e.g., 1%) | OPEN |
| OQ-003 | Points monetary value (1P = ?) | Required for pricing products in the Rewards Mall | OPEN |
| OQ-004 | Initial hotel data set size | Minimum 50 hotels across major Asian cities is recommended when hardcoding JSON | OPEN |
| OQ-005 | Excel export library | Whether SheetJS is permitted (PDF: html2pdf.js is confirmed as permitted) | OPEN |
| OQ-006 | Support Chat Mock behavior | Only AI chatbot operates; "agent currently unavailable" simulation is recommended when connecting to agent | OPEN |
| OQ-007 | Invoice auto-generation timing | Auto Draft generation on the 1st of each month, Master manually sets to Issued — needs confirmation | OPEN |

---

## 9. Review History

| Round | Planner Score | Tester Score | Key Decisions | Date |
|-------|---------------|--------------|---------------|------|
| 1 | 7/10 | 4/10 | Added password recovery, status transition diagram, 6 payment status definitions, cancellation fee structure, currency exchange rates, input validation, ELLIS Code collision handling, multiple rooms, Deposit/Credit switching, split payment, OP deactivation, notification timing, AI fallback | 2026-03-28 |
| 2 | 8/10 | 7/10 | Resolved Non-Refundable cancellation contradiction (warning then allow cancellation), ELLIS Code 100+ expansion, session warning popup details, RNPL auto-cancellation timing confirmed | 2026-03-28 |
