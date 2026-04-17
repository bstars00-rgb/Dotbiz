# DOTBIZ Screen Flow Diagram

## Main User Journey

```
[Login] ──→ [Dashboard]
               │
               ├── [Find Hotel] ──→ [Search Results] ──→ [Hotel Detail] ──→ [Booking Form]
               │       │                    │                  │                   │
               │       │                    │                  ├── [Map View]      ├── [Booking Confirm]
               │       │                    │                  ├── [Markup Sharing]*    │
               │       │                    │                  ├── [Monthly Rates]*     └── [Booking Complete]
               │       │                    │                  └── [Currency Calc]
               │       │                    │
               │       │                    └── [Map Search] ──→ [Hotel Detail]*
               │       │
               │       └── DestinationSearch
               │            ├── City → Same tab (Search Results)
               │            └── Hotel → New tab* (Hotel Detail)
               │
               ├── [Bookings] ──→ [Booking Detail]
               │
               ├── [Settlement]
               │    ├── Billing Summary
               │    ├── Billing Details
               │    ├── Pre-Payment
               │    ├── Applications
               │    ├── Receipts
               │    └── Credit Notes
               │
               ├── [Client Management]
               │    ├── Sub-Accounts
               │    ├── Departments
               │    ├── Balance
               │    ├── Voucher Setting
               │    └── API Keys
               │
               ├── [Tickets] ──→ [Ticket Detail]
               │
               ├── [Notifications]
               │
               ├── [FAQ Board]
               │
               ├── [My Account]
               │    ├── Profile
               │    ├── Security
               │    ├── Notifications
               │    ├── Coupons
               │    └── OP Management
               │
               ├── [Rewards Mall]
               │
               ├── [OhMy Blog] ──→ [Article Detail]
               │
               ├── [Favorites] ──→ [Hotel Detail]*
               │
               └── [Contact Us]
```

> `*` = Opens in new browser tab

## Search Flow Detail

```
[FindHotel]
    │
    ├── Enter Destination ──→ DestinationSearch Dropdown
    │                              ├── REGION section (cities)
    │                              └── HOTEL section (hotels)
    │
    ├── Select Dates ──→ DateRangePicker
    │                       └── 2-month calendar
    │
    ├── Set Rooms/Adults/Children
    │
    ├── Set Nationality
    │
    └── [Search Button]
           │
           ├── City query → [Search Results] (same tab)
           │                    ├── 7 Filters (sidebar)
           │                    ├── Sort options
           │                    ├── Hotel cards
           │                    └── [View on Map] → [Map Search]
           │
           └── Hotel name → [Hotel Detail] (new tab*)
```

## Booking Flow Detail

```
[Hotel Detail]
    │
    ├── Select Room Variant
    │      └── [Reserve Now]
    │
    └── [Booking Form]
           │
           ├── Booker Info (pre-filled)
           ├── Booking Detail (read-only)
           ├── Travelers (editable)
           ├── Special Requests
           ├── Billing Rate
           └── [Create] → Confirm Dialog
                              │
                              ├── [Confirm] → [Booking Confirm]
                              │                    │
                              │                    └── [Booking Complete]
                              │                           └── → [Bookings List]
                              │
                              └── [Cancel] → Stay on form
```

## URL Parameter Flow

```
FindHotel → SearchResults
  ?q=shanghai&checkin=2026-04-22&checkout=2026-04-23&rooms=1&adults=2&children=0&nationality=KR

SearchResults → HotelDetail
  /hotel/htl-007?checkin=2026-04-22&checkout=2026-04-23

HotelDetail → BookingForm
  /booking/form?hotel=htl-007&room=rm-001&checkin=2026-04-22&checkout=2026-04-23

HotelDetail → MapSearch
  /map-search?q=shanghai&checkin=2026-04-22&checkout=2026-04-23

HotelDetail → MarkupSharing (new tab)
  /markup-sharing?hotel=htl-007&room=rm-001

HotelDetail → MonthlyRates (new tab)
  /monthly-rates?hotel=htl-007
```

## Settlement Sub-flow (6 tabs)

```
[Settlement]
    │
    ├── [Billing Summary] (default)
    │       └── Overview cards + monthly totals
    │
    ├── [Billing Details]
    │       ├── Filter by date range
    │       ├── Filter by hotel
    │       └── [Export] → CSV / PDF download
    │
    ├── [Pre-Payment]
    │       └── Top-up history list
    │              ├── Date / Amount / Method / Status
    │              └── [Top-up] → Payment flow
    │
    ├── [Applications]
    │       ├── [New Application] → Application form
    │       │                          └── [Submit] → Status tracking
    │       └── Application list
    │              └── Status: Approved / Pending / Rejected
    │
    ├── [Receipts]
    │       └── Receipt list
    │              └── [Download] → PDF receipt
    │
    └── [Credit Notes]
            └── Credit note list
                   └── [Download] → PDF credit note
```

## Client Management Sub-flow (5 tabs)

```
[Client Management]
    │
    ├── [Sub-Accounts]
    │       ├── User table (name / email / role / status / last login)
    │       ├── [Add User] → Add/Edit modal
    │       │                    ├── Name / Email / Role / Department
    │       │                    └── [Save] → Refresh list
    │       └── [Edit] → Add/Edit modal
    │       └── [Status Toggle] → Active / Inactive
    │
    ├── [Departments]
    │       ├── Department table (name / head / members / budget)
    │       ├── [Create] → Department form
    │       ├── [Edit] → Department form
    │       └── [Delete] → Confirm dialog
    │
    ├── [Balance]
    │       ├── Current balance card
    │       ├── Transaction history table
    │       │       └── Type: Top-up / Deduction / Refund
    │       └── [Top-up] → Top-up flow
    │
    ├── [Voucher Setting]
    │       ├── Company info fields
    │       │       └── Name / Logo / Address / Phone / Email
    │       ├── Terms & Conditions editor
    │       └── [Save] → Template config saved
    │
    └── [API Keys]
            ├── Key list (name / key / created / status)
            ├── [Generate] → New API key modal
            │                    └── Key displayed once → copy
            └── [Revoke] → Confirm dialog → Key deactivated
```

## My Account Sub-flow (5 tabs)

```
[My Account]
    │
    ├── [Profile]
    │       ├── Personal info (name / email / phone / avatar)
    │       ├── Company info (read-only)
    │       └── [Edit] → Edit form → [Save]
    │
    ├── [Security]
    │       ├── [Change Password] → Current + New + Confirm
    │       │                          └── [Save] → Password updated
    │       └── [2FA Toggle] → Enable / Disable
    │              └── QR code setup (when enabling)
    │
    ├── [Notifications]
    │       └── Preference toggles per category
    │              ├── Booking confirmations
    │              ├── Cancellation alerts
    │              ├── Payment updates
    │              ├── Check-in reminders
    │              ├── System announcements
    │              └── Promotional offers
    │
    ├── [Coupons]
    │       ├── [Available] → Active coupons list
    │       │       └── Code / Discount / Expiry / Conditions
    │       └── [History] → Used + Expired coupons
    │
    └── [OP Management] (Master only)
            ├── Partner list table
            │       └── Name / Email / Status / Share Ratio
            ├── [Add OP] → Partner form → Activation email sent
            ├── [Edit] → Partner form → [Save]
            └── [Assignment] → Booking ↔ OP assignment
```
