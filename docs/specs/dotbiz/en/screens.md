<!-- Synced with ko version: 2026-03-28T00:00:00Z -->

## 4. Screen Definitions

@layout: _shared/main-layout

---

### Screen: Login

**Purpose**: Email/password-based login screen

**Entry Points**: Initial app access, on session expiry

**Layout**:
```
+--------------------------------------------------+
| [ Header ]                                       |
| - Logo (DOTBIZ)             - DarkModeToggle     |
+--------------------------------------------------+
| [ Login Form ]                                   |
|                                                  |
|   - AnimatedBackground (Tech style)              |
|                                                  |
|   +------------------------------------------+   |
|   | - EmailInput                             |   |
|   | - PasswordInput                          |   |
|   | - RememberMeCheckbox                     |   |
|   | - LoginButton                            |   |
|   | - ForgotPasswordLink                     |   |
|   | - RegisterLink                           |   |
|   +------------------------------------------+   |
|                                                  |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| Logo | Image | DOTBIZ brand logo |
| DarkModeToggle | Button | 🌙/☀️ Toggle between dark/light mode |
| AnimatedBackground | Canvas | Tech style animated background |
| EmailInput | Input | Email entry, autofill when Remember Me is set |
| PasswordInput | Input | Password entry, show/hide toggle |
| RememberMeCheckbox | Checkbox | Save email to localStorage |
| LoginButton | Button | Execute login |
| ForgotPasswordLink | Link | Navigate to password reset screen |
| RegisterLink | Link | Navigate to registration page |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Login | LoginButton click | Validate credentials → navigate to Dashboard |
| Forgot password | ForgotPasswordLink click | Navigate to password reset screen |
| Register | RegisterLink click | Navigate to Registration page |
| Toggle dark mode | DarkModeToggle click | Switch theme, save to localStorage |

---

### Screen: Registration

**Purpose**: 3-Step registration process

**Entry Points**: RegisterLink on the Login screen

**Layout**:
```
+--------------------------------------------------+
| [ Header ]                                       |
| - Logo                      - DarkModeToggle     |
+--------------------------------------------------+
| [ StepIndicator ]                                |
| - Step1 (Company Info)  Step2 (User)  Step3 (Agreement) |
+--------------------------------------------------+
| [ FormContent ]                                  |
|                                                  |
|   Step 1:                                        |
|   - CompanyNameInput                             |
|   - BusinessRegNoInput                           |
|   - BusinessTypeSelect (Prepaid/Postpaid)        |
|   - AddressInput                                 |
|   - PhoneInput                                   |
|   - CompanyEmailInput                            |
|                                                  |
|   Step 2:                                        |
|   - FullNameInput                                |
|   - PositionInput                                |
|   - UserEmailInput                               |
|   - PasswordInput                                |
|   - MobileInput                                  |
|   - LanguageSelect                               |
|                                                  |
|   Step 3:                                        |
|   - TermsCheckbox (B2B Terms of Service)         |
|   - ContractDownloadButton                       |
|                                                  |
+--------------------------------------------------+
| [ FormActions ]                                  |
| - BackButton                - NextButton         |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| StepIndicator | Stepper | Shows current step (1/2/3) |
| CompanyNameInput | Input | Company name entry (required) |
| BusinessRegNoInput | Input | Business registration number (required) |
| BusinessTypeSelect | Select | Prepaid/Postpaid company type |
| AddressInput | Input | Address entry |
| PhoneInput | Input | Phone number entry |
| CompanyEmailInput | Input | Company email (required) |
| FullNameInput | Input | Full name (required) |
| PositionInput | Input | Job title |
| UserEmailInput | Input | User email (required) |
| PasswordInput | Input | Password (required, 8–128 characters, letters + numbers + special characters) |
| PasswordConfirmInput | Input | Password confirmation (must match PasswordInput) |
| MobileInput | Input | Mobile phone number |
| LanguageSelect | Select | Preferred language (5 options) |
| TermsCheckbox | Checkbox | B2B Terms of Service agreement (required) |
| ContractDownloadButton | Button | Download contract PDF |
| BackButton | Button | Go to previous step |
| NextButton | Button | Go to next step / complete |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Next step | NextButton click | Validate required fields → go to next step |
| Previous step | BackButton click | Go to previous step (input retained) |
| Download contract | ContractDownloadButton click | Download PDF file |
| Complete registration | Step 3 complete | Display Pending status guidance message |

---

### Screen: Dashboard

**Purpose**: KPI summary and business analytics dashboard

