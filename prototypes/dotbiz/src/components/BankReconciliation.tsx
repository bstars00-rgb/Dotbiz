import { useState, useMemo } from "react";
import { Upload, CheckCircle2, AlertTriangle, FileSpreadsheet, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { invoices } from "@/mocks/settlement";
import { toast } from "sonner";

/* Bank Reconciliation — CSV upload with auto-match against invoices.
 *
 * Expected CSV format (comma-separated, headers flexible):
 *   date, amount, description
 *   2026-04-15, 2820, TravelCo Intl Remittance INV-89
 *
 * Auto-match algorithm:
 *   1. Exact amount match against invoice.receivedAmount OR invoice.total
 *   2. If invoice number appears in description → prioritize
 *   3. Unmatched → Manual review queue
 */

interface ParsedRow {
  date: string;
  amount: number;
  description: string;
}

interface MatchResult {
  row: ParsedRow;
  matchedInvoice: string | null;
  matchType: "Exact-Full" | "Exact-Partial" | "Description" | "Unmatched" | "Multi-match";
  candidates?: string[];
}

const SAMPLE_CSV = `Date,Amount,Description
2026-04-15,2820,Wire from TravelCo Intl — INV-2026-0089 partial
2026-04-10,3850,Paid by TravelCo — INV-2026-0067 full
2026-04-18,7800,Dragon Holidays CN — March settlement
2026-04-20,1650,Raffles SG booking payment
2026-04-12,500,Unidentified credit — need review`;

function parseCsv(text: string): ParsedRow[] {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length === 0) return [];
  /* Skip header if first line contains non-numeric amount */
  const first = lines[0].toLowerCase();
  const start = (first.includes("date") || first.includes("amount")) ? 1 : 0;
  return lines.slice(start).map(line => {
    const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
    return {
      date: cols[0] || "",
      amount: parseFloat(cols[1] || "0") || 0,
      description: cols[2] || "",
    };
  }).filter(r => r.amount > 0);
}

function runAutoMatch(rows: ParsedRow[]): MatchResult[] {
  return rows.map(row => {
    /* Strategy 1: invoice number in description */
    const invFromDesc = invoices.find(inv => row.description.toUpperCase().includes(inv.invoiceNo.toUpperCase()));
    if (invFromDesc) {
      return { row, matchedInvoice: invFromDesc.invoiceNo, matchType: "Description" };
    }

    /* Strategy 2: exact amount match */
    const exactFull = invoices.filter(inv => Math.abs(inv.total - row.amount) < 0.01);
    if (exactFull.length === 1) {
      return { row, matchedInvoice: exactFull[0].invoiceNo, matchType: "Exact-Full" };
    }
    if (exactFull.length > 1) {
      return { row, matchedInvoice: null, matchType: "Multi-match", candidates: exactFull.map(i => i.invoiceNo) };
    }

    /* Strategy 3: exact match on receivedAmount (partial payment detection) */
    const exactPartial = invoices.filter(inv => Math.abs(inv.receivedAmount - row.amount) < 0.01 && inv.receivedAmount > 0);
    if (exactPartial.length === 1) {
      return { row, matchedInvoice: exactPartial[0].invoiceNo, matchType: "Exact-Partial" };
    }

    return { row, matchedInvoice: null, matchType: "Unmatched" };
  });
}

