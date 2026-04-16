# DOTBIZ B2B Hotel Booking Platform - Prototype Specification v2.0

> **Project**: DOTBIZ (OhMyHotel B2B Portal)
> **Version**: 2.0
> **Date**: 2026-04-16
> **Tech Stack**: React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + shadcn/ui
> **Deployment**: GitHub Pages (Single-file bundle via vite-plugin-singlefile)
> **Benchmark**: DIDA B2B Travel Portal (~90% feature coverage)

---

## 1. Architecture Overview

### 1.1 Technology Stack
| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 + vite-plugin-singlefile |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Routing | React Router 7 (HashRouter) |
| Charts | Recharts (Bar, Area, Pie, Line) |
| Maps | Leaflet + react-leaflet + OpenStreetMap |
| Animation | Framer Motion |
| Notifications | Sonner (toast) |
| State | React Context (Auth) + useState + URL params |
| Dark Mode | localStorage persistence + Tailwind dark class |

### 1.2 Routing Architecture
```
/ → /login (redirect)
/login → LoginPage
/register → RegistrationPage
/app → MainLayout (sidebar + header + Outlet)
  /app/dashboard → DashboardPage (5 tabs)
  /app/find-hotel → FindHotelPage
  /app/search-results → SearchResultsPage
  /app/hotel/:hotelId → HotelDetailPage
  /app/booking/form → BookingFormPage
  /app/booking/confirm → BookingConfirmPage
  /app/booking/complete → BookingCompletePage
  /app/bookings → BookingsPage
  /app/bookings/:bookingId → BookingsPage (detail view)
  /app/settlement → SettlementPage (6 tabs)
  /app/notifications → NotificationsPage
  /app/faq → FaqBoardPage
  /app/my-account → MyAccountPage (5 tabs)
  /app/rewards → RewardsMallPage
  /app/campaign/:campaignId → CampaignPage
  /app/blog → OhMyBlogPage
  /app/blog/:articleId → OhMyBlogPage
  /app/contact → ContactUsPage
  /app/client → ClientManagementPage (5 tabs)
  /app/tickets → TicketManagementPage
  /app/map-search → MapSearchPage
  /app/hotel-map → HotelMapViewPage
  /app/markup-sharing → MarkupSharingPage
  /app/favorites → FavoritesPage
  /app/monthly-rates → MonthlyRatePage
```

### 1.3 File Structure
```
src/
├── App.tsx                    # Router configuration
├── main.tsx                   # Entry point + dark mode init
├── contexts/
│   └── AuthContext.tsx         # Authentication state + mock users
├── hooks/
│   ├── useFormValidation.ts   # Form validation logic
│   ├── useMediaQuery.ts       # Responsive breakpoints
│   └── useScreenState.ts      # Screen state (loading/empty/error/success)
├── components/
│   ├── CurrencyCalculator.tsx # Floating currency conversion panel
│   ├── DateRangePicker.tsx    # 2-month calendar with navigation
│   ├── DestinationSearch.tsx  # City tabs + autocomplete (REGION/HOTEL)
│   ├── Footer.tsx             # Global footer with ohmyhotelnco.com links
│   ├── HotelLoadingDialog.tsx # Fun loading messages with supplier counter
│   ├── PageTransition.tsx     # Framer Motion page transitions
│   ├── ScrollToTop.tsx        # Auto scroll on navigation
│   └── StateToolbar.tsx       # Dev: switch screen states
├── pages/ (26 pages)
│   ├── LoginPage.tsx
│   ├── RegistrationPage.tsx
│   ├── MainLayout.tsx         # Sidebar + Header + Outlet
│   ├── DashboardPage.tsx
│   ├── FindHotelPage.tsx
│   ├── SearchResultsPage.tsx
│   ├── HotelDetailPage.tsx
│   ├── MapSearchPage.tsx
│   ├── HotelMapViewPage.tsx
│   ├── BookingFormPage.tsx
│   ├── BookingConfirmPage.tsx
│   ├── BookingCompletePage.tsx
│   ├── BookingsPage.tsx
│   ├── SettlementPage.tsx
│   ├── ClientManagementPage.tsx
│   ├── TicketManagementPage.tsx
│   ├── MarkupSharingPage.tsx
│   ├── MonthlyRatePage.tsx
│   ├── FavoritesPage.tsx
│   ├── MyAccountPage.tsx
│   ├── NotificationsPage.tsx
│   ├── FaqBoardPage.tsx
│   ├── RewardsMallPage.tsx
│   ├── CampaignPage.tsx
│   ├── OhMyBlogPage.tsx
│   └── ContactUsPage.tsx
├── mocks/ (14 data files)
│   ├── hotels.ts              # 24 hotels (lat/lng, brands, scores)
│   ├── rooms.ts               # Room types per hotel with variants
│   ├── bookings.ts            # 15 bookings
│   ├── dashboard.ts           # 320 bestselling hotels (16 countries)
│   ├── dataCenter.ts          # Monthly/cancellation/yearly stats
│   ├── settlement.ts          # Billing, applications, pre-payments
│   ├── clientManagement.ts    # Sub-accounts, departments, balance
│   ├── tickets.ts             # 8 tickets with trace histories
│   ├── notifications.ts       # Notification items
│   ├── companies.ts           # Current company data
│   ├── faqs.ts                # FAQ categories and items
│   ├── operatingPartners.ts   # OP partner data
│   ├── products.ts            # Product catalog
│   └── users.ts               # User profiles
└── lib/
    └── utils.ts               # cn() utility
```

