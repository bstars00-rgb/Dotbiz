import { useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import DestinationSearch from "@/components/DestinationSearch";
import DateRangePicker from "@/components/DateRangePicker";
import {
  Search, Star, MapPin, Heart, ChevronLeft, ChevronRight, Filter,
  RefreshCw, Building2, Wifi, Coffee, Car, Waves, Dumbbell,
  ArrowUpDown, Map, List, ChevronDown, ChevronUp, X,
  BedDouble, Users, UtensilsCrossed, Sparkles, ShieldCheck, Clock,
  Bed, Bath, Wind, Tv, ParkingCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useScreenState } from "@/hooks/useScreenState";
import { StateToolbar } from "@/components/StateToolbar";
import { hotels } from "@/mocks/hotels";
import { hotelPointsBoost } from "@/mocks/rewards";

const ITEMS_PER_PAGE = 10;

const amenityIconMap: Record<string, any> = {
  Pool: Waves, Spa: Sparkles, WiFi: Wifi, Gym: Dumbbell,
  Restaurant: UtensilsCrossed, Bar: Coffee, "Business Center": Tv,
  Concierge: ShieldCheck, Laundry: Wind, Casino: Star,
  Beach: Waves, Yoga: Sparkles, "Free Parking": ParkingCircle,
};

/* Mock room info per hotel */
function getRoomInfo(hotelId: string) {
  const rooms = [
    { type: "Deluxe Double", bed: "Double", icon: BedDouble, guests: 2, size: 32, meal: "Breakfast included", cancelFree: true },
    { type: "Superior Twin", bed: "Twin", icon: Bed, guests: 2, size: 28, meal: "Room only", cancelFree: false },
    { type: "Grand Suite", bed: "King", icon: BedDouble, guests: 3, size: 55, meal: "Breakfast included", cancelFree: true },
    { type: "Standard Double", bed: "Double", icon: BedDouble, guests: 2, size: 25, meal: "Room only", cancelFree: true },
    { type: "Executive Twin", bed: "Twin", icon: Bed, guests: 2, size: 35, meal: "Breakfast included", cancelFree: false },
  ];
  const idx = parseInt(hotelId.replace(/\D/g, "")) % rooms.length;
  return rooms[idx];
}

const sortOptions = [
  { key: "hot", label: "Hot" },
  { key: "featured", label: "Featured" },
  { key: "favorite", label: "Favorite" },
  { key: "price-low", label: "Price Lowest" },
  { key: "price-high", label: "Price Highest" },
  { key: "star-low", label: "Star Lowest" },
  { key: "star-high", label: "Star Highest" },
];

const locationsByCity: Record<string, string[]> = {
  Seoul: ["Gangnam", "Myeongdong", "Hongdae", "Itaewon", "Jongno", "Yeouido", "COEX", "Seoul Station"],
  Busan: ["Haeundae", "Seomyeon", "Nampo-dong", "Gwangalli", "Centum City", "Jagalchi", "Songjeong"],
  Jeju: ["Jeju City", "Seogwipo", "Hallim", "Jungmun", "Aewol", "Udo Island"],
  Tokyo: ["Shinjuku", "Ginza", "Shibuya", "Roppongi", "Asakusa", "Ikebukuro", "Akihabara", "Odaiba"],
  Osaka: ["Namba", "Umeda", "Shinsaibashi", "Tennoji", "Shin-Osaka", "Dotonbori", "Nishi-Shinjuku"],
  Kyoto: ["Gion", "Kawaramachi", "Kyoto Station", "Arashiyama", "Higashiyama", "Fushimi"],
  Bangkok: ["Sukhumvit", "Silom", "Siam", "Khao San", "Riverside", "Pratunam", "Sathorn", "Thonglor"],
  Phuket: ["Patong", "Kata", "Karon", "Kamala", "Bangtao", "Rawai", "Surin Beach"],
  "Chiang Mai": ["Old City", "Nimmanhaemin", "Night Bazaar", "Riverside", "Santitham", "Chang Phueak"],
  "Hong Kong": ["Tsim Sha Tsui", "Central", "Causeway Bay", "Mongkok", "Wan Chai", "Admiralty", "Jordan"],
  Shanghai: ["The Bund", "Pudong", "Jing'an", "French Concession", "Lujiazui", "Hongqiao", "Nanjing Road"],
  Beijing: ["Wangfujing", "Chaoyang", "Dongcheng", "Xicheng", "Sanlitun", "Haidian", "CBD"],
  Taipei: ["Xinyi", "Zhongshan", "Ximending", "Da'an", "Songshan", "Shilin", "Banqiao"],
  Singapore: ["Marina Bay", "Orchard", "Sentosa", "Chinatown", "Clarke Quay", "Bugis", "Jurong East"],
  "Ho Chi Minh": ["District 1", "District 3", "District 7", "Binh Thanh", "Phu Nhuan", "Thu Duc"],
  Hanoi: ["Old Quarter", "Hoan Kiem", "Ba Dinh", "Tay Ho", "Dong Da", "Hai Ba Trung"],
  Dubai: ["Downtown", "Jumeirah", "Marina", "Deira", "Palm Jumeirah", "Business Bay", "JBR", "Al Barsha"],
  London: ["Westminster", "Kensington", "Soho", "Mayfair", "Covent Garden", "South Bank", "Shoreditch"],
  Paris: ["Champs-Elysees", "Le Marais", "Montmartre", "Saint-Germain", "Opera", "Bastille", "Trocadero"],
  "New York": ["Manhattan", "Times Square", "SoHo", "Brooklyn", "Midtown", "Upper East Side", "Chelsea"],
  Sydney: ["CBD", "Darling Harbour", "Bondi", "Surry Hills", "Circular Quay", "Manly", "Newtown"],
  Bali: ["Seminyak", "Ubud", "Kuta", "Nusa Dua", "Canggu", "Jimbaran", "Uluwatu", "Sanur"],
};

function getLocationFilters(query: string): string[] {
  const q = query.toLowerCase();
  for (const [city, locations] of Object.entries(locationsByCity)) {
    if (q.includes(city.toLowerCase())) return locations;
  }
  return locationsByCity.Seoul; // default
}

const starFilters = [
  { label: "Economy", value: 2 },
  { label: "3 Star/Comfort", value: 3 },
  { label: "4 Star/Premium", value: 4 },
  { label: "5 Star/Luxury", value: 5 },
];

const featureFilters = [
  "Amazing Swimming Pool", "Family", "KTV", "Free Parking",
  "Kids' Playground", "Water Park", "Stylish Hotel", "Indoor Pool",
  "Spa", "Gym", "Restaurant", "Free WiFi", "Business Center", "Bar",
  "Pet Friendly", "EV Charging", "Rooftop Bar", "Airport Shuttle",
];

const brandFilters = [
  "Independent", "Marriott", "Hilton", "IHG", "Hyatt", "Accor",
  "Jin Jiang Hotels", "CN Atour", "ManKeYun", "QingHotel", "CN Rezen",
  "CN Green Tree Inn Hotels", "Ibis", "Best Western", "Radisson",
  "Novotel", "Sheraton", "Wyndham", "Four Seasons", "Shangri-La",
];

const promotionFilters = ["Gift Box", "Promotion"];
const pointsFilters = ["Multiple Points"];

const priceRanges = [
  { label: "Less than $100", min: 0, max: 100 },
  { label: "$100 ~ $200", min: 100, max: 200 },
  { label: "$200 ~ $350", min: 200, max: 350 },
  { label: "$350 ~ $500", min: 350, max: 500 },
  { label: "$500+", min: 500, max: 9999 },
];

export default function SearchResultsPage() {
  const { state, setState } = useScreenState("success");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "Seoul";
  const [sortBy, setSortBy] = useState("hot");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [favorites, setFavorites] = useState<Set<string>>(new Set(hotels.filter(h => h.isFavorite).map(h => h.id)));

  /* Search bar state */
  const [searchBarDest, setSearchBarDest] = useState(searchQuery + " (and vicinity)");
  const [barCheckIn, setBarCheckIn] = useState(searchParams.get("checkin") || "2026-03-30");
  const [barCheckOut, setBarCheckOut] = useState(searchParams.get("checkout") || "2026-04-01");
  const [barRooms, setBarRooms] = useState(searchParams.get("rooms") || "1");
  const [barAdults, setBarAdults] = useState(searchParams.get("adults") || "2");
  const [barChildren, setBarChildren] = useState(searchParams.get("children") || "0");
  /* Nationality는 검색창에서 제거 — 예약 페이지에서 traveler별로 직접 입력. */
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const dateParams = `&checkin=${barCheckIn}&checkout=${barCheckOut}`;
  const handleBarSelectCity = (city: string) => { navigate(`/app/search-results?q=${encodeURIComponent(city)}${dateParams}`); };
  const handleBarSelectHotel = (hId: string) => { window.open(`${baseUrl}#/app/hotel/${hId}?checkin=${barCheckIn}&checkout=${barCheckOut}`, "_blank"); };
  const handleBarSearch = () => {
    const q = searchBarDest.replace(/\s*\(and vicinity\)\s*/i, "").trim();
    const matched = hotels.find(h => h.name.toLowerCase() === q.toLowerCase());
    if (matched) window.open(`${baseUrl}#/app/hotel/${matched.id}?checkin=${barCheckIn}&checkout=${barCheckOut}`, "_blank");
    else navigate(`/app/search-results?q=${encodeURIComponent(q)}${dateParams}`);
  };

  /* Hotel detail — open in new tab */
  const handleHotelClick = useCallback((_id: string, _name: string) => {
    window.open(`${window.location.origin}${window.location.pathname}#/app/hotel/${_id}?checkin=${barCheckIn}&checkout=${barCheckOut}`, "_blank");
  }, [barCheckIn, barCheckOut]);

  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({ location: true, star: true, price: true, feature: false, brand: false, promotion: false, points: false });

  /* ── Filter selections ── */
  const [nameSearch, setNameSearch] = useState("");
  const [selLocations, setSelLocations] = useState<Set<string>>(new Set());
  const [selStars, setSelStars] = useState<Set<number>>(new Set());
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(9999);
  const [selFeatures, setSelFeatures] = useState<Set<string>>(new Set());
  const [selBrands, setSelBrands] = useState<Set<string>>(new Set());
  const [selPromotions, setSelPromotions] = useState<Set<string>>(new Set());
  const [selPoints, setSelPoints] = useState(false);

  const toggleSet = <T,>(setter: React.Dispatch<React.SetStateAction<Set<T>>>, value: T) => {
    setter(prev => { const n = new Set(prev); n.has(value) ? n.delete(value) : n.add(value); return n; });
    setPage(1);
  };

  const toggleFilter = (key: string) => setExpandedFilters(p => ({ ...p, [key]: !p[key] }));

  const activeFilterCount = (nameSearch ? 1 : 0) + selLocations.size + selStars.size + (priceMin > 0 || priceMax < 9999 ? 1 : 0) + selFeatures.size + selBrands.size + selPromotions.size + (selPoints ? 1 : 0);

  const clearAllFilters = () => {
    setNameSearch(""); setSelLocations(new Set()); setSelStars(new Set());
    setPriceMin(0); setPriceMax(9999);
    setSelFeatures(new Set()); setSelBrands(new Set()); setSelPromotions(new Set()); setSelPoints(false);
    setPage(1);
  };

  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };


  /* Filter by search query + active filters */
  const filteredByQuery = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let result = hotels.filter(h =>
      h.area.toLowerCase().includes(q) ||
      h.name.toLowerCase().includes(q)
    );
    if (result.length === 0) result = [...hotels];

    if (nameSearch) { const ns = nameSearch.toLowerCase(); result = result.filter(h => h.name.toLowerCase().includes(ns)); }
    if (selLocations.size > 0) result = result.filter(h => Array.from(selLocations).some(loc => h.area.toLowerCase().includes(loc.toLowerCase())));
    if (selStars.size > 0) result = result.filter(h => selStars.has(Math.floor(h.starRating)));
    if (priceMin > 0 || priceMax < 9999) result = result.filter(h => h.price >= priceMin && h.price <= priceMax);
    if (selFeatures.size > 0) result = result.filter(h => Array.from(selFeatures).some(f => h.features.includes(f)));
    if (selBrands.size > 0) result = result.filter(h => selBrands.has(h.brand));
    if (selPromotions.size > 0) result = result.filter(h => Array.from(selPromotions).some(p => h.promotion.includes(p)));
    if (selPoints) result = result.filter(h => h.multiplePoints || !!hotelPointsBoost(h.id));

    return result;
  }, [searchQuery, nameSearch, selLocations, selStars, priceMin, priceMax, selFeatures, selBrands, selPromotions, selPoints]);

  /* Sort hotels */
  const sorted = [...filteredByQuery].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "star-low") return a.starRating - b.starRating;
    if (sortBy === "star-high") return b.starRating - a.starRating;
    if (sortBy === "featured") return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    if (sortBy === "favorite") return (favorites.has(b.id) ? 1 : 0) - (favorites.has(a.id) ? 1 : 0);
    return b.reviewScore - a.reviewScore; // hot = by review
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paged = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (state === "loading") return (<div className="p-6 space-y-4"><Skeleton className="h-14 w-full" /><Skeleton className="h-10 w-60" /><div className="grid grid-cols-1 md:grid-cols-4 gap-4"><Skeleton className="h-96 col-span-1" /><Skeleton className="h-96 col-span-3" /></div><StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">No Hotels Found</h2><p className="text-muted-foreground mt-2">No hotels match your search criteria. Please try different conditions.</p><Button className="mt-4" onClick={() => navigate("/app/find-hotel")}><Search className="h-4 w-4 mr-2" />Modify Search</Button></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>Search Error</AlertTitle><AlertDescription>Failed to load search results. Please try again.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb + Search bar */}
      <div className="border-b bg-card px-6 py-3 shrink-0">
        <p className="text-xs text-muted-foreground mb-2">
          <span className="cursor-pointer hover:text-foreground" onClick={() => navigate("/app/find-hotel")}>Find Hotel</span>
          {" / "}
          <span className="text-foreground font-medium">{searchQuery} (and vicinity)</span>
        </p>
        <div className="flex items-stretch rounded-2xl border shadow-sm bg-card relative">
          {/* Destination */}
          <div className="flex-1 min-w-0 px-5 py-3 border-r hover:bg-muted/40 transition-colors">
            <DestinationSearch
              value={searchBarDest}
              onChange={setSearchBarDest}
              onSelectCity={handleBarSelectCity}
              onSelectHotel={handleBarSelectHotel}
            />
          </div>
          {/* Check-In / Check-Out */}
          <DateRangePicker checkIn={barCheckIn} checkOut={barCheckOut} onCheckInChange={setBarCheckIn} onCheckOutChange={setBarCheckOut} />
          {/* Rooms, Per Room */}
          <div className="px-4 py-3 border-r hover:bg-muted/40 transition-colors">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Rooms, Per Room</p>
            <div className="flex items-center gap-1 text-sm font-medium">
              <span>{barRooms} Rooms, {barAdults} Adults{parseInt(barChildren) > 0 ? ` ${barChildren} Children` : ""}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
            </div>
          </div>
          {/* Search Button */}
          <div className="flex items-center px-4">
            <Button className="h-11 w-11 rounded-full shrink-0 shadow-md" size="icon" style={{ background: "#FF6000" }} onClick={handleBarSearch} aria-label="Search">
              <Search className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar — Map + Filters */}
        <ScrollArea className="w-72 shrink-0 border-r">
          <div className="p-4 space-y-5">
            {/* Reset All Filters */}
            {activeFilterCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active</span>
                <Button variant="outline" size="xs" className="text-xs" onClick={clearAllFilters}>
                  <X className="h-3 w-3 mr-1" />Reset All
                </Button>
              </div>
            )}

            {/* Search by Property Name */}
            <div>
              <h4 className="text-sm font-bold mb-2">Search by Property Name</h4>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g. HIL"
                  value={nameSearch}
                  onChange={e => { setNameSearch(e.target.value); setPage(1); }}
                  className="w-full border rounded-lg px-3 py-2 pl-8 text-sm bg-background"
                />
              </div>
            </div>

            {/* Mini Map — click to open map search */}
            <div className="rounded-xl overflow-hidden border bg-muted/30 cursor-pointer" onClick={() => window.open(`${baseUrl}#/app/map-search?q=${encodeURIComponent(searchQuery)}&checkin=${barCheckIn}&checkout=${barCheckOut}`, "_blank")}>
              <div className="h-40 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center relative hover:opacity-80 transition-opacity">
                <Map className="h-10 w-10 text-muted-foreground/30" />
                <p className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded">Search in map</p>
                {[{t:25,l:30},{t:40,l:55},{t:60,l:35},{t:35,l:70},{t:55,l:60}].map((pos, i) => (
                  <div key={i} className="absolute h-5 w-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shadow-md" style={{ top: `${pos.t}%`, left: `${pos.l}%`, background: "#FF6000" }}>{i + 1}</div>
                ))}
              </div>
            </div>

            {/* Hotel Location */}
            <FilterSection title="Hotel Location" expanded={expandedFilters.location} onToggle={() => toggleFilter("location")}>
              <div className="flex flex-wrap gap-1.5">
                {getLocationFilters(searchQuery).map(loc => (
                  <button key={loc} onClick={() => toggleSet(setSelLocations, loc)} className={`px-2.5 py-1 text-xs border rounded-md transition-colors ${selLocations.has(loc) ? "border-[#FF6000] text-[#FF6000] bg-[#FF6000]/10" : "hover:border-[#FF6000] hover:text-[#FF6000]"}`}>{loc}</button>
                ))}
              </div>
            </FilterSection>

            {/* Star Rating */}
            <FilterSection title="Star" expanded={expandedFilters.star} onToggle={() => toggleFilter("star")}>
              <div className="flex flex-wrap gap-1.5">
                {starFilters.map(sf => (
                  <button key={sf.value} onClick={() => toggleSet(setSelStars, sf.value)} className={`px-2.5 py-1 text-xs border rounded-md transition-colors ${selStars.has(sf.value) ? "border-[#FF6000] text-[#FF6000] bg-[#FF6000]/10" : "hover:border-[#FF6000] hover:text-[#FF6000]"}`}>{sf.label}</button>
                ))}
              </div>
            </FilterSection>

            {/* Price/Night — Slider */}
            <FilterSection title="Price/Night" expanded={expandedFilters.price} onToggle={() => toggleFilter("price")}>
              {(() => {
                const allPrices = hotels.map(h => h.price);
                const minP = Math.floor(Math.min(...allPrices));
                const maxP = Math.ceil(Math.max(...allPrices));
                return (
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>USD {(priceMin || minP).toLocaleString()}</span>
                      <span>USD {(priceMax < 9999 ? priceMax : maxP).toLocaleString()}</span>
                    </div>
                    <div className="relative h-6 mt-1 px-2">
                      <div className="absolute top-2.5 left-2 right-2 h-1 bg-muted rounded-full" />
                      <div className="absolute top-2.5 h-1 rounded-full" style={{ left: `${((priceMin - minP) / (maxP - minP)) * 100}%`, right: `${100 - (((priceMax < 9999 ? priceMax : maxP) - minP) / (maxP - minP)) * 100}%`, background: "#FF6000" }} />
                      <input type="range" aria-label="Minimum price" min={minP} max={maxP} value={priceMin || minP} onChange={e => { setPriceMin(Number(e.target.value)); setPage(1); }} className="absolute w-full top-0 h-6 appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF6000] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer" />
                      <input type="range" aria-label="Maximum price" min={minP} max={maxP} value={priceMax < 9999 ? priceMax : maxP} onChange={e => { setPriceMax(Number(e.target.value)); setPage(1); }} className="absolute w-full top-0 h-6 appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF6000] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer" />
                    </div>
                  </div>
                );
              })()}
            </FilterSection>

            {/* Hotel Features */}
            <FilterSection title="Hotel Features" expanded={expandedFilters.feature} onToggle={() => toggleFilter("feature")}>
              <div className="flex flex-wrap gap-1.5">
                {featureFilters.slice(0, 8).map(f => (
                  <button key={f} onClick={() => toggleSet(setSelFeatures, f)} className={`px-2.5 py-1 text-xs border rounded-md transition-colors ${selFeatures.has(f) ? "border-[#FF6000] text-[#FF6000] bg-[#FF6000]/10" : "hover:border-[#FF6000] hover:text-[#FF6000]"}`}>{f}</button>
                ))}
                <button className="px-2.5 py-1 text-xs text-muted-foreground">More({featureFilters.length - 8 + 10}) ▼</button>
              </div>
            </FilterSection>

            {/* Hotel Brand */}
            <FilterSection title="Hotel Brand" expanded={expandedFilters.brand} onToggle={() => toggleFilter("brand")}>
              <div className="flex flex-wrap gap-1.5">
                {brandFilters.slice(0, 8).map(b => (
                  <button key={b} onClick={() => toggleSet(setSelBrands, b)} className={`px-2.5 py-1 text-xs border rounded-md transition-colors ${selBrands.has(b) ? "border-[#FF6000] text-[#FF6000] bg-[#FF6000]/10" : "hover:border-[#FF6000] hover:text-[#FF6000]"}`}>{b}</button>
                ))}
                <button className="px-2.5 py-1 text-xs text-muted-foreground">More({brandFilters.length - 8 + 103}) ▼</button>
              </div>
            </FilterSection>

            {/* Hotel Promotion */}
            <FilterSection title="Hotel Promotion" expanded={expandedFilters.promotion} onToggle={() => toggleFilter("promotion")}>
              <div className="flex flex-wrap gap-1.5">
                {promotionFilters.map(p => (
                  <button key={p} onClick={() => toggleSet(setSelPromotions, p)} className={`px-2.5 py-1 text-xs border rounded-md transition-colors ${selPromotions.has(p) ? "border-[#FF6000] text-[#FF6000] bg-[#FF6000]/10" : "hover:border-[#FF6000] hover:text-[#FF6000]"}`}>{p}</button>
                ))}
              </div>
            </FilterSection>

            {/* Multiple Points */}
            <FilterSection title="Multiple Points" expanded={expandedFilters.points} onToggle={() => toggleFilter("points")}>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => { setSelPoints(!selPoints); setPage(1); }} className={`px-2.5 py-1 text-xs border rounded-md transition-colors ${selPoints ? "border-[#FF6000] text-[#FF6000] bg-[#FF6000]/10" : "hover:border-[#FF6000] hover:text-[#FF6000]"}`}>Multiple Points</button>
              </div>
            </FilterSection>
          </div>
        </ScrollArea>

        {/* Right — Results */}
        <ScrollArea className="flex-1">
          <div className="p-5">
            {/* Results count + Sort tabs */}
            <div className="mb-4">
              <p className="text-lg font-bold">
                <span style={{ color: "#FF6000" }}>{sorted.length.toLocaleString()}</span>
                <span className="text-sm font-normal text-muted-foreground ml-2">hotels meet the current condition. Unavailable hotels are filtered out</span>
                {activeFilterCount > 0 && <Button variant="ghost" size="xs" className="ml-2 text-xs text-destructive" onClick={clearAllFilters}><X className="h-3 w-3 mr-1" />Clear filters ({activeFilterCount})</Button>}
              </p>
              <div className="flex items-center gap-1 mt-3 border-b">
                {sortOptions.map(opt => (
                  <button
                    key={opt.key}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${sortBy === opt.key ? "border-[#FF6000] text-[#FF6000]" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    onClick={() => { setSortBy(opt.key); setPage(1); }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hotel Cards */}
            <div className="space-y-4">
              {paged.map((h, idx) => {
                const globalIdx = (page - 1) * ITEMS_PER_PAGE + idx + 1;
                return (
                  <Card key={h.id} className="overflow-hidden card-hover cursor-pointer" onClick={() => handleHotelClick(h.id, h.name)}>
                    <div className="flex">
                      {/* Image Area */}
                      <div className="relative w-56 h-48 shrink-0 overflow-hidden" style={{ background: `linear-gradient(135deg, ${h.starRating >= 5 ? "#1a1a2e, #16213e" : "#2d3748, #4a5568"})` }}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building2 className="h-14 w-14 text-white/15" />
                        </div>
                        {/* Number badge */}
                        <div className="absolute top-3 left-3 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#FF6000" }}>
                          {globalIdx}
                        </div>
                        {/* Chain badge */}
                        {h.isFeatured && (
                          <div className="absolute top-3 left-12 px-2 py-0.5 rounded text-[10px] font-bold text-white" style={{ background: "#0891b2" }}>
                            Featured
                          </div>
                        )}
                        {/* Favorite */}
                        <button
                          className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors"
                          onClick={e => { e.stopPropagation(); toggleFav(h.id); }}
                        >
                          <Heart className={`h-3.5 w-3.5 ${favorites.has(h.id) ? "fill-red-500 text-red-500" : "text-white"}`} />
                        </button>
                        {/* Image count */}
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                          1/{Math.floor(Math.random() * 40) + 10}
                        </div>
                        {/* Nav arrows */}
                        <button className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors" onClick={e => e.stopPropagation()}>
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors" onClick={e => e.stopPropagation()}>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="flex-1 p-4 min-w-0 flex flex-col">
                        {/* Top row: name + star */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-base hover:text-[#FF6000] transition-colors truncate">{h.name}</h3>
                          <div className="shrink-0 flex items-center gap-1.5">
                            <span className="text-sm font-medium">{h.starRating}</span>
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {h.reviewScore >= 4 && (
                              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ background: h.reviewScore >= 9 ? "#009505" : "#0891b2" }}>
                                {(h.reviewScore / 2).toFixed(0)}/5
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Address */}
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {h.area}, {searchQuery} (and vicinity)
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {h.hasFreeCancellation && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ color: "#009505", background: "#ecfdf5", border: "1px solid #bbf7d0" }}>Free Cancellation</span>
                          )}
                          {(() => {
                            const boost = hotelPointsBoost(h.id);
                            if (boost) {
                              return (
                                <span
                                  className="px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 animate-pulse"
                                  style={{
                                    color: "#fff",
                                    background: boost.multiplier >= 1.2 ? "linear-gradient(90deg,#EF476F,#FF6000)" : boost.multiplier >= 1.15 ? "linear-gradient(90deg,#FF6000,#FFD166)" : "linear-gradient(90deg,#8b5cf6,#a855f7)",
                                    border: "1px solid rgba(0,0,0,0.1)",
                                    boxShadow: "0 1px 4px rgba(255,96,0,0.3)",
                                  }}
                                  title={`${boost.label} — ${boost.reason} · Expires ${boost.expiresAt}`}
                                >
                                  ⚡ {boost.label}
                                </span>
                              );
                            }
                            if (h.multiplePoints) {
                              return (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe" }}>Multiple Points</span>
                              );
                            }
                            return null;
                          })()}
                          {h.promotion.map(p => (
                            <span key={p} className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ color: "#db2777", background: "#fdf2f8", border: "1px solid #fbcfe8" }}>{p}</span>
                          ))}
                          {h.amenities.slice(0, 3).map(a => (
                            <span key={a} className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ color: "#ea580c", background: "#fff7ed", border: "1px solid #fed7aa" }}>{a}</span>
                          ))}
                        </div>
                        {/* Brand */}
                        {h.brand !== "Independent" && (
                          <div className="mt-1">
                            <span className="text-[10px] text-muted-foreground">Brand: <span className="font-medium text-foreground">{h.brand}</span></span>
                          </div>
                        )}

                        {/* Description */}
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          <span className="font-medium text-foreground">Description</span> {h.name} is a premier {h.starRating}-star hotel located in {h.area}, offering exceptional service with {h.amenities.slice(0, 3).join(", ").toLowerCase()} and more. Ideal for both business and leisure travelers seeking comfort and convenience.
                        </p>

                        {/* Bottom: price + button */}
                        <div className="flex items-end justify-end gap-3 mt-auto pt-2">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">From</p>
                            <p className="text-lg font-bold" style={{ color: "#ea580c" }}>
                              <span className="text-xs font-normal text-muted-foreground mr-0.5">USD</span>
                              {h.price.toLocaleString()}
                            </p>
                          </div>
                          <Button size="sm" className="rounded-full px-5 text-white" style={{ background: "#1e3a5f" }}>
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 py-6">
              <span className="text-sm text-muted-foreground mr-2">Total {sorted.length} items</span>
              <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pNum: number;
                if (totalPages <= 7) {
                  pNum = i + 1;
                } else if (page <= 4) {
                  pNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pNum = totalPages - 6 + i;
                } else {
                  pNum = page - 3 + i;
                }
                return (
                  <button
                    key={pNum}
                    className={`h-8 w-8 rounded text-sm font-medium transition-colors ${page === pNum ? "text-white" : "hover:bg-muted"}`}
                    style={page === pNum ? { background: "#1e3a5f" } : {}}
                    onClick={() => setPage(pNum)}
                  >
                    {pNum}
                  </button>
                );
              })}
              {totalPages > 7 && <span className="text-muted-foreground">...</span>}
              {totalPages > 7 && (
                <button className="h-8 w-8 rounded text-sm font-medium hover:bg-muted" onClick={() => setPage(totalPages)}>
                  {totalPages}
                </button>
              )}
              <Button variant="outline" size="icon-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground ml-2">Go to</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                className="w-14 h-8 border rounded text-center text-sm bg-background"
                onKeyDown={e => { if (e.key === "Enter") { const v = parseInt((e.target as HTMLInputElement).value); if (v >= 1 && v <= totalPages) setPage(v); } }}
              />
              <span className="text-sm text-muted-foreground">Page</span>
            </div>
          </div>
        </ScrollArea>
      </div>

      <StateToolbar state={state} setState={setState} />

    </div>
  );
}

/* ── Filter Section Component ── */
function FilterSection({ title, expanded, onToggle, children }: { title: string; expanded: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button className="flex items-center justify-between w-full text-sm font-semibold mb-2 hover:text-[#FF6000] transition-colors" onClick={onToggle}>
        {title}
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {expanded && children}
    </div>
  );
}
