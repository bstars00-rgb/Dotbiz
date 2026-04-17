# DOTBIZ Data Model Specification

> **Date**: 2026-04-16
> **Scope**: Frontend mock data interfaces (TypeScript)

---

## 1. Hotel

```typescript
interface Hotel {
  id: string;              // "htl-001"
  name: string;            // "The Peninsula Shanghai"
  brand: string;           // "Peninsula"
  area: string;            // "The Bund, Shanghai"
  starRating: number;      // 4.7
  reviewScore: number;     // 9.4
  reviewCount: number;     // 2870
  price: number;           // 380 (USD, lowest room per night)
  lat: number;             // 31.2397
  lng: number;             // 121.4901
  imageUrl?: string;       // placeholder
}
```

**Records**: 24 hotels across Shanghai, Seoul, Tokyo, Osaka, Bangkok, Singapore, Taipei, Hong Kong, Bali

---

## 2. Room

```typescript
interface Room {
  id: string;              // "rm-001"
  hotelId: string;         // "htl-007"
  name: string;            // "Superior Queen Room"
  bedType: string;         // "Queen Bed" | "Twin Beds" | "King Bed"
  bedCount: string;        // "1 Queen Bed"
  maxAdults: number;       // 2
  maxChildren: number;     // 1
  price: number;           // 380 (USD per night)
  mealIncluded: boolean;   // true/false
  mealDetail: string;      // "Breakfast Included x 2 Pax"
  cancellationPolicy: string; // "free_cancel" | "non_refundable"
  freeCancelDeadline?: string; // "2026-04-18 17:00"
  confirmType: string;     // "Immediate Confirm" | "On Request"
  remaining: number;       // available rooms (0 = sold out)
  otaRestricted: boolean;  // OTA distribution restriction
  photos: number;          // photo count (e.g., 10)
  promotionTag?: string;   // "Dynamic PKG Promotion" | "Green Deal"
  promotionCode?: string;  // "PKG2026"
  billingGross: number;    // gross billing amount
  billingDiscount: number; // discount amount
  billingSum: number;      // net billing amount
}
```

**Records**: ~60 room types across all hotels, with multiple variants per room type

---

## 3. Booking

```typescript
interface Booking {
  id: string;              // "BK-20260415-001"
  hotelId: string;
  hotelName: string;
  roomType: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;         // "2026-04-22"
  checkOut: string;        // "2026-04-23"
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  totalPrice: number;
  currency: string;        // "USD"
  createdAt: string;       // ISO datetime
  cancellationDeadline?: string;
  confirmationType: string;
  specialRequests?: string;
  bookerName: string;
  bookerEmail: string;
}
```

**Records**: 15 bookings with varied statuses

---

## 4. Dashboard Data

```typescript
interface BestsellingHotel {
  rank: number;
  hotelName: string;
  city: string;
  country: string;
  bookings: number;
  revenue: number;
  avgRate: number;
  starRating: number;
}

interface MonthlyStats {
  month: string;           // "2026-01"
  confirmed: number;
  cancelled: number;
  deferredCredit: number;
  revenue: number;
}

interface CancellationStats {
  month: string;
  cancellationRate: number;  // percentage
  reasons: {
    changeOfPlans: number;
    guestCancelled: number;
    foundBetter: number;
    travelRestriction: number;
    other: number;
  };
}

interface YearlyComparison {
  year: number;
  months: {
    month: number;
    bookings: number;
    revenue: number;
  }[];
}
```

**Records**: 320 bestselling hotels across 16 countries (20 per country)
- Countries: South Korea, Japan, China, Hong Kong, Taiwan, Thailand, Singapore, Vietnam, Indonesia, Malaysia, Philippines, India, UAE, Australia, USA, UK

---

## 5. Settlement

```typescript
interface BillingRecord {
  id: string;
  date: string;
  bookingId: string;
  hotelName: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue";
  invoiceNumber?: string;
}

interface PrePayment {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: "completed" | "processing" | "failed";
  reference: string;
}

interface Application {
  id: string;
  type: string;
  date: string;
  amount: number;
  status: "approved" | "pending" | "rejected";
  notes: string;
}
```

---

## 6. Client Management

```typescript
interface SubAccount {
  id: string;
  name: string;
  email: string;
  role: "Master" | "OP";
  department: string;
  status: "active" | "inactive";
  lastLogin: string;
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
  head: string;
  memberCount: number;
  budget: number;
}

interface BalanceTransaction {
  id: string;
  date: string;
  type: "topup" | "deduction" | "refund";
  amount: number;
  balance: number;
  description: string;
}

interface VoucherSetting {
  companyName: string;
  companyLogo?: string;
  address: string;
  phone: string;
  email: string;
  termsAndConditions: string;
}
```

---

## 7. Ticket

