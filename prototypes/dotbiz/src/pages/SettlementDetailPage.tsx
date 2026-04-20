import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Download, DollarSign, AlertTriangle, CheckCircle2, Sparkles, FileText, Clock, Zap, Ticket as TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { invoices, paymentMatchLog as initialLog, disputeSummary, type InvoiceWithMatch, type PaymentMatchLog } from "@/mocks/settlement";
import { bookings as allBookings, type Booking } from "@/mocks/bookings";
import { currentCompany } from "@/mocks/companies";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CheckCircle, XCircle, UserCheck } from "lucide-react";

/* DIDA-inspired Settlement Detail Page
 * URL: /app/settlement/invoice/:invoiceNo
 *
 * 핵심 기능:
 * 1. 인보이스 상세 (기간, 총액, 예약 목록)
 * 2. Payment Matching — 실제 입금액 입력 → 차액 자동 감지
 * 3. Dispute Detection — 차액에 매칭되는 예약 자동 하이라이트
 * 4. Dispute 등록 → 티켓 연결
 * 5. VLOOKUP 절감 시간 KPI 표시
 */
export default function SettlementDetailPage() {
  const { invoiceNo } = useParams<{ invoiceNo: string }>();
  const navigate = useNavigate();
  const { hasRole, user } = useAuth();
  const isMaster = hasRole(["Master"]);
  const userRole = user?.role || "OP";

  const [invoice, setInvoice] = useState<InvoiceWithMatch | null>(() => invoices.find(i => i.invoiceNo === invoiceNo) || null);
  const [matchLog, setMatchLog] = useState<PaymentMatchLog[]>(initialLog);

  /* Payment Match panel state */
  const [receivedInput, setReceivedInput] = useState(() => invoice?.receivedAmount.toString() || "");
  const [matchResult, setMatchResult] = useState<{ exclusions: Booking[]; variance: number; perfectMatch: boolean } | null>(null);

  /* Dispute dialog state */
  const [disputeTarget, setDisputeTarget] = useState<Booking | null>(null);
  const [disputeReason, setDisputeReason] = useState<string>("Room type mismatch");
  const [disputeNote, setDisputeNote] = useState("");

  /* Auto-matched bookings for this invoice */
  const linkedBookings = useMemo(() => {
    if (!invoice) return [];
    return invoice.bookingIds
      .map(id => allBookings.find(b => b.id === id))
      .filter((b): b is Booking => !!b);
  }, [invoice]);

  const logsForInvoice = matchLog.filter(l => l.invoiceNo === invoiceNo);

  if (!hasRole(["Master", "OP"])) {
    return (
      <div className="p-6">
        <Alert><AlertTitle>Access Restricted</AlertTitle><AlertDescription>Settlement Detail requires Master or OP role.</AlertDescription></Alert>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <Alert variant="destructive"><AlertTitle>Invoice not found</AlertTitle><AlertDescription>No invoice matches <strong>{invoiceNo}</strong>.</AlertDescription></Alert>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/app/settlement")}><ArrowLeft className="h-4 w-4 mr-1" />Back to Settlement</Button>
      </div>
    );
  }

  /* ─────────── Core algorithm: Payment Matching ─────────── */
  /*
   * 1. 고객 입금액 vs 인보이스 총액 비교
   * 2. 차액 발생 시, 각 예약 금액의 합이 차액과 일치하는 조합을 찾음
   * 3. subset-sum 문제이지만 현장에선 보통 1~3건 제외이므로 brute-force OK
   */
  const detectExclusions = (received: number): { exclusions: Booking[]; variance: number; perfectMatch: boolean } => {
    const variance = invoice.total - received;
    if (variance === 0) return { exclusions: [], variance: 0, perfectMatch: true };
    if (variance < 0) return { exclusions: [], variance, perfectMatch: false };  /* overpay */

    /* Try to find subset whose sum = variance */
    const items = linkedBookings.map(b => ({ b, amt: b.sumAmount }));

    /* Subset-sum (up to 10 items → 2^10 = 1024 combos, trivial) */
    const n = items.length;
    for (let mask = 1; mask < (1 << n); mask++) {
      let sum = 0;
      const subset: Booking[] = [];
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) { sum += items[i].amt; subset.push(items[i].b); }
      }
      if (sum === variance) return { exclusions: subset, variance, perfectMatch: false };
    }

    return { exclusions: [], variance, perfectMatch: false };
  };

  const runMatch = () => {
    const received = parseFloat(receivedInput) || 0;
    const result = detectExclusions(received);
    setMatchResult(result);

    /* Add to log — requires Master approval before reconcile */
    const newLog: PaymentMatchLog = {
      id: `pml-${Date.now()}`,
      invoiceNo: invoice.invoiceNo,
      expectedAmount: invoice.total,
      receivedAmount: received,
      variance: result.variance,
      detectedExclusions: result.exclusions.map(b => b.id),
      matchedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      matchedBy: `${user?.name || "Unknown"} (${userRole})`,
      status: result.perfectMatch ? "Auto-matched" : "Manual-review",
      vlookupTimeSavedMinutes: result.exclusions.length > 0 ? 30 + result.exclusions.length * 15 : 10,
      approvalStatus: "Pending Master",
    };
    setMatchLog(prev => [newLog, ...prev]);

    if (result.perfectMatch) {
      toast.success("✓ Full match — no exclusions detected", { description: "Payment reconciled successfully." });
    } else if (result.exclusions.length > 0) {
      toast.warning(`⚠️ ${result.exclusions.length} exclusion(s) auto-detected`, { description: `Variance $${result.variance.toLocaleString()} matches these bookings exactly. Consider disputing.` });
    } else if (result.variance > 0) {
      toast.error("No exact subset found", { description: `Variance $${result.variance.toLocaleString()} doesn't match any combination. Manual review required.` });
    } else {
      toast.error("Overpayment detected", { description: `Received $${Math.abs(result.variance).toLocaleString()} more than expected.` });
    }
  };

  const openDispute = (b: Booking) => {
    setDisputeTarget(b);
    setDisputeReason(b.disputeReason || "Room type mismatch");
    setDisputeNote(b.disputeNote || "");
  };

  const submitDispute = () => {
    if (!disputeTarget) return;
    /* Mutate booking in-place (mock) */
    disputeTarget.disputed = true;
    disputeTarget.disputeStatus = "Open";
    disputeTarget.disputeReason = disputeReason as Booking["disputeReason"];
    disputeTarget.disputeNote = disputeNote;
    disputeTarget.disputeDate = new Date().toISOString().split("T")[0];

    /* Update invoice */
    setInvoice(prev => {
      if (!prev) return prev;
      const newDisputed = [...new Set([...prev.disputedBookingIds, disputeTarget.id])];
      const newDisputedAmount = newDisputed.reduce((s, id) => {
        const b = allBookings.find(x => x.id === id);
        return s + (b?.sumAmount || 0);
      }, 0);
      return { ...prev, disputedBookingIds: newDisputed, disputedAmount: newDisputedAmount };
    });

    toast.success(`Dispute registered for ${disputeTarget.ellisCode}`, { description: `Reason: ${disputeReason}` });
    setDisputeTarget(null);
  };

  const approveMatch = (logId: string) => {
    if (!isMaster) { toast.error("Master 권한 필요"); return; }
    setMatchLog(prev => prev.map(l => l.id === logId ? {
      ...l, approvalStatus: "Approved" as const,
      approvedBy: `${user?.name} (Master)`, approvedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
    } : l));
    /* Reconcile invoice */
    setInvoice(prev => prev ? { ...prev, matchStatus: "Reconciled" } : prev);
    toast.success("Payment match approved", { description: "Invoice reconciled. Disputes confirmed." });
  };

  const rejectMatch = (logId: string) => {
    if (!isMaster) { toast.error("Master 권한 필요"); return; }
    const reason = window.prompt("Rejection reason?", "Need manual review");
    if (!reason) return;
    setMatchLog(prev => prev.map(l => l.id === logId ? {
      ...l, approvalStatus: "Rejected" as const,
      approvedBy: `${user?.name} (Master)`, approvedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      rejectedReason: reason,
    } : l));
    toast.warning("Match rejected — OP will re-run", { description: reason });
  };

  const resolveDispute = (b: Booking) => {
    b.disputeStatus = "Resolved";
    b.disputeResolvedDate = new Date().toISOString().split("T")[0];

    /* Carry over to next invoice (Mar → Apr) */
    const currentIdx = invoices.findIndex(i => i.invoiceNo === invoice?.invoiceNo);
    const nextInvoice = invoices.slice(currentIdx + 1).find(i => i.status === "Issued" || i.status === "Unpaid");
    /* Fallback: find by period sequence (next month) */
    const targetNext = nextInvoice || invoices.find(i => i.carriedOverFrom === invoice?.invoiceNo);

    if (targetNext) {
      targetNext.carriedOverBookingIds = [...new Set([...(targetNext.carriedOverBookingIds || []), b.id])];
      targetNext.carriedOverAmount = (targetNext.carriedOverAmount || 0) + b.sumAmount;
      /* Also add to bookingIds so it's billed next cycle */
      if (!targetNext.bookingIds.includes(b.id)) {
        targetNext.bookingIds = [...targetNext.bookingIds, b.id];
        targetNext.total += b.sumAmount;
        targetNext.supplyAmount = Math.round(targetNext.total / 1.1);
        targetNext.vat = targetNext.total - targetNext.supplyAmount;
      }
      /* Point booking to new invoice */
      b.invoiceNo = targetNext.invoiceNo;
    }

    /* Remove from current invoice disputedBookingIds */
    setInvoice(prev => {
      if (!prev) return prev;
      const newDisputed = prev.disputedBookingIds.filter(id => id !== b.id);
      const newAmt = newDisputed.reduce((s, id) => s + (allBookings.find(x => x.id === id)?.sumAmount || 0), 0);
      return { ...prev, disputedBookingIds: newDisputed, disputedAmount: newAmt };
    });

    toast.success(`Dispute resolved: ${b.ellisCode}`, {
      description: targetNext
        ? `Carried over to ${targetNext.invoiceNo} (${targetNext.period}). Will be billed in next cycle.`
        : "No next invoice available — booking marked resolved only.",
    });
  };

  const matchStatusBadge = {
    Unpaid: { label: "Unpaid", variant: "destructive" as const, bg: "bg-red-50 dark:bg-red-950/20" },
    Partial: { label: "Partial (Dispute Detected)", variant: "secondary" as const, bg: "bg-amber-50 dark:bg-amber-950/20" },
    Full: { label: "Fully Paid", variant: "default" as const, bg: "bg-green-50 dark:bg-green-950/20" },
    Reconciled: { label: "Reconciled", variant: "default" as const, bg: "bg-green-50 dark:bg-green-950/20" },
  };
  const matchBadge = matchStatusBadge[invoice.matchStatus];

  const totalSavedMinutes = matchLog.reduce((s, l) => s + l.vlookupTimeSavedMinutes, 0);

  return (
    <div className="p-6 space-y-4 max-w-[1400px] mx-auto">
      {/* Breadcrumb / Back */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/app/settlement")}>
          <ArrowLeft className="h-4 w-4 mr-1" />Settlement
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="font-mono font-medium">{invoice.invoiceNo}</span>
      </div>

      {/* ─────────── Header Card ─────────── */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{invoice.invoiceNo}</h1>
              <Badge variant={matchBadge.variant}>{matchBadge.label}</Badge>
              <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300">
                {currentCompany.billingType}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentCompany.name} · Period <strong>{invoice.period}</strong> · Issued {invoice.issuedDate} · Due {invoice.dueDate}
            </p>
            {invoice.remarks && (
              <p className="text-xs text-amber-700 dark:text-amber-300">⚠️ {invoice.remarks}</p>
            )}
            {invoice.carriedOverBookingIds && invoice.carriedOverBookingIds.length > 0 && (
              <p className="text-xs text-blue-700 dark:text-blue-300">
                🔄 Carried over from <span className="font-mono">{invoice.carriedOverFrom}</span>: {invoice.carriedOverBookingIds.length} booking(s) · ${(invoice.carriedOverAmount || 0).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.success("Invoice PDF exported")}>
              <Download className="h-3.5 w-3.5 mr-1" />Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("Email sent to " + currentCompany.email)}>
              <FileText className="h-3.5 w-3.5 mr-1" />Send to Client
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Invoice Total</p>
            <p className="text-2xl font-bold">${invoice.total.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{invoice.bookingIds.length} bookings</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Received</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">${invoice.receivedAmount.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{invoice.paymentDate || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Variance (Disputed)</p>
            <p className={`text-2xl font-bold ${invoice.disputedAmount > 0 ? "text-red-600 dark:text-red-400" : ""}`}>
              ${invoice.disputedAmount.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">{invoice.disputedBookingIds.length} booking(s)</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <p className="text-2xl font-bold">${(invoice.total - invoice.receivedAmount).toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Awaiting resolution</p>
          </div>
        </div>
      </Card>

      {/* ─────────── Payment Matching Panel (핵심!) ─────────── */}
      <Card className="p-5 border-2" style={{ borderColor: "#FF6000" }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5" style={{ color: "#FF6000" }} />
          <h2 className="text-lg font-bold">Payment Matching — 입금 차액 자동 감지</h2>
          <Badge variant="outline" className="ml-auto text-[10px]">
            <Zap className="h-3 w-3 mr-0.5" />Replaces Excel VLOOKUP
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          고객사가 분쟁 건을 빼고 송금하면, 차액 = 제외된 예약 금액의 합. 시스템이 조합을 자동으로 찾아냅니다.
        </p>

        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-muted-foreground">고객 실제 입금액 (USD)</label>
            <Input
              type="number"
              value={receivedInput}
              onChange={e => setReceivedInput(e.target.value)}
              placeholder={invoice.total.toString()}
              className="mt-1 font-mono text-lg"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Expected</label>
            <p className="mt-1 font-mono text-lg h-10 flex items-center">${invoice.total.toLocaleString()}</p>
          </div>
          <Button onClick={runMatch} style={{ background: "#FF6000" }} className="text-white hover:opacity-90">
            <Sparkles className="h-4 w-4 mr-1" />Run Auto-Match
          </Button>
        </div>

        {/* Match Result */}
        {matchResult && (
          <div className="mt-4">
            {matchResult.perfectMatch ? (
              <Alert className="border-green-300 bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900 dark:text-green-100">Perfect Match ✓</AlertTitle>
                <AlertDescription className="text-green-800 dark:text-green-200 text-xs">
                  Received amount matches invoice total. No exclusions detected. Ready to reconcile.
                </AlertDescription>
              </Alert>
            ) : matchResult.exclusions.length > 0 ? (
              <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-900 dark:text-amber-100">
                  Variance ${matchResult.variance.toLocaleString()} → {matchResult.exclusions.length} booking(s) auto-detected as excluded
                </AlertTitle>
                <AlertDescription className="text-amber-800 dark:text-amber-200 text-xs mt-2">
                  <p className="mb-2">다음 예약들의 합이 차액과 정확히 일치합니다. 분쟁으로 등록하시겠습니까?</p>
                  <div className="space-y-1">
                    {matchResult.exclusions.map(b => (
                      <div key={b.id} className="flex items-center gap-2 bg-white/50 dark:bg-black/20 rounded px-2 py-1">
                        <span className="font-mono text-[11px]">{b.ellisCode}</span>
                        <span>·</span>
                        <span>{b.hotelName}</span>
                        <span>·</span>
                        <span className="font-bold">${b.sumAmount.toLocaleString()}</span>
                        <Button size="sm" variant="ghost" className="ml-auto h-6 text-[11px]" onClick={() => openDispute(b)}>
                          Register Dispute →
                        </Button>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            ) : matchResult.variance > 0 ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No matching combination found</AlertTitle>
                <AlertDescription className="text-xs">
                  Variance ${matchResult.variance.toLocaleString()} doesn't match any subset of bookings. Manual review required — check for partial dispute amounts, late fees, or FX differences.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Overpayment</AlertTitle>
                <AlertDescription className="text-xs">
                  Received ${Math.abs(matchResult.variance).toLocaleString()} more than expected. Check for duplicate payment or advance credit.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </Card>

      {/* ─────────── Linked Bookings ─────────── */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Linked Bookings ({linkedBookings.length})</h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-400" />Normal</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-400" />Open Dispute</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-400" />Resolved</div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ELLIS Code</TableHead>
              <TableHead>Hotel</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dispute</TableHead>
              <TableHead className="w-40"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linkedBookings.map(b => {
              const isDisputed = b.disputed && b.disputeStatus === "Open";
              const isResolved = b.disputeStatus === "Resolved";
              const isCarriedOver = invoice.carriedOverBookingIds?.includes(b.id);
              const rowClass = isDisputed ? "bg-amber-50 dark:bg-amber-950/10" : isCarriedOver ? "bg-blue-50 dark:bg-blue-950/10" : isResolved ? "bg-slate-50 dark:bg-slate-900/20 opacity-70" : "";
              return (
                <TableRow key={b.id} className={rowClass}>
                  <TableCell className="font-mono text-xs">
                    {b.ellisCode}
                    {isCarriedOver && <Badge variant="outline" className="ml-1 text-[9px] bg-blue-50 text-blue-700 border-blue-300">🔄 Carried</Badge>}
                  </TableCell>
                  <TableCell className="text-sm">{b.hotelName}</TableCell>
                  <TableCell className="text-xs">{b.checkIn} ({b.nights}N)</TableCell>
                  <TableCell className="text-xs">{b.guestName}</TableCell>
                  <TableCell className="text-right font-mono font-medium">${b.sumAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={b.bookingStatus === "Confirmed" ? "default" : "destructive"} className="text-[10px]">{b.bookingStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    {isDisputed ? (
                      <div className="flex flex-col">
                        <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-900 border-amber-300 w-fit">Open</Badge>
                        <span className="text-[10px] text-muted-foreground mt-0.5 max-w-[180px] truncate">{b.disputeReason}</span>
                      </div>
                    ) : isResolved ? (
                      <Badge variant="outline" className="text-[10px]">Resolved {b.disputeResolvedDate}</Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {!b.disputed && (
                        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => openDispute(b)}>
                          <AlertTriangle className="h-3 w-3 mr-1" />Dispute
                        </Button>
                      )}
                      {isDisputed && (
                        <>
                          {b.disputeTicketId && (
                            <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => navigate(`/app/tickets?highlight=${b.disputeTicketId}`)}>
                              <TicketIcon className="h-3 w-3 mr-0.5" />{b.disputeTicketId}
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="h-7 text-[11px] text-green-700 border-green-300" onClick={() => resolveDispute(b)}>
                            Resolve
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {linkedBookings.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No bookings linked to this invoice.</p>
        )}
      </Card>

      {/* ─────────── KPI Row ─────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-amber-500" /><p className="text-xs text-muted-foreground">Open Disputes</p></div>
          <p className="text-xl font-bold">{disputeSummary.openCount}</p>
          <p className="text-[10px] text-muted-foreground">${disputeSummary.openAmount.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="h-4 w-4 text-green-500" /><p className="text-xs text-muted-foreground">Resolved (This Month)</p></div>
          <p className="text-xl font-bold">{disputeSummary.resolvedThisMonth}</p>
          <p className="text-[10px] text-muted-foreground">Avg {disputeSummary.avgResolutionDays}d</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4" style={{ color: "#FF6000" }} /><p className="text-xs text-muted-foreground">VLOOKUP Time Saved</p></div>
          <p className="text-xl font-bold">{Math.round(totalSavedMinutes / 60 * 10) / 10}h</p>
          <p className="text-[10px] text-muted-foreground">This month (auto-match)</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1"><Zap className="h-4 w-4 text-blue-500" /><p className="text-xs text-muted-foreground">Auto-Match Accuracy</p></div>
          <p className="text-xl font-bold">{disputeSummary.autoMatchAccuracy}%</p>
          <p className="text-[10px] text-muted-foreground">{matchLog.length} runs logged</p>
        </Card>
      </div>

      {/* ─────────── Payment Match Log ─────────── */}
      {logsForInvoice.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold">Payment Match History · Master Approval</h2>
            <Badge variant="outline" className="text-[10px]">
              <UserCheck className="h-3 w-3 mr-0.5" />
              {isMaster ? "Master: You can approve/reject" : "OP: Read-only, awaits Master"}
            </Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matched At</TableHead>
                <TableHead>By</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Exclusions</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsForInvoice.map(l => {
                const approvalColor = l.approvalStatus === "Approved" ? "default" : l.approvalStatus === "Rejected" ? "destructive" : "secondary";
                return (
                  <TableRow key={l.id}>
                    <TableCell className="text-xs font-mono">{l.matchedAt}</TableCell>
                    <TableCell className="text-xs">{l.matchedBy}</TableCell>
                    <TableCell className="font-mono text-xs font-medium">${l.variance.toLocaleString()}</TableCell>
                    <TableCell className="text-xs">
                      {l.detectedExclusions.length > 0
                        ? l.detectedExclusions.map(id => allBookings.find(x => x.id === id)?.ellisCode).join(", ")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={approvalColor} className="text-[10px]">{l.approvalStatus}</Badge>
                      {l.approvedBy && <p className="text-[9px] text-muted-foreground mt-0.5">{l.approvedBy} · {l.approvedAt}</p>}
                      {l.rejectedReason && <p className="text-[9px] text-red-600 mt-0.5 max-w-[180px] truncate">{l.rejectedReason}</p>}
                    </TableCell>
                    <TableCell>
                      {l.approvalStatus === "Pending Master" && isMaster && (
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" className="h-7 text-[11px] text-green-700 border-green-300" onClick={() => approveMatch(l.id)}>
                            <CheckCircle className="h-3 w-3 mr-0.5" />Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-[11px] text-red-700 border-red-300" onClick={() => rejectMatch(l.id)}>
                            <XCircle className="h-3 w-3 mr-0.5" />Reject
                          </Button>
                        </div>
                      )}
                      {l.approvalStatus === "Pending Master" && !isMaster && (
                        <span className="text-[10px] text-muted-foreground">Awaiting Master</span>
                      )}
                      {l.approvalStatus === "Approved" && (
                        <span className="text-[10px] text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Reconciled</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {!isMaster && logsForInvoice.some(l => l.approvalStatus === "Pending Master") && (
            <Alert className="mt-3 border-blue-200 bg-blue-50 dark:bg-blue-900/10">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs">
                OP 계정: 매칭 실행 가능. 최종 승인은 <strong>Master</strong> 계정이 필요합니다. (예: <code>master@dotbiz.com</code>)
              </AlertDescription>
            </Alert>
          )}
        </Card>
      )}

      {/* ─────────── Dispute Dialog ─────────── */}
      <Dialog open={!!disputeTarget} onOpenChange={o => !o && setDisputeTarget(null)}>
        <DialogContent style={{ maxWidth: 600 }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Register Dispute — {disputeTarget?.ellisCode}
            </DialogTitle>
          </DialogHeader>
          {disputeTarget && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/40 rounded-md text-sm">
                <p><strong>{disputeTarget.hotelName}</strong></p>
                <p className="text-xs text-muted-foreground mt-1">
                  Guest: {disputeTarget.guestName} · {disputeTarget.checkIn} ({disputeTarget.nights}N) · <span className="font-mono font-bold">${disputeTarget.sumAmount.toLocaleString()}</span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium"><span className="text-red-500">*</span> Dispute Reason</label>
                <select
                  value={disputeReason}
                  onChange={e => setDisputeReason(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm bg-background mt-1"
                >
                  {["Room type mismatch", "No show (guest didn't check in)", "Rate higher than confirmation", "Cancellation fee disputed", "Hotel service complaint", "Invoice amount mismatch", "Other"].map(r => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Details / Evidence</label>
                <Textarea
                  value={disputeNote}
                  onChange={e => setDisputeNote(e.target.value)}
                  rows={3}
                  placeholder="고객사 주장 / 호텔 응답 / 증빙 내용 등"
                  className="mt-1 resize-none"
                />
              </div>

              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
                <TicketIcon className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
                  분쟁 등록 시 자동으로 티켓이 생성되어 담당자에게 배정됩니다.
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisputeTarget(null)}>Cancel</Button>
            <Button style={{ background: "#DC2626" }} className="text-white hover:opacity-90" onClick={submitDispute}>
              <AlertTriangle className="h-4 w-4 mr-1" />Register Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
