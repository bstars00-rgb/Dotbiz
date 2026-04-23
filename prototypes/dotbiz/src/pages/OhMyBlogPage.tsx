import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, Heart, MessageCircle, Share2, Bookmark, Clock, Eye,
  Star, MapPin, Calendar, ThumbsUp, ChevronLeft, ChevronRight,
  Building2, Camera, Utensils, Waves, Sparkles, TrendingUp, Pen, Search, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

  /* ═══════════ Archive — older / existing articles ═══════════ */
  {
    id: "blog-005", hotelId: "htl-007",
    title: "The Peninsula Shanghai: Art Deco Legend on The Bund",
    category: "Luxury Guide", tag: "Heritage", tagColor: "#7c3aed",
    author: "Jennifer Wu", authorRole: "Luxury Editor",
    date: "Mar 10, 2026", readTime: "7 min read",
    views: 9840, likes: 712, comments: 48,
    coverGradient: "from-amber-900 via-yellow-800 to-orange-900",
    excerpt: "A 1929 masterpiece reborn. The Peninsula Shanghai remains the definitive address on the Bund, blending heritage architecture with uncompromising modern service.",
    sections: [
      { type: "intro", content: "The Peninsula Shanghai sits on one of the most storied stretches of real estate in Asia. Built in the art deco era and meticulously restored, it remains a living piece of history." },
      { type: "highlight", title: "Signature Moments", items: ["Afternoon tea at The Lobby — a ritual since 1929", "Rolls Royce fleet for guest transfers", "River-view rooms facing Lujiazui skyline", "Spa with 24K gold therapy"] },
      { type: "verdict", rating: 9.4, content: "A masterclass in heritage hospitality. Worth booking just to experience a bygone era done right." },
    ], photos: 28,
  },
  {
    id: "blog-006", hotelId: "htl-006",
    title: "Lotte Hotel Hanoi: Sky-High Views in the Diplomatic Quarter",
    category: "Featured Review", tag: "Best View", tagColor: "#009505",
    author: "Nguyen Van An", authorRole: "Vietnam Correspondent",
    date: "Mar 05, 2026", readTime: "6 min read",
    views: 7230, likes: 489, comments: 37,
    coverGradient: "from-purple-900 via-fuchsia-800 to-pink-900",
    excerpt: "65 floors above Hanoi, the Lotte has the best skyline view in the city and a restaurant perched in the clouds. Here's why it's our pick for Hanoi stays.",
    sections: [
      { type: "intro", content: "The Lotte Hotel Hanoi stands tall in the Ba Dinh diplomatic district — literally. Its 65F observation deck restaurant 'Top of Hanoi' is a destination on its own." },
      { type: "highlight", title: "Why We Love It", items: ["Heated indoor pool year-round", "Family-friendly concierge", "Free shuttle to Hoan Kiem Lake", "Michelin-starred Korean BBQ 'Hariette'"] },
      { type: "verdict", rating: 8.9, content: "Best mid-luxury option in Hanoi with unmatched views and rock-solid service." },
    ], photos: 19,
  },
  {
    id: "blog-007", hotelId: "htl-008",
    title: "Fairmont Peace Hotel: Where Shanghai Jazz Never Died",
    category: "Featured Review", tag: "Iconic", tagColor: "#b91c1c",
    author: "Li Wei", authorRole: "Cultural Correspondent",
    date: "Feb 28, 2026", readTime: "8 min read",
    views: 11200, likes: 904, comments: 62,
    coverGradient: "from-slate-800 via-slate-700 to-stone-900",
    excerpt: "The Fairmont Peace Hotel has hosted everyone from Noel Coward to Chaplin. Its Old Jazz Band still plays nightly. Here's a dispatch from Shanghai's most romantic hotel.",
    sections: [
      { type: "intro", content: "Since 1929, this art deco icon has been the social heart of the Bund. Few hotels anywhere carry as much living history." },
      { type: "highlight", title: "Iconic Touches", items: ["Old Jazz Bar — original musicians from the 1980s still perform", "Heritage rooms preserved with period fixtures", "Butler service on every floor", "Direct Bund waterfront access"] },
      { type: "verdict", rating: 9.1, content: "Not the flashiest hotel on the Bund, but the most soulful. A must for romantics and history buffs." },
    ], photos: 22,
  },
  {
    id: "blog-008", hotelId: "htl-009",
    title: "Park Hyatt Shanghai: 93 Floors Above Pudong",
    category: "Luxury Guide", tag: "Sky Hotel", tagColor: "#7c3aed",
    author: "David Park", authorRole: "Luxury Editor",
    date: "Feb 22, 2026", readTime: "7 min read",
    views: 13400, likes: 1050, comments: 78,
    coverGradient: "from-sky-900 via-blue-900 to-indigo-900",
    excerpt: "The tallest hotel rooms in Shanghai. Bathtubs facing clouds. The 91F restaurant booked 2 weeks out. Everything you need to know about Park Hyatt Shanghai.",
    sections: [
      { type: "intro", content: "Floors 79 through 93 of the Shanghai World Financial Center — that's where Park Hyatt lives. Every window is a cinematic experience." },
      { type: "highlight", title: "The Sky Experience", items: ["Two-stage elevator ride (lobby → sky lobby → rooms)", "Infinity pool on 85F", "100 Century Avenue on 91F — book 2 weeks ahead", "Cloud cover above 80F is normal — bring patience"] },
      { type: "verdict", rating: 9.3, content: "If you want altitude with your luxury, there's no higher option in Shanghai." },
    ], photos: 25,
  },
  {
    id: "blog-009", hotelId: "htl-010",
    title: "JW Marriott Shanghai: The Reliable Heavyweight",
    category: "Business Travel", tag: "Popular", tagColor: "#FF6000",
    author: "Rachel Chen", authorRole: "Business Editor",
    date: "Feb 18, 2026", readTime: "5 min read",
    views: 6780, likes: 423, comments: 31,
    coverGradient: "from-red-900 via-rose-800 to-pink-900",
    excerpt: "For business travelers who want zero surprises, the JW Marriott Shanghai delivers Marriott consistency in the heart of Jing'an district. A workhorse hotel in the best sense.",
    sections: [
      { type: "intro", content: "Sometimes you don't want to be impressed — you want things to work. The JW Marriott Shanghai is the hotel equivalent of a reliable workhorse." },
      { type: "highlight", title: "Business Essentials", items: ["Direct metro access (Line 2/7/14)", "24h business center", "Fast stable WiFi (tested 400Mbps)", "Express laundry available"] },
      { type: "verdict", rating: 8.8, content: "Not glamorous, but never disappoints. The definitive choice for efficient business stays in Shanghai." },
    ], photos: 14,
  },
  {
    id: "blog-010", hotelId: "htl-002",
    title: "Shilla Stay Mapo: Boutique Value in Hongdae",
    category: "New Opening", tag: "Budget-Friendly", tagColor: "#0891b2",
    author: "Sarah Kim", authorRole: "Travel Editor",
    date: "Feb 14, 2026", readTime: "4 min read",
    views: 4560, likes: 287, comments: 22,
    coverGradient: "from-emerald-900 via-green-800 to-teal-900",
    excerpt: "Shilla's boutique brand lands in Hongdae — walkable to Hongik Univ station, designed for solo travelers and young professionals. Mid-tier price, full-tier quality.",
    sections: [
      { type: "intro", content: "Shilla Stay Mapo proves that you don't need to spend $500/night in Korea to get genuinely well-designed accommodations." },
      { type: "highlight", title: "What Works", items: ["5min walk to Hongik Univ Station (Line 2/AREX)", "Rooms compact but well-designed", "Strong water pressure and fast wifi", "24h convenience store in lobby"] },
      { type: "verdict", rating: 8.3, content: "Best value pick for Seoul's Hongdae area. Perfect for solo travelers and short business trips." },
    ], photos: 11,
  },
  {
    id: "blog-011", hotelId: "htl-011",
    title: "Novotel Shanghai Pudong: Family-Friendly Mid-Range Pick",
    category: "Featured Review", tag: "Family", tagColor: "#009505",
    author: "Michael Chen", authorRole: "Hotel Critic",
    date: "Feb 08, 2026", readTime: "5 min read",
    views: 3890, likes: 201, comments: 18,
    coverGradient: "from-cyan-800 via-blue-700 to-indigo-800",
    excerpt: "If you're traveling to Shanghai with kids, Novotel Pudong's Kids' Playground and easy metro access make it a top pick for family stays without breaking the bank.",
    sections: [
      { type: "intro", content: "Families know: a 5-star hotel isn't always family-friendly. The Novotel Shanghai Pudong nails the balance — kid-friendly amenities without sacrificing adult comfort." },
      { type: "highlight", title: "Family Perks", items: ["Kids' Playground on mezzanine", "Family rooms sleep up to 4", "Free parking (rare in Pudong)", "15min metro to Disneyland"] },
      { type: "verdict", rating: 8.4, content: "The family hotel Shanghai has been missing. Practical, well-priced, and genuinely kid-aware." },
    ], photos: 16,
  },
  {
    id: "blog-012", hotelId: "htl-012",
    title: "Hilton Shanghai Hongqiao: Airport-Adjacent Business Base",
    category: "Business Travel", tag: "Airport Hotel", tagColor: "#FF6000",
    author: "Yuki Tanaka", authorRole: "Business Editor",
    date: "Feb 02, 2026", readTime: "4 min read",
    views: 2980, likes: 156, comments: 12,
    coverGradient: "from-blue-900 via-sky-800 to-cyan-900",
    excerpt: "Near Hongqiao Airport with EV charging, pool, and reliable Hilton service. If you have an early flight or a same-day turnaround, this is your base.",
    sections: [
      { type: "intro", content: "The Hilton Shanghai Hongqiao fills a specific niche: airport-adjacent business travel without sacrificing comfort." },
      { type: "highlight", title: "Airport Essentials", items: ["Free airport shuttle every 30min", "EV chargers in basement garage", "Executive lounge 24/7", "Express breakfast from 5:30am"] },
      { type: "verdict", rating: 8.6, content: "The gold standard for Hongqiao airport stays. Reliable, efficient, no-nonsense." },
    ], photos: 9,
  },
  {
    id: "blog-013", hotelId: "htl-001",
    title: "Hidden Seoul: 5 Secret Spots Hotel Concierges Don't Want You to Miss",
    category: "Featured Review", tag: "Insider Guide", tagColor: "#009505",
    author: "Sarah Kim", authorRole: "Travel Editor",
    date: "Jan 28, 2026", readTime: "9 min read",
    views: 24300, likes: 2140, comments: 187,
    coverGradient: "from-pink-900 via-rose-800 to-red-900",
    excerpt: "From a speakeasy behind a laundromat to a tea house dating back to the Joseon dynasty — these are the Seoul spots even frequent travelers miss.",
    sections: [
      { type: "intro", content: "Every hotel in Seoul has a concierge binder of 'top restaurants' and 'must-see sights.' This is the anti-binder — what locals and seasoned travelers actually book for." },
      { type: "verdict", rating: 9.0, content: "Bookmark this one. Even lifelong Seoul residents discover 2-3 new spots here." },
    ], photos: 32,
  },
  {
    id: "blog-014", hotelId: "htl-005",
    title: "Tokyo Ramen Pilgrimage: 8 Legendary Bowls Within Walking Distance of Ginza Hotels",
    category: "Featured Review", tag: "Food Guide", tagColor: "#e11d48",
    author: "Yuki Tanaka", authorRole: "Food Critic",
    date: "Jan 22, 2026", readTime: "12 min read",
    views: 31200, likes: 2830, comments: 241,
    coverGradient: "from-orange-900 via-red-800 to-rose-900",
    excerpt: "Staying in Ginza? These 8 ramen shops are reachable in 20 minutes on foot. From Michelin-listed to legendary 4am bowls, our definitive Tokyo ramen map.",
    sections: [
      { type: "intro", content: "Ginza isn't known for ramen — which makes the hidden bowls here all the more rewarding to find." },
      { type: "verdict", rating: 9.3, content: "Our most-shared Tokyo food piece of the year. Follow this route for an unforgettable pilgrimage." },
    ], photos: 41,
  },
  {
    id: "blog-015", hotelId: "htl-003",
    title: "Bangkok After Dark: A Hotelier's Guide to Sukhumvit Nightlife",
    category: "Featured Review", tag: "Nightlife", tagColor: "#7c3aed",
    author: "Somchai P.", authorRole: "Bangkok Insider",
    date: "Jan 18, 2026", readTime: "8 min read",
    views: 18700, likes: 1460, comments: 124,
    coverGradient: "from-fuchsia-900 via-purple-800 to-violet-900",
    excerpt: "From rooftop bars with Chao Phraya views to hidden jazz clubs under BTS stations — an Asian hotelier's unfiltered Bangkok night map.",
    sections: [
      { type: "intro", content: "Bangkok after dark is a maze. This guide cuts through the noise." },
      { type: "verdict", rating: 8.8, content: "If you're staying in Sukhumvit, this is your playbook." },
    ], photos: 27,
  },
  {
    id: "blog-016", hotelId: "htl-006",
    title: "Hanoi Street Food Crawl: 6 Stalls Your Hotel Won't Recommend",
    category: "New Opening", tag: "Food Guide", tagColor: "#009505",
    author: "Nguyen Van An", authorRole: "Vietnam Correspondent",
    date: "Jan 12, 2026", readTime: "7 min read",
    views: 14200, likes: 1080, comments: 92,
    coverGradient: "from-yellow-900 via-amber-800 to-orange-900",
    excerpt: "Bún chả, phở, bánh cuốn, egg coffee — the 6 Hanoi street stalls worth skipping hotel breakfast for. Follow this map.",
    sections: [
      { type: "intro", content: "Hotel breakfasts in Hanoi are fine. But skip one morning, and you'll thank us." },
      { type: "verdict", rating: 9.0, content: "Our Hanoi food editor's top-rated guide. Tested through 3 visits." },
    ], photos: 20,
  },
  {
    id: "blog-017", hotelId: "htl-007",
    title: "Business Entertaining in Shanghai: Where to Host Clients (and Where to Avoid)",
    category: "Business Travel", tag: "Client Entertainment", tagColor: "#FF6000",
    author: "Li Wei", authorRole: "Business Editor",
    date: "Jan 05, 2026", readTime: "9 min read",
    views: 11900, likes: 876, comments: 71,
    coverGradient: "from-gray-900 via-slate-800 to-zinc-900",
    excerpt: "Hosting a client dinner in Shanghai? The wrong restaurant signals amateur hour. Our shortlist of tried-and-tested venues — with notes on who to bring and who to avoid.",
    sections: [
      { type: "intro", content: "A first client dinner in Shanghai is its own diplomatic art form. These are the restaurants that always work." },
      { type: "verdict", rating: 9.2, content: "If your company entertains in Shanghai, this guide saves face and money." },
    ], photos: 15,
  },
  {
    id: "blog-018", hotelId: "htl-004",
    title: "Osaka Station Hotels Compared: ANA vs Granvia vs Hilton",
    category: "Business Travel", tag: "Hotel Comparison", tagColor: "#0891b2",
    author: "Yuki Tanaka", authorRole: "Business Editor",
    date: "Dec 28, 2025", readTime: "8 min read",
    views: 8940, likes: 612, comments: 58,
    coverGradient: "from-blue-800 via-indigo-900 to-violet-900",
    excerpt: "Three major hotels share the Osaka Station footprint. We checked into all three, measured the details, and have a clear recommendation depending on your trip.",
    sections: [
      { type: "intro", content: "Osaka Station itself is a destination — which makes the hotels attached to it the most convenient in town. Choosing between them is its own art." },
      { type: "verdict", rating: 8.7, content: "Our comprehensive 3-way comparison. Bookmark before your next Osaka business trip." },
    ], photos: 18,
  },
  {
    id: "blog-019", hotelId: "htl-005",
    title: "Mt. Fuji in 4 Hours: The Bullet Train Day Trip From Your Tokyo Hotel",
    category: "Luxury Guide", tag: "Day Trip", tagColor: "#7c3aed",
    author: "David Park", authorRole: "Luxury Editor",
    date: "Dec 20, 2025", readTime: "6 min read",
    views: 21400, likes: 1720, comments: 134,
    coverGradient: "from-sky-900 via-blue-800 to-cyan-900",
    excerpt: "If you're staying in Tokyo for business, Mt. Fuji is closer than you think. Here's how to make the perfect 4-hour day trip — including the hotel most don't know about.",
    sections: [
      { type: "intro", content: "Mt. Fuji feels like a far-off symbol from Tokyo. It's actually a morning's train ride away." },
      { type: "verdict", rating: 8.9, content: "A weekend-away experience compressed into a day. Worth planning around." },
    ], photos: 24,
  },
  {
    id: "blog-020", hotelId: "htl-001",
    title: "Seoul's Best Hotel Spas: Where C-Suite Executives Actually Go",
    category: "Luxury Guide", tag: "Spa Guide", tagColor: "#db2777",
    author: "Sarah Kim", authorRole: "Travel Editor",
    date: "Dec 15, 2025", readTime: "7 min read",
    views: 16800, likes: 1340, comments: 98,
    coverGradient: "from-rose-900 via-pink-800 to-fuchsia-900",
    excerpt: "Forget the tourist spas. This is where Seoul's executives actually book — including a hanok-style spa that takes only 4 guests at a time.",
    sections: [
      { type: "intro", content: "Seoul's luxury spa scene has quietly become world-class. Here's the insider map." },
      { type: "verdict", rating: 9.1, content: "For the discerning spa-goer, this shortlist is definitive." },
    ], photos: 22,
  },
];

