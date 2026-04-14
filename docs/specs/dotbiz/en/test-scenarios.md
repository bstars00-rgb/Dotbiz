<!-- Synced with ko version: 2026-03-28T00:00:00Z -->

## 6. Non-Functional Requirements

### 6.1 Performance
- Page load time: < 2 seconds
- Hotel search response time: < 1 second
- AI assistant response time: < 5 seconds
- DOM rendering optimization: Apply virtual scrolling or lazy loading (for large data sets)
- Image lazy loading: Apply Lazy Loading for hotel images

**Performance test baseline conditions**:
- Hotel data: 50+ hotels (major Asian cities)
- Booking data: 200+ records (LocalStorage ~2MB level)
- Concurrent tabs: 2 (within the same browser)
- Measurement point: Performance.now()-based (button click → screen rendering complete)

### 6.2 Security
- Password encryption in storage (SHA-256 hash or bcrypt simulation)
- Session timeout: Automatic logout after 30 minutes of inactivity
- Role-Based Access Control (RBAC): Separate Master/OP permissions
- XSS prevention: Escape user input
- CSRF token: Applied on form submission (when Mock API is integrated)
- Claude API key management: TBD (proxy server routing recommended)

### 6.3 Accessibility
- Accessibility is not considered in this version (future plan: apply WCAG 2.1 AA)

### 6.4 Internationalization
- Full translation implemented for 5 languages: English, Korean, Japanese, Chinese, Vietnamese
- Translations separated into i18n key-value structure files
- Date/number/currency formats: Automatically formatted based on locale
- RTL layout: Not supported (no target language requires it)

### 6.5 Compatibility
- Latest versions of Chrome, Safari, Firefox, Edge
- Basic mobile browser support
- Minimum resolution: 1024px (desktop optimized)
- Tablet support (responsive layout)

### 6.6 Availability
- Target Uptime: 99.9%
- Failure recovery time: < 4 hours

### 6.7 Data Storage
- LocalStorage-based (JSON data)
- Maximum storage capacity: 5MB (browser limit)
- Data structure versioning: Schema migration support
- **When 5MB is exceeded**: Automatically clean up old cache data (search history, AI conversation history); prioritize preserving essential data (bookings, users, settings)
- **On storage failure**: Display ERR-STORAGE-001 error, retry after cache cleanup
- **Multi-tab sync**: Synchronize data between tabs using StorageEvent listener (favorites, notification read status, etc.)

---

## 7. Test Scenarios

### TS-AUTH: Authentication & Account

#### TS-AUTH-001: Successful Login
**Given**: A user with valid email/password is on the login screen
**When**: The user enters their email and password and clicks the login button
**Then**: The user is navigated to the Dashboard screen and their name is displayed in the sidebar

#### TS-AUTH-002: Login with Invalid Credentials
**Given**: The user is on the login screen
**When**: The user enters an incorrect password and clicks the login button
**Then**: The error message "The email or password is incorrect." is displayed

#### TS-AUTH-003: Login with Pending Account
**Given**: An account in Pending status attempts to log in
**When**: Valid credentials are entered and the login button is clicked
**Then**: The message "Your account is awaiting approval." is displayed and the user is not navigated to the Dashboard

#### TS-AUTH-004: Remember Me Feature
**Given**: The user checks Remember Me on the login screen and logs in
**When**: After logging out, the user accesses the login screen again
**Then**: The email field is automatically pre-filled with the previously entered email

#### TS-AUTH-005: Session Timeout
**Given**: The user is logged in and there has been no activity for 30 minutes
**When**: The user attempts any action on the screen
**Then**: The user is redirected to the login screen and a session expiry message is displayed

#### TS-AUTH-006: 3-Step Registration
**Given**: The user is on Step 1 of the registration screen
**When**: The user fills in all required information and completes through Step 3
**Then**: An account is created in Pending status and a guidance message is displayed

#### TS-AUTH-007: Required Field Validation During Registration
**Given**: The user is on Step 1 of the registration screen with the Company Name field left blank
**When**: The user clicks the Next button
**Then**: An error indicator appears on the Company Name field and the user is not navigated to Step 2

