<!-- Synced with ko version: 2026-03-28T00:00:00Z -->

# DOTBIZ B2B Hệ Thống Đặt Phòng Khách Sạn — Functional Specification

> **Status**: FINALIZED
> **Author**: Planning Plugin (Auto-generated)
> **Created**: 2026-03-28T09:00:00Z
> **Last Updated**: 2026-03-28T12:00:00Z

---

## 1. Overview

### 1.1 Purpose
DOTBIZ là nền tảng đặt phòng khách sạn B2B thế hệ tiếp theo dựa trên AI, cung cấp trải nghiệm đặt phòng trực quan và hiệu quả cho các Operating Partner (OP). Thông qua mô hình cung cấp Net Rate, nền tảng đảm bảo tính tự chủ về biên lợi nhuận cho các đối tác, đồng thời tối đa hóa hiệu quả vận hành bằng quy trình thanh toán được tối ưu hóa theo từng loại doanh nghiệp (trả trước/trả sau) và các công cụ vận hành thời gian thực.

Đặc tả này nhằm mục đích tái triển khai các chức năng giống với nguyên mẫu hiện có dành cho môi trường phát triển thực tế, được triển khai theo cấu trúc Frontend (Vanilla JS SPA) + Mock API. Việc lưu trữ dữ liệu duy trì theo phương thức LocalStorage + JSON.

### 1.2 Target Users

| Vai trò | Mô tả | Chức năng chính |
|---------|-------|----------------|
| Master | Quản trị viên doanh nghiệp | Quản lý toàn bộ OP, quyền thanh toán, so sánh hiệu suất OP, xem tất cả đặt phòng |
| OP (Operating Partner) | Nhân viên nghiệp vụ | Tìm kiếm/đặt phòng khách sạn, chăm sóc khách hàng, xem kết quả cá nhân, chỉ xem đặt phòng của bản thân |

**Không cần vai trò Admin**: Việc phê duyệt đăng ký doanh nghiệp được xử lý thủ công bên ngoài hệ thống (quy trình nội bộ).

### 1.3 Success Metrics

| KPI | Mục tiêu | Phương pháp đo lường |
|-----|----------|---------------------|
| Thời gian tải trang | < 2 giây | Performance API |
| Thời gian phản hồi tìm kiếm khách sạn | < 1 giây | Thực thi tìm kiếm ~ hiển thị kết quả |
| Thời gian phản hồi AI | < 5 giây | Gọi Claude API ~ hiển thị phản hồi |
| Tỷ lệ chuyển đổi đặt phòng | Có thể đo lường | Booking Conversion Funnel |
| Tính khả dụng hệ thống | 99.9% | Giám sát Uptime |

---

## 2. User Stories

| ID | Role | Goal | Priority |
|----|------|------|----------|
| US-001 | OP | Đăng nhập bằng email/mật khẩu để truy cập hệ thống | P0 |
| US-002 | Doanh nghiệp mới | Tạo tài khoản thông qua quy trình đăng ký 3 bước | P0 |
| US-003 | OP | Tìm kiếm khách sạn theo điều kiện điểm đến, ngày, số người | P0 |
| US-004 | OP | Xem kết quả tìm kiếm theo dạng danh sách/bản đồ và lọc/sắp xếp | P0 |
| US-005 | OP | Xem thông tin chi tiết khách sạn và chọn phòng | P0 |
| US-006 | OP | Nhập thông tin khách và xác nhận đặt phòng | P0 |
| US-007 | OP | Tải xuống/gửi email voucher sau khi đặt phòng hoàn tất | P0 |
| US-008 | OP | Xem/lọc/quản lý toàn bộ đặt phòng trong danh sách đặt phòng | P0 |
| US-009 | OP | Hủy đặt phòng và xem thông tin hoàn tiền | P0 |
| US-010 | OP | Trực quan hóa tình trạng đặt phòng theo tháng bằng chế độ xem lịch | P1 |
| US-011 | Master | Xem chi tiết thanh toán hàng tháng và quản lý hóa đơn | P0 |
| US-012 | Master | Quản lý khoản phải thu (Accounts Receivable) và xử lý thanh toán | P0 |
| US-013 | OP | Tìm kiếm khách sạn bằng ngôn ngữ tự nhiên và phân tích đặt phòng qua AI assistant | P1 |
| US-014 | OP | Xem và xử lý thông báo quan trọng tại trung tâm thông báo | P1 |
| US-015 | OP/Master | Xem KPI và phân tích kinh doanh trên dashboard | P1 |
| US-016 | OP | Đổi phần thưởng bằng OP Points | P2 |
| US-017 | OP | Xử lý các yêu cầu liên quan đến đặt phòng qua Support Chat | P2 |
| US-018 | OP | Xem các câu hỏi thường gặp trên FAQ Board | P2 |
| US-019 | Master | Tạo/chỉnh sửa/vô hiệu hóa tài khoản OP và thiết lập tỷ lệ Share | P0 |
| US-020 | OP | Lưu các khách sạn thường đặt vào mục yêu thích | P1 |
| US-021 | OP | Thiết lập chế độ tối/ngôn ngữ/tiền tệ | P1 |
| US-022 | OP | Đặt lại (Re-book) các đặt phòng đã hủy | P1 |
| US-023 | Master | So sánh và phân tích kết quả theo từng OP | P1 |
| US-024 | OP | Chuyển điểm cho OP khác trong cùng doanh nghiệp | P2 |

---

## 3. Functional Requirements

### FR-AUTH: Xác thực và Tài khoản

#### FR-AUTH-001: Đăng nhập
**Description**: Hệ thống đăng nhập dựa trên email/mật khẩu

