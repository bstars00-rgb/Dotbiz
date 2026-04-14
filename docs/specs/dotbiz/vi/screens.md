<!-- Synced with ko version: 2026-03-28T00:00:00Z -->

## 4. Screen Definitions

@layout: _shared/main-layout

---

### Screen: Login

**Purpose**: Màn hình đăng nhập dựa trên email/mật khẩu

**Entry Points**: Truy cập ứng dụng lần đầu, khi phiên hết hạn

**Layout**:
```
+--------------------------------------------------+
| [ Header ]                                       |
| - Logo (DOTBIZ)             - DarkModeToggle     |
+--------------------------------------------------+
| [ Login Form ]                                   |
|                                                  |
|   - AnimatedBackground (Tech Style)              |
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
| Logo | Image | Logo thương hiệu DOTBIZ |
| DarkModeToggle | Button | 🌙/☀️ Chuyển đổi chế độ tối/sáng |
| AnimatedBackground | Canvas | Nền animation phong cách Tech |
| EmailInput | Input | Nhập email, tự động điền khi có Remember Me |
| PasswordInput | Input | Nhập mật khẩu, bật/tắt hiển thị |
| RememberMeCheckbox | Checkbox | Lưu email vào localStorage |
| LoginButton | Button | Thực hiện đăng nhập |
| ForgotPasswordLink | Link | Chuyển đến màn hình đặt lại mật khẩu |
| RegisterLink | Link | Chuyển đến trang đăng ký |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Đăng nhập | Nhấn LoginButton | Xác thực thông tin đăng nhập → Chuyển đến Dashboard |
| Quên mật khẩu | Nhấn ForgotPasswordLink | Chuyển đến màn hình đặt lại mật khẩu |
| Đăng ký | Nhấn RegisterLink | Chuyển đến trang Registration |
| Chuyển chế độ tối | Nhấn DarkModeToggle | Chuyển theme, lưu vào localStorage |

---

### Screen: Registration

**Purpose**: Quy trình đăng ký 3 bước

**Entry Points**: RegisterLink trên màn hình Login

**Layout**:
```
+--------------------------------------------------+
| [ Header ]                                       |
| - Logo                      - DarkModeToggle     |
+--------------------------------------------------+
| [ StepIndicator ]                                |
| - Step1(Thông tin công ty)  Step2(Người dùng)  Step3(Đồng ý hợp đồng) |
+--------------------------------------------------+
| [ FormContent ]                                  |
|                                                  |
|   Bước 1:                                        |
|   - CompanyNameInput                             |
|   - BusinessRegNoInput                           |
|   - BusinessTypeSelect (trả trước/trả sau)       |
|   - AddressInput                                 |
|   - PhoneInput                                   |
|   - CompanyEmailInput                            |
|                                                  |
|   Bước 2:                                        |
|   - FullNameInput                                |
|   - PositionInput                                |
|   - UserEmailInput                               |
|   - PasswordInput                                |
|   - MobileInput                                  |
|   - LanguageSelect                               |
|                                                  |
|   Bước 3:                                        |
|   - TermsCheckbox (Điều khoản sử dụng B2B)       |
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
| StepIndicator | Stepper | Hiển thị bước hiện tại (1/2/3) |
| CompanyNameInput | Input | Nhập tên công ty (bắt buộc) |
| BusinessRegNoInput | Input | Mã số đăng ký kinh doanh (bắt buộc) |
| BusinessTypeSelect | Select | Loại doanh nghiệp trả trước/trả sau |
| AddressInput | Input | Nhập địa chỉ |
| PhoneInput | Input | Nhập số điện thoại |
| CompanyEmailInput | Input | Email công ty (bắt buộc) |
| FullNameInput | Input | Họ tên (bắt buộc) |
| PositionInput | Input | Chức vụ |
| UserEmailInput | Input | Email người dùng (bắt buộc) |
| PasswordInput | Input | Mật khẩu (bắt buộc, 8~128 ký tự, chữ cái+số+ký tự đặc biệt) |
| PasswordConfirmInput | Input | Xác nhận mật khẩu (phải khớp với PasswordInput) |
| MobileInput | Input | Số điện thoại di động |
| LanguageSelect | Select | Ngôn ngữ ưa thích (5 ngôn ngữ) |
| TermsCheckbox | Checkbox | Đồng ý điều khoản sử dụng B2B (bắt buộc) |
| ContractDownloadButton | Button | Tải xuống hợp đồng PDF |
| BackButton | Button | Quay lại bước trước |
| NextButton | Button | Bước tiếp theo / Hoàn tất |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Bước tiếp theo | Nhấn NextButton | Kiểm tra trường bắt buộc → Bước tiếp theo |
| Bước trước | Nhấn BackButton | Quay lại bước trước (giữ nguyên dữ liệu đã nhập) |
| Tải xuống hợp đồng | Nhấn ContractDownloadButton | Tải xuống tệp PDF |
| Hoàn tất đăng ký | Hoàn thành Bước 3 | Hiển thị thông báo trạng thái Pending |

