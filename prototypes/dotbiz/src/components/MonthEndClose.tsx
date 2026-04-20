import { useState } from "react";
import { Lock, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { invoices, paymentMatchLog } from "@/mocks/settlement";
import { bookings } from "@/mocks/bookings";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface MonthClosing {
  period: string;
  closedAt: string;
  closedBy: string;
  invoicesCount: number;
  totalRevenue: number;
  disputesResolved: number;
  notes?: string;
}

const closedMonths: MonthClosing[] = [
  { period: "2026-02", closedAt: "2026-03-05 14:22:01", closedBy: "James Park (Master)", invoicesCount: 1, totalRevenue: 3850, disputesResolved: 0 },
  { period: "2026-01", closedAt: "2026-02-04 11:08:17", closedBy: "James Park (Master)", invoicesCount: 1, totalRevenue: 35200, disputesResolved: 2 },
  { period: "2025-12", closedAt: "2026-01-06 10:15:42", closedBy: "James Park (Master)", invoicesCount: 1, totalRevenue: 41800, disputesResolved: 1, notes: "Year-end closing included" },
];

export default function MonthEndClose() {
  const { hasRole } = useAuth();
  const isMaster = hasRole(["Master"]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [closed, setClosed] = useState<MonthClosing[]>(closedMonths);

  /* Current period = March 2026 (demo) */
  const currentPeriod = "2026-03";

  /* Checklist */
  const marInvoices = invoices.filter(i => i.period.includes("Mar 2026"));
  const hasUnissuedInvoices = invoices.some(i => i.period.includes("Mar 2026") && i.status === "Issued" && i.receivedAmount === 0);
  const hasOpenDisputes = bookings.some(b => b.disputed && b.disputeStatus === "Open" && marInvoices.some(i => i.bookingIds.includes(b.id)));
  const hasPendingMatches = paymentMatchLog.some(l => l.approvalStatus === "Pending Master" && marInvoices.some(i => i.invoiceNo === l.invoiceNo));

  const checklist = [
    { label: "All Mar 2026 invoices issued", done: !hasUnissuedInvoices, note: hasUnissuedInvoices ? "Unissued invoices found" : "OK" },
    { label: "All disputes resolved", done: !hasOpenDisputes, note: hasOpenDisputes ? "Open disputes exist — resolve first" : "Done" },
    { label: "Master-approved all Payment Matches", done: !hasPendingMatches, note: hasPendingMatches ? "Approvals pending" : "Done" },
    { label: "All remittances received / reconciled", done: true, note: "Verified against invoice totals" },
  ];

  const allDone = checklist.every(c => c.done);

  const handleClose = () => {
    if (!isMaster) { toast.error("Master role required"); return; }
    const entry: MonthClosing = {
      period: currentPeriod,
      closedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      closedBy: "James Park (Master)",
      invoicesCount: marInvoices.length,
      totalRevenue: marInvoices.reduce((s, i) => s + i.total, 0),
      disputesResolved: 2,
    };
    setClosed(prev => [entry, ...prev]);
    setConfirmOpen(false);
    toast.success(`${currentPeriod} closed`, { description: "Invoices / bookings / payments in this period are now read-only." });
  };

  return (
    <div className="space-y-4">
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
        <Lock className="h-4 w-4 text-amber-600" />
        <AlertTitle>Month-End Closing Workflow</AlertTitle>
        <AlertDescription className="text-xs">
          Closing procedure once settlement is complete. All checklist items ✓ → Master approval → period locked (no further edits). Records retained 7 years per regulation.
        </AlertDescription>
      </Alert>

      {/* Current month closing */}
      <Card className="p-5">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-bold">{currentPeriod} Closing Checklist</h3>
            <p className="text-xs text-muted-foreground mt-1">"Close Month" button activates when all items are done.</p>
          </div>
          <Button
            disabled={!allDone || !isMaster}
            onClick={() => setConfirmOpen(true)}
            style={{ background: allDone && isMaster ? "#1a1a2e" : "#999" }}
            className="text-white"
          >
            <Lock className="h-4 w-4 mr-1" />Close {currentPeriod}
          </Button>
        </div>

        <div className="space-y-2">
          {checklist.map((item, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-md ${item.done ? "bg-green-50 dark:bg-green-950/10 border border-green-200 dark:border-green-900" : "bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900"}`}>
              {item.done ? <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" /> : <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className={`text-xs ${item.done ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>{item.note}</p>
              </div>
              <Badge variant={item.done ? "default" : "destructive"} className="text-[10px]">{item.done ? "DONE" : "PENDING"}</Badge>
            </div>
          ))}
        </div>

        {!isMaster && (
          <Alert className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-900/10">
            <AlertDescription className="text-xs">OP role: can view the checklist. Final closing requires Master role.</AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Closed months history */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <h3 className="text-base font-bold">Closing History (Locked)</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Closed At</TableHead>
              <TableHead>Closed By</TableHead>
              <TableHead className="text-right">Invoices</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Disputes Resolved</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {closed.map(m => (
              <TableRow key={m.period} className="bg-slate-50 dark:bg-slate-900/20">
                <TableCell className="font-mono text-xs">{m.period} <Lock className="h-3 w-3 inline ml-1 text-slate-500" /></TableCell>
                <TableCell className="font-mono text-[10px]">{m.closedAt}</TableCell>
                <TableCell className="text-xs">{m.closedBy}</TableCell>
                <TableCell className="text-right font-mono">{m.invoicesCount}</TableCell>
                <TableCell className="text-right font-mono font-medium">${m.totalRevenue.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-xs">{m.disputesResolved}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{m.notes || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Confirm Close {currentPeriod}</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. After closing, invoices, bookings, and remittances for {currentPeriod} become read-only.
              Further adjustments must go through a separate correction process.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClose} style={{ background: "#1a1a2e" }}>
              <Lock className="h-4 w-4 mr-1" />Close &amp; Lock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
