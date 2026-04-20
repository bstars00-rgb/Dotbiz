import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Download, CreditCard, RefreshCw, Search, X, CheckCircle2, Clock, AlertTriangle, Sparkles, Zap, ExternalLink } from "lucide-react";
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
import { useI18n } from "@/contexts/I18nContext";
import { billingDetails, invoices, accountsReceivable, disputeSummary, paymentReminders, reminderSummary, paymentMatchLog } from "@/mocks/settlement";
import { Lock } from "lucide-react";
import MonthEndClose from "@/components/MonthEndClose";
import { companies, currentCompany } from "@/mocks/companies";
import { downloadCSV, timestamp } from "@/lib/download";
import { bookings as allBookings, type Booking } from "@/mocks/bookings";
import PaymentDialog from "@/components/PaymentDialog";
import InvoicePreviewDialog, { type InvoiceData } from "@/components/InvoicePreviewDialog";
import { toast } from "sonner";

const billStatusColors: Record<string, string> = { Settled: "default", Pending: "secondary", Overdue: "destructive" };
const invStatusColors: Record<string, string> = { Paid: "default", Issued: "secondary", Overdue: "destructive" };

export default function SettlementPage() {
  const navigate = useNavigate();
  const { state, setState } = useScreenState("success");
  const { t } = useI18n();
  const { hasRole, user } = useAuth();
  /* Resolve logged-in company from user (fallback to demo default) */
  const activeCompany = companies.find(c => c.name === user?.company) || currentCompany;
  const isPrepay = activeCompany.billingType === "PREPAY";

  /* PREPAY: 미결제 예약 (TL 미도래 + 데드라인 임박) */
  const pendingPayments = useMemo(() => {
    return allBookings.filter(b => b.bookingStatus === "Confirmed" && (b.paymentStatus === "Not Paid" || b.paymentStatus === "Pending"))
      .map(b => {
        const dl = new Date(b.cancelDeadline);
        const now = new Date();
        const daysLeft = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { ...b, daysLeft };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, []);
  const overdueCount = pendingPayments.filter(p => p.daysLeft < 0).length;
  const d7Count = pendingPayments.filter(p => p.daysLeft >= 0 && p.daysLeft <= 7).length;

  /* Force-refresh state after mock mutations */
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(x => x + 1);

  /* PaymentDialog state (PREPAY) */
  const [paymentTarget, setPaymentTarget] = useState<Booking | null>(null);
  const handlePaymentComplete = () => {
    if (!paymentTarget) return;
    /* Mutate mock: mark as fully paid */
    const b = allBookings.find(x => x.id === paymentTarget.id);
    if (b) {
      b.paymentStatus = "Fully Paid";
      b.paymentChannel = "Credit Card";
      b.paymentMethod = "PG Card Payment";
    }
    toast.success(`${paymentTarget.ellisCode} paid $${paymentTarget.sumAmount.toLocaleString()}`, {
      description: "Booking payment confirmed. Notification log updated.",
    });
    setPaymentTarget(null);
    refresh();
  };

  /* ── Billing Details filters ── */
  const [billDateType, setBillDateType] = useState<"Created Date" | "Due Date" | "Settlement Date">("Created Date");
  const [billType, setBillType] = useState("All");
  const [billSearch, setBillSearch] = useState("");
  const [billDateFrom, setBillDateFrom] = useState("");
  const [billDateTo, setBillDateTo] = useState("");

  const filteredBills = useMemo(() => {
    let result = [...billingDetails];
    if (billType !== "All") result = result.filter(b => b.billType === billType);
    if (billSearch) {
      const q = billSearch.toLowerCase();
      result = result.filter(b => b.billId.toLowerCase().includes(q) || b.bookingId.toLowerCase().includes(q));
    }
    /* Date range filter based on selected Date Type */
    if (billDateFrom || billDateTo) {
      result = result.filter(b => {
        const target = billDateType === "Created Date" ? b.createdDate
          : billDateType === "Due Date" ? b.dueDate
          : b.settlementDate;
        if (!target) return false;
        if (billDateFrom && target < billDateFrom) return false;
        if (billDateTo && target > billDateTo) return false;
        return true;
      });
    }
    return result;
  }, [billType, billSearch, billDateType, billDateFrom, billDateTo]);

  /* ── Invoices filter ── */
  const [invStatus, setInvStatus] = useState("All");
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceData | null>(null);
  /* 인보이스는 로그인한 고객사 것만 표시.
   * PREPAY 고객 → 자기 예약별 인보이스
   * POSTPAY 고객 → 자기 월별 집계 인보이스
   */
  const myInvoices = useMemo(() => invoices.filter(i => i.customerCompanyId === activeCompany.id), [activeCompany.id]);
  const filteredInvoices = useMemo(() => {
    if (invStatus === "All") return myInvoices;
    return myInvoices.filter(i => i.status === invStatus);
  }, [invStatus, myInvoices]);

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
      {/* Header with billing type + KPI summary */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{t("page.settlement")}</h1>
            <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-300">
              {activeCompany.billingType}
              {activeCompany.billingType === "POSTPAY" && activeCompany.settlementCycle && ` · ${activeCompany.settlementCycle}`}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeCompany.name}
            {activeCompany.billingType === "POSTPAY" && activeCompany.depositType && ` · ${activeCompany.depositType} $${(activeCompany.depositAmount || 0).toLocaleString()}`}
          </p>
        </div>

        {/* Quick KPI */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span><strong>{disputeSummary.openCount}</strong> open disputes</span>
            <span className="text-muted-foreground">· ${disputeSummary.openAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border" style={{ borderColor: "#FF6000" }}>
            <Zap className="h-3.5 w-3.5" style={{ color: "#FF6000" }} />
            <span>Saved <strong>{Math.round(disputeSummary.vlookupTimeSavedThisMonth / 60 * 10) / 10}h</strong></span>
            <span className="text-muted-foreground">this month</span>
          </div>
        </div>
      </div>

      {/* Master Approval Queue banner */}
      {hasRole(["Master"]) && paymentMatchLog.filter(l => l.approvalStatus === "Pending Master").length > 0 && (
        <Alert className="border-blue-300 bg-blue-50 dark:bg-blue-950/20">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900 dark:text-blue-100">Master Approval Pending</AlertTitle>
          <AlertDescription className="text-xs text-blue-800 dark:text-blue-200">
            <strong>{paymentMatchLog.filter(l => l.approvalStatus === "Pending Master").length}</strong> Payment Match records awaiting Master approval. Please review each invoice detail.
            {" "}
            {paymentMatchLog.filter(l => l.approvalStatus === "Pending Master").map(l => (
              <Button key={l.id} variant="link" size="sm" className="h-auto p-0 mx-1 text-blue-600 underline" onClick={() => navigate(`/app/settlement/invoice/${l.invoiceNo}`)}>
                {l.invoiceNo}
              </Button>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* PREPAY deadline-alert banner */}
      {isPrepay && (overdueCount > 0 || d7Count > 0) && (
        <Alert className="border-red-300 bg-red-50 dark:bg-red-950/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900 dark:text-red-100">Payment Deadline Alert</AlertTitle>
          <AlertDescription className="text-xs text-red-800 dark:text-red-200">
            {overdueCount > 0 && <span className="font-bold">Overdue: {overdueCount}. </span>}
            {d7Count > 0 && <span>Due within 7 days: {d7Count}. </span>}
            Unpaid bookings may be auto-cancelled. <Button variant="link" size="sm" className="h-auto p-0 text-red-600 underline" onClick={() => toast.info("Scroll to Pending Payment tab")}>View all →</Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={isPrepay ? "pending" : "invoices"}>
        <TabsList className="!h-auto flex-wrap justify-start gap-1">
          {isPrepay && <TabsTrigger value="pending">Pending Payment {pendingPayments.length > 0 && <span className="ml-1 text-[10px] bg-red-500 text-white rounded-full px-1.5">{pendingPayments.length}</span>}</TabsTrigger>}
          {isPrepay && <TabsTrigger value="reminders">Reminder Log</TabsTrigger>}
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="billing">Billing Details</TabsTrigger>
          <TabsTrigger value="ar">Accounts Receivable</TabsTrigger>
          <TabsTrigger value="closing">
            <Lock className="h-3 w-3 mr-1" />
            Month-End Close
          </TabsTrigger>
        </TabsList>

        {/* ══════ PREPAY Pending Payment Tab ══════ */}
        {isPrepay && (
          <TabsContent value="pending" className="space-y-4 mt-4">
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-900 dark:text-amber-100">PREPAY — Payment Deadline Management</AlertTitle>
              <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
                Non-refundable bookings are paid instantly by card and don't appear here.
                The list below shows bookings with open Time Limit awaiting payment. After deadline, booking is auto-cancelled or forced-pay flow triggers.
              </AlertDescription>
            </Alert>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ELLIS Code</TableHead>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPayments.map(p => {
                  const urgency = p.daysLeft < 0 ? "destructive" : p.daysLeft <= 3 ? "destructive" : p.daysLeft <= 7 ? "secondary" : "default";
                  const label = p.daysLeft < 0 ? `${Math.abs(p.daysLeft)}d overdue` : p.daysLeft === 0 ? "Today" : `${p.daysLeft} days`;
                  return (
                    <TableRow key={p.id} className={p.daysLeft < 0 ? "bg-red-50 dark:bg-red-950/10" : p.daysLeft <= 3 ? "bg-amber-50 dark:bg-amber-950/10" : ""}>
                      <TableCell className="font-mono text-xs">{p.ellisCode}</TableCell>
                      <TableCell className="text-sm">{p.hotelName}</TableCell>
                      <TableCell className="text-xs">{p.checkIn}</TableCell>
                      <TableCell className="text-right font-mono font-medium">${p.sumAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-xs">{p.cancelDeadline}</TableCell>
                      <TableCell><Badge variant={urgency} className="text-[10px]">{label}</Badge></TableCell>
                      <TableCell><Badge variant="destructive" className="text-[10px]">{p.paymentStatus}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => {
                            const type = p.daysLeft < 0 ? "Overdue" : p.daysLeft === 0 ? "D-Day" : p.daysLeft <= 1 ? "D-1" : p.daysLeft <= 3 ? "D-3" : p.daysLeft <= 7 ? "D-7" : "D-7";
                            paymentReminders.unshift({
                              id: `rmd-${Date.now()}`, bookingId: p.id, ellisCode: p.ellisCode, guestName: p.guestName, hotelName: p.hotelName, amount: p.sumAmount,
                              deadline: p.cancelDeadline, type, channel: "Email", recipient: p.guestEmail,
                              sentAt: new Date().toISOString().replace("T", " ").slice(0, 19), status: "Sent", note: "Manual send by OP",
                            });
                            refresh();
                            toast.success(`Payment link sent to ${p.guestEmail}`, { description: `${type} reminder · logged in Reminder Log tab` });
                          }}>
                            Send Link
                          </Button>
                          <Button size="sm" className="h-7 text-[11px] text-white" style={{ background: "#FF6000" }} onClick={() => setPaymentTarget(p)}>
                            <CreditCard className="h-3 w-3 mr-0.5" />Pay Now
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {pendingPayments.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">No pending payments.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        )}

        {/* ══════ Reminder Log Tab (PREPAY) ══════ */}
        {isPrepay && (
          <TabsContent value="reminders" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card className="p-3"><p className="text-xs text-muted-foreground">Sent This Month</p><p className="text-lg font-bold">{reminderSummary.totalSentThisMonth}</p></Card>
              <Card className="p-3"><p className="text-xs text-muted-foreground">Open Rate</p><p className="text-lg font-bold">{reminderSummary.openRate}%</p></Card>
              <Card className="p-3"><p className="text-xs text-muted-foreground">Payment After Reminder</p><p className="text-lg font-bold text-green-600">{reminderSummary.paymentAfterReminderRate}%</p></Card>
              <Card className="p-3"><p className="text-xs text-muted-foreground">Auto-cancelled</p><p className="text-lg font-bold text-red-600">{reminderSummary.autoCancelled}</p></Card>
              <Card className="p-3"><p className="text-xs text-muted-foreground">Scheduled Today</p><p className="text-lg font-bold" style={{ color: "#FF6000" }}>{reminderSummary.scheduledToday}</p></Card>
            </div>

            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
              <Clock className="h-4 w-4 text-blue-600" />
              <AlertTitle>Auto Scheduler (cron · daily 09:00 KST)</AlertTitle>
              <AlertDescription className="text-xs">
                Reminders auto-sent via Email / In-app / SMS at D-7 / D-3 / D-1 / D-Day / Overdue.
                If payment completes within 24h after send, subsequent reminders are auto-cancelled.
              </AlertDescription>
            </Alert>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>ELLIS Code</TableHead>
                  <TableHead>Hotel · Guest</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentReminders.map(r => {
                  const typeColor = r.type === "Overdue" ? "destructive" : r.type === "D-Day" || r.type === "D-1" ? "destructive" : r.type === "D-3" ? "secondary" : "default";
                  const statusColor = r.status === "Opened" ? "default" : r.status === "Failed" ? "destructive" : "secondary";
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.sentAt}</TableCell>
                      <TableCell><Badge variant={typeColor} className="text-[10px]">{r.type}</Badge></TableCell>
                      <TableCell className="text-xs">{r.channel}</TableCell>
                      <TableCell className="font-mono text-xs">{r.ellisCode}</TableCell>
                      <TableCell className="text-xs">{r.hotelName} · {r.guestName}</TableCell>
                      <TableCell className="text-xs truncate max-w-[160px]">{r.recipient}</TableCell>
                      <TableCell className="text-right font-mono text-xs">${r.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-xs">{r.deadline}</TableCell>
                      <TableCell>
                        <Badge variant={statusColor} className="text-[10px]">{r.status}</Badge>
                        {r.openedAt && <p className="text-[9px] text-muted-foreground mt-0.5">opened {r.openedAt.split(" ")[0]}</p>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TabsContent>
        )}

        {/* ══════ Billing Details Tab ══════ */}
        <TabsContent value="billing" className="space-y-4 mt-4">
          <Card className="p-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-sm font-medium">Date Type</label>
                <select value={billDateType} onChange={e => setBillDateType(e.target.value as typeof billDateType)} className="w-full border rounded px-2 py-1.5 text-sm bg-background mt-1">
                  {["Created Date", "Due Date", "Settlement Date"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">From</label>
                <input type="date" value={billDateFrom} onChange={e => setBillDateFrom(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm bg-background mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">To</label>
                <input type="date" value={billDateTo} onChange={e => setBillDateTo(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm bg-background mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Bill Type</label>
                <select value={billType} onChange={e => setBillType(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm bg-background mt-1">
                  {["All", "Hotel Booking", "Cancellation Fee", "Adjustment"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="md:col-span-3">
                <label className="text-sm font-medium">Bill ID / Booking ID</label>
                <Input placeholder="Search..." value={billSearch} onChange={e => setBillSearch(e.target.value)} className="mt-1" />
              </div>
              <div className="flex items-end gap-2">
                <Button size="sm" onClick={() => toast.success(`${filteredBills.length} records found`)}><Search className="h-3 w-3 mr-1" />Search</Button>
                <Button variant="outline" size="sm" onClick={() => { setBillType("All"); setBillSearch(""); setBillDateFrom(""); setBillDateTo(""); setBillDateType("Created Date"); }}><X className="h-3 w-3 mr-1" />Reset</Button>
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
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
            <AlertDescription className="text-xs">
              <strong>Contract Currency</strong> is fixed at contract signing.
              Customer receives invoice in contract currency and wires <strong>exactly that amount</strong> (FX conversion is handled on customer side).
              <br />POSTPAY = one aggregate invoice per settlement cycle · PREPAY = one invoice per booking
            </AlertDescription>
          </Alert>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Received</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map(inv => {
                const variance = inv.total - inv.receivedAmount;
                const hasDispute = inv.disputedAmount > 0;
                const curr = inv.contractCurrency;
                const fmt = (n: number) => `${curr} ${n.toLocaleString()}`;
                return (
                  <TableRow key={inv.invoiceNo} className={`cursor-pointer hover:bg-muted/50 ${hasDispute ? "bg-amber-50/60 dark:bg-amber-950/10" : ""}`} onClick={() => navigate(`/app/settlement/invoice/${inv.invoiceNo}`)}>
                    <TableCell className="font-mono text-sm text-[#0066cc] hover:underline">
                      {inv.invoiceNo}
                      {hasDispute && <Sparkles className="h-3 w-3 inline ml-1 text-amber-500" />}
                    </TableCell>
                    <TableCell><Badge variant={inv.billingType === "PREPAY" ? "destructive" : "default"} className="text-[10px]">{inv.billingType}</Badge></TableCell>
                    <TableCell className="text-xs">{inv.period}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{inv.bookingIds.length}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] font-mono">{curr}</Badge></TableCell>
                    <TableCell className="text-sm">{inv.dueDate}</TableCell>
                    <TableCell><Badge variant={invStatusColors[inv.status] as "default" | "secondary" | "destructive"}>{inv.status}</Badge></TableCell>
                    <TableCell className="text-right font-mono font-bold">{fmt(inv.total)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{fmt(inv.receivedAmount)}</TableCell>
                    <TableCell className={`text-right font-mono text-sm font-medium ${variance > 0 ? "text-amber-600" : variance < 0 ? "text-blue-600" : "text-green-600"}`}>
                      {variance === 0 ? "—" : `${curr} ${Math.abs(variance).toLocaleString()}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={(e) => { e.stopPropagation(); setPreviewInvoice(inv); }}>
                          <Download className="h-3 w-3 mr-0.5" />PDF
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={(e) => { e.stopPropagation(); navigate(`/app/settlement/invoice/${inv.invoiceNo}`); }}>
                          <ExternalLink className="h-3 w-3 mr-0.5" />Detail
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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

          {/* Customer-level Aging Breakdown (Deep) */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold">Customer Aging Breakdown</h3>
              <Button size="sm" variant="outline" onClick={() => {
                const rows = companies.map(c => {
                  const share = (ar30 + ar60 + ar90 + arCurrent) > 0 ? Math.random() * 0.3 : 0;  /* demo distribution */
                  return {
                    Customer: c.name, Country: c.country, BillingType: c.billingType,
                    Current: (arCurrent * share).toFixed(0),
                    "1-30d": (ar30 * share).toFixed(0),
                    "31-60d": (ar60 * share).toFixed(0),
                    "60+d": (ar90 * share).toFixed(0),
                    CreditLimit: c.depositAmount || 0,
                  };
                });
                downloadCSV(`aging_by_customer_${timestamp()}.csv`, rows);
                toast.success("Customer aging CSV exported");
              }}>
                <Download className="h-3 w-3 mr-1" />Export CSV
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Country · Billing</TableHead>
                  <TableHead className="text-right text-[10px] text-green-600">Current</TableHead>
                  <TableHead className="text-right text-[10px] text-amber-600">1-30d</TableHead>
                  <TableHead className="text-right text-[10px] text-orange-600">31-60d</TableHead>
                  <TableHead className="text-right text-[10px] text-red-600">60+d</TableHead>
                  <TableHead className="text-right">Total Outstanding</TableHead>
                  <TableHead className="text-right">Deposit Covered</TableHead>
                  <TableHead>DSO Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((c, idx) => {
                  /* Distribute AR across companies for demo */
                  const weights = [0.35, 0.22, 0.18, 0.10, 0.08, 0.05, 0.02];
                  const w = weights[idx] || 0.05;
                  const cur = Math.round(arCurrent * w);
                  const d30 = Math.round(ar30 * w);
                  const d60 = Math.round(ar60 * w);
                  const d90 = Math.round(ar90 * w);
                  const total = cur + d30 + d60 + d90;
                  const deposit = c.depositAmount || 0;
                  const coverage = deposit > 0 ? Math.min(100, Math.round((deposit / Math.max(total, 1)) * 100)) : 0;
                  const dsoRisk = d90 > 0 ? "High" : d60 > 0 ? "Medium" : d30 > 0 ? "Low" : "—";
                  const riskColor = dsoRisk === "High" ? "destructive" : dsoRisk === "Medium" ? "secondary" : "default";
                  return (
                    <TableRow key={c.id} className={d90 > 0 ? "bg-red-50/60 dark:bg-red-950/10" : d60 > 0 ? "bg-amber-50/60 dark:bg-amber-950/10" : ""}>
                      <TableCell className="font-medium text-sm">{c.name}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-[10px] mr-1">{c.country}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{c.billingType}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">${cur.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-xs">${d30.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-xs">${d60.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold">{d90 > 0 ? `$${d90.toLocaleString()}` : "—"}</TableCell>
                      <TableCell className="text-right font-mono font-medium">${total.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{deposit > 0 ? `${coverage}%` : "—"}</TableCell>
                      <TableCell><Badge variant={riskColor} className="text-[10px]">{dsoRisk}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <span>📊 Coverage = Deposit ÷ Outstanding</span>
              <span>·</span>
              <span>⚠️ High DSO Risk: 60+ days overdue → recommend collections team assignment</span>
            </div>
          </Card>

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

        {/* ══════ Month-End Close Tab ══════ */}
        <TabsContent value="closing" className="space-y-4 mt-4">
          <MonthEndClose />
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

      {/* Invoice Preview (A4 + 5 languages) */}
      <InvoicePreviewDialog open={!!previewInvoice} onOpenChange={(o) => !o && setPreviewInvoice(null)} invoice={previewInvoice} />

      {/* PREPAY PG Card Payment */}
      <PaymentDialog
        open={!!paymentTarget}
        onOpenChange={(o) => !o && setPaymentTarget(null)}
        amount={paymentTarget?.sumAmount || 0}
        currency={paymentTarget?.currency || "USD"}
        onPaymentComplete={handlePaymentComplete}
      />

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