---

### Screen: Dashboard

**Purpose**: Dashboard tóm tắt KPI và phân tích kinh doanh

**Entry Points**: Màn hình mặc định sau khi đăng nhập, menu sidebar

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
*Settlement chỉ dành cho Master

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| Sidebar | Navigation | Các mục menu, highlight trang hiện tại |
| TopBar | Header | Tìm kiếm, tiền tệ/ngôn ngữ/chế độ tối, thông báo, hồ sơ |
| KPICards | Card Grid | 4 KPI + Tỷ lệ tăng/giảm so với kỳ trước, bộ lọc thời gian |
| OPPointsWidget | Card | Widget nhỏ gọn hiển thị tình trạng điểm |
| TopHotels | Table | 5 khách sạn hàng đầu (số lượng, số tiền) |
| TTVTrend | Chart | Biểu đồ cột CSS 12 tháng |
| BookingFunnel | Chart | Funnel tỷ lệ chuyển đổi 5 bước |
| HotelProfitability | Table | Lợi nhuận theo khách sạn (5 hàng đầu) |
| OPPerformance | Table | So sánh kết quả theo OP (chỉ dành cho Master) |
| MyPerformance | GaugeBar | KPI cá nhân (chỉ dành cho OP) |
| NotificationBell | Button | Chuyển đến trung tâm thông báo, badge chưa đọc |
| CurrencySelect | Dropdown | Chọn 10 loại tiền tệ |
| LangSelect | Dropdown | Chọn 5 ngôn ngữ |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Thay đổi bộ lọc thời gian | Chọn bộ lọc KPICards | Cập nhật dữ liệu toàn bộ widget |
| Chuyển đến Rewards Mall | Nhấn liên kết OPPointsWidget | Chuyển đến trang Rewards Mall |
| Điều hướng menu | Nhấn menu Sidebar | Hash routing đến trang tương ứng |

---

### Screen: Find Hotel

**Purpose**: Điểm vào tìm kiếm khách sạn và yêu thích

**Entry Points**: Menu sidebar "Find Hotel"

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (Chung)                               |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ SearchForm ]                    |
|             || - DestinationInput (Tự động hoàn thành)|
|             || - CheckInPicker  - CheckOutPicker |
|             || - NightsDisplay                   |
|             || - RoomsSelect  - AdultsSelect     |
|             || - ChildrenSelect  - ChildAgeInputs|
|             || - NationalitySelect               |
|             || - SearchButton                    |
|             ||                                   |
|             || [ FavoriteHotels ]                |
|             || - FavoriteHotelCard (lặp lại)     |
|             ||                                   |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| DestinationInput | Autocomplete | Tự động hoàn thành tên thành phố/địa danh/khách sạn (các thành phố lớn Châu Á) |
| CheckInPicker | DatePicker | Chọn ngày check-in |
| CheckOutPicker | DatePicker | Chọn ngày check-out |
| NightsDisplay | Display | Tự động tính và hiển thị số đêm |
| RoomsSelect | Select | Chọn số phòng |
| AdultsSelect | Select | Chọn số người lớn |
| ChildrenSelect | Select | Chọn số trẻ em |
| ChildAgeInputs | Input[] | Nhập độ tuổi từng trẻ em riêng lẻ (tạo động) |
| NationalitySelect | Select | Chọn quốc tịch |
| SearchButton | Button | Thực hiện tìm kiếm |
| FavoriteHotelCard | Card | Thẻ khách sạn yêu thích (hình ảnh, tên, số sao) |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Thực hiện tìm kiếm | Nhấn SearchButton | Chuyển đến trang Search Results |
| Nhấn khách sạn yêu thích | Nhấn FavoriteHotelCard | Chuyển đến trang Hotel Detail |
| Thay đổi số trẻ em | Thay đổi ChildrenSelect | Tự động thêm/xóa ChildAgeInputs |

