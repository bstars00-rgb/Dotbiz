import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, Gift, RefreshCw, CalendarDays } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, PieChart, Pie, LineChart, Line, Legend } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useScreenState } from "@/hooks/useScreenState";
import { useTabParam } from "@/hooks/useTabParam";
import { StateToolbar } from "@/components/StateToolbar";
import { Star } from "lucide-react";
import { kpi, points, ttvTrend, dailyBookingStats, destinationStats, bestsellingHotels, bestsellingByCountry } from "@/mocks/dashboard";
import { monthlyBookingStats, monthlyCancelRate, cancelReasons, dailyStats as dcDailyStats, yearEndStats, yearTotals } from "@/mocks/dataCenter";

const DATE_BASES = ["Booking Date", "Check-in", "Check-out"] as const;
const PERIODS = ["This Month", "Last Month", "Last 30 Days", "This Quarter", "Last Quarter", "This Year", "Custom"] as const;
const DAILY_METRICS = ["Booking Count", "Booking Amount", "Number of Nights"] as const;
type DailyMetricKey = "bookingCount" | "bookingAmount" | "nights";
const DEST_VIEWS = ["Country/Region", "City"] as const;
const DEST_COLORS = ["#FF6000", "#FF8C00", "#0369A1", "#009505", "#7C3AED", "#F59E0B", "#EC4899", "#6366F1", "#94A3B8"];