**Entry Points**: Default screen after login, sidebar menu

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ]                                       |
| - SearchGlobal  - CurrencySelect  - LangSelect  |
| - DarkModeToggle  - NotificationBell  - Profile  |
+--------------------------------------------------+
| [ Sidebar ]    || [ MainContent ]                |
| - Logo         ||                                |
| - NavMenu:     || [ KPICards ]                   |
|   AI Assistant || - TotalBookings  - Revenue     |
|   Find Hotel   || - RoomNights  - AvgBookingVal  |
|   Dashboard    ||                                |
|   Bookings     || [ OPPointsWidget ]             |
|   Settlement*  || - Balance - Earned - Used       |
|   Notifications||                                |
|   FAQ Board    || [ TopHotels ]  || [ TTVTrend ] |
|   My Account   || - Hotel List   || - BarChart   |
|   Rewards Mall ||                                |
|                || [ BookingFunnel ]               |
|                || - FunnelChart                   |
|                ||                                |
|                || [ HotelProfitability ]          |
|                || - ProfitTable                   |
|                ||                                |
|                || [ OPPerformance ]  (Master)     |
|                || - ComparisonTable               |
|                ||                                |
|                || [ MyPerformance ]  (OP)         |
|                || - GaugeBars                     |
+--------------------------------------------------+
```
*Settlement is Master-only

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| Sidebar | Navigation | Menu items, current page highlighted |
| TopBar | Header | Search, currency/language/dark mode, notifications, profile |
| KPICards | Card Grid | 4 KPIs + period-over-period change, period filter |
| OPPointsWidget | Card | Compact points status widget |
| TopHotels | Table | Top 5 hotels (count, amount) |
| TTVTrend | Chart | 12-month CSS bar chart |
| BookingFunnel | Chart | 5-stage conversion funnel |
| HotelProfitability | Table | Hotel profitability (top 5) |
| OPPerformance | Table | OP performance comparison (Master only) |
| MyPerformance | GaugeBar | Individual KPIs (OP only) |
| NotificationBell | Button | Navigate to notification center, unread badge |
| CurrencySelect | Dropdown | Select from 10 currencies |
| LangSelect | Dropdown | Select from 5 languages |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Change period filter | KPICards filter selection | Refresh data for all widgets |
| Go to Rewards Mall | OPPointsWidget link click | Navigate to Rewards Mall page |
| Navigate menu | Sidebar menu click | Hash routing to the corresponding page |

---

### Screen: Find Hotel

**Purpose**: Hotel search entry point and favorites

**Entry Points**: Sidebar menu "Find Hotel"

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (shared)                              |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ SearchForm ]                    |
|             || - DestinationInput (autocomplete) |
|             || - CheckInPicker  - CheckOutPicker |
|             || - NightsDisplay                   |
|             || - RoomsSelect  - AdultsSelect     |
|             || - ChildrenSelect  - ChildAgeInputs|
|             || - NationalitySelect               |
|             || - SearchButton                    |
|             ||                                   |
|             || [ FavoriteHotels ]                |
|             || - FavoriteHotelCard (repeated)    |
|             ||                                   |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| DestinationInput | Autocomplete | City/landmark/hotel name autocomplete (major Asian cities) |
| CheckInPicker | DatePicker | Check-in date selection |
| CheckOutPicker | DatePicker | Check-out date selection |
| NightsDisplay | Display | Auto-calculated nights display |
| RoomsSelect | Select | Select number of rooms |
| AdultsSelect | Select | Select number of adults |
| ChildrenSelect | Select | Select number of children |
| ChildAgeInputs | Input[] | Individual child age input (dynamically generated) |
| NationalitySelect | Select | Nationality selection |
| SearchButton | Button | Execute search |
| FavoriteHotelCard | Card | Favorite hotel card (image, name, star rating) |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Execute search | SearchButton click | Navigate to Search Results page |
| Click favorite hotel | FavoriteHotelCard click | Navigate to Hotel Detail page |
| Change children count | ChildrenSelect change | Dynamically add/remove ChildAgeInputs |

---

### Screen: Search Results

**Purpose**: Hotel search results (List View + Map View)

**Entry Points**: Execute search from Find Hotel

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (shared)                              |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ CompactSearchBar ]              |
|             || - Destination - Dates - Rooms     |
|             || - ModifyButton                    |
|             ||                                   |
|             || [ ViewToggle ]                    |
|             || - ListViewBtn  - MapViewBtn       |
|             || - SortDropdown                    |
|             || - ResultCount                     |
|             ||                                   |
|             || [ FilterSidebar ] || [ Results ]  |
|             || - StarRating     || (List View)   |
|             || - PriceRange     || - HotelCard   |
|             || - AreaFilter     ||   (repeated)  |
|             || - AmenityFilter  ||               |
|             ||                  || (Map View)    |
|             ||                  || - LeafletMap  |
|             ||                  || - MapSidebar  |
|             ||                                   |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| CompactSearchBar | Form | Compact bar for modifying search conditions |
| ViewToggle | ButtonGroup | Toggle between List ↔ Map view |
| SortDropdown | Dropdown | Recommended, Price (↑↓), Rating |
| ResultCount | Display | Number of search results |
| FilterSidebar | Panel | Star rating/price/area/amenity filters |
| StarRating | CheckboxGroup | 5/4/3 Star filter |
| PriceRange | RangeSlider | Under $100 ~ $300+ |
| AreaFilter | CheckboxGroup | Filter by area |
| AmenityFilter | CheckboxGroup | Free Cancellation, Breakfast, Pool, etc. |
| HotelCard | Card | Hotel image, name, star rating, review score, price, badges, favorite |
| LeafletMap | Map | Leaflet.js interactive map |
| MapSidebar | Panel | Hotel list beside map (linked to markers) |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Toggle view | ViewToggle click | Switch between List ↔ Map |
| Apply filter | Filter item change | Results filtered immediately |
| Change sort | SortDropdown change | Results re-sorted immediately |
| Select hotel | HotelCard click | Navigate to Hotel Detail |
| Favorite | Star icon click | Toggle favorite |
| Click marker | Map marker click | Show popup + highlight in list |

---

### Screen: Hotel Detail

**Purpose**: Hotel information and room selection (4 tabs)

**Entry Points**: Click hotel card in Search Results, click AI-recommended hotel

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (shared)                              |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ Breadcrumb ]                    |
|             || - Home > Search > HotelName       |
|             ||                                   |
|             || [ CompactSearchBar ]              |
|             || - Dates - Rooms - ModifyButton    |
|             ||                                   |
|             || [ HeroSection ]                   |
|             || - HotelImage  - HotelName         |
|             || - StarBadge  - RatingBadge        |
|             || - FavoriteButton                  |
|             ||                                   |
|             || [ TabNavigation ]                 |
|             || - RoomsTab  - OverviewTab         |
|             || - PoliciesTab  - FacilitiesTab    |
|             ||                                   |
|             || [ TabContent ]                    |
|             || (Rooms Tab)                       |
|             || - RoomFilter                      |
|             ||   - RoomTypeSelect                |
|             ||   - BedTypeSelect                 |
|             ||   - PriceRangeSelect              |
|             ||   - MealPlanSelect                |
|             ||   - RefundableCheckbox            |
|             || - RoomCard (repeated)             |
|             ||   - RoomName  - BedType           |
|             ||   - MaxGuests  - CancelPolicy     |
|             ||   - MealIncluded  - Price         |
|             ||   - SelectButton                  |
|             ||                                   |
|             || (Overview Tab)                    |
|             || - HotelDescription                |
|             || - Highlights  - Location           |
|             ||                                   |
|             || (Policies Tab)                    |
|             || - CheckInOut  - CancelPolicy      |
|             || - ChildPolicy  - PetPolicy        |
|             || - SmokingPolicy                   |
|             ||                                   |
|             || (Facilities Tab)                  |
|             || - FacilityGroup (repeated)        |
|             ||   - CategoryTitle                 |
|             ||   - FacilityItem (icon + text)    |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| Breadcrumb | Navigation | Hierarchical navigation |
| HeroSection | Section | Hotel image, name, star rating, review score |
| FavoriteButton | Button | Toggle favorite |
| TabNavigation | Tabs | Switch between 4 tabs |
| RoomFilter | FilterBar | Room Type, Bed Type, Price, Meal, Refundable |
| RoomCard | Card | Room information + Select button |
| SelectButton | Button | Select room → navigate to Booking Form |
| HotelDescription | Text | Hotel description text |
| FacilityGroup | List | Facilities list by category |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Switch tab | TabNavigation click | Display content of selected tab |
| Filter rooms | RoomFilter change | Real-time room list filtering |
| Select room | SelectButton click | Navigate to Booking Form |
| Modify search | CompactSearchBar ModifyButton | Change dates/room count |

---

### Screen: Booking Form (Step 1)

**Purpose**: Guest information entry and payment method selection

**Entry Points**: Room Select button on Hotel Detail

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (shared)                              |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ BookingStepIndicator ]           |
|             || - Step1 (Info) Step2 (Review) Step3 (Complete)|
|             ||                                   |
|             || [ GuestForm ]  || [ BookingSummary]|
|             || - FirstName    || - HotelName     |
|             || - LastName     || - RoomType      |
|             || - Email        || - CheckIn/Out   |
|             || - Mobile       || - Nights        |
|             || - SpecialReq   || - Guests        |
|             ||                || - RoomRate      |
|             || [ PaymentMethod]| - Tax           |
|             || (Prepaid)      || - Total          |
|             || - CardSelect   ||                 |
|             || - RNPLOption   ||                 |
|             || (Postpaid)     ||                 |
|             || - DepositOption||                 |
|             || - CreditOption ||                 |
|             ||                ||                 |
|             || [ FormActions ]                   |
|             || - BackButton   - ContinueButton   |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| BookingStepIndicator | Stepper | Shows booking progress step (1/2/3) |
| FirstNameInput | Input | Guest first name (required) |
| LastNameInput | Input | Guest last name (required) |
| EmailInput | Input | Guest email (required) |
| MobileInput | Input | Guest contact number |
| SpecialRequests | Textarea | Special requests |
| BookingSummary | Card | Booking summary (hotel, room, dates, price) |
| CardSelect | Select | Select registered corporate card (prepaid) |
| RNPLOption | Radio | Reserve Now Pay Later (prepaid) |
| DepositOption | Radio | Deduct from Floating Deposit (postpaid) |
| CreditOption | Radio | Use Credit Line (postpaid) |
| ContinueButton | Button | Navigate to next step |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Continue | ContinueButton click | Validate required fields → navigate to Booking Confirm |
| Back | BackButton click | Return to Hotel Detail |

---

### Screen: Booking Confirm (Step 2)

**Purpose**: Final booking review and terms agreement

**Entry Points**: Continue button on Booking Form

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (shared)                              |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ BookingStepIndicator ]           |
|             ||                                   |
|             || [ ReviewSection ]                 |
|             || - HotelInfo                       |
|             || - DateInfo                        |
|             || - RoomInfo                        |
|             || - GuestInfo                       |
|             ||                                   |
|             || [ PriceDetail ]                   |
|             || - RoomRate                        |
|             || - TaxAmount                       |
|             || - TotalAmount                     |
|             ||                                   |
|             || [ CancelPolicyInfo ]              |
|             ||                                   |
|             || [ TermsCheckbox ]                 |
|             || - Terms & Conditions agreement    |
|             ||                                   |
|             || [ FormActions ]                   |
|             || - BackButton  - ConfirmButton     |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| ReviewSection | Section | Booking information summary (hotel, dates, room, guest) |
| PriceDetail | Table | Room Rate, Tax, Total details |
| CancelPolicyInfo | Info | Cancellation policy notice |
| TermsCheckbox | Checkbox | Terms agreement (required) |
| ConfirmButton | Button | Confirm booking (activated when terms are agreed) |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Agree to terms | TermsCheckbox check | Activate ConfirmButton |
| Confirm booking | ConfirmButton click | Generate ELLIS Code → navigate to Booking Complete |
| Back | BackButton click | Return to Booking Form |

---

### Screen: Booking Complete (Step 3)

**Purpose**: Booking success screen

**Entry Points**: Confirm booking on Booking Confirm

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (shared)                              |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ SuccessMessage ]                |
|             || - SuccessIcon                     |
|             || - SuccessText                     |
|             || - ELLISCode                       |
|             ||                                   |
|             || [ BookingDetail ]                 |
|             || - HotelInfo                       |
|             || - DateInfo                        |
|             || - RoomInfo                        |
|             || - GuestInfo                       |
|             || - PaymentInfo                     |
|             ||                                   |
|             || [ ActionButtons ]                 |
|             || - VoucherDownload                 |
|             || - VoucherEmail                    |
|             || - MyBookingsButton                |
|             || - NewBookingButton                |
|             || - RebookButton (on cancellation)  |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| SuccessIcon | Icon | Checkmark success icon |
| ELLISCode | Display | Display ELLIS Booking Code (K+YYMMDD+HHMMSS+H+NN) |
| BookingDetail | Section | Booking detail information |
| VoucherDownload | Button | Download voucher PDF |
| VoucherEmail | Button | Send voucher by email |
| MyBookingsButton | Button | Navigate to booking list |
| NewBookingButton | Button | Navigate to new search |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Download voucher | VoucherDownload click | Download PDF file |
| Email voucher | VoucherEmail click | Send to guest email |
| Booking list | MyBookingsButton click | Navigate to Bookings page |
| New booking | NewBookingButton click | Navigate to Find Hotel |

---

### Screen: Bookings

**Purpose**: Booking list, calendar view, Support Chat (3 tabs)

**Entry Points**: Sidebar menu "Bookings"

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (shared)                              |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ TabBar ]                        |
|             || - BookingListTab - CalendarTab     |
|             || - SupportChatTab                  |
|             ||                                   |
|             || (Booking List Tab)                |
|             || [ FilterPanel ]                   |
|             || - DateTypeSelect                  |
|             || - DateRangePicker                 |
|             || - ELLISCodeInput                  |
|             || - BookingStatusSelect             |
|             || - PaymentStatusSelect             |
|             || - SearchBySelect + SearchInput    |
|             || - CountrySelect                   |
|             || - HotelNameInput                  |
|             || - SearchBtn  - ResetBtn           |
|             ||                                   |
|             || [ ActionBar ]                     |
|             || - ExcelExportBtn                  |
|             || - BulkVoucherBtn                  |
|             || - PageSizeSelect (20/50/100)      |
|             ||                                   |
|             || [ BookingTable ]                  |
|             || - SelectAllCheckbox               |
|             || - 14 Column Table (repeated)      |
|             || - Pagination                      |
|             ||                                   |
|             || (Calendar Tab)                    |
|             || [ CalendarHeader ]                |
|             || - MonthNav (Prev/Today/Next)      |
|             || [ MonthlyStats ]                  |
|             || - Confirmed - Cancelled           |
|             || - RoomNights - NetCost - Unpaid   |
|             || [ CalendarGrid ]                  |
|             || - 7-column grid                   |
|             || - EventBadge (color-coded)        |
|             || [ UpcomingCheckins ]              |
|             || - Next 5 check-ins table          |
|             ||                                   |
|             || (Support Chat Tab)                |
|             || [ ChatList ]  || [ ChatArea ]     |
|             || - ChatRoom    || - Messages       |
|             ||   (repeated)  || - InputBar       |
|             ||               || - AttachButton   |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| TabBar | Tabs | Switch between Booking List / Calendar / Chat |
| FilterPanel | Form | Multi-condition filter |
| DateTypeSelect | Select | Booking/Cancel/CheckIn/CheckOut/Deadline/Stay |
| BookingStatusSelect | Select | Confirmed/Cancelled/Pending/No-show/Completed |
| PaymentStatusSelect | Select | 6 payment statuses |
| BookingTable | DataTable | 14 columns, checkboxes, pagination |
| ExcelExportBtn | Button | Export as .xlsx |
| BulkVoucherBtn | Button | Bulk voucher download for selected bookings |
| CalendarGrid | Calendar | Monthly grid, color-coded event badges |
| MonthlyStats | Card Grid | 5 monthly statistics cards |
| UpcomingCheckins | Table | Next 5 check-ins (D-day color coding) |
| ChatList | List | Chat room list |
| ChatArea | Panel | Message area + input field |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Switch tab | TabBar click | Display selected tab content |
| Apply filter | SearchBtn click | Search with filter conditions |
| Reset filter | ResetBtn click | Reset all filters |
| Booking detail | Table row click | Open booking detail modal |
| Excel export | ExcelExportBtn click | Download .xlsx file |
| Bulk voucher | BulkVoucherBtn click | Download vouchers for selected bookings |
| Calendar event | EventBadge click | Open booking detail modal |
| Send chat message | Send button click | Send message |

---

### Screen: Booking Detail Modal

**Purpose**: View full booking information (9-section modal)

**Entry Points**: Click table row in Bookings, paste ELLIS Code

**Layout**:
```
+------------------------------------------+
| [ ModalHeader ]                          |
| - Title (ELLIS Code)   - CloseButton    |
+------------------------------------------+
| [ BookingSummary ]                       |
| - Status  - BookingDate  - ELLISCode    |
+------------------------------------------+
| [ HotelInfo ]                            |
| - HotelName  - Address  - Contact       |
+------------------------------------------+
| [ RoomDetails ]                          |
| - RoomType  - Guests  - Rate            |
+------------------------------------------+
| [ GuestInfo ]                            |
| - Name  - Email  - Mobile               |
+------------------------------------------+
| [ PaymentInfo ]                          |
| - Amount  - Status  - Method            |
+------------------------------------------+
| [ CancelPolicy ]                         |
| - Deadline  - Fee                        |
+------------------------------------------+
| [ SpecialRequests ]                      |
| - RequestText                            |
+------------------------------------------+
| [ BookingTimeline ]                      |
| - Created  - Confirmed  - Paid          |
+------------------------------------------+
| [ Actions ]                              |
| - VoucherBtn - ReceiptBtn               |
| - CancelBtn  - ModifyBtn                |
+------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| ModalHeader | Header | ELLIS Code display + Close button |
| BookingSummary | Section | Booking status, date, code |
| HotelInfo | Section | Hotel name, address, contact |
| RoomDetails | Section | Room type, guests, rate |
| GuestInfo | Section | Guest information |
| PaymentInfo | Section | Payment amount, status, method |
| CancelPolicy | Section | Cancellation deadline, fee |
| BookingTimeline | Timeline | Booking events timeline |
| VoucherBtn | Button | Download voucher PDF |
| ReceiptBtn | Button | Download receipt PDF |
| CancelBtn | Button | Open cancellation confirmation modal |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Download voucher | VoucherBtn click | Download PDF |
| Download receipt | ReceiptBtn click | Download PDF |
| Cancel booking | CancelBtn click | Open cancellation confirmation modal |
| Close | CloseButton click | Close modal |

