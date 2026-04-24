import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Shield, AlertTriangle, ArrowRight, Edit, History, Save, Plus, Trash2,
  Coins, TrendingUp, Award, Settings, ShieldCheck, Package, ExternalLink,
  DollarSign, Percent, Calendar, Users, X as XIcon, CheckCircle2, XCircle,
} from "lucide-react";

/* Inline mini-icons for Auto-mod section */
const CheckIcon = () => <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#06D6A0" }} />;
const XIcon2 = () => <XCircle className="h-3.5 w-3.5" style={{ color: "#EF476F" }} />;
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useScreenState } from "@/hooks/useScreenState";
import { useTabParam } from "@/hooks/useTabParam";
import { StateToolbar } from "@/components/StateToolbar";
import { useAuth } from "@/contexts/AuthContext";
import { hotels } from "@/mocks/hotels";
import {
  IMPACT_COLOR,
  allParameterChanges,
  type ParameterChange,
} from "@/mocks/approvals";
import {
  HOTEL_POINTS_BOOSTS,
  TIERS,
  STAMP_BONUS_BY_RARITY,
  type HotelPointsBoost,
  type StampRarity,
} from "@/mocks/rewards";
import {
  loadAutoModRules, saveAutoModRules, DEFAULT_AUTO_MOD_RULES,
  type AutoModerationRules,
} from "@/mocks/reviews";
import { Bot } from "lucide-react";
import { toast } from "sonner";

/* ──────────────────────────────────────────────────────────────────────
 * AdminEconomicsPage — 실집행 어드민 도구
 *
 * 각 파라미터는 데이터 타입에 맞는 전용 편집 UI 제공:
 *   • 단일 숫자 → Slider + Number input (예: 적립률, 만료 개월)
 *   • 통화 → ₩ 표기 Number input (예: 예산 한도)
 *   • 불리언 → Toggle switch (예: ELS 양도 가능)
 *   • 배수 세트 → 5개 inline input (예: 티어 배수)
 *   • 객체 배열 → 편집 가능한 테이블 (예: 호텔 프로모)
 *   • 바로가기 → 다른 어드민 페이지 링크 (예: 리뷰 모더레이션)
 *
 * 결재는 이 페이지 외부 시스템(전자결재·Slack)에서 처리되고,
 * 여기서는 승인된 값을 실제로 **시스템에 입력**하는 도구.
 * ────────────────────────────────────────────────────────────────────── */

/* 편집 가능한 라이브 설정 — 실제로는 ELLIS DB에 write */
interface LiveSettings {
  elsBookingEarnRate: number;
  elsUsdPeg: number;
  rewardPoolBudgetKrw: number | null;    /* null = uncapped */
  tierMultipliers: [number, number, number, number, number];
  tierThresholds: [number, number, number, number];  /* Silver/Gold/Plat/Diamond */
  hotelBoosts: HotelPointsBoost[];
  promoMaxMultiplier: number;
  stampBonuses: Record<StampRarity, number>;
  reviewRewardFormula: {
    base: number;
    quality: number;
    photo: number;
    first: number;
    monthlyCap: number;
  };
  elsNonTransferable: boolean;
  elsExpiryMonths: number;
}

