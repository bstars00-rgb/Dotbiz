import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Gift, RefreshCw, Sparkles, TrendingUp, Clock, Copy, CheckCircle2, Search,
  Trophy, Flame, Wallet, ArrowUpRight, ArrowDownLeft, ArrowRight, Send, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useScreenState } from "@/hooks/useScreenState";
import { useTabParam } from "@/hooks/useTabParam";
import { StateToolbar } from "@/components/StateToolbar";
import { useAuth } from "@/contexts/AuthContext";
import { companies, currentCompany } from "@/mocks/companies";
import { hotels } from "@/mocks/hotels";
import {
  rewardProducts, userPointsState, pointsHistoryFor, vouchersFor,
  countryCodeFor, TIERS, tierDivisionFor,
  ELS_DAILY_TRANSFER_LIMIT, formatEls, elsDirectoryFor, earnedStampsFor,
  STAMPS, RARITY_META, type StampRarity,
  HOTEL_POINTS_BOOSTS, hotelPointsBoost,
  type RewardProduct, type UserPointsState, type RedeemedVoucher, type PointsTransaction,
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

  /* ── Local transaction log (so Send shows up immediately) ── */
  const [localTx, setLocalTx] = useState<PointsTransaction[]>([]);
  const allTx = useMemo(
    () => [...localTx, ...pointsHistoryFor(userEmail)].sort((a, b) => b.date.localeCompare(a.date)),
    [localTx, userEmail]
  );

  /* ── Send ELS flow ── */
  const directory = useMemo(
    () => elsDirectoryFor().filter(d => d.email !== userEmail),
    [userEmail]
  );
  const [sendOpen, setSendOpen] = useState(false);
  const [sendRecipient, setSendRecipient] = useState<{ email: string; name: string; company: string; country: string } | null>(null);
  const [sendQuery, setSendQuery] = useState("");
  const [sendAmount, setSendAmount] = useState<string>("");
  const [sendReason, setSendReason] = useState("");

  /* Recent recipients — derived from local + historical Sent-Transfer txs.
   * Dedup by counterparty email, sort by most recent, limit 3. */
  const recentRecipients = useMemo(() => {
    const sent = allTx.filter(t => t.type === "Sent-Transfer" && t.counterpartyEmail);
    const seen = new Set<string>();
    const list: { email: string; name: string; company: string; country: string }[] = [];
    for (const tx of sent) {
      if (!tx.counterpartyEmail || seen.has(tx.counterpartyEmail)) continue;
      const dirEntry = directory.find(d => d.email === tx.counterpartyEmail);
      if (dirEntry) {
        list.push(dirEntry);
        seen.add(tx.counterpartyEmail);
      }
      if (list.length >= 3) break;
    }
    return list;
  }, [allTx, directory]);

  const filteredDirectory = useMemo(() => {
    const q = sendQuery.trim().toLowerCase();
    if (!q) return directory.slice(0, 8);
    return directory.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q) ||
      d.company.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [directory, sendQuery]);

  const sendAmountNum = Number(sendAmount) || 0;
  const todaySent = allTx
    .filter(t => t.type === "Sent-Transfer" && t.date === new Date().toISOString().slice(0, 10))
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const remainingDaily = Math.max(0, ELS_DAILY_TRANSFER_LIMIT - todaySent);

  const sendError =
    !sendRecipient ? "Select a recipient" :
    sendAmountNum <= 0 ? "Enter an amount" :
    sendAmountNum > mystate.balance ? "Insufficient ELS balance" :
    sendAmountNum > remainingDaily ? `Exceeds daily limit (${remainingDaily} ELS left today)` :
    !sendReason.trim() ? "Reason is required" :
    "";

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
    const header = ["Date", "Type", "Description", "Amount (ELS)", "Balance", "Counterparty", "Reason", "Booking ID", "Product ID"];
    const rows = allTx.map(t => [
      t.date,
      t.type,
      t.description,
      t.amount,
      t.balance,
      t.counterpartyName || t.counterpartyEmail || "",
      t.transferReason || "",
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

  const doSend = () => {
    if (sendError || !sendRecipient) return;
    const now = new Date().toISOString().slice(0, 10);
    const newBal = mystate.balance - sendAmountNum;
    const tx: PointsTransaction = {
      id: `ptx-local-${Date.now()}`,
      userEmail,
      date: now,
      type: "Sent-Transfer",
      description: `Sent ${sendAmountNum} ELS to ${sendRecipient.name}`,
      amount: -sendAmountNum,
      balance: newBal,
      counterpartyEmail: sendRecipient.email,
      counterpartyName: sendRecipient.name,
      transferReason: sendReason.trim(),
    };
    setMystate(s => ({ ...s, balance: newBal }));
    setLocalTx(prev => [tx, ...prev]);
    setSendOpen(false);
    setSendRecipient(null);
    setSendAmount("");
    setSendReason("");
    setSendQuery("");
    toast.success(`Sent ${sendAmountNum} ELS to ${sendRecipient.name}`, {
      description: `≈ US$${sendAmountNum.toFixed(2)} · They'll see it in their wallet instantly.`,
    });
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
          Your personal <strong className="text-[#FF6000]">ELS</strong> coins — earned on every booking.
          Send to other OPs, redeem for local rewards, and collect{" "}
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
              <span className="font-mono">$100</span> booking →{" "}
              <strong style={{ color: rank.tier.color }}>
                {Math.round(100 * rank.tier.multiplier)} ELS
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
              💡 Boost stacks: Gold(1.2×) × Hotel 3× promo = <strong>3.6×</strong> on that booking
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

      {/* ─────────── Tabs ─────────── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="wallet"   className="gap-1.5"><Wallet className="h-3.5 w-3.5" />Wallet</TabsTrigger>
          <TabsTrigger value="stamps"   className="gap-1.5"><Trophy className="h-3.5 w-3.5" />Stamps <span className="ml-1 text-[9px] bg-muted px-1 rounded-full">{earnedStampsFor(userEmail).filter(s => s.earned).length}/{STAMPS.length}</span></TabsTrigger>
          <TabsTrigger value="shop"     className="gap-1.5"><Gift className="h-3.5 w-3.5" />Shop</TabsTrigger>
          <TabsTrigger value="vault"    className="gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />My Coupons <span className="ml-1 text-[9px] bg-muted px-1 rounded-full">{myVouchers.filter(v => v.status === "Active").length}</span></TabsTrigger>
        </TabsList>
      </Tabs>

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
              <span className="text-[10px] text-muted-foreground ml-auto">4 benefits · unlocked from day 1</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0">
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

              {/* 2. Send to teammates */}
              <button
                onClick={() => setSendOpen(true)}
                className="p-4 text-left hover:bg-muted/40 transition-colors group"
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <div className="h-8 w-8 rounded-md flex items-center justify-center text-lg" style={{ background: "#06D6A018" }}>
                    💸
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm font-semibold">Send to teammates</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-1">
                  1 ELS = 1 USD · free transfers · share with other OPs for handovers or thanks.
                </p>
                <p className="text-[9px] mt-1.5 font-semibold text-green-600">
                  Send now →
                </p>
              </button>

              {/* 3. Boosted at partner hotels */}
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
                <p className="text-sm font-semibold">2×/3×/5× at promo hotels</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-1">
                  Select hotels earn multiplied ELS — look for the <span className="font-bold" style={{ color: "#EF476F" }}>⚡ badge</span> when booking.
                </p>
                <p className="text-[9px] mt-1.5 font-semibold" style={{ color: "#EF476F" }}>
                  Find hotels →
                </p>
              </button>

              {/* 4. Rank up + stamps */}
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
                      boost.multiplier === 5 ? "linear-gradient(90deg,#EF476F,#FF6000)" :
                      boost.multiplier === 3 ? "linear-gradient(90deg,#FF6000,#FFD166)" :
                      "linear-gradient(90deg,#8b5cf6,#a855f7)";
                    return (
                      <button
                        key={boost.hotelId}
                        onClick={() => navigate(`/app/hotel/${boost.hotelId}`)}
                        className="p-3 rounded-md border bg-card hover:shadow-md transition-all text-left group relative overflow-hidden"
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
                              Per $100 booking
                            </p>
                            <p className="text-sm font-bold" style={{ color: "#FF6000" }}>
                              {Math.round(100 * rank.tier.multiplier * boost.multiplier)} ELS
                            </p>
                          </div>
                          <span className="text-[9px] text-muted-foreground">
                            Ends {boost.expiresAt}
                          </span>
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1 italic line-clamp-1">
                          {boost.reason}
                        </p>
                        <p className="text-[10px] font-semibold mt-1.5 flex items-center gap-0.5" style={{ color: "#FF6000" }}>
                          Book now to earn {boost.multiplier}× ELS
                          <ArrowRight className="h-3 w-3" />
                        </p>
                      </button>
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

          {/* Send / Receive CTA row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card
              className="p-4 cursor-pointer hover:shadow-md transition-shadow border-[#FF6000]/30"
              onClick={() => setSendOpen(true)}
              style={{ background: "linear-gradient(135deg, #FF600018, transparent)" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: "#FF6000" }}>
                    <Send className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Send ELS</p>
                    <p className="text-[11px] text-muted-foreground">
                      Transfer to any OP · free · {remainingDaily.toLocaleString()} ELS remaining today
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-[#FF6000]" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted">
                    <ArrowDownLeft className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Receive ELS</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{userEmail}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { navigator.clipboard.writeText(userEmail); toast.success("Wallet address copied"); }}
                >
                  <Copy className="h-3 w-3 mr-1" />Copy
                </Button>
              </div>
            </Card>
          </div>

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
                  No activity yet. Earn ELS on your first booking or receive from another OP.
                </p>
              ) : (
                allTx.map(tx => {
                  const isCredit = tx.amount > 0;
                  const iconBg =
                    tx.type === "Received-Transfer" ? "bg-green-100 dark:bg-green-950" :
                    tx.type === "Sent-Transfer" ? "bg-orange-100 dark:bg-orange-950" :
                    "bg-muted";
                  return (
                    <div key={tx.id} className="p-3 flex items-center justify-between gap-3 hover:bg-muted/30">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-8 w-8 rounded-md flex items-center justify-center ${iconBg}`}>
                          {tx.type === "Earned-Welcome" ? "🎉" :
                           tx.type === "Earned-Milestone" ? "🏆" :
                           tx.type === "Earned-Booking" ? <Flame className="h-4 w-4 text-[#FF6000]" /> :
                           tx.type === "Earned-Tier-Bonus" ? <Sparkles className="h-4 w-4 text-[#FF6000]" /> :
                           tx.type === "Used-Redeem" ? <Gift className="h-4 w-4" /> :
                           tx.type === "Sent-Transfer" ? <ArrowUpRight className="h-4 w-4 text-[#FF6000]" /> :
                           tx.type === "Received-Transfer" ? <ArrowDownLeft className="h-4 w-4 text-green-600" /> :
                           <Clock className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm truncate">{tx.description}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {tx.date} · {tx.type.replace(/-/g, " ")}
                            {tx.transferReason && <> · <span className="italic">"{tx.transferReason}"</span></>}
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
                            <p className={`text-sm font-semibold ${earned ? "" : "text-muted-foreground"}`}>
                              {stamp.title}
                            </p>
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

      {/* ─────────── Send ELS Dialog ─────────── */}
      <Dialog open={sendOpen} onOpenChange={(o) => { setSendOpen(o); if (!o) { setSendRecipient(null); setSendQuery(""); setSendAmount(""); setSendReason(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-4 w-4" style={{ color: "#FF6000" }} />
              Send ELS to another OP
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Step 1: Recipient */}
            {!sendRecipient ? (
              <div>
                <label className="text-xs font-medium">Recipient</label>

                {/* Recent recipients chips — one-click select */}
                {recentRecipients.length > 0 && !sendQuery && (
                  <div className="mt-1.5 mb-2">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">
                      Recent
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {recentRecipients.map(r => (
                        <button
                          key={r.email}
                          onClick={() => setSendRecipient(r)}
                          className="px-2.5 py-1 rounded-full border text-[11px] hover:bg-muted/60 hover:border-[#FF6000]/40 transition-colors flex items-center gap-1"
                          title={`${r.email} · ${r.company}`}
                        >
                          <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold">
                            {r.name.slice(0, 1).toUpperCase()}
                          </span>
                          {r.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative mt-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search by name, email, or company…"
                    value={sendQuery}
                    onChange={e => setSendQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="mt-2 border rounded-md max-h-56 overflow-y-auto divide-y">
                  {filteredDirectory.length === 0 ? (
                    <p className="p-4 text-center text-xs text-muted-foreground">No matches</p>
                  ) : filteredDirectory.map(r => (
                    <button
                      key={r.email}
                      onClick={() => setSendRecipient(r)}
                      className="w-full text-left p-2 hover:bg-muted/60 flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{r.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{r.email} · {r.company}</p>
                      </div>
                      <span className="text-xs shrink-0 ml-2">{r.country}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="p-3 bg-muted rounded-md flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{sendRecipient.name}</p>
                    <p className="text-[11px] text-muted-foreground">{sendRecipient.email}</p>
                    <p className="text-[10px] text-muted-foreground">{sendRecipient.company} · {sendRecipient.country}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setSendRecipient(null)}>Change</Button>
                </div>

                <div>
                  <label className="text-xs font-medium">Amount (ELS)</label>
                  <div className="relative mt-1">
                    <span className="absolute right-3 top-2 text-xs text-muted-foreground">
                      ≈ US${sendAmountNum.toFixed(2)}
                    </span>
                    <Input
                      type="number"
                      min={1}
                      max={Math.min(mystate.balance, remainingDaily)}
                      value={sendAmount}
                      onChange={e => setSendAmount(e.target.value)}
                      placeholder="0"
                      className="pr-24"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                    <span>Available: {mystate.balance.toLocaleString()} ELS</span>
                    <span>Daily remaining: {remainingDaily.toLocaleString()} / {ELS_DAILY_TRANSFER_LIMIT.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium">Reason <span className="text-destructive">*</span></label>
                  <Input
                    className="mt-1"
                    placeholder="e.g. Shared booking handover, team bonus…"
                    value={sendReason}
                    onChange={e => setSendReason(e.target.value)}
                    maxLength={80}
                  />
                  <p className="text-[9px] text-muted-foreground mt-1">
                    Required for audit log. Both wallets will show this note.
                  </p>
                </div>

                {sendError && sendAmountNum > 0 && (
                  <p className="text-[11px] text-destructive">{sendError}</p>
                )}

                <div className="p-2 bg-[#FF6000]/5 border border-[#FF6000]/20 rounded-md text-[10px] text-muted-foreground">
                  Transfers are <strong>free</strong> (0% fee). Pegged 1 ELS = 1 USD.
                  Recipient sees instantly — no reversals.
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendOpen(false)}>Cancel</Button>
            <Button
              onClick={doSend}
              disabled={!!sendError}
              style={!sendError ? { background: "#FF6000" } : undefined}
              className={!sendError ? "text-white" : ""}
            >
              {sendRecipient && sendAmountNum > 0 ? `Send ${sendAmountNum} ELS` : "Send ELS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
