import { describe, it, expect } from "vitest";
import { ohMyHotelEntities, getEntity, type EntityId } from "@/mocks/ohMyHotelEntities";
import { contracts, contractsForCustomer, resolveContract, getContract } from "@/mocks/contracts";
import { invoices, billingDetails } from "@/mocks/settlement";
import { companies } from "@/mocks/companies";

describe("Multi-Entity: OhMyHotel entities", () => {
  it("has all 5 entities", () => {
    expect(ohMyHotelEntities.length).toBe(5);
    const ids = ohMyHotelEntities.map(e => e.id).sort();
    expect(ids).toEqual(["omh-hk", "omh-jp", "omh-kr", "omh-sg", "omh-vn"]);
  });

  it("Singapore is the HQ", () => {
    const hqs = ohMyHotelEntities.filter(e => e.isHQ);
    expect(hqs.length).toBe(1);
    expect(hqs[0].id).toBe("omh-sg");
  });

  it("only SG and VN are contract issuers (current state)", () => {
    const issuers = ohMyHotelEntities.filter(e => e.isContractIssuer).map(e => e.id).sort();
    expect(issuers).toEqual(["omh-sg", "omh-vn"]);
  });

  it("each entity has bank info", () => {
    ohMyHotelEntities.forEach(e => {
      expect(e.bankInfo.bankName).toBeTruthy();
      expect(e.bankInfo.swift).toBeTruthy();
      expect(e.bankInfo.accountNumber).toBeTruthy();
      expect(e.bankInfo.accountHolder).toBeTruthy();
    });
  });

  it("each entity has unique refCodePrefix", () => {
    const prefixes = ohMyHotelEntities.map(e => e.refCodePrefix);
    expect(new Set(prefixes).size).toBe(prefixes.length);
  });

  it("getEntity returns correct entity or throws", () => {
    expect(getEntity("omh-sg").shortName).toBe("OhMyHotel SG");
    expect(getEntity("omh-vn").shortName).toBe("OhMyHotel VN");
    expect(() => getEntity("nonexistent" as EntityId)).toThrow();
  });
});

describe("Multi-Entity: Contracts", () => {
  it("every contract references a real customer and a real entity", () => {
    contracts.forEach(c => {
      const customer = companies.find(co => co.id === c.customerCompanyId);
      const entity = ohMyHotelEntities.find(e => e.id === c.ohmyhotelEntityId);
      expect(customer, `Contract ${c.id} references missing customer ${c.customerCompanyId}`).toBeDefined();
      expect(entity, `Contract ${c.id} references missing entity ${c.ohmyhotelEntityId}`).toBeDefined();
    });
  });

  it("contracts are only issued by entities marked isContractIssuer", () => {
    contracts.forEach(c => {
      const entity = getEntity(c.ohmyhotelEntityId);
      expect(entity.isContractIssuer, `Contract ${c.id} uses non-issuer entity ${c.ohmyhotelEntityId}`).toBe(true);
    });
  });

  it("LOCAL contracts must specify scope_countries", () => {
    contracts.forEach(c => {
      if (c.scope.type === "LOCAL") {
        expect(c.scope.countries.length).toBeGreaterThan(0);
      }
    });
  });

  it("VN entity contracts are LOCAL with VN scope", () => {
    const vnContracts = contracts.filter(c => c.ohmyhotelEntityId === "omh-vn");
    vnContracts.forEach(c => {
      expect(c.scope.type).toBe("LOCAL");
      if (c.scope.type === "LOCAL") {
        expect(c.scope.countries).toContain("VN");
      }
      expect(c.contractCurrency).toBe("VND");
    });
  });

  it("contractsForCustomer returns all of that customer's contracts", () => {
    const gotadiContracts = contractsForCustomer("comp-010");
    expect(gotadiContracts.length).toBe(2);
    const entityIds = gotadiContracts.map(c => c.ohmyhotelEntityId).sort();
    expect(entityIds).toEqual(["omh-sg", "omh-vn"]);
  });

  it("getContract returns null for unknown id", () => {
    expect(getContract("ctr-nonexistent")).toBeNull();
  });
});

