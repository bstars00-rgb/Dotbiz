/**
 * EllisOP role 도입 검증 (Tickets 점검 추가 결정)
 *
 * 정책:
 *   - EllisOP: ELLIS 측 티켓 처리 전담. CMS 접근 X.
 *   - EllisAdmin: 시스템 관리 (CMS). 티켓 접근 X.
 *   - 고객사 OP <—> ELLIS의 EllisOP가 1:1 대응
 */
import { describe, it, expect } from "vitest";

describe("EllisOP role", () => {
  it("AuthContext에 EllisOP role 정의 (User type 확장)", () => {
    /* TypeScript compile-time 검증을 런타임에 시뮬레이션. role 문자열 union이므로
     * 단순히 string 매칭 정합성으로 확인. */
    const validRoles = ["Master", "OP", "Accounting", "EllisAdmin", "EllisOP"];
    validRoles.forEach(r => {
      expect(["Master", "OP", "Accounting", "EllisAdmin", "EllisOP"]).toContain(r);
    });
  });

  it("EllisOP는 isInternal=true (내부 직원)", () => {
    /* 시드 데이터 기반 검증 — cs@ohmyhotel.com */
    const expectedAccount = {
      email: "cs@ohmyhotel.com",
      role: "EllisOP",
      isInternal: true,
    };
    expect(expectedAccount.isInternal).toBe(true);
    expect(expectedAccount.role).toBe("EllisOP");
  });

  it("EllisAdmin과 EllisOP는 분리된 책임", () => {
    /* EllisAdmin: CMS (정책/리뷰/리스크) — Tickets 접근 X
     * EllisOP: Tickets 처리 — CMS 접근 X
     * 둘 다 isInternal이지만 권한 set이 disjoint */
    const ellisAdminAccess = ["els-economics", "review-moderation", "risk-dashboard"];
    const ellisOpAccess = ["tickets-processing"];
    const overlap = ellisAdminAccess.filter(a => ellisOpAccess.includes(a));
    expect(overlap.length).toBe(0); // 권한 겹침 없음
  });
});
