import { useState } from "react";
import { User, Mail, Phone, Lock, Plus, Save, RefreshCw, Bell, Shield, Ticket, AlertTriangle } from "lucide-react";
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
import { StateToolbar } from "@/components/StateToolbar";
import { useAuth } from "@/contexts/AuthContext";
import { currentUser } from "@/mocks/users";
import { currentCompany } from "@/mocks/companies";
import { operatingPartners } from "@/mocks/operatingPartners";
import { toast } from "sonner";

const mockCoupons = {
  unused: [
    { id: "cp-001", name: "Spring Welcome 5% Off", discount: "5%", validUntil: "2026-06-30", minOrder: "$200", applicable: "All Hotels" },
    { id: "cp-002", name: "New User $20 Off", discount: "$20", validUntil: "2026-05-15", minOrder: "$300", applicable: "Featured Hotels" },
  ],
  used: [
    { id: "cp-003", name: "Winter Sale 10% Off", discount: "10%", usedDate: "2026-02-15", booking: "ELS-2026-00128" },
  ],
  expired: [
    { id: "cp-004", name: "Holiday $15 Off", discount: "$15", expiredDate: "2026-01-31" },
  ],
};

export default function MyAccountPage() {
  const { state, setState } = useScreenState("success");
  const { hasRole } = useAuth();
  const [addOpOpen, setAddOpOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
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
      <h1 className="text-2xl font-bold">My Account</h1>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notification Settings</TabsTrigger>
          <TabsTrigger value="coupons">My Coupons</TabsTrigger>
          {hasRole(["Master"]) && <TabsTrigger value="ops">OP Management</TabsTrigger>}
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

        {/* ══════ Notification Settings Tab ══════ */}
        <TabsContent value="notifications" className="space-y-5 mt-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Bell className="h-5 w-5" />Hotel Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div><p className="text-sm font-medium">Confirmation Number via Email</p><p className="text-xs text-muted-foreground">Receive hotel confirmation numbers via email</p></div>
                <button role="switch" aria-checked={notifConfirmEmail} aria-label="Confirmation email notification" onClick={() => setNotifConfirmEmail(!notifConfirmEmail)} className={`w-11 h-6 rounded-full transition-colors ${notifConfirmEmail ? "bg-primary" : "bg-muted"}`}><div className={`h-5 w-5 bg-white rounded-full shadow transition-transform ${notifConfirmEmail ? "translate-x-5.5" : "translate-x-0.5"}`} /></button>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div><p className="text-sm font-medium">Voucher via Email</p><p className="text-xs text-muted-foreground">Receive booking vouchers via email</p></div>
                <button role="switch" aria-checked={notifVoucherEmail} aria-label="Voucher email notification" onClick={() => setNotifVoucherEmail(!notifVoucherEmail)} className={`w-11 h-6 rounded-full transition-colors ${notifVoucherEmail ? "bg-primary" : "bg-muted"}`}><div className={`h-5 w-5 bg-white rounded-full shadow transition-transform ${notifVoucherEmail ? "translate-x-5.5" : "translate-x-0.5"}`} /></button>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div><p className="text-sm font-medium">Voucher via WeChat</p><p className="text-xs text-muted-foreground">Receive vouchers via WeChat notification</p></div>
                <button role="switch" aria-checked={notifVoucherWeChat} aria-label="Voucher WeChat notification" onClick={() => setNotifVoucherWeChat(!notifVoucherWeChat)} className={`w-11 h-6 rounded-full transition-colors ${notifVoucherWeChat ? "bg-primary" : "bg-muted"}`}><div className={`h-5 w-5 bg-white rounded-full shadow transition-transform ${notifVoucherWeChat ? "translate-x-5.5" : "translate-x-0.5"}`} /></button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Email Subscription Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div><p className="text-sm font-medium">Free Cancellation Deadline Alert</p><p className="text-xs text-muted-foreground">Email reminder before free cancellation deadline expires</p></div>
                <button role="switch" aria-checked={notifFreeCancelAlert} aria-label="Free cancellation alert" onClick={() => setNotifFreeCancelAlert(!notifFreeCancelAlert)} className={`w-11 h-6 rounded-full transition-colors ${notifFreeCancelAlert ? "bg-primary" : "bg-muted"}`}><div className={`h-5 w-5 bg-white rounded-full shadow transition-transform ${notifFreeCancelAlert ? "translate-x-5.5" : "translate-x-0.5"}`} /></button>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div><p className="text-sm font-medium">Booking Status Updates</p><p className="text-xs text-muted-foreground">Receive emails when booking status changes</p></div>
                <button role="switch" aria-checked={notifBookingUpdate} aria-label="Booking status updates" onClick={() => setNotifBookingUpdate(!notifBookingUpdate)} className={`w-11 h-6 rounded-full transition-colors ${notifBookingUpdate ? "bg-primary" : "bg-muted"}`}><div className={`h-5 w-5 bg-white rounded-full shadow transition-transform ${notifBookingUpdate ? "translate-x-5.5" : "translate-x-0.5"}`} /></button>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div><p className="text-sm font-medium">Promotions & Offers</p><p className="text-xs text-muted-foreground">Receive marketing emails about deals and promotions</p></div>
                <button role="switch" aria-checked={notifPromotion} aria-label="Promotions and offers" onClick={() => setNotifPromotion(!notifPromotion)} className={`w-11 h-6 rounded-full transition-colors ${notifPromotion ? "bg-primary" : "bg-muted"}`}><div className={`h-5 w-5 bg-white rounded-full shadow transition-transform ${notifPromotion ? "translate-x-5.5" : "translate-x-0.5"}`} /></button>
              </div>
            </div>
          </Card>
          <Button onClick={() => toast.success("Notification settings saved!")}><Save className="h-4 w-4 mr-2" />Save Settings</Button>
        </TabsContent>

        {/* ══════ Coupons Tab ══════ */}
        <TabsContent value="coupons" className="space-y-5 mt-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Ticket className="h-5 w-5" />My Coupons</h2>
            <Tabs defaultValue="unused">
              <TabsList>
                <TabsTrigger value="unused">Unused ({mockCoupons.unused.length})</TabsTrigger>
                <TabsTrigger value="used">Used ({mockCoupons.used.length})</TabsTrigger>
                <TabsTrigger value="expired">Expired ({mockCoupons.expired.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="unused" className="mt-3 space-y-3">
                {mockCoupons.unused.map(c => (
                  <Card key={c.id} className="p-4 flex items-center justify-between border-l-4" style={{ borderLeftColor: "#FF6000" }}>
                    <div>
                      <p className="font-bold text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Min. Order: {c.minOrder} · {c.applicable}</p>
                      <p className="text-xs text-muted-foreground">Valid until: {c.validUntil}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: "#FF6000" }}>{c.discount}</p>
                      <p className="text-[10px] text-muted-foreground">OFF</p>
                    </div>
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="used" className="mt-3 space-y-3">
                {mockCoupons.used.map(c => (
                  <Card key={c.id} className="p-4 flex items-center justify-between opacity-60">
                    <div>
                      <p className="font-bold text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">Used on: {c.usedDate} · Booking: {c.booking}</p>
                    </div>
                    <Badge variant="secondary">Used</Badge>
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="expired" className="mt-3 space-y-3">
                {mockCoupons.expired.map(c => (
                  <Card key={c.id} className="p-4 flex items-center justify-between opacity-40">
                    <div>
                      <p className="font-bold text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">Expired: {c.expiredDate}</p>
                    </div>
                    <Badge variant="destructive">Expired</Badge>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
            <p className="text-xs text-muted-foreground mt-4">Coupon terms: Coupons cannot be combined. One coupon per booking. Non-transferable.</p>
          </Card>
        </TabsContent>

        {/* ══════ OP Management Tab ══════ */}
        {hasRole(["Master"]) && (
          <TabsContent value="ops" className="space-y-5 mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">OP Management</h2>
                <Button onClick={() => setAddOpOpen(true)}><Plus className="h-4 w-4 mr-1" />Add OP</Button>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead>Share %</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {operatingPartners.map(op => (
                    <TableRow key={op.id}>
                      <TableCell className="font-medium">{op.name}</TableCell>
                      <TableCell className="text-sm">{op.email}</TableCell>
                      <TableCell><Badge variant={op.status === "Active" ? "default" : op.status === "Deactivated" ? "destructive" : "secondary"}>{op.status}</Badge></TableCell>
                      <TableCell>{op.shareRatio}%</TableCell>
                      <TableCell>{op.status === "Active" && <Button variant="outline" size="sm" onClick={() => setDeactivateOpen(true)}>Deactivate</Button>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* ── Dialogs ── */}
      <Dialog open={addOpOpen} onOpenChange={setAddOpOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Operating Partner</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium">Full Name</label><Input className="mt-1" /></div>
            <div><label className="text-sm font-medium">Email</label><Input type="email" className="mt-1" /></div>
            <div><label className="text-sm font-medium">Password</label><Input type="password" className="mt-1" /></div>
            <div><label className="text-sm font-medium">Share Ratio (%)</label><Input type="number" className="mt-1" /></div>
          </div>
          <DialogFooter><Button onClick={() => { setAddOpOpen(false); toast.success("OP Added"); }}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>

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

      <AlertDialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Deactivate OP</AlertDialogTitle><AlertDialogDescription>Are you sure? Existing bookings will be preserved.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => toast.success("OP Deactivated")}>Deactivate</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
