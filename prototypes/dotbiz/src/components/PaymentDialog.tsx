import { useState } from "react";
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
import { toast } from "sonner";
import { CreditCard, Lock, Shield, Loader2 } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  currency?: string;
  onPaymentComplete: () => void;
}

export default function PaymentDialog({
  open,
  onOpenChange,
  amount,
  currency = "USD",
  onPaymentComplete,
}: PaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"card" | "bank">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

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
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Payment completed successfully!");
      onPaymentComplete();
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#FF6000]" />
            Secure Payment
          </DialogTitle>
        </DialogHeader>

        <div className="text-center py-2">
          <p className="text-2xl font-bold text-[#FF6000]">
            Total: {currency} {amount.toLocaleString()}
          </p>
        </div>

        {/* Payment method tabs */}
        <div className="flex gap-2">
          <Button
            variant={tab === "card" ? "default" : "outline"}
            size="sm"
            className={tab === "card" ? "bg-[#FF6000] hover:bg-[#e55500]" : ""}
            onClick={() => setTab("card")}
          >
            <CreditCard className="h-4 w-4 mr-1" /> Credit Card
          </Button>
          <Button variant="outline" size="sm" disabled>
            Bank Transfer
            <Badge variant="secondary" className="ml-1 text-[10px] px-1">
              Soon
            </Badge>
          </Button>
        </div>

        {/* Card form */}
        <div className="space-y-3">
          <Input
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
          />
          <div className="flex gap-3">
            <Input
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              maxLength={5}
              className="flex-1"
            />
            <Input
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
              maxLength={3}
              className="w-24"
              type="password"
            />
          </div>
          <Input
            placeholder="Cardholder Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* PG provider */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground py-1">
          <Shield className="h-3.5 w-3.5" />
          Powered by DOTBIZ Payment Gateway
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            className="bg-[#FF6000] hover:bg-[#e55500] text-white"
            onClick={handlePay}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Pay {currency} {amount.toLocaleString()}
          </Button>
        </DialogFooter>

        <p className="text-[11px] text-muted-foreground text-center">
          Your payment is encrypted and secure. We do not store card details.
        </p>
      </DialogContent>
    </Dialog>
  );
}
