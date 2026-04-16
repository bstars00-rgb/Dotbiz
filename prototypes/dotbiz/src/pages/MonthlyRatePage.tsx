import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight, Download, Star, MapPin, CalendarDays, Tag, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { hotels } from "@/mocks/hotels";
import { getRoomsByHotel } from "@/mocks/rooms";
import { toast } from "sonner";

/* Generate mock daily rates for a month — simulates real pricing API */
function generateMonthlyRates(basePrice: number, year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rates: { date: string; day: string; price: number; available: boolean; promo: string }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    const dayName = dt.toLocaleDateString("en-US", { weekday: "short" });
    const isWeekend = dt.getDay() === 0 || dt.getDay() === 5 || dt.getDay() === 6;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    /* Weekend surcharge + random variance */
    const weekendMultiplier = isWeekend ? 1.15 + Math.random() * 0.1 : 1.0;
    const variance = 0.9 + Math.random() * 0.2;
    const price = Math.round(basePrice * weekendMultiplier * variance * 100) / 100;

    /* Random promotions */
    let promo = "";
    if (d >= 10 && d <= 15) promo = "Early Bird -5%";
    if (d >= 20 && d <= 25 && isWeekend) promo = "Weekend Special";
    if (d === 1) promo = "Month Opening Deal";

    /* Random soldout */
    const available = Math.random() > 0.08;

    rates.push({ date: dateStr, day: dayName, price, available, promo });
  }
  return rates;
}

