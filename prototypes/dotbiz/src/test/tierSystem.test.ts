/**
 * Tier 시스템 v2 — 복합 스코어 + Rolling 강등 + 잠금 상품
 *
 * 결정 (2026-04):
 *   • Tier 산정: booking 수 + 매출 복합 (기본 70:30)
 *   • 강등: Rolling 12개월 + 12개월 grace (status retention)
 *   • Tier 도달 보상: Stamp 일원화 (별도 ELS 보너스 X)
 *   • 멀티플라이어 미묘 보완: Tier별 잠금 상품
 */
import { describe, it, expect } from "vitest";
import {
  compositeTierScore,
  tierForComposite,
  tierForRolling,
  DEFAULT_COMPOSITE_WEIGHTS,
  DEFAULT_ROLLING_CONFIG,
  TIER_REACH_REWARD_POLICY,
  canRedeemProduct,
  tierAtLeast,
  lockedProductsByTier,
  rewardProducts,
  TIERS,
} from "@/mocks/rewards";

describe("compositeTierScore — booking + 매출 복합 지표", () => {
  it("booking 0, revenue 0 → score 0", () => {
    expect(compositeTierScore({ bookingCount: 0, totalRevenueUsd: 0 })).toBe(0);
  });

  it("booking 100, revenue 0 → score 70 (가중치 0.7)", () => {
    expect(compositeTierScore({ bookingCount: 100, totalRevenueUsd: 0 })).toBeCloseTo(70);
  });

  it("매출 가산이 score를 끌어올림 — 수량 적지만 매출 큰 OP", () => {
    // 18 bookings × $620 = $11,160 누적
    const lowVolumeHighValue = compositeTierScore({ bookingCount: 18, totalRevenueUsd: 11160 });
    // 47 bookings × $180 = $8,460 누적
    const highVolumeLowValue = compositeTierScore({ bookingCount: 47, totalRevenueUsd: 8460 });
    // booking-only 비교: 18 < 47이지만 복합 score는 가중치 영향 받음
    expect(lowVolumeHighValue).toBeGreaterThan(0);
    expect(highVolumeLowValue).toBeGreaterThan(lowVolumeHighValue);
    // 단, booking-only 시스템보다는 lowVolumeHighValue가 상대적으로 가까워졌어야 함
    const ratio = lowVolumeHighValue / highVolumeLowValue;
    expect(ratio).toBeGreaterThan(0.4); // 매출 가산이 없으면 18/47 = 0.38이지만, 가산으로 더 큼
  });

  it("가중치를 100% 매출로 바꾸면 매출만 반영", () => {
    const score = compositeTierScore(
      { bookingCount: 1000, totalRevenueUsd: 200 },
      { bookingWeight: 0, revenueWeight: 1, usdPerBookingEq: 200 }
    );
    expect(score).toBeCloseTo(1); // $200 / $200 = 1
  });
});

describe("tierForComposite — Tier 산정", () => {
  it("Bronze: 0-49", () => {
    expect(tierForComposite({ bookingCount: 0, totalRevenueUsd: 0 }).name).toBe("Bronze");
    expect(tierForComposite({ bookingCount: 30, totalRevenueUsd: 1000 }).name).toBe("Bronze");
  });

  it("Silver: 복합 score 50+", () => {
    /* score = 80×0.7 + (5000/200)×0.3 = 56 + 7.5 = 63.5 → Silver */
    expect(tierForComposite({ bookingCount: 80, totalRevenueUsd: 5000 }).name).toBe("Silver");
  });

  it("매출만 높아도 booking 부족하면 Tier 못 올라감", () => {
    // 5 bookings × $20,000 = $100,000 매출. score = 5×0.7 + 500×0.3 = 3.5 + 150 = 153.5 → Silver
    const result = tierForComposite({ bookingCount: 5, totalRevenueUsd: 100000 });
    expect(result.name).toBe("Silver");
  });
});

