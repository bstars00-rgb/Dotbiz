import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  MapPin, Calendar, Search, Globe, Star, RefreshCw, Users, ChevronDown, ChevronLeft, ChevronRight as ChevronRightIcon,
  Clock, X, Heart, ArrowRight, Flame, Shield, TrendingUp, Building2,
  Bed, Coffee, Wifi, Waves, Dumbbell, UtensilsCrossed, Sparkles, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useScreenState } from "@/hooks/useScreenState";
import { useFormValidation } from "@/hooks/useFormValidation";
import { StateToolbar } from "@/components/StateToolbar";
import { hotels } from "@/mocks/hotels";

const popularCities = [
  { name: "Seoul", country: "South Korea", emoji: "🇰🇷", hotels: 2450, landmark: "🏯", gradient: "from-rose-600 to-pink-400", desc: "Gyeongbokgung Palace" },
  { name: "Tokyo", country: "Japan", emoji: "🇯🇵", hotels: 3120, landmark: "🗼", gradient: "from-red-600 to-orange-400", desc: "Tokyo Tower" },
  { name: "Bangkok", country: "Thailand", emoji: "🇹🇭", hotels: 4200, landmark: "🛕", gradient: "from-amber-600 to-yellow-400", desc: "Grand Palace" },
  { name: "Osaka", country: "Japan", emoji: "🇯🇵", hotels: 1890, landmark: "🏰", gradient: "from-indigo-600 to-blue-400", desc: "Osaka Castle" },
  { name: "Hanoi", country: "Vietnam", emoji: "🇻🇳", hotels: 1560, landmark: "🌉", gradient: "from-emerald-700 to-green-400", desc: "Hoan Kiem Lake" },
  { name: "Singapore", country: "Singapore", emoji: "🇸🇬", hotels: 980, landmark: "🏙️", gradient: "from-blue-700 to-cyan-400", desc: "Marina Bay Sands" },
  { name: "Ho Chi Minh", country: "Vietnam", emoji: "🇻🇳", hotels: 2100, landmark: "⛪", gradient: "from-teal-600 to-emerald-400", desc: "Notre-Dame Cathedral" },
  { name: "Shanghai", country: "China", emoji: "🇨🇳", hotels: 3450, landmark: "🌆", gradient: "from-violet-700 to-purple-400", desc: "The Bund" },
];

export interface RecentSearch {
  id: string;
  hotelId: string;
  hotel: string;
  checkin: string;
  checkout: string;
  price: number;
  timestamp: number;
}

const RECENT_KEY = "dotbiz_recent_searches";
const MAX_RECENT = 6;

export function getRecentSearches(): RecentSearch[] {
  try { const s = localStorage.getItem(RECENT_KEY); return s ? JSON.parse(s) : []; }
  catch { return []; }
}

export function addRecentSearch(item: Omit<RecentSearch, "id" | "timestamp">) {
  const all = getRecentSearches().filter(r => r.hotelId !== item.hotelId);
  all.unshift({ ...item, id: `rs-${Date.now()}`, timestamp: Date.now() });
  localStorage.setItem(RECENT_KEY, JSON.stringify(all.slice(0, MAX_RECENT)));
}

export function removeRecentSearch(id: string) {
  const all = getRecentSearches().filter(r => r.id !== id);
  localStorage.setItem(RECENT_KEY, JSON.stringify(all));
}

export function clearRecentSearches() {
  localStorage.removeItem(RECENT_KEY);
}

/* Default data for first-time users */
const defaultRecent: RecentSearch[] = [
  { id: "rs1", hotelId: "htl-001", hotel: "Grand Hyatt Seoul", checkin: "2026-03-30", checkout: "2026-04-02", price: 280, timestamp: Date.now() - 86400000 },
  { id: "rs2", hotelId: "htl-013", hotel: "Hotel Nikko Bangkok", checkin: "2026-04-05", checkout: "2026-04-08", price: 195, timestamp: Date.now() - 172800000 },
  { id: "rs3", hotelId: "htl-008", hotel: "Mandarin Oriental Tokyo", checkin: "2026-04-10", checkout: "2026-04-12", price: 450, timestamp: Date.now() - 259200000 },
  { id: "rs4", hotelId: "htl-005", hotel: "Four Seasons Seoul", checkin: "2026-03-25", checkout: "2026-03-27", price: 520, timestamp: Date.now() - 345600000 },
  { id: "rs5", hotelId: "htl-010", hotel: "Park Hyatt Tokyo", checkin: "2026-04-01", checkout: "2026-04-03", price: 480, timestamp: Date.now() - 432000000 },
  { id: "rs6", hotelId: "htl-018", hotel: "Ritz-Carlton Bali", checkin: "2026-03-20", checkout: "2026-03-24", price: 350, timestamp: Date.now() - 518400000 },
];

const amenityIcons: Record<string, any> = {
  Pool: Waves, Spa: Sparkles, WiFi: Wifi, Gym: Dumbbell, Restaurant: UtensilsCrossed, Bar: Coffee,
};

function getTodayStr() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}
function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}
function calcNights(ci: string, co: string) {
  if (!ci || !co) return 0;
  return Math.max(0, Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000));
}

