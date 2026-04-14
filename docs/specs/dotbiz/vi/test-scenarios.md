<!-- Synced with ko version: 2026-03-28T00:00:00Z -->

## 6. Non-Functional Requirements

### 6.1 Performance
- Thời gian tải trang: < 2 giây
- Thời gian phản hồi tìm kiếm khách sạn: < 1 giây
- Thời gian phản hồi AI assistant: < 5 giây
- Tối ưu hóa DOM rendering: Áp dụng virtual scrolling hoặc lazy loading (dữ liệu lớn)
- Lazy loading hình ảnh: Áp dụng Lazy Loading cho hình ảnh khách sạn

**Điều kiện tiêu chuẩn kiểm tra hiệu suất**:
- Dữ liệu khách sạn: 50 mục trở lên (các thành phố lớn Châu Á)
- Dữ liệu đặt phòng: 200 mục trở lên (LocalStorage ~2MB)
- Tab đồng thời: 2 tab (trong cùng trình duyệt)
- Điểm đo lường: Dựa trên Performance.now() (nhấn nút → hoàn thành rendering màn hình)

### 6.2 Security
- Lưu trữ mật khẩu đã mã hóa (SHA-256 hash hoặc mô phỏng bcrypt)
- Thời gian chờ phiên: Tự động đăng xuất khi không hoạt động 30 phút
- Kiểm soát truy cập dựa trên vai trò (RBAC): Phân tách quyền Master/OP
- Phòng chống XSS: Escape dữ liệu đầu vào của người dùng
- CSRF token: Áp dụng khi gửi form (khi tích hợp Mock API)
- Quản lý Claude API key: TBD (khuyến nghị sử dụng proxy server)

### 6.3 Accessibility
- Phiên bản này chưa xem xét khả năng tiếp cận (Kế hoạch áp dụng WCAG 2.1 AA trong tương lai)

### 6.4 Internationalization
- Triển khai bản dịch đầy đủ 5 ngôn ngữ: English, 한국어, 日本語, 中文, Tiếng Việt
- Tệp dịch được tách biệt theo cấu trúc khóa-giá trị i18n
- Định dạng ngày/số/tiền tệ: Tự động định dạng dựa trên locale
- Bố cục RTL: Không hỗ trợ (không có ngôn ngữ mục tiêu)

### 6.5 Compatibility
- Phiên bản mới nhất của Chrome, Safari, Firefox, Edge
- Hỗ trợ cơ bản cho trình duyệt di động
- Độ phân giải tối thiểu: 1024px (tối ưu cho desktop)
- Hỗ trợ tablet (bố cục responsive)

### 6.6 Availability
- Mục tiêu Uptime: 99.9%
- Thời gian khôi phục sự cố: < 4 giờ

### 6.7 Data Storage
- Dựa trên LocalStorage (dữ liệu JSON)
- Dung lượng lưu trữ tối đa: 5MB (giới hạn trình duyệt)
- Quản lý phiên bản cấu trúc dữ liệu: Hỗ trợ schema migration
- **Khi vượt 5MB**: Tự động dọn dẹp dữ liệu cache cũ (lịch sử tìm kiếm, lịch sử hội thoại AI), ưu tiên giữ dữ liệu quan trọng (đặt phòng, người dùng, cài đặt)
- **Khi lưu trữ thất bại**: Hiển thị lỗi ERR-STORAGE-001, thử lại sau khi dọn dẹp cache
- **Đồng bộ hóa đa tab**: Đồng bộ dữ liệu giữa các tab bằng StorageEvent listener (yêu thích, trạng thái đã đọc thông báo, v.v.)

---

## 7. Test Scenarios

### TS-AUTH: Xác thực và Tài khoản

#### TS-AUTH-001: Đăng nhập thành công
**Given**: Người dùng có email/mật khẩu hợp lệ đang ở màn hình đăng nhập
**When**: Nhập email và mật khẩu rồi nhấn nút đăng nhập
**Then**: Chuyển đến màn hình Dashboard và tên người dùng được hiển thị trên sidebar

