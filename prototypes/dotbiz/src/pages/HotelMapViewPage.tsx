import { useSearchParams } from "react-router";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { DivIcon } from "leaflet";
import { Star, MapPin, X, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { hotels } from "@/mocks/hotels";
import "leaflet/dist/leaflet.css";

/* Marker style override */
const ms = document.createElement("style");
ms.textContent = `.dotbiz-marker{background:none!important;border:none!important}`;
if (typeof document !== "undefined" && !document.querySelector("[data-hm]")) { ms.setAttribute("data-hm", "1"); document.head.appendChild(ms); }

/* Mock attractions near hotels */
const attractions = [
  { name: "Shanghai World Financial Center", address: "100 Shi Ji Da Dao, Pudong", lat: 31.2345, lng: 121.5076, type: "Landmark" },
  { name: "Oriental Pearl TV Tower", address: "1 Shi Ji Da Dao, Pudong", lat: 31.2397, lng: 121.4997, type: "Landmark" },
  { name: "The Bund Waterfront", address: "Zhongshan East 1st Rd, Huangpu", lat: 31.2400, lng: 121.4900, type: "Landmark" },
  { name: "Nanjing Road Shopping Street", address: "Nanjing East Rd, Huangpu", lat: 31.2352, lng: 121.4743, type: "Shopping" },
  { name: "Yu Garden", address: "218 Anren St, Huangpu", lat: 31.2270, lng: 121.4924, type: "Attraction" },
  { name: "Jing'an Temple", address: "1686 Nanjing West Rd", lat: 31.2240, lng: 121.4487, type: "Attraction" },
  { name: "Gangnam Station", address: "Gangnam-gu, Seoul", lat: 37.4979, lng: 127.0276, type: "Transit" },
  { name: "Namsan Tower", address: "105 Namsangongwon-gil, Seoul", lat: 37.5512, lng: 126.9882, type: "Landmark" },
  { name: "Sensoji Temple", address: "2-3-1 Asakusa, Taito, Tokyo", lat: 35.7148, lng: 139.7967, type: "Attraction" },
  { name: "Shibuya Crossing", address: "Shibuya, Tokyo", lat: 35.6595, lng: 139.7004, type: "Landmark" },
  { name: "Wat Arun", address: "158 Thanon Wang Doem, Bangkok", lat: 13.7437, lng: 100.4888, type: "Attraction" },
  { name: "Marina Bay", address: "Marina Bay, Singapore", lat: 1.2816, lng: 103.8636, type: "Landmark" },
];

const attractionIcon = (type: string) => new DivIcon({
  className: "dotbiz-marker",
  html: `<div style="background:${type === "Landmark" ? "#7C3AED" : type === "Shopping" ? "#EC4899" : type === "Transit" ? "#0369A1" : "#009505"};color:#fff;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3)">${type === "Landmark" ? "A" : type === "Shopping" ? "S" : type === "Transit" ? "T" : "A"}</div>`,
  iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -13],
});

const hotelPinIcon = new DivIcon({
  className: "dotbiz-marker",
  html: `<div style="background:#DC2626;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4)">📍</div>`,
  iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -18],
});

