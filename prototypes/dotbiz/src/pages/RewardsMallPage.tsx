import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Gift, RefreshCw, Sparkles, TrendingUp, Clock, Copy, CheckCircle2, Search,
  Trophy, Flame, Wallet, ArrowRight, Download, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useScreenState } from "@/hooks/useScreenState";
import { useTabParam } from "@/hooks/useTabParam";
import { StateToolbar } from "@/components/StateToolbar";
import { useAuth } from "@/contexts/AuthContext";
import { companies, currentCompany } from "@/mocks/companies";
import { hotels } from "@/mocks/hotels";
import {
  rewardProducts, userPointsState, pointsHistoryFor, vouchersFor,
  countryCodeFor, TIERS, tierDivisionFor,
  formatEls, earnedStampsFor, expiringElsFor, ELS_EXPIRY_MONTHS,
  STAMPS, RARITY_META, type StampRarity,
  HOTEL_POINTS_BOOSTS, hotelPointsBoost,
  companyPoolFor, companyPoolHistoryFor, charityOrgs,
  type RewardProduct, type UserPointsState, type RedeemedVoucher,
} from "@/mocks/rewards";
import { toast } from "sonner";

/* ──────────────────────────────────────────────────────────────────────
 * Rewards Mall — per-OP, country-local, digital-only
 * Business rules (see docs/specs/dotbiz/Rewards.md if present):
 *  • Each OP personally owns points (tenant-isolated by email)
 *  • Earn rate fixed per country — no FX fluctuation
 *  • Products are digital (no shipping) and filtered to user's country
 *  • Transfer between users disabled (no Transfer Points section anymore)
 *  • Milestones + Tier multiply base earn
 * ────────────────────────────────────────────────────────────────────── */

