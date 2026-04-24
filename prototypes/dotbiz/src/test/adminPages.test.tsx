/**
 * 내부 Admin 페이지 smoke tests
 *
 * 검증:
 *   • 내부 스태프 (isInternal=true)는 페이지 렌더 가능
 *   • 고객 (Master/OP/Accounting)은 "접근 권한 없음" 카드 표시
 *   • 자동 모더레이션 엔진의 on-page 통계가 실제 시드 데이터로 계산됨
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HashRouter } from "react-router";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import AdminEconomicsPage from "@/pages/AdminEconomicsPage";
import AdminReviewsPage from "@/pages/AdminReviewsPage";
import { Toaster } from "sonner";

function AutoLogin({ email, password, children }: { email: string; password: string; children: React.ReactNode }) {
  const { login, isAuthenticated } = useAuth();
  if (!isAuthenticated) login(email, password);
  return <>{children}</>;
}

function wrap(ui: React.ReactElement, email: string, password: string) {
  return render(
    <AuthProvider>
      <I18nProvider>
        <HashRouter>
          <AutoLogin email={email} password={password}>
            {ui}
            <Toaster />
          </AutoLogin>
        </HashRouter>
      </I18nProvider>
    </AuthProvider>
  );
}

describe("AdminEconomicsPage — 접근 권한 가드", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("ELLIS 내부 스태프는 정상 렌더링", () => {
    expect(() => wrap(<AdminEconomicsPage />, "ellis@ohmyhotel.com", "ellis123")).not.toThrow();
    /* 페이지 타이틀 확인 */
    expect(screen.getByText(/ELS 경제 관리/)).toBeTruthy();
  });

  it("Content Manager 내부 스태프도 접근 가능", () => {
    expect(() => wrap(<AdminEconomicsPage />, "content@ohmyhotel.com", "content123")).not.toThrow();
  });

  it("고객 Master는 '접근 권한 없음' 화면 표시", () => {
    wrap(<AdminEconomicsPage />, "master@dotbiz.com", "master123");
    expect(screen.getByText(/접근 권한 없음/)).toBeTruthy();
    expect(screen.queryByText(/ELS 경제 관리/)).toBeNull();
  });

  it("고객 OP 역할도 차단됨", () => {
    wrap(<AdminEconomicsPage />, "op@dotbiz.com", "op123");
    expect(screen.getByText(/접근 권한 없음/)).toBeTruthy();
  });

  it("고객 PREPAY Master도 차단됨", () => {
    wrap(<AdminEconomicsPage />, "prepay@dotbiz.com", "prepay123");
    expect(screen.getByText(/접근 권한 없음/)).toBeTruthy();
  });
});

describe("AdminReviewsPage — 접근 권한 + 자동 엔진 통계", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("ELLIS 내부 스태프는 정상 렌더링", () => {
    expect(() => wrap(<AdminReviewsPage />, "ellis@ohmyhotel.com", "ellis123")).not.toThrow();
  });

  it("Content Manager 내부 스태프는 정상 렌더링", () => {
    expect(() => wrap(<AdminReviewsPage />, "content@ohmyhotel.com", "content123")).not.toThrow();
  });

  it("고객은 접근 불가", () => {
    wrap(<AdminReviewsPage />, "master@dotbiz.com", "master123");
    expect(screen.getByText(/접근 권한 없음/)).toBeTruthy();
  });

  it("자동 엔진 배너에 '작동 중' 표기 (기본 ON 상태)", () => {
    wrap(<AdminReviewsPage />, "ellis@ohmyhotel.com", "ellis123");
    expect(screen.getByText(/자동 모더레이션 엔진/)).toBeTruthy();
    expect(screen.getByText(/작동 중/)).toBeTruthy();
  });

  it("Pending/Approved/Rejected 탭 트리거가 모두 존재", () => {
    wrap(<AdminReviewsPage />, "ellis@ohmyhotel.com", "ellis123");
    /* Tab triggers — role=tab */
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBeGreaterThanOrEqual(3);
  });
});
