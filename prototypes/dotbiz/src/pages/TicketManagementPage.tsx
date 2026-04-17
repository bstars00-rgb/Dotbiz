import { useState, useMemo } from "react";
import { Search, Plus, Clock, CheckCircle2, AlertTriangle, XCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { tickets } from "@/mocks/tickets";
import type { Ticket } from "@/mocks/tickets";
import { useI18n } from "@/contexts/I18nContext";

const statusColors: Record<string, string> = { Pending: "secondary", Processing: "default", Completed: "default", Rejected: "destructive" };
const statusIcons: Record<string, typeof Clock> = { Pending: Clock, Processing: AlertTriangle, Completed: CheckCircle2, Rejected: XCircle };
const priorityColors: Record<string, string> = { High: "destructive", Medium: "secondary", Low: "outline" };
const typeColors: Record<string, string> = { "Cancellation Request": "#DC2626", "Date Change": "#FF8C00", "Room Change": "#0369A1", "Special Request": "#009505", "Complaint": "#7C3AED", "Refund Request": "#DC2626" };

export default function TicketManagementPage() {
  const [statusTab, setStatusTab] = useState("All");
  const { t } = useI18n();
  const [typeFilter, setTypeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const filtered = useMemo(() => {
    let result = [...tickets];
    if (statusTab !== "All") result = result.filter(t => t.status === statusTab);
    if (typeFilter !== "All") result = result.filter(t => t.ticketType === typeFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.id.toLowerCase().includes(q) || t.bookingId.toLowerCase().includes(q) || t.hotelName.toLowerCase().includes(q) || t.guestName.toLowerCase().includes(q));
    }
    return result;
  }, [statusTab, typeFilter, searchQuery]);

  const counts = {
    All: tickets.length,
    Pending: tickets.filter(t => t.status === "Pending").length,
    Processing: tickets.filter(t => t.status === "Processing").length,
    Completed: tickets.filter(t => t.status === "Completed").length,
    Rejected: tickets.filter(t => t.status === "Rejected").length,
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("page.tickets")}</h1>
        <Button><Plus className="h-4 w-4 mr-1" />New Ticket</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Pending", count: counts.Pending, icon: Clock, color: "#FF8C00" },
          { label: "Processing", count: counts.Processing, icon: AlertTriangle, color: "#0369A1" },
          { label: "Completed", count: counts.Completed, icon: CheckCircle2, color: "#009505" },
          { label: "Rejected", count: counts.Rejected, icon: XCircle, color: "#DC2626" },
        ].map(s => (
          <Card key={s.label} className="p-3 card-hover cursor-pointer" onClick={() => setStatusTab(s.label)}>
            <div className="flex items-center gap-2">
              <s.icon className="h-4 w-4" style={{ color: s.color }} />
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
            <p className="text-2xl font-bold mt-1">{s.count}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select aria-label="Ticket type filter" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border rounded-md px-3 py-1.5 text-sm bg-card">
          <option value="All">All Types</option>
          {["Cancellation Request", "Date Change", "Room Change", "Special Request", "Complaint", "Refund Request"].map(t => <option key={t}>{t}</option>)}
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by ticket ID, booking ID, hotel, guest..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* Status Tabs + Table */}
      <Tabs value={statusTab} onValueChange={setStatusTab}>
        <TabsList>
          {Object.entries(counts).map(([status, count]) => (
            <TabsTrigger key={status} value={status} className="gap-1.5">
              {status} <Badge variant="secondary" className="text-[10px] ml-1">{count}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-3">{filtered.length} tickets</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Est. Completion</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => {
                const Icon = statusIcons[t.status];
                return (
                  <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedTicket(t)}>
                    <TableCell className="font-mono text-sm font-medium">{t.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]" style={{ borderColor: typeColors[t.ticketType], color: typeColors[t.ticketType] }}>{t.ticketType}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{t.bookingId}</TableCell>
                    <TableCell className="text-sm truncate max-w-[130px]">{t.hotelName}</TableCell>
                    <TableCell className="text-sm">{t.guestName}</TableCell>
                    <TableCell><Badge variant={priorityColors[t.priority] as "destructive" | "secondary" | "outline"} className="text-[10px]">{t.priority}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Icon className="h-3.5 w-3.5" />
                        <Badge variant={statusColors[t.status] as "default" | "secondary" | "destructive"} className="text-[10px]">{t.status}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{t.createdAt}</TableCell>
                    <TableCell className="text-xs">{t.estimatedCompletion}</TableCell>
                    <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground" /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Tabs>

      {/* ── Ticket Detail + Tracing Dialog ── */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTicket?.id}
              {selectedTicket && <Badge variant={statusColors[selectedTicket.status] as "default" | "secondary" | "destructive"}>{selectedTicket.status}</Badge>}
            </DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <ScrollArea className="flex-1">
              <div className="space-y-4 pr-2">
                {/* Info */}
                <Card className="p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Type:</span> <Badge variant="outline" className="text-[10px] ml-1" style={{ borderColor: typeColors[selectedTicket.ticketType], color: typeColors[selectedTicket.ticketType] }}>{selectedTicket.ticketType}</Badge></div>
                    <div><span className="text-muted-foreground">Priority:</span> <Badge variant={priorityColors[selectedTicket.priority] as "destructive" | "secondary" | "outline"} className="text-[10px] ml-1">{selectedTicket.priority}</Badge></div>
                    <div><span className="text-muted-foreground">Booking:</span> <span className="font-mono">{selectedTicket.bookingId}</span></div>
                    <div><span className="text-muted-foreground">Hotel:</span> {selectedTicket.hotelName}</div>
                    <div><span className="text-muted-foreground">Guest:</span> {selectedTicket.guestName}</div>
                    <div><span className="text-muted-foreground">Assignee:</span> {selectedTicket.assignee || "Unassigned"}</div>
                    <div><span className="text-muted-foreground">Created:</span> {selectedTicket.createdAt}</div>
                    <div><span className="text-muted-foreground">Est. Completion:</span> {selectedTicket.estimatedCompletion}</div>
                  </div>
                  <Separator className="my-3" />
                  <div>
                    <p className="text-sm font-medium mb-1">Description</p>
                    <p className="text-sm text-muted-foreground">{selectedTicket.description}</p>
                  </div>
                </Card>

                {/* Tracing Timeline */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Processing History</h3>
                  <div className="space-y-0">
                    {selectedTicket.traces.map((trace, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`h-3 w-3 rounded-full shrink-0 mt-1.5 ${i === selectedTicket.traces.length - 1 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                          {i < selectedTicket.traces.length - 1 && <div className="w-px flex-1 bg-muted-foreground/20 my-1" />}
                        </div>
                        <div className="pb-4">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{trace.action}</p>
                            <span className="text-[10px] text-muted-foreground">{trace.date}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">by {trace.by}</p>
                          <p className="text-sm mt-1">{trace.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