```typescript
interface Ticket {
  id: string;              // "TK-001"
  subject: string;
  category: string;        // "Booking Issue" | "Payment" | "Technical" | "Other"
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
  assignee?: string;
  traces: TicketTrace[];
}

interface TicketTrace {
  id: string;
  date: string;
  author: string;
  authorRole: "agent" | "support" | "system";
  message: string;
  attachments?: string[];
}
```

**Records**: 8 tickets with 2-5 trace entries each

---

## 8. User & Auth

```typescript
interface User {
  email: string;
  name: string;
  role: "Master" | "OP";
  company: string;
}

// Mock users
const MOCK_USERS = [
  { email: "master@dotbiz.com", password: "master123", role: "Master" },
  { email: "op@dotbiz.com", password: "op123", role: "OP" },
  { email: "demo", password: "demo", role: "Master" },
];
```

---

## 9. Company

```typescript
interface Company {
  name: string;            // "OHMYHOTEL & CO."
  email: string;
  phone: string;
  address: string;
  country: string;
  registrationNumber: string;
  taxId: string;
}
```

---

## 10. Notification

```typescript
interface Notification {
  id: string;
  title: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  category: "Deadlines" | "Payment" | "CheckIn" | "Bookings" | "Cancelled" | "System";
  time: string;              // relative time string, e.g. "2 hours ago"
  isRead: boolean;
}
```

**Records**: 7 notifications across 6 categories

---

## 11. Traveler

```typescript
interface Traveler {
  id: string;              // "t-1"
  room: number;            // room index (1-based)
  gender: string;          // "M" | "F"
  localName: string;       // name in local script
  lastName: string;
  firstName: string;
  childBirthday: string;   // "" for adults, date string for children
}
```

**Usage**: Embedded in BookingForm state; each booking contains N travelers matching the adult + child count.

---

## 12. FAQ

```typescript
interface FAQ {
  id: string;              // "faq-001"
  question: string;
  answer: string;
  category: "Booking" | "Payment" | "Cancellation" | "Account" | "Technical";
}
```

**Records**: 8 FAQs across 5 categories

---

## 13. Product (Rewards Mall)

```typescript
interface Product {
  id: string;              // "prod-001"
  name: string;            // "Amazon Gift Card $50"
  category: "GiftCards" | "Travel" | "Electronics" | "Lifestyle" | "Dining" | "Entertainment";
  pointsCost: number;      // OP Points required for redemption
}
```

**Records**: 8 products across 6 categories

---

## 14. OperatingPartner

```typescript
interface OperatingPartner {
  id: string;              // "op-001"
  name: string;
  email: string;
  status: "Active" | "Pending" | "Deactivated";
  shareRatio: number;      // percentage (e.g. 35 = 35%)
}
```

**Records**: 4 operating partners

---

## 15. Campaign

```typescript
interface Campaign {
  title: string;           // "Big discounts are LIVE"
  subtitle: string;        // "Great deals on hotels around the world"
  gradient: string;        // Tailwind gradient classes
  icon: string;            // emoji icon
  countries: {
    name: string;          // "Thailand"
    cities: string[];      // ["Bangkok", "Pattaya", ...]
  }[];
}
```

**Records**: Keyed by slug (e.g. "big-discounts", "prebuy-hotels", "managers-choice")

---

## 16. BlogArticle

```typescript
interface BlogArticle {
  id: string;              // "blog-001"
  hotelId: string;         // linked hotel
  title: string;
  category: string;        // "Featured Review" | "New Opening"
  tag: string;             // "Editor's Pick" | "Instagram Famous"
  tagColor: string;        // hex color
  author: string;
  authorRole: string;      // "Travel Editor" | "Hotel Critic"
  date: string;            // "Mar 25, 2026"
  readTime: string;        // "8 min read"
  views: number;
  likes: number;
  comments: number;
  coverGradient: string;   // Tailwind gradient classes
  excerpt: string;
  sections: {
    type: "intro" | "highlight" | "rooms" | "tip" | "verdict";
    title?: string;
    content?: string;
    items?: string[];
    rating?: number;
  }[];
  photos: number;
}
```

**Records**: Inline in OhMyBlogPage, linked to hotels via hotelId

---

## Entity Relationships

```
Company (1) ──── (N) SubAccount
Company (1) ──── (N) Department
Company (1) ──── (N) Booking
Company (1) ──── (1) VoucherSetting
Company (1) ──── (N) BalanceTransaction
Company (1) ──── (N) OperatingPartner

Hotel (1) ──── (N) Room
Hotel (1) ──── (N) Booking
Hotel (1) ──── (N) BlogArticle

Booking (1) ──── (1) Hotel
Booking (1) ──── (1) Room
Booking (1) ──── (N) Traveler

Ticket (1) ──── (N) TicketTrace

User (1) ──── (1) Company
User (1) ──── (N) Booking
User (1) ──── (N) Ticket
User (1) ──── (N) Notification

Campaign (1) ──── (N) Hotel          (filtered by country/city)
Product (1) ──── (N) OperatingPartner (redeemed via OP Points)
FAQ ──── standalone (categorized)
```
