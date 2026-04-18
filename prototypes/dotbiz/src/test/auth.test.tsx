import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HashRouter } from "react-router";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

/* Helper to render inside providers */
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      <HashRouter>{ui}</HashRouter>
    </AuthProvider>
  );
}

/* Test component to access auth context */
function AuthStatus() {
  const { isAuthenticated, user, login, logout } = useAuth();
  return (
    <div>
      <p data-testid="status">{isAuthenticated ? "authenticated" : "not-authenticated"}</p>
      <p data-testid="name">{user?.name || "none"}</p>
      <p data-testid="role">{user?.role || "none"}</p>
      <button onClick={() => login("postpay@dotbiz.com", "postpay123")}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.removeItem("dotbiz_auth");
  });

  it("should start as not authenticated", () => {
    renderWithProviders(<AuthStatus />);
    expect(screen.getByTestId("status")).toHaveTextContent("not-authenticated");
    expect(screen.getByTestId("name")).toHaveTextContent("none");
  });

  it("should login with postpay credentials", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthStatus />);

    await user.click(screen.getByText("Login"));

    expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    expect(screen.getByTestId("name")).toHaveTextContent("Demo User");
    expect(screen.getByTestId("role")).toHaveTextContent("Master");
  });

  it("should persist auth to localStorage", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthStatus />);

    await user.click(screen.getByText("Login"));

    const stored = JSON.parse(localStorage.getItem("dotbiz_auth") || "{}");
    expect(stored.email).toBe("postpay@dotbiz.com");
    expect(stored.name).toBe("Demo User");
  });

  it("should logout and clear state", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthStatus />);

    await user.click(screen.getByText("Login"));
    expect(screen.getByTestId("status")).toHaveTextContent("authenticated");

    await user.click(screen.getByText("Logout"));
    expect(screen.getByTestId("status")).toHaveTextContent("not-authenticated");
    expect(localStorage.getItem("dotbiz_auth")).toBeNull();
  });

  it("should reject invalid credentials", async () => {
    const { useAuth: useAuthHook } = await import("@/contexts/AuthContext");
    function BadLogin() {
      const { login, isAuthenticated } = useAuthHook();
      return (
        <div>
          <p data-testid="auth">{isAuthenticated ? "yes" : "no"}</p>
          <button onClick={() => login("wrong@email.com", "wrongpass")}>Bad Login</button>
        </div>
      );
    }
    renderWithProviders(<BadLogin />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Bad Login"));
    expect(screen.getByTestId("auth")).toHaveTextContent("no");
  });
});
