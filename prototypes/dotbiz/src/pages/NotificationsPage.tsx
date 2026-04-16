import { CheckCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useScreenState } from "@/hooks/useScreenState";
import { StateToolbar } from "@/components/StateToolbar";
import { notifications, notificationSummary } from "@/mocks/notifications";
import { toast } from "sonner";

const priorityColors: Record<string, string> = { Critical: "destructive", High: "default", Medium: "secondary", Low: "outline" };

export default function NotificationsPage() {
  const { state, setState } = useScreenState("success");

  if (state === "loading") return (<div className="p-6 space-y-4"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20" />)}</div><Skeleton className="h-10 w-full" /><Skeleton className="h-96 w-full" /><StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">No Notifications</h2><p className="text-muted-foreground mt-2">You are all caught up! No new notifications.</p></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>Notification Error</AlertTitle><AlertDescription>Failed to load notifications. Please try again.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center border-red-200"><p className="text-sm">Critical</p><h3 className="text-2xl font-bold text-red-600">{notificationSummary.critical}</h3></Card>
        <Card className="p-4 text-center"><p className="text-sm">Unread</p><h3 className="text-2xl font-bold">{notificationSummary.unread}</h3></Card>
        <Card className="p-4 text-center"><p className="text-sm">Deadlines</p><h3 className="text-2xl font-bold">{notificationSummary.deadlines}</h3></Card>
        <Card className="p-4 text-center"><p className="text-sm">Payments</p><h3 className="text-2xl font-bold">{notificationSummary.payments}</h3></Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          {["All","Unread","Deadlines","Payment","Check-in","Bookings","Cancelled","System"].map(t => <TabsTrigger key={t} value={t.toLowerCase()}>{t}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <Button variant="outline" size="sm" onClick={() => toast.success("All Read", { description: "All notifications have been marked as read." })}>
        <CheckCheck className="h-4 w-4 mr-1" aria-hidden="true" />Mark All as Read
      </Button>

      <div className="space-y-2">
        {notifications.map(n => (
          <Card key={n.id} className="p-4 flex items-start gap-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <Badge variant={priorityColors[n.priority] as "default" | "destructive" | "secondary" | "outline"}>{n.priority}</Badge>
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${!n.isRead ? "" : "text-muted-foreground"}`}>{n.title}</p>
              <p className="text-sm text-muted-foreground truncate">{n.description}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-muted-foreground">{n.time}</span>
              {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 ml-auto" />}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 mt-6">
        <h3 className="font-semibold mb-4">Notification Settings</h3>
        <div className="space-y-3">
          {["Cancel Deadline Reminders","Check-in Reminders","Payment Notifications","Booking Notifications","Email Notifications","Promotional Notifications","System Notifications","Quiet Hours"].map(label => (
            <div key={label} className="flex items-center justify-between">
              <label className="text-sm">{label}</label>
              <Switch defaultChecked={!label.includes("Promotional") && !label.includes("Quiet")} />
            </div>
          ))}
        </div>
      </Card>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
