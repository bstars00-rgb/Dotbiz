import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, Heart, MessageCircle, Share2, Bookmark, Clock, Eye,
  Star, MapPin, Calendar, ThumbsUp, ChevronLeft, ChevronRight,
  Building2, Camera, Utensils, Waves, Sparkles, TrendingUp, Pen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { hotels } from "@/mocks/hotels";

/* ── Blog Articles Data ── */
const articles = [
  {
    id: "blog-001",
    hotelId: "htl-001",
    title: "Grand Hyatt Seoul: Where Luxury Meets Korean Heritage",
    category: "Featured Review",
    tag: "Editor's Pick",
    tagColor: "#009505",
    author: "Sarah Kim",
    authorRole: "Travel Editor",
    date: "Mar 25, 2026",
    readTime: "8 min read",
    views: 12400,
    likes: 847,
    comments: 56,
    coverGradient: "from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
    excerpt: "Nestled in the heart of Yongsan, the Grand Hyatt Seoul offers breathtaking views of Namsan Mountain and the Han River. From its award-winning spa to the infinity pool, every detail speaks luxury.",
    sections: [
      { type: "intro", content: "Seoul's premier luxury destination has been reimagined for 2026. The Grand Hyatt Seoul underwent a $50M renovation, bringing modern Korean aesthetics to its legendary hospitality." },
      { type: "highlight", title: "What We Love", items: ["Infinity pool overlooking Namsan Mountain", "Michelin-starred Korean restaurant 'Hanbat'", "24-hour butler service", "Direct access to Namsan trail"] },
      { type: "rooms", title: "Room Categories", items: ["Grand King — 45m², city view, from $280/night", "Grand Suite — 85m², mountain view, from $520/night", "Presidential Suite — 200m², panoramic, from $1,800/night"] },
      { type: "tip", content: "Pro Tip: Book the Grand Suite with the 'Namsan Package' to get complimentary sunrise yoga and a Korean tea ceremony experience." },
      { type: "verdict", rating: 9.2, content: "A masterful blend of modern luxury and Korean tradition. The Grand Hyatt Seoul delivers an unforgettable experience that justifies every dollar." },
    ],
    photos: 24,
  },
  {
    id: "blog-002",
    hotelId: "htl-003",
    title: "Hotel Nikko Bangkok: Japanese Precision in the Heart of Sukhumvit",
    category: "New Opening",
    tag: "Instagram Famous",
    tagColor: "#e11d48",
    author: "Michael Chen",
    authorRole: "Hotel Critic",
    date: "Mar 22, 2026",
    readTime: "6 min read",
    views: 8930,
    likes: 623,
    comments: 41,
    coverGradient: "from-amber-900 via-orange-800 to-red-900",
    excerpt: "A perfect fusion of Japanese hospitality and Thai warmth, Hotel Nikko Bangkok has quickly become the go-to address for discerning travelers in Bangkok's vibrant Sukhumvit district.",
    sections: [
      { type: "intro", content: "From the moment you step into the sleek lobby, you know this isn't your typical Bangkok hotel. Japanese attention to detail is evident in every corner." },
      { type: "highlight", title: "Standout Features", items: ["Rooftop onsen-style spa", "Authentic Japanese teppanyaki restaurant", "Sky bar on the 32nd floor", "Direct BTS Skytrain access"] },
      { type: "rooms", title: "Accommodation", items: ["Deluxe Room — 38m², city view, from $195/night", "Nikko Suite — 72m², river view, from $380/night", "Royal Suite — 150m², panoramic, from $950/night"] },
      { type: "tip", content: "Insider Tip: The Sunday Japanese brunch buffet ($65) is the best-kept secret in Bangkok. Arrive early for the sashimi station." },
      { type: "verdict", rating: 9.0, content: "Hotel Nikko Bangkok sets a new standard for Japanese hospitality abroad. The fusion of cultures creates something truly special." },
    ],
    photos: 18,
  },
  {
    id: "blog-003",
    hotelId: "htl-004",
    title: "ANA Crowne Plaza Osaka: Business Class Comfort in Kita-ku",
    category: "Business Travel",
    tag: "Newly Renovated",
    tagColor: "#FF6000",
    author: "Yuki Tanaka",
    authorRole: "Business Editor",
    date: "Mar 18, 2026",
    readTime: "5 min read",
    views: 5620,
    likes: 312,
    comments: 28,
    coverGradient: "from-slate-800 via-gray-700 to-zinc-600",
    excerpt: "After a comprehensive 2025 renovation, ANA Crowne Plaza Osaka emerges as the premier business hotel near Osaka Station. Smart rooms, fast wifi, and unbeatable access.",
    sections: [
      { type: "intro", content: "Business travelers rejoice — the ANA Crowne Plaza Osaka has completely transformed its guest experience with smart technology and modern design." },
      { type: "highlight", title: "Business Essentials", items: ["500Mbps complimentary WiFi", "24-hour business center with private pods", "5-minute walk to Osaka Station", "Same-day laundry service"] },
      { type: "rooms", title: "Room Options", items: ["Standard — 28m², functional design, from $165/night", "Club Room — 35m², lounge access, from $230/night", "Executive Suite — 60m², meeting space, from $400/night"] },
      { type: "tip", content: "Business Hack: The Club Lounge offers complimentary cocktail hour (5-7pm) — perfect for informal client meetings with a view." },
      { type: "verdict", rating: 8.5, content: "The gold standard for business travel in Osaka. Efficient, comfortable, and perfectly located." },
    ],
    photos: 12,
  },
  {
    id: "blog-004",
    hotelId: "htl-005",
    title: "Mandarin Oriental Tokyo: The Art of Ultra-Luxury",
    category: "Luxury Guide",
    tag: "Top Rated",
    tagColor: "#7c3aed",
    author: "David Park",
    authorRole: "Luxury Editor",
    date: "Mar 15, 2026",
    readTime: "10 min read",
    views: 18200,
    likes: 1230,
    comments: 89,
    coverGradient: "from-violet-900 via-purple-800 to-indigo-900",
    excerpt: "With a 9.5 rating and three Michelin stars under its belt, the Mandarin Oriental Tokyo doesn't just meet expectations — it redefines them entirely.",
    sections: [
      { type: "intro", content: "Perched in Nihonbashi, Tokyo's historic commercial district, the Mandarin Oriental delivers an experience that transcends traditional hospitality." },
      { type: "highlight", title: "Why It's #1", items: ["3 Michelin-starred restaurants on-site", "Award-winning holistic spa", "Panoramic Mt. Fuji views on clear days", "Personal concierge for every guest"] },
      { type: "rooms", title: "Suite Collection", items: ["Deluxe Room — 50m², skyline view, from $450/night", "Oriental Suite — 100m², corner panorama, from $1,200/night", "Presidential Suite — 250m², full floor, from $5,000/night"] },
      { type: "tip", content: "Ultimate Experience: Book the 'Tokyo Legends' package for a private tea ceremony with a 10th-generation tea master, followed by a helicopter tour." },
      { type: "verdict", rating: 9.5, content: "Simply the finest hotel in Tokyo. Every detail is perfect, every moment memorable. Worth every yen." },
    ],
    photos: 36,
  },
];

