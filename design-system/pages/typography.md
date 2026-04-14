# Typography System — Hotel / Travel

> Part of [DOTBIZ Design System](../MASTER.md)

## Type Scale

| Element | Font Family | Size | Line Height | Weight | Letter Spacing | Tailwind Class |
|---------|-------------|------|-------------|--------|----------------|----------------|
| h1 | DM Serif Display, Georgia, serif | 36px | 44px | 400 | -0.01em | `text-4xl font-normal tracking-tight` |
| h2 | DM Serif Display, Georgia, serif | 28px | 36px | 400 | 0 | `text-3xl font-normal` |
| h3 | Inter, system-ui, sans-serif | 20px | 28px | 600 | -0.01em | `text-xl font-semibold tracking-tight` |
| h4 | Inter, system-ui, sans-serif | 16px | 24px | 600 | 0 | `text-base font-semibold` |
| body | Inter, system-ui, sans-serif | 16px | 24px | 400 | 0 | `text-base` |
| caption | Inter, system-ui, sans-serif | 13px | 18px | 400 | 0.01em | `text-sm` |
| label | Inter, system-ui, sans-serif | 14px | 20px | 500 | 0 | `text-sm font-medium` |
| overline | Inter, system-ui, sans-serif | 12px | 16px | 600 | 0.06em | `text-xs font-semibold uppercase tracking-wider` |
| button | Inter, system-ui, sans-serif | 15px | 20px | 600 | 0.01em | `text-sm font-semibold` |
| price | Inter, system-ui, sans-serif | 24px | 32px | 700 | -0.01em | `text-2xl font-bold tracking-tight` |

## Font Families

- `DM Serif Display, Georgia, serif` — Hero headings, hotel names (hospitality warmth)
- `Inter, system-ui, sans-serif` — Body text, UI elements, forms

## CSS Custom Properties

```css
:root {
  --font-size-h1: 36px;
  --line-height-h1: 44px;
  --font-weight-h1: 400;
  --font-size-h2: 28px;
  --line-height-h2: 36px;
  --font-weight-h2: 400;
  --font-size-h3: 20px;
  --line-height-h3: 28px;
  --font-weight-h3: 600;
  --font-size-body: 16px;
  --line-height-body: 24px;
  --font-weight-body: 400;
  --font-size-price: 24px;
  --line-height-price: 32px;
  --font-weight-price: 700;
}
```

## Reasoning Notes

- [CRITICAL] Use serif fonts for hero headings and hotel names to convey hospitality warmth — DM Serif Display applied to h1, h2
- [CRITICAL] All interactive elements must have minimum 44x44px touch targets — button font size 15px with generous line-height

---

_Generated at 2026-03-28T13:30:00Z_