export default function FindHotelPage() {
  const { state, setState } = useScreenState("success");
  const navigate = useNavigate();
  const { errors, validate } = useFormValidation();
  const [destination, setDestination] = useState("");
  const [checkin, setCheckin] = useState(getTodayStr());
  const [checkout, setCheckout] = useState(getTomorrowStr());
  const [rooms, setRooms] = useState("1");
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [nationality, setNationality] = useState("Korean");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [destTab, setDestTab] = useState("Top Cities");
  const destRef = useRef<HTMLDivElement>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerPhase, setDatePickerPhase] = useState<"checkin" | "checkout">("checkin");
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [showNationality, setShowNationality] = useState(false);
  const [nationalitySearch, setNationalitySearch] = useState("");
  const nationalityRef = useRef<HTMLDivElement>(null);
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [childAges, setChildAges] = useState<number[]>([]);
  const roomPickerRef = useRef<HTMLDivElement>(null);
  const [recentList, setRecentList] = useState<RecentSearch[]>(() => {
    const saved = getRecentSearches();
    if (saved.length === 0) { localStorage.setItem(RECENT_KEY, JSON.stringify(defaultRecent)); return defaultRecent; }
    return saved;
  });

  // Close pickers on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) setShowDatePicker(false);
      if (roomPickerRef.current && !roomPickerRef.current.contains(e.target as Node)) setShowRoomPicker(false);
      if (nationalityRef.current && !nationalityRef.current.contains(e.target as Node)) setShowNationality(false);
      if (destRef.current && !destRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync childAges array length with children count
  const childrenNum = parseInt(children);
  useEffect(() => {
    setChildAges(prev => {
      if (prev.length < childrenNum) return [...prev, ...Array(childrenNum - prev.length).fill(0)];
      return prev.slice(0, childrenNum);
    });
  }, [childrenNum]);

  const nights = calcNights(checkin, checkout);
  const favoriteHotels = hotels.filter(h => h.isFavorite);
  const featuredHotels = hotels.filter(h => h.isFeatured);

  const filteredCities = useMemo(() => {
    if (!destination) return popularCities;
    return popularCities.filter(c => c.name.toLowerCase().includes(destination.toLowerCase()) || c.country.toLowerCase().includes(destination.toLowerCase()));
  }, [destination]);

  const handleSearch = () => {
    const err = validate("destination", destination, { required: true, rules: [{ type: "required", message: "Please enter a destination" }] });
    if (err) { setSearchError("Please enter a destination."); return; }
    if (nights < 1) { setSearchError("Check-out must be after check-in."); return; }
    setSearchError(null);
    navigate(`/app/search-results?q=${encodeURIComponent(destination)}&checkin=${checkin}&checkout=${checkout}&rooms=${rooms}&adults=${adults}&children=${children}&nationality=${encodeURIComponent(nationality)}`);
  };

  const selectCity = (name: string) => {
    setDestination(name);
    setShowSuggestions(false);
  };

  const openDatePicker = () => {
    setDatePickerPhase("checkin");
    setShowDatePicker(true);
  };

  const handleDateClick = (dateStr: string) => {
    if (datePickerPhase === "checkin") {
      setCheckin(dateStr);
      // Auto-set checkout to next day if current checkout <= new checkin
      const ciDate = new Date(dateStr);
      const coDate = new Date(checkout);
      if (coDate <= ciDate) {
        const next = new Date(ciDate);
        next.setDate(next.getDate() + 1);
        setCheckout(next.toISOString().split("T")[0]);
      }
      setDatePickerPhase("checkout");
    } else {
      // checkout must be after checkin
      if (dateStr <= checkin) {
        // If user picks before checkin, treat as new checkin
        setCheckin(dateStr);
        setDatePickerPhase("checkout");
      } else {
        setCheckout(dateStr);
        setShowDatePicker(false);
      }
    }
  };

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const renderCalendarMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const today = getTodayStr();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return (
      <div className="w-[280px]">
        <p className="text-sm font-bold text-center mb-3">{monthName}</p>
        <div className="grid grid-cols-7 gap-0 text-center">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
            <div key={d} className="text-[11px] font-semibold text-muted-foreground py-1">{d}</div>
          ))}
          {days.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isPast = dateStr < today;
            const isCheckin = dateStr === checkin;
            const isCheckout = dateStr === checkout;
            const isInRange = dateStr > checkin && dateStr < checkout;
            const isHoverRange = datePickerPhase === "checkout" && hoverDate && dateStr > checkin && dateStr <= hoverDate && dateStr < (checkout || "9999");

            let cellClass = "h-9 w-9 mx-auto flex items-center justify-center text-sm rounded-full transition-all cursor-pointer ";
            if (isPast) {
              cellClass += "text-gray-300 dark:text-gray-600 cursor-not-allowed";
            } else if (isCheckin) {
              cellClass += "bg-[#FF6000] text-white font-bold";
            } else if (isCheckout) {
              cellClass += "bg-[#FF6000] text-white font-bold";
            } else if (isInRange) {
              cellClass += "bg-[#FF6000]/15 text-[#FF6000] font-medium";
            } else if (isHoverRange) {
              cellClass += "bg-[#FF6000]/10 text-[#FF6000]";
            } else {
              cellClass += "hover:bg-[#FF6000]/10 hover:text-[#FF6000]";
            }

            return (
              <div key={dateStr} className="py-0.5">
                <div
                  className={cellClass}
                  onClick={() => !isPast && handleDateClick(dateStr)}
                  onMouseEnter={() => !isPast && setHoverDate(dateStr)}
                >
                  {day}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const nextMonth = (y: number, m: number) => m === 11 ? { year: y + 1, month: 0 } : { year: y, month: m + 1 };

  if (state === "loading") return (<div className="p-6 space-y-6"><Skeleton className="h-[340px] w-full rounded-2xl" /><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-48" />)}</div><StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">Find Your Perfect Hotel</h2><p className="text-muted-foreground mt-2">Enter a destination and dates to start searching.</p></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>Search Error</AlertTitle><AlertDescription>Failed to load search form. Please try again.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  return (
    <div className="space-y-0">
      {/* ── Hero Section ── */}
      <div className="relative" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #1a1a2e 100%)", minHeight: 340, overflow: "visible" }}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1200 400" fill="none">
            <line x1="0" y1="100" x2="1200" y2="300" stroke="#FF6000" strokeWidth="0.5" />
            <line x1="0" y1="300" x2="1200" y2="100" stroke="#FF6000" strokeWidth="0.5" />
            <circle cx="300" cy="200" r="120" stroke="#FF6000" strokeWidth="0.3" fill="none" />
            <circle cx="900" cy="150" r="80" stroke="#FF8C00" strokeWidth="0.3" fill="none" />
          </svg>
        </div>

        <div className="relative z-30 px-6 pt-8 pb-28">
          {/* Tagline */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Find Your Perfect Hotel</h1>
            <p className="text-gray-300 text-lg">Search across 50,000+ properties worldwide at exclusive B2B rates</p>
          </div>

          {/* ── Search Bar ── */}
          <div className="max-w-5xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-1.5 relative">
            {searchError && (
              <div className="px-4 py-2 mb-1">
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">{searchError}</AlertDescription>
                </Alert>
              </div>
            )}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center divide-x divide-gray-100 dark:divide-slate-700">
              {/* Destination */}
              <div className="relative px-4 py-3" ref={destRef}>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Destination</p>
                <div className="relative">
                  <MapPin className="absolute left-0 top-0.5 h-4 w-4 text-[#FF6000]" />
                  <input
                    className="w-full pl-6 text-sm font-medium bg-transparent outline-none placeholder:text-muted-foreground"
                    placeholder="City/Landmark/District/Hotel"
                    value={destination}
                    onChange={e => { setDestination(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => { setShowSuggestions(true); setShowDatePicker(false); setShowRoomPicker(false); setShowNationality(false); }}
                  />
                </div>
              </div>

              {/* Check-In */}
              <div className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors" onClick={() => { setDatePickerPhase("checkin"); setShowDatePicker(true); }}>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Check-In</p>
                <p className="text-sm font-medium">{formatDateShort(checkin)}</p>
              </div>

              {/* Check-Out */}
              <div className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors" onClick={() => { setDatePickerPhase("checkout"); setShowDatePicker(true); }}>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Check-Out</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{formatDateShort(checkout)}</p>
                  <Badge variant="secondary" className="text-[11px]">{nights} nights</Badge>
                </div>
              </div>

              {/* Rooms, Per Room */}
              <div className="relative" ref={roomPickerRef}>
                <div className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors" onClick={() => { setShowRoomPicker(!showRoomPicker); setShowDatePicker(false); }}>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Rooms, Per Room</p>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <span>{rooms} Rooms, {adults} Adults {parseInt(children) > 0 ? `${children} Children` : ""}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                  </div>
                </div>

                {showRoomPicker && (
                  <div className="absolute left-0 top-full mt-2 bg-white dark:bg-slate-800 border rounded-2xl shadow-2xl z-50 p-5 w-[280px]">
                    {/* Rooms */}
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm font-medium">Rooms</span>
                      <div className="flex items-center gap-3">
                        <button className="h-8 w-8 rounded-full border flex items-center justify-center text-muted-foreground hover:border-[#FF6000] hover:text-[#FF6000] disabled:opacity-30 transition-colors" disabled={parseInt(rooms) <= 1} onClick={() => setRooms(String(Math.max(1, parseInt(rooms) - 1)))}>−</button>
                        <span className="text-sm font-bold w-4 text-center">{rooms}</span>
                        <button className="h-8 w-8 rounded-full border flex items-center justify-center text-muted-foreground hover:border-[#FF6000] hover:text-[#FF6000] disabled:opacity-30 transition-colors" disabled={parseInt(rooms) >= 9} onClick={() => setRooms(String(Math.min(9, parseInt(rooms) + 1)))}>+</button>
                      </div>
                    </div>
                    {/* Adults */}
                    <div className="flex items-center justify-between py-3 border-t">
                      <div>
                        <span className="text-sm font-medium">Adults</span>
                        <span className="text-xs text-[#FF6000] ml-1">(Per Room)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="h-8 w-8 rounded-full border flex items-center justify-center text-muted-foreground hover:border-[#FF6000] hover:text-[#FF6000] disabled:opacity-30 transition-colors" disabled={parseInt(adults) <= 1} onClick={() => setAdults(String(Math.max(1, parseInt(adults) - 1)))}>−</button>
                        <span className="text-sm font-bold w-4 text-center">{adults}</span>
                        <button className="h-8 w-8 rounded-full border flex items-center justify-center text-muted-foreground hover:border-[#FF6000] hover:text-[#FF6000] disabled:opacity-30 transition-colors" disabled={parseInt(adults) >= 5} onClick={() => setAdults(String(Math.min(5, parseInt(adults) + 1)))}>+</button>
                      </div>
                    </div>
                    {/* Children */}
                    <div className="flex items-center justify-between py-3 border-t">
                      <div>
                        <span className="text-sm font-medium">Children</span>
                        <span className="text-xs text-[#FF6000] ml-1">(Per Room)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="h-8 w-8 rounded-full border flex items-center justify-center text-muted-foreground hover:border-[#FF6000] hover:text-[#FF6000] disabled:opacity-30 transition-colors" disabled={parseInt(children) <= 0} onClick={() => setChildren(String(Math.max(0, parseInt(children) - 1)))}>−</button>
                        <span className="text-sm font-bold w-4 text-center">{children}</span>
                        <button className="h-8 w-8 rounded-full border flex items-center justify-center text-muted-foreground hover:border-[#FF6000] hover:text-[#FF6000] disabled:opacity-30 transition-colors" disabled={parseInt(children) >= 4} onClick={() => setChildren(String(Math.min(4, parseInt(children) + 1)))}>+</button>
                      </div>
                    </div>
                    {/* Child Ages */}
                    {childrenNum > 0 && (
                      <div className="pt-3 border-t space-y-2">
                        <p className="text-sm font-medium">Child Age</p>
                        {childAges.map((age, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Child {i + 1}</span>
                            <select
                              className="border rounded-lg px-3 py-1.5 text-sm bg-background"
                              value={age}
                              onChange={e => setChildAges(prev => { const n = [...prev]; n[i] = parseInt(e.target.value); return n; })}
                            >
                              {["<1",1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map((a, idx) => (
                                <option key={idx} value={idx}>{a}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Nationality */}
              <div className="relative" ref={nationalityRef}>
                <div className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors" onClick={() => { setShowNationality(!showNationality); setShowDatePicker(false); setShowRoomPicker(false); setNationalitySearch(""); }}>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Nationality</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{nationality}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>

                {showNationality && (
                  <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 border rounded-2xl shadow-2xl z-50 w-[260px] py-2">
                    {/* Search */}
                    <div className="px-3 pb-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-lg bg-background outline-none focus:border-[#FF6000]"
                          placeholder="Search nationality..."
                          value={nationalitySearch}
                          onChange={e => setNationalitySearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>
                    {/* Popular */}
                    <p className="px-4 py-1 text-xs font-bold text-muted-foreground">Popular Nationalities</p>
                    <div className="max-h-[240px] overflow-auto">
                      {[
                        { code: "AU", name: "Australian" },
                        { code: "CN", name: "Chinese (Mainland)" },
                        { code: "ES", name: "Spanish" },
                        { code: "GB", name: "British" },
                        { code: "HK", name: "Chinese (Hong Kong)" },
                        { code: "JP", name: "Japanese" },
                        { code: "KR", name: "Korean" },
                        { code: "MY", name: "Malaysian" },
                        { code: "SG", name: "Singaporean" },
                        { code: "TH", name: "Thai" },
                        { code: "US", name: "American" },
                        { code: "VN", name: "Vietnamese" },
                        { code: "ID", name: "Indonesian" },
                        { code: "PH", name: "Filipino" },
                        { code: "IN", name: "Indian" },
                        { code: "TW", name: "Taiwanese" },
                        { code: "DE", name: "German" },
                        { code: "FR", name: "French" },
                      ].filter(n => !nationalitySearch || n.name.toLowerCase().includes(nationalitySearch.toLowerCase()) || n.code.toLowerCase().includes(nationalitySearch.toLowerCase()))
                      .map(n => (
                        <button
                          key={n.code}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-[#FF6000]/5 transition-colors flex items-center justify-between ${nationality === n.name ? "text-[#FF6000] font-semibold bg-[#FF6000]/5" : ""}`}
                          onClick={() => { setNationality(n.name); setShowNationality(false); }}
                        >
                          <span>{n.code} - {n.name}</span>
                          {nationality === n.name && <span className="text-[#FF6000]">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Search Button */}
              <div className="px-2 py-3">
                <button
                  onClick={handleSearch}
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all"
                  style={{ background: "linear-gradient(135deg, #FF6000, #FF8C00)" }}
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Destination Dropdown */}
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 border rounded-2xl shadow-2xl z-50 py-3">
                {!destination.trim() ? (
                  <>
                    {/* Empty state: Region tabs + city grid */}
                    <div className="flex gap-0 px-5 border-b">
                      {["Top Cities", "Southeast Asia", "Asia", "America", "Europe", "Oceania", "Mid East/Africa"].map(tab => (
                        <button key={tab} className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${destTab === tab ? "border-[#FF6000] text-[#FF6000]" : "border-transparent text-muted-foreground hover:text-foreground"}`} onMouseDown={() => setDestTab(tab)}>
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 px-5 py-3">
                      {(destTab === "Top Cities" ? ["Shanghai","Chengdu","Singapore","Seoul","Beijing","Hangzhou","Bali","Paris","Shenzhen","Macau","Hong Kong","Sydney","Guangzhou","Bangkok","Taipei","Melbourne","Xiamen","Phuket","Tokyo","Auckland","Nanjing","Koh Samui","Osaka","Dubai"]
                      : destTab === "Southeast Asia" ? ["Bangkok","Singapore","Bali","Phuket","Ho Chi Minh","Hanoi","Da Nang","Kuala Lumpur","Manila","Jakarta","Cebu","Chiang Mai","Pattaya","Koh Samui","Siem Reap","Phnom Penh"]
                      : destTab === "Asia" ? ["Seoul","Tokyo","Osaka","Beijing","Shanghai","Hong Kong","Taipei","Macau","Kyoto","Busan","Jeju","Fukuoka","Sapporo","Nagoya","Guangzhou","Shenzhen"]
                      : destTab === "America" ? ["New York","Los Angeles","San Francisco","Las Vegas","Miami","Chicago","Toronto","Vancouver","Cancun","Mexico City","Lima","Sao Paulo","Buenos Aires","Honolulu"]
                      : destTab === "Europe" ? ["London","Paris","Rome","Barcelona","Amsterdam","Berlin","Prague","Vienna","Zurich","Istanbul","Athens","Lisbon","Dublin","Madrid","Milan","Munich"]
                      : destTab === "Oceania" ? ["Sydney","Melbourne","Auckland","Gold Coast","Brisbane","Perth","Queenstown","Fiji","Cairns","Wellington"]
                      : ["Dubai","Abu Dhabi","Doha","Riyadh","Cairo","Marrakech","Cape Town","Johannesburg","Tel Aviv","Nairobi","Maldives","Mauritius"]
                      ).map(city => (
                        <button key={city} className="text-left text-sm py-1.5 hover:text-[#FF6000] transition-colors truncate" onMouseDown={() => selectCity(city)}>{city}</button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Search results: Region / Hotel / POI categories */}
                    {(() => {
                      const q = destination.toLowerCase();
                      const regionResults = [
                        { name: "Seoul", region: "South Korea", hotels: 2450 },
                        { name: "Singapore", region: "Singapore", hotels: 980 },
                        { name: "Shanghai", region: "China", hotels: 3450 },
                        { name: "Shenzhen", region: "China", hotels: 1200 },
                        { name: "Sydney", region: "Australia", hotels: 890 },
                        { name: "Sapporo", region: "Japan", hotels: 560 },
                        { name: "Siem Reap", region: "Cambodia", hotels: 340 },
                        { name: "Surabaya", region: "Indonesia", hotels: 280 },
                        { name: "Bangkok", region: "Thailand", hotels: 4200 },
                        { name: "Tokyo", region: "Japan", hotels: 3120 },
                        { name: "Osaka", region: "Japan", hotels: 1890 },
                        { name: "Hanoi", region: "Vietnam", hotels: 1560 },
                        { name: "Ho Chi Minh", region: "Vietnam", hotels: 2100 },
                        { name: "Bali", region: "Indonesia", hotels: 2800 },
                        { name: "Phuket", region: "Thailand", hotels: 1800 },
                        { name: "Da Nang", region: "Vietnam", hotels: 920 },
                      ].filter(r => r.name.toLowerCase().includes(q) || r.region.toLowerCase().includes(q));
                      const hotelResults = hotels.filter(h => h.name.toLowerCase().includes(q) || h.area.toLowerCase().includes(q));
                      const poiResults = [
                        { name: "Sukhumvit", city: "Bangkok", hotels: 1200 },
                        { name: "Shinjuku", city: "Tokyo", hotels: 450 },
                        { name: "Gangnam", city: "Seoul", hotels: 380 },
                        { name: "Sentosa", city: "Singapore", hotels: 85 },
                        { name: "Shibuya", city: "Tokyo", hotels: 320 },
                        { name: "Myeongdong", city: "Seoul", hotels: 210 },
                        { name: "Silom", city: "Bangkok", hotels: 180 },
                        { name: "Seminyak", city: "Bali", hotels: 560 },
                      ].filter(p => p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q));

                      return (
                        <div className="max-h-[360px] overflow-auto">
                          {/* Region */}
                          {regionResults.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 px-5 py-2">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-bold text-muted-foreground uppercase">Region</span>
                              </div>
                              {regionResults.slice(0, 4).map(r => (
                                <button key={r.name} className="w-full flex items-center justify-between px-5 py-2 hover:bg-[#FF6000]/5 transition-colors" onMouseDown={() => selectCity(r.name)}>
                                  <span className="text-sm">
                                    {r.name.split(new RegExp(`(${destination})`, "i")).map((part, i) =>
                                      part.toLowerCase() === destination.toLowerCase() ? <span key={i} className="text-[#FF6000] font-semibold">{part}</span> : part
                                    )}
                                    , {r.region}
                                  </span>
                                  <span className="text-xs font-semibold" style={{ color: "#FF6000" }}>{r.hotels.toLocaleString()} hotels nearby</span>
                                </button>
                              ))}
                            </div>
                          )}
                          {/* Hotel */}
                          {hotelResults.length > 0 && (
                            <div className="border-t mt-1 pt-1">
                              <div className="flex items-center gap-2 px-5 py-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-bold text-muted-foreground uppercase">Hotel</span>
                              </div>
                              {hotelResults.slice(0, 5).map(h => (
                                <button key={h.id} className="w-full flex items-center justify-between px-5 py-2 hover:bg-[#FF6000]/5 transition-colors" onMouseDown={() => { setDestination(h.name); setShowSuggestions(false); navigate(`/app/hotel/${h.id}`); }}>
                                  <span className="text-sm">
                                    {h.name.split(new RegExp(`(${destination})`, "i")).map((part, i) =>
                                      part.toLowerCase() === destination.toLowerCase() ? <span key={i} className="text-[#FF6000] font-semibold">{part}</span> : part
                                    )}
                                  </span>
                                  <span className="text-xs text-muted-foreground">{h.area}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          {/* POI */}
                          {poiResults.length > 0 && (
                            <div className="border-t mt-1 pt-1">
                              <div className="flex items-center gap-2 px-5 py-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-bold text-muted-foreground uppercase">POI</span>
                              </div>
                              {poiResults.slice(0, 4).map(p => (
                                <button key={p.name} className="w-full flex items-center justify-between px-5 py-2 hover:bg-[#FF6000]/5 transition-colors" onMouseDown={() => selectCity(p.name)}>
                                  <span className="text-sm">
                                    {p.name.split(new RegExp(`(${destination})`, "i")).map((part, i) =>
                                      part.toLowerCase() === destination.toLowerCase() ? <span key={i} className="text-[#FF6000] font-semibold">{part}</span> : part
                                    )}
                                    , {p.city}
                                  </span>
                                  <span className="text-xs font-semibold" style={{ color: "#FF6000" }}>{p.hotels} hotels nearby</span>
                                </button>
                              ))}
                            </div>
                          )}
                          {regionResults.length === 0 && hotelResults.length === 0 && poiResults.length === 0 && (
                            <p className="px-5 py-4 text-sm text-muted-foreground text-center">No results found for "{destination}"</p>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

            {/* Calendar Dropdown — floating overlay */}
            {showDatePicker && (
              <div ref={datePickerRef} className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border p-5 z-50">
                {/* Navigation */}
                <div className="flex items-center justify-between mb-1 px-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCalMonth(prev => prev.month === 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: prev.month - 1 })} className="h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={() => setCalMonth(prev => prev.month === 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: prev.month - 1 })} className="h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCalMonth(prev => nextMonth(prev.year, prev.month))} className="h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                      <ChevronRightIcon className="h-3 w-3" />
                    </button>
                    <button onClick={() => setCalMonth(prev => nextMonth(prev.year, prev.month))} className="h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Two months */}
                <div className="flex gap-8 justify-center" onMouseLeave={() => setHoverDate(null)}>
                  {renderCalendarMonth(calMonth.year, calMonth.month)}
                  {(() => { const nm = nextMonth(calMonth.year, calMonth.month); return renderCalendarMonth(nm.year, nm.month); })()}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Recent Searches ── */}
      {recentList.length > 0 && (
        <div className="px-6 -mt-6 relative z-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-3 gap-3">
              {recentList.map(rs => {
                /* 체크인이 오늘 이전이면 오늘 날짜로 보정 */
                const today = getTodayStr();
                const ci = rs.checkin < today ? today : rs.checkin;
                const originalNights = calcNights(rs.checkin, rs.checkout);
                const co = ci === rs.checkin ? rs.checkout : (() => { const d = new Date(ci); d.setDate(d.getDate() + Math.max(1, originalNights)); return d.toISOString().split("T")[0]; })();
                const displayCI = ci.slice(5); // MM-DD
                const displayCO = co.slice(5);
                return (
                  <div key={rs.id} className="group bg-white dark:bg-slate-800 border rounded-xl px-4 py-3 shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-between"
                    onClick={() => navigate(`/app/hotel/${rs.hotelId}?checkin=${ci}&checkout=${co}`)}>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{rs.hotel}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground">{displayCI} ~ {displayCO}</span>
                        <span className="text-xs font-bold" style={{ color: "#FF6000" }}>${rs.price}/night</span>
                      </div>
                    </div>
                    <button className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
                      onClick={(e) => { e.stopPropagation(); removeRecentSearch(rs.id); setRecentList(getRecentSearches()); }}>
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end mt-2">
              <button onClick={() => { clearRecentSearches(); setRecentList([]); }} className="text-xs text-muted-foreground hover:text-foreground underline">
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats Section ── */}
      <div className={`px-6 ${recentList.length > 0 ? "pt-4" : "pt-6"}`}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 border-l-4" style={{ borderLeftColor: "#009505" }}>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" style={{ color: "#009505" }} />
              Free Cancellation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="text-center">
                <p className="text-3xl font-bold">3</p>
                <p className="text-xs text-muted-foreground mt-1">Within 24 hours</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">7</p>
                <p className="text-xs text-muted-foreground mt-1">Within 3 days</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 border-l-4" style={{ borderLeftColor: "#FF6000" }}>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" style={{ color: "#FF6000" }} />
              Upcoming Bookings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="text-center">
                <p className="text-3xl font-bold">2</p>
                <p className="text-xs text-muted-foreground mt-1">Within 24 hours</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">5</p>
                <p className="text-xs text-muted-foreground mt-1">Within 3 days</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Campaigns / Promotions (기획전) ── */}
      <div className="px-6 pt-8 pb-2">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Recommended Accommodations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { id: "camp-1", title: "Big Discounts are LIVE", desc: "Great deals on hotels around the world", gradient: "from-amber-700 via-orange-600 to-yellow-500", icon: "🏷️", slug: "big-discounts" },
              { id: "camp-2", title: "DOTBIZ Pre-buy Hotels", desc: "Exclusive Inventory & Best Price Guarantee", gradient: "from-emerald-700 via-teal-600 to-cyan-500", icon: "💎", slug: "prebuy-hotels" },
              { id: "camp-3", title: "Market Manager's Choice", desc: "Recommended by our local DC team from 11 countries", gradient: "from-violet-700 via-purple-600 to-fuchsia-500", icon: "🏆", slug: "managers-choice" },
            ].map(camp => (
              <Card key={camp.id} className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md" onClick={() => navigate(`/app/campaign/${camp.slug}`)}>
                {/* Campaign Image */}
                <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${camp.gradient}`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-7xl opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500">{camp.icon}</span>
                  </div>
                  {/* Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-lg">{camp.icon}</span>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-[15px] group-hover:text-[#FF6000] transition-colors">{camp.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{camp.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* ── Trending Now (below Recommended) ── */}
      <div className="px-6 pt-4 pb-2">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-bold mb-3">Trending Now</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { text: "Spring Family Getaway!", isNew: true, slug: "spring-family-getaway" },
              { text: "Celebrate Cherry Blossom Season", isNew: true, slug: "cherry-blossom" },
              { text: "Discover Da Nang Charm", isNew: true, slug: "da-nang-charm" },
              { text: "Happy Songkran Festival!", isNew: true, slug: "songkran-festival" },
              { text: "Exclusive Stay Privileges", isNew: true, slug: "exclusive-stay" },
              { text: "Seoul Luxury Collection", isNew: false, slug: "seoul-luxury" },
              { text: "Eid al-Fitr Special Offer", isNew: true, slug: "eid-special" },
              { text: "Tokyo Sakura Tour", isNew: false, slug: "tokyo-sakura" },
              { text: "Start Your Spring Journey to Korea", isNew: false, slug: "spring-korea" },
              { text: "Explore the Wonders of Southeast Asia", isHot: true, slug: "southeast-asia" },
              { text: "Far East Hospitality's Best Deals", isFeatured: true, slug: "far-east-deals" },
              { text: "Engage-2026 Asia Roadshow", isNew: false, slug: "asia-roadshow" },
            ].map((tag: any, i) => (
              <button
                key={i}
                className={`px-3.5 py-1.5 rounded-full text-xs border transition-all hover:shadow-sm ${
                  tag.isFeatured ? "border-[#FF6000] text-[#FF6000] hover:bg-[#FF6000]/5" :
                  tag.isHot ? "border-red-300 text-red-600 hover:bg-red-50" :
                  "border-gray-200 dark:border-slate-600 hover:border-[#FF6000]/40"
                }`}
                onClick={() => navigate(`/app/campaign/${tag.slug}`)}
              >
                {tag.text}
                {tag.isNew && <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}>NEW</span>}
                {tag.isHot && <span className="ml-1 text-[10px]">🔥</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Favorite Hotels ── */}
      {favoriteHotels.length > 0 && (
        <div className="px-6 pt-8 pb-2">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
              My Favorite Hotels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {favoriteHotels.map(h => (
                <Card key={h.id} className="group flex items-center gap-4 p-4 cursor-pointer hover:shadow-lg transition-all hover:border-[#FF6000]/30" onClick={() => navigate(`/app/hotel/${h.id}`)}>
                  <div className="h-16 w-16 rounded-xl shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FF6000, #FF8C00)" }}>
                    <Building2 className="h-7 w-7 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm truncate group-hover:text-[#FF6000] transition-colors">{h.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{h.area}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">{Array.from({ length: h.starRating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}</div>
                      <span className="text-xs font-bold" style={{ color: "#FF6000" }}>${h.price}/night</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Popular Destinations ── */}
      <div className="px-6 pt-8 pb-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5" style={{ color: "#FF6000" }} />
            Popular Destinations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularCities.map(c => (
              <button
                key={c.name}
                className="group relative rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 h-44"
                onClick={() => { setDestination(c.name); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              >
                {/* Background gradient as landmark visual */}
                <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} group-hover:scale-105 transition-transform duration-500`} />
                {/* Landmark emoji as large watermark */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500">{c.landmark}</span>
                </div>
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Content */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between text-white text-left">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/20 backdrop-blur-sm">{c.hotels.toLocaleString()} hotels</span>
                  </div>
                  <div>
                    <p className="text-xs opacity-80 mb-0.5">{c.desc}</p>
                    <h3 className="text-lg font-bold leading-tight">{c.name}</h3>
                    <p className="text-xs opacity-80">{c.country}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hotel Gallery (Marketing / SNS / Blog) ── */}
      <div className="px-6 pt-6 pb-2">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Flame className="h-5 w-5" style={{ color: "#FF6000" }} />
              Hotel Gallery
            </h2>
            <span className="text-xs text-muted-foreground">Curated picks · Updated weekly</span>
          </div>

          {/* Main Gallery: Hero + Side */}
          <div className="grid grid-cols-[1fr_320px] gap-4">
            {/* Hero Article → Blog */}
            <div className="group cursor-pointer rounded-xl overflow-hidden relative h-80" onClick={() => navigate("/app/blog/blog-001")}>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="h-28 w-28 text-white/8" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white" style={{ background: "#FF6000" }}>🔥 HOT</span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-white/20 backdrop-blur-sm">New Opening</span>
              </div>
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-xs opacity-70 mb-1">{hotels[0].area} · {hotels[0].starRating}★ · Featured Story</p>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-orange-300 transition-colors">{hotels[0].name}</h3>
                <p className="text-sm opacity-80 line-clamp-2">{hotels[0].description}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">View more →</span>
                  <span className="text-xs opacity-60">📸 12 photos · 💬 8 reviews</span>
                </div>
              </div>
            </div>

            {/* Side Article Cards */}
            <div className="space-y-3">
              {hotels.slice(1, 4).map((h, i) => {
                const labels = ["🏆 Editor's Pick", "📸 Instagram Famous", "✨ Newly Renovated"];
                const gradients = ["from-emerald-800 to-teal-600", "from-rose-800 to-pink-600", "from-amber-800 to-orange-600"];
                const blogIds = ["blog-002", "blog-003", "blog-004"];
                return (
                  <div key={h.id} className="group cursor-pointer rounded-xl overflow-hidden relative h-[96px]" onClick={() => navigate(`/app/blog/${blogIds[i]}`)}>
                    <div className={`absolute inset-0 bg-gradient-to-r ${gradients[i]} group-hover:scale-105 transition-transform duration-500`} />
                    <div className="absolute inset-0 flex items-center justify-end pr-4">
                      <Building2 className="h-12 w-12 text-white/10" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                    <div className="absolute inset-0 p-3.5 flex flex-col justify-between text-white">
                      <span className="text-[10px] font-medium opacity-70">{labels[i]}</span>
                      <div>
                        <h4 className="text-sm font-bold truncate group-hover:text-orange-200 transition-colors">{h.name}</h4>
                        <p className="text-[11px] opacity-70 truncate">{h.area} · From ${h.price}/night</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom banner */}
          <div className="mt-4 rounded-xl overflow-hidden relative h-28 cursor-pointer group" onClick={() => navigate("/app/search-results")}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6000] via-orange-500 to-amber-400 group-hover:scale-[1.02] transition-transform duration-500" />
            <div className="absolute inset-0 flex items-center justify-between px-8 text-white">
              <div>
                <h3 className="text-xl font-bold">Singapore Spring Sale</h3>
                <p className="text-sm opacity-90">Curated Hotel Styles For Memorable Experience</p>
              </div>
              <span className="px-5 py-2 rounded-full bg-white text-[#FF6000] font-bold text-sm hover:bg-white/90 transition-colors">Book Now ▶</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Promo Banner (기획전 배너) ── */}
      <div className="px-6 pt-8 pb-8">
        <div className="max-w-5xl mx-auto">
          <div
            className="relative rounded-2xl overflow-hidden cursor-pointer group"
            style={{ height: 240 }}
            onClick={() => navigate("/app/campaign/big-discounts")}
          >
            {/* Background — tropical resort style gradient */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #155e75 25%, #0f766e 50%, #134e4a 75%, #064e3b 100%)" }} />
            {/* Decorative shapes */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -right-10 -top-10 w-72 h-72 rounded-full opacity-10" style={{ background: "#FF6000" }} />
              <div className="absolute -left-10 -bottom-20 w-60 h-60 rounded-full opacity-10" style={{ background: "#009505" }} />
              {/* Palm/resort silhouettes */}
              <div className="absolute right-8 bottom-0 flex gap-3 items-end opacity-15">
                {["🌴","🏖️","🌴","🏨","🌴"].map((e, i) => (
                  <span key={i} className="text-6xl" style={{ transform: `translateY(${i % 2 === 0 ? 8 : 0}px)` }}>{e}</span>
                ))}
              </div>
            </div>
            {/* Text content */}
            <div className="absolute inset-0 flex items-center px-10">
              <div className="max-w-lg">
                <p className="text-sm font-semibold tracking-widest mb-3" style={{ color: "#FF8C00" }}>DOTBIZ EXCLUSIVE</p>
                <h2 className="text-4xl font-black text-white leading-tight mb-2">
                  Singapore Spring Sale
                </h2>
                <p className="text-lg text-white/70 mb-5">Curated Hotel Styles For Memorable Experience</p>
                <Button
                  size="lg"
                  className="rounded-full px-8 text-white font-bold shadow-lg group-hover:shadow-xl transition-all"
                  style={{ background: "#FF6000" }}
                >
                  Book Now <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
            {/* Far East Hospitality logo area */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 text-right hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
                <p className="text-white/60 text-xs mb-1">Powered by</p>
                <p className="text-white font-bold text-lg">OhMyHotel&Co</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
