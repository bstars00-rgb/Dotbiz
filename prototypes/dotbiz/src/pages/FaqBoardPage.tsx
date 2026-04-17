import { useState } from "react";
import { Search, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useScreenState } from "@/hooks/useScreenState";
import { StateToolbar } from "@/components/StateToolbar";
import { faqs } from "@/mocks/faqs";
import { useI18n } from "@/contexts/I18nContext";

export default function FaqBoardPage() {
  const { state, setState } = useScreenState("success");
  const { t } = useI18n();
  const [openId, setOpenId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = faqs.filter(f => {
    const matchesSearch = !searchTerm || f.question.toLowerCase().includes(searchTerm.toLowerCase()) || f.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === "all" || f.category.toLowerCase() === category;
    return matchesSearch && matchesCategory;
  });

  if (state === "loading") return (<div className="p-6 space-y-4"><Skeleton className="h-10 w-96" /><Skeleton className="h-10 w-full" />{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}<StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">No FAQs Found</h2><p className="text-muted-foreground mt-2">No frequently asked questions match your search.</p></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>FAQ Error</AlertTitle><AlertDescription>Failed to load FAQs. Please try again.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{t("page.faq")}</h1>

      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input placeholder="Search FAQs..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList>
          {["all","booking","payment","cancellation","account","technical"].map(t => <TabsTrigger key={t} value={t}>{t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {filtered.map(faq => (
          <Card key={faq.id} className="p-0">
            <button className="w-full flex items-center justify-between p-4 font-medium text-left hover:bg-muted/50 transition-colors" onClick={() => setOpenId(openId === faq.id ? null : faq.id)}>
              <span>{faq.question}</span>
              {openId === faq.id ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
            </button>
            {openId === faq.id && (
              <div className="px-4 pb-4 text-sm text-muted-foreground">{faq.answer}</div>
            )}
          </Card>
        ))}
      </div>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}
