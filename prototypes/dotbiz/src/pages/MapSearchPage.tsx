import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { DivIcon } from "leaflet";
import { Star, MapPin, Heart, ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DestinationSearch from "@/components/DestinationSearch";
import DateRangePicker from "@/components/DateRangePicker";
import { hotels } from "@/mocks/hotels";
import "leaflet/dist/leaflet.css";

/* Override Leaflet default icon styles for our custom numbered markers */
const markerStyle = document.createElement("style");
markerStyle.textContent = `.dotbiz-marker { background: none !important; border: none !important; }`;
if (typeof document !== "undefined" && !document.querySelector("[data-dotbiz-marker]")) {
  markerStyle.setAttribute("data-dotbiz-marker", "1");
  document.head.appendChild(markerStyle);
}

/* Numbered marker icon — override Leaflet default completely */
function createNumberedIcon(num: number, isSelected: boolean) {
  const bg = isSelected ? "#DC2626" : "#FF6000";
  const size = isSelected ? 34 : 28;
  return new DivIcon({
    className: "dotbiz-marker",
    html: `<div style="background:${bg};color:#fff;width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${isSelected ? 13 : 11}px;font-weight:700;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);position:relative;z-index:${isSelected ? 999 : 1}">${num}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
  });
}

/* Helper to fly to a position */
function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  map.flyTo([lat, lng], 14, { duration: 0.8 });
  return null;
}

export default function MapSearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const q = query.toLowerCase();
  const [searchDest, setSearchDest] = useState(query);
  const [checkIn, setCheckIn] = useState(searchParams.get("checkin") || "2026-04-15");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkout") || "2026-04-16");
  const baseUrl = `${window.location.origin}${window.location.pathname}`;

  const reloadWithQuery = (q: string) => { window.location.href = `${baseUrl}#/app/map-search?q=${encodeURIComponent(q)}`; window.location.reload(); };
  const handleSelectCity = (city: string) => { setSearchDest(city); /* only fill field, Search button triggers */ };
  const handleSelectHotel = (hId: string) => { window.open(`${baseUrl}#/app/hotel/${hId}`, "_blank"); };
  const handleSearch = () => {
    const s = searchDest.trim();
    const matched = hotels.find(h => h.name.toLowerCase() === s.toLowerCase());
    if (matched) window.open(`${baseUrl}#/app/hotel/${matched.id}`, "_blank");
    else reloadWithQuery(s);
  };

  /* City coordinates for map centering when no hotel matches */
  const cityCoords: Record<string, [number, number]> = {
    seoul: [37.5665, 126.9780], busan: [35.1796, 129.0756], jeju: [33.4996, 126.5312],
    tokyo: [35.6762, 139.6503], osaka: [34.6937, 135.5023], kyoto: [35.0116, 135.7681],
    shanghai: [31.2304, 121.4737], beijing: [39.9042, 116.4074], shenzhen: [22.5431, 114.0579],
    guangzhou: [23.1291, 113.2644], hangzhou: [30.2741, 120.1551], chengdu: [30.5728, 104.0668],
    "hong kong": [22.3193, 114.1694], taipei: [25.0330, 121.5654], macau: [22.1987, 113.5439],
    bangkok: [13.7563, 100.5018], singapore: [1.3521, 103.8198], phuket: [7.8804, 98.3923],
    "ho chi minh": [10.8231, 106.6297], hanoi: [21.0285, 105.8542], "da nang": [16.0544, 108.2022],
    bali: [-8.3405, 115.0920], jakarta: [-6.2088, 106.8456],
    dubai: [25.2048, 55.2708], "abu dhabi": [24.4539, 54.3773],
    london: [51.5074, -0.1278], paris: [48.8566, 2.3522], berlin: [52.5200, 13.4050],
    "new york": [40.7128, -74.0060], "los angeles": [34.0522, -118.2437],
    sydney: [-33.8688, 151.2093], melbourne: [-37.8136, 144.9631],
    toronto: [43.6532, -79.3832], vancouver: [49.2827, -123.1207],
  };

  const filtered = q
    ? hotels.filter(h => h.area.toLowerCase().includes(q) || h.name.toLowerCase().includes(q))
    : hotels;

  /* Find city center: from hotels if matched, from cityCoords, or default */
  const center: [number, number] = filtered.length > 0
    ? [filtered[0].lat, filtered[0].lng]
    : cityCoords[q] || [31.23, 121.47];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);

  /* Sort/filter */
  const [sortBy, setSortBy] = useState("recommend");
  const [starFilter, setStarFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");

  const allBrands = Array.from(new Set(filtered.map(h => h.brand))).sort();

  let sorted = [...filtered];
  if (starFilter !== "All") sorted = sorted.filter(h => Math.floor(h.starRating) === parseInt(starFilter));
  if (priceFilter !== "All") {
    const [min, max] = priceFilter.split("-").map(Number);
    sorted = sorted.filter(h => h.price >= min && h.price <= max);
  }
  if (brandFilter !== "All") sorted = sorted.filter(h => h.brand === brandFilter);
  if (sortBy === "price") sorted.sort((a, b) => a.price - b.price);
  else if (sortBy === "star") sorted.sort((a, b) => b.starRating - a.starRating);
  else sorted.sort((a, b) => b.reviewScore - a.reviewScore);

  const openHotelDetail = (hotelId: string) => {
    window.open(`${window.location.origin}${window.location.pathname}#/app/hotel/${hotelId}`, "_blank");
  };

  return (
    <div className="flex" style={{ height: "calc(100vh - 56px)" }}>
      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {flyTarget && <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} />}
          {sorted.map((h, i) => (
            <Marker
              key={h.id}
              position={[h.lat, h.lng]}
              icon={createNumberedIcon(i + 1, selectedId === h.id)}
              eventHandlers={{ click: () => setSelectedId(h.id) }}
            >
              <Popup maxWidth={300} minWidth={260}>
                <div style={{ padding: "4px" }}>
                  {/* Hotel image placeholder */}
                  <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", height: 80, borderRadius: 8, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 24 }}>🏨</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 8 }}>
                    <div>
                      <h3 style={{ fontWeight: "bold", fontSize: 13, margin: 0 }}>{h.name}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                        <span style={{ color: "#f59e0b", fontSize: 12 }}>★</span>
                        <span style={{ fontSize: 11 }}>{h.starRating}</span>
                        <span style={{ fontSize: 10, color: "#888", marginLeft: 4 }}>{h.reviewScore}/10</span>
                      </div>
                      <p style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{h.area}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 10, color: "#888" }}>From</p>
                      <p style={{ fontWeight: "bold", color: "#FF6000", fontSize: 16 }}>USD {h.price}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openHotelDetail(h.id)}
                    style={{ marginTop: 8, width: "100%", padding: "8px 0", background: "#FF6000", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: "bold", cursor: "pointer", letterSpacing: 0.5 }}
                  >
                    View Hotel & Reserve →
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Top search bar */}
        <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center gap-2 bg-card/95 backdrop-blur rounded-xl shadow-lg px-3 py-1.5 border">
          <div className="flex-1 min-w-0">
            <DestinationSearch
              value={searchDest}
              onChange={setSearchDest}
              onSelectCity={handleSelectCity}
              onSelectHotel={handleSelectHotel}
              placeholder="City/Landmark/District/Hotel"
            />
          </div>
          <DateRangePicker checkIn={checkIn} checkOut={checkOut} onCheckInChange={setCheckIn} onCheckOutChange={setCheckOut} />
          <Button size="sm" className="shrink-0 rounded-lg" style={{ background: "#FF6000" }} onClick={handleSearch}>
            <Search className="h-3.5 w-3.5 mr-1" />Search
          </Button>
          <Button variant="outline" size="sm" className="shrink-0 rounded-lg text-xs" onClick={() => window.location.hash = `#/app/search-results?q=${encodeURIComponent(query)}&checkin=${checkIn}&checkout=${checkOut}`}>
            Go to Hotel List
          </Button>
          <Badge variant="secondary" className="text-[10px] shrink-0">{sorted.length} hotels</Badge>
        </div>
      </div>

      {/* Right sidebar — Hotel list */}
      <div className="w-80 border-l flex flex-col bg-card shrink-0">
        {/* Filters */}
        <div className="p-3 border-b flex flex-wrap gap-2 text-xs">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded px-2 py-1 bg-background text-xs" aria-label="Sort by">
            <option value="recommend">Recommend</option>
            <option value="price">Price/Night</option>
            <option value="star">Star Rating</option>
          </select>
          <select value={starFilter} onChange={e => setStarFilter(e.target.value)} className="border rounded px-2 py-1 bg-background text-xs" aria-label="Star rating filter">
            <option value="All">All Stars</option>
            <option value="5">5 Star</option>
            <option value="4">4 Star</option>
            <option value="3">3 Star</option>
          </select>
          <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)} className="border rounded px-2 py-1 bg-background text-xs" aria-label="Price range filter">
            <option value="All">Price/Night</option>
            <option value="0-200">Under $200</option>
            <option value="200-400">$200-$400</option>
            <option value="400-9999">$400+</option>
          </select>
          <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="border rounded px-2 py-1 bg-background text-xs" aria-label="Brand filter">
            <option value="All">Brand</option>
            {allBrands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {/* Hotel cards */}
        <div className="flex-1 overflow-auto">
          {sorted.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No hotels match your filters.</p>
              <button className="text-xs text-primary mt-2 hover:underline" onClick={() => { setStarFilter("All"); setPriceFilter("All"); }}>Reset Filters</button>
            </div>
          )}
          {sorted.map((h, i) => (
            <div
              key={h.id}
              className={`p-3 border-b transition-colors ${selectedId === h.id ? "bg-primary/5 border-l-2 border-l-[#FF6000]" : "hover:bg-muted/50"}`}
            >
              <div className="flex items-start justify-between cursor-pointer" onClick={() => { setSelectedId(h.id); setFlyTarget({ lat: h.lat, lng: h.lng }); }}>
                <div className="flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0" style={{ background: selectedId === h.id ? "#DC2626" : "#FF6000" }}>{i + 1}</span>
                  <div>
                    <h4 className="text-sm font-bold">{h.name}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px]">{h.starRating}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">{h.reviewScore}/10</span>
                    </div>
                  </div>
                </div>
                <Heart className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
              </div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 ml-6.5">
                <MapPin className="h-2.5 w-2.5" />{h.area}
              </p>
              <div className="flex items-center justify-between mt-2 ml-6.5">
                <p className="text-sm font-bold" style={{ color: "#FF6000" }}>
                  <span className="text-[10px] font-normal text-muted-foreground">From </span>
                  USD {h.price.toLocaleString()}
                </p>
                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 rounded-full" onClick={() => openHotelDetail(h.id)}>
                  <ExternalLink className="h-3 w-3 mr-0.5" />Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
