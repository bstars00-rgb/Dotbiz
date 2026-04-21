import { useMemo, useState } from "react";
import { Bell, Mail, Smartphone, MessageCircle, Save, AlertTriangle, Lock, Moon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  defaultAlertPreferences,
  undisableableAlerts,
  alertTypeMeta,
  type AlertPreference,
  type AlertChannel,
  type AlertCategory,
  type AlertType,
} from "@/mocks/alerts";
import { toast } from "sonner";

const CHANNELS: { key: AlertChannel; label: string; icon: typeof Bell }[] = [
  { key: "In-app", label: "In-app", icon: Bell },
  { key: "Email",  label: "Email",  icon: Mail },
  { key: "SMS",    label: "SMS",    icon: Smartphone },
  { key: "Slack",  label: "Slack",  icon: MessageCircle },
];

const CATEGORY_ORDER: AlertCategory[] = ["Settlement", "Booking", "Dispute", "Account", "System"];

export function AlertPreferencesPanel() {
  const [prefs, setPrefs] = useState<AlertPreference[]>(defaultAlertPreferences);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");
  const [timezone, setTimezone] = useState("Asia/Seoul");

  const grouped = useMemo(() => {
    const m: Record<AlertCategory, AlertPreference[]> = {
      Settlement: [], Booking: [], Dispute: [], Account: [], System: [],
    };
    prefs.forEach(p => m[alertTypeMeta[p.type].category].push(p));
    return m;
  }, [prefs]);

  const toggleEnabled = (type: AlertType) => {
    if (undisableableAlerts.includes(type)) {
      toast.error("This critical alert cannot be disabled. You may still toggle delivery channels.");
      return;
    }
    setPrefs(prev => prev.map(p => p.type === type ? { ...p, enabled: !p.enabled } : p));
  };

  const toggleChannel = (type: AlertType, channel: AlertChannel) => {
    setPrefs(prev => prev.map(p => {
      if (p.type !== type) return p;
      const has = p.channels.includes(channel);
      /* Must keep at least one channel for undisableable alerts */
      if (has && undisableableAlerts.includes(type) && p.channels.length === 1) {
        toast.error("At least one channel must remain for critical alerts.");
        return p;
      }
      return {
        ...p,
        channels: has ? p.channels.filter(c => c !== channel) : [...p.channels, channel],
      };
    }));
  };

  const save = () => {
    /* Prototype: no backend, just toast */
    toast.success("Notification preferences saved");
  };

  const resetDefaults = () => {
    setPrefs(defaultAlertPreferences);
    toast.info("Restored default notification settings");
  };

  return (
    <div className="space-y-5">
      {/* Intro */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#FF6000]" />Notification Settings
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose which alerts you want to receive and through which channels.
              Some critical alerts cannot be disabled — you can only change the delivery channels.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetDefaults}>Reset defaults</Button>
            <Button size="sm" className="bg-[#FF6000] hover:bg-[#E55600]" onClick={save}>
              <Save className="h-3 w-3 mr-1" />Save
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-900/40">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <strong>Locked alerts</strong> (marked with <Lock className="inline h-3 w-3" />) such as Credit Critical, Payment Deadline Today, Top-up Expired and Booking Cancelled by Hotel are always on. You can change channels but not turn them off entirely.
          </p>
        </div>
      </Card>

      {/* Quiet hours */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <Moon className="h-5 w-5 text-slate-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold">Quiet Hours</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Suppress non-critical notifications during this window. P0 critical alerts always bypass quiet hours.
              </p>
            </div>
          </div>
          <Switch checked={quietHoursEnabled} onCheckedChange={setQuietHoursEnabled} />
        </div>
        {quietHoursEnabled && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">From</label>
              <Input type="time" value={quietStart} onChange={e => setQuietStart(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">To</label>
              <Input type="time" value={quietEnd} onChange={e => setQuietEnd(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Timezone</label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Seoul">Asia/Seoul (KST)</SelectItem>
                  <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                  <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (ICT)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                  <SelectItem value="Asia/Hong_Kong">Asia/Hong Kong (HKT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </Card>

      {/* Per-category alert list */}
      {CATEGORY_ORDER.map(cat => {
        const list = grouped[cat];
        if (!list || list.length === 0) return null;
        return (
          <Card key={cat} className="p-5">
            <h3 className="text-sm font-semibold mb-1">{cat}</h3>
            <p className="text-xs text-muted-foreground mb-4">
              {cat === "Settlement" && "Credit, invoicing, top-up and payment events."}
              {cat === "Booking" && "Payment deadlines, confirmations and hotel-side cancellations."}
              {cat === "Dispute" && "Disputes and support ticket updates."}
              {cat === "Account" && "Sub-accounts, roles and contract amendments."}
              {cat === "System" && "Platform announcements."}
            </p>
            <Separator className="mb-2" />
            <div className="divide-y">
              {list.map(p => {
                const meta = alertTypeMeta[p.type];
                const locked = undisableableAlerts.includes(p.type);
                return (
                  <div key={p.type} className="py-3 flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[240px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm ${p.enabled || locked ? "font-medium" : "text-muted-foreground"}`}>{meta.label}</span>
                        <Badge
                          variant={meta.priority === "P0" ? "destructive" : meta.priority === "P1" ? "secondary" : "outline"}
                          className="text-[10px]"
                        >
                          {meta.priority}
                        </Badge>
                        {locked && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                            <Lock className="h-3 w-3" />Locked
                          </span>
                        )}
                      </div>
                      {/* Channel toggles */}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {CHANNELS.map(ch => {
                          const Icon = ch.icon;
                          const active = p.channels.includes(ch.key);
                          const disabledByParent = !p.enabled && !locked;
                          return (
                            <button
                              key={ch.key}
                              type="button"
                              disabled={disabledByParent}
                              onClick={() => toggleChannel(p.type, ch.key)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] transition-colors ${
                                active
                                  ? "bg-[#FF6000]/10 border-[#FF6000] text-[#FF6000]"
                                  : "bg-transparent border-muted text-muted-foreground hover:border-foreground/40"
                              } ${disabledByParent ? "opacity-40 cursor-not-allowed" : ""}`}
                            >
                              <Icon className="h-3 w-3" />
                              {ch.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {locked ? (
                        <div className="text-[10px] text-muted-foreground text-right">
                          Always on<br />(channels editable)
                        </div>
                      ) : (
                        <Switch
                          checked={p.enabled}
                          onCheckedChange={() => toggleEnabled(p.type)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}

      {/* Save footer */}
      <Card className="p-4 flex items-center justify-between gap-4 flex-wrap bg-muted/40">
        <p className="text-xs text-muted-foreground">
          Changes are applied to your account only. Master users can configure org-wide defaults in a future release.
        </p>
        <Button size="sm" className="bg-[#FF6000] hover:bg-[#E55600]" onClick={save}>
          <Save className="h-3 w-3 mr-1" />Save preferences
        </Button>
      </Card>
    </div>
  );
}

export default AlertPreferencesPanel;
