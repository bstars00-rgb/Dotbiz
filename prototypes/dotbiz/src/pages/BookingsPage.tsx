import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Search, X, Download, ChevronLeft, ChevronRight, Paperclip, Send, RefreshCw, List, LayoutGrid, MapPin, Calendar, Clock, FileText, Printer, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useScreenState } from "@/hooks/useScreenState";
import { StateToolbar } from "@/components/StateToolbar";
import { bookings } from "@/mocks/bookings";
import GroupBookingDialog from "@/components/GroupBookingDialog";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  Confirmed: "default", Cancelled: "destructive", Pending: "secondary", "No-show": "destructive", Completed: "default",
  "Not Paid": "destructive", "Partially Paid": "secondary", "Fully Paid": "default", Refunded: "secondary", "Partially Refunded": "secondary",
};

const exportHistory = [
  { id: 1, fileName: "bookings_2026-04-01.xlsx", date: "2026-04-01 14:30", status: "Completed", records: 42 },
  { id: 2, fileName: "bookings_2026-03-15.xlsx", date: "2026-03-15 09:15", status: "Completed", records: 38 },
  { id: 3, fileName: "bookings_2026-03-01.xlsx", date: "2026-03-01 11:00", status: "Completed", records: 55 },
  { id: 4, fileName: "bookings_2026-02-15.xlsx", date: "2026-02-15 16:45", status: "Expired", records: 29 },
];