---

### Screen: Settlement

**Purpose**: Settlement system (5 tabs, Master only)

**Entry Points**: Sidebar menu "Settlement" (Master access only)

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (shared)                              |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ SettlementTabs ]                |
|             || - Monthly - Invoices - AR          |
|             || - OPPoints - PurchaseByHotel      |
|             ||                                   |
|             || (Monthly Tab)                     |
|             || - MonthSelect                     |
|             || - SummaryCards (Net Cost,          |
|             ||   Room Nights, Avg Net/Night)     |
|             || - DailyDetailTable                |
|             || - ExportButtons (PDF/Excel)        |
|             ||                                   |
|             || (Invoices Tab)                    |
|             || - InvoiceList                     |
|             ||   - Status (Draft/Issued/Paid)    |
|             ||   - Amount (Supply/VAT/Total)     |
|             || - PDFDownload  - EmailSend        |
|             ||                                   |
|             || (AR Tab)                          |
|             || - UnpaidList                      |
|             ||   - CancelDeadline D-day          |
|             || - PayButton  - BulkPayButton      |
|             || - SplitPayOption                  |
|             ||                                   |
|             || (OP Points Tab)                   |
|             || - EarnHistory                     |
|             || - UseHistory                      |
|             || - TransferHistory                 |
|             || - Balance                         |
|             ||                                   |
|             || (Purchase by Hotel Tab)           |
|             || - HotelPurchaseTable              |
|             || - PurchaseChart                   |
|             || - PeriodFilter                    |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| SettlementTabs | Tabs | Switch between 5 settlement tabs |
| MonthSelect | Dropdown | Select settlement month |
| SummaryCards | Card Grid | Total Net Cost, Room Nights, Avg Net/Night |
| DailyDetailTable | DataTable | Daily settlement details |
| InvoiceList | DataTable | Invoice list (status, amount) |
| UnpaidList | DataTable | Unpaid items list (D-day display) |
| PayButton | Button | Individual payment |
| BulkPayButton | Button | Bulk payment |
| HotelPurchaseTable | DataTable | Purchase analysis by hotel |
| PurchaseChart | Chart | Purchase share chart |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Switch tab | SettlementTabs click | Display selected tab content |
| Change month | MonthSelect change | Load data for selected month |
| Individual payment | PayButton click | Process payment → update status |
| Bulk payment | BulkPayButton click | Process bulk payment for selected items |
| Invoice PDF | PDFDownload click | Download PDF |

