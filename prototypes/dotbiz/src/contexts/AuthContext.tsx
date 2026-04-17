import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface User {
  email: string;
  name: string;
  role: "Master" | "OP";
  company: string;
  billingType: "PREPAY" | "POSTPAY";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  currentRole: string;
  setCurrentRole: (role: string) => void;
  hasRole: (allowedRoles: string[]) => boolean;
  login: (email: string, password: string, remember?: boolean) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const ALL_ROLES = ["Master", "OP"] as const;

/* ── Mock Users ── */
const MOCK_USERS: { email: string; password: string; user: User }[] = [
  { email: "master@dotbiz.com", password: "master123", user: { email: "master@dotbiz.com", name: "James Park", role: "Master", company: "OHMYHOTEL & CO.", billingType: "POSTPAY" } },
  { email: "op@dotbiz.com", password: "op123", user: { email: "op@dotbiz.com", name: "Sarah Kim", role: "OP", company: "OHMYHOTEL & CO.", billingType: "POSTPAY" } },
  { email: "demo", password: "demo", user: { email: "demo@dotbiz.com", name: "Demo User", role: "Master", company: "OHMYHOTEL & CO.", billingType: "POSTPAY" } },
];

const STORAGE_KEY = "dotbiz_auth";

function loadStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as User;
  } catch { /* ignore */ }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser);
  const [currentRole, setCurrentRoleState] = useState<string>(loadStoredUser()?.role || "Master");

  const setCurrentRole = useCallback((role: string) => {
    setCurrentRoleState(role);
    if (user) {
      const updated = { ...user, role: role as "Master" | "OP" };
      setUser(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }, [user]);

  const login = useCallback((email: string, password: string, remember = true): boolean => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (found) {
      setUser(found.user);
      setCurrentRoleState(found.user.role);
      if (remember) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(found.user));
      }
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setCurrentRoleState("Master");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasRole = (allowedRoles: string[]) => allowedRoles.includes(currentRole);
  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, currentRole, setCurrentRole, hasRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
