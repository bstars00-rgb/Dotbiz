import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Mail, Phone, Lock, Save, RefreshCw, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useScreenState } from "@/hooks/useScreenState";
import { StateToolbar } from "@/components/StateToolbar";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { currentUser } from "@/mocks/users";
import { currentCompany } from "@/mocks/companies";
import { userPointsState, tierFor } from "@/mocks/rewards";
import { toast } from "sonner";

export default function MyAccountPage() {
  const { state, setState } = useScreenState("success");
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [changePassOpen, setChangePassOpen] = useState(false);

  /* My reward points (read-only summary) */
  const myPoints = userPointsState[user?.email || ""] || null;
  const myTier = myPoints ? tierFor(myPoints.bookingCount) : null;

  /* Controlled form state with simple required-field validation.
   * Save button is disabled when any required field is blank, and we
   * surface a per-field error message so the user knows why. */
  const [fullName, setFullName] = useState<string>(currentUser.fullName);
  const [phone, setPhone] = useState<string>(currentUser.phone);
  const [showErrors, setShowErrors] = useState(false);

  const nameError = fullName.trim().length === 0 ? "Full name is required." : "";
  const hasErrors = !!nameError;

  const handleSave = () => {
    if (hasErrors) {
      setShowErrors(true);
      toast.error("Please fix the highlighted fields before saving.");
      return;
    }
    setShowErrors(false);
    toast.success("Profile saved");
  };

  if (state === "loading") return (<div className="p-6 space-y-4"><Skeleton className="h-48 w-full" /><Skeleton className="h-32 w-full" /><StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">Account Not Found</h2></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>Account Error</AlertTitle><AlertDescription>Failed to load account data.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <h1 className="text-2xl font-bold">{t("page.myAccount")}</h1>
      <p className="text-sm text-muted-foreground -mt-2">Your personal profile, contact details, and password.</p>

      {/* ─── Personal Information + Password ─── */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <Badge variant="outline" className="text-[10px]">Editable</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Full Name <span className="text-destructive">*</span></label>
            <div className="relative mt-1">
              <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                onBlur={() => setShowErrors(true)}
                className={`pl-9 ${showErrors && nameError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                aria-invalid={showErrors && !!nameError}
                aria-describedby="fullname-error"
                placeholder="Enter your full name"
              />
            </div>
            {showErrors && nameError && (
              <p id="fullname-error" className="text-[11px] text-destructive mt-1">
                {nameError}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input defaultValue={currentUser.email} className="pl-9" disabled />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed directly. Contact your Master to update.</p>
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <div className="relative mt-1">
              <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="pl-9"
                placeholder="+82-10-0000-0000"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 px-3 py-2 border rounded-md bg-muted/40 text-sm text-muted-foreground font-mono">
                ••••••••••
              </div>
              <Button variant="outline" size="sm" onClick={() => setChangePassOpen(true)}>
                <Lock className="h-3.5 w-3.5 mr-1" />Change
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Last changed 2025-11-22 · 145 days ago</p>
          </div>
        </div>

        {/* Save scope is clearly limited to this card.
         * Button is disabled when required fields are invalid so the user
         * can't even submit a broken state — belt + suspenders with the
         * client-side error messaging above. */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t gap-3">
          <p className="text-[11px] text-muted-foreground">
            <span className="text-destructive">*</span> Required
          </p>
          <Button onClick={handleSave} disabled={hasErrors}>
            <Save className="h-4 w-4 mr-2" />Save Profile
          </Button>
        </div>
      </Card>

      {/* ─── Reward Points mini-widget ─── */}
      {myPoints && myTier && (
        <Card
          className="p-5 cursor-pointer hover:shadow-md transition-shadow overflow-hidden relative"
          style={{ background: `linear-gradient(90deg, ${myTier.color}18, transparent 60%)` }}
          onClick={() => navigate("/app/rewards")}
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Sparkles className="h-8 w-8" style={{ color: "#FF6000" }} />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">My ELS Wallet</p>
                <p className="text-2xl font-bold" style={{ color: "#FF6000" }}>
                  {myPoints.balance.toLocaleString()} <span className="text-sm text-muted-foreground">ELS</span>
                </p>
                <p className="text-[10px] text-muted-foreground">≈ US${myPoints.balance.toLocaleString()}.00 · 1 ELS = 1 USD</p>
              </div>
              <div className="border-l pl-4 ml-2">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Tier</p>
                <p className="text-base font-bold" style={{ color: myTier.color }}>
                  {myTier.icon} {myTier.name}
                </p>
                <p className="text-[10px] text-muted-foreground">{myPoints.bookingCount} bookings · {myTier.multiplier}× earn</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Open Rewards <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* ─── Company Info (read-only, contract-bound) ─── */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Company Information</h2>
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Lock className="h-2.5 w-2.5" /> Read-only
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Company details are tied to your signed contract. To update any field below, please contact
          your OhMyHotel account manager — changes require a contract amendment.
        </p>
        <div>
          {[
            { label: "Company Name", value: currentCompany.name },
            { label: "Business Reg. No", value: currentCompany.businessRegNo },
            { label: "Business Type", value: <Badge key="bt">{currentCompany.businessType}</Badge> },
            { label: "Address", value: currentCompany.address },
            { label: "Contract Date", value: currentCompany.contractDate },
          ].map(item => (
            <div key={String(item.label)} className="flex justify-between py-2 border-b last:border-0">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm">{item.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── Change Password Dialog ─── */}
      <Dialog open={changePassOpen} onOpenChange={setChangePassOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Current Password</label>
              <Input type="password" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">New Password</label>
              <Input type="password" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Confirm New Password</label>
              <Input type="password" className="mt-1" />
            </div>
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters with uppercase, lowercase, and number.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePassOpen(false)}>Cancel</Button>
            <Button onClick={() => { setChangePassOpen(false); toast.success("Password changed!"); }}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}

/* Previously this page had tabs for Profile / Security / Notifications /
 * Cards / Coupons / OP Management.  Everything except personal profile +
 * password has moved:
 *   - Cards, Coupons, OP/Sub-account management → Master Account (/app/client)
 *   - Notifications preferences → ELLIS admin (customers cannot toggle)
 *   - 2FA + Active Sessions → removed (ELLIS admin territory)
 * My Account is intentionally minimal: per-user profile fields + password. */
