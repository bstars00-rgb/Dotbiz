import { useState, useMemo } from "react";
import { Download, CreditCard, RefreshCw, Search, X, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useScreenState } from "@/hooks/useScreenState";
import { StateToolbar } from "@/components/StateToolbar";
import { useAuth } from "@/contexts/AuthContext";
import { monthlySummary, dailyDetails, settlementApplications, billingDetails, invoices, accountsReceivable, pointsHistory, purchaseByHotel } from "@/mocks/settlement";
import { toast } from "sonner";

const billStatusColors: Record<string, string> = { Settled: "default", Pending: "secondary", Overdue: "destructive" };
const invStatusColors: Record<string, string> = { Paid: "default", Issued: "secondary", Overdue: "destructive" };
const appStatusColors: Record<string, string> = { Eligible: "default", Pending: "secondary", Applied: "default" };

export default function SettlementPage() {
  const { state, setState } = useScreenState("success");
  const { hasRole } = useAuth();

  /* ── Applications state ── */
  const [appSelected, setAppSelected] = useState<Set<string>>(new Set());
  const toggleApp = (id: string) => setAppSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  /* ── Billing Details filters ── */
  const [billDateType, setBillDateType] = useState("Created Date");
  const [billType, setBillType] = useState("All");
  const [billSearch, setBillSearch] = useState("");

  const filteredBills = useMemo(() => {
    let result = [...billingDetails];
    if (billType !== "All") result = result.filter(b => b.billType === billType);
    if (billSearch) {
      const q = billSearch.toLowerCase();
      result = result.filter(b => b.billId.toLowerCase().includes(q) || b.bookingId.toLowerCase().includes(q));
    }
    return result;
  }, [billType, billSearch]);

  /* ── Invoices filter ── */
  const [invStatus, setInvStatus] = useState("All");
  const filteredInvoices = useMemo(() => {
    if (invStatus === "All") return invoices;
    return invoices.filter(i => i.status === invStatus);
  }, [invStatus]);

  /* ── AR state ── */
  const [arSelected, setArSelected] = useState<Set<string>>(new Set());
  const toggleAr = (id: string) => setArSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const arSelectedTotal = accountsReceivable.filter(a => arSelected.has(a.id)).reduce((s, a) => s + a.amount, 0);

  /* AR Aging */
  const arCurrent = accountsReceivable.filter(a => a.agingDays <= 0).reduce((s, a) => s + a.amount, 0);
  const ar30 = accountsReceivable.filter(a => a.agingDays > 0 && a.agingDays <= 30).reduce((s, a) => s + a.amount, 0);
  const ar60 = accountsReceivable.filter(a => a.agingDays > 30 && a.agingDays <= 60).reduce((s, a) => s + a.amount, 0);
  const ar90 = accountsReceivable.filter(a => a.agingDays > 60).reduce((s, a) => s + a.amount, 0);

  if (!hasRole(["Master"])) return (<div className="p-6"><Alert><AlertTitle>Access Restricted</AlertTitle><AlertDescription>Settlement page is only accessible to Master accounts.</AlertDescription></Alert></div>);
  if (state === "loading") return (<div className="p-6 space-y-4"><Skeleton className="h-10 w-full" /><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-64 w-full" /><StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">No Settlement Data</h2><p className="text-muted-foreground mt-2">No settlement data available for the selected period.</p></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>Settlement Error</AlertTitle><AlertDescription>Failed to load settlement data.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Settlement & Billing</h1>

      <Tabs defaultValue="applications">
        <TabsList className="flex-wrap">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="billing">Billing Details</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="ar">Accounts Receivable</TabsTrigger>
          <TabsTrigger value="points">OP Points</TabsTrigger>
          <TabsTrigger value="purchase">Purchase by Hotel</TabsTrigger>
        </TabsList>

        {/* ══════ Applications Tab ══════ */}
        <TabsContent value="applications" className="space-y-4 mt-4">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div>
                <label className="text-sm font-medium">From</label>
                <input type="date" defaultValue="2026-03-01" className="border rounded px-2 py-1.5 text-sm bg-background ml-1" />
              </div>
              <div>
                <label className="text-sm font-medium">To</label>
                <input type="date" defaultValue="2026-04-11" className="border rounded px-2 py-1.5 text-sm bg-background ml-1" />
              </div>
              <Button size="sm"><Search className="h-3 w-3 mr-1" />Search</Button>
            </div>
            <p className="text-sm text-muted-foreground">{settlementApplications.length} bookings eligible for settlement</p>
          </Card>

          {appSelected.size > 0 && (
            <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <span className="text-sm font-medium">{appSelected.size} selected</span>
              <span className="text-sm font-bold" style={{ color: "#FF6000" }}>Total: ${settlementApplications.filter(a => appSelected.has(a.id)).reduce((s, a) => s + a.amount, 0).toLocaleString()}</span>
              <Button size="sm" onClick={() => { toast.success("Settlement applied", { description: `${appSelected.size} bookings submitted for settlement.` }); setAppSelected(new Set()); }}>
                <CheckCircle2 className="h-3 w-3 mr-1" />Apply Settlement
              </Button>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox checked={appSelected.size === settlementApplications.length} onCheckedChange={() => { if (appSelected.size === settlementApplications.length) setAppSelected(new Set()); else setAppSelected(new Set(settlementApplications.map(a => a.id))); }} /></TableHead>
                <TableHead>Booking Date</TableHead>
                <TableHead>ELLIS Code</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlementApplications.map(a => (
                <TableRow key={a.id}>
                  <TableCell><Checkbox checked={appSelected.has(a.id)} onCheckedChange={() => toggleApp(a.id)} disabled={a.settlementStatus === "Applied"} /></TableCell>
                  <TableCell className="text-sm">{a.bookingDate}</TableCell>
                  <TableCell className="font-mono text-sm">{a.ellisCode}</TableCell>
                  <TableCell className="text-sm">{a.hotelName}</TableCell>
                  <TableCell className="text-sm">{a.checkIn}</TableCell>
                  <TableCell className="text-sm font-medium">${a.amount.toLocaleString()}</TableCell>
                  <TableCell><Badge variant={appStatusColors[a.settlementStatus] as "default" | "secondary"} className="text-[10px]">{a.settlementStatus}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* ══════ Billing Details Tab ══════ */}
        <TabsContent value="billing" className="space-y-4 mt-4">
          <Card className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-sm font-medium">Date Type</label>
                <select value={billDateType} onChange={e => setBillDateType(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm bg-background mt-1">
                  {["Created Date", "Due Date", "Settlement Date"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Bill Type</label>
                <select value={billType} onChange={e => setBillType(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm bg-background mt-1">
                  {["All", "Hotel Booking", "Cancellation Fee", "Adjustment"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Bill ID / Booking ID</label>
                <Input placeholder="Search..." value={billSearch} onChange={e => setBillSearch(e.target.value)} className="mt-1" />
              </div>
              <div className="flex items-end">
                <Button variant="outline" size="sm" onClick={() => { setBillType("All"); setBillSearch(""); }}><X className="h-3 w-3 mr-1" />Reset</Button>
              </div>
            </div>
          </Card>

          <p className="text-sm text-muted-foreground">{filteredBills.length} billing records</p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Booking ID</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Settled</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.map(b => (
                <TableRow key={b.billId}>
                  <TableCell className="font-mono text-xs">{b.billId}</TableCell>
                  <TableCell className="text-xs">{b.billType}</TableCell>
                  <TableCell className="font-mono text-xs">{b.bookingId}</TableCell>
                  <TableCell className="text-xs truncate max-w-[120px]">{b.hotelName}</TableCell>
                  <TableCell className={`text-xs font-medium ${b.amount < 0 ? "text-red-500" : ""}`}>${b.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-xs">{b.createdDate}</TableCell>
                  <TableCell className="text-xs">{b.dueDate}</TableCell>
                  <TableCell className="text-xs">{b.settlementDate || "—"}</TableCell>
                  <TableCell><Badge variant={billStatusColors[b.status] as "default" | "secondary" | "destructive"} className="text-[10px]">{b.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* ══════ Invoices Tab ══════ */}
        <TabsContent value="invoices" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <select aria-label="Invoice status filter" value={invStatus} onChange={e => setInvStatus(e.target.value)} className="border rounded px-2 py-1.5 text-sm bg-background">
              {["All", "Issued", "Paid", "Overdue"].map(o => <option key={o}>{o}</option>)}
            </select>
            <span className="text-sm text-muted-foreground">{filteredInvoices.length} invoices</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supply</TableHead>
                <TableHead>VAT (10%)</TableHead>
                <TableHead>Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map(inv => (
                <TableRow key={inv.invoiceNo}>
                  <TableCell className="font-mono text-sm">{inv.invoiceNo}</TableCell>
                  <TableCell>{inv.period}</TableCell>
                  <TableCell className="text-sm">{inv.issuedDate}</TableCell>
                  <TableCell className="text-sm">{inv.dueDate}</TableCell>
                  <TableCell><Badge variant={invStatusColors[inv.status] as "default" | "secondary" | "destructive"}>{inv.status}</Badge></TableCell>
                  <TableCell>${inv.supplyAmount.toLocaleString()}</TableCell>
                  <TableCell>${inv.vat.toLocaleString()}</TableCell>
                  <TableCell className="font-bold">${inv.total.toLocaleString()}</TableCell>
                  <TableCell><Button size="sm" variant="ghost" onClick={() => toast.success("Downloading PDF...")}><Download className="h-3 w-3 mr-1" />PDF</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* ══════ Accounts Receivable Tab ══════ */}
        <TabsContent value="ar" className="space-y-4 mt-4">
          {/* AR Aging Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Current", value: arCurrent, icon: CheckCircle2, color: "#009505" },
              { label: "1-30 Days", value: ar30, icon: Clock, color: "#FF8C00" },
              { label: "31-60 Days", value: ar60, icon: AlertTriangle, color: "#ea580c" },
              { label: "60+ Days", value: ar90, icon: AlertTriangle, color: "#DC2626" },
            ].map(a => (
              <Card key={a.label} className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <a.icon className="h-4 w-4" style={{ color: a.color }} />
                  <p className="text-xs text-muted-foreground">{a.label}</p>
                </div>
                <p className="text-lg font-bold">${a.value.toLocaleString()}</p>
              </Card>
            ))}
          </div>

          {arSelected.size > 0 && (
            <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <span className="text-sm font-medium">{arSelected.size} selected</span>
              <span className="text-sm font-bold" style={{ color: "#FF6000" }}>Total: ${arSelectedTotal.toLocaleString()}</span>
              <Button size="sm" onClick={() => setPayDialogOpen(true)}><CreditCard className="h-3 w-3 mr-1" />Pay Selected</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Processing bulk payment...")}>Bulk Pay</Button>
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setArSelected(new Set())}>Clear</Button>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox checked={arSelected.size === accountsReceivable.length} onCheckedChange={() => { if (arSelected.size === accountsReceivable.length) setArSelected(new Set()); else setArSelected(new Set(accountsReceivable.map(a => a.id))); }} /></TableHead>
                <TableHead>ELLIS Code</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Cancel Deadline</TableHead>
                <TableHead>Aging</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountsReceivable.map(ar => (
                <TableRow key={ar.id}>
                  <TableCell><Checkbox checked={arSelected.has(ar.id)} onCheckedChange={() => toggleAr(ar.id)} /></TableCell>
                  <TableCell className="font-mono text-sm">{ar.ellisCode}</TableCell>
                  <TableCell>{ar.hotelName}</TableCell>
                  <TableCell className="font-medium">${ar.amount.toLocaleString()}</TableCell>
                  <TableCell>{ar.cancelDeadline}</TableCell>
                  <TableCell>
                    <Badge variant={ar.agingDays > 60 ? "destructive" : ar.agingDays > 30 ? "secondary" : "default"} className="text-[10px]">
                      {ar.agingDays > 0 ? `${ar.agingDays} days` : "Current"}
                    </Badge>
                  </TableCell>
                  <TableCell><Badge variant="destructive" className="text-[10px]">{ar.paymentStatus}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* ══════ OP Points Tab ══════ */}
        <TabsContent value="points" className="space-y-4 mt-4">
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Balance</TableHead></TableRow></TableHeader>
            <TableBody>
              {pointsHistory.map((p) => (
                <TableRow key={`${p.date}-${p.description}`}>
                  <TableCell>{p.date}</TableCell>
                  <TableCell><Badge variant={p.type === "Earned" ? "default" : "secondary"}>{p.type}</Badge></TableCell>
                  <TableCell>{p.description}</TableCell>
                  <TableCell className={p.amount > 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>{p.amount > 0 ? "+" : ""}{p.amount.toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{p.balance.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* ══════ Purchase by Hotel Tab ══════ */}
        <TabsContent value="purchase" className="space-y-4 mt-4">
          <Table>
            <TableHeader><TableRow><TableHead>Hotel</TableHead><TableHead>Total Amount</TableHead><TableHead>Bookings</TableHead><TableHead>Avg Value</TableHead><TableHead>Share</TableHead></TableRow></TableHeader>
            <TableBody>
              {purchaseByHotel.map(h => (
                <TableRow key={h.hotelName}>
                  <TableCell className="font-medium">{h.hotelName}</TableCell>
                  <TableCell>${h.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>{h.bookingCount}</TableCell>
                  <TableCell>${h.avgTransaction}</TableCell>
                  <TableCell>{h.share}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {/* Pay Confirmation Dialog */}
      <AlertDialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to pay <strong>{arSelected.size} items</strong> totaling <strong>${arSelectedTotal.toLocaleString()}</strong>. This action will be processed via your default payment method.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { toast.success("Payment processed", { description: `$${arSelectedTotal.toLocaleString()} has been paid.` }); setArSelected(new Set()); }}>
              <CreditCard className="h-4 w-4 mr-1" />Confirm Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
