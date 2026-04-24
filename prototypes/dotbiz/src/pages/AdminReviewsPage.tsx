import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Clock, Flag,
  Building2, User as UserIcon, Image as ImageIcon, Search, Filter,
  Eye, ArrowRight, MessageSquare, X as XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { useScreenState } from "@/hooks/useScreenState";
import { useTabParam } from "@/hooks/useTabParam";
import { StateToolbar } from "@/components/StateToolbar";
import { useAuth } from "@/contexts/AuthContext";
import { hotels } from "@/mocks/hotels";
import {
  hotelReviews, reviewsByStatus, pendingReviews,
  autoModerateDecision, autoModerationStats, loadAutoModRules,
  type HotelReview, type ReviewStatus,
} from "@/mocks/reviews";
import { Zap, Bot, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

/* ──────────────────────────────────────────────────────────────────────
 * AdminReviewsPage — Content Manager moderation queue
 *
 * Actions:
 *   • Approve Pending → status=Approved, credit ELS reward, publish
 *   • Reject Pending → status=Rejected, record note, zero ELS
 *   • Takedown Approved → status=Rejected with reason (ELS clawback flag)
 *
 * Auto-flags are surfaced (from mocks/reviews autoFlagReview) so moderators
 * can triage fast. Real system combines ML signals + human review.
 * ────────────────────────────────────────────────────────────────────── */

export default function AdminReviewsPage() {
  const { state, setState } = useScreenState("success");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useTabParam("pending");

  /* ── 모든 hooks를 조건부 return 이전에 선언 (Rules of Hooks 준수) ── */
  /* Local state mutates for demo — real system writes to DB */
  const [reviews, setReviews] = useState<HotelReview[]>(hotelReviews);

  /* 자동 모더레이션 엔진 — localStorage에서 설정 로드 (ELS 경제 관리에서 저장된 값) */
  const [autoRules, setAutoRules] = useState(() => loadAutoModRules());
  const [autoModEnabled, setAutoModEnabled] = useState(autoRules.enabled);

  /* 다른 탭에서 설정 변경 시 storage 이벤트로 자동 반영 */
  useEffect(() => {
    const refresh = () => {
      const fresh = loadAutoModRules();
      setAutoRules(fresh);
      setAutoModEnabled(fresh.enabled);
    };
    window.addEventListener("storage", refresh);
    /* 같은 탭에서의 변경도 감지하기 위해 focus 이벤트로 재로드 */
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  /* 각 pending 리뷰의 자동 판정 (엔진 on 상태에서만) */
  const autoDecisions = useMemo(() => {
    const m = new Map<string, ReturnType<typeof autoModerateDecision>>();
    for (const r of reviews) {
      if (r.status === "Pending") {
        m.set(r.id, autoModerateDecision(r, autoRules));
      }
    }
    return m;
  }, [reviews, autoRules]);

  /* 통계: 전체 pending 중 자동 처리 가능 비율 */
  const autoStats = useMemo(
    () => autoModerationStats(reviews.filter(r => r.status === "Pending"), autoRules),
    [reviews, autoRules]
  );

  /* Review detail + action dialogs */
  const [detail, setDetail] = useState<HotelReview | null>(null);
  const [rejectOpen, setRejectOpen] = useState<HotelReview | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [takedownOpen, setTakedownOpen] = useState<HotelReview | null>(null);
  const [takedownNote, setTakedownNote] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const pending  = useMemo(() => reviews.filter(r => r.status === "Pending")
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)), [reviews]);
  const approved = useMemo(() => reviews.filter(r => r.status === "Approved")
    .sort((a, b) => (b.approvedAt || "").localeCompare(a.approvedAt || "")), [reviews]);
  const rejected = useMemo(() => reviews.filter(r => r.status === "Rejected")
    .sort((a, b) => (b.moderatedAt || "").localeCompare(a.moderatedAt || "")), [reviews]);

  const visible = useMemo(() => {
    const list = tab === "pending" ? pending : tab === "approved" ? approved : rejected;
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.body.toLowerCase().includes(q) ||
      r.reviewerName.toLowerCase().includes(q) ||
      r.reviewerCompany.toLowerCase().includes(q) ||
      (hotels.find(h => h.id === r.hotelId)?.name || "").toLowerCase().includes(q)
    );
  }, [tab, pending, approved, rejected, search]);

  /** 자동 판정대로 일괄 처리 — Auto-Approve는 Approved로, Auto-Reject는 Rejected로 */
  const applyAutoDecisions = () => {
    const now = new Date().toISOString();
    let approved = 0;
    let rejected = 0;
    setReviews(list => list.map(r => {
      if (r.status !== "Pending") return r;
      const dec = autoDecisions.get(r.id);
      if (!dec) return r;
      if (dec.decision === "AutoApprove") {
        approved++;
        return {
          ...r,
          status: "Approved",
          approvedAt: now,
          moderatedBy: "system-auto",
          moderatedAt: now,
          moderationNote: `자동 승인 (신뢰도 ${Math.round(dec.confidence * 100)}%) · ${dec.reasons.join(", ")}`,
        };
      }
      if (dec.decision === "AutoReject") {
        rejected++;
        return {
          ...r,
          status: "Rejected",
          moderatedBy: "system-auto",
          moderatedAt: now,
          moderationNote: `자동 반려 (신뢰도 ${Math.round(dec.confidence * 100)}%) · ${dec.reasons.join(", ")}`,
          elsAwarded: 0,
        };
      }
      return r;
    }));
    if (approved + rejected === 0) {
      toast.info("자동 처리할 리뷰가 없습니다 (모두 수동 검토 필요)");
    } else {
      toast.success(`자동 처리 완료: ${approved}건 승인 + ${rejected}건 반려`, {
        description: "경계선 케이스는 Manual Review로 남겨둠",
      });
    }
  };

  const approveReview = (r: HotelReview) => {
    const now = new Date().toISOString();
    setReviews(list => list.map(x => x.id === r.id ? {
      ...x,
      status: "Approved",
      approvedAt: now,
      moderatedBy: user?.email,
      moderatedAt: now,
      moderationNote: x.moderationNote || "Approved — meets quality guidelines.",
    } : x));
    setDetail(null);
    toast.success(`Approved: ${r.title.slice(0, 40)}…`, {
      description: `+${r.elsAwarded} ELS credited to ${r.reviewerName}. Review is now live.`,
    });
  };

  const rejectReview = (r: HotelReview, note: string) => {
    if (!note.trim()) {
      toast.error("Reject reason is required (sent to reviewer).");
      return;
    }
    const now = new Date().toISOString();
    setReviews(list => list.map(x => x.id === r.id ? {
      ...x,
      status: "Rejected",
      moderatedBy: user?.email,
      moderatedAt: now,
      moderationNote: note,
      elsAwarded: 0,
    } : x));
    setRejectOpen(null);
    setRejectNote("");
    setDetail(null);
    toast.info(`Rejected: ${r.title.slice(0, 40)}…`, {
      description: `Reviewer notified with reason. No ELS credited.`,
    });
  };

  const takedownReview = (r: HotelReview, note: string) => {
    if (!note.trim()) {
      toast.error("Takedown reason is required (audit trail + reviewer notification).");
      return;
    }
    const now = new Date().toISOString();
    setReviews(list => list.map(x => x.id === r.id ? {
      ...x,
      status: "Rejected",
      moderatedBy: user?.email,
      moderatedAt: now,
      moderationNote: `[TAKEDOWN] ${note}`,
    } : x));
    setTakedownOpen(null);
    setTakedownNote("");
    setDetail(null);
    toast.warning(`Takedown: ${r.title.slice(0, 40)}…`, {
      description: `Review removed from B2B and B2C. ELS clawback flagged (${r.elsAwarded} ELS).`,
    });
  };

  /* ── Access guard (모든 hooks 선언 이후) ── */
  if (!user?.isInternal) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <ShieldCheck className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-lg font-bold">접근 권한 없음</h2>
          <p className="text-sm text-muted-foreground mt-2">
            리뷰 모더레이션은 <strong>OhMyHotel Content Managers (ELLIS 내부 스태프)</strong>가 담당합니다.
            고객 계정은 접근할 수 없습니다.
          </p>
          <Button className="mt-4" onClick={() => navigate("/app/dashboard")}>
            대시보드로 돌아가기
          </Button>
        </Card>
        <StateToolbar state={state} setState={setState} />
      </div>
    );
  }

  if (state === "loading") return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-4">
      <div className="h-8 w-64 bg-muted animate-pulse rounded" />
      <div className="h-96 bg-muted animate-pulse rounded" />
      <StateToolbar state={state} setState={setState} />
    </div>
  );

  const hotelFor = (id: string) => hotels.find(h => h.id === id);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" style={{ color: "#FF6000" }} />
          <h1 className="text-2xl font-bold">Review Moderation</h1>
          <Badge variant="outline" className="text-[10px] ml-2" style={{ borderColor: "#FF6000", color: "#FF6000" }}>
            Content Manager · ELLIS preview
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          OP 호텔 리뷰의 품질 검수 · 승인/거절 · 사후 takedown. 승인된 리뷰만 B2B·B2C에 노출됩니다.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">검수 대기 (Pending)</p>
          <p className="text-3xl font-bold mt-1" style={{ color: pending.length > 0 ? "#eab308" : "#64748b" }}>
            {pending.length}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            자동 처리 가능: <strong>{autoStats.autoApprove + autoStats.autoReject}건</strong>
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">자동 처리율</p>
          <p className="text-3xl font-bold mt-1" style={{ color: "#FF6000" }}>{autoStats.autoHandledPct}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {autoStats.manualReview}건만 사람 검토 필요
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">누적 승인</p>
          <p className="text-3xl font-bold mt-1 text-green-600">{approved.length}</p>
          <p className="text-[10px] text-muted-foreground mt-1">B2B + B2C 노출</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">평균 응답 시간</p>
          <p className="text-3xl font-bold mt-1">~4h</p>
          <p className="text-[10px] text-muted-foreground mt-1">목표: &lt; 24h</p>
        </Card>
      </div>

      {/* 자동 모더레이션 컨트롤 배너 */}
      <Card className="p-4" style={{ background: "linear-gradient(90deg, #FF600010, transparent)", borderColor: "#FF600055" }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center"
              style={{ background: autoModEnabled ? "#FF6000" : "#64748b" }}
            >
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">자동 모더레이션 엔진</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${autoModEnabled ? "text-white" : "text-muted-foreground border"}`}
                  style={autoModEnabled ? { background: "#06D6A0" } : undefined}
                >
                  {autoModEnabled ? "● 작동 중" : "● OFF"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                자동 판정: 승인 <strong className="text-green-600">{autoStats.autoApprove}</strong> ·
                반려 <strong style={{ color: "#EF476F" }}>{autoStats.autoReject}</strong> ·
                사람 검토 <strong className="text-amber-600">{autoStats.manualReview}</strong>
                {" · "}약 <strong style={{ color: "#FF6000" }}>{autoStats.autoHandledPct}%</strong> 자동 처리 가능
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                현재 규칙: 본문 {autoRules.autoApproveMinBody}자+ · 팁 {autoRules.autoApproveMinTips}개+
                {autoRules.autoApproveRequireVerified && " · 투숙 검증"}
                · 스팸 플래그 {autoRules.autoRejectSpamFlagThreshold}개+ 반려
                {autoRules.strictMode && " · Strict"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/app/admin/els-economics?tab=policy")}
              title="ELS 경제 관리 → 정책 탭에서 자동 모더레이션 규칙 편집"
              className="h-7 text-[11px]"
            >
              <SettingsIcon className="h-3 w-3 mr-1" />
              규칙 설정
            </Button>
            <button
              onClick={() => setAutoModEnabled(!autoModEnabled)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                autoModEnabled ? "bg-[#FF6000]" : "bg-muted"
              }`}
              title="세션 내 임시 on/off. 영구 변경은 규칙 설정에서."
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                autoModEnabled ? "translate-x-8" : "translate-x-1"
              }`} />
            </button>
            {autoModEnabled && (autoStats.autoApprove + autoStats.autoReject) > 0 && (
              <Button
                size="sm"
                onClick={applyAutoDecisions}
                style={{ background: "#FF6000" }}
                className="text-white"
              >
                <Zap className="h-3 w-3 mr-1" />
                자동 판정 일괄 적용 ({autoStats.autoApprove + autoStats.autoReject}건)
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* High-volume pending warning */}
      {pending.length >= 3 && autoStats.manualReview >= 3 && (
        <Alert className="border-amber-500/50" style={{ background: "#fef3c7" }}>
          <AlertTriangle className="h-4 w-4 text-amber-700" />
          <AlertTitle className="text-sm text-amber-900">
            {autoStats.manualReview}건 사람 검수 누적 — SLA 초과 우려
          </AlertTitle>
          <AlertDescription className="text-xs text-amber-900/90">
            자동 엔진이 처리 못한 경계선 케이스. OP는 승인 전까지 ELS 받지 못하니 지연 시 engagement 감소.
            24시간 내 처리 권장.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Pending
            {pending.length > 0 && (
              <span className="ml-1 text-[9px] px-1 rounded-full text-white" style={{ background: "#eab308" }}>
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approved <span className="ml-1 text-[9px] bg-muted px-1 rounded-full">{approved.length}</span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1.5">
            <XCircle className="h-3.5 w-3.5" />
            Rejected <span className="ml-1 text-[9px] bg-muted px-1 rounded-full">{rejected.length}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by hotel, reviewer, title, or body…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Review list */}
      {visible.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          {tab === "pending" ? "✨ No pending reviews — the queue is clean!" : `No ${tab} reviews.`}
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map(r => {
            const hotel = hotelFor(r.hotelId);
            const statusColor =
              r.status === "Pending" ? "#eab308" :
              r.status === "Approved" ? "#06D6A0" :
              "#EF476F";
            return (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                      style={{ background: "#FF600022", color: "#FF6000" }}
                    >
                      {r.reviewerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <Badge variant="outline" className="text-[10px]" style={{ color: statusColor, borderColor: statusColor }}>
                          {r.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">#{r.id}</span>
                        {!r.verifiedStay && (
                          <Badge variant="outline" className="text-[9px] text-amber-700 border-amber-300">
                            <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                            Unverified stay
                          </Badge>
                        )}
                        {r.photos && r.photos.length > 0 && (
                          <Badge variant="outline" className="text-[9px]">
                            <ImageIcon className="h-2.5 w-2.5 mr-0.5" />
                            {r.photos.length} photos
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm">{r.title}</h3>
                      <p className="text-[11px] text-muted-foreground">
                        {r.reviewerName} · {r.reviewerCompany} · {r.reviewerCountry} ·{" "}
                        <Building2 className="inline h-3 w-3" />{" "}
                        <button
                          className="hover:underline"
                          onClick={() => navigate(`/app/hotel/${r.hotelId}`)}
                        >
                          {hotel?.name || "Unknown hotel"}
                        </button>
                        {" · "}Submitted {r.submittedAt.slice(0, 16)}
                      </p>

                      {/* Rating + photos preview */}
                      <div className="flex items-center gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star
                            key={n}
                            className="h-3.5 w-3.5"
                            style={{ fill: n <= r.rating ? "#FF6000" : "transparent", color: "#FF6000" }}
                          />
                        ))}
                        <span className="text-[10px] text-muted-foreground">· {r.rating}/5</span>
                      </div>

                      {/* Body preview */}
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{r.body}</p>

                      {/* ── 자동 모더레이션 판정 (Pending 상태에서만) ── */}
                      {r.status === "Pending" && autoModEnabled && autoDecisions.get(r.id) && (() => {
                        const dec = autoDecisions.get(r.id)!;
                        const isApprove = dec.decision === "AutoApprove";
                        const isReject = dec.decision === "AutoReject";
                        const color = isApprove ? "#06D6A0" : isReject ? "#EF476F" : "#eab308";
                        const bg = isApprove ? "#d1fae5" : isReject ? "#fee2e2" : "#fef3c7";
                        const label = isApprove ? "자동 승인 권장" : isReject ? "자동 반려 권장" : "사람 검토 필요";
                        return (
                          <div className="mt-2 p-2 rounded-md border" style={{ background: bg, borderColor: color }}>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Bot className="h-3.5 w-3.5" style={{ color }} />
                              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
                                {label}
                              </span>
                              <span className="text-[9px] text-muted-foreground">
                                신뢰도 <strong>{Math.round(dec.confidence * 100)}%</strong>
                              </span>
                            </div>
                            <p className="text-[10px] mt-1" style={{ color }}>
                              {dec.reasons.join(" · ")}
                            </p>
                            {dec.failedRules.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap mt-1">
                                {dec.failedRules.map((f, i) => (
                                  <span
                                    key={i}
                                    className="text-[9px] px-1.5 py-0.5 rounded bg-white/60 border border-current/20"
                                    style={{ color }}
                                  >
                                    ✗ {f}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Auto-flags (legacy — kept for already-moderated items) */}
                      {r.status !== "Pending" && r.autoFlags && r.autoFlags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap mt-2">
                          <Flag className="h-3 w-3 text-amber-600" />
                          {r.autoFlags.map((f, i) => (
                            <span
                              key={i}
                              className="text-[9px] px-1.5 py-0.5 rounded"
                              style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Moderation note (for Approved/Rejected) */}
                      {r.moderationNote && (
                        <p className="text-[10px] text-muted-foreground mt-2 pl-2 border-l-2 border-muted italic">
                          {r.moderatedBy === "system-auto" ? (
                            <><Bot className="h-3 w-3 inline mr-0.5" style={{ color: "#FF6000" }} /><strong className="text-[#FF6000]">자동 엔진:</strong></>
                          ) : (
                            <strong>모더레이터:</strong>
                          )}{" "}
                          {r.moderationNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px]"
                      onClick={() => setDetail(r)}
                    >
                      <Eye className="h-3 w-3 mr-1" />Review
                    </Button>
                    {r.status === "Pending" && (
                      <>
                        <Button
                          size="sm"
                          className="h-7 text-[11px] text-white"
                          style={{ background: "#06D6A0" }}
                          onClick={() => approveReview(r)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />Approve (+{r.elsAwarded})
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] border-[#EF476F] text-[#EF476F] hover:bg-[#EF476F]/10"
                          onClick={() => { setRejectOpen(r); setRejectNote(""); }}
                        >
                          <XCircle className="h-3 w-3 mr-1" />Reject
                        </Button>
                      </>
                    )}
                    {r.status === "Approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] border-amber-500 text-amber-700 hover:bg-amber-50"
                        onClick={() => { setTakedownOpen(r); setTakedownNote(""); }}
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />Takedown
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Review Detail Dialog ── */}
      <Dialog open={!!detail} onOpenChange={(o) => { if (!o) setDetail(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" style={{ color: "#FF6000" }} />
              Review Detail · {detail?.id}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3">
              <div className="p-3 bg-muted/40 rounded-md">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold">{detail.reviewerName}</span>
                  <span className="text-[11px] text-muted-foreground">·</span>
                  <span className="text-[11px] text-muted-foreground">{detail.reviewerCompany}</span>
                  <span className="text-[11px] text-muted-foreground">·</span>
                  <span className="text-[11px]">{detail.reviewerCountry}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Hotel: <strong>{hotelFor(detail.hotelId)?.name}</strong> ·{" "}
                  {detail.verifiedStay ? `Stayed ${detail.stayedAt}` : "Unverified stay"} ·{" "}
                  Submitted {detail.submittedAt.slice(0, 16)}
                </p>
              </div>

              {/* Full rating + title + body */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star
                      key={n}
                      className="h-5 w-5"
                      style={{ fill: n <= detail.rating ? "#FF6000" : "transparent", color: "#FF6000" }}
                    />
                  ))}
                  <span className="text-sm font-semibold">· {detail.rating}/5</span>
                </div>
                <h4 className="font-bold text-base">{detail.title}</h4>
                <p className="text-sm mt-2 whitespace-pre-line">{detail.body}</p>
              </div>

              {/* Tips */}
              {detail.tips.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Tips ({detail.tips.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {detail.tips.map((tip, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-1 rounded bg-blue-50 text-blue-900 border border-blue-200"
                      >
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos */}
              {detail.photos && detail.photos.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Photos ({detail.photos.length})</p>
                  <div className="grid grid-cols-4 gap-2">
                    {detail.photos.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setLightbox(src)}
                        className="aspect-[4/3] rounded border overflow-hidden hover:ring-2 hover:ring-[#FF6000]"
                      >
                        <img src={src} className="w-full h-full object-cover" alt={`${i + 1}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Auto-flags */}
              {detail.autoFlags && detail.autoFlags.length > 0 && (
                <div className="p-2.5 rounded border border-amber-300 bg-amber-50">
                  <p className="text-[10px] uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1">
                    <Flag className="h-3 w-3" />Auto-detected flags
                  </p>
                  <ul className="text-[11px] text-amber-900 space-y-0.5">
                    {detail.autoFlags.map((f, i) => <li key={i}>• {f}</li>)}
                  </ul>
                </div>
              )}

              {/* Consent status */}
              <div className="p-2.5 rounded bg-blue-50 text-[11px] text-blue-900">
                <strong>B2C Syndication consent</strong>: {detail.syndicationConsent ? `✓ Consented at ${detail.consentedAt?.slice(0, 16)}` : "✗ Not consented (B2B only)"}
              </div>

              {/* Moderation history */}
              {detail.moderatedBy && (
                <div className="p-2.5 rounded bg-muted text-[11px]">
                  <p><strong>Moderated by</strong>: {detail.moderatedBy} at {detail.moderatedAt?.slice(0, 16)}</p>
                  {detail.moderationNote && <p className="mt-1 italic text-muted-foreground">"{detail.moderationNote}"</p>}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetail(null)}>Close</Button>
            {detail?.status === "Pending" && (
              <>
                <Button
                  variant="outline"
                  className="border-[#EF476F] text-[#EF476F]"
                  onClick={() => { setRejectOpen(detail); setRejectNote(""); }}
                >
                  <XCircle className="h-3 w-3 mr-1" />Reject
                </Button>
                <Button
                  className="text-white"
                  style={{ background: "#06D6A0" }}
                  onClick={() => approveReview(detail)}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Approve & credit {detail.elsAwarded} ELS
                </Button>
              </>
            )}
            {detail?.status === "Approved" && (
              <Button
                variant="outline"
                className="border-amber-500 text-amber-700"
                onClick={() => { setTakedownOpen(detail); setTakedownNote(""); }}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />Takedown
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject Dialog ── */}
      <Dialog open={!!rejectOpen} onOpenChange={(o) => { if (!o) setRejectOpen(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-[#EF476F]" />
              Reject Review
            </DialogTitle>
          </DialogHeader>
          {rejectOpen && (
            <div className="space-y-3">
              <div className="p-2.5 rounded bg-muted text-xs">
                <p className="font-semibold">{rejectOpen.title}</p>
                <p className="text-muted-foreground">{rejectOpen.reviewerName} · {rejectOpen.reviewerCompany}</p>
              </div>
              <div>
                <label className="text-xs font-medium">
                  Rejection reason <span className="text-destructive">*</span>
                </label>
                <Textarea
                  className="mt-1"
                  rows={4}
                  placeholder="e.g. Unverified stay + complaint stems from policy compliance (upgrade refusal), not hotel quality. OP advised to resubmit with booking record."
                  value={rejectNote}
                  onChange={e => setRejectNote(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  이 사유는 작성자에게 이메일로 전송되고 감사 로그에 영구 보존됩니다.
                </p>
              </div>
              <div className="p-2.5 rounded bg-[#EF476F]/10 text-[11px] text-[#991b1b]">
                <strong>Impact</strong>: No ELS credit (0/{rejectOpen.elsAwarded}).
                Reviewer can resubmit a revised version after addressing the reason.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(null)}>Cancel</Button>
            <Button
              onClick={() => rejectOpen && rejectReview(rejectOpen, rejectNote)}
              disabled={!rejectNote.trim()}
              className="text-white"
              style={rejectNote.trim() ? { background: "#EF476F" } : undefined}
            >
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Takedown Dialog ── */}
      <Dialog open={!!takedownOpen} onOpenChange={(o) => { if (!o) setTakedownOpen(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Takedown Approved Review
            </DialogTitle>
          </DialogHeader>
          {takedownOpen && (
            <div className="space-y-3">
              <div className="p-2.5 rounded bg-muted text-xs">
                <p className="font-semibold">{takedownOpen.title}</p>
                <p className="text-muted-foreground">
                  Published {takedownOpen.approvedAt?.slice(0, 10)} · {takedownOpen.helpfulVotes} helpful votes
                </p>
              </div>
              <div>
                <label className="text-xs font-medium">
                  Takedown reason <span className="text-destructive">*</span>
                </label>
                <Textarea
                  className="mt-1"
                  rows={4}
                  placeholder="e.g. Hotel disputed factual claim about room conditions; evidence reviewed; original claim retracted per legal review."
                  value={takedownNote}
                  onChange={e => setTakedownNote(e.target.value)}
                />
              </div>
              <div className="p-2.5 rounded bg-amber-50 text-[11px] text-amber-900">
                <strong>Effect</strong>: Review immediately removed from B2B display AND B2C syndication pipeline.
                ELS clawback ({takedownOpen.elsAwarded} ELS) flagged for billing adjustment.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTakedownOpen(null)}>Cancel</Button>
            <Button
              onClick={() => takedownOpen && takedownReview(takedownOpen, takedownNote)}
              disabled={!takedownNote.trim()}
              className="text-white"
              style={takedownNote.trim() ? { background: "#eab308" } : undefined}
            >
              Confirm Takedown
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo lightbox */}
      <Dialog open={!!lightbox} onOpenChange={(o) => { if (!o) setLightbox(null); }}>
        <DialogContent className="max-w-3xl p-2 bg-black border-black">
          {lightbox && <img src={lightbox} className="w-full h-auto max-h-[80vh] object-contain" alt="preview" />}
        </DialogContent>
      </Dialog>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
