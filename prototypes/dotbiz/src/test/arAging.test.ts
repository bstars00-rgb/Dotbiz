/**
 * 결정 #5 — AR Aging Report 검증
 *
 * 회계 인식: Cash basis (입금 시점)
 * 부채 인식: 회계팀 검토 후 (90+ days 손상 검토 / 분쟁 결과)
 * 분쟁 중인 건: aging과 별도 분류
 */
import { describe, it, expect } from "vitest";
import {
  bucketFor, arAgingForCompany, arSummaryForCompany,
} from "@/mocks/settlement";

describe("결정 #5 — AR Aging", () => {
  describe("bucketFor 분류 로직", () => {
    it("미도래는 Current", () => {
      expect(bucketFor(-5, false)).toBe("Current");
      expect(bucketFor(-30, false)).toBe("Current");
    });
    it("1-30일은 1-30 bucket", () => {
      expect(bucketFor(0, false)).toBe("1-30");
      expect(bucketFor(15, false)).toBe("1-30");
      expect(bucketFor(30, false)).toBe("1-30");
    });
    it("31-60일은 31-60", () => {
      expect(bucketFor(31, false)).toBe("31-60");
      expect(bucketFor(60, false)).toBe("31-60");
    });
    it("61-90일은 61-90", () => {
      expect(bucketFor(61, false)).toBe("61-90");
      expect(bucketFor(90, false)).toBe("61-90");
    });
    it("90+ 일은 악성 미수금 bucket", () => {
      expect(bucketFor(91, false)).toBe("90+");
      expect(bucketFor(365, false)).toBe("90+");
    });
    it("분쟁 중이면 daysOverdue와 무관하게 Disputed", () => {
      expect(bucketFor(-10, true)).toBe("Disputed");
      expect(bucketFor(0, true)).toBe("Disputed");
      expect(bucketFor(120, true)).toBe("Disputed");
    });
  });

  describe("arAgingForCompany — TravelCo (comp-001)", () => {
    it("미수금 invoice가 1건 이상 분류됨", () => {
      const entries = arAgingForCompany("comp-001", "2026-04-30");
      expect(entries.length).toBeGreaterThan(0);
      entries.forEach(e => {
        expect(["Current", "1-30", "31-60", "61-90", "90+", "Disputed"]).toContain(e.bucket);
      });
    });

    it("isBadDebt = (90+ days && !hasDispute)", () => {
      const entries = arAgingForCompany("comp-001", "2026-04-30");
      entries.forEach(e => {
        const expected = e.daysOverdue > 90 && !e.hasDispute;
        expect(e.isBadDebt).toBe(expected);
      });
    });
  });

  describe("arSummaryForCompany — 집계", () => {
    it("총 미수금 = 모든 bucket 합", () => {
      const summary = arSummaryForCompany("comp-001", "2026-04-30");
      const sum = Object.values(summary.byBucket).reduce((s, v) => s + v.amount, 0);
      expect(Math.abs(summary.total - sum)).toBeLessThan(0.01);
    });

    it("badDebtAmount는 90+ bucket에 포함되지만 Disputed와 별개", () => {
      const summary = arSummaryForCompany("comp-001", "2026-04-30");
      /* 악성 미수금은 90+ bucket의 amount보다 크거나 같지 않음 (분쟁 제외) */
      expect(summary.badDebtAmount).toBeLessThanOrEqual(summary.byBucket["90+"].amount);
    });

    it("disputedAmount는 Disputed bucket과 일치", () => {
      const summary = arSummaryForCompany("comp-001", "2026-04-30");
      expect(summary.disputedAmount).toBe(summary.byBucket["Disputed"].amount);
    });

    it("회사가 다르면 미수금 분리", () => {
      const tc = arSummaryForCompany("comp-001", "2026-04-30");
      const at = arSummaryForCompany("comp-002", "2026-04-30");
      /* 둘 다 분리된 회사 */
      expect(tc.total).not.toBe(at.total);
    });
  });
});
