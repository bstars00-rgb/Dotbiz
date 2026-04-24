import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Shield, Settings, ArrowRight,
  AlertTriangle, Users, Send, Search, X as XIcon, Edit, History,
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
  APPROVAL_ITEMS, getApprovalItem,
  IMPACT_COLOR, APPROVER_COLOR,
  allParameterChanges, changesForItem,
  type ApprovalItem, type ApprovalCategory, type ParameterChange,
} from "@/mocks/approvals";
import { toast } from "sonner";

/* ──────────────────────────────────────────────────────────────────────
 * AdminEconomicsPage — ELLIS admin 실제 관리 페이지
 *
 * 이 페이지는 **결재가 이미 완료된 변경을 실제 프로덕션에 반영**하는 도구.
 * 결재 요청/서명 워크플로우는 별도 결재 시스템(이메일·Slack·전자결재 등)에서
 * 처리되며, 여기서는 **승인 번호를 참조하여 값을 즉시 수정**한다.
 *
 * 변경 시 주의:
 *   1. 반드시 해당 결재 문서 번호(apr-xxx) 참조
 *   2. 즉시 시스템 전체에 반영 (고객 앱 포함)
 *   3. 전체 변경 이력이 영구 감사 로그에 기록됨
 *
 * Three tabs:
 *   • 파라미터 — 모든 설정 값을 직접 수정 (결재 참조 필수)
 *   • 변경 이력 — 이 페이지로 실행된 모든 변경의 감사 로그
 *   • 결재 매트릭스 — 사전 결재 체계 참고 (읽기 전용)
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

  /* ── Live-editable parameter values (세션 시뮬레이션) ──
   * 실제로는 ELLIS DB에 write되고 전 시스템 재설정 트리거.
   * 프로토타입에선 페이지 내 local state로 변경을 즉각 반영. */
  const [liveValues, setLiveValues] = useState<Record<string, string>>(
    Object.fromEntries(APPROVAL_ITEMS.map(i => [i.key, i.currentValue]))
  );
  const [sessionChanges, setSessionChanges] = useState<ParameterChange[]>([]);

  /* ── Edit Value dialog state ── */
  const [editItem, setEditItem] = useState<ApprovalItem | null>(null);
  const [editNewValue, setEditNewValue] = useState("");
  const [editApprovalRef, setEditApprovalRef] = useState("");
  const [editReason, setEditReason] = useState("");
  const [editConfirm, setEditConfirm] = useState(false);

  const openEditValue = (item: ApprovalItem) => {
    setEditItem(item);
    setEditNewValue(liveValues[item.key] || item.currentValue);
    setEditApprovalRef("");
    setEditReason("");
    setEditConfirm(false);
  };

  const submitEditValue = () => {
    if (!editItem) return;
    if (!editNewValue.trim()) {
      toast.error("새 값을 입력해주세요");
      return;
    }
    if (!editApprovalRef.trim()) {
      toast.error("결재 번호 참조는 필수입니다 (apr-xxx 형식)");
      return;
    }
    if (!/^apr-\d+$/.test(editApprovalRef.trim())) {
      toast.error("결재 번호 형식이 잘못되었습니다 (예: apr-010)");
      return;
    }
    if (!editConfirm) {
      toast.error("즉시 프로덕션 반영 확인 체크박스가 필요합니다");
      return;
    }
    const previousValue = liveValues[editItem.key] || editItem.currentValue;
    const now = new Date().toISOString();
    const change: ParameterChange = {
      id: `chg-local-${Date.now()}`,
      itemKey: editItem.key,
      appliedBy: user?.email || "unknown",
      appliedByName: user?.name || "Unknown",
      appliedAt: now,
      previousValue,
      newValue: editNewValue.trim(),
      approvalRef: editApprovalRef.trim(),
      reason: editReason.trim() || undefined,
    };
    setLiveValues(v => ({ ...v, [editItem.key]: editNewValue.trim() }));
    setSessionChanges(list => [change, ...list]);
    toast.success(`${editItem.label} 적용 완료`, {
      description: `${previousValue} → ${editNewValue.trim()} · 전 시스템에 즉시 반영`,
    });
    setEditItem(null);
  };

  /* 시드 변경 + 세션 변경 합친 전체 이력 */
  const combinedChanges = useMemo(
    () => [...sessionChanges, ...allParameterChanges()].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)),
    [sessionChanges]
  );

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
          ELS 리워드 경제 <strong>실제 적용 도구</strong>. 결재 완료된 변경을 시스템에 반영하며,
          모든 변경은 자동으로 감사 로그에 기록됩니다. 결재 워크플로우(서명·결정)는 별도 시스템에서
          처리되어 있어야 하며, 여기서는 <strong>결재 번호(apr-xxx)를 반드시 참조</strong>해야 합니다.
        </p>
      </div>

      {/* ── 중요 경고 배너 ── */}
      <Alert className="border-[#EF476F]/50" style={{ background: "#EF476F08" }}>
        <AlertTriangle className="h-4 w-4 text-[#EF476F]" />
        <AlertTitle className="text-sm text-[#EF476F]">
          ⚠ 실시간 프로덕션 반영 — 변경 전 반드시 결재 완료 확인
        </AlertTitle>
        <AlertDescription className="text-xs">
          이 페이지에서 수정한 값은 <strong>즉시 전 시스템에 반영</strong>됩니다 (고객 앱 포함).
          결재 문서(apr-xxx)가 모든 서명을 수집 완료했는지 반드시 확인 후 변경하세요.
          잘못된 변경은 전체 고객에게 영향을 미칠 수 있으며, 롤백은 별도 절차가 필요합니다.
        </AlertDescription>
      </Alert>

      {/* ── Critical KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">오늘 적용 변경</p>
          <p className="text-3xl font-bold mt-1" style={{ color: "#FF6000" }}>
            {combinedChanges.filter(c => c.appliedAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).length}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">건 (전체 {combinedChanges.length}건)</p>
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

      {/* ── Tabs ── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="parameters" className="gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            파라미터
            <span className="ml-1 text-[9px] bg-muted px-1 rounded-full">{APPROVAL_ITEMS.length}</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <History className="h-3.5 w-3.5" />
            변경 이력
            <span className="ml-1 text-[9px] bg-muted px-1 rounded-full">{combinedChanges.length}</span>
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
            {filteredItems.map(item => {
              const lastChange = [...sessionChanges, ...changesForItem(item.key)][0];
              const currentLive = liveValues[item.key] || item.currentValue;
              const isChanged = currentLive !== item.currentValue;
              return (
                <Card
                  key={item.key}
                  className={`p-4 flex flex-col ${isChanged ? "border-[#FF6000]" : ""}`}
                  style={isChanged ? { borderWidth: 2 } : undefined}
                >
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
                  <div
                    className="p-2 rounded-md text-xs mb-2"
                    style={{ background: isChanged ? "#FF600015" : undefined }}
                  >
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      현재 적용값
                      {isChanged && <span className="text-[8px] font-bold text-[#FF6000]">· 세션 내 변경</span>}
                    </p>
                    <p className="font-mono text-xs" style={isChanged ? { color: "#FF6000" } : undefined}>
                      {currentLive}
                    </p>
                  </div>
                  <div className="text-[10px] text-muted-foreground space-y-1 mb-2">
                    <p><strong>검토 주기:</strong> {item.reviewCadence}</p>
                    <p className="line-clamp-2"><strong>예산 영향:</strong> {item.budgetImpactHint}</p>
                  </div>
                  {lastChange && (
                    <div className="text-[9px] text-muted-foreground mb-2 pl-2 border-l-2 border-muted">
                      <strong>최근 변경:</strong> {lastChange.appliedAt.slice(0, 10)} by {lastChange.appliedByName.split(" ")[0]}
                      {" · "}<span className="text-[#FF6000] font-mono">{lastChange.approvalRef}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t">
                    <div className="flex items-center gap-1 flex-wrap" title="사전 결재가 필요한 체인">
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
                      className="h-6 text-[10px] gap-1 shrink-0 text-white"
                      style={{ background: "#FF6000" }}
                      onClick={() => openEditValue(item)}
                    >
                      <Edit className="h-3 w-3" />
                      값 수정
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════ HISTORY TAB ═══════════ */}
      {tab === "history" && (
        <div className="space-y-4">
          <Alert>
            <History className="h-4 w-4" />
            <AlertTitle className="text-sm">변경 이력 (감사 로그)</AlertTitle>
            <AlertDescription className="text-xs">
              이 페이지에서 실행된 모든 파라미터 변경이 영구 기록됩니다.
              각 변경은 사전 결재 문서(apr-xxx)를 참조하며, 변경자·시각·전후 값이 함께 저장됩니다.
              감사 감리 시 증빙 자료로 사용됩니다.
            </AlertDescription>
          </Alert>

          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">적용 시각</TableHead>
                  <TableHead>파라미터</TableHead>
                  <TableHead>변경 내역 (이전 → 이후)</TableHead>
                  <TableHead className="w-28">결재 참조</TableHead>
                  <TableHead className="w-36">적용자</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combinedChanges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                      변경 이력이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : combinedChanges.map(chg => {
                  const item = getApprovalItem(chg.itemKey);
                  return (
                    <TableRow key={chg.id}>
                      <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {chg.appliedAt.slice(0, 16).replace("T", " ")}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{item?.label || chg.itemKey}</p>
                          {item && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Badge variant="outline" className="text-[9px]">{item.category}</Badge>
                              <span
                                className="text-[9px] font-bold px-1 py-0.5 rounded"
                                style={{
                                  background: `${IMPACT_COLOR[item.impact]}22`,
                                  color: IMPACT_COLOR[item.impact],
                                }}
                              >
                                {item.impact}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-xs font-mono line-through text-muted-foreground">{chg.previousValue}</p>
                          <p className="text-xs font-mono" style={{ color: "#FF6000" }}>
                            ↳ {chg.newValue}
                          </p>
                          {chg.reason && (
                            <p className="text-[10px] text-muted-foreground italic">{chg.reason}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-mono" style={{ color: "#FF6000", borderColor: "#FF600055" }}>
                          {chg.approvalRef}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <p className="font-medium">{chg.appliedByName}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{chg.appliedBy}</p>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
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

      {/* ── Edit Value Dialog (직접 값 수정) ── */}
      <Dialog open={!!editItem} onOpenChange={(o) => { if (!o) setEditItem(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-4 w-4" style={{ color: "#FF6000" }} />
              값 수정 · {editItem?.label}
            </DialogTitle>
          </DialogHeader>

          {editItem && (
            <div className="space-y-3">
              {/* 상단 경고 — 이 변경은 실시간 반영 */}
              <div className="p-2.5 rounded-md border border-[#EF476F]/50" style={{ background: "#EF476F08" }}>
                <p className="text-[11px] text-[#EF476F] font-semibold flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  즉시 반영 경고
                </p>
                <p className="text-[10px] text-[#EF476F]/90 mt-0.5">
                  이 값은 저장 즉시 전 시스템(고객 앱 포함)에 반영됩니다.
                  반드시 해당 결재(apr-xxx)가 모든 서명 수집 완료된 상태여야 합니다.
                </p>
              </div>

              {/* Item context */}
              <div className="p-3 rounded-md bg-muted/40">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-[9px]">{editItem.category}</Badge>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                    style={{
                      background: `${IMPACT_COLOR[editItem.impact]}22`,
                      color: IMPACT_COLOR[editItem.impact],
                    }}
                  >
                    {editItem.impact}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-2">{editItem.description}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">현재 적용값</p>
                <p className="text-sm font-mono">{liveValues[editItem.key] || editItem.currentValue}</p>
              </div>

              {/* Pre-approval chain (read-only) — "이 사람들이 미리 사인했어야 함" */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  이 변경의 필수 사전 결재자 체인 (모두 서명 완료 확인)
                </p>
                <div className="flex items-center gap-1 flex-wrap">
                  {editItem.approvers.map((a, i) => (
                    <span key={a} className="flex items-center gap-0.5">
                      <span
                        className="text-[11px] font-bold px-2 py-1 rounded-md"
                        style={{
                          background: `${APPROVER_COLOR[a]}22`,
                          color: APPROVER_COLOR[a],
                          border: `1px solid ${APPROVER_COLOR[a]}55`,
                        }}
                      >
                        {a} ✓
                      </span>
                      {i < editItem.approvers.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                    </span>
                  ))}
                </div>
              </div>

              {/* New value */}
              <div>
                <label className="text-xs font-medium">새 값 <span className="text-destructive">*</span></label>
                <Input
                  className="mt-1 font-mono"
                  value={editNewValue}
                  onChange={e => setEditNewValue(e.target.value)}
                  placeholder="결재 승인된 정확한 값"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  형식은 현재값과 동일하게 (단위·표기 일치). 결재 문서와 정확히 동일해야 함.
                </p>
              </div>

              {/* Approval reference */}
              <div>
                <label className="text-xs font-medium">결재 문서 번호 <span className="text-destructive">*</span></label>
                <Input
                  className="mt-1 font-mono"
                  value={editApprovalRef}
                  onChange={e => setEditApprovalRef(e.target.value)}
                  placeholder="예: apr-010"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  사전에 모든 서명 수집을 완료한 결재 문서 번호를 입력.
                  감사 로그 영구 기록.
                </p>
              </div>

              {/* Reason (optional) */}
              <div>
                <label className="text-xs font-medium">적용 비고 (선택)</label>
                <Textarea
                  className="mt-1"
                  rows={2}
                  value={editReason}
                  onChange={e => setEditReason(e.target.value)}
                  placeholder="예: 결재 완료 후 즉시 반영. 이관 계획 동봉."
                />
              </div>

              {/* Final confirmation checkbox */}
              <label className="flex items-start gap-2 cursor-pointer p-2.5 rounded-md bg-amber-50 border border-amber-300">
                <input
                  type="checkbox"
                  checked={editConfirm}
                  onChange={e => setEditConfirm(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#EF476F]"
                />
                <span className="text-[11px] text-amber-900 leading-snug">
                  <strong>최종 확인</strong>: 위 결재 문서의 모든 서명을 확인했으며,
                  이 변경이 <strong>즉시 전 시스템에 반영</strong>됨을 이해했습니다.
                  본 수정 이력은 감사 로그에 <strong>영구 기록</strong>되며, 잘못된 변경에 대한
                  책임은 적용자({user?.name})에게 있음을 인지합니다.
                </span>
              </label>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>
              <XIcon className="h-3 w-3 mr-1" />
              취소
            </Button>
            <Button
              onClick={submitEditValue}
              disabled={!editConfirm || !editNewValue.trim() || !editApprovalRef.trim()}
              style={editConfirm && editNewValue.trim() && editApprovalRef.trim() ? { background: "#FF6000" } : undefined}
              className={editConfirm && editNewValue.trim() && editApprovalRef.trim() ? "text-white" : ""}
            >
              <Edit className="h-3 w-3 mr-1" />
              즉시 프로덕션 반영
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
