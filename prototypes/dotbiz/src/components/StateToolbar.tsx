import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sun, Moon } from "lucide-react";
import { useAuth, ALL_ROLES } from "@/contexts/AuthContext";
import type { ScreenState } from "@/hooks/useScreenState";

interface StateToolbarProps {
  state: ScreenState;
  setState: (s: ScreenState) => void;
}

export function StateToolbar({ state, setState }: StateToolbarProps) {
  const { currentRole, setCurrentRole } = useAuth();

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-muted border rounded-full px-3 py-1.5 shadow-lg flex items-center gap-2">
      {(["loading", "empty", "error", "success"] as const).map(s => (
        <Button key={s} size="sm" variant={state === s ? "default" : "outline"} onClick={() => setState(s)}>
          {s}
        </Button>
      ))}
      <Separator orientation="vertical" className="h-6" />
      <select
        value={currentRole}
        onChange={e => setCurrentRole(e.target.value)}
        className="text-sm border rounded px-1 bg-background"
        aria-label="Switch role"
      >
        {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <Separator orientation="vertical" className="h-6" />
      <Button size="sm" variant="outline" onClick={toggleDark} aria-label="Toggle dark mode">
        <Sun className="h-3 w-3 dark:hidden" />
        <Moon className="h-3 w-3 hidden dark:block" />
      </Button>
    </div>
  );
}
