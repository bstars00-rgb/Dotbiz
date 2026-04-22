import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Upload, Users, Building2, FileText, ToggleLeft, ToggleRight, Pencil, Trash2, CreditCard, Ticket as TicketIcon } from "lucide-react";
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
import { subAccounts, departments, voucherSettingsByCompany, companyCoupons } from "@/mocks/clientManagement";
import { companies, currentCompany } from "@/mocks/companies";
import { getSavedCards, removeCard, type SavedCard } from "@/components/PaymentDialog";
import { toast } from "sonner";

const statusColors: Record<string, string> = { Active: "default", Pending: "secondary", Deactivated: "destructive" };

export default function ClientManagementPage() {
  const { hasRole, user } = useAuth();
  const { t } = useI18n();
  const [clientTab, setClientTab] = useTabParam("subaccounts");

  /* Tenant-scope: current user's company = the only team they can manage */
  const activeCompany = companies.find(c => c.name === user?.company) || currentCompany;
  const myCompanyId = activeCompany.id;

  /* Team (sub-accounts) scoped to this customer only */
  const companySubs = useMemo(
    () => subAccounts.filter(s => s.customerCompanyId === myCompanyId),
    [myCompanyId]
  );
  const companyDepts = useMemo(
    () => departments.filter(d => d.customerCompanyId === myCompanyId),
    [myCompanyId]
  );

  /* ── Sub-account state ── */
  const [subSearch, setSubSearch] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState("All");
  const [subDeptFilter, setSubDeptFilter] = useState("All");
  const [addSubOpen, setAddSubOpen] = useState(false);

  const filteredSubs = useMemo(() => {
    let result = [...companySubs];
    if (subStatusFilter !== "All") result = result.filter(s => s.status === subStatusFilter);
    if (subDeptFilter !== "All") result = result.filter(s => s.department === subDeptFilter);
    if (subSearch) { const q = subSearch.toLowerCase(); result = result.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)); }
    return result;
  }, [companySubs, subSearch, subStatusFilter, subDeptFilter]);

  /* ── Department state ── */
  const [addDeptOpen, setAddDeptOpen] = useState(false);

  /* ── Voucher state (per-company) ── */
  const companyVoucher = voucherSettingsByCompany[myCompanyId] || voucherSettingsByCompany["comp-001"];
  const [vEnabled, setVEnabled] = useState(companyVoucher.enabled);
  const [vScope, setVScope] = useState(companyVoucher.applyScope);

  if (!hasRole(["Master"])) return (<div className="p-6"><Alert><AlertTitle>Access Restricted</AlertTitle><AlertDescription>Master Account management is only accessible to Master users.</AlertDescription></Alert></div>);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("page.team")}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{activeCompany.name} · sub-accounts, departments, permissions, and voucher branding.</p>
      </div>

      <Tabs value={clientTab} onValueChange={setClientTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="subaccounts" className="gap-1.5"><Users className="h-3.5 w-3.5" />Sub-accounts</TabsTrigger>
          <TabsTrigger value="departments" className="gap-1.5"><Building2 className="h-3.5 w-3.5" />Departments</TabsTrigger>
          <TabsTrigger value="cards" className="gap-1.5"><CreditCard className="h-3.5 w-3.5" />Payment Cards</TabsTrigger>
          <TabsTrigger value="coupons" className="gap-1.5"><TicketIcon className="h-3.5 w-3.5" />Coupons</TabsTrigger>
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
            <select value={subDeptFilter} onChange={e => setSubDeptFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-card">
              <option value="All">All Departments</option>
              {companyDepts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
            <Button onClick={() => setAddSubOpen(true)}><Plus className="h-4 w-4 mr-1" />Add Sub-account</Button>
          </div>

          <p className="text-sm text-muted-foreground">{filteredSubs.length} sub-accounts</p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
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
                  <TableCell className="text-sm">{s.department}</TableCell>
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
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => toast.success(`${s.name} deactivated`)}><ToggleLeft className="h-3 w-3 mr-1" />Deactivate</Button>
                      ) : s.status === "Deactivated" ? (
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toast.success(`${s.name} activated`)}><ToggleRight className="h-3 w-3 mr-1" />Activate</Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toast.success(`Invitation resent to ${s.email}`)}>Resend</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* ══════ Departments Tab ══════ */}
        <TabsContent value="departments" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{companyDepts.length} departments</p>
            <Button onClick={() => setAddDeptOpen(true)}><Plus className="h-4 w-4 mr-1" />Add Department</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyDepts.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">{d.description}</TableCell>
                  <TableCell className="text-sm">{d.manager}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{d.memberCount}</Badge></TableCell>
                  <TableCell className="text-sm">{d.createdDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toast.success("Department updated")}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => toast.success("Department deleted")}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Balance Details tab removed — merged into Settlement > Credit Line card (single source of truth). */}

        {/* ══════ Payment Cards Tab ══════ */}
        <TabsContent value="cards" className="space-y-4 mt-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#FF6000]" />Company Payment Cards
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Cards saved when your team pays for PREPAY bookings. These cards belong to
              {activeCompany.name} (the company), not an individual user — any team member
              making a PREPAY booking can reuse them.
            </p>
            <CardManagementSection />
          </Card>
          <Alert>
            <AlertTitle>Security Notice</AlertTitle>
            <AlertDescription>
              Card details are stored locally in your browser for demo purposes. In production,
              card tokens are securely stored via PG gateway (PCI-DSS compliant). Only the last 4
              digits are visible.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* ══════ Coupons Tab ══════ */}
        <TabsContent value="coupons" className="space-y-4 mt-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <TicketIcon className="h-5 w-5 text-[#FF6000]" />Company Coupons
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Promotions earned by {activeCompany.name} as a whole. Any team member making a
              booking can apply them at checkout.
            </p>
            {(() => {
              const myCoupons = companyCoupons.filter(c => c.customerCompanyId === myCompanyId);
              if (myCoupons.length === 0) {
                return <p className="text-sm text-muted-foreground text-center py-8">No coupons available for this company.</p>;
              }
              return (
                <Tabs defaultValue="unused">
                  <TabsList>
                    <TabsTrigger value="unused">Unused ({myCoupons.filter(c => c.status === "Unused").length})</TabsTrigger>
                    <TabsTrigger value="used">Used ({myCoupons.filter(c => c.status === "Used").length})</TabsTrigger>
                    <TabsTrigger value="expired">Expired ({myCoupons.filter(c => c.status === "Expired").length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="unused" className="mt-3 space-y-3">
                    {myCoupons.filter(c => c.status === "Unused").map(c => (
                      <div key={c.id} className="border rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <p className="font-semibold text-sm">{c.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Discount <strong className="text-[#FF6000]">{c.discount}</strong>
                            {c.minOrder && <> · Min order {c.minOrder}</>}
                            {c.applicable && <> · {c.applicable}</>}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-[10px]">Valid until {c.validUntil}</Badge>
                        </div>
                      </div>
                    ))}
                    {myCoupons.filter(c => c.status === "Unused").length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">No unused coupons.</p>
                    )}
                  </TabsContent>
                  <TabsContent value="used" className="mt-3 space-y-3">
                    {myCoupons.filter(c => c.status === "Used").map(c => (
                      <div key={c.id} className="border rounded-lg p-4 flex items-center justify-between gap-3 opacity-75">
                        <div>
                          <p className="font-semibold text-sm">{c.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Used on {c.usedDate}{c.booking && <> · Booking {c.booking}</>}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">{c.discount}</Badge>
                      </div>
                    ))}
                    {myCoupons.filter(c => c.status === "Used").length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">No used coupons.</p>
                    )}
                  </TabsContent>
                  <TabsContent value="expired" className="mt-3 space-y-3">
                    {myCoupons.filter(c => c.status === "Expired").map(c => (
                      <div key={c.id} className="border rounded-lg p-4 flex items-center justify-between gap-3 opacity-50">
                        <div>
                          <p className="font-semibold text-sm line-through">{c.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Expired on {c.expiredDate}</p>
                        </div>
                        <Badge variant="destructive" className="text-[10px]">{c.discount}</Badge>
                      </div>
                    ))}
                    {myCoupons.filter(c => c.status === "Expired").length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">No expired coupons.</p>
                    )}
                  </TabsContent>
                </Tabs>
              );
            })()}
          </Card>
        </TabsContent>

        {/* ══════ Voucher Setting Tab ══════ */}
        <TabsContent value="voucher" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form */}
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold">Voucher Company Information</h3>
              <p className="text-xs text-muted-foreground">This information will be displayed on hotel vouchers sent to guests.</p>
              <Separator />
              <div className="space-y-3">
                <div><label className="text-sm font-medium">Company Name</label><Input defaultValue={companyVoucher.companyName} className="mt-1" /></div>
                <div><label className="text-sm font-medium">Phone</label><Input defaultValue={companyVoucher.phone} className="mt-1" /></div>
                <div><label className="text-sm font-medium">Email</label><Input defaultValue={companyVoucher.email} className="mt-1" /></div>
                <div><label className="text-sm font-medium">QQ (optional)</label><Input defaultValue={companyVoucher.qq} placeholder="QQ number" className="mt-1" /></div>
                <div><label className="text-sm font-medium">Address</label><Input defaultValue={companyVoucher.address} className="mt-1" /></div>
                <div>
                  <label className="text-sm font-medium">Company Logo</label>
                  <div className="mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload logo</p>
                    <p className="text-[10px] text-muted-foreground">PNG, JPG up to 2MB</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enable Voucher Branding</p>
                    <p className="text-xs text-muted-foreground">Show company info on hotel vouchers</p>
                  </div>
                  <button onClick={() => setVEnabled(!vEnabled)} className={`w-11 h-6 rounded-full transition-colors ${vEnabled ? "bg-primary" : "bg-muted"}`}>
                    <div className={`h-5 w-5 bg-white rounded-full shadow transition-transform ${vEnabled ? "translate-x-5.5" : "translate-x-0.5"}`} />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Apply Scope</p>
                  <div className="flex gap-3">
                    {(["all", "manual"] as const).map(scope => (
                      <label key={scope} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="scope" checked={vScope === scope} onChange={() => setVScope(scope)} className="accent-[#FF6000]" />
                        <span className="text-sm">{scope === "all" ? "All Bookings" : "Manual Selection"}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={() => toast.success("Voucher settings saved!")}>Save Settings</Button>
              </div>
            </Card>

            {/* Preview */}
            <Card className="p-5">
              <h3 className="font-semibold mb-3">Voucher Preview</h3>
              <div className="border rounded-lg p-5 space-y-3 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <div className="h-10 w-32 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">Company Logo</div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{companyVoucher.companyName}</p>
                    <p className="text-xs text-muted-foreground">{companyVoucher.phone}</p>
                  </div>
                </div>
                <div className="text-center py-4">
                  <h2 className="text-lg font-bold">Hotel Booking Voucher</h2>
                  <p className="text-xs text-muted-foreground">Confirmation Number: HC-GHS-9821</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-muted-foreground">Hotel</p><p className="font-medium">Grand Hyatt Seoul</p></div>
                  <div><p className="text-xs text-muted-foreground">Check-in</p><p className="font-medium">Apr 10, 2026</p></div>
                  <div><p className="text-xs text-muted-foreground">Room</p><p className="font-medium">Deluxe King x 1</p></div>
                  <div><p className="text-xs text-muted-foreground">Guest</p><p className="font-medium">John Smith</p></div>
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground text-center">
                  <p>{companyVoucher.email} | {companyVoucher.phone}</p>
                  <p>{companyVoucher.address}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {vEnabled ? (
                  <Badge variant="default" className="text-xs">Branding Enabled</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Branding Disabled</Badge>
                )}
                <Badge variant="outline" className="text-xs">{vScope === "all" ? "Applied to All" : "Manual Selection"}</Badge>
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
              <div><label className="text-sm font-medium">Email</label><Input type="email" placeholder="user@company.com" className="mt-1" /></div>
            </div>
            <div>
              <label className="text-sm font-medium">Department</label>
              <select className="w-full border rounded px-3 py-2 text-sm bg-background mt-1">
                {companyDepts.map(d => <option key={d.id}>{d.name}</option>)}
              </select>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSubOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Sub-account invitation sent!"); setAddSubOpen(false); }}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Department Dialog ── */}
      <Dialog open={addDeptOpen} onOpenChange={setAddDeptOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Department</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium">Department Name</label><Input placeholder="e.g. Sales - Europe" className="mt-1" /></div>
            <div><label className="text-sm font-medium">Description</label><Input placeholder="Department description" className="mt-1" /></div>
            <div>
              <label className="text-sm font-medium">Department Manager</label>
              <select className="w-full border rounded px-3 py-2 text-sm bg-background mt-1">
                {companySubs.filter(s => s.status === "Active").map(s => <option key={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDeptOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Department created!"); setAddDeptOpen(false); }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Card Management Sub-component ──
 * Reads saved payment cards from local storage (PaymentDialog writes them
 * when a PREPAY booking is paid). Master can remove cards here.
 * Production: company-scoped PG tokens via ELLIS. */
function CardManagementSection() {
  const [cards, setCards] = useState<SavedCard[]>(getSavedCards());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    /* Refresh on mount + when a new card might have been saved */
    setCards(getSavedCards());
  }, []);

  const handleDelete = (id: string) => {
    removeCard(id);
    setCards(getSavedCards());
    toast.success("Card removed successfully.");
    setDeleteConfirm(null);
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
        <p className="text-sm text-muted-foreground">No saved payment cards yet.</p>
        <p className="text-[11px] text-muted-foreground mt-1">Cards are saved when your team pays for PREPAY bookings with "Save card for future use" checked.</p>
      </div>
    );
  }

  return (
    <>
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
                  {card.holderName} · Exp {card.expiryMonth}/{card.expiryYear}
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

      <AlertDialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove payment card?</AlertDialogTitle>
            <AlertDialogDescription>
              This card will no longer be available for future bookings. You can always add it
              again when making a new PREPAY booking.
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
    </>
  );
}
