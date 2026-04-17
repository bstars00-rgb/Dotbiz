import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Search, X, Download, ChevronLeft, ChevronRight, RefreshCw, MapPin, Calendar, Clock, FileText, Printer, Ticket } from "lucide-react";
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
// ScrollArea removed (chat tab deleted)
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useScreenState } from "@/hooks/useScreenState";
import { StateToolbar } from "@/components/StateToolbar";
import { bookings } from "@/mocks/bookings";
// DateRangePicker replaced with native date inputs for compact DIDA-style filter
// GroupBookingDialog removed — feature intent unclear
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
  const [localBookings, setLocalBookings] = useState([...bookings]);
  const [selectedBooking, setSelectedBooking] = useState<typeof bookings[0] | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [exportHistoryOpen, setExportHistoryOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDateFrom, setFilterDateFrom] = useState("2026-04-17");
  const [filterDateTo, setFilterDateTo] = useState("2026-04-17");

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
    let result = [...localBookings];
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
  }, [localBookings, quickFilter, filterBookingStatus, filterPaymentStatus, filterPaymentChannel, filterEllisCode, filterHotelConfirm, filterHotelName, filterGuestName, filterGroupId]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [filtered.length, rowsPerPage]);

  if (state === "loading") return (<div className="p-6 space-y-4"><Skeleton className="h-10 w-96" /><Skeleton className="h-24 w-full" /><Skeleton className="h-96 w-full" /><StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">No Bookings Yet</h2><p className="text-muted-foreground mt-2">Start searching for hotels to create your first booking.</p><Button className="mt-4" onClick={() => navigate("/app/find-hotel")}><Search className="h-4 w-4 mr-2" />Find Hotel</Button></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>Bookings Error</AlertTitle><AlertDescription>Failed to load bookings. Please try again.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  return (
    <div className="p-6 space-y-4">
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

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Booking List</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-4">
          {/* ── Filters (DIDA style) ── */}
          <Card className="p-4 overflow-visible">
            {/* Row 1: Date + ELLIS Code + Status + Search/Reset */}
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <div className="flex items-center gap-2">
                <select value={filterDateType} onChange={e => setFilterDateType(e.target.value)} className="border rounded px-2 py-1.5 text-xs bg-background h-8" aria-label="Date type">
                  {["Booking Date", "Check In", "Check Out", "Free Cancel DL", "Cancel Date"].map(o => <option key={o}>{o}</option>)}
                </select>
                <Input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="text-xs h-8 w-36" />
                <span className="text-xs text-muted-foreground">→</span>
                <Input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="text-xs h-8 w-36" />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-muted-foreground">ELLIS BKG Code</label>
                <Input placeholder="" value={filterEllisCode} onChange={e => setFilterEllisCode(e.target.value)} className="text-xs h-8 w-40" />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-muted-foreground">BKG Status</label>
                <select value={filterBookingStatus} onChange={e => setFilterBookingStatus(e.target.value)} className="border rounded px-2 py-1.5 text-xs bg-background h-8" aria-label="Booking status">
                  {["All", "Confirmed", "Cancelled", "Pending", "No-show", "Completed"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button size="sm" className="h-8" onClick={() => toast.success("Search applied")} style={{ background: "#FF6000" }}><Search className="h-3.5 w-3.5 mr-1" />Search</Button>
                <Button size="sm" variant="outline" className="h-8" onClick={resetFilters}>Reset</Button>
              </div>
            </div>
            {/* Row 2: Payment + Booker + Hotel Name */}
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-muted-foreground">Payment Status</label>
                <select value={filterPaymentStatus} onChange={e => setFilterPaymentStatus(e.target.value)} className="border rounded px-2 py-1.5 text-xs bg-background h-8" aria-label="Payment status">
                  {["All", "Not Paid", "Partially Paid", "Fully Paid", "Refunded", "Partially Refunded", "Pending"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-muted-foreground">Booker</label>
                <Input placeholder="Name" value={filterGuestName} onChange={e => setFilterGuestName(e.target.value)} className="text-xs h-8 w-36" />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-muted-foreground">Hotel Name</label>
                <Input placeholder="" value={filterHotelName} onChange={e => setFilterHotelName(e.target.value)} className="text-xs h-8 w-44" />
              </div>
            </div>
            {/* Row 3: Seller Code */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-muted-foreground">Seller BKG Code</label>
                <Input placeholder="" value={filterHotelConfirm} onChange={e => setFilterHotelConfirm(e.target.value)} className="text-xs h-8 w-40" />
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

          {/* ── Toolbar + Pagination ── */}
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "#FF6000" }}>{filtered.length}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.success("Exporting to Excel...")}><Download className="h-3 w-3 mr-1" />Excel</Button>
              <select className="text-xs border rounded px-2 py-1 bg-background" value={rowsPerPage} onChange={e => setRowsPerPage(Number(e.target.value))} aria-label="Rows per page">
                {[20, 40, 60, 80, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* ── List View ── */}
          {viewMode === "list" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-[11px]">
                    <TableHead className="w-8"><Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={selectAll} /></TableHead>
                    <TableHead className="whitespace-nowrap">Booking Date</TableHead>
                    <TableHead className="whitespace-nowrap">ELLIS Booking Code</TableHead>
                    <TableHead className="whitespace-nowrap">Seller Booking Code</TableHead>
                    <TableHead className="whitespace-nowrap">Booking Status</TableHead>
                    <TableHead className="whitespace-nowrap">Payment Status</TableHead>
                    <TableHead className="whitespace-nowrap">Hotel Name</TableHead>
                    <TableHead className="whitespace-nowrap">Client Cancel DL</TableHead>
                    <TableHead className="whitespace-nowrap">Check-in Date / Nts</TableHead>
                    <TableHead className="whitespace-nowrap">Room Type / Count</TableHead>
                    <TableHead className="whitespace-nowrap">1st Traveler Name</TableHead>
                    <TableHead className="whitespace-nowrap">B.Currency</TableHead>
                    <TableHead className="whitespace-nowrap text-right">B.Sum Amt</TableHead>
                    <TableHead className="whitespace-nowrap">BKG Cancel Date</TableHead>
                    <TableHead className="whitespace-nowrap">Invoice No.</TableHead>
                    <TableHead className="whitespace-nowrap">Dispute</TableHead>
                    <TableHead className="whitespace-nowrap text-center">Ticket</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map(b => (
                    <TableRow key={b.id} className="cursor-pointer hover:bg-muted/50 text-xs" onClick={() => setSelectedBooking(b)}>
                      <TableCell><Checkbox checked={selectedIds.has(b.id)} onCheckedChange={() => toggleSelect(b.id)} onClick={e => e.stopPropagation()} /></TableCell>
                      <TableCell className="whitespace-nowrap">{b.bookingDate}</TableCell>
                      <TableCell className="font-mono text-[#0066cc] hover:underline whitespace-nowrap">{b.ellisCode}</TableCell>
                      <TableCell className="whitespace-nowrap">{b.hotelConfirmCode || ""}</TableCell>
                      <TableCell><Badge variant={statusColors[b.bookingStatus] as "default" | "destructive" | "secondary"} className="text-[10px]">{b.bookingStatus}</Badge></TableCell>
                      <TableCell><Badge variant={statusColors[b.paymentStatus] as "default" | "destructive" | "secondary"} className="text-[10px]">{b.paymentStatus}</Badge></TableCell>
                      <TableCell className="truncate max-w-[150px]">{b.hotelName}</TableCell>
                      <TableCell className="whitespace-nowrap">{b.cancelDeadline}</TableCell>
                      <TableCell className="whitespace-nowrap">{b.checkIn}[{b.nights}]</TableCell>
                      <TableCell className="whitespace-nowrap">{b.roomType} x{b.roomCount}</TableCell>
                      <TableCell className="truncate max-w-[100px]">{b.traveler}</TableCell>
                      <TableCell className="whitespace-nowrap">{b.currency}</TableCell>
                      <TableCell className="text-right font-medium whitespace-nowrap">{b.sumAmount.toLocaleString()}</TableCell>
                      <TableCell className="whitespace-nowrap">{b.cancelDate || ""}</TableCell>
                      <TableCell className="whitespace-nowrap">{b.invoiceNo || ""}</TableCell>
                      <TableCell className="truncate max-w-[80px] text-red-500">{b.dispute || ""}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-[#FF6000] hover:bg-[#FF6000]/10" onClick={(e) => { e.stopPropagation(); navigate(`/app/tickets?booking=${b.ellisCode}`); }} title="Create ticket for this booking">
                          <Ticket className="h-3 w-3 mr-1" />Ticket
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* ── Card View ── */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paginated.map(b => (
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

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                {(currentPage - 1) * rowsPerPage + 1} – {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
                  <ChevronLeft className="h-3 w-3" /><ChevronLeft className="h-3 w-3 -ml-2" />
                </Button>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) page = i + 1;
                  else if (currentPage <= 3) page = i + 1;
                  else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                  else page = currentPage - 2 + i;
                  return (
                    <Button key={page} variant={page === currentPage ? "default" : "outline"} size="sm" className="h-7 w-7 p-0 text-xs" onClick={() => setCurrentPage(page)}>
                      {page}
                    </Button>
                  );
                })}
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
                  <ChevronRight className="h-3 w-3" /><ChevronRight className="h-3 w-3 -ml-2" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

      </Tabs>

      {/* ── Booking Detail Modal (DIDA style) ── */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0" style={{ maxWidth: "1200px", width: "90vw" }}>
          {/* Dark header */}
          <div className="px-5 py-3" style={{ background: "linear-gradient(90deg, #1a1a2e, #16213e)" }}>
            <DialogHeader><DialogTitle className="text-white text-sm font-mono">{selectedBooking?.ellisCode}</DialogTitle></DialogHeader>
          </div>
          {selectedBooking && (
            <div className="p-5 space-y-4">
              {/* OMH Reservation number */}
              <p className="text-sm font-semibold border-b pb-2">OMH Reservation number : <span className="font-mono">{selectedBooking.ellisCode}</span></p>

              {/* Booker */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm">Booker</h3>
                </div>
                <Table>
                  <TableBody>
                    <TableRow><TableCell className="text-sm font-medium w-36">Name</TableCell><TableCell className="text-sm">{selectedBooking.guestName}</TableCell></TableRow>
                    <TableRow><TableCell className="text-sm font-medium">Email</TableCell><TableCell className="text-sm text-primary">{selectedBooking.guestEmail}</TableCell></TableRow>
                    <TableRow><TableCell className="text-sm font-medium">Tel</TableCell><TableCell className="text-sm">{selectedBooking.guestMobile}</TableCell></TableRow>
                    <TableRow><TableCell className="text-sm font-medium">Seller Booking Code</TableCell><TableCell className="text-sm">{selectedBooking.hotelConfirmCode || ""}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </Card>

              {/* Reservation Details */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm">Reservation Details</h3>
                  <div className="flex gap-2">
                    {selectedBooking.bookingStatus !== "Cancelled" && selectedBooking.bookingStatus !== "Completed" && (
                      <Button variant="outline" size="sm" className="h-7 text-xs border-red-300 text-red-500 hover:bg-red-50" onClick={() => {
                        if (new Date(selectedBooking.cancelDeadline) > new Date()) {
                          setCancelOpen(true);
                        } else {
                          toast.error("Cancellation deadline has passed.", { description: `Deadline was ${selectedBooking.cancelDeadline}. Full charge will be applied.` });
                        }
                      }}>Cancel</Button>
                    )}
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setVoucherOpen(true)}>Voucher</Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.success("Invoice downloading...")}><Download className="h-3 w-3 mr-1" />Invoice</Button>
                  </div>
                </div>
                <Table>
                  <TableBody>
                    <TableRow><TableCell className="text-sm font-medium w-48">Booking Status / Payment Status</TableCell><TableCell className="text-sm font-bold">{selectedBooking.bookingStatus} / {selectedBooking.paymentStatus}</TableCell></TableRow>
                    <TableRow><TableCell className="text-sm font-medium">Check in / Out Date</TableCell><TableCell className="text-sm">{selectedBooking.checkIn} ~ {(() => { const d = new Date(selectedBooking.checkIn); d.setDate(d.getDate() + selectedBooking.nights); return d.toISOString().split("T")[0]; })()} [{selectedBooking.nights}NTS]</TableCell></TableRow>
                    <TableRow><TableCell className="text-sm font-medium">Region name</TableCell><TableCell className="text-sm">{selectedBooking.hotelAddress.split(",").pop()?.trim()}</TableCell></TableRow>
                    <TableRow><TableCell className="text-sm font-medium">Hotel Name</TableCell><TableCell className="text-sm">{selectedBooking.hotelName}</TableCell></TableRow>
                    <TableRow><TableCell className="text-sm font-medium">Rooms / Travelers</TableCell><TableCell className="text-sm text-primary">{selectedBooking.roomCount} Rooms / 2 Travelers</TableCell></TableRow>
                    <TableRow><TableCell className="text-sm font-medium">Room Type</TableCell><TableCell className="text-sm">{selectedBooking.roomType}</TableCell></TableRow>
                    <TableRow><TableCell className="text-sm font-medium">Meal Type</TableCell><TableCell className="text-sm">None</TableCell></TableRow>
                    <TableRow><TableCell className="text-sm font-medium">Cancellation D/L</TableCell><TableCell className={`text-sm font-medium ${new Date(selectedBooking.cancelDeadline) > new Date() ? "text-[#FF6000]" : "text-red-500"}`}>{selectedBooking.cancelDeadline}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </Card>

              {/* Travelers */}
              <Card className="p-4">
                <h3 className="font-bold text-sm mb-3">Travelers</h3>
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs">
                      <TableHead>Rooms</TableHead><TableHead>Gender</TableHead><TableHead>Name(Local Language)</TableHead><TableHead>Last Name / First Name (EN)</TableHead><TableHead>Child Birthday</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-xs">Rooms 1</TableCell><TableCell className="text-xs">M</TableCell><TableCell className="text-xs">—</TableCell><TableCell className="text-xs font-medium">{selectedBooking.traveler.split(" ").map(n => n.toUpperCase()).join(" / ")}</TableCell><TableCell className="text-xs">—</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>

              {/* Special Request */}
              <Card className="p-4">
                <h3 className="font-bold text-sm mb-3">Special Request</h3>
                <p className="text-sm text-muted-foreground">{selectedBooking.specialRequests || "No special requests"}</p>
              </Card>

              {/* Billing & Payment */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm">Billing & Payment</h3>
                  <Badge variant="outline" className="text-xs">{selectedBooking.paymentChannel}</Badge>
                </div>
                <Table>
                  <TableBody>
                    <TableRow><TableCell className="text-sm font-medium w-48">Billing total</TableCell><TableCell className="text-sm text-right font-medium">{selectedBooking.currency} {selectedBooking.sumAmount.toLocaleString()}</TableCell></TableRow>
                    <TableRow><TableCell className="text-sm font-medium">Balance</TableCell><TableCell className="text-sm text-right font-medium">{selectedBooking.currency} {selectedBooking.paymentStatus === "Fully Paid" ? "0" : selectedBooking.sumAmount.toLocaleString()}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </Card>

              {/* Cancellation Policy (DIDA table style) */}
              <Card className="p-4">
                <h3 className="font-bold text-sm mb-3">Cancellation Policy</h3>
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs">
                      <TableHead>Your Local Time</TableHead>
                      <TableHead>Property's local time</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead>Fee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-xs text-green-600">Before {selectedBooking.cancelDeadline}</TableCell>
                      <TableCell className="text-xs text-green-600">Before {selectedBooking.cancelDeadline}</TableCell>
                      <TableCell className="text-xs text-primary">{Math.max(0, Math.ceil((new Date(selectedBooking.cancelDeadline).getTime() - Date.now()) / 86400000))} days</TableCell>
                      <TableCell className="text-xs text-green-600 font-medium">Refundable</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-xs">From {selectedBooking.cancelDeadline}</TableCell>
                      <TableCell className="text-xs">From {selectedBooking.cancelDeadline}</TableCell>
                      <TableCell className="text-xs">{Math.max(0, Math.ceil((new Date(selectedBooking.cancelDeadline).getTime() - Date.now()) / 86400000))} days</TableCell>
                      <TableCell className="text-xs text-red-500 font-medium">Non-Refundable</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>

              {/* Bottom Actions (DIDA style) */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">Friendly reminder: If your itinerary changes and you need to apply for partial cancellation, please consult our customer service team by <button className="text-primary underline" onClick={() => { setSelectedBooking(null); navigate(`/app/tickets?booking=${selectedBooking.ellisCode}`); }}>submitting a ticket</button>.</p>
                <div className="flex gap-2 shrink-0 ml-4">
                  {selectedBooking.bookingStatus !== "Cancelled" && selectedBooking.bookingStatus !== "Completed" && (
                    <Button variant="outline" size="sm" className="border-red-300 text-red-500 hover:bg-red-50" onClick={() => {
                      if (new Date(selectedBooking.cancelDeadline) > new Date()) setCancelOpen(true);
                      else toast.error("Cancellation deadline has passed.", { description: "Full charge will be applied." });
                    }}>Cancel</Button>
                  )}
                  <Button size="sm" style={{ background: "#FF6000" }} onClick={() => { setSelectedBooking(null); navigate(`/app/tickets?booking=${selectedBooking.ellisCode}`); }}>Submit Ticket</Button>
                </div>
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
              if (selectedBooking) {
                const today = new Date().toISOString().split("T")[0];
                setLocalBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, bookingStatus: "Cancelled" as const, cancelDate: today, paymentStatus: b.paymentStatus === "Fully Paid" ? "Refunded" as const : b.paymentStatus } : b));
              }
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
      {/* GroupBookingDialog removed */}

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
