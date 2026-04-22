/* ── Sub-accounts ──
 * Per-customer team members (Master + OP roles).
 * Each sub-account belongs to one customerCompanyId — the Team page filters by
 * the currently logged-in user's company so a TravelCo Master only sees
 * TravelCo's own team, not OhMyHotel internal staff or other customers.
 *
 * Role taxonomy matches AuthContext: Master | OP. Previously this mock had
 * Manager/Viewer too, but those don't exist elsewhere in the codebase. */
export interface SubAccount {
  id: string;
  customerCompanyId: string;
  name: string;
  email: string;
  department: string;
  role: "Master" | "OP";
  status: "Active" | "Pending" | "Deactivated";
  createdDate: string;
  lastLogin?: string;
}

export const subAccounts: SubAccount[] = [
  /* ── TravelCo International (comp-001) ── */
  { id: "sub-001", customerCompanyId: "comp-001", name: "James Park",    email: "master@dotbiz.com",      department: "Management",   role: "Master", status: "Active",      createdDate: "2024-03-15", lastLogin: "2026-04-22 08:30:14" },
  { id: "sub-002", customerCompanyId: "comp-001", name: "Sarah Kim",     email: "op@dotbiz.com",          department: "Sales",        role: "OP",     status: "Active",      createdDate: "2024-04-02", lastLogin: "2026-04-22 09:12:05" },
  { id: "sub-003", customerCompanyId: "comp-001", name: "Kevin Lee",     email: "kevin@travelco.com",     department: "Sales",        role: "OP",     status: "Active",      createdDate: "2025-06-10", lastLogin: "2026-04-21 17:44:22" },
  { id: "sub-004", customerCompanyId: "comp-001", name: "Emma Wilson",   email: "emma@travelco.com",      department: "Operations",   role: "OP",     status: "Active",      createdDate: "2025-09-08", lastLogin: "2026-04-22 10:02:11" },
  { id: "sub-005", customerCompanyId: "comp-001", name: "Daniel Choi",   email: "daniel@travelco.com",    department: "Finance",      role: "OP",     status: "Active",      createdDate: "2025-11-20", lastLogin: "2026-04-19 14:30:00" },
  { id: "sub-006", customerCompanyId: "comp-001", name: "Rachel Park",   email: "rachel@travelco.com",    department: "Sales",        role: "OP",     status: "Pending",     createdDate: "2026-04-18" },
  { id: "sub-007", customerCompanyId: "comp-001", name: "Tom Wilson",    email: "tom.old@travelco.com",   department: "Finance",      role: "OP",     status: "Deactivated", createdDate: "2024-11-05", lastLogin: "2025-12-15 09:00:22" },

  /* ── Asia Tours Ltd. (comp-002, PREPAY) ── */
  { id: "sub-101", customerCompanyId: "comp-002", name: "Jennifer Wu",   email: "prepay@dotbiz.com",      department: "Management",   role: "Master", status: "Active",      createdDate: "2024-06-01", lastLogin: "2026-04-22 07:55:00" },
  { id: "sub-102", customerCompanyId: "comp-002", name: "Hiroshi Sato",  email: "hiroshi@asiatours.com",  department: "Bookings",     role: "OP",     status: "Active",      createdDate: "2024-08-12", lastLogin: "2026-04-21 22:10:55" },
  { id: "sub-103", customerCompanyId: "comp-002", name: "Alex Chen",     email: "alex@asiatours.com",     department: "Bookings",     role: "OP",     status: "Active",      createdDate: "2025-03-30", lastLogin: "2026-04-22 11:18:40" },

  /* ── GOTADI (comp-010, multi-entity POSTPAY) ── */
  { id: "sub-201", customerCompanyId: "comp-010", name: "Nguyen Van An", email: "gotadi@dotbiz.com",      department: "Management",   role: "Master", status: "Active",      createdDate: "2024-09-15", lastLogin: "2026-04-22 08:00:00" },
  { id: "sub-202", customerCompanyId: "comp-010", name: "Tran Thi Mai",  email: "mai@gotadi.com",         department: "Bookings SG",  role: "OP",     status: "Active",      createdDate: "2024-10-01", lastLogin: "2026-04-22 10:30:12" },
  { id: "sub-203", customerCompanyId: "comp-010", name: "Le Quoc Phong", email: "phong@gotadi.com",       department: "Bookings VN",  role: "OP",     status: "Active",      createdDate: "2024-10-01", lastLogin: "2026-04-22 09:45:22" },
  { id: "sub-204", customerCompanyId: "comp-010", name: "Pham Thuy Linh",email: "linh@gotadi.com",        department: "Finance",      role: "OP",     status: "Active",      createdDate: "2025-02-14", lastLogin: "2026-04-19 15:12:08" },
  { id: "sub-205", customerCompanyId: "comp-010", name: "Hoang Minh Duc",email: "duc@gotadi.com",         department: "Bookings SG",  role: "OP",     status: "Pending",     createdDate: "2026-04-15" },

  /* ── Vietnam Vacation Co. (comp-011, multi-entity PREPAY) ── */
  { id: "sub-301", customerCompanyId: "comp-011", name: "Vu Thi Hoa",    email: "vvc@dotbiz.com",         department: "Management",   role: "Master", status: "Active",      createdDate: "2025-01-20", lastLogin: "2026-04-22 08:15:30" },
  { id: "sub-302", customerCompanyId: "comp-011", name: "Dang Minh Anh", email: "anh@vietnamvacation.vn", department: "Bookings",     role: "OP",     status: "Active",      createdDate: "2025-03-10", lastLogin: "2026-04-21 19:22:44" },
];