#### TS-AUTH-008: Master OP Management
**Given**: The user accesses My Account with a Master account
**When**: The user clicks the Add OP button and enters the required information
**Then**: A new OP account is created and appears in the OP list

#### TS-AUTH-009: Master Role Access Control
**Given**: The user is logged in with a Master account
**When**: The user clicks the Settlement menu
**Then**: The Settlement page is displayed correctly

#### TS-AUTH-010: OP Role Access Control
**Given**: The user is logged in with an OP account
**When**: The user checks the sidebar
**Then**: The Settlement menu is not displayed

---

### TS-SEARCH: Hotel Search

#### TS-SEARCH-001: Basic Hotel Search
**Given**: The user is on the Find Hotel screen
**When**: The user enters a destination (Shanghai), check-in/out dates, and room count, then searches
**Then**: A list of hotels matching the criteria is displayed in List View

#### TS-SEARCH-002: Autocomplete Feature
**Given**: The user types "Shang" in the destination input field on Find Hotel
**When**: An autocomplete list appears while typing
**Then**: Related cities/hotels such as "Shanghai" appear in the dropdown

#### TS-SEARCH-003: Applying a Filter
**Given**: A hotel list is displayed in Search Results
**When**: The user selects the 5 Star filter
**Then**: Only 5-star hotels are displayed

#### TS-SEARCH-004: Changing Sort Order
**Given**: A hotel list is displayed in Search Results
**When**: The user changes the sort to "Price: Low to High"
**Then**: The hotel list is re-sorted from lowest to highest price

#### TS-SEARCH-005: Switch to Map View
**Given**: Search Results are displayed in List View
**When**: The user clicks the Map View button
**Then**: A Leaflet.js map is displayed with price markers at hotel locations

#### TS-SEARCH-006: Map View Marker Interaction
**Given**: Map View is displayed
**When**: The user clicks a hotel marker
**Then**: A popup shows the hotel image, name, rating, and remaining rooms, and the corresponding hotel is highlighted in the sidebar list

#### TS-SEARCH-007: Toggle Favorite
**Given**: The user is viewing a hotel card in Search Results
**When**: The user clicks the star icon
**Then**: The star is filled and the hotel is added to the Favorites section in Find Hotel

#### TS-SEARCH-008: No Search Results
**Given**: The user enters very restrictive search conditions on Find Hotel
**When**: The user clicks the Search button
**Then**: The message "No hotels match your search criteria." is displayed

---

### TS-HOTEL: Hotel Detail

#### TS-HOTEL-001: Hotel Detail Page Load
**Given**: The user clicks a hotel card in Search Results
**When**: The Hotel Detail page loads
**Then**: The Hero section, Rooms tab (active by default), and Breadcrumb are displayed correctly

#### TS-HOTEL-002: Tab Switch
**Given**: The user is on the Rooms tab in Hotel Detail
**When**: The user clicks the Policies tab
**Then**: The Policies tab content (check-in/out times, cancellation policy, etc.) is displayed

#### TS-HOTEL-003: Room Filter
**Given**: Multiple rooms are displayed in the Rooms tab
**When**: The user changes the Meal Plan filter to "Breakfast"
**Then**: Only rooms that include breakfast are displayed

#### TS-HOTEL-004: Room Selection
**Given**: The user is viewing a room card in the Rooms tab
**When**: The user clicks the Select button
**Then**: The user is navigated to the Booking Form screen and the selected room information is displayed in the sidebar

---

### TS-BOOK: Booking Process

#### TS-BOOK-001: Enter Guest Information and Proceed with Booking
**Given**: The user is on Booking Form (Step 1)
**When**: The user fills in all required guest information and clicks Continue
**Then**: The user is navigated to Booking Confirm (Step 2)

#### TS-BOOK-002: Validation for Missing Required Information
**Given**: The user is on Booking Form with the First Name field left blank
**When**: The user clicks the Continue button
**Then**: An error indicator appears on the First Name field and the user is not navigated to the next step

#### TS-BOOK-003: Confirm Booking After Agreeing to Terms
**Given**: The user is on Booking Confirm (Step 2)
**When**: The user checks the Terms & Conditions checkbox and clicks Confirm Booking
**Then**: An ELLIS Code is generated and the user is navigated to Booking Complete (Step 3)

