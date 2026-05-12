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
import { userPointsState, hotelPointsBoost, estimatedElsForBooking, ELS_REDEEM_AT_BOOKING_POLICY, compositeTierScore, tierForComposite, DEFAULT_COMPOSITE_WEIGHTS } from "@/mocks/rewards";
import { currentCompany } from "@/mocks/companies";
import { hotels } from "@/mocks/hotels";
import { getRoomsByHotel } from "@/mocks/rooms";
import PaymentDialog from "@/components/PaymentDialog";
import { toast } from "sonner";
import {
  paymentMethodsForRegion, calcPaymentFee,
  type PaymentRegion, type PaymentMethodOption,
} from "@/mocks/settlement";

/* 회사 country → PaymentRegion 매핑 (2026-05-08) */
function regionFromCountry(country?: string): PaymentRegion {
  if (!country) return "GLOBAL";
  const c = country.toLowerCase();
  if (c.includes("korea")) return "KR";
  if (c.includes("china") || c.includes("taiwan") || c.includes("hong kong")) return "GREATER_CHINA";
  if (c.includes("vietnam") || c.includes("thailand") || c.includes("indonesia") || c.includes("philippines")) return "SEA";
  if (c.includes("singapore") || c.includes("malaysia")) return "SG_MY";
  if (c.includes("japan")) return "JP";
  return "GLOBAL";
}

const FORM_STORAGE_KEY = "dotbiz_booking_form_v2";
const FORM_TTL_HOURS = 24;     /* 결정 #4: 24시간 후 자동 만료 */

interface SavedDraft {
  bookerName?: string;
  bookerEmail?: string;
  bookerMobile?: string;
  bookerCode?: string;
  mobileCountry?: string;
  travelers?: Array<Record<string, string | number>>;
  specialReqs?: string[];
  customRequest?: string;
  expectedCheckIn?: string;
  /* 복구 시 가용성·요금 비교용 */
  savedAt: number;
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  savedRoomPrice: number;
}

