# Icon Guidelines — Hotel / Travel

> Part of [DOTBIZ Design System](../MASTER.md)

## Icon Library: Lucide

This design system uses [Lucide](https://lucide.dev) icons via `lucide-react`.

```bash
npm install lucide-react
```

## Icon Mapping

| Context | Concept | Lucide Icon | Alternatives | Description |
|---------|---------|-------------|-------------|-------------|
| booking | calendar | `Calendar` | CalendarDays, CalendarRange | Date selection and availability calendar |
| booking | bed | `Bed` | BedDouble, Hotel | Room or accommodation type |
| booking | guests | `UserPlus` | Users, UserRound | Guest count or add guest |
| booking | payment | `CreditCard` | Wallet, Banknote | Payment and billing |
| amenity | wifi | `Wifi` | Signal, Globe | WiFi availability indicator |
| amenity | parking | `ParkingCircle` | Car, CircleParking | Parking facility availability |
| amenity | pool | `Waves` | Droplets, Umbrella | Swimming pool amenity |
| amenity | restaurant | `UtensilsCrossed` | ChefHat, Coffee | Restaurant or dining facility |
| amenity | spa | `Flower2` | Heart, Sparkles | Spa and wellness facility |
| amenity | gym | `Dumbbell` | Activity, Bike | Fitness center amenity |
| amenity | ac | `Snowflake` | Wind, Thermometer | Air conditioning amenity |
| amenity | laundry | `WashingMachine` | Shirt, Iron | Laundry service amenity |
| navigation | location | `MapPin` | Map, Navigation | Hotel location or map indicator |
| navigation | explore | `Compass` | Globe, Map | Explore destinations |
| data | rating | `Star` | Stars, Award | Rating and review indicator |
| data | price | `DollarSign` | Banknote, Tag | Price and pricing information |
| data | photo | `Camera` | Image, ImagePlus | Photo gallery indicator |
| data | checkin | `LogIn` | ArrowRightToLine, DoorOpen | Check-in action or status |
| action | book | `CalendarCheck` | CalendarPlus, BookOpen | Booking action or confirmation |
| action | cancel | `CalendarX` | XCircle, Ban | Cancellation action |
| action | save | `Save` | Check, Download | Save action |
| action | copy | `Copy` | Clipboard, ClipboardCopy | Copy to clipboard |
| action | share | `Share2` | ExternalLink, Forward | Share or external link |
| action | upload | `Upload` | FileUp, CloudUpload | File upload |
| action | print | `Printer` | FileText, Receipt | Print document |
| action | logout | `LogOut` | Power, DoorClosed | Logout action |
| navigation | back | `ArrowLeft` | ChevronLeft, Undo2 | Back navigation |
| navigation | forward | `ArrowRight` | ChevronRight, Redo2 | Forward navigation |
| navigation | home | `Home` | House, LayoutDashboard | Home page navigation |
| navigation | external | `ExternalLink` | ArrowUpRight, Link | External link indicator |
| ui | dark-mode | `Moon` | Sun, SunMoon | Dark/light mode toggle |
| ui | expand | `Maximize2` | Expand, ArrowsMaximize | Expand or fullscreen |
| ui | more | `MoreHorizontal` | MoreVertical, Ellipsis | More options menu |
| ui | sort-asc | `ArrowUp` | ChevronUp, ArrowUpNarrow | Sort ascending |
| ui | sort-desc | `ArrowDown` | ChevronDown, ArrowDownNarrow | Sort descending |
| status | loading | `Loader2` | RefreshCw, Hourglass | Loading spinner |
| status | success | `CheckCircle` | Check, CircleCheckBig | Success indicator |
| status | warning | `AlertTriangle` | TriangleAlert, AlertOctagon | Warning indicator |
| status | error | `XCircle` | AlertCircle, Ban | Error indicator |
| status | info | `Info` | HelpCircle, MessageCircle | Information indicator |
| ui | eye | `Eye` | EyeOff, View | Visibility toggle |
| action | lock | `Lock` | Unlock, ShieldCheck | Security indicator |

## Usage Guidelines

- **Size**: Use `h-4 w-4` for inline icons, `h-5 w-5` for buttons, `h-6 w-6` for navigation
- **Color**: Icons inherit text color by default; use `text-muted-foreground` for secondary icons
- **Accessibility**: Add `aria-label` on icon-only buttons; use `aria-hidden="true"` on decorative icons
- **Consistency**: Use the primary Lucide name from the mapping above; fall back to alternatives only when context demands it

## Import Pattern

```tsx
import { IconName } from "lucide-react";

// Inline usage
<IconName className="h-4 w-4" />

// Button with icon
<Button size="icon" aria-label="Description">
  <IconName className="h-4 w-4" />
</Button>
```

---

_Generated at 2026-03-28T13:30:00Z_