---

## 2. Page Specifications

### 2.1 Authentication
#### LoginPage (`/login`)
- Email + Password form with "Remember me" checkbox
- Mock users: master@dotbiz.com / op@dotbiz.com / demo:demo
- Role-based access (Master / OP)
- Dark mode toggle + Language selector (EN/KO/CN/JP)
- State toolbar for loading/empty/error/success states

#### RegistrationPage (`/register`)
- Multi-step registration form
- Company information + Contact details

---

### 2.2 Main Layout (`/app`)
#### Sidebar Navigation
- DOTBIZ logo
- Menu items: Find Hotel, Dashboard, Bookings, Settlement, Client Mgmt, Tickets, Notifications, FAQ Board, My Account, Rewards Mall, OhMy Blog
- Switch Account feature
- Collapsible sidebar (hamburger)

#### Top Header
- Currency selector (USD/KRW/CNY/JPY)
- Language selector
- Dark mode toggle
- Favorites (Heart icon)
- Notification bell with badge count
- User avatar with initials

---

### 2.3 Hotel Search Flow

#### FindHotelPage (`/app/find-hotel`)
- **Search Bar**: Destination + Check-In/Check-Out + Rooms/Adults/Children + Nationality
- **DestinationSearch**: City tabs (Popular/Asia/Europe/Americas/Oceania/Middle East) + autocomplete (REGION/HOTEL sections)
- **DateRangePicker**: 2-month side-by-side calendar with << < > >> navigation, 2nights badge
- Quick links: Popular destinations grid
- Recent searches

#### SearchResultsPage (`/app/search-results`)
- **Unified search bar** (same as FindHotel)
- **7 sidebar filters**: Star Rating, Price Range (dual slider), Brand, Review Score, Meal Type, Cancellation Policy, Room Facilities
- **Hotel cards**: Image placeholder, star rating, review score, area, price, Reserve button
- **Sort**: Recommended / Price / Star Rating / Review Score
- **Pagination**: Page-based navigation
- URL params: q, checkin, checkout, rooms, adults, children, nationality

#### MapSearchPage (`/app/map-search`)
- **Split view**: Left = Leaflet map (100% height), Right = Hotel list sidebar (320px)
- **Numbered markers**: DivIcon with numbered circles (orange default, red selected)
- **Popup on click**: Hotel image, name, stars, review, price, "View Hotel & Reserve" button
- **Top search bar**: DestinationSearch + DateRangePicker + Search + "Go to Hotel List" button
- **Sidebar filters**: Sort, Star, Price, Brand
- **30+ city coordinates** for map centering
- **FlyTo**: Smooth animation when selecting hotel in sidebar
- Navigation rules: city search = same tab reload, hotel = new tab

---

### 2.4 Hotel Detail (`/app/hotel/:hotelId`)

#### Header Section
- Breadcrumb: Find Hotel > Search Results > Hotel Name
- Search bar with applied dates pattern (Search button required to update pricing)
- Hotel image gallery: Main image + 4 thumbnails + Mini Leaflet map
- Hotel name + Star rating + Review score + Area
- Action buttons: Price Markup Sharing, Monthly Rates, Favorite