/* ── Departments ──
 * Customer-defined internal structure (Sales / Bookings / Finance / etc).
 * Also scoped per customerCompanyId so each team sees only their own departments. */
export interface Department {
  id: string;
  customerCompanyId: string;
  name: string;
  description: string;
  manager: string;
  memberCount: number;
  createdDate: string;
}

export const departments: Department[] = [
  /* TravelCo */
  { id: "dept-001", customerCompanyId: "comp-001", name: "Management", description: "Executive leadership and oversight",             manager: "James Park",  memberCount: 1, createdDate: "2024-03-15" },
  { id: "dept-002", customerCompanyId: "comp-001", name: "Sales",      description: "Customer acquisition and booking sales",         manager: "Sarah Kim",   memberCount: 3, createdDate: "2024-03-15" },
  { id: "dept-003", customerCompanyId: "comp-001", name: "Operations", description: "Booking operations, guest support",              manager: "Emma Wilson", memberCount: 1, createdDate: "2024-04-02" },
  { id: "dept-004", customerCompanyId: "comp-001", name: "Finance",    description: "Settlement, billing, accounting",                manager: "Daniel Choi", memberCount: 1, createdDate: "2024-04-02" },

  /* Asia Tours */
  { id: "dept-101", customerCompanyId: "comp-002", name: "Management", description: "Leadership",                                     manager: "Jennifer Wu", memberCount: 1, createdDate: "2024-06-01" },
  { id: "dept-102", customerCompanyId: "comp-002", name: "Bookings",   description: "All bookings across PREPAY customers",           manager: "Hiroshi Sato", memberCount: 2, createdDate: "2024-06-01" },

  /* GOTADI */
  { id: "dept-201", customerCompanyId: "comp-010", name: "Management",   description: "Company leadership",                           manager: "Nguyen Van An", memberCount: 1, createdDate: "2024-09-15" },
  { id: "dept-202", customerCompanyId: "comp-010", name: "Bookings SG",  description: "International hotels settled via OhMyHotel SG",manager: "Tran Thi Mai",  memberCount: 1, createdDate: "2024-10-01" },
  { id: "dept-203", customerCompanyId: "comp-010", name: "Bookings VN",  description: "Vietnam-local hotels via OhMyHotel VN",        manager: "Le Quoc Phong", memberCount: 1, createdDate: "2024-10-01" },
  { id: "dept-204", customerCompanyId: "comp-010", name: "Finance",      description: "Cross-contract settlement",                    manager: "Pham Thuy Linh",memberCount: 1, createdDate: "2025-02-14" },

  /* VVC */
  { id: "dept-301", customerCompanyId: "comp-011", name: "Management",  description: "Leadership",                                    manager: "Vu Thi Hoa",   memberCount: 1, createdDate: "2025-01-20" },
  { id: "dept-302", customerCompanyId: "comp-011", name: "Bookings",    description: "Travel bookings",                               manager: "Dang Minh Anh",memberCount: 1, createdDate: "2025-03-10" },
];

