import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useScreenState } from "@/hooks/useScreenState";
import { StateToolbar } from "@/components/StateToolbar";
import { toast } from "sonner";

export default function BookingConfirmPage() {
  const { state, setState } = useScreenState("success");
  const navigate = useNavigate();
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!termsAgreed) {
      setTermsError("You must agree to the terms to confirm the booking");
      return;
    }
    toast.success("Booking Confirmed", { description: "Your booking has been confirmed successfully." });
    navigate("/app/booking/complete");
  };

  if (state === "loading") return (<div className="p-6 space-y-4"><Skeleton className="h-12 w-96 mx-auto" /><Skeleton className="h-64 w-full" /><Skeleton className="h-32 w-full" /><StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">No Booking Data</h2><p className="text-muted-foreground mt-2">Please complete the booking form first.</p><Button className="mt-4" onClick={() => navigate("/app/booking/form")}>Go to Booking Form</Button></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>Confirmation Error</AlertTitle><AlertDescription>Failed to confirm booking. Please try again.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-center gap-4 py-4">
        <Badge variant="secondary">1. Guest Info</Badge>
        <Badge variant="default">2. Review</Badge>
        <Badge variant="secondary">3. Complete</Badge>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Booking Review</h2>
        {[
          { label: "Hotel", value: "Grand Hyatt Seoul" },
          { label: "Dates", value: "Apr 10 - Apr 13 (3 nights)" },
          { label: "Room", value: "Deluxe King Room" },
          { label: "Guest", value: "John Smith" },
        ].map(item => (
          <div key={item.label} className="space-y-1">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="font-medium">{item.value}</p>
          </div>
        ))}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Price Details</h2>
        <div className="flex justify-between"><span>Room Rate</span><span>$840.00</span></div>
        <div className="flex justify-between"><span>Tax</span><span>$84.00</span></div>
        <Separator className="my-3" />
        <div className="flex justify-between font-bold text-lg"><span>Total</span><span>$924.00</span></div>
      </Card>

      <Alert>
        <AlertTitle>Cancellation Policy</AlertTitle>
        <AlertDescription>Free cancellation until 24 hours before check-in. After that, 1 night charge applies.</AlertDescription>
      </Alert>

      <div className="flex items-center gap-2">
        <Checkbox id="terms" checked={termsAgreed} onCheckedChange={c => { setTermsAgreed(!!c); setTermsError(null); }} />
        <label htmlFor="terms" className="text-sm">I agree to the Terms & Conditions <span className="text-destructive">*</span></label>
      </div>
      {termsError && <p className="text-sm text-destructive">{termsError}</p>}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate("/app/booking/form")}><ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />Back</Button>
        <Button onClick={handleConfirm}><Check className="h-4 w-4 mr-2" aria-hidden="true" />Confirm Booking</Button>
      </div>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
