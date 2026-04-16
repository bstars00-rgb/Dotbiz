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
