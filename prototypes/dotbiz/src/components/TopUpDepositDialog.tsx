import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Copy, AlertTriangle, CheckCircle2, Clock, CreditCard } from "lucide-react";
import { toast } from "sonner";
import type { Company } from "@/mocks/companies";
import { ohMyHotelBankInfo, generateRefCode, topUpRequests, type TopUpRequest } from "@/mocks/topUp";

/* Top-Up Deposit dialog
 *
 * Flow:
 *   1. Customer enters requested amount.
 *   2. DOTBIZ generates a unique ref code (TUP-YYYYMMDD-XXXX).
 *   3. Dialog shows: bank details + ref code + clear "you MUST include
 *      this code in wire memo" warning + 7-day expiry.
 *   4. On submit, a TopUpRequest is created (POST /api/topup-requests
 *      to ELLIS in production). The customer wires money.
 *   5. ELLIS or finance team reconciles by ref code → deposit credited.
 *
 * Spec: docs/spec/TopUpDeposit.md
 */
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Company;
  currentBalance: number;
}

export default function TopUpDepositDialog({ open, onOpenChange, customer, currentBalance }: Props) {
  const [step, setStep] = useState<"amount" | "wire" | "submitted">("amount");
  const [amount, setAmount] = useState<string>("");
  const [refCode, setRefCode] = useState<string>("");

  useEffect(() => {
    if (open) {
      setStep("amount");
      setAmount("");
      setRefCode("");
    }
  }, [open]);

  const handleNext = () => {
    const n = parseFloat(amount) || 0;
    if (n < 1000) { toast.error("Minimum top-up amount is 1,000 USD"); return; }
    setRefCode(generateRefCode());
    setStep("wire");
  };

  const handleSubmit = () => {
    const n = parseFloat(amount) || 0;
    const newReq: TopUpRequest = {
      id: `tup-${Date.now()}`,
      customerCompanyId: customer.id,
      refCode,
      requestedAmount: n,
      currency: customer.contractCurrency,
      requestedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      expiresAt: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().replace("T", " ").slice(0, 19); })(),
      status: "Pending",
    };
    /* In production: POST /api/topup-requests → ELLIS persists & returns id */
    topUpRequests.unshift(newReq);
    setStep("submitted");
    toast.success("Top-up request created", { description: `Wire ${customer.contractCurrency} ${n.toLocaleString()} with memo: ${refCode}` });
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    toast.success(`${label} copied`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: "640px", width: "92vw" }} className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" style={{ color: "#FF6000" }} />
            Top Up Floating Deposit
          </DialogTitle>
        </DialogHeader>

        {/* ─────────── Step 1: Amount ─────────── */}
        {step === "amount" && (
          <div className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
              <AlertDescription className="text-xs">
                Current available balance: <strong className="text-green-600">{customer.contractCurrency} {currentBalance.toLocaleString()}</strong>.
                A top-up adds to this balance once your wire transfer is received and reconciled (1-2 business days).
              </AlertDescription>
            </Alert>

            <div>
              <label className="text-sm font-medium">Top-up amount</label>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="font-mono px-3 flex items-center">{customer.contractCurrency}</Badge>
                <Input type="number" min={1000} step={1000} value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 20000" className="font-mono text-lg" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Minimum 1,000 · Suggested: 10,000 / 20,000 / 50,000</p>
              <div className="flex gap-2 mt-2">
                {[10000, 20000, 50000].map(v => (
                  <Button key={v} size="sm" variant="outline" onClick={() => setAmount(String(v))}>
                    {customer.contractCurrency} {v.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─────────── Step 2: Wire instructions ─────────── */}
        {step === "wire" && (
          <div className="space-y-4">
            <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-900/20">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-900 dark:text-amber-100">⚠️ Important: include the reference code in wire memo</AlertTitle>
              <AlertDescription className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                Without the code, our finance team cannot automatically attribute your wire to your account, which delays
                deposit credit. Manual matching may take 3-5 business days.
              </AlertDescription>
            </Alert>

            {/* Ref code — big, copyable */}
            <div className="border-2 border-dashed border-orange-400 rounded-lg p-4 bg-orange-50 dark:bg-orange-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground font-medium">Reference Code (paste into wire memo)</p>
                  <p className="text-2xl font-bold font-mono mt-1" style={{ color: "#FF6000" }}>{refCode}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => copy(refCode, "Reference code")}>
                  <Copy className="h-3 w-3 mr-1" />Copy
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>This code is valid for <strong>7 days</strong>. After expiry the request will be cancelled.</span>
              </div>
            </div>

            {/* Bank info */}
            <div className="border rounded-lg p-4 space-y-2 bg-slate-50 dark:bg-slate-900/40">
              <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Wire to OhMyHotel</p>
              {[
                { label: "Bank", value: ohMyHotelBankInfo.bankName },
                { label: "SWIFT", value: ohMyHotelBankInfo.swift },
                { label: "Account Holder", value: ohMyHotelBankInfo.accountHolder },
                { label: "Account Number", value: ohMyHotelBankInfo.accountNumber },
                { label: "Bank Address", value: ohMyHotelBankInfo.bankAddress },
                { label: "Amount", value: `${customer.contractCurrency} ${parseFloat(amount).toLocaleString()}` },
                { label: "Memo (mandatory)", value: refCode, highlight: true },
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between gap-3 py-1 border-b border-slate-200 dark:border-slate-800 last:border-0">
                  <span className="text-xs text-muted-foreground shrink-0 w-32">{row.label}</span>
                  <span className={`text-xs flex-1 break-all ${row.highlight ? "font-bold font-mono text-orange-700 dark:text-orange-300" : "font-medium"}`}>{row.value}</span>
                  <button onClick={() => copy(row.value, row.label)} className="text-muted-foreground hover:text-foreground shrink-0">
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-muted-foreground">
              Note: no separate receipt is issued for top-ups. The deposit balance and your booking invoices serve as
              the audit trail.
            </p>
          </div>
        )}

        {/* ─────────── Step 3: Submitted ─────────── */}
        {step === "submitted" && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg">Top-Up Request Created</h3>
              <p className="text-sm text-muted-foreground mt-1">Reference code: <span className="font-mono font-bold" style={{ color: "#FF6000" }}>{refCode}</span></p>
            </div>
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
              <AlertDescription className="text-xs">
                <strong>Next:</strong> Wire {customer.contractCurrency} {parseFloat(amount).toLocaleString()} to the bank account
                shown previously, with the reference code in the memo.
                <br /><strong>Reconciliation:</strong> Typically 1-2 business days after our bank confirms receipt.
                You will be notified by email and the deposit balance will update automatically.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          {step === "amount" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleNext} disabled={!amount || parseFloat(amount) < 1000} style={{ background: "#FF6000" }} className="text-white">Next: Wire Instructions</Button>
            </>
          )}
          {step === "wire" && (
            <>
              <Button variant="outline" onClick={() => setStep("amount")}>Back</Button>
              <Button onClick={handleSubmit} style={{ background: "#FF6000" }} className="text-white">Confirm — I'll Wire Now</Button>
            </>
          )}
          {step === "submitted" && (
            <Button onClick={() => onOpenChange(false)} style={{ background: "#FF6000" }} className="text-white w-full">Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