#### TS-AUTH-002: Đăng nhập với thông tin đăng nhập sai
**Given**: Đang ở màn hình đăng nhập
**When**: Nhập mật khẩu sai và nhấn nút đăng nhập
**Then**: Thông báo lỗi "Email hoặc mật khẩu không chính xác" được hiển thị

#### TS-AUTH-003: Đăng nhập tài khoản trạng thái Pending
**Given**: Thử đăng nhập bằng tài khoản đang ở trạng thái Pending
**When**: Nhập thông tin đăng nhập hợp lệ và nhấn nút đăng nhập
**Then**: Thông báo "Tài khoản đang chờ phê duyệt" được hiển thị và không chuyển đến Dashboard

#### TS-AUTH-004: Tính năng Remember Me
**Given**: Chọn Remember Me trên màn hình đăng nhập và đăng nhập
**When**: Đăng xuất rồi truy cập lại màn hình đăng nhập
**Then**: Email đã nhập trước đó được tự động điền vào trường email

#### TS-AUTH-005: Phiên hết hạn
**Given**: Không có bất kỳ hoạt động nào trong 30 phút khi đang đăng nhập
**When**: Thử thực hiện bất kỳ thao tác nào trên màn hình
**Then**: Được chuyển hướng đến màn hình đăng nhập và thông báo hết hạn phiên được hiển thị

#### TS-AUTH-006: Đăng ký 3 bước
**Given**: Đang ở Bước 1 của màn hình đăng ký
**When**: Nhập tất cả thông tin bắt buộc và hoàn thành đến Bước 3
**Then**: Tài khoản được tạo ở trạng thái Pending và thông báo hướng dẫn được hiển thị

#### TS-AUTH-007: Kiểm tra trường bắt buộc khi đăng ký
**Given**: Để trống Company Name ở Bước 1 của màn hình đăng ký
**When**: Nhấn nút Next
**Then**: Thông báo lỗi xuất hiện trên trường Company Name và không chuyển đến Bước 2

#### TS-AUTH-008: Master quản lý OP
**Given**: Truy cập My Account bằng tài khoản Master
**When**: Nhấn nút thêm OP và nhập thông tin
**Then**: Tài khoản OP mới được tạo và hiển thị trong danh sách OP

#### TS-AUTH-009: Kiểm soát truy cập quyền Master
**Given**: Đăng nhập bằng tài khoản Master
**When**: Nhấn menu Settlement
**Then**: Trang Settlement được hiển thị bình thường

#### TS-AUTH-010: Kiểm soát truy cập quyền OP
**Given**: Đăng nhập bằng tài khoản OP
**When**: Kiểm tra sidebar
**Then**: Menu Settlement không được hiển thị

---

### TS-SEARCH: Tìm kiếm khách sạn

#### TS-SEARCH-001: Tìm kiếm khách sạn cơ bản
**Given**: Đang ở màn hình Find Hotel
**When**: Nhập điểm đến (Thượng Hải), ngày check-in/out, số phòng và tìm kiếm
**Then**: Danh sách khách sạn phù hợp với điều kiện được hiển thị dưới dạng List View

#### TS-SEARCH-002: Tính năng tự động hoàn thành
**Given**: Nhập "Shang" vào trường nhập điểm đến của Find Hotel
**When**: Danh sách tự động hoàn thành được hiển thị trong khi đang gõ
**Then**: Các thành phố/khách sạn liên quan như "Shanghai" xuất hiện trong dropdown

#### TS-SEARCH-003: Áp dụng bộ lọc
**Given**: Danh sách khách sạn đang được hiển thị trong Search Results
**When**: Chọn bộ lọc 5 sao
**Then**: Chỉ hiển thị các khách sạn 5 sao

