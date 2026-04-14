# Spacing & Layout — Hotel / Travel

> Part of [DOTBIZ Design System](../MASTER.md)

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight inline spacing |
| `space-2` | 8px | Default inline gap |
| `space-3` | 12px | Compact section gap |
| `space-4` | 16px | Default section gap |
| `space-5` | 20px | Comfortable padding |
| `space-6` | 24px | Card/panel padding |
| `space-8` | 32px | Section separation |
| `space-10` | 40px | Major section spacing |
| `space-12` | 48px | Page-level spacing |

## Layout Patterns

### booking-flow

**Category**: layout | **Domain**: hotel-travel

Multi-step booking wizard with progress indicator and summary sidebar

```css
display: grid; grid-template-columns: 1fr 320px; gap: 24px; max-width: 1080px; margin: 0 auto
```

**Use case**: Hotel room booking process with step-by-step progression

### room-card

**Category**: layout | **Domain**: hotel-travel

Visual card layout with hero image, details, pricing, and CTA

```css
border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08)
```

**Use case**: Room listing cards in search results or gallery

### calendar-grid

**Category**: layout | **Domain**: hotel-travel

Monthly calendar grid with cell states for availability and pricing

```css
display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: var(--border)
```

**Use case**: Room availability calendar, date picker with pricing

### search-results

**Category**: layout | **Domain**: hotel-travel

Two-column layout with filters sidebar and scrollable results

```css
display: grid; grid-template-columns: 280px 1fr; gap: 24px; align-items: start
```

**Use case**: Hotel/room search results with filtering

### booking-summary

**Category**: layout | **Domain**: hotel-travel

Sticky summary card with line items, taxes, and total

```css
position: sticky; top: 24px; padding: 20px; border-radius: 12px; border: 1px solid var(--border)
```

**Use case**: Booking order summary sidebar

### map-list-split

**Category**: layout | **Domain**: hotel-travel

Split view with interactive map on one side and list on the other

```css
display: grid; grid-template-columns: 1fr 1fr; height: calc(100vh - 64px)
```

**Use case**: Hotel search with map and list views

### confirmation-page

**Category**: layout | **Domain**: hotel-travel

Centered confirmation layout with booking details and next steps

```css
max-width: 640px; margin: 0 auto; padding: 40px 24px; text-align: center
```

**Use case**: Booking confirmation, thank you pages

### guest-form

**Category**: layout | **Domain**: hotel-travel

Compact guest information form with auto-fill support

```css
display: flex; flex-direction: column; gap: 16px; max-width: 480px
```

**Use case**: Guest registration, check-in forms

### responsive-grid

**Category**: layout | **Domain**: general

12-column responsive grid system with configurable breakpoints

```css
display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px
```

**Use case**: General page layouts across all screen sizes

### breakpoints

**Category**: layout | **Domain**: general

Standard responsive breakpoints

```css
sm: 640px; md: 768px; lg: 1024px; xl: 1280px; 2xl: 1536px
```

**Use case**: Responsive design breakpoint definitions

## Reasoning Notes

- [CRITICAL] Booking flow must show running total at every step — booking-summary uses sticky positioning
- [OPTIONAL] Implement sticky booking summary on scroll for desktop booking flows

---

_Generated at 2026-03-28T13:30:00Z_
