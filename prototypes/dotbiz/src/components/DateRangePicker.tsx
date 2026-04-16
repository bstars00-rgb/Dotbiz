import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (v: string) => void;
  onCheckOutChange: (v: string) => void;
}

const getTodayStr = () => new Date().toISOString().split("T")[0];

const formatDateShort = (dateStr: string) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

export default function DateRangePicker({ checkIn, checkOut, onCheckInChange, onCheckOutChange }: Props) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"checkin" | "checkout">("checkin");
  const ref = useRef<HTMLDivElement>(null);
  const today = getTodayStr();

  const ciDate = new Date(checkIn + "T00:00:00");
  const coDate = new Date(checkOut + "T00:00:00");
  const nights = Math.max(1, Math.round((coDate.getTime() - ciDate.getTime()) / 86400000));

  const [calYear, setCalYear] = useState(ciDate.getFullYear());
  const [calMonth, setCalMonth] = useState(ciDate.getMonth());

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDateClick = (dateStr: string) => {
    if (phase === "checkin") {
      onCheckInChange(dateStr);
      const ci = new Date(dateStr);
      if (new Date(checkOut) <= ci) {
        const next = new Date(ci);
        next.setDate(next.getDate() + 1);
        onCheckOutChange(next.toISOString().split("T")[0]);
      }
      setPhase("checkout");
    } else {
      if (dateStr <= checkIn) {
        onCheckInChange(dateStr);
        setPhase("checkout");
      } else {
        onCheckOutChange(dateStr);
        setOpen(false);
      }
    }
  };

  const prevYear = () => setCalYear(y => y - 1);
  const nextYear = () => setCalYear(y => y + 1);
  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); };

  const renderMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const prevMonthDays = new Date(year, month, 0).getDate();
    const days: { day: number; current: boolean }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) days.push({ day: prevMonthDays - i, current: false });
    for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, current: true });
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) days.push({ day: i, current: false });

    return (
      <div className="w-[300px]">
        <p className="text-base font-bold text-center mb-3">{monthName}</p>
        <div className="grid grid-cols-7 gap-0 text-center">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
            <div key={d} className="text-xs font-semibold text-muted-foreground py-2">{d}</div>
          ))}
          {days.map((item, i) => {
            if (!item.current) return <div key={`e-${i}`} className="py-2.5 text-xs text-muted-foreground/20">{item.day}</div>;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(item.day).padStart(2, "0")}`;
            const isPast = dateStr < today;
            const isCheckIn = dateStr === checkIn;
            const isCheckOut = dateStr === checkOut;
            const isBetween = dateStr > checkIn && dateStr < checkOut;
            const isToday = dateStr === today;

            return (
              <button
                key={dateStr}
                disabled={isPast}
                onClick={() => handleDateClick(dateStr)}
                className={`py-2.5 text-sm transition-all
                  ${isPast ? "text-muted-foreground/25 cursor-not-allowed" : "hover:bg-muted cursor-pointer"}
                  ${isCheckIn ? "bg-[#FF6000] text-white font-bold rounded-full" : ""}
                  ${isCheckOut ? "bg-[#FF6000]/80 text-white font-bold rounded-full" : ""}
                  ${isBetween ? "bg-[#FF6000]/10" : ""}
                  ${isToday && !isCheckIn && !isCheckOut ? "font-bold text-[#FF6000]" : ""}
                `}
              >
                {item.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const nm = calMonth === 11 ? { y: calYear + 1, m: 0 } : { y: calYear, m: calMonth + 1 };

  return (
    <div className="flex items-stretch relative" ref={ref}>
      {/* Check-In */}
      <div className="px-4 py-3 border-r cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => { setPhase("checkin"); setOpen(true); setCalYear(ciDate.getFullYear()); setCalMonth(ciDate.getMonth()); }}>
        <p className="text-xs font-semibold text-muted-foreground mb-1">Check-In</p>
        <p className={`text-sm font-medium ${open && phase === "checkin" ? "text-[#FF6000]" : ""}`}>{formatDateShort(checkIn)}</p>
      </div>
      {/* Check-Out */}
      <div className="px-4 py-3 border-r cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => { setPhase("checkout"); setOpen(true); setCalYear(coDate.getFullYear()); setCalMonth(coDate.getMonth()); }}>
        <p className="text-xs font-semibold text-muted-foreground mb-1">Check-Out</p>
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium ${open && phase === "checkout" ? "text-[#FF6000]" : ""}`}>{formatDateShort(checkOut)}</p>
          <Badge variant="secondary" className="text-[11px]">{nights} nights</Badge>
        </div>
      </div>

      {/* Calendar Dropdown — matching main page style */}
      {open && (
        <div className="absolute top-full left-0 mt-2 bg-card border rounded-2xl shadow-2xl z-50 p-6" style={{ width: 680 }}>
          {/* Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              <button onClick={prevYear} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"><ChevronsLeft className="h-4 w-4" /></button>
              <button onClick={prevMonth} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"><ChevronLeft className="h-4 w-4" /></button>
            </div>
            <p className="text-xs font-medium">
              {phase === "checkin"
                ? <span className="text-[#FF6000]">Select check-in date</span>
                : <span className="text-[#FF6000]">Select check-out date</span>
              }
            </p>
            <div className="flex items-center gap-1">
              <button onClick={nextMonth} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"><ChevronRight className="h-4 w-4" /></button>
              <button onClick={nextYear} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"><ChevronsRight className="h-4 w-4" /></button>
            </div>
          </div>
          {/* Two months side by side */}
          <div className="flex gap-8 justify-center">
            {renderMonth(calYear, calMonth)}
            {renderMonth(nm.y, nm.m)}
          </div>
        </div>
      )}
    </div>
  );
}
