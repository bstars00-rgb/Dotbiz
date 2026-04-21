import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Download, CreditCard, RefreshCw, Search, X, CheckCircle2, Clock, AlertTriangle, Sparkles, ExternalLink } from "lucide-react";
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
import { billingDetails, invoices, accountsReceivable, disputeSummary } from "@/mocks/settlement";
import { companies, currentCompany } from "@/mocks/companies";
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
  /* PREPAY policy: deadline passed → auto-cancel immediately.
   * So bookings with daysLeft < 0 are filtered out from Pending Payment entirely.
   */
  const visiblePending = useMemo(() => pendingPayments.filter(p => p.daysLeft >= 0), [pendingPayments]);
  const d7Count = visiblePending.filter(p => p.daysLeft <= 7).length;
  const todayCount = visiblePending.filter(p => p.daysLeft === 0).length;
  const todayTotal = visiblePending.filter(p => p.daysLeft === 0).reduce((s, p) => s + p.sumAmount, 0);

  /* Pending Payment filters */
  const [pendingFilter, setPendingFilter] = useState<"all" | "today" | "tomorrow" | "week" | "custom">("all");
  const [pendingFrom, setPendingFrom] = useState("");
  const [pendingTo, setPendingTo] = useState("");
  const filteredPending = useMemo(() => {
    if (pendingFilter === "today") return visiblePending.filter(p => p.daysLeft === 0);
    if (pendingFilter === "tomorrow") return visiblePending.filter(p => p.daysLeft === 1);
    if (pendingFilter === "week") return visiblePending.filter(p => p.daysLeft <= 7);
    if (pendingFilter === "custom") {
      return visiblePending.filter(p => {
        const dl = p.cancelDeadline.split(" ")[0];
        if (pendingFrom && dl < pendingFrom) return false;
        if (pendingTo && dl > pendingTo) return false;
        return true;
      });
    }
    return visiblePending;
  }, [pendingFilter, pendingFrom, pendingTo, visiblePending]);

  /* Bulk selection */
  const [pendingSelected, setPendingSelected] = useState<Set<string>>(new Set());
  const togglePending = (id: string) => setPendingSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAllPending = () => {
    const allInViewSelected = filteredPending.length > 0 && filteredPending.every(p => pendingSelected.has(p.id));
    if (allInViewSelected) {
      /* Deselect only items in current view (keep hidden selections intact) */
      setPendingSelected(prev => { const n = new Set(prev); filteredPending.forEach(p => n.delete(p.id)); return n; });
    } else {
      /* Select all items currently in view (add to existing) */
      setPendingSelected(prev => { const n = new Set(prev); filteredPending.forEach(p => n.add(p.id)); return n; });
    }
  };
  const selectedPendingItems = filteredPending.filter(p => pendingSelected.has(p.id));
  const selectedPendingTotal = selectedPendingItems.reduce((s, p) => s + p.sumAmount, 0);
  const [bulkPayOpen, setBulkPayOpen] = useState(false);

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
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{t("page.settlement")}</h1>
            <Badge
              variant="outline"
              className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-300"
              title="Settlement cycle is fixed by contract (Weekly / Bi-weekly / Monthly). Changes require contract amendment."
            >
              {activeCompany.billingType}
              {activeCompany.billingType === "POSTPAY" && activeCompany.settlementCycle && ` · ${activeCompany.settlementCycle}`}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{activeCompany.name}</p>
        </div>

        {/* Quick KPI */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span><strong>{disputeSummary.openCount}</strong> open disputes</span>
            <span className="text-muted-foreground">· ${disputeSummary.openAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Deposit Utilization Card (POSTPAY only) — large, prominent */}
      {activeCompany.billingType === "POSTPAY" && activeCompany.depositAmount && (() => {
        const deposit = activeCompany.depositAmount;
        const used = myInvoices
          .filter(i => i.matchStatus !== "Full" && i.matchStatus !== "Reconciled")
          .reduce((s, i) => s + (i.total - i.receivedAmount), 0);
        const available = Math.max(0, deposit - used);
        const usedPct = Math.min(100, Math.round((used / deposit) * 100));
        const availPct = 100 - usedPct;
        const barColor = usedPct >= 80 ? "#DC2626" : usedPct >= 70 ? "#FF6000" : usedPct >= 50 ? "#FF8C00" : "#009505";
        const lowDeposit = availPct <= 30;
        return (
          <Card className={`p-6 ${lowDeposit ? "border-2 border-red-500 bg-red-50/40 dark:bg-red-950/10" : "border-2 border-slate-200 dark:border-slate-800"}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[400px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: barColor + "20" }}>
                    <CreditCard className="h-5 w-5" style={{ color: barColor }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{activeCompany.depositType}</h2>
                    <p className="text-xs text-muted-foreground">Your credit collateral with OhMyHotel</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-3xl font-bold" style={{ color: barColor }}>{usedPct}%</p>
                    <p className="text-[10px] text-muted-foreground uppercase">used</p>
                  </div>
                </div>

                {/* Big progress bar */}
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
                  <div className="h-full rounded-full transition-all flex items-center justify-end pr-2" style={{ width: `${usedPct}%`, background: barColor }}>
                    {usedPct > 15 && <span className="text-[10px] font-bold text-white">${used.toLocaleString()}</span>}
                  </div>
                </div>

                {/* 3 big stat blocks */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Total Deposit</p>
                    <p className="text-xl font-bold font-mono">${deposit.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Used (Outstanding)</p>
                    <p className="text-xl font-bold font-mono" style={{ color: barColor }}>${used.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Available</p>
                    <p className={`text-xl font-bold font-mono ${lowDeposit ? "text-red-600" : "text-green-600"}`}>${available.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top-up CTA when low */}
            {lowDeposit && (
              <Alert className="mt-4 border-red-300 bg-red-50 dark:bg-red-950/30">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-900 dark:text-red-100">Deposit running low — only {availPct}% available</AlertTitle>
                <AlertDescription className="text-xs text-red-800 dark:text-red-200 flex items-center justify-between gap-3 flex-wrap mt-1">
                  <span>
                    Top up your deposit to keep booking smoothly. Once available reaches $0, new bookings will be blocked
                    until existing invoices are settled or the deposit is increased.
                  </span>
                  <Button size="sm" className="text-white shrink-0" style={{ background: "#DC2626" }} onClick={() => toast.success("Top-up request sent to OhMyHotel finance team", { description: "Our team will contact you within 1 business day." })}>
                    <CreditCard className="h-3 w-3 mr-1" />Top Up Deposit
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {!lowDeposit && availPct <= 50 && (
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-3 flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" />
                Heads up: deposit is <strong>{availPct}%</strong> available. Consider topping up before bookings reach the limit.
              </p>
            )}
          </Card>
        );
      })()}


      <Tabs defaultValue={isPrepay ? "pending" : "invoices"}>
        <TabsList className="!h-auto flex-wrap justify-start gap-1">
          {isPrepay && <TabsTrigger value="pending">Pending Payment {visiblePending.length > 0 && <span className="ml-1 text-[10px] bg-red-500 text-white rounded-full px-1.5">{visiblePending.length}</span>}</TabsTrigger>}
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="billing">Billing Details</TabsTrigger>
          {!isPrepay && <TabsTrigger value="ar">Accounts Receivable</TabsTrigger>}
        </TabsList>

        {/* ══════ PREPAY Pending Payment Tab ══════ */}
        {isPrepay && (
          <TabsContent value="pending" className="space-y-4 mt-4">
            {/* Timezone policy notice */}
            <Alert className="border-slate-200 bg-slate-50 dark:bg-slate-900/20">
              <Clock className="h-4 w-4 text-slate-600" />
              <AlertDescription className="text-xs">
                All payment deadlines operate on <strong>KST (UTC+9)</strong> — OhMyHotel's operational timezone. Bookings past their KST deadline are automatically cancelled. Please schedule remittance accordingly if your team operates in a different timezone.
              </AlertDescription>
            </Alert>

            {/* Today's Action Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className={`p-4 border-2 ${todayCount > 0 ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20" : ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className={`h-4 w-4 ${todayCount > 0 ? "text-amber-600" : "text-muted-foreground"}`} />
                  <p className="text-xs font-medium">Due Today <span className="text-[10px] text-muted-foreground font-normal">(KST)</span></p>
                </div>
                <p className={`text-2xl font-bold ${todayCount > 0 ? "text-amber-600" : ""}`}>{todayCount} <span className="text-sm font-normal">bookings</span></p>
                <p className="text-xs text-muted-foreground">${todayTotal.toLocaleString()} · last chance today</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-medium">This Week <span className="text-[10px] text-muted-foreground font-normal">(KST)</span></p>
                </div>
                <p className="text-2xl font-bold">{d7Count} <span className="text-sm font-normal">bookings</span></p>
                <p className="text-xs text-muted-foreground">within 7 days</p>
              </Card>
            </div>

            {/* Filter Bar */}
            <Card className="p-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground mr-1">Filter by deadline:</span>
                {[
                  { key: "all" as const, label: "All", count: visiblePending.length },
                  { key: "today" as const, label: "Today", count: todayCount },
                  { key: "tomorrow" as const, label: "Tomorrow", count: visiblePending.filter(p => p.daysLeft === 1).length },
                  { key: "week" as const, label: "Next 7 days", count: d7Count },
                  { key: "custom" as const, label: "Custom range", count: -1 },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setPendingFilter(f.key)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${pendingFilter === f.key ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}
                  >
                    {f.label}{f.count >= 0 && <span className="ml-1 opacity-60">({f.count})</span>}
                  </button>
                ))}
                {pendingFilter === "custom" && (
                  <div className="flex items-center gap-2 ml-2">
                    <input type="date" value={pendingFrom} onChange={e => setPendingFrom(e.target.value)} className="border rounded px-2 py-1 text-xs bg-background" />
                    <span className="text-xs text-muted-foreground">→</span>
                    <input type="date" value={pendingTo} onChange={e => setPendingTo(e.target.value)} className="border rounded px-2 py-1 text-xs bg-background" />
                  </div>
                )}
                <span className="ml-auto text-xs text-muted-foreground">{filteredPending.length} result(s)</span>
              </div>
            </Card>

            {/* Bulk Action Bar */}
            {selectedPendingItems.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-300 dark:border-orange-900 rounded-lg sticky top-0 z-10">
                <span className="text-sm font-medium">
                  {selectedPendingItems.length} selected
                  {pendingSelected.size > selectedPendingItems.length && (
                    <span className="ml-1 text-xs text-muted-foreground">({pendingSelected.size - selectedPendingItems.length} hidden by filter)</span>
                  )}
                </span>
                <span className="text-sm font-bold" style={{ color: "#FF6000" }}>Total: ${selectedPendingTotal.toLocaleString()}</span>
                <Button size="sm" className="text-white" style={{ background: "#FF6000" }} onClick={() => setBulkPayOpen(true)}>
                  <CreditCard className="h-3 w-3 mr-1" />Pay {selectedPendingItems.length} bookings
                </Button>
                <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setPendingSelected(new Set())}>Clear</Button>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={filteredPending.length > 0 && filteredPending.every(p => pendingSelected.has(p.id))}
                      onCheckedChange={selectAllPending}
                    />
                  </TableHead>
                  <TableHead>ELLIS Code</TableHead>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead title="Deadline in KST (OhMyHotel operational timezone)">Deadline (KST)</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPending.map(p => {
                  const urgency = p.daysLeft <= 3 ? "destructive" : p.daysLeft <= 7 ? "secondary" : "default";
                  const label = p.daysLeft === 0 ? "Today" : `${p.daysLeft} days`;
                  return (
                    <TableRow key={p.id} className={p.daysLeft === 0 ? "bg-amber-50 dark:bg-amber-950/10" : p.daysLeft <= 3 ? "bg-orange-50/60 dark:bg-orange-950/10" : ""}>
                      <TableCell><Checkbox checked={pendingSelected.has(p.id)} onCheckedChange={() => togglePending(p.id)} /></TableCell>
                      <TableCell className="font-mono text-xs">{p.ellisCode}</TableCell>
                      <TableCell className="text-sm">{p.hotelName}</TableCell>
                      <TableCell className="text-xs">{p.guestName}</TableCell>
                      <TableCell className="text-xs">{p.checkIn}</TableCell>
                      <TableCell className="text-right font-mono font-medium">${p.sumAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-xs font-mono">{p.cancelDeadline}</TableCell>
                      <TableCell><Badge variant={urgency} className="text-[10px]">{label}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" className="h-7 text-[11px] text-white" style={{ background: "#FF6000" }} onClick={() => setPaymentTarget(p)}>
                            <CreditCard className="h-3 w-3 mr-0.5" />Pay Now
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredPending.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">No bookings match the filter.</TableCell></TableRow>
                )}
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
                <TableHead>Booking / Hotel</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead title="User/time of invoice creation">First Insert</TableHead>
                <TableHead title="User/time of most recent update">Last Update</TableHead>
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
                    <TableCell className="text-xs">
                      {inv.billingType === "PREPAY" && inv.bookingIds.length > 0 ? (() => {
                        const b = allBookings.find(x => x.id === inv.bookingIds[0]);
                        return b ? <><span className="font-mono text-[#0066cc]">{b.ellisCode}</span><br /><span className="text-muted-foreground">{b.hotelName}</span></> : "—";
                      })() : <span className="text-muted-foreground italic">Aggregate</span>}
                    </TableCell>
                    <TableCell className="text-xs text-center font-mono">{inv.bookingIds.length}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] font-mono">{curr}</Badge></TableCell>
                    <TableCell className="text-sm">{inv.dueDate}</TableCell>
                    <TableCell><Badge variant={invStatusColors[inv.status] as "default" | "secondary" | "destructive"}>{inv.status}</Badge></TableCell>
                    <TableCell className="text-right font-mono font-bold">{fmt(inv.total)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{fmt(inv.paidAmount ?? inv.receivedAmount)}</TableCell>
                    <TableCell className={`text-right font-mono text-sm font-medium ${variance > 0 ? "text-amber-600" : variance < 0 ? "text-blue-600" : "text-green-600"}`}>
                      {variance === 0 ? "—" : `${curr} ${Math.abs(variance).toLocaleString()}`}
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">
                      <p className="font-mono">{inv.firstInsertUser}</p>
                      <p className="font-mono">{inv.firstInsertTime}</p>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">
                      <p className="font-mono">{inv.lastUpdateUser}</p>
                      <p className="font-mono">{inv.lastUpdateTime}</p>
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

        {/* ══════ Accounts Receivable Tab (POSTPAY only) ══════ */}
        {!isPrepay && <TabsContent value="ar" className="space-y-4 mt-4">
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
        </TabsContent>}

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

      {/* PREPAY PG Card Payment — single */}
      <PaymentDialog
        open={!!paymentTarget}
        onOpenChange={(o) => !o && setPaymentTarget(null)}
        amount={paymentTarget?.sumAmount || 0}
        currency={paymentTarget?.currency || "USD"}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* PREPAY Bulk Payment */}
      <PaymentDialog
        open={bulkPayOpen}
        onOpenChange={(o) => !o && setBulkPayOpen(false)}
        amount={selectedPendingTotal}
        currency="USD"
        onPaymentComplete={() => {
          selectedPendingItems.forEach(p => {
            const b = allBookings.find(x => x.id === p.id);
            if (b) { b.paymentStatus = "Fully Paid"; b.paymentChannel = "Credit Card"; b.paymentMethod = "PG Card Payment (Bulk)"; }
          });
          toast.success(`${pendingSelected.size} bookings paid`, { description: `Total $${selectedPendingTotal.toLocaleString()} charged in one transaction.` });
          setPendingSelected(new Set());
          setBulkPayOpen(false);
          refresh();
        }}
      />

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