---

### Screen: Notifications

**Purpose**: Notification center

**Entry Points**: Sidebar menu, TopBar NotificationBell

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (shared)                              |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ SummaryCards ]                  |
|             || - Critical - Unread               |
|             || - Deadlines - Payments            |
|             ||                                   |
|             || [ NotificationTabs ]              |
|             || - All - Unread - Deadlines        |
|             || - Payment - CheckIn - Bookings    |
|             || - Cancelled - System              |
|             ||                                   |
|             || [ MarkAllReadButton ]             |
|             ||                                   |
|             || [ NotificationList ]              |
|             || - NotificationItem (repeated)     |
|             ||   - PriorityBadge                 |
|             ||   - Icon  - Title  - Desc         |
|             ||   - Time  - ReadStatus            |
|             ||                                   |
|             || [ NotificationSettings ]          |
|             || - SettingsToggle (repeated)       |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| SummaryCards | Card Grid | Critical/Unread/Deadlines/Payments counts |
| NotificationTabs | Tabs | 8-category filter |
| MarkAllReadButton | Button | Mark all notifications as read |
| NotificationItem | ListItem | Priority badge, title, description, time, read status |
| PriorityBadge | Badge | Critical (red) / High (yellow) / Medium (green) / Low (gray) |
| NotificationSettings | Form | Notification receive toggle list |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Click notification | NotificationItem click | Navigate to related page + mark as read |
| Mark all read | MarkAllReadButton click | Mark all notifications as read |
| Switch tab | NotificationTabs click | Filter by category |
| Change settings | SettingsToggle change | Notification settings applied immediately |

