import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import HotelLoadingDialog from "@/components/HotelLoadingDialog";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import DestinationSearch from "@/components/DestinationSearch";
import DateRangePicker from "@/components/DateRangePicker";
import { toast } from "sonner";
import {
  Search, Star, ArrowLeft, RefreshCw, MapPin, Heart, Share2, ChevronLeft, ChevronRight, Download,
  Building2, Wifi, Waves, Sparkles, Dumbbell, Coffee, UtensilsCrossed, Clock,
  ShieldCheck, BedDouble, Bed, Users, Camera, Phone, CalendarDays, Hash,
  ParkingCircle, Tv, Wind, Bath, Ban, Baby, Dog, CigaretteOff, Globe,
  CheckCircle2, XCircle, AlertTriangle, ChevronDown, Copy, Maximize2, AlertOctagon
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useScreenState } from "@/hooks/useScreenState";
import { useTabParam } from "@/hooks/useTabParam";
import { StateToolbar } from "@/components/StateToolbar";
import { hotels } from "@/mocks/hotels";
import { addRecentSearch } from "@/pages/FindHotelPage";
import { voucherSettings } from "@/mocks/clientManagement";
import { getRoomsByHotel } from "@/mocks/rooms";
import {
  hotelReviews, reviewsFor, reviewStatsFor, reviewCountFor, calculateReviewReward,
  fileToDataUrl, REVIEW_MAX_PHOTOS, REVIEW_MAX_PHOTO_BYTES,
  type HotelReview,
} from "@/mocks/reviews";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, Pencil, X as XIcon, Image as ImageIcon, Upload } from "lucide-react";

const facilityList = [
  "Wake-Up Calls", "Concierge Service", "Luggage Storage", "Express Check-In/Check-Out",
  "Front Desk (24 Hours)", "Public Sound System", "Gym", "With Elevator",
  "Business Center", "Conference Hall", "Lobby Bar", "Closed Circuit Television",
  "Handicapped Room", "Cafe", "Non-Smoking Floor", "Fast Mail Service",
  "Taxi Calling Service", "Multilingual Staff", "Wedding Service", "Pickup Service",
  "Dry Cleaning (fee)", "Ironing Service (fee)", "No Smoking In Public Areas", "Restaurant",
  "Children's Slippers", "Public Area Wifi", "Airport Shuttle (fee)", "Train Station Shuttle (fee)",
  "Parking Area", "Wifi",
];

function PriceDisplay({ room, checkIn, checkOut, onCopy }: { room: { price: number; id: string }; checkIn: string; checkOut: string; onCopy: () => void }) {
  const stayNights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  const totalPrice = room.price * stayNights;
  return (
    <>
      <p className="text-lg font-bold flex items-center gap-1.5" style={{ color: "#FF6000" }}>
        USD <span className="text-xl">{room.price.toFixed(2)}</span>
        <button onClick={(e) => { e.stopPropagation(); onCopy(); }} className="h-5 w-5 rounded hover:bg-muted flex items-center justify-center transition-colors" title="Copy rate plan info">
          <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
        </button>
      </p>
      <p className="text-[10px] text-muted-foreground">1 room x {stayNights} night{stayNights > 1 ? "s" : ""}</p>
      {stayNights > 1 && <p className="text-xs font-bold mt-0.5">Total: USD {totalPrice.toFixed(2)}</p>}
    </>
  );
}