---

### Screen: Search Results

**Purpose**: Kết quả tìm kiếm khách sạn (List View + Map View)

**Entry Points**: Thực hiện tìm kiếm từ Find Hotel

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (Chung)                               |
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
|             || - AreaFilter     ||   (lặp lại)   |
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
| CompactSearchBar | Form | Thanh compact có thể chỉnh sửa điều kiện tìm kiếm |
| ViewToggle | ButtonGroup | Chuyển đổi List ↔ Map view |
| SortDropdown | Dropdown | Theo đề xuất, theo giá (↑↓), theo đánh giá |
| ResultCount | Display | Số lượng kết quả tìm kiếm |
| FilterSidebar | Panel | Bộ lọc số sao/giá/khu vực/tiện nghi |
| StarRating | CheckboxGroup | Bộ lọc 5/4/3 sao |
| PriceRange | RangeSlider | Dưới $100 ~ $300+ |
| AreaFilter | CheckboxGroup | Bộ lọc theo khu vực |
| AmenityFilter | CheckboxGroup | Free Cancellation, Breakfast, Pool, v.v. |
| HotelCard | Card | Hình ảnh khách sạn, tên, số sao, đánh giá, giá, huy hiệu, yêu thích |
| LeafletMap | Map | Bản đồ tương tác Leaflet.js |
| MapSidebar | Panel | Danh sách khách sạn bên cạnh bản đồ (liên kết với marker) |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Chuyển đổi view | Nhấn ViewToggle | Chuyển đổi List ↔ Map |
| Áp dụng bộ lọc | Thay đổi mục bộ lọc | Lọc kết quả ngay lập tức |
| Thay đổi sắp xếp | Thay đổi SortDropdown | Sắp xếp lại kết quả ngay lập tức |
| Chọn khách sạn | Nhấn HotelCard | Chuyển đến Hotel Detail |
| Yêu thích | Nhấn ngôi sao | Chuyển đổi yêu thích |
| Nhấn marker | Nhấn marker bản đồ | Hiển thị popup + Highlight danh sách |

---

### Screen: Hotel Detail

**Purpose**: Thông tin khách sạn và chọn phòng (4 tab)

**Entry Points**: Nhấn thẻ khách sạn trong Search Results, nhấn khách sạn được AI đề xuất

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (Chung)                               |
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
|             || - RoomCard (lặp lại)              |
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
|             || - FacilityGroup (lặp lại)         |
|             ||   - CategoryTitle                 |
|             ||   - FacilityItem (biểu tượng+văn bản)|
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| Breadcrumb | Navigation | Điều hướng phân cấp |
| HeroSection | Section | Hình ảnh, tên, số sao, đánh giá khách sạn |
| FavoriteButton | Button | Chuyển đổi yêu thích |
| TabNavigation | Tabs | Chuyển đổi 4 tab |
| RoomFilter | FilterBar | Room Type, Bed Type, Price, Meal, Refundable |
| RoomCard | Card | Thông tin phòng + nút Select |
| SelectButton | Button | Chọn phòng → Chuyển đến form đặt phòng |
| HotelDescription | Text | Văn bản giới thiệu khách sạn |
| FacilityGroup | List | Danh sách tiện nghi theo danh mục |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Chuyển tab | Nhấn TabNavigation | Hiển thị nội dung tab tương ứng |
| Lọc phòng | Thay đổi RoomFilter | Lọc danh sách phòng theo thời gian thực |
| Chọn phòng | Nhấn SelectButton | Chuyển đến Booking Form |
| Chỉnh sửa tìm kiếm | CompactSearchBar ModifyButton | Thay đổi ngày/số phòng |

---

### Screen: Booking Form (Bước 1)

**Purpose**: Nhập thông tin khách và chọn phương thức thanh toán

