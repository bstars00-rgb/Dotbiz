import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Bell, CheckCheck, AlertTriangle, Info, CreditCard, Calendar, MessageSquare, Settings, Mail, MessageCircle, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { alerts, type Alert as AlertRecord, type AlertCategory, alertTypeMeta } from "@/mocks/alerts";
import { useAuth } from "@/contexts/AuthContext";
import { companies } from "@/mocks/companies";
import { isAlertForUser, isInQuietHours, isQuietMuted, groupAlerts } from "@/lib/alertRouting";
import { useTickets } from "@/contexts/TicketsContext";
import { invoiceDisputes } from "@/mocks/settlement";
import { toast } from "sonner";

const categoryIcons: Record<AlertCategory, typeof Bell> = {
  Settlement: CreditCard,
  Booking: Calendar,
  Dispute: MessageSquare,
  Account: Settings,
  System: Info,
};

const channelIcons = { "In-app": Bell, Email: Mail, SMS: Smartphone, Slack: MessageCircle } as const;

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { tickets } = useTickets();
  const myCompany = companies.find(c => c.name === user?.company);

  /* ── 라우팅 정책 (2026-04-30 결정) ──
   * Master: 자기 회사 모두 / OP·Accounting: 본인 발행 티켓·분쟁만
   * EllisOP: 본인 assignee / EllisAdmin: CMS 변경만
   * 사용자 설정 권한 X — 시스템이 처음부터 지정. */
  const myAlerts = useMemo(() => {
    return [...alerts]
      .filter(a => !a.dismissed && isAlertForUser(a, user, tickets, invoiceDisputes))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [user, tickets]);

  const [categoryFilter, setCategoryFilter] = useState<"all" | AlertCategory>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  /* Local read-state — production would persist via API */
  const [readLocally, setReadLocally] = useState<Set<string>>(new Set());

  const isRead = (a: AlertRecord) => !!a.readAt || readLocally.has(a.id);

  const filtered = myAlerts.filter(a => {
    if (categoryFilter !== "all" && alertTypeMeta[a.type].category !== categoryFilter) return false;
    if (unreadOnly && isRead(a)) return false;
    return true;
  });

  /* UI 그룹핑 — 같은 type+refId는 묶음 (최신 1건 + 카운트 배지) */
  const grouped = useMemo(() => groupAlerts(filtered), [filtered]);

  /* Quiet hours 표시 — P0 외 묶음 알림 카운트 */
  const inQuietHours = isInQuietHours();
  const quietMutedCount = inQuietHours
    ? grouped.filter(g => isQuietMuted(g.primary)).length
    : 0;

  const counts: Record<string, number> = { all: myAlerts.length };
  myAlerts.forEach(a => {
    const cat = alertTypeMeta[a.type].category;
    counts[cat] = (counts[cat] || 0) + 1;
  });
  const unreadCount = myAlerts.filter(a => !isRead(a)).length;

  const markRead = (id: string) => setReadLocally(prev => new Set(prev).add(id));
  const markAllRead = () => {
    setReadLocally(new Set(myAlerts.map(a => a.id)));
    toast.success("All notifications marked as read");
  };
  const handleClick = (a: AlertRecord) => {
    markRead(a.id);
    if (a.actionPath) navigate(a.actionPath);
  };

  return (
    <div className="p-6 space-y-4 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />Notifications
            {unreadCount > 0 && <Badge variant="destructive" className="text-xs">{unreadCount} unread</Badge>}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Critical alerts, payment deadlines, dispute updates and more</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setUnreadOnly(!unreadOnly)}>
            {unreadOnly ? "Show all" : "Unread only"}
          </Button>
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="h-3 w-3 mr-1" />Mark all read
          </Button>
          {/* "Team Notification Settings" 제거 — 결정: 누구도 설정 권한 없음, 시스템 지정. */}
        </div>
      </div>

      {/* Category tabs */}
      <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as typeof categoryFilter)}>
        <TabsList className="!h-auto flex-wrap justify-start gap-1">
          <TabsTrigger value="all">All <span className="ml-1 text-[10px] text-muted-foreground">({counts.all || 0})</span></TabsTrigger>
          {(["Settlement", "Booking", "Dispute", "Account"] as AlertCategory[]).map(cat => (
            <TabsTrigger key={cat} value={cat}>
              {cat}<span className="ml-1 text-[10px] text-muted-foreground">({counts[cat] || 0})</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Quiet hours 안내 */}
      {inQuietHours && quietMutedCount > 0 && (
        <Card className="p-3 bg-slate-50 dark:bg-slate-900/40 border-l-4 border-slate-400">
          <p className="text-xs flex items-center gap-2">
            🌙 <strong>Quiet Hours (22:00–08:00)</strong> · P0 긴급 외 알림은 묶음 처리. {quietMutedCount}건 후순위.
          </p>
        </Card>
      )}

      {/* 정책 안내 — 사용자가 변경 불가 */}
      <Card className="p-3 bg-blue-50/40 dark:bg-blue-950/10 text-xs space-y-1">
        <p>
          <strong>📋 알림 라우팅 정책</strong> (시스템 지정 · 사용자 변경 불가)
        </p>
        <p className="text-muted-foreground">
          {user?.role === "Master" && "Master: 자기 회사의 모든 알림 수신"}
          {user?.role === "OP" && "OP: 본인이 발행한 티켓 + 본인 booking/reward 알림만"}
          {user?.role === "Accounting" && "Accounting: 본인이 발행한 invoice 분쟁 알림만"}
          {user?.role === "EllisOP" && "EllisOP: 본인 assignee 티켓 알림만"}
          {user?.role === "EllisAdmin" && "EllisAdmin: 시스템 정책 변경 알림만"}
        </p>
      </Card>

      {/* Alert list (그룹핑) */}
      <div className="space-y-2">
        {grouped.length === 0 && (
          <Card className="p-12 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No notifications {unreadOnly ? "to read" : "in this category"}.</p>
          </Card>
        )}

        {grouped.map(g => {
          const a = g.primary;
          const meta = alertTypeMeta[a.type];
          const Icon = categoryIcons[meta.category];
          const read = isRead(a);
          const muted = isQuietMuted(a) && inQuietHours;
          const priorityBg = meta.priority === "P0"
            ? (read ? "bg-red-50/30 dark:bg-red-950/10" : "bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500")
            : meta.priority === "P1"
            ? (read ? "bg-amber-50/20 dark:bg-amber-950/5" : "bg-amber-50 dark:bg-amber-950/10 border-l-4 border-amber-500")
            : (read ? "" : "bg-blue-50/30 dark:bg-blue-950/10 border-l-4 border-blue-500");
          return (
            <Card key={a.id} className={`p-4 transition-colors hover:bg-muted/30 cursor-pointer ${priorityBg} ${muted ? "opacity-60" : ""}`} onClick={() => handleClick(a)}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${meta.priority === "P0" ? "bg-red-100 dark:bg-red-900/40" : meta.priority === "P1" ? "bg-amber-100 dark:bg-amber-900/40" : "bg-slate-100 dark:bg-slate-800"}`}>
                  <Icon className={`h-4 w-4 ${meta.priority === "P0" ? "text-red-600" : meta.priority === "P1" ? "text-amber-600" : "text-slate-600"}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-sm ${read ? "font-normal text-muted-foreground" : "font-bold"}`}>{a.title}</h3>
                    {!read && <span className="inline-block w-2 h-2 rounded-full bg-red-500" />}
                    {g.totalCount > 1 && (
                      <Badge variant="outline" className="text-[10px]" title={`${g.totalCount} occurrences grouped`}>
                        ×{g.totalCount}
                      </Badge>
                    )}
                    {muted && <span className="text-[10px] text-muted-foreground">🌙 quiet</span>}
                  </div>
                  <p className={`text-xs mt-1 ${read ? "text-muted-foreground" : "text-foreground"}`}>{a.body}</p>

                  <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap text-[10px] text-muted-foreground">
                      <Badge variant={meta.priority === "P0" ? "destructive" : meta.priority === "P1" ? "secondary" : "outline"} className="text-[10px]">{meta.priority}</Badge>
                      <Badge variant="outline" className="text-[10px]">{meta.category}</Badge>
                      <span>·</span>
                      <span>{a.createdAt}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        Sent via:
                        {a.sentVia.map(ch => {
                          const Ch = channelIcons[ch];
                          return <Ch key={ch} className="h-3 w-3" aria-label={ch} />;
                        })}
                      </span>
                    </div>
                    {a.actionLabel && (
                      <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={(e) => { e.stopPropagation(); handleClick(a); }}>
                        {a.actionLabel} →
                      </Button>
                    )}
                  </div>
                </div>

                {!read && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markRead(a.id); }}
                    className="text-[10px] text-muted-foreground hover:text-foreground self-start"
                    title="Mark as read"
                    aria-label="Mark as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Bottom info */}
      <Card className="p-3 bg-muted/40 border-dashed">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p>
            Some alerts cannot be fully disabled (e.g. <strong>Critical Credit</strong>, <strong>Payment Deadline Today</strong>, <strong>Booking Cancelled by Hotel</strong>).
            Channel preferences (In-app / Email / SMS) are managed by ELLIS admin based on alert type priority. {hasRole(["Master"]) && <>Master users can set per-sub-account notification scope in <button className="underline hover:text-foreground" onClick={() => navigate("/app/client")}>Master Account</button>.</>}
          </p>
        </div>
      </Card>
    </div>
  );
}
