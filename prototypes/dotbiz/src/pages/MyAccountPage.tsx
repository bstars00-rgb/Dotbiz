import { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, Save, RefreshCw, Bell, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useScreenState } from "@/hooks/useScreenState";
import { useTabParam } from "@/hooks/useTabParam";
import { StateToolbar } from "@/components/StateToolbar";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { currentUser } from "@/mocks/users";
import { currentCompany } from "@/mocks/companies";
import { toast } from "sonner";

/* mockCoupons moved to clientManagement mock as companyCoupons */

export default function MyAccountPage() {
  const { state, setState } = useScreenState("success");
  const { t } = useI18n();
  const { hasRole } = useAuth();
  const [accountTab, setAccountTab] = useTabParam("profile");
  const [changePassOpen, setChangePassOpen] = useState(false);

  /* Notification settings */
  const [notifConfirmEmail, setNotifConfirmEmail] = useState(true);
  const [notifVoucherEmail, setNotifVoucherEmail] = useState(true);
  const [notifVoucherWeChat, setNotifVoucherWeChat] = useState(false);
  const [notifFreeCancelAlert, setNotifFreeCancelAlert] = useState(true);
  const [notifBookingUpdate, setNotifBookingUpdate] = useState(true);
  const [notifPromotion, setNotifPromotion] = useState(false);

  if (state === "loading") return (<div className="p-6 space-y-4"><Skeleton className="h-48 w-full" /><Skeleton className="h-32 w-full" /><StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">Account Not Found</h2></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>Account Error</AlertTitle><AlertDescription>Failed to load account data.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">{t("page.myAccount")}</h1>

      <Tabs value={accountTab} onValueChange={setAccountTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* ══════ Profile Tab ══════ */}
        <TabsContent value="profile" className="space-y-5 mt-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Full Name <span className="text-destructive">*</span></label>
                <div className="relative mt-1"><User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input defaultValue={currentUser.fullName} className="pl-9" /></div>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <div className="relative mt-1"><Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input defaultValue={currentUser.email} className="pl-9" disabled /></div>
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <div className="relative mt-1"><Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input defaultValue={currentUser.phone} className="pl-9" /></div>
              </div>
              <div>
                <label className="text-sm font-medium">Notification Email</label>
                <div className="relative mt-1"><Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input defaultValue={currentUser.email} className="pl-9" placeholder="Separate email for notifications" /></div>
              </div>
            </div>
          </Card>

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

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Client Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg"><p className="text-xs text-muted-foreground">Client ID</p><p className="font-mono font-medium">CLI-2024-0001</p></div>
              <div className="p-3 bg-muted/50 rounded-lg"><p className="text-xs text-muted-foreground">Status</p><Badge variant="default">Active</Badge></div>
              <div className="p-3 bg-muted/50 rounded-lg"><p className="text-xs text-muted-foreground">Account Balance</p><p className="text-lg font-bold" style={{ color: "#FF6000" }}>$25,400</p></div>
              <div className="p-3 bg-muted/50 rounded-lg"><p className="text-xs text-muted-foreground">Credit Line</p><p className="text-lg font-bold">$50,000</p></div>
            </div>
          </Card>

          <Button onClick={() => toast.success("Changes Saved")}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
        </TabsContent>

        {/* ══════ Security Tab ══════ */}
        <TabsContent value="security" className="space-y-5 mt-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Shield className="h-5 w-5" />Password</h2>
            {/* Password age warning */}
            <Alert className="mb-4"><AlertTriangle className="h-4 w-4" /><AlertTitle>Password Change Recommended</AlertTitle><AlertDescription>Your password was last changed 145 days ago. We recommend changing it every 180 days for security.</AlertDescription></Alert>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <div><p className="text-sm font-medium">Last Changed</p><p className="text-xs text-muted-foreground">2025-11-22 (145 days ago)</p></div>
                <Button variant="outline" onClick={() => setChangePassOpen(true)}><Lock className="h-4 w-4 mr-1" />Change Password</Button>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <div><p className="text-sm font-medium">Two-Factor Authentication</p><p className="text-xs text-muted-foreground">Add an extra layer of security</p></div>
                <Badge variant="secondary">Not Enabled</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <div><p className="text-sm font-medium">Active Sessions</p><p className="text-xs text-muted-foreground">2 devices currently logged in</p></div>
                <Button variant="outline" size="sm">View Sessions</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notification Settings tab removed.
         * Alert rules (which types are on, which channels they use, quiet hours)
         * are controlled by OhMyHotel from ELLIS admin — NOT exposed to customers.
         * If users could turn off critical alerts (credit_critical, payment deadline,
         * hotel cancellation), the entire alert system loses its risk-mitigation
         * value. Channel preferences (Email/SMS/Slack) are managed by AM during
         * onboarding based on the customer's operational setup.
         *
         * Card Management + My Coupons tabs removed — moved to Team page.
         * Cards and Coupons are company-level assets (saved cards work for the
         * whole company's PREPAY bookings, coupons earned by the company as a
         * whole), so they belong in Master's Team management.
         *
         * OP Management tab also removed earlier (moved to Team > Sub-accounts).
         * My Account is for personal settings only; sub-account administration is a
         * company-level concern and lives in the Team section. */}
      </Tabs>

      {/* ── Dialogs ── */}
      <Dialog open={changePassOpen} onOpenChange={setChangePassOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium">Current Password</label><Input type="password" className="mt-1" /></div>
            <div><label className="text-sm font-medium">New Password</label><Input type="password" className="mt-1" /></div>
            <div><label className="text-sm font-medium">Confirm New Password</label><Input type="password" className="mt-1" /></div>
            <p className="text-xs text-muted-foreground">Password must be at least 8 characters with uppercase, lowercase, and number.</p>
          </div>
          <DialogFooter><Button onClick={() => { setChangePassOpen(false); toast.success("Password changed!"); }}>Update Password</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}

/* CardManagementSection moved to ClientManagementPage (Team > Payment Cards). */