#### TS-BOOK-004: Confirm Button Disabled When Terms Not Agreed
**Given**: The terms checkbox on Booking Confirm is unchecked
**When**: The user checks the Confirm Booking button
**Then**: The button is in a disabled state

#### TS-BOOK-005: ELLIS Code Format Validation
**Given**: A booking has been completed
**When**: The user checks the generated ELLIS Code
**Then**: It follows the format K + YYMMDD + HHMMSS + H + NN (e.g., K260208111020H01)

#### TS-BOOK-006: Voucher Download
**Given**: The user is on the Booking Complete screen
**When**: The user clicks the voucher download button
**Then**: A PDF file is downloaded containing the ELLIS Code, hotel information, and QR code

#### TS-BOOK-007: Booking Cancellation Process
**Given**: The user is viewing a Confirmed booking in the Booking Detail modal
**When**: The user clicks the Cancel button, selects a cancellation reason, and confirms
**Then**: The booking status changes to Cancelled and a notification is created

#### TS-BOOK-008: Cancel a Non-Refundable Booking
**Given**: The user is in the detail modal of a Non-Refundable booking
**When**: The user clicks the Cancel button
**Then**: The message "This booking cannot be cancelled (Non-Refundable)." is displayed

#### TS-BOOK-009: Re-book
**Given**: The user is on the completion screen of a cancelled booking
**When**: The user clicks the Re-book button
**Then**: The user is navigated to the same hotel detail page with the original dates retained

---

### TS-BKG: Booking Management

#### TS-BKG-001: Booking List Display
**Given**: The user accesses the Bookings page
**When**: The page loads
**Then**: The booking list is displayed in a 14-column table

#### TS-BKG-002: Apply Multiple Filters
**Given**: In the Bookings filter panel, the user sets Booking Status to "Confirmed" and Date Type to "Check In Date"
**When**: The user clicks the Search button
**Then**: Only bookings matching the specified conditions are displayed in the table

#### TS-BKG-003: Reset Filters
**Given**: Multiple filters are applied
**When**: The user clicks the Reset button
**Then**: All filters are reset to their default values and all bookings are displayed

#### TS-BKG-004: Open Booking Detail Modal
**Given**: A booking row is visible in the booking table
**When**: The user clicks the row
**Then**: A booking detail modal with 9 sections opens

#### TS-BKG-005: Excel Export
**Given**: A filtered list of bookings is displayed
**When**: The user clicks the Excel Export button
**Then**: The data matching the current filter conditions is downloaded as an .xlsx file

#### TS-BKG-006: Bulk Voucher Download
**Given**: The user selects multiple bookings using checkboxes
**When**: The user clicks the Bulk Voucher button
**Then**: Vouchers for the selected bookings are downloaded

#### TS-BKG-007: Calendar View Event Display
**Given**: The user is on the Calendar tab
**When**: A month with bookings is displayed
**Then**: Check-in (blue), Check-out (yellow), Stay (green), Cancelled (red), and Deadline (pink) events are displayed in color

#### TS-BKG-008: Calendar Cell "+N more" Display
**Given**: A date has 4 or more events
**When**: The user views that date cell
**Then**: 3 events and a "+1 more" text are displayed

#### TS-BKG-009: Change Page Size
**Given**: The booking list is displayed with the default of 20 items
**When**: The user changes the page size to 50
**Then**: Up to 50 items are displayed per page

---

### TS-PAY: Payment System

#### TS-PAY-001: Prepaid Company Corporate Card Payment
**Given**: A prepaid company OP books a Non-Refundable room
**When**: The OP selects a corporate card and confirms the booking
**Then**: Payment is processed immediately (simulation) and the booking status becomes Confirmed

#### TS-PAY-002: Reserve Now Pay Later
**Given**: A prepaid company OP books a Refundable room
**When**: The OP selects the RNPL option and confirms the booking
**Then**: The booking is confirmed without payment and appears in Accounts Receivable

#### TS-PAY-003: RNPL Cancel Deadline Auto-Cancellation
**Given**: A prepaid company's RNPL booking has exceeded the Cancel Deadline and is unpaid
**When**: The system checks the Deadline
**Then**: A warning notification is sent and the booking is automatically cancelled

