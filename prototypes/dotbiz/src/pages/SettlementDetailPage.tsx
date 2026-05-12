import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Download, AlertTriangle, Ticket as TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { invoices, type InvoiceWithMatch } from "@/mocks/settlement";
import { bookings as allBookings, type Booking } from "@/mocks/bookings";
import { companies, currentCompany } from "@/mocks/companies";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import InvoicePreviewDialog from "@/components/InvoicePreviewDialog";

/* Settlement Invoice Detail Page — customer-facing view.
 *
 * What a CUSTOMER can do:
 *   - View the invoice and its linked bookings
 *   - Download / email the invoice PDF
 *   - If they think a booking line is wrong → open a support ticket
 *
 * What a customer CANNOT do (admin-only, not in this prototype):
 *   - Register / resolve disputes directly (would give them unilateral
 *     power to withhold payment)
 *   - Run payment-matching auto-detection (that's an OhMyHotel OP tool)
 *   - Approve/reject payment matches (admin workflow)
 *
 * Dispute flags shown on rows are tagged by OhMyHotel OP on the admin
 * side (after the customer raises a ticket). Here we only display them.
 */
export default function SettlementDetailPage() {
  const { invoiceNo } = useParams<{ invoiceNo: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [invoice] = useState<InvoiceWithMatch | null>(() => invoices.find(i => i.invoiceNo === invoiceNo) || null);
  const [previewOpen, setPreviewOpen] = useState(false);

  /* Contract-currency aware formatter */
  const curr = invoice?.contractCurrency || "USD";
  const fmt = (n: number) => `${curr} ${n.toLocaleString()}`;

  /* Invoice's actual customer (from invoice.customerCompanyId) */
  const invoiceCustomer = invoice?.customerCompanyId
    ? companies.find(c => c.id === invoice.customerCompanyId) || currentCompany
    : currentCompany;

  /* Bookings linked to this invoice */
  const linkedBookings = useMemo(() => {
    if (!invoice) return [];
    return invoice.bookingIds
      .map(id => allBookings.find(b => b.id === id))
      .filter((b): b is Booking => !!b);
  }, [invoice]);

  /* ── 접근 권한 (Settlement 결정 #1 + Tickets 정합) ──
   * Settlement 페이지가 허용하는 모든 role + 티켓 분쟁 컨텍스트 필요한 EllisOP.
   * 종결된 booking이라도 invoice/billing 이력 조회 필요. */
  if (!hasRole(["Master", "OP", "Accounting", "EllisOP", "EllisAdmin"])) {
    return (
      <div className="p-6">
        <Alert><AlertTitle>Access Restricted</AlertTitle><AlertDescription>Settlement Detail requires Master, OP, Accounting, or ELLIS staff role.</AlertDescription></Alert>
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

  const matchStatusBadge = {
    Unpaid: { label: "Unpaid", variant: "destructive" as const },
    Partial: { label: "Partial Payment", variant: "secondary" as const },
    Full: { label: "Fully Paid", variant: "default" as const },
    Reconciled: { label: "Reconciled", variant: "default" as const },
  };
  const matchBadge = matchStatusBadge[invoice.matchStatus];

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
                {invoice.billingType}
              </Badge>
              <Badge variant="outline" className="font-mono text-[10px]">{invoice.contractCurrency}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {invoiceCustomer.name} · Period <strong>{invoice.period}</strong> · Issued {invoice.issuedDate} · Due {invoice.dueDate}
            </p>
            {invoice.remarks && (
              <p className="text-xs text-amber-700 dark:text-amber-300">⚠️ {invoice.remarks}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
              <Download className="h-3.5 w-3.5 mr-1" />Export PDF
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Invoice Total <Badge variant="outline" className="ml-1 text-[9px] font-mono">{curr}</Badge></p>
            <p className="text-2xl font-bold font-mono">{fmt(invoice.total)}</p>
            <p className="text-[10px] text-muted-foreground">{invoice.bookingIds.length} bookings</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-2xl font-bold font-mono text-green-600 dark:text-green-400">{fmt(invoice.receivedAmount)}</p>
            <p className="text-[10px] text-muted-foreground">{invoice.paymentDate || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className={`text-2xl font-bold font-mono ${(invoice.total - invoice.receivedAmount) > 0 ? "text-amber-600" : "text-green-600"}`}>
              {fmt(invoice.total - invoice.receivedAmount)}
            </p>
            <p className="text-[10px] text-muted-foreground">Outstanding</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Disputed (flagged)</p>
            <p className={`text-2xl font-bold font-mono ${invoice.disputedAmount > 0 ? "text-red-600 dark:text-red-400" : ""}`}>
              {fmt(invoice.disputedAmount)}
            </p>
            <p className="text-[10px] text-muted-foreground">{invoice.disputedBookingIds.length} booking(s) — via ticket</p>
          </div>
        </div>
      </Card>

      {/* ─────────── Invoice Lines Breakdown (Option C Hybrid, 2026-05-08) ───────────
        * 정책: PG 수수료 100% 고객 부담. 호텔 정가 + 결제 수수료 라인 분리.
        * 데모 표시는 평균값 (실제로는 결제수단별 정확한 값). */}
      <Card className="p-5">
        <h2 className="text-base font-bold mb-3">Invoice Lines</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1.5">
            <div>
              <span className="font-medium">Line 1: Hotel Charge</span>
              <p className="text-[10px] text-muted-foreground">호텔 정가 ({invoice.bookingIds.length} bookings)</p>
            </div>
            <span className="font-mono">{fmt(Math.round(invoice.total * 0.97))}</span>
          </div>
          <div className="flex justify-between py-1.5 border-t pt-2">
            <div>
              <span className="font-medium">Line 2: Payment Processing Fee</span>
              <p className="text-[10px] text-muted-foreground">고객 부담 · 결제수단별 분리 (2026-05-08 정책)</p>
            </div>
            <span className="font-mono">{fmt(Math.round(invoice.total * 0.03))}</span>
          </div>
          <div className="flex justify-between py-2 border-t font-bold">
            <span>Invoice Total</span>
            <span className="font-mono text-[#FF6000]">{fmt(invoice.total)}</span>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground italic mt-3 pt-2 border-t">
          💡 결제 수수료는 선택한 결제수단에 따라 다릅니다 (한국 가상계좌 0.025% / 카드 2~3% / 송금 0% 등). DOTBIZ는 결제 수수료를 흡수하지 않으며, 고객사가 직접 부담합니다.
        </p>
      </Card>

      {/* Invoice Dispute 기능 폐기 (2026-05-08): 인보이스 분쟁 제기는 송금 보류 빌미가 됨 → 기능 삭제.
       * 예약 자체 이의 (cancel 요청 등)는 BookingsPage 또는 일반 티켓 트랙. */}

      {/* ─────────── Linked Bookings ─────────── */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Linked Bookings ({linkedBookings.length})</h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-400" />Normal</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-400" />Disputed</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-400" />Resolved</div>
          </div>
        </div>

        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead title="Booking Item Code (ELLIS)">Booking Item Code</TableHead>
              <TableHead>Booking Status</TableHead>
              <TableHead title="Customer Payment Status">C. Pmt Status</TableHead>
              <TableHead title="Hotel (seller) booking code">Hotel Confirm No.</TableHead>
              <TableHead>Hotel Country</TableHead>
              <TableHead>Hotel Name</TableHead>
              <TableHead>Traveler</TableHead>
              <TableHead title="Check-In">C/I</TableHead>
              <TableHead title="Check-Out">C/O</TableHead>
              <TableHead title="Nights" className="text-right">Nts</TableHead>
              <TableHead title="Booking Currency">B. Cur</TableHead>
              <TableHead title="Booking Sum Amount" className="text-right">B. Sum Amt</TableHead>
              <TableHead title="Paid Amount" className="text-right">Paid Amt</TableHead>
              <TableHead title="Booking Balance (unpaid)" className="text-right">B. Balance</TableHead>
              <TableHead>Dispute</TableHead>
              <TableHead>Dispute Remark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linkedBookings.map(b => {
              const isDisputed = b.disputed && b.disputeStatus === "Open";
              const isResolved = b.disputeStatus === "Resolved";
              const rowClass = isDisputed ? "bg-amber-50 dark:bg-amber-950/10" : isResolved ? "bg-slate-50 dark:bg-slate-900/20 opacity-70" : "";
              const checkOut = (() => { const d = new Date(b.checkIn); d.setDate(d.getDate() + b.nights); return d.toISOString().split("T")[0]; })();
              const paid = b.paymentStatus === "Fully Paid" ? b.sumAmount : b.paymentStatus === "Partially Paid" ? Math.round(b.sumAmount * 0.5) : 0;
              const balance = b.sumAmount - paid;
              return (
                <TableRow key={b.id} className={rowClass}>
                  <TableCell className="font-mono text-xs text-[#0066cc]">
                    <button className="hover:underline" onClick={() => navigate(`/app/bookings/${b.id}`)}>{b.ellisCode}</button>
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant={b.bookingStatus === "Confirmed" ? "default" : "destructive"} className="text-[10px]">{b.bookingStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant={b.paymentStatus === "Fully Paid" ? "default" : b.paymentStatus === "Not Paid" ? "destructive" : "secondary"} className="text-[10px]">{b.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[10px]">{b.hotelConfirmCode || "—"}</TableCell>
                  <TableCell className="text-xs">{b.country}</TableCell>
                  <TableCell className="text-xs">{b.hotelName}</TableCell>
                  <TableCell className="text-xs">{b.traveler}</TableCell>
                  <TableCell className="font-mono text-[10px]">{b.checkIn}</TableCell>
                  <TableCell className="font-mono text-[10px]">{checkOut}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{b.nights}</TableCell>
                  <TableCell className="text-[10px] font-mono">{b.currency}</TableCell>
                  <TableCell className="text-right font-mono text-xs font-medium">{b.sumAmount.toFixed(2)}</TableCell>
                  <TableCell className={`text-right font-mono text-xs ${paid > 0 ? "text-green-600" : ""}`}>{paid.toFixed(2)}</TableCell>
                  <TableCell className={`text-right font-mono text-xs ${balance > 0 ? "text-amber-600 font-medium" : "text-green-600"}`}>{balance.toFixed(2)}</TableCell>
                  <TableCell className="text-xs">
                    {isDisputed ? <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-900 border-amber-300">Yes</Badge>
                      : isResolved ? <Badge variant="outline" className="text-[10px]">Resolved</Badge>
                      : <span className="text-muted-foreground">No</span>}
                  </TableCell>
                  <TableCell className="text-[10px] max-w-[200px]">
                    {isDisputed && b.disputeTicketId ? (
                      <Button variant="link" size="sm" className="h-auto p-0 text-[10px] text-amber-700" onClick={() => navigate(`/app/tickets?highlight=${b.disputeTicketId}`)}>
                        <TicketIcon className="h-3 w-3 mr-0.5" />{b.disputeTicketId} · {b.disputeReason}
                      </Button>
                    ) : isResolved ? (
                      <span className="text-muted-foreground">Resolved {b.disputeResolvedDate}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {/* Summary row */}
            {linkedBookings.length > 0 && (() => {
              const sumB = linkedBookings.reduce((s, b) => s + b.sumAmount, 0);
              const sumPaid = linkedBookings.reduce((s, b) => s + (b.paymentStatus === "Fully Paid" ? b.sumAmount : b.paymentStatus === "Partially Paid" ? Math.round(b.sumAmount * 0.5) : 0), 0);
              const sumBal = sumB - sumPaid;
              const disputeCount = linkedBookings.filter(b => b.disputed && b.disputeStatus === "Open").length;
              return (
                <TableRow className="bg-slate-100 dark:bg-slate-800/40 font-bold border-t-2">
                  <TableCell colSpan={11} className="text-right text-xs">TOTAL ({linkedBookings.length} bookings)</TableCell>
                  <TableCell className="text-right font-mono text-xs">{sumB.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-green-600">{sumPaid.toFixed(2)}</TableCell>
                  <TableCell className={`text-right font-mono text-xs ${sumBal > 0 ? "text-amber-600" : "text-green-600"}`}>{sumBal.toFixed(2)}</TableCell>
                  <TableCell className="text-xs">{disputeCount > 0 ? <Badge variant="destructive" className="text-[10px]">{disputeCount}</Badge> : "0"}</TableCell>
                  <TableCell />
                </TableRow>
              );
            })()}
          </TableBody>
        </Table>
        </div>

        {linkedBookings.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No bookings linked to this invoice.</p>
        )}

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/app/tickets")}>
            <AlertTriangle className="h-3 w-3 mr-1" />Dispute an item via Ticket
          </Button>
        </div>
      </Card>

      {/* Invoice PDF preview — entity-aware (uses invoice.ohmyhotelEntityId + contractCurrency).
       * Users Print/Save PDF from the dialog's print button. */}
      <InvoicePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        invoice={invoice}
        customer={invoiceCustomer}
      />
    </div>
  );
}