#### TS-SEARCH-004: Thay đổi sắp xếp
**Given**: Danh sách khách sạn đang được hiển thị trong Search Results
**When**: Thay đổi sắp xếp thành "Giá tăng dần"
**Then**: Danh sách khách sạn được sắp xếp lại theo thứ tự giá thấp đến cao

#### TS-SEARCH-005: Chuyển sang Map View
**Given**: Search Results đang hiển thị ở List View
**When**: Nhấn nút Map View
**Then**: Bản đồ Leaflet.js được hiển thị và marker giá được hiển thị tại vị trí khách sạn

#### TS-SEARCH-006: Tương tác với marker trên Map View
**Given**: Map View đang được hiển thị
**When**: Nhấn marker khách sạn
**Then**: Popup hiển thị hình ảnh, tên, đánh giá, số phòng còn lại và khách sạn tương ứng được highlight trong sidebar

#### TS-SEARCH-007: Chuyển đổi yêu thích
**Given**: Đang xem thẻ khách sạn trong Search Results
**When**: Nhấn biểu tượng ngôi sao
**Then**: Ngôi sao được tô đầy và được thêm vào phần yêu thích của Find Hotel

#### TS-SEARCH-008: Không có kết quả tìm kiếm
**Given**: Nhập điều kiện rất hạn chế trong Find Hotel
**When**: Nhấn nút tìm kiếm
**Then**: Thông báo "Không tìm thấy khách sạn phù hợp với điều kiện" được hiển thị

---

### TS-HOTEL: Chi tiết khách sạn

#### TS-HOTEL-001: Tải trang chi tiết khách sạn
**Given**: Nhấn thẻ khách sạn trong Search Results
**When**: Trang Hotel Detail được tải
**Then**: Phần Hero, tab Rooms (mặc định kích hoạt) và Breadcrumb được hiển thị bình thường

#### TS-HOTEL-002: Chuyển tab
**Given**: Đang ở tab Rooms của Hotel Detail
**When**: Nhấn tab Policies
**Then**: Nội dung tab Policies (giờ check-in/out, chính sách hủy, v.v.) được hiển thị

#### TS-HOTEL-003: Bộ lọc phòng
**Given**: Nhiều phòng đang được hiển thị trong tab Rooms
**When**: Thay đổi bộ lọc Meal Plan thành "Breakfast"
**Then**: Chỉ hiển thị các phòng có bao gồm bữa sáng

#### TS-HOTEL-004: Chọn phòng
**Given**: Đang xem thẻ phòng trong tab Rooms
**When**: Nhấn nút Select
**Then**: Chuyển đến màn hình Booking Form và thông tin phòng đã chọn được hiển thị trong sidebar

---

### TS-BOOK: Quy trình đặt phòng

#### TS-BOOK-001: Nhập thông tin khách và tiến hành đặt phòng
**Given**: Đang ở Booking Form (Bước 1)
**When**: Nhập đầy đủ tất cả thông tin khách bắt buộc và nhấn Continue
**Then**: Chuyển đến màn hình Booking Confirm (Bước 2)

#### TS-BOOK-002: Kiểm tra khi chưa nhập thông tin bắt buộc
**Given**: Để trống First Name trong Booking Form
**When**: Nhấn nút Continue
**Then**: Thông báo lỗi xuất hiện trên trường First Name và không chuyển sang bước tiếp theo

#### TS-BOOK-003: Xác nhận đặt phòng sau khi đồng ý điều khoản
**Given**: Đang ở Booking Confirm (Bước 2)
**When**: Chọn checkbox Terms & Conditions và nhấn Confirm Booking
**Then**: ELLIS Code được tạo và chuyển đến màn hình Booking Complete (Bước 3)

#### TS-BOOK-004: Nút bị vô hiệu hóa khi chưa đồng ý điều khoản
**Given**: Checkbox điều khoản trong Booking Confirm chưa được chọn
**When**: Kiểm tra nút Confirm Booking
**Then**: Nút ở trạng thái disabled (vô hiệu hóa)

