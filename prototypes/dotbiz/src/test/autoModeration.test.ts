/**
 * 자동 모더레이션 엔진 단위 테스트
 *
 * 결정 트리 검증:
 *   • Auto-Reject: 스팸 패턴, 반복어, 악의적 1점 리뷰
 *   • Auto-Approve: 품질 게이트 모두 통과
 *   • Manual Review: 경계선 케이스
 *
 * 규칙 튜닝 효과도 검증 (임계값 변경 시 결정 변화).
 */
import { describe, it, expect } from "vitest";
import {
  autoModerateDecision,
  autoModerationStats,
  DEFAULT_AUTO_MOD_RULES,
  type AutoModerationRules,
  type HotelReview,
} from "@/mocks/reviews";

/** 테스트용 리뷰 팩토리 — 필수 필드만 채우고 나머지는 override */
function makeReview(overrides: Partial<Pick<HotelReview, "body" | "tips" | "verifiedStay" | "photos" | "rating">>): Pick<HotelReview, "body" | "tips" | "verifiedStay" | "photos" | "rating"> {
  return {
    body: "A".repeat(200),
    tips: ["tip one with enough detail", "tip two with enough detail"],
    verifiedStay: true,
    photos: [],
    rating: 5,
    ...overrides,
  };
}

describe("autoModerateDecision — Auto-Reject", () => {
  it("스팸 패턴 'click here'를 감지하면 Auto-Reject", () => {
    const result = autoModerateDecision(makeReview({
      body: "Great hotel, click here for discount: www.spam.com",
    }));
    expect(result.decision).toBe("AutoReject");
    expect(result.confidence).toBeGreaterThan(0.9);
    expect(result.failedRules).toContain("spam-phrases");
  });

  it("반복어 ('terrible terrible terrible')를 감지하면 Auto-Reject", () => {
    const result = autoModerateDecision(makeReview({
      body: "This hotel is terrible terrible terrible, so terrible you would not believe how terrible terrible terrible it was.",
      rating: 2,
    }));
    expect(result.decision).toBe("AutoReject");
    expect(result.failedRules).toContain("repeated-words");
  });

  it("홍보성 'promo code' 감지하면 Auto-Reject", () => {
    const result = autoModerateDecision(makeReview({
      body: "Use promo code DISCOUNT for 20% off. Amazing hotel.",
    }));
    expect(result.decision).toBe("AutoReject");
    expect(result.reasons[0]).toMatch(/스팸|홍보/);
  });

  it("1점 별점 + 짧은 본문 + 미검증 투숙 = Auto-Reject (악의적 리뷰)", () => {
    const result = autoModerateDecision(makeReview({
      rating: 1,
      body: "Really bad experience at this hotel. Will not return.",
      verifiedStay: false,
    }));
    expect(result.decision).toBe("AutoReject");
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    expect(result.reasons[0]).toMatch(/악의적|1점/);
  });
});

describe("autoModerateDecision — Auto-Approve", () => {
  it("모든 품질 게이트 통과 (150+ 본문, 2+ 팁, 검증 투숙, 플래그 없음) = Auto-Approve", () => {
    const result = autoModerateDecision(makeReview({
      body: "This is a thoroughly detailed hotel review that easily exceeds the 150 character minimum threshold set by the default moderation rules for auto-approval purposes.",
      tips: ["Request a high floor", "Avoid the street-side rooms"],
      verifiedStay: true,
      photos: [],
      rating: 4,
    }));
    expect(result.decision).toBe("AutoApprove");
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    expect(result.failedRules).toEqual([]);
  });

  it("Strict 모드에서 사진 없으면 Auto-Approve 불가 (Manual로)", () => {
    const strictRules: AutoModerationRules = {
      ...DEFAULT_AUTO_MOD_RULES,
      strictMode: true,
    };
    const result = autoModerateDecision(
      makeReview({
        body: "A".repeat(200),
        tips: ["tip one with enough detail", "tip two with enough detail"],
        photos: [],
      }),
      strictRules
    );
    expect(result.decision).toBe("ManualReview");
    expect(result.reasons.join()).toMatch(/Strict|사진/);
  });

  it("Strict 모드에서 사진 있으면 Auto-Approve 가능", () => {
    const strictRules: AutoModerationRules = {
      ...DEFAULT_AUTO_MOD_RULES,
      strictMode: true,
    };
    const result = autoModerateDecision(
      makeReview({
        body: "A".repeat(200),
        tips: ["tip one with enough detail", "tip two with enough detail"],
        photos: ["data:image/png;base64,iVBORw..."],
      }),
      strictRules
    );
    expect(result.decision).toBe("AutoApprove");
  });
});