export default function AdminEconomicsPage() {
  const { state, setState } = useScreenState("success");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useTabParam("economics");

  /* ── 모든 hooks를 조건부 return 이전에 선언 (Rules of Hooks 준수) ── */
  /* Live editable settings */
  const [settings, setSettings] = useState<LiveSettings>({
    elsBookingEarnRate: 0.01,
    elsUsdPeg: 1.0,
    rewardPoolBudgetKrw: null,
    tierMultipliers: [TIERS[0].multiplier, TIERS[1].multiplier, TIERS[2].multiplier, TIERS[3].multiplier, TIERS[4].multiplier] as [number, number, number, number, number],
    tierThresholds: [TIERS[1].minBookings, TIERS[2].minBookings, TIERS[3].minBookings, TIERS[4].minBookings] as [number, number, number, number],
    hotelBoosts: HOTEL_POINTS_BOOSTS.map(b => ({ ...b })),
    promoMaxMultiplier: 1.25,
    stampBonuses: { ...STAMP_BONUS_BY_RARITY },
    reviewRewardFormula: { base: 3, quality: 2, photo: 2, first: 5, monthlyCap: 5 },
    elsNonTransferable: true,
    elsExpiryMonths: 24,
  });

  const [sessionChanges, setSessionChanges] = useState<ParameterChange[]>([]);

  /* 세션 변경 기록 */
  const recordChange = (itemKey: string, label: string, before: string, after: string) => {
    const now = new Date().toISOString();
    setSessionChanges(list => [{
      id: `chg-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      itemKey,
      appliedBy: user?.email || "unknown",
      appliedByName: user?.name || "Unknown",
      appliedAt: now,
      previousValue: before,
      newValue: after,
      reason: "어드민 직접 수정",
    }, ...list]);
    toast.success(`${label} 변경 적용`, {
      description: `${before} → ${after} · 전 시스템에 즉시 반영`,
    });
  };

  const combinedChanges = useMemo(
    () => [...sessionChanges, ...allParameterChanges()].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)),
    [sessionChanges]
  );

  const todayChanges = combinedChanges.filter(
    c => c.appliedAt.slice(0, 10) === new Date().toISOString().slice(0, 10)
  ).length;

  /* ── Access guard (모든 hooks 선언 이후) ── */
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

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" style={{ color: "#FF6000" }} />
          <h1 className="text-2xl font-bold">ELS 경제 관리</h1>
          <Badge variant="outline" className="text-[10px] ml-2" style={{ borderColor: "#FF6000", color: "#FF6000" }}>
            ELLIS 내부 어드민
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          ELS 경제 시스템의 모든 설정을 직접 편집. 저장 즉시 전 시스템에 반영되며
          모든 변경은 자동으로 감사 로그에 기록됩니다.
        </p>
      </div>

      {/* Warning banner */}
      <Alert className="border-[#EF476F]/50" style={{ background: "#EF476F08" }}>
        <AlertTriangle className="h-4 w-4 text-[#EF476F]" />
        <AlertTitle className="text-sm text-[#EF476F]">⚠ 실시간 프로덕션 반영</AlertTitle>
        <AlertDescription className="text-xs">
          모든 변경은 <strong>즉시 고객 앱에 반영</strong>됩니다. 사전 결재가 완료된 값만 입력하세요.
          변경 이력은 <strong>영구 보존</strong>되며 감사 감리 시 증빙 자료로 사용됩니다.
        </AlertDescription>
      </Alert>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">오늘 적용 변경</p>
          <p className="text-3xl font-bold mt-1" style={{ color: "#FF6000" }}>{todayChanges}</p>
          <p className="text-[10px] text-muted-foreground mt-1">건 (누적 {combinedChanges.length})</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">예약 적립률</p>
          <p className="text-3xl font-bold mt-1">{settings.elsBookingEarnRate}</p>
          <p className="text-[10px] text-muted-foreground mt-1">ELS / $1 ($100 = {Math.round(100 * settings.elsBookingEarnRate * 100) / 100})</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">활성 프로모 호텔</p>
          <p className="text-3xl font-bold mt-1">{settings.hotelBoosts.length}</p>
          <p className="text-[10px] text-muted-foreground mt-1">개 호텔 부스트 적용 중</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">월 예산 한도</p>
          <p className="text-3xl font-bold mt-1" style={{ color: settings.rewardPoolBudgetKrw === null ? "#EF476F" : "inherit" }}>
            {settings.rewardPoolBudgetKrw === null ? "—" : `₩${(settings.rewardPoolBudgetKrw / 1_000_000).toFixed(0)}M`}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {settings.rewardPoolBudgetKrw === null ? "미설정 (필수)" : "월간 상한"}
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="economics" className="gap-1.5">
            <Coins className="h-3.5 w-3.5" />경제 정책
          </TabsTrigger>
          <TabsTrigger value="promotions" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />프로모션
            <span className="ml-1 text-[9px] bg-muted px-1 rounded-full">{settings.hotelBoosts.length}</span>
          </TabsTrigger>
          <TabsTrigger value="gamification" className="gap-1.5">
            <Award className="h-3.5 w-3.5" />게임화
          </TabsTrigger>
          <TabsTrigger value="policy" className="gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />정책
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <History className="h-3.5 w-3.5" />변경 이력
            <span className="ml-1 text-[9px] bg-muted px-1 rounded-full">{combinedChanges.length}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ═══════════ 경제 정책 탭 ═══════════ */}
      {tab === "economics" && (
        <EconomicsTab settings={settings} setSettings={setSettings} recordChange={recordChange} />
      )}

      {/* ═══════════ 프로모션 탭 ═══════════ */}
      {tab === "promotions" && (
        <PromotionsTab settings={settings} setSettings={setSettings} recordChange={recordChange} />
      )}

      {/* ═══════════ 게임화 탭 ═══════════ */}
      {tab === "gamification" && (
        <GamificationTab settings={settings} setSettings={setSettings} recordChange={recordChange} />
      )}

      {/* ═══════════ 정책 탭 ═══════════ */}
      {tab === "policy" && (
        <PolicyTab settings={settings} setSettings={setSettings} recordChange={recordChange} navigate={navigate} />
      )}

      {/* ═══════════ 변경 이력 탭 ═══════════ */}
      {tab === "history" && <HistoryTab changes={combinedChanges} />}

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}

/* ═════════════════════════════════════════════════
 * 경제 정책 탭
 * ═════════════════════════════════════════════════ */
function EconomicsTab({
  settings, setSettings, recordChange,
}: {
  settings: LiveSettings;
  setSettings: React.Dispatch<React.SetStateAction<LiveSettings>>;
  recordChange: (key: string, label: string, before: string, after: string) => void;
}) {
  /* 로컬 편집 버퍼 */
  const [earnRate, setEarnRate] = useState(settings.elsBookingEarnRate);
  const [usdPeg, setUsdPeg] = useState(settings.elsUsdPeg);
  const [budget, setBudget] = useState<number | null>(settings.rewardPoolBudgetKrw);
  const [tierMults, setTierMults] = useState(settings.tierMultipliers);
  const [tierThresh, setTierThresh] = useState(settings.tierThresholds);
  const [expiry, setExpiry] = useState(settings.elsExpiryMonths);

  const saveEarnRate = () => {
    if (earnRate === settings.elsBookingEarnRate) return;
    recordChange("ELS_BOOKING_EARN_RATE", "ELS 예약 적립률", `${settings.elsBookingEarnRate} ELS/$1`, `${earnRate} ELS/$1`);
    setSettings(s => ({ ...s, elsBookingEarnRate: earnRate }));
  };
  const savePeg = () => {
    if (usdPeg === settings.elsUsdPeg) return;
    recordChange("ELS_USD_PEG", "ELS ↔ USD 페그", `1 ELS = ${settings.elsUsdPeg} USD`, `1 ELS = ${usdPeg} USD`);
    setSettings(s => ({ ...s, elsUsdPeg: usdPeg }));
  };
  const saveBudget = () => {
    if (budget === settings.rewardPoolBudgetKrw) return;
    const before = settings.rewardPoolBudgetKrw === null ? "미설정" : `₩${settings.rewardPoolBudgetKrw.toLocaleString()}`;
    const after = budget === null ? "미설정" : `₩${budget.toLocaleString()}`;
    recordChange("REWARD_POOL_BUDGET", "월 예산 한도", before, after);
    setSettings(s => ({ ...s, rewardPoolBudgetKrw: budget }));
  };
  const saveTiers = () => {
    const sameMults = tierMults.every((m, i) => m === settings.tierMultipliers[i]);
    const sameThresh = tierThresh.every((t, i) => t === settings.tierThresholds[i]);
    if (sameMults && sameThresh) return;
    const beforeMults = settings.tierMultipliers.join(" / ");
    const afterMults = tierMults.join(" / ");
    const beforeThresh = settings.tierThresholds.join(" / ");
    const afterThresh = tierThresh.join(" / ");
    if (!sameMults) recordChange("TIER_MULTIPLIERS", "티어 배수", beforeMults, afterMults);
    if (!sameThresh) recordChange("TIER_THRESHOLDS", "티어 임계값", beforeThresh, afterThresh);
    setSettings(s => ({ ...s, tierMultipliers: tierMults, tierThresholds: tierThresh }));
  };
  const saveExpiry = () => {
    if (expiry === settings.elsExpiryMonths) return;
    recordChange("ELS_EXPIRY_POLICY", "ELS 만료 기간", `${settings.elsExpiryMonths}개월`, `${expiry}개월`);
    setSettings(s => ({ ...s, elsExpiryMonths: expiry }));
  };

  return (
    <div className="space-y-4">
      {/* 예약 적립률 */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4" style={{ color: "#FF6000" }} />
              <h3 className="font-semibold">ELS 예약 적립률</h3>
              <Badge className="text-[9px] text-white" style={{ background: IMPACT_COLOR.Critical }}>CRITICAL</Badge>
              <Badge variant="outline" className="text-[9px]">CFO → CEO 결재</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              객실가 $1당 지급 ELS. 리워드 풀 전체 비용의 핵심 레버.
            </p>
          </div>
          <Button
            size="sm"
            onClick={saveEarnRate}
            disabled={earnRate === settings.elsBookingEarnRate}
            style={earnRate !== settings.elsBookingEarnRate ? { background: "#FF6000" } : undefined}
            className={earnRate !== settings.elsBookingEarnRate ? "text-white" : ""}
          >
            <Save className="h-3 w-3 mr-1" />저장
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs font-medium">적립률 (ELS / $1)</label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                step="0.001"
                min="0.001"
                max="0.1"
                value={earnRate}
                onChange={e => setEarnRate(Number(e.target.value))}
                className="font-mono"
              />
            </div>
            <input
              type="range"
              min="0.001"
              max="0.05"
              step="0.001"
              value={earnRate}
              onChange={e => setEarnRate(Number(e.target.value))}
              className="w-full mt-2 accent-[#FF6000]"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
              <span>0.001 (보수적)</span>
              <span>0.05 (적극적)</span>
            </div>
          </div>
          <div className="p-3 rounded-md bg-muted/40">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">예시: $100 예약 (Bronze)</p>
            <p className="text-2xl font-bold" style={{ color: "#FF6000" }}>
              {Math.max(1, Math.round(100 * earnRate))} ELS
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              ≈ ${Math.max(1, Math.round(100 * earnRate)).toFixed(2)}
            </p>
          </div>
          <div className="p-3 rounded-md bg-muted/40">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">예시: $500 × Gold × 프로모 1.15×</p>
            <p className="text-2xl font-bold" style={{ color: "#FF6000" }}>
              {Math.max(1, Math.round(500 * earnRate * 1.2 * 1.15))} ELS
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              마진 대비 {((Math.round(500 * earnRate * 1.2 * 1.15) / (500 * 0.026)) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </Card>

      {/* USD 페그 */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" style={{ color: "#FF6000" }} />
              <h3 className="font-semibold">ELS ↔ USD 페그</h3>
              <Badge className="text-[9px] text-white" style={{ background: IMPACT_COLOR.Critical }}>CRITICAL</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              1 ELS의 USD 상환 가치. 변경 시 전체 ELS 재고가 즉시 재산정됨 (breaking change).
            </p>
          </div>
          <Button size="sm" onClick={savePeg} disabled={usdPeg === settings.elsUsdPeg}
            style={usdPeg !== settings.elsUsdPeg ? { background: "#FF6000" } : undefined}
            className={usdPeg !== settings.elsUsdPeg ? "text-white" : ""}
          >
            <Save className="h-3 w-3 mr-1" />저장
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center px-3 py-2 rounded bg-[#FF6000]/10 font-bold text-lg" style={{ color: "#FF6000" }}>
            1 ELS
          </div>
          <span className="text-lg">=</span>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            max="5"
            value={usdPeg}
            onChange={e => setUsdPeg(Number(e.target.value))}
            className="w-32 font-mono"
          />
          <span className="text-lg">USD</span>
        </div>
      </Card>

      {/* 월 예산 한도 */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" style={{ color: "#FF6000" }} />
              <h3 className="font-semibold">월 ELS 리워드 풀 예산 한도</h3>
              <Badge className="text-[9px] text-white" style={{ background: IMPACT_COLOR.Critical }}>CRITICAL</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              월간 최대 지급 ELS. 한도 도달 시 차기 주기까지 신규 지급 일시중단.
            </p>
          </div>
          <Button size="sm" onClick={saveBudget} disabled={budget === settings.rewardPoolBudgetKrw}
            style={budget !== settings.rewardPoolBudgetKrw ? { background: "#FF6000" } : undefined}
            className={budget !== settings.rewardPoolBudgetKrw ? "text-white" : ""}
          >
            <Save className="h-3 w-3 mr-1" />저장
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium flex items-center gap-2">
              <input
                type="checkbox"
                checked={budget !== null}
                onChange={e => setBudget(e.target.checked ? 50_000_000 : null)}
                className="h-4 w-4 accent-[#FF6000]"
              />
              한도 설정 사용
            </label>
            {budget !== null && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg">₩</span>
                <Input
                  type="number"
                  step="1000000"
                  min="0"
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                  className="font-mono"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">= ₩{(budget / 1_000_000).toFixed(0)}M</span>
              </div>
            )}
            {budget === null && (
              <p className="text-[11px] text-[#EF476F] mt-2">⚠ 현재 미설정 — Q2 성장 전 반드시 결정 필요</p>
            )}
          </div>
          <div className="p-3 rounded-md bg-muted/40 space-y-1 text-xs">
            <p className="font-semibold">예산 시나리오</p>
            <p>• 보수적: ₩50M/월 (마진 15%)</p>
            <p>• 현상유지: ₩120M/월 (현 수준)</p>
            <p>• 성장형: ₩150M/월 (Q2 OP +30% 수용)</p>
          </div>
        </div>
      </Card>

      {/* 티어 배수 + 임계값 */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" style={{ color: "#FF6000" }} />
              <h3 className="font-semibold">티어 배수 & 승급 임계값</h3>
              <Badge className="text-[9px] text-white" style={{ background: IMPACT_COLOR.High }}>HIGH</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              5개 티어의 ELS 적립 배수와 승급에 필요한 누적 예약 수.
            </p>
          </div>
          <Button
            size="sm"
            onClick={saveTiers}
            disabled={
              tierMults.every((m, i) => m === settings.tierMultipliers[i]) &&
              tierThresh.every((t, i) => t === settings.tierThresholds[i])
            }
            style={{ background: "#FF6000" }}
            className="text-white disabled:bg-muted disabled:text-muted-foreground"
          >
            <Save className="h-3 w-3 mr-1" />저장
          </Button>
        </div>

        <div className="grid grid-cols-5 gap-2 mt-4">
          {TIERS.map((t, i) => (
            <div key={t.name} className="text-center p-3 rounded-md" style={{ background: `${t.color}10` }}>
              <div className="text-2xl mb-1">{t.icon}</div>
              <p className="font-bold text-sm" style={{ color: t.color }}>{t.name}</p>
              <div className="mt-2">
                <label className="text-[9px] uppercase text-muted-foreground">배수</label>
                <Input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="3.0"
                  value={tierMults[i]}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setTierMults(m => {
                      const next = [...m] as typeof m;
                      next[i] = v;
                      return next;
                    });
                  }}
                  className="mt-0.5 text-center font-bold font-mono h-8"
                />
              </div>
              {i > 0 && (
                <div className="mt-2">
                  <label className="text-[9px] uppercase text-muted-foreground">승급 예약</label>
                  <Input
                    type="number"
                    step="50"
                    min="1"
                    value={tierThresh[i - 1]}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setTierThresh(t => {
                        const next = [...t] as typeof t;
                        next[i - 1] = v;
                        return next;
                      });
                    }}
                    className="mt-0.5 text-center font-mono h-8 text-xs"
                  />
                </div>
              )}
              {i === 0 && (
                <p className="text-[10px] text-muted-foreground mt-2">시작 티어</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ELS 만료 기간 */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" style={{ color: "#FF6000" }} />
              <h3 className="font-semibold">ELS 만료 기간</h3>
              <Badge className="text-[9px] text-white" style={{ background: IMPACT_COLOR.High }}>HIGH</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              미사용 ELS 자동 만료 기간 (적립일부터). 짧을수록 부채 감소, 길수록 OP 신뢰.
            </p>
          </div>
          <Button size="sm" onClick={saveExpiry} disabled={expiry === settings.elsExpiryMonths}
            style={expiry !== settings.elsExpiryMonths ? { background: "#FF6000" } : undefined}
            className={expiry !== settings.elsExpiryMonths ? "text-white" : ""}
          >
            <Save className="h-3 w-3 mr-1" />저장
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="1"
                min="6"
                max="60"
                value={expiry}
                onChange={e => setExpiry(Number(e.target.value))}
                className="w-24 font-mono text-center"
              />
              <span className="text-sm">개월</span>
            </div>
            <input
              type="range"
              min="6"
              max="60"
              step="1"
              value={expiry}
              onChange={e => setExpiry(Number(e.target.value))}
              className="w-full mt-2 accent-[#FF6000]"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
              <span>6개월 (부채 -60%)</span>
              <span>업계 표준 24</span>
              <span>60개월 (신뢰 ++)</span>
            </div>
          </div>
          <div className="p-3 rounded-md bg-muted/40 text-xs">
            <p className="font-semibold mb-1">예상 영향</p>
            {expiry <= 12 && <p className="text-amber-700">• OP 불만족 리스크 — 1년 내 소비 강제</p>}
            {expiry >= 36 && <p className="text-amber-700">• 잠재 부채 {(((expiry - 24) / 24) * 100).toFixed(0)}% 증가</p>}
            {expiry > 12 && expiry < 36 && <p className="text-green-700">• 업계 표준 범위 내</p>}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ═════════════════════════════════════════════════
 * 프로모션 탭
 * ═════════════════════════════════════════════════ */
function PromotionsTab({
  settings, setSettings, recordChange,
}: {
  settings: LiveSettings;
  setSettings: React.Dispatch<React.SetStateAction<LiveSettings>>;
  recordChange: (key: string, label: string, before: string, after: string) => void;
}) {
  const [maxCap, setMaxCap] = useState(settings.promoMaxMultiplier);
  const [boosts, setBoosts] = useState<HotelPointsBoost[]>(settings.hotelBoosts);
  const [addingNew, setAddingNew] = useState(false);
  const [newBoost, setNewBoost] = useState<HotelPointsBoost>({
    hotelId: "", multiplier: 1.1, label: "+10% ELS", reason: "", expiresAt: "",
  });

  const saveBoosts = () => {
    if (JSON.stringify(boosts) === JSON.stringify(settings.hotelBoosts)) return;
    recordChange("HOTEL_POINTS_BOOSTS", "호텔 프로모",
      `${settings.hotelBoosts.length}개 활성`,
      `${boosts.length}개 활성 (수정됨)`
    );
    setSettings(s => ({ ...s, hotelBoosts: boosts }));
  };

  const saveMaxCap = () => {
    if (maxCap === settings.promoMaxMultiplier) return;
    recordChange("PROMO_MAX_MULTIPLIER", "프로모 배수 상한",
      `${settings.promoMaxMultiplier}×`, `${maxCap}×`);
    setSettings(s => ({ ...s, promoMaxMultiplier: maxCap }));
  };

  const deleteBoost = (hotelId: string) => {
    setBoosts(list => list.filter(b => b.hotelId !== hotelId));
  };
  const updateBoost = (hotelId: string, field: keyof HotelPointsBoost, value: any) => {
    setBoosts(list => list.map(b => b.hotelId === hotelId ? { ...b, [field]: value } : b));
  };
  const addBoost = () => {
    if (!newBoost.hotelId || !newBoost.expiresAt) {
      toast.error("호텔과 만료일은 필수");
      return;
    }
    if (boosts.some(b => b.hotelId === newBoost.hotelId)) {
      toast.error("이미 프로모 중인 호텔입니다");
      return;
    }
    setBoosts(list => [...list, { ...newBoost }]);
    setAddingNew(false);
    setNewBoost({ hotelId: "", multiplier: 1.1, label: "+10% ELS", reason: "", expiresAt: "" });
  };

  const availableHotels = hotels.filter(h => !boosts.some(b => b.hotelId === h.id));

  return (
    <div className="space-y-4">
      {/* Max cap */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4" style={{ color: "#FF6000" }} />
              <h3 className="font-semibold">프로모 배수 상한 (Hard Cap)</h3>
              <Badge className="text-[9px] text-white" style={{ background: IMPACT_COLOR.High }}>HIGH</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              단일 호텔 프로모 배수의 최대치. 이 값 이상은 시스템이 거부함.
            </p>
          </div>
          <Button size="sm" onClick={saveMaxCap} disabled={maxCap === settings.promoMaxMultiplier}
            style={maxCap !== settings.promoMaxMultiplier ? { background: "#FF6000" } : undefined}
            className={maxCap !== settings.promoMaxMultiplier ? "text-white" : ""}
          >
            <Save className="h-3 w-3 mr-1" />저장
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            step="0.05"
            min="1.0"
            max="2.0"
            value={maxCap}
            onChange={e => setMaxCap(Number(e.target.value))}
            className="w-32 font-mono"
          />
          <span>×</span>
          <input
            type="range"
            min="1.0"
            max="2.0"
            step="0.05"
            value={maxCap}
            onChange={e => setMaxCap(Number(e.target.value))}
            className="flex-1 accent-[#FF6000]"
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">= +{((maxCap - 1) * 100).toFixed(0)}% 최대</span>
        </div>
      </Card>

      {/* Hotel promo table */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" style={{ color: "#FF6000" }} />
              <h3 className="font-semibold">활성 호텔 프로모 ({boosts.length}개)</h3>
              <Badge className="text-[9px] text-white" style={{ background: IMPACT_COLOR.Medium }}>MEDIUM</Badge>
              <Badge variant="outline" className="text-[9px]">CMO 결재</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              호텔별 ELS 적립 부스터. 만료일 지나면 자동 비활성. 테이블에서 직접 편집.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddingNew(!addingNew)}
            >
              <Plus className="h-3 w-3 mr-1" />프로모 추가
            </Button>
            <Button size="sm" onClick={saveBoosts}
              disabled={JSON.stringify(boosts) === JSON.stringify(settings.hotelBoosts)}
              style={JSON.stringify(boosts) !== JSON.stringify(settings.hotelBoosts) ? { background: "#FF6000" } : undefined}
              className={JSON.stringify(boosts) !== JSON.stringify(settings.hotelBoosts) ? "text-white" : ""}
            >
              <Save className="h-3 w-3 mr-1" />저장
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>호텔</TableHead>
              <TableHead className="w-24">배수</TableHead>
              <TableHead className="w-28">라벨</TableHead>
              <TableHead>사유</TableHead>
              <TableHead className="w-36">만료일</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addingNew && (
              <TableRow style={{ background: "#FF600008" }}>
                <TableCell>
                  <select
                    value={newBoost.hotelId}
                    onChange={e => setNewBoost(b => ({ ...b, hotelId: e.target.value }))}
                    className="w-full border rounded px-2 py-1 text-sm bg-background"
                  >
                    <option value="">-- 호텔 선택 --</option>
                    {availableHotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.05"
                    min="1.0"
                    max={maxCap}
                    value={newBoost.multiplier}
                    onChange={e => setNewBoost(b => ({ ...b, multiplier: Number(e.target.value), label: `+${Math.round((Number(e.target.value) - 1) * 100)}% ELS` }))}
                    className="h-8 font-mono text-center"
                  />
                </TableCell>
                <TableCell><span className="text-xs font-mono">{newBoost.label}</span></TableCell>
                <TableCell>
                  <Input
                    placeholder="예: Q2 봄 캠페인"
                    value={newBoost.reason}
                    onChange={e => setNewBoost(b => ({ ...b, reason: e.target.value }))}
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="date"
                    value={newBoost.expiresAt}
                    onChange={e => setNewBoost(b => ({ ...b, expiresAt: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell>
                  <Button size="sm" className="h-7 text-[10px] text-white" style={{ background: "#06D6A0" }} onClick={addBoost}>
                    추가
                  </Button>
                </TableCell>
              </TableRow>
            )}
            {boosts.map(b => {
              const hotel = hotels.find(h => h.id === b.hotelId);
              return (
                <TableRow key={b.hotelId}>
                  <TableCell>
                    <p className="font-medium text-sm">{hotel?.name || b.hotelId}</p>
                    <p className="text-[10px] text-muted-foreground">{hotel?.area}</p>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.05"
                      min="1.0"
                      max={maxCap}
                      value={b.multiplier}
                      onChange={e => {
                        const v = Number(e.target.value);
                        updateBoost(b.hotelId, "multiplier", v);
                        updateBoost(b.hotelId, "label", `+${Math.round((v - 1) * 100)}% ELS`);
                      }}
                      className="h-8 font-mono text-center"
                    />
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded text-white"
                      style={{
                        background: b.multiplier >= 1.2 ? "linear-gradient(90deg,#EF476F,#FF6000)"
                                 : b.multiplier >= 1.15 ? "linear-gradient(90deg,#FF6000,#FFD166)"
                                 : "linear-gradient(90deg,#8b5cf6,#a855f7)",
                      }}
                    >
                      {b.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={b.reason}
                      onChange={e => updateBoost(b.hotelId, "reason", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={b.expiresAt}
                      onChange={e => updateBoost(b.hotelId, "expiresAt", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => deleteBoost(b.hotelId)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

/* ═════════════════════════════════════════════════
 * 게임화 탭
 * ═════════════════════════════════════════════════ */
function GamificationTab({
  settings, setSettings, recordChange,
}: {
  settings: LiveSettings;
  setSettings: React.Dispatch<React.SetStateAction<LiveSettings>>;
  recordChange: (key: string, label: string, before: string, after: string) => void;
}) {
  const [stampBonuses, setStampBonuses] = useState({ ...settings.stampBonuses });
  const [reviewFormula, setReviewFormula] = useState({ ...settings.reviewRewardFormula });

  const saveStamps = () => {
    if (JSON.stringify(stampBonuses) === JSON.stringify(settings.stampBonuses)) return;
    const before = Object.values(settings.stampBonuses).join(" / ");
    const after = Object.values(stampBonuses).join(" / ");
    recordChange("STAMP_BONUS_SCALE", "스탬프 희귀도별 보너스", before, after);
    setSettings(s => ({ ...s, stampBonuses }));
  };

  const saveReview = () => {
    if (JSON.stringify(reviewFormula) === JSON.stringify(settings.reviewRewardFormula)) return;
    const { base, quality, photo, first, monthlyCap } = reviewFormula;
    const b = settings.reviewRewardFormula;
    recordChange("REVIEW_REWARD_FORMULA", "리뷰 보상 공식",
      `+${b.base}/+${b.quality}/+${b.photo}/+${b.first} · 월 ${b.monthlyCap}`,
      `+${base}/+${quality}/+${photo}/+${first} · 월 ${monthlyCap}`
    );
    setSettings(s => ({ ...s, reviewRewardFormula: reviewFormula }));
  };

  const rarities: Array<{ key: StampRarity; color: string; label: string }> = [
    { key: "Common",    color: "#94a3b8", label: "Common" },
    { key: "Rare",      color: "#3b82f6", label: "Rare" },
    { key: "Epic",      color: "#a855f7", label: "Epic" },
    { key: "Legendary", color: "#eab308", label: "Legendary" },
    { key: "Mythic",    color: "#FF6000", label: "Mythic" },
  ];

  const maxStampTotal = 23 * 3295 / 25 /* approx */;
  const currentStampTotal = rarities.reduce((sum, r) => sum + stampBonuses[r.key], 0);

  const maxReviewReward = reviewFormula.base + reviewFormula.quality + reviewFormula.photo + reviewFormula.first;

  return (
    <div className="space-y-4">
      {/* Stamp bonuses */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" style={{ color: "#FF6000" }} />
              <h3 className="font-semibold">스탬프 희귀도별 보너스</h3>
              <Badge className="text-[9px] text-white" style={{ background: IMPACT_COLOR.Medium }}>MEDIUM</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              각 희귀도 스탬프 획득 시 일회성 ELS 보너스.
              현재 전 카탈로그 합산 최대: <strong>{currentStampTotal * 5} ELS</strong> (OP 평생, 23개 전부 획득 시).
            </p>
          </div>
          <Button size="sm" onClick={saveStamps}
            disabled={JSON.stringify(stampBonuses) === JSON.stringify(settings.stampBonuses)}
            style={JSON.stringify(stampBonuses) !== JSON.stringify(settings.stampBonuses) ? { background: "#FF6000" } : undefined}
            className={JSON.stringify(stampBonuses) !== JSON.stringify(settings.stampBonuses) ? "text-white" : ""}
          >
            <Save className="h-3 w-3 mr-1" />저장
          </Button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {rarities.map(r => (
            <div key={r.key} className="p-3 rounded-md" style={{ background: `${r.color}15`, borderLeft: `3px solid ${r.color}` }}>
              <p className="font-bold text-xs" style={{ color: r.color }}>{r.label}</p>
              <div className="flex items-center gap-1 mt-2">
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="5000"
                  value={stampBonuses[r.key]}
                  onChange={e => setStampBonuses(b => ({ ...b, [r.key]: Number(e.target.value) }))}
                  className="font-mono text-center h-8"
                />
                <span className="text-xs">ELS</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Review reward formula */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Edit className="h-4 w-4" style={{ color: "#FF6000" }} />
              <h3 className="font-semibold">호텔 리뷰 보상 공식</h3>
              <Badge className="text-[9px] text-white" style={{ background: IMPACT_COLOR.Low }}>LOW</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              OP가 리뷰 작성 시 받을 ELS. 현재 리뷰당 최대: <strong style={{ color: "#FF6000" }}>+{maxReviewReward} ELS</strong>
            </p>
          </div>
          <Button size="sm" onClick={saveReview}
            disabled={JSON.stringify(reviewFormula) === JSON.stringify(settings.reviewRewardFormula)}
            style={JSON.stringify(reviewFormula) !== JSON.stringify(settings.reviewRewardFormula) ? { background: "#FF6000" } : undefined}
            className={JSON.stringify(reviewFormula) !== JSON.stringify(settings.reviewRewardFormula) ? "text-white" : ""}
          >
            <Save className="h-3 w-3 mr-1" />저장
          </Button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[
            { key: "base",       label: "기본 (80자+, 1팁+)", color: "#64748b" },
            { key: "quality",    label: "품질 (300자 or 4팁)", color: "#3b82f6" },
            { key: "photo",      label: "사진 (1장+)",        color: "#06D6A0" },
            { key: "first",      label: "첫 리뷰 (1회)",      color: "#FF6000" },
            { key: "monthlyCap", label: "월 리뷰 한도 (건)",  color: "#8b5cf6" },
          ].map(f => (
            <div key={f.key} className="p-3 rounded-md" style={{ background: `${f.color}15`, borderLeft: `3px solid ${f.color}` }}>
              <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: f.color }}>{f.label}</p>
              <div className="flex items-center gap-1 mt-2">
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="50"
                  value={reviewFormula[f.key as keyof typeof reviewFormula]}
                  onChange={e => setReviewFormula(r => ({ ...r, [f.key]: Number(e.target.value) }))}
                  className="font-mono text-center h-8"
                />
                <span className="text-xs">{f.key === "monthlyCap" ? "건" : "ELS"}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Stamp catalog link */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-sm">스탬프 카탈로그 (23개)</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              개별 스탬프 추가/수정/제거는 별도 관리 페이지에서 (Phase 2).
              현재 프로토타입에선 stamps 시드 데이터(rewards.ts) 직접 편집 필요.
            </p>
          </div>
          <Button variant="outline" size="sm" disabled>
            <Package className="h-3 w-3 mr-1" />카탈로그 관리 (예정)
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ═════════════════════════════════════════════════
 * 정책 탭
 * ═════════════════════════════════════════════════ */
function PolicyTab({
  settings, setSettings, recordChange, navigate,
}: {
  settings: LiveSettings;
  setSettings: React.Dispatch<React.SetStateAction<LiveSettings>>;
  recordChange: (key: string, label: string, before: string, after: string) => void;
  navigate: (path: string) => void;
}) {
  /* 자동 모더레이션 규칙 — localStorage에서 로드 */
  const [autoMod, setAutoMod] = useState<AutoModerationRules>(loadAutoModRules);
  const [autoModDirty, setAutoModDirty] = useState(false);
  const [savedRules, setSavedRules] = useState<AutoModerationRules>(autoMod);

  const updateRule = <K extends keyof AutoModerationRules>(key: K, value: AutoModerationRules[K]) => {
    setAutoMod(r => ({ ...r, [key]: value }));
    setAutoModDirty(true);
  };

  const saveAutoMod = () => {
    saveAutoModRules(autoMod);
    /* 각 변경 추적: 어느 필드가 바뀌었는지 기록 */
    const diffs: string[] = [];
    (Object.keys(autoMod) as Array<keyof AutoModerationRules>).forEach(k => {
      if (autoMod[k] !== savedRules[k]) {
        diffs.push(`${k}: ${savedRules[k]} → ${autoMod[k]}`);
      }
    });
    if (diffs.length > 0) {
      recordChange(
        "AUTO_MOD_RULES",
        "자동 모더레이션 규칙",
        diffs.length === 1 ? diffs[0].split(" → ")[0].split(": ")[1] : "복수 필드",
        diffs.length === 1 ? diffs[0].split(" → ")[1] : diffs.join(" · ")
      );
    }
    setSavedRules({ ...autoMod });
    setAutoModDirty(false);
  };

  const resetToDefaults = () => {
    setAutoMod({ ...DEFAULT_AUTO_MOD_RULES });
    setAutoModDirty(JSON.stringify(savedRules) !== JSON.stringify(DEFAULT_AUTO_MOD_RULES));
  };

  return (
    <div className="space-y-4">
      {/* ── 자동 모더레이션 규칙 설정 (신규) ── */}
      <Card className="p-5" style={{ borderLeft: `4px solid #FF6000` }}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" style={{ color: "#FF6000" }} />
              <h3 className="font-semibold">리뷰 자동 모더레이션 규칙</h3>
              <Badge className="text-[9px] text-white" style={{ background: IMPACT_COLOR.Medium }}>MEDIUM</Badge>
              <Badge variant="outline" className="text-[9px]">Content Manager 결재</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              리뷰가 어떤 조건일 때 자동 승인/반려/수동 검토로 분류될지 규칙 설정.
              저장 시 즉시 Review Moderation 페이지에 반영됨.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={resetToDefaults}>
              기본값으로
            </Button>
            <Button
              size="sm"
              onClick={saveAutoMod}
              disabled={!autoModDirty}
              style={autoModDirty ? { background: "#FF6000" } : undefined}
              className={autoModDirty ? "text-white" : ""}
            >
              <Save className="h-3 w-3 mr-1" />저장
            </Button>
          </div>
        </div>

        {/* Global toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-md border" style={{ background: autoMod.enabled ? "#06D6A010" : "#f8f8f8", borderColor: autoMod.enabled ? "#06D6A0" : undefined }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">엔진 활성화</p>
                <p className="text-[10px] text-muted-foreground">OFF 시 모든 리뷰가 수동 검수 대기로 감</p>
              </div>
              <button
                onClick={() => updateRule("enabled", !autoMod.enabled)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                  autoMod.enabled ? "bg-[#06D6A0]" : "bg-muted"
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  autoMod.enabled ? "translate-x-8" : "translate-x-1"
                }`} />
              </button>
            </div>
          </div>
          <div className="p-3 rounded-md border" style={{ background: autoMod.strictMode ? "#FF600010" : "#f8f8f8", borderColor: autoMod.strictMode ? "#FF6000" : undefined }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Strict 모드</p>
                <p className="text-[10px] text-muted-foreground">사진 없는 리뷰도 수동 검수로 강제</p>
              </div>
              <button
                onClick={() => updateRule("strictMode", !autoMod.strictMode)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                  autoMod.strictMode ? "bg-[#FF6000]" : "bg-muted"
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  autoMod.strictMode ? "translate-x-8" : "translate-x-1"
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Auto-Approve conditions */}
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
            <CheckIcon /> 자동 승인 조건 (모두 충족 시 즉시 승인 + ELS 지급)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Min body length */}
            <div className="p-3 rounded-md bg-muted/40">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                최소 본문 길이
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  min="50"
                  max="500"
                  step="10"
                  value={autoMod.autoApproveMinBody}
                  onChange={e => updateRule("autoApproveMinBody", Number(e.target.value))}
                  className="font-mono text-center h-8"
                />
                <span className="text-xs">자</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={autoMod.autoApproveMinBody}
                onChange={e => updateRule("autoApproveMinBody", Number(e.target.value))}
                className="w-full mt-2 accent-[#FF6000]"
              />
              <p className="text-[9px] text-muted-foreground mt-1">
                ↑ 높을수록 자동 승인 까다로워짐
              </p>
            </div>

            {/* Min tip count */}
            <div className="p-3 rounded-md bg-muted/40">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                최소 팁 개수
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  min="0"
                  max="10"
                  step="1"
                  value={autoMod.autoApproveMinTips}
                  onChange={e => updateRule("autoApproveMinTips", Number(e.target.value))}
                  className="font-mono text-center h-8"
                />
                <span className="text-xs">개</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={autoMod.autoApproveMinTips}
                onChange={e => updateRule("autoApproveMinTips", Number(e.target.value))}
                className="w-full mt-2 accent-[#FF6000]"
              />
              <p className="text-[9px] text-muted-foreground mt-1">
                0이면 팁 없어도 자동 승인 가능
              </p>
            </div>

            {/* Require verified stay */}
            <div className="p-3 rounded-md bg-muted/40">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                투숙 검증 필수
              </label>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs">{autoMod.autoApproveRequireVerified ? "검증된 투숙만 자동 승인" : "검증 없어도 자동 승인 가능"}</p>
                <button
                  onClick={() => updateRule("autoApproveRequireVerified", !autoMod.autoApproveRequireVerified)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoMod.autoApproveRequireVerified ? "bg-[#06D6A0]" : "bg-muted"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoMod.autoApproveRequireVerified ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
              <p className="text-[9px] text-muted-foreground mt-2">
                ⚠ OFF 시 스팸 위험 증가
              </p>
            </div>
          </div>
        </div>

        {/* Auto-Reject conditions */}
        <div>
          <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "#EF476F" }}>
            <XIcon2 /> 자동 반려 조건 (즉시 차단, OP에게 사유 통지)
          </p>
          <div className="p-3 rounded-md bg-muted/40 max-w-md">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
              스팸 플래그 개수 임계값
            </label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min="1"
                max="5"
                step="1"
                value={autoMod.autoRejectSpamFlagThreshold}
                onChange={e => updateRule("autoRejectSpamFlagThreshold", Number(e.target.value))}
                className="font-mono text-center h-8 w-20"
              />
              <span className="text-xs">개 이상</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">
              스팸 패턴 / 반복어 / 홍보성 문구 감지 개수. 낮을수록 더 공격적으로 차단.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 rounded-md border border-[#FF6000]/30" style={{ background: "#FF600008" }}>
          <p className="text-[11px] font-semibold mb-1" style={{ color: "#FF6000" }}>현재 규칙 요약</p>
          <ul className="text-[11px] space-y-0.5">
            <li>
              <strong>자동 승인</strong>: 본문 <strong>{autoMod.autoApproveMinBody}자+</strong> · 팁{" "}
              <strong>{autoMod.autoApproveMinTips}개+</strong>
              {autoMod.autoApproveRequireVerified && " · 검증된 투숙"}
              {" · 플래그 없음"}
              {autoMod.strictMode && " · 사진 1장+ (Strict)"}
            </li>
            <li>
              <strong>자동 반려</strong>: 스팸/반복어/홍보 플래그 <strong>{autoMod.autoRejectSpamFlagThreshold}개 이상</strong> 감지
            </li>
            <li>
              <strong>그 외</strong>: Manual Review 큐로 이동 (Content Manager 수동 처리)
            </li>
          </ul>
        </div>
      </Card>

      {/* ELS Non-transferable toggle */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" style={{ color: "#FF6000" }} />
              <h3 className="font-semibold">ELS 양도 가능 여부</h3>
              <Badge className="text-[9px] text-white" style={{ background: IMPACT_COLOR.Critical }}>CRITICAL</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              현재 <strong>양도 불가</strong>가 원칙입니다 (OP 개인 귀속).
              활성화 시 gift-laundering / 담합 리스크 + AML/KYC 의무 재도입.
            </p>
            {!settings.elsNonTransferable && (
              <p className="text-[11px] text-[#EF476F] mt-2 font-semibold">⚠ 경고: 현재 양도 가능 — 법무·재무 검토 필수</p>
            )}
          </div>
          <button
            onClick={() => {
              const newValue = !settings.elsNonTransferable;
              recordChange("ELS_NON_TRANSFERABLE", "ELS 양도 가능 여부",
                settings.elsNonTransferable ? "양도 불가" : "양도 가능",
                newValue ? "양도 불가" : "양도 가능"
              );
              setSettings(s => ({ ...s, elsNonTransferable: newValue }));
            }}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
              settings.elsNonTransferable ? "bg-[#06D6A0]" : "bg-[#EF476F]"
            }`}
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              settings.elsNonTransferable ? "translate-x-1" : "translate-x-9"
            }`} />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
              {settings.elsNonTransferable ? "OFF" : "ON"}
            </span>
          </button>
        </div>
      </Card>

      {/* Review Moderation link */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" style={{ color: "#FF6000" }} />
              <h3 className="font-semibold">리뷰 모더레이션</h3>
              <Badge className="text-[9px] text-white" style={{ background: IMPACT_COLOR.Low }}>LOW</Badge>
              <Badge variant="outline" className="text-[9px]">Content Manager</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              호텔 리뷰의 Pending 큐 처리 + 승인된 리뷰 사후 takedown.
              일일 처리 목표: 24시간 내 응답.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate("/app/admin/review-moderation")}
            style={{ background: "#FF6000" }}
            className="text-white"
          >
            모더레이션 큐 이동 <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </Card>

      {/* Supplier contracts (placeholder link) */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">공급사 계약 관리</h3>
              <Badge className="text-[9px] text-white" style={{ background: IMPACT_COLOR.High }}>HIGH</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              기프티콘 공급사 (Giftishow, 카카오, Grab, Rakuten 등)와의 도매 단가 계약.
            </p>
          </div>
          <Button size="sm" variant="outline" disabled>
            계약 관리 (Phase 2)
          </Button>
        </div>
      </Card>

      {/* Shop product pricing (placeholder link) */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Shop 상품 가격 관리 (32개)</h3>
              <Badge className="text-[9px] text-white" style={{ background: IMPACT_COLOR.Medium }}>MEDIUM</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              상품 카탈로그의 ELS 가격 개별 편집. 6개국 × 32개 상품.
            </p>
          </div>
          <Button size="sm" variant="outline" disabled>
            상품 관리 (Phase 2)
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ═════════════════════════════════════════════════
 * 변경 이력 탭
 * ═════════════════════════════════════════════════ */
function HistoryTab({ changes }: { changes: ParameterChange[] }) {
  return (
    <div className="space-y-4">
      <Alert>
        <History className="h-4 w-4" />
        <AlertTitle className="text-sm">변경 이력 (감사 로그)</AlertTitle>
        <AlertDescription className="text-xs">
          이 페이지에서 실행된 모든 파라미터 변경이 영구 기록됩니다. 감사 감리용 증빙 자료.
        </AlertDescription>
      </Alert>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">적용 시각</TableHead>
              <TableHead>파라미터</TableHead>
              <TableHead>이전 → 이후</TableHead>
              <TableHead className="w-36">적용자</TableHead>
              <TableHead className="w-32">결재 참조</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {changes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                  변경 이력이 없습니다.
                </TableCell>
              </TableRow>
            ) : changes.map(chg => (
              <TableRow key={chg.id}>
                <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                  {chg.appliedAt.slice(0, 16).replace("T", " ")}
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium">{chg.itemKey}</p>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-xs font-mono line-through text-muted-foreground">{chg.previousValue}</p>
                    <p className="text-xs font-mono" style={{ color: "#FF6000" }}>↳ {chg.newValue}</p>
                    {chg.reason && <p className="text-[10px] text-muted-foreground italic">{chg.reason}</p>}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  <p className="font-medium">{chg.appliedByName}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{chg.appliedBy}</p>
                </TableCell>
                <TableCell>
                  {chg.approvalRef ? (
                    <Badge variant="outline" className="text-[10px] font-mono" style={{ color: "#FF6000", borderColor: "#FF600055" }}>
                      {chg.approvalRef}
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
