import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Star, MapPin, ChevronDown, Heart, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { hotels } from "@/mocks/hotels";

/* ── Campaign Data ── */
const campaigns: Record<string, {
  title: string; subtitle: string; gradient: string; icon: string;
  countries: { name: string; cities: string[] }[];
}> = {
  "big-discounts": {
    title: "Big discounts are LIVE",
    subtitle: "Great deals on hotels around the world",
    gradient: "from-amber-700 via-orange-500 to-yellow-400",
    icon: "🏷️",
    countries: [
      { name: "Thailand", cities: ["Bangkok", "Pattaya", "Phuket", "Koh Samui", "Chiang Mai"] },
      { name: "Japan", cities: ["Tokyo", "Osaka", "Kyoto", "Fukuoka", "Sapporo"] },
      { name: "South Korea", cities: ["Seoul", "Busan", "Jeju", "Gangnam", "Myeongdong"] },
      { name: "Vietnam", cities: ["Ho Chi Minh", "Hanoi", "Da Nang", "Nha Trang", "Phu Quoc"] },
    ],
  },
  "prebuy-hotels": {
    title: "DOTBIZ Pre-buy Hotels",
    subtitle: "Exclusive Inventory & Best Price Guarantee",
    gradient: "from-emerald-700 via-teal-500 to-cyan-400",
    icon: "💎",
    countries: [
      { name: "Japan", cities: ["Tokyo", "Osaka", "Kyoto", "Nagoya", "Hiroshima"] },
      { name: "South Korea", cities: ["Seoul", "Busan", "Incheon", "Daegu"] },
      { name: "Singapore", cities: ["Marina Bay", "Orchard", "Sentosa", "Bugis"] },
    ],
  },
  "managers-choice": {
    title: "Market Manager's Choice",
    subtitle: "Recommended by our local DC team from 11 countries",
    gradient: "from-violet-700 via-purple-500 to-fuchsia-400",
    icon: "🏆",
    countries: [
      { name: "South Korea", cities: ["Seoul", "Busan", "Jeju"] },
      { name: "Thailand", cities: ["Bangkok", "Phuket", "Chiang Mai"] },
      { name: "Japan", cities: ["Tokyo", "Osaka", "Fukuoka"] },
      { name: "Vietnam", cities: ["Hanoi", "Ho Chi Minh", "Da Nang"] },
    ],
  },
  "spring-family-getaway": {
    title: "Spring Family Getaway!",
    subtitle: "Family-friendly hotels with kids' amenities and pool access",
    gradient: "from-pink-600 via-rose-500 to-orange-400",
    icon: "👨‍👩‍👧‍👦",
    countries: [
      { name: "Thailand", cities: ["Bangkok", "Phuket", "Pattaya"] },
      { name: "Japan", cities: ["Tokyo", "Osaka"] },
    ],
  },
  "cherry-blossom": {
    title: "Cherry Blossom Season",
    subtitle: "Best hotels near cherry blossom viewing spots",
    gradient: "from-pink-500 via-rose-400 to-pink-300",
    icon: "🌸",
    countries: [
      { name: "Japan", cities: ["Tokyo", "Osaka", "Kyoto", "Fukuoka"] },
      { name: "South Korea", cities: ["Seoul", "Busan", "Jeju"] },
    ],
  },
  "da-nang-charm": {
    title: "Discover Da Nang Charm",
    subtitle: "Beach resorts and cultural experiences in central Vietnam",
    gradient: "from-teal-600 via-cyan-500 to-sky-400",
    icon: "🏖️",
    countries: [
      { name: "Vietnam", cities: ["Da Nang", "Hoi An", "Hue"] },
    ],
  },
  "songkran-festival": {
    title: "Happy Songkran Festival!",
    subtitle: "Thailand's famous water festival — special hotel deals",
    gradient: "from-blue-600 via-cyan-500 to-teal-400",
    icon: "💦",
    countries: [
      { name: "Thailand", cities: ["Bangkok", "Chiang Mai", "Pattaya", "Phuket"] },
    ],
  },
  "exclusive-stay": {
    title: "Exclusive Stay Privileges",
    subtitle: "DOTBIZ members-only rates at premium properties",
    gradient: "from-amber-600 via-yellow-500 to-lime-400",
    icon: "👑",
    countries: [
      { name: "All Destinations", cities: ["Seoul", "Tokyo", "Bangkok", "Singapore", "Hanoi"] },
    ],
  },
  "seoul-luxury": {
    title: "Seoul Luxury Collection",
    subtitle: "The finest 5-star hotels in Seoul",
    gradient: "from-slate-800 via-slate-600 to-slate-400",
    icon: "✨",
    countries: [
      { name: "South Korea", cities: ["Gangnam", "Myeongdong", "Yeouido", "Jongno"] },
    ],
  },
  "eid-special": {
    title: "Eid al-Fitr Special Offer",
    subtitle: "Halal-friendly hotels with special Eid celebrations",
    gradient: "from-emerald-600 via-green-500 to-lime-400",
    icon: "🌙",
    countries: [
      { name: "Malaysia", cities: ["Kuala Lumpur", "Langkawi", "Penang"] },
      { name: "Thailand", cities: ["Bangkok", "Phuket"] },
    ],
  },
  "tokyo-sakura": {
    title: "Tokyo Sakura Tour",
    subtitle: "Hotels near Tokyo's best sakura spots",
    gradient: "from-pink-600 via-rose-500 to-red-400",
    icon: "🗼",
    countries: [
      { name: "Japan", cities: ["Shinjuku", "Shibuya", "Ueno", "Chiyoda"] },
    ],
  },
  "spring-korea": {
    title: "Start Your Spring Journey to Korea",
    subtitle: "Best Korean hotels for spring travel",
    gradient: "from-green-600 via-emerald-500 to-teal-400",
    icon: "🇰🇷",
    countries: [
      { name: "South Korea", cities: ["Seoul", "Busan", "Jeju", "Gyeongju"] },
    ],
  },
  "southeast-asia": {
    title: "Explore the Wonders of Southeast Asia",
    subtitle: "Top-rated hotels across SE Asia destinations",
    gradient: "from-orange-600 via-red-500 to-pink-500",
    icon: "🌏",
    countries: [
      { name: "Thailand", cities: ["Bangkok", "Phuket"] },
      { name: "Vietnam", cities: ["Hanoi", "Ho Chi Minh"] },
      { name: "Singapore", cities: ["Marina Bay", "Orchard"] },
    ],
  },
  "far-east-deals": {
    title: "Far East Hospitality's Best Deals",
    subtitle: "Premium hospitality at unbeatable prices",
    gradient: "from-blue-700 via-indigo-600 to-violet-500",
    icon: "🏨",
    countries: [
      { name: "Singapore", cities: ["Marina Bay", "Orchard", "Sentosa"] },
      { name: "Japan", cities: ["Tokyo", "Osaka"] },
    ],
  },
  "asia-roadshow": {
    title: "Engage-2026 Asia Roadshow",
    subtitle: "Conference and event hotel packages across Asia",
    gradient: "from-gray-700 via-slate-600 to-zinc-500",
    icon: "🎤",
    countries: [
      { name: "All Destinations", cities: ["Seoul", "Tokyo", "Bangkok", "Singapore"] },
    ],
  },
};

