import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Search, Plus, Clock, CheckCircle2, AlertTriangle, XCircle, Bot, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Ticket } from "@/mocks/tickets";
import { useI18n } from "@/contexts/I18nContext";
import { useTickets } from "@/contexts/TicketsContext";
import CreateTicketDialog from "@/components/CreateTicketDialog";
import { toast } from "sonner";

const statusColors: Record<string, string> = { Pending: "secondary", Processing: "default", Completed: "default", Rejected: "destructive" };
const statusIcons: Record<string, typeof Clock> = { Pending: Clock, Processing: AlertTriangle, Completed: CheckCircle2, Rejected: XCircle };
const priorityColors: Record<string, string> = { High: "destructive", Medium: "secondary", Low: "outline" };
const typeColors: Record<string, string> = { "Cancellation Request": "#DC2626", "Date Change": "#FF8C00", "Room Change": "#0369A1", "Special Request": "#009505", "Complaint": "#7C3AED", "Refund Request": "#DC2626" };

/* AI suggestion generator (mock) */
function generateAISuggestion(ticket: Ticket): string {
  const type = ticket.ticketType;
  const suggestions: Record<string, string> = {
    "Cancellation Request": `Based on this booking (${ticket.bookingId}), I recommend:\n\n1. Check cancel deadline: if within free cancellation window, process full refund.\n2. If past deadline: contact hotel for partial refund possibility.\n3. Document all communication with hotel.\n\nEstimated resolution time: 24-48 hours.`,
    "Date Change": `For the date change request:\n\n1. Check new date availability with hotel reservation team.\n2. Compare rates — if new dates cost more, inform guest of rate difference.\n3. Get written confirmation from hotel before updating booking.\n\nTypical processing: 2-3 business days.`,
    "Room Change": `For room upgrade/change:\n\n1. Verify current room type vs requested type availability.\n2. Calculate price difference if upgrading.\n3. Confirm with hotel's front desk manager.\n4. Update booking record once confirmed.`,
    "Special Request": `Special request handling:\n\n1. Forward to hotel concierge with specific details.\n2. Get acknowledgment from hotel (not guarantee).\n3. Notify guest that request is conveyed but not guaranteed.\n4. Follow up 24h before check-in.`,
    "Complaint": `Complaint resolution protocol:\n\n1. Assign to senior agent (High priority).\n2. Document all details with photos/evidence if available.\n3. Escalate to hotel GM if unresolved at reception level.\n4. Offer compensation options (upgrade, discount, refund).\n5. Target resolution within 24 hours.`,
    "Refund Request": `Refund processing steps:\n\n1. Verify refund eligibility per cancellation policy.\n2. Calculate refund amount (full/partial/none).\n3. Get approval from manager if >$500.\n4. Process via original payment method.\n5. Send confirmation email to guest.`,
  };
  return suggestions[type] || "Analyzing ticket details... Please provide more context for a specific recommendation.";
}

function isOverdue(ticket: Ticket): boolean {
  if (ticket.status === "Completed" || ticket.status === "Rejected") return false;
  return new Date(ticket.estimatedCompletion) < new Date();
}