#### TS-BOOK-005: Kiểm tra định dạng ELLIS Code
**Given**: Đặt phòng đã hoàn tất
**When**: Kiểm tra ELLIS Code được tạo
**Then**: Định dạng là K + YYMMDD + HHMMSS + H + NN (ví dụ: K260208111020H01)

#### TS-BOOK-006: Tải xuống voucher
**Given**: Đang ở màn hình Booking Complete
**When**: Nhấn nút tải xuống voucher
**Then**: Tệp PDF được tải xuống và bao gồm ELLIS Code, thông tin khách sạn, mã QR

#### TS-BOOK-007: Quy trình hủy đặt phòng
**Given**: Đang xem đặt phòng trạng thái Confirmed trong modal Booking Detail
**When**: Nhấn nút Cancel, chọn lý do hủy và xác nhận
**Then**: Trạng thái đặt phòng được đổi thành Cancelled và thông báo được tạo

#### TS-BOOK-008: Hủy đặt phòng Non-Refundable
**Given**: Đang ở modal chi tiết đặt phòng Non-Refundable
**When**: Nhấn nút Cancel
**Then**: Thông báo "Đặt phòng này là Non-Refundable. Hủy sẽ tính phí 100%" được hiển thị

#### TS-BOOK-009: Đặt lại (Re-book)
**Given**: Đang ở màn hình hoàn tất đặt phòng đã bị hủy
**When**: Nhấn nút Re-book
**Then**: Chuyển đến trang chi tiết cùng khách sạn và giữ nguyên ngày cũ

---

### TS-BKG: Quản lý đặt phòng

#### TS-BKG-001: Hiển thị danh sách đặt phòng
**Given**: Truy cập trang Bookings
**When**: Trang được tải
**Then**: Danh sách đặt phòng được hiển thị trong bảng 14 cột

#### TS-BKG-002: Áp dụng nhiều bộ lọc
**Given**: Trong bảng điều khiển bộ lọc Bookings, đặt Booking Status thành "Confirmed" và Date Type thành "Check In Date"
**When**: Nhấn nút Search
**Then**: Chỉ hiển thị các đặt phòng phù hợp với điều kiện đó trong bảng

#### TS-BKG-003: Xóa bộ lọc
**Given**: Đang áp dụng nhiều bộ lọc
**When**: Nhấn nút Reset
**Then**: Tất cả bộ lọc được đặt về giá trị ban đầu và toàn bộ đặt phòng được hiển thị

#### TS-BKG-004: Mở modal chi tiết đặt phòng
**Given**: Đang xem hàng đặt phòng trong bảng đặt phòng
**When**: Nhấn vào hàng
**Then**: Modal chi tiết đặt phòng gồm 9 phần được mở

#### TS-BKG-005: Xuất Excel
**Given**: Danh sách đặt phòng đang được hiển thị với bộ lọc đã áp dụng
**When**: Nhấn nút Excel Export
**Then**: Dữ liệu theo điều kiện bộ lọc hiện tại được tải xuống dưới dạng tệp .xlsx

#### TS-BKG-006: Tải xuống voucher hàng loạt
**Given**: Chọn nhiều đặt phòng bằng checkbox
**When**: Nhấn nút Bulk Voucher
**Then**: Voucher của các đặt phòng đã chọn được tải xuống

#### TS-BKG-007: Hiển thị sự kiện trong chế độ xem lịch
**Given**: Đang ở tab Calendar
**When**: Hiển thị tháng có đặt phòng
**Then**: Các sự kiện Check-in (xanh dương), Check-out (vàng), Stay (xanh lá), Cancelled (đỏ), Deadline (hồng) được hiển thị theo màu sắc

#### TS-BKG-008: Hiển thị +N more trong ô lịch
**Given**: Có 4 sự kiện trở lên trong một ngày
**When**: Kiểm tra ô ngày tương ứng
**Then**: 3 sự kiện và văn bản "+1 more" được hiển thị