#### TS-PAY-004: Postpaid Company Floating Deposit Payment
**Given**: A postpaid company OP books a room and selects the Deposit option
**When**: The booking is confirmed
**Then**: The booking amount is deducted from the Deposit balance

#### TS-PAY-005: Insufficient Deposit Balance
**Given**: The postpaid company's Deposit balance is less than the booking amount
**When**: The OP attempts to pay with Deposit
**Then**: An "Insufficient balance" message is shown along with a prompt to use the Credit Line

#### TS-PAY-006: Credit Line Limit Exceeded
**Given**: The postpaid company's Credit Line limit has been exceeded
**When**: The OP attempts to make a booking
**Then**: A "Credit limit exceeded" message is displayed and the booking cannot proceed

#### TS-PAY-007: Low Deposit Warning
**Given**: The postpaid company's Deposit balance is below $5,000
**When**: The system checks the balance
**Then**: A Critical priority notification is generated

---

### TS-SET: Settlement System

#### TS-SET-001: View Monthly Settlement
**Given**: The user accesses Settlement > Monthly tab with a Master account
**When**: The user selects February 2026
**Then**: Total Net Cost, Room Nights, Avg Net/Night, and daily details for that month are displayed

#### TS-SET-002: Download Invoice PDF
**Given**: The user views an Issued invoice in the Invoices tab
**When**: The user clicks the PDF download button
**Then**: A PDF containing supply amount, VAT (10%), and total is downloaded

#### TS-SET-003: Individual AR Payment
**Given**: There is an unpaid item in the AR tab
**When**: The user clicks the payment button for that item and completes payment
**Then**: The Payment Status changes to Fully Paid

#### TS-SET-004: Bulk AR Payment
**Given**: The user selects multiple unpaid items using checkboxes in the AR tab
**When**: The user clicks the bulk payment button
**Then**: Payment is processed for all selected items

---

### TS-AI: AI Booking Assistant

#### TS-AI-001: Natural-Language Hotel Recommendation
**Given**: The user has the AI widget open
**When**: The user enters the message "5-star in Pudong area, under $250, breakfast included"
**Then**: Hotel cards matching the criteria appear in the response, and clicking a card navigates to Hotel Detail

#### TS-AI-002: Booking Analysis Request
**Given**: The user has the AI widget open
**When**: The user enters the message "Analyze my booking status"
**Then**: Analysis results are displayed, including total booking count, spending, and hotel frequency

#### TS-AI-003: Using a Quick Action
**Given**: The Quick Actions in the AI widget are visible
**When**: The user clicks the "🏨 Hotel Recommendation" button
**Then**: The corresponding prompt is auto-filled and the AI response is displayed

#### TS-AI-004: API Connection Failure Fallback
**Given**: The Claude API connection has failed
**When**: The user requests a hotel recommendation
**Then**: A fallback response based on local hotel data is displayed along with a "Limited service" notice

#### TS-AI-005: Minimize and Restore Widget
**Given**: The AI widget is open
**When**: The user clicks the minimize button
**Then**: The widget collapses to a floating button, and clicking it again restores the widget with the previous conversation intact

---

### TS-NOTI: Notification Center

#### TS-NOTI-001: Notification List Display
**Given**: The user accesses the notification center
**When**: The page loads
**Then**: Summary cards and the notification list are displayed in priority order

#### TS-NOTI-002: Click Notification to Navigate
**Given**: There is a Check-in notification
**When**: The user clicks that notification
**Then**: The corresponding booking detail modal opens and the notification is marked as read

#### TS-NOTI-003: Mark All as Read
**Given**: There are multiple unread notifications
**When**: The user clicks the Mark All as Read button
**Then**: All notifications are changed to read status

#### TS-NOTI-004: Change Notification Settings
**Given**: Promotional Offers is set to OFF in the notification settings
**When**: The user toggles it to ON
**Then**: The setting is applied immediately and promotional notifications are received

---

### TS-DASH: Dashboard

#### TS-DASH-001: KPI Card Period Filter
**Given**: The user accesses the Dashboard
**When**: The user changes the period filter to "Last Month"
**Then**: All KPI cards and widgets are updated with data for that period