/** localStorage에서 draft 복구. TTL(24h) 경과 시 null 반환 + 자동 청소. */
function loadSavedForm(): SavedDraft | null {
  try {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as SavedDraft;
    const ageHours = (Date.now() - (parsed.savedAt || 0)) / 3600000;
    if (ageHours > FORM_TTL_HOURS) {
      localStorage.removeItem(FORM_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch { /* ignore */ }
  return null;
}

function clearSavedForm() {
  try { localStorage.removeItem(FORM_STORAGE_KEY); } catch { /* ignore */ }
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

  /* ── Decision #6: 환불불가 동의 (non-refundable acknowledge) ── */
  const [nonRefundableAcked, setNonRefundableAcked] = useState(false);

  /* ── Decision #4: 24h draft 복구 시 요금/매진 변경 감지 ── */
  const [draftAlert, setDraftAlert] = useState<{ kind: "price" | "soldout"; before?: number; after?: number } | null>(null);

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

  /* Auto-save (localStorage + 24h TTL + price/availability metadata) */
  useEffect(() => {
    const data: SavedDraft = {
      bookerName, bookerEmail, bookerMobile, bookerCode, mobileCountry,
      travelers, specialReqs: Array.from(specialReqs), customRequest, expectedCheckIn,
      savedAt: Date.now(),
      hotelId, roomId, checkIn, checkOut,
      savedRoomPrice: room?.price || 0,
    };
    try { localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore quota */ }
    /* 진행 중 검색·예약 컨텍스트는 sessionStorage로 (탭 단위) */
    sessionStorage.setItem("dotbiz_booking_hotel", hotelId);
    sessionStorage.setItem("dotbiz_booking_room", roomId);
    sessionStorage.setItem("dotbiz_booking_checkin", checkIn);
    sessionStorage.setItem("dotbiz_booking_checkout", checkOut);
  }, [bookerName, bookerEmail, bookerMobile, bookerCode, mobileCountry, travelers, specialReqs, customRequest, expectedCheckIn, hotelId, roomId, checkIn, checkOut, room?.price]);

  /* 복구 시 1회: 요금/매진 변경 감지 */
  useEffect(() => {
    const draft = loadSavedForm();
    if (!draft) return;
    if (draft.hotelId !== hotelId || draft.roomId !== roomId) return;
    /* 매진 검사: room.remaining === 0 */
    if (room && typeof room.remaining === "number" && room.remaining === 0) {
      setDraftAlert({ kind: "soldout" });
      return;
    }
    /* 요금 변경 검사 */
    if (room && draft.savedRoomPrice && draft.savedRoomPrice !== room.price) {
      setDraftAlert({ kind: "price", before: draft.savedRoomPrice, after: room.price });
    }
  }, [hotelId, roomId, room]);
  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  const totalPrice = room ? room.price * nights : 0;
  const isFreeCancel = room?.cancellationPolicy === "free_cancel";
  const freeCancelDate = isFreeCancel ? (() => { const d = new Date(checkIn); d.setDate(d.getDate() - 2); return d.toISOString().split("T")[0]; })() : "";

  /* Decision #6: non-refundable 동의 필요 (free cancel이 아닌 경우) */
  const isNonRefundable = room?.cancellationPolicy === "non_refundable";
  const requiresAck = isNonRefundable;

  const handleCreate = () => {
    const e1 = validate("bookerName", bookerName, { required: true, rules: [{ type: "required", message: "Name is required" }] });
    const e2 = validate("bookerEmail", bookerEmail, { required: true, rules: [{ type: "email", message: "Valid email required" }] });
    if (e1 || e2) { setFormError("Please fill in all required fields."); return; }
    const hasNames = travelers.every(t => t.lastName && t.firstName);
    if (!hasNames) { setFormError("Please enter Last Name and First Name for all travelers."); setTravelerErrors(true); return; }
    if (requiresAck && !nonRefundableAcked) {
      setFormError("환불불가 예약입니다. 동의 체크박스를 확인해주세요.");
      return;
    }
    if (draftAlert?.kind === "soldout") {
      setFormError("이 객실이 매진되었습니다. 다시 검색해주세요.");
      return;
    }
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

      {/* 24h draft 복구 시 요금/매진 변경 감지 (결정 #4) */}
      {draftAlert?.kind === "soldout" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>이 객실이 매진되었습니다</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-3 flex-wrap">
            <span>임시저장한 입력 후 가용성이 변동되었습니다. 다시 검색해주세요.</span>
            <Button size="sm" variant="outline" onClick={() => { clearSavedForm(); navigate("/app/find-hotel"); }}>
              다시 검색
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {draftAlert?.kind === "price" && (
        <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900 dark:text-amber-200">요금이 변경되었습니다</AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3 flex-wrap">
            <span>
              이전 저장 시점: <strong>USD {draftAlert.before?.toFixed(2)}/박</strong>
              {" → "}
              현재: <strong>USD {draftAlert.after?.toFixed(2)}/박</strong>
              {" "}({(draftAlert.after! - draftAlert.before!) >= 0 ? "+" : ""}{((draftAlert.after! - draftAlert.before!)).toFixed(2)})
            </span>
            <Button size="sm" variant="outline" onClick={() => setDraftAlert(null)}>
              확인 (계속 진행)
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
                    +{est.total.toFixed(1)} ELS
                  </p>
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
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Hotel Charge</p>
            <p className="text-xl font-bold" style={{ color: "#FF6000" }}>USD {totalPrice.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">USD {room?.price.toFixed(2)} x {nights} night{nights > 1 ? "s" : ""}</p>
          </div>
        </div>
      </Card>

      {/* ── Payment Method (2026-05-08 신규: PG 수수료 100% 고객 부담, Option C Hybrid) ──
       *
       * 표시 조건 분기 (비즈니스 룰):
       *   POSTPAY 고객 → 결제수단 선택 SKIP (디포짓 기반 정산)
       *   PREPAY + Free Cancel → 모든 수단 가능 (TL까지 결제)
       *   PREPAY + Non-refundable → 카드/QR 등 즉시 결제 수단만 (가상계좌·송금 차단)
       *   PREPAY + TL 경과 → Non-refundable과 동일
       */}
      {billingType === "POSTPAY" ? (
        <Card className="p-5 border-l-4 border-l-blue-500 bg-blue-50/40 dark:bg-blue-950/10">
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-bold text-blue-900 dark:text-blue-200">POSTPAY · 정산 주기 일괄 결제</p>
              <p className="text-xs text-blue-800/90 dark:text-blue-300/90">
                후불 정산 고객으로 등록되어 있어 예약 시 별도 결제가 필요하지 않습니다.
                이 예약은 다음 정산 주기({currentCompany.settlementCycle || "Bi-weekly"} · Net-{currentCompany.paymentDueDays ?? 5})에
                다른 예약과 함께 일괄 청구됩니다.
              </p>
              <p className="text-[11px] text-blue-700/80 dark:text-blue-400/80 mt-1 italic">
                💡 디포짓 기반 신용 거래 · 결제 수단 선택 불필요
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <PaymentMethodSelector
          totalPrice={totalPrice}
          requireInstantPayment={!isFreeCancel}
        />
      )}

      {/* ── ELS 사용 옵션 (Spending 출구) ──
       * 골격만 표시 — 실제 차감 비율(예: 5% 이내)과 환산(1 ELS = $1)은 추후 결정.
       * 2026-04 정책: ELS는 OP 개인만 보유. Master는 본인 ELS 없음 → 패널 숨김. */}
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

      {/* ── Decision #6: 환불불가 동의 (non-refundable acknowledge) ── */}
      {requiresAck && (
        <Card className="p-4 border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/10">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={nonRefundableAcked}
              onCheckedChange={(v) => setNonRefundableAcked(!!v)}
              className="mt-0.5"
            />
            <div className="text-sm space-y-1">
              <p className="font-bold text-red-700 dark:text-red-300">⚠ 환불불가 예약 동의</p>
              <p className="text-xs text-red-700/90 dark:text-red-300/90">
                이 예약은 <strong>환불불가</strong>입니다. 예약 생성 후 어떤 이유로도 취소·환불·변경이 불가합니다.
                내용을 모두 확인했으며 동의합니다.
              </p>
            </div>
          </label>
        </Card>
      )}

      {/* ── Actions ── */}
      <div className="flex justify-end gap-3 pb-4">
        {billingType === "PREPAY" && !isFreeCancel ? (
          <Button onClick={handleCreate} style={{ background: "#DC2626" }} className="px-8" disabled={requiresAck && !nonRefundableAcked}><CreditCard className="h-4 w-4 mr-2" />Pay & Book</Button>
        ) : (
          <Button onClick={handleCreate} style={{ background: "#FF6000" }} className="px-8" disabled={requiresAck && !nonRefundableAcked}>Create</Button>
        )}
        <Button variant="outline" onClick={() => navigate(-1)}>Close</Button>
      </div>

      {/* ── Payment Dialog (PREPAY only) ── */}
      <PaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} amount={totalPrice} onPaymentComplete={() => {
        sessionStorage.setItem("dotbiz_booking_hotel", hotelId);
        sessionStorage.setItem("dotbiz_booking_room", roomId);
        sessionStorage.setItem("dotbiz_booking_checkin", checkIn);
        sessionStorage.setItem("dotbiz_booking_checkout", checkOut);
        /* FX lock 시점 기록 (결정 #1) */
        sessionStorage.setItem("dotbiz_booking_fx_locked_at", new Date().toISOString());
        sessionStorage.setItem("dotbiz_booking_fx_rate", "1.0"); /* prices already USD */
        clearSavedForm();
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
                /* FX lock 시점 기록 (결정 #1) */
                sessionStorage.setItem("dotbiz_booking_fx_locked_at", new Date().toISOString());
                sessionStorage.setItem("dotbiz_booking_fx_rate", "1.0");
                clearSavedForm();
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
 * ELS 사용 옵션 패널 (Spending 출구)
 *
 * 2026-04 정책 (Company Pool 폐기):
 *   • OP만 본인 ELS로 차감 가능
 *   • Master / Accounting은 ELS 보유 X → 패널 자체 숨김
 *   • 비율(현재 잠정 5%)·환산(1 ELS=$1)은 추후 결정
 *
 * 골격 단계: 토글 + 잔액 표시 + 슬라이더 시뮬레이션 + 차감 후 결제 금액 미리보기.
 * 실제 차감 로직은 결제 완료 시 트랜잭션 기록 추가하면서 활성화.
 * ───────────────────────────────────────────────────────────────────── */
function ElsRedeemAtBookingPanel({ totalPrice }: { totalPrice: number }) {
  const { user } = useAuth();
  const [redeemEnabled, setRedeemEnabled] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState(0);

  if (!ELS_REDEEM_AT_BOOKING_POLICY.enabled || !user) return null;
  /* OP만 ELS 보유 → 다른 role에게는 패널 숨김 */
  if (user.role !== "OP") return null;

  const userState = userPointsState[user.email];
  const personalBalance = userState?.balance || 0;

  /* ── Decision #2: Tier별 차등 차감 비율 ──
   * Bronze 5% / Silver 7% / Gold 10% / Platinum 12% / Emerald 13% / Diamond 15% (잠정)
   * 어드민에서 튜닝 가능 — 현재는 클라이언트 계산.
   *
   * ⚠️ 신규 tier 추가 시 반드시 여기에도 추가 (없으면 undefined → NaN 전파). */
  const tierBasedRatio: Record<string, number> = {
    Bronze:   0.05,
    Silver:   0.07,
    Gold:     0.10,
    Platinum: 0.12,
    Emerald:  0.13,
    Diamond:  0.15,
  };
  const userTier = userState
    ? tierForComposite({ bookingCount: userState.bookingCount, totalRevenueUsd: userState.totalRevenueUsd }, DEFAULT_COMPOSITE_WEIGHTS)
    : null;
  /* fallback: 신규 tier가 추가됐는데 위 매핑 누락 시 안전망 */
  const effectiveRatio = userTier
    ? (tierBasedRatio[userTier.name] ?? ELS_REDEEM_AT_BOOKING_POLICY.maxRedeemRatio)
    : ELS_REDEEM_AT_BOOKING_POLICY.maxRedeemRatio;

  /* 사용 가능 최대 금액 (Tier 차등 적용) */
  const maxByRatio = Math.floor(totalPrice * effectiveRatio);
  const maxRedeem = Math.min(maxByRatio, personalBalance);
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
            보유 ELS의 일부를 이번 예약 결제에 사용.
            {userTier && (
              <> 차감 한도: <strong style={{ color: userTier.color }}>{userTier.icon} {userTier.name}</strong> {Math.round(effectiveRatio * 100)}%</>
            )}
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <Checkbox checked={redeemEnabled} onCheckedChange={(v) => { setRedeemEnabled(!!v); if (!v) setRedeemAmount(0); }} />
          <span>ELS 사용</span>
        </label>
      </div>

      {redeemEnabled && (
        <div className="space-y-3">
          {/* 슬라이더 + 직접 입력 — 본인 ELS만 (Company Pool 폐기) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">사용할 ELS · 보유 {personalBalance.toLocaleString()}</span>
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
              {personalBalance === 0
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


/* ════════════════════════════════════════════════════════════════════
 * PaymentMethodSelector (2026-05-08 신규)
 *
 * 정책: PG 수수료 100% 고객 부담 (Option C Hybrid, Booking-style).
 *   - 호텔 정가는 위에서 단일 표시
 *   - 여기서 결제수단 선택 → 수수료 자동 표시 → 최종 금액 계산
 *   - 인보이스는 별도 라인으로 분리됨 (Settlement Detail 페이지에서 표시)
 *
 * 권역 자동 감지: currentCompany.country → PaymentRegion
 * ════════════════════════════════════════════════════════════════════ */
/** 즉시 결제 확정 가능한 카테고리.
 *  Non-refundable / TL 경과 예약에서는 이 카테고리만 허용.
 *  bank_transfer / swift_wire / virtual_account 는 입금 대기 시간 차이로 제외. */
const INSTANT_PAYMENT_CATEGORIES = new Set([
  "card_local", "card_global", "qr_payment",
]);

function PaymentMethodSelector({
  totalPrice,
  requireInstantPayment = false,
}: {
  totalPrice: number;
  /** Non-refundable / TL 경과 예약 시 즉시 결제만 허용 */
  requireInstantPayment?: boolean;
}) {
  const region = regionFromCountry(currentCompany.country);
  const allMethods = paymentMethodsForRegion(region);
  /* 즉시 결제 요구 시 delayed 수단 disabled (UI에는 표시하되 선택 불가) */
  const methods = allMethods;
  const isMethodDisabled = (m: PaymentMethodOption) =>
    requireInstantPayment && !INSTANT_PAYMENT_CATEGORIES.has(m.category);

  const [selectedId, setSelectedId] = useState<string>(() => {
    const enabled = methods.filter(m => !isMethodDisabled(m));
    const recommended = enabled.find(m => m.isRecommended);
    return recommended?.id || enabled[0]?.id || methods[0]?.id || "";
  });
  const selected = methods.find(m => m.id === selectedId) || methods[0];
  const feeCalc = selected ? calcPaymentFee(selected, totalPrice) : null;
  const finalTotal = totalPrice + (feeCalc?.feeUsd || 0);

  /* 권역 이름 표시용 */
  const regionLabel: Record<PaymentRegion, string> = {
    KR: "한국 (Korea)",
    GREATER_CHINA: "대중화권 (China·Taiwan·HK)",
    SEA: "동남아 (Vietnam·Thailand·Indonesia·Philippines)",
    SG_MY: "싱가포르·말레이시아",
    JP: "일본 (Japan)",
    GLOBAL: "Global",
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="font-bold flex items-center gap-2">
            <CreditCard className="h-4 w-4" style={{ color: "#FF6000" }} />
            Payment Method
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {regionLabel[region]} · 결제 수수료는 고객 부담 (선택한 수단에 따라 표시)
          </p>
        </div>
      </div>

      {/* 즉시 결제 요구 안내 (Non-refundable / TL 경과 시) */}
      {requireInstantPayment && (
        <div className="mb-3 p-3 rounded-md border border-red-300/60 bg-red-50 dark:bg-red-950/20 text-xs">
          <p className="font-bold text-red-700 dark:text-red-300 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            즉시 결제 필요 — 가상계좌 / 송금 사용 불가
          </p>
          <p className="text-red-700/90 dark:text-red-300/90 mt-1">
            환불 불가 예약은 결제가 즉시 확정되어야 호텔 객실이 보장됩니다.
            <strong>카드 / Alipay / WeChat / PayNow / FPS 등 실시간 결제수단</strong>만 선택 가능합니다.
          </p>
        </div>
      )}

      {/* 권역별 결제수단 그리드 (지역 추천 우선) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
        {methods.filter(m => m.region === region).map(m => (
          <PaymentMethodCard
            key={m.id}
            method={m}
            baseAmountUsd={totalPrice}
            selected={selectedId === m.id}
            onSelect={() => setSelectedId(m.id)}
            disabled={isMethodDisabled(m)}
          />
        ))}
      </div>

      {/* 글로벌 옵션 (접힘) */}
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-2">
          🌐 글로벌 결제수단 (Cross-border 대형 거래용) — 펼치기
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {methods.filter(m => m.region === "GLOBAL").map(m => (
            <PaymentMethodCard
              key={m.id}
              method={m}
              baseAmountUsd={totalPrice}
              selected={selectedId === m.id}
              onSelect={() => setSelectedId(m.id)}
              disabled={isMethodDisabled(m)}
            />
          ))}
        </div>
      </details>

      {/* 결제 요약 */}
      {selected && feeCalc && (
        <div className="mt-4 p-3 rounded-md border bg-muted/30 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hotel Charge</span>
            <span className="font-medium">USD {totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Payment Fee ({selected.icon} {selected.name})
            </span>
            <span className={selected.isFree ? "text-green-600 font-medium" : "text-foreground"}>
              {selected.isFree ? "Free" : `USD ${feeCalc.feeUsd.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1.5 border-t">
            <span>Total Payment</span>
            <span style={{ color: "#FF6000" }}>USD {finalTotal.toFixed(2)}</span>
          </div>
          {!selected.isFree && (
            <p className="text-[10px] text-muted-foreground italic pt-1">
              {selected.description} · 결제 수수료는 인보이스에 별도 라인으로 표시됩니다.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

function PaymentMethodCard({
  method, baseAmountUsd, selected, onSelect, disabled = false,
}: {
  method: PaymentMethodOption;
  baseAmountUsd: number;
  selected: boolean;
  onSelect: () => void;
  /** 즉시 결제 요구 환경에서 delayed 수단은 disabled */
  disabled?: boolean;
}) {
  const fee = calcPaymentFee(method, baseAmountUsd);
  const disabledReason = disabled ? "환불 불가 예약은 즉시 결제만 가능" : null;
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      title={disabledReason || undefined}
      className={`text-left p-3 rounded-md border transition-all relative ${
        disabled
          ? "border-border bg-muted/30 opacity-50 cursor-not-allowed"
          : selected
          ? "border-[#FF6000] bg-[#FF6000]/5 ring-1 ring-[#FF6000]"
          : "border-border hover:border-[#FF6000]/40 hover:bg-muted/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-lg shrink-0">{method.icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{method.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{method.provider}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          {method.isFree ? (
            <Badge className="bg-green-600 text-white text-[9px]">Free</Badge>
          ) : (
            <p className="text-xs font-mono font-semibold" style={{ color: "#FF6000" }}>
              +{fee.feeUsd.toFixed(2)}
            </p>
          )}
          {method.isRecommended && !disabled && (
            <Badge variant="outline" className="text-[9px] mt-0.5">추천</Badge>
          )}
          {disabled && (
            <Badge variant="outline" className="text-[9px] mt-0.5 text-red-500 border-red-300">차단</Badge>
          )}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-1">
        {disabled ? "환불 불가 예약 시 사용 불가 (입금 지연)" : method.description}
      </p>
    </button>
  );
}
