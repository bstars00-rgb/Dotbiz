/* Smoke tests for RewardsMallPage + MyAccountPage — ensure they render
 * without throwing on the happy path. Previously these crashed silently
 * in production when users clicked "Open Rewards" from My Account. */
import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { HashRouter } from "react-router";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import RewardsMallPage from "@/pages/RewardsMallPage";
import MyAccountPage from "@/pages/MyAccountPage";
import { Toaster } from "sonner";

function AutoLogin({ email, password, children }: { email: string; password: string; children: React.ReactNode }) {
  const { login, isAuthenticated } = useAuth();
  if (!isAuthenticated) login(email, password);
  return <>{children}</>;
}

function wrap(ui: React.ReactElement, email = "prepay@dotbiz.com", password = "prepay123") {
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

describe("RewardsMallPage render smoke tests", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("renders for Asia Tours Master (Jennifer Wu) without throwing", () => {
    expect(() => wrap(<RewardsMallPage />, "prepay@dotbiz.com", "prepay123")).not.toThrow();
  });

  it("renders for TravelCo Master (James Park) without throwing", () => {
    expect(() => wrap(<RewardsMallPage />, "master@dotbiz.com", "master123")).not.toThrow();
  });

  it("renders for TravelCo OP (Sarah Kim) without throwing", () => {
    expect(() => wrap(<RewardsMallPage />, "op@dotbiz.com", "op123")).not.toThrow();
  });

  it("renders for GOTADI API partner (Nguyen Van An) without throwing", () => {
    expect(() => wrap(<RewardsMallPage />, "gotadi@dotbiz.com", "gotadi123")).not.toThrow();
  });

  it("renders for accounting user with 0 bookings without throwing", () => {
    expect(() => wrap(<RewardsMallPage />, "accounting@dotbiz.com", "accounting123")).not.toThrow();
  });

  it("MyAccountPage renders for prepay Master without throwing", () => {
    expect(() => wrap(<MyAccountPage />, "prepay@dotbiz.com", "prepay123")).not.toThrow();
  });
});
