import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Printer, Download, Info, Eye } from "lucide-react";
import { toast } from "sonner";
import type { Booking } from "@/mocks/bookings";
import { currentCompany, companies } from "@/mocks/companies";
import { useAuth } from "@/contexts/AuthContext";

/* Guest-facing Voucher / Invoice generator for B2B agencies.
 *
 * Use case: a travel agency (our customer) needs to hand a voucher
 * to their end-traveler. Our wholesale price ≠ what the traveler
 * sees — the agency marks up the price. So the agency's staff:
 *   1. Opens this dialog from a Pending Payment row
 *   2. Reviews what the traveler will see
 *   3. Edits the price if needed (their markup)
 *   4. Downloads PDF → forwards to traveler (email/print themselves)
 *
 * No email is sent from our side — we only produce the file.
 */

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

export default function GuestVoucherDialog({ open, onOpenChange, booking }: Props) {
  const { user } = useAuth();
  const activeCompany = companies.find(c => c.name === user?.company) || currentCompany;

  const [customerPrice, setCustomerPrice] = useState<string>("");
  const [customerCurrency, setCustomerCurrency] = useState<string>(activeCompany.contractCurrency);
  const [guestNote, setGuestNote] = useState("");
  const [docType, setDocType] = useState<"voucher" | "invoice">("voucher");

  useEffect(() => {
    if (open && booking) {
      setCustomerPrice(booking.sumAmount.toFixed(2));
      setCustomerCurrency(activeCompany.contractCurrency);
      setGuestNote("");
      setDocType("voucher");
    }
  }, [open, booking, activeCompany.contractCurrency]);

  if (!booking) return null;

  const checkOut = (() => {
    const d = new Date(booking.checkIn);
    d.setDate(d.getDate() + booking.nights);
    return d.toISOString().split("T")[0];
  })();
  const priceNum = parseFloat(customerPrice) || 0;
  const markup = priceNum - booking.sumAmount;
  const markupPct = booking.sumAmount > 0 ? (markup / booking.sumAmount) * 100 : 0;

  const handleDownload = () => {
    window.print();
    toast.success("Print dialog opened", { description: "Save as PDF, then forward to the traveler." });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto p-0" style={{ maxWidth: "1100px", width: "95vw" }}>
        <DialogHeader className="px-6 pt-4 pb-2 border-b no-print">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Guest Voucher / Invoice — Preview &amp; Download
          </DialogTitle>
        </DialogHeader>

        {/* Editor Bar (non-printable) */}
        <div className="px-6 py-4 border-b bg-muted/30 no-print">
          <Alert className="mb-3 border-blue-200 bg-blue-50 dark:bg-blue-900/10">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs">
              This document is for <strong>your end-traveler</strong>, not for DOTBIZ. Our wholesale price is
              {" "}<strong className="font-mono">{activeCompany.contractCurrency} {booking.sumAmount.toFixed(2)}</strong> —
              you may enter a different price below (your markup). No email is sent; download the PDF and forward it yourself.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Document type</label>
              <select value={docType} onChange={e => setDocType(e.target.value as "voucher" | "invoice")} className="w-full mt-1 border rounded px-2 py-1.5 text-sm bg-background">
                <option value="voucher">Voucher (hotel confirmation)</option>
                <option value="invoice">Invoice (payment request)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Price to traveler</label>
              <div className="flex gap-1 mt-1">
                <select value={customerCurrency} onChange={e => setCustomerCurrency(e.target.value)} className="border rounded px-1.5 py-1.5 text-xs bg-background w-20">
                  {["USD", "KRW", "JPY", "CNY", "VND", "SGD", "EUR", "THB"].map(c => <option key={c}>{c}</option>)}
                </select>
                <Input type="number" step="0.01" value={customerPrice} onChange={e => setCustomerPrice(e.target.value)} className="font-mono" />
              </div>
              {markup !== 0 && (
                <p className={`text-[10px] mt-1 ${markup > 0 ? "text-green-600" : "text-red-600"}`}>
                  {markup > 0 ? "+" : ""}{markup.toFixed(2)} ({markupPct > 0 ? "+" : ""}{markupPct.toFixed(1)}% vs wholesale)
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Traveler note (optional)</label>
              <Textarea value={guestNote} onChange={e => setGuestNote(e.target.value)} rows={2} placeholder="e.g. Thank you for booking with us. Please present this at check-in." className="mt-1 resize-none" />
            </div>
          </div>
        </div>

        {/* Preview — A4 (printable) */}
        <div id="printable-voucher" className="bg-white text-slate-900 p-10" style={{ fontFamily: "Arial, sans-serif" }}>
          {/* Header: agency branding */}
          <div className="flex items-start justify-between mb-8 pb-4 border-b-2" style={{ borderColor: "#FF6000" }}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded shrink-0 flex items-center justify-center text-white text-lg font-bold" style={{ background: "#FF6000" }}>
                  {activeCompany.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-lg">{activeCompany.name}</p>
                  <p className="text-[10px] text-slate-500">{activeCompany.address}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold" style={{ color: "#FF6000" }}>{docType === "voucher" ? "VOUCHER" : "INVOICE"}</h1>
              <p className="text-xs text-slate-500 mt-1">Ref: {booking.ellisCode}</p>
              <p className="text-xs text-slate-500">Issued: {new Date().toISOString().split("T")[0]}</p>
            </div>
          </div>

          {/* Guest + Hotel info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Guest</h3>
              <p className="font-semibold">{booking.guestName || booking.traveler}</p>
              {booking.guestEmail && <p className="text-xs text-slate-600 mt-0.5">{booking.guestEmail}</p>}
              {booking.guestMobile && <p className="text-xs text-slate-600">{booking.guestMobile}</p>}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Hotel</h3>
              <p className="font-semibold">{booking.hotelName}</p>
              <p className="text-xs text-slate-600 mt-0.5">{booking.hotelAddress}</p>
              <p className="text-xs text-slate-600">{booking.hotelContact}</p>
              {booking.hotelConfirmCode && (
                <p className="text-xs mt-1"><span className="text-slate-500">Hotel Ref:</span> <span className="font-mono font-medium">{booking.hotelConfirmCode}</span></p>
              )}
            </div>
          </div>

          {/* Stay details */}
          <h3 className="text-sm font-bold uppercase mb-2" style={{ color: "#FF6000" }}>Stay Details</h3>
          <table className="w-full mb-8 text-sm border">
            <tbody>
              <tr className="border-b bg-slate-50">
                <td className="py-2.5 px-3 font-medium text-slate-500 w-40 text-xs">Check-in</td>
                <td className="py-2.5 px-3 font-medium">{booking.checkIn}</td>
                <td className="py-2.5 px-3 font-medium text-slate-500 w-40 text-xs">Check-out</td>
                <td className="py-2.5 px-3 font-medium">{checkOut}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2.5 px-3 font-medium text-slate-500 text-xs">Nights</td>
                <td className="py-2.5 px-3">{booking.nights}</td>
                <td className="py-2.5 px-3 font-medium text-slate-500 text-xs">Rooms</td>
                <td className="py-2.5 px-3">{booking.roomCount}</td>
              </tr>
              <tr className="border-b bg-slate-50">
                <td className="py-2.5 px-3 font-medium text-slate-500 text-xs">Room Type</td>
                <td className="py-2.5 px-3" colSpan={3}>{booking.roomType}</td>
              </tr>
              {booking.specialRequests && (
                <tr className="border-b">
                  <td className="py-2.5 px-3 font-medium text-slate-500 text-xs">Special Requests</td>
                  <td className="py-2.5 px-3 text-xs" colSpan={3}>{booking.specialRequests}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Price block — depends on doc type */}
          {docType === "invoice" ? (
            <div className="bg-slate-100 rounded p-5 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-700">Reservation · {booking.nights} night(s)</span>
                <span className="font-medium">{customerCurrency} {priceNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="h-px bg-slate-300 my-2" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-base">Total Due</span>
                <span className="font-bold text-xl" style={{ color: "#FF6000" }}>{customerCurrency} {priceNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <p className="text-[10px] text-slate-500 pt-2">* Tax included</p>
            </div>
          ) : (
            <div className="border-2 rounded p-5 mb-6" style={{ borderColor: "#FF6000" }}>
              <div className="flex justify-between items-center">
                <span className="font-bold" style={{ color: "#FF6000" }}>Booking Confirmed — Prepaid</span>
                <span className="font-bold text-lg">{customerCurrency} {priceNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">Please present this voucher at check-in along with valid photo ID.</p>
            </div>
          )}

          {/* Note from agency */}
          {guestNote && (
            <div className="border-l-4 pl-4 py-2 mb-6" style={{ borderColor: "#FF6000" }}>
              <p className="text-xs font-bold uppercase mb-1" style={{ color: "#FF6000" }}>Message</p>
              <p className="text-xs text-slate-700 whitespace-pre-wrap">{guestNote}</p>
            </div>
          )}

          {/* Guidelines */}
          <div className="border rounded p-3 mb-6 bg-amber-50 dark:bg-amber-900/10">
            <p className="text-xs font-bold mb-1">Guidelines</p>
            <ul className="text-[11px] text-slate-700 space-y-0.5">
              <li>• Present valid government-issued photo ID at check-in.</li>
              <li>• Cancellation policy and any additional hotel charges apply as per the hotel's rules.</li>
              <li>• For any booking enquiry, contact {activeCompany.name} directly — not the hotel.</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t text-center">
            <p className="text-xs text-slate-600">{activeCompany.name}</p>
            <p className="text-xs text-slate-500">{activeCompany.phone} · {activeCompany.email}</p>
            <p className="text-[10px] text-slate-400 mt-2">This document was generated via DOTBIZ on behalf of {activeCompany.name}.</p>
          </div>
        </div>

        <DialogFooter className="px-6 py-3 border-t bg-muted/30 no-print">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button style={{ background: "#FF6000" }} className="text-white" onClick={handleDownload}>
            <Printer className="h-4 w-4 mr-1" />Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
