import { useMemo, useState, useEffect } from "react";
import {
  Gift, RefreshCw, Sparkles, TrendingUp, Clock, Copy, CheckCircle2, Search,
  Trophy, Flame,
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
import {
  rewardProducts, userPointsState, pointsHistoryFor, vouchersFor,
  POINTS_EARN_RATE, MILESTONES, TIERS, tierFor, nextTier, countryCodeFor,
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
  const [tab, setTab] = useTabParam("shop");

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

  const tier = tierFor(mystate.bookingCount);
  const next = nextTier(mystate.bookingCount);
  const earnRate = POINTS_EARN_RATE[countryCode];

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
          <Sparkles className="h-6 w-6" style={{ color: "#FF6000" }} />
          Rewards Mall
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your personal points, earned on every booking — redeem for local digital rewards.
        </p>
      </div>

      {/* ─────────── Points / Tier / Milestones card ─────────── */}
      <Card className="p-5 overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${tier.color}22, transparent 70%)` }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Balance */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Your Points</p>
            <p className="text-4xl font-bold mt-1" style={{ color: "#FF6000" }}>
              {mystate.balance.toLocaleString()}<span className="text-lg ml-1 text-muted-foreground">P</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              {earnRate.flag} {earnRate.localeLabel} · 1 P ≈ value of {earnRate.currency}&nbsp;
              {earnRate.amountPerPoint.toLocaleString()}
            </p>
            <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
              <span>Earned {mystate.totalEarned.toLocaleString()} P</span>
              <span>·</span>
              <span>Used {mystate.totalUsed.toLocaleString()} P</span>
            </div>
          </div>

          {/* Tier */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Current Tier</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl" aria-hidden>{tier.icon}</span>
              <div>
                <p className="text-xl font-bold" style={{ color: tier.color }}>{tier.name}</p>
                <p className="text-[11px] text-muted-foreground">{tier.multiplier}× earn multiplier</p>
              </div>
            </div>
            {next && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>→ {next.name}</span>
                  <span>{next.minBookings - mystate.bookingCount} bookings to go</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (mystate.bookingCount / next.minBookings) * 100)}%`,
                      background: `linear-gradient(90deg, ${tier.color}, ${next.color})`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Milestone progress */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Milestones</p>
            <div className="flex items-center gap-2 mt-1">
              <Trophy className="h-5 w-5" style={{ color: "#FF6000" }} />
              <div>
                <p className="text-xl font-bold">{mystate.milestonesReached.length} / {MILESTONES.length}</p>
                <p className="text-[11px] text-muted-foreground">{mystate.bookingCount} cumulative bookings</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {MILESTONES.map(m => {
                const reached = mystate.milestonesReached.includes(m.key);
                return (
                  <div
                    key={m.key}
                    title={`${m.emoji} ${m.title} (+${m.bonusPoints}P) — ${m.requiredBookings} bookings`}
                    className={`h-7 flex-1 rounded-md flex items-center justify-center text-xs transition-colors ${
                      reached ? "bg-[#FF6000]/20 border border-[#FF6000]/40" : "bg-muted border border-transparent"
                    }`}
                  >
                    <span className={reached ? "" : "opacity-30"}>{m.emoji}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* ─────────── Tabs ─────────── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="shop"     className="gap-1.5"><Gift className="h-3.5 w-3.5" />Shop</TabsTrigger>
          <TabsTrigger value="vault"    className="gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />My Vouchers <span className="ml-1 text-[9px] bg-muted px-1 rounded-full">{myVouchers.filter(v => v.status === "Active").length}</span></TabsTrigger>
          <TabsTrigger value="history"  className="gap-1.5"><TrendingUp className="h-3.5 w-3.5" />Points History</TabsTrigger>
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
            <Badge variant="outline" className="text-[10px]">
              {earnRate.flag} {countryCode} catalog
            </Badge>
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
                    </div>
                    {/* Body */}
                    <div className="p-3">
                      <h3 className="text-sm font-semibold line-clamp-1">{p.name}</h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 min-h-[28px]">{p.description}</p>
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

      {/* ─────────── HISTORY tab ─────────── */}
      {tab === "history" && (
        <Card className="p-0">
          <div className="p-4 border-b flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Points History</h2>
            <Badge variant="outline" className="text-[10px]">{pointsHistoryFor(userEmail).length} entries</Badge>
          </div>
          <div className="divide-y">
            {pointsHistoryFor(userEmail).length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                No transactions yet. Earn points on your first booking.
              </p>
            ) : (
              pointsHistoryFor(userEmail).map(tx => (
                <div key={tx.id} className="p-3 flex items-center justify-between gap-3 hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md flex items-center justify-center bg-muted">
                      {tx.type === "Earned-Welcome" ? "🎉" :
                       tx.type === "Earned-Milestone" ? "🏆" :
                       tx.type === "Earned-Booking" ? <Flame className="h-4 w-4 text-[#FF6000]" /> :
                       tx.type === "Earned-Tier-Bonus" ? <Sparkles className="h-4 w-4 text-[#FF6000]" /> :
                       tx.type === "Used-Redeem" ? <Gift className="h-4 w-4" /> :
                       <Clock className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm">{tx.description}</p>
                      <p className="text-[10px] text-muted-foreground">{tx.date} · {tx.type.replace(/-/g, " ")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.amount > 0 ? "text-green-600" : "text-destructive"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount} P
                    </p>
                    <p className="text-[10px] text-muted-foreground">Bal {tx.balance}P</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* ─────────── Redeem confirmation ─────────── */}
      <AlertDialog open={!!redeemTarget} onOpenChange={(o) => !o && setRedeemTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Redeem {redeemTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll be charged <strong>{redeemTarget?.pointsCost} P</strong> from your balance of <strong>{mystate.balance} P</strong>. You'll receive a{" "}
              {redeemTarget?.deliveryMethod === "email-code" ? "code by email" :
               redeemTarget?.deliveryMethod === "in-app-voucher" ? "voucher in your My Vouchers tab" :
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
                Your voucher is now in the <strong>My Vouchers</strong> tab.
              </p>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-[10px] uppercase text-muted-foreground">Voucher Code</p>
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
                  View My Vouchers
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