export default function RewardsMallPage() {
  const { state, setState } = useScreenState("success");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useTabParam("wallet");

  /* Resolve current user + their points state + their company + country */
  const activeCompany = companies.find(c => c.name === user?.company) || currentCompany;
  const countryCode = countryCodeFor(activeCompany.country);
  const userEmail = user?.email || "master@dotbiz.com";

  /* Local mutable points state so Redeem actually updates the UI */
  const seedUserState = userPointsState[userEmail] || {
    userEmail,
    customerCompanyId: activeCompany.id,
    countryCode,
    balance: 0, totalEarned: 0, totalUsed: 0, bookingCount: 0,
    milestonesReached: [], joinedAt: new Date().toISOString().slice(0, 10),
  };
  const [mystate, setMystate] = useState<UserPointsState>(seedUserState);
  const [myVouchers, setMyVouchers] = useState<RedeemedVoucher[]>(vouchersFor(userEmail));

  /* Refresh state when user changes (login switch) */
  useEffect(() => {
    const fresh = userPointsState[userEmail] || seedUserState;
    setMystate(fresh);
    setMyVouchers(vouchersFor(userEmail));
  }, [userEmail]); // eslint-disable-line react-hooks/exhaustive-deps

  const rank = tierDivisionFor(mystate.bookingCount);

  /* Products filtered by country */
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const myProducts = useMemo(() => {
    let list = rewardProducts.filter(p => p.countryCode === countryCode);
    if (category !== "all") list = list.filter(p => p.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [countryCode, category, search]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    rewardProducts.filter(p => p.countryCode === countryCode).forEach(p => set.add(p.category));
    return ["all", ...Array.from(set)];
  }, [countryCode]);

  /* Redeem flow */
  const [redeemTarget, setRedeemTarget] = useState<RewardProduct | null>(null);
  const [redeemedVoucher, setRedeemedVoucher] = useState<RedeemedVoucher | null>(null);

  /* ── Wallet Activity feed (all earned/used history for this user) ── */
  const allTx = useMemo(
    () => pointsHistoryFor(userEmail).sort((a, b) => b.date.localeCompare(a.date)),
    [userEmail]
  );

  /* ── CSV export for Wallet Activity ── */
  const exportCsv = () => {
    if (allTx.length === 0) {
      toast.info("No transactions to export yet.");
      return;
    }
    const esc = (v: unknown) => {
      const s = String(v ?? "");
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };
    const header = ["Date", "Type", "Description", "Amount (ELS)", "Balance", "Booking ID", "Product ID"];
    const rows = allTx.map(t => [
      t.date,
      t.type,
      t.description,
      t.amount,
      t.balance,
      t.bookingId || "",
      t.productId || "",
    ]);
    const csv = [header, ...rows].map(r => r.map(esc).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `dotbiz-els-wallet-${userEmail}-${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${allTx.length} transactions to CSV`);
  };

  const canAfford = redeemTarget ? mystate.balance >= redeemTarget.pointsCost : false;

  const doRedeem = () => {
    if (!redeemTarget || !canAfford) return;
    /* Generate a pseudo voucher code (4 groups of 4 chars) */
    const code = Array.from({ length: 4 }).map(() =>
      Array.from({ length: 4 }).map(() =>
        "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]
      ).join("")
    ).join("-");

    const now = new Date();
    const expires = new Date(now);
    expires.setMonth(expires.getMonth() + 3);

    const newVoucher: RedeemedVoucher = {
      id: `vch-${Date.now()}`,
      userEmail,
      productId: redeemTarget.id,
      productName: redeemTarget.name,
      brand: redeemTarget.brand,
      pointsCost: redeemTarget.pointsCost,
      faceValue: redeemTarget.faceValue,
      faceCurrency: redeemTarget.faceCurrency,
      voucherCode: code,
      redeemedAt: now.toISOString().slice(0, 10),
      expiresAt: expires.toISOString().slice(0, 10),
      status: "Active",
    };

    setMystate(s => ({
      ...s,
      balance: s.balance - redeemTarget.pointsCost,
      totalUsed: s.totalUsed + redeemTarget.pointsCost,
    }));
    setMyVouchers(prev => [newVoucher, ...prev]);
    setRedeemTarget(null);
    setRedeemedVoucher(newVoucher);  /* opens success dialog */
  };

  if (state === "loading") return (
    <div className="p-6 space-y-4 max-w-[1400px] mx-auto">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64" />)}</div>
      <StateToolbar state={state} setState={setState} />
    </div>
  );
  if (state === "error") return (
    <div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto">
      <AlertTitle>Rewards Error</AlertTitle>
      <AlertDescription>Failed to load rewards. Please try again.</AlertDescription>
      <Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button>
    </Alert><StateToolbar state={state} setState={setState} /></div>
  );

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* ─────────── Header hero ─────────── */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="h-6 w-6" style={{ color: "#FF6000" }} />
          ELS Wallet &amp; Rewards
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your personal <strong className="text-[#FF6000]">ELS</strong> — earned on every booking.
          Non-transferable. Redeem for local rewards and collect{" "}
          <button
            onClick={() => setTab("stamps")}
            className="underline decoration-dotted underline-offset-2 hover:text-amber-700 font-medium"
          >
            stamps in your passport
          </button>.
        </p>
      </div>

      {/* ─────────── Hero: Balance + Membership Rank ─────────── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* ── ELS Balance + Earn Rate (left) ── */}
        <Card className="p-5 md:col-span-2 flex flex-col justify-between" style={{ background: `linear-gradient(135deg, #FF600012, transparent 80%)` }}>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full text-[9px] font-bold text-white" style={{ background: "#FF6000" }}>E</span>
              Your ELS Balance
            </p>
            <p className="text-4xl font-bold mt-1" style={{ color: "#FF6000" }}>
              {mystate.balance.toLocaleString()}<span className="text-lg ml-1 text-muted-foreground">ELS</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {formatEls(mystate.balance).usd} <span className="opacity-60">· 1 ELS = 1 USD</span>
            </p>
          </div>

          {/* ── Earn rate breakdown ── */}
          <div
            className="mt-3 p-3 rounded-md border"
            style={{ background: `${rank.tier.color}10`, borderColor: `${rank.tier.color}44` }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Your earn rate</span>
              <span className="text-[10px] font-bold" style={{ color: rank.tier.color }}>
                {rank.tier.icon} {rank.tier.name} {rank.division}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold" style={{ color: rank.tier.color }}>
                {rank.tier.multiplier}×
              </span>
              <span className="text-[11px] text-muted-foreground">
                on every booking
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              <span className="font-mono">$1,000</span> booking →{" "}
              <strong style={{ color: rank.tier.color }}>
                {Math.max(1, Math.round(1000 * 0.01 * rank.tier.multiplier))} ELS
              </strong>
              {rank.tier.multiplier > 1 && (
                <> (+{Math.round((rank.tier.multiplier - 1) * 100)}% vs Bronze)</>
              )}
            </p>
            {/* Mini tier progression strip */}
            <div className="flex items-center gap-0.5 mt-2 text-[8px]">
              {TIERS.map(t => (
                <div
                  key={t.name}
                  className={`flex-1 text-center py-0.5 rounded transition-opacity ${
                    t.name === rank.tier.name ? "font-bold" : "opacity-50"
                  }`}
                  style={{
                    background: t.name === rank.tier.name ? `${t.color}25` : undefined,
                    color: t.name === rank.tier.name ? t.color : undefined,
                  }}
                  title={`${t.name} · ${t.multiplier}× earn`}
                >
                  {t.multiplier}×
                </div>
              ))}
            </div>
            <p className="text-[9px] text-muted-foreground mt-1.5 italic">
              💡 Base 1 ELS / $100 · tier × hotel promo stack (e.g. Gold 1.2× × +15% = <strong>1.38×</strong>)
            </p>

            {/* ── Next tier unlock nudge ── */}
            {(() => {
              const currentIdx = TIERS.findIndex(t => t.name === rank.tier.name);
              const nextT = currentIdx < TIERS.length - 1 ? TIERS[currentIdx + 1] : null;
              if (!nextT) {
                return (
                  <p className="text-[10px] mt-2 pt-2 border-t border-border/40 font-semibold" style={{ color: rank.tier.color }}>
                    🏆 You're at the apex — Diamond tier, the top 1%
                  </p>
                );
              }
              const delta = Math.round((nextT.multiplier - rank.tier.multiplier) * 100);
              const bookingsLeft = Math.max(1, nextT.minBookings - mystate.bookingCount);
              return (
                <div className="text-[10px] mt-2 pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                  <span>
                    Unlock <strong style={{ color: nextT.color }}>{nextT.icon} {nextT.name}</strong>:
                    <span className="text-muted-foreground"> +{delta}% more per booking</span>
                  </span>
                  <span className="font-mono text-muted-foreground whitespace-nowrap">
                    {bookingsLeft} to go
                  </span>
                </div>
              );
            })()}
          </div>

          <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground border-t pt-2">
            <span>Earned <strong className="text-foreground">{mystate.totalEarned.toLocaleString()}</strong></span>
            <span>·</span>
            <span>Used <strong className="text-foreground">{mystate.totalUsed.toLocaleString()}</strong></span>
            <span>·</span>
            <span>{mystate.bookingCount.toLocaleString()} bookings</span>
          </div>
        </Card>

        {/* ── Membership Rank (refined LoL-style) ── */}
        <Card
          className="p-5 md:col-span-3 overflow-hidden relative"
          style={{
            background: `linear-gradient(120deg, ${rank.tier.colorSoft}, transparent 60%), radial-gradient(circle at 85% 30%, ${rank.tier.glow}, transparent 45%)`,
          }}
        >
          {/* Top row: label + season */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
              Membership Rank
            </p>
            <span className="text-[10px] text-muted-foreground italic">Season · Spring 2026</span>
          </div>

          <div className="flex items-start gap-4">
            {/* ── Emblem ── */}
            <div className="shrink-0 relative">
              {/* Outer metal ring */}
              <div
                className="h-24 w-24 rounded-full flex items-center justify-center relative"
                style={{
                  background: rank.tier.gradient,
                  boxShadow: `0 0 0 2px ${rank.tier.ring}, 0 0 28px ${rank.tier.glow}, inset 0 -6px 12px rgba(0,0,0,0.18), inset 0 6px 10px rgba(255,255,255,0.35)`,
                }}
              >
                {/* Inner medallion */}
                <div
                  className="h-[70px] w-[70px] rounded-full flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), ${rank.tier.color}cc 60%, ${rank.tier.color} 100%)`,
                    boxShadow: "inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.2)",
                  }}
                >
                  <span className="text-3xl drop-shadow-sm" aria-hidden>{rank.tier.icon}</span>
                </div>
                {/* Division badge — bottom-right overlay */}
                <div
                  className="absolute -bottom-1 -right-1 h-7 min-w-[28px] px-2 rounded-full flex items-center justify-center text-[11px] font-bold bg-white"
                  style={{
                    color: rank.tier.color,
                    border: `2px solid ${rank.tier.ring}`,
                    boxShadow: `0 2px 8px ${rank.tier.glow}`,
                  }}
                >
                  {rank.division}
                </div>
              </div>
            </div>

            {/* ── Rank info ── */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className="text-2xl font-bold tracking-tight" style={{ color: rank.tier.color }}>
                  {rank.tier.name}
                </h3>
                <span className="text-lg font-light text-muted-foreground">{rank.division}</span>
              </div>
              <p className="text-[11px] italic text-muted-foreground mt-0.5">{rank.tier.tagline}</p>

              {/* Rank + percentile */}
              <div className="flex items-center gap-4 mt-2 text-xs">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Global Rank</p>
                  <p className="text-sm font-bold">#{rank.rank.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">of {rank.totalOps.toLocaleString()}</span></p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Percentile</p>
                  <p className="text-sm font-bold" style={{ color: rank.tier.color }}>Top {rank.percentile}%</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Earn Rate</p>
                  <p className="text-sm font-bold">{rank.tier.multiplier}×</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Progression bar to next division ── */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
              <span className="font-semibold" style={{ color: rank.tier.color }}>
                {rank.nextLabel === "Apex — no further rank"
                  ? "🏆 You've reached the top"
                  : `Next · ${rank.nextLabel}`}
              </span>
              {rank.bookingsToNextDivision > 0 && (
                <span className="font-mono">
                  {rank.bookingsToNextDivision} booking{rank.bookingsToNextDivision === 1 ? "" : "s"} to go
                </span>
              )}
            </div>
            <div className="h-2 bg-background/60 rounded-full overflow-hidden border border-border/50">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${rank.progressInDivision * 100}%`,
                  background: rank.tier.gradient,
                  boxShadow: `0 0 8px ${rank.tier.glow}`,
                }}
              />
            </div>
          </div>

          {/* ── Rank ladder (all 5 tiers) ── */}
          <div className="flex items-center justify-between mt-4 gap-1">
            {TIERS.map((t, i) => {
              const isCurrent = t.name === rank.tier.name;
              const isReached = mystate.bookingCount >= t.minBookings;
              return (
                <div
                  key={t.name}
                  className="flex-1 flex flex-col items-center relative"
                  title={`${t.name} · ${t.minBookings.toLocaleString()}+ bookings · ${t.multiplier}× earn · ${t.globalPct}% of OPs`}
                >
                  {i > 0 && (
                    <div
                      className="absolute right-1/2 top-3 w-full h-px"
                      style={{ background: isReached ? t.ring : "rgba(0,0,0,0.08)" }}
                    />
                  )}
                  <div
                    className="relative h-6 w-6 rounded-full flex items-center justify-center text-xs z-10"
                    style={{
                      background: isReached ? t.gradient : "rgba(0,0,0,0.05)",
                      boxShadow: isCurrent
                        ? `0 0 0 2px ${t.ring}, 0 0 12px ${t.glow}`
                        : isReached
                          ? `0 0 0 1px ${t.ring}`
                          : undefined,
                      opacity: isReached ? 1 : 0.45,
                    }}
                  >
                    <span className={isReached ? "" : "grayscale"}>{t.icon}</span>
                  </div>
                  <p
                    className={`text-[9px] mt-1 ${isCurrent ? "font-bold" : isReached ? "" : "text-muted-foreground"}`}
                    style={isCurrent ? { color: t.color } : undefined}
                  >
                    {t.name}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ── Perks row (tier-specific benefits) ── */}
          <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-2 flex-wrap">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Tier perks</span>
            {rank.tier.perks.map(p => (
              <span
                key={p}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: `${rank.tier.color}15`, color: rank.tier.color, border: `1px solid ${rank.tier.color}33` }}
              >
                {p}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* ─────────── Tabs ──────────
       * Company Pool 탭: Master만 노출. OP에게는 보이지 않음.
       * 회사 단위 ELS 풀 운용 (정산 보너스, B2C Featured 리뷰 등 — 트리거 추후) */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="wallet"   className="gap-1.5"><Wallet className="h-3.5 w-3.5" />Wallet</TabsTrigger>
          <TabsTrigger value="stamps"   className="gap-1.5"><Trophy className="h-3.5 w-3.5" />Stamps <span className="ml-1 text-[9px] bg-muted px-1 rounded-full">{earnedStampsFor(userEmail).filter(s => s.earned).length}/{STAMPS.length}</span></TabsTrigger>
          <TabsTrigger value="shop"     className="gap-1.5"><Gift className="h-3.5 w-3.5" />Shop</TabsTrigger>
          <TabsTrigger value="vault"    className="gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />My Coupons <span className="ml-1 text-[9px] bg-muted px-1 rounded-full">{myVouchers.filter(v => v.status === "Active").length}</span></TabsTrigger>
          {user?.role === "Master" && (
            <TabsTrigger value="company" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" />Company Pool</TabsTrigger>
          )}
        </TabsList>
      </Tabs>

      {/* ─────────── COMPANY POOL tab (Master 전용) ─────────── */}
      {tab === "company" && user?.role === "Master" && (
        <CompanyPoolSection companyId={activeCompany.id} companyName={activeCompany.name} />
      )}

      {/* ─────────── SHOP tab ─────────── */}
      {tab === "shop" && (
        <>
          {/* Search + category */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by brand or name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-card"
            >
              {categories.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
            </select>
          </div>

          {myProducts.length === 0 ? (
            <Card className="p-10 text-center text-muted-foreground text-sm">No products match your filter.</Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {myProducts.map(p => {
                const affordable = mystate.balance >= p.pointsCost;
                return (
                  <Card
                    key={p.id}
                    className={`p-0 overflow-hidden transition-all ${affordable ? "hover:shadow-md hover:border-[#FF6000]/40" : "opacity-70"}`}
                  >
                    {/* Cover */}
                    <div
                      className="h-28 flex flex-col items-center justify-center text-white relative"
                      style={{ background: p.gradient }}
                    >
                      <span className="text-4xl">{p.emoji}</span>
                      <Badge className="absolute top-2 right-2 bg-white/25 text-white border-0 text-[9px]">
                        {p.brand}
                      </Badge>
                      {p.isBestSeller && (
                        <span
                          className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold text-white flex items-center gap-0.5 shadow-md"
                          style={{ background: "linear-gradient(90deg, #EF476F, #FF6000)" }}
                          title={p.monthlyRedemptions ? `${p.monthlyRedemptions.toLocaleString()} OPs redeemed this month` : "Top seller this month"}
                        >
                          🔥 Best Seller
                        </span>
                      )}
                    </div>
                    {/* Body */}
                    <div className="p-3">
                      <h3 className="text-sm font-semibold line-clamp-1">{p.name}</h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 min-h-[28px]">{p.description}</p>
                      {p.isBestSeller && p.monthlyRedemptions && (
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          👥 {p.monthlyRedemptions.toLocaleString()} redeemed this month
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="text-base font-bold" style={{ color: "#FF6000" }}>
                            {p.pointsCost}<span className="text-[10px] ml-0.5">P</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Face: {p.faceCurrency} {p.faceValue.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          disabled={!affordable}
                          onClick={() => setRedeemTarget(p)}
                          style={affordable ? { background: "#FF6000" } : undefined}
                          className={affordable ? "text-white h-7 text-xs" : "h-7 text-xs"}
                        >
                          {affordable ? "Redeem" : "Short"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─────────── VAULT tab ─────────── */}
      {tab === "vault" && (
        <div className="space-y-3">
          {myVouchers.length === 0 ? (
            <Card className="p-10 text-center text-sm text-muted-foreground">
              No vouchers yet. Redeem from the Shop tab to see your codes here.
            </Card>
          ) : (
            myVouchers.map(v => (
              <Card key={v.id} className={`p-4 ${v.status === "Used" ? "opacity-60" : v.status === "Expired" ? "opacity-40" : ""}`}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                    <div className="h-10 w-10 rounded-md flex items-center justify-center text-xl bg-muted">
                      🎁
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{v.productName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {v.brand} · Face {v.faceCurrency} {v.faceValue.toLocaleString()} · Redeemed {v.redeemedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[9px] uppercase text-muted-foreground">Code</p>
                      <div className="flex items-center gap-1">
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{v.voucherCode}</code>
                        <button
                          onClick={() => { navigator.clipboard.writeText(v.voucherCode); toast.success("Code copied"); }}
                          className="text-muted-foreground hover:text-foreground p-1"
                          aria-label="Copy code"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={v.status === "Active" ? "default" : v.status === "Used" ? "secondary" : "destructive"} className="text-[10px]">
                        {v.status}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">Expires {v.expiresAt}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ─────────── WALLET tab ─────────── */}
      {tab === "wallet" && (
        <div className="space-y-4">
          {/* ─── ELS expiring-soon banner (≤ 90 days from earn+24mo) ─── */}
          {(() => {
            const exp = expiringElsFor(userEmail, 90);
            if (exp.amount === 0) return null;
            const daysLeft = exp.soonestDate
              ? Math.max(1, Math.ceil((new Date(exp.soonestDate).getTime() - Date.now()) / 86400000))
              : 0;
            return (
              <Alert className="border-[#FF6000]/50" style={{ background: "#FF600008" }}>
                <AlertTitle className="flex items-center gap-2" style={{ color: "#FF6000" }}>
                  <Clock className="h-4 w-4" />
                  {exp.amount.toLocaleString()} ELS expiring in {daysLeft} day{daysLeft === 1 ? "" : "s"}
                </AlertTitle>
                <AlertDescription className="text-[11px] flex items-center justify-between gap-3 flex-wrap">
                  <span>
                    ELS expires <strong>{ELS_EXPIRY_MONTHS} months</strong> after earn date.
                    Use before <strong>{exp.soonestDate}</strong> to avoid loss.
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTab("shop")}
                    className="border-[#FF6000]/50"
                    style={{ color: "#FF6000" }}
                  >
                    Shop now <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </AlertDescription>
              </Alert>
            );
          })()}

          {/* ─── Expiry warning banner (coupons expiring ≤ 14d) ─── */}
          {(() => {
            const now = new Date();
            const in14d = new Date(now.getTime() + 14 * 86400000);
            const expiring = myVouchers.filter(v => {
              if (v.status !== "Active") return false;
              const exp = new Date(v.expiresAt);
              return exp >= now && exp <= in14d;
            });
            if (expiring.length === 0) return null;
            const soonest = expiring.sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))[0];
            const daysLeft = Math.max(1, Math.ceil((new Date(soonest.expiresAt).getTime() - now.getTime()) / 86400000));
            return (
              <Alert className="border-amber-500/60" style={{ background: "#fef3c7" }}>
                <AlertTitle className="flex items-center gap-2 text-amber-900">
                  <Clock className="h-4 w-4" />
                  {expiring.length} coupon{expiring.length === 1 ? "" : "s"} expiring soon
                </AlertTitle>
                <AlertDescription className="text-amber-900/90 flex items-center justify-between gap-3 flex-wrap">
                  <span>
                    <strong>{soonest.productName}</strong> ({soonest.brand}) expires in {daysLeft} day{daysLeft === 1 ? "" : "s"}
                    ({soonest.expiresAt}). Use it before it's gone.
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTab("vault")}
                    className="border-amber-700/50 text-amber-900 hover:bg-amber-100"
                  >
                    View My Coupons <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </AlertDescription>
              </Alert>
            );
          })()}

          {/* ─── What you can do with ELS (4 pillars) ─── */}
          <Card className="p-0 overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: "#FF6000" }} />
              <h2 className="text-sm font-semibold">What ELS does for you</h2>
              <span className="text-[10px] text-muted-foreground ml-auto">3 benefits · personal, non-transferable</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-y md:divide-y-0">
              {/* 1. Redeem local rewards */}
              <button
                onClick={() => setTab("shop")}
                className="p-4 text-left hover:bg-muted/40 transition-colors group"
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <div className="h-8 w-8 rounded-md flex items-center justify-center text-lg" style={{ background: "#FF600018" }}>
                    🎁
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm font-semibold">Redeem local rewards</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-1">
                  Starbucks, 배민, Grab, Rakuten — digital coupons from your own country.
                </p>
                <p className="text-[9px] mt-1.5 font-semibold" style={{ color: "#FF6000" }}>
                  Shop →
                </p>
              </button>

              {/* 2. Boosted at partner hotels */}
              <button
                onClick={() => navigate("/app/find-hotel")}
                className="p-4 text-left hover:bg-muted/40 transition-colors group"
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <div className="h-8 w-8 rounded-md flex items-center justify-center text-lg" style={{ background: "#EF476F18" }}>
                    ⚡
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm font-semibold">+10%/+15%/+20% at promo hotels</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-1">
                  Select hotels earn boosted ELS — look for the <span className="font-bold" style={{ color: "#EF476F" }}>⚡ badge</span> when booking.
                </p>
                <p className="text-[9px] mt-1.5 font-semibold" style={{ color: "#EF476F" }}>
                  Find hotels →
                </p>
              </button>

              {/* 3. Rank up + stamps */}
              <button
                onClick={() => setTab("stamps")}
                className="p-4 text-left hover:bg-muted/40 transition-colors group"
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <div className="h-8 w-8 rounded-md flex items-center justify-center text-lg" style={{ background: "#8b5cf618" }}>
                    🏆
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm font-semibold">Rank up + collect stamps</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-1">
                  Bronze → Diamond tier (1.5× earn) · 25 rarity-tiered stamps to conquer.
                </p>
                <p className="text-[9px] mt-1.5 font-semibold" style={{ color: "#8b5cf6" }}>
                  See passport →
                </p>
              </button>
            </div>
          </Card>

          {/* ─── Active Promo Hotels (drives bookings to boosted inventory) ─── */}
          {(() => {
            const activePromos = HOTEL_POINTS_BOOSTS
              .filter(b => hotelPointsBoost(b.hotelId))     /* auto-filter expired */
              .map(b => ({ boost: b, hotel: hotels.find(h => h.id === b.hotelId) }))
              .filter(x => !!x.hotel)
              .sort((a, b) => b.boost.multiplier - a.boost.multiplier);

            if (activePromos.length === 0) return null;

            return (
              <Card className="p-0 overflow-hidden" style={{ background: "linear-gradient(135deg, #EF476F08, #FF600008)" }}>
                <div className="px-4 py-3 border-b flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <h2 className="text-sm font-semibold">Active ELS Boosters · this week</h2>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {activePromos.length} hotel{activePromos.length === 1 ? "" : "s"} with multiplier
                  </span>
                </div>
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {activePromos.slice(0, 6).map(({ boost, hotel }) => {
                    const mgrad =
                      boost.multiplier >= 1.2  ? "linear-gradient(90deg,#EF476F,#FF6000)" :
                      boost.multiplier >= 1.15 ? "linear-gradient(90deg,#FF6000,#FFD166)" :
                      "linear-gradient(90deg,#8b5cf6,#a855f7)";
                    return (
                      <div
                        key={boost.hotelId}
                        className="p-3 rounded-md border bg-card relative overflow-hidden"
                      >
                        <span
                          className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                          style={{ background: mgrad }}
                        >
                          ⚡ {boost.label}
                        </span>
                        <p className="text-sm font-semibold truncate pr-14">{hotel!.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{hotel!.area}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                              Per $1,000 booking
                            </p>
                            <p className="text-sm font-bold" style={{ color: "#FF6000" }}>
                              {Math.max(1, Math.round(1000 * 0.01 * rank.tier.multiplier * boost.multiplier))} ELS
                            </p>
                          </div>
                          <span className="text-[9px] text-muted-foreground">
                            Ends {boost.expiresAt}
                          </span>
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1 italic line-clamp-1">
                          {boost.reason}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/app/hotel/${boost.hotelId}`)}
                          className="w-full mt-2 h-7 text-[11px] text-white"
                          style={{ background: "#FF6000" }}
                        >
                          Book now · {boost.label}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
                {activePromos.length > 6 && (
                  <div className="px-4 py-2 border-t text-center">
                    <button
                      onClick={() => navigate("/app/find-hotel")}
                      className="text-[11px] font-semibold text-[#FF6000] hover:underline"
                    >
                      View all {activePromos.length} promo hotels →
                    </button>
                  </div>
                )}
              </Card>
            );
          })()}

          {/* ─── Stamp Passport teaser (first 8, link to full Stamps tab) ─── */}
          {(() => {
            const allStamps = earnedStampsFor(userEmail);
            const earned = allStamps.filter(s => s.earned);
            const pct = Math.round((earned.length / allStamps.length) * 100);
            /* Show 4 most-recently-earned + next 4 unlocked-but-closest-to-completion */
            const recentEarned = [...earned].sort((a, b) => (b.earnedAt || "").localeCompare(a.earnedAt || "")).slice(0, 4);
            const almostThere = allStamps
              .filter(s => !s.earned && (s.progress ?? 0) > 0)
              .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))
              .slice(0, 4);
            const preview = [...recentEarned, ...almostThere];
            return (
              <Card
                className="p-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setTab("stamps")}
                style={{ background: "repeating-linear-gradient(45deg, #f8f5ee, #f8f5ee 14px, #f2ede1 14px, #f2ede1 15px)" }}
              >
                <div className="p-4 border-b border-dashed border-amber-700/30 flex items-center gap-2 bg-white/50">
                  <Trophy className="h-4 w-4 text-amber-700" />
                  <h2 className="text-sm font-semibold text-amber-900">My Stamp Passport</h2>
                  <Badge variant="outline" className="text-[10px] border-amber-700/50 text-amber-900">
                    {earned.length} / {allStamps.length} · {pct}%
                  </Badge>
                  <span className="ml-auto text-[10px] text-amber-800 font-semibold flex items-center gap-0.5">
                    View all <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
                <div className="p-4 grid grid-cols-4 md:grid-cols-8 gap-3">
                  {preview.map(({ stamp, earned, earnedAt }) => (
                    <div key={stamp.id} className="flex flex-col items-center text-center" title={`${stamp.title} · ${stamp.hint}`}>
                      <div
                        className="relative h-12 w-12 rounded-full flex items-center justify-center text-xl"
                        style={earned ? {
                          background: `radial-gradient(circle at 30% 30%, ${stamp.accent}40, ${stamp.accent}15)`,
                          boxShadow: RARITY_META[stamp.rarity].ringShadow,
                          transform: `rotate(${(stamp.id.length * 7) % 11 - 5}deg)`,
                        } : undefined}
                      >
                        <span className={earned ? "" : "opacity-30 grayscale"}>{stamp.emoji}</span>
                        {!earned && (
                          <span className="absolute inset-0 rounded-full border-2 border-dashed border-amber-700/30" />
                        )}
                      </div>
                      <p className={`text-[9px] mt-1 leading-tight line-clamp-2 ${earned ? "font-semibold text-amber-900" : "text-muted-foreground"}`}>
                        {stamp.title}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-dashed border-amber-700/30 bg-white/40 text-[10px] text-amber-900/80 italic">
                  족적을 남기다 · Showing recent + next-to-earn. Tap to see all {allStamps.length} stamps.
                </div>
              </Card>
            );
          })()}

          {/* Unified transaction history */}
          <Card className="p-0">
            <div className="p-4 border-b flex items-center gap-2 flex-wrap">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Wallet Activity</h2>
              <Badge variant="outline" className="text-[10px]">{allTx.length} entries</Badge>
              <span className="text-[10px] text-muted-foreground">1 ELS = 1 USD</span>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto h-7 text-[11px] gap-1"
                onClick={exportCsv}
                disabled={allTx.length === 0}
                title="Export all transactions as CSV (for accounting or personal records)"
              >
                <Download className="h-3 w-3" />
                Export CSV
              </Button>
            </div>
            <div className="divide-y">
              {allTx.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  No activity yet. Earn ELS on your first booking.
                </p>
              ) : (
                allTx.map(tx => {
                  const isCredit = tx.amount > 0;
                  return (
                    <div key={tx.id} className="p-3 flex items-center justify-between gap-3 hover:bg-muted/30">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-md flex items-center justify-center bg-muted">
                          {tx.type === "Earned-Welcome" ? "🎉" :
                           tx.type === "Earned-Milestone" ? "🏆" :
                           tx.type === "Earned-Booking" ? <Flame className="h-4 w-4 text-[#FF6000]" /> :
                           tx.type === "Earned-Tier-Bonus" ? <Sparkles className="h-4 w-4 text-[#FF6000]" /> :
                           tx.type === "Used-Redeem" ? <Gift className="h-4 w-4" /> :
                           <Clock className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm truncate">{tx.description}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {tx.date} · {tx.type.replace(/-/g, " ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <p className={`text-sm font-semibold ${isCredit ? "text-green-600" : "text-destructive"}`}>
                          {isCredit ? "+" : ""}{tx.amount} ELS
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          ≈ US${Math.abs(tx.amount).toFixed(2)} · Bal {tx.balance}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ─────────── STAMPS tab — full passport ─────────── */}
      {tab === "stamps" && (() => {
        const allStamps = earnedStampsFor(userEmail);
        const earnedCount = allStamps.filter(s => s.earned).length;
        const pct = Math.round((earnedCount / allStamps.length) * 100);

        /* Group by category for structured browsing */
        const byCat: Record<string, typeof allStamps> = {};
        allStamps.forEach(s => {
          (byCat[s.stamp.category] = byCat[s.stamp.category] || []).push(s);
        });
        const catOrder: Array<keyof typeof byCat> = ["First", "Milestone", "Tier", "Explorer", "Habit"];
        const catMeta: Record<string, { label: string; icon: string; desc: string }> = {
          First:     { label: "First-Times",   icon: "🎯", desc: "Entry-level · complete these to begin your journey" },
          Milestone: { label: "Booking Milestones", icon: "🏆", desc: "The grind — each threshold 5× harder than the last" },
          Tier:      { label: "Tier Ranks",    icon: "👑", desc: "Status rewards with earn-rate multipliers" },
          Explorer:  { label: "Explorer",      icon: "🌍", desc: "Geographic conquest — book across countries" },
          Habit:     { label: "Loyalty",       icon: "🔥", desc: "Long-game — years with DOTBIZ" },
        };

        /* Rarity roll-up */
        const rarityCounts = (["Common","Rare","Epic","Legendary","Mythic"] as StampRarity[]).map(r => ({
          rarity: r,
          earned: allStamps.filter(s => s.earned && s.stamp.rarity === r).length,
          total:  allStamps.filter(s => s.stamp.rarity === r).length,
        }));

        return (
          <div className="space-y-4">
            {/* Conquest header */}
            <Card
              className="p-5 overflow-hidden relative"
              style={{
                background: "repeating-linear-gradient(45deg, #f8f5ee, #f8f5ee 14px, #f2ede1 14px, #f2ede1 15px)",
              }}
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-700" />
                    Stamp Passport
                  </h2>
                  <p className="text-[11px] text-amber-800/80 italic">
                    족적을 남기다 · Some stamps take years. Some may never be earned.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-amber-900">{earnedCount}<span className="text-base text-amber-700/70">/{allStamps.length}</span></p>
                  <p className="text-[10px] text-amber-800/70 uppercase tracking-wider">{pct}% complete</p>
                </div>
              </div>

              {/* Overall progress bar */}
              <div className="h-2 bg-white/60 rounded-full mt-3 overflow-hidden border border-amber-700/20">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, #06D6A0, #FFD166, #FF6000, #EF476F, #8b5cf6)",
                  }}
                />
              </div>

              {/* Rarity roll-up */}
              <div className="grid grid-cols-5 gap-2 mt-4">
                {rarityCounts.map(({ rarity, earned, total }) => {
                  const m = RARITY_META[rarity];
                  return (
                    <div key={rarity} className="text-center">
                      <div
                        className="h-1 rounded-full mb-1"
                        style={{ background: m.color, opacity: earned > 0 ? 1 : 0.2 }}
                      />
                      <p className="text-[10px] font-bold" style={{ color: m.color }}>{rarity}</p>
                      <p className="text-[10px] text-amber-900/70">{earned} / {total}</p>
                    </div>
                  );
                })}
              </div>

              {/* ELS earned from stamps + potential */}
              {(() => {
                const earnedEls = allStamps.filter(s => s.earned).reduce((sum, s) => sum + s.stamp.bonusEls, 0);
                const lockedEls = allStamps.filter(s => !s.earned).reduce((sum, s) => sum + s.stamp.bonusEls, 0);
                return (
                  <div className="mt-4 pt-3 border-t border-dashed border-amber-700/30 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-amber-800/70">ELS from stamps</p>
                      <p className="text-lg font-bold" style={{ color: "#FF6000" }}>
                        +{earnedEls.toLocaleString()} ELS earned
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-amber-800/70">Still locked</p>
                      <p className="text-lg font-bold text-amber-800/60">
                        {lockedEls.toLocaleString()} ELS
                      </p>
                    </div>
                  </div>
                );
              })()}
            </Card>

            {/* Per-category sections */}
            {catOrder.map(cat => {
              const items = byCat[cat];
              if (!items) return null;
              const catEarned = items.filter(i => i.earned).length;
              return (
                <Card key={cat} className="p-0 overflow-hidden">
                  <div className="p-4 border-b flex items-center gap-2">
                    <span className="text-xl">{catMeta[cat].icon}</span>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold">{catMeta[cat].label}</h3>
                      <p className="text-[10px] text-muted-foreground">{catMeta[cat].desc}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {catEarned} / {items.length}
                    </Badge>
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {items.map(({ stamp, earned, earnedAt, progress, progressLabel }) => {
                      const rm = RARITY_META[stamp.rarity];
                      const progressPct = Math.round((progress ?? 0) * 100);
                      return (
                        <div
                          key={stamp.id}
                          className={`relative rounded-lg border p-3 flex gap-3 transition-all ${
                            earned
                              ? "bg-card hover:shadow-md"
                              : "bg-muted/30 border-dashed opacity-90"
                          }`}
                          style={earned ? { borderColor: rm.color } : undefined}
                        >
                          {/* Rarity chip */}
                          <span
                            className="absolute top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                            style={{
                              background: `${rm.color}22`,
                              color: rm.color,
                              border: `1px solid ${rm.color}55`,
                            }}
                          >
                            {stamp.rarity}
                          </span>

                          {/* Stamp visual */}
                          <div className="shrink-0">
                            <div
                              className="relative h-14 w-14 rounded-full flex items-center justify-center text-3xl"
                              style={earned ? {
                                background: `radial-gradient(circle at 30% 30%, ${stamp.accent}50, ${stamp.accent}15)`,
                                boxShadow: rm.ringShadow,
                                transform: `rotate(${(stamp.id.length * 7) % 11 - 5}deg)`,
                              } : {
                                background: "transparent",
                                border: "2px dashed rgba(0,0,0,0.15)",
                              }}
                            >
                              <span className={earned ? "" : "opacity-25 grayscale"}>
                                {earned ? stamp.emoji : "🔒"}
                              </span>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="flex-1 min-w-0 pr-10">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-sm font-semibold ${earned ? "" : "text-muted-foreground"}`}>
                                {stamp.title}
                              </p>
                              {/* ELS reward chip */}
                              <span
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                                style={{
                                  background: earned ? "#FF600022" : "#94a3b822",
                                  color: earned ? "#FF6000" : "#64748b",
                                  border: `1px solid ${earned ? "#FF600055" : "#94a3b855"}`,
                                }}
                                title={earned ? "ELS awarded when this stamp was earned" : "Reward for earning this stamp"}
                              >
                                {earned ? "+" : ""}{stamp.bonusEls} ELS
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                              {stamp.hint}
                            </p>

                            {/* Progress for locked stamps */}
                            {!earned && (progress ?? 0) > 0 && (
                              <div className="mt-1.5">
                                <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                                  <span>{progressLabel}</span>
                                  <span className="font-mono">{progressPct}%</span>
                                </div>
                                <div className="h-1 bg-muted rounded-full mt-0.5 overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${progressPct}%`, background: rm.color }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Earned date / social proof */}
                            <div className="flex items-center justify-between mt-1.5">
                              {earned && earnedAt ? (
                                <p className="text-[9px] text-green-700 font-mono flex items-center gap-1">
                                  <CheckCircle2 className="h-2.5 w-2.5" /> {earnedAt}
                                </p>
                              ) : (
                                <p className="text-[9px] text-muted-foreground italic">Locked</p>
                              )}
                              <p className="text-[9px] text-muted-foreground" title="Global OPs who've earned this stamp">
                                👥 {stamp.globalEarnedPct}%
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}

            {/* Bottom motivational strip */}
            <Card className="p-4 text-center" style={{ background: "linear-gradient(135deg, #FF600010, #8b5cf610)" }}>
              <p className="text-sm font-semibold">
                Keep booking. Keep conquering. 🏆
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Only <strong>{Math.round((1 - pct / 100) * allStamps.length)}</strong> stamps left.
                The rarest are earned over years — every booking through DOTBIZ counts toward them.
              </p>
            </Card>
          </div>
        );
      })()}

      {/* ─────────── Redeem confirmation ─────────── */}
      <AlertDialog open={!!redeemTarget} onOpenChange={(o) => !o && setRedeemTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Redeem {redeemTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll be charged <strong>{redeemTarget?.pointsCost} P</strong> from your balance of <strong>{mystate.balance} P</strong>. You'll receive a{" "}
              {redeemTarget?.deliveryMethod === "email-code" ? "code by email" :
               redeemTarget?.deliveryMethod === "in-app-voucher" ? "coupon in your My Coupons tab" :
               "barcode"}
              . Face value: <strong>{redeemTarget?.faceCurrency} {redeemTarget?.faceValue.toLocaleString()}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={doRedeem}
              disabled={!canAfford}
              style={canAfford ? { background: "#FF6000" } : undefined}
              className={canAfford ? "text-white" : ""}
            >
              Confirm Redeem
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─────────── Redeemed success dialog ─────────── */}
      <Dialog open={!!redeemedVoucher} onOpenChange={(o) => !o && setRedeemedVoucher(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />Redeemed!
            </DialogTitle>
          </DialogHeader>
          {redeemedVoucher && (
            <div className="space-y-3">
              <p className="text-sm">
                You redeemed <strong>{redeemedVoucher.productName}</strong> ({redeemedVoucher.brand}).
                Your coupon is now in the <strong>My Coupons</strong> tab.
              </p>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-[10px] uppercase text-muted-foreground">Coupon Code</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm font-mono flex-1 bg-background border rounded px-2 py-1.5">{redeemedVoucher.voucherCode}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { navigator.clipboard.writeText(redeemedVoucher.voucherCode); toast.success("Code copied"); }}
                  >
                    <Copy className="h-3 w-3 mr-1" />Copy
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Face value {redeemedVoucher.faceCurrency} {redeemedVoucher.faceValue.toLocaleString()} · Expires {redeemedVoucher.expiresAt}
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => { setRedeemedVoucher(null); setTab("vault"); }}>
                  View My Coupons
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}

/* ═════════════════════════════════════════════════
 * Company Pool 섹션 (Master 전용)
 *
 * 개념:
 *   • 개인 OP ELS와 별개의 회사 단위 풀
 *   • 적립 트리거: 정산 우수, 분쟁 0건, B2C Featured 리뷰 등 (수치 추후)
 *   • 사용 출구: OP 분배 / Charity / 회사 이벤트
 *   • Master만 운용 가능
 *
 * 현재는 골격 UI. Distribute / Donate 액션은 Toast로만 시뮬레이션.
 * 트리거 정의 + 수치는 마케팅팀과 협의 후 결정.
 * ═════════════════════════════════════════════════ */
function CompanyPoolSection({ companyId, companyName }: { companyId: string; companyName: string }) {
  const pool = companyPoolFor(companyId);
  const history = companyPoolHistoryFor(companyId);

  if (!pool) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        Company Pool이 아직 활성화되지 않았습니다. ELLIS와 협의해주세요.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pool 잔액 카드 */}
      <Card className="p-5" style={{ background: "linear-gradient(135deg, rgba(255,96,0,0.06), rgba(255,140,0,0.02))" }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{companyName} · Company Pool</p>
            <p className="text-4xl font-bold mt-1">{pool.balance.toLocaleString()} <span className="text-lg font-normal text-muted-foreground">ELS</span></p>
            <p className="text-xs text-muted-foreground mt-1">≈ ${pool.balance.toLocaleString()} USD (1 ELS = 1 USD)</p>
          </div>
          <Badge variant="outline" className="text-[10px]">Master 전용</Badge>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">누적 적립</p>
            <p className="text-sm font-semibold">+{pool.totalEarned.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">OP 분배</p>
            <p className="text-sm font-semibold text-blue-600">−{pool.totalDistributed.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Charity 기부</p>
            <p className="text-sm font-semibold text-green-600">−{pool.totalCharity.toLocaleString()}</p>
          </div>
        </div>
      </Card>

      {/* 적립 트리거 안내 (수치 추후) */}
      <Card className="p-4">
        <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          적립 트리거 (수치는 추후 결정)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {[
            { trigger: "정산 우수 (월간 분쟁 0건)", note: "Master 회사 단위 보너스" },
            { trigger: "B2C Featured 리뷰", note: "OP 리뷰가 신디케이션 노출되면 회사 풀에도 매칭 보너스" },
            { trigger: "월간 회사 미션 달성", note: "분기별 챌린지 (예: 신규 호텔 N개 예약)" },
            { trigger: "장기 파트너십 보상", note: "연 단위 누적 거래 보너스" },
          ].map(t => (
            <div key={t.trigger} className="border rounded p-2 bg-muted/30">
              <p className="font-medium">{t.trigger}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t.note}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">
          * 적립 금액과 적용 시점은 마케팅팀 · CFO 협의 후 확정. 어드민 페이지에서 트리거별 수치 설정.
        </p>
      </Card>

      {/* 사용 액션 — 분배 / 기부 / 이벤트 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4">
          <h3 className="text-sm font-bold mb-1 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-blue-500" />
            OP 분배
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            우수 OP에게 회사 풀에서 ELS 보너스 지급. 분배 시 OP 개인 ELS로 전환되어 만료/사용 규칙 적용.
          </p>
          <Button size="sm" variant="outline" className="w-full" disabled={pool.balance === 0}
            onClick={() => toast.info("OP 분배", { description: "분배 다이얼로그는 골격만 — 마케팅팀 협의 후 활성화" })}>
            분배하기
          </Button>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-bold mb-1 flex items-center gap-1.5">
            <HeartIcon /> Charity 기부
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            DOTBIZ 파트너 자선 단체에 기부. 1 ELS = 1 USD 매칭 (잠정).
          </p>
          <Button size="sm" variant="outline" className="w-full" disabled={pool.balance === 0}
            onClick={() => toast.info("Charity 기부", { description: "파트너 단체 선정은 추후 마케팅팀 협의" })}>
            단체 선택
          </Button>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-bold mb-1 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-purple-500" />
            회사 이벤트
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            워크숍, 단체 활동 등 회사 차원 사용. 사용 내역은 변경 이력에 기록.
          </p>
          <Button size="sm" variant="outline" className="w-full" disabled={pool.balance === 0}
            onClick={() => toast.info("회사 이벤트", { description: "이벤트 카탈로그 추후 구성" })}>
            사용하기
          </Button>
        </Card>
      </div>

      {/* Charity 파트너 미리보기 */}
      <Card className="p-4">
        <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
          <HeartIcon /> Charity 파트너 (예시 — 추후 마케팅팀 협의)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {charityOrgs.map(c => (
            <div key={c.id} className="border rounded-md p-3 bg-muted/20">
              <p className="font-medium text-xs">{c.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{c.cause} · {c.region}</p>
              <p className="text-[10px] text-muted-foreground mt-1.5">{c.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 거래 내역 */}
      <Card className="p-4">
        <h3 className="text-sm font-bold mb-2">Pool 거래 내역</h3>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">아직 거래 내역이 없습니다.</p>
        ) : (
          <div className="space-y-1.5">
            {history.map(t => (
              <div key={t.id} className="flex items-center justify-between text-xs border-b pb-1.5">
                <div>
                  <p className="font-medium">{t.description}</p>
                  <p className="text-[10px] text-muted-foreground">{t.date} · {t.type}</p>
                </div>
                <span className={`font-semibold ${t.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                  {t.amount > 0 ? "+" : ""}{t.amount} ELS
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 정책 안내 */}
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertTitle className="text-sm">Company Pool 운용 원칙</AlertTitle>
        <AlertDescription className="text-xs space-y-1">
          <p>· Master만 조회·운용 권한. OP에게는 노출되지 않음.</p>
          <p>· 회사 외부 송금 불가 (개인 ELS와 동일 비양도 정책).</p>
          <p>· 모든 사용 내역은 어드민 변경 이력에 기록.</p>
          <p>· 적립 트리거 · 수치 · Charity 파트너는 마케팅팀과 추후 결정.</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}

/* Charity 아이콘 — Heart inline (lucide Heart import 추가 회피) */
function HeartIcon() {
  return (
    <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-7-5-9-9.5C1 8 3 4 7 4c2 0 3.5 1 5 2.5C13.5 5 15 4 17 4c4 0 6 4 4 7.5C19 16 12 21 12 21z" />
    </svg>
  );
}
