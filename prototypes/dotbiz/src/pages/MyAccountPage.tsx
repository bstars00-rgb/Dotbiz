import { useState } from "react";
import { User, Mail, Phone, Lock, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useScreenState } from "@/hooks/useScreenState";
import { StateToolbar } from "@/components/StateToolbar";
import { useI18n } from "@/contexts/I18nContext";
import { currentUser } from "@/mocks/users";
import { currentCompany } from "@/mocks/companies";
import { toast } from "sonner";

export default function MyAccountPage() {
  const { state, setState } = useScreenState("success");
  const { t } = useI18n();
  const [changePassOpen, setChangePassOpen] = useState(false);

  if (state === "loading") return (<div className="p-6 space-y-4"><Skeleton className="h-48 w-full" /><Skeleton className="h-32 w-full" /><StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">Account Not Found</h2></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>Account Error</AlertTitle><AlertDescription>Failed to load account data.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <h1 className="text-2xl font-bold">{t("page.myAccount")}</h1>
      <p className="text-sm text-muted-foreground -mt-2">Your personal profile, contact details, and password.</p>

      {/* ─── Personal Information + Password ─── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Full Name <span className="text-destructive">*</span></label>
            <div className="relative mt-1">
              <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input defaultValue={currentUser.fullName} className="pl-9" />
            </div>
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
              <Input defaultValue={currentUser.phone} className="pl-9" />
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
      </Card>

      {/* ─── Company Info (read-only) ─── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Company Information</h2>
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
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Changes Saved")}>
          <Save className="h-4 w-4 mr-2" />Save Changes
        </Button>
      </div>

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
