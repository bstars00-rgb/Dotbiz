export type Locale = "EN" | "KO" | "JA" | "ZH" | "VI";

const strings: Record<string, Record<Locale, string>> = {
  // ── Navigation ──
  "nav.findHotel": { EN: "Find Hotel", KO: "호텔 검색", JA: "ホテル検索", ZH: "搜索酒店", VI: "Tìm khách sạn" },
  "nav.dashboard": { EN: "Dashboard", KO: "대시보드", JA: "ダッシュボード", ZH: "仪表盘", VI: "Bảng điều khiển" },
  "nav.bookings": { EN: "Bookings", KO: "예약 관리", JA: "予約管理", ZH: "订单管理", VI: "Quản lý đặt phòng" },
  "nav.settlement": { EN: "Settlement", KO: "정산", JA: "精算", ZH: "结算", VI: "Thanh toán" },
  "nav.clientMgmt": { EN: "Client Mgmt", KO: "고객 관리", JA: "顧客管理", ZH: "客户管理", VI: "Quản lý khách hàng" },
  "nav.tickets": { EN: "Tickets", KO: "문의/티켓", JA: "チケット", ZH: "工单", VI: "Yêu cầu hỗ trợ" },
  "nav.notifications": { EN: "Notifications", KO: "알림", JA: "通知", ZH: "通知", VI: "Thông báo" },
  "nav.faq": { EN: "FAQ Board", KO: "FAQ 게시판", JA: "FAQ", ZH: "常见问题", VI: "Câu hỏi thường gặp" },
  "nav.myAccount": { EN: "My Account", KO: "내 계정", JA: "マイアカウント", ZH: "我的账户", VI: "Tài khoản" },
  "nav.rewards": { EN: "Rewards Mall", KO: "리워드몰", JA: "リワードモール", ZH: "积分商城", VI: "Cửa hàng điểm thưởng" },
  "nav.blog": { EN: "OhMy Blog", KO: "OhMy 블로그", JA: "OhMyブログ", ZH: "OhMy博客", VI: "OhMy Blog" },
  "nav.section.work":      { EN: "Work",      KO: "업무",      JA: "業務",     ZH: "工作",   VI: "Công việc" },
  "nav.section.admin":     { EN: "Admin",     KO: "관리",      JA: "管理",     ZH: "管理",   VI: "Quản trị" },
  "nav.section.resources": { EN: "Resources", KO: "참고/지원", JA: "リソース", ZH: "资源",   VI: "Tài nguyên" },
  "nav.switchAccount": { EN: "Switch Account", KO: "계정 전환", JA: "アカウント切替", ZH: "切换账户", VI: "Chuyển tài khoản" },
  "nav.logout": { EN: "Logout", KO: "로그아웃", JA: "ログアウト", ZH: "退出登录", VI: "Đăng xuất" },

  // ── Common Buttons ──
  "btn.search": { EN: "Search", KO: "검색", JA: "検索", ZH: "搜索", VI: "Tìm kiếm" },
  "btn.create": { EN: "Create", KO: "생성", JA: "作成", ZH: "创建", VI: "Tạo mới" },
  "btn.cancel": { EN: "Cancel", KO: "취소", JA: "キャンセル", ZH: "取消", VI: "Hủy bỏ" },
  "btn.confirm": { EN: "Confirm", KO: "확인", JA: "確認", ZH: "确认", VI: "Xác nhận" },
  "btn.close": { EN: "Close", KO: "닫기", JA: "閉じる", ZH: "关闭", VI: "Đóng" },
  "btn.export": { EN: "Export", KO: "내보내기", JA: "エクスポート", ZH: "导出", VI: "Xuất" },
  "btn.save": { EN: "Save", KO: "저장", JA: "保存", ZH: "保存", VI: "Lưu" },
  "btn.back": { EN: "Back", KO: "뒤로", JA: "戻る", ZH: "返回", VI: "Quay lại" },
  "btn.reserve": { EN: "Reserve", KO: "예약", JA: "予約", ZH: "预订", VI: "Đặt phòng" },
  "btn.apply": { EN: "Apply", KO: "적용", JA: "適用", ZH: "应用", VI: "Áp dụng" },

  // ── Dashboard ──
  "dashboard.title": { EN: "Dashboard", KO: "대시보드", JA: "ダッシュボード", ZH: "仪表盘", VI: "Bảng điều khiển" },
  "dashboard.overview": { EN: "Overview", KO: "개요", JA: "概要", ZH: "概览", VI: "Tổng quan" },
  "dashboard.bookingStats": { EN: "Booking Statistics", KO: "예약 통계", JA: "予約統計", ZH: "预订统计", VI: "Thống kê đặt phòng" },
  "dashboard.cancelStats": { EN: "Cancellation Statistics", KO: "취소 통계", JA: "キャンセル統計", ZH: "取消统计", VI: "Thống kê hủy" },
  "dashboard.dailyStats": { EN: "Daily Booking Statistics", KO: "일별 예약 통계", JA: "日別予約統計", ZH: "每日预订统计", VI: "Thống kê hàng ngày" },
  "dashboard.yearEnd": { EN: "Year-End Statistics", KO: "연말 통계", JA: "年末統計", ZH: "年终统计", VI: "Thống kê cuối năm" },
  "dashboard.totalBookings": { EN: "Total Bookings", KO: "총 예약", JA: "総予約数", ZH: "总预订数", VI: "Tổng đặt phòng" },
  "dashboard.totalRevenue": { EN: "Total Revenue", KO: "총 매출", JA: "総売上", ZH: "总收入", VI: "Tổng doanh thu" },
  "dashboard.cancelRate": { EN: "Cancellation Rate", KO: "취소율", JA: "キャンセル率", ZH: "取消率", VI: "Tỷ lệ hủy" },
  "dashboard.avgBookingValue": { EN: "Avg. Booking Value", KO: "평균 예약 금액", JA: "平均予約額", ZH: "平均预订金额", VI: "Giá trị TB" },
  "dashboard.topHotels": { EN: "Top Hotels", KO: "인기 호텔", JA: "人気ホテル", ZH: "热门酒店", VI: "Khách sạn hàng đầu" },
  "dashboard.destinationBooking": { EN: "Destination Booking %", KO: "목적지별 예약 비율", JA: "目的地別予約率", ZH: "目的地预订占比", VI: "Tỷ lệ đặt phòng theo điểm đến" },

  // ── Bookings ──
  "bookings.title": { EN: "Booking Management", KO: "예약 관리", JA: "予約管理", ZH: "订单管理", VI: "Quản lý đặt phòng" },
  "bookings.all": { EN: "All", KO: "전체", JA: "全て", ZH: "全部", VI: "Tất cả" },
  "bookings.confirmed": { EN: "Confirmed", KO: "확정", JA: "確定", ZH: "已确认", VI: "Đã xác nhận" },
  "bookings.pending": { EN: "Pending", KO: "대기", JA: "保留中", ZH: "待确认", VI: "Chờ xử lý" },
  "bookings.cancelled": { EN: "Cancelled", KO: "취소됨", JA: "キャンセル済", ZH: "已取消", VI: "Đã hủy" },
  "bookings.completed": { EN: "Completed", KO: "완료", JA: "完了", ZH: "已完成", VI: "Hoàn thành" },
  "bookings.groupBooking": { EN: "Group Booking", KO: "그룹 예약", JA: "グループ予約", ZH: "团体预订", VI: "Đặt phòng nhóm" },
  "bookings.batchCancel": { EN: "Batch Cancel", KO: "일괄 취소", JA: "一括キャンセル", ZH: "批量取消", VI: "Hủy hàng loạt" },
  "bookings.printVoucher": { EN: "Print Voucher", KO: "바우처 출력", JA: "バウチャー印刷", ZH: "打印凭证", VI: "In phiếu" },
  "bookings.amendBooking": { EN: "Amend Booking", KO: "예약 수정", JA: "予約変更", ZH: "修改预订", VI: "Sửa đặt phòng" },

  // ── Hotel ──
  "hotel.rooms": { EN: "Rooms", KO: "객실", JA: "客室", ZH: "房间", VI: "Phòng" },
  "hotel.overview": { EN: "Overview", KO: "개요", JA: "概要", ZH: "概览", VI: "Tổng quan" },
  "hotel.policies": { EN: "Policies", KO: "정책", JA: "ポリシー", ZH: "政策", VI: "Chính sách" },
  "hotel.facilities": { EN: "Facilities", KO: "시설", JA: "設備", ZH: "设施", VI: "Tiện nghi" },
  "hotel.favorite": { EN: "Favorite", KO: "즐겨찾기", JA: "お気に入り", ZH: "收藏", VI: "Yêu thích" },

  // ── Common Labels ──
  "label.checkIn": { EN: "Check-In", KO: "체크인", JA: "チェックイン", ZH: "入住", VI: "Nhận phòng" },
  "label.checkOut": { EN: "Check-Out", KO: "체크아웃", JA: "チェックアウト", ZH: "退房", VI: "Trả phòng" },
  "label.nights": { EN: "nights", KO: "박", JA: "泊", ZH: "晚", VI: "đêm" },
  "label.rooms": { EN: "Rooms", KO: "객실", JA: "部屋", ZH: "房间", VI: "Phòng" },
  "label.adults": { EN: "Adults", KO: "성인", JA: "大人", ZH: "成人", VI: "Người lớn" },
  "label.children": { EN: "Children", KO: "아동", JA: "子供", ZH: "儿童", VI: "Trẻ em" },
  "label.nationality": { EN: "Nationality", KO: "국적", JA: "国籍", ZH: "国籍", VI: "Quốc tịch" },
  "label.destination": { EN: "Destination", KO: "목적지", JA: "目的地", ZH: "目的地", VI: "Điểm đến" },
  "label.price": { EN: "Price", KO: "가격", JA: "価格", ZH: "价格", VI: "Giá" },
  "label.total": { EN: "Total", KO: "합계", JA: "合計", ZH: "总计", VI: "Tổng cộng" },

  // ── Page Titles ──
  "page.settlement": { EN: "Settlement & Billing", KO: "정산 및 청구", JA: "精算・請求", ZH: "结算与账单", VI: "Thanh toán & Hóa đơn" },
  "page.clientMgmt": { EN: "Client Management", KO: "고객 관리", JA: "顧客管理", ZH: "客户管理", VI: "Quản lý khách hàng" },
  "page.tickets": { EN: "Hotel Ticket Management", KO: "호텔 티켓 관리", JA: "ホテルチケット管理", ZH: "酒店工单管理", VI: "Quản lý yêu cầu khách sạn" },
  "page.myAccount": { EN: "My Account", KO: "내 계정", JA: "マイアカウント", ZH: "我的账户", VI: "Tài khoản của tôi" },
  "page.faq": { EN: "FAQ Board", KO: "FAQ 게시판", JA: "FAQ", ZH: "常见问题", VI: "Câu hỏi thường gặp" },
  "page.notifications": { EN: "Notifications", KO: "알림", JA: "通知", ZH: "通知", VI: "Thông báo" },
  "page.favorites": { EN: "My Favorites", KO: "즐겨찾기", JA: "お気に入り", ZH: "我的收藏", VI: "Yêu thích" },
  "page.rewards": { EN: "Rewards Mall", KO: "리워드몰", JA: "リワードモール", ZH: "积分商城", VI: "Cửa hàng điểm thưởng" },
};

export default strings;