**Business Rules**:
- BR-001: Đăng nhập thành công sẽ chuyển đến màn hình Dashboard
- BR-002: Khi chọn Remember Me, lưu email vào localStorage
- BR-003: Kiểm soát truy cập dựa trên vai trò (Master có thể truy cập Settlement, OP không thể)
- BR-004: Thời gian chờ phiên là 30 phút

**Input Validation**:
- Email: Tối đa 254 ký tự (RFC 5321), kiểm tra định dạng email
- Mật khẩu: Tối đa 128 ký tự
- Đăng nhập thất bại 5 lần liên tiếp sẽ khóa tài khoản (tự động mở khóa sau 30 phút hoặc Master mở khóa thủ công)
- Thời gian chờ phiên: 30 phút không hoạt động (di chuyển chuột, nhập bàn phím, gọi API được coi là hoạt động)
- Hiển thị popup cảnh báo 5 phút trước khi hết thời gian chờ: bao gồm nút "Gia hạn phiên", khi nhấn sẽ reset thời gian chờ 30 phút. Nếu bỏ qua popup, phiên sẽ hết hạn sau 5 phút. Nếu phát hiện hoạt động của người dùng (bàn phím/chuột) trong khi popup đang hiển thị, popup tự động đóng + reset bộ đếm thời gian
- Khi phiên hết hạn, dữ liệu form đang nhập được lưu tạm thời vào sessionStorage và thử khôi phục sau khi đăng nhập lại

**Acceptance Criteria**:
- [ ] AC-001: Đăng nhập thành công với email/mật khẩu hợp lệ
- [ ] AC-002: Hiển thị thông báo lỗi khi thông tin đăng nhập sai
- [ ] AC-003: Email được tự động điền khi truy cập lại sau khi đã chọn Remember Me
- [ ] AC-004: Nút chuyển chế độ tối được hiển thị trên màn hình đăng nhập
- [ ] AC-004a: Hiển thị thông báo khóa tài khoản khi đăng nhập thất bại 5 lần liên tiếp

#### FR-AUTH-005: Quên/Đặt lại mật khẩu
**Description**: Đặt lại mật khẩu qua email khi quên mật khẩu

**Business Rules**:
- BR-100: Cung cấp liên kết "Forgot Password?" trên màn hình Login
- BR-101: Nhập email đã đăng ký → gửi liên kết đặt lại (Mock: mô phỏng — chuyển thẳng đến màn hình đặt lại)
- BR-102: Nhập mật khẩu mới (tối thiểu 8 ký tự, bao gồm chữ cái+số+ký tự đặc biệt)
- BR-103: Bắt buộc có trường xác nhận mật khẩu
- BR-104: Sau khi đặt lại thành công, chuyển về màn hình Login

**Acceptance Criteria**:
- [ ] AC-050: Hiển thị màn hình đặt lại khi yêu cầu với email đã đăng ký
- [ ] AC-051: Thông báo lỗi khi yêu cầu với email chưa đăng ký (khuyến nghị dùng cùng thông báo vì lý do bảo mật)
- [ ] AC-052: Có thể đăng nhập sau khi thiết lập mật khẩu mới

---

#### FR-AUTH-002: Tự đăng ký (Self-Registration)
**Description**: Quy trình đăng ký 3 bước

**Business Rules**:
- BR-005: Bước 1 — Thông tin công ty (Company Name, Business Registration No., Business Type (trả trước/trả sau), Address, Phone, Email)
- BR-006: Bước 2 — Thông tin người dùng (Full Name, Position, Email, Password, Mobile, Preferred Language)
- BR-007: Bước 3 — Checkbox điều khoản B2B, tự động tạo và tải xuống hợp đồng
- BR-008: Khi hoàn tất, tài khoản được tạo ở trạng thái Pending (cần phê duyệt thủ công nội bộ)
- BR-105: Sau khi đăng ký hoàn tất, hiển thị màn hình thông báo "Đang chờ phê duyệt" → tự động chuyển đến màn hình Login sau 5 giây (hoặc nút "Chuyển đến đăng nhập")
- BR-106: Mô phỏng gửi email khi phê duyệt xong (Mock: có thể chuyển sang trạng thái Active ngay lập tức)

**Input Validation**:
- Company Name: Bắt buộc, tối đa 100 ký tự
- Business Registration No.: Bắt buộc, định dạng tự do (khác nhau theo quốc gia), tối đa 20 ký tự
- Email: Bắt buộc, định dạng email, kiểm tra trùng lặp (kiểm tra khi nhấn Next ở Bước 2)
- Password: Bắt buộc, 8~128 ký tự, bao gồm chữ cái+số+ký tự đặc biệt, phải khớp với trường PasswordConfirm
- Phone/Mobile: Số+gạch ngang, tối đa 20 ký tự

**Acceptance Criteria**:
- [ ] AC-005: Kiểm tra các trường bắt buộc ở mỗi bước (dựa trên các quy tắc trên)
- [ ] AC-006: Có thể tải xuống hợp đồng PDF khi đồng ý điều khoản ở Bước 3
- [ ] AC-007: Hiển thị thông báo trạng thái Pending sau khi hoàn tất, chuyển đến Login sau 5 giây
- [ ] AC-007a: Hiển thị lỗi ERR-REG-001 khi email bị trùng lặp
- [ ] AC-007b: Hiển thị lỗi khi mật khẩu/xác nhận mật khẩu không khớp

#### FR-AUTH-003: Quản lý tài khoản (My Account)
**Description**: Quản lý thông tin người dùng/doanh nghiệp

**Business Rules**:
- BR-009: Chỉnh sửa thông tin cá nhân (tên, liên hệ, mật khẩu)
- BR-010: Xem thông tin doanh nghiệp (Business Type, ngày hợp đồng)
- BR-011: Doanh nghiệp trả trước — danh sách thẻ doanh nghiệp đã đăng ký, thiết lập thẻ mặc định
- BR-012: Doanh nghiệp trả sau — số dư Floating Deposit, hạn mức Credit Line

