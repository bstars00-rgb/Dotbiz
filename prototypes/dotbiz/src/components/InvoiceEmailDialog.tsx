import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Paperclip, X, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Company } from "@/mocks/companies";
import type { InvoiceWithMatch } from "@/mocks/settlement";
import { getEntity } from "@/mocks/ohMyHotelEntities";
import { useAuth } from "@/contexts/AuthContext";

/* In-memory email log — prototype only.
 * Production: ELLIS writes to invoice_email_log table via POST /api/invoices/:id/email */
export interface InvoiceEmailLogEntry {
  invoiceNo: string;
  sentAt: string;            /* ISO-ish */
  sentBy: string;            /* user email */
  to: string[];
  cc: string[];
  subject: string;
  attachPdf: boolean;
  attachCsv: boolean;
}
const invoiceEmailLog: InvoiceEmailLogEntry[] = [];
export function getInvoiceEmailLog(invoiceNo: string): InvoiceEmailLogEntry[] {
  return invoiceEmailLog.filter(e => e.invoiceNo === invoiceNo).sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}
export function getLastInvoiceEmail(invoiceNo: string): InvoiceEmailLogEntry | undefined {
  return getInvoiceEmailLog(invoiceNo)[0];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceWithMatch | null;
  customer: Company;
}

const parseEmails = (raw: string): string[] =>
  raw.split(/[,;\s]+/).map(s => s.trim()).filter(s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));

export default function InvoiceEmailDialog({ open, onOpenChange, invoice, customer }: Props) {
  const { user } = useAuth();
  const myEmail = user?.email || "";

  const entity = useMemo(
    () => invoice?.ohmyhotelEntityId ? getEntity(invoice.ohmyhotelEntityId) : null,
    [invoice?.ohmyhotelEntityId]
  );

  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachPdf, setAttachPdf] = useState(true);
  const [attachCsv, setAttachCsv] = useState(false);
  const [ccSelf, setCcSelf] = useState(true);
  const [sending, setSending] = useState(false);

  /* Reset / prefill on open */
  useEffect(() => {
    if (!open || !invoice) return;
    const period = invoice.period || "";
    const total = `${invoice.contractCurrency} ${invoice.total.toLocaleString(undefined, {
      minimumFractionDigits: invoice.contractCurrency === "VND" || invoice.contractCurrency === "JPY" ? 0 : 2,
      maximumFractionDigits: invoice.contractCurrency === "VND" || invoice.contractCurrency === "JPY" ? 0 : 2,
    })}`;
    setToInput(customer.email || "");
    setCcInput("");
    setCcSelf(true);
    setSubject(`Invoice ${invoice.invoiceNo} — ${period} — ${customer.name}`);
    setBody(
      [
        `Hello,`,
        ``,
        `Please find attached invoice ${invoice.invoiceNo} for the period ${period}.`,
        ``,
        `Total due: ${total}`,
        `Due date: ${invoice.dueDate}`,
        entity ? `Issuing entity: ${entity.legalName}` : "",
        ``,
        `Kindly remit by the due date. For any line-item questions, please open a support ticket in DOTBIZ — do not reply to this email.`,
        ``,
        `Thank you.`,
      ].filter(Boolean).join("\n")
    );
    setAttachPdf(true);
    setAttachCsv(false);
    setSending(false);
  }, [open, invoice, customer, entity]);

  if (!invoice) return null;

  const toList = parseEmails(toInput);
  const ccList = [...parseEmails(ccInput), ...(ccSelf && myEmail ? [myEmail] : [])];
  const uniqCc = Array.from(new Set(ccList)).filter(e => !toList.includes(e));

  const canSend = toList.length > 0 && subject.trim().length > 0 && !sending;

  const handleSend = () => {
    if (!canSend) return;
    setSending(true);
    /* Simulate server round-trip */
    setTimeout(() => {
      invoiceEmailLog.push({
        invoiceNo: invoice.invoiceNo,
        sentAt: new Date().toISOString().replace("T", " ").slice(0, 19),
        sentBy: myEmail || "unknown",
        to: toList,
        cc: uniqCc,
        subject: subject.trim(),
        attachPdf,
        attachCsv,
      });
      setSending(false);
      toast.success(`Invoice emailed to ${toList.length} recipient${toList.length > 1 ? "s" : ""}`, {
        description: `${toList.slice(0, 2).join(", ")}${toList.length > 2 ? ` +${toList.length - 2}` : ""}${uniqCc.length > 0 ? ` · cc ${uniqCc.length}` : ""}`,
      });
      onOpenChange(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: "640px", width: "92vw" }} className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" style={{ color: "#FF6000" }} />
            Email Invoice
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs">
              Sending <strong>{invoice.invoiceNo}</strong> · {invoice.contractCurrency}{" "}
              {invoice.total.toLocaleString()} · Due {invoice.dueDate}
              {entity && <> · from <strong>{entity.countryFlag} {entity.shortName}</strong></>}.
              {" "}This goes through ELLIS and is recorded in the invoice email log for audit.
            </AlertDescription>
          </Alert>

          {/* To */}
          <div>
            <label className="text-xs font-semibold block mb-1">
              To <span className="text-red-600">*</span>
            </label>
            <Input
              value={toInput}
              onChange={e => setToInput(e.target.value)}
              placeholder="billing@travelco.com, finance@travelco.com"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Comma or semicolon separated. Default = customer billing email on file.
            </p>
          </div>

          {/* CC */}
          <div>
            <label className="text-xs font-semibold block mb-1">CC (optional)</label>
            <Input
              value={ccInput}
              onChange={e => setCcInput(e.target.value)}
              placeholder="accounting@travelco.com"
            />
            <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs">
              <Checkbox checked={ccSelf} onCheckedChange={c => setCcSelf(!!c)} />
              CC myself ({myEmail || "no email on profile"})
            </label>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-semibold block mb-1">
              Subject <span className="text-red-600">*</span>
            </label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} />
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-semibold block mb-1">Message</label>
            <Textarea
              rows={8}
              value={body}
              onChange={e => setBody(e.target.value)}
              className="font-mono text-[12px]"
            />
          </div>

          {/* Attachments */}
          <div className="border rounded-md p-3 bg-muted/40">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1">
              <Paperclip className="h-3 w-3" />Attachments
            </p>
            <label className="flex items-center gap-2 cursor-pointer text-xs mb-1">
              <Checkbox checked={attachPdf} onCheckedChange={c => setAttachPdf(!!c)} />
              <span>
                Invoice PDF
                <Badge variant="outline" className="ml-2 text-[10px]">recommended</Badge>
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <Checkbox checked={attachCsv} onCheckedChange={c => setAttachCsv(!!c)} />
              <span>
                Line-item CSV
                <Badge variant="outline" className="ml-2 text-[10px]">for accounting import</Badge>
              </span>
            </label>
          </div>

          {/* Recipient preview chips */}
          {(toList.length > 0 || uniqCc.length > 0) && (
            <div className="text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-semibold">To:</span>
                {toList.map(e => (
                  <span key={e} className="bg-muted rounded px-1.5 py-0.5 font-mono">{e}</span>
                ))}
                {toList.length === 0 && <span className="italic">(none — add at least one valid email)</span>}
              </div>
              {uniqCc.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap mt-1">
                  <span className="font-semibold">CC:</span>
                  {uniqCc.map(e => (
                    <span key={e} className="bg-muted rounded px-1.5 py-0.5 font-mono">{e}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={sending}>
            <X className="h-4 w-4 mr-1" />Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!canSend}
            style={{ background: canSend ? "#FF6000" : undefined }}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />Sending…
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-1" />Send via ELLIS
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
