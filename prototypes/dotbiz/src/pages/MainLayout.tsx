import { Outlet, useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import { Search, Moon, Sun, Bell, User, LogOut, LayoutDashboard, CalendarCheck, Wallet, HelpCircle, Gift, Pen, Menu, Users, Ticket, Heart } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import type { Locale } from "@/i18n/strings";
import { currentUser } from "@/mocks/users";

const navItems = [
  { i18nKey: "nav.findHotel", label: "Find Hotel", icon: Search, path: "/app/find-hotel" },
  { i18nKey: "nav.dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/app/dashboard" },
  { i18nKey: "nav.bookings", label: "Bookings", icon: CalendarCheck, path: "/app/bookings" },
  { i18nKey: "nav.settlement", label: "Settlement", icon: Wallet, path: "/app/settlement", roles: ["Master"] },
  { i18nKey: "nav.clientMgmt", label: "Client Mgmt", icon: Users, path: "/app/client", roles: ["Master"] },
  { i18nKey: "nav.tickets", label: "Tickets", icon: Ticket, path: "/app/tickets" },
  { i18nKey: "nav.notifications", label: "Notifications", icon: Bell, path: "/app/notifications" },
  { i18nKey: "nav.faq", label: "FAQ Board", icon: HelpCircle, path: "/app/faq" },
  { i18nKey: "nav.myAccount", label: "My Account", icon: User, path: "/app/my-account" },
  { i18nKey: "nav.rewards", label: "Rewards Mall", icon: Gift, path: "/app/rewards" },
  { i18nKey: "nav.blog", label: "OhMy Blog", icon: Pen, path: "/app/blog" },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole, isAuthenticated, user, logout } = useAuth();
  const { locale, setLocale, t } = useI18n();

  /* Auth guard — redirect to login if not authenticated */
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);
  const isMobile = !useMediaQuery("(min-width: 768px)");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("dotbiz_dark");
    if (saved === "true") { document.documentElement.classList.add("dark"); return true; }
    return false;
  });
  const [logoutOpen, setLogoutOpen] = useState(false);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("dotbiz_dark", String(next));
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar (DIDA style) */}
      <header className="flex items-center h-12 px-4 gap-1 shrink-0 text-white" style={{ background: "linear-gradient(90deg, #1a1a2e, #16213e)" }} role="banner">
        {/* Left: Logo + Nav */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(true)} aria-label="Open menu" className="text-white hover:bg-white/10">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="hidden md:flex items-center gap-1 cursor-pointer mr-4" onClick={() => navigate("/app/dashboard")}>
          <div className="relative w-7 h-7 shrink-0">
            <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 180deg, #FF6000, #FF8C00, #FFCF8F, #FF6000)" }} />
            <div className="absolute inset-[2px] rounded-full bg-[#1a1a2e] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none"><path d="M12 3C7.5 3 4 6.5 4 11c0 3 1.5 5.5 4 7l1-2c-2-1-3-3-3-5 0-3.3 2.7-6 6-6s6 2.7 6 6c0 2-1 3.8-2.5 5l1 2c2.3-1.5 3.5-4 3.5-7 0-4.5-3.5-8-8-8z" fill="#FF6000" /><circle cx="12" cy="4" r="2.5" fill="#009505" /></svg>
            </div>
          </div>
          <span className="text-base font-bold" style={{ color: "#FF6000" }}>DOTBIZ</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          <button onClick={() => navigate("/app/find-hotel")} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${isActive("/app/find-hotel") ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
            {t("nav.findHotel")}
          </button>
          <button onClick={() => navigate("/app/bookings")} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${isActive("/app/bookings") ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
            {t("nav.bookings")}
          </button>
        </nav>

        <div className="flex-1" />

        {/* Right: Language + Icons + User */}
        <div className="flex items-center gap-1">
          <select className="text-xs border border-white/20 rounded px-2 py-1 bg-transparent text-white hidden md:block" value={locale} onChange={e => setLocale(e.target.value as Locale)} aria-label="Language">
            {["EN","KO","JA","ZH","VI"].map(l => <option key={l} className="text-foreground bg-background">{l}</option>)}
          </select>
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8" onClick={() => navigate("/app/favorites")} aria-label="My Favorites">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8" onClick={toggleDark} aria-label="Toggle dark mode">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 relative" onClick={() => navigate("/app/notifications")} aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[9px] text-white flex items-center justify-center">3</span>
          </Button>
          <div className="hidden md:flex items-center gap-2 ml-2 pl-2 border-l border-white/20 cursor-pointer hover:bg-white/10 rounded px-2 py-1" onClick={() => navigate("/app/my-account")}>
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-[#FF6000] text-white">{(user?.name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-right">
              <p className="text-xs font-medium text-white leading-tight">{user?.company || "OHMYHOTEL"}</p>
              <p className="text-[10px] text-white/60 leading-tight">{user?.name}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetHeader className="px-4 py-4 border-b">
            <SheetTitle className="flex items-center gap-3">
              <div className="relative w-9 h-9 shrink-0">
                <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 180deg, #FF6000, #FF8C00, #FFCF8F, #FF6000)" }} />
                <div className="absolute inset-[2px] rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none">
                    <path d="M12 3C7.5 3 4 6.5 4 11c0 3 1.5 5.5 4 7l1-2c-2-1-3-3-3-5 0-3.3 2.7-6 6-6s6 2.7 6 6c0 2-1 3.8-2.5 5l1 2c2.3-1.5 3.5-4 3.5-7 0-4.5-3.5-8-8-8z" fill="#FF6000" />
                    <circle cx="12" cy="4" r="2.5" fill="#009505" />
                  </svg>
                </div>
              </div>
              <span className="text-xl font-bold font-heading" style={{ color: "#FF6000" }}>DOTBIZ</span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 px-2 py-2 flex-1">
            {navItems.map(item => {
              if (item.roles && !hasRole(item.roles)) return null;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setMobileNavOpen(false); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground"}`}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {t(item.i18nKey)}
                </button>
              );
            })}
          </div>
          <Separator />
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user?.name || currentUser.fullName}</p>
                <Badge variant="secondary" className="text-xs">{user?.role || currentUser.role}</Badge>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setMobileNavOpen(false); setLogoutOpen(true); }}>
              <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
              {t("nav.logout")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar — hidden on mobile */}
        <nav className="w-60 border-r hidden md:flex flex-col shrink-0 bg-card" role="navigation">
          <div className="p-4 cursor-pointer flex items-center gap-3" onClick={() => navigate("/app/dashboard")}>
            <div className="relative w-9 h-9 shrink-0">
              <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 180deg, #FF6000, #FF8C00, #FFCF8F, #FF6000)" }} />
              <div className="absolute inset-[2px] rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none">
                  <path d="M12 3C7.5 3 4 6.5 4 11c0 3 1.5 5.5 4 7l1-2c-2-1-3-3-3-5 0-3.3 2.7-6 6-6s6 2.7 6 6c0 2-1 3.8-2.5 5l1 2c2.3-1.5 3.5-4 3.5-7 0-4.5-3.5-8-8-8z" fill="#FF6000" />
                  <circle cx="12" cy="4" r="2.5" fill="#009505" />
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold font-heading" style={{ color: "#FF6000" }}>DOTBIZ</span>
          </div>
          <div className="flex flex-col gap-1 px-2">
            {navItems.map(item => {
              if (item.roles && !hasRole(item.roles)) return null;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground"}`}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {t(item.i18nKey)}
                </button>
              );
            })}
          </div>
          <div className="flex-1" />
          <Separator />
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user?.name || currentUser.fullName}</p>
                <Badge variant="secondary" className="text-xs">{user?.role || currentUser.role}</Badge>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start text-xs" onClick={() => { logout(); navigate("/login"); }}>
              <User className="h-4 w-4 mr-2" aria-hidden="true" />
              {t("nav.switchAccount")}
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setLogoutOpen(true)}>
              <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
              {t("nav.logout")}
            </Button>
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 overflow-auto flex flex-col">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </div>
          <Footer />
        </main>
      </div>

      {/* Logout Dialog */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to log out? You will be redirected to the login screen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { logout(); navigate("/login"); }}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