**Acceptance Criteria**:
- [ ] AC-008: Thay đổi được phản ánh ngay lập tức
- [ ] AC-009: Phần thông tin thanh toán hiển thị khác nhau tùy theo loại doanh nghiệp

#### FR-AUTH-004: Hệ thống Multi-OP
**Description**: Quản lý nhiều tài khoản OP trong một doanh nghiệp (chỉ dành cho Master)

**Business Rules**:
- BR-013: Master tạo/chỉnh sửa/vô hiệu hóa tài khoản OP
- BR-014: Đăng nhập độc lập theo từng OP (email/mật khẩu)
- BR-015: Thiết lập tỷ lệ Share theo từng OP (để phân phối điểm)
- BR-016: Xem kết quả đặt phòng theo từng OP
- BR-017: Không giới hạn số lượng OP trên mỗi doanh nghiệp
- BR-107: Khi vô hiệu hóa OP: Lưu giữ dữ liệu đặt phòng hiện có (Master có thể xem), không thể tạo đặt phòng mới, thông báo đặt phòng hiện có được chuyển đến Master
- BR-108: Khi thay đổi tỷ lệ Share: Áp dụng tỷ lệ mới từ điểm tích lũy sau khi thay đổi (không áp dụng hồi tố cho lịch sử cũ)

**Acceptance Criteria**:
- [ ] AC-010: Mỗi OP chỉ xem được đặt phòng của mình (Master xem tất cả)
- [ ] AC-011: Khi Master thay đổi tỷ lệ Share của OP, áp dụng ngay lập tức (từ điểm tích lũy mới)
- [ ] AC-011a: Đặt phòng của OP đã bị vô hiệu hóa vẫn tiếp tục hiển thị trong danh sách của Master
- [ ] AC-011b: Hiển thị ERR-AUTH-003 khi đăng nhập bằng OP đã bị vô hiệu hóa

---

### Sơ đồ chuyển đổi trạng thái đặt phòng (Booking Status)

```
[Pending] --thanh toán xong (trả trước)/xác nhận (trả sau)--> [Confirmed]
[Pending] --yêu cầu hủy--> [Cancelled]
[Confirmed] --yêu cầu hủy--> [Cancelled]
[Confirmed] --qua ngày check-out--> [Completed]
[Confirmed] --qua ngày check-in+không nhận phòng--> [No-show]
[Cancelled] --đặt lại (Re-book)--> Tạo đặt phòng mới [Pending] (giữ nguyên Cancelled gốc)
```

**Quy tắc chuyển đổi trạng thái**:
- Pending → Confirmed: Khi thanh toán xong (trả trước), khi xác nhận Deposit/Credit (trả sau)
- Pending → Cancelled: Người dùng hủy hoặc tự động hủy khi vượt quá RNPL Deadline (trả trước)
- Confirmed → Cancelled: Người dùng hủy (áp dụng chính sách phí hủy)
- Confirmed → Completed: Tự động chuyển đổi sau 1 ngày kể từ ngày check-out (hệ thống)
- Confirmed → No-show: Sau 1 ngày kể từ ngày check-in, không nhận phòng thì chuyển thủ công (Master hoặc hệ thống)
- **Chuyển đổi không thể đảo ngược**: Không thể chuyển từ Cancelled, Completed, No-show sang trạng thái khác
- **Re-book**: Tạo đặt phòng mới độc lập từ đặt phòng Cancelled (giữ nguyên trạng thái gốc)

### Chuyển đổi trạng thái thanh toán (Payment Status)

Định nghĩa 6 trạng thái thanh toán:
1. **Not Paid**: Chưa thanh toán (trạng thái ban đầu của đặt phòng RNPL)
2. **Partially Paid**: Thanh toán một phần (đang tiến hành thanh toán phân kỳ)
3. **Fully Paid**: Thanh toán đầy đủ
4. **Refunded**: Hoàn tiền toàn bộ (khi hủy và hoàn tiền đầy đủ)
5. **Partially Refunded**: Hoàn tiền một phần (hoàn tiền sau khi trừ phí hủy)
6. **Pending**: Đang xử lý thanh toán (đang chờ phản hồi PG)

```
[Not Paid] --thanh toán toàn bộ--> [Fully Paid]
[Not Paid] --thanh toán một phần--> [Partially Paid]
[Partially Paid] --thanh toán phần còn lại--> [Fully Paid]
[Fully Paid] --hoàn tiền toàn bộ--> [Refunded]
[Fully Paid] --hoàn tiền một phần (trừ phí)--> [Partially Refunded]
[Pending] --thanh toán thành công--> [Fully Paid]
[Pending] --thanh toán thất bại--> [Not Paid]
```

### Cấu trúc dữ liệu phí hủy

Dữ liệu chính sách hủy của từng khách sạn/phòng:
```json
{
  "cancellationPolicy": {
    "type": "free_cancel" | "partial_refund" | "non_refundable",
    "freeCancelBeforeDays": 3,
    "penalties": [
      { "daysBeforeCheckIn": 3, "feeType": "percent", "feeValue": 0 },
      { "daysBeforeCheckIn": 1, "feeType": "percent", "feeValue": 50 },
      { "daysBeforeCheckIn": 0, "feeType": "percent", "feeValue": 100 }
    ]
  }
}
```
- **Free Cancel**: Phí 0% khi hủy trước freeCancelBeforeDays
- **Partial Refund**: Áp dụng tỷ lệ phí theo từng khoảng thời gian (mảng penalties ở trên)
- **Non-Refundable**: Phí 100% (toàn bộ) khi hủy. Khi nhấn nút Cancel, hiển thị modal cảnh báo "100% phí sẽ được tính. Bạn có chắc chắn muốn hủy không?" và tiến hành hủy khi người dùng xác nhận
- Giá trị biên: Căn cứ 00:00:00 của ngày freeCancelBeforeDays (nửa đêm N ngày trước ngày check-in)
- Khi thanh toán thất bại: Đặt phòng không được tạo và quay lại Booking Form (có thể chọn thẻ khác/thử lại)

