import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Shield, Settings, FileText, CheckCircle2, XCircle, Clock, ArrowRight,
  AlertTriangle, Users, Send, Search, Filter, X as XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useScreenState } from "@/hooks/useScreenState";
import { useTabParam } from "@/hooks/useTabParam";
import { StateToolbar } from "@/components/StateToolbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  APPROVAL_ITEMS, approvalRequests, pendingApprovals, approvalHistory, getApprovalItem,
  IMPACT_COLOR, APPROVER_COLOR,
  type ApprovalItem, type ApprovalRequest, type ApprovalStatus, type ApprovalCategory,
} from "@/mocks/approvals";
import { toast } from "sonner";

/* ──────────────────────────────────────────────────────────────────────
 * AdminEconomicsPage — ELLIS admin preview for DOTBIZ
 *
 * Not part of the customer-facing DOTBIZ app proper. This page represents
 * what ELLIS admin staff (OhMyHotel internal) would use to manage ELS
 * economics, with governance baked in (nothing can change without the
 * right chain of approvals).
 *
 * Three tabs:
 *   • Parameters — all tunable configs with current values + Request Change
 *   • Requests   — active queue + historical audit log
 *   • Matrix     — "who approves what" reference table
 * ────────────────────────────────────────────────────────────────────── */

export default function AdminEconomicsPage() {
  const { state, setState } = useScreenState("success");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useTabParam("parameters");

  /* ── Access guard: ELLIS internal staff only ──
   * Even Master customers must not see this page. Direct URL access
   * shows a polite denial. */
  if (!user?.isInternal) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-lg font-bold">Restricted Area</h2>
          <p className="text-sm text-muted-foreground mt-2">
            This page is for <strong>OhMyHotel internal staff (ELLIS admin)</strong> only.
            Customer accounts do not have access to internal economics configuration.
          </p>
          <Button className="mt-4" onClick={() => navigate("/app/dashboard")}>
            Back to Dashboard
          </Button>
        </Card>
        <StateToolbar state={state} setState={setState} />
      </div>
    );
  }

  /* ── Request Change dialog state ── */
  const [rcItem, setRcItem] = useState<ApprovalItem | null>(null);
  const [rcProposed, setRcProposed] = useState("");
  const [rcJustification, setRcJustification] = useState("");
  const [rcImpact, setRcImpact] = useState("");

  const openRequestChange = (item: ApprovalItem) => {
    setRcItem(item);
    setRcProposed("");
    setRcJustification("");
    setRcImpact("");
  };

  const submitRequestChange = () => {
    if (!rcItem || !rcProposed.trim() || !rcJustification.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    toast.success(`Change request submitted to ${rcItem.approvers[0]}`, {
      description: `Awaiting sign-off from ${rcItem.approvers.join(" → ")}`,
    });
    setRcItem(null);
  };

  /* ── Category filter on Parameters tab ── */
  const [catFilter, setCatFilter] = useState<ApprovalCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    let list = APPROVAL_ITEMS;
    if (catFilter !== "all") list = list.filter(i => i.category === catFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(i =>
        i.label.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.key.toLowerCase().includes(q)
      );
    }
    return list;
  }, [catFilter, search]);

  /* ── Requests filter ── */
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "all">("Pending");
  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return approvalRequests;
    return approvalRequests.filter(r => r.status === statusFilter);
  }, [statusFilter]);

  const pending = pendingApprovals();

  const categories: Array<{ key: ApprovalCategory | "all"; label: string; count: number }> = [
    { key: "all",           label: "All",            count: APPROVAL_ITEMS.length },
    { key: "Economics",     label: "Economics",      count: APPROVAL_ITEMS.filter(i => i.category === "Economics").length },
    { key: "Promotions",    label: "Promotions",     count: APPROVAL_ITEMS.filter(i => i.category === "Promotions").length },
    { key: "Shop Catalog",  label: "Shop Catalog",   count: APPROVAL_ITEMS.filter(i => i.category === "Shop Catalog").length },
    { key: "Gamification",  label: "Gamification",   count: APPROVAL_ITEMS.filter(i => i.category === "Gamification").length },
    { key: "Policy",        label: "Policy",         count: APPROVAL_ITEMS.filter(i => i.category === "Policy").length },
    { key: "Content",       label: "Content",        count: APPROVAL_ITEMS.filter(i => i.category === "Content").length },
  ];

  if (state === "loading") return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-4">
      <div className="h-8 w-64 bg-muted animate-pulse rounded" />
      <div className="h-96 bg-muted animate-pulse rounded" />
      <StateToolbar state={state} setState={setState} />
    </div>
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" style={{ color: "#FF6000" }} />
          <h1 className="text-2xl font-bold">ELS Economics Admin</h1>
          <Badge variant="outline" className="text-[10px] ml-2" style={{ borderColor: "#FF6000", color: "#FF6000" }}>
            ELLIS preview · Governance
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Adjust ELS reward economics with required executive sign-off.
          Every parameter below is tracked in an audit log. Changes take effect
          only after all listed approvers have signed.
        </p>
      </div>

      {/* ── Critical KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pending Approvals</p>
          <p className="text-3xl font-bold mt-1" style={{ color: pending.length > 0 ? "#EF476F" : "#64748b" }}>
            {pending.length}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">awaiting sign-off</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tunable Parameters</p>
          <p className="text-3xl font-bold mt-1">{APPROVAL_ITEMS.length}</p>
          <p className="text-[10px] text-muted-foreground mt-1">across 6 categories</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Critical Items</p>
          <p className="text-3xl font-bold mt-1" style={{ color: IMPACT_COLOR.Critical }}>
            {APPROVAL_ITEMS.filter(i => i.impact === "Critical").length}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">CEO sign-off required</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Budget Cap</p>
          <p className="text-3xl font-bold mt-1" style={{ color: "#EF476F" }}>
            —
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">not yet set (critical)</p>
        </Card>
      </div>

      {/* ── CEO-level pending alert ── */}
      {pending.filter(r => r.currentApprover === "CEO").length > 0 && (
        <Alert className="border-[#FF6000]/50" style={{ background: "#FF600010" }}>
          <AlertTriangle className="h-4 w-4" style={{ color: "#FF6000" }} />
          <AlertTitle className="text-sm">
            {pending.filter(r => r.currentApprover === "CEO").length} request{pending.filter(r => r.currentApprover === "CEO").length === 1 ? "" : "s"} awaiting CEO sign-off
          </AlertTitle>
          <AlertDescription className="text-xs">
            Critical-impact changes require 대표이사 approval. Review in the Requests tab.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Tabs ── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="parameters" className="gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            Parameters
            <span className="ml-1 text-[9px] bg-muted px-1 rounded-full">{APPROVAL_ITEMS.length}</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Requests
            {pending.length > 0 && (
              <span className="ml-1 text-[9px] px-1 rounded-full text-white" style={{ background: "#EF476F" }}>
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="matrix" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Approval Matrix
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ═══════════ PARAMETERS TAB ═══════════ */}
      {tab === "parameters" && (
        <div className="space-y-4">
          {/* Filter row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search parameter name or key…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {categories.map(c => (
                <button
                  key={c.key}
                  onClick={() => setCatFilter(c.key)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    catFilter === c.key
                      ? "bg-[#FF6000] text-white"
                      : "bg-muted hover:bg-muted/60 text-foreground"
                  }`}
                >
                  {c.label} <span className="opacity-70">({c.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Parameter grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.map(item => (
              <Card key={item.key} className="p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <Badge variant="outline" className="text-[9px] mb-1">
                      {item.category}
                    </Badge>
                    <h3 className="font-semibold text-sm">{item.label}</h3>
                  </div>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase whitespace-nowrap"
                    style={{
                      background: `${IMPACT_COLOR[item.impact]}22`,
                      color: IMPACT_COLOR[item.impact],
                      border: `1px solid ${IMPACT_COLOR[item.impact]}55`,
                    }}
                  >
                    {item.impact}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">
                  {item.description}
                </p>
                <div className="p-2 rounded-md bg-muted/40 text-xs mb-2">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Current</p>
                  <p className="font-mono text-xs">{item.currentValue}</p>
                </div>
                <div className="text-[10px] text-muted-foreground space-y-1 mb-3">
                  <p><strong>Review:</strong> {item.reviewCadence}</p>
                  <p className="line-clamp-2"><strong>Budget impact:</strong> {item.budgetImpactHint}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t">
                  <div className="flex items-center gap-1 flex-wrap">
                    {item.approvers.map((a, i) => (
                      <span key={a} className="flex items-center gap-0.5">
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            background: `${APPROVER_COLOR[a]}22`,
                            color: APPROVER_COLOR[a],
                          }}
                        >
                          {a}
                        </span>
                        {i < item.approvers.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />}
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px] gap-1 shrink-0"
                    onClick={() => openRequestChange(item)}
                  >
                    Request change
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ REQUESTS TAB ═══════════ */}
      {tab === "requests" && (
        <div className="space-y-4">
          {/* Status filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {(["Pending", "Approved", "Rejected", "all"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-[#FF6000] text-white"
                    : "bg-muted hover:bg-muted/60 text-foreground"
                }`}
              >
                {s === "all" ? "All" : s}{" "}
                <span className="opacity-70">
                  ({s === "all" ? approvalRequests.length : approvalRequests.filter(r => r.status === s).length})
                </span>
              </button>
            ))}
          </div>

          {/* Request cards */}
          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <Card className="p-10 text-center text-sm text-muted-foreground">
                No requests match this filter.
              </Card>
            ) : filteredRequests.map(req => {
              const item = getApprovalItem(req.itemKey);
              const statusColor =
                req.status === "Pending" ? "#eab308" :
                req.status === "Approved" ? "#06D6A0" :
                req.status === "Rejected" ? "#EF476F" : "#64748b";
              const remainingApprovers = item
                ? item.approvers.filter(a => !req.signatures.some(s => s.approver === a))
                : [];
              return (
                <Card key={req.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="outline" className="text-[10px]" style={{ color: statusColor, borderColor: statusColor }}>
                          {req.status === "Pending" && <Clock className="h-2.5 w-2.5 mr-0.5" />}
                          {req.status === "Approved" && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />}
                          {req.status === "Rejected" && <XCircle className="h-2.5 w-2.5 mr-0.5" />}
                          {req.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">#{req.id}</span>
                        {item && <Badge variant="outline" className="text-[9px]">{item.category}</Badge>}
                      </div>
                      <h3 className="font-semibold text-sm">{item?.label || req.itemKey}</h3>
                      <p className="text-[11px] text-muted-foreground">
                        Requested by <strong>{req.requestedByName}</strong> · {req.requestedAt}
                      </p>
                    </div>
                    {req.status === "Pending" && req.currentApprover && (
                      <Badge
                        className="text-[10px] shrink-0"
                        style={{
                          background: `${APPROVER_COLOR[req.currentApprover]}22`,
                          color: APPROVER_COLOR[req.currentApprover],
                          border: `1px solid ${APPROVER_COLOR[req.currentApprover]}55`,
                        }}
                      >
                        Awaiting {req.currentApprover}
                      </Badge>
                    )}
                  </div>

                  {/* Before → After */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                    <div className="p-2 rounded-md bg-muted/40">
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Current</p>
                      <p className="text-xs font-mono line-clamp-2">{req.currentValue}</p>
                    </div>
                    <div className="p-2 rounded-md" style={{ background: "#FF600010", border: "1px solid #FF600033" }}>
                      <p className="text-[9px] uppercase tracking-wider text-[#FF6000]">Proposed</p>
                      <p className="text-xs font-mono line-clamp-2" style={{ color: "#FF6000" }}>{req.proposedValue}</p>
                    </div>
                  </div>

                  {/* Justification + Impact */}
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Justification</p>
                      <p className="text-xs">{req.justification}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Impact analysis</p>
                      <p className="text-xs italic text-muted-foreground">{req.impactAnalysis}</p>
                    </div>
                  </div>

                  {/* Signature chain */}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5">
                      Signature chain
                    </p>
                    <div className="flex items-center gap-1 flex-wrap">
                      {req.signatures.map((sig, i) => (
                        <span key={i} className="flex items-center gap-0.5">
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1"
                            style={{
                              background: sig.decision === "Approved" ? "#06D6A022" : "#EF476F22",
                              color: sig.decision === "Approved" ? "#059669" : "#EF476F",
                              border: `1px solid ${sig.decision === "Approved" ? "#06D6A055" : "#EF476F55"}`,
                            }}
                            title={sig.comment}
                          >
                            {sig.decision === "Approved" ? <CheckCircle2 className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
                            {sig.approver} · {sig.signedAt.slice(0, 10)}
                          </span>
                          {i < req.signatures.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />}
                        </span>
                      ))}
                      {remainingApprovers.map((a, i) => (
                        <span key={a} className="flex items-center gap-0.5">
                          {(req.signatures.length > 0 || i > 0) && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />}
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-md border border-dashed"
                            style={{ color: APPROVER_COLOR[a], borderColor: `${APPROVER_COLOR[a]}55` }}
                          >
                            <Clock className="h-2.5 w-2.5 mr-0.5 inline" />
                            {a} pending
                          </span>
                        </span>
                      ))}
                    </div>
                    {/* Comments from signatures */}
                    {req.signatures.filter(s => s.comment).length > 0 && (
                      <div className="mt-2 space-y-1">
                        {req.signatures.filter(s => s.comment).map((sig, i) => (
                          <p key={i} className="text-[10px] text-muted-foreground pl-2 border-l-2 border-muted italic">
                            <strong>{sig.approverName}:</strong> {sig.comment}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pending actions */}
                  {req.status === "Pending" && (
                    <div className="mt-3 pt-3 border-t flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px]"
                        onClick={() => toast.info("Demo: would record rejection + notify requester")}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-[11px] text-white"
                        style={{ background: "#06D6A0" }}
                        onClick={() => toast.success(`Approved as ${req.currentApprover}`, { description: remainingApprovers.length > 1 ? `Next: ${remainingApprovers[1]}` : "All signatures collected — change will take effect" })}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approve as {req.currentApprover}
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════ MATRIX TAB ═══════════ */}
      {tab === "matrix" && (
        <div className="space-y-4">
          <Alert>
            <AlertTitle className="text-sm">Approval Matrix</AlertTitle>
            <AlertDescription className="text-xs">
              Reference table: who must sign off on each type of change. Ordered by impact tier.
              Changes cannot take effect until all listed approvers have approved in sequence.
            </AlertDescription>
          </Alert>

          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Category</TableHead>
                  <TableHead>Parameter</TableHead>
                  <TableHead className="w-24">Impact</TableHead>
                  <TableHead>Approvers (chain)</TableHead>
                  <TableHead className="w-32">Cadence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...APPROVAL_ITEMS]
                  .sort((a, b) => {
                    const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
                    return order[a.impact] - order[b.impact];
                  })
                  .map(item => (
                    <TableRow key={item.key}>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                          style={{
                            background: `${IMPACT_COLOR[item.impact]}22`,
                            color: IMPACT_COLOR[item.impact],
                          }}
                        >
                          {item.impact}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 flex-wrap">
                          {item.approvers.map((a, i) => (
                            <span key={a} className="flex items-center gap-0.5">
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                style={{
                                  background: `${APPROVER_COLOR[a]}22`,
                                  color: APPROVER_COLOR[a],
                                }}
                              >
                                {a}
                              </span>
                              {i < item.approvers.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.reviewCadence}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>

          {/* Legend */}
          <Card className="p-4">
            <p className="text-sm font-semibold mb-3">Legend</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Impact levels</p>
                <div className="space-y-1.5">
                  {(["Critical", "High", "Medium", "Low"] as const).map(imp => (
                    <div key={imp} className="flex items-center gap-2 text-xs">
                      <span
                        className="inline-block h-3 w-3 rounded"
                        style={{ background: IMPACT_COLOR[imp] }}
                      />
                      <strong>{imp}</strong>
                      <span className="text-muted-foreground">
                        {imp === "Critical" && "— moves money directly, CEO required"}
                        {imp === "High" && "— material budget impact"}
                        {imp === "Medium" && "— operational, CMO/CPO range"}
                        {imp === "Low" && "— minor, single approver OK"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Approver roles</p>
                <div className="space-y-1.5">
                  {(Object.keys(APPROVER_COLOR) as Array<keyof typeof APPROVER_COLOR>).map(role => (
                    <div key={role} className="flex items-center gap-2 text-xs">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: `${APPROVER_COLOR[role]}22`,
                          color: APPROVER_COLOR[role],
                        }}
                      >
                        {role}
                      </span>
                      <span className="text-muted-foreground">
                        {role === "CEO" && "대표이사 · final authority on critical changes"}
                        {role === "CFO" && "재무이사 · budget + liability sign-off"}
                        {role === "CMO" && "마케팅이사 · promo + gamification strategy"}
                        {role === "CPO" && "상품이사 · catalog + supplier deals"}
                        {role === "Marketing Manager" && "promo execution + shop pricing"}
                        {role === "Content Manager" && "review moderation + takedowns"}
                        {role === "ELLIS Admin" && "operational parameters"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Request Change Dialog ── */}
      <Dialog open={!!rcItem} onOpenChange={(o) => { if (!o) setRcItem(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-4 w-4" style={{ color: "#FF6000" }} />
              Request Change · {rcItem?.label}
            </DialogTitle>
          </DialogHeader>

          {rcItem && (
            <div className="space-y-3">
              {/* Item context */}
              <div className="p-3 rounded-md bg-muted/40">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-[9px]">{rcItem.category}</Badge>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                    style={{
                      background: `${IMPACT_COLOR[rcItem.impact]}22`,
                      color: IMPACT_COLOR[rcItem.impact],
                    }}
                  >
                    {rcItem.impact}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-2">{rcItem.description}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Current value</p>
                <p className="text-sm font-mono">{rcItem.currentValue}</p>
              </div>

              {/* Approval chain preview */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Will require sign-off from
                </p>
                <div className="flex items-center gap-1 flex-wrap">
                  {rcItem.approvers.map((a, i) => (
                    <span key={a} className="flex items-center gap-0.5">
                      <span
                        className="text-[11px] font-bold px-2 py-1 rounded-md"
                        style={{
                          background: `${APPROVER_COLOR[a]}22`,
                          color: APPROVER_COLOR[a],
                          border: `1px solid ${APPROVER_COLOR[a]}55`,
                        }}
                      >
                        {a}
                      </span>
                      {i < rcItem.approvers.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                    </span>
                  ))}
                </div>
              </div>

              {/* Proposed value */}
              <div>
                <label className="text-xs font-medium">Proposed new value <span className="text-destructive">*</span></label>
                <Input
                  className="mt-1"
                  value={rcProposed}
                  onChange={e => setRcProposed(e.target.value)}
                  placeholder={`e.g. ${rcItem.currentValue.split(" ")[0]} → …`}
                />
              </div>

              {/* Justification */}
              <div>
                <label className="text-xs font-medium">Justification <span className="text-destructive">*</span></label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={rcJustification}
                  onChange={e => setRcJustification(e.target.value)}
                  placeholder="Why is this change needed? What triggered it?"
                />
              </div>

              {/* Impact */}
              <div>
                <label className="text-xs font-medium">Impact analysis (quantified)</label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={rcImpact}
                  onChange={e => setRcImpact(e.target.value)}
                  placeholder={`Est. budget / liability / volume effect. Ref: ${rcItem.budgetImpactHint}`}
                />
              </div>

              <div className="p-2.5 rounded-md bg-blue-50 text-[10px] text-blue-900">
                <strong>Audit trail:</strong> this request will be logged with your name
                ({user?.name}) and distributed to approvers. Changes only take effect
                after all signatures are collected.
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRcItem(null)}>
              <XIcon className="h-3 w-3 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={submitRequestChange}
              style={{ background: "#FF6000" }}
              className="text-white"
            >
              <Send className="h-3 w-3 mr-1" />
              Submit for approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
