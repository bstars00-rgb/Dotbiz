# UX Patterns — Hotel / Travel

> Part of [DOTBIZ Design System](../MASTER.md)

## Pattern Index

| Pattern | Category | Components Used |
|---------|----------|-----------------|
| **booking-wizard** | booking | BookingWizard, DateRangePicker, GuestForm, PriceDisplay, BookingSummary, Button |
| **room-browser** | search-filter | SearchBar, FilterPanel, RoomCard, MapView, Pagination, Badge |
| **availability-calendar** | data-display | AvailabilityCalendar, PriceDisplay, Badge, Button |
| **room-detail** | data-display | RoomGallery, AmenityList, PriceDisplay, ReviewCard, BookingSummary, Button |
| **payment-flow** | booking | Card, Tabs, ComplexForm, PriceDisplay, Button, Alert, Toast |
| **cancellation-flow** | booking | Card, Alert, Select, PriceDisplay, AlertDialog, Button, Toast |
| **destination-search** | search-filter | SearchBar, Card, Badge, Button |
| **hotel-dashboard** | dashboard | StatCard, DashboardCard, DataTable, Badge, DateRangePicker |
| **loyalty-program** | data-display | Card, Badge, Progress, Table, Button |
| **invoice-detail** | data-display | Card, Table, Separator, PriceDisplay, Button |
| **review-listing** | data-display | ReviewCard, FilterPanel, RatingStars, Pagination, Badge |

## Pattern Details

### booking-wizard

**Category**: booking | **Domain**: hotel-travel

Multi-step hotel booking flow with summary sidebar

**Page layout**:
> ProgressSteps (top) → StepContent (left 60%) || BookingSummary (right 40%); Mobile: full-width steps with collapsible summary

**Components used**: BookingWizard, DateRangePicker, GuestForm, PriceDisplay, BookingSummary, Button

**User flow**:
> Search → Select room → Choose dates → Guest info → Payment → Confirmation

**Best practices**:
> Show total at every step; Allow date changes throughout; Auto-save progress; Mobile-first layout

### room-browser

**Category**: search-filter | **Domain**: hotel-travel

Room search and filtering with map or list view toggle

**Page layout**:
> SearchBar (top) → FilterPanel (left) || RoomCards grid/list (right); Map toggle

**Components used**: SearchBar, FilterPanel, RoomCard, MapView, Pagination, Badge

**User flow**:
> Search → Filter by amenities/price/rating → Toggle map/list → Select room → View details

**Best practices**:
> Show result count; Sort by relevance/price/rating; Infinite scroll or pagination; Preserve scroll position

### cancellation-flow

**Category**: booking | **Domain**: hotel-travel

Booking cancellation with policy display and refund calculation

**Page layout**:
> Policy display → Refund calculation → Reason selection → Confirmation

**Components used**: Card, Alert, Select, PriceDisplay, AlertDialog, Button, Toast

**User flow**:
> View booking → Click cancel → See policy → Review refund → Select reason → Confirm

**Best practices**:
> Show cancellation deadline; Calculate refund clearly; Offer alternatives; Confirm with dialog

### hotel-dashboard

**Category**: dashboard | **Domain**: hotel-travel

Hotel management dashboard with occupancy and revenue metrics

**Page layout**:
> StatCards (top) → OccupancyChart + RevenueChart (middle) → TodayCheckins table (bottom)

**Components used**: StatCard, DashboardCard, DataTable, Badge, DateRangePicker

**User flow**:
> View metrics → Check occupancy → Review today's activity → Drill into details

**Best practices**:
> Show occupancy percentage; Revenue vs. target; Today's check-ins/outs; Quick links to management

### destination-search

**Category**: search-filter | **Domain**: hotel-travel

Destination search with autocomplete and popular suggestions

**Page layout**:
> SearchBar → Autocomplete dropdown → Popular destinations grid → Recent searches

**Components used**: SearchBar, Card, Badge, Button

**User flow**:
> Type destination → See autocomplete → Select → Proceed to rooms

**Best practices**:
> Show popular destinations; Recent searches; Autocomplete with location types; Photo previews

## Reasoning Notes

- [CRITICAL] Booking flow must show running total at every step with clear cost breakdown
- [CRITICAL] Price display must support multi-currency formatting with clear per-night or per-stay labeling
- [RECOMMENDED] Provide clear cancellation policy information before payment step
- [RECOMMENDED] Date pickers must show pricing per night inline and highlight best-value dates

---

_Generated at 2026-03-28T13:30:00Z_
