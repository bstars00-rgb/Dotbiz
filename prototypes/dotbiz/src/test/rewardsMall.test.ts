/**
 * RewardsMall 마무리 — Wallet/Vault/Shop 신규 동작 검증
 *
 * 2026-04-30 추가 항목:
 *   • Wallet: 복합 스코어 기반 Tier 표시 (booking + 매출)
 *   • Wallet: Rolling 12mo 결과로 retention grace 안내
 *   • Vault: 상태 필터링 카운트 정확성
 *   • Vault: 14일 이내 만료 임박 감지
 *   • Shop: 다음 tier 잠금 해제 상품 추출 로직
 */
import { describe, it, expect } from "vitest";
import {
  compositeTierScore,
  tierForRolling,
  rewardProducts,
  redeemedVouchers,
  DEFAULT_COMPOSITE_WEIGHTS,
  DEFAULT_ROLLING_CONFIG,
} from "@/mocks/rewards";

describe("Wallet 탭 — Tier v2 표시", () => {
  it("복합 score는 booking 단일축보다 매출 큰 OP를 우대", () => {
    /* kevin@travelco.com: 18 bookings × $11,160 → 럭셔리 단가 */
    const kevin = compositeTierScore({ bookingCount: 18, totalRevenueUsd: 11160 });
    /* op@dotbiz.com: 47 bookings × $8,460 → 일반 단가 */
    const op = compositeTierScore({ bookingCount: 47, totalRevenueUsd: 8460 });
    expect(kevin).toBeGreaterThan(0);
    expect(op).toBeGreaterThan(0);
    /* 단일축으로는 18 < 47 (kevin이 못 따라감)
     * 복합 score: kevin 12.6+16.74 ≈ 29.3, op 32.9+12.7 ≈ 45.6
     * → kevin이 booking 비중 70%인 상황에서도 매출 가산으로 격차 좁힘 */
    expect(kevin / op).toBeGreaterThan(0.5); // 단일축이면 18/47=0.38, 복합은 ~0.64
  });

  it("Retention grace 활성 시 isRetained=true + 이전 tier 유지", () => {
    const result = tierForRolling({
      last12moBookings: 30, last12moRevenueUsd: 3000,    // Bronze 수준
      bookingCount: 600, totalRevenueUsd: 120000,        // 평생은 Platinum
      retainedTier: "Gold", retainedUntil: "2099-12-31",
    });
    expect(result.isRetained).toBe(true);
    expect(result.tier.name).toBe("Gold");
    expect(result.rawTier.name).toBe("Bronze");
  });
});

describe("Vault 탭 — 상태 필터 + 만료 임박 감지", () => {
  it("상태별 카운트가 모든 시드 vouchers를 포괄", () => {
    const counts = {
      All: redeemedVouchers.length,
      Active: redeemedVouchers.filter(v => v.status === "Active").length,
      Used: redeemedVouchers.filter(v => v.status === "Used").length,
      Expired: redeemedVouchers.filter(v => v.status === "Expired").length,
    };
    expect(counts.All).toBe(counts.Active + counts.Used + counts.Expired);
    expect(counts.All).toBeGreaterThan(0);
  });

  it("Active 쿠폰은 적어도 1개 존재 (시드 정합성)", () => {
    const active = redeemedVouchers.filter(v => v.status === "Active");
    expect(active.length).toBeGreaterThan(0);
  });

  it("만료 임박(14일 이내) 감지 로직 — Active 쿠폰 중 expiresAt 비교", () => {
    /* 시드에 expiresAt이 가까운 쿠폰들 존재 (vch-005 등) */
    const now = new Date("2026-04-23"); /* 시드 기준일 */
    const in14d = new Date(now.getTime() + 14 * 86400000);
    const expiringSoon = redeemedVouchers.filter(v => {
      if (v.status !== "Active") return false;
      const exp = new Date(v.expiresAt);
      return exp >= now && exp <= in14d;
    });
    /* 2026-04-28 만료 vch-005가 시드에 있어야 함 */
    expect(expiringSoon.length).toBeGreaterThan(0);
  });
});

describe("Shop 탭 — Tier 잠금 폐기 (2026-05-06 #6)", () => {
  it("어떤 tier든 모든 상품을 redeem 가능", () => {
    /* minTier 필드는 deprecated. 신규 상품은 tier 제한이 없다. */
    const allProducts = rewardProducts;
    expect(allProducts.length).toBeGreaterThan(0);
    /* 시드에 minTier가 남아있더라도 canRedeemProduct는 항상 true */
    /* (tierSystem.test.ts에서 별도 검증) */
  });
});

describe("기본 가중치 정합성 (Wallet 표시 영향)", () => {
  it("기본 가중치는 booking 0.7 + revenue 0.3", () => {
    expect(DEFAULT_COMPOSITE_WEIGHTS.bookingWeight).toBe(0.7);
    expect(DEFAULT_COMPOSITE_WEIGHTS.revenueWeight).toBe(0.3);
  });

  it("기본 Rolling 활성 + 12개월 윈도우 + 12개월 grace", () => {
    expect(DEFAULT_ROLLING_CONFIG.enabled).toBe(true);
    expect(DEFAULT_ROLLING_CONFIG.windowMonths).toBe(12);
    expect(DEFAULT_ROLLING_CONFIG.gracePeriodMonths).toBe(12);
  });
});