---

### Screen: FAQ Board

**Purpose**: View frequently asked questions

**Entry Points**: Sidebar menu "FAQ Board"

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (shared)                              |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ SearchBar ]                     |
|             || - SearchInput                     |
|             ||                                   |
|             || [ CategoryTabs ]                  |
|             || - All - Booking - Payment          |
|             || - Cancellation - Account           |
|             || - Technical                        |
|             ||                                   |
|             || [ FAQList ]                       |
|             || - FAQItem (repeated, accordion)   |
|             ||   - QuestionTitle                 |
|             ||   - AnswerContent (expanded)      |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| SearchInput | Input | Keyword search (title + content) |
| CategoryTabs | Tabs | Filter by 6 categories |
| FAQItem | Accordion | Expand/collapse answer on question click |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Search | SearchInput entry | Real-time search result filtering |
| Switch category | CategoryTabs click | Show only FAQ items for that category |
| Expand FAQ | QuestionTitle click | Toggle answer accordion |

---

### Screen: My Account

**Purpose**: User and company information management

**Entry Points**: Sidebar menu "My Account", TopBar Profile

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (shared)                              |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ PersonalInfo ]                  |
|             || - NameInput  - EmailDisplay        |
|             || - PhoneInput  - PasswordChange    |
|             ||                                   |
|             || [ CompanyInfo ]                   |
|             || - CompanyName  - BusinessType     |
|             || - ContractDate                    |
|             ||                                   |
|             || [ PaymentInfo ]                   |
|             || (Prepaid)                         |
|             || - CardList                        |
|             || - DefaultCardSetting              |
|             || - AddCardButton                   |
|             || (Postpaid)                        |
|             || - DepositBalance                  |
|             || - CreditLineLimit                 |
|             ||                                   |
|             || [ OPManagement ] (Master only)    |
|             || - OPTable                         |
|             ||   - Name - Email - Status - Share |
|             || - AddOPButton                     |
|             || - EditOPButton  - DeactivateBtn   |
|             ||                                   |
|             || [ SaveButton ]                    |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| PersonalInfo | Form | Edit name, contact details, password |
| CompanyInfo | Display | Company information (read-only) |
| CardList | List | Registered corporate cards list (prepaid) |
| DepositBalance | Display | Floating Deposit balance (postpaid) |
| CreditLineLimit | Display | Credit Line limit (postpaid) |
| OPTable | DataTable | OP list (Master only) |
| AddOPButton | Button | Add OP account |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Save information | SaveButton click | Changes reflected immediately |
| Add card | AddCardButton click | Card registration modal |
| Add OP | AddOPButton click | OP creation modal |
| Deactivate OP | DeactivateBtn click | OP account deactivation confirmation |

