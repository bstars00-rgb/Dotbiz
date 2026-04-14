# Component Library — Hotel / Travel

> Part of [DOTBIZ Design System](../MASTER.md)

## Component Inventory

| Component | Variant | Category | Use Case | Companions |
|-----------|---------|----------|----------|------------|
| **RoomCard** | default | data-display | Room listing cards in search results | Card, Badge, Button |
| **RoomCard** | compact | data-display | Condensed room card for list views | Card, Badge |
| **RoomGallery** | default | data-display | Multi-image gallery with lightbox | Card, Dialog |
| **DateRangePicker** | default | forms | Check-in/check-out date selection | DatePicker, Button |
| **PriceDisplay** | default | data-display | Formatted price with currency | Badge |
| **PriceDisplay** | comparison | data-display | Rate comparison display | Card, Badge, Button |
| **AvailabilityCalendar** | default | data-display | Monthly availability with rates | Card, Badge |
| **AvailabilityCalendar** | range | data-display | Booking date range selection | Card, Badge |
| **GuestForm** | default | forms | Guest info for booking | Input, Select, Checkbox, Button |
| **GuestForm** | group | forms | Multi-guest for group bookings | Input, Select, Button, Separator |
| **ReviewCard** | default | data-display | Guest review display | Card, Avatar, Badge |
| **ReviewCard** | summary | data-display | Aggregated review score | Card, Progress, Badge |
| **AmenityList** | grid | data-display | Hotel/room amenities with icons | Badge |
| **BookingSummary** | sidebar | layout | Sticky booking cost breakdown | Card, Separator, Button |
| **BookingSummary** | compact | layout | Mobile booking summary | Card, Button |
| **BookingWizard** | default | navigation | Multi-step booking progress | Button, Progress, Separator |
| **BookingWizard** | minimal | navigation | Mobile step indicator | Progress, Badge |
| **SearchBar** | hotel | forms | Hotel search with location/dates/guests | Input, DatePicker, Select, Button |
| **SearchBar** | compact | forms | Header compact search | Input, Button |
| **RatingStars** | default | data-display | Star rating display | Badge |
| **HeroSection** | default | layout | Landing hero with search overlay | SearchBar, Button |
| **MapView** | default | data-display | Interactive hotel location map | Card, Badge |
| **BookingConfirmation** | default | feedback | Post-booking confirmation | Card, Badge, Separator, Button |
| **CurrencySelector** | default | forms | Multi-currency dropdown | Select, Badge |
| **PropertyFeatures** | default | data-display | Hotel feature list | Card, Separator |
| **Button** | primary | actions | Primary action button | n/a |
| **Button** | destructive | actions | Destructive action button | AlertDialog |
| **Button** | ghost | actions | Minimal secondary button | n/a |
| **AlertDialog** | default | feedback | Confirmation dialog | Button, Dialog |
| **Toast** | default | feedback | Notification toast | n/a |
| **Alert** | default | feedback | Inline alert banner | n/a |
| **Breadcrumb** | default | navigation | Navigation breadcrumb | n/a |
| **Dialog** | default | overlay | General modal dialog | Button |
| **LoadingSkeleton** | default | feedback | Loading placeholder | Skeleton |
| **EmptyState** | default | feedback | Empty data state | Card, Button |

## Component Details

### RoomCard (default)

Visual card for room listings in search results

**Category**: data-display
**Use case**: Room listing cards in search results or gallery

**Props config**:
```json
{ "image": "string", "title": "string", "rating": "number", "price": "Price", "amenities": "string[]" }
```

**Companion components**: Card, Badge, Button

### PriceDisplay (default)

Price display with optional strikethrough original price

**Category**: data-display
**Use case**: Formatted price with currency and per-night label

**Props config**:
```json
{ "amount": "number", "currency": "string", "period": "night|stay", "originalPrice": "number" }
```

**Companion components**: Badge

### BookingSummary (sidebar)

Order summary sidebar showing booking cost breakdown

**Category**: layout
**Use case**: Sticky sidebar showing booking cost breakdown

**Props config**:
```json
{ "items": "LineItem[]", "taxes": "Tax[]", "total": "Price" }
```

**Companion components**: Card, Separator, Button

### SearchBar (hotel)

Full-featured hotel search bar for landing pages

**Category**: forms
**Use case**: Hotel search with location, dates, and guests

**Props config**:
```json
{ "destination": "string", "checkIn": "Date", "checkOut": "Date", "guests": "GuestCount" }
```

**Companion components**: Input, DatePicker, Select, Button

## Reasoning Notes

- [CRITICAL] Booking CTA buttons must use high-contrast warm colors with minimum 44px touch target
- [CRITICAL] Price display must support multi-currency formatting with clear per-night or per-stay labeling
- [RECOMMENDED] Room cards must display hero image, price, rating, and key amenities at minimum
- [RECOMMENDED] Support autofill for returning guest information in booking forms

---

_Generated at 2026-03-28T13:30:00Z_
