## 4. Screen Definitions

### Screen: Main Layout

**Purpose**: Shared application shell with sidebar navigation and top bar. All authenticated screens render inside the content slot.

**Entry Points**: After successful login (all screens except Login and Registration)

**Layout**:
```
+----------------------------------------------------------+
| [ TopBar ]                                               |
| - GlobalSearch  - CurrencySelect  - LanguageSelect       |
| - DarkModeToggle  - NotificationBell  - UserProfile      |
+----------------------------------------------------------+
| [ Sidebar ]         || [ ContentSlot ]                   |
| - AppLogo           ||                                   |
| - NavMenu:          || (Each screen renders here)        |
|   - AIAssistant     ||                                   |
|   - FindHotel       ||                                   |
|   - Dashboard       ||                                   |
|   - Bookings        ||                                   |
|   - Settlement*     ||                                   |
|   - Notifications   ||                                   |
|   - FAQBoard        ||                                   |
|   - MyAccount       ||                                   |
|   - RewardsMall     ||                                   |
|                     ||                                   |
| - UserInfo          ||                                   |
| - LogoutButton      ||                                   |
+----------------------------------------------------------+
| [ AIFloatingWidget ]                                     |
| - FloatingButton (bottom-right)                          |
+----------------------------------------------------------+
```
*Settlement is Master-only (hidden for OP role)

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| TopBar | Header | Fixed top bar with global controls |
| GlobalSearch | Input | Global search across bookings and hotels |
| CurrencySelect | Dropdown | 10 currencies: USD, KRW, JPY, CNY, VND, EUR, GBP, THB, SGD, HKD |
| LanguageSelect | Dropdown | 5 languages: EN, KO, JA, ZH, VI |
| DarkModeToggle | Button | Toggle dark/light theme (🌙/☀️), persisted to localStorage |
| NotificationBell | Button | Navigate to Notifications, shows unread count badge |
| UserProfile | Button | Navigate to My Account, shows user name and avatar |
| Sidebar | Navigation | Collapsible sidebar with navigation menu |
| AppLogo | Image | DOTBIZ brand logo, click navigates to Dashboard |
| NavMenu | List | Navigation items with active state highlight |
| UserInfo | Display | Current user name and role (Master/OP) |
| LogoutButton | Button | Logout and redirect to Login screen |
| ContentSlot | Slot | Main content area where each screen renders |
| AIFloatingWidget | FAB | AI Assistant floating button (bottom-right corner) |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Navigate | NavMenu item click | Hash-based routing to target screen |
| Search | GlobalSearch input | Search across bookings/hotels |
| Change Currency | CurrencySelect change | All prices update to selected currency |
| Change Language | LanguageSelect change | All UI text updates to selected language |
| Toggle Dark Mode | DarkModeToggle click | Theme switches, saved to localStorage |
| View Notifications | NotificationBell click | Navigate to Notifications screen |
| Open AI Assistant | AIFloatingWidget click | Open AI chat widget overlay |
| Logout | LogoutButton click | Clear session, redirect to Login |