---

### Screen: Rewards Mall

**Purpose**: Redeem products with OP Points

**Entry Points**: Sidebar menu "Rewards Mall", Dashboard OP Points Widget link

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (shared)                              |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ PointsBalance ]                 |
|             || - CurrentPoints  - UsedThisMonth  |
|             ||                                   |
|             || [ CategoryTabs ]                  |
|             || - All - GiftCards - Travel         |
|             || - Electronics - Lifestyle          |
|             || - Dining - Entertainment           |
|             ||                                   |
|             || [ ProductGrid ]                   |
|             || - ProductCard (repeated)          |
|             ||   - ProductImage                  |
|             ||   - ProductName                   |
|             ||   - PointsCost                    |
|             ||   - RedeemButton                  |
|             ||                                   |
|             || [ PointsHistory ]                 |
|             || - HistoryTable                    |
|             || - PeriodFilter                    |
|             ||                                   |
|             || [ PointsTransfer ]                |
|             || - TargetOPSelect                  |
|             || - AmountInput                     |
|             || - ReasonInput                     |
|             || - TransferButton                  |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| PointsBalance | Card | Current balance, this month's usage |
| CategoryTabs | Tabs | 7 product categories |
| ProductCard | Card | Product image, name, points price, redeem button |
| RedeemButton | Button | Redeem product (balance check) |
| HistoryTable | DataTable | Earning/usage/transfer history |
| TargetOPSelect | Select | Select OP within the same company |
| TransferButton | Button | Execute points transfer |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Redeem product | RedeemButton click | Check balance → redemption confirmation modal → deduct balance |
| Switch category | CategoryTabs click | Show only products in that category |
| Transfer points | TransferButton click | Confirmation modal → execute transfer |

