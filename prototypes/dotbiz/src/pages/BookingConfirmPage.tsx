import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Check, RefreshCw, BedDouble, Users, Coffee, Ban, CalendarDays, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useScreenState } from "@/hooks/useScreenState";
import { StateToolbar } from "@/components/StateToolbar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { currentCompany } from "@/mocks/companies";
import { hotels } from "@/mocks/hotels";
import { getRoomsByHotel } from "@/mocks/rooms";

const FORM_STORAGE_KEY = "dotbiz_booking_form";

function loadFormData() {
  try {
    const saved = sessionStorage.getItem(FORM_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

export default function BookingConfirmPage() {
  const { state, setState } = useScreenState("success");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const billingType = user?.billingType || "POSTPAY";
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  /* Load saved form data */
  const formData = loadFormData();

  /* Booking data from URL params or sessionStorage */
  const hotelId = searchParams.get("hotel") || sessionStorage.getItem("dotbiz_booking_hotel") || "htl-007";
  const roomId = searchParams.get("room") || sessionStorage.getItem("dotbiz_booking_room") || "";
  const checkIn = searchParams.get("checkin") || sessionStorage.getItem("dotbiz_booking_checkin") || "2026-04-22";
  const checkOut = searchParams.get("checkout") || sessionStorage.getItem("dotbiz_booking_checkout") || "2026-04-23";

  const hotel = hotels.find(h => h.id === hotelId) || hotels[0];
  const allRooms = getRoomsByHotel(hotel.id);
  const room = allRooms.find(r => r.id === roomId) || allRooms[0];
  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  const totalPrice = room ? room.price * nights : 0;
  const isFreeCancel = room?.cancellationPolicy === "free_cancel";
  const freeCancelDate = isFreeCancel ? (() => { const d = new Date(checkIn); d.setDate(d.getDate() - 2); return d.toISOString().split("T")[0]; })() : "";

  /* Traveler info */
  const travelers = formData?.travelers || [];
  const bookerName = formData?.bookerName || "N/A";
  const bookerEmail = formData?.bookerEmail || "N/A";
  const bookerMobile = formData?.bookerMobile || "";
  const mobileCountry = formData?.mobileCountry || "82";
  const bookerCode = formData?.bookerCode || "";

  /* Special requests */
  const specialReqs: string[] = formData?.specialReqs || [];
  const customRequest = formData?.customRequest || "";
  const expectedCheckIn = formData?.expectedCheckIn || "";

  const handleConfirm = () => {
    if (!termsAgreed) {
      setTermsError("You must agree to the terms to confirm the booking");
      return;
    }
    sessionStorage.removeItem(FORM_STORAGE_KEY);
    toast.success("Booking Confirmed", { description: "Your booking has been confirmed successfully." });
    navigate("/app/booking/complete");
  };

  if (state === "loading") return (<div className="p-6 space-y-4"><Skeleton className="h-12 w-96 mx-auto" /><Skeleton className="h-64 w-full" /><Skeleton className="h-32 w-full" /><StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">No Booking Data</h2><p className="text-muted-foreground mt-2">Please complete the booking form first.</p><Button className="mt-4" onClick={() => navigate("/app/booking/form")}>Go to Booking Form</Button></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>Confirmation Error</AlertTitle><AlertDescription>Failed to confirm booking. Please try again.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-4 py-4">
        <Badge variant="secondary">1. Guest Info</Badge>
        <Badge variant="default" style={{ background: "#FF6000" }}>2. Review</Badge>
        <Badge variant="secondary">3. Complete</Badge>
      </div>

      {/* Header */}
      <div className="py-2" style={{ background: "linear-gradient(90deg, #1a1a2e, #16213e)", margin: "0 -24px", padding: "12px 24px", borderRadius: "8px" }}>
        <h1 className="text-lg font-bold text-white">Booking Review</h1>
      </div>

      {/* ── Booker ── */}
      <Card className="p-5">
        <h2 className="font-bold mb-3">Booker Information</h2>
        <Table>
          <TableBody>
            <TableRow><TableCell className="font-medium text-[#FF6000] w-48">Name</TableCell><TableCell>{bookerName}</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-[#FF6000]">Email</TableCell><TableCell>{bookerEmail}</TableCell></TableRow>
            {bookerMobile && <TableRow><TableCell className="font-medium text-[#FF6000]">Mobile</TableCell><TableCell>+{mobileCountry} {bookerMobile}</TableCell></TableRow>}
            {bookerCode && <TableRow><TableCell className="font-medium text-[#FF6000]">Hotel Confirmation No.</TableCell><TableCell>{bookerCode}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      {/* ── Booking Detail ── */}
      <Card className="p-5">
        <h2 className="font-bold mb-3">Booking Detail</h2>
        <Table>
          <TableBody>
            <TableRow><TableCell className="font-medium text-[#FF6000] w-48">Check in / Out Date</TableCell><TableCell>{checkIn} – {checkOut} [{nights}NTS]</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-[#FF6000]">Region name</TableCell><TableCell>{hotel.area.split(",").pop()?.trim()}</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-[#FF6000]">Hotel Name</TableCell><TableCell className="font-medium">{hotel.name}</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-[#FF6000]">Rooms/Travelers</TableCell><TableCell className="text-primary">1 Rooms / {travelers.length || 2} Travelers</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-[#FF6000]">Room Type</TableCell><TableCell>{room?.name}</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-[#FF6000]">Bed Type</TableCell><TableCell>{room?.bedCount}</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-[#FF6000]">Breakfast</TableCell><TableCell className={room?.mealIncluded ? "text-green-600" : "text-primary"}>{room?.mealIncluded ? room.mealDetail : "NO Breakfast Service"}</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-[#FF6000]">Client Cancellation D/L</TableCell><TableCell className={isFreeCancel ? "text-green-600" : "text-red-500"}>{isFreeCancel ? `${freeCancelDate} Free cancellation available` : "Non-Refundable"}</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-[#FF6000]">Confirm Type</TableCell><TableCell>{room?.confirmType}</TableCell></TableRow>
          </TableBody>
        </Table>
      </Card>

      {/* ── Travelers ── */}
      <Card className="p-5">
        <h2 className="font-bold mb-3">Travelers</h2>
        {travelers.length > 0 ? (
          <Table>
            <TableBody>
              {travelers.map((t: { id: string; room: number; gender: string; localName: string; lastName: string; firstName: string }, i: number) => (
                <TableRow key={t.id || i}>
                  <TableCell className="font-medium text-[#FF6000] w-32">Room {t.room}</TableCell>
                  <TableCell className="w-16">{t.gender === "M" ? "Male" : "Female"}</TableCell>
                  <TableCell>
                    <span className="font-medium">{t.lastName} / {t.firstName}</span>
                    {t.localName && <span className="text-muted-foreground ml-2">({t.localName})</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No traveler information</p>
        )}
      </Card>

      {/* ── Special Requests ── */}
      {(specialReqs.length > 0 || customRequest || expectedCheckIn) && (
        <Card className="p-5">
          <h2 className="font-bold mb-3">Special Request</h2>
          {specialReqs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {specialReqs.map((req: string) => (
                <Badge key={req} variant="outline" className="text-xs">{req}</Badge>
              ))}
            </div>
          )}
          {expectedCheckIn && (
            <p className="text-sm mb-2"><span className="text-[#FF6000] font-medium">Expected Check-In Time:</span> {expectedCheckIn}</p>
          )}
          {customRequest && (
            <div className="mt-2 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Client Request:</p>
              <p className="text-sm">{customRequest}</p>
            </div>
          )}
        </Card>
      )}

      {/* ── Billing Rate ── */}
      <Card className="p-5">
        <h2 className="font-bold mb-3">Billing Rate</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Room Rate (USD {room?.price.toFixed(2)} x {nights} night{nights > 1 ? "s" : ""})</span>
            <span>USD {totalPrice.toFixed(2)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span style={{ color: "#FF6000" }}>USD {totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* ── Settlement Info ── */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={billingType === "PREPAY" ? "destructive" : "default"} className="text-xs">{billingType}</Badge>
          {billingType === "POSTPAY" && <span className="text-xs text-muted-foreground">Settlement: {currentCompany.settlementCycle} · Net-{currentCompany.paymentDueDays}</span>}
        </div>
        <p className="text-xs text-muted-foreground">
          {billingType === "POSTPAY"
            ? "This booking will be settled in your next billing cycle."
            : isFreeCancel
              ? `Payment required by ${freeCancelDate}. Booking will be cancelled if not paid.`
              : "Payment received. Booking confirmed."}
        </p>
      </Card>

      {/* ── Cancellation & Modification Policy ── */}
      <Alert>
        <AlertTitle>Cancellation & Modification Policy</AlertTitle>
        <AlertDescription className="space-y-1">
          <p>{isFreeCancel
            ? `Free cancellation until ${freeCancelDate}. After that, 1 night charge applies.`
            : "This booking is non-refundable. No cancellation or modification allowed."}</p>
          <p className="font-medium">Bookings cannot be modified. Please cancel and rebook if changes are needed.</p>
          <p>For special requests, please submit a ticket.</p>
        </AlertDescription>
      </Alert>

      {/* ── Terms ── */}
      <div className="flex items-center gap-2">
        <Checkbox id="terms" checked={termsAgreed} onCheckedChange={c => { setTermsAgreed(!!c); setTermsError(null); }} />
        <label htmlFor="terms" className="text-sm">I agree to the Terms & Conditions <span className="text-destructive">*</span></label>
      </div>
      {termsError && <p className="text-sm text-destructive">{termsError}</p>}

      {/* ── Actions ── */}
      <div className="flex justify-between pb-4">
        <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />Back to Edit</Button>
        <Button onClick={handleConfirm} style={{ background: "#FF6000" }} className="px-8"><Check className="h-4 w-4 mr-2" aria-hidden="true" />Confirm Booking</Button>
      </div>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