**Entry Points**: Nút Select phòng trong Hotel Detail

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (Chung)                               |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ BookingStepIndicator ]           |
|             || - Step1(Thông tin) Step2(Xác nhận) Step3(Hoàn tất)|
|             ||                                   |
|             || [ GuestForm ]  || [ BookingSummary]|
|             || - FirstName    || - HotelName     |
|             || - LastName     || - RoomType      |
|             || - Email        || - CheckIn/Out   |
|             || - Mobile       || - Nights        |
|             || - SpecialReq   || - Guests        |
|             ||                || - RoomRate      |
|             || [ PaymentMethod]| - Tax           |
|             || (Trả trước)    || - Total          |
|             || - CardSelect   ||                 |
|             || - RNPLOption   ||                 |
|             || (Trả sau)      ||                 |
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
| BookingStepIndicator | Stepper | Hiển thị tiến trình đặt phòng (1/2/3) |
| FirstNameInput | Input | Tên khách (bắt buộc) |
| LastNameInput | Input | Họ khách (bắt buộc) |
| EmailInput | Input | Email khách (bắt buộc) |
| MobileInput | Input | Số liên hệ khách |
| SpecialRequests | Textarea | Yêu cầu đặc biệt |
| BookingSummary | Card | Tóm tắt đặt phòng (khách sạn, phòng, ngày, giá) |
| CardSelect | Select | Chọn thẻ doanh nghiệp đã đăng ký (trả trước) |
| RNPLOption | Radio | Reserve Now Pay Later (trả trước) |
| DepositOption | Radio | Trừ Floating Deposit (trả sau) |
| CreditOption | Radio | Sử dụng Credit Line (trả sau) |
| ContinueButton | Button | Chuyển bước tiếp theo |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Tiếp tục | Nhấn ContinueButton | Kiểm tra trường bắt buộc → Chuyển đến Booking Confirm |
| Quay lại | Nhấn BackButton | Quay lại Hotel Detail |

---

### Screen: Booking Confirm (Bước 2)

**Purpose**: Xác nhận đặt phòng cuối cùng và đồng ý điều khoản

**Entry Points**: Nút tiếp tục của Booking Form

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (Chung)                               |
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
|             || - Đồng ý Terms & Conditions        |
|             ||                                   |
|             || [ FormActions ]                   |
|             || - BackButton  - ConfirmButton     |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| ReviewSection | Section | Tóm tắt thông tin đặt phòng (khách sạn, ngày, phòng, khách) |
| PriceDetail | Table | Chi tiết Room Rate, Tax, Total |
| CancelPolicyInfo | Info | Hướng dẫn chính sách hủy |
| TermsCheckbox | Checkbox | Đồng ý điều khoản (bắt buộc) |
| ConfirmButton | Button | Xác nhận đặt phòng (kích hoạt khi đồng ý điều khoản) |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Đồng ý điều khoản | Chọn TermsCheckbox | Kích hoạt ConfirmButton |
| Xác nhận đặt phòng | Nhấn ConfirmButton | Tạo ELLIS Code → Chuyển đến Booking Complete |
| Quay lại | Nhấn BackButton | Quay lại Booking Form |

---

### Screen: Booking Complete (Bước 3)

**Purpose**: Màn hình đặt phòng thành công

**Entry Points**: Xác nhận đặt phòng từ Booking Confirm

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (Chung)                               |
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
|             || - RebookButton (khi hủy)          |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| SuccessIcon | Icon | Biểu tượng thành công dấu check |
| ELLISCode | Display | Hiển thị ELLIS Booking Code (K+YYMMDD+HHMMSS+H+NN) |
| BookingDetail | Section | Thông tin chi tiết đặt phòng |
| VoucherDownload | Button | Tải xuống voucher PDF |
| VoucherEmail | Button | Gửi voucher qua email |
| MyBookingsButton | Button | Chuyển đến danh sách đặt phòng |
| NewBookingButton | Button | Chuyển đến tìm kiếm mới |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Tải xuống voucher | Nhấn VoucherDownload | Tải xuống tệp PDF |
| Email voucher | Nhấn VoucherEmail | Gửi đến email khách |
| Danh sách đặt phòng | Nhấn MyBookingsButton | Chuyển đến trang Bookings |
| Đặt phòng mới | Nhấn NewBookingButton | Chuyển đến Find Hotel |

---

### Screen: Bookings

**Purpose**: Danh sách đặt phòng, chế độ xem lịch, Support Chat (3 tab)