---

### Screen: AI Assistant (Floating Widget)

**Purpose**: AI-powered hotel recommendation, booking analysis, area guide (accessible from all screens)

**Entry Points**: Click floating button at bottom-right of screen

**Layout**:
```
+----------------------------------+
| [ ChatHeader ]                   |
| - Title (AI Assistant)           |
| - MinimizeButton - CloseButton   |
+----------------------------------+
| [ QuickActions ]                 |
| - HotelRecommendBtn             |
| - BookingAnalysisBtn             |
| - AreaGuideBtn                   |
| - HelpBtn                        |
+----------------------------------+
| [ ChatMessages ]                 |
| - UserMessage (repeated)        |
| - AIMessage (repeated)          |
|   - TextResponse                 |
|   - HotelCard (clickable)        |
|   - AnalysisChart                |
+----------------------------------+
| [ ChatInput ]                    |
| - MessageInput   - SendButton    |
+----------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| FloatingButton | FAB | Fixed at bottom-right of screen, click to open widget |
| ChatHeader | Header | Title, minimize/close buttons |
| QuickActions | ButtonGroup | 4 quick action buttons |
| ChatMessages | ScrollArea | Message history |
| HotelCard | Card | Clickable hotel card (name, rating, price) |
| MessageInput | Input | Natural-language input |
| SendButton | Button | Send message |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Open widget | FloatingButton click | Display AI chat widget |
| Quick action | QuickAction button click | Auto-fill and send corresponding prompt |
| Send message | SendButton click | Call Claude API → display AI response |
| Click hotel card | HotelCard click | Navigate to Hotel Detail page |
| Minimize | MinimizeButton click | Collapse to FloatingButton |

---

## 5. Error Handling

| Error Code | Condition | User Message | Resolution |
|------------|-----------|--------------|------------|
| ERR-AUTH-001 | Invalid email/password | "The email or password is incorrect." | Prompt re-entry |
| ERR-AUTH-002 | Login attempt with Pending account | "Your account is awaiting approval. Please contact the administrator." | Guide internal approval process |
| ERR-AUTH-003 | Login attempt with deactivated account | "This account has been deactivated. Please contact the administrator." | Contact Master |
| ERR-AUTH-004 | Session timeout (30 minutes) | "Your session has expired. Please log in again." | Redirect to Login screen |
| ERR-SEARCH-001 | No search results | "No hotels match your search criteria. Please try different conditions." | Guide to relax filter conditions |
| ERR-SEARCH-002 | Required search fields not filled | "Please enter a destination and dates." | Highlight required fields |
| ERR-BOOK-001 | Required guest information not filled | "Please fill in all required fields." | Highlight unfilled fields |
| ERR-BOOK-002 | Room no longer available | "The selected room is no longer available." | Prompt to select a different room |
| ERR-BOOK-003 | Attempt to cancel Non-Refundable booking | "This is a Non-Refundable booking. A 100% fee will be charged upon cancellation. Are you sure you want to cancel?" | Show warning modal → proceed on confirmation, return on cancellation |
| ERR-PAY-001 | Corporate card payment failed | "Payment failed. Please check your card information." | Select a different card or retry |
| ERR-PAY-002 | Insufficient Floating Deposit balance | "Insufficient balance. Current balance: ${amount}" | Guide to use Credit Line or make a deposit |
| ERR-PAY-003 | Credit Line limit exceeded | "Your credit limit has been exceeded. Limit: ${limit}" | Guide to request a limit increase |
| ERR-PAY-004 | Low Deposit warning | "Deposit balance is below $5,000." | Guide to make a deposit (Critical notification) |
| ERR-AI-001 | Claude API connection failed | "AI service is temporarily unavailable." | Switch to Local Fallback mode |
| ERR-AI-002 | API response timeout (5 seconds) | "The response timed out. Please try again." | Retry button |
| ERR-REG-001 | Duplicate email | "This email is already registered." | Log in or use a different email |
| ERR-REG-002 | Insufficient password strength | "Password must be at least 8 characters and include letters, numbers, and special characters." | Re-enter password |
| ERR-PTS-001 | Insufficient points balance | "Insufficient points. Current balance: ${points}P" | Check balance |
| ERR-PTS-002 | Transfer attempt to OP outside the same company | "Points can only be transferred to OPs within the same company." | Re-select recipient |
| ERR-PAY-005 | Both Deposit and Credit Line insufficient | "Both balance and credit limit are insufficient." | Request deposit or limit increase |
| ERR-AUTH-005 | Account locked (5 consecutive login failures) | "Your account is locked. Please try again in 30 minutes or contact the administrator." | Wait 30 minutes or have Master manually unlock |
| ERR-AUTH-006 | Password reset — unregistered email | "Reset instructions have been sent to the provided email." | Registration status not disclosed for security; same message used |
| ERR-STORAGE-001 | LocalStorage write failed (exceeds 5MB) | "Storage space is full. Please clear old data." | Attempt automatic cleanup of old cache data |
| ERR-DOC-001 | Email send failed (Mock) | "Failed to send the email. Please try again." | Retry |
| ERR-SEARCH-003 | Past date selected for check-in | "Check-in date must be today or later." | Re-select date |
| ERR-SEARCH-004 | Check-out is earlier than check-in | "Check-out date must be after the check-in date." | Re-select date |
| ERR-GENERAL-001 | Network error | "Please check your network connection." | Check connection and retry |