### Xử lý tỷ giá hối đoái

- **Nguồn tỷ giá**: Tệp JSON tỷ giá cố định (exchangeRates.json), tiền tệ cơ sở USD
- **Áp dụng tỷ giá**: Chỉ dùng cho hiển thị, thanh toán/quyết toán được lưu theo tiền tệ gốc (USD)
- **Số thập phân theo tiền tệ**: KRW/JPY/VND → 0 chữ số, USD/EUR/GBP/SGD/HKD/THB → 2 chữ số, CNY → 2 chữ số
- **Cập nhật tỷ giá**: Không cần cập nhật vì là giá trị cố định (thêm chính sách cache khi tích hợp API sau này)
- **Khi xác nhận đặt phòng**: Lưu theo số tiền tiền tệ gốc (USD), cũng ghi rõ cả USD và tiền tệ đã chọn trên voucher/hóa đơn

### Quy tắc đặt nhiều phòng

- Khi đặt từ 2 phòng trở lên: Chỉ nhập 1 khách đại diện (Primary Traveler) (đơn giản hóa)
- Cột "1st Traveler" trong danh sách đặt phòng: Hiển thị tên Primary Traveler
- Áp dụng cùng thông tin khách cho mỗi phòng
- Mở rộng trong tương lai: Chức năng nhập thông tin khách riêng biệt theo từng phòng

---

### FR-SEARCH: Tìm kiếm khách sạn

#### FR-SEARCH-001: Find Hotel chính
**Description**: Điểm vào tìm kiếm khách sạn

**Business Rules**:
- BR-018: Tự động hoàn thành điểm đến — Các thành phố lớn ở Châu Á (Thượng Hải, Tokyo, Bangkok, Singapore, v.v.), địa danh, tên khách sạn
- BR-019: Chọn ngày Check-in / Check-out, tự động tính số đêm
- BR-020: Bộ chọn Rooms / Adults / Children, nhập độ tuổi trẻ em riêng lẻ
- BR-021: Chọn quốc tịch (Nationality)
- BR-022: Hiển thị phần khách sạn yêu thích

**Input Validation**:
- Ngày check-in: Chỉ từ hôm nay trở đi
- Ngày check-out: Chỉ sau ngày check-in
- Tối thiểu 1 đêm, tối đa 30 đêm
- Số phòng: 1~10 phòng
- Người lớn: 1~10 người (tối thiểu 1 người/phòng)
- Trẻ em: 0~10 người, độ tuổi 0~17
- Không được check-in = check-out (0 đêm)

**Acceptance Criteria**:
- [ ] AC-012: Nhấn nút tìm kiếm sẽ chuyển đến trang kết quả
- [ ] AC-013: Tự động hoàn thành hiển thị theo thời gian thực khi đang nhập
- [ ] AC-013a: Hiển thị lỗi khi chọn ngày check-in trong quá khứ
- [ ] AC-013b: Hiển thị lỗi khi check-out < check-in

#### FR-SEARCH-002: Kết quả tìm kiếm - List View
**Description**: Hiển thị danh sách khách sạn

**Business Rules**:
- BR-023: Thẻ khách sạn — hình ảnh, tên, khu vực, số sao, đánh giá, số nhận xét, giá (tiền tệ đã chọn)
- BR-024: Huy hiệu FEATURED / FREE CANCEL
- BR-025: Tag tiện nghi (WiFi, Pool, Spa, Gym)
- BR-026: Chuyển đổi ngôi sao yêu thích
- BR-027: Thanh lọc bên — số sao, khoảng giá, khu vực, tiện nghi
- BR-028: Sắp xếp — theo đề xuất, theo giá (↑↓), theo đánh giá
- BR-028a: Hiển thị kết quả tìm kiếm — Tải toàn bộ dữ liệu JSON rồi lọc/sắp xếp/phân trang ở frontend (20 mục/trang, cuộn vô hạn hoặc phân trang)

**Acceptance Criteria**:
- [ ] AC-014: Phản ánh ngay khi thay đổi bộ lọc/sắp xếp
- [ ] AC-015: Nhấn thẻ khách sạn sẽ chuyển đến trang chi tiết

#### FR-SEARCH-003: Kết quả tìm kiếm - Map View
**Description**: Tìm kiếm bản đồ dựa trên Leaflet.js + OpenStreetMap

**Business Rules**:
- BR-029: Marker giá (theo tiền tệ đã chọn)
- BR-030: Nhấn marker hiện popup (hình ảnh, tên, đánh giá, số phòng còn lại)
- BR-031: Marker giảm giá (chấm đỏ)
- BR-032: Liên kết với danh sách khách sạn bên, highlight hai chiều marker ↔ danh sách

**Acceptance Criteria**:
- [ ] AC-016: Chuyển đổi List ↔ Map bằng nút "Xem khách sạn trên bản đồ"

#### FR-SEARCH-004: Khách sạn yêu thích
**Description**: Lưu các khách sạn thường đặt

**Business Rules**:
- BR-033: Chuyển đổi bằng cách nhấn ngôi sao trên thẻ khách sạn/trang chi tiết
- BR-034: Lưu trữ vĩnh viễn dựa trên localStorage

**Acceptance Criteria**:
- [ ] AC-017: Phản ánh ngay khi thêm/xóa yêu thích

---

### FR-HOTEL: Chi tiết khách sạn

#### FR-HOTEL-001: Trang chi tiết khách sạn
**Description**: Thông tin khách sạn và chọn phòng

