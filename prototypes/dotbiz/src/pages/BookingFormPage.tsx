import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, RefreshCw, Search, CreditCard, AlertTriangle } from "lucide-react";
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
import { userPointsState, hotelPointsBoost, estimatedElsForBooking, companyPoolFor, ELS_REDEEM_AT_BOOKING_POLICY } from "@/mocks/rewards";
import { currentCompany } from "@/mocks/companies";
import { hotels } from "@/mocks/hotels";
import { getRoomsByHotel } from "@/mocks/rooms";
import PaymentDialog from "@/components/PaymentDialog";
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

  /* Booker — pre-filled from company registration data, restored from session */
  const [bookerName, setBookerName] = useState(() => { const s = loadSavedForm(); return s?.bookerName ?? user?.name ?? currentCompany.name; });
  const [bookerEmail, setBookerEmail] = useState(() => { const s = loadSavedForm(); return s?.bookerEmail ?? user?.email ?? currentCompany.email; });
  const [bookerMobile, setBookerMobile] = useState(() => loadSavedForm()?.bookerMobile ?? "");
  const [bookerCode, setBookerCode] = useState(() => loadSavedForm()?.bookerCode ?? "");
  const [mobileCountry, setMobileCountry] = useState(() => loadSavedForm()?.mobileCountry ?? "82");

  /* Travelers — restored from session.
   * nationality 필드는 게스트별 optional (1인 1국적). 마케팅 분석 목적. */
  const [travelers, setTravelers] = useState(() => {
    const s = loadSavedForm();
    return s?.travelers ?? [
      { id: "t-1", room: 1, gender: "M", localName: "", lastName: "", firstName: "", childBirthday: "", nationality: "" },
      { id: "t-2", room: 1, gender: "M", localName: "", lastName: "", firstName: "", childBirthday: "", nationality: "" },
    ];
  });

  const updateTraveler = (idx: number, field: string, value: string) => {
    setTravelers(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  /* Special Requests — restored from session */
  const [specialReqs, setSpecialReqs] = useState<Set<string>>(() => new Set(loadSavedForm()?.specialReqs ?? []));
  const [customRequest, setCustomRequest] = useState(() => loadSavedForm()?.customRequest ?? "");
  const [expectedCheckIn, setExpectedCheckIn] = useState(() => loadSavedForm()?.expectedCheckIn ?? "");
  const toggleReq = (req: string) => setSpecialReqs(prev => { const n = new Set(prev); n.has(req) ? n.delete(req) : n.add(req); return n; });

  /* Confirm dialog */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [travelerErrors, setTravelerErrors] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  /* Billing type from ELLIS (via auth context) */
  const billingType = user?.billingType || "POSTPAY";

  /* Booking data from URL params → sessionStorage fallback → defaults */
  const hotelId = searchParams.get("hotel") || sessionStorage.getItem("dotbiz_booking_hotel") || "htl-007";
  const roomId = searchParams.get("room") || sessionStorage.getItem("dotbiz_booking_room") || "";
  const hotel = hotels.find(h => h.id === hotelId) || hotels[0];
  const allRooms = getRoomsByHotel(hotel.id);
  const room = allRooms.find(r => r.id === roomId) || allRooms[0];
  const checkIn = searchParams.get("checkin") || sessionStorage.getItem("dotbiz_booking_checkin") || "2026-04-22";
  const checkOut = searchParams.get("checkout") || sessionStorage.getItem("dotbiz_booking_checkout") || "2026-04-23";

  /* Auto-save form data + booking params to sessionStorage */
  useEffect(() => {
    const data = {
      bookerName, bookerEmail, bookerMobile, bookerCode, mobileCountry,
      travelers, specialReqs: Array.from(specialReqs), customRequest, expectedCheckIn,
    };
    sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
    sessionStorage.setItem("dotbiz_booking_hotel", hotelId);
    sessionStorage.setItem("dotbiz_booking_room", roomId);
    sessionStorage.setItem("dotbiz_booking_checkin", checkIn);
    sessionStorage.setItem("dotbiz_booking_checkout", checkOut);
  }, [bookerName, bookerEmail, bookerMobile, bookerCode, mobileCountry, travelers, specialReqs, customRequest, expectedCheckIn, hotelId, roomId, checkIn, checkOut]);
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
            <label className="text-sm font-medium">Hotel Confirmation No.</label>
            <Input value={bookerCode} onChange={e => setBookerCode(e.target.value)} className="mt-1" placeholder="Hotel Confirmation No." />
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
              <TableHead>Name (Local Language)</TableHead>
              <TableHead>Last Name / First Name (EN)</TableHead>
              <TableHead className="w-36">Nationality</TableHead>
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
                <TableCell><Input placeholder="Name (Local Language)" value={t.localName} onChange={e => updateTraveler(i, "localName", e.target.value)} className="text-xs" /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Input placeholder="Please enter only uppercas..." value={t.lastName} onChange={e => { updateTraveler(i, "lastName", e.target.value.toUpperCase()); setTravelerErrors(false); }} className={`text-xs flex-1 ${travelerErrors && !t.lastName ? "border-[#FF6000] ring-2 ring-[#FF6000]/30" : ""}`} />
                    <span className="text-muted-foreground">/</span>
                    <Input placeholder="Please enter only uppercase letters." value={t.firstName} onChange={e => { updateTraveler(i, "firstName", e.target.value.toUpperCase()); setTravelerErrors(false); }} className={`text-xs flex-1 ${travelerErrors && !t.firstName ? "border-[#FF6000] ring-2 ring-[#FF6000]/30" : ""}`} />
                  </div>
                </TableCell>
                <TableCell>
                  {/* 자유 입력 — select 대신 text input. 빈 칸으로 시작, OP가 직접 타이핑.
                   * 일부 호텔에서 비표준 표기를 요구할 수 있어 enum 강제하지 않음. */}
                  <Input
                    placeholder=""
                    value={t.nationality || ""}
                    onChange={e => updateTraveler(i, "nationality", e.target.value)}
                    className="text-xs"
                  />
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

      {/* ── Expected ELS (rewards preview) ── */}
      {(() => {
        const boost = hotel ? hotelPointsBoost(hotel.id) : null;
        const myPts = userPointsState[user?.email || ""];
        const est = estimatedElsForBooking({
          usdValue: totalPrice,
          bookingCount: myPts?.bookingCount ?? 0,
          hotelId: hotel?.id,
        });
        return (
          <Card
            className="p-4"
            style={boost ? {
              background: "linear-gradient(135deg, #FF600010, #EF476F08)",
              borderColor: boost.multiplier >= 3 ? "#FF6000" : "#8b5cf6",
            } : undefined}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: boost ? "linear-gradient(135deg,#FF6000,#EF476F)" : "#FF6000" }}
                >
                  E
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">You'll earn</p>
                  <p className="text-xl font-bold" style={{ color: "#FF6000" }}>
                    +{est.total} ELS <span className="text-xs text-muted-foreground font-normal">≈ US${est.total}.00</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">{est.breakdown}</p>
                </div>
              </div>
              {boost && (
                <div className="text-right">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white animate-pulse"
                    style={{
                      background: boost.multiplier >= 1.2 ? "linear-gradient(90deg,#EF476F,#FF6000)" : boost.multiplier >= 1.15 ? "linear-gradient(90deg,#FF6000,#FFD166)" : "linear-gradient(90deg,#8b5cf6,#a855f7)",
                    }}
                  >
                    ⚡ {boost.label} PROMO
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Ends {boost.expiresAt} · {boost.reason}
                  </p>
                </div>
              )}
            </div>
          </Card>
        );
      })()}

      {/* ── Billing Rate ── */}
      <Card className="p-5">
        <h2 className="font-bold mb-3">Billing Rate</h2>
        <div className="flex items-end justify-between">
          <div>
            <Badge variant={billingType === "PREPAY" ? "destructive" : "default"} className="text-xs">{billingType}</Badge>
            {billingType === "POSTPAY" && (
              <p className="text-xs text-muted-foreground mt-1">Settlement: {currentCompany.settlementCycle || "Bi-weekly"} · Net-{currentCompany.paymentDueDays ?? 5}</p>
            )}
            {billingType === "PREPAY" && !isFreeCancel && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Non-refundable: Payment required before booking</p>
            )}
            {billingType === "PREPAY" && isFreeCancel && (
              <p className="text-xs text-amber-600 mt-1">Payment due by cancel deadline: {freeCancelDate}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xl font-bold" style={{ color: "#FF6000" }}>USD {totalPrice.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">USD {room?.price.toFixed(2)} x {nights} night{nights > 1 ? "s" : ""}</p>
          </div>
        </div>
      </Card>

      {/* ── ELS 사용 옵션 (Spending 출구 #1) ──
       * 골격만 표시 — 실제 차감 비율(예: 5% 이내)과 환산(1 ELS = $1)은 추후 결정.
       * Master는 본인 ELS + Company Pool 둘 다 사용 가능. OP는 본인 ELS만. */}
      <ElsRedeemAtBookingPanel totalPrice={totalPrice} />

      {/* ── Notice ── */}
      <Card className="p-5">
        <h2 className="font-bold mb-3">Notice</h2>
        <div className="space-y-2">
          <h3 className="text-sm font-bold">Things to know</h3>
          <p className="text-xs text-muted-foreground">• Bookings cannot be modified after creation. Please cancel and rebook if changes are needed.</p>
          <p className="text-xs text-muted-foreground">• Non-refundable bookings cannot be cancelled.</p>
          <p className="text-xs text-muted-foreground">• For special requests, please submit a ticket after booking.</p>
          <p className="text-xs text-muted-foreground">• Please present valid government-issued photo identification at check-in.</p>
        </div>
      </Card>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-3 pb-4">
        {billingType === "PREPAY" && !isFreeCancel ? (
          <Button onClick={handleCreate} style={{ background: "#DC2626" }} className="px-8"><CreditCard className="h-4 w-4 mr-2" />Pay & Book</Button>
        ) : (
          <Button onClick={handleCreate} style={{ background: "#FF6000" }} className="px-8">Create</Button>
        )}
        <Button variant="outline" onClick={() => navigate(-1)}>Close</Button>
      </div>

      {/* ── Payment Dialog (PREPAY only) ── */}
      <PaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} amount={totalPrice} onPaymentComplete={() => {
        sessionStorage.setItem("dotbiz_booking_hotel", hotelId);
        sessionStorage.setItem("dotbiz_booking_room", roomId);
        sessionStorage.setItem("dotbiz_booking_checkin", checkIn);
        sessionStorage.setItem("dotbiz_booking_checkout", checkOut);
        navigate("/app/booking/complete");
      }} />

      {/* ── Confirm Dialog ── */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm</AlertDialogTitle>
            <AlertDialogDescription className="text-[#FF6000]">Are you sure you want to create this booking?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              if (billingType === "PREPAY" && !isFreeCancel) {
                setConfirmOpen(false);
                setPaymentOpen(true);
              } else {
                sessionStorage.setItem("dotbiz_booking_hotel", hotelId);
                sessionStorage.setItem("dotbiz_booking_room", roomId);
                sessionStorage.setItem("dotbiz_booking_checkin", checkIn);
                sessionStorage.setItem("dotbiz_booking_checkout", checkOut);
                toast.success("Booking created!", { description: "Redirecting to review..." });
                navigate("/app/booking/confirm");
              }
            }} style={{ background: billingType === "PREPAY" && !isFreeCancel ? "#DC2626" : "#FF6000" }}>
              {billingType === "PREPAY" && !isFreeCancel ? "Proceed to Payment" : "Confirm"}
            </AlertDialogAction>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * ELS 사용 옵션 패널 (Spending 출구 #1)
 *
 * 사용자(OP)는 본인 ELS 잔액을 예약 결제에 사용 가능. Master는 추가로
 * Company Pool도 선택 가능. 비율(현재 잠정 5%)·환산(1 ELS=$1)은 추후 결정.
 *
 * 골격 단계: 토글 + 잔액 표시 + 슬라이더 시뮬레이션 + 차감 후 결제 금액 미리보기.
 * 실제 차감 로직은 결제 완료 시 트랜잭션 기록 추가하면서 활성화.
 * ───────────────────────────────────────────────────────────────────── */
function ElsRedeemAtBookingPanel({ totalPrice }: { totalPrice: number }) {
  const { user } = useAuth();
  const [redeemEnabled, setRedeemEnabled] = useState(false);
  const [redeemSource, setRedeemSource] = useState<"personal" | "company">("personal");
  const [redeemAmount, setRedeemAmount] = useState(0);

  if (!ELS_REDEEM_AT_BOOKING_POLICY.enabled || !user) return null;

  const userState = userPointsState[user.email];
  const personalBalance = userState?.balance || 0;
  const companyId = userState?.customerCompanyId || "";
  const pool = companyPoolFor(companyId);
  const companyBalance = pool?.balance || 0;
  const isMaster = user.role === "Master";

  /* 사용 가능 최대 금액 (정책: 예약 금액 × maxRedeemRatio, 잔액 한도) */
  const maxByRatio = Math.floor(totalPrice * ELS_REDEEM_AT_BOOKING_POLICY.maxRedeemRatio);
  const sourceBalance = redeemSource === "company" ? companyBalance : personalBalance;
  const maxRedeem = Math.min(maxByRatio, sourceBalance);
  const usdDiscount = redeemAmount * ELS_REDEEM_AT_BOOKING_POLICY.elsToUsdRate;
  const finalPrice = Math.max(0, totalPrice - usdDiscount);

  return (
    <Card className="p-5 border-l-4 border-l-[#FF6000]/40">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="font-bold flex items-center gap-2">
            <span className="text-base">⚡</span>
            ELS로 결제 일부 차감 (선택)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            보유 ELS의 일부를 이번 예약 결제에 사용. 차감 비율 한도 {Math.round(ELS_REDEEM_AT_BOOKING_POLICY.maxRedeemRatio * 100)}% (잠정).
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <Checkbox checked={redeemEnabled} onCheckedChange={(v) => { setRedeemEnabled(!!v); if (!v) setRedeemAmount(0); }} />
          <span>ELS 사용</span>
        </label>
      </div>

      {redeemEnabled && (
        <div className="space-y-3">
          {/* Source 선택 (Master만 Company Pool 옵션) */}
          {isMaster && ELS_REDEEM_AT_BOOKING_POLICY.allowCompanyPool && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setRedeemSource("personal"); setRedeemAmount(0); }}
                className={`flex-1 p-2 rounded border text-left text-xs ${redeemSource === "personal" ? "border-[#FF6000] bg-[#FF6000]/5" : "border-border"}`}
              >
                <p className="font-medium">개인 ELS</p>
                <p className="text-muted-foreground">{personalBalance.toLocaleString()} ELS 보유</p>
              </button>
              <button
                type="button"
                onClick={() => { setRedeemSource("company"); setRedeemAmount(0); }}
                className={`flex-1 p-2 rounded border text-left text-xs ${redeemSource === "company" ? "border-[#FF6000] bg-[#FF6000]/5" : "border-border"}`}
              >
                <p className="font-medium">Company Pool</p>
                <p className="text-muted-foreground">{companyBalance.toLocaleString()} ELS 보유</p>
              </button>
            </div>
          )}

          {/* 슬라이더 + 직접 입력 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">사용할 ELS</span>
              <span className="font-medium">최대 {maxRedeem.toLocaleString()} ELS</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxRedeem}
              value={redeemAmount}
              onChange={e => setRedeemAmount(Number(e.target.value))}
              className="w-full"
              disabled={maxRedeem === 0}
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={maxRedeem}
                value={redeemAmount}
                onChange={e => setRedeemAmount(Math.min(maxRedeem, Math.max(0, Number(e.target.value) || 0)))}
                className="w-32 text-xs"
              />
              <span className="text-xs text-muted-foreground">ELS</span>
              <ArrowLeft className="h-3 w-3 rotate-180 text-muted-foreground" />
              <span className="text-xs text-green-600 font-medium">−USD {usdDiscount.toFixed(2)}</span>
            </div>
          </div>

          {/* 결제 금액 요약 */}
          <div className="border-t pt-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">예약 금액</span>
              <span>USD {totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>ELS 차감</span>
              <span>−USD {usdDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1 border-t">
              <span>실제 결제</span>
              <span style={{ color: "#FF6000" }}>USD {finalPrice.toFixed(2)}</span>
            </div>
          </div>

          {maxRedeem === 0 && (
            <p className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded p-2">
              {sourceBalance === 0
                ? "사용 가능한 ELS 잔액이 없습니다."
                : "이 예약은 ELS 사용 한도가 0입니다 (예약 금액 너무 작음)."}
            </p>
          )}
        </div>
      )}

      {!redeemEnabled && personalBalance > 0 && (
        <p className="text-[11px] text-muted-foreground">
          현재 보유 {personalBalance.toLocaleString()} ELS · 이번 예약에 최대 {maxByRatio.toLocaleString()} ELS 사용 가능 (USD {(maxByRatio * ELS_REDEEM_AT_BOOKING_POLICY.elsToUsdRate).toFixed(2)} 할인)
        </p>
      )}
    </Card>
  );
}