**Entry Points**: Menu sidebar "Bookings"

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (Chung)                               |
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
|             || - 14 Column Table (lặp lại)       |
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
|             || - EventBadge (theo màu sắc)       |
|             || [ UpcomingCheckins ]              |
|             || - Next 5 check-ins table          |
|             ||                                   |
|             || (Support Chat Tab)                |
|             || [ ChatList ]  || [ ChatArea ]     |
|             || - ChatRoom    || - Messages       |
|             ||   (lặp lại)   || - InputBar       |
|             ||               || - AttachButton   |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| TabBar | Tabs | Chuyển đổi Danh sách đặt phòng / Lịch / Chat |
| FilterPanel | Form | Bộ lọc nhiều điều kiện |
| DateTypeSelect | Select | Booking/Cancel/CheckIn/CheckOut/Deadline/Stay |
| BookingStatusSelect | Select | Confirmed/Cancelled/Pending/No-show/Completed |
| PaymentStatusSelect | Select | 6 trạng thái thanh toán |
| BookingTable | DataTable | 14 cột, checkbox, phân trang |
| ExcelExportBtn | Button | Xuất .xlsx |
| BulkVoucherBtn | Button | Tải xuống voucher hàng loạt cho các đặt phòng đã chọn |
| CalendarGrid | Calendar | Lưới theo tháng, badge sự kiện theo màu sắc |
| MonthlyStats | Card Grid | 5 thẻ thống kê hàng tháng |
| UpcomingCheckins | Table | 5 lần check-in tiếp theo (màu D-day) |
| ChatList | List | Danh sách phòng chat |
| ChatArea | Panel | Khu vực tin nhắn + ô nhập liệu |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Chuyển tab | Nhấn TabBar | Hiển thị nội dung tab tương ứng |
| Áp dụng bộ lọc | Nhấn SearchBtn | Tìm kiếm theo điều kiện bộ lọc |
| Xóa bộ lọc | Nhấn ResetBtn | Xóa tất cả bộ lọc |
| Chi tiết đặt phòng | Nhấn hàng trong bảng | Mở modal chi tiết đặt phòng |
| Xuất Excel | Nhấn ExcelExportBtn | Tải xuống tệp .xlsx |
| Voucher hàng loạt | Nhấn BulkVoucherBtn | Tải xuống voucher các đặt phòng đã chọn |
| Sự kiện lịch | Nhấn EventBadge | Mở modal chi tiết đặt phòng |
| Gửi tin nhắn | Nhấn nút gửi | Gửi tin nhắn |

---

### Screen: Booking Detail Modal

**Purpose**: Xem toàn bộ thông tin đặt phòng (Modal 9 phần)

**Entry Points**: Nhấn hàng trong bảng Bookings, dán ELLIS Code

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
| ModalHeader | Header | Hiển thị ELLIS Code + nút đóng |
| BookingSummary | Section | Trạng thái, ngày, mã đặt phòng |
| HotelInfo | Section | Tên khách sạn, địa chỉ, liên hệ |
| RoomDetails | Section | Loại phòng, số khách, giá |
| GuestInfo | Section | Thông tin khách |
| PaymentInfo | Section | Số tiền, trạng thái, phương thức thanh toán |
| CancelPolicy | Section | Deadline hủy, phí hủy |
| BookingTimeline | Timeline | Timeline sự kiện đặt phòng |
| VoucherBtn | Button | Tải xuống voucher PDF |
| ReceiptBtn | Button | Tải xuống hóa đơn PDF |
| CancelBtn | Button | Mở modal hủy đặt phòng |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Tải xuống voucher | Nhấn VoucherBtn | Tải xuống PDF |
| Tải xuống hóa đơn | Nhấn ReceiptBtn | Tải xuống PDF |
| Hủy đặt phòng | Nhấn CancelBtn | Mở modal xác nhận hủy |
| Đóng | Nhấn CloseButton | Đóng modal |

---

### Screen: Settlement

**Purpose**: Hệ thống thanh toán (5 tab, chỉ dành cho Master)