export default function MonthlyRatePage() {
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get("id") || "htl-007";
  const hotel = hotels.find(h => h.id === hotelId) || hotels[0];
  const allRooms = getRoomsByHotel(hotel.id);

  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(3); // April
  const [selectedRoom, setSelectedRoom] = useState(allRooms[0]?.id || "");

  const room = allRooms.find(r => r.id === selectedRoom) || allRooms[0];
  const monthName = new Date(calYear, calMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const rates = useMemo(() => {
    if (!room) return [];
    return generateMonthlyRates(room.price, calYear, calMonth);
  }, [room?.id, calYear, calMonth]);

  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); };

  /* Stats */
  const availableRates = rates.filter(r => r.available);
  const avgPrice = availableRates.length > 0 ? Math.round(availableRates.reduce((s, r) => s + r.price, 0) / availableRates.length) : 0;
  const minPrice = availableRates.length > 0 ? Math.min(...availableRates.map(r => r.price)) : 0;
  const maxPrice = availableRates.length > 0 ? Math.max(...availableRates.map(r => r.price)) : 0;
  const promoCount = rates.filter(r => r.promo).length;
  const soldoutCount = rates.filter(r => !r.available).length;

  /* Calendar grid */
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const handleDownload = () => {
    /* Generate CSV */
    const header = "Date,Day,Room Type,Price (USD),Available,Promotion\n";
    const rows = rates.map(r => `${r.date},${r.day},${room.name},${r.price},${r.available ? "Yes" : "Sold Out"},${r.promo}`).join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${hotel.name.replace(/\s+/g, "_")}_${monthName.replace(/\s+/g, "_")}_Rates.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Rate table downloaded!", { description: `${rates.length} days exported as CSV` });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarDays className="h-6 w-6" style={{ color: "#FF6000" }} />Monthly Rate Table</h1>
          <div className="flex items-center gap-2 mt-2">
            <h2 className="font-bold cursor-pointer hover:text-[#FF6000] transition-colors" onClick={() => window.open(`${window.location.origin}${window.location.pathname}#/app/hotel/${hotel.id}`, "_blank")}>{hotel.name}</h2>
            <div className="flex">{Array.from({ length: hotel.starRating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</div>
            <Button variant="outline" size="sm" className="ml-2 text-xs" onClick={() => window.open(`${window.location.origin}${window.location.pathname}#/app/hotel/${hotel.id}`, "_blank")}>View Hotel →</Button>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{hotel.area}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}><Download className="h-4 w-4 mr-1" />Print / PDF</Button>
          <Button onClick={handleDownload} style={{ background: "#FF6000" }}><Download className="h-4 w-4 mr-1" />Download CSV</Button>
        </div>
      </div>

      {/* Room selector + Month navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Room Type:</label>
            <select aria-label="Room type" value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} className="border rounded-md px-3 py-1.5 text-sm bg-card font-medium">
              {allRooms.map(r => <option key={r.id} value={r.id}>{r.name} — {r.bedCount} ({r.mealDetail})</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" aria-label="Previous month" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm font-bold w-36 text-center">{monthName}</span>
            <Button variant="outline" size="sm" aria-label="Next month" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Average</p><p className="text-lg font-bold" style={{ color: "#FF6000" }}>USD {avgPrice}</p></Card>
        <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Lowest</p><p className="text-lg font-bold text-green-600">USD {minPrice}</p></Card>
        <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Highest</p><p className="text-lg font-bold text-red-500">USD {maxPrice}</p></Card>
        <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Promotions</p><p className="text-lg font-bold">{promoCount} days</p></Card>
        <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Sold Out</p><p className="text-lg font-bold text-red-500">{soldoutCount} days</p></Card>
      </div>

      {/* Calendar View */}
      <Card className="p-4">
        <h3 className="font-bold mb-3">Calendar View</h3>
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="text-center text-xs font-bold text-muted-foreground py-2">{d}</div>
          ))}
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {/* Day cells */}
          {rates.map(r => {
            const day = parseInt(r.date.split("-")[2]);
            const isWeekend = r.day === "Sat" || r.day === "Sun" || r.day === "Fri";
            return (
              <div key={r.date} className={`border rounded-lg p-2 min-h-[80px] text-center transition-colors ${!r.available ? "bg-red-50 dark:bg-red-900/10 opacity-60" : isWeekend ? "bg-orange-50/50 dark:bg-orange-900/5" : ""}`}>
                <p className={`text-xs font-bold ${isWeekend ? "text-[#FF6000]" : ""}`}>{day}</p>
                {r.available ? (
                  <>
                    <p className="text-sm font-bold mt-1" style={{ color: "#FF6000" }}>${r.price}</p>
                    {r.promo && <p className="text-[8px] text-green-600 mt-0.5 leading-tight">{r.promo}</p>}
                  </>
                ) : (
                  <p className="text-[10px] text-red-500 mt-2 font-medium">Sold Out</p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Table View */}
      <Card className="p-4">
        <h3 className="font-bold mb-3">Detailed Rate Table</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Room Type</TableHead>
                <TableHead>Bed</TableHead>
                <TableHead>Meal</TableHead>
                <TableHead>Price/Night</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Promotion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map(r => (
                <TableRow key={r.date} className={!r.available ? "opacity-50" : ""}>
                  <TableCell className="text-sm font-mono">{r.date}</TableCell>
                  <TableCell className={`text-sm ${(r.day === "Sat" || r.day === "Sun" || r.day === "Fri") ? "text-[#FF6000] font-medium" : ""}`}>{r.day}</TableCell>
                  <TableCell className="text-sm">{room.name}</TableCell>
                  <TableCell className="text-sm">{room.bedCount}</TableCell>
                  <TableCell className="text-xs">{room.mealIncluded ? <span className="text-green-600">{room.mealDetail}</span> : "Room Only"}</TableCell>
                  <TableCell className="font-bold" style={{ color: r.available ? "#FF6000" : "#999" }}>USD {r.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {r.available
                      ? <Badge variant="default" className="text-[9px]">Available</Badge>
                      : <Badge variant="destructive" className="text-[9px]">Sold Out</Badge>
                    }
                  </TableCell>
                  <TableCell>
                    {r.promo ? <Badge variant="outline" className="text-[9px] gap-1" style={{ borderColor: "#009505", color: "#009505" }}><Tag className="h-2.5 w-2.5" />{r.promo}</Badge> : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Notice */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Rates are indicative and subject to real-time availability at the time of booking.</p>
            <p>Weekend and holiday surcharges may apply. Promotion rates are valid for the specified dates only.</p>
            <p>For confirmed rates, please proceed to booking or contact your account manager.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
