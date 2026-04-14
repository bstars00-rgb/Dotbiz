# Color System — Hotel / Travel

> Part of [DOTBIZ Design System](../MASTER.md)

## Color Palette

| Role | Name | Hex | HSL | Tailwind | Contrast | Description |
|------|------|-----|-----|----------|----------|-------------|
| primary | warm-tone | `#EA580C` | `hsl(21, 90%, 48%)` | `orange-600` | 4.6:1 | Primary action color for booking CTAs and key interactions |
| primary-hover | warm-tone | `#C2410C` | `hsl(17, 88%, 40%)` | `orange-700` | 5.8:1 | Hover state for primary booking elements |
| primary-light | warm-tone | `#FFF7ED` | `hsl(33, 100%, 96%)` | `orange-50` | 1.0:1 | Light background for selected dates and active states |
| secondary | luxury-gold | `#B45309` | `hsl(32, 95%, 37%)` | `amber-700` | 4.8:1 | Luxury and premium tier indicators |
| secondary-light | luxury-gold | `#FEF3C7` | `hsl(48, 96%, 89%)` | `amber-100` | 1.1:1 | Premium tier background highlights |
| accent | nature-green | `#15803D` | `hsl(142, 72%, 29%)` | `green-700` | 5.6:1 | Availability and eco-friendly indicators |
| accent-light | nature-green | `#DCFCE7` | `hsl(139, 76%, 92%)` | `green-100` | 1.1:1 | Available date backgrounds and positive highlights |
| tertiary | ocean-blue | `#0369A1` | `hsl(201, 96%, 32%)` | `sky-700` | 5.6:1 | Navigation and secondary actions in travel context |
| tertiary-light | ocean-blue | `#E0F2FE` | `hsl(204, 94%, 94%)` | `sky-100` | 1.1:1 | Information backgrounds and feature highlights |
| spring | seasonal | `#65A30D` | `hsl(85, 85%, 35%)` | `lime-600` | 3.4:1 | Spring season theme accent |
| summer | seasonal | `#EA580C` | `hsl(21, 90%, 48%)` | `orange-600` | 4.6:1 | Summer season theme accent |
| autumn | seasonal | `#B45309` | `hsl(32, 95%, 37%)` | `amber-700` | 4.8:1 | Autumn season theme accent |
| winter | seasonal | `#0284C7` | `hsl(200, 98%, 39%)` | `sky-600` | 4.5:1 | Winter season theme accent |
| success | status | `#16A34A` | `hsl(142, 71%, 45%)` | `green-600` | 4.5:1 | Booking confirmed and available status |
| warning | status | `#CA8A04` | `hsl(46, 97%, 40%)` | `yellow-600` | 3.1:1 | Limited availability and expiring deals |
| error | status | `#DC2626` | `hsl(0, 72%, 51%)` | `red-600` | 4.5:1 | Booking failed and unavailable status |
| info | status | `#0284C7` | `hsl(200, 98%, 39%)` | `sky-600` | 4.5:1 | Travel tips and informational notices |
| surface | surface | `#FFFFFF` | `hsl(0, 0%, 100%)` | `white` | 21:1 | Card and content surfaces |
| background | surface | `#FFFBEB` | `hsl(48, 100%, 96%)` | `amber-50` | 19:1 | Warm page background for hospitality feel |
| border | surface | `#FED7AA` | `hsl(27, 98%, 83%)` | `orange-200` | 1.5:1 | Warm border color for cards |
| dark-bg | dark-mode | `#0F172A` | `hsl(222, 47%, 11%)` | `slate-900` | 15.4:1 | Dark mode page background |
| dark-surface | dark-mode | `#1E293B` | `hsl(217, 33%, 17%)` | `slate-800` | 12.6:1 | Dark mode card and panel surfaces |
| dark-border | dark-mode | `#334155` | `hsl(215, 25%, 27%)` | `slate-700` | 8.6:1 | Dark mode border color |
| dark-text | dark-mode | `#F1F5F9` | `hsl(210, 40%, 96%)` | `slate-100` | 1.1:1 | Dark mode primary text |
| dark-muted | dark-mode | `#94A3B8` | `hsl(215, 20%, 65%)` | `slate-400` | 3.0:1 | Dark mode secondary/muted text |
| dark-primary | dark-mode | `#60A5FA` | `hsl(213, 94%, 68%)` | `blue-400` | 3.0:1 | Dark mode primary action color |

## CSS Custom Properties

```css
:root {
  --color-primary: #EA580C;
  --color-primary-hover: #C2410C;
  --color-primary-light: #FFF7ED;
  --color-secondary: #B45309;
  --color-accent: #15803D;
  --color-tertiary: #0369A1;
  --color-success: #16A34A;
  --color-warning: #CA8A04;
  --color-error: #DC2626;
  --color-info: #0284C7;
  --color-surface: #FFFFFF;
  --color-background: #FFFBEB;
  --color-border: #FED7AA;
}
```

## Tailwind Mapping

```js
colors: {
  'primary': '#EA580C',
  'primary-hover': '#C2410C',
  'primary-light': '#FFF7ED',
  'secondary': '#B45309',
  'secondary-light': '#FEF3C7',
  'accent': '#15803D',
  'accent-light': '#DCFCE7',
  'tertiary': '#0369A1',
  'tertiary-light': '#E0F2FE',
  'success': '#16A34A',
  'warning': '#CA8A04',
  'error': '#DC2626',
  'info': '#0284C7',
  'surface': '#FFFFFF',
  'background': '#FFFBEB',
  'border': '#FED7AA',
}
```

## Reasoning Notes

- [CRITICAL] Booking CTA buttons must use high-contrast warm colors (orange/amber) — primary #EA580C meets 4.6:1 contrast ratio
- [CRITICAL] Show availability status with clear color coding: green=available (#15803D), yellow=limited (#CA8A04), red=sold out (#DC2626)
- [RECOMMENDED] Use warm color palette (orange/amber/gold) as primary to create hospitality atmosphere

---

_Generated at 2026-03-28T13:30:00Z_