const defaultCampaign = {
  title: "Campaign",
  subtitle: "Special hotel deals",
  gradient: "from-slate-700 via-slate-500 to-slate-400",
  icon: "🏨",
  countries: [{ name: "All", cities: ["Seoul", "Tokyo", "Bangkok"] }],
};

/* ── Mock hotels for campaign (repeat + shuffle) ── */
function getCampaignHotels() {
  const all = [...hotels, ...hotels].map((h, i) => ({ ...h, id: `${h.id}-c${i}`, price: Math.round(h.price * (0.7 + Math.random() * 0.5)) }));
  return all.sort(() => Math.random() - 0.5);
}

export default function CampaignPage() {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const campaign = campaigns[campaignId || ""] || defaultCampaign;
  const [selectedCountry, setSelectedCountry] = useState(0);
  const [selectedCity, setSelectedCity] = useState(0);
  const [starFilters, setStarFilters] = useState<number[]>([]);
  const [campaignHotels] = useState(getCampaignHotels);

  const country = campaign.countries[selectedCountry];
  const city = country?.cities[selectedCity] || "";

  const toggleStar = (s: number) => {
    setStarFilters(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const filteredHotels = campaignHotels.filter(h => {
    if (starFilters.length > 0 && !starFilters.includes(h.starRating)) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Hero Banner */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${campaign.gradient}`} style={{ minHeight: 220 }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[120px] opacity-10">{campaign.icon}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="relative z-10 px-8 py-10 max-w-5xl mx-auto">
          <Button variant="ghost" size="sm" className="text-white/80 hover:text-white mb-4 -ml-2" onClick={() => navigate("/app/find-hotel")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Find Hotel
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2">{campaign.title}</h1>
          <p className="text-lg text-white/80">{campaign.subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar — Star Rating Filter */}
        <div className="w-56 shrink-0 border-r p-5 space-y-5 overflow-auto">
          {/* Country selector */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Country</p>
            <div className="relative">
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm bg-card font-medium appearance-none pr-8"
                style={{ color: "#FF6000" }}
                value={selectedCountry}
                onChange={e => { setSelectedCountry(Number(e.target.value)); setSelectedCity(0); }}
              >
                {campaign.countries.map((c, i) => (
                  <option key={i} value={i}>{c.name} / {c.cities[0]}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Star Rating */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Star Rating</p>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <Checkbox
                    checked={starFilters.includes(s)}
                    onCheckedChange={() => toggleStar(s)}
                  />
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: s }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Country title + City tabs */}
          <h2 className="text-2xl font-bold text-center mb-4">{country?.name}</h2>
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {country?.cities.map((c, i) => (
              <button
                key={c}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${selectedCity === i
                  ? "text-white shadow-md"
                  : "border bg-card hover:border-[#FF6000]/40 hover:text-[#FF6000]"
                }`}
                style={selectedCity === i ? { background: "#FF6000" } : {}}
                onClick={() => setSelectedCity(i)}
              >
                {c}
              </button>
            ))}
            <button className="h-9 w-9 rounded-full border flex items-center justify-center hover:border-[#FF6000]/40">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="h-9 w-9 rounded-full border flex items-center justify-center hover:border-[#FF6000]/40">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Hotel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredHotels.slice(0, 9).map(h => (
              <Card key={h.id} className="group overflow-hidden cursor-pointer hover:shadow-xl transition-all" onClick={() => navigate(`/app/hotel/${h.id.split("-c")[0]}`)}>
                {/* Image */}
                <div className="relative h-44 overflow-hidden" style={{ background: `linear-gradient(135deg, ${h.starRating >= 5 ? "#1a1a2e, #16213e" : "#374151, #6b7280"})` }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building2 className="h-14 w-14 text-white/15" />
                  </div>
                  <button className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40" onClick={e => e.stopPropagation()}>
                    <Heart className={`h-3.5 w-3.5 ${h.isFavorite ? "fill-red-500 text-red-500" : "text-white"}`} />
                  </button>
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-sm group-hover:text-[#FF6000] transition-colors truncate">{h.name}</h3>
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: h.starRating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />{h.area}
                  </p>
                  <div className="flex items-end justify-between mt-3">
                    <div>
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="text-lg font-bold" style={{ color: "#FF6000" }}>
                        <span className="text-xs font-normal text-muted-foreground">KRW </span>
                        {(h.price * 1350).toLocaleString()}
                      </p>
                    </div>
                    <Button size="sm" className="text-white rounded-md" style={{ background: "#e11d48" }}>
                      Book Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Load more */}
          <div className="flex justify-center mt-8">
            <Button variant="outline" size="lg" className="px-8">
              Load More Hotels
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
