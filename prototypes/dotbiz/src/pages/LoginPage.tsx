import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, LogIn, Moon, Sun, RefreshCw, Eye, EyeOff, Globe, ChevronDown, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScreenState } from "@/hooks/useScreenState";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const { state, setState } = useScreenState("success");
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  /* If already logged in, redirect to dashboard */
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);
  const { errors, validate } = useFormValidation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogin = () => {
    const emailErr = validate("email", email, { required: true, rules: [{ type: "email", message: "Please enter a valid email address" }] });
    const passErr = validate("password", password, { required: true, rules: [{ type: "maxLength", value: 128, message: "Password must not exceed 128 characters" }] });
    if (!agreeTerms) { setTermsError(true); }
    if (emailErr || passErr || !agreeTerms) return;
    setTermsError(false);

    if (email === "pending@test.com") {
      setLoginError("Your account is awaiting approval. Please contact the administrator.");
      return;
    }
    if (email === "locked@test.com") {
      setLoginError("Your account is locked. Please try again in 30 minutes or contact the administrator.");
      return;
    }

    /* Try real auth */
    const success = login(email, password, true);
    if (!success) {
      /* Fallback: any email/password combo works for prototype */
      login("demo", "demo", true);
    }
    setLoginError(null);
    toast.success("Login Successful", { description: "Redirecting to Dashboard..." });
    navigate("/app/dashboard");
  };

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Skeleton className="h-10 w-40 mb-8" />
        <Skeleton className="h-80 w-96" />
        <ToolbarInline state={state} setState={setState} />
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <h2 className="text-xl font-semibold">Login</h2>
          <p className="text-muted-foreground mt-2">Enter your credentials to access the system.</p>
        </Card>
        <ToolbarInline state={state} setState={setState} />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Login Error</AlertTitle>
          <AlertDescription>An unexpected error occurred. Please try again.</AlertDescription>
          <Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button>
        </Alert>
        <ToolbarInline state={state} setState={setState} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      {/* ── Animated Background (Left) ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #1a1a2e 100%)",
        }}
      >
        {/* Animated geometric lines */}
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="200" x2="1200" y2="400" stroke="#FF6000" strokeWidth="0.5" className="animate-pulse" />
            <line x1="0" y1="400" x2="1200" y2="200" stroke="#FF6000" strokeWidth="0.5" style={{ animationDelay: "0.5s" }} className="animate-pulse" />
            <line x1="200" y1="0" x2="600" y2="800" stroke="#FF8C00" strokeWidth="0.3" style={{ animationDelay: "1s" }} className="animate-pulse" />
            <line x1="800" y1="0" x2="400" y2="800" stroke="#FF8C00" strokeWidth="0.3" style={{ animationDelay: "1.5s" }} className="animate-pulse" />
            <line x1="0" y1="600" x2="1200" y2="300" stroke="#009505" strokeWidth="0.3" style={{ animationDelay: "2s" }} className="animate-pulse" />
            <circle cx="200" cy="200" r="150" stroke="#FF6000" strokeWidth="0.3" fill="none" opacity="0.3" />
            <circle cx="900" cy="600" r="200" stroke="#009505" strokeWidth="0.3" fill="none" opacity="0.2" />
            <circle cx="600" cy="100" r="80" stroke="#FF8C00" strokeWidth="0.5" fill="none" opacity="0.2" />
          </svg>
          {/* Floating particles */}
          <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-[#FF6000] rounded-full opacity-40 animate-bounce" style={{ animationDuration: "3s" }} />
          <div className="absolute top-[60%] left-[30%] w-1.5 h-1.5 bg-[#009505] rounded-full opacity-30 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }} />
          <div className="absolute top-[40%] left-[70%] w-2.5 h-2.5 bg-[#FF8C00] rounded-full opacity-25 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }} />
          <div className="absolute top-[80%] left-[60%] w-1 h-1 bg-white rounded-full opacity-20 animate-bounce" style={{ animationDuration: "5s", animationDelay: "2s" }} />
        </div>

        {/* Brand Content */}
        <div className="relative z-10 px-16 max-w-2xl">
          {/* Logo */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 180deg, #FF6000, #FF8C00, #FFCF8F, #FF6000)" }} />
                <div className="absolute inset-[3px] rounded-full bg-[#1a1a2e] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                    <path d="M12 3C7.5 3 4 6.5 4 11c0 3 1.5 5.5 4 7l1-2c-2-1-3-3-3-5 0-3.3 2.7-6 6-6s6 2.7 6 6c0 2-1 3.8-2.5 5l1 2c2.3-1.5 3.5-4 3.5-7 0-4.5-3.5-8-8-8z" fill="#FF6000" />
                    <circle cx="12" cy="4" r="2.5" fill="#009505" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">DOTBIZ</h1>
                <p className="text-sm text-gray-400 tracking-widest uppercase">by OhMyHotel&Co</p>
              </div>
            </div>
          </div>

          {/* Tagline — "서플라이어 아키텍처"가 무엇인지 궁금하게 만드는 카피.
           * 우리가 무엇이 아닌지(베드뱅크/어그리게이터)는 명시하지 않음 — 카테고리 자체를 새로 만든다는 인상. */}
          <h2 className="text-5xl font-bold leading-tight mb-6" style={{ background: "linear-gradient(90deg, #FF6000, #FF8C00, #FFCF8F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Supplier Architecture
            <br />
            for Global B2B Hotels
          </h2>
          <p className="text-xl text-gray-300 font-light leading-relaxed mb-3">
            Inventory, rates, and policies —
            <br />
            orchestrated as one live supply system.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-[520px]">
            호텔 재고·가격·정책을 하나의 시스템으로 오케스트레이션하는 라이브 공급 레이어.
            DOTBIZ는 파트너에게 늘 최상의 공급을 만들어냅니다.
          </p>

          {/* Feature badges — 공급 차별화 키워드. AI 표현은 사용하지 않음. */}
          <div className="flex flex-wrap gap-3">
            {["Direct Hotel Supply", "Inventory Optimization", "Dynamic Rate Engine", "Real-time Settlement", "Multi-Currency"].map(f => (
              <span key={f} className="px-4 py-2 rounded-full text-sm font-medium border border-[#FF6000]/30 text-[#FF8C00] bg-[#FF6000]/10 backdrop-blur-sm">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Login Form ── */}
      <div className="flex-1 lg:max-w-[520px] flex flex-col bg-white dark:bg-slate-900">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>EN</span>
            <ChevronDown className="h-3 w-3" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleDark} className="h-8 w-8">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-12">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 180deg, #FF6000, #FF8C00, #FFCF8F, #FF6000)" }} />
              <div className="absolute inset-[2px] rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path d="M12 3C7.5 3 4 6.5 4 11c0 3 1.5 5.5 4 7l1-2c-2-1-3-3-3-5 0-3.3 2.7-6 6-6s6 2.7 6 6c0 2-1 3.8-2.5 5l1 2c2.3-1.5 3.5-4 3.5-7 0-4.5-3.5-8-8-8z" fill="#FF6000" />
                  <circle cx="12" cy="4" r="2.5" fill="#009505" />
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold" style={{ color: "#FF6000" }}>DOTBIZ</span>
          </div>

          <div className="max-w-sm w-full mx-auto lg:mx-0">
            <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
            <p className="text-muted-foreground mb-8">Sign in to your DOTBIZ account</p>

            {loginError && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{loginError}</AlertDescription>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => setLoginError(null)}>OK</Button>
              </Alert>
            )}

            <div className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="text-sm font-medium text-foreground">Email <span className="text-destructive">*</span></label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@company.com"
                    className="pl-10 h-12 text-[15px] rounded-xl bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 focus:border-[#FF6000] focus:ring-[#FF6000]/20"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => validate("email", email, { required: true, rules: [{ type: "email", message: "Please enter a valid email address" }] })}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="text-sm font-medium text-foreground">Password <span className="text-destructive">*</span></label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-12 text-[15px] rounded-xl bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 focus:border-[#FF6000] focus:ring-[#FF6000]/20"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onBlur={() => validate("password", password, { required: true, rules: [{ type: "maxLength", value: 128, message: "Password must not exceed 128 characters" }] })}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Remember me</label>
                </div>
                <button onClick={() => toast.info("Password reset link sent to your email.")} className="text-sm font-medium hover:underline" style={{ color: "#FF6000" }}>
                  Forgot password?
                </button>
              </div>

              {/* Terms Agreement */}
              <div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="agree-terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => { setAgreeTerms(checked === true); if (checked) setTermsError(false); }}
                    className="mt-0.5"
                  />
                  <label htmlFor="agree-terms" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                    I have read and agree to the{" "}
                    <a href="#" onClick={e => { e.preventDefault(); setShowTerms(true); }} className="font-medium underline underline-offset-2 hover:text-foreground" style={{ color: "#FF6000" }}>
                      DOTBIZ Platform Service Agreement
                    </a>
                    ,{" "}
                    <a href="#" onClick={e => { e.preventDefault(); setShowPrivacy(true); }} className="font-medium underline underline-offset-2 hover:text-foreground" style={{ color: "#FF6000" }}>
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>
                {termsError && (
                  <p className="text-sm text-destructive mt-1.5">Please read and accept the service terms</p>
                )}
              </div>

              {/* Login button */}
              <Button
                className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-[#FF6000]/20 hover:shadow-[#FF6000]/30 transition-all"
                style={{ background: "linear-gradient(135deg, #FF6000, #FF8C00)", color: "white" }}
                onClick={handleLogin}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-slate-700" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-white dark:bg-slate-900 px-3 text-muted-foreground">New to DOTBIZ?</span></div>
              </div>

              {/* Register */}
              <Button
                variant="outline"
                className="w-full h-12 text-base font-medium rounded-xl border-2 border-[#FF6000]/30 text-[#FF6000] hover:bg-[#FF6000]/5"
                onClick={() => navigate("/register")}
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 OhMyHotel&Co. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Privacy Policy Dialog ── */}
      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-[#FF6000]/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#FF6000]/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-[#FF6000]" />
              </div>
              <div>
                <DialogTitle className="text-lg">Privacy Policy</DialogTitle>
                <p className="text-sm text-muted-foreground">OHMYHOTEL GLOBAL PTE. LTD.</p>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(85vh-130px)] px-6 py-5">
            <div className="prose prose-sm max-w-none text-foreground space-y-6">
              {/* Company Info */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-bold text-foreground mb-2">Company Information</h3>
                <div className="grid grid-cols-[120px_1fr] gap-y-1 text-sm">
                  <span className="text-muted-foreground">Company</span><span>OHMYHOTEL GLOBAL PTE. LTD.</span>
                  <span className="text-muted-foreground">Representative</span><span>LEE MISOON</span>
                  <span className="text-muted-foreground">Reg. Number</span><span>202543984E</span>
                  <span className="text-muted-foreground">Address</span><span>111 Somerset Road, #06-01H, 111 Somerset, Singapore 238164</span>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-bold text-foreground mb-2">Entrustment of Personal Information Processing</h3>
                <p className="text-sm leading-relaxed">The Company entrusts the processing of personal information and the operation of the customer center to the following Korean corporation.</p>
                <div className="grid grid-cols-[120px_1fr] gap-y-1 text-sm mt-2">
                  <span className="text-muted-foreground">Company</span><span>OHMYHOTEL & CO., LTD.</span>
                  <span className="text-muted-foreground">Representative</span><span>Lee Misoon</span>
                  <span className="text-muted-foreground">Reg. Number</span><span>105-87-71311</span>
                  <span className="text-muted-foreground">Address</span><span>GT Dongdaemun Bldg 6F, 328 Jongno, Jongno-gu, Seoul, Korea</span>
                  <span className="text-muted-foreground">Tel</span><span>+82-2-762-0552 (Weekdays 09:00~18:00 KST)</span>
                  <span className="text-muted-foreground">PI Manager</span><span>Lee Misoon</span>
                  <span className="text-muted-foreground">Mail-order Reg.</span><span>2020-Seoul Jongno-0399</span>
                </div>
              </div>

              {/* Section 01 */}
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#FF6000] text-white text-xs font-bold">01</span>
                  Consent to Collection of Personal Information
                </h3>
                <p className="text-sm leading-relaxed mt-2">The Company manages online/offline personal information collection in a unified manner due to the nature of the travel business to facilitate smooth consultations. Personal information provided when registering on the website is also utilized for offline consultations. The Company provides a procedure for users to click an "Agree" button or a "Cancel" button regarding the contents of the Privacy Policy or Terms of Use when registering, and clicking the "Agree" button shall be deemed consent to the collection of personal information.</p>
              </div>

              {/* Section 02 */}
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#FF6000] text-white text-xs font-bold">02</span>
                  Purpose of Collection and Use of Personal Information
                </h3>
                <div className="mt-2 space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold">I. Performance of contracts related to service provision</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">Travel product (hotel) reservations, confirmation and consultation of reservation details, content provision, preferential treatment for members, accumulation/inquiry/use of points, purchase and payment of fees, delivery of goods or billing statements, financial services, etc.</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">II. Member management</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">Prevention of unauthorized use by delinquent members, verification of intent to register, record preservation for dispute resolution, complaint handling, delivery of notices, etc.</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">III. Utilization for marketing and advertising</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">Development of new services, provision of services and advertisements, product information delivery, event advertising, statistics on members' service usage, various marketing activities.</p>
                  </div>
                </div>

                <div className="mt-4 border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-muted/70"><th className="text-left px-3 py-2 font-semibold">Category</th><th className="text-left px-3 py-2 font-semibold">Items Collected</th></tr></thead>
                    <tbody className="divide-y">
                      <tr><td className="px-3 py-2 font-medium align-top">Member Info (Required)</td><td className="px-3 py-2 text-muted-foreground">Agency name, address, name, login ID, password, email, phone, mobile, bank name/account/holder</td></tr>
                      <tr className="bg-muted/30"><td className="px-3 py-2 font-medium align-top">Member Info (Optional)</td><td className="px-3 py-2 text-muted-foreground">Company logo, fax number</td></tr>
                      <tr><td className="px-3 py-2 font-medium align-top">Hotel Reservation</td><td className="px-3 py-2 text-muted-foreground">Booker: name, email/mobile · Traveler: name (Korean/English)</td></tr>
                      <tr className="bg-muted/30"><td className="px-3 py-2 font-medium align-top">Payment & Settlement</td><td className="px-3 py-2 text-muted-foreground">Name, card company, card number, authorization number, account number, contact, amount</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 03 */}
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#FF6000] text-white text-xs font-bold">03</span>
                  Retention and Usage Period
                </h3>
                <p className="text-sm leading-relaxed mt-2">Personal information collected with consent is retained while the user uses services. The Company will promptly destroy collected personal information when the purpose has been achieved.</p>
                <div className="mt-3 border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-muted/70"><th className="text-left px-3 py-2 font-semibold">Record Type</th><th className="text-left px-3 py-2 font-semibold">Period</th><th className="text-left px-3 py-2 font-semibold">Legal Basis</th></tr></thead>
                    <tbody className="divide-y">
                      <tr><td className="px-3 py-2">Contracts / withdrawal of offers</td><td className="px-3 py-2 font-medium">5 years</td><td className="px-3 py-2 text-muted-foreground text-xs">Consumer Protection in E-Commerce Act</td></tr>
                      <tr className="bg-muted/30"><td className="px-3 py-2">Payment and supply of goods</td><td className="px-3 py-2 font-medium">5 years</td><td className="px-3 py-2 text-muted-foreground text-xs">Consumer Protection in E-Commerce Act</td></tr>
                      <tr><td className="px-3 py-2">Consumer complaints / disputes</td><td className="px-3 py-2 font-medium">3 years</td><td className="px-3 py-2 text-muted-foreground text-xs">Consumer Protection in E-Commerce Act</td></tr>
                      <tr className="bg-muted/30"><td className="px-3 py-2">Credit information</td><td className="px-3 py-2 font-medium">3 years</td><td className="px-3 py-2 text-muted-foreground text-xs">Credit Information Act</td></tr>
                      <tr><td className="px-3 py-2">Identity verification</td><td className="px-3 py-2 font-medium">6 months</td><td className="px-3 py-2 text-muted-foreground text-xs">Information and Communications Network Act</td></tr>
                      <tr className="bg-muted/30"><td className="px-3 py-2">Website visit records</td><td className="px-3 py-2 font-medium">3 months</td><td className="px-3 py-2 text-muted-foreground text-xs">Protection of Communications Secrets Act</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 04 */}
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#FF6000] text-white text-xs font-bold">04</span>
                  Destruction of Personal Information
                </h3>
                <p className="text-sm leading-relaxed mt-2">The Company promptly destroys personal information after the purpose of its collection has been achieved. Information is transferred to a separate database after purpose achievement and destroyed after a certain period in accordance with internal policies and relevant laws. Credit card information is managed in encrypted form and permanently deleted upon payment and cancellation.</p>
              </div>

              {/* Section 05 */}
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#FF6000] text-white text-xs font-bold">05</span>
                  Rights of Users and Legal Representatives
                </h3>
                <p className="text-sm leading-relaxed mt-2">Users and legal representatives may view or modify their registered personal information at any time and may request membership withdrawal. To view and modify personal information, click on 'Change Personal Information'; for membership withdrawal, click on 'Withdraw Membership' and complete the identity verification process. Alternatively, contact the Personal Information Manager in writing, by phone, or by email.</p>
              </div>

              {/* Section 06 */}
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#FF6000] text-white text-xs font-bold">06</span>
                  Cookies and Automatic Collection Devices
                </h3>
                <p className="text-sm leading-relaxed mt-2">The Company operates 'cookies' to store and retrieve your information periodically. Cookies are used to analyze access frequency, identify user preferences, and conduct targeted marketing. You have the option to accept or refuse cookie installation through your web browser settings. However, refusing cookies may cause difficulties in service provision.</p>
              </div>

              {/* Section 07/08/09 combined as Technical/Admin */}
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#FF6000] text-white text-xs font-bold">07</span>
                  Technical / Administrative Protective Measures
                </h3>
                <div className="mt-2 space-y-2">
                  <h4 className="text-sm font-semibold">Technical Measures</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Data backup to prepare for damage to personal information</li>
                    <li>Regular updates of the latest antivirus programs</li>
                    <li>Adoption of security devices (SSL) for encryption</li>
                    <li>Control of unauthorized access using intrusion prevention systems</li>
                  </ul>
                  <h4 className="text-sm font-semibold mt-3">Administrative Measures</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Personnel handling personal information limited to designated staff only</li>
                    <li>Assignment of separate login IDs and passwords</li>
                    <li>Regular training on personal information protection</li>
                    <li>Security pledge agreements from all employees upon hiring</li>
                    <li>Designation of computer rooms and data storage rooms as special protection areas</li>
                  </ul>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#FF6000] text-white text-xs font-bold">08</span>
                  Contact Information
                </h3>
                <p className="text-sm leading-relaxed mt-2">You may report all complaints related to personal information protection to the Personal Information Manager. The Company will provide prompt and sufficient responses.</p>
                <div className="bg-muted/50 rounded-lg p-3 mt-2 text-sm">
                  <p><strong>Personal Information Manager:</strong> Lee Misoon</p>
                  <p><strong>Email:</strong> privacy@ohmyhotel.com</p>
                  <p><strong>Tel:</strong> +82-2-762-0552</p>
                </div>
              </div>

              {/* Notification */}
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#FF6000] text-white text-xs font-bold">09</span>
                  Obligation of Notification
                </h3>
                <p className="text-sm leading-relaxed mt-2">Any additions, deletions, or modifications to the current Privacy Policy will be notified through the notice section on the website. The information posted on this site may contain errors or delays, and the responsibility for using such information lies with the user. Users may not reproduce or copy this information without authorization.</p>
              </div>

              <p className="text-xs text-muted-foreground text-center pt-4 border-t">Effective Date: March 1, 2026 · OHMYHOTEL GLOBAL PTE. LTD.</p>
            </div>
          </ScrollArea>
          <div className="px-6 py-3 border-t flex justify-end">
            <Button onClick={() => setShowPrivacy(false)} style={{ background: "#FF6000" }}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Service Agreement Dialog ── */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-[#FF6000]/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#FF6000]/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-[#FF6000]" />
              </div>
              <div>
                <DialogTitle className="text-lg">DOTBIZ Platform Service Agreement</DialogTitle>
                <p className="text-sm text-muted-foreground">OHMYHOTEL GLOBAL PTE. LTD.</p>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(85vh-130px)] px-6 py-5">
            <div className="prose prose-sm max-w-none text-foreground space-y-5">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#FF6000] text-white text-xs font-bold">01</span>
                  Purpose
                </h3>
                <p className="text-sm leading-relaxed mt-2">This Agreement sets forth the terms and conditions for the use of the DOTBIZ B2B Hotel Booking Platform ("Service") provided by OHMYHOTEL GLOBAL PTE. LTD. ("Company") and the rights, obligations, and responsibilities between the Company and Members.</p>
              </div>
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#FF6000] text-white text-xs font-bold">02</span>
                  Definitions
                </h3>
                <ul className="text-sm space-y-1 list-disc list-inside mt-2 text-muted-foreground">
                  <li><strong className="text-foreground">"Service"</strong> refers to the DOTBIZ B2B hotel booking platform and all related services.</li>
                  <li><strong className="text-foreground">"Member"</strong> refers to a travel agency or operating partner who has agreed to this Agreement and registered an account.</li>
                  <li><strong className="text-foreground">"Net Rate"</strong> refers to the wholesale hotel rate provided by the Company, upon which Members may set their own margin.</li>
                  <li><strong className="text-foreground">"Operating Partner (OP)"</strong> refers to a Member's sub-account for booking operations.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#FF6000] text-white text-xs font-bold">03</span>
                  Service Provision
                </h3>
                <p className="text-sm leading-relaxed mt-2">The Company provides hotel search and booking services, settlement and payment processing, voucher generation, AI-powered recommendations, and related B2B travel services. The Company may modify, suspend, or discontinue the Service with prior notice, except in cases of force majeure.</p>
              </div>
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#FF6000] text-white text-xs font-bold">04</span>
                  Member Obligations
                </h3>
                <ul className="text-sm space-y-1 list-disc list-inside mt-2 text-muted-foreground">
                  <li>Members shall provide accurate and current information during registration.</li>
                  <li>Members shall not share their account credentials with unauthorized parties.</li>
                  <li>Members shall comply with all applicable laws and regulations regarding their use of the Service.</li>
                  <li>Members shall not use the Service for any illegal, fraudulent, or unauthorized purposes.</li>
                  <li>Members are responsible for all activities under their account.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#FF6000] text-white text-xs font-bold">05</span>
                  Payment and Settlement
                </h3>
                <p className="text-sm leading-relaxed mt-2">Payment methods include prepaid (corporate card, Reserve Now Pay Later) and postpaid (floating deposit, credit line) options. Settlement is processed monthly. Cancellation fees are applied according to hotel policies and cancellation timing. The Company reserves the right to suspend services for overdue accounts.</p>
              </div>
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#FF6000] text-white text-xs font-bold">06</span>
                  Limitation of Liability
                </h3>
                <p className="text-sm leading-relaxed mt-2">The Company shall not be liable for damages resulting from force majeure events, Member negligence, or third-party actions. Hotel service quality, amenities, and conditions are the responsibility of the respective hotel providers. The Company's liability is limited to the fees charged for the Service.</p>
              </div>
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#FF6000] text-white text-xs font-bold">07</span>
                  Governing Law and Jurisdiction
                </h3>
                <p className="text-sm leading-relaxed mt-2">This Agreement is governed by and construed in accordance with the laws of the Republic of Singapore. Any disputes arising from this Agreement shall be subject to the exclusive jurisdiction of the courts of Singapore.</p>
              </div>
              <p className="text-xs text-muted-foreground text-center pt-4 border-t">Effective Date: March 1, 2026 · OHMYHOTEL GLOBAL PTE. LTD.</p>
            </div>
          </ScrollArea>
          <div className="px-6 py-3 border-t flex justify-end">
            <Button onClick={() => setShowTerms(false)} style={{ background: "#FF6000" }}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ToolbarInline state={state} setState={setState} />
    </div>
  );
}

function ToolbarInline({ state, setState }: { state: string; setState: (s: "loading" | "empty" | "error" | "success") => void }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-muted border rounded-full px-3 py-1.5 shadow-lg flex items-center gap-2">
      {(["loading", "empty", "error", "success"] as const).map(s => (
        <Button key={s} size="sm" variant={state === s ? "default" : "outline"} onClick={() => setState(s)}>
          {s}
        </Button>
      ))}
    </div>
  );
}