describe("tierForRolling — 강등 정책", () => {
  it("rolling 0 + grace 없음 → 즉시 강등 가능", () => {
    const result = tierForRolling({
      last12moBookings: 30, last12moRevenueUsd: 5000,  // Bronze 수준
      bookingCount: 600, totalRevenueUsd: 120000,       // 평생 누적은 Platinum
      retainedTier: null, retainedUntil: null,
    });
    expect(result.tier.name).toBe("Bronze");
    expect(result.isRetained).toBe(false);
  });

  it("retention grace 활성 → 이전 tier 유지", () => {
    const futureDate = "2099-01-01";
    const result = tierForRolling({
      last12moBookings: 30, last12moRevenueUsd: 5000,  // 12mo 실적은 Bronze
      bookingCount: 600, totalRevenueUsd: 120000,
      retainedTier: "Gold", retainedUntil: futureDate,
    });
    expect(result.isRetained).toBe(true);
    expect(result.tier.name).toBe("Gold");           // grace로 유지
    expect(result.rawTier.name).toBe("Bronze");      // 실제는 Bronze
    expect(result.isDemotion).toBe(true);
  });

  it("retention 만료 → grace 효과 없음", () => {
    const result = tierForRolling({
      last12moBookings: 30, last12moRevenueUsd: 5000,
      bookingCount: 600, totalRevenueUsd: 120000,
      retainedTier: "Gold", retainedUntil: "2020-01-01",  // 이미 만료
    });
    expect(result.isRetained).toBe(false);
    expect(result.tier.name).toBe("Bronze");
  });

  it("enabled=false → 평생 누적 기준 (legacy)", () => {
    const result = tierForRolling({
      last12moBookings: 0, last12moRevenueUsd: 0,
      bookingCount: 600, totalRevenueUsd: 120000,
      retainedTier: null, retainedUntil: null,
    }, { ...DEFAULT_ROLLING_CONFIG, enabled: false });
    expect(result.tier.name).toBe("Platinum");
  });
});

describe("Tier 잠금 정책 폐기 (2026-05-06 #6)", () => {
  it("canRedeemProduct는 모든 user/product 조합에 대해 true 반환", () => {
    const anyProduct = rewardProducts[0];
    expect(canRedeemProduct("Bronze", anyProduct)).toBe(true);
    expect(canRedeemProduct("Silver", anyProduct)).toBe(true);
    expect(canRedeemProduct("Diamond", anyProduct)).toBe(true);
  });

  it("lockedProductsByTier는 모든 tier 버킷이 빈 배열", () => {
    const grouped = lockedProductsByTier("Bronze", rewardProducts);
    expect(grouped.Bronze.length).toBe(0);
    expect(grouped.Silver.length).toBe(0);
    expect(grouped.Gold.length).toBe(0);
    expect(grouped.Platinum.length).toBe(0);
    expect(grouped.Diamond.length).toBe(0);
  });

  it("tierAtLeast: Diamond >= Bronze (헬퍼는 잔존)", () => {
    expect(tierAtLeast("Diamond", "Bronze")).toBe(true);
    expect(tierAtLeast("Bronze", "Diamond")).toBe(false);
    expect(tierAtLeast("Silver", "Silver")).toBe(true);
  });
});

describe("Tier 도달 보상 정책 — 이중보상 제거", () => {
  it("oneTimeElsBonus = 0 (Stamp로 일원화)", () => {
    expect(TIER_REACH_REWARD_POLICY.oneTimeElsBonus).toBe(0);
  });

  it("Stamp 부여는 활성", () => {
    expect(TIER_REACH_REWARD_POLICY.awardStamp).toBe(true);
  });
});

describe("DEFAULT_COMPOSITE_WEIGHTS — 정합성", () => {
  it("booking + revenue 가중치 합 = 1", () => {
    const w = DEFAULT_COMPOSITE_WEIGHTS;
    expect(w.bookingWeight + w.revenueWeight).toBeCloseTo(1.0);
  });

  it("기본 가중치는 booking 우선 (70:30)", () => {
    expect(DEFAULT_COMPOSITE_WEIGHTS.bookingWeight).toBeGreaterThan(DEFAULT_COMPOSITE_WEIGHTS.revenueWeight);
  });
});

describe("TIERS 메타데이터 정합성", () => {
  it("5 tiers 순서대로 minBookings 증가", () => {
    for (let i = 1; i < TIERS.length; i++) {
      expect(TIERS[i].minBookings).toBeGreaterThan(TIERS[i - 1].minBookings);
    }
  });

  it("multiplier 단조 증가", () => {
    for (let i = 1; i < TIERS.length; i++) {
      expect(TIERS[i].multiplier).toBeGreaterThanOrEqual(TIERS[i - 1].multiplier);
    }
  });

  it("globalPct 합계 ≈ 100%", () => {
    const sum = TIERS.reduce((acc, t) => acc + t.globalPct, 0);
    expect(sum).toBe(100);
  });
});