#### TS-BKG-009: Thay đổi kích thước trang
**Given**: Danh sách đặt phòng đang được hiển thị với 20 mục mặc định
**When**: Thay đổi kích thước trang thành 50
**Then**: Tối đa 50 mục được hiển thị trên một trang

---

### TS-PAY: Hệ thống thanh toán

#### TS-PAY-001: Thanh toán thẻ doanh nghiệp (trả trước)
**Given**: OP doanh nghiệp trả trước đặt phòng Non-Refundable
**When**: Chọn thẻ doanh nghiệp và xác nhận đặt phòng
**Then**: Thanh toán được xử lý ngay (mô phỏng) và đặt phòng chuyển sang trạng thái Confirmed

#### TS-PAY-002: Reserve Now Pay Later
**Given**: OP doanh nghiệp trả trước đặt phòng Refundable
**When**: Chọn tùy chọn RNPL và xác nhận đặt phòng
**Then**: Đặt phòng được xác nhận mà không thanh toán và được hiển thị trong Accounts Receivable

#### TS-PAY-003: Tự động hủy khi vượt quá Cancel Deadline của RNPL
**Given**: Đặt phòng RNPL của doanh nghiệp trả trước đã vượt Cancel Deadline và chưa thanh toán
**When**: Hệ thống kiểm tra Deadline
**Then**: Sau khi gửi cảnh báo thông báo, đặt phòng bị tự động hủy

#### TS-PAY-004: Thanh toán Floating Deposit (trả sau)
**Given**: OP doanh nghiệp trả sau đặt phòng và chọn tùy chọn Deposit
**When**: Xác nhận đặt phòng
**Then**: Số tiền đặt phòng được trừ từ số dư Deposit

#### TS-PAY-005: Số dư Deposit không đủ
**Given**: Số dư Deposit của doanh nghiệp trả sau thấp hơn số tiền đặt phòng
**When**: Thử thanh toán bằng Deposit
**Then**: Thông báo "Số dư không đủ" được hiển thị kèm hướng dẫn sử dụng Credit Line

#### TS-PAY-006: Vượt hạn mức Credit Line
**Given**: Hạn mức Credit Line của doanh nghiệp trả sau đã vượt quá
**When**: Thử đặt phòng
**Then**: Thông báo "Đã vượt hạn mức tín dụng" được hiển thị và đặt phòng không được tiến hành

#### TS-PAY-007: Cảnh báo Low Deposit
**Given**: Số dư Deposit của doanh nghiệp trả sau dưới $5,000
**When**: Hệ thống kiểm tra số dư
**Then**: Thông báo ưu tiên Critical được tạo

---

### TS-SET: Hệ thống thanh toán

#### TS-SET-001: Xem Monthly Settlement
**Given**: Truy cập Settlement > tab Monthly bằng tài khoản Master
**When**: Chọn tháng 2 năm 2026
**Then**: Total Net Cost, Room Nights, Avg Net/Night và chi tiết theo ngày của tháng đó được hiển thị

#### TS-SET-002: Tải xuống hóa đơn PDF
**Given**: Xem hóa đơn trạng thái Issued trong tab Invoices
**When**: Nhấn nút tải xuống PDF
**Then**: PDF bao gồm giá trị cung cấp, VAT (10%), tổng cộng được tải xuống

#### TS-SET-003: Thanh toán riêng lẻ khoản phải thu
**Given**: Có khoản chưa thanh toán trong tab AR
**When**: Nhấn nút thanh toán của khoản đó và hoàn tất thanh toán
**Then**: Payment Status được đổi thành Fully Paid

#### TS-SET-004: Thanh toán hàng loạt khoản phải thu
**Given**: Chọn nhiều khoản chưa thanh toán bằng checkbox trong tab AR
**When**: Nhấn nút thanh toán hàng loạt
**Then**: Thanh toán của tất cả các khoản đã chọn được xử lý

---

### TS-AI: AI Booking Assistant

