import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { X, ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ───────────────────────────────────────────────────────────────────────
 * Game-style tutorial overlay
 *
 * Dims the page and cuts a spotlight hole around a target element (identified
 * by a CSS selector, usually `[data-tutorial="<id>"]`), then floats a tooltip
 * card with the current step's title / description / Next / Prev / Skip.
 *
 * Steps:
 *   { targetSelector?: string;  title: string;  description: string;
 *     placement?: "top" | "bottom" | "left" | "right" | "center";
 *     onBefore?: () => void;   // e.g. navigate somewhere before showing
 *   }
 *
 * If `targetSelector` is omitted (or the selector doesn't resolve), the
 * tooltip centers on screen with no spotlight — used for intro/outro steps.
 *
 * Users can exit at ANY point via:
 *   - X button in top-right of the tooltip
 *   - Skip Tutorial button in the tooltip
 *   - Esc key
 *   - Clicking the dim area outside the tooltip
 * ─────────────────────────────────────────────────────────────────────── */

export interface TutorialStep {
  targetSelector?: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
  onBefore?: () => void;
}

interface Props {
  open: boolean;
  steps: TutorialStep[];
  onClose: () => void;
  onComplete?: () => void;
}

export default function TutorialOverlay({ open, steps, onClose, onComplete }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = steps[stepIdx];
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === steps.length - 1;

  /* Reset to step 0 when opened */
  useEffect(() => {
    if (open) setStepIdx(0);
  }, [open]);

  /* Run onBefore hook when step changes */
  useEffect(() => {
    if (!open || !step) return;
    step.onBefore?.();
  }, [open, step]);

  /* Find and measure target element when step changes (and on resize/scroll) */
  useLayoutEffect(() => {
    if (!open || !step) { setRect(null); return; }
    if (!step.targetSelector) { setRect(null); return; }

    const measure = () => {
      const el = document.querySelector(step.targetSelector!) as HTMLElement | null;
      if (!el) { setRect(null); return; }
      /* Ensure it's in view */
      el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      /* Small delay to let scroll settle before measuring */
      requestAnimationFrame(() => {
        setRect(el.getBoundingClientRect());
      });
    };

    /* Slight delay after onBefore to let layout settle (e.g. route navigation) */
    const timer = setTimeout(measure, step.onBefore ? 300 : 0);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, step, stepIdx]);

  /* ESC to close */
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open || !step) return null;

  const next = () => {
    if (isLast) {
      onComplete?.();
      onClose();
    } else {
      setStepIdx(i => i + 1);
    }
  };
  const prev = () => setStepIdx(i => Math.max(0, i - 1));

  /* Tooltip positioning — anchor to target rect, fall back to center */
  const tooltipStyle: React.CSSProperties = (() => {
    const MARGIN = 16;
    const WIDTH = 360;
    if (!rect) {
      /* Center on screen */
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }
    const placement = step.placement || "bottom";
    switch (placement) {
      case "top":
        return { top: Math.max(MARGIN, rect.top - MARGIN - 180), left: Math.max(MARGIN, Math.min(window.innerWidth - WIDTH - MARGIN, rect.left + rect.width / 2 - WIDTH / 2)) };
      case "left":
        return { top: Math.max(MARGIN, rect.top + rect.height / 2 - 90), left: Math.max(MARGIN, rect.left - WIDTH - MARGIN) };
      case "right":
        return { top: Math.max(MARGIN, rect.top + rect.height / 2 - 90), left: Math.min(window.innerWidth - WIDTH - MARGIN, rect.right + MARGIN) };
      case "bottom":
      default:
        return { top: rect.bottom + MARGIN, left: Math.max(MARGIN, Math.min(window.innerWidth - WIDTH - MARGIN, rect.left + rect.width / 2 - WIDTH / 2)) };
    }
  })();

  const progressPct = ((stepIdx + 1) / steps.length) * 100;

  return (
    <div
      className="fixed inset-0 z-[9998]"
      /* Backdrop click closes */
      onClick={onClose}
    >
      {/* Spotlight hole around target using box-shadow trick */}
      {rect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute transition-all duration-200 rounded-lg"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.72)",
            border: "2px solid #FF6000",
            animation: "tutorialPulse 1.8s ease-in-out infinite",
          }}
        />
      ) : (
        /* Full dim when no target */
        <div aria-hidden="true" className="absolute inset-0 bg-black/70" />
      )}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        onClick={e => e.stopPropagation()}
        className="absolute bg-white dark:bg-slate-900 text-foreground rounded-xl shadow-2xl ring-1 ring-foreground/10 p-5"
        style={{ ...tooltipStyle, width: 360, maxWidth: "calc(100vw - 32px)" }}
      >
        {/* Header: progress + close */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: "#FF6000" }} />
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#FF6000" }}>
              Tutorial · {stepIdx + 1} of {steps.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-muted transition-colors"
            aria-label="Close tutorial"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #FF6000, #FF8C00)" }}
          />
        </div>

        {/* Title + description */}
        <h3 className="text-base font-bold mb-2">{step.title}</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-line mb-5">{step.description}</p>

        {/* Footer: prev / skip / next */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Skip tutorial
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={prev}
              disabled={isFirst}
              className="text-xs"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />Back
            </Button>
            <Button
              size="sm"
              onClick={next}
              style={{ background: "#FF6000" }}
              className="text-xs text-white"
            >
              {isLast ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />Finish
                </>
              ) : (
                <>
                  Next <ArrowRight className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes tutorialPulse {
          0%, 100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.72), 0 0 0 0 rgba(255, 96, 0, 0.6); }
          50%      { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.72), 0 0 0 8px rgba(255, 96, 0, 0); }
        }
      `}</style>
    </div>
  );
}
