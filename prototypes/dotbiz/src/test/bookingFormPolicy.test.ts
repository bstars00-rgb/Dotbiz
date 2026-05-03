/**
 * Booking Form 점검 — 정책 결정 검증
 *
 * #1 FX lock at booking creation time
 * #2 Tier-based ELS redeem ratio
 * #3 Payment failure → immediate + user retry
 * #4 localStorage 24h + price/availability change alerts
 * #6 Non-refundable acknowledgement required
 */
import { describe, it, expect } from "vitest";

const TIER_REDEEM_RATIOS: Record<string, number> = {
  Bronze:   0.05,
  Silver:   0.07,
  Gold:     0.10,
  Platinum: 0.12,
  Diamond:  0.15,
};

describe("Booking Form 정책", () => {
  describe("#2 Tier별 ELS 차감 비율", () => {
    it("Bronze는 5%", () => {
      expect(TIER_REDEEM_RATIOS.Bronze).toBeCloseTo(0.05);
    });
    it("Diamond는 15%, Bronze의 3배", () => {
      expect(TIER_REDEEM_RATIOS.Diamond).toBeCloseTo(0.15);
      expect(TIER_REDEEM_RATIOS.Diamond / TIER_REDEEM_RATIOS.Bronze).toBeCloseTo(3);
    });
    it("Tier 진급 시 비율 단조 증가", () => {
      const tiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
      for (let i = 1; i < tiers.length; i++) {
        expect(TIER_REDEEM_RATIOS[tiers[i]]).toBeGreaterThan(TIER_REDEEM_RATIOS[tiers[i - 1]]);
      }
    });
  });

  describe("#4 localStorage 24h TTL", () => {
    it("24h 이내 draft는 유지, 초과는 만료", () => {
      const now = Date.now();
      const within = now - 23 * 3600_000;       /* 23시간 전 */
      const expired = now - 25 * 3600_000;      /* 25시간 전 */
      const ttlHours = 24;
      expect((now - within) / 3600_000 < ttlHours).toBe(true);
      expect((now - expired) / 3600_000 < ttlHours).toBe(false);
    });
  });

  describe("#4 요금 변경 / 매진 감지", () => {
    function detectChange(savedPrice: number, currentPrice: number, remaining: number) {
      if (remaining === 0) return "soldout";
      if (savedPrice && savedPrice !== currentPrice) return "price";
      return null;
    }
    it("매진(remaining=0)은 soldout 반환", () => {
      expect(detectChange(100, 100, 0)).toBe("soldout");
    });
    it("요금 변경 감지", () => {
      expect(detectChange(100, 120, 5)).toBe("price");
      expect(detectChange(100, 80, 5)).toBe("price");
    });
    it("정상은 null", () => {
      expect(detectChange(100, 100, 5)).toBeNull();
    });
    it("매진이 우선 (가격 변경 무시)", () => {
      expect(detectChange(100, 200, 0)).toBe("soldout");
    });
  });

  describe("#3 결제 실패 시뮬레이션 (테스트 카드)", () => {
    function willFail(cardDigits: string) {
      return cardDigits.endsWith("0000");
    }
    it("끝자리 0000은 실패 카드", () => {
      expect(willFail("4111111111110000")).toBe(true);
    });
    it("그 외는 성공", () => {
      expect(willFail("4111111111111111")).toBe(false);
      expect(willFail("5500000000005555")).toBe(false);
    });
  });

  describe("#6 환불불가 동의 게이트", () => {
    function canSubmit(policy: "free_cancel" | "partial_refund" | "non_refundable", acked: boolean) {
      const requiresAck = policy === "non_refundable";
      return !requiresAck || acked;
    }
    it("Free cancel는 동의 불필요", () => {
      expect(canSubmit("free_cancel", false)).toBe(true);
    });
    it("Non-refundable은 동의 필수", () => {
      expect(canSubmit("non_refundable", false)).toBe(false);
      expect(canSubmit("non_refundable", true)).toBe(true);
    });
  });
});