#### TS-AI-001: Đề xuất khách sạn bằng ngôn ngữ tự nhiên
**Given**: Đang mở AI widget
**When**: Nhập tin nhắn "5 sao khu vực Phố Đông dưới $250 bao gồm ăn sáng"
**Then**: Các thẻ khách sạn phù hợp với điều kiện được hiển thị trong phản hồi và nhấn thẻ sẽ chuyển đến Hotel Detail

#### TS-AI-002: Yêu cầu phân tích đặt phòng
**Given**: Đang mở AI widget
**When**: Nhập tin nhắn "Phân tích tình trạng đặt phòng của tôi"
**Then**: Kết quả phân tích gồm tổng số đặt phòng, chi tiêu, tần suất theo khách sạn, v.v. được hiển thị

#### TS-AI-003: Sử dụng Quick Action
**Given**: Đang xem Quick Actions của AI widget
**When**: Nhấn nút "🏨 Đề xuất khách sạn"
**Then**: Prompt tương ứng được tự động nhập và phản hồi AI được hiển thị

#### TS-AI-004: Fallback khi kết nối API thất bại
**Given**: Kết nối Claude API thất bại
**When**: Yêu cầu đề xuất khách sạn
**Then**: Phản hồi thay thế dựa trên dữ liệu khách sạn cục bộ được hiển thị kèm thông báo "Dịch vụ hạn chế"

#### TS-AI-005: Thu nhỏ/Khôi phục widget
**Given**: AI widget đang mở
**When**: Nhấn nút thu nhỏ
**Then**: Widget được thu nhỏ thành nút nổi và khi nhấn lại sẽ khôi phục với cuộc hội thoại trước đó được giữ nguyên

---

### TS-NOTI: Trung tâm thông báo

#### TS-NOTI-001: Hiển thị danh sách thông báo
**Given**: Truy cập trung tâm thông báo
**When**: Trang được tải
**Then**: Thẻ tóm tắt và danh sách thông báo được hiển thị theo thứ tự ưu tiên

#### TS-NOTI-002: Nhấn thông báo để điều hướng
**Given**: Có thông báo Check-in
**When**: Nhấn thông báo đó
**Then**: Modal chi tiết đặt phòng tương ứng được mở và thông báo được đánh dấu đã đọc

#### TS-NOTI-003: Đánh dấu tất cả đã đọc
**Given**: Có nhiều thông báo chưa đọc
**When**: Nhấn nút đánh dấu tất cả đã đọc
**Then**: Tất cả thông báo được đổi sang trạng thái đã đọc

#### TS-NOTI-004: Thay đổi cài đặt thông báo
**Given**: Promotional Offers đang ở trạng thái OFF trong cài đặt thông báo
**When**: Chuyển toggle sang ON
**Then**: Cài đặt được phản ánh ngay lập tức và nhận được thông báo khuyến mãi

---

### TS-DASH: Dashboard

#### TS-DASH-001: Bộ lọc thời gian thẻ KPI
**Given**: Truy cập Dashboard
**When**: Thay đổi bộ lọc thời gian thành "Last Month"
**Then**: Tất cả thẻ KPI và widget được cập nhật với dữ liệu của kỳ đó

#### TS-DASH-002: Hiển thị OP Performance của Master
**Given**: Truy cập Dashboard bằng tài khoản Master
**When**: Kiểm tra trang
**Then**: Widget OP Performance Comparison được hiển thị kèm xếp hạng 🥇🥈🥉

#### TS-DASH-003: Hiển thị My Performance của OP
**Given**: Truy cập Dashboard bằng tài khoản OP
**When**: Kiểm tra trang
**Then**: Thanh gauge KPI của My Performance được hiển thị và OP Performance không được hiển thị

---

### TS-PTS: OP Points

#### TS-PTS-001: Xác nhận tích lũy điểm
**Given**: Đặt phòng đã hoàn tất
**When**: Kiểm tra số dư điểm trên trang Rewards Mall
**Then**: Điểm đã được tích lũy dựa trên số tiền đặt phòng