/* ── Voucher Settings ──
 * The customer's branding info that appears on guest-facing hotel vouchers.
 * One record per customer — scoped so each sees only their own. */
export interface VoucherSettings {
  customerCompanyId: string;
  companyName: string;
  phone: string;
  email: string;
  qq: string;
  address: string;
  logoUrl: string;
  enabled: boolean;
  applyScope: "all" | "manual";
}

export const voucherSettingsByCompany: Record<string, VoucherSettings> = {
  "comp-001": {
    customerCompanyId: "comp-001",
    companyName: "TravelCo International",
    phone: "+82-2-1234-5678", email: "info@travelco.com", qq: "",
    address: "123 Gangnam-daero, Seoul",
    logoUrl: "", enabled: true, applyScope: "all",
  },
  "comp-002": {
    customerCompanyId: "comp-002",
    companyName: "Asia Tours Ltd.",
    phone: "+82-2-2345-6789", email: "info@asiatours.com", qq: "",
    address: "456 Teheran-ro, Seoul",
    logoUrl: "", enabled: true, applyScope: "manual",
  },
  "comp-010": {
    customerCompanyId: "comp-010",
    companyName: "GOTADI Vietnam Co., Ltd.",
    phone: "+84-28-3555-1234", email: "support@gotadi.com", qq: "",
    address: "123 Nguyen Hue, District 1, HCMC, Vietnam",
    logoUrl: "", enabled: true, applyScope: "all",
  },
  "comp-011": {
    customerCompanyId: "comp-011",
    companyName: "Vietnam Vacation Co.",
    phone: "+84-24-3555-9876", email: "info@vietnamvacation.vn", qq: "",
    address: "88 Ba Trieu, Hanoi, Vietnam",
    logoUrl: "", enabled: false, applyScope: "manual",
  },
};

/* Fallback (legacy import path) — returns first customer's settings or a default. */
export const voucherSettings: VoucherSettings = voucherSettingsByCompany["comp-001"];

/* ── Legacy: avatar dropdown shows rough credit snapshot ──
 * Kept for compatibility. Real per-contract credit state lives on
 * Settlement > Credit Line card (see SettlementPage). */
export const creditSummary = {
  creditBalance: 25400,
  deferredCreditBalance: 50000,
  deferredCreditUsed: 18600,
};

/* ── Company Coupons ──
 * Promotions earned by the customer company as a whole (not per-user).
 * Master manages these on Team > Coupons. */
export interface CompanyCoupon {
  id: string;
  customerCompanyId: string;
  name: string;
  discount: string;
  status: "Unused" | "Used" | "Expired";
  validUntil?: string;
  minOrder?: string;
  applicable?: string;
  usedDate?: string;
  booking?: string;
  expiredDate?: string;
}
export const companyCoupons: CompanyCoupon[] = [
  /* TravelCo */
  { id: "cp-001", customerCompanyId: "comp-001", name: "Spring Welcome 5% Off", discount: "5%",  status: "Unused",  validUntil: "2026-06-30", minOrder: "$200", applicable: "All Hotels" },
  { id: "cp-002", customerCompanyId: "comp-001", name: "New User $20 Off",      discount: "$20", status: "Unused",  validUntil: "2026-05-15", minOrder: "$300", applicable: "Featured Hotels" },
  { id: "cp-003", customerCompanyId: "comp-001", name: "Winter Sale 10% Off",   discount: "10%", status: "Used",    usedDate: "2026-02-15", booking: "ELS-2026-00128" },
  { id: "cp-004", customerCompanyId: "comp-001", name: "Holiday $15 Off",      discount: "$15", status: "Expired", expiredDate: "2026-01-31" },

  /* GOTADI */
  { id: "cp-010", customerCompanyId: "comp-010", name: "Multi-Entity Welcome 8% Off",    discount: "8%",  status: "Unused", validUntil: "2026-07-31", minOrder: "$500", applicable: "SG + VN contracts" },
  { id: "cp-011", customerCompanyId: "comp-010", name: "VN Domestic 200K VND Off",       discount: "VND 200,000", status: "Unused", validUntil: "2026-06-30", minOrder: "VND 5M", applicable: "VN hotels only" },
];