**Entry Points**: Menu sidebar "Settlement" (chỉ Master mới truy cập được)

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (Chung)                               |
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
|             ||   - Amount (Giá cung cấp/VAT/Tổng)|
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
| SettlementTabs | Tabs | Chuyển đổi 5 tab thanh toán |
| MonthSelect | Dropdown | Chọn tháng thanh toán |
| SummaryCards | Card Grid | Total Net Cost, Room Nights, Avg Net/Night |
| DailyDetailTable | DataTable | Chi tiết thanh toán theo ngày |
| InvoiceList | DataTable | Danh sách hóa đơn (trạng thái, số tiền) |
| UnpaidList | DataTable | Danh sách khoản chưa thanh toán (hiển thị D-day) |
| PayButton | Button | Thanh toán riêng lẻ |
| BulkPayButton | Button | Thanh toán hàng loạt |
| HotelPurchaseTable | DataTable | Phân tích mua hàng theo khách sạn |
| PurchaseChart | Chart | Biểu đồ tỷ trọng mua hàng |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Chuyển tab | Nhấn SettlementTabs | Hiển thị nội dung tab tương ứng |
| Đổi tháng | Thay đổi MonthSelect | Tải dữ liệu tháng tương ứng |
| Thanh toán riêng lẻ | Nhấn PayButton | Xử lý thanh toán → Thay đổi trạng thái |
| Thanh toán hàng loạt | Nhấn BulkPayButton | Thanh toán hàng loạt các khoản đã chọn |
| Hóa đơn PDF | Nhấn PDFDownload | Tải xuống PDF |

---

### Screen: Notifications

**Purpose**: Trung tâm thông báo

**Entry Points**: Menu sidebar, TopBar NotificationBell

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (Chung)                               |
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
|             || - NotificationItem (lặp lại)      |
|             ||   - PriorityBadge                 |
|             ||   - Icon  - Title  - Desc         |
|             ||   - Time  - ReadStatus            |
|             ||                                   |
|             || [ NotificationSettings ]          |
|             || - SettingsToggle (lặp lại)        |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| SummaryCards | Card Grid | Số lượng Critical/Unread/Deadlines/Payments |
| NotificationTabs | Tabs | Bộ lọc 8 danh mục |
| MarkAllReadButton | Button | Đánh dấu tất cả đã đọc |
| NotificationItem | ListItem | Badge ưu tiên, tiêu đề, mô tả, thời gian, trạng thái đọc |
| PriorityBadge | Badge | Critical (đỏ)/High (vàng)/Medium (xanh lá)/Low (xám) |
| NotificationSettings | Form | Danh sách bật/tắt nhận thông báo |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Nhấn thông báo | Nhấn NotificationItem | Chuyển đến trang liên quan + Đánh dấu đã đọc |
| Đọc tất cả | Nhấn MarkAllReadButton | Đánh dấu tất cả thông báo đã đọc |
| Chuyển tab | Nhấn NotificationTabs | Lọc theo danh mục |
| Thay đổi cài đặt | Thay đổi SettingsToggle | Phản ánh cài đặt nhận thông báo ngay lập tức |

---

### Screen: FAQ Board

**Purpose**: Xem các câu hỏi thường gặp

**Entry Points**: Menu sidebar "FAQ Board"

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (Chung)                               |
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
|             || - FAQItem (lặp lại, accordion)    |
|             ||   - QuestionTitle                 |
|             ||   - AnswerContent (mở ra)         |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| SearchInput | Input | Tìm kiếm từ khóa (tiêu đề+nội dung) |
| CategoryTabs | Tabs | Bộ lọc 6 danh mục |
| FAQItem | Accordion | Nhấn câu hỏi để mở/đóng câu trả lời |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Tìm kiếm | Nhập SearchInput | Lọc kết quả tìm kiếm theo thời gian thực |
| Chuyển danh mục | Nhấn CategoryTabs | Chỉ hiển thị FAQ danh mục tương ứng |
| Mở FAQ | Nhấn QuestionTitle | Chuyển đổi accordion câu trả lời |

---

### Screen: My Account

**Purpose**: Quản lý thông tin người dùng/doanh nghiệp

