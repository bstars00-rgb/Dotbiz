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
  /* Contract currency — fixed at contract signing. Customer is invoiced in this currency. */
  contractCurrency: "USD" | "KRW" | "JPY" | "CNY" | "VND" | "SGD";
  country: string;
}

export const companies: Company[] = [
  {
    id: "comp-001", name: "TravelCo International", businessRegNo: "123-45-67890",
    businessType: "Postpaid", billingType: "POSTPAY",
    address: "123 Gangnam-daero, Seoul", phone: "02-1234-5678", email: "info@travelco.com",
    contractDate: "2024-03-15", ellisSyncDate: "2026-04-15",
    depositType: "Floating Deposit", depositAmount: 50000, settlementCycle: "Monthly", paymentDueDays: 30,
    contractCurrency: "USD", country: "South Korea",
  },
  {
    id: "comp-002", name: "Asia Tours Ltd.", businessRegNo: "234-56-78901",
    businessType: "Prepaid", billingType: "PREPAY",
    address: "456 Teheran-ro, Seoul", phone: "02-2345-6789", email: "info@asiatours.com",
    contractDate: "2024-06-01", ellisSyncDate: "2026-04-15",
    contractCurrency: "USD", country: "South Korea",
  },
  {
    id: "comp-003", name: "Sakura Travel Japan", businessRegNo: "T1234567890123",
    businessType: "Postpaid", billingType: "POSTPAY",
    address: "2-1-1 Nihonbashi, Chuo-ku, Tokyo", phone: "+81-3-1234-5678", email: "info@sakura-travel.co.jp",
    contractDate: "2024-09-01", ellisSyncDate: "2026-04-15",
    depositType: "Bank Guarantee", depositAmount: 100000, settlementCycle: "Monthly", paymentDueDays: 30,
    contractCurrency: "JPY", country: "Japan",
  },
  {
    id: "comp-004", name: "Dragon Holidays (Shanghai)", businessRegNo: "91310000MA1FL12345",
    businessType: "Postpaid", billingType: "POSTPAY",
    address: "1376 Nanjing Xi Lu, Jing'an, Shanghai", phone: "+86-21-5555-1234", email: "contact@dragon-holidays.cn",
    contractDate: "2025-01-15", ellisSyncDate: "2026-04-15",
    depositType: "Guarantee Deposit", depositAmount: 80000, settlementCycle: "Bi-weekly", paymentDueDays: 14,
    contractCurrency: "CNY", country: "China",
  },
  {
    id: "comp-005", name: "Saigon Trips Vietnam", businessRegNo: "0312345678",
    businessType: "Prepaid", billingType: "PREPAY",
    address: "99 Nguyen Hue, District 1, HCMC", phone: "+84-28-3333-5555", email: "hello@saigontrips.vn",
    contractDate: "2025-03-10", ellisSyncDate: "2026-04-15",
    contractCurrency: "USD", country: "Vietnam",
  },
  {
    id: "comp-006", name: "Lion City Travel Pte Ltd", businessRegNo: "201312345K",
    businessType: "Postpaid", billingType: "POSTPAY",
    address: "80 Robinson Road, #10-01, Singapore", phone: "+65-6888-1234", email: "sales@lioncitytravel.sg",
    contractDate: "2024-07-20", ellisSyncDate: "2026-04-15",
    depositType: "Floating Deposit", depositAmount: 60000, settlementCycle: "Monthly", paymentDueDays: 30,
    contractCurrency: "SGD", country: "Singapore",
  },
];

export const currentCompany = companies[0];