describe("autoModerateDecision — Manual Review", () => {
  it("본문 짧음 (50자) + 검증 투숙 = Manual Review", () => {
    const result = autoModerateDecision(makeReview({
      body: "Short body here, about fifty characters long.",
      verifiedStay: true,
    }));
    expect(result.decision).toBe("ManualReview");
    expect(result.failedRules.join()).toMatch(/본문/);
  });

  it("본문 충분 + 미검증 투숙 = Manual Review", () => {
    const result = autoModerateDecision(makeReview({
      body: "A".repeat(200),
      verifiedStay: false,
      rating: 4,
    }));
    expect(result.decision).toBe("ManualReview");
  });

  it("팁 없음 + 본문 충분 + 검증 = Manual Review (기본 규칙 minTips=2)", () => {
    const result = autoModerateDecision(makeReview({
      body: "A".repeat(200),
      tips: [],
    }));
    expect(result.decision).toBe("ManualReview");
  });
});

describe("autoModerateDecision — 규칙 튜닝 효과", () => {
  it("minBody를 100으로 낮추면 100자 리뷰도 자동 승인", () => {
    const lenientRules: AutoModerationRules = {
      ...DEFAULT_AUTO_MOD_RULES,
      autoApproveMinBody: 100,
    };
    const review = makeReview({
      body: "A".repeat(120),
      tips: ["tip one with enough detail", "tip two with enough detail"],
      verifiedStay: true,
    });
    /* 기본 150자 규칙 = Manual */
    expect(autoModerateDecision(review).decision).toBe("ManualReview");
    /* 100자로 완화하면 = AutoApprove */
    expect(autoModerateDecision(review, lenientRules).decision).toBe("AutoApprove");
  });

  it("minTips를 0으로 낮추면 팁 없어도 자동 승인", () => {
    const lenientRules: AutoModerationRules = {
      ...DEFAULT_AUTO_MOD_RULES,
      autoApproveMinTips: 0,
    };
    const review = makeReview({
      body: "A".repeat(200),
      tips: [],
      verifiedStay: true,
    });
    expect(autoModerateDecision(review).decision).toBe("ManualReview");
    expect(autoModerateDecision(review, lenientRules).decision).toBe("AutoApprove");
  });

  it("autoApproveRequireVerified=false면 미검증 투숙도 자동 승인", () => {
    const relaxedRules: AutoModerationRules = {
      ...DEFAULT_AUTO_MOD_RULES,
      autoApproveRequireVerified: false,
    };
    const review = makeReview({
      body: "A".repeat(200),
      tips: ["tip one with enough detail", "tip two with enough detail"],
      verifiedStay: false,
      rating: 4,
    });
    expect(autoModerateDecision(review).decision).toBe("ManualReview");
    expect(autoModerateDecision(review, relaxedRules).decision).toBe("AutoApprove");
  });
});

describe("autoModerationStats — 집계", () => {
  it("빈 배열은 0% 처리율", () => {
    const stats = autoModerationStats([]);
    expect(stats.total).toBe(0);
    expect(stats.autoHandledPct).toBe(0);
  });

  it("전체 AutoApprove면 100% 자동 처리", () => {
    const reviews = Array.from({ length: 3 }, () => ({
      ...makeReview({}),
      id: "r",
      hotelId: "h",
      reviewerEmail: "r@x",
      reviewerName: "R",
      reviewerCompany: "C",
      reviewerCountry: "🇰🇷 Korea",
      title: "t",
      helpfulVotes: 0,
      submittedAt: "",
      status: "Pending" as const,
      elsAwarded: 0,
      syndicationConsent: true,
    }));
    const stats = autoModerationStats(reviews);
    expect(stats.autoApprove).toBe(3);
    expect(stats.autoHandledPct).toBe(100);
    expect(stats.manualReview).toBe(0);
  });

  it("혼합 케이스 집계가 정확함", () => {
    const reviews = [
      /* Auto-approve */
      { ...makeReview({}), id: "1", hotelId: "h", reviewerEmail: "x", reviewerName: "X", reviewerCompany: "C", reviewerCountry: "🇰🇷", title: "t", helpfulVotes: 0, submittedAt: "", status: "Pending" as const, elsAwarded: 0, syndicationConsent: true },
      /* Auto-reject (spam) */
      { ...makeReview({ body: "click here for promo code" }), id: "2", hotelId: "h", reviewerEmail: "x", reviewerName: "X", reviewerCompany: "C", reviewerCountry: "🇰🇷", title: "t", helpfulVotes: 0, submittedAt: "", status: "Pending" as const, elsAwarded: 0, syndicationConsent: true },
      /* Manual (short body) */
      { ...makeReview({ body: "short" }), id: "3", hotelId: "h", reviewerEmail: "x", reviewerName: "X", reviewerCompany: "C", reviewerCountry: "🇰🇷", title: "t", helpfulVotes: 0, submittedAt: "", status: "Pending" as const, elsAwarded: 0, syndicationConsent: true },
    ];
    const stats = autoModerationStats(reviews);
    expect(stats.total).toBe(3);
    expect(stats.autoApprove).toBe(1);
    expect(stats.autoReject).toBe(1);
    expect(stats.manualReview).toBe(1);
    expect(stats.autoHandledPct).toBe(67);  /* 2/3 */
  });
});
