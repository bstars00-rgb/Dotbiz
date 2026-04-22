import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Search, ChevronDown, ChevronUp, RefreshCw, BookOpen, ArrowRight, Clock, X,
  Lightbulb, AlertTriangle, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useScreenState } from "@/hooks/useScreenState";
import { useTabParam } from "@/hooks/useTabParam";
import { StateToolbar } from "@/components/StateToolbar";
import { faqs } from "@/mocks/faqs";
import { guides, guideCategories, getFeaturedGuides, type Guide, type GuideCategory } from "@/mocks/guides";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";

export default function FaqBoardPage() {
  const { state, setState } = useScreenState("success");
  const { t } = useI18n();
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useTabParam("all");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [openGuide, setOpenGuide] = useState<Guide | null>(null);

  const featured = useMemo(() => getFeaturedGuides(), []);

  /* Filter guides by category + search; hide role-restricted guides if user lacks role */
  const filteredGuides = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return guides.filter(g => {
      if (g.roles && !hasRole(g.roles)) return false;
      if (category !== "all" && g.category !== category) return false;
      if (!q) return true;
      const haystack = (g.title + " " + g.summary + " " + g.steps.map(s => s.title + " " + s.description).join(" ")).toLowerCase();
      return haystack.includes(q);
    });
  }, [searchTerm, category, hasRole]);

  const filteredFaqs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return faqs.filter(f => {
      if (category !== "all") {
        /* faqs use lowercase category strings like "booking" — normalize */
        const catLower = (category as string).toLowerCase().replace(/\s+/g, "");
        const faqCat = f.category.toLowerCase().replace(/\s+/g, "");
        if (catLower !== "all" && faqCat !== catLower && catLower !== "gettingstarted" && catLower !== "support" && catLower !== "alerts") return false;
        if (category === "Support" || category === "Alerts" || category === "Getting Started") return false; /* no FAQ tag match */
      }
      if (!q) return true;
      return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    });
  }, [searchTerm, category]);

  if (state === "loading") return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-10 w-96" /><Skeleton className="h-10 w-full" />
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
      <StateToolbar state={state} setState={setState} />
    </div>
  );
  if (state === "error") return (
    <div className="p-6">
      <Alert variant="destructive" className="max-w-md mx-auto">
        <AlertTitle>FAQ Error</AlertTitle>
        <AlertDescription>Failed to load FAQs. Please try again.</AlertDescription>
        <Button className="mt-3" onClick={() => setState("success")}>
          <RefreshCw className="h-4 w-4 mr-2" />Retry
        </Button>
      </Alert>
      <StateToolbar state={state} setState={setState} />
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* ─── Hero ─── */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-[#FF6000]" />
          {t("page.faq")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Step-by-step guides + quick answers. Pick a category or search anything.
        </p>

        <div className="relative max-w-xl mt-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search guides and FAQs…"
            className="pl-9 h-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-2 p-1 rounded-md hover:bg-muted text-muted-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ─── Category tiles ─── */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {guideCategories.map(cat => {
          const Icon = cat.icon;
          const active = category === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`rounded-lg border p-3 text-center transition-colors ${
                active
                  ? "border-[#FF6000] bg-orange-50 dark:bg-orange-950/20 text-[#FF6000]"
                  : "border-muted hover:border-foreground/30 hover:bg-muted/40"
              }`}
            >
              <Icon className={`h-5 w-5 mx-auto mb-1 ${active ? "text-[#FF6000]" : "text-muted-foreground"}`} />
              <span className="text-xs font-medium">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Featured guides (only when viewing All + no search) ─── */}
      {category === "all" && !searchTerm && featured.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-[#FF6000]" />
            <h2 className="text-lg font-semibold">Start here</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {featured.map(g => (
              <GuideCard key={g.id} guide={g} onOpen={() => setOpenGuide(g)} />
            ))}
          </div>
        </section>
      )}

      {/* ─── All guides (filtered) ─── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            {category === "all" ? "All guides" : `${category} guides`}
            <span className="ml-2 text-sm text-muted-foreground font-normal">
              ({filteredGuides.length})
            </span>
          </h2>
        </div>
        {filteredGuides.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground text-sm">
            No guides match your search.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredGuides.map(g => (
              <GuideCard key={g.id} guide={g} onOpen={() => setOpenGuide(g)} />
            ))}
          </div>
        )}
      </section>

      {/* ─── Text FAQs (lower prominence) ─── */}
      {filteredFaqs.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Quick Q&amp;A</h2>
            <span className="text-sm text-muted-foreground">({filteredFaqs.length})</span>
          </div>
          <div className="space-y-2">
            {filteredFaqs.map(faq => (
              <Card key={faq.id} className="p-0">
                <button
                  className="w-full flex items-center justify-between p-3.5 font-medium text-left hover:bg-muted/50 transition-colors"
                  onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                >
                  <span className="text-sm">{faq.question}</span>
                  {openFaqId === faq.id ? (
                    <ChevronUp className="h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  )}
                </button>
                {openFaqId === faq.id && (
                  <div className="px-3.5 pb-3.5 text-sm text-muted-foreground whitespace-pre-line">
                    {faq.answer}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ─── Guide detail modal ─── */}
      <GuideDetailDialog
        guide={openGuide}
        onClose={() => setOpenGuide(null)}
        onNavigate={(path) => { setOpenGuide(null); navigate(path); }}
      />

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}

/* ─────────────── Sub-components ─────────────── */

function GuideCard({ guide, onOpen }: { guide: Guide; onOpen: () => void }) {
  const Icon = guide.icon;
  return (
    <button
      onClick={onOpen}
      className="text-left rounded-xl border hover:border-[#FF6000]/60 hover:shadow-md transition-all overflow-hidden bg-card flex flex-col"
    >
      {/* Cover */}
      <div
        className="h-20 px-4 flex items-center justify-between text-white"
        style={{ background: guide.gradient }}
      >
        <Icon className="h-8 w-8 opacity-90" />
        <Badge variant="secondary" className="bg-white/20 text-white text-[10px] border-0">
          {guide.category}
        </Badge>
      </div>
      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm mb-1">{guide.title}</h3>
        <p className="text-xs text-muted-foreground mb-3 flex-1 line-clamp-2">{guide.summary}</p>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {guide.estimatedMin} min · {guide.steps.length} steps
          </span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </button>
  );
}

function GuideDetailDialog({
  guide,
  onClose,
  onNavigate,
}: {
  guide: Guide | null;
  onClose: () => void;
  onNavigate: (path: string) => void;
}) {
  const [stepIdx, setStepIdx] = useState(0);

  /* Reset step when a different guide opens */
  useMemo(() => { setStepIdx(0); return null; }, [guide?.id]);

  if (!guide) return null;
  const step = guide.steps[stepIdx];
  const Icon = guide.icon;
  const isLast = stepIdx === guide.steps.length - 1;

  return (
    <Dialog open={!!guide} onOpenChange={(o) => !o && onClose()}>
      <DialogContent style={{ maxWidth: 640, width: "92vw" }} className="max-h-[92vh] overflow-y-auto p-0">
        {/* Cover */}
        <div
          className="h-28 px-6 flex items-center justify-between text-white"
          style={{ background: guide.gradient }}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-10 w-10" />
            <div>
              <DialogHeader>
                <DialogTitle className="text-white text-lg">{guide.title}</DialogTitle>
              </DialogHeader>
              <p className="text-xs text-white/80 mt-0.5">
                {guide.category} · {guide.estimatedMin} min · {guide.steps.length} steps
              </p>
            </div>
          </div>
        </div>

        {/* Step progress dots */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-1.5">
            {guide.steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStepIdx(i)}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i === stepIdx
                    ? "bg-[#FF6000]"
                    : i < stepIdx
                    ? "bg-[#FF6000]/40"
                    : "bg-muted"
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Step {stepIdx + 1} of {guide.steps.length}
          </p>
        </div>

        {/* Step body */}
        <div className="px-6 py-4 space-y-3">
          <h3 className="text-base font-bold flex items-start gap-2">
            <span
              className="inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold shrink-0"
              style={{ background: guide.gradient, color: "white" }}
            >
              {stepIdx + 1}
            </span>
            {step.title}
          </h3>

          {/* Visual placeholder — in production: screenshot */}
          <div
            className="h-40 rounded-lg flex items-center justify-center text-white/60 text-xs"
            style={{ background: guide.gradient, opacity: 0.25 }}
          >
            <Icon className="h-12 w-12" />
          </div>

          <p className="text-sm text-muted-foreground whitespace-pre-line">{step.description}</p>

          {/* Callout */}
          {step.callout && (
            <div
              className={`rounded-md p-3 text-xs flex items-start gap-2 ${
                step.callout.type === "tip"
                  ? "bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-900"
                  : step.callout.type === "warning"
                  ? "bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900"
                  : "bg-slate-50 dark:bg-slate-950/20 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {step.callout.type === "tip" ? (
                <Lightbulb className="h-4 w-4 shrink-0" />
              ) : step.callout.type === "warning" ? (
                <AlertTriangle className="h-4 w-4 shrink-0" />
              ) : (
                <Info className="h-4 w-4 shrink-0" />
              )}
              <span>{step.callout.text}</span>
            </div>
          )}

          {/* Try-it link */}
          {step.actionPath && (
            <Button
              onClick={() => onNavigate(step.actionPath!)}
              style={{ background: "#FF6000" }}
              className="text-white"
              size="sm"
            >
              {step.actionLabel || "Try it now"} <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-6 py-3 border-t bg-muted/30 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={stepIdx === 0}
              onClick={() => setStepIdx(i => Math.max(0, i - 1))}
            >
              Previous
            </Button>
            {isLast ? (
              <Button
                size="sm"
                onClick={onClose}
                style={{ background: "#FF6000" }}
                className="text-white"
              >
                Finish
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setStepIdx(i => i + 1)}
                style={{ background: "#FF6000" }}
                className="text-white"
              >
                Next <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
