/* ── Sub-accounts ── */
export interface SubAccount {
  id: string;
  name: string;
  email: string;
  department: string;
  role: "OP" | "Manager" | "Viewer";
  status: "Active" | "Pending" | "Deactivated";
  createdDate: string;
}

export const subAccounts: SubAccount[] = [
  { id: "sub-001", name: "Sarah Kim", email: "sarah@ohmyhotel.com", department: "Sales - Korea", role: "OP", status: "Active", createdDate: "2025-08-15" },
  { id: "sub-002", name: "Michael Lee", email: "michael@ohmyhotel.com", department: "Sales - Korea", role: "OP", status: "Active", createdDate: "2025-09-01" },
  { id: "sub-003", name: "Emily Chen", email: "emily@ohmyhotel.com", department: "Sales - China", role: "OP", status: "Active", createdDate: "2025-10-10" },
  { id: "sub-004", name: "Tanaka Yuki", email: "tanaka@ohmyhotel.com", department: "Sales - Japan", role: "OP", status: "Active", createdDate: "2025-11-20" },
  { id: "sub-005", name: "David Park", email: "david@ohmyhotel.com", department: "Operations", role: "Manager", status: "Active", createdDate: "2025-06-01" },
  { id: "sub-006", name: "Lisa Wang", email: "lisa@ohmyhotel.com", department: "Sales - SEA", role: "OP", status: "Pending", createdDate: "2026-03-28" },
  { id: "sub-007", name: "Tom Wilson", email: "tom@ohmyhotel.com", department: "Finance", role: "Viewer", status: "Deactivated", createdDate: "2025-04-15" },
  { id: "sub-008", name: "Nguyen Mai", email: "mai@ohmyhotel.com", department: "Sales - SEA", role: "OP", status: "Active", createdDate: "2026-01-10" },
];

/* ── Departments ── */
export interface Department {
  id: string;
  name: string;
  description: string;
  manager: string;
  memberCount: number;
  createdDate: string;
}

export const departments: Department[] = [
  { id: "dept-001", name: "Sales - Korea", description: "Korean domestic and inbound market sales", manager: "James Park", memberCount: 3, createdDate: "2025-06-01" },
  { id: "dept-002", name: "Sales - Japan", description: "Japanese market hotel sales", manager: "David Park", memberCount: 2, createdDate: "2025-06-01" },
  { id: "dept-003", name: "Sales - China", description: "Greater China market including HK, Taiwan", manager: "Emily Chen", memberCount: 2, createdDate: "2025-08-01" },
  { id: "dept-004", name: "Sales - SEA", description: "Southeast Asia market (Thailand, Vietnam, Singapore)", manager: "David Park", memberCount: 2, createdDate: "2025-10-01" },
  { id: "dept-005", name: "Operations", description: "Booking operations and customer support", manager: "David Park", memberCount: 1, createdDate: "2025-06-01" },
  { id: "dept-006", name: "Finance", description: "Billing, settlement, and financial reporting", manager: "James Park", memberCount: 1, createdDate: "2025-06-01" },
];

/* ── Balance Transactions ── */
export interface BalanceTransaction {
  id: string;
  date: string;
  type: "Credit Increase" | "Pay the booking" | "Refund" | "Adjustment" | "Deferred Credit";
  productType: string;
  amount: number;
  balance: number;
  user: string;
  remarks: string;
}

export const balanceTransactions: BalanceTransaction[] = [
  { id: "bt-001", date: "2026-04-10", type: "Pay the booking", productType: "Hotel", amount: -270, balance: 25130, user: "Sarah Kim", remarks: "ELS-2026-00248 Novotel Shanghai" },
  { id: "bt-002", date: "2026-04-08", type: "Pay the booking", productType: "Hotel", amount: -1650, balance: 25400, user: "Michael Lee", remarks: "ELS-2026-00240 Raffles Singapore" },
  { id: "bt-003", date: "2026-04-05", type: "Refund", productType: "Hotel", amount: 260, balance: 27050, user: "System", remarks: "ELS-2026-00231 Park Hyatt Busan cancellation refund" },
  { id: "bt-004", date: "2026-04-03", type: "Pay the booking", productType: "Hotel", amount: -2900, balance: 26790, user: "Sarah Kim", remarks: "ELS-2026-00212 Four Seasons Bali" },
  { id: "bt-005", date: "2026-04-01", type: "Credit Increase", productType: "Deposit", amount: 10000, balance: 29690, user: "James Park", remarks: "Monthly credit top-up" },
  { id: "bt-006", date: "2026-03-30", type: "Pay the booking", productType: "Hotel", amount: -840, balance: 19690, user: "Emily Chen", remarks: "ELS-2026-00191 Marina Bay Sands" },
  { id: "bt-007", date: "2026-03-28", type: "Pay the booking", productType: "Hotel", amount: -1140, balance: 20530, user: "Tanaka Yuki", remarks: "ELS-2026-00183 Peninsula Shanghai" },
  { id: "bt-008", date: "2026-03-25", type: "Deferred Credit", productType: "Credit Line", amount: 5000, balance: 21670, user: "James Park", remarks: "Deferred credit allocation" },
  { id: "bt-009", date: "2026-03-20", type: "Pay the booking", productType: "Hotel", amount: -840, balance: 16670, user: "Sarah Kim", remarks: "ELS-2026-00142 Grand Hyatt Seoul" },
  { id: "bt-010", date: "2026-03-15", type: "Credit Increase", productType: "Deposit", amount: 5000, balance: 17510, user: "James Park", remarks: "Wire transfer received" },
];

export const creditSummary = {
  creditBalance: 25400,
  deferredCreditBalance: 50000,
  deferredCreditUsed: 18600,
};

/* ── Voucher Settings ── */
export const voucherSettings = {
  companyName: "OHMYHOTEL & CO.",
  phone: "+82-2-733-0550",
  email: "booking@ohmyhotel.com",
  qq: "",
  address: "6th floor, GT Dongdaemun Building, 328 Jong-ro, Jongno-gu, Seoul",
  logoUrl: "",
  enabled: true,
  applyScope: "all" as "all" | "manual",
};