**Entry Points**: Menu sidebar "My Account", TopBar Profile

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (Chung)                               |
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
|             || (Trả trước)                       |
|             || - CardList                        |
|             || - DefaultCardSetting              |
|             || - AddCardButton                   |
|             || (Trả sau)                         |
|             || - DepositBalance                  |
|             || - CreditLineLimit                 |
|             ||                                   |
|             || [ OPManagement ] (Chỉ Master)    |
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
| PersonalInfo | Form | Thay đổi tên, liên hệ, mật khẩu |
| CompanyInfo | Display | Thông tin doanh nghiệp (chỉ đọc) |
| CardList | List | Danh sách thẻ doanh nghiệp đã đăng ký (trả trước) |
| DepositBalance | Display | Số dư Floating Deposit (trả sau) |
| CreditLineLimit | Display | Hạn mức Credit Line (trả sau) |
| OPTable | DataTable | Danh sách OP (chỉ dành cho Master) |
| AddOPButton | Button | Thêm tài khoản OP |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Lưu thông tin | Nhấn SaveButton | Phản ánh thay đổi ngay lập tức |
| Thêm thẻ | Nhấn AddCardButton | Modal đăng ký thẻ |
| Thêm OP | Nhấn AddOPButton | Modal tạo OP |
| Vô hiệu hóa OP | Nhấn DeactivateBtn | Xác nhận vô hiệu hóa tài khoản OP |

---

### Screen: Rewards Mall

**Purpose**: Đổi sản phẩm bằng OP Points

**Entry Points**: Menu sidebar "Rewards Mall", liên kết OP Points Widget trên Dashboard

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (Chung)                               |
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
|             || - ProductCard (lặp lại)           |
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
| PointsBalance | Card | Số dư hiện tại, lượng sử dụng trong tháng |
| CategoryTabs | Tabs | 7 danh mục sản phẩm |
| ProductCard | Card | Hình ảnh, tên, giá điểm, nút đổi sản phẩm |
| RedeemButton | Button | Đổi sản phẩm (kiểm tra số dư) |
| HistoryTable | DataTable | Lịch sử tích lũy/sử dụng/chuyển điểm |
| TargetOPSelect | Select | Chọn OP trong cùng doanh nghiệp |
| TransferButton | Button | Thực hiện chuyển điểm |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Đổi sản phẩm | Nhấn RedeemButton | Kiểm tra số dư → Modal xác nhận đổi → Trừ số dư |
| Chuyển danh mục | Nhấn CategoryTabs | Chỉ hiển thị sản phẩm danh mục tương ứng |
| Chuyển điểm | Nhấn TransferButton | Modal xác nhận → Thực hiện chuyển |

---

### Screen: AI Assistant (Widget nổi)

**Purpose**: Đề xuất khách sạn dựa trên AI, phân tích đặt phòng, hướng dẫn khu vực (có thể truy cập từ mọi màn hình)

**Entry Points**: Nhấn nút nổi ở góc dưới bên phải màn hình

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
| - UserMessage (lặp lại)         |
| - AIMessage (lặp lại)           |
|   - TextResponse                 |
|   - HotelCard (có thể nhấp)     |
|   - AnalysisChart                |
+----------------------------------+
| [ ChatInput ]                    |
| - MessageInput   - SendButton    |
+----------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| FloatingButton | FAB | Cố định góc dưới bên phải, nhấn để mở widget |
| ChatHeader | Header | Tiêu đề, nút thu nhỏ/đóng |
| QuickActions | ButtonGroup | 4 nút thực hiện nhanh |
| ChatMessages | ScrollArea | Lịch sử tin nhắn |
| HotelCard | Card | Thẻ khách sạn có thể nhấp (tên, đánh giá, giá) |
| MessageInput | Input | Nhập ngôn ngữ tự nhiên |
| SendButton | Button | Gửi tin nhắn |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Mở widget | Nhấn FloatingButton | Hiển thị widget chat AI |
| Quick Action | Nhấn nút QuickAction | Tự động nhập + gửi prompt tương ứng |
| Gửi tin nhắn | Nhấn SendButton | Gọi Claude API → Hiển thị phản hồi AI |
| Nhấn thẻ khách sạn | Nhấn HotelCard | Chuyển đến trang Hotel Detail |
| Thu nhỏ | Nhấn MinimizeButton | Thu nhỏ thành FloatingButton |

---

## 5. Error Handling

