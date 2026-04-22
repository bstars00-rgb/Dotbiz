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
import { downloadCSV, timestamp } from "@/lib/download";
import { contractsForCustomer, getContract, getCreditLimit, type Contract } from "@/mocks/contracts";
import { getEntity } from "@/mocks/ohMyHotelEntities";
import PaymentDialog from "@/components/PaymentDialog";
import InvoicePreviewDialog, { type InvoiceData } from "@/components/InvoicePreviewDialog";
import TopUpDepositDialog from "@/components/TopUpDepositDialog";
import { topUpRequests } from "@/mocks/topUp";
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

  /* Multi-entity contract handling */
  const myContracts = useMemo<Contract[]>(() => contractsForCustomer(activeCompany.id), [activeCompany.id]);
  const isMultiContract = myContracts.length > 1;
  /* "all" = summary view across all contracts. Otherwise specific contract id. */
  const [selectedContractId, setSelectedContractId] = useState<string>(isMultiContract ? "all" : (myContracts[0]?.id || "all"));
  const selectedContract: Contract | null = selectedContractId === "all" ? null : (getContract(selectedContractId) || null);
  const selectedEntity = selectedContract ? getEntity(selectedContract.ohmyhotelEntityId) : null;
  /* When contract is selected, take its values; else fall back to company defaults (legacy) */
  const effectiveBilling = selectedContract?.billingType || activeCompany.billingType;
  const effectiveCurrency = selectedContract?.contractCurrency || activeCompany.contractCurrency;
  const effectiveCycle = selectedContract?.settlementCycle || activeCompany.settlementCycle;
  const effectiveDueDays = selectedContract?.paymentDueDays || activeCompany.paymentDueDays;
  const effectiveDepositType = selectedContract?.depositType || activeCompany.depositType;
  const effectiveDepositAmount = selectedContract?.depositAmount ?? activeCompany.depositAmount;

  const isPrepay = effectiveBilling === "PREPAY";

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
  const [topUpOpen, setTopUpOpen] = useState(false);

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

  /* ── Billing Details filters ──
   * Two-tier state: the user edits a "draft" freely in the form; the table only
   * re-queries when they press Search (or when tenant/contract scope changes).
   * This matches the expectation of a form-based search flow and avoids the
   * table flickering on every keystroke.
   */
  type BillDateKind = "Booking Date" | "Due Date" | "Settlement Date";
  interface BillFilters {
    dateType: BillDateKind;
    type: string;
    search: string;
    invoiceSearch: string;
    dateFrom: string;
    dateTo: string;
  }
  const defaultBillFilters: BillFilters = {
    dateType: "Booking Date",
    type: "All",
    search: "",
    invoiceSearch: "",
    dateFrom: "",
    dateTo: "",
  };
  /* Draft — what the form shows the user is currently editing */
  const [billDraft, setBillDraft] = useState<BillFilters>(defaultBillFilters);
  /* Applied — what actually filters the table (snapshot at last Search click) */
  const [billApplied, setBillApplied] = useState<BillFilters>(defaultBillFilters);

  const applyBillFilters = () => setBillApplied(billDraft);
  const resetBillFilters = () => {
    setBillDraft(defaultBillFilters);
    setBillApplied(defaultBillFilters);
  };
  const hasDraftChanges =
    billDraft.dateType !== billApplied.dateType ||
    billDraft.type !== billApplied.type ||
    billDraft.search !== billApplied.search ||
    billDraft.invoiceSearch !== billApplied.invoiceSearch ||
    billDraft.dateFrom !== billApplied.dateFrom ||
    billDraft.dateTo !== billApplied.dateTo;

  /* Tenant-scope: only this customer's bills (always applied, not part of search form) */
  const myBills = useMemo(() => billingDetails.filter(b => {
    if (b.customerCompanyId !== activeCompany.id) return false;
    if (selectedContractId !== "all" && b.contractId !== selectedContractId) return false;
    return true;
  }), [activeCompany.id, selectedContractId]);

  const filteredBills = useMemo(() => {
    let result = [...myBills];
    if (billApplied.type !== "All") result = result.filter(b => b.billType === billApplied.type);
    if (billApplied.search) {
      const q = billApplied.search.toLowerCase();
      result = result.filter(b => b.billId.toLowerCase().includes(q) || b.bookingId.toLowerCase().includes(q));
    }
    if (billApplied.invoiceSearch) {
      const q = billApplied.invoiceSearch.toLowerCase();
      result = result.filter(b => b.invoiceNo.toLowerCase().includes(q));
    }
    if (billApplied.dateFrom || billApplied.dateTo) {
      result = result.filter(b => {
        const target = billApplied.dateType === "Booking Date" ? b.createdDate
          : billApplied.dateType === "Due Date" ? b.dueDate
          : b.settlementDate;
        if (!target) return false;
        if (billApplied.dateFrom && target < billApplied.dateFrom) return false;
        if (billApplied.dateTo && target > billApplied.dateTo) return false;
        return true;
      });
    }
    return result;
  }, [myBills, billApplied]);

  /* Excel export — for customer accounting team */
  const exportBillsCsv = () => {
    if (filteredBills.length === 0) { toast.error("No bills to export"); return; }
    const rows = filteredBills.map(b => ({
      "Bill ID": b.billId,
      "Invoice No": b.invoiceNo,
      "Booking ID": b.bookingId,
      "Hotel": b.hotelName,
      "Bill Type": b.billType,
      "Currency": b.currency,
      "Amount": b.amount,
      "Booking Date": b.createdDate,
      "Due Date": b.dueDate,
      "Settlement Date": b.settlementDate || "",
      "Status": b.status,
    }));
    downloadCSV(`billing_details_${activeCompany.name.replace(/[^a-z0-9]/gi, "_")}_${timestamp()}.csv`, rows);
    toast.success(`${rows.length} bills exported`, { description: "CSV ready for your accounting team (Excel-compatible)" });
  };

  /* ── Invoices filter ── */
  const [invStatus, setInvStatus] = useState("All");
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceData | null>(null);
  /* 인보이스는 로그인한 고객사 것만 표시.
   * PREPAY 고객 → 자기 예약별 인보이스
   * POSTPAY 고객 → 자기 월별 집계 인보이스
   */
  const myInvoices = useMemo(() => invoices.filter(i => {
    if (i.customerCompanyId !== activeCompany.id) return false;
    if (selectedContractId !== "all" && i.contractId !== selectedContractId) return false;
    return true;
  }), [activeCompany.id, selectedContractId]);
  const myTopUps = useMemo(() => topUpRequests.filter(t => t.customerCompanyId === activeCompany.id), [activeCompany.id, topUpOpen]);
  const filteredInvoices = useMemo(() => {
    if (invStatus === "All") return myInvoices;
    return myInvoices.filter(i => i.status === invStatus);
  }, [invStatus, myInvoices]);

  /* ── AR state ── */
  const [arSelected, setArSelected] = useState<Set<string>>(new Set());
  const toggleAr = (id: string) => setArSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const [payDialogOpen, setPayDialogOpen] = useState(false);

  /* AR — filtered by current customer + selected contract (unified structure regardless of contract count) */
  const myAR = useMemo(() => accountsReceivable.filter(a => {
    if (a.customerCompanyId !== activeCompany.id) return false;
    if (selectedContractId !== "all" && a.contractId !== selectedContractId) return false;
    return true;
  }), [activeCompany.id, selectedContractId]);

  const arSelectedTotal = myAR.filter(a => arSelected.has(a.id)).reduce((s, a) => s + a.amount, 0);

  /* AR Aging — scoped to filtered AR only */
  const arCurrent = myAR.filter(a => a.agingDays <= 0).reduce((s, a) => s + a.amount, 0);
  const ar30 = myAR.filter(a => a.agingDays > 0 && a.agingDays <= 30).reduce((s, a) => s + a.amount, 0);
  const ar60 = myAR.filter(a => a.agingDays > 30 && a.agingDays <= 60).reduce((s, a) => s + a.amount, 0);
  const ar90 = myAR.filter(a => a.agingDays > 60).reduce((s, a) => s + a.amount, 0);

  /* AR currency — derive from selected contract (single-contract uses its currency; "all" falls back to company default) */
  const arCurrency = selectedContract?.contractCurrency || effectiveCurrency || "USD";
  const arFracDigits = arCurrency === "VND" || arCurrency === "JPY" ? 0 : 2;
  const arFmt = (n: number) => `${arCurrency} ${n.toLocaleString(undefined, { minimumFractionDigits: arFracDigits, maximumFractionDigits: arFracDigits })}`;

  if (!hasRole(["Master"])) return (<div className="p-6"><Alert><AlertTitle>Access Restricted</AlertTitle><AlertDescription>Settlement page is only accessible to Master accounts.</AlertDescription></Alert></div>);
  if (state === "loading") return (<div className="p-6 space-y-4"><Skeleton className="h-10 w-full" /><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-64 w-full" /><StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">No Settlement Data</h2><p className="text-muted-foreground mt-2">No settlement data available for the selected period.</p></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>Settlement Error</AlertTitle><AlertDescription>Failed to load settlement data.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{t("page.settlement")}</h1>
            {selectedContractId !== "all" && (
              <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-300">
                {effectiveBilling}
                {effectiveBilling === "POSTPAY" && effectiveCycle && ` · ${effectiveCycle}`}
              </Badge>
            )}
            {selectedEntity && (
              <Badge variant="outline" className="text-[10px]">{selectedEntity.countryFlag} {selectedEntity.shortName}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {activeCompany.name}
            {selectedContract && effectiveBilling === "POSTPAY" && (
              <span className="ml-1">· Settles <strong>{effectiveCycle?.toLowerCase()}</strong>, payment due <strong>Net-{effectiveDueDays}</strong> after invoice issue</span>
            )}
          </p>
        </div>

        {/* Right side: Contract selector (always shown — unified structure regardless of count) + KPI */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Contract:</span>
            <select
              value={selectedContractId}
              onChange={e => setSelectedContractId(e.target.value)}
              className="border rounded px-2 py-1.5 text-sm bg-background min-w-[280px] disabled:opacity-80"
              aria-label="Contract selector"
              disabled={myContracts.length === 0}
            >
              {myContracts.length === 0 && (
                <option value="all">No active contracts</option>
              )}
              {isMultiContract && (
                <option value="all">📊 All contracts (Summary)</option>
              )}
              {myContracts.map(c => {
                const ent = getEntity(c.ohmyhotelEntityId);
                return (
                  <option key={c.id} value={c.id}>
                    {ent.countryFlag} {ent.shortName} · {c.contractCurrency} · {c.billingType}
                  </option>
                );
              })}
            </select>
            <Badge variant="outline" className="text-[10px]">
              {myContracts.length} {myContracts.length === 1 ? "contract" : "contracts"}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span><strong>{disputeSummary.openCount}</strong> open disputes</span>
            <span className="text-muted-foreground">· ${disputeSummary.openAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Multi-contract summary banner (shown when "All contracts" selected) */}
      {isMultiContract && selectedContractId === "all" && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base font-bold">{activeCompany.name} — {myContracts.length} active contracts</span>
            <Badge variant="outline" className="text-[10px]">SUMMARY VIEW</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myContracts.map(c => {
              const ent = getEntity(c.ohmyhotelEntityId);
              const ctrInvoices = invoices.filter(i => i.contractId === c.id);
              const ctrTotal = ctrInvoices.reduce((s, i) => s + i.total, 0);
              const ctrOutstanding = ctrInvoices.filter(i => i.matchStatus !== "Full" && i.matchStatus !== "Reconciled").reduce((s, i) => s + (i.total - i.receivedAmount), 0);
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedContractId(c.id)}
                  className="p-3 bg-white dark:bg-slate-900 rounded-md cursor-pointer border hover:border-orange-400 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ent.countryFlag}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{ent.shortName}</p>
                      <p className="text-[10px] text-muted-foreground">{c.contractCurrency} · {c.billingType}{c.billingType === "POSTPAY" && c.settlementCycle ? ` · ${c.settlementCycle}` : ""}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase">{c.scope.type === "LOCAL" ? `Local (${c.scope.countries.join(",")})` : "International"}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-[10px]">
                    <div>
                      <p className="text-muted-foreground">Invoices</p>
                      <p className="font-bold font-mono">{ctrInvoices.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Issued</p>
                      <p className="font-bold font-mono">{c.contractCurrency} {ctrTotal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Outstanding</p>
                      <p className={`font-bold font-mono ${ctrOutstanding > 0 ? "text-amber-600" : "text-green-600"}`}>{c.contractCurrency} {ctrOutstanding.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 italic">Click a contract card to see its invoices, billing details, and deposit utilization.</p>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
       * UNIFIED CREDIT LINE CARD
       *
       * Single source of truth for "how much can this contract spend right now".
       * Replaces the previous Deposit Utilization + Credit Utilization split.
       *
       *   Credit Limit     = getCreditLimit(contract)
       *                      = contract.creditLimit
       *                     ?? depositAmount × creditMultiplier
       *                     ?? depositAmount (1:1 fallback)
       *   Collateral       = the underlying asset (deposit type + amount)
       *   Multiplier       = creditMultiplier (1 for Floating, 2+ for BG/GD/Ins)
       *   Credit Used      = outstanding invoices
       *   Credit Available = limit − used
       *
       * Floating (1:1) and Leveraged (1:N) render as the same card — only the
       * "Backed by" meta line changes. No Deposit / Credit by Company are
       * handled with the same structure (different backing description).
       * ──────────────────────────────────────────────────────────────────── */}
      {selectedContractId !== "all" && effectiveBilling === "POSTPAY" && effectiveDepositType && (() => {
        const depositType = effectiveDepositType;
        const deposit = effectiveDepositAmount || 0;
        const curr = effectiveCurrency;
        const fracDigits = curr === "VND" || curr === "JPY" ? 0 : 2;
        const fmt = (n: number) => `${curr} ${n.toLocaleString(undefined, { minimumFractionDigits: fracDigits, maximumFractionDigits: fracDigits })}`;
        /* CTA/messaging per deposit type (which top-up / increase path to route to) */
        const config: Record<string, { ctaLabel: string; ctaToast: { title: string; description: string }; collateralLabel: (amt: string, mult: number) => string }> = {
          "Floating Deposit": {
            ctaLabel: "Top Up Deposit",
            ctaToast: { title: "Top-up request sent", description: "Our finance team will share wire instructions within 1 business day." },
            collateralLabel: (amt) => `Pre-funded cash · ${amt} deposited`,
          },
          "Credit by Company": {
            ctaLabel: "Request Credit Increase",
            ctaToast: { title: "Credit increase request sent", description: "Your OhMyHotel account manager will review and respond within 2 business days." },
            collateralLabel: () => "OhMyHotel-issued credit line · no collateral",
          },
          "Guarantee Deposit": {
            ctaLabel: "Request Limit Increase",
            ctaToast: { title: "Guarantee increase request sent", description: "Our team will draft the contract amendment for your review." },
            collateralLabel: (amt, mult) => `Guarantee Deposit · ${amt} × ${mult}× leverage`,
          },
          "Guarantee Insurance": {
            ctaLabel: "Request Insurance Increase",
            ctaToast: { title: "Insurance increase noted", description: "Please contact your insurer to raise the policy limit and share the new certificate with us." },
            collateralLabel: (amt, mult) => `Insurer-backed · ${amt} × ${mult}× leverage`,
          },
          "Bank Guarantee": {
            ctaLabel: "Request Bank Guarantee Increase",
            ctaToast: { title: "Bank guarantee increase noted", description: "Please contact your bank to amend the guarantee; share the updated letter once issued." },
            collateralLabel: (amt, mult) => `Bank-issued Letter of Guarantee · ${amt} × ${mult}× leverage`,
          },
          "No Deposit": {
            ctaLabel: "Set Up Deposit",
            ctaToast: { title: "Deposit setup request sent", description: "Our team will guide you through deposit options to enable higher booking volumes." },
            collateralLabel: () => "No collateral on file",
          },
        };
        const cfg = config[depositType] || config["Floating Deposit"];

        /* Compute credit-line state — single source of truth */
        const contract = selectedContract;
        const hasLeverage = !!contract?.creditMultiplier && contract.creditMultiplier > 1;
        const multiplier = contract?.creditMultiplier || 1;
        const creditLimit = contract ? getCreditLimit(contract) : deposit;

        const used = myInvoices
          .filter(i => i.matchStatus !== "Full" && i.matchStatus !== "Reconciled")
          .reduce((s, i) => s + (i.total - i.receivedAmount), 0);
        const available = Math.max(0, creditLimit - used);
        const usedPct = creditLimit > 0 ? Math.min(100, Math.round((used / creditLimit) * 100)) : 0;

        const lowThreshold = contract?.creditLowThreshold || 0;
        const criticalThreshold = contract?.creditCriticalThreshold || 0;
        const isCritical = criticalThreshold > 0 && available <= criticalThreshold;
        const isLow = lowThreshold > 0 && available <= lowThreshold && !isCritical;

        const barColor = isCritical ? "#DC2626" : isLow ? "#FF6000" : usedPct >= 50 ? "#FF8C00" : "#009505";

        /* No-deposit / zero-limit special case — single info card, same structure */
        if (depositType === "No Deposit" || creditLimit === 0) {
          return (
            <Card className="p-6 border-2 border-amber-300 bg-amber-50/40 dark:bg-amber-950/10">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-amber-100 dark:bg-amber-900/40">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Credit Line</h2>
                    <p className="text-xs text-muted-foreground">{cfg.collateralLabel("", multiplier)}</p>
                  </div>
                </div>
                <Button size="sm" className="text-white" style={{ background: "#FF6000" }} onClick={() => toast.success(cfg.ctaToast.title, { description: cfg.ctaToast.description })}>
                  <CreditCard className="h-3 w-3 mr-1" />{cfg.ctaLabel}
                </Button>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-200 mt-3">
                Without a deposit or credit line, OhMyHotel reserves the right to block new bookings at any time based on outstanding balance and risk. Setting up a Floating Deposit, Bank Guarantee, or Insurance unlocks higher booking volumes.
              </p>
            </Card>
          );
        }

        const collateralSubtitle = cfg.collateralLabel(fmt(deposit), multiplier);
        const isFloating = depositType === "Floating Deposit";
        const isCreditByCo = depositType === "Credit by Company";
        const handlePrimaryCta = () => {
          if (isFloating) setTopUpOpen(true);
          else toast.success(cfg.ctaToast.title, { description: cfg.ctaToast.description });
        };

        return (
          <Card className={`p-6 ${isCritical ? "border-2 border-red-500 bg-red-50/40 dark:bg-red-950/10" : isLow ? "border-2 border-orange-500 bg-orange-50/40 dark:bg-orange-950/10" : "border-2 border-slate-200 dark:border-slate-800"}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[420px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: barColor + "20" }}>
                    <CreditCard className="h-5 w-5" style={{ color: barColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold flex items-center gap-2 flex-wrap">
                      Credit Line
                      {hasLeverage && <Badge variant="outline" className="text-[10px]">{multiplier}× leverage</Badge>}
                      {isCreditByCo && <Badge variant="outline" className="text-[10px]">Credit by Company</Badge>}
                    </h2>
                    <p className="text-xs text-muted-foreground">{collateralSubtitle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-3xl font-bold" style={{ color: barColor }}>{usedPct}%</p>
                    <p className="text-[10px] text-muted-foreground uppercase">used</p>
                  </div>
                </div>

                {/* Primary progress bar with threshold markers */}
                <div className="relative h-6 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all flex items-center justify-end pr-2" style={{ width: `${usedPct}%`, background: barColor }}>
                    {usedPct > 15 && <span className="text-[10px] font-bold text-white">{fmt(used)}</span>}
                  </div>
                  {lowThreshold > 0 && (
                    <div
                      className="absolute top-0 bottom-0 border-l-2 border-amber-500 dark:border-amber-400"
                      style={{ left: `${Math.min(100, (1 - lowThreshold / creditLimit) * 100)}%` }}
                      title={`Low threshold: ${fmt(lowThreshold)} available`}
                    />
                  )}
                  {criticalThreshold > 0 && (
                    <div
                      className="absolute top-0 bottom-0 border-l-2 border-red-600"
                      style={{ left: `${Math.min(100, (1 - criticalThreshold / creditLimit) * 100)}%` }}
                      title={`Critical threshold: ${fmt(criticalThreshold)} available`}
                    />
                  )}
                </div>

                {/* Stat blocks — includes Collateral (when leveraged) so users see the true underlying asset */}
                <div className={`grid ${hasLeverage ? "grid-cols-5" : "grid-cols-4"} gap-3 mt-4`}>
                  {hasLeverage && (
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase">Collateral</p>
                      <p className="text-sm font-bold font-mono">{fmt(deposit)}</p>
                      <p className="text-[9px] text-muted-foreground">{depositType}</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Credit Limit</p>
                    <p className="text-xl font-bold font-mono">{fmt(creditLimit)}</p>
                    {hasLeverage && <p className="text-[9px] text-muted-foreground">{fmt(deposit)} × {multiplier}</p>}
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Used</p>
                    <p className="text-xl font-bold font-mono" style={{ color: barColor }}>{fmt(used)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Available</p>
                    <p className={`text-xl font-bold font-mono ${isCritical ? "text-red-600" : isLow ? "text-orange-600" : "text-green-600"}`}>{fmt(available)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Alert at</p>
                    <p className="text-xs font-mono mt-1">
                      {lowThreshold > 0 ? <span className="text-amber-600">⚠ {fmt(lowThreshold)}</span> : <span className="text-muted-foreground">—</span>}<br />
                      {criticalThreshold > 0 ? <span className="text-red-600">🔴 {fmt(criticalThreshold)}</span> : <span className="text-muted-foreground">—</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert banners */}
            {isCritical && (
              <Alert className="mt-4 border-red-300 bg-red-50 dark:bg-red-950/30">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-900 dark:text-red-100">Critical: only {fmt(available)} of credit available</AlertTitle>
                <AlertDescription className="text-xs text-red-800 dark:text-red-200 flex items-center justify-between gap-3 flex-wrap mt-1">
                  <span>You are below the critical threshold ({fmt(criticalThreshold)}). New bookings exceeding available credit will be blocked. Top up your collateral or settle outstanding invoices to restore credit.</span>
                  <Button size="sm" className="text-white shrink-0" style={{ background: "#DC2626" }} onClick={handlePrimaryCta}>
                    <CreditCard className="h-3 w-3 mr-1" />{cfg.ctaLabel}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {isLow && (
              <Alert className="mt-4 border-orange-300 bg-orange-50 dark:bg-orange-950/20">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-900 dark:text-orange-100">Credit running low — {fmt(available)} available</AlertTitle>
                <AlertDescription className="text-xs text-orange-800 dark:text-orange-200 flex items-center justify-between gap-3 flex-wrap mt-1">
                  <span>You have crossed the low threshold ({fmt(lowThreshold)}). Top up your collateral or consider settling outstanding invoices to free up credit.</span>
                  <Button size="sm" variant="outline" onClick={handlePrimaryCta}>
                    <CreditCard className="h-3 w-3 mr-1" />{cfg.ctaLabel}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {/* Healthy but midpoint nudge (only when no active threshold breach) */}
            {!isCritical && !isLow && usedPct >= 50 && (
              <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3" />
                  Half of your credit line is used ({fmt(available)} available). Plan ahead if a higher limit is needed.
                </p>
                <Button size="sm" variant="outline" onClick={handlePrimaryCta}>
                  <CreditCard className="h-3 w-3 mr-1" />{cfg.ctaLabel}
                </Button>
              </div>
            )}

            {/* Recent Top-Up requests (Floating Deposit only — other types don't have wire flow) */}
            {isFloating && myTopUps.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Recent Top-Up Requests</p>
                <div className="space-y-1.5">
                  {myTopUps.slice(0, 3).map(t => {
                    const statusBg = t.status === "Confirmed" ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                      : t.status === "Pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                      : t.status === "Manual Review" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                    return (
                      <div key={t.id} className="flex items-center gap-3 text-xs py-1.5 px-2 rounded hover:bg-muted/50">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusBg}`}>{t.status}</span>
                        <span className="font-mono text-[#FF6000]">{t.refCode}</span>
                        <span className="font-mono">{t.currency} {t.requestedAmount.toLocaleString()}</span>
                        <span className="text-muted-foreground ml-auto">{t.requestedAt.split(" ")[0]}</span>
                        {t.status === "Confirmed" && t.confirmedAt && (
                          <span className="text-[10px] text-green-600">✓ {t.confirmedAt.split(" ")[0]}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
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
            <form
              onSubmit={e => { e.preventDefault(); applyBillFilters(); }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-sm font-medium">Date Type</label>
                  <select
                    value={billDraft.dateType}
                    onChange={e => setBillDraft(d => ({ ...d, dateType: e.target.value as BillDateKind }))}
                    className="w-full border rounded px-2 py-1.5 text-sm bg-background mt-1"
                  >
                    {(["Booking Date", "Due Date", "Settlement Date"] as const).map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">From</label>
                  <input
                    type="date"
                    value={billDraft.dateFrom}
                    onChange={e => setBillDraft(d => ({ ...d, dateFrom: e.target.value }))}
                    className="w-full border rounded px-2 py-1.5 text-sm bg-background mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">To</label>
                  <input
                    type="date"
                    value={billDraft.dateTo}
                    onChange={e => setBillDraft(d => ({ ...d, dateTo: e.target.value }))}
                    className="w-full border rounded px-2 py-1.5 text-sm bg-background mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Bill Type</label>
                  <select
                    value={billDraft.type}
                    onChange={e => setBillDraft(d => ({ ...d, type: e.target.value }))}
                    className="w-full border rounded px-2 py-1.5 text-sm bg-background mt-1"
                  >
                    {["All", "Hotel Booking", "Cancellation Fee", "Adjustment"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-sm font-medium">Bill ID / Booking ID</label>
                  <Input
                    placeholder="BILL-… or ELLIS code"
                    value={billDraft.search}
                    onChange={e => setBillDraft(d => ({ ...d, search: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Invoice No</label>
                  <Input
                    placeholder="e.g. INV-2026-0089"
                    value={billDraft.invoiceSearch}
                    onChange={e => setBillDraft(d => ({ ...d, invoiceSearch: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2 flex items-end gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    style={{ background: hasDraftChanges ? "#FF6000" : undefined }}
                    className={hasDraftChanges ? "text-white" : ""}
                  >
                    <Search className="h-3 w-3 mr-1" />Search
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={resetBillFilters}>
                    <X className="h-3 w-3 mr-1" />Reset
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="ml-auto" onClick={exportBillsCsv}>
                    <Download className="h-3 w-3 mr-1" />Export Excel (CSV)
                  </Button>
                </div>
              </div>
              {hasDraftChanges && (
                <p className="text-[11px] text-orange-600 dark:text-orange-400">
                  Filter edits pending — press <strong>Search</strong> to apply.
                </p>
              )}
            </form>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredBills.length} billing records
              {billApplied.invoiceSearch && (
                <span className="ml-1 text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded">
                  filtered by invoice {billApplied.invoiceSearch}
                </span>
              )}
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill ID</TableHead>
                <TableHead>Invoice No</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Booking ID</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Booking Date</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Settled</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.map(b => (
                <TableRow key={b.billId}>
                  <TableCell className="font-mono text-xs">{b.billId}</TableCell>
                  <TableCell className="font-mono text-xs">
                    <button className="text-[#0066cc] hover:underline" onClick={() => navigate(`/app/settlement/invoice/${b.invoiceNo}`)}>
                      {b.invoiceNo}
                    </button>
                  </TableCell>
                  <TableCell className="text-xs">{b.billType}</TableCell>
                  <TableCell className="font-mono text-xs">
                    <button className="text-[#0066cc] hover:underline" onClick={() => navigate(`/app/bookings/${b.bookingId}`)}>
                      {b.bookingId}
                    </button>
                  </TableCell>
                  <TableCell className="text-xs truncate max-w-[120px]">{b.hotelName}</TableCell>
                  <TableCell className={`text-right text-xs font-mono font-medium ${b.amount < 0 ? "text-red-500" : ""}`}>{b.currency} {b.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-xs">{b.createdDate}</TableCell>
                  <TableCell className="text-xs">{b.dueDate}</TableCell>
                  <TableCell className="text-xs">{b.settlementDate || "—"}</TableCell>
                  <TableCell><Badge variant={billStatusColors[b.status] as "default" | "secondary" | "destructive"} className="text-[10px]">{b.status}</Badge></TableCell>
                </TableRow>
              ))}
              {filteredBills.length === 0 && (
                <TableRow><TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-8">No billing records.</TableCell></TableRow>
              )}
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
                <p className="text-lg font-bold">{arFmt(a.value)}</p>
              </Card>
            ))}
          </div>

          {selectedContractId === "all" && isMultiContract && (
            <div className="text-[11px] text-muted-foreground italic px-1">
              Showing aggregate across all contracts (mixed currencies displayed per row). Select a specific contract to see it in one currency.
            </div>
          )}

          {arSelected.size > 0 && (
            <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <span className="text-sm font-medium">{arSelected.size} selected</span>
              <span className="text-sm font-bold" style={{ color: "#FF6000" }}>Total: {arFmt(arSelectedTotal)}</span>
              <Button size="sm" onClick={() => setPayDialogOpen(true)}><CreditCard className="h-3 w-3 mr-1" />Pay Selected</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Processing bulk payment...")}>Bulk Pay</Button>
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setArSelected(new Set())}>Clear</Button>
            </div>
          )}

          {myAR.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-sm">
              No outstanding receivables for this contract.
            </Card>
          ) : (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox checked={arSelected.size === myAR.length && myAR.length > 0} onCheckedChange={() => { if (arSelected.size === myAR.length) setArSelected(new Set()); else setArSelected(new Set(myAR.map(a => a.id))); }} /></TableHead>
                <TableHead>ELLIS Code</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Cancel Deadline</TableHead>
                <TableHead>Aging</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myAR.map(ar => {
                const rowFracDigits = ar.currency === "VND" || ar.currency === "JPY" ? 0 : 2;
                const rowFmt = `${ar.currency} ${ar.amount.toLocaleString(undefined, { minimumFractionDigits: rowFracDigits, maximumFractionDigits: rowFracDigits })}`;
                return (
                  <TableRow key={ar.id}>
                    <TableCell><Checkbox checked={arSelected.has(ar.id)} onCheckedChange={() => toggleAr(ar.id)} /></TableCell>
                    <TableCell className="font-mono text-sm">{ar.ellisCode}</TableCell>
                    <TableCell>{ar.hotelName}</TableCell>
                    <TableCell className="font-medium text-right font-mono">{rowFmt}</TableCell>
                    <TableCell>{ar.cancelDeadline}</TableCell>
                    <TableCell>
                      <Badge variant={ar.agingDays > 60 ? "destructive" : ar.agingDays > 30 ? "secondary" : "default"} className="text-[10px]">
                        {ar.agingDays > 0 ? `${ar.agingDays} days` : "Current"}
                      </Badge>
                    </TableCell>
                    <TableCell><Badge variant="destructive" className="text-[10px]">{ar.paymentStatus}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          )}
        </TabsContent>}

      </Tabs>

      {/* Pay Confirmation Dialog */}
      <AlertDialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to pay <strong>{arSelected.size} items</strong> totaling <strong>{arFmt(arSelectedTotal)}</strong>. This action will be processed via your default payment method.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { toast.success("Payment processed", { description: `${arFmt(arSelectedTotal)} has been paid.` }); setArSelected(new Set()); }}>
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

      {/* Top-Up Deposit Dialog (Floating Deposit only, contract-aware) */}
      <TopUpDepositDialog
        open={topUpOpen}
        onOpenChange={setTopUpOpen}
        customer={activeCompany}
        entity={selectedEntity || undefined}
        currency={effectiveCurrency}
        currentBalance={Math.max(0, (effectiveDepositAmount || 0) - myInvoices.filter(i => i.matchStatus !== "Full" && i.matchStatus !== "Reconciled").reduce((s, i) => s + (i.total - i.receivedAmount), 0))}
      />

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
