import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CreditCard, Lock, Shield, Loader2, Check, Trash2 } from "lucide-react";

export interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiry: string;
  holderName: string;
}

const CARDS_KEY = "dotbiz_saved_cards";

export function getSavedCards(): SavedCard[] {
  try { const s = localStorage.getItem(CARDS_KEY); return s ? JSON.parse(s) : []; }
  catch { return []; }
}

export function saveCard(card: SavedCard) {
  const cards = getSavedCards();
  cards.push(card);
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

export function removeCard(id: string) {
  const cards = getSavedCards().filter(c => c.id !== id);
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

function detectBrand(num: string): string {
  const d = num.replace(/\s/g, "");
  if (d.startsWith("4")) return "Visa";
  if (d.startsWith("5") || d.startsWith("2")) return "Mastercard";
  if (d.startsWith("3")) return "Amex";
  if (d.startsWith("6")) return "Discover";
  return "Card";
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  currency?: string;
  onPaymentComplete: () => void;
}

export default function PaymentDialog({ open, onOpenChange, amount, currency = "USD", onPaymentComplete }: PaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [saveCardCheck, setSaveCardCheck] = useState(true);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      setSavedCards(getSavedCards());
      setSelectedCardId(null);
      setCardNumber(""); setExpiry(""); setCvv(""); setName("");
      setSaveCardCheck(true);
      setShowSaveConfirm(false);
    }
  }, [open]);

  // Auto-select first saved card if available
  useEffect(() => {
    if (savedCards.length > 0 && !selectedCardId) setSelectedCardId(savedCards[0].id);
  }, [savedCards, selectedCardId]);

  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handlePay = () => {
    // If using new card and no saved cards yet, ask to save
    if (!selectedCardId && saveCardCheck && cardNumber.length >= 15) {
      setShowSaveConfirm(true);
      return;
    }
    processPayment(false);
  };

  const processPayment = (doSave: boolean) => {
    setShowSaveConfirm(false);
    setLoading(true);

    if (doSave && cardNumber) {
      const digits = cardNumber.replace(/\s/g, "");
      const newCard: SavedCard = {
        id: `card-${Date.now()}`,
        last4: digits.slice(-4),
        brand: detectBrand(digits),
        expiry,
        holderName: name,
      };
      saveCard(newCard);
      toast.info(`Card ending in ${newCard.last4} saved for future use.`);
    }

    setTimeout(() => {
      setLoading(false);
      onOpenChange(false);
      toast.success("Payment completed successfully!", { description: "Booking confirmed. Redirecting..." });
      setTimeout(() => onPaymentComplete(), 300);
    }, 2000);
  };

  const useNewCard = selectedCardId === null || selectedCardId === "new";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#FF6000]" />Secure Payment
          </DialogTitle>
        </DialogHeader>

        <div className="text-center py-2">
          <p className="text-2xl font-bold text-[#FF6000]">Total: {currency} {amount.toLocaleString()}</p>
        </div>

        {/* Saved cards */}
        {savedCards.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Saved Cards</p>
            {savedCards.map(card => (
              <button key={card.id} onClick={() => setSelectedCardId(card.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${selectedCardId === card.id ? "border-[#FF6000] bg-orange-50 dark:bg-orange-900/10" : "hover:bg-muted/50"}`}>
                <CreditCard className="h-5 w-5 text-[#FF6000] shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{card.brand} •••• {card.last4}</p>
                  <p className="text-xs text-muted-foreground">{card.holderName} · Exp {card.expiry}</p>
                </div>
                {selectedCardId === card.id && <Check className="h-4 w-4 text-[#FF6000]" />}
              </button>
            ))}
            <button onClick={() => setSelectedCardId("new")}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${useNewCard && selectedCardId === "new" ? "border-[#FF6000] bg-orange-50 dark:bg-orange-900/10" : "hover:bg-muted/50"}`}>
              <CreditCard className="h-5 w-5 text-muted-foreground shrink-0" />
              <p className="text-sm">Use a new card</p>
            </button>
            <Separator />
          </div>
        )}

        {/* New card form — show if no saved cards or "new card" selected */}
        {(savedCards.length === 0 || selectedCardId === "new") && (
          <div className="space-y-3">
            {savedCards.length > 0 && <p className="text-sm font-medium">New Card Details</p>}
            <Input placeholder="1234 5678 9012 3456" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} maxLength={19} aria-label="Card number" />
            <div className="flex gap-3">
              <Input placeholder="MM/YY" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} maxLength={5} className="flex-1" aria-label="Expiry date" />
              <Input placeholder="CVV" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))} maxLength={3} className="w-24" type="password" aria-label="CVV" />
            </div>
            <Input placeholder="Cardholder Name" value={name} onChange={e => setName(e.target.value)} aria-label="Cardholder name" />
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={saveCardCheck} onCheckedChange={c => setSaveCardCheck(!!c)} />
              <span className="text-sm">Save this card for future payments</span>
            </label>
          </div>
        )}

        {/* CVV for saved card */}
        {savedCards.length > 0 && selectedCardId && selectedCardId !== "new" && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Enter CVV to confirm</p>
            <Input placeholder="CVV" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))} maxLength={3} className="w-24" type="password" aria-label="CVV for saved card" />
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground py-1">
          <Shield className="h-3.5 w-3.5" />Powered by DOTBIZ Payment Gateway
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button className="bg-[#FF6000] hover:bg-[#e55500] text-white" onClick={handlePay} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Pay {currency} {amount.toLocaleString()}
          </Button>
        </DialogFooter>

        <p className="text-[11px] text-muted-foreground text-center">Your payment is encrypted and secure.</p>

        {/* Save card confirmation dialog */}
        {showSaveConfirm && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-lg flex items-center justify-center p-6 z-10">
            <div className="text-center space-y-4">
              <CreditCard className="h-10 w-10 text-[#FF6000] mx-auto" />
              <h3 className="font-bold">Save this card?</h3>
              <p className="text-sm text-muted-foreground">Card ending in {cardNumber.replace(/\s/g, "").slice(-4)} will be saved for future bookings.</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => processPayment(false)}>No, just pay</Button>
                <Button style={{ background: "#FF6000" }} onClick={() => processPayment(true)}>Yes, save & pay</Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
