import { useNavigate } from "react-router";
import { Download, Mail, CalendarCheck, Plus, Check, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useScreenState } from "@/hooks/useScreenState";
import { StateToolbar } from "@/components/StateToolbar";
import { hotels } from "@/mocks/hotels";
import { getRoomsByHotel } from "@/mocks/rooms";
import { toast } from "sonner";

const FORM_STORAGE_KEY = "dotbiz_booking_form";

function loadFormData() {
  try {
    const saved = sessionStorage.getItem(FORM_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

export default function BookingCompletePage() {
  const { state, setState } = useScreenState("success");
  const navigate = useNavigate();

  /* Read booking data from sessionStorage */
  const hotelId = sessionStorage.getItem("dotbiz_booking_hotel") || "htl-007";
  const roomId = sessionStorage.getItem("dotbiz_booking_room") || "";
  const checkIn = sessionStorage.getItem("dotbiz_booking_checkin") || "2026-04-22";
  const checkOut = sessionStorage.getItem("dotbiz_booking_checkout") || "2026-04-23";

  const hotel = hotels.find(h => h.id === hotelId) || hotels[0];
  const allRooms = getRoomsByHotel(hotel.id);
  const room = allRooms.find(r => r.id === roomId) || allRooms[0];
  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  const totalPrice = room ? room.price * nights : 0;

  const formData = loadFormData();
  const guestName = formData?.travelers?.[0]
    ? `${formData.travelers[0].lastName} / ${formData.travelers[0].firstName}`
    : "Guest";
  const bookerEmail = formData?.bookerEmail || "";

  /* Generate a random ELLIS code */
  const ellisCode = `ELS-2026-${String(Math.floor(Math.random() * 90000) + 10000)}`;

  if (state === "loading") return (<div className="p-6 space-y-4"><Skeleton className="h-32 w-64 mx-auto" /><Skeleton className="h-64 w-full max-w-2xl mx-auto" /><StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">No Booking Found</h2><p className="text-muted-foreground mt-2">Start a new booking to see your confirmation.</p><Button className="mt-4" onClick={() => navigate("/app/find-hotel")}><Search className="h-4 w-4 mr-2" />Find Hotel</Button></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>Error</AlertTitle><AlertDescription>Failed to load booking confirmation. Please try again.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-green-600">Booking Confirmed!</h1>
        <p className="text-lg font-mono font-semibold">ELLIS Code: {ellisCode}</p>
        <Badge variant="default" className="text-sm">Confirmed</Badge>
      </div>

      {/* Booking Details */}
      <Card className="p-6 space-y-3">
        <h2 className="font-semibold mb-3">Booking Details</h2>
        {[
          { label: "Hotel", value: hotel.name },
          { label: "Check-in", value: checkIn },
          { label: "Check-out", value: `${checkOut} (${nights} night${nights > 1 ? "s" : ""})` },
          { label: "Room", value: room?.name || "Standard Room" },
          { label: "Guest", value: guestName },
        ].map(item => (
          <div key={item.label} className="flex justify-between py-1">
            <span className="text-muted-foreground">{item.label}</span>
            <span>{item.value}</span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span style={{ color: "#FF6000" }}>USD {totalPrice.toFixed(2)}</span>
        </div>
        <p className="text-xs text-muted-foreground text-right">USD {room?.price.toFixed(2)} x {nights} night{nights > 1 ? "s" : ""}</p>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="outline" onClick={() => toast.success("Voucher downloading...", { description: "Your booking voucher is being prepared." })}><Download className="h-4 w-4 mr-2" aria-hidden="true" />Download Voucher</Button>
        <Button variant="outline" onClick={() => toast.success("Voucher Sent", { description: `Voucher sent to ${bookerEmail || "guest email"}.` })}><Mail className="h-4 w-4 mr-2" aria-hidden="true" />Email Voucher</Button>
        <Button onClick={() => navigate("/app/bookings")}><CalendarCheck className="h-4 w-4 mr-2" aria-hidden="true" />My Bookings</Button>
        <Button onClick={() => navigate("/app/find-hotel")} style={{ background: "#FF6000" }}><Plus className="h-4 w-4 mr-2" aria-hidden="true" />New Booking</Button>
      </div>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
