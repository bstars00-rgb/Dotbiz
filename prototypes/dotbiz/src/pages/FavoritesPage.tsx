import { Star, MapPin, Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { hotels } from "@/mocks/hotels";
import { toast } from "sonner";

export default function FavoritesPage() {
  /* Show hotels marked as favorite */
  const favoriteHotels = hotels.filter(h => h.isFavorite || h.isFeatured).slice(0, 8);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Heart className="h-6 w-6 fill-red-500 text-red-500" />My Favorites</h1>
        <p className="text-sm text-muted-foreground">{favoriteHotels.length} hotels saved</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {favoriteHotels.map(h => (
          <Card key={h.id} className="p-4 card-hover">
            <div className="flex gap-4">
              <div className="w-28 h-20 rounded-lg shrink-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${h.starRating >= 5 ? "#1a1a2e, #16213e" : "#374151, #6b7280"})` }}>
                <span className="text-white/15 text-2xl">🏨</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm cursor-pointer hover:text-[#FF6000]" onClick={() => window.open(`${window.location.origin}${window.location.pathname}#/app/hotel/${h.id}`, "_blank")}>{h.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: h.starRating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                      <span className="text-xs text-muted-foreground ml-1">{h.reviewScore}/10</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => toast.success("Removed from favorites")}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-2.5 w-2.5" />{h.area}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1">
                    {h.hasFreeCancellation && <Badge variant="outline" className="text-[9px]">Free Cancel</Badge>}
                    {h.brand !== "Independent" && <Badge variant="outline" className="text-[9px]">{h.brand}</Badge>}
                  </div>
                  <p className="text-sm font-bold" style={{ color: "#FF6000" }}>From USD {h.price}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