/* ── Blog List Page ── */
function BlogList({ onSelect }: { onSelect: (id: string) => void }) {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Pen className="h-6 w-6" style={{ color: "#FF6000" }} />
            OhMy Blog
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Hotel stories, reviews & travel inspiration by OhMyHotel&Co</p>
        </div>
        <div className="flex gap-2">
          {["All", "Featured", "New Opening", "Luxury", "Business"].map((tab, i) => (
            <button key={tab} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${i === 0 ? "text-white" : "border hover:border-[#FF6000]/40 hover:text-[#FF6000]"}`} style={i === 0 ? { background: "#FF6000" } : {}}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Article (Large) */}
      <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all" onClick={() => onSelect(articles[0].id)}>
        <div className="flex">
          <div className={`w-[45%] relative overflow-hidden bg-gradient-to-br ${articles[0].coverGradient}`} style={{ minHeight: 280 }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="h-24 w-24 text-white/10" />
            </div>
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white" style={{ background: articles[0].tagColor }}>{articles[0].tag}</span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/40 text-white backdrop-blur-sm">{articles[0].category}</span>
            </div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <Camera className="h-4 w-4 text-white/70" />
              <span className="text-xs text-white/70">{articles[0].photos} photos</span>
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold group-hover:text-[#FF6000] transition-colors leading-tight">{articles[0].title}</h2>
              <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{articles[0].excerpt}</p>
            </div>
            <div>
              <div className="flex items-center gap-3 mt-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs" style={{ background: "#FF6000", color: "white" }}>{articles[0].author.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{articles[0].author}</p>
                  <p className="text-xs text-muted-foreground">{articles[0].authorRole}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{articles[0].readTime}</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{articles[0].views.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{articles[0].likes}</span>
                <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{articles[0].comments}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {articles.slice(1).map(article => (
          <Card key={article.id} className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all" onClick={() => onSelect(article.id)}>
            <div className={`relative h-40 bg-gradient-to-br ${article.coverGradient}`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="h-12 w-12 text-white/10" />
              </div>
              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: article.tagColor }}>{article.tag}</span>
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                <Camera className="h-3 w-3 text-white/70" />
                <span className="text-[10px] text-white/70">{article.photos} photos</span>
              </div>
            </div>
            <div className="p-4">
              <Badge variant="secondary" className="text-[10px] mb-2">{article.category}</Badge>
              <h3 className="font-bold text-sm group-hover:text-[#FF6000] transition-colors line-clamp-2 leading-tight">{article.title}</h3>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{article.excerpt}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[8px]" style={{ background: "#FF6000", color: "white" }}>{article.author.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{article.author}</span>
                </div>
                <span className="text-xs text-muted-foreground">{article.date}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ── Blog Detail Page ── */
function BlogDetail({ articleId, onBack }: { articleId: string; onBack: () => void }) {
  const navigate = useNavigate();
  const article = articles.find(a => a.id === articleId) || articles[0];
  const hotel = hotels.find(h => h.id === article.hotelId);

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Blog
        </Button>

        {/* Cover */}
        <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${article.coverGradient}`} style={{ height: 300 }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="h-24 w-24 text-white/10" />
          </div>
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: article.tagColor }}>{article.tag}</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/40 text-white backdrop-blur-sm">{article.category}</span>
          </div>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 text-white"><Heart className="h-4 w-4" /></button>
            <button className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 text-white"><Bookmark className="h-4 w-4" /></button>
            <button className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 text-white"><Share2 className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mt-6 leading-tight">{article.title}</h1>

        {/* Author + Meta */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback style={{ background: "#FF6000", color: "white" }}>{article.author.split(" ").map(n => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{article.author}</p>
              <p className="text-xs text-muted-foreground">{article.authorRole} · {article.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{article.readTime}</span>
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{article.views.toLocaleString()}</span>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Content */}
        <div className="space-y-6">
          {article.sections.map((section, i) => {
            if (section.type === "intro") return <p key={i} className="text-[15px] leading-relaxed">{section.content}</p>;
            if (section.type === "highlight") return (
              <Card key={i} className="p-5" style={{ borderLeft: "4px solid #FF6000" }}>
                <h3 className="font-bold flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4" style={{ color: "#FF6000" }} />{section.title}</h3>
                <ul className="space-y-2">{section.items!.map((item, j) => <li key={j} className="text-sm flex items-start gap-2"><span style={{ color: "#FF6000" }}>✓</span>{item}</li>)}</ul>
              </Card>
            );
            if (section.type === "rooms") return (
              <div key={i}>
                <h3 className="font-bold mb-3">{section.title}</h3>
                <div className="space-y-2">{section.items!.map((item, j) => (
                  <div key={j} className="flex items-center gap-3 p-3 rounded-lg border hover:border-[#FF6000]/30 transition-colors">
                    <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}</div>
              </div>
            );
            if (section.type === "tip") return (
              <Card key={i} className="p-5 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <p className="text-sm"><span className="font-bold">💡 {section.content?.split(":")[0]}:</span>{section.content?.split(":").slice(1).join(":")}</p>
              </Card>
            );
            if (section.type === "verdict") return (
              <Card key={i} className="p-6 text-center">
                <p className="text-4xl font-black" style={{ color: "#FF6000" }}>{(section as any).rating}/10</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} className={`h-5 w-5 ${j < Math.round((section as any).rating / 2) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />)}
                </div>
                <p className="text-sm mt-3 text-muted-foreground">{section.content}</p>
              </Card>
            );
            return null;
          })}
        </div>

        {/* Hotel CTA */}
        {hotel && (
          <Card className="p-5 mt-8 flex items-center justify-between" style={{ borderLeft: "4px solid #FF6000" }}>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Featured Hotel</p>
              <h3 className="font-bold">{hotel.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{hotel.area}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">From</p>
              <p className="text-xl font-bold" style={{ color: "#FF6000" }}>${hotel.price}/night</p>
              <Button size="sm" className="mt-2 text-white" style={{ background: "#FF6000" }} onClick={() => navigate(`/app/hotel/${hotel.id}`)}>
                View & Book
              </Button>
            </div>
          </Card>
        )}

        {/* Engagement */}
        <div className="flex items-center justify-between mt-6 py-4 border-t">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#FF6000] transition-colors"><ThumbsUp className="h-4 w-4" />{article.likes} Likes</button>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#FF6000] transition-colors"><MessageCircle className="h-4 w-4" />{article.comments} Comments</button>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#FF6000] transition-colors"><Bookmark className="h-4 w-4" />Save</button>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#FF6000] transition-colors"><Share2 className="h-4 w-4" />Share</button>
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}

/* ── Main Export ── */
export default function OhMyBlogPage() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [selectedArticle, setSelectedArticle] = useState<string | null>(articleId || null);

  if (selectedArticle) {
    return <BlogDetail articleId={selectedArticle} onBack={() => { setSelectedArticle(null); navigate("/app/blog"); }} />;
  }
  return <BlogList onSelect={(id) => { setSelectedArticle(id); navigate(`/app/blog/${id}`); }} />;
}
