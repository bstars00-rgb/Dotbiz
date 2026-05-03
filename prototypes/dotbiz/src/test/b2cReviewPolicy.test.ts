/**
 * B2C Review 신디케이션 정책 검증 (2026-04-30 결정)
 *
 *   • 익명화: B2C "여행 전문가" / ELLIS 내부 식별 가능
 *   • Featured 보상: ELLIS 어드민 결정 (변동)
 *   • ELS 적립된 리뷰 철회 불가
 *   • 퇴사 후 자가 삭제 불가, ELLIS만 takedown
 */
import { describe, it, expect } from "vitest";
import {
  displayPersonaForB2C,
  displayIdentityForInternal,
  canSelfWithdraw,
  canEllisInternalTakedown,
  featuredReviewsForHotel,
  hotelReviews,
  type HotelReview,
} from "@/mocks/reviews";

const sampleReview: HotelReview = {
  id: "test-1", hotelId: "htl-001",
  reviewerEmail: "op@dotbiz.com",
  reviewerName: "Sarah Kim",
  reviewerCompany: "TravelCo International",
  reviewerCountry: "🇰🇷 Korea",
  rating: 5, title: "test", body: "test", tips: ["t"],
  verifiedStay: true, helpfulVotes: 10,
  submittedAt: "2026-04-30",
  status: "Approved", elsAwarded: 5,
  syndicationConsent: true,
  consentedAt: "2026-04-30",
};

describe("B2C 익명화 (이중 구조)", () => {
  it("displayPersonaForB2C: '여행 전문가' 페르소나 + 회사 + 국가만", () => {
    const p = displayPersonaForB2C(sampleReview);
    expect(p.persona).toBe("여행 전문가");
    expect(p.company).toBe("TravelCo International");
    expect(p.country).toBe("🇰🇷 Korea");
    /* 실명/이메일 노출 X */
    expect(p).not.toHaveProperty("name");
    expect(p).not.toHaveProperty("email");
  });

  it("displayIdentityForInternal: ELLIS 내부엔 실명·이메일 모두 노출", () => {
    const i = displayIdentityForInternal(sampleReview);
    expect(i.name).toBe("Sarah Kim");
    expect(i.email).toBe("op@dotbiz.com");
    expect(i.company).toBe("TravelCo International");
  });
});

describe("ELS 적립된 리뷰 철회 정책 (lock-in)", () => {
  it("Approved + elsAwarded > 0 → 자가 철회 불가", () => {
    expect(canSelfWithdraw({ ...sampleReview, status: "Approved", elsAwarded: 5 })).toBe(false);
  });
  it("Approved + elsAwarded === 0 → 철회 가능 (보상 없음)", () => {
    expect(canSelfWithdraw({ ...sampleReview, status: "Approved", elsAwarded: 0 })).toBe(true);
  });
  it("Pending → 항상 철회 가능", () => {
    expect(canSelfWithdraw({ ...sampleReview, status: "Pending", elsAwarded: 0 })).toBe(true);
  });
  it("Rejected → 항상 철회 가능", () => {
    expect(canSelfWithdraw({ ...sampleReview, status: "Rejected", elsAwarded: 0 })).toBe(true);
  });
});

describe("ELLIS Takedown 권한", () => {
  it("ELLIS 내부는 항상 takedown 가능 (퇴사 후에도)", () => {
    expect(canEllisInternalTakedown()).toBe(true);
  });
});

describe("Featured 선정 — 호텔별 TOP 3 (helpful votes)", () => {
  it("Approved + syndicationConsent=true 인 리뷰 중 helpful 상위 3개", () => {
    const featured = featuredReviewsForHotel("htl-001", hotelReviews);
    expect(featured.length).toBeLessThanOrEqual(3);
    /* helpful 정렬 검증 */
    for (let i = 1; i < featured.length; i++) {
      expect(featured[i - 1].helpfulVotes).toBeGreaterThanOrEqual(featured[i].helpfulVotes);
    }
    /* 모두 Approved + syndicationConsent */
    featured.forEach(r => {
      expect(r.status).toBe("Approved");
      expect(r.syndicationConsent).toBe(true);
    });
  });

  it("syndicationConsent=false 리뷰는 Featured에 포함 안 됨", () => {
    const noConsent: HotelReview = { ...sampleReview, id: "no-consent", syndicationConsent: false };
    const featured = featuredReviewsForHotel("htl-001", [...hotelReviews, noConsent]);
    expect(featured.find(r => r.id === "no-consent")).toBeUndefined();
  });
});
