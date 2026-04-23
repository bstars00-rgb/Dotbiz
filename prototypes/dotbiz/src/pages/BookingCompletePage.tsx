import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Download, Mail, CalendarCheck, Plus, Check, Search, RefreshCw, Sparkles, Trophy, Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useScreenState } from "@/hooks/useScreenState";
import { StateToolbar } from "@/components/StateToolbar";
import { useAuth } from "@/contexts/AuthContext";
import { hotels } from "@/mocks/hotels";
import { getRoomsByHotel } from "@/mocks/rooms";
import { userPointsState, MILESTONES, earnedStampsFor, demoStampForBooking, type EarnedStamp } from "@/mocks/rewards";
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
  const { user } = useAuth();
  const userEmail = user?.email || "master@dotbiz.com";

  /* ── Stamp-earned celebration (gamification) ──
   * Fires for ANY newly-earned stamp (first booking, milestone, tier, etc.)
   * Tracks "already shown" via localStorage keyed per OP + stamp id.
   * If multiple stamps were earned at once, we queue them and show one at a time. */
  const welcomeBonus = 5;                                       /* matches MILESTONES[0] */
  const myPts = userPointsState[userEmail];
  const nextMilestone = MILESTONES.find(m => m.requiredBookings > 1) || MILESTONES[1];

  const [celebrateQueue, setCelebrateQueue] = useState<EarnedStamp[]>([]);
  const current = celebrateQueue[0];
  const celebrateOpen = !!current;

  useEffect(() => {
    /* ── Real unseen stamps (production-style) ── */
    const storageKey = `dotbiz_stamps_seen_${userEmail}`;
    const seenRaw = typeof window !== "undefined" ? (localStorage.getItem(storageKey) || "") : "";
    const seen = seenRaw ? seenRaw.split(",") : [];
    const unseen = earnedStampsFor(userEmail).filter(s => s.earned && !seen.includes(s.stamp.id));

    /* ── Demo injection ──
     * Every completed booking advances a sessionStorage counter which picks
     * the next stamp from DEMO_STAMP_ROTATION. This way the popup ALWAYS
     * fires on each booking for prototype showcase — cycling Common →
     * Mythic rarities so reviewers see the full UX range.
     *
     * sessionStorage (not localStorage) so a fresh browser tab resets the
     * rotation to the start. */
    const demoKey = `dotbiz_demo_stamp_counter_${userEmail}`;
    const prev = parseInt(sessionStorage.getItem(demoKey) || "-1", 10);
    const counter = prev + 1;
    sessionStorage.setItem(demoKey, String(counter));
    const demoStamp = demoStampForBooking(counter);

    /* Combine: demo stamp first (so it's the "highlight" for this booking),
     * followed by any genuinely unseen stamps from the user's history. */
    const combined: EarnedStamp[] = [];
    if (demoStamp) combined.push(demoStamp);
    /* Avoid duplicate: if the demo stamp id is also in `unseen`, skip the real one */
    unseen.forEach(u => {
      if (!demoStamp || u.stamp.id !== demoStamp.stamp.id) combined.push(u);
    });

    /* Persist real-stamp seen status */
    if (unseen.length > 0) {
      const allIds = [...seen, ...unseen.map(u => u.stamp.id)];
      localStorage.setItem(storageKey, allIds.join(","));
    }

    if (combined.length > 0) {
      /* Paint success page first, then sweep in */
      const id = setTimeout(() => setCelebrateQueue(combined), 450);
      return () => clearTimeout(id);
    }
  }, [userEmail]);

  const closeCurrent = () => setCelebrateQueue(q => q.slice(1));
  const isFirstBookingStamp = current?.stamp.id === "first-booking";

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
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          The hotel's confirmation number (e.g. <span className="font-mono">HC-xxx</span>) will be
          added to your booking once the hotel acknowledges. You'll be notified — check the
          Bookings page to see it.
        </p>
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
          { label: "Hotel Confirmation No.", value: <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">Pending</Badge> },
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

      {/* ─── Stamp-earned celebration modal (queued) ─── */}
      <Dialog open={celebrateOpen} onOpenChange={(o) => { if (!o) closeCurrent(); }}>
        <DialogContent className="max-w-md overflow-hidden">
          {/* Decorative confetti strip */}
          <div
            className="absolute inset-x-0 top-0 h-1.5"
            style={{ background: "linear-gradient(90deg, #FF6000, #FFD166, #06D6A0, #118AB2, #EF476F, #FF6000)" }}
          />
          {current && (
            <>
              <DialogHeader>
                {/* Queue indicator */}
                {celebrateQueue.length > 1 && (
                  <p className="text-center text-[10px] uppercase tracking-wider text-muted-foreground">
                    New stamp · {celebrateQueue.length} to go
                  </p>
                )}

                {/* Stamp hero */}
                <div
                  className="mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-2 relative"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${current.stamp.accent}50, ${current.stamp.accent}15)`,
                    border: `3px solid ${current.stamp.accent}`,
                    transform: "rotate(-6deg)",
                  }}
                >
                  <span className="text-4xl">{current.stamp.emoji}</span>
                  <span className="absolute -top-2 -right-2 text-2xl animate-pulse">🎉</span>
                  <span className="absolute -bottom-1 -left-2 text-xl">✨</span>
                  <Sparkles className="absolute -top-1 -left-3 h-4 w-4" style={{ color: current.stamp.accent }} />
                </div>

                <DialogTitle className="text-center text-xl">
                  {isFirstBookingStamp ? "축하합니다! 첫 예약 완료! 🎊" : `New Stamp Earned!`}
                </DialogTitle>
                <p className="text-center text-sm font-semibold" style={{ color: current.stamp.accent }}>
                  {current.stamp.emoji} {current.stamp.title}
                </p>
                <p className="text-center text-[11px] text-muted-foreground italic">
                  {current.stamp.hint}
                </p>
              </DialogHeader>

              <div className="space-y-3">
                {/* First-booking gets the full welcome treatment */}
                {isFirstBookingStamp ? (
                  <>
                    <p className="text-sm text-center text-muted-foreground">
                      Welcome to the <strong className="text-[#FF6000]">ELS Rewards</strong> program — your stamp passport begins here.
                    </p>
                    <Card className="p-4 border-[#FF6000]/40" style={{ background: "linear-gradient(135deg, #FF600015, transparent)" }}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: "#FF6000" }}>
                          <Wallet className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Welcome Bonus</p>
                          <p className="text-xl font-bold" style={{ color: "#FF6000" }}>+{welcomeBonus} ELS</p>
                          <p className="text-[10px] text-muted-foreground">≈ US${welcomeBonus}.00 · Added to your wallet</p>
                        </div>
                      </div>
                    </Card>
                    <div className="p-3 rounded-md bg-muted">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <p className="text-xs font-semibold">Next up: {nextMilestone.emoji} {nextMilestone.title}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Book <strong>{nextMilestone.requiredBookings - 1} more</strong> to unlock <strong>+{nextMilestone.bonusPoints} ELS</strong>!
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Generic stamp — compact celebration */}
                    <p className="text-sm text-center text-muted-foreground">
                      This stamp is now permanently pressed into your passport.
                      <br />
                      <span className="text-[11px]">
                        Category: <strong>{current.stamp.category}</strong>
                        {current.earnedAt && <> · Earned {current.earnedAt}</>}
                      </span>
                    </p>

                    {/* Bonus ELS reward card */}
                    <Card
                      className="p-3 border-[#FF6000]/40"
                      style={{ background: "linear-gradient(135deg, #FF600015, transparent)" }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Stamp reward</p>
                          <p className="text-2xl font-bold" style={{ color: "#FF6000" }}>
                            +{current.stamp.bonusEls.toLocaleString()} ELS
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            ≈ US${current.stamp.bonusEls.toLocaleString()} · Credited to your wallet
                          </p>
                        </div>
                        <Sparkles className="h-10 w-10" style={{ color: "#FF6000" }} />
                      </div>
                    </Card>

                    <Card className="p-3" style={{ background: `linear-gradient(135deg, ${current.stamp.accent}15, transparent)` }}>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Your Journey</p>
                      <p className="text-sm mt-1">
                        <strong>{myPts?.bookingCount ?? 0}</strong> bookings ·{" "}
                        <strong>{myPts?.totalEarned ?? 0}</strong> ELS earned ·{" "}
                        <strong>{(myPts?.balance ?? 0) + current.stamp.bonusEls}</strong> ELS balance
                      </p>
                    </Card>
                  </>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" onClick={closeCurrent}>
                  {celebrateQueue.length > 1 ? "Next Stamp" : "Later"}
                </Button>
                <Button
                  onClick={() => { setCelebrateQueue([]); navigate("/app/rewards?tab=wallet"); }}
                  style={{ background: "#FF6000" }}
                  className="text-white"
                >
                  View Passport <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
