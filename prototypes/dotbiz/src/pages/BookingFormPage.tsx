import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useScreenState } from "@/hooks/useScreenState";
import { useFormValidation } from "@/hooks/useFormValidation";
import { StateToolbar } from "@/components/StateToolbar";
import { useAuth } from "@/contexts/AuthContext";
import { currentCompany } from "@/mocks/companies";
import { hotels } from "@/mocks/hotels";
import { getRoomsByHotel } from "@/mocks/rooms";
import { toast } from "sonner";

const FORM_STORAGE_KEY = "dotbiz_booking_form";

function loadSavedForm() {
  try {
    const saved = sessionStorage.getItem(FORM_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

export default function BookingFormPage() {
  const { state, setState } = useScreenState("success");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { errors, validate } = useFormValidation();
  const { user } = useAuth();

  const saved = loadSavedForm();

  /* Booker — pre-filled from company registration data, restored from session */
  const [bookerName, setBookerName] = useState(saved?.bookerName ?? user?.name ?? currentCompany.name);
  const [bookerEmail, setBookerEmail] = useState(saved?.bookerEmail ?? user?.email ?? currentCompany.email);
  const [bookerMobile, setBookerMobile] = useState(saved?.bookerMobile ?? "");
  const [bookerCode, setBookerCode] = useState(saved?.bookerCode ?? "");
  const [mobileCountry, setMobileCountry] = useState(saved?.mobileCountry ?? "82");

  /* Travelers — restored from session */
  const [travelers, setTravelers] = useState(saved?.travelers ?? [
    { id: "t-1", room: 1, gender: "M", localName: "", lastName: "", firstName: "", childBirthday: "" },
    { id: "t-2", room: 1, gender: "M", localName: "", lastName: "", firstName: "", childBirthday: "" },
  ]);

  const updateTraveler = (idx: number, field: string, value: string) => {
    setTravelers(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  /* Special Requests — restored from session */
  const [specialReqs, setSpecialReqs] = useState<Set<string>>(new Set(saved?.specialReqs ?? []));
  const [customRequest, setCustomRequest] = useState(saved?.customRequest ?? "");
  const [expectedCheckIn, setExpectedCheckIn] = useState(saved?.expectedCheckIn ?? "");
  const toggleReq = (req: string) => setSpecialReqs(prev => { const n = new Set(prev); n.has(req) ? n.delete(req) : n.add(req); return n; });

  /* Auto-save form data to sessionStorage */
  useEffect(() => {
    const data = {
      bookerName, bookerEmail, bookerMobile, bookerCode, mobileCountry,
      travelers, specialReqs: Array.from(specialReqs), customRequest, expectedCheckIn,
    };
    sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
  }, [bookerName, bookerEmail, bookerMobile, bookerCode, mobileCountry, travelers, specialReqs, customRequest, expectedCheckIn]);

  /* Confirm dialog */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [travelerErrors, setTravelerErrors] = useState(false);

  /* Booking data from URL params or defaults */
  const hotelId = searchParams.get("hotel") || "htl-007";
  const roomId = searchParams.get("room") || "";
  const hotel = hotels.find(h => h.id === hotelId) || hotels[0];
  const allRooms = getRoomsByHotel(hotel.id);
  const room = allRooms.find(r => r.id === roomId) || allRooms[0];
  const checkIn = searchParams.get("checkin") || "2026-04-22";
  const checkOut = searchParams.get("checkout") || "2026-04-23";
  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  const totalPrice = room ? room.price * nights : 0;
  const isFreeCancel = room?.cancellationPolicy === "free_cancel";
  const freeCancelDate = isFreeCancel ? (() => { const d = new Date(checkIn); d.setDate(d.getDate() - 2); return d.toISOString().split("T")[0]; })() : "";

  const handleCreate = () => {
    const e1 = validate("bookerName", bookerName, { required: true, rules: [{ type: "required", message: "Name is required" }] });
    const e2 = validate("bookerEmail", bookerEmail, { required: true, rules: [{ type: "email", message: "Valid email required" }] });
    if (e1 || e2) { setFormError("Please fill in all required fields."); return; }
    const hasNames = travelers.every(t => t.lastName && t.firstName);
    if (!hasNames) { setFormError("Please enter Last Name and First Name for all travelers."); setTravelerErrors(true); return; }
    setFormError(null);
    setTravelerErrors(false);
    setConfirmOpen(true);
  };

  if (state === "loading") return (<div className="p-6 space-y-4"><Skeleton className="h-12 w-96" /><Skeleton className="h-80 w-full" /><StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">No Room Selected</h2><p className="text-muted-foreground mt-2">Please select a room from the hotel detail page.</p><Button className="mt-4" onClick={() => navigate("/app/find-hotel")}><Search className="h-4 w-4 mr-2" />Find Hotel</Button></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>Booking Error</AlertTitle><AlertDescription>An error occurred.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-5">
      {/* Header */}
      <div className="py-2" style={{ background: "linear-gradient(90deg, #1a1a2e, #16213e)", margin: "-24px -24px 0", padding: "12px 24px", borderRadius: "8px 8px 0 0" }}>
        <h1 className="text-lg font-bold text-white">Create Hotel Booking</h1>
      </div>

      {formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}

      {/* ── Booker ── */}
      <Card className="p-5">
        <h2 className="font-bold mb-4">Booker</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[#FF6000]">Name <span className="text-destructive">*</span></label>
            <Input value={bookerName} onChange={e => setBookerName(e.target.value)} className="mt-1" placeholder="Booker name" />
            {errors.bookerName && <p className="text-xs text-destructive mt-1">{errors.bookerName}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-[#FF6000]">Email address <span className="text-destructive">*</span></label>
            <Input type="email" value={bookerEmail} onChange={e => setBookerEmail(e.target.value)} className="mt-1" placeholder="email@company.com" />
            {errors.bookerEmail && <p className="text-xs text-destructive mt-1">{errors.bookerEmail}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-[#FF6000]">Mobile No</label>
            <div className="flex gap-2 mt-1">
              <Input value={mobileCountry} onChange={e => setMobileCountry(e.target.value)} className="w-16" />
              <Input value={bookerMobile} onChange={e => setBookerMobile(e.target.value)} placeholder="Number Only" className="flex-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Seller Booking Code</label>
            <Input value={bookerCode} onChange={e => setBookerCode(e.target.value)} className="mt-1" placeholder="Seller Booking Code" />
          </div>
        </div>
      </Card>

      {/* ── Booking Detail ── */}
      <Card className="p-5">
        <h2 className="font-bold mb-4">Booking Detail</h2>
        <Table>
          <TableBody>
            <TableRow><TableCell className="font-medium text-[#FF6000] w-48">Check in / Out Date</TableCell><TableCell>{checkIn} – {checkOut} [{nights}NTS]</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-[#FF6000]">Region name</TableCell><TableCell>{hotel.area.split(",").pop()?.trim()}</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-[#FF6000]">Hotel Name</TableCell><TableCell>{hotel.name}</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-[#FF6000]">Rooms/Travelers</TableCell><TableCell className="text-primary">1 Rooms / {travelers.length} Travelers</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-[#FF6000]">Room Type</TableCell><TableCell>{room?.name}</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-[#FF6000]">Bed Type</TableCell><TableCell>{room?.bedCount}</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-[#FF6000]">Breakfast</TableCell><TableCell className={room?.mealIncluded ? "text-green-600" : "text-primary"}>{room?.mealIncluded ? room.mealDetail : "NO Breakfast Service"}</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-[#FF6000]">Client Cancellation D/L</TableCell><TableCell className={isFreeCancel ? "text-green-600" : "text-red-500"}>{isFreeCancel ? `${freeCancelDate} Free cancellation available` : "Non-Refundable"}</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-[#FF6000]">Confirm Type</TableCell><TableCell>{room?.confirmType}</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-[#FF6000]">Plan Name</TableCell><TableCell>{room?.name}, Non Smoking</TableCell></TableRow>
          </TableBody>
        </Table>
      </Card>

      {/* ── Travelers ── */}
      <Card className="p-5">
        <h2 className="font-bold mb-4">Travelers</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Rooms</TableHead>
              <TableHead className="w-20">Gender</TableHead>
              <TableHead>Name(Local Language)</TableHead>
              <TableHead>Last Name / First Name (EN)</TableHead>
              <TableHead className="w-28">Child Birthday</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {travelers.map((t, i) => (
              <TableRow key={t.id}>
                <TableCell className="text-[#FF6000] font-medium">Room {t.room}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name={`gender-${i}`} checked={t.gender === "M"} onChange={() => updateTraveler(i, "gender", "M")} className="accent-[#FF6000]" /><span className="text-xs">M</span></label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name={`gender-${i}`} checked={t.gender === "F"} onChange={() => updateTraveler(i, "gender", "F")} className="accent-[#FF6000]" /><span className="text-xs">F</span></label>
                  </div>
                </TableCell>
                <TableCell><Input placeholder="Name(Local Language)" value={t.localName} onChange={e => updateTraveler(i, "localName", e.target.value)} className="text-xs" /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Input placeholder="Please enter only uppercas..." value={t.lastName} onChange={e => { updateTraveler(i, "lastName", e.target.value.toUpperCase()); setTravelerErrors(false); }} className={`text-xs flex-1 ${travelerErrors && !t.lastName ? "border-[#FF6000] ring-2 ring-[#FF6000]/30" : ""}`} />
                    <span className="text-muted-foreground">/</span>
                    <Input placeholder="Please enter only uppercase letters." value={t.firstName} onChange={e => { updateTraveler(i, "firstName", e.target.value.toUpperCase()); setTravelerErrors(false); }} className={`text-xs flex-1 ${travelerErrors && !t.firstName ? "border-[#FF6000] ring-2 ring-[#FF6000]/30" : ""}`} />
                  </div>
                </TableCell>
                <TableCell>
                  {parseInt(searchParams.get("children") || "0") > 0 ? (
                    <Input type="date" value={t.childBirthday} onChange={e => updateTraveler(i, "childBirthday", e.target.value)} className="text-xs" aria-label="Child birthday" />
                  ) : (
                    <Input type="date" disabled className="text-xs opacity-30" aria-label="Child birthday (no children)" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* ── Special Request ── */}
      <Card className="p-5">
        <h2 className="font-bold mb-4">Special Request</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {["non-smoking room", "smoking room", "High floor room", "Baby Cot(The property may charge a fee for this request)", "Late Check In"].map(req => (
            <label key={req} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={specialReqs.has(req)} onCheckedChange={() => toggleReq(req)} />
              <span className="text-sm text-primary">{req}</span>
            </label>
          ))}
          <div>
            <select aria-label="Expected check-in time" value={expectedCheckIn} onChange={e => setExpectedCheckIn(e.target.value)} className="border rounded px-3 py-1.5 text-sm bg-background">
              <option value="">Expected Check In Time</option>
              {["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <Textarea placeholder="Client special request (in English)" value={customRequest} onChange={e => setCustomRequest(e.target.value)} rows={4} />
      </Card>

      {/* ── Billing Rate ── */}
      <Card className="p-5">
        <h2 className="font-bold mb-3">Billing Rate</h2>
        <div className="text-right">
          <p className="text-xl font-bold" style={{ color: "#FF6000" }}>USD {totalPrice.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">USD {room?.price.toFixed(2)} x {nights} night{nights > 1 ? "s" : ""}</p>
        </div>
      </Card>

      {/* ── Notice ── */}
      <Card className="p-5">
        <h2 className="font-bold mb-3">Notice</h2>
        <div className="space-y-2">
          <h3 className="text-sm font-bold">Things to know</h3>
          <p className="text-xs text-muted-foreground">The above list may not be comprehensive. Fees and deposits may not include tax and are subject to change.</p>
          <p className="text-xs text-muted-foreground">• Additional charges may apply for extra beds or early check-in/late check-out.</p>
          <p className="text-xs text-muted-foreground">• Please present valid government-issued photo identification at check-in.</p>
        </div>
      </Card>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-3 pb-4">
        <Button onClick={handleCreate} style={{ background: "#FF6000" }} className="px-8">Create</Button>
        <Button variant="outline" onClick={() => navigate(-1)}>Close</Button>
      </div>

      {/* ── Confirm Dialog ── */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm</AlertDialogTitle>
            <AlertDialogDescription className="text-[#FF6000]">Are you sure you want to create this booking?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => { sessionStorage.setItem("dotbiz_booking_hotel", hotelId); sessionStorage.setItem("dotbiz_booking_room", roomId); sessionStorage.setItem("dotbiz_booking_checkin", checkIn); sessionStorage.setItem("dotbiz_booking_checkout", checkOut); toast.success("Booking created!", { description: "Redirecting to review..." }); navigate("/app/booking/confirm"); }} style={{ background: "#FF6000" }}>Confirm</AlertDialogAction>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
