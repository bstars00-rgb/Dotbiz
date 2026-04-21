# DOTBIZ — Backend Spec Index

Specs for features that **DOTBIZ has** but **ELLIS does not yet implement**. Each doc is a standalone implementation guide for the ELLIS backend team.

## Settlement domain

| Spec | What it covers |
|---|---|
| [MultiEntity.md](./MultiEntity.md) | 5 OhMyHotel legal entities · customer × entity contracts · booking-to-contract routing (VN local vs SG international) |
| [Deposit.md](./Deposit.md) | 6 deposit types · utilization calculation · booking-time enforcement · ledger model |
| [TopUpDeposit.md](./TopUpDeposit.md) | Floating Deposit top-up flow with unique reference code (TUP-{ENTITY}-YYYYMMDD-XXXX) for auto-attribution |
| [DisputeResolution.md](./DisputeResolution.md) | Authority model (customer raises ticket, admin marks disputed) · lifecycle · APIs · notifications |
| [BankReconciliation.md](./BankReconciliation.md) | Backend-only · CSV upload + bank API · subset-sum auto-match algorithm |

## Conventions

- Specs use the same vocabulary as DOTBIZ mock files (`InvoiceWithMatch`, `TopUpRequest`, etc.) so the mapping back to UI is direct.
- Each spec ends with an **Acceptance Criteria** checklist.
- Edge cases are explicit — finance / OP team should be able to reason about them without re-asking product.
- "Out of Scope" sections prevent scope creep during implementation.

## How to use

1. Read the spec end-to-end before starting implementation.
2. The mock data in `prototypes/dotbiz/src/mocks/*.ts` is the visual reference for what customers see.
3. The DOTBIZ UI is the source of truth for user-visible behavior.
4. ELLIS is the source of truth for data persistence + business logic enforcement.
5. New features → write a spec in this folder first, before adding to DOTBIZ UI.
