import { useState } from "react";
import { useSearchParams } from "react-router";
import { Star, MapPin, Building2, Download, Settings, Eye, ArrowLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { hotels } from "@/mocks/hotels";
import { getRoomsByHotel } from "@/mocks/rooms";
import { voucherSettings } from "@/mocks/clientManagement";
import { toast } from "sonner";

export default function MarkupSharingPage() {
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get("id") || "htl-007";
  const hotel = hotels.find(h => h.id === hotelId) || hotels[0];
  const allRooms = getRoomsByHotel(hotel.id);

  /* Search params */
  const nights = parseInt(searchParams.get("nights") || "1") || 1;
  const paramCheckIn = searchParams.get("checkin") || "2026-04-15";
  const paramCheckOut = searchParams.get("checkout") || "2026-04-16";

  /* Custom Info */
  const [quoteLogo, setQuoteLogo] = useState<string | null>(null);
  const [quoteCompany, setQuoteCompany] = useState(voucherSettings.companyName);
  const [quotePhone, setQuotePhone] = useState(voucherSettings.phone);
  const [customInfoOpen, setCustomInfoOpen] = useState(false);
  /* Nights fixed from search — not editable */
  const stayNights = nights;

  /* Markup per room */
  const [markupValues, setMarkupValues] = useState<Record<string, number>>({});
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set()); /* empty by default */

  /* Preview */
  const [previewOpen, setPreviewOpen] = useState(false);

  const getMarkupPrice = (roomId: string, basePrice: number) => {
    const pct = markupValues[roomId] || 0;
    return Math.round(basePrice * (1 + pct / 100) * 100) / 100;
  };

  const toggleRoom = (id: string) => setSelectedRooms(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const selectedRoomData = allRooms.filter(r => selectedRooms.has(r.id));

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.close()}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-lg font-bold">Price Markup Sharing</h1>
          <Badge variant="secondary" className="text-xs">{hotel.name}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCustomInfoOpen(true)}><Settings className="h-3.5 w-3.5 mr-1" />Custom Info</Button>
          <Button size="sm" onClick={() => setPreviewOpen(true)} style={{ background: "#DC2626" }}><Eye className="h-3.5 w-3.5 mr-1" />Preview</Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Hotel Info */}
        <Card className="p-5">
          <div className="flex gap-4">
            <div className="w-32 h-20 rounded-lg shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
              <Building2 className="h-10 w-10 text-white/15" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{hotel.name}</h2>
                <div className="flex">{Array.from({ length: hotel.starRating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3.5 w-3.5" />{hotel.area}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Check-in: {new Date(paramCheckIn + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} → Check-out: {new Date(paramCheckOut + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                <Badge variant="secondary" className="text-[10px] ml-2">{stayNights} night{stayNights > 1 ? "s" : ""}</Badge>
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Lowest after markup</p>
              <p className="text-2xl font-bold" style={{ color: "#FF6000" }}>USD {selectedRoomData.length > 0 ? Math.min(...selectedRoomData.map(r => getMarkupPrice(r.id, r.price))).toFixed(2) : "—"}</p>
            </div>
          </div>
        </Card>

        {/* Company Info Preview */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {quoteLogo ? <img src={quoteLogo} alt="Logo" className="h-10 object-contain" /> : <div className="h-10 w-16 border-2 border-dashed rounded flex items-center justify-center text-xs text-muted-foreground">Logo</div>}
              <div>
                <p className="text-sm font-bold">{quoteCompany}</p>
                <p className="text-xs text-muted-foreground">{quotePhone}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCustomInfoOpen(true)}><Settings className="h-3 w-3 mr-1" />Edit</Button>
          </div>
        </Card>

        {/* Room Markup Table */}
        <Card className="overflow-hidden">
          <div className="px-4 py-3 bg-muted/50 border-b flex items-center justify-between">
            <h3 className="font-bold text-sm">Room Rate Markup</h3>
            <p className="text-xs text-muted-foreground">{selectedRooms.size} of {allRooms.length} rooms selected</p>
          </div>
          <div className="divide-y">
            {allRooms.map(room => {
              const isSelected = selectedRooms.has(room.id);
              return (
                <div key={room.id} className={`flex items-stretch ${isSelected ? "" : "opacity-40"}`}>
                  {/* Checkbox + Room Info */}
                  <div className="w-56 p-4 border-r flex gap-3 shrink-0">
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleRoom(room.id)} className="mt-1" />
                    <div>
                      <p className="text-sm font-bold">{room.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Floor {room.floor} / {room.size}m²</p>
                      <p className="text-[10px] text-primary mt-0.5 cursor-pointer hover:underline">View more</p>
                    </div>
                  </div>
                  {/* Confirm + Bed + Meal */}
                  <div className="w-40 p-4 border-r flex flex-col justify-center shrink-0">
                    <p className="text-xs text-green-600 font-medium">{room.confirmType}</p>
                    <p className="text-xs mt-1">{room.bedCount}</p>
                    <p className={`text-xs mt-0.5 ${room.mealIncluded ? "text-green-600" : "text-muted-foreground"}`}>{room.mealDetail}</p>
                  </div>
                  {/* Cancellation */}
                  <div className="w-32 p-4 border-r flex items-center shrink-0">
                    <p className={`text-xs font-medium ${room.cancellationPolicy === "free_cancel" ? "text-green-600" : "text-red-500"}`}>
                      {room.cancellationPolicy === "free_cancel" ? "Refundable" : "Non-Refundable"}
                    </p>
                  </div>
                  {/* Pricing + Markup */}
                  <div className="flex-1 p-4">
                    <p className="text-[10px] text-muted-foreground mb-1">Current Price: {room.price.toFixed(2)} / {(room.price * stayNights).toFixed(2)}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] text-muted-foreground">Markup:</span>
                      <Input type="number" min="0" max="100" className="h-7 w-16 text-xs text-right" placeholder="0" value={markupValues[room.id] || ""} onChange={e => setMarkupValues(prev => ({ ...prev, [room.id]: parseFloat(e.target.value) || 0 }))} disabled={!isSelected} />
                      <span className="text-xs">%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">After Markup:</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="border rounded px-2 py-1 text-sm font-bold" style={{ color: "#FF6000" }}>{getMarkupPrice(room.id, room.price).toFixed(2)}</div>
                      <span className="text-xs text-muted-foreground">/</span>
                      <div className="border rounded px-2 py-1 text-sm font-bold" style={{ color: "#FF6000" }}>{(getMarkupPrice(room.id, room.price) * stayNights).toFixed(2)}</div>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">Per Night / Total ({stayNights}N)</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Overview (editable-style) */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Overview</h3>
            <Badge variant="outline" className="text-[9px]">Editable</Badge>
          </div>
          <div className="border rounded-lg p-4 min-h-[120px] text-sm text-muted-foreground" contentEditable suppressContentEditableWarning>
            <p><strong>Opening Year:</strong> {2000 + parseInt(hotel.id.replace(/\D/g, "")) % 26}</p>
            <p><strong>Phone:</strong> {hotel.checkInOutTimes.includes("15:00") ? "+82-2-797-1234" : "+86-21-2327-2888"}</p>
            <p><strong>Total Rooms:</strong> {200 + parseInt(hotel.id.replace(/\D/g, "")) * 23 % 400}</p>
            <p className="mt-2">{hotel.description}</p>
          </div>
        </Card>

        {/* Hotel Policies (editable-style) */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Hotel Policies</h3>
            <Badge variant="outline" className="text-[9px]">Editable</Badge>
          </div>
          <div className="border rounded-lg p-4 min-h-[120px] text-sm text-muted-foreground" contentEditable suppressContentEditableWarning>
            <p><strong>Check-in and Check-out</strong></p>
            <p>• Check-in time starts at 14:00</p>
            <p>• Check-out time ends at 12:00</p>
            <p className="mt-2"><strong>Pets:</strong> {hotel.petPolicy}</p>
            <p className="mt-2"><strong>Children:</strong> {hotel.childPolicy}</p>
            <p className="mt-2"><strong>Smoking:</strong> {hotel.smokingPolicy}</p>
          </div>
        </Card>

        {/* Bottom action bar */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => window.close()}>Exit Editing</Button>
          <Button onClick={() => setPreviewOpen(true)} style={{ background: "#DC2626" }}><Eye className="h-4 w-4 mr-1" />Preview</Button>
        </div>
      </div>

      {/* ── Custom Info Dialog ── */}
      <Dialog open={customInfoOpen} onOpenChange={setCustomInfoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Custom Information Configuration</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">One-click to obtain customized voucher information from Client Management settings.</p>
          <div className="space-y-4 mt-2">
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
              <Input value={quoteCompany} onChange={e => setQuoteCompany(e.target.value)} />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium w-28 shrink-0">Phone:</label>
              <Input value={quotePhone} onChange={e => setQuotePhone(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setCustomInfoOpen(false)}>Skip</Button>
            <Button onClick={() => { setCustomInfoOpen(false); toast.success("Info saved!"); }} style={{ background: "#DC2626" }}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Quote Preview Dialog ── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Quote Preview</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewOpen(false)}>Exit</Button>
              <Button size="sm" style={{ background: "#DC2626" }} onClick={() => { window.print(); }}><Download className="h-3 w-3 mr-1" />Download as PDF</Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Check-in: 2026/04/15(Wed) &nbsp; Check-out: ({stayNights} night{stayNights > 1 ? "s" : ""})</p>

          {/* Hotel */}
          <Card className="p-3 mb-3">
            <div className="flex gap-3">
              <div className="w-20 h-14 rounded shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
                <Building2 className="h-6 w-6 text-white/15" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-sm">{hotel.name}</h3>
                    {Array.from({ length: hotel.starRating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                  </div>
                  <span className="text-sm font-bold" style={{ color: "#FF6000" }}>From USD{selectedRoomData.length > 0 ? Math.min(...selectedRoomData.map(r => getMarkupPrice(r.id, r.price))).toFixed(2) : "—"}</span>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{hotel.area}</p>
              </div>
            </div>
          </Card>

          {/* Selected rooms */}
          {selectedRoomData.map(room => (
            <Card key={room.id} className="p-4 mb-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold">{room.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Floor {room.floor} / {room.size}m² / {room.hasWindow ? "Window" : "No Window"} / Max {room.maxGuests}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold" style={{ color: "#FF6000" }}>USD{getMarkupPrice(room.id, room.price).toFixed(2)}<span className="text-xs font-normal">/night</span></p>
                  {stayNights > 1 && <p className="text-xs text-muted-foreground">Total: USD{(getMarkupPrice(room.id, room.price) * stayNights).toFixed(2)}</p>}
                </div>
              </div>
              <Separator className="my-2" />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-muted-foreground text-xs">Meal:</span><p className={room.mealIncluded ? "text-green-600 text-xs" : "text-xs"}>{room.mealDetail}</p></div>
                <div><span className="text-muted-foreground text-xs">Cancellation:</span><p className={`text-xs ${room.cancellationPolicy === "free_cancel" ? "text-green-600" : "text-red-500"}`}>{room.cancellationPolicy === "free_cancel" ? "Free Cancellation" : "Non-Refundable"}</p></div>
                <div><span className="text-muted-foreground text-xs">Bed / Confirm:</span><p className="text-xs">{room.bedCount} · {room.confirmType}</p></div>
              </div>
            </Card>
          ))}

          {/* Footer */}
          <div className="mt-4 pt-3 border-t flex items-center justify-center gap-3 text-xs text-muted-foreground">
            {quoteLogo && <img src={quoteLogo} alt="Logo" className="h-8 object-contain" />}
            <div className="text-center">
              <p className="font-medium text-foreground">{quoteCompany}</p>
              <p>{quotePhone}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
