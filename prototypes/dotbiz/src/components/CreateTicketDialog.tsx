import { useState } from "react";
import { useNavigate } from "react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { useTickets } from "@/contexts/TicketsContext";

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingCode?: string;
  hotelName?: string;
}

type ArrivalStatus = "Not in store" | "Arrived in store" | "Checked out";
type ProblemCategory = "Request hotel confirmation" | "No reservation found" | "Room rate problem" | "Booking mismatch" | "Hotel Problems" | "Apply for early departure" | "Invoice issues";

const problemCategories: ProblemCategory[] = [
  "Request hotel confirmation", "No reservation found", "Room rate problem", "Booking mismatch", "Hotel Problems", "Apply for early departure", "Invoice issues"
];

/* Sub-options per category */
const subOptions: Record<string, { options: string[]; note?: string; multiple?: boolean }> = {
  "Request hotel confirmation": {
    options: ["Hotel confirmation number not received", "API integration booking — need hotel-side confirmation", "Confirmation number mismatch", "Resend confirmation number"],
    note: "We will contact the hotel to obtain/verify the confirmation number. Response typically within 24 hours on business days.",
  },
  "Booking mismatch": {
    options: ["Inconsistent room type arrangement", "Inconsistent bed arrangement", "Inconsistent meal arrangement", "The name of the check-in is inconsistent with the arrangement", "The arrival and departure time of the order is inconsistent", "Others"],
    note: "If the guest indicates that the order arrangement is inconsistent, please provide the guest's room number, room type/bed type and other relevant information.",
  },
  "Hotel Problems": {
    options: ["Facility damage", "Poor sanitary conditions", "Poor service attitude"],
  },
  "Room rate problem": {
    options: ["Rate higher than booking confirmation", "Extra charges applied", "Deposit not refunded", "Others"],
  },
  "No reservation found": {
    options: ["Hotel has no record of the booking", "Confirmation code not recognized", "Guest name mismatch"],
  },
  "Apply for early departure": {
    options: ["Medical emergency", "Change of travel plans", "Hotel service issue", "Others"],
  },
  "Invoice issues": {
    options: ["Invoice not received", "Incorrect amount", "Wrong company name", "Missing tax ID", "Others"],
  },
};

export default function CreateTicketDialog({ open, onOpenChange, bookingCode, hotelName }: CreateTicketDialogProps) {
  const navigate = useNavigate();
  const { addTicket } = useTickets();
  const [arrivalStatus, setArrivalStatus] = useState<ArrivalStatus>("Arrived in store");
  const [category, setCategory] = useState<ProblemCategory | null>(null);
  const [subOption, setSubOption] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);

  const reset = () => {
    setArrivalStatus("Arrived in store");
    setCategory(null);
    setSubOption("");
    setNotes("");
    setAttachments([]);
  };

  const handleSubmit = () => {
    if (!category) {
      toast.error("Please select a problem category");
      return;
    }
    if (subOptions[category] && !subOption) {
      toast.error("Please specify the issue");
      return;
    }
    const newTicket = addTicket({
      bookingId: bookingCode || "N/A",
      hotelName: hotelName || "Unknown",
      guestName: "Current User",
      category,
      subOption,
      arrivalStatus,
      notes,
      attachments,
    });
    toast.success(`Ticket ${newTicket.id} created!`, {
      description: "View in Tickets page",
      action: { label: "View", onClick: () => navigate(`/app/tickets?highlight=${newTicket.id}`) },
    });
    reset();
    onOpenChange(false);
  };

  const currentSubOpts = category ? subOptions[category] : null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" style={{ maxWidth: "700px", width: "90vw" }}>
        <DialogHeader>
          <DialogTitle>Create a new ticket</DialogTitle>
        </DialogHeader>

        {bookingCode && (
          <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-md text-sm">
            <span className="text-muted-foreground">Booking:</span>
            <span className="font-mono font-medium text-[#0066cc]">{bookingCode}</span>
            {hotelName && <>
              <span className="text-muted-foreground">·</span>
              <span className="font-medium">{hotelName}</span>
            </>}
          </div>
        )}

        {/* Arrival Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium"><span className="text-red-500">*</span> Your arrival status</label>
          <select value={arrivalStatus} onChange={e => setArrivalStatus(e.target.value as ArrivalStatus)} className="border rounded px-3 py-2 text-sm bg-background w-48" aria-label="Arrival status">
            <option>Not in store</option>
            <option>Arrived in store</option>
            <option>Checked out</option>
          </select>
        </div>

        {/* Problem Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium"><span className="text-red-500">*</span> The problem you encounter</label>
          <div className="flex flex-wrap gap-2">
            {problemCategories.map(cat => (
              <button key={cat} type="button" onClick={() => { setCategory(cat); setSubOption(""); }}
                className={`border rounded px-3 py-1.5 text-xs transition-colors ${category === cat ? "border-red-500 text-red-500 bg-red-50 dark:bg-red-950/20 font-medium" : "hover:bg-muted/50"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Category note */}
        {category && currentSubOpts?.note && (
          <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-900/20">
            <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">{currentSubOpts.note}</AlertDescription>
          </Alert>
        )}

        {/* Sub-options */}
        {category && currentSubOpts && (
          <div className="space-y-2">
            <label className="text-sm font-medium"><span className="text-red-500">*</span> Specific question content</label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {currentSubOpts.options.map(opt => (
                <label key={opt} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="radio" name="subOption" checked={subOption === opt} onChange={() => setSubOption(opt)} className="accent-[#FF6000]" />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes explaining the reason</label>
          <div className="relative">
            <Textarea value={notes} onChange={e => setNotes(e.target.value.slice(0, 500))} rows={4} placeholder="" className="resize-none" />
            <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">{notes.length}/500</span>
          </div>
        </div>

        {/* Attachments */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Upload attachments</label>
          <div className="flex gap-2 flex-wrap">
            {attachments.map((name, i) => (
              <div key={i} className="flex items-center gap-1 px-2 py-1 border rounded text-xs bg-muted/30">
                <span className="truncate max-w-[120px]">{name}</span>
                <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
              </div>
            ))}
            <button onClick={() => { const name = `file-${attachments.length + 1}.jpg`; setAttachments(prev => [...prev, name]); toast.success(`Attached: ${name}`); }} className="w-16 h-16 border-2 border-dashed rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[#FF6000] transition-colors">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* AI Chatbot hint */}
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/10">
          <AlertDescription className="text-xs text-orange-700 dark:text-orange-300">
            💬 <strong>Coming soon</strong>: AI chatbot will assist you in real-time for faster resolution. Stay tuned!
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          <Button style={{ background: "#DC2626" }} className="text-white hover:opacity-90" onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