**Business Rules**:
- BR-035: Điều hướng Breadcrumb
- BR-036: Thanh tìm kiếm compact (có thể sửa ngày/số phòng)
- BR-037: Phần Hero (hình ảnh, tên, số sao, đánh giá)
- BR-038: 4 tab — Rooms, Overview, Policies, Facilities

#### FR-HOTEL-002: Tab Rooms
**Description**: Danh sách phòng và bộ lọc

**Business Rules**:
- BR-039: Bộ lọc — Room Type, Bed Type, Price Range, Meal Plan, Refundable Only
- BR-040: Thẻ phòng — tên phòng, loại giường, sức chứa tối đa, chính sách hủy, có bao gồm ăn sáng không, giá, nút Select

**Acceptance Criteria**:
- [ ] AC-018: Lọc theo thời gian thực khi thay đổi bộ lọc

#### FR-HOTEL-003: Tab Overview
**Description**: Mô tả khách sạn, các điểm nổi bật chính, thông tin vị trí

#### FR-HOTEL-004: Tab Policies
**Description**: Giờ check-in/out, chính sách hủy, chính sách trẻ em/trẻ sơ sinh/vật nuôi/hút thuốc

#### FR-HOTEL-005: Tab Facilities
**Description**: Danh sách tiện nghi theo danh mục (General, Recreation, Business, v.v.), biểu tượng + văn bản

---

### FR-BOOK: Quy trình đặt phòng

#### FR-BOOK-001: Form đặt phòng (Bước 1)
**Description**: Nhập thông tin khách và chọn phương thức thanh toán

**Business Rules**:
- BR-041: Guest Name (First/Last), Email, Mobile, Special Requests
- BR-042: Thanh tóm tắt đặt phòng
- BR-043: Doanh nghiệp trả trước — chọn thẻ doanh nghiệp đã đăng ký hoặc Reserve Now Pay Later
- BR-044: Doanh nghiệp trả sau — trừ Floating Deposit hoặc sử dụng Credit Line

**Acceptance Criteria**:
- [ ] AC-019: Kiểm tra các trường bắt buộc trước khi tiến hành bước tiếp theo

#### FR-BOOK-002: Xác nhận đặt phòng (Bước 2)
**Description**: Xác nhận cuối cùng và đồng ý điều khoản

**Business Rules**:
- BR-045: Tóm tắt thông tin đặt phòng (khách sạn, ngày, phòng, khách)
- BR-046: Chi tiết giá (Room Rate, Tax, Total)
- BR-047: Hướng dẫn chính sách hủy
- BR-048: Checkbox Terms & Conditions → Kích hoạt nút Confirm Booking

#### FR-BOOK-003: Hoàn tất đặt phòng (Bước 3)
**Description**: Màn hình đặt phòng thành công

**Business Rules**:
- BR-049: Biểu tượng thành công và thông báo
- BR-050: Tạo ELLIS Booking Code — Định dạng: `K` + `YYMMDD` + `HHMMSS` + `H` + `NN` (NN = số thứ tự trong ngày 01~99, reset về 01 lúc 00:00:00 nửa đêm theo giờ địa phương của trình duyệt. Tự động tăng NN khi có xung đột. Khi vượt quá 100 trong ngày, mở rộng NN thành 3 chữ số (100~999). Quản lý ID duy nhất dựa trên UUID riêng biệt ở bên trong, ELLIS Code chỉ dùng để hiển thị)
- BR-051: Nút tải xuống voucher/gửi email
- BR-052: Nút My Bookings / New Booking

**Acceptance Criteria**:
- [ ] AC-020: Phản ánh ngay trong danh sách đặt phòng

#### FR-BOOK-004: Hủy đặt phòng
**Description**: Quy trình hủy đặt phòng

**Business Rules**:
- BR-053: Chọn lý do hủy (dropdown)
- BR-054: Tự động tính phí hủy (áp dụng chính sách theo từng khách sạn dựa trên dữ liệu nội bộ)
- BR-055: Hiển thị số tiền hoàn lại dự kiến
- BR-056: Modal xác nhận hủy
- BR-057: Doanh nghiệp trả trước — Tự động hủy sau cảnh báo khi chưa thanh toán quá Cancel Deadline

**Acceptance Criteria**:
- [ ] AC-021: Thay đổi trạng thái và tạo thông báo khi hủy hoàn tất

#### FR-BOOK-005: Đặt lại (Re-book)
**Description**: Đặt lại đặt phòng đã hủy

**Business Rules**:
- BR-058: Nút Re-book trên màn hình hoàn tất hủy
- BR-059: Chuyển đến trang chi tiết cùng khách sạn, giữ nguyên thông tin ngày cũ

---

### FR-BKG: Quản lý đặt phòng

#### FR-BKG-001: Danh sách đặt phòng
**Description**: Xem và quản lý toàn bộ đặt phòng (bảng 14 cột)

**Business Rules**:
- BR-060: Cột — Checkbox, Booking Date, ELLIS Code, Booking Status (Confirmed/Cancelled/Pending/No-show/Completed), Payment Status, Hotel Name, Cancel Deadline, Check-in & Nights, Room Type & Count, 1st Traveler, Currency, Sum Amount, Invoice No., Dispute
- BR-061: Chọn 20/50/100 mục/trang

#### FR-BKG-002: Bộ lọc đặt phòng
**Description**: Lọc theo nhiều điều kiện

**Business Rules**:
- BR-062: Bộ lọc Date Type — Booking/Cancel/Check In/Check Out/Cancel Deadline/Stay Date
- BR-063: Bộ lọc bổ sung — ELLIS Code, Booking Status, Payment Status (6 loại), Search By (Booker/Traveler/Mobile), Country, Hotel Name

#### FR-BKG-003: Modal chi tiết đặt phòng
**Description**: Xem toàn bộ thông tin đặt phòng (9 phần)

