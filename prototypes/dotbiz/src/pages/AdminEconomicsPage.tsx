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
          <h2 className="text-lg font-bold">접근 권한 없음</h2>
          <p className="text-sm text-muted-foreground mt-2">
            이 페이지는 <strong>OhMyHotel 내부 스태프(ELLIS admin) 전용</strong>입니다.
            고객 계정은 내부 경제 설정에 접근할 수 없습니다.
          </p>
          <Button className="mt-4" onClick={() => navigate("/app/dashboard")}>
            대시보드로 돌아가기
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
      toast.error("필수 항목을 모두 입력해주세요");
      return;
    }
    toast.success(`변경 요청이 ${rcItem.approvers[0]}에게 접수되었습니다`, {
      description: `결재 순서: ${rcItem.approvers.join(" → ")}`,
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
    { key: "all",           label: "전체",         count: APPROVAL_ITEMS.length },
    { key: "Economics",     label: "경제 정책",    count: APPROVAL_ITEMS.filter(i => i.category === "Economics").length },
    { key: "Promotions",    label: "프로모션",     count: APPROVAL_ITEMS.filter(i => i.category === "Promotions").length },
    { key: "Shop Catalog",  label: "상품 카탈로그", count: APPROVAL_ITEMS.filter(i => i.category === "Shop Catalog").length },
    { key: "Gamification",  label: "게임화",       count: APPROVAL_ITEMS.filter(i => i.category === "Gamification").length },
    { key: "Policy",        label: "운영 정책",    count: APPROVAL_ITEMS.filter(i => i.category === "Policy").length },
    { key: "Content",       label: "콘텐츠",       count: APPROVAL_ITEMS.filter(i => i.category === "Content").length },
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
          <h1 className="text-2xl font-bold">ELS 경제 관리</h1>
          <Badge variant="outline" className="text-[10px] ml-2" style={{ borderColor: "#FF6000", color: "#FF6000" }}>
            ELLIS 내부 · 거버넌스
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          ELS 리워드 경제를 결재 체인 하에 조정합니다. 모든 파라미터는 감사 로그에 추적되며,
          지정된 결재자 전원 서명 후에만 변경이 적용됩니다.
        </p>
      </div>

      {/* ── Critical KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">결재 대기</p>
          <p className="text-3xl font-bold mt-1" style={{ color: pending.length > 0 ? "#EF476F" : "#64748b" }}>
            {pending.length}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">건의 서명 대기 중</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">조정 가능 파라미터</p>
          <p className="text-3xl font-bold mt-1">{APPROVAL_ITEMS.length}</p>
          <p className="text-[10px] text-muted-foreground mt-1">6개 카테고리</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Critical Items</p>
          <p className="text-3xl font-bold mt-1" style={{ color: IMPACT_COLOR.Critical }}>
            {APPROVAL_ITEMS.filter(i => i.impact === "Critical").length}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">대표이사 결재 필수</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">월 예산 한도</p>
          <p className="text-3xl font-bold mt-1" style={{ color: "#EF476F" }}>
            —
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">미설정 (Critical)</p>
        </Card>
      </div>

      {/* ── CEO-level pending alert ── */}
      {pending.filter(r => r.currentApprover === "CEO").length > 0 && (
        <Alert className="border-[#FF6000]/50" style={{ background: "#FF600010" }}>
          <AlertTriangle className="h-4 w-4" style={{ color: "#FF6000" }} />
          <AlertTitle className="text-sm">
            {pending.filter(r => r.currentApprover === "CEO").length}건이 대표이사 결재 대기 중
          </AlertTitle>
          <AlertDescription className="text-xs">
            Critical 등급 변경은 대표이사 결재가 필수입니다. "결재 요청" 탭에서 검토하세요.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Tabs ── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="parameters" className="gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            파라미터
            <span className="ml-1 text-[9px] bg-muted px-1 rounded-full">{APPROVAL_ITEMS.length}</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            결재 요청
            {pending.length > 0 && (
              <span className="ml-1 text-[9px] px-1 rounded-full text-white" style={{ background: "#EF476F" }}>
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="matrix" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            결재 매트릭스
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
                placeholder="파라미터명 또는 키로 검색…"
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
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">현재값</p>
                  <p className="font-mono text-xs">{item.currentValue}</p>
                </div>
                <div className="text-[10px] text-muted-foreground space-y-1 mb-3">
                  <p><strong>검토 주기:</strong> {item.reviewCadence}</p>
                  <p className="line-clamp-2"><strong>예산 영향:</strong> {item.budgetImpactHint}</p>
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
                    변경 요청
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
            {(["Pending", "Approved", "Rejected", "all"] as const).map(s => {
              const label = s === "all" ? "전체" : s === "Pending" ? "결재 대기" : s === "Approved" ? "승인 완료" : "반려";
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    statusFilter === s
                      ? "bg-[#FF6000] text-white"
                      : "bg-muted hover:bg-muted/60 text-foreground"
                  }`}
                >
                  {label}{" "}
                  <span className="opacity-70">
                    ({s === "all" ? approvalRequests.length : approvalRequests.filter(r => r.status === s).length})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Request cards */}
          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <Card className="p-10 text-center text-sm text-muted-foreground">
                해당 조건의 요청이 없습니다.
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
                          {req.status === "Pending" ? "결재 대기" : req.status === "Approved" ? "승인 완료" : "반려"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">#{req.id}</span>
                        {item && <Badge variant="outline" className="text-[9px]">{item.category}</Badge>}
                      </div>
                      <h3 className="font-semibold text-sm">{item?.label || req.itemKey}</h3>
                      <p className="text-[11px] text-muted-foreground">
                        <strong>{req.requestedByName}</strong> 요청 · {req.requestedAt}
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
                        {req.currentApprover} 결재 대기
                      </Badge>
                    )}
                  </div>

                  {/* Before → After */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                    <div className="p-2 rounded-md bg-muted/40">
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">현재값</p>
                      <p className="text-xs font-mono line-clamp-2">{req.currentValue}</p>
                    </div>
                    <div className="p-2 rounded-md" style={{ background: "#FF600010", border: "1px solid #FF600033" }}>
                      <p className="text-[9px] uppercase tracking-wider text-[#FF6000]">변경 제안</p>
                      <p className="text-xs font-mono line-clamp-2" style={{ color: "#FF6000" }}>{req.proposedValue}</p>
                    </div>
                  </div>

                  {/* Justification + Impact */}
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">변경 사유</p>
                      <p className="text-xs">{req.justification}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">영향 분석</p>
                      <p className="text-xs italic text-muted-foreground">{req.impactAnalysis}</p>
                    </div>
                  </div>

                  {/* Signature chain */}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5">
                      결재 체인
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
                            {a} 대기
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
                        onClick={() => toast.info("반려 처리 — 요청자에게 사유와 함께 통지됩니다")}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        반려
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-[11px] text-white"
                        style={{ background: "#06D6A0" }}
                        onClick={() => toast.success(`${req.currentApprover} 권한으로 승인되었습니다`, { description: remainingApprovers.length > 1 ? `다음 결재자: ${remainingApprovers[1]}` : "모든 서명 완료 — 변경이 적용됩니다" })}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {req.currentApprover} 승인
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
            <AlertTitle className="text-sm">결재 매트릭스</AlertTitle>
            <AlertDescription className="text-xs">
              참고용 테이블: 각 변경 유형별 결재자 체계. Impact 등급 순으로 정렬.
              명시된 결재자가 순서대로 모두 승인해야 변경이 적용됩니다.
            </AlertDescription>
          </Alert>

          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">카테고리</TableHead>
                  <TableHead>파라미터</TableHead>
                  <TableHead className="w-24">Impact</TableHead>
                  <TableHead>결재 체인</TableHead>
                  <TableHead className="w-32">검토 주기</TableHead>
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
            <p className="text-sm font-semibold mb-3">범례</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Impact 등급</p>
                <div className="space-y-1.5">
                  {(["Critical", "High", "Medium", "Low"] as const).map(imp => (
                    <div key={imp} className="flex items-center gap-2 text-xs">
                      <span
                        className="inline-block h-3 w-3 rounded"
                        style={{ background: IMPACT_COLOR[imp] }}
                      />
                      <strong>{imp}</strong>
                      <span className="text-muted-foreground">
                        {imp === "Critical" && "— 돈이 직접 움직임, CEO 결재 필수"}
                        {imp === "High" && "— 예산에 실질적 영향"}
                        {imp === "Medium" && "— 운영 레벨, CMO/CPO 권한"}
                        {imp === "Low" && "— 일상 운영, 단일 결재자"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">결재자 역할</p>
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
                        {role === "CEO" && "대표이사 · Critical 변경 최종 결재"}
                        {role === "CFO" && "재무이사 · 예산/부채 결재"}
                        {role === "CMO" && "마케팅이사 · 프로모션·게임화 전략"}
                        {role === "CPO" && "상품이사 · 카탈로그·공급사 계약"}
                        {role === "Marketing Manager" && "마케팅팀 · 프로모 실행·상품 가격"}
                        {role === "Content Manager" && "콘텐츠팀 · 리뷰 검수·takedown"}
                        {role === "ELLIS Admin" && "시스템 운영 파라미터"}
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
              변경 요청 · {rcItem?.label}
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
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">현재값</p>
                <p className="text-sm font-mono">{rcItem.currentValue}</p>
              </div>

              {/* Approval chain preview */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  결재자 (순서대로)
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
                <label className="text-xs font-medium">변경 제안값 <span className="text-destructive">*</span></label>
                <Input
                  className="mt-1"
                  value={rcProposed}
                  onChange={e => setRcProposed(e.target.value)}
                  placeholder={`예: ${rcItem.currentValue.split(" ")[0]} → …`}
                />
              </div>

              {/* Justification */}
              <div>
                <label className="text-xs font-medium">변경 사유 <span className="text-destructive">*</span></label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={rcJustification}
                  onChange={e => setRcJustification(e.target.value)}
                  placeholder="왜 변경이 필요한가요? 어떤 계기로?"
                />
              </div>

              {/* Impact */}
              <div>
                <label className="text-xs font-medium">영향 분석 (정량적)</label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={rcImpact}
                  onChange={e => setRcImpact(e.target.value)}
                  placeholder={`예상 예산 / 부채 / 볼륨 영향. 참고: ${rcItem.budgetImpactHint}`}
                />
              </div>

              <div className="p-2.5 rounded-md bg-blue-50 text-[10px] text-blue-900">
                <strong>감사 로그:</strong> 이 요청은 요청자명({user?.name})과 함께 기록되어
                결재자에게 전달됩니다. 모든 서명이 완료되어야 변경이 적용됩니다.
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRcItem(null)}>
              <XIcon className="h-3 w-3 mr-1" />
              취소
            </Button>
            <Button
              onClick={submitRequestChange}
              style={{ background: "#FF6000" }}
              className="text-white"
            >
              <Send className="h-3 w-3 mr-1" />
              결재 요청 제출
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
