import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const RATES: Record<string, { rate: number; symbol: string; name: string }> = {
  KRW: { rate: 1495, symbol: "₩", name: "Korean Won" },
  JPY: { rate: 156.8, symbol: "¥", name: "Japanese Yen" },
  CNY: { rate: 7.26, symbol: "¥", name: "Chinese Yuan" },
  VND: { rate: 25435, symbol: "₫", name: "Vietnamese Dong" },
  EUR: { rate: 0.92, symbol: "€", name: "Euro" },
  GBP: { rate: 0.79, symbol: "£", name: "British Pound" },
  THB: { rate: 34.2, symbol: "฿", name: "Thai Baht" },
  SGD: { rate: 1.34, symbol: "S$", name: "Singapore Dollar" },
  HKD: { rate: 7.81, symbol: "HK$", name: "Hong Kong Dollar" },
  TWD: { rate: 32.5, symbol: "NT$", name: "Taiwan Dollar" },
};

export default function CurrencyCalculator() {
  const [open, setOpen] = useState(false);
  const [usd, setUsd] = useState("100");

  const amount = parseFloat(usd) || 0;

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Currency Calculator"
        style={{ background: "#0891b2" }}
      >
        <Calculator className="h-6 w-6" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-[380px] sm:w-[420px] p-0 flex flex-col">
          <SheetHeader className="px-5 py-4 border-b shrink-0">
            <SheetTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Currency Calculator
            </SheetTitle>
          </SheetHeader>

          <div className="p-5 space-y-4 overflow-auto flex-1">
            {/* USD Input */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <Input
                  type="number"
                  value={usd}
                  onChange={e => setUsd(e.target.value)}
                  className="pl-7 text-lg font-bold h-12"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Converted currencies */}
            <div className="space-y-2">
              {Object.entries(RATES).map(([code, { rate, symbol, name }]) => (
                <div key={code} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div>
                    <p className="text-sm font-bold">{code}</p>
                    <p className="text-[10px] text-muted-foreground">{name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{symbol}{(amount * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-[10px] text-muted-foreground">1 USD = {rate.toLocaleString()} {code}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              Exchange rates are approximate and for reference only.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