**Business Rules**:
- BR-064: Booking Summary, Hotel Info, Room Details, Guest Info, Payment Info, Cancellation Policy, Special Requests, Booking Timeline, Actions (voucher/hóa đơn/hủy)
- BR-064a: Chỉnh sửa đặt phòng (Modify): Trong MVP chỉ có thể chỉnh sửa thông tin khách (tên, email, liên hệ, Special Requests). Thay đổi ngày/phòng được xử lý bằng cách hủy và đặt lại
- BR-065: Mở bằng cách nhấn hàng hoặc dán ELLIS Code (Tính năng phát hiện mẫu ELLIS Code trong TopBar GlobalSearch — Tự động mở modal chi tiết đặt phòng tương ứng khi nhập ELLIS Code)

#### FR-BKG-004: Chế độ xem lịch
**Description**: Trực quan hóa tình trạng đặt phòng theo tháng

**Business Rules**:
- BR-066: Điều hướng tháng (Prev/Today/Next)
- BR-067: Màu sự kiện — Check-in (Xanh dương), Check-out (Vàng), Stay (Xanh lá), Cancelled (Đỏ), Cancel Deadline (Hồng)
- BR-068: Tối đa 3 sự kiện/ô, hiển thị "+N more"
- BR-069: Thẻ thống kê hàng tháng (Confirmed, Cancelled, Room Nights, Net Cost, Unpaid)
- BR-070: Bảng Upcoming Check-ins (5 mục tiếp theo, màu D-day)

#### FR-BKG-005: Xuất Excel
**Description**: Tải xuống .xlsx dữ liệu đặt phòng đang áp dụng bộ lọc hiện tại

#### FR-BKG-006: Tải xuống voucher hàng loạt
**Description**: Chọn nhiều checkbox → Tải xuống ZIP hoặc tải từng cái

---

### FR-DOC: Voucher và tài liệu

#### FR-DOC-001: Voucher đặt phòng
**Description**: Xác nhận đặt phòng để nộp cho khách sạn (PDF)

**Business Rules**:
- BR-071: ELLIS Code, thông tin khách sạn, ngày check-in/out, thông tin khách, thông tin phòng, chính sách hủy, mã QR
- BR-072: Tải xuống PDF và gửi email (cho phép sử dụng thư viện bên ngoài như html2pdf.js)

#### FR-DOC-002: Hóa đơn (Receipt)
**Description**: PDF xác nhận thanh toán

#### FR-DOC-003: Xác nhận hủy
**Description**: PDF chứng minh hủy đặt phòng

#### FR-DOC-004: Hợp đồng B2B
**Description**: PDF hợp đồng dịch vụ được tạo tự động khi đăng ký

---

### FR-SET: Hệ thống thanh toán (Chỉ dành cho Master)

#### FR-SET-001: Monthly Settlement
**Description**: Chi tiết thanh toán hàng tháng

**Business Rules**:
- BR-073: Dropdown chọn tháng
- BR-074: Thẻ tóm tắt thanh toán (Total Net Cost, Room Nights, Avg Net/Night)
- BR-075: Bảng chi tiết theo ngày
- BR-076: Tải xuống PDF/Excel

#### FR-SET-002: Invoices (Hóa đơn thuế)
**Description**: Xem/phát hành hóa đơn thuế hàng tháng

**Business Rules**:
- BR-077: Trạng thái — Draft, Issued, Paid
- BR-078: Giá trị cung cấp, VAT (10%), tổng cộng
- BR-079: Tự động tạo hàng tháng, có thể phát hành thủ công

#### FR-SET-003: Accounts Receivable (Khoản phải thu)
**Description**: Quản lý đặt phòng chưa thanh toán

**Business Rules**:
- BR-080: Danh sách các khoản chưa thanh toán, hiển thị D-day Cancel Deadline
- BR-081: Thanh toán riêng lẻ/hàng loạt, tùy chọn thanh toán phân kỳ
- BR-081a: Thanh toán phân kỳ: Người dùng tự nhập số tiền thanh toán (số tiền thanh toán tối thiểu = 10% tổng số)
- BR-081b: Khi thanh toán phân kỳ, Payment Status → Partially Paid, số tiền còn lại tiếp tục hiển thị trong AR
- BR-081c: Số lần phân kỳ tối đa: 5 lần
- BR-081d: Khi thanh toán cuối cùng hoàn tất, Payment Status → Fully Paid
- BR-082: Doanh nghiệp trả trước — thanh toán bằng thẻ doanh nghiệp, doanh nghiệp trả sau — trừ Deposit/chuyển khoản

#### FR-SET-004: OP Points Settlement
**Description**: Lịch sử tích lũy/sử dụng/chuyển điểm và số dư

#### FR-SET-005: Purchase by Hotel
**Description**: Phân tích mua hàng theo khách sạn (tổng mua, số lượng, giá trị trung bình, tỷ trọng, biểu đồ)

---

### FR-PAY: Hệ thống thanh toán

#### FR-PAY-001: Doanh nghiệp trả trước (Prepaid)
**Description**: Thanh toán tự động PG bằng thẻ doanh nghiệp + Reserve Now Pay Later

**Business Rules**:
- BR-083: Non-Refundable — Thanh toán ngay bằng thẻ doanh nghiệp (mô phỏng PG)
- BR-084: Refundable — Xác nhận đặt phòng mà không thanh toán, cần thanh toán trước Cancel Deadline
- BR-085: Gửi cảnh báo trước Cancel Deadline D-3, D-1. Tự động hủy ngay khi vượt quá Deadline (không có thời gian ân hạn)

#### FR-PAY-002: Doanh nghiệp trả sau (Credit)
**Description**: Floating Deposit + Credit Line