#### Tabs
1. **Rooms** (default)
   - Filter dropdowns: Room type, Bed type, Price, Meal type, Refundable toggle
   - Column headers: All Rooms | Confirm Type | Capacity | Bed Type/Meal Type | Policies | Price/Room/Night (sortable) | Reserve
   - **Room table structure** (rowspan-like):
     - Left column (w-56): Room image (w-full h-20) + Room name + Promotion badge + "View more" link
     - Right columns: Multiple variant rows per room type
   - Per-variant: Confirm Type, OTA restriction icon, Capacity icons, Bed type, Meal (Breakfast/Room Only), Cancellation policy, Price per night + Total
   - **PriceDisplay**: Per-night price + "1 room x N nights" + "Total: USD xxx" + Package only tag
   - **Show More/Hide**: Expand/collapse when >2 variants per room type
   - **Sold Out**: Dimmed row + popup dialog
   - **Dynamic PKG Promotion**: Red badge on room name
   - **Applied dates pattern**: Changing dates shows "Search required" banner, prices only update on Search click

2. **Overview**
   - AI-Enhanced hotel description with Sparkles icon
   - Key facts grid

3. **Policies**
   - Check-in/out times, Cancellation rules, Pet policy, etc.

4. **Facilities**
   - 30 facility items in grid layout

#### Special Features
- **HotelLoadingDialog**: Fun randomized messages with supplier counter animation
- **Currency Calculator**: Floating button (bottom-right), 10 currencies conversion
- **View Map**: Custom overlay (not Dialog) with full Leaflet map + nearby POI
- **Recommended Properties**: 4 cards at page bottom

---

### 2.5 Booking Flow

#### BookingFormPage (`/app/booking/form`)
- **Booker section**: Name*, Email*, Mobile (country code + number), Seller Booking Code
- Pre-filled from company registration data
- **Booking Detail table**: Check-in/out, Region, Hotel, Rooms/Travelers, Room Type, Bed Type, Breakfast, Cancellation deadline, Confirm Type, Plan Name
- **Travelers table**: Room assignment, Gender (M/F radio), Name (Local Language), Last Name/First Name (EN, uppercase only), Child Birthday (enabled only if children > 0)
- **Special Request**: Checkbox options (non-smoking, smoking, high floor, baby cot, late check-in) + Expected check-in time dropdown + Custom request textarea
- **Billing Rate**: Total price calculation (price x nights)
- **Notice**: Things to know section
- **Confirm Dialog**: AlertDialog with "Are you sure?" message
- Validation: Required fields (Name, Email, Traveler names) with orange highlight on errors

#### BookingConfirmPage (`/app/booking/confirm`)
- Booking confirmation details summary
- Booking reference number
- Print button

#### BookingCompletePage (`/app/booking/complete`)
- Success message
- Navigation to bookings list

---

### 2.6 Bookings Management (`/app/bookings`)
- **Tab filters**: All / Confirmed / Pending / Cancelled / Completed
- **Search**: Booking ID, Hotel name, Guest name
- **Date range filter**: Check-in date range
- **Booking cards**: Status badge, Hotel name, Guest, Dates, Room type, Price
- **Detail view** (`/app/bookings/:bookingId`): Full booking details in slide-over panel
- **Actions**: Cancel booking, Download voucher, Contact hotel
- **15 mock bookings** with varied statuses

---

### 2.7 Dashboard (`/app/dashboard`)
- **5 Tabs**: Overview, Booking Statistics, Cancellation Statistics, Daily Booking Statistics, Year-End Statistics

#### Overview Tab
- KPI cards: Total Bookings, Revenue, Cancellation Rate, Avg. Booking Value
- Booking trend Area chart (Recharts)
- Destination Booking Percentage (Pie chart)
- Revenue by region Bar chart
- OhMyHotel Top Hotels list (bottom, 320 hotels across 16 countries)

#### Booking Statistics Tab
- Account Level filter: All / Master / Sub-accounts
- Monthly summary cards: Confirmed / Cancelled / Deferred Credit
- Monthly booking count Bar chart (6 months)

#### Cancellation Statistics Tab
- Monthly cancellation rate Line chart (6 months)
- Cancellation reason Pie chart
- KPI cards: This month / Previous month / Average

#### Daily Booking Statistics Tab
- Metric selection: Booking Count / Booking Amount
- Date range + Area chart
- Total / Daily Avg / Peak summary

