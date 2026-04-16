import { useNavigate } from "react-router";
import { Download, Mail, CalendarCheck, Plus, Check, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useScreenState } from "@/hooks/useScreenState";
import { StateToolbar } from "@/components/StateToolbar";
import { toast } from "sonner";

export default function BookingCompletePage() {
  const { state, setState } = useScreenState("success");
  const navigate = useNavigate();

  if (state === "loading") return (<div className="p-6 space-y-4"><Skeleton className="h-32 w-64 mx-auto" /><Skeleton className="h-64 w-full max-w-2xl mx-auto" /><StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">No Booking Found</h2><p className="text-muted-foreground mt-2">Start a new booking to see your confirmation.</p><Button className="mt-4" onClick={() => navigate("/app/find-hotel")}><Search className="h-4 w-4 mr-2" />Find Hotel</Button></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>Error</AlertTitle><AlertDescription>Failed to load booking confirmation. Please try again.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-green-600">Booking Confirmed!</h1>
        <p className="text-lg font-mono font-semibold">ELLIS Code: ELS-2026-00180</p>
      </div>

      <Card className="p-6 space-y-3">
        <h2 className="font-semibold mb-3">Booking Details</h2>
        {[
          { label: "Hotel", value: "Grand Hyatt Seoul" },
          { label: "Dates", value: "Apr 10 - Apr 13 (3 nights)" },
          { label: "Room", value: "Deluxe King Room" },
          { label: "Guest", value: "John Smith" },
          { label: "Total", value: "$924.00", bold: true },
        ].map(item => (
          <div key={item.label} className="flex justify-between">
            <span className="text-muted-foreground">{item.label}</span>
            <span className={item.bold ? "font-bold" : ""}>{item.value}</span>
          </div>
        ))}
      </Card>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="outline" onClick={() => console.log("Download voucher")}><Download className="h-4 w-4 mr-2" aria-hidden="true" />Download Voucher</Button>
        <Button variant="outline" onClick={() => toast.success("Voucher Sent", { description: "The voucher has been sent to the guest email." })}><Mail className="h-4 w-4 mr-2" aria-hidden="true" />Email Voucher</Button>
        <Button onClick={() => navigate("/app/bookings")}><CalendarCheck className="h-4 w-4 mr-2" aria-hidden="true" />My Bookings</Button>
        <Button onClick={() => navigate("/app/find-hotel")}><Plus className="h-4 w-4 mr-2" aria-hidden="true" />New Booking</Button>
      </div>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