describe("Multi-Entity: Booking → Contract routing", () => {
  it("GOTADI VN hotel routes to VN contract", () => {
    const c = resolveContract("comp-010", "VN");
    expect(c?.ohmyhotelEntityId).toBe("omh-vn");
    expect(c?.contractCurrency).toBe("VND");
  });

  it("GOTADI Korean hotel routes to SG contract (international)", () => {
    const c = resolveContract("comp-010", "KR");
    expect(c?.ohmyhotelEntityId).toBe("omh-sg");
    expect(c?.contractCurrency).toBe("USD");
  });

  it("GOTADI Japanese hotel routes to SG contract (no JP local contract)", () => {
    const c = resolveContract("comp-010", "JP");
    expect(c?.ohmyhotelEntityId).toBe("omh-sg");
  });

  it("Vietnam Vacation Co (PREPAY multi) routes VN hotel to VN contract", () => {
    const c = resolveContract("comp-011", "VN");
    expect(c?.ohmyhotelEntityId).toBe("omh-vn");
  });

  it("TravelCo (SG only) Vietnam hotel falls back to SG", () => {
    const c = resolveContract("comp-001", "VN");
    expect(c?.ohmyhotelEntityId).toBe("omh-sg");
  });

  it("returns null when customer has no contracts", () => {
    expect(resolveContract("nonexistent-customer", "VN")).toBeNull();
  });
});

describe("Multi-Entity: Invoices reference contracts", () => {
  it("invoices for multi-contract customers have contractId", () => {
    const multiContractCustomers = ["comp-010", "comp-011"];
    invoices
      .filter(inv => multiContractCustomers.includes(inv.customerCompanyId || ""))
      .forEach(inv => {
        expect(inv.contractId, `Invoice ${inv.invoiceNo} missing contractId`).toBeTruthy();
        expect(inv.ohmyhotelEntityId, `Invoice ${inv.invoiceNo} missing entity`).toBeTruthy();
      });
  });

  it("invoice currency matches contract currency", () => {
    invoices.forEach(inv => {
      if (inv.contractId) {
        const contract = getContract(inv.contractId);
        if (contract) {
          expect(inv.contractCurrency, `Invoice ${inv.invoiceNo} currency mismatch`).toBe(contract.contractCurrency);
        }
      }
    });
  });

  it("invoice ohmyhotelEntityId matches contract entity", () => {
    invoices.forEach(inv => {
      if (inv.contractId) {
        const contract = getContract(inv.contractId);
        if (contract) {
          expect(inv.ohmyhotelEntityId).toBe(contract.ohmyhotelEntityId);
        }
      }
    });
  });

  it("GOTADI has both SG (USD) and VN (VND) invoices", () => {
    const gotadiInvoices = invoices.filter(i => i.customerCompanyId === "comp-010");
    const sgInvoices = gotadiInvoices.filter(i => i.ohmyhotelEntityId === "omh-sg");
    const vnInvoices = gotadiInvoices.filter(i => i.ohmyhotelEntityId === "omh-vn");
    expect(sgInvoices.length).toBeGreaterThan(0);
    expect(vnInvoices.length).toBeGreaterThan(0);
    sgInvoices.forEach(i => expect(i.contractCurrency).toBe("USD"));
    vnInvoices.forEach(i => expect(i.contractCurrency).toBe("VND"));
  });
});

describe("Multi-Entity: Billing Details reference contracts", () => {
  it("multi-contract customer bills carry contractId", () => {
    const gotadiBills = billingDetails.filter(b => b.customerCompanyId === "comp-010");
    gotadiBills.forEach(b => expect(b.contractId).toBeTruthy());
  });

  it("each bill's contract matches the bill's invoice contract", () => {
    billingDetails.forEach(bill => {
      if (!bill.contractId) return;
      const invoice = invoices.find(i => i.invoiceNo === bill.invoiceNo);
      if (invoice && invoice.contractId) {
        expect(invoice.contractId, `Bill ${bill.billId} contract ≠ invoice ${invoice.invoiceNo} contract`).toBe(bill.contractId);
      }
    });
  });
});
