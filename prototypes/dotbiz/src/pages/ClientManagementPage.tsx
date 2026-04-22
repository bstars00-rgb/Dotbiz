import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Plus, Upload, Users, FileText, ToggleLeft, ToggleRight, Trash2, CreditCard, Lock, Calendar, MapPin, Phone, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { useTabParam } from "@/hooks/useTabParam";
import { subAccounts as seedSubAccounts, voucherSettingsByCompany, type SubAccount } from "@/mocks/clientManagement";
import { companies, currentCompany } from "@/mocks/companies";
import { getSavedCards, saveCard, removeCard, type SavedCard } from "@/components/PaymentDialog";
import { toast } from "sonner";

/* Maximum number of saved payment cards per company. PREPAY customers
 * typically rotate 2-3 corporate cards across team members. */
const MAX_SAVED_CARDS = 3;

const statusColors: Record<string, string> = { Active: "default", Pending: "secondary", Deactivated: "destructive" };

export default function ClientManagementPage() {
  const { hasRole, user } = useAuth();
  const { t } = useI18n();
  const [clientTab, setClientTab] = useTabParam("subaccounts");

  /* Tenant-scope: current user's company = the only team they can manage */
  const activeCompany = companies.find(c => c.name === user?.company) || currentCompany;
  const myCompanyId = activeCompany.id;
  const isPrepay = activeCompany.billingType === "PREPAY";

  /* Team (sub-accounts) — local mutable state so Activate / Deactivate /
   * Resend actually affect the UI. Seeded from the mock, filtered to
   * this customer only.
   * Production: backed by ELLIS users table; actions call /api/users/:id. */
  const [allSubs, setAllSubs] = useState<SubAccount[]>(seedSubAccounts);
  const companySubs = useMemo(
    () => allSubs.filter(s => s.customerCompanyId === myCompanyId),
    [allSubs, myCompanyId]
  );

  /* ── Sub-account state ── */
  const [subSearch, setSubSearch] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState("All");
  const [addSubOpen, setAddSubOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<SubAccount | null>(null);

  const filteredSubs = useMemo(() => {
    let result = [...companySubs];
    if (subStatusFilter !== "All") result = result.filter(s => s.status === subStatusFilter);
    if (subSearch) { const q = subSearch.toLowerCase(); result = result.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)); }
    return result;
  }, [companySubs, subSearch, subStatusFilter]);


  /* ── Voucher state (per-company) — controlled form so preview updates live ── */
  const companyVoucher = voucherSettingsByCompany[myCompanyId] || voucherSettingsByCompany["comp-001"];
  const [vEnabled, setVEnabled] = useState(companyVoucher.enabled);
  const [vScope, setVScope] = useState(companyVoucher.applyScope);
  const [vCompanyName, setVCompanyName] = useState(companyVoucher.companyName);
  const [vPhone, setVPhone] = useState(companyVoucher.phone);
  const [vEmail, setVEmail] = useState(companyVoucher.email);
  const [vAddress, setVAddress] = useState(companyVoucher.address);
  const [vLogoDataUrl, setVLogoDataUrl] = useState<string | null>(null);
  const vLogoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG or JPG).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large. Maximum 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setVLogoDataUrl(e.target?.result as string);
      toast.success(`Logo uploaded: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  if (!hasRole(["Master"])) return (<div className="p-6"><Alert><AlertTitle>Access Restricted</AlertTitle><AlertDescription>Master Account management is only accessible to Master users.</AlertDescription></Alert></div>);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("page.team")}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{activeCompany.name} · sub-accounts, permissions, and voucher branding.</p>
      </div>

      <Tabs value={clientTab} onValueChange={setClientTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="subaccounts" className="gap-1.5"><Users className="h-3.5 w-3.5" />Sub-accounts</TabsTrigger>
          {/* Payment Cards — PREPAY only. POSTPAY settles via invoice wires, no card needed. */}
          {isPrepay && (
            <TabsTrigger value="cards" className="gap-1.5"><CreditCard className="h-3.5 w-3.5" />Payment Cards</TabsTrigger>
          )}
          <TabsTrigger value="voucher" className="gap-1.5"><FileText className="h-3.5 w-3.5" />Voucher Setting</TabsTrigger>
        </TabsList>

        {/* ══════ Sub-accounts Tab ══════ */}
        <TabsContent value="subaccounts" className="space-y-4 mt-4">
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <AlertTitle className="text-sm">Role & permission defaults are set by your OhMyHotel AM</AlertTitle>
            <AlertDescription className="text-xs">
              At onboarding, your Account Manager configures initial roles
              (Master / Accounting / OP), booking scope (own vs all), and
              notification routing. As Master you can adjust these here — but
              the opening defaults come from ELLIS so you don't have to set
              them from scratch.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or email..." value={subSearch} onChange={e => setSubSearch(e.target.value)} className="pl-9" />
            </div>
            <select value={subStatusFilter} onChange={e => setSubStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-card">
              {["All", "Active", "Pending", "Deactivated"].map(s => <option key={s}>{s}</option>)}
            </select>
            <Button onClick={() => setAddSubOpen(true)}><Plus className="h-4 w-4 mr-1" />Add Sub-account</Button>
          </div>

          <p className="text-sm text-muted-foreground">{filteredSubs.length} sub-accounts</p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead title="Which bookings this user can see">Booking Scope</TableHead>
                <TableHead title="Which notifications this user receives">Notif. Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubs.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-sm">{s.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={s.role === "Master" ? "default" : s.role === "Accounting" ? "secondary" : "outline"}
                      className="text-[10px]"
                    >
                      {s.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`text-[11px] px-2 py-0.5 rounded-md ${s.bookingScope === "all" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" : "bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300"}`}>
                      {s.bookingScope === "all" ? "All bookings" : "Own only"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300">
                      {s.notificationScope === "all-company" ? "All company" : s.notificationScope === "accounting-only" ? "Accounting" : "Own only"}
                    </span>
                  </TableCell>
                  <TableCell><Badge variant={statusColors[s.status] as "default" | "secondary" | "destructive"} className="text-[10px]">{s.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.lastLogin || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {s.status === "Active" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-destructive"
                          onClick={() => setDeactivateTarget(s)}
                        >
                          <ToggleLeft className="h-3 w-3 mr-1" />Deactivate
                        </Button>
                      ) : s.status === "Deactivated" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => {
                            setAllSubs(prev => prev.map(x => x.id === s.id ? { ...x, status: "Active" } : x));
                            toast.success(`${s.name} reactivated`, { description: `They can now log in with ${s.email}.` });
                          }}
                        >
                          <ToggleRight className="h-3 w-3 mr-1" />Activate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => toast.success("Invitation resent", { description: `A new setup link has been emailed to ${s.email}.` })}
                        >
                          Resend
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Departments tab removed — customer team structure is flat (role + scope are
         * the only organizational primitives we need). Balance Details tab removed
         * earlier (merged into Settlement > Credit Line card). */}

        {/* ══════ Payment Cards Tab (PREPAY only) ══════ */}
        {isPrepay && (
          <TabsContent value="cards" className="space-y-4 mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#FF6000]" />Company Payment Cards
                </h2>
                <Badge variant="outline" className="text-[10px]">PREPAY</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Cards registered here are reusable by any team member when paying for PREPAY
                bookings. Up to {MAX_SAVED_CARDS} cards can be saved.
              </p>
              <CardManagementSection />
            </Card>
            <Alert>
              <AlertTitle>Security Notice</AlertTitle>
              <AlertDescription>
                Card details are stored locally in your browser for demo purposes. In production,
                card tokens are securely stored via PG gateway (PCI-DSS compliant). Only the last
                4 digits are visible.
              </AlertDescription>
            </Alert>
          </TabsContent>
        )}

        {/* Coupons tab removed — per review, not part of DOTBIZ MVP. */}

        {/* ══════ Voucher Setting Tab ══════ */}
        <TabsContent value="voucher" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Form ── */}
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold">Voucher Company Information</h3>
              <p className="text-xs text-muted-foreground">
                Displayed on hotel vouchers sent to guests. The preview on the right updates live.
              </p>
              <Separator />
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Company Name</label>
                  <Input value={vCompanyName} onChange={e => setVCompanyName(e.target.value)} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input value={vPhone} onChange={e => setVPhone(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input value={vEmail} onChange={e => setVEmail(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Address</label>
                  <Input value={vAddress} onChange={e => setVAddress(e.target.value)} className="mt-1" />
                </div>

                {/* Logo upload — real file input + data URL preview */}
                <div>
                  <label className="text-sm font-medium">Company Logo</label>
                  <input
                    ref={vLogoInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleLogoUpload(f);
                    }}
                  />
                  <div
                    onClick={() => vLogoInputRef.current?.click()}
                    className="mt-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    {vLogoDataUrl ? (
                      <div className="flex items-center justify-center gap-3">
                        <img src={vLogoDataUrl} alt="Logo preview" className="h-12 object-contain" />
                        <div className="text-left">
                          <p className="text-xs text-green-600 font-medium">Logo uploaded</p>
                          <p className="text-[10px] text-muted-foreground">Click to replace</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setVLogoDataUrl(null); toast.info("Logo removed"); }}
                          className="ml-auto text-[11px] text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload logo</p>
                        <p className="text-[10px] text-muted-foreground">PNG or JPG · up to 2MB</p>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Enable toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enable Voucher Branding</p>
                    <p className="text-xs text-muted-foreground">Show company info on hotel vouchers</p>
                  </div>
                  <button
                    onClick={() => setVEnabled(!vEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${vEnabled ? "bg-[#FF6000]" : "bg-muted"}`}
                    aria-pressed={vEnabled}
                  >
                    <div
                      className={`absolute top-0.5 h-5 w-5 bg-white rounded-full shadow transition-transform ${vEnabled ? "translate-x-[22px]" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>

                {/* Apply Scope with inline help */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <p className="text-sm font-medium">Apply Scope</p>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-start gap-2 cursor-pointer border rounded-md p-2.5 hover:bg-muted/40 transition-colors" style={vScope === "all" ? { borderColor: "#FF6000" } : undefined}>
                      <input type="radio" name="scope" checked={vScope === "all"} onChange={() => setVScope("all")} className="mt-0.5 accent-[#FF6000]" />
                      <div>
                        <p className="text-sm font-medium">All Bookings</p>
                        <p className="text-[11px] text-muted-foreground">
                          Your branding appears on every voucher automatically. Best for customers who always want consistent branding.
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer border rounded-md p-2.5 hover:bg-muted/40 transition-colors" style={vScope === "manual" ? { borderColor: "#FF6000" } : undefined}>
                      <input type="radio" name="scope" checked={vScope === "manual"} onChange={() => setVScope("manual")} className="mt-0.5 accent-[#FF6000]" />
                      <div>
                        <p className="text-sm font-medium">Manual Selection</p>
                        <p className="text-[11px] text-muted-foreground">
                          At the time of each booking, your OP chooses whether to apply branding.
                          Useful when some bookings are for internal staff (no branding) and others
                          are for resold / client-facing trips (branded).
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <Button className="w-full" onClick={() => toast.success("Voucher settings saved!")}>
                  Save Settings
                </Button>
              </div>
            </Card>

            {/* ── Preview — real-voucher-looking A4 ── */}
            <Card className="p-5">
              <h3 className="font-semibold mb-3">Voucher Preview</h3>
              <div className="mt-3 flex items-center gap-2 mb-3">
                {vEnabled ? (
                  <Badge className="text-[10px]" style={{ background: "#FF6000", color: "white" }}>Branding Enabled</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">Branding Disabled</Badge>
                )}
                <Badge variant="outline" className="text-[10px]">{vScope === "all" ? "Applied to all bookings" : "Per-booking opt-in"}</Badge>
              </div>

              {/* A4-ish voucher — white background, serif-leaning, real hotel doc look */}
              <div className="bg-white text-slate-900 rounded-md shadow-sm border overflow-hidden" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                {/* Letterhead */}
                <div className="px-5 py-4 border-b-2 flex items-center justify-between gap-3" style={{ borderColor: vEnabled ? "#FF6000" : "#e5e7eb" }}>
                  <div className="flex items-center gap-3">
                    {vEnabled && vLogoDataUrl ? (
                      <img src={vLogoDataUrl} alt="" className="h-12 max-w-[120px] object-contain" />
                    ) : vEnabled ? (
                      <div className="h-12 w-24 bg-slate-100 rounded flex items-center justify-center text-[10px] text-slate-400">
                        [LOGO]
                      </div>
                    ) : null}
                    <div>
                      <p className="text-base font-bold" style={{ color: vEnabled ? "#FF6000" : "#9ca3af" }}>
                        {vEnabled ? vCompanyName : "OhMyHotel"}
                      </p>
                      <p className="text-[10px] text-slate-500">Hotel Booking Voucher</p>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-slate-500">
                    <p>Voucher #VCH-2026-0428-001</p>
                    <p>Issued: 2026-04-28</p>
                  </div>
                </div>

                {/* Guest + booking summary */}
                <div className="px-5 py-4 space-y-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-slate-500">Guest Name</p>
                      <p className="font-semibold text-sm">John Smith</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-slate-500">Hotel Confirmation No.</p>
                      <p className="font-semibold text-sm font-mono">HC-GHS-9821</p>
                      <p className="text-[8px] text-slate-400 mt-0.5">(issued by hotel after accepting booking)</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-slate-500 flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />Check-in</p>
                      <p className="font-semibold text-sm">Fri, Apr 10, 2026</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-slate-500 flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />Check-out</p>
                      <p className="font-semibold text-sm">Mon, Apr 13, 2026 <span className="text-slate-400 font-normal">(3 nights)</span></p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-md px-3 py-2.5 mt-2">
                    <p className="text-[9px] uppercase tracking-wide text-slate-500 mb-0.5">Hotel</p>
                    <p className="font-semibold text-sm">Grand Hyatt Seoul</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-start gap-1">
                      <MapPin className="h-2.5 w-2.5 mt-0.5" />322 Sowol-ro, Yongsan-gu, Seoul 04347, Korea
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Phone className="h-2.5 w-2.5" />+82-2-797-1234
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-slate-500">Room</p>
                      <p className="font-medium">Deluxe King</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-slate-500">Rooms</p>
                      <p className="font-medium">1</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-slate-500">Guests</p>
                      <p className="font-medium">1 adult</p>
                    </div>
                  </div>

                  <div className="border-t pt-2 mt-2 text-[10px] text-slate-500 leading-relaxed">
                    <p className="font-semibold text-slate-700 mb-1">Important</p>
                    <p>• Present this voucher + photo ID at check-in.</p>
                    <p>• Check-in from 15:00 · Check-out by 11:00.</p>
                    <p>• Cancellation and special requests follow the confirmed rate terms.</p>
                  </div>
                </div>

                {/* Footer — the branding bit */}
                <div className="px-5 py-3 border-t bg-slate-50/60 text-[10px] text-slate-600">
                  {vEnabled ? (
                    <>
                      <p className="font-semibold text-slate-800 mb-0.5">{vCompanyName}</p>
                      <p>{vAddress}</p>
                      <p className="mt-0.5">
                        <span className="text-slate-400">Tel </span>{vPhone}
                        <span className="text-slate-400 ml-2">· Email </span>{vEmail}
                      </p>
                    </>
                  ) : (
                    <div className="text-center text-slate-400">
                      <p className="text-[9px]">Voucher branding is disabled — vouchers show OhMyHotel default footer.</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Add Sub-account Dialog ── */}
      <Dialog open={addSubOpen} onOpenChange={setAddSubOpen}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader>
            <DialogTitle>Add Sub-account</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Full Name</label><Input placeholder="Enter name" className="mt-1" /></div>
              <div><label className="text-sm font-medium">Email (login ID)</label><Input type="email" placeholder="user@company.com" className="mt-1" /></div>
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <select className="w-full border rounded px-3 py-2 text-sm bg-background mt-1">
                {(["OP", "Accounting", "Master"] as const).map(r => <option key={r}>{r}</option>)}
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">
                <strong>OP</strong> = booking operator · <strong>Accounting</strong> = settlement/invoices (opened by Master) · <strong>Master</strong> = full admin
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Booking Scope</label>
                <select className="w-full border rounded px-3 py-2 text-sm bg-background mt-1">
                  <option value="own">Own bookings only</option>
                  <option value="all">All company bookings</option>
                </select>
                <p className="text-[10px] text-muted-foreground mt-1">Default: Own for OP, All for Accounting/Master</p>
              </div>
              <div>
                <label className="text-sm font-medium">Notification Scope</label>
                <select className="w-full border rounded px-3 py-2 text-sm bg-background mt-1">
                  <option value="own">Own notifications only</option>
                  <option value="all-company">All company notifications</option>
                  <option value="accounting-only">Accounting/settlement only</option>
                </select>
              </div>
            </div>

            {/* Password info — explains the invite-link flow */}
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 py-2">
              <Lock className="h-3.5 w-3.5 text-blue-600" />
              <AlertTitle className="text-xs">Password — you don't set this</AlertTitle>
              <AlertDescription className="text-[11px]">
                An invitation email is sent with a one-time <strong>setup link</strong> (valid
                for 72 hours). The user sets their own password on first access. As Master you
                never see or set their password — this protects both of you.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSubOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Invitation sent", { description: "The user will receive a setup link by email." }); setAddSubOpen(false); }}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Deactivate Sub-account Confirmation ── */}
      <AlertDialog open={!!deactivateTarget} onOpenChange={(o) => !o && setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deactivate {deactivateTarget?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-mono text-xs">{deactivateTarget?.email}</span> will no longer
              be able to log in. Their existing bookings and records remain intact. You can
              reactivate them at any time by clicking <strong>Activate</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                if (!deactivateTarget) return;
                setAllSubs(prev => prev.map(x => x.id === deactivateTarget.id ? { ...x, status: "Deactivated" } : x));
                toast.success(`${deactivateTarget.name} deactivated`, { description: "Active sessions have been terminated." });
                setDeactivateTarget(null);
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Departments UI removed entirely. */}
    </div>
  );
}

/* ── Card Management Sub-component ──
 * Company-level saved cards. Master can add (up to MAX_SAVED_CARDS) and
 * remove cards directly, or cards get saved automatically when a team
 * member uses "Save card" during a PREPAY booking payment.
 * Production: company-scoped PG tokens via ELLIS. */
function CardManagementSection() {
  const [cards, setCards] = useState<SavedCard[]>(getSavedCards());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  /* Add-card form state */
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [holder, setHolder] = useState("");

  useEffect(() => {
    setCards(getSavedCards());
  }, []);

  const reachedLimit = cards.length >= MAX_SAVED_CARDS;

  const handleDelete = (id: string) => {
    removeCard(id);
    setCards(getSavedCards());
    toast.success("Card removed successfully.");
    setDeleteConfirm(null);
  };

  const detectBrand = (num: string) => {
    const d = num.replace(/\s/g, "");
    if (d.startsWith("4")) return "Visa";
    if (d.startsWith("5") || d.startsWith("2")) return "Mastercard";
    if (d.startsWith("3")) return "Amex";
    if (d.startsWith("6")) return "Discover";
    return "Card";
  };

  const addValid =
    cardNumber.replace(/\s/g, "").length >= 13 &&
    /^\d{2}\/\d{2}$/.test(expiry) &&
    cvc.length >= 3 &&
    holder.trim().length > 0;

  const handleAdd = () => {
    if (!addValid) { toast.error("Please complete all card fields."); return; }
    if (reachedLimit) { toast.error(`Maximum ${MAX_SAVED_CARDS} cards already saved.`); return; }
    const d = cardNumber.replace(/\s/g, "");
    saveCard({
      id: `card-${Date.now()}`,
      last4: d.slice(-4),
      brand: detectBrand(d),
      expiry,
      holderName: holder.trim(),
    });
    setCards(getSavedCards());
    setCardNumber(""); setExpiry(""); setCvc(""); setHolder("");
    setAddOpen(false);
    toast.success("Card added successfully.");
  };

  return (
    <>
      {/* Header row: count + Add button */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">
          <strong>{cards.length}</strong> of {MAX_SAVED_CARDS} cards saved
        </p>
        <Button
          size="sm"
          onClick={() => setAddOpen(true)}
          disabled={reachedLimit}
          style={!reachedLimit ? { background: "#FF6000" } : undefined}
          className={!reachedLimit ? "text-white" : ""}
        >
          <Plus className="h-3 w-3 mr-1" />Add Card
        </Button>
      </div>

      {reachedLimit && (
        <Alert className="mb-3 border-amber-200 bg-amber-50 dark:bg-amber-950/20 py-2">
          <AlertDescription className="text-[11px]">
            Maximum {MAX_SAVED_CARDS} cards reached. Remove an existing card to add a new one.
          </AlertDescription>
        </Alert>
      )}

      {cards.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
          <p className="text-sm text-muted-foreground">No saved payment cards yet.</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Click <strong>Add Card</strong> above, or cards will be saved automatically
            when your team checks "Save card for future use" during a PREPAY booking.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {cards.map(card => (
            <div key={card.id} className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-12 rounded bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold font-mono">
                  {card.brand}
                </div>
                <div>
                  <p className="text-sm font-medium font-mono">•••• •••• •••• {card.last4}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {card.holderName} · Exp {card.expiry}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-destructive"
                onClick={() => setDeleteConfirm(card.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" />Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Remove confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove payment card?</AlertDialogTitle>
            <AlertDialogDescription>
              This card will no longer be available for future bookings. You can always add it
              again from here or during a PREPAY booking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add card dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#FF6000]" />Add Payment Card
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Alert className="py-2">
              <Lock className="h-3.5 w-3.5" />
              <AlertDescription className="text-[11px]">
                Card details will be tokenized via PG gateway (PCI-DSS compliant). Only the
                last 4 digits remain visible.
              </AlertDescription>
            </Alert>
            <div>
              <label className="text-sm font-medium">Card Number</label>
              <Input
                value={cardNumber}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                  const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
                  setCardNumber(formatted);
                }}
                placeholder="4242 4242 4242 4242"
                className="mt-1 font-mono"
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Expiry (MM/YY)</label>
                <Input
                  value={expiry}
                  onChange={e => {
                    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                    if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                    setExpiry(v);
                  }}
                  placeholder="12/28"
                  className="mt-1 font-mono"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="text-sm font-medium">CVC</label>
                <Input
                  type="password"
                  value={cvc}
                  onChange={e => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="•••"
                  className="mt-1 font-mono"
                  maxLength={4}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Cardholder Name</label>
              <Input
                value={holder}
                onChange={e => setHolder(e.target.value)}
                placeholder="JOHN SMITH"
                className="mt-1 uppercase"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAdd}
              disabled={!addValid}
              style={addValid ? { background: "#FF6000" } : undefined}
              className={addValid ? "text-white" : ""}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />Add Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
