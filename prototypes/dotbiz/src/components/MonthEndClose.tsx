import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { invoices } from "@/mocks/settlement";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface MonthClosing {
  period: string;
  closedAt: string;
  closedBy: string;
  invoicesCount: number;
  totalRevenue: number;
  notes?: string;
}

const closedMonths: MonthClosing[] = [
  { period: "2026-02", closedAt: "2026-03-05 14:22:01", closedBy: "James Park (Master)", invoicesCount: 1, totalRevenue: 3850 },
  { period: "2026-01", closedAt: "2026-02-04 11:08:17", closedBy: "James Park (Master)", invoicesCount: 1, totalRevenue: 35200 },
  { period: "2025-12", closedAt: "2026-01-06 10:15:42", closedBy: "James Park (Master)", invoicesCount: 1, totalRevenue: 41800, notes: "Year-end closing included" },
];

export default function MonthEndClose() {
  const { hasRole } = useAuth();
  const isMaster = hasRole(["Master"]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [closed, setClosed] = useState<MonthClosing[]>(closedMonths);

  /* Current period = March 2026 (demo) */
  const currentPeriod = "2026-03";
  const marInvoices = invoices.filter(i => i.period.includes("Mar 2026"));

  const handleClose = () => {
    if (!isMaster) { toast.error("Master role required"); return; }
    const entry: MonthClosing = {
      period: currentPeriod,
      closedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      closedBy: "James Park (Master)",
      invoicesCount: marInvoices.length,
      totalRevenue: marInvoices.reduce((s, i) => s + i.total, 0),
    };
    setClosed(prev => [entry, ...prev]);
    setConfirmOpen(false);
    toast.success(`${currentPeriod} closed`, { description: "Invoices in this period are now read-only." });
  };

  return (
    <div className="space-y-4">
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
        <Lock className="h-4 w-4 text-amber-600" />
        <AlertTitle>Month-End Close</AlertTitle>
        <AlertDescription className="text-xs">
          Lock the period once the month's settlement is finalised. After closing, invoices in this period become read-only — no accidental back-dated edits, and the confirmed numbers can be relied upon for reporting.
        </AlertDescription>
      </Alert>

      {/* Close current month */}
      <Card className="p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-bold">Current period: {currentPeriod}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {marInvoices.length} invoice(s) · Total revenue ${marInvoices.reduce((s, i) => s + i.total, 0).toLocaleString()}
            </p>
          </div>
          <Button
            disabled={!isMaster}
            onClick={() => setConfirmOpen(true)}
            style={{ background: isMaster ? "#1a1a2e" : "#999" }}
            className="text-white"
          >
            <Lock className="h-4 w-4 mr-1" />Close {currentPeriod}
          </Button>
        </div>
        {!isMaster && (
          <p className="text-[11px] text-muted-foreground mt-3">OP role: view only. Final closing requires Master role.</p>
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
              This action cannot be undone. After closing, invoices for {currentPeriod} become read-only (no edits, no deletions).
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