#### TS-DASH-002: Master OP Performance Display
**Given**: The user accesses the Dashboard with a Master account
**When**: The user views the page
**Then**: The OP Performance Comparison widget is displayed with 🥇🥈🥉 rankings visible

#### TS-DASH-003: OP My Performance Display
**Given**: The user accesses the Dashboard with an OP account
**When**: The user views the page
**Then**: My Performance KPIs gauge bars are displayed, and OP Performance is not shown

---

### TS-PTS: OP Points

#### TS-PTS-001: Points Earning Confirmation
**Given**: A booking has been completed
**When**: The user checks the points balance on the Rewards Mall page
**Then**: Points have been earned based on the booking amount

#### TS-PTS-002: Product Redemption
**Given**: The user is viewing a product in the Rewards Mall
**When**: The user clicks the Redeem button for a product they have sufficient balance for
**Then**: A redemption confirmation modal is displayed, and upon confirmation, the balance is deducted

#### TS-PTS-003: Attempted Redemption with Insufficient Balance
**Given**: The user selects a product that costs more than their balance
**When**: The user clicks the Redeem button
**Then**: The message "Insufficient points." is displayed

#### TS-PTS-004: Points Transfer
**Given**: The user is in the points transfer section of the Rewards Mall
**When**: The user selects an OP from the same company, enters an amount and reason, and completes the transfer
**Then**: The points are transferred to the target OP and recorded in history

---

### TS-UI: UI/UX

#### TS-UI-001: Dark Mode Toggle
**Given**: The user is in light mode
**When**: The user clicks the dark mode toggle (🌙) in the header
**Then**: The entire UI switches to dark theme and the setting is saved to localStorage

#### TS-UI-002: Language Change
**Given**: The UI is displayed in English
**When**: The user changes the language selection in the header to "한국어"
**Then**: All UI text changes to Korean

#### TS-UI-003: Currency Change
**Given**: Prices are displayed in USD
**When**: The user changes the currency selection in the header to "KRW"
**Then**: All prices are displayed converted to KRW

#### TS-UI-004: Responsive Layout
**Given**: The user is viewing the app in a desktop browser (1920px)
**When**: The user reduces the browser width to 1024px
**Then**: The layout adjusts responsively and content is displayed correctly

#### TS-UI-005: CI Color Applied
**Given**: The app is loaded
**When**: The user checks the main buttons and header
**Then**: The primary color is #FF6000 (Orange) and the success color is #009505 (Green)

---

### TS-CHAT: Support Chat

#### TS-CHAT-001: ELLIS Code Auto-Detection
**Given**: The user is entering a message in Support Chat
**When**: The user pastes an ELLIS Code (K260208111020H01)
**Then**: A "Booking detected" notification appears and the corresponding booking information is automatically loaded

#### TS-CHAT-002: AI Chatbot Auto-Response
**Given**: The user starts a new chat
**When**: The user enters the message "How do I cancel a booking?"
**Then**: An FAQ-based automatic response is displayed immediately

#### TS-CHAT-003: Escalation to Agent
**Given**: The user has asked a question the AI chatbot cannot answer
**When**: The user clicks the "Connect to Agent" button
**Then**: The status changes to agent-connected and the agent's information is displayed

---

### TS-FAQ: FAQ Board

#### TS-FAQ-001: FAQ Search
**Given**: The user accesses the FAQ Board
**When**: The user types "cancel" in the search field
**Then**: Only FAQ items related to cancellation are filtered and displayed

#### TS-FAQ-002: Category Filter
**Given**: All FAQ items are displayed on the FAQ Board
**When**: The user clicks the "Payment" category tab
**Then**: Only Payment-related FAQs are displayed

#### TS-FAQ-003: Accordion Toggle
**Given**: A FAQ item is in a collapsed state
**When**: The user clicks the question title
**Then**: The answer expands in an accordion. Clicking again collapses it.

---

### TS-EDGE: Edge Cases and Boundary Value Tests (Round 1 Review Addition)

#### TS-EDGE-001: Block Search with Past Check-in Date
**Given**: The user is on the Find Hotel screen
**When**: The user sets the check-in date to yesterday and clicks the Search button
**Then**: The ERR-SEARCH-003 error message is displayed and the search is not executed

