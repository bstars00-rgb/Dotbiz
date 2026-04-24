import { Outlet, useNavigate, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import { Search, Moon, Sun, Bell, User, LogOut, LayoutDashboard, CalendarCheck, Wallet, HelpCircle, Gift, Pen, Menu, Users, Ticket, Heart, Phone, ChevronDown, ChevronRight, PieChart, UserCog, Network, ArrowRightLeft, PanelLeftClose, PanelLeftOpen, Shield, ShieldCheck } from "lucide-react";
import { creditSummary } from "@/mocks/clientManagement";
import { currentCompany } from "@/mocks/companies";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { unreadAlertsFor } from "@/mocks/alerts";
import { companies } from "@/mocks/companies";
import { earnedStampsFor, STAMPS } from "@/mocks/rewards";
import { useI18n } from "@/contexts/I18nContext";
import type { Locale } from "@/i18n/strings";
import { currentUser } from "@/mocks/users";
import TutorialOverlay, { type TutorialStep } from "@/components/TutorialOverlay";

/* Sidebar grouped into 3 sections based on usage pattern:
 *   WORK      — daily operations (most used, top of sidebar)
 *   ADMIN     — management + personal settings
 *   RESOURCES — reference content (least clicked, bottom)
 *
 * Kept as a flat `navItems` export for any code that looks it up by path,
 * with a parallel `navSections` structure driving the sidebar layout.
 */
interface NavItem {
  i18nKey: string;
  label: string;
  icon: typeof Search;
  path: string;
  roles?: string[];
}
interface NavSection {
  id: "work" | "admin" | "resources";
  i18nKey: string;
  label: string;
  items: NavItem[];
}
const navSections: NavSection[] = [
  {
    id: "work",
    i18nKey: "nav.section.work",
    label: "Work",
    items: [
      { i18nKey: "nav.dashboard",   label: "Dashboard",   icon: LayoutDashboard, path: "/app/dashboard" },
      { i18nKey: "nav.findHotel",   label: "Find Hotel",  icon: Search,          path: "/app/find-hotel" },
      { i18nKey: "nav.bookings",    label: "Bookings",    icon: CalendarCheck,   path: "/app/bookings" },
      { i18nKey: "nav.settlement",  label: "Settlement",  icon: Wallet,          path: "/app/settlement", roles: ["Master"] },
      { i18nKey: "nav.tickets",     label: "Tickets",     icon: Ticket,          path: "/app/tickets" },
    ],
  },
  {
    id: "admin",
    i18nKey: "nav.section.admin",
    label: "Admin",
    items: [
      { i18nKey: "nav.team",          label: "Master Account", icon: Users, path: "/app/client", roles: ["Master"] },
      { i18nKey: "nav.notifications", label: "Notifications", icon: Bell,  path: "/app/notifications" },
      { i18nKey: "nav.myAccount",     label: "My Account",     icon: User,  path: "/app/my-account" },
      /* ── ELLIS internal admin pages — hidden from customers ──
       * Gated to EllisAdmin role only. Even Master (customer) cannot
       * see these because they expose internal economics / moderation. */
      { i18nKey: "nav.elsEconomics",  label: "ELS Economics",     icon: Shield,      path: "/app/admin/els-economics",      roles: ["EllisAdmin"] },
      { i18nKey: "nav.reviewMod",     label: "Review Moderation", icon: ShieldCheck, path: "/app/admin/review-moderation", roles: ["EllisAdmin"] },
    ],
  },
  {
    id: "resources",
    i18nKey: "nav.section.resources",
    label: "Resources",
    items: [
      { i18nKey: "nav.faq",     label: "FAQ Board",    icon: HelpCircle, path: "/app/faq" },
      { i18nKey: "nav.blog",    label: "OhMy Blog",    icon: Pen,        path: "/app/blog" },
      { i18nKey: "nav.rewards", label: "Rewards Mall", icon: Gift,       path: "/app/rewards" },
    ],
  },
];
const navItems: NavItem[] = navSections.flatMap(s => s.items);

/* Map router path → tutorial data-attribute key. Only paths referenced from
 * TutorialOverlay steps need an entry — others get no attribute (harmless). */
const tutorialKeyFor = (path: string): string | undefined => {
  if (path === "/app/dashboard")  return "nav-dashboard";
  if (path === "/app/find-hotel") return "nav-find-hotel";
  if (path === "/app/bookings")   return "nav-bookings";
  if (path === "/app/settlement") return "nav-settlement";
  if (path === "/app/tickets")    return "nav-tickets";
  if (path === "/app/client")     return "nav-team";
  if (path === "/app/my-account") return "nav-my-account";
  return undefined;
};

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole, isAuthenticated, user, logout } = useAuth();

  /* Compute unread alert count for current logged-in customer */
  const unreadCount = (() => {
    const myCompany = companies.find(c => c.name === user?.company);
    if (!myCompany) return 0;
    return unreadAlertsFor(myCompany.id).length;
  })();
  const { locale, setLocale, t } = useI18n();

  /* Auth guard — redirect to login if not authenticated */
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);
  const isMobile = !useMediaQuery("(min-width: 768px)");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(() => localStorage.getItem("dotbiz_sidebar") === "hidden");
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("dotbiz_dark");
    if (saved === "true") { document.documentElement.classList.add("dark"); return true; }
    return false;
  });
  const [logoutOpen, setLogoutOpen] = useState(false);

  /* Top-right popovers */
  const [openPop, setOpenPop] = useState<null | "lang" | "help" | "phone" | "user">(null);

  /* ── Tutorial overlay state ─────────────────────────────
   * Triggered by clicking the Start Guide (HelpCircle) icon in the top bar.
   * Steps walk through the main nav items and key features with a spotlight
   * + tooltip card. Can exit at any point via X / Skip / Esc / backdrop. */
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome to DOTBIZ 👋",
      description:
        "We'll walk you through the key features in about 60 seconds.\n\nYou can exit any time by pressing Esc, clicking Skip, or the X in the corner.",
    },
    {
      targetSelector: '[data-tutorial="nav-dashboard"]',
      title: "1. Dashboard",
      description: "Your daily starting point. KPIs, pending actions, and recent alerts are summarized here.\n\nMost users check this every morning.",
      placement: "right",
      onBefore: () => navigate("/app/dashboard"),
    },
    {
      targetSelector: '[data-tutorial="nav-find-hotel"]',
      title: "2. Find Hotel — Make a booking",
      description: "Click here to search hotels and create a new reservation.\n\nFilter by location, dates, and room type.",
      placement: "right",
    },
    {
      targetSelector: '[data-tutorial="nav-bookings"]',
      title: "3. Bookings — Manage reservations",
      description: "All confirmed, pending, and cancelled bookings live here.\n\nClick any booking for details and actions.",
      placement: "right",
    },
    ...(hasRole(["Master"]) ? [{
      targetSelector: '[data-tutorial="nav-settlement"]',
      title: "4. Settlement — Money operations",
      description: "Invoices, credit line, aging, payment records — everything related to money flows with OhMyHotel is here.\n\nMaster accounts only.",
      placement: "right" as const,
    }] : []),
    {
      targetSelector: '[data-tutorial="nav-tickets"]',
      title: "5. Tickets — Get help",
      description: "Need to dispute a charge or change a request?\n\nOpen a support ticket here — our team responds within 24 hours.",
      placement: "right",
    },
    {
      targetSelector: '[data-tutorial="top-bell"]',
      title: "6. Notifications",
      description: "The bell icon shows unread alerts.\n\nPayment deadlines, credit warnings, and hotel confirmations all surface here in real time.",
      placement: "bottom",
    },
    ...(hasRole(["Master"]) ? [{
      targetSelector: '[data-tutorial="nav-team"]',
      title: "7. Master Account — Company-level settings",
      description: "Invite sub-accounts, organize by department, manage company payment cards, coupons, and voucher branding.\n\nMaster-only.",
      placement: "right" as const,
    }] : []),
    {
      targetSelector: '[data-tutorial="nav-my-account"]',
      title: "Your personal account",
      description: "Edit your own profile (name / phone) and change your password here.\n\nEach team member has their own — OPs use this too.",
      placement: "right",
    },
    {
      targetSelector: '[data-tutorial="top-help"]',
      title: "You're all set! 🎉",
      description: "You can replay this tutorial anytime by clicking this help icon.\n\nFor anything else, open a Ticket or check the FAQ Board.",
      placement: "bottom",
    },
  ];
  const headerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!headerRef.current) return;
      if (!headerRef.current.contains(e.target as Node)) setOpenPop(null);
    };
    if (openPop) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [openPop]);

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: "EN" as Locale, label: "English", flag: "🇺🇸" },
    { code: "KO" as Locale, label: "한국어", flag: "🇰🇷" },
    { code: "JA" as Locale, label: "日本語", flag: "🇯🇵" },
    { code: "ZH" as Locale, label: "中文", flag: "🇨🇳" },
    { code: "VI" as Locale, label: "Tiếng Việt", flag: "🇻🇳" },
  ];
  const currentLang = languages.find(l => l.code === locale) || languages[0];

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
      <header ref={headerRef} className="flex items-center h-12 px-4 gap-1 shrink-0 text-white relative" style={{ background: "linear-gradient(90deg, #1a1a2e, #16213e)" }} role="banner">
        {/* Left: Menu toggle (mobile only — opens the sheet).
         * Desktop: sidebar has its own PanelLeftClose button at the top,
         * and a floating PanelLeftOpen button appears in the main area
         * when the sidebar is hidden. This keeps the toggle action
         * visually attached to the sidebar it controls. */}
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

        {/* Right: Language + Icons + User (DIDA-style rich popovers) */}
        <div className="flex items-center gap-1">
          {/* Language Picker with flag */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setOpenPop(p => p === "lang" ? null : "lang")}
              className="flex items-center gap-1.5 border border-white/30 rounded-full px-2.5 py-1 hover:bg-white/10 text-xs"
              aria-label="Select language"
            >
              <span className="text-sm leading-none">{currentLang.flag}</span>
              <span className="font-medium">{currentLang.code}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${openPop === "lang" ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Favorites */}
          <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8" onClick={() => navigate("/app/favorites")} aria-label="My Favorites">
            <Heart className="h-4 w-4" />
          </Button>

          {/* Start Guide — launches interactive tutorial overlay */}
          <div className="relative">
            <button
              data-tutorial="top-help"
              onClick={() => { setOpenPop(null); setTutorialOpen(true); }}
              className="flex items-center justify-center h-8 w-8 rounded-md text-white/80 hover:text-white hover:bg-white/10"
              aria-label="Start Guide Tutorial"
              title="Start interactive tutorial"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>

          {/* Customer Service */}
          <div className="relative">
            <button
              onClick={() => setOpenPop(p => p === "phone" ? null : "phone")}
              className="flex items-center justify-center h-8 w-8 rounded-md text-white/80 hover:text-white hover:bg-white/10"
              aria-label="Customer Service"
            >
              <Phone className="h-4 w-4" />
            </button>
          </div>

          {/* Dark mode */}
          <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8" onClick={toggleDark} aria-label="Toggle dark mode">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Notifications */}
          <Button data-tutorial="top-bell" variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8 relative" onClick={() => navigate("/app/notifications")} aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-[9px] text-white flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>

          {/* User Avatar */}
          <div className="relative">
            <button
              onClick={() => setOpenPop(p => p === "user" ? null : "user")}
              className="hidden md:flex items-center gap-1.5 ml-1 border border-white/30 rounded-full pl-1 pr-2 py-0.5 cursor-pointer hover:bg-white/10"
              aria-label="User menu"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-[#FF6000] text-white">{(user?.name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-white truncate max-w-[90px]">{user?.company || "OhMyHotelB2BDC"}</span>
              <ChevronDown className={`h-3 w-3 text-white/70 transition-transform ${openPop === "user" ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* ─────────── Language Popover ─────────── */}
        {openPop === "lang" && (
          <div className="absolute right-[340px] top-[48px] bg-white dark:bg-slate-900 text-foreground shadow-xl rounded-lg ring-1 ring-foreground/10 w-56 z-50 overflow-hidden">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLocale(lang.code); setOpenPop(null); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-muted/60 transition-colors ${locale === lang.code ? "bg-red-50 dark:bg-red-950/20 text-red-600 font-medium" : ""}`}
              >
                <span className="text-lg leading-none">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Start Guide popover removed — replaced by interactive TutorialOverlay (see bottom of file). */}

        {/* ─────────── Customer Service Popover ─────────── */}
        {openPop === "phone" && (
          <div className="absolute right-[200px] top-[48px] bg-white dark:bg-slate-900 text-foreground shadow-xl rounded-lg ring-1 ring-foreground/10 w-[420px] z-50 p-5">
            <h3 className="font-semibold text-base mb-4">Customer Service Center (7*24 hours)</h3>
            <div className="border-b pb-1 mb-3">
              <span className="inline-block pb-1 border-b-2 border-red-500 text-sm font-medium text-red-500">Hotel</span>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold mb-2">Korean Market</p>
                <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><Phone className="h-3.5 w-3.5 text-red-500" /> +82-2-762-0552</p>
                <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300 mt-1">
                  <svg className="h-3.5 w-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 13.5l-10-7v12h20v-12l-10 7zm10-9h-20l10 6.5 10-6.5z"/></svg>
                  support@ohmyhotel.com
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2">Global Market</p>
                <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><Phone className="h-3.5 w-3.5 text-red-500" /> +82-2-762-0553 <span className="text-xs text-muted-foreground">(International)</span></p>
                <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300 mt-1">
                  <svg className="h-3.5 w-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 13.5l-10-7v12h20v-12l-10 7zm10-9h-20l10 6.5 10-6.5z"/></svg>
                  intlsupport@ohmyhotel.com
                </p>
                <p className="text-xs text-muted-foreground ml-5 mt-0.5">reconfirm@ohmyhotel.com (hotel confirmation inquiries)</p>
              </div>
              <div className="pt-3 border-t">
                <p className="flex items-center gap-2 font-semibold text-red-500 mb-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><text x="12" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">!</text></svg>
                  Office Hours
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300">From 0:00 to 8:00, check-in issues will be handled first</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">Pre-sale Service Time: <span className="text-muted-foreground">9:00-23:00 (KST)</span></p>
                <p className="text-xs text-slate-700 dark:text-slate-300">Complaints Service Time: <span className="text-muted-foreground">9:00-24:00 (KST)</span></p>
              </div>
            </div>
          </div>
        )}

        {/* ─────────── User Popover ─────────── */}
        {openPop === "user" && (
          <div className="absolute right-4 top-[48px] bg-white dark:bg-slate-900 text-foreground shadow-xl rounded-lg ring-1 ring-foreground/10 w-[380px] z-50 overflow-hidden">
            {/* Account Info */}
            <div className="px-5 pt-4 pb-3 flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Account Info</p>
                <p className="font-semibold text-sm mt-0.5">{user?.company || "OhMyHotelB2BDC"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user?.name} · {user?.email}</p>
                <Badge variant="secondary" className="text-[10px] mt-1.5">{user?.role || currentUser.role}</Badge>
              </div>
              <button onClick={() => { setOpenPop(null); logout(); navigate("/login"); }} className="flex items-center gap-1.5 border rounded-md px-2.5 py-1.5 text-xs hover:bg-muted/60 text-slate-700 dark:text-slate-300">
                <ArrowRightLeft className="h-3 w-3" /> Switch login account
              </button>
            </div>

            {/* Credit Section */}
            <div className="mx-5 mb-3 border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
                <span className="font-semibold text-sm">Credit</span>
                <button onClick={() => { navigate("/app/settlement"); setOpenPop(null); }} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-0.5">
                  View Credit <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                <div>
                  <p className="text-xs text-muted-foreground">Credit Balance:</p>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-base">USD {creditSummary.creditBalance.toLocaleString()}</p>
                    <Badge variant="secondary" className="text-[10px] bg-red-50 text-red-600 hover:bg-red-50">Hotel</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Deferred Credit Balance:</p>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-base">USD {(creditSummary.deferredCreditBalance - creditSummary.deferredCreditUsed).toLocaleString()}</p>
                    <Badge variant="secondary" className="text-[10px] bg-red-50 text-red-600 hover:bg-red-50">Hotel</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="px-5 py-3 border-t">
              <p className="font-semibold text-sm">Client Info</p>
              <p className="text-sm mt-1">{user?.company || currentCompany.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant="outline" className="text-[10px]">
                  {user?.billingType || "POSTPAY"}
                </Badge>
                <span className="text-[10px] text-muted-foreground">Contract holder</span>
              </div>
            </div>

            {/* Coupon */}
            <div className="px-5 py-3 border-t flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Coupon</p>
                <p className="text-red-500 font-bold text-base leading-tight">0</p>
              </div>
              <button onClick={() => { navigate("/app/rewards?tab=vault"); setOpenPop(null); }} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-0.5">
                My Coupons <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* Stamps — passport progress (added for discoverability) */}
            <div className="px-5 py-3 border-t flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Stamps</p>
                <p className="text-red-500 font-bold text-base leading-tight">
                  {(() => {
                    const earned = earnedStampsFor(user?.email || "").filter(s => s.earned).length;
                    return `${earned} / ${STAMPS.length}`;
                  })()}
                </p>
              </div>
              <button onClick={() => { navigate("/app/rewards?tab=stamps"); setOpenPop(null); }} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-0.5">
                My Passport <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* Action Grid — Dashboard / My Account / Master Account (+ Sign out) */}
            <div className={`grid ${hasRole(["Master"]) ? "grid-cols-4" : "grid-cols-3"} border-t bg-muted/20`}>
              <button onClick={() => { navigate("/app/dashboard"); setOpenPop(null); }} className="flex flex-col items-center gap-1.5 py-3 hover:bg-muted/40 transition-colors text-xs">
                <div className="h-9 w-9 rounded-full border flex items-center justify-center"><PieChart className="h-4 w-4 text-red-500" /></div>
                <span>Dashboard</span>
              </button>
              <button onClick={() => { navigate("/app/my-account"); setOpenPop(null); }} className="flex flex-col items-center gap-1.5 py-3 hover:bg-muted/40 transition-colors text-xs">
                <div className="h-9 w-9 rounded-full border flex items-center justify-center"><UserCog className="h-4 w-4 text-red-500" /></div>
                <span>My Account</span>
              </button>
              {hasRole(["Master"]) && (
                <button onClick={() => { navigate("/app/client"); setOpenPop(null); }} className="flex flex-col items-center gap-1.5 py-3 hover:bg-muted/40 transition-colors text-xs">
                  <div className="h-9 w-9 rounded-full border flex items-center justify-center"><Network className="h-4 w-4 text-red-500" /></div>
                  <span>Master Account</span>
                </button>
              )}
              <button onClick={() => { setOpenPop(null); setLogoutOpen(true); }} className="flex flex-col items-center gap-1.5 py-3 hover:bg-muted/40 transition-colors text-xs">
                <div className="h-9 w-9 rounded-full border flex items-center justify-center"><LogOut className="h-4 w-4 text-red-500" /></div>
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
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
          <div className="flex flex-col gap-3 px-2 py-2 flex-1 overflow-y-auto">
            {navSections.map((section, idx) => {
              const visible = section.items.filter(item => !item.roles || hasRole(item.roles));
              if (visible.length === 0) return null;
              return (
                <div key={section.id} className="flex flex-col gap-1">
                  {idx > 0 && <Separator className="mb-1" />}
                  <p className="px-3 pt-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                    {t(section.i18nKey)}
                  </p>
                  {visible.map(item => {
                    const active = isActive(item.path);
                    return (
                      <button
                        key={item.path}
                        data-tutorial={tutorialKeyFor(item.path)}
                        onClick={() => { navigate(item.path); setMobileNavOpen(false); }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground"}`}
                      >
                        <item.icon className="h-4 w-4" aria-hidden="true" />
                        {t(item.i18nKey)}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <Separator />
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{(user?.name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
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
        {/* Sidebar — either full (w-60) or collapsed rail (w-10, expand button only).
         * VSCode-style. Desktop only; mobile uses the Sheet overlay via hamburger. */}
        {!isMobile && sidebarHidden && (
          <div className="w-10 border-r bg-card shrink-0 flex flex-col items-center pt-3">
            <button
              onClick={() => { setSidebarHidden(false); localStorage.setItem("dotbiz_sidebar", "visible"); }}
              className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}

        {!isMobile && !sidebarHidden && (
        <nav className="w-60 border-r flex flex-col shrink-0 bg-card" role="navigation">
          {/* Logo + Collapse button */}
          <div className="p-3 flex items-center gap-2 whitespace-nowrap">
            <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => navigate("/app/dashboard")}>
              <div className="relative w-9 h-9 shrink-0">
                <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 180deg, #FF6000, #FF8C00, #FFCF8F, #FF6000)" }} />
                <div className="absolute inset-[2px] rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none"><path d="M12 3C7.5 3 4 6.5 4 11c0 3 1.5 5.5 4 7l1-2c-2-1-3-3-3-5 0-3.3 2.7-6 6-6s6 2.7 6 6c0 2-1 3.8-2.5 5l1 2c2.3-1.5 3.5-4 3.5-7 0-4.5-3.5-8-8-8z" fill="#FF6000" /><circle cx="12" cy="4" r="2.5" fill="#009505" /></svg>
                </div>
              </div>
              <span className="text-xl font-bold font-heading" style={{ color: "#FF6000" }}>DOTBIZ</span>
            </div>
            {/* Collapse sidebar */}
            <button
              onClick={() => { setSidebarHidden(true); localStorage.setItem("dotbiz_sidebar", "hidden"); }}
              className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
          {/* Nav items — grouped by section */}
          <div className="flex flex-col gap-3 px-2 overflow-y-auto">
            {navSections.map((section, idx) => {
              const visible = section.items.filter(item => !item.roles || hasRole(item.roles));
              if (visible.length === 0) return null;
              return (
                <div key={section.id} className="flex flex-col gap-1">
                  {idx > 0 && <Separator className="mb-1" />}
                  <p className="px-3 pt-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 whitespace-nowrap">
                    {t(section.i18nKey)}
                  </p>
                  {visible.map(item => {
                    const active = isActive(item.path);
                    return (
                      <button
                        key={item.path}
                        data-tutorial={tutorialKeyFor(item.path)}
                        onClick={() => navigate(item.path)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left whitespace-nowrap ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground"}`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {t(item.i18nKey)}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div className="flex-1" />
          <Separator />
          {/* User section — identity only.
           * Switch Account / Logout moved to top-right user popover to
           * avoid duplicating actions. Hint below points users there. */}
          <div className="p-4 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8"><AvatarFallback>{(user?.name || "U").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || currentUser.fullName}</p>
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={user?.isInternal ? { background: "#FF600022", color: "#FF6000" } : undefined}
                >
                  {user?.isInternal && <Shield className="h-2.5 w-2.5 mr-0.5 inline" />}
                  {user?.role || currentUser.role}
                </Badge>
              </div>
            </div>
            {user?.isInternal && (
              <p className="text-[9px] font-semibold mt-1 uppercase tracking-wider" style={{ color: "#FF6000" }}>
                ⚠ ELLIS Internal Console
              </p>
            )}
            <p className="text-[10px] text-muted-foreground mt-2 leading-tight">
              Open the profile menu (top-right) to switch accounts or sign out.
            </p>
          </div>
        </nav>
        )}

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

      {/* Tutorial overlay — launched from Start Guide icon in top bar */}
      <TutorialOverlay
        open={tutorialOpen}
        steps={tutorialSteps}
        onClose={() => setTutorialOpen(false)}
        onComplete={() => localStorage.setItem("dotbiz_tutorial_seen", "true")}
      />

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