**Business Rules**:
- BR-086: Floating Deposit — Hiển thị số dư, tự động trừ khi đặt phòng
- BR-086a: Khi số dư Deposit không đủ: Cung cấp UI xác nhận "Số dư Deposit không đủ. Bạn có muốn sử dụng Credit Line không?" (không chuyển đổi tự động)
- BR-086b: Không thể thanh toán kết hợp Deposit + Credit — chỉ chọn một trong hai: toàn bộ Deposit hoặc toàn bộ Credit Line
- BR-086c: Khi cả hai đều không đủ, hiển thị ERR-PAY-005 (không thể đặt phòng)
- BR-087: Credit Line — Hạn mức tín dụng dựa trên Deposit, đặt phòng tự do trong hạn mức, thanh toán tổng hợp cuối tháng
- BR-088: Cảnh báo Low Deposit — Cảnh báo Critical khi Deposit < $5,000

---

### FR-PTS: Hệ thống OP Points

#### FR-PTS-001: Tích lũy điểm
**Description**: Tích lũy điểm dựa trên số tiền đặt phòng (tỷ lệ cố định, tải giá trị thiết lập từ dữ liệu nội bộ)

**Business Rules**:
- BR-089: Tự động tích lũy khi hoàn tất đặt phòng
- BR-090: Phân phối theo tỷ lệ Share của từng OP

#### FR-PTS-002: Sử dụng điểm (Rewards Mall)
**Description**: 6 danh mục, 20+ sản phẩm

#### FR-PTS-003: Chuyển điểm
**Description**: Chuyển điểm giữa các OP trong cùng doanh nghiệp (chỉ Master hoặc bản thân)

#### FR-PTS-004: Lịch sử điểm
**Description**: Xem lịch sử tích lũy/sử dụng/chuyển điểm, bộ lọc theo thời gian

---

### FR-AI: AI Booking Assistant (Widget nổi)

#### FR-AI-001: Đề xuất khách sạn bằng ngôn ngữ tự nhiên
**Description**: Tìm kiếm khách sạn bằng ngôn ngữ tự nhiên tích hợp Claude API (phương thức gọi API: TBD)

**Business Rules**:
- BR-091: Phản hồi thẻ khách sạn có thể nhấp
- BR-092: Nhấn thẻ khách sạn để chuyển đến trang chi tiết

#### FR-AI-002: Phân tích đặt phòng
**Description**: Phân tích mẫu đặt phòng của người dùng (tổng đặt phòng, chi tiêu, tần suất, giá trị trung bình, khu vực ưa thích)

#### FR-AI-003: Hướng dẫn khu vực
**Description**: Cung cấp thông tin khu vực du lịch (đặc điểm khu vực, đề xuất theo mục đích, khả năng tiếp cận giao thông)

#### FR-AI-004: Quick Actions
**Description**: Nút tắt các chức năng thường dùng (đề xuất khách sạn, phân tích đặt phòng, hướng dẫn khu vực, trợ giúp)

#### FR-AI-005: Local Fallback
**Description**: Phản hồi thay thế dựa trên dữ liệu khách sạn cục bộ khi kết nối API thất bại

**Phạm vi Fallback**:
- Đề xuất khách sạn (FR-AI-001): Hỗ trợ — Trả về tối đa 5 thẻ khách sạn dựa trên dữ liệu JSON cục bộ (chỉ thẻ, không có mô tả văn bản)
- Phân tích đặt phòng (FR-AI-002): Không hỗ trợ — Thông báo "Dịch vụ AI hiện không khả dụng"
- Hướng dẫn khu vực (FR-AI-003): Không hỗ trợ — Thông báo "Dịch vụ AI hiện không khả dụng"
- Hiển thị banner thông báo "Chế độ dịch vụ hạn chế" khi ở trạng thái Fallback

---

### FR-NOTI: Trung tâm thông báo

#### FR-NOTI-001: Danh sách thông báo
**Description**: Xem tất cả thông báo (tab: All, Unread, Deadlines, Payment, Check-in, Bookings, Cancelled, System)

#### FR-NOTI-002: Mức độ ưu tiên thông báo
**Description**: Critical (đỏ) > High (vàng) > Medium (xanh lá) > Low (xám)

#### FR-NOTI-003: Tự động tạo thông báo
**Description**: Tự động tạo khi đáp ứng điều kiện

**Tiêu chí thời gian tạo thông báo**:
| Loại thông báo | Thời điểm | Mức độ ưu tiên | Khóa chống trùng lặp |
|----------------|-----------|----------------|---------------------|
| Cancel Deadline | D-7, D-3, D-1 | Medium, High, Critical | booking_id + type + D-N |
| Check-in Reminder | D-3, D-1 | Medium, High | booking_id + type + D-N |
| Payment Pending | Ngay khi tạo đặt phòng | Medium | booking_id + "payment" |
| Booking Confirmed | Ngay khi xác nhận đặt phòng | Low | booking_id + "confirmed" |
| Booking Cancelled | Ngay khi hủy | Low | booking_id + "cancelled" |
| Low Deposit | Khi kiểm tra số dư | Critical | tenant_id + "low_deposit" |

- Nếu thông báo với cùng dedup_key đã tồn tại thì không tạo thêm

#### FR-NOTI-004: Cài đặt thông báo
**Description**: Bật/tắt nhận thông báo (Cancel Deadline, Check-in, Payment, Booking, Email, Promotional, System, Quiet Hours)

#### FR-NOTI-005: Thẻ tóm tắt thông báo
**Description**: Tóm tắt số lượng Critical/Unread/Deadlines/Payments

---

### FR-DASH: Dashboard

#### FR-DASH-001: Thẻ KPI
**Description**: Total Bookings, Revenue (TTV), Room Nights, Avg Booking Value + Tỷ lệ tăng/giảm so với kỳ trước