#### TS-PTS-002: Đổi sản phẩm
**Given**: Xem sản phẩm trong Rewards Mall
**When**: Nhấn nút Redeem của sản phẩm có đủ số dư
**Then**: Modal xác nhận đổi được hiển thị và số dư bị trừ khi xác nhận

#### TS-PTS-003: Thử đổi khi số dư điểm không đủ
**Given**: Chọn sản phẩm đắt hơn số dư
**When**: Nhấn nút Redeem
**Then**: Thông báo "Điểm không đủ" được hiển thị

#### TS-PTS-004: Chuyển điểm
**Given**: Trong phần chuyển điểm của Rewards Mall
**When**: Chọn OP trong cùng doanh nghiệp, nhập số tiền và lý do rồi chuyển
**Then**: Điểm được chuyển đến OP đích và được ghi lại trong lịch sử

---

### TS-UI: UI/UX

#### TS-UI-001: Chuyển chế độ tối
**Given**: Đang ở chế độ sáng
**When**: Nhấn toggle chế độ tối (🌙) trên header
**Then**: Toàn bộ UI chuyển sang theme tối và được lưu vào localStorage

#### TS-UI-002: Thay đổi ngôn ngữ
**Given**: Đang hiển thị bằng tiếng Anh
**When**: Thay đổi lựa chọn ngôn ngữ trên header thành "한국어"
**Then**: Toàn bộ văn bản UI được đổi sang tiếng Hàn

#### TS-UI-003: Thay đổi tiền tệ
**Given**: Giá đang được hiển thị bằng USD
**When**: Thay đổi lựa chọn tiền tệ trên header thành "KRW"
**Then**: Tất cả giá được hiển thị đã chuyển đổi sang KRW

#### TS-UI-004: Bố cục responsive
**Given**: Đang hiển thị trên trình duyệt desktop (1920px)
**When**: Thu hẹp độ rộng trình duyệt xuống 1024px
**Then**: Bố cục được điều chỉnh responsive và nội dung được hiển thị bình thường

#### TS-UI-005: Áp dụng màu CI
**Given**: Ứng dụng đã được tải
**When**: Kiểm tra các nút chính và header
**Then**: Màu Primary là #FF6000 (Orange) và màu thành công là #009505 (Green) được áp dụng

---

### TS-CHAT: Support Chat

#### TS-CHAT-001: Tự động phát hiện ELLIS Code
**Given**: Đang nhập tin nhắn trong Support Chat
**When**: Dán ELLIS Code (K260208111020H01)
**Then**: Thông báo "Booking detected" xuất hiện và thông tin đặt phòng tương ứng được tự động tải

#### TS-CHAT-002: Chatbot AI tự động trả lời
**Given**: Bắt đầu cuộc trò chuyện mới
**When**: Nhập tin nhắn "Làm thế nào để hủy đặt phòng?"
**Then**: Phản hồi tự động dựa trên FAQ được hiển thị ngay lập tức

#### TS-CHAT-003: Chuyển đến nhân viên tư vấn
**Given**: Đã đặt câu hỏi mà AI chatbot không thể trả lời
**When**: Nhấn nút "Connect to Agent"
**Then**: Trạng thái chuyển sang kết nối với nhân viên tư vấn và thông tin nhân viên được hiển thị

---

### TS-FAQ: FAQ Board

#### TS-FAQ-001: Tìm kiếm FAQ
**Given**: Truy cập FAQ Board
**When**: Nhập "cancel" vào trường tìm kiếm
**Then**: Chỉ hiển thị các mục FAQ liên quan đến hủy

#### TS-FAQ-002: Bộ lọc danh mục
**Given**: Tất cả mục đang được hiển thị trong FAQ Board
**When**: Nhấn tab danh mục "Payment"
**Then**: Chỉ hiển thị FAQ liên quan đến Payment

