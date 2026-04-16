# DOTBIZ Changelog - 2026-04-16

## Summary
Total 22+ commits covering room table UX overhaul, accessibility improvements, new features (Monthly Rates, Markup Sharing), and cross-page consistency updates.

---

## New Features

### Monthly Rate Table (`MonthlyRatePage`)
- 12-month calendar grid showing daily rates per room type
- Color-coded availability indicators
- CSV download via Blob/URL.createObjectURL
- Hotel name links back to hotel detail page
- Opens in new tab from Hotel Detail

### Price Markup Sharing (`MarkupSharingPage`)
- Agent-facing price quote page with markup
- contentEditable sections for customization
- Print functionality (window.print())
- Copy to clipboard support
- Opens in new tab from Hotel Detail

### Booking Form Enhancements (`BookingFormPage`)
- Orange highlight on empty traveler name fields (validation UX)
- Child Birthday field disabled when no children in booking
- Uppercase enforcement for Last Name / First Name (EN)

---

## Room Table Overhaul (HotelDetailPage)

### Layout Iterations
1. **Capacity column** added with per-row promotion tags
2. **Column headers row**: All Rooms | Confirm Type | Capacity | Bed Type/Meal Type | Policies | Price/Room/Night | Reserve
3. **Confirm Type header** + shared image area styling
4. **Same room type rows**: Removed left border to prevent split appearance
5. **True rowspan structure**: Left image column spans all variants of same room type
6. **Height mismatch fix**: Adjusted for single-variant rooms
7. **Compact horizontal layout**: Image reduced to thumbnail (w-16 h-12) - too small
8. **Final fix**: Restored vertical layout with proper sizing (w-full h-20 in w-56 column)

### Room Data Enhancements
- `promotionTag`: Dynamic PKG Promotion (red) / Green Promotion badges
- `promotionCode`: Promo code field
- `billingGross`, `billingDiscount`, `billingSum`: Billing structure fields
- `freeCancelDeadline`: Specific cancellation deadline date
- Added more room variants for Peninsula Shanghai (Show More testing)
- Executive Suite with `remaining: 0` for Sold Out testing

### UX Improvements
- **Show More / Hide**: Toggle for room types with >2 variants
- **Sold Out popup**: Dialog when clicking sold out room
- **Promotion tags**: Only displayed on room type header (not per variant row)
- **Package only tooltip**: Changed from Korean to English
- **PriceDisplay component**: Per-night + "1 room x N nights" + Total
- **Applied dates pattern**: Search button required to update pricing after date change

---

## Map Search Improvements (MapSearchPage)
- "Go to Hotel List" changed from text link to proper Button component
- Hotel count Badge added to search bar
- Brand filter dropdown in sidebar

---

## Accessibility Improvements (a11y 78% -> 92%)
- ARIA labels on all interactive elements across all pages
- Key props on list items
- URL params for state passing between pages
- Switch Account functionality
- Screen reader friendly table headers

---

## Cross-Page Consistency
- Unified search bar across FindHotel, SearchResults, HotelDetail, MapSearch
- All search bars use same DestinationSearch + DateRangePicker components
- Consistent navigation rules: city = same tab, hotel = new tab
- Room table column widths balanced: Price (flex-1) and Reserve (w-40) separated

---

## Dark Mode
- Persistence to localStorage
- Applied in main.tsx before React render (prevents flash)
- Carried across new tabs via localStorage

---

## Bug Fixes
- Room table left-heavy layout: Separated Price and Reserve columns
- Same room type looking separate: Restructured to flex with rowspan
- Korean text in English UI: Package only tooltip translated
- Unused imports cleaned across 6 files
- Navigate during render: LoginPage moved to useEffect
- Blank page on preview: Added `replace` to Navigate
- overflow-hidden blocking dropdowns: Changed to `relative`
- Calendar position: Added `relative` to DateRangePicker wrapper
- Map collapse on filter: Fixed with `calc(100vh - 56px)`
- Map tiles bleeding over sidebar: z-index fixes
- Mini map overlapping calendar: Set z-index to 0
- Dialog map not rendering: Replaced with custom fixed overlay
- TypeScript errors: Updated references after Room interface changes

---

## Files Changed
- **Pages**: 26 total (HotelDetailPage most modified)
- **Components**: 8 custom + 20 shadcn/ui
- **Mocks**: 14 data files
- **New docs**: Spec v2.0, Gap Analysis v2.0, Changelog