const nearbyHotelIcon = (num: number) => new DivIcon({
  className: "dotbiz-marker",
  html: `<div style="background:#FF6000;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3)">${num}</div>`,
  iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -14],
});

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function HotelMapViewPage() {
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get("id") || "";
  const hotel = hotels.find(h => h.id === hotelId) || hotels[0];

  const [tab, setTab] = useState<"hotel" | "attraction">("hotel");

  // Nearby hotels (within ~50km, excluding self)
  const nearbyHotels = hotels
    .filter(h => h.id !== hotel.id)
    .map(h => ({ ...h, distance: getDistance(hotel.lat, hotel.lng, h.lat, h.lng) }))
    .filter(h => h.distance < 50)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 8);

  // Nearby attractions
  const nearbyAttractions = attractions
    .map(a => ({ ...a, distance: getDistance(hotel.lat, hotel.lng, a.lat, a.lng) }))
    .filter(a => a.distance < 10)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 8);

  return (
    <div className="flex" style={{ height: "calc(100vh - 56px)" }}>
      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer center={[hotel.lat, hotel.lng]} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Range circle */}
          <Circle center={[hotel.lat, hotel.lng]} radius={3000} pathOptions={{ color: "#FF6000", fillColor: "#FF6000", fillOpacity: 0.05, weight: 1 }} />
          <Circle center={[hotel.lat, hotel.lng]} radius={1000} pathOptions={{ color: "#FF6000", fillColor: "#FF6000", fillOpacity: 0.08, weight: 1, dashArray: "5,5" }} />

          {/* Current hotel pin */}
          <Marker position={[hotel.lat, hotel.lng]} icon={hotelPinIcon}>
            <Popup><strong>{hotel.name}</strong><br />{hotel.area}</Popup>
          </Marker>

          {/* Nearby hotels */}
          {tab === "hotel" && nearbyHotels.map((h, i) => (
            <Marker key={h.id} position={[h.lat, h.lng]} icon={nearbyHotelIcon(i + 1)}>
              <Popup maxWidth={240}>
                <div style={{ padding: 2 }}>
                  <strong style={{ fontSize: 12 }}>{h.name}</strong>
                  <p style={{ fontSize: 10, color: "#888" }}>{h.area}</p>
                  <p style={{ fontSize: 11, color: "#FF6000", fontWeight: "bold", marginTop: 4 }}>USD {h.price}</p>
                  <button onClick={() => window.open(`${window.location.origin}${window.location.pathname}#/app/hotel/${h.id}`, "_blank")} style={{ marginTop: 4, background: "#0891b2", color: "#fff", border: "none", borderRadius: 4, padding: "3px 8px", fontSize: 10, cursor: "pointer" }}>Details</button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Nearby attractions */}
          {tab === "attraction" && nearbyAttractions.map(a => (
            <Marker key={a.name} position={[a.lat, a.lng]} icon={attractionIcon(a.type)}>
              <Popup><strong style={{ fontSize: 11 }}>{a.name}</strong><br /><span style={{ fontSize: 10, color: "#888" }}>{a.address}</span></Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Search in map button */}
        <button className="absolute top-3 left-3 z-[1000] bg-card/95 backdrop-blur border rounded-lg shadow px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          onClick={() => window.open(`${window.location.origin}${window.location.pathname}#/app/map-search?q=${encodeURIComponent(hotel.area.split(",")[0])}`, "_blank")}>
          Search in map
        </button>

        {/* Distance label */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-card/90 backdrop-blur border rounded-lg shadow px-2 py-1 text-[10px] text-muted-foreground">
          3.0KM radius shown
        </div>
      </div>

      {/* Right panel */}
      <div className="w-96 border-l flex flex-col bg-card shrink-0">
        {/* Hotel info header */}
        <div className="p-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[8px]">📍</span>
                <h3 className="font-bold text-sm">{hotel.name}</h3>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-xs">{hotel.starRating}</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{hotel.area}</p>
            </div>
            <button onClick={() => window.close()} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex items-center justify-between mt-2">
            {hotel.brand !== "Independent" && <Badge variant="outline" className="text-[9px]">{hotel.brand}</Badge>}
            <p className="text-sm font-bold" style={{ color: "#FF6000" }}>From USD {hotel.price.toLocaleString()}</p>
          </div>
        </div>

        {/* Tabs: Nearby Hotel / Attraction */}
        <div className="flex border-b">
          <button onClick={() => setTab("hotel")} className={`flex-1 py-2.5 text-sm font-medium text-center border-b-2 transition-colors ${tab === "hotel" ? "border-[#FF6000] text-[#FF6000]" : "border-transparent text-muted-foreground"}`}>Nearby Hotel</button>
          <button onClick={() => setTab("attraction")} className={`flex-1 py-2.5 text-sm font-medium text-center border-b-2 transition-colors ${tab === "attraction" ? "border-[#FF6000] text-[#FF6000]" : "border-transparent text-muted-foreground"}`}>Attraction</button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto">
          {tab === "hotel" ? (
            nearbyHotels.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No nearby hotels found</p>
            ) : nearbyHotels.map((h, i) => (
              <div key={h.id} className="p-3 border-b hover:bg-muted/50 cursor-pointer" onClick={() => window.open(`${window.location.origin}${window.location.pathname}#/app/hotel/${h.id}`, "_blank")}>
                <div className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FF6000" }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold">{h.name}</h4>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-2.5 w-2.5" />{h.area}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px]">{h.starRating}</span>
                      </div>
                      <p className="text-xs font-bold" style={{ color: "#FF6000" }}>From USD {h.price.toLocaleString()}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Navigation className="h-2.5 w-2.5" />Direct distance is <strong>{h.distance.toFixed(2)} km</strong> from current hotel</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            nearbyAttractions.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No nearby attractions found</p>
            ) : nearbyAttractions.map((a, i) => (
              <div key={a.name} className="p-3 border-b">
                <div className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5" style={{ background: a.type === "Landmark" ? "#7C3AED" : a.type === "Shopping" ? "#EC4899" : "#009505" }}>A</span>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold">{a.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{a.address}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Navigation className="h-2.5 w-2.5" />Direct distance is <strong>{a.distance.toFixed(2)} km</strong> from current hotel</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
