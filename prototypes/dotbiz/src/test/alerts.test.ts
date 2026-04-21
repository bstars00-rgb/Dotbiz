import { describe, it, expect } from "vitest";
import {
  alerts,
  alertsFor,
  unreadAlertsFor,
  defaultAlertPreferences,
  undisableableAlerts,
  alertTypeMeta,
  type AlertType,
} from "@/mocks/alerts";
import { contractsForCustomer, getCreditLimit } from "@/mocks/contracts";

describe("Alert system", () => {
  it("every alert references a known AlertType with matching meta", () => {
    for (const a of alerts) {
      const meta = alertTypeMeta[a.type];
      expect(meta, `missing meta for ${a.type}`).toBeDefined();
      expect(meta.category).toBe(a.category);
      expect(meta.priority).toBe(a.priority);
    }
  });

  it("unreadAlertsFor excludes readAt and dismissed entries", () => {
    const unread = unreadAlertsFor("comp-001");
    expect(unread.length).toBeGreaterThan(0);
    for (const a of unread) {
      expect(a.readAt).toBeFalsy();
      expect(a.dismissed).toBeFalsy();
      expect(a.customerCompanyId).toBe("comp-001");
    }
  });

  it("alertsFor is sorted most recent first and tenant-isolated", () => {
    const list = alertsFor("comp-001");
    for (let i = 1; i < list.length; i++) {
      expect(list[i - 1].createdAt >= list[i].createdAt).toBe(true);
      expect(list[i].customerCompanyId).toBe("comp-001");
    }
  });

  it("preference defaults cover every AlertType exactly once", () => {
    const types = Object.keys(alertTypeMeta) as AlertType[];
    expect(defaultAlertPreferences).toHaveLength(types.length);
    const covered = new Set(defaultAlertPreferences.map(p => p.type));
    for (const t of types) expect(covered.has(t)).toBe(true);
  });

  it("every undisableable alert has at least one default channel and is enabled", () => {
    for (const t of undisableableAlerts) {
      const pref = defaultAlertPreferences.find(p => p.type === t)!;
      expect(pref, `missing default for ${t}`).toBeDefined();
      expect(pref.enabled).toBe(true);
      expect(pref.channels.length).toBeGreaterThan(0);
    }
  });

  it("P0 SMS alerts include SMS by default (prepay_deadline_dday, credit_critical, booking_cancelled_by_hotel)", () => {
    const withSms: AlertType[] = ["prepay_deadline_dday", "credit_critical", "booking_cancelled_by_hotel"];
    for (const t of withSms) {
      const pref = defaultAlertPreferences.find(p => p.type === t)!;
      expect(pref.channels).toContain("SMS");
    }
  });
});

describe("Credit leverage", () => {
  it("Floating Deposit contract keeps 1:1 credit limit", () => {
    /* GOTADI (comp-010) has ctr-010-sg Floating Deposit */
    const cs = contractsForCustomer("comp-010");
    const floating = cs.find(c => c.depositType === "Floating Deposit");
    expect(floating).toBeDefined();
    if (floating) {
      /* multiplier absent or 1 → limit equals deposit */
      const limit = getCreditLimit(floating);
      expect(limit).toBe(floating.depositAmount);
    }
  });

  it("Collateral-backed contracts apply multiplier (≥ 2× where set)", () => {
    /* Any contract with creditMultiplier > 1 should produce limit = deposit × multiplier */
    let foundLeveraged = false;
    /* Scan across all customers' contracts */
    for (const customerId of ["comp-001", "comp-002", "comp-003", "comp-010", "comp-011"]) {
      for (const c of contractsForCustomer(customerId)) {
        if (c.creditMultiplier && c.creditMultiplier > 1 && !c.creditLimit) {
          foundLeveraged = true;
          const limit = getCreditLimit(c);
          expect(limit).toBeCloseTo((c.depositAmount ?? 0) * c.creditMultiplier, 2);
        }
      }
    }
    expect(foundLeveraged, "expected at least one leveraged contract in mocks").toBe(true);
  });
});
