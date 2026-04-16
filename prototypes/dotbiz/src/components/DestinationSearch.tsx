import { useState, useRef, useEffect } from "react";
import { MapPin, Building2, XCircle, Globe } from "lucide-react";
import { hotels } from "@/mocks/hotels";

const cityTabs = [
  { label: "Top Cities", cities: ["Shanghai", "Beijing", "Chengdu", "Singapore", "Seoul", "Shenzhen", "Hangzhou", "Bali", "Paris", "Guangzhou", "Macau", "Hong Kong", "Sydney", "Xiamen", "Bangkok", "Taipei", "Melbourne", "Nanjing", "Phuket", "Tokyo", "Auckland", "Koh Samui", "Osaka", "Dubai"] },
  { label: "Southeast Asia", cities: ["Bangkok", "Singapore", "Phuket", "Koh Samui", "Chiang Mai", "Ho Chi Minh", "Hanoi", "Da Nang", "Bali", "Jakarta", "Kuala Lumpur", "Manila"] },
  { label: "Asia", cities: ["Seoul", "Busan", "Jeju", "Tokyo", "Osaka", "Kyoto", "Shanghai", "Beijing", "Hong Kong", "Taipei", "Shenzhen", "Macau", "Chengdu", "Hangzhou", "Guangzhou", "Xiamen"] },
  { label: "America", cities: ["New York", "Los Angeles", "San Francisco", "Las Vegas", "Miami", "Chicago", "Toronto", "Vancouver", "Montreal"] },
  { label: "Europe", cities: ["London", "Paris", "Berlin", "Rome", "Barcelona", "Amsterdam", "Vienna", "Prague", "Zurich", "Milan", "Munich", "Edinburgh"] },
  { label: "Oceania", cities: ["Sydney", "Melbourne", "Auckland", "Gold Coast", "Cairns", "Perth", "Brisbane"] },
  { label: "Mid East/Africa", cities: ["Dubai", "Abu Dhabi", "Istanbul", "Doha", "Cape Town", "Marrakech"] },
];

const regionData = [
  { name: "Seoul", region: "South Korea", hotels: 2450 },
  { name: "Singapore", region: "Singapore", hotels: 980 },
  { name: "Shanghai", region: "China", hotels: 3450 },
  { name: "Shenzhen", region: "China", hotels: 1200 },
  { name: "Sydney", region: "Australia", hotels: 890 },
  { name: "Sapporo", region: "Japan", hotels: 560 },
  { name: "Bangkok", region: "Thailand", hotels: 4200 },
  { name: "Tokyo", region: "Japan", hotels: 3120 },
  { name: "Osaka", region: "Japan", hotels: 1890 },
  { name: "Hanoi", region: "Vietnam", hotels: 1560 },
  { name: "Ho Chi Minh", region: "Vietnam", hotels: 2100 },
  { name: "Bali", region: "Indonesia", hotels: 2800 },
  { name: "Phuket", region: "Thailand", hotels: 1800 },
  { name: "Da Nang", region: "Vietnam", hotels: 920 },
  { name: "Hong Kong", region: "China", hotels: 1650 },
  { name: "Taipei", region: "Taiwan", hotels: 1420 },
  { name: "Dubai", region: "UAE", hotels: 2300 },
  { name: "London", region: "United Kingdom", hotels: 3800 },
  { name: "Paris", region: "France", hotels: 3200 },
  { name: "New York", region: "United States", hotels: 2900 },
  { name: "Busan", region: "South Korea", hotels: 780 },
  { name: "Jeju", region: "South Korea", hotels: 620 },
  { name: "Kyoto", region: "Japan", hotels: 980 },
];

/* Highlight matched text */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "i"));
  return <>{parts.map((part, i) => part.toLowerCase() === query.toLowerCase() ? <span key={i} className="text-[#FF6000] font-semibold">{part}</span> : part)}</>;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelectCity: (city: string) => void;
  onSelectHotel: (hotelId: string, hotelName: string) => void;
  placeholder?: string;
}

export default function DestinationSearch({ value, onChange, onSelectCity, onSelectHotel, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const query = value.toLowerCase().trim();
  const hasQuery = query.length >= 1;

  // Region results (city + country + hotel count)
  const regionResults = hasQuery ? regionData.filter(r => r.name.toLowerCase().includes(query) || r.region.toLowerCase().includes(query)).slice(0, 4) : [];

  // Hotel results
  const hotelResults = query.length >= 2 ? hotels.filter(h => h.name.toLowerCase().includes(query) || h.area.toLowerCase().includes(query)).slice(0, 5) : [];

  const showSearchResults = hasQuery && (regionResults.length > 0 || hotelResults.length > 0);

  return (
    <div className="relative flex-1 min-w-0" ref={ref}>
      <p className="text-xs font-semibold text-muted-foreground mb-1">Destination</p>
      <div className="relative flex items-center">
        <MapPin className="h-3.5 w-3.5 text-[#FF6000] shrink-0 mr-1.5" />
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="w-full bg-transparent border-none outline-none text-sm font-medium pr-6"
          placeholder={placeholder || "City/Landmark/District/Hotel"}
        />
        {value && (
          <button onClick={() => { onChange(""); setOpen(true); }} className="absolute right-0 top-0.5 text-muted-foreground hover:text-foreground">
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-2 bg-card border rounded-xl shadow-2xl z-50 overflow-hidden" style={{ width: "max(100%, 700px)" }}>
          {showSearchResults ? (
            /* ── Search Results: REGION + HOTEL (same as FindHotelPage) ── */
            <div className="max-h-[400px] overflow-auto">
              {/* Region */}
              {regionResults.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-5 py-2.5">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Region</span>
                  </div>
                  {regionResults.map(r => (
                    <button
                      key={r.name}
                      className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-[#FF6000]/5 transition-colors"
                      onMouseDown={() => { onChange(r.name); onSelectCity(r.name); setOpen(false); }}
                    >
                      <span className="text-sm">
                        <HighlightMatch text={r.name} query={query} />, {r.region}
                      </span>
                      <span className="text-xs font-semibold" style={{ color: "#FF6000" }}>{r.hotels.toLocaleString()} hotels nearby</span>
                    </button>
                  ))}
                </div>
              )}
              {/* Hotel */}
              {hotelResults.length > 0 && (
                <div className={regionResults.length > 0 ? "border-t" : ""}>
                  <div className="flex items-center gap-2 px-5 py-2.5">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hotel</span>
                  </div>
                  {hotelResults.map(h => (
                    <button
                      key={h.id}
                      className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-[#FF6000]/5 transition-colors"
                      onMouseDown={() => { onChange(h.name); onSelectHotel(h.id, h.name); setOpen(false); }}
                    >
                      <span className="text-sm font-medium">
                        <HighlightMatch text={h.name} query={query} />
                      </span>
                      <span className="text-xs text-muted-foreground">{h.area}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── Browse Cities by Tab ── */
            <div>
              <div className="flex border-b px-2 pt-1">
                {cityTabs.map((tab, i) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(i)}
                    className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${i === activeTab ? "border-[#FF6000] text-[#FF6000]" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="p-4 grid grid-cols-4 gap-x-8 gap-y-1">
                {cityTabs[activeTab].cities.map(city => (
                  <button
                    key={city}
                    className="text-left px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                    onMouseDown={() => { onChange(city); onSelectCity(city); setOpen(false); }}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