#### Year-End Booking Statistics Tab
- Year-over-year comparison Bar chart (2024 vs 2025 vs 2026)
- Monthly comparison table
- YoY growth rate display

---

### 2.8 Settlement (`/app/settlement`)
- **6 Tabs**: Billing Summary, Billing Details, Pre-Payment, Applications, Receipts, Credit Notes

#### Billing Summary
- Monthly billing overview with chart
- Outstanding balance cards

#### Billing Details
- Detailed transaction table with filters
- Export CSV functionality

#### Applications
- Application list with status tracking
- New application form

---

### 2.9 Client Management (`/app/client`)
- **5 Tabs**: Sub-Accounts, Departments, Balance, Voucher Setting, API Keys

#### Sub-Accounts
- User list with roles (Master/OP)
- Add/Edit user modal
- Status toggle (Active/Inactive)

#### Departments
- Department hierarchy
- Department CRUD

#### Balance
- Current balance display
- Transaction history table
- Top-up records

#### Voucher Setting
- Voucher template configuration
- Logo upload, Company info fields

---

### 2.10 Ticket Management (`/app/tickets`)
- **Ticket list**: ID, Subject, Status, Priority, Created date
- **Status filters**: All / Open / In Progress / Resolved / Closed
- **Ticket detail**: Timeline view with trace history
- **Create ticket**: Category selection, Subject, Description, Attachment
- **8 mock tickets** with varied statuses and trace histories

---

### 2.11 Price Markup Sharing (`/app/markup-sharing`)
- Opens in new tab from Hotel Detail
- **contentEditable** sections for agent customization
- Hotel info, Room details, Price with markup
- Print button (window.print())
- Copy to clipboard functionality

---

### 2.12 Monthly Rate Table (`/app/monthly-rates`)
- Opens in new tab from Hotel Detail
- **12-month calendar grid**: Daily rates per room type
- Color-coded availability
- **CSV Download**: Blob/URL.createObjectURL export
- Hotel name links back to hotel detail

---

### 2.13 My Account (`/app/my-account`)
- **5 Tabs**: Profile, Security, Notifications, Coupons, OP Management

#### Profile
- Personal info edit form
- Company information display

#### Security
- Password change
- Two-factor authentication toggle

#### Notifications
- Notification preferences per category

#### Coupons
- Available coupons list
- Coupon history

#### OP Management
- Operating Partner list
- Partner assignment

---

### 2.14 Additional Pages

#### FavoritesPage (`/app/favorites`)
- Saved hotels grid
- Remove from favorites
- Quick book button

#### NotificationsPage (`/app/notifications`)
- Notification list with read/unread status
- Category filters
- Mark all as read

#### FaqBoardPage (`/app/faq`)
- Category-based FAQ accordion
- Search functionality

#### RewardsMallPage (`/app/rewards`)
- Points balance
- Reward items catalog
- Redemption history

#### CampaignPage (`/app/campaign/:id`)
- Campaign details and promotions

#### OhMyBlogPage (`/app/blog`)
- Blog article list
- Article detail view

#### ContactUsPage (`/app/contact`)
- Contact information
- Office locations
- Support channels

---

## 3. Shared Components

### 3.1 DestinationSearch
- **Tabs**: Popular / Asia / Europe / Americas / Oceania / Middle East
- **Autocomplete dropdown**: Two sections - REGION (cities) and HOTEL (hotel names)
- **Behavior**: City selection fills field (Search button triggers), Hotel selection opens detail in new tab
- Used in: FindHotel, SearchResults, HotelDetail, MapSearch

### 3.2 DateRangePicker
- **2-month calendar**: Side-by-side months with << < > >> navigation
- **Night count badge**: Orange "2 nights" badge between dates
- **Range selection**: Click start → click end, visual range highlight
- Used in: FindHotel, SearchResults, HotelDetail, MapSearch

### 3.3 CurrencyCalculator
- **Floating button**: Bottom-right corner on Hotel Detail
- **10 currencies**: USD, KRW, CNY, JPY, EUR, GBP, THB, VND, SGD, HKD
- **Real-time conversion**: Input amount in any currency

### 3.4 HotelLoadingDialog
- **Randomized messages**: Fun loading text that cycles
- **Supplier counter**: Animated count of suppliers being checked
- **Auto-close**: Closes after animation completes

### 3.5 Footer
- **3 columns**: About DOTBIZ, Quick Links, Contact
- Links to ohmyhotelnco.com with language parameter
- Present on all pages