export default function DashboardPage() {
  const { state, setState } = useScreenState("success");
  const { t } = useI18n();
  const navigate = useNavigate();
  const [dashTab, setDashTab] = useTabParam("overview");
  const [dateBase, setDateBase] = useState<string>("Booking Date");
  const [period, setPeriod] = useState<string>("This Month");
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [customFrom, setCustomFrom] = useState(thirtyDaysAgo);
  const [customTo, setCustomTo] = useState(today);

  /* Destination Booking Percentage filters */
  const [destView, setDestView] = useState<string>("Country/Region");
  const [destFrom, setDestFrom] = useState("2026-03");
  const [destTo, setDestTo] = useState("2026-03");

  /* Bestselling Hotel Rankings filter */
  const [destBestCountry, setDestBestCountry] = useState("All");

  /* Data Center state */
  const [dcAccountLevel, setDcAccountLevel] = useState("All");
  const [dcDailyMetric, setDcDailyMetric] = useState("bookingCount");

  /* Daily Booking Statistics filters */
  const [dailyMetric, setDailyMetric] = useState<string>("Booking Count");
  const [dailyDateBase, setDailyDateBase] = useState<string>("Booking Date");
  const [dailyFrom, setDailyFrom] = useState("2026-03-11");
  const [dailyTo, setDailyTo] = useState("2026-04-10");

  if (state === "loading") return (<div className="p-6 space-y-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}</div><Skeleton className="h-24" /><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Skeleton className="h-64" /><Skeleton className="h-64" /></div><StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">No Data Yet</h2><p className="text-muted-foreground mt-2">Start booking hotels to see your dashboard analytics.</p><Button className="mt-4" onClick={() => navigate("/app/find-hotel")}><Search className="h-4 w-4 mr-2" />Find Hotel</Button></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>Dashboard Error</AlertTitle><AlertDescription>Failed to load dashboard data. Please try again.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  /* Derive comparison label from selected period */
  const comparisonLabel = period === "This Month" ? "vs last month"
    : period === "Last Month" ? "vs 2 months ago"
    : period === "Last 30 Days" ? "vs prev 30 days"
    : period === "This Quarter" ? "vs last quarter"
    : period === "Last Quarter" ? "vs 2 quarters ago"
    : period === "This Year" ? "vs last year"
    : `${customFrom} ~ ${customTo}`;

  /* Data Center computed values */
  const dcLatestMonth = monthlyBookingStats[monthlyBookingStats.length - 1];
  const dcTotalCancelled = cancelReasons.reduce((s, r) => s + r.count, 0);
  const dcLatestCancel = monthlyCancelRate[monthlyCancelRate.length - 1];
  const dcPrevCancel = monthlyCancelRate[monthlyCancelRate.length - 2];
  const dcAvgCancel = (monthlyCancelRate.reduce((s, m) => s + m.rate, 0) / monthlyCancelRate.length).toFixed(1);
  const dcDTotal = dcDailyStats.reduce((s, d) => s + (d[dcDailyMetric as keyof typeof d] as number), 0);
  const dcDAvg = Math.round(dcDTotal / dcDailyStats.length);
  const dcDPeak = Math.max(...dcDailyStats.map(d => d[dcDailyMetric as keyof typeof d] as number));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <select
              value={dateBase}
              onChange={e => setDateBase(e.target.value)}
              className="border rounded-md px-2 py-1.5 text-sm bg-card font-medium"
              aria-label="Date basis"
            >
              {DATE_BASES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="border rounded-md px-2 py-1.5 text-sm bg-card font-medium"
            aria-label="Period"
          >
            {PERIODS.map(p => <option key={p}>{p}</option>)}
          </select>
          {period === "Custom" && (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
                className="border rounded-md px-2 py-1.5 text-sm bg-card"
                aria-label="From date"
              />
              <span className="text-muted-foreground text-sm">~</span>
              <input
                type="date"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
                className="border rounded-md px-2 py-1.5 text-sm bg-card"
                aria-label="To date"
              />
            </div>
          )}
        </div>
      </div>

      <Tabs value={dashTab} onValueChange={setDashTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">{t("dashboard.overview")}</TabsTrigger>
          <TabsTrigger value="dc-booking">{t("dashboard.bookingStats")}</TabsTrigger>
          <TabsTrigger value="dc-cancel">{t("dashboard.cancelStats")}</TabsTrigger>
          <TabsTrigger value="dc-daily">{t("dashboard.dailyStats")}</TabsTrigger>
          <TabsTrigger value="dc-yearend">{t("dashboard.yearEnd")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("dashboard.totalBookings"), value: kpi.totalBookings, change: kpi.bookingsChange },
          { label: t("dashboard.totalRevenue"), value: `$${kpi.revenue.toLocaleString()}`, change: kpi.revenueChange },
          { label: "Room Nights", value: kpi.roomNights, change: kpi.nightsChange },
          { label: t("dashboard.avgBookingValue"), value: `$${kpi.avgBookingValue}`, change: kpi.avgChange },
        ].map(k => (
          <Card key={k.label} className="p-4 card-hover">
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <h3 className="text-2xl font-bold mt-1">{k.value}</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <Badge variant={k.change.startsWith("+") ? "default" : "secondary"}>{k.change}</Badge>
              <span className="text-xs text-muted-foreground">{comparisonLabel}</span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">OP Points</h3>
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <span>Balance: <strong>{points.balance.toLocaleString()}P</strong></span>
          <span>Earned: <strong>{points.earned.toLocaleString()}P</strong></span>
          <span>Used: <strong>{points.used.toLocaleString()}P</strong></span>
          <Button variant="link" onClick={() => navigate("/app/rewards")}><Gift className="h-4 w-4 mr-1" aria-hidden="true" />Rewards Mall</Button>
        </div>
      </Card>

      {/* ── Daily Booking Statistics ── */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h3 className="font-semibold">Daily Booking Statistics</h3>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={dailyMetric}
              onChange={e => setDailyMetric(e.target.value)}
              className="border rounded-md px-2.5 py-1.5 text-sm bg-card font-medium"
              aria-label="Daily metric"
            >
              {DAILY_METRICS.map(m => <option key={m}>{m}</option>)}
            </select>
            <select
              value={dailyDateBase}
              onChange={e => setDailyDateBase(e.target.value)}
              className="border rounded-md px-2.5 py-1.5 text-sm bg-card font-medium"
              aria-label="Daily date basis"
            >
              {DATE_BASES.map(d => <option key={d}>{d}</option>)}
            </select>
            <div className="flex items-center gap-1.5 border rounded-md px-2.5 py-1.5 bg-card">
              <input
                type="date"
                value={dailyFrom}
                onChange={e => setDailyFrom(e.target.value)}
                className="text-sm bg-transparent border-none outline-none"
                aria-label="Daily from"
              />
              <span className="text-muted-foreground text-sm">~</span>
              <input
                type="date"
                value={dailyTo}
                onChange={e => setDailyTo(e.target.value)}
                className="text-sm bg-transparent border-none outline-none"
                aria-label="Daily to"
              />
              <Badge variant="secondary" className="text-xs ml-1">
                {Math.max(0, Math.round((new Date(dailyTo).getTime() - new Date(dailyFrom).getTime()) / 86400000))} days
              </Badge>
            </div>
          </div>
        </div>
        {(() => {
          const metricKey: DailyMetricKey = dailyMetric === "Booking Amount" ? "bookingAmount" : dailyMetric === "Number of Nights" ? "nights" : "bookingCount";
          const filtered = dailyBookingStats.filter(d => d.date >= dailyFrom && d.date <= dailyTo);
          const total = filtered.reduce((s, d) => s + d[metricKey], 0);
          const avg = filtered.length ? Math.round(total / filtered.length) : 0;
          const formatValue = (v: number) => metricKey === "bookingAmount" ? `$${v.toLocaleString()}` : v.toLocaleString();
          return (
            <>
              <div className="flex gap-6 mb-3 text-sm">
                <span>Total: <strong>{formatValue(total)}</strong></span>
                <span>Daily Avg: <strong>{formatValue(avg)}</strong></span>
                <span>Peak: <strong>{formatValue(Math.max(...filtered.map(d => d[metricKey]), 0))}</strong></span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={filtered} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={v => metricKey === "bookingAmount" ? `$${(v / 1000).toFixed(0)}k` : String(v)} />
                  <Tooltip
                    formatter={(value) => [metricKey === "bookingAmount" ? `$${Number(value).toLocaleString()}` : Number(value).toLocaleString(), dailyMetric]}
                    labelFormatter={l => `Date: ${l}`}
                    contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", fontSize: 13 }}
                  />
                  <Area type="monotone" dataKey={metricKey} stroke="var(--primary)" strokeWidth={2} fill="url(#dailyGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </>
          );
        })()}
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">12-Month TTV Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ttvTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "TTV"]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {ttvTrend.map((_, i) => (
                <Cell key={i} fill={i === ttvTrend.length - 1 ? "var(--primary)" : "var(--primary)"} fillOpacity={i === ttvTrend.length - 1 ? 1 : 0.4} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Destination Booking Percentage ── */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h3 className="font-semibold">Destination Booking Percentage</h3>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={destView}
              onChange={e => setDestView(e.target.value)}
              className="border rounded-md px-2.5 py-1.5 text-sm bg-card font-medium"
              aria-label="Destination view"
            >
              {DEST_VIEWS.map(v => <option key={v}>{v}</option>)}
            </select>
            <div className="flex items-center gap-1.5 border rounded-md px-2.5 py-1.5 bg-card">
              <input
                type="month"
                value={destFrom}
                onChange={e => setDestFrom(e.target.value)}
                className="text-sm bg-transparent border-none outline-none"
                aria-label="Destination from month"
              />
              <span className="text-muted-foreground text-sm">~</span>
              <input
                type="month"
                value={destTo}
                onChange={e => setDestTo(e.target.value)}
                className="text-sm bg-transparent border-none outline-none"
                aria-label="Destination to month"
              />
            </div>
          </div>
        </div>
        {(() => {
          const data = destView === "City" ? destinationStats.city : destinationStats.country;
          const totalBookings = data.reduce((s, d) => s + d.bookings, 0);
          return (
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <ResponsiveContainer width={240} height={240}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="bookings"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {data.map((d, i) => (
                      <Cell key={d.name} fill={d.color || DEST_COLORS[i % DEST_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} bookings (${((Number(value) / totalBookings) * 100).toFixed(1)}%)`, ""]}
                    contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", fontSize: 13 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{destView === "City" ? "City" : "Country"}</TableHead>
                      <TableHead className="text-right">Bookings</TableHead>
                      <TableHead className="text-right">%</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Nights</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((d, i) => (
                      <TableRow key={d.name}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full shrink-0" style={{ background: d.color || DEST_COLORS[i % DEST_COLORS.length] }} />
                            {d.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{d.bookings}</TableCell>
                        <TableCell className="text-right font-medium">{((d.bookings / totalBookings) * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-right">${d.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{d.nights}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })()}
      </Card>

      {/* ── OhMyHotel Bestselling Hotel Rankings ── */}
      <Card className="p-4">
        {(() => {
          const countries = ["All", ...Object.keys(bestsellingByCountry).sort()];
          const filtered = destBestCountry === "All"
            ? bestsellingHotels.slice(0, 20)
            : (bestsellingByCountry[destBestCountry] || []).map((h, i) => ({ rank: i + 1, ...h, country: destBestCountry }));
          return (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <h3 className="font-semibold">OhMyHotel <Badge variant="default" className="ml-1">Bestselling Hotel Rankings</Badge></h3>
                <select
                  value={destBestCountry}
                  onChange={e => setDestBestCountry(e.target.value)}
                  className="border rounded-md px-2.5 py-1.5 text-sm bg-card font-medium w-auto"
                  aria-label="Filter by country"
                >
                  {countries.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Index</TableHead>
                      <TableHead>Hotel Name</TableHead>
                      <TableHead className="w-28">Star Rating</TableHead>
                      <TableHead className="w-24">City</TableHead>
                      <TableHead className="w-36">Country/Region</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((h, idx) => (
                      <TableRow key={`${h.hotelName}-${idx}`}>
                        <TableCell>
                          {idx + 1 <= 3
                            ? <Badge className="text-white" style={{ background: idx + 1 === 1 ? "#2196F3" : idx + 1 === 2 ? "#FF9800" : "#F44336" }}>{idx + 1}</Badge>
                            : idx + 1
                          }
                        </TableCell>
                        <TableCell className="text-primary font-medium cursor-pointer hover:underline">{h.hotelName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>{h.starRating}</span>
                            <Star className="h-3.5 w-3.5 fill-teal-600 text-teal-600" />
                          </div>
                        </TableCell>
                        <TableCell>{h.city}</TableCell>
                        <TableCell>{h.country}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          );
        })()}
      </Card>

        </TabsContent>

        {/* ══════ Booking Statistics Tab ══════ */}
        <TabsContent value="dc-booking" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Booking Statistics (6 Months)</h3>
            <select value={dcAccountLevel} onChange={e => setDcAccountLevel(e.target.value)} className="border rounded-md px-3 py-1.5 text-sm bg-card font-medium">
              {["All", "Master", "Sub-accounts"].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 card-hover"><p className="text-sm text-muted-foreground">Confirmed (This Month)</p><h3 className="text-2xl font-bold mt-1">{dcLatestMonth.confirmed}</h3></Card>
            <Card className="p-4 card-hover"><p className="text-sm text-muted-foreground">Cancelled</p><h3 className="text-2xl font-bold mt-1 text-red-500">{dcLatestMonth.cancelled}</h3></Card>
            <Card className="p-4 card-hover"><p className="text-sm text-muted-foreground">Deferred Credit</p><h3 className="text-2xl font-bold mt-1">{dcLatestMonth.deferredCredit}</h3></Card>
          </div>
          <Card className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyBookingStats} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Legend />
                <Bar dataKey="confirmed" name="Confirmed" fill="#009505" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelled" name="Cancelled" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="deferredCredit" name="Deferred" fill="#FF8C00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* ══════ Cancellation Tab ══════ */}
        <TabsContent value="dc-cancel" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 card-hover"><p className="text-sm text-muted-foreground">This Month</p><h3 className="text-2xl font-bold mt-1" style={{ color: dcLatestCancel.rate > 10 ? "#DC2626" : "#FF8C00" }}>{dcLatestCancel.rate}%</h3><p className="text-xs text-muted-foreground">{dcLatestCancel.count} cancellations</p></Card>
            <Card className="p-4 card-hover"><p className="text-sm text-muted-foreground">Previous Month</p><h3 className="text-2xl font-bold mt-1">{dcPrevCancel.rate}%</h3></Card>
            <Card className="p-4 card-hover"><p className="text-sm text-muted-foreground">6-Month Average</p><h3 className="text-2xl font-bold mt-1">{dcAvgCancel}%</h3></Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Cancel Rate Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyCancelRate} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={v => `${v}%`} />
                  <Tooltip formatter={(value) => [`${value}%`, "Rate"]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }} />
                  <Line type="monotone" dataKey="rate" stroke="#DC2626" strokeWidth={2} dot={{ fill: "#DC2626", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Reasons</h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart><Pie data={cancelReasons} dataKey="count" nameKey="reason" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} strokeWidth={0}>{cancelReasons.map(r => <Cell key={r.reason} fill={r.color} />)}</Pie><Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 }} /></PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {cancelReasons.map(r => (
                    <div key={r.reason} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full shrink-0" style={{ background: r.color }} />{r.reason}</div>
                      <span className="font-medium">{r.count} <span className="text-muted-foreground text-xs">({((r.count / dcTotalCancelled) * 100).toFixed(0)}%)</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ══════ Daily Booking Tab ══════ */}
        <TabsContent value="dc-daily" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <select value={dcDailyMetric} onChange={e => setDcDailyMetric(e.target.value)} className="border rounded-md px-3 py-1.5 text-sm bg-card font-medium">
              <option value="bookingCount">Booking Count</option>
              <option value="bookingAmount">Booking Amount</option>
            </select>
            <span className="text-sm text-muted-foreground">31 days</span>
          </div>
          <div className="flex gap-6 text-sm">
            <span>Total: <strong>{dcDailyMetric === "bookingAmount" ? `$${dcDTotal.toLocaleString()}` : dcDTotal}</strong></span>
            <span>Avg: <strong>{dcDailyMetric === "bookingAmount" ? `$${dcDAvg.toLocaleString()}` : dcDAvg}</strong></span>
            <span>Peak: <strong>{dcDailyMetric === "bookingAmount" ? `$${dcDPeak.toLocaleString()}` : dcDPeak}</strong></span>
          </div>
          <Card className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dcDailyStats} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs><linearGradient id="dcGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={v => dcDailyMetric === "bookingAmount" ? `$${(v / 1000).toFixed(0)}k` : String(v)} />
                <Tooltip formatter={(value) => [dcDailyMetric === "bookingAmount" ? `$${Number(value).toLocaleString()}` : value, dcDailyMetric === "bookingAmount" ? "Amount" : "Count"]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Area type="monotone" dataKey={dcDailyMetric} stroke="var(--primary)" strokeWidth={2} fill="url(#dcGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* ══════ Year-End Tab ══════ */}
        <TabsContent value="dc-yearend" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {([{ year: "2024", data: yearTotals.y2024, color: "#94A3B8" }, { year: "2025", data: yearTotals.y2025, color: "#FF8C00" }, { year: "2026 (YTD)", data: yearTotals.y2026, color: "#FF6000" }] as const).map(y => (
              <Card key={y.year} className="p-4 card-hover"><p className="text-sm font-medium" style={{ color: y.color }}>{y.year}</p><h3 className="text-2xl font-bold mt-1">{y.data.bookings.toLocaleString()}</h3><p className="text-xs text-muted-foreground">${y.data.revenue.toLocaleString()} · {y.data.roomNights.toLocaleString()} nights</p></Card>
            ))}
          </div>
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Monthly Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearEndStats} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Legend />
                <Bar dataKey="y2024" name="2024" fill="#94A3B8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="y2025" name="2025" fill="#FF8C00" radius={[2, 2, 0, 0]} />
                <Bar dataKey="y2026" name="2026" fill="#FF6000" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-3">YoY Growth</h3>
            <Table>
              <TableHeader><TableRow><TableHead>Month</TableHead><TableHead>2024</TableHead><TableHead>2025</TableHead><TableHead>2026</TableHead><TableHead>YoY 25/24</TableHead><TableHead>YoY 26/25</TableHead></TableRow></TableHeader>
              <TableBody>
                {yearEndStats.filter(y => y.y2024 > 0).map(y => {
                  const g25 = ((y.y2025 / y.y2024 - 1) * 100).toFixed(1);
                  const g26 = y.y2026 > 0 ? ((y.y2026 / y.y2025 - 1) * 100).toFixed(1) : "—";
                  return (<TableRow key={y.month}><TableCell className="font-medium">{y.month}</TableCell><TableCell>{y.y2024}</TableCell><TableCell>{y.y2025}</TableCell><TableCell>{y.y2026 || "—"}</TableCell><TableCell><Badge variant={parseFloat(g25) >= 0 ? "default" : "destructive"} className="text-[10px]">{g25}%</Badge></TableCell><TableCell>{g26 !== "—" ? <Badge variant={parseFloat(g26) >= 0 ? "default" : "destructive"} className="text-[10px]">{g26}%</Badge> : "—"}</TableCell></TableRow>);
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
