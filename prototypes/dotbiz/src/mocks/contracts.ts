import type { EntityId } from "./ohMyHotelEntities";
import type { BillingType, DepositType, SettlementCycle } from "./companies";

/* Customer ↔ OhMyHotel Entity contract.
 *
 * A customer may have multiple contracts (one per relevant entity).
 * Booking → contract routing:
 *   - If hotel country matches a LOCAL contract's scope → that contract
 *   - Otherwise → INTERNATIONAL contract (typically OhMyHotel SG)
 */

export type ContractScope =
  | { type: "INTERNATIONAL" }                            /* catch-all (typically SG) */
  | { type: "LOCAL"; countries: string[] };              /* domestic-only (e.g. VN→VN) */

export interface Contract {
  id: string;
  customerCompanyId: string;
  ohmyhotelEntityId: EntityId;
  billingType: BillingType;
  contractCurrency: "USD" | "KRW" | "JPY" | "CNY" | "VND" | "SGD" | "HKD";
  settlementCycle?: SettlementCycle;
  paymentDueDays?: number;
  depositType: DepositType;
  depositAmount?: number;
  scope: ContractScope;
  contractDate: string;
  /* Display label for UI dropdown — e.g. "OhMyHotel Vietnam · VND · Bi-weekly" */
  label?: string;
}

export const contracts: Contract[] = [
  /* ── Existing customers (single contract, all via SG) ── */
  {
    id: "ctr-001-sg", customerCompanyId: "comp-001", ohmyhotelEntityId: "omh-sg",
    billingType: "POSTPAY", contractCurrency: "USD",
    settlementCycle: "Bi-weekly", paymentDueDays: 14,
    depositType: "Floating Deposit", depositAmount: 50000,
    scope: { type: "INTERNATIONAL" },
    contractDate: "2024-03-15",
  },
  {
    id: "ctr-002-sg", customerCompanyId: "comp-002", ohmyhotelEntityId: "omh-sg",
    billingType: "PREPAY", contractCurrency: "USD",
    depositType: "No Deposit",
    scope: { type: "INTERNATIONAL" },
    contractDate: "2024-06-01",
  },
  {
    id: "ctr-003-sg", customerCompanyId: "comp-003", ohmyhotelEntityId: "omh-sg",
    billingType: "POSTPAY", contractCurrency: "JPY",
    settlementCycle: "Bi-weekly", paymentDueDays: 14,
    depositType: "Bank Guarantee", depositAmount: 10000000,
    scope: { type: "INTERNATIONAL" },
    contractDate: "2024-09-01",
  },
  {
    id: "ctr-004-sg", customerCompanyId: "comp-004", ohmyhotelEntityId: "omh-sg",
    billingType: "POSTPAY", contractCurrency: "CNY",
    settlementCycle: "Bi-weekly", paymentDueDays: 14,
    depositType: "Guarantee Deposit", depositAmount: 80000,
    scope: { type: "INTERNATIONAL" },
    contractDate: "2025-01-15",
  },
  {
    id: "ctr-005-sg", customerCompanyId: "comp-005", ohmyhotelEntityId: "omh-sg",
    billingType: "PREPAY", contractCurrency: "USD",
    depositType: "No Deposit",
    scope: { type: "INTERNATIONAL" },
    contractDate: "2025-03-10",
  },
  {
    id: "ctr-006-sg", customerCompanyId: "comp-006", ohmyhotelEntityId: "omh-sg",
    billingType: "POSTPAY", contractCurrency: "SGD",
    settlementCycle: "Bi-weekly", paymentDueDays: 14,
    depositType: "Floating Deposit", depositAmount: 60000,
    scope: { type: "INTERNATIONAL" },
    contractDate: "2024-07-20",
  },
  /* ── NEW multi-entity customers (SG + VN contracts) ── */

  /* GOTADI — Vietnamese POSTPAY customer with BOTH SG and VN contracts.
   * SG contract: all non-VN hotels (USD).
   * VN contract: Vietnam-local hotels only (VND, domestic VAT). */
  {
    id: "ctr-010-sg", customerCompanyId: "comp-010", ohmyhotelEntityId: "omh-sg",
    billingType: "POSTPAY", contractCurrency: "USD",
    settlementCycle: "Bi-weekly", paymentDueDays: 14,
    depositType: "Floating Deposit", depositAmount: 40000,
    scope: { type: "INTERNATIONAL" },
    contractDate: "2025-08-01",
    label: "OhMyHotel Singapore · USD · International",
  },
  {
    id: "ctr-010-vn", customerCompanyId: "comp-010", ohmyhotelEntityId: "omh-vn",
    billingType: "POSTPAY", contractCurrency: "VND",
    settlementCycle: "Bi-weekly", paymentDueDays: 14,
    depositType: "Floating Deposit", depositAmount: 1_000_000_000,  /* 1 billion VND ≈ USD 40k */
    scope: { type: "LOCAL", countries: ["VN"] },
    contractDate: "2025-08-01",
    label: "OhMyHotel Vietnam · VND · Vietnam hotels",
  },

  /* Vietnam Vacation Co — Vietnamese PREPAY customer with BOTH contracts */
  {
    id: "ctr-011-sg", customerCompanyId: "comp-011", ohmyhotelEntityId: "omh-sg",
    billingType: "PREPAY", contractCurrency: "USD",
    depositType: "No Deposit",
    scope: { type: "INTERNATIONAL" },
    contractDate: "2025-11-15",
    label: "OhMyHotel Singapore · USD · International",
  },
  {
    id: "ctr-011-vn", customerCompanyId: "comp-011", ohmyhotelEntityId: "omh-vn",
    billingType: "PREPAY", contractCurrency: "VND",
    depositType: "No Deposit",
    scope: { type: "LOCAL", countries: ["VN"] },
    contractDate: "2025-11-15",
    label: "OhMyHotel Vietnam · VND · Vietnam hotels",
  },
];

/* Helper: resolve which contract applies to a booking given the hotel country. */
export function resolveContract(customerCompanyId: string, hotelCountry: string): Contract | null {
  const mine = contracts.filter(c => c.customerCompanyId === customerCompanyId);
  if (mine.length === 0) return null;

  /* 1) LOCAL match on hotel country */
  const local = mine.find(c =>
    c.scope.type === "LOCAL" &&
    c.scope.countries.some(cn => cn === hotelCountry || cn === hotelCountry.slice(0, 2))
  );
  if (local) return local;

  /* 2) Fallback to INTERNATIONAL */
  return mine.find(c => c.scope.type === "INTERNATIONAL") || mine[0];
}

/* Helper: get contracts for a customer */
export function contractsForCustomer(customerCompanyId: string): Contract[] {
  return contracts.filter(c => c.customerCompanyId === customerCompanyId);
}

/* Helper: get contract by id */
export function getContract(contractId: string): Contract | null {
  return contracts.find(c => c.id === contractId) || null;
}