export default function BookingsPage() {
  const { state, setState } = useScreenState("success");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedBooking, setSelectedBooking] = useState<typeof bookings[0] | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [exportHistoryOpen, setExportHistoryOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [groupBookingOpen, setGroupBookingOpen] = useState(false);
  const [voucherOpen, setVoucherOpen] = useState(false);

  /* ── Filters ── */
  const [filterDateType, setFilterDateType] = useState(searchParams.get("dateType") || "Booking");
  const [filterBookingStatus, setFilterBookingStatus] = useState(searchParams.get("status") || "All");

  /* URL param quick filters: free_cancel_24h, free_cancel_3d, upcoming_24h, upcoming_3d */
  const quickFilter = searchParams.get("filter") || "";
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("All");
  const [filterPaymentChannel, setFilterPaymentChannel] = useState("All");
  const [filterEllisCode, setFilterEllisCode] = useState("");
  const [filterHotelConfirm, setFilterHotelConfirm] = useState("");
  const [filterHotelName, setFilterHotelName] = useState("");
  const [filterGuestName, setFilterGuestName] = useState("");
  const [filterGroupId, setFilterGroupId] = useState("");

  /* ── Batch selection ── */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const toggleSelect = (id: string) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll = () => { if (selectedIds.size === filtered.length) setSelectedIds(new Set()); else setSelectedIds(new Set(filtered.map(b => b.id))); };

  const resetFilters = () => {
    setFilterDateType("Booking"); setFilterBookingStatus("All"); setFilterPaymentStatus("All"); setFilterPaymentChannel("All");
    setFilterEllisCode(""); setFilterHotelConfirm(""); setFilterHotelName(""); setFilterGuestName(""); setFilterGroupId("");
  };

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    let result = [...bookings];
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in3d = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    /* Quick filters from URL params */
    if (quickFilter === "free_cancel_24h") {
      result = result.filter(b => b.bookingStatus === "Confirmed" && b.freeCancelDeadline && new Date(b.freeCancelDeadline) <= in24h && new Date(b.freeCancelDeadline) >= now);
    } else if (quickFilter === "free_cancel_3d") {
      result = result.filter(b => b.bookingStatus === "Confirmed" && b.freeCancelDeadline && new Date(b.freeCancelDeadline) <= in3d && new Date(b.freeCancelDeadline) >= now);
    } else if (quickFilter === "upcoming_24h") {
      result = result.filter(b => b.bookingStatus === "Confirmed" && new Date(b.checkIn) <= in24h && new Date(b.checkIn) >= now);
    } else if (quickFilter === "upcoming_3d") {
      result = result.filter(b => b.bookingStatus === "Confirmed" && new Date(b.checkIn) <= in3d && new Date(b.checkIn) >= now);
    } else {
      /* Standard filters */
      if (filterBookingStatus !== "All") result = result.filter(b => b.bookingStatus === filterBookingStatus);
      if (filterPaymentStatus !== "All") result = result.filter(b => b.paymentStatus === filterPaymentStatus);
      if (filterPaymentChannel !== "All") result = result.filter(b => b.paymentChannel === filterPaymentChannel);
      if (filterEllisCode) result = result.filter(b => b.ellisCode.toLowerCase().includes(filterEllisCode.toLowerCase()));
      if (filterHotelConfirm) result = result.filter(b => b.hotelConfirmCode.toLowerCase().includes(filterHotelConfirm.toLowerCase()));
      if (filterHotelName) result = result.filter(b => b.hotelName.toLowerCase().includes(filterHotelName.toLowerCase()));
      if (filterGuestName) result = result.filter(b => b.guestName.toLowerCase().includes(filterGuestName.toLowerCase()) || b.traveler.toLowerCase().includes(filterGuestName.toLowerCase()));
      if (filterGroupId) result = result.filter(b => b.groupBookingId.toLowerCase().includes(filterGroupId.toLowerCase()));
    }
    return result;
  }, [quickFilter, filterBookingStatus, filterPaymentStatus, filterPaymentChannel, filterEllisCode, filterHotelConfirm, filterHotelName, filterGuestName, filterGroupId]);

  if (state === "loading") return (<div className="p-6 space-y-4"><Skeleton className="h-10 w-96" /><Skeleton className="h-24 w-full" /><Skeleton className="h-96 w-full" /><StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">No Bookings Yet</h2><p className="text-muted-foreground mt-2">Start searching for hotels to create your first booking.</p><Button className="mt-4" onClick={() => navigate("/app/find-hotel")}><Search className="h-4 w-4 mr-2" />Find Hotel</Button></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>Bookings Error</AlertTitle><AlertDescription>Failed to load bookings. Please try again.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Bookings</h1>
          {quickFilter && (
            <Badge style={{ background: quickFilter.startsWith("free") ? "#009505" : "#FF6000" }} className="text-xs text-white">
              {quickFilter === "free_cancel_24h" && "Free Cancel — Within 24h"}
              {quickFilter === "free_cancel_3d" && "Free Cancel — Within 3 days"}
              {quickFilter === "upcoming_24h" && "Upcoming — Within 24h"}
              {quickFilter === "upcoming_3d" && "Upcoming — Within 3 days"}
              <button className="ml-2 hover:opacity-70" onClick={() => navigate("/app/bookings")}>✕</button>
            </Badge>
          )}
        </div>
        <Button style={{ background: "#FF6000" }} onClick={() => setGroupBookingOpen(true)}><Users2 className="h-4 w-4 mr-1" />Group Booking</Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Booking List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="chat">Support Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-4">
          {/* ── Filters ── */}
          <Card className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-sm font-medium">Date Type</label>
                <select value={filterDateType} onChange={e => setFilterDateType(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm bg-background mt-1">
                  {["Booking", "Check In", "Check Out", "Free Cancel Deadline", "Cancel Date"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Booking Status</label>
                <select value={filterBookingStatus} onChange={e => setFilterBookingStatus(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm bg-background mt-1">
                  {["All", "Confirmed", "Cancelled", "Pending", "No-show", "Completed"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Payment Status</label>
                <select value={filterPaymentStatus} onChange={e => setFilterPaymentStatus(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm bg-background mt-1">
                  {["All", "Not Paid", "Partially Paid", "Fully Paid", "Refunded", "Partially Refunded", "Pending"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Payment Channel</label>
                <select value={filterPaymentChannel} onChange={e => setFilterPaymentChannel(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm bg-background mt-1">
                  {["All", "Credit Card", "Bank Transfer", "Credit Balance", "Floating Deposit"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">ELLIS Code</label>
                <Input placeholder="ELS-2026-..." value={filterEllisCode} onChange={e => setFilterEllisCode(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Hotel Confirm Code</label>
                <Input placeholder="HC-..." value={filterHotelConfirm} onChange={e => setFilterHotelConfirm(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Hotel Name</label>
                <Input placeholder="Hotel name..." value={filterHotelName} onChange={e => setFilterHotelName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Guest / Traveler</label>
                <Input placeholder="Name..." value={filterGuestName} onChange={e => setFilterGuestName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Group Booking ID</label>
                <Input placeholder="GRP-..." value={filterGroupId} onChange={e => setFilterGroupId(e.target.value)} className="mt-1" />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={() => toast.success("Search applied")}><Search className="h-4 w-4 mr-1" />Search</Button>
                <Button variant="outline" onClick={resetFilters}><X className="h-4 w-4 mr-1" />Reset</Button>
              </div>
            </div>
          </Card>

          {/* ── Batch Action Bar ── */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <span className="text-sm font-medium">{selectedIds.size} booking{selectedIds.size > 1 ? "s" : ""} selected</span>
              <Separator orientation="vertical" className="h-5" />
              <Button size="sm" variant="outline" onClick={() => toast.success("Batch cancelled", { description: `${selectedIds.size} bookings cancelled.` })}><X className="h-3 w-3 mr-1" />Batch Cancel</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Vouchers downloading...")}><Download className="h-3 w-3 mr-1" />Batch Voucher</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Exporting...")}><Download className="h-3 w-3 mr-1" />Batch Export</Button>
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSelectedIds(new Set())}>Clear Selection</Button>
            </div>
          )}

          {/* ── Toolbar ── */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.success("Exporting to Excel...")}><Download className="h-3 w-3 mr-1" />Excel Export</Button>
              <Button variant="outline" size="sm" onClick={() => toast.success("Generating vouchers...")}><Download className="h-3 w-3 mr-1" />Bulk Voucher</Button>
              <Button variant="outline" size="sm" onClick={() => setExportHistoryOpen(true)}><FileText className="h-3 w-3 mr-1" />Export History</Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{filtered.length} results</span>
              <div className="flex border rounded-md overflow-hidden">
                <button onClick={() => setViewMode("list")} className={`p-1.5 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}><List className="h-4 w-4" /></button>
                <button onClick={() => setViewMode("card")} className={`p-1.5 ${viewMode === "card" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}><LayoutGrid className="h-4 w-4" /></button>
              </div>
              <select className="text-sm border rounded px-2 py-1 bg-background" defaultValue="20">
                <option>20</option><option>50</option><option>100</option>
              </select>
            </div>
          </div>

          {/* ── List View ── */}
          {viewMode === "list" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={selectAll} /></TableHead>
                    <TableHead>Booking Date</TableHead>
                    <TableHead>ELLIS Code</TableHead>
                    <TableHead>Hotel Confirm</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Traveler</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Group</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(b => (
                    <TableRow key={b.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedBooking(b)}>
                      <TableCell><Checkbox checked={selectedIds.has(b.id)} onCheckedChange={() => toggleSelect(b.id)} onClick={e => e.stopPropagation()} /></TableCell>
                      <TableCell className="text-xs">{b.bookingDate}</TableCell>
                      <TableCell className="font-mono text-xs">{b.ellisCode}</TableCell>
                      <TableCell className="font-mono text-xs">{b.hotelConfirmCode || "—"}</TableCell>
                      <TableCell><Badge variant={statusColors[b.bookingStatus] as "default" | "destructive" | "secondary"} className="text-[10px]">{b.bookingStatus}</Badge></TableCell>
                      <TableCell><Badge variant={statusColors[b.paymentStatus] as "default" | "destructive" | "secondary"} className="text-[10px]">{b.paymentStatus}</Badge></TableCell>
                      <TableCell className="text-xs">{b.paymentChannel}</TableCell>
                      <TableCell className="truncate max-w-[130px] text-xs">{b.hotelName}</TableCell>
                      <TableCell className="text-xs">{b.checkIn} ({b.nights}N)</TableCell>
                      <TableCell className="text-xs">{b.roomType} x{b.roomCount}</TableCell>
                      <TableCell className="truncate max-w-[90px] text-xs">{b.traveler}</TableCell>
                      <TableCell className="text-xs font-medium">${b.sumAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-xs">{b.groupBookingId ? <Badge variant="outline" className="text-[10px]">{b.groupBookingId}</Badge> : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* ── Card View ── */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(b => (
                <Card key={b.id} className="p-4 cursor-pointer card-hover" onClick={() => setSelectedBooking(b)}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-sm">{b.hotelName}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{b.hotelAddress.split(",").slice(-1)[0].trim()}</p>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant={statusColors[b.bookingStatus] as "default" | "destructive" | "secondary"} className="text-[10px]">{b.bookingStatus}</Badge>
                      <Badge variant={statusColors[b.paymentStatus] as "default" | "destructive" | "secondary"} className="text-[10px]">{b.paymentStatus}</Badge>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-muted-foreground" /><span>{b.checkIn} ({b.nights}N)</span></div>
                    <div className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-muted-foreground" /><span>Cancel by {b.freeCancelDeadline}</span></div>
                    <div><span className="text-muted-foreground">Room:</span> {b.roomType} x{b.roomCount}</div>
                    <div><span className="text-muted-foreground">Guest:</span> {b.traveler}</div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t">
                    <div className="text-xs">
                      <span className="font-mono text-muted-foreground">{b.ellisCode}</span>
                      {b.groupBookingId && <Badge variant="outline" className="text-[9px] ml-2">{b.groupBookingId}</Badge>}
                    </div>
                    <span className="text-sm font-bold" style={{ color: "#FF6000" }}>${b.sumAmount.toLocaleString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm"><ChevronLeft className="h-4 w-4" />Prev</Button>
            <Button variant="outline" size="sm">Today</Button>
            <Button variant="outline" size="sm">Next<ChevronRight className="h-4 w-4" /></Button>
            <h2 className="text-lg font-semibold">March 2026</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[{ l: "Confirmed", v: bookings.filter(b => b.bookingStatus === "Confirmed").length }, { l: "Cancelled", v: bookings.filter(b => b.bookingStatus === "Cancelled").length }, { l: "Room Nights", v: bookings.reduce((s, b) => s + b.nights, 0) }, { l: "Net Cost", v: "$" + bookings.reduce((s, b) => s + b.sumAmount, 0).toLocaleString() }, { l: "Unpaid", v: "$" + bookings.filter(b => b.paymentStatus !== "Fully Paid").reduce((s, b) => s + b.sumAmount, 0).toLocaleString() }].map(s => (
              <Card key={s.l} className="p-3 text-center"><p className="text-sm">{s.l}</p><h3 className="text-xl font-bold">{s.v}</h3></Card>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className="font-semibold py-2">{d}</div>)}
            {Array.from({ length: 31 }, (_, i) => (
              <div key={i} className="border rounded p-1 min-h-[60px] text-left"><span className="text-xs">{i + 1}</span></div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="mt-4">
          <div className="flex h-[600px] border rounded-lg overflow-hidden">
            <div className="w-64 border-r overflow-auto">
              {["ELS-2026-00142 Support", "ELS-2026-00155 Query", "General Inquiry"].map((title, i) => (
                <div key={i} className="p-3 border-b cursor-pointer hover:bg-muted">
                  <p className="font-medium text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground truncate">Last message preview...</p>
                </div>
              ))}
            </div>
            <div className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  <div className="bg-muted rounded-lg p-3 max-w-xs"><p className="text-sm">Hello, I need help with my booking.</p></div>
                  <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-xs ml-auto"><p className="text-sm">Sure! How can I help?</p></div>
                </div>
              </ScrollArea>
              <div className="flex items-center gap-2 p-3 border-t">
                <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
                <Input placeholder="Type a message..." className="flex-1" />
                <Button size="icon"><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Booking Detail Modal ── */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedBooking?.ellisCode}</DialogTitle></DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              {[
                { title: "Booking Summary", items: [["Status", <Badge key="s" variant={statusColors[selectedBooking.bookingStatus] as "default"}>{selectedBooking.bookingStatus}</Badge>], ["Date", selectedBooking.bookingDate], ["ELLIS Code", selectedBooking.ellisCode], ["Hotel Confirm", selectedBooking.hotelConfirmCode || "—"], ["Group", selectedBooking.groupBookingId || "—"]] },
                { title: "Hotel Information", items: [["Hotel", selectedBooking.hotelName], ["Address", selectedBooking.hotelAddress], ["Contact", selectedBooking.hotelContact], ["Check-in", `${selectedBooking.checkIn} (${selectedBooking.nights}N)`], ["Room", `${selectedBooking.roomType} x${selectedBooking.roomCount}`], ["Free Cancel By", selectedBooking.freeCancelDeadline]] },
                { title: "Guest Information", items: [["Name", selectedBooking.guestName], ["Email", selectedBooking.guestEmail], ["Mobile", selectedBooking.guestMobile]] },
                { title: "Payment Information", items: [["Amount", `$${selectedBooking.sumAmount.toLocaleString()}`], ["Status", <Badge key="ps" variant={statusColors[selectedBooking.paymentStatus] as "default"}>{selectedBooking.paymentStatus}</Badge>], ["Channel", selectedBooking.paymentChannel], ["Method", selectedBooking.paymentMethod]] },
              ].map(section => (
                <Card key={section.title} className="p-4">
                  <h3 className="font-semibold mb-2">{section.title}</h3>
                  {section.items.map(([label, value]) => (
                    <div key={String(label)} className="flex justify-between py-1"><span className="text-sm text-muted-foreground">{label}</span><span className="text-sm">{value}</span></div>
                  ))}
                </Card>
              ))}
              {selectedBooking.specialRequests && <Card className="p-4"><h3 className="font-semibold mb-2">Special Requests</h3><p className="text-sm">{selectedBooking.specialRequests}</p></Card>}

              {/* Policy Notice */}
              <Card className="p-3 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">Booking Modification Policy</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Bookings cannot be modified. To change dates or guest details, please cancel and rebook.</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">For special requests, please <button className="underline font-medium" onClick={() => { setSelectedBooking(null); navigate("/app/tickets"); }}>submit a ticket</button>.</p>
              </Card>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => { setVoucherOpen(true); }}><Printer className="h-3 w-3 mr-1" />Print Voucher</Button>
                <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" />Receipt</Button>
                <Button variant="outline" size="sm" onClick={() => { setSelectedBooking(null); navigate("/app/tickets"); }}><FileText className="h-3 w-3 mr-1" />Request Change</Button>
                {/* Cancel: only if free_cancel and not non-refundable */}
                {selectedBooking.bookingStatus !== "Cancelled" && selectedBooking.bookingStatus !== "Completed" && (
                  selectedBooking.cancelDeadline && new Date(selectedBooking.cancelDeadline) > new Date() ? (
                    <Button variant="destructive" size="sm" onClick={() => setCancelOpen(true)}><X className="h-3 w-3 mr-1" />Cancel Booking</Button>
                  ) : (
                    <Badge variant="secondary" className="text-xs py-1.5 px-3">
                      {selectedBooking.freeCancelDeadline ? "Deadline passed — cancellation not available" : "Non-refundable — cancellation not available"}
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Export History Dialog ── */}
      <Dialog open={exportHistoryOpen} onOpenChange={setExportHistoryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Export History</DialogTitle></DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exportHistory.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs font-mono">{e.fileName}</TableCell>
                  <TableCell className="text-xs">{e.date}</TableCell>
                  <TableCell className="text-xs">{e.records}</TableCell>
                  <TableCell><Badge variant={e.status === "Completed" ? "default" : "secondary"} className="text-[10px]">{e.status}</Badge></TableCell>
                  <TableCell>{e.status === "Completed" && <Button size="sm" variant="ghost" className="h-6 text-xs"><Download className="h-3 w-3 mr-1" />Download</Button>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      {/* ── Cancel Dialog ── */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to cancel this booking? Cancellation fees may apply.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <label className="text-sm font-medium">Cancellation Reason</label>
            <select className="w-full border rounded px-2 py-1.5 text-sm bg-background mt-1">
              {["Change of plans", "Found better option", "Guest cancelled", "Date change needed", "Other"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => {
              toast.success("Booking Cancelled", { description: "The booking has been cancelled and a notification has been created." });
              setSelectedBooking(null);
            }}>Confirm Cancellation</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── (Amend Booking removed — bookings cannot be modified) ── */}

      {/* ── Print Voucher Dialog ── */}
      <Dialog open={voucherOpen} onOpenChange={setVoucherOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Booking Voucher</DialogTitle></DialogHeader>
          {selectedBooking && (
            <div id="printable-voucher" className="space-y-4 p-4">
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold" style={{ color: "#FF6000" }}>DOTBIZ</h2>
                <p className="text-sm text-muted-foreground">Hotel Booking Voucher</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Booking Reference</p>
                <p className="text-xl font-mono font-bold">{selectedBooking.ellisCode}</p>
              </div>
              <Card className="p-3">
                <h4 className="text-sm font-bold mb-2" style={{ color: "#FF6000" }}>Hotel Information</h4>
                <p className="font-medium">{selectedBooking.hotelName}</p>
                <p className="text-xs text-muted-foreground">{selectedBooking.hotelAddress}</p>
              </Card>
              <Card className="p-3">
                <h4 className="text-sm font-bold mb-2" style={{ color: "#FF6000" }}>Stay Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Check-In:</span> {selectedBooking.checkIn}</div>
                  <div><span className="text-muted-foreground">Check-Out:</span> {selectedBooking.checkOut}</div>
                  <div><span className="text-muted-foreground">Nights:</span> {selectedBooking.nights}</div>
                  <div><span className="text-muted-foreground">Room:</span> {selectedBooking.roomType} x{selectedBooking.roomCount}</div>
                </div>
              </Card>
              <Card className="p-3">
                <h4 className="text-sm font-bold mb-2" style={{ color: "#FF6000" }}>Guest</h4>
                <p className="text-sm">{selectedBooking.guestName} ({selectedBooking.guestEmail})</p>
              </Card>
              <Card className="p-3">
                <h4 className="text-sm font-bold mb-2" style={{ color: "#FF6000" }}>Payment</h4>
                <p className="text-lg font-bold">Total: USD {selectedBooking.sumAmount.toLocaleString()}</p>
                <Badge variant={statusColors[selectedBooking.paymentStatus] as "default"}>{selectedBooking.paymentStatus}</Badge>
              </Card>
              {/* Barcode placeholder */}
              <div className="flex justify-center py-2">
                <div className="flex gap-[2px]">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="bg-foreground" style={{ width: i % 3 === 0 ? 2 : 1, height: 40 }} />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-center text-muted-foreground">This voucher was generated by DOTBIZ Platform. Present this voucher at check-in.</p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setVoucherOpen(false)}>Close</Button>
            <Button style={{ background: "#FF6000" }} onClick={() => { window.print(); }}><Printer className="h-4 w-4 mr-1" />Print / Save PDF</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Group Booking Dialog ── */}
      <GroupBookingDialog open={groupBookingOpen} onOpenChange={setGroupBookingOpen} />

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