/* Top-level category (for filter pills) — derived from article.category */
function mainCategoryOf(article: typeof articles[number]): "Featured" | "New Opening" | "Luxury" | "Business" {
  if (article.category.includes("Business")) return "Business";
  if (article.category.includes("Luxury"))   return "Luxury";
  if (article.category.includes("New"))      return "New Opening";
  return "Featured";
}

/* ── Blog List Page ── */
type BlogCategory = "Featured" | "New Opening" | "Luxury" | "Business";

function BlogList({ onSelect }: { onSelect: (id: string) => void }) {
  const navigate = useNavigate();

  /* Category filter — 4 main categories (no "All") */
  const [activeCategory, setActiveCategory] = useState<BlogCategory>("Featured");
  const [archiveSearch, setArchiveSearch] = useState("");

  /* Main 4 featured = the most recent article from each category
   * matching the active filter, or globally top 4 when unfiltered. */
  const filteredArticles = useMemo(
    () => articles.filter(a => mainCategoryOf(a) === activeCategory),
    [activeCategory]
  );

  /* "Main" view: top 4 by views within the active category */
  const mainFour = useMemo(
    () => [...filteredArticles].sort((a, b) => b.views - a.views).slice(0, 4),
    [filteredArticles]
  );

  /* Archive (all articles, searchable) — separate section below main 4 */
  const archiveArticles = useMemo(() => {
    const q = archiveSearch.trim().toLowerCase();
    let list = [...articles].sort((a, b) => b.date.localeCompare(a.date));
    if (q) {
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [archiveSearch]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Pen className="h-6 w-6" style={{ color: "#FF6000" }} />
            OhMy Blog
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Hotel stories, reviews & travel inspiration by OhMyHotel&Co</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["Featured", "New Opening", "Luxury", "Business"] as const).map(tab => {
            const isActive = activeCategory === tab;
            const count = articles.filter(a => mainCategoryOf(a) === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveCategory(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive ? "text-white" : "border hover:border-[#FF6000]/40 hover:text-[#FF6000]"
                }`}
                style={isActive ? { background: "#FF6000" } : {}}
              >
                {tab} <span className={`ml-1 text-[10px] ${isActive ? "text-white/80" : "text-muted-foreground"}`}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Article (Large) — top in current category */}
      {mainFour.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No articles in {activeCategory} yet. Check other categories or browse the archive below.
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all" onClick={() => onSelect(mainFour[0].id)}>
            <div className="flex">
              <div className={`w-[45%] relative overflow-hidden bg-gradient-to-br ${mainFour[0].coverGradient}`} style={{ minHeight: 280 }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="h-24 w-24 text-white/10" />
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white" style={{ background: mainFour[0].tagColor }}>{mainFour[0].tag}</span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/40 text-white backdrop-blur-sm">{mainFour[0].category}</span>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-white/70" />
                  <span className="text-xs text-white/70">{mainFour[0].photos} photos</span>
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold group-hover:text-[#FF6000] transition-colors leading-tight">{mainFour[0].title}</h2>
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{mainFour[0].excerpt}</p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mt-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs" style={{ background: "#FF6000", color: "white" }}>{mainFour[0].author.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{mainFour[0].author}</p>
                      <p className="text-xs text-muted-foreground">{mainFour[0].authorRole}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{mainFour[0].readTime}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{mainFour[0].views.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{mainFour[0].likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{mainFour[0].comments}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Article Grid — top 2-4 in category */}
          {mainFour.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {mainFour.slice(1, 4).map(article => (
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
          )}
        </>
      )}

      {/* ═══════════ Archive — all existing articles ═══════════ */}
      <div className="pt-6 border-t">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              All Articles
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {articles.length} stories across all categories · searchable archive
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search archive by title, author, keyword…"
              value={archiveSearch}
              onChange={e => setArchiveSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {archiveArticles.length === 0 ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            No articles match "{archiveSearch}".
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {archiveArticles.map(article => (
              <Card
                key={article.id}
                className="overflow-hidden group cursor-pointer hover:shadow-md transition-all"
                onClick={() => onSelect(article.id)}
              >
                <div className={`relative h-28 bg-gradient-to-br ${article.coverGradient}`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-white/10" />
                  </div>
                  <Badge
                    className="absolute top-2 left-2 text-[9px] border-0 text-white"
                    style={{ background: article.tagColor }}
                  >
                    {mainCategoryOf(article)}
                  </Badge>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-xs group-hover:text-[#FF6000] transition-colors line-clamp-2 leading-tight min-h-[32px]">
                    {article.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t text-[10px] text-muted-foreground">
                    <span>{article.author}</span>
                    <span>{article.date.split(",")[0]}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{article.views >= 1000 ? `${(article.views / 1000).toFixed(1)}k` : article.views}</span>
                    <span className="flex items-center gap-0.5"><Heart className="h-2.5 w-2.5" />{article.likes}</span>
                    <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{article.readTime}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
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