export default function TicketManagementPage() {
  const { t } = useI18n();
  const { tickets, updateStatus, addTrace } = useTickets();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [statusTab, setStatusTab] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("booking") || "");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showAIPanel, setShowAIPanel] = useState(false);

  /* Highlight newly created ticket */
  const highlightId = searchParams.get("highlight");

  /* Filter by booking param */
  useEffect(() => {
    const booking = searchParams.get("booking");
    if (booking) setSearchQuery(booking);
  }, [searchParams]);

  /* Auto-open ticket detail when ?highlight=TK-... is in URL */
  useEffect(() => {
    if (highlightId) {
      const t = tickets.find(x => x.id === highlightId);
      if (t) setSelectedTicket(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightId]);

  /* Keep selected ticket in sync with context updates */
  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  }, [tickets, selectedTicket?.id]);

  const filtered = useMemo(() => {
    let result = [...tickets];
    if (statusTab !== "All") result = result.filter(t => t.status === statusTab);
    if (typeFilter !== "All") result = result.filter(t => t.ticketType === typeFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.id.toLowerCase().includes(q) || t.bookingId.toLowerCase().includes(q) || t.hotelName.toLowerCase().includes(q) || t.guestName.toLowerCase().includes(q));
    }
    return result;
  }, [tickets, statusTab, typeFilter, searchQuery]);

  const counts = {
    All: tickets.length,
    Pending: tickets.filter(t => t.status === "Pending").length,
    Processing: tickets.filter(t => t.status === "Processing").length,
    Completed: tickets.filter(t => t.status === "Completed").length,
    Rejected: tickets.filter(t => t.status === "Rejected").length,
  };
  const overdueCount = tickets.filter(isOverdue).length;

  const handleStatusChange = (status: Ticket["status"]) => {
    if (!selectedTicket) return;
    updateStatus(selectedTicket.id, status, `Status changed to ${status} via agent action`, "Agent");
    toast.success(`Ticket ${selectedTicket.id} → ${status}`);
  };

  const handleReply = () => {
    if (!selectedTicket || !replyText.trim()) return;
    addTrace(selectedTicket.id, "Agent Reply", replyText.trim(), "Agent");
    toast.success("Reply sent");
    setReplyText("");
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{t("page.tickets")}</h1>
          {overdueCount > 0 && (
            <Badge variant="destructive" className="text-xs">{overdueCount} Overdue</Badge>
          )}
        </div>
        <Button onClick={() => setCreateOpen(true)} style={{ background: "#FF6000" }}>
          <Plus className="h-4 w-4 mr-1" />New Ticket
        </Button>
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

      {/* Status Tabs */}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(ticket => {
                const Icon = statusIcons[ticket.status];
                const overdue = isOverdue(ticket);
                const isHighlight = highlightId === ticket.id;
                return (
                  <TableRow key={ticket.id} className={`cursor-pointer hover:bg-muted/50 ${isHighlight ? "bg-orange-50 dark:bg-orange-900/10 animate-pulse" : ""}`} onClick={() => setSelectedTicket(ticket)}>
                    <TableCell className="font-mono text-sm font-medium">{ticket.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]" style={{ borderColor: typeColors[ticket.ticketType], color: typeColors[ticket.ticketType] }}>{ticket.ticketType}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#0066cc]">{ticket.bookingId}</TableCell>
                    <TableCell className="text-sm truncate max-w-[130px]">{ticket.hotelName}</TableCell>
                    <TableCell className="text-sm">{ticket.guestName}</TableCell>
                    <TableCell><Badge variant={priorityColors[ticket.priority] as "destructive" | "secondary" | "outline"} className="text-[10px]">{ticket.priority}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Icon className="h-3.5 w-3.5" />
                        <Badge variant={statusColors[ticket.status] as "default" | "secondary" | "destructive"} className="text-[10px]">{ticket.status}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{ticket.createdAt}</TableCell>
                    <TableCell className="text-xs">
                      <span className={overdue ? "text-red-500 font-medium" : ""}>{ticket.estimatedCompletion}</span>
                      {overdue && <Badge variant="destructive" className="text-[9px] ml-1">Overdue</Badge>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Tabs>

      {/* ── Ticket Detail Dialog ── */}
      <Dialog open={!!selectedTicket} onOpenChange={() => { setSelectedTicket(null); setShowAIPanel(false); setReplyText(""); }}>
        <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col p-0" style={{ maxWidth: showAIPanel ? "1200px" : "800px", width: "90vw" }}>
          <DialogHeader className="px-6 pt-4 pb-3 border-b flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {selectedTicket?.id}
              {selectedTicket && <Badge variant={statusColors[selectedTicket.status] as "default" | "secondary" | "destructive"}>{selectedTicket.status}</Badge>}
              {selectedTicket && isOverdue(selectedTicket) && <Badge variant="destructive" className="text-[10px]">Overdue</Badge>}
            </DialogTitle>
            <Button size="sm" variant={showAIPanel ? "default" : "outline"} className="mr-8" onClick={() => setShowAIPanel(!showAIPanel)} style={showAIPanel ? { background: "#FF6000" } : {}}>
              <Sparkles className="h-3.5 w-3.5 mr-1" />AI Assistant
            </Button>
          </DialogHeader>
          {selectedTicket && (
            <div className="flex flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-4">
                  {/* Info */}
                  <Card className="p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Type:</span> <Badge variant="outline" className="text-[10px] ml-1" style={{ borderColor: typeColors[selectedTicket.ticketType], color: typeColors[selectedTicket.ticketType] }}>{selectedTicket.ticketType}</Badge></div>
                      <div><span className="text-muted-foreground">Priority:</span> <Badge variant={priorityColors[selectedTicket.priority] as "destructive" | "secondary" | "outline"} className="text-[10px] ml-1">{selectedTicket.priority}</Badge></div>
                      <div><span className="text-muted-foreground">Booking:</span> <button className="font-mono text-[#0066cc] hover:underline" onClick={() => navigate(`/app/bookings?ellis=${selectedTicket.bookingId}`)}>{selectedTicket.bookingId}</button></div>
                      <div><span className="text-muted-foreground">Hotel:</span> {selectedTicket.hotelName}</div>
                      <div><span className="text-muted-foreground">Guest:</span> {selectedTicket.guestName}</div>
                      <div><span className="text-muted-foreground">Assignee:</span> {selectedTicket.assignee || <span className="text-muted-foreground italic">Unassigned</span>}</div>
                      <div><span className="text-muted-foreground">Created:</span> {selectedTicket.createdAt}</div>
                      <div><span className="text-muted-foreground">Est. Completion:</span> <span className={isOverdue(selectedTicket) ? "text-red-500 font-medium" : ""}>{selectedTicket.estimatedCompletion}</span></div>
                    </div>
                    <Separator className="my-3" />
                    <div>
                      <p className="text-sm font-medium mb-1">Description</p>
                      <p className="text-sm text-muted-foreground">{selectedTicket.description}</p>
                    </div>
                  </Card>

                  {/* Conversation Thread */}
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Conversation History</h3>
                    <div className="space-y-3">
                      {selectedTicket.traces.map((trace, i) => {
                        const isAgent = !trace.by.includes("(Self)") && !trace.by.includes("(Auto)") && trace.by !== "System";
                        const isSystem = trace.by === "System";
                        return (
                          <div key={i} className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] rounded-lg p-3 ${isSystem ? "bg-muted/50 border border-dashed" : isAgent ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                              <div className={`flex items-center gap-2 text-[10px] ${isAgent ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                <span className="font-medium">{isSystem ? "🤖 System" : isAgent ? `💼 ${trace.by}` : `👤 ${trace.by}`}</span>
                                <span>·</span>
                                <span>{trace.date}</span>
                              </div>
                              <p className={`text-xs font-medium mt-1 ${isAgent ? "text-primary-foreground" : ""}`}>{trace.action}</p>
                              <p className="text-sm mt-1">{trace.note}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Reply Box */}
                  {selectedTicket.status !== "Completed" && selectedTicket.status !== "Rejected" && (
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2 text-sm">Add Reply</h3>
                      <Textarea placeholder="Type your response to the guest..." value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} className="mb-2" />
                      <div className="flex justify-end">
                        <Button size="sm" onClick={handleReply} disabled={!replyText.trim()} style={{ background: "#FF6000" }}>
                          <Send className="h-3 w-3 mr-1" />Send Reply
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* Status Actions */}
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 text-sm">Status Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTicket.status === "Pending" && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange("Processing")}>Start Processing</Button>
                      )}
                      {selectedTicket.status === "Processing" && (
                        <>
                          <Button size="sm" variant="outline" className="border-green-500 text-green-600" onClick={() => handleStatusChange("Completed")}>
                            <CheckCircle2 className="h-3 w-3 mr-1" />Mark Completed
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-500 text-red-500" onClick={() => handleStatusChange("Rejected")}>
                            <XCircle className="h-3 w-3 mr-1" />Reject
                          </Button>
                        </>
                      )}
                      {selectedTicket.status === "Pending" && (
                        <Button size="sm" variant="outline" className="border-red-500 text-red-500" onClick={() => handleStatusChange("Rejected")}>
                          <XCircle className="h-3 w-3 mr-1" />Reject
                        </Button>
                      )}
                      {(selectedTicket.status === "Completed" || selectedTicket.status === "Rejected") && (
                        <p className="text-xs text-muted-foreground italic">Ticket is closed. No further actions available.</p>
                      )}
                    </div>
                  </Card>
                </div>
              </ScrollArea>

              {/* AI Assistant Side Panel */}
              {showAIPanel && (
                <div className="w-[380px] border-l bg-muted/20 flex flex-col">
                  <div className="px-4 py-3 border-b flex items-center gap-2" style={{ background: "linear-gradient(135deg, #FF6000, #FF8C00)", color: "white" }}>
                    <Bot className="h-5 w-5" />
                    <h3 className="font-bold text-sm">AI Assistant</h3>
                    <Badge variant="secondary" className="text-[9px] ml-auto">Beta</Badge>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      <Card className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-[#FF6000] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold mb-2">Recommended Resolution</p>
                            <p className="text-xs whitespace-pre-line text-slate-700 dark:text-slate-300">{generateAISuggestion(selectedTicket)}</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-3">
                        <p className="text-xs font-semibold mb-2">Quick Actions</p>
                        <div className="space-y-1.5">
                          <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => { addTrace(selectedTicket.id, "Hotel Contacted", "Reached out to hotel for resolution (AI-assisted)", "Agent"); toast.success("Trace added"); }}>📞 Log: Hotel Contacted</Button>
                          <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => { addTrace(selectedTicket.id, "Awaiting Response", "Waiting for hotel's reply (AI-assisted)", "Agent"); toast.success("Trace added"); }}>⏳ Log: Awaiting Response</Button>
                          <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => { setReplyText("Dear guest,\n\nThank you for reaching out. We have received your request and are currently working on a resolution. We will update you shortly.\n\nBest regards,\nDOTBIZ Support Team"); toast.success("Template loaded"); }}>✉️ Load Reply Template</Button>
                        </div>
                      </Card>
                      <p className="text-[10px] text-muted-foreground text-center italic">Powered by DOTBIZ AI · Mock responses for demo</p>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Ticket Dialog (standalone — no specific booking) */}
      <CreateTicketDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