| Error Code | Condition | User Message | Resolution |
|------------|-----------|--------------|------------|
| ERR-AUTH-001 | Email/mật khẩu sai | "Email hoặc mật khẩu không chính xác" | Hướng dẫn nhập lại |
| ERR-AUTH-002 | Đăng nhập bằng tài khoản trạng thái Pending | "Tài khoản đang chờ phê duyệt. Vui lòng liên hệ quản trị viên" | Hướng dẫn quy trình phê duyệt nội bộ |
| ERR-AUTH-003 | Đăng nhập bằng tài khoản đã bị vô hiệu hóa | "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên" | Liên hệ Master |
| ERR-AUTH-004 | Phiên hết hạn (30 phút) | "Phiên đã hết hạn. Vui lòng đăng nhập lại" | Chuyển hướng đến màn hình Login |
| ERR-SEARCH-001 | Không có kết quả tìm kiếm | "Không tìm thấy khách sạn phù hợp. Hãy thử thay đổi điều kiện tìm kiếm" | Hướng dẫn nới lỏng điều kiện lọc |
| ERR-SEARCH-002 | Chưa nhập điều kiện tìm kiếm bắt buộc | "Vui lòng nhập điểm đến và ngày" | Highlight các trường bắt buộc |
| ERR-BOOK-001 | Chưa nhập thông tin khách bắt buộc | "Vui lòng điền đầy đủ tất cả các trường bắt buộc" | Highlight các trường chưa nhập |
| ERR-BOOK-002 | Phòng không còn chỗ | "Phòng đã chọn không còn khả dụng" | Hướng dẫn chọn phòng khác |
| ERR-BOOK-003 | Thử hủy đặt phòng Non-Refundable | "Đây là đặt phòng Non-Refundable. Hủy sẽ bị tính phí 100%. Bạn có chắc chắn muốn hủy không?" | Hiển thị modal cảnh báo → Tiến hành hủy khi xác nhận, quay lại khi hủy bỏ |
| ERR-PAY-001 | Thanh toán thẻ doanh nghiệp thất bại | "Thanh toán thất bại. Vui lòng kiểm tra thông tin thẻ" | Chọn thẻ khác hoặc thử lại |
| ERR-PAY-002 | Số dư Floating Deposit không đủ | "Số dư không đủ. Số dư hiện tại: ${amount}" | Hướng dẫn sử dụng Credit Line hoặc nạp tiền |
| ERR-PAY-003 | Vượt hạn mức Credit Line | "Đã vượt hạn mức tín dụng. Hạn mức: ${limit}" | Hướng dẫn yêu cầu tăng hạn mức |
| ERR-PAY-004 | Cảnh báo Low Deposit | "Số dư bảo lãnh dưới $5,000" | Hướng dẫn nạp tiền (thông báo Critical) |
| ERR-AI-001 | Kết nối Claude API thất bại | "Dịch vụ AI tạm thời không khả dụng" | Chuyển sang chế độ Local Fallback |
| ERR-AI-002 | API phản hồi quá thời gian (5 giây) | "Đã hết thời gian chờ phản hồi. Vui lòng thử lại" | Nút thử lại |
| ERR-REG-001 | Email trùng lặp | "Email này đã được đăng ký" | Đăng nhập hoặc sử dụng email khác |
| ERR-REG-002 | Mật khẩu không đủ mạnh | "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái, số và ký tự đặc biệt" | Nhập lại mật khẩu |
| ERR-PTS-001 | Số dư điểm không đủ | "Điểm không đủ. Số dư hiện tại: ${points}P" | Kiểm tra số dư |
| ERR-PTS-002 | Thử chuyển điểm cho OP ngoài doanh nghiệp | "Chỉ có thể chuyển điểm cho OP trong cùng doanh nghiệp" | Chọn lại đối tượng |
| ERR-PAY-005 | Cả Deposit + Credit Line đều không đủ | "Số dư và hạn mức tín dụng đều không đủ" | Yêu cầu nạp tiền hoặc tăng hạn mức |
| ERR-AUTH-005 | Khóa tài khoản (thất bại 5 lần liên tiếp) | "Tài khoản đã bị khóa. Vui lòng thử lại sau 30 phút hoặc liên hệ quản trị viên" | Chờ 30 phút hoặc Master mở khóa thủ công |
| ERR-AUTH-006 | Đặt lại mật khẩu - Email chưa đăng ký | "Hướng dẫn đặt lại đã được gửi đến email của bạn" | Không tiết lộ tình trạng đăng ký vì lý do bảo mật, cùng thông báo |
| ERR-STORAGE-001 | Lỗi ghi LocalStorage (vượt 5MB) | "Không gian lưu trữ không đủ. Vui lòng dọn dẹp dữ liệu cũ" | Thử tự động dọn dẹp dữ liệu cache cũ |
| ERR-DOC-001 | Gửi email thất bại (Mock) | "Gửi email thất bại. Vui lòng thử lại" | Thử lại |