### 3.6 StateToolbar (Dev)
- **Dev-only toolbar**: Switch between loading/empty/error/success states
- **Role switcher**: Master/OP toggle
- **Dark mode toggle**: Sun/Moon icon

---

## 4. Mock Data Summary

| File | Records | Description |
|------|---------|-------------|
| hotels.ts | 24 | Hotels with lat/lng, brand, star, review, price |
| rooms.ts | ~60 | Room types with variants per hotel |
| bookings.ts | 15 | Booking records with various statuses |
| dashboard.ts | 320 | Bestselling hotels across 16 countries |
| dataCenter.ts | - | Monthly/cancellation/yearly statistics |
| settlement.ts | - | Billing, applications, pre-payment data |
| clientManagement.ts | - | Sub-accounts, departments, balance |
| tickets.ts | 8 | Support tickets with trace histories |
| notifications.ts | - | Notification items |
| companies.ts | 1 | Current company data |
| faqs.ts | - | FAQ categories and items |
| operatingPartners.ts | - | OP partner data |
| products.ts | - | Product catalog |
| users.ts | - | User profiles |

### 4.1 Hotel Data Features
- 24 hotels across Asia (Shanghai, Seoul, Tokyo, Osaka, Bangkok, Singapore, Taipei, Hong Kong, Bali)
- Brands: Peninsula, Mandarin Oriental, Four Seasons, Ritz-Carlton, Park Hyatt, etc.
- Star ratings: 3-5 stars
- Review scores: 7.5-9.8
- Latitude/Longitude for map positioning

### 4.2 Room Data Features
- Multiple room types per hotel (Superior, Deluxe, Suite, etc.)
- Multiple variants per room type (different meal plans, cancellation policies)
- Fields: price, bedType, bedCount, mealIncluded, mealDetail, cancellationPolicy, freeCancelDeadline, confirmType, remaining, otaRestricted, photos, promotionTag, promotionCode, billingGross, billingDiscount, billingSum

---

## 5. UX Patterns

### 5.1 Applied Dates Pattern
- Search bar shows editing dates and applied dates separately
- Changing dates shows "Search required" indicator
- Prices only update when Search button is clicked
- Prevents accidental price changes

### 5.2 Navigation Rules
- **City/Destination search**: Same tab reload
- **Hotel detail**: Opens in new tab (allows comparison shopping)
- **Markup Sharing / Monthly Rates**: Open in new tab

### 5.3 Dark Mode
- Toggle in header and login page
- Persisted to localStorage
- Applied before React render (in main.tsx) to prevent flash
- Carried across new tabs

### 5.4 Responsive Considerations
- Sidebar collapses on small screens
- Tables scroll horizontally on mobile
- Map search full-height layout: `calc(100vh - 56px)`

---

## 6. DIDA B2B Gap Coverage

### Current Coverage: ~90% (58/64 features)

#### Fully Implemented (58)
- Hotel search with filters (star, price, brand, review, meal, cancel, facilities)
- Map search with Leaflet markers
- Hotel detail with room table (rowspan structure)
- Booking flow (form → confirm → complete)
- Booking management with filters and detail view
- Dashboard with 5 statistical tabs
- Settlement with 6 tabs
- Client management with 5 tabs
- Ticket management with timeline
- Price markup sharing
- Monthly rate table with CSV export
- Currency calculator
- Dark mode with persistence
- Role-based access (Master/OP)
- Notification system
- FAQ board
- Rewards mall
- Blog section
- Contact page
- Favorites management

#### Remaining (~6 features for future)
- Real-time availability check (API integration)
- Payment gateway integration
- Email notification triggers
- Batch booking operations
- Advanced reporting export (PDF)
- Multi-language content (i18n)

---

## 7. Deployment

### GitHub Pages
- **Build**: `npm run build` (outputs single HTML via vite-plugin-singlefile)
- **Router**: HashRouter for GitHub Pages compatibility
- **Base URL**: Configured in vite.config.ts
- **Assets**: All inlined (CSS, JS, images as data URIs)

### Build Command
```bash
npm run build
# Output: dist/index.html (single file, ~2-3MB)
```

---

## 8. Accessibility (a11y Score: ~92%)
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management in dialogs
- Color contrast compliance
- Screen reader friendly table headers
- Alt text for images
- Role attributes on custom widgets