export default function HotelDetailPage() {
  const { state, setState } = useScreenState("success");
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const hotel = hotels.find(h => h.id === hotelId) || hotels[0];
  const { user } = useAuth();

  /* ── OP Reviews state ── */
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [rvRating, setRvRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [rvTitle, setRvTitle] = useState("");
  const [rvBody, setRvBody] = useState("");
  const [rvTipsText, setRvTipsText] = useState("");   /* one tip per line */
  const [rvPhotos, setRvPhotos] = useState<string[]>([]);  /* data URLs */
  const [rvLightbox, setRvLightbox] = useState<string | null>(null);
  const [localReviews, setLocalReviews] = useState<HotelReview[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const allReviewsForHotel = useMemo(
    () => [...localReviews.filter(r => r.hotelId === hotel.id), ...reviewsFor(hotel.id)],
    [localReviews, hotel.id]
  );
  const hotelReviewStats = useMemo(() => reviewStatsFor(hotel.id), [hotel.id]);
  const userHasReviewed = hotelReviews.some(
    r => r.hotelId === hotel.id && r.reviewerEmail === user?.email
  ) || localReviews.some(r => r.hotelId === hotel.id && r.reviewerEmail === user?.email);
  const rvTips = rvTipsText.split("\n").map(t => t.trim()).filter(t => t.length > 0);
  const rvReward = calculateReviewReward({
    bodyLength: rvBody.trim().length,
    tipCount: rvTips.length,
    photoCount: rvPhotos.length,
    isFirst: user ? reviewCountFor(user.email) === 0 : false,
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const available = REVIEW_MAX_PHOTOS - rvPhotos.length;
    const toProcess = files.slice(0, available);
    if (files.length > available) {
      toast.warning(`Only ${available} more photo${available === 1 ? "" : "s"} allowed (max ${REVIEW_MAX_PHOTOS})`);
    }
    const added: string[] = [];
    for (const f of toProcess) {
      if (f.size > REVIEW_MAX_PHOTO_BYTES) {
        toast.error(`${f.name} is too large (max 2MB)`);
        continue;
      }
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name} is not an image`);
        continue;
      }
      try {
        const dataUrl = await fileToDataUrl(f);
        added.push(dataUrl);
      } catch {
        toast.error(`Failed to read ${f.name}`);
      }
    }
    if (added.length > 0) setRvPhotos(prev => [...prev, ...added]);
    e.target.value = "";  /* allow re-selecting same file */
  };

  const removePhoto = (idx: number) => {
    setRvPhotos(prev => prev.filter((_, i) => i !== idx));
  };
  const submitReview = () => {
    if (rvReward.els === 0) {
      toast.error("Review doesn't meet quality criteria. Check the hints below.");
      return;
    }
    if (!user) return;
    const newReview: HotelReview = {
      id: `rev-local-${Date.now()}`,
      hotelId: hotel.id,
      reviewerEmail: user.email,
      reviewerName: user.name,
      reviewerCompany: user.company,
      reviewerCountry: "🇰🇷 Korea",
      rating: rvRating,
      title: rvTitle.trim() || "My review",
      body: rvBody.trim(),
      tips: rvTips,
      photos: rvPhotos.length > 0 ? [...rvPhotos] : undefined,
      verifiedStay: true,
      helpfulVotes: 0,
      submittedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      status: "Approved",
      elsAwarded: rvReward.els,
    };
    setLocalReviews(prev => [newReview, ...prev]);
    setReviewFormOpen(false);
    setRvTitle(""); setRvBody(""); setRvTipsText(""); setRvRating(5); setRvPhotos([]);
    toast.success(`Review submitted · +${rvReward.els} ELS credited`, {
      description: "Your tips will help other OPs pick the right hotel.",
    });
  };
  /* ── Copy tab content helpers (OPs often paste this into client emails) ── */
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`, {
        description: `${text.length.toLocaleString()} characters ready to paste`,
      });
    } catch {
      toast.error("Copy failed — your browser blocked clipboard access");
    }
  };

  const copyOverview = () => {
    const totalRooms = 200 + parseInt(hotel.id.replace(/\D/g, "")) * 23 % 400;
    const openingYear = 2000 + parseInt(hotel.id.replace(/\D/g, "")) % 26;
    const phone = hotel.checkInOutTimes.includes("15:00") ? "+82-2-797-1234" : "+86-21-2327-2888";
    const text = [
      `${hotel.name}`,
      `${hotel.area} · ${hotel.starRating}★ · ${hotel.reviewScore}/10 (${hotel.reviewCount.toLocaleString()} reviews)`,
      ``,
      `Opened: ${openingYear} · Total rooms: ${totalRooms} · Phone: ${phone}`,
      ``,
      `Introduction`,
      `${hotel.description} The hotel features world-class amenities including ${hotel.amenities.slice(0, 3).join(", ").toLowerCase()} and more. Conveniently located in ${hotel.area}, guests enjoy easy access to major attractions, shopping districts, and transportation hubs.`,
      ``,
      `Amenities: ${hotel.amenities.join(", ")}`,
      `Features: ${hotel.features.join(", ")}`,
      `Brand: ${hotel.brand}`,
    ].join("\n");
    copyToClipboard(text, "Overview");
  };

  const copyPolicies = () => {
    const text = [
      `${hotel.name} — Policies`,
      ``,
      `Check-in / Check-out`,
      `${hotel.checkInOutTimes}`,
      ``,
      `Cancellation: ${hotel.cancellationPolicy}`,
      `Children: ${hotel.childPolicy}`,
      `Pets: ${hotel.petPolicy}`,
      `Smoking: ${hotel.smokingPolicy}`,
      ``,
      `Identification: All guests must present valid government-issued photo ID at check-in.`,
      `Age: Guests must be at least 18 years of age to check in.`,
    ].join("\n");
    copyToClipboard(text, "Policies");
  };

  const copyFacilities = () => {
    const text = [
      `${hotel.name} — Facilities`,
      ``,
      facilityList.join(" · "),
    ].join("\n");
    copyToClipboard(text, "Facilities");
  };

  const toggleHelpful = (reviewId: string) => {
    setVotedIds(prev => {
      const next = new Set(prev);
      if (next.has(reviewId)) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });
  };
  const allRooms = getRoomsByHotel(hotel.id);
  const [hotelTab, setHotelTab] = useTabParam("rooms");
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({});

  /* ── Search Bar state (editing) vs Applied state (for pricing) ── */
  const urlParams = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const initCheckIn = urlParams.get("checkin") || "2026-03-30";
  const initCheckOut = urlParams.get("checkout") || "2026-04-01";
  const [searchDest, setSearchDest] = useState(hotel.area);
  const [searchCheckIn, setSearchCheckIn] = useState(initCheckIn);
  const [searchCheckOut, setSearchCheckOut] = useState(initCheckOut);
  const [searchRooms, setSearchRooms] = useState("1");
  const [searchAdults, setSearchAdults] = useState("2");
  const [searchChildren, setSearchChildren] = useState("0");
  const [searchNationality, setSearchNationality] = useState("Korean");

  /* Applied dates — only updated when Search is clicked */
  const [appliedCheckIn, setAppliedCheckIn] = useState(initCheckIn);
  const [appliedCheckOut, setAppliedCheckOut] = useState(initCheckOut);

  const baseUrl = `${window.location.origin}${window.location.pathname}`;

  const handleSelectCity = (city: string) => {
    navigate(`/app/search-results?q=${encodeURIComponent(city)}`);
  };

  const handleSelectHotel = (hId: string, _name: string) => {
    if (hId !== hotel.id) {
      window.open(`${baseUrl}#/app/hotel/${hId}`, "_blank");
    }
  };

  const handleReSearch = () => {
    const q = searchDest.trim();
    const matchedHotel = hotels.find(h => h.name.toLowerCase() === q.toLowerCase());
    if (matchedHotel && matchedHotel.id !== hotel.id) {
      window.open(`${baseUrl}#/app/hotel/${matchedHotel.id}?checkin=${searchCheckIn}&checkout=${searchCheckOut}`, "_blank");
    } else if (q.toLowerCase() !== hotel.area.split(",")[0].trim().toLowerCase()) {
      navigate(`/app/search-results?q=${encodeURIComponent(q.split(",")[0].trim())}&checkin=${searchCheckIn}&checkout=${searchCheckOut}`);
    } else {
      /* Same hotel, just update applied dates */
      setAppliedCheckIn(searchCheckIn);
      setAppliedCheckOut(searchCheckOut);
      toast.success("Search updated", { description: `Rates refreshed for ${searchCheckIn} ~ ${searchCheckOut}` });
    }
  };

  /* ── View More Dialog ── */
  const [viewMoreRoom, setViewMoreRoom] = useState<typeof allRooms[0] | null>(null);

  /* ── Copy rate plan ── */
  const copyRatePlan = (room: typeof allRooms[0]) => {
    const text = `Hotel Name: ${hotel.name}\nAddress: ${hotel.area}\nCheck-In/Out: ${appliedCheckIn} ~ ${appliedCheckOut}\nRoom Type: ${room.name}\nRooms: 1 Rooms\nBed Type: ${room.bedCount}\nMeal Type: ${room.mealDetail}\nGuest Amount: 2 Adults 0 Children\nNationality: Korean\nBilling Gross: USD ${room.billingGross.toFixed(2)}\nBilling Discount: USD ${room.billingDiscount.toFixed(2)}\nBilling Sum: USD ${room.billingSum.toFixed(2)}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Rate plan copied!", { description: "Paste it anywhere to share with your client." });
    });
  };

  /* ── Price Markup Sharing ── */
  const [markupMode, setMarkupMode] = useState(false);
  const [markupValues, setMarkupValues] = useState<Record<string, number>>({});
  const [quotePreviewOpen, setQuotePreviewOpen] = useState(false);
  const [customInfoOpen, setCustomInfoOpen] = useState(false);
  const [quoteLogo, setQuoteLogo] = useState<string | null>(null);
  const [quoteCompany, setQuoteCompany] = useState(voucherSettings.companyName);
  const [quotePhone, setQuotePhone] = useState(voucherSettings.phone);
  const [infoSaved, setInfoSaved] = useState(voucherSettings.enabled); /* true = already configured */

  const getMarkupPrice = (roomId: string, basePrice: number) => {
    const pct = markupValues[roomId] || 0;
    return Math.round(basePrice * (1 + pct / 100) * 100) / 100;
  };

  /* ── Sold Out Dialog ── */
  const [soldOutOpen, setSoldOutOpen] = useState(false);

  /* ── Map View Dialog ── */
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  /* ── Initial loading animation ── */
  const [initialLoading, setInitialLoading] = useState(true);
  useEffect(() => { setInitialLoading(true); }, [hotelId]);

  /* ── Room Filters ── */
  const [filterRoomType, setFilterRoomType] = useState("");
  const [filterBedType, setFilterBedType] = useState("");
  const [filterPrice, setFilterPrice] = useState("");
  const [filterMeal, setFilterMeal] = useState("");
  const [filterRefundable, setFilterRefundable] = useState(false);

  /* Derive unique filter options from this hotel's rooms */
  const roomTypeOptions = useMemo(() => Array.from(new Set(allRooms.map(r => r.name))).sort(), [allRooms]);
  const bedTypeOptions = useMemo(() => Array.from(new Set(allRooms.map(r => r.bedCount))).sort(), [allRooms]);
  const mealOptions = useMemo(() => Array.from(new Set(allRooms.map(r => r.mealIncluded ? "Breakfast Included" : "Room Only"))).sort(), [allRooms]);

  /* Price ranges derived from this hotel's prices */
  const priceRangeOptions = useMemo(() => {
    const prices = allRooms.map(r => r.price);
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    const step = Math.ceil((max - min) / 5 / 10) * 10 || 50;
    const ranges: { label: string; min: number; max: number; count: number }[] = [];
    for (let s = min; s < max; s += step) {
      const end = Math.min(s + step, max + 1);
      const count = allRooms.filter(r => r.price >= s && r.price < end).length;
      ranges.push({ label: `${s}-${end}`, min: s, max: end, count });
    }
    return ranges;
  }, [allRooms]);

  /* Apply filters */
  const hotelRooms = useMemo(() => {
    let result = [...allRooms];
    if (filterRoomType) result = result.filter(r => r.name === filterRoomType);
    if (filterBedType) result = result.filter(r => r.bedCount === filterBedType);
    if (filterPrice) {
      const [pMin, pMax] = filterPrice.split("-").map(Number);
      result = result.filter(r => r.price >= pMin && r.price < pMax);
    }
    if (filterMeal === "Breakfast Included") result = result.filter(r => r.mealIncluded);
    if (filterMeal === "Room Only") result = result.filter(r => !r.mealIncluded);
    if (filterRefundable) result = result.filter(r => r.cancellationPolicy === "free_cancel");
    return result;
  }, [allRooms, filterRoomType, filterBedType, filterPrice, filterMeal, filterRefundable]);

  const hasActiveFilter = filterRoomType || filterBedType || filterPrice || filterMeal || filterRefundable;
  const clearRoomFilters = () => { setFilterRoomType(""); setFilterBedType(""); setFilterPrice(""); setFilterMeal(""); setFilterRefundable(false); };

  if (state === "loading") return (<div className="p-6 space-y-4"><Skeleton className="h-6 w-64" /><Skeleton className="h-64 w-full" /><Skeleton className="h-96 w-full" /><StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">Hotel Not Found</h2><p className="text-muted-foreground mt-2">The requested hotel could not be found.</p><Button className="mt-4" onClick={() => navigate("/app/search-results")}><ArrowLeft className="h-4 w-4 mr-2" />Back to Search</Button></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>Error</AlertTitle><AlertDescription>Failed to load hotel details.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  /* Group rooms by name */
  const roomGroups: Record<string, typeof hotelRooms> = {};
  hotelRooms.forEach(r => {
    if (!roomGroups[r.name]) roomGroups[r.name] = [];
    roomGroups[r.name].push(r);
  });

  const toggleExpand = (name: string) => setExpandedRooms(prev => ({ ...prev, [name]: !prev[name] }));

  return (
    <div className="space-y-0">
      {/* Breadcrumb */}
      <div className="px-6 py-3 border-b bg-card text-xs text-muted-foreground">
        <span className="cursor-pointer hover:text-foreground" onClick={() => navigate("/app/find-hotel")}>Find Hotel</span>
        {" / "}
        <span className="cursor-pointer hover:text-foreground" onClick={() => navigate(-1 as any)}>Search Results</span>
        {" / "}
        <span className="text-foreground font-medium">{hotel.name}</span>
      </div>

      {/* Search Bar — same as main */}
      <div className="px-6 py-3 border-b bg-card">
        <div className="flex items-stretch rounded-2xl border shadow-sm bg-card relative">
          {/* Destination */}
          <div className="flex-1 min-w-0 px-5 py-3 border-r hover:bg-muted/40 transition-colors">
            <DestinationSearch
              value={searchDest}
              onChange={setSearchDest}
              onSelectCity={handleSelectCity}
              onSelectHotel={handleSelectHotel}
            />
          </div>
          {/* Check-In / Check-Out */}
          <DateRangePicker checkIn={searchCheckIn} checkOut={searchCheckOut} onCheckInChange={setSearchCheckIn} onCheckOutChange={setSearchCheckOut} />
          {/* Rooms, Per Room */}
          <div className="px-4 py-3 border-r hover:bg-muted/40 transition-colors">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Rooms, Per Room</p>
            <div className="flex items-center gap-1 text-sm font-medium">
              <span>{searchRooms} Rooms, {searchAdults} Adults{parseInt(searchChildren) > 0 ? ` ${searchChildren} Children` : ""}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
            </div>
          </div>
          {/* Nationality */}
          <div className="px-4 py-3 hover:bg-muted/40 transition-colors">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Nationality</p>
            <div className="flex items-center gap-1 text-sm font-medium">
              <select value={searchNationality} onChange={e => setSearchNationality(e.target.value)} className="font-medium text-sm bg-transparent border-none outline-none cursor-pointer appearance-none pr-1">
                {["Korean", "Japanese", "Chinese", "Thai", "Vietnamese", "American", "British", "Australian", "Singaporean", "Indonesian"].map(n => <option key={n}>{n}</option>)}
              </select>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
          {/* Search Button */}
          <div className="flex items-center px-4">
            <Button className="h-11 w-11 rounded-full shrink-0 shadow-md" size="icon" style={{ background: "#FF6000" }} onClick={handleReSearch}>
              <Search className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-6 pt-5">
        <div className="flex gap-4">
          {/* Main Image */}
          <div className="relative w-[55%] h-80 rounded-xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${hotel.starRating >= 5 ? "#1a1a2e, #16213e" : "#374151, #6b7280"})` }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="h-24 w-24 text-white/10" />
            </div>
            {/* Nav */}
            <button className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"><ChevronLeft className="h-5 w-5" /></button>
            <button className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"><ChevronRight className="h-5 w-5" /></button>
            {/* Photo count */}
            <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5" />1/49
            </div>
          </div>
          {/* Side thumbnails + Map */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-lg overflow-hidden relative" style={{ background: `linear-gradient(${135 + i * 30}deg, #374151, #6b7280)` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-white/10" />
                </div>
              </div>
            ))}
            {/* Hotel Location Map — click to open map dialog */}
            <div className="rounded-lg overflow-hidden relative cursor-pointer group" style={{ zIndex: 0 }} onClick={() => setMapDialogOpen(true)}>
              <MapContainer center={[hotel.lat, hotel.lng]} zoom={15} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} dragging={false} zoomControl={false} attributionControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[hotel.lat, hotel.lng]} icon={new DivIcon({ className: "dotbiz-marker", html: `<div style="background:#FF6000;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)">📍</div>`, iconSize: [24, 24], iconAnchor: [12, 12] })} />
              </MapContainer>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center" style={{ zIndex: 400 }}>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-foreground text-xs font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" style={{ color: "#FF6000" }} />View Map
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Info Row */}
        <div className="flex items-start justify-between mt-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{hotel.name}</h1>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              {hotel.reviewScore >= 8 && (
                <span className="px-2 py-0.5 rounded text-xs font-bold text-white" style={{ background: hotel.reviewScore >= 9 ? "#009505" : "#0891b2" }}>
                  {(hotel.reviewScore / 2).toFixed(1)}/5
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3.5 w-3.5" />{hotel.area}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {hotel.reviewScore}/10 · {hotel.reviewCount.toLocaleString()} reviews
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { const n = Math.max(1, Math.round((new Date(appliedCheckOut).getTime() - new Date(appliedCheckIn).getTime()) / 86400000)); window.open(`${window.location.origin}${window.location.pathname}#/app/markup-sharing?id=${hotel.id}&nights=${n}&checkin=${appliedCheckIn}&checkout=${appliedCheckOut}`, "_blank"); }}>
              <Share2 className="h-4 w-4 mr-1" />Price Markup Sharing
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open(`${window.location.origin}${window.location.pathname}#/app/monthly-rates?id=${hotel.id}`, "_blank")}>
              <CalendarDays className="h-4 w-4 mr-1" />Monthly Rates
            </Button>
            <Button variant="outline" size="sm"><Heart className="h-4 w-4 mr-1" />Favorite</Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-6">
        <Tabs value={hotelTab} onValueChange={setHotelTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reviews" className="gap-1.5">
              OP Reviews
              <span className="text-[9px] bg-muted px-1 rounded-full">{allReviewsForHotel.length}</span>
            </TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
          </TabsList>

          {/* ── Rooms Tab (DiDA style table) ── */}
          <TabsContent value="rooms" className="mt-4">
            {/* Room Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <select value={filterRoomType} onChange={e => setFilterRoomType(e.target.value)} className="border rounded-md px-2.5 py-1.5 text-sm bg-card min-w-[120px]" aria-label="Room type filter">
                <option value="">Room type...</option>
                {roomTypeOptions.map(rt => <option key={rt} value={rt}>{rt}</option>)}
              </select>
              <select value={filterBedType} onChange={e => setFilterBedType(e.target.value)} className="border rounded-md px-2.5 py-1.5 text-sm bg-card min-w-[120px]" aria-label="Bed type filter">
                <option value="">Bed type (...</option>
                {bedTypeOptions.map(bt => <option key={bt} value={bt}>{bt}</option>)}
              </select>
              <select value={filterPrice} onChange={e => setFilterPrice(e.target.value)} className="border rounded-md px-2.5 py-1.5 text-sm bg-card min-w-[130px]" aria-label="Price filter">
                <option value="">Price (No li...</option>
                {priceRangeOptions.map(pr => <option key={pr.label} value={pr.label}>{pr.min}-{pr.max} ({pr.count} price{pr.count !== 1 ? "s" : ""})</option>)}
              </select>
              <select value={filterMeal} onChange={e => setFilterMeal(e.target.value)} className="border rounded-md px-2.5 py-1.5 text-sm bg-card min-w-[120px]" aria-label="Meal type filter">
                <option value="">Meal type ...</option>
                {mealOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                <input type="checkbox" checked={filterRefundable} onChange={e => setFilterRefundable(e.target.checked)} className="rounded border-input" />
                Refundable
              </label>
              {hasActiveFilter && (
                <Button variant="outline" size="sm" className="ml-auto text-xs" onClick={clearRoomFilters}>Clear</Button>
              )}
            </div>
            {hotelRooms.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No rooms match your filter criteria.</p>
                <Button variant="link" onClick={clearRoomFilters} className="mt-2">Clear all filters</Button>
              </Card>
            ) : (
            <div className="border rounded-xl overflow-hidden">
              {/* Column Headers */}
              <div className="flex items-stretch bg-muted/50 border-b text-xs font-bold text-muted-foreground">
                <div className="w-48 p-2.5 shrink-0 border-r">All Rooms</div>
                <div className="w-36 p-2.5 shrink-0 border-r">Confirm Type</div>
                <div className="w-20 p-2.5 shrink-0 border-r text-center">Capacity</div>
                <div className="w-48 p-2.5 shrink-0 border-r">Bed Type/Meal Type</div>
                <div className="w-44 p-2.5 shrink-0 border-r">Policies</div>
                <div className="flex-1 p-2.5 border-r">Price/Room/Night ⇅</div>
                <div className="w-40 p-2.5 shrink-0 text-center">Reserve</div>
              </div>
              {Object.entries(roomGroups).map(([roomName, roomVariants], gi) => {
                const firstRoom = roomVariants[0];
                const isExpanded = expandedRooms[roomName] ?? false;
                const visibleVariants = isExpanded ? roomVariants : roomVariants.slice(0, 2);
                const hasMore = roomVariants.length > 2;

                return (
                  <div key={roomName} className={`${gi > 0 ? "border-t-2" : ""} flex items-stretch`}>
                    {/* Left: Room Image + Name — spans all variants */}
                    <div className="w-56 p-2 shrink-0 border-r">
                      {firstRoom.promotionTag && (
                        <Badge className="text-[8px] mb-1" style={{ background: firstRoom.promotionTag.includes("Dynamic") ? "#DC2626" : "#009505" }}>{firstRoom.promotionTag}</Badge>
                      )}
                      <h3 className="text-xs font-bold mb-1.5">{roomName}</h3>
                      <div className="w-full h-20 rounded-lg overflow-hidden relative" style={{ background: "linear-gradient(135deg, #374151, #6b7280)" }}>
                        <div className="absolute inset-0 flex items-center justify-center"><Building2 className="h-6 w-6 text-white/10" /></div>
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[8px] px-1 py-0.5 rounded flex items-center gap-0.5"><Camera className="h-2.5 w-2.5" />{firstRoom.photos}</div>
                      </div>
                      <button className="text-[10px] text-[#FF6000] hover:underline mt-1.5 block" onClick={() => setViewMoreRoom(firstRoom)}>View more →</button>
                    </div>
                    {/* Right: All variants stacked */}
                    <div className="flex-1">
                    {roomVariants.map((room, ri) => {
                      if (!isExpanded && ri >= 2) return null;
                      return (
                        <div key={room.id} className={`flex items-stretch ${ri > 0 ? "border-t" : ""} ${ri % 2 === 1 ? "bg-blue-50/30 dark:bg-blue-900/5" : ""} ${room.remaining === 0 ? "opacity-50 cursor-pointer" : ""}`} onClick={room.remaining === 0 ? () => setSoldOutOpen(true) : undefined}>

                          {/* Confirm Type */}
                          <div className="w-36 p-3 shrink-0 border-r flex flex-col justify-center">
                            <p className="text-xs text-[#009505] font-medium">{room.confirmType}</p>
                            {room.otaRestricted && (
                              <div className="mt-1.5 group relative">
                                <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center cursor-help">
                                  <Ban className="h-3 w-3 text-red-500" />
                                </div>
                                <div className="absolute bottom-7 left-0 z-50 hidden group-hover:block w-56 p-2 rounded-lg bg-foreground text-background text-[10px] leading-relaxed shadow-lg">
                                  It is forbidden to distribute products on OTAs such as Ctrip, Qunar, AliTrip, Elong, Meituan, etc.
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Capacity */}
                          <div className="w-20 p-3 shrink-0 border-r flex flex-col items-center justify-center">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: Math.min(room.maxGuests, 3) }).map((_, gi) => (
                                <Users key={gi} className="h-3.5 w-3.5 text-foreground" />
                              ))}
                            </div>
                            <div className="group relative mt-1">
                              <span className="text-[9px] text-muted-foreground cursor-help">ⓘ</span>
                              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 hidden group-hover:block w-40 p-2 rounded-lg bg-foreground text-background text-[10px] text-center shadow-lg">
                                Max {room.maxGuests} guests. Suitable for your party of {room.maxGuests} travelers.
                              </div>
                            </div>
                          </div>

                          {/* Bed + Meal */}
                          <div className="w-48 p-3 shrink-0 border-r flex flex-col justify-center">
                            <p className="text-xs font-medium">{room.bedCount}</p>
                            {room.mealIncluded ? (
                              <p className="text-xs mt-1" style={{ color: "#009505" }}>🍳 {room.mealDetail}</p>
                            ) : (
                              <p className="text-xs text-muted-foreground mt-1">{room.mealDetail}</p>
                            )}
                          </div>

                          {/* Cancellation + Deadline */}
                          <div className="w-44 p-3 shrink-0 border-r flex flex-col justify-center">
                            {room.cancellationPolicy === "free_cancel" ? (
                              <>
                                <p className="text-xs font-medium" style={{ color: "#009505" }}>Free cancellation until</p>
                                <p className="text-[10px] text-muted-foreground">{room.freeCancelDeadline}</p>
                              </>
                            ) : room.cancellationPolicy === "non_refundable" ? (
                              <p className="text-xs font-medium text-red-500">Non-Refundable</p>
                            ) : (
                              <>
                                <p className="text-xs font-medium text-amber-600">Partial Refund</p>
                                {room.freeCancelDeadline && <p className="text-[10px] text-muted-foreground">until {room.freeCancelDeadline}</p>}
                              </>
                            )}
                          </div>

                          {/* Price — Billing structure */}
                          <div className="flex-1 p-3 border-r flex flex-col justify-center">
                            {markupMode ? (
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">Current: {room.price.toFixed(2)}</p>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px]">Markup:</span>
                                  <input type="number" min="0" max="100" placeholder="0" className="w-12 border rounded px-1 py-0.5 text-xs bg-background text-right" value={markupValues[room.id] || ""} onChange={e => setMarkupValues(prev => ({ ...prev, [room.id]: parseFloat(e.target.value) || 0 }))} onClick={e => e.stopPropagation()} />
                                  <span className="text-[10px]">%</span>
                                </div>
                                <p className="text-[10px]">After: <span className="font-bold" style={{ color: "#FF6000" }}>{getMarkupPrice(room.id, room.price).toFixed(2)}</span></p>
                              </div>
                            ) : (
                              <PriceDisplay room={room} checkIn={appliedCheckIn} checkOut={appliedCheckOut} onCopy={() => copyRatePlan(room)} />
                            )}
                            {/* Promotion warning for Dynamic PKG */}
                            {room.promotionTag.includes("Dynamic PKG") && (
                              <div className="mt-1 group relative">
                                <p className="text-[9px] text-red-500 flex items-center gap-0.5 cursor-help"><AlertTriangle className="h-2.5 w-2.5" />Package only</p>
                                <div className="absolute bottom-5 left-0 z-50 hidden group-hover:block w-52 p-2 rounded-lg bg-foreground text-background text-[10px] shadow-lg">
                                  This rate is only available for package sales (Hotel + Flight, etc.). Hotel-only sales are not permitted.
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Reserve */}
                          <div className="w-40 p-3 shrink-0 flex flex-col items-center justify-center">
                            {room.remaining === 0 ? (
                              <>
                                <Button size="sm" className="rounded-md px-4" variant="secondary" disabled>Sold Out</Button>
                                <p className="text-[10px] text-red-500 mt-1 font-medium">No availability</p>
                              </>
                            ) : (
                              <>
                                <Button size="sm" className="rounded-md text-white px-4" style={{ background: "#0891b2" }} onClick={(e) => { e.stopPropagation(); addRecentSearch({ hotelId: hotel.id, hotel: hotel.name, checkin: appliedCheckIn, checkout: appliedCheckOut, price: room.price }); navigate(`/app/booking/form?hotel=${hotel.id}&room=${room.id}&checkin=${appliedCheckIn}&checkout=${appliedCheckOut}`); }}>
                                  Reserve now
                                </Button>
                                {room.remaining && room.remaining <= 3 && (
                                  <p className="text-[10px] font-medium text-red-500 mt-1">Last {room.remaining} rooms!</p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {/* Show more / Hide */}
                    {hasMore && (
                      <div className="border-t py-2 text-center">
                        <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto" onClick={() => toggleExpand(roomName)}>
                          {isExpanded ? <>Hide prices <ChevronDown className="h-3 w-3 rotate-180" /></> : <>Show the rest {roomVariants.length - 2} prices <ChevronDown className="h-3 w-3" /></>}
                        </button>
                      </div>
                    )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </TabsContent>

          {/* ── Overview Tab ── */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-bold">Overview</h3>
                <Badge variant="secondary" className="text-[9px] gap-1"><Sparkles className="h-3 w-3" />AI-Enhanced</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto h-7 text-[11px] gap-1"
                  onClick={copyOverview}
                  title="Copy formatted overview to paste into client emails"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </div>
              <Separator className="mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                <div className="p-3 bg-muted/50 rounded-lg"><p className="text-[10px] font-bold text-muted-foreground">Opening Year</p><p className="text-sm font-medium">{2000 + parseInt(hotel.id.replace(/\D/g, "")) % 26}</p></div>
                <div className="p-3 bg-muted/50 rounded-lg"><p className="text-[10px] font-bold text-muted-foreground">Total Rooms</p><p className="text-sm font-medium">{200 + parseInt(hotel.id.replace(/\D/g, "")) * 23 % 400}</p></div>
                <div className="p-3 bg-muted/50 rounded-lg"><p className="text-[10px] font-bold text-muted-foreground">Phone</p><p className="text-sm font-medium">{hotel.checkInOutTimes.includes("15:00") ? "+82-2-797-1234" : "+86-21-2327-2888"}</p></div>
                <div className="p-3 bg-muted/50 rounded-lg"><p className="text-[10px] font-bold text-muted-foreground">Website</p><p className="text-sm font-medium text-primary cursor-pointer">Visit Site</p></div>
              </div>

              {/* AI-generated Introduction */}
              <div className="mb-5">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-1.5">Introduction</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">{hotel.description} The hotel features world-class amenities including {hotel.amenities.slice(0, 3).join(", ").toLowerCase()} and more. Conveniently located in {hotel.area}, guests enjoy easy access to major attractions, shopping districts, and transportation hubs. The property is known for its exceptional service standards and attention to detail, making it a preferred choice for both business and leisure travelers.</p>
              </div>

              {/* AI Location Analysis */}
              <div className="mb-5">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#FF6000]" />Location Insights <Badge variant="outline" className="text-[8px] ml-1">AI</Badge></h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs font-semibold">Nearby Transit</p>
                    <p className="text-xs text-muted-foreground mt-1">Metro station within 5-min walk. Airport accessible via express train (35 min).</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs font-semibold">Dining & Shopping</p>
                    <p className="text-xs text-muted-foreground mt-1">15+ restaurants within 500m. Premium shopping mall adjacent to the property.</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs font-semibold">Business District</p>
                    <p className="text-xs text-muted-foreground mt-1">Located in the heart of {hotel.area.split(",")[0]} business area. Convention center within 2km.</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs font-semibold">Tourist Attractions</p>
                    <p className="text-xs text-muted-foreground mt-1">Major landmarks and cultural sites within 3km radius. Walking tours available.</p>
                  </div>
                </div>
              </div>

              {/* AI Guest Reviews Summary */}
              <div>
                <h4 className="text-sm font-bold mb-2 flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />Guest Reviews Summary <Badge variant="outline" className="text-[8px] ml-1">AI</Badge></h4>
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-14 w-14 rounded-xl flex items-center justify-center text-lg font-bold text-white" style={{ background: hotel.reviewScore >= 9 ? "#009505" : "#0891b2" }}>{hotel.reviewScore}</div>
                  <div>
                    <p className="text-sm font-bold">{hotel.reviewScore >= 9.5 ? "Exceptional" : hotel.reviewScore >= 9 ? "Excellent" : hotel.reviewScore >= 8.5 ? "Very Good" : "Good"}</p>
                    <p className="text-xs text-muted-foreground">{hotel.reviewCount.toLocaleString()} verified reviews</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Cleanliness", score: (hotel.reviewScore - 0.1 + Math.random() * 0.3).toFixed(1) },
                    { label: "Service", score: (hotel.reviewScore + Math.random() * 0.2).toFixed(1) },
                    { label: "Location", score: (hotel.reviewScore - 0.2 + Math.random() * 0.4).toFixed(1) },
                    { label: "Value", score: (hotel.reviewScore - 0.5 + Math.random() * 0.5).toFixed(1) },
                  ].map(r => (
                    <div key={r.label} className="text-center">
                      <p className="text-lg font-bold" style={{ color: "#FF6000" }}>{r.score}</p>
                      <p className="text-[10px] text-muted-foreground">{r.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs italic text-muted-foreground">"Guests frequently praise the {hotel.starRating >= 5 ? "luxurious rooms and impeccable service" : "comfortable rooms and friendly staff"}. The {hotel.amenities[0]?.toLowerCase() || "facilities"} and {hotel.amenities[1]?.toLowerCase() || "dining"} receive consistently high marks. {hotel.hasFreeCancellation ? "The flexible cancellation policy is appreciated by many travelers." : "Ideal for confirmed travel plans."}"</p>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Sparkles className="h-3 w-3" />AI-generated summary based on {hotel.reviewCount.toLocaleString()} reviews</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ── Policies Tab ── */}
          <TabsContent value="policies" className="mt-4">
            <Card className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <h3 className="font-bold">Policies</h3>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto h-7 text-[11px] gap-1"
                  onClick={copyPolicies}
                  title="Copy policies to paste into client confirmations"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-bold mb-2">Check-in and Check-out</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#FF6000" }} />Check-in time starts at 14:00</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#FF6000" }} />Check-out time ends at 12:00</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold mb-2">Check-in Restrictions</h4>
                <p className="text-sm text-muted-foreground">Guests from any country or region are welcome.</p>
              </div>
              <div>
                <h4 className="text-sm font-bold mb-2">Age Restrictions</h4>
                <p className="text-sm text-muted-foreground">Guests must be at least 18 years of age to check in.</p>
              </div>
              <div>
                <h4 className="text-sm font-bold mb-2">Pets</h4>
                <p className="text-sm text-muted-foreground">{hotel.petPolicy}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold mb-2">Identification Requirements</h4>
                <p className="text-sm text-muted-foreground">All guests must present valid government-issued photo identification (e.g., national ID card or passport) at check-in — one ID per guest.</p>
              </div>
              <div>
                <h4 className="text-sm font-bold mb-2">Children and Extra Bed Policy</h4>
                <p className="text-sm text-muted-foreground">{hotel.childPolicy}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold mb-2">Smoking</h4>
                <p className="text-sm text-muted-foreground">{hotel.smokingPolicy}</p>
              </div>
            </Card>
          </TabsContent>

          {/* ── Facilities Tab ── */}
          <TabsContent value="facilities" className="mt-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-bold">Hotel Facilities</h3>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto h-7 text-[11px] gap-1"
                  onClick={copyFacilities}
                  title="Copy facilities list to paste into client emails"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </div>
              <Separator className="mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2">
                {facilityList.map(f => (
                  <p key={f} className="text-sm text-muted-foreground hover:text-foreground cursor-default">{f}</p>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* ── OP Reviews Tab ── */}
          <TabsContent value="reviews" className="mt-4 space-y-4">
            {/* Summary + Write CTA */}
            <Card className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px]" style={{ borderColor: "#FF6000", color: "#FF6000" }}>
                      ✓ OP-verified
                    </Badge>
                    <h3 className="text-lg font-bold">Professional OP Reviews</h3>
                  </div>
                  <p className="text-xs text-muted-foreground max-w-xl">
                    Reviews from travel agency OPs who actually book + operate stays here.
                    Not consumer tripadvisor fluff — actionable intel on rooms, service,
                    and gotchas from people handling 100s of bookings.
                  </p>
                </div>
                <div className="text-right">
                  {allReviewsForHotel.length > 0 ? (
                    <>
                      <div className="flex items-center gap-1 justify-end">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star
                            key={n}
                            className="h-5 w-5"
                            style={{
                              fill: n <= Math.round(hotelReviewStats.avgRating) ? "#FF6000" : "transparent",
                              color: "#FF6000",
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-2xl font-bold mt-1">{hotelReviewStats.avgRating.toFixed(1)}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {hotelReviewStats.count} OP review{hotelReviewStats.count === 1 ? "" : "s"}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Be the first to review</p>
                  )}
                </div>
              </div>

              {/* Top tips (cross-review aggregation) */}
              {hotelReviewStats.topTips.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                    💡 Top tips from OPs (insider knowledge)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {hotelReviewStats.topTips.map(tip => (
                      <span
                        key={tip}
                        className="text-[11px] px-2 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200"
                      >
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t flex items-center justify-between flex-wrap gap-2">
                <p className="text-[11px] text-muted-foreground">
                  💰 Write a quality review → earn <strong style={{ color: "#FF6000" }}>up to +10 ELS</strong>
                  {" "}(80+ chars body, 1+ tip, verified stay)
                </p>
                {userHasReviewed ? (
                  <Badge variant="secondary" className="text-[10px]">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    You've reviewed this hotel
                  </Badge>
                ) : reviewFormOpen ? (
                  <Badge variant="outline" className="text-[10px] border-[#FF6000]/50 text-[#FF6000]">
                    <Pencil className="h-3 w-3 mr-1" />
                    Writing review below…
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setReviewFormOpen(true)}
                    style={{ background: "#FF6000" }}
                    className="text-white"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Write a review · earn ELS
                  </Button>
                )}
              </div>
            </Card>

            {/* ── Inline Write Review form ── */}
            {reviewFormOpen && !userHasReviewed && (
              <Card
                className="p-5 border-2"
                style={{ borderColor: "#FF600055", background: "linear-gradient(135deg, #FF600008, transparent 70%)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Pencil className="h-4 w-4" style={{ color: "#FF6000" }} />
                    <h3 className="font-bold text-base">Write your review · {hotel.name}</h3>
                  </div>
                  <button
                    onClick={() => {
                      setReviewFormOpen(false);
                      /* Keep draft state — user may reopen */
                    }}
                    className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted"
                    aria-label="Collapse form"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left column: rating + title + body */}
                  <div className="space-y-3">
                    {/* Rating */}
                    <div>
                      <label className="text-xs font-medium">Your rating</label>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            onClick={() => setRvRating(n as 1 | 2 | 3 | 4 | 5)}
                            className="p-1"
                            aria-label={`${n} stars`}
                          >
                            <Star
                              className="h-7 w-7"
                              style={{
                                fill: n <= rvRating ? "#FF6000" : "transparent",
                                color: "#FF6000",
                              }}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm font-semibold" style={{ color: "#FF6000" }}>
                          {rvRating}/5
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="text-xs font-medium">Headline</label>
                      <Input
                        className="mt-1"
                        placeholder="e.g. 'Reliable for VIP business trips'"
                        value={rvTitle}
                        onChange={e => setRvTitle(e.target.value)}
                        maxLength={80}
                      />
                    </div>

                    {/* Body */}
                    <div>
                      <label className="text-xs font-medium">Detailed review</label>
                      <Textarea
                        className="mt-1"
                        rows={7}
                        placeholder="What did you learn from operating bookings here? What works, what doesn't? Share intel that'd save other OPs time…"
                        value={rvBody}
                        onChange={e => setRvBody(e.target.value)}
                        maxLength={2000}
                      />
                      <div className="flex items-center justify-between text-[10px] mt-0.5">
                        <span className={rvBody.trim().length < 80 ? "text-destructive" : "text-muted-foreground"}>
                          {rvBody.trim().length} / 80 min · {rvBody.length} chars
                        </span>
                        <span className="text-muted-foreground">
                          {rvBody.trim().length >= 300 ? "✓ Quality bonus eligible" : "300+ for quality bonus"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right column: tips + photos + reward preview */}
                  <div className="space-y-3">
                    {/* Tips */}
                    <div>
                      <label className="text-xs font-medium">Tips (one per line)</label>
                      <Textarea
                        className="mt-1"
                        rows={5}
                        placeholder={`Insider tips that help other OPs:\n- Request 20F+ for city view\n- Avoid weekends (wedding traffic)\n- Club lounge on 23F opens 07:00`}
                        value={rvTipsText}
                        onChange={e => setRvTipsText(e.target.value)}
                      />
                      <div className="flex items-center justify-between text-[10px] mt-0.5">
                        <span className={rvTips.length < 1 ? "text-destructive" : "text-muted-foreground"}>
                          {rvTips.length} tip{rvTips.length === 1 ? "" : "s"} · min 1
                        </span>
                        <span className="text-muted-foreground">
                          {rvTips.length >= 4 ? "✓ Quality bonus eligible" : "4+ for quality bonus"}
                        </span>
                      </div>
                    </div>

                    {/* Photos */}
                    <div>
                      <label className="text-xs font-medium flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        Photos <span className="text-muted-foreground font-normal">(optional, +2 ELS bonus)</span>
                      </label>
                      <div className="mt-1 grid grid-cols-4 gap-2">
                        {rvPhotos.map((src, i) => (
                          <div key={i} className="relative group aspect-square rounded-md overflow-hidden border">
                            <img src={src} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                            <button
                              onClick={() => removePhoto(i)}
                              type="button"
                              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remove photo"
                            >
                              <XIcon className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {rvPhotos.length < REVIEW_MAX_PHOTOS && (
                          <label className="aspect-square rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-[#FF6000]/60 hover:bg-[#FF6000]/5 cursor-pointer flex flex-col items-center justify-center gap-1 transition-colors">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">Add photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={handlePhotoUpload}
                            />
                          </label>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] mt-1">
                        <span className="text-muted-foreground">
                          {rvPhotos.length} / {REVIEW_MAX_PHOTOS} · max 2MB each
                        </span>
                        <span className="text-muted-foreground">
                          {rvPhotos.length >= 1 ? "✓ Photo bonus unlocked" : "1+ for +2 ELS"}
                        </span>
                      </div>
                    </div>

                    {/* Reward preview */}
                    <Card
                      className="p-3"
                      style={{
                        background: rvReward.els > 0
                          ? "linear-gradient(135deg, #FF600015, transparent)"
                          : "#f1f5f9",
                        borderColor: rvReward.els > 0 ? "#FF600055" : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                            Reward preview
                          </p>
                          <p className="text-2xl font-bold" style={{ color: rvReward.els > 0 ? "#FF6000" : "#94a3b8" }}>
                            {rvReward.els > 0 ? "+" : ""}{rvReward.els} ELS
                          </p>
                        </div>
                        <div className="text-right">
                          {rvReward.breakdown.map((line, i) => (
                            <p key={i} className="text-[9px] text-muted-foreground">{line}</p>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Footer: syndication hint + actions */}
                <div className="mt-4 pt-4 border-t flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-[10px] text-muted-foreground italic max-w-md">
                    💡 Approved reviews are syndicated (anonymized) to our B2C layer —
                    your insights strengthen DOTBIZ's discovery edge.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReviewFormOpen(false);
                        setRvTitle(""); setRvBody(""); setRvTipsText(""); setRvRating(5); setRvPhotos([]);
                      }}
                    >
                      Discard
                    </Button>
                    <Button
                      size="sm"
                      onClick={submitReview}
                      disabled={rvReward.els === 0}
                      style={rvReward.els > 0 ? { background: "#FF6000" } : undefined}
                      className={rvReward.els > 0 ? "text-white" : ""}
                    >
                      Submit · earn {rvReward.els} ELS
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Review list */}
            {allReviewsForHotel.length === 0 ? (
              <Card className="p-10 text-center text-sm text-muted-foreground">
                No OP reviews yet for this hotel. Be the first — earn +8 ELS for a quality review.
              </Card>
            ) : (
              allReviewsForHotel.map(r => {
                const hasVoted = votedIds.has(r.id);
                return (
                  <Card key={r.id} className="p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "#FF600022", color: "#FF6000" }}>
                          {r.reviewerName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{r.reviewerName}</p>
                            {r.verifiedStay && (
                              <Badge variant="outline" className="text-[9px] text-green-700 border-green-300">
                                <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                                Verified stay
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {r.reviewerCompany} · {r.reviewerCountry} · {r.stayedAt ? `Stayed ${r.stayedAt}` : "Submitted anonymously"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star
                            key={n}
                            className="h-4 w-4"
                            style={{
                              fill: n <= r.rating ? "#FF6000" : "transparent",
                              color: "#FF6000",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <h4 className="font-semibold text-base mt-3">{r.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                      {r.body}
                    </p>
                    {/* Photo gallery */}
                    {r.photos && r.photos.length > 0 && (
                      <div className={`mt-3 grid gap-2 ${
                        r.photos.length === 1 ? "grid-cols-1 max-w-md" :
                        r.photos.length === 2 ? "grid-cols-2 max-w-md" :
                        "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                      }`}>
                        {r.photos.map((src, i) => (
                          <button
                            key={i}
                            onClick={() => setRvLightbox(src)}
                            type="button"
                            className="aspect-[4/3] rounded-md overflow-hidden border hover:ring-2 hover:ring-[#FF6000]/50 transition-all"
                          >
                            <img src={src} alt={`Review photo ${i + 1}`} className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                    {r.tips.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                          🏷️ OP tips
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {r.tips.map((tip, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2 py-1 rounded-md bg-blue-50 text-blue-900 border border-blue-200"
                            >
                              {tip}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <button
                        onClick={() => toggleHelpful(r.id)}
                        className={`text-[11px] flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                          hasVoted ? "bg-[#FF6000]/10 text-[#FF6000] font-semibold" : "hover:bg-muted/60 text-muted-foreground"
                        }`}
                        disabled={r.reviewerEmail === user?.email}
                        title={r.reviewerEmail === user?.email ? "Can't vote on your own review" : ""}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        Helpful · {r.helpfulVotes + (hasVoted ? 1 : 0)}
                      </button>
                      <span className="text-[10px] text-muted-foreground">
                        {r.approvedAt ? new Date(r.approvedAt).toISOString().slice(0, 10) : new Date(r.submittedAt).toISOString().slice(0, 10)}
                      </span>
                    </div>
                  </Card>
                );
              })
            )}

            {/* B2C syndication hint — the business case */}
            {allReviewsForHotel.length >= 2 && (
              <Alert style={{ background: "#06D6A015", borderColor: "#06D6A066" }}>
                <AlertTitle className="text-green-800 text-sm">🌐 These reviews reach end consumers</AlertTitle>
                <AlertDescription className="text-green-900/80 text-xs">
                  Approved OP reviews are syndicated (anonymized) to our B2C discovery layer.
                  Your insights help travelers pick the right hotel — and drive bookings back
                  to DOTBIZ. The more OPs review, the stronger the flywheel.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Recommended Properties ── */}
      {hotels.filter(h => h.id !== hotel.id).length > 0 && (
        <div className="px-6 pt-6">
          <Separator className="mb-6" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">🏅 Recommended Properties</h3>
            <button className="text-xs text-muted-foreground hover:text-foreground">↻ Switch</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {hotels.filter(h => h.id !== hotel.id).slice(0, 4).map(h => (
              <Card key={h.id} className="p-3 cursor-pointer card-hover hover:border-[#FF6000]/30" onClick={() => window.open(`${window.location.origin}${window.location.pathname}#/app/hotel/${h.id}`, "_blank")}>
                <div className="h-24 rounded-lg mb-2 overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${h.starRating >= 5 ? "#1a1a2e, #0f3460" : "#374151, #6b7280"})` }}>
                  <div className="absolute inset-0 flex items-center justify-center"><Building2 className="h-8 w-8 text-white/10" /></div>
                </div>
                <h4 className="text-xs font-bold truncate">{h.name}</h4>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {Array.from({ length: h.starRating }).map((_, i) => <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5"><MapPin className="h-2.5 w-2.5" />{h.area}</p>
                <div className="mt-2 p-2 rounded bg-muted/50">
                  <p className="text-[10px]" style={{ color: "#FF6000" }}>Recommended Reason:</p>
                  <p className="text-[10px] text-muted-foreground">Better value than other properties in its class</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm font-bold" style={{ color: "#FF6000" }}>USD{h.price}<span className="text-[10px] font-normal text-muted-foreground">/night</span></p>
                  <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 rounded-full">Reserve</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="h-8" />

      {/* ── Photo Lightbox ── */}
      <Dialog open={!!rvLightbox} onOpenChange={(o) => { if (!o) setRvLightbox(null); }}>
        <DialogContent className="max-w-3xl p-2 bg-black border-black">
          {rvLightbox && (
            <img
              src={rvLightbox}
              alt="Review photo"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      <StateToolbar state={state} setState={setState} />

      {/* Initial Loading Dialog — simulates fetching live rates from suppliers */}
      <HotelLoadingDialog
        open={initialLoading}
        hotelName={hotel.name}
        onComplete={() => setInitialLoading(false)}
      />

      {/* View More Room Dialog */}
      <Dialog open={!!viewMoreRoom} onOpenChange={() => setViewMoreRoom(null)}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
          <div className="flex">
            {/* Room Image */}
            <div className="w-[55%] relative" style={{ background: "linear-gradient(135deg, #374151, #6b7280)", minHeight: 350 }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="h-20 w-20 text-white/10" />
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <button className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40"><ChevronLeft className="h-4 w-4 text-white" /></button>
                <span className="text-white text-xs bg-black/50 px-2 py-0.5 rounded">1 / {viewMoreRoom?.photos || 6}</span>
                <button className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40"><ChevronRight className="h-4 w-4 text-white" /></button>
              </div>
            </div>

            {/* Room Info */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[450px]">
              <DialogHeader>
                <DialogTitle className="text-lg">{viewMoreRoom?.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2"><Maximize2 className="h-4 w-4 text-muted-foreground shrink-0" /><span>Floor {viewMoreRoom?.floor}</span></div>
                <div className="flex items-center gap-2"><Maximize2 className="h-4 w-4 text-muted-foreground shrink-0" /><span>Size {viewMoreRoom?.size}m&sup2;</span></div>
                <div className="flex items-center gap-2">
                  {viewMoreRoom?.hasWindow
                    ? <><CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /><span>Has Window</span></>
                    : <><XCircle className="h-4 w-4 text-red-500 shrink-0" /><span>No Window</span></>
                  }
                </div>
                <div className="flex items-center gap-2"><Wifi className="h-4 w-4 text-muted-foreground shrink-0" /><span>WiFi</span></div>
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground shrink-0" /><span>Max {viewMoreRoom?.maxGuests} Persons</span></div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5 mb-2"><Baby className="h-4 w-4" /> Children Policy</h4>
                <p className="text-xs text-muted-foreground">Children of all ages are allowed to stay at the hotel. Children under 12 stay free with existing bedding.</p>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-bold mb-2">Room Facilities</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                  {viewMoreRoom?.facilities.map(f => (
                    <p key={f} className="text-xs text-muted-foreground">{f}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Map View Overlay (full screen) ── */}
      {mapDialogOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/50" onClick={() => setMapDialogOpen(false)}>
          <div className="absolute inset-4 bg-card rounded-2xl shadow-2xl overflow-hidden flex" onClick={e => e.stopPropagation()}>
            {/* Close button */}
            <button className="absolute top-3 right-3 z-[10001] h-8 w-8 rounded-full bg-card shadow-md flex items-center justify-center hover:bg-muted" onClick={() => setMapDialogOpen(false)}>
              <span className="text-lg">×</span>
            </button>
            {/* Map */}
            <div className="flex-1 overflow-hidden">
              <MapContainer center={[hotel.lat, hotel.lng]} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Circle center={[hotel.lat, hotel.lng]} radius={3000} pathOptions={{ color: "#FF6000", fillColor: "#FF6000", fillOpacity: 0.05, weight: 1 }} />
                <Marker position={[hotel.lat, hotel.lng]} icon={new DivIcon({ className: "dotbiz-marker", html: `<div style="background:#DC2626;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4)">📍</div>`, iconSize: [32, 32], iconAnchor: [16, 16] })}>
                  <Popup><strong>{hotel.name}</strong></Popup>
                </Marker>
                {hotels.filter(h => h.id !== hotel.id && Math.abs(h.lat - hotel.lat) < 0.5 && Math.abs(h.lng - hotel.lng) < 0.5).slice(0, 8).map((h, i) => (
                  <Marker key={h.id} position={[h.lat, h.lng]} icon={new DivIcon({ className: "dotbiz-marker", html: `<div style="background:#FF6000;color:#fff;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${i + 1}</div>`, iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -15] })}>
                    <Popup maxWidth={240}>
                      <div style={{ padding: 2 }}>
                        <strong style={{ fontSize: 12 }}>{h.name}</strong>
                        <p style={{ fontSize: 10, color: "#888" }}>{h.area}</p>
                        <p style={{ fontWeight: "bold", color: "#FF6000", fontSize: 14, marginTop: 4 }}>USD {h.price}</p>
                        <button onClick={() => window.open(`${window.location.origin}${window.location.pathname}#/app/hotel/${h.id}`, "_blank")} style={{ marginTop: 6, width: "100%", background: "#FF6000", color: "#fff", border: "none", borderRadius: 6, padding: "5px 0", fontSize: 11, fontWeight: "bold", cursor: "pointer" }}>View Hotel →</button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            {/* Right panel */}
            <div className="w-96 border-l flex flex-col shrink-0 overflow-hidden relative z-10 bg-card">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[9px]">📍</span>
                  <div>
                    <h3 className="font-bold text-sm">{hotel.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{hotel.area}</p>
                  </div>
                </div>
                <p className="text-base font-bold mt-2" style={{ color: "#FF6000" }}>From USD {hotel.price}</p>
              </div>
              <div className="px-4 py-2 border-b bg-muted/30">
                <p className="text-xs font-bold text-muted-foreground">Nearby Hotels</p>
              </div>
              <div className="flex-1 overflow-auto">
                {hotels.filter(h => h.id !== hotel.id && Math.abs(h.lat - hotel.lat) < 0.5 && Math.abs(h.lng - hotel.lng) < 0.5).slice(0, 8).map((h, i) => {
                  const dist = Math.sqrt((h.lat - hotel.lat) ** 2 + (h.lng - hotel.lng) ** 2) * 111;
                  return (
                    <div key={h.id} className="p-3 border-b hover:bg-muted/50 cursor-pointer" onClick={() => window.open(`${window.location.origin}${window.location.pathname}#/app/hotel/${h.id}`, "_blank")}>
                      <div className="flex items-start gap-2">
                        <span className="h-5 w-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FF6000" }}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{h.name}</p>
                          <p className="text-[10px] text-muted-foreground">{h.area}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-muted-foreground">{dist.toFixed(1)}km away</span>
                            <span className="text-sm font-bold" style={{ color: "#FF6000" }}>USD {h.price}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Information Configuration ── */}
      <Dialog open={customInfoOpen} onOpenChange={setCustomInfoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Custom Information Configuration</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground mb-2">
            {infoSaved ? "Your company info is pre-loaded from Voucher Settings. Edit if needed." : "Set up your company info for the quote. This will be saved for future use."}
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium w-28 shrink-0">Logo:</label>
              {quoteLogo ? (
                <div className="relative">
                  <img src={quoteLogo} alt="Logo" className="h-16 w-20 object-contain border rounded" />
                  <button className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-white text-[9px] flex items-center justify-center" onClick={() => setQuoteLogo(null)}>×</button>
                </div>
              ) : (
                <label className="h-16 w-20 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-muted/50">
                  <span className="text-2xl text-muted-foreground">+</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = ev => setQuoteLogo(ev.target?.result as string); reader.readAsDataURL(file); } }} />
                </label>
              )}
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium w-28 shrink-0">Company Name:</label>
              <Input value={quoteCompany} onChange={e => setQuoteCompany(e.target.value)} placeholder="Please enter the company name" />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium w-28 shrink-0">Phone:</label>
              <Input value={quotePhone} onChange={e => setQuotePhone(e.target.value)} placeholder="Please enter the phone number" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setCustomInfoOpen(false)}>Skip</Button>
            <Button onClick={() => { setInfoSaved(true); setCustomInfoOpen(false); toast.success("Company info saved!"); }} style={{ background: "#DC2626" }}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Quote Preview ── */}
      <Dialog open={quotePreviewOpen} onOpenChange={setQuotePreviewOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Quote Preview</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuotePreviewOpen(false)}>Exit</Button>
              <Button size="sm" style={{ background: "#DC2626" }} onClick={() => { toast.success("PDF downloaded!"); }}><Download className="h-3 w-3 mr-1" />Download as PDF</Button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-4">
            <span>Check-in: 2026/04/15(Wed)</span>
            <span className="mx-3">Check-out: 2026/04/16(Thu)</span>
            <p className="mt-1 text-[10px]">Prices are for reference only: 2026/04/15</p>
          </div>

          {/* Hotel card */}
          <Card className="p-4 mb-4">
            <div className="flex gap-3">
              <div className="w-24 h-16 rounded bg-gradient-to-br from-slate-700 to-slate-500 shrink-0 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white/20" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm">{hotel.name}</h3>
                  <span className="text-sm font-bold" style={{ color: "#FF6000" }}>From USD{Math.min(...hotelRooms.map(r => getMarkupPrice(r.id, r.price))).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {Array.from({ length: hotel.starRating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{hotel.area}</p>
              </div>
            </div>
          </Card>

          {/* Room rates with markup applied */}
          {hotelRooms.map(room => (
            <Card key={room.id} className="p-3 mb-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{room.name}</p>
                  <p className="text-[10px] text-muted-foreground">Floor {room.floor} / Size {room.size}m² / {room.hasWindow ? "Has Window" : "No Window"} / WiFi / Max {room.maxGuests} Persons</p>
                </div>
                <p className="text-sm font-bold" style={{ color: "#FF6000" }}>USD{getMarkupPrice(room.id, room.price).toFixed(2)}/room night</p>
              </div>
              <Separator className="my-2" />
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div><span className="text-muted-foreground">{room.mealDetail}</span></div>
                <div><span className={room.cancellationPolicy === "free_cancel" ? "text-green-600" : "text-red-500"}>{room.cancellationPolicy === "free_cancel" ? "Refundable" : "Non-Refundable"}</span></div>
                <div className="text-right font-medium">USD{getMarkupPrice(room.id, room.price).toFixed(2)}/room night</div>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">{room.bedCount} · {room.confirmType}</div>
            </Card>
          ))}

          {/* Overview */}
          <Card className="p-4 mt-4">
            <h3 className="font-bold text-sm mb-2">Overview</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Opening Year:</strong> {2000 + parseInt(hotel.id.replace(/\D/g, "")) % 26}</p>
              <p><strong>Total Rooms:</strong> {200 + parseInt(hotel.id.replace(/\D/g, "")) * 23 % 400}</p>
              <p className="mt-2">{hotel.description}</p>
            </div>
          </Card>

          {/* Company info footer */}
          <div className="mt-4 pt-3 border-t flex items-center justify-center gap-3 text-xs text-muted-foreground">
            {quoteLogo && <img src={quoteLogo} alt="Logo" className="h-8 object-contain" />}
            <div className="text-center">
              <p className="font-medium text-foreground">{quoteCompany}</p>
              <p>{quotePhone}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Sold Out Dialog ── */}
      <Dialog open={soldOutOpen} onOpenChange={setSoldOutOpen}>
        <DialogContent className="max-w-sm text-center">
          <div className="py-4">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold">Important Notice</h3>
            <p className="text-sm text-muted-foreground mt-2">This room type has been sold out. Please select another room type.</p>
            <Button className="mt-4" onClick={() => setSoldOutOpen(false)}>View Available Rooms</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