#### TS-EDGE-002: Booking Status Validation After Payment Failure
**Given**: A prepaid company OP is at the booking confirmation step for a Non-Refundable room
**When**: Corporate card payment fails with ERR-PAY-001
**Then**: No booking is created and the user is returned to Booking Form. Can select a different card or retry.

#### TS-EDGE-003: Credit Line Conversion UI When Deposit Balance is Insufficient
**Given**: Postpaid company Deposit balance $3,000, booking amount $5,000
**When**: The user selects the Deposit option and attempts to confirm the booking
**Then**: The confirmation UI "Deposit balance is insufficient. Would you like to use the Credit Line?" is displayed

#### TS-EDGE-004: Both Deposit and Credit Line Insufficient
**Given**: Postpaid company Deposit $1,000, remaining Credit Line limit $2,000, booking amount $5,000
**When**: The user attempts to make a booking
**Then**: ERR-PAY-005 message "Both balance and credit limit are insufficient." is displayed

#### TS-EDGE-005: Free Cancel Boundary Value for Cancellation Fee
**Given**: A booking has a Free Cancel Deadline of 3 days before check-in
**When**: The user attempts to cancel at exactly 00:00:00, 3 days before check-in
**Then**: Cancellation fee of $0 is displayed (boundary value inclusive)

#### TS-EDGE-006: Master Can View Deactivated OP's Existing Bookings
**Given**: There is an OP account with 3 Confirmed bookings
**When**: The Master deactivates that OP
**Then**: Login as the deactivated OP is blocked with ERR-AUTH-003, and the 3 bookings continue to appear in Master's booking list

#### TS-EDGE-007: Account Lockout (5 Consecutive Failed Login Attempts)
**Given**: The user enters incorrect passwords consecutively for a valid account
**When**: The user fails to log in 5 times in a row
**Then**: The ERR-AUTH-005 message is displayed and login attempts are blocked for 30 minutes

#### TS-EDGE-008: LocalStorage 5MB Limit Reached
**Given**: LocalStorage is more than 4.9MB full and the user attempts a new booking
**When**: The user clicks to confirm the booking
**Then**: The ERR-STORAGE-001 message is displayed, automatic cache cleanup is performed, and a retry prompt is shown

#### TS-EDGE-009: Booking Form Data Handling During Session Expiry
**Given**: An OP has been entering guest information in Booking Form for 30 minutes
**When**: The user clicks the Continue button
**Then**: Session expiry message displayed → navigated to Login → after re-login, form data restoration is attempted from sessionStorage

#### TS-EDGE-010: Prevent Duplicate Notification Creation
**Given**: There is a booking for which a Cancel Deadline D-1 notification has already been created
**When**: The page is refreshed and the notification creation logic runs again
**Then**: A duplicate D-1 notification is not created for the same booking

#### TS-EDGE-011: Multi-Tab LocalStorage Synchronization
**Given**: Two browser tabs are open with the same OP account
**When**: A favorite is added in Tab A
**Then**: On refresh in Tab B, the synchronized favorite is displayed

#### TS-EDGE-012: Verify Stored Amount After Currency Change and Booking Confirmation
**Given**: The user is viewing a USD $200 room and has changed the currency to KRW
**When**: The user confirms the booking at the KRW displayed price
**Then**: The booking detail shows the amount stored in USD ($200), with the KRW equivalent displayed alongside

#### TS-EDGE-013: Forgot Password Flow
**Given**: The user clicks ForgotPasswordLink on the Login screen
**When**: The user enters a registered email and requests a reset
**Then**: The password reset screen is displayed, and login is possible after setting a new password

#### TS-EDGE-014: Share Ratio Change Does Not Retroactively Apply
**Given**: OP A has a Share ratio of 60% and has a points earning history
**When**: The Master changes the Share ratio to 40%
**Then**: Existing points history is unchanged and the 40% rate applies to earnings from that point forward

#### TS-EDGE-015: Click Calendar "+N more"
**Given**: A date has 4 events and "+1 more" is displayed
**When**: The user clicks the "+1 more" text
**Then**: The full list of events for that date is displayed in a popup
