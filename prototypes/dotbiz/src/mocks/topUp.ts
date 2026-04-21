/* Top-Up Deposit Request mock store.
 *
 * SPEC SUMMARY (must be implemented in ELLIS):
 *   When a customer initiates a deposit top-up, DOTBIZ creates a
 *   TopUpRequest record with a unique reference code that the customer
 *   MUST include in the bank wire memo. Once the wire arrives, OhMyHotel
 *   finance (or a future bank-API webhook) matches by ref code and
 *   transitions Pending → Confirmed, applying the amount to the
 *   customer's deposit balance.
 *
 *   See docs/spec/TopUpDeposit.md for the full specification including
 *   API contract, edge cases, and the future Virtual Account option.
 */

export type TopUpStatus =
  | "Pending"        /* Awaiting wire transfer from customer */
  | "Confirmed"      /* Wire received & matched, deposit credited */
  | "Expired"        /* No wire received within 7 days */
  | "Manual Review"  /* Wire received but ref code missing/wrong */
  | "Cancelled";     /* Customer cancelled */

export interface TopUpRequest {
  id: string;
  customerCompanyId: string;
  refCode: string;              /* TUP-YYYYMMDD-XXXX — MUST appear in wire memo */
  requestedAmount: number;
  currency: string;
  requestedAt: string;
  expiresAt: string;            /* requestedAt + 7 days */
  status: TopUpStatus;
  /* Confirmation fields (filled once wire received) */
  confirmedAmount?: number;
  confirmedAt?: string;
  confirmedBy?: string;         /* "BANK_API" or finance staff name */
  bankRef?: string;             /* External wire reference from bank */
  notes?: string;
}

/* Demo seed data */
export const topUpRequests: TopUpRequest[] = [
  {
    id: "tup-001",
    customerCompanyId: "comp-001",
    refCode: "TUP-20260418-A4F7",
    requestedAmount: 20000,
    currency: "USD",
    requestedAt: "2026-04-18 10:30:00",
    expiresAt: "2026-04-25 10:30:00",
    status: "Confirmed",
    confirmedAmount: 20000,
    confirmedAt: "2026-04-19 14:22:08",
    confirmedBy: "Sarah Kim (Finance)",
    bankRef: "Citi/INC/20260419/887234",
  },
  {
    id: "tup-002",
    customerCompanyId: "comp-001",
    refCode: "TUP-20260420-B2E9",
    requestedAmount: 15000,
    currency: "USD",
    requestedAt: "2026-04-20 09:00:00",
    expiresAt: "2026-04-27 09:00:00",
    status: "Pending",
  },
];

/* OhMyHotel banking details — shown in the dialog so customer can wire */
export const ohMyHotelBankInfo = {
  bankName: "Citibank Singapore",
  swift: "CITISGSGXXX",
  accountHolder: "OHMYHOTEL GLOBAL PTE. LTD.",
  accountNumber: "143746003",
  bankAddress: "8 Marina View, #21-00 Asia Square Tower 1, Singapore 018960",
};

/* Utility — generate a fresh ref code */
export function generateRefCode(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TUP-${yyyy}${mm}${dd}-${rand}`;
}
