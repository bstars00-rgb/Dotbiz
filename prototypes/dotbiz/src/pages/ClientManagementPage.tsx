import { useState, useMemo } from "react";
import { Search, Plus, Download, Upload, Users, Building2, CreditCard, FileText, ToggleLeft, ToggleRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { subAccounts, departments, balanceTransactions, creditSummary, voucherSettings } from "@/mocks/clientManagement";
import { toast } from "sonner";

const statusColors: Record<string, string> = { Active: "default", Pending: "secondary", Deactivated: "destructive" };

export default function ClientManagementPage() {
  const { hasRole } = useAuth();

  /* ── Sub-account state ── */
  const [subSearch, setSubSearch] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState("All");
  const [subDeptFilter, setSubDeptFilter] = useState("All");
  const [addSubOpen, setAddSubOpen] = useState(false);

  const filteredSubs = useMemo(() => {
    let result = [...subAccounts];
    if (subStatusFilter !== "All") result = result.filter(s => s.status === subStatusFilter);
    if (subDeptFilter !== "All") result = result.filter(s => s.department === subDeptFilter);
    if (subSearch) { const q = subSearch.toLowerCase(); result = result.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)); }
    return result;
  }, [subSearch, subStatusFilter, subDeptFilter]);

  /* ── Department state ── */
  const [addDeptOpen, setAddDeptOpen] = useState(false);

  /* ── Voucher state ── */
  const [vEnabled, setVEnabled] = useState(voucherSettings.enabled);
  const [vScope, setVScope] = useState(voucherSettings.applyScope);

  if (!hasRole(["Master"])) return (<div className="p-6"><Alert><AlertTitle>Access Restricted</AlertTitle><AlertDescription>Client Management is only accessible to Master accounts.</AlertDescription></Alert></div>);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Client Management</h1>

      <Tabs defaultValue="subaccounts">
        <TabsList className="flex-wrap">
          <TabsTrigger value="subaccounts" className="gap-1.5"><Users className="h-3.5 w-3.5" />Sub-accounts</TabsTrigger>
          <TabsTrigger value="departments" className="gap-1.5"><Building2 className="h-3.5 w-3.5" />Departments</TabsTrigger>
          <TabsTrigger value="balance" className="gap-1.5"><CreditCard className="h-3.5 w-3.5" />Balance Details</TabsTrigger>
          <TabsTrigger value="voucher" className="gap-1.5"><FileText className="h-3.5 w-3.5" />Voucher Setting</TabsTrigger>
        </TabsList>

        {/* ══════ Sub-accounts Tab ══════ */}
        <TabsContent value="subaccounts" className="space-y-4 mt-4">
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
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
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
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubs.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-sm">{s.email}</TableCell>
                  <TableCell className="text-sm">{s.department}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{s.role}</Badge></TableCell>
                  <TableCell><Badge variant={statusColors[s.status] as "default" | "secondary" | "destructive"} className="text-[10px]">{s.status}</Badge></TableCell>
                  <TableCell className="text-sm">{s.createdDate}</TableCell>
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
            <p className="text-sm text-muted-foreground">{departments.length} departments</p>
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
              {departments.map(d => (
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

        {/* ══════ Balance Details Tab ══════ */}
        <TabsContent value="balance" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Credit Balance</p>
              <p className="text-2xl font-bold mt-1" style={{ color: "#FF6000" }}>${creditSummary.creditBalance.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Available for hotel bookings</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Deferred Credit Balance</p>
              <p className="text-2xl font-bold mt-1">${creditSummary.deferredCreditBalance.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Used: ${creditSummary.deferredCreditUsed.toLocaleString()} / Available: ${(creditSummary.deferredCreditBalance - creditSummary.deferredCreditUsed).toLocaleString()}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Available</p>
              <p className="text-2xl font-bold mt-1">${(creditSummary.creditBalance + creditSummary.deferredCreditBalance - creditSummary.deferredCreditUsed).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Credit + Deferred available</p>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Transaction History</h3>
            <Button variant="outline" size="sm" onClick={() => toast.success("Exporting...")}><Download className="h-3 w-3 mr-1" />Export</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balanceTransactions.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="text-sm">{t.date}</TableCell>
                  <TableCell><Badge variant={t.amount > 0 ? "default" : "secondary"} className="text-[10px]">{t.type}</Badge></TableCell>
                  <TableCell className="text-sm">{t.productType}</TableCell>
                  <TableCell className={`text-sm font-medium ${t.amount > 0 ? "text-green-600" : "text-red-500"}`}>{t.amount > 0 ? "+" : ""}{t.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-sm font-medium">${t.balance.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{t.user}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{t.remarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                <div><label className="text-sm font-medium">Company Name</label><Input defaultValue={voucherSettings.companyName} className="mt-1" /></div>
                <div><label className="text-sm font-medium">Phone</label><Input defaultValue={voucherSettings.phone} className="mt-1" /></div>
                <div><label className="text-sm font-medium">Email</label><Input defaultValue={voucherSettings.email} className="mt-1" /></div>
                <div><label className="text-sm font-medium">QQ (optional)</label><Input defaultValue={voucherSettings.qq} placeholder="QQ number" className="mt-1" /></div>
                <div><label className="text-sm font-medium">Address</label><Input defaultValue={voucherSettings.address} className="mt-1" /></div>
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
                    <p className="text-sm font-bold">{voucherSettings.companyName}</p>
                    <p className="text-xs text-muted-foreground">{voucherSettings.phone}</p>
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
                  <p>{voucherSettings.email} | {voucherSettings.phone}</p>
                  <p>{voucherSettings.address}</p>
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
        <DialogContent>
          <DialogHeader><DialogTitle>Add Sub-account</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium">Full Name</label><Input placeholder="Enter name" className="mt-1" /></div>
            <div><label className="text-sm font-medium">Email</label><Input type="email" placeholder="user@company.com" className="mt-1" /></div>
            <div>
              <label className="text-sm font-medium">Department</label>
              <select className="w-full border rounded px-3 py-2 text-sm bg-background mt-1">
                {departments.map(d => <option key={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <select className="w-full border rounded px-3 py-2 text-sm bg-background mt-1">
                {["OP", "Manager", "Viewer"].map(r => <option key={r}>{r}</option>)}
              </select>
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
                {subAccounts.filter(s => s.status === "Active").map(s => <option key={s.id}>{s.name}</option>)}
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