#### TS-FAQ-003: Chuyển đổi accordion
**Given**: Mục FAQ đang ở trạng thái đóng
**When**: Nhấn tiêu đề câu hỏi
**Then**: Câu trả lời được mở ra dạng accordion. Nhấn lại thì đóng lại

---

### TS-EDGE: Kiểm tra trường hợp ngoại lệ và giá trị biên (Bổ sung từ Review Round 1)

#### TS-EDGE-001: Chặn tìm kiếm với ngày check-in trong quá khứ
**Given**: Đang ở màn hình Find Hotel
**When**: Đặt ngày check-in là ngày hôm qua và nhấn nút tìm kiếm
**Then**: Thông báo lỗi ERR-SEARCH-003 được hiển thị và tìm kiếm không được thực hiện

#### TS-EDGE-002: Kiểm tra trạng thái đặt phòng sau khi thanh toán thất bại
**Given**: OP doanh nghiệp trả trước đang ở bước xác nhận đặt phòng Non-Refundable
**When**: Thanh toán thẻ doanh nghiệp thất bại với ERR-PAY-001
**Then**: Đặt phòng không được tạo và quay lại Booking Form. Có thể chọn thẻ khác hoặc thử lại

#### TS-EDGE-003: UI chuyển đổi sang Credit Line khi Deposit không đủ
**Given**: Doanh nghiệp trả sau có số dư Deposit $3,000, số tiền đặt phòng $5,000
**When**: Chọn tùy chọn Deposit và thử xác nhận đặt phòng
**Then**: UI xác nhận "Số dư Deposit không đủ. Bạn có muốn sử dụng Credit Line không?" được hiển thị

#### TS-EDGE-004: Cả Deposit + Credit Line đều không đủ
**Given**: Doanh nghiệp trả sau có Deposit $1,000, hạn mức Credit Line còn lại $2,000, số tiền đặt phòng $5,000
**When**: Thử đặt phòng
**Then**: Thông báo ERR-PAY-005 "Số dư và hạn mức tín dụng đều không đủ" được hiển thị

#### TS-EDGE-005: Giá trị biên Free Cancel phí hủy
**Given**: Có đặt phòng với Free Cancel Deadline là 3 ngày trước ngày check-in
**When**: Thử hủy đúng vào 00:00:00 trước 3 ngày check-in
**Then**: Phí hủy $0 được hiển thị (bao gồm giá trị biên)

#### TS-EDGE-006: Master xem đặt phòng của OP đã bị vô hiệu hóa
**Given**: Có tài khoản OP với 3 đặt phòng Confirmed
**When**: Master vô hiệu hóa OP đó
**Then**: Đăng nhập bằng OP đã vô hiệu hóa bị chặn với ERR-AUTH-003 và 3 đặt phòng tiếp tục được xem trong danh sách đặt phòng của Master

#### TS-EDGE-007: Khóa tài khoản (thất bại 5 lần đăng nhập liên tiếp)
**Given**: Nhập mật khẩu sai liên tiếp cho tài khoản hợp lệ
**When**: Đăng nhập thất bại 5 lần liên tiếp
**Then**: Thông báo ERR-AUTH-005 được hiển thị và không thể thử đăng nhập trong 30 phút

#### TS-EDGE-008: Đạt giới hạn 5MB của LocalStorage
**Given**: LocalStorage đã được lấp đầy hơn 4.9MB và thử đặt phòng mới
**When**: Nhấn xác nhận đặt phòng
**Then**: Thông báo ERR-STORAGE-001 được hiển thị và hướng dẫn thử lại sau khi tự động dọn dẹp cache

#### TS-EDGE-009: Xử lý dữ liệu form đặt phòng khi phiên hết hạn
**Given**: OP đang nhập thông tin khách trong Booking Form và 30 phút đã trôi qua
**When**: Nhấn nút Continue
**Then**: Hiển thị thông báo hết hạn phiên → Chuyển đến Login → Sau khi đăng nhập lại, thử khôi phục dữ liệu form từ sessionStorage