export default function BankReconciliation() {
  const [csvText, setCsvText] = useState("");
  const [results, setResults] = useState<MatchResult[] | null>(null);

  const stats = useMemo(() => {
    if (!results) return null;
    return {
      total: results.length,
      matched: results.filter(r => r.matchedInvoice !== null).length,
      unmatched: results.filter(r => r.matchType === "Unmatched").length,
      multi: results.filter(r => r.matchType === "Multi-match").length,
      matchRate: Math.round((results.filter(r => r.matchedInvoice !== null).length / results.length) * 100),
    };
  }, [results]);

  const handleRun = () => {
    const rows = parseCsv(csvText);
    if (rows.length === 0) {
      toast.error("유효한 CSV 행이 없습니다.");
      return;
    }
    const matches = runAutoMatch(rows);
    setResults(matches);
    const matched = matches.filter(m => m.matchedInvoice !== null).length;
    toast.success(`${matches.length}건 중 ${matched}건 자동 매칭 완료`);
  };

  const loadSample = () => setCsvText(SAMPLE_CSV);

  return (
    <div className="space-y-4">
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
        <Upload className="h-4 w-4 text-blue-600" />
        <AlertTitle>은행명세서 자동 대사</AlertTitle>
        <AlertDescription className="text-xs">
          은행에서 받은 CSV를 붙여넣으면 자동으로 인보이스와 매칭합니다.
          <br />매칭 전략: (1) 적요에 인보이스 번호 / (2) 금액 일치 / (3) 부분입금 금액 일치 / (4) 매칭 실패 → 수동 검토 큐.
        </AlertDescription>
      </Alert>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            CSV Upload / Paste
          </h3>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={loadSample}>Load Sample</Button>
            <Button size="sm" style={{ background: "#FF6000" }} className="text-white" onClick={handleRun} disabled={!csvText.trim()}>
              <Upload className="h-3 w-3 mr-1" />Run Auto-Match
            </Button>
          </div>
        </div>
        <Textarea
          value={csvText}
          onChange={e => setCsvText(e.target.value)}
          rows={8}
          placeholder="Date,Amount,Description
2026-04-15,2820,Wire from TravelCo — INV-2026-0089
..."
          className="font-mono text-xs resize-none"
        />
        <p className="text-[10px] text-muted-foreground mt-2">헤더 행 선택사항 · 3컬럼 (Date / Amount / Description)</p>
      </Card>

      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="p-3"><p className="text-xs text-muted-foreground">Total Rows</p><p className="text-lg font-bold">{stats.total}</p></Card>
            <Card className="p-3"><p className="text-xs text-muted-foreground">Matched</p><p className="text-lg font-bold text-green-600">{stats.matched}</p></Card>
            <Card className="p-3"><p className="text-xs text-muted-foreground">Unmatched</p><p className="text-lg font-bold text-red-600">{stats.unmatched}</p></Card>
            <Card className="p-3"><p className="text-xs text-muted-foreground">Multi-match</p><p className="text-lg font-bold text-amber-600">{stats.multi}</p></Card>
            <Card className="p-3"><p className="text-xs text-muted-foreground">Match Rate</p><p className="text-lg font-bold" style={{ color: stats.matchRate >= 80 ? "#009505" : "#FF6000" }}>{stats.matchRate}%</p></Card>
          </div>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base">매칭 결과</h3>
              <Button size="sm" variant="outline" onClick={() => toast.success("매칭 결과 CSV 다운로드")}>
                <Download className="h-3 w-3 mr-1" />Export
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Match Type</TableHead>
                  <TableHead>Matched Invoice</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results!.map((r, i) => {
                  const bgClass = r.matchType === "Unmatched" ? "bg-red-50/60 dark:bg-red-950/10" : r.matchType === "Multi-match" ? "bg-amber-50/60 dark:bg-amber-950/10" : "";
                  const typeColor = r.matchType === "Exact-Full" || r.matchType === "Description" ? "default" : r.matchType === "Exact-Partial" ? "secondary" : r.matchType === "Multi-match" ? "secondary" : "destructive";
                  return (
                    <TableRow key={i} className={bgClass}>
                      <TableCell className="font-mono text-xs">{r.row.date}</TableCell>
                      <TableCell className="text-right font-mono font-medium">${r.row.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-xs max-w-[260px] truncate" title={r.row.description}>{r.row.description}</TableCell>
                      <TableCell><Badge variant={typeColor} className="text-[10px]">{r.matchType}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">
                        {r.matchedInvoice || (r.candidates ? r.candidates.join(" or ") : "—")}
                      </TableCell>
                      <TableCell>
                        {r.matchedInvoice ? (
                          <Badge variant="outline" className="text-[10px]"><CheckCircle2 className="h-3 w-3 mr-0.5" />Auto-applied</Badge>
                        ) : (
                          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.info("수동 매칭 다이얼로그 열림")}>
                            <AlertTriangle className="h-3 w-3 mr-1" />Manual Match
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