#### FR-DASH-002: OP Points Widget
**Description**: Số dư hiện tại, tích lũy/sử dụng trong tháng này, liên kết nhanh đến Rewards Mall

#### FR-DASH-003: Top Hotels
**Description**: 5 khách sạn hàng đầu, số lượng đặt phòng/tổng số tiền

#### FR-DASH-004: Xu hướng TTV 12 tháng
**Description**: Biểu đồ cột dựa trên CSS, highlight tháng hiện tại

#### FR-DASH-005: Booking Conversion Funnel
**Description**: Searches → Room Views → Booking Started → Confirmed → Completed

#### FR-DASH-006: Hotel Profitability
**Description**: Net/Night trung bình theo khách sạn, số lượng đặt phòng, xu hướng

#### FR-DASH-007: OP Performance Comparison (Chỉ dành cho Master)
**Description**: Số lượng đặt phòng/TTV/Room Nights/giá trị trung bình theo từng OP + xếp hạng

#### FR-DASH-008: My Performance KPIs (Chỉ dành cho OP)
**Description**: Booking Success Rate, Avg Response Time, Satisfaction, Repeat Rate + thanh gauge

---

### FR-CHAT: Support Chat

#### FR-CHAT-001: Hệ thống chat
**Description**: Danh sách phòng chat, khu vực tin nhắn, ô nhập liệu, đính kèm tệp (Tab trong trang Bookings)

#### FR-CHAT-002: Tự động phát hiện ELLIS Code
**Description**: Phát hiện mẫu ELLIS Code trong chat → Tự động tải thông tin đặt phòng

#### FR-CHAT-003: AI Chatbot (Phản hồi đầu tiên)
**Description**: Tự động trả lời dựa trên FAQ, kết nối với nhân viên khi không thể trả lời

#### FR-CHAT-004: Chuyển đến nhân viên
**Description**: Nút Connect to Agent, thay đổi trạng thái kết nối với nhân viên tư vấn

---

### FR-FAQ: FAQ Board

#### FR-FAQ-001: Danh sách FAQ
**Description**: Tab danh mục (All, Booking, Payment, Cancellation, Account, Technical), 22+ bài viết, accordion

#### FR-FAQ-002: Tìm kiếm FAQ
**Description**: Tìm kiếm từ khóa, đối tượng tìm kiếm là tiêu đề + nội dung, kết quả theo thời gian thực

---

### FR-UI: UI/UX

#### FR-UI-001: Chế độ tối
**Description**: Dựa trên CSS Variables, bật/tắt trên header (🌙/☀️), lưu vào localStorage

#### FR-UI-002: Chọn ngôn ngữ
**Description**: 5 ngôn ngữ (EN, KO, JA, ZH, VI), dropdown trên header, triển khai bản dịch đầy đủ

#### FR-UI-003: Chọn tiền tệ
**Description**: 10 loại tiền tệ (USD, KRW, JPY, CNY, VND, EUR, GBP, THB, SGD, HKD)

#### FR-UI-004: Bố cục responsive
**Description**: Tối ưu cho desktop (1024px+), hỗ trợ tablet

#### FR-UI-005: Áp dụng CI Ohmyhotel
**Description**: Primary #FF6000, Success #009505, Background #FCFCF8

---

## Spec Files

| File | Contents |
|------|----------|
| `screens.md` | Screen Definitions, Error Handling |
| `test-scenarios.md` | Non-Functional Requirements, Test Scenarios |

---

## 8. Open Questions

| ID | Question | Context | Status |
|----|----------|---------|--------|
| OQ-001 | Phương thức gọi Claude API (trực tiếp từ frontend hay qua proxy server) | Vấn đề bảo mật — API key có thể bị lộ ở frontend | OPEN |
| OQ-002 | Giá trị cụ thể của tỷ lệ tích lũy OP Points | Lấy từ dữ liệu nội bộ nhưng cần giá trị mặc định Mock (ví dụ: 1%) | OPEN |
| OQ-003 | Giá trị tiền tệ của điểm (1P = bao nhiêu?) | Cần thiết để thiết lập giá sản phẩm Rewards Mall | OPEN |
| OQ-004 | Quy mô bộ dữ liệu khách sạn ban đầu | Khi hardcode JSON, khuyến nghị tối thiểu 50 khách sạn tại các thành phố lớn ở Châu Á | OPEN |
| OQ-005 | Thư viện xuất Excel | Có được phép sử dụng SheetJS không (PDF đã xác nhận cho phép html2pdf.js) | OPEN |
| OQ-006 | Cách thức hoạt động Mock của Support Chat | Chỉ hoạt động AI chatbot, khuyến nghị mô phỏng 'Nhân viên hiện không có mặt' khi kết nối với nhân viên | OPEN |
| OQ-007 | Thời điểm tự động tạo Invoice | Tự động tạo Draft vào ngày 1 hàng tháng, Master xử lý Issued — Cần xác nhận | OPEN |

---

## 9. Review History

| Round | Planner Score | Tester Score | Key Decisions | Date |
|-------|---------------|--------------|---------------|------|
| 1 | 7/10 | 4/10 | Thêm quên mật khẩu, sơ đồ chuyển đổi trạng thái, định nghĩa 6 trạng thái thanh toán, cấu trúc phí hủy, tỷ giá hối đoái, kiểm tra hợp lệ, xung đột ELLIS Code, nhiều phòng, chuyển đổi Deposit/Credit, thanh toán phân kỳ, vô hiệu hóa OP, thời điểm thông báo, AI Fallback | 2026-03-28 |
| 2 | 8/10 | 7/10 | Giải quyết mâu thuẫn hủy Non-Refundable (cho phép hủy sau cảnh báo), mở rộng ELLIS Code 100+, chi tiết popup cảnh báo phiên, xác nhận thời điểm tự động hủy RNPL | 2026-03-28 |
