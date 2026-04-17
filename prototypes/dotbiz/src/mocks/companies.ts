export type BillingType = "PREPAY" | "POSTPAY";
export type DepositType = "Credit by Company" | "Floating Deposit" | "Guarantee Deposit" | "Guarantee Insurance" | "Bank Guarantee" | "No Deposit";
export type SettlementCycle = "Monthly" | "Bi-weekly" | "Weekly";

export interface Company {
  id: string;
  name: string;
  businessRegNo: string;
  businessType: "Prepaid" | "Postpaid";
  billingType: BillingType;
  address: string;
  phone: string;
  email: string;
  contractDate: string;
  /* POSTPAY only */
  depositType?: DepositType;
  depositAmount?: number;
  settlementCycle?: SettlementCycle;
  paymentDueDays?: number;
  /* ELLIS sync info */
  ellisSyncDate: string;
}

export const companies: Company[] = [
  {
    id: "comp-001", name: "TravelCo International", businessRegNo: "123-45-67890",
    businessType: "Postpaid", billingType: "POSTPAY",
    address: "123 Gangnam-daero, Seoul", phone: "02-1234-5678", email: "info@travelco.com",
    contractDate: "2024-03-15", ellisSyncDate: "2026-04-15",
    depositType: "Floating Deposit", depositAmount: 50000, settlementCycle: "Monthly", paymentDueDays: 30,
  },
  {
    id: "comp-002", name: "Asia Tours Ltd.", businessRegNo: "234-56-78901",
    businessType: "Prepaid", billingType: "PREPAY",
    address: "456 Teheran-ro, Seoul", phone: "02-2345-6789", email: "info@asiatours.com",
    contractDate: "2024-06-01", ellisSyncDate: "2026-04-15",
  },
];

export const currentCompany = companies[0];
