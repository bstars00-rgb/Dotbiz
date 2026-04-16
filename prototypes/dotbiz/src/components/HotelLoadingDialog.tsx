import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plane, Coffee, Luggage, MapPin, Bed, UtensilsCrossed, Sparkles, DollarSign, Search, Wifi } from "lucide-react";

const loadingSteps = [
  { icon: Search, text: "Searching 50+ suppliers for live rates... 🔍", subtext: "DIDA, Hotelbeds, and more" },
  { icon: DollarSign, text: "Comparing real-time prices... 💰", subtext: "Cached prices are so last season" },
  { icon: Plane, text: "Contacting the hotel via carrier pigeon... ✈️", subtext: "Just kidding, we use WiFi" },
  { icon: Coffee, text: "Brewing the freshest room rates... ☕", subtext: "Extra strong, no markup" },
  { icon: Wifi, text: "Connecting to global distribution... 🌐", subtext: "Pinging servers across 6 continents" },
  { icon: Luggage, text: "Packing the best deals for you... 🧳", subtext: "Folding prices neatly" },
  { icon: MapPin, text: "Checking room availability... 🏊", subtext: "Almost got the last suite!" },
  { icon: Bed, text: "Negotiating with the minibar... 🍫", subtext: "Getting you a better deal" },
  { icon: UtensilsCrossed, text: "Taste-testing the breakfast buffet... 🥐", subtext: "Tough job, someone's gotta do it" },
  { icon: Sparkles, text: "Almost there! Finalizing rates... ✨", subtext: "Making sure you get the best price" },
];

interface Props {
  open: boolean;
  hotelName: string;
  onComplete: () => void;
}

export default function HotelLoadingDialog({ open, hotelName, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [supplierCount, setSupplierCount] = useState(0);

  useEffect(() => {
    if (!open) { setStep(0); setProgress(0); setSupplierCount(0); return; }

    const randomStart = Math.floor(Math.random() * loadingSteps.length);
    setStep(randomStart);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 12 + 3;
      });
    }, 200);

    // Supplier counter
    const supplierInterval = setInterval(() => {
      setSupplierCount(prev => Math.min(prev + Math.floor(Math.random() * 8) + 3, 54));
    }, 300);

    // Cycle through messages
    const msgInterval = setInterval(() => {
      setStep(prev => (prev + 1) % loadingSteps.length);
    }, 900);

    // Complete after 2-3s
    const timeout = setTimeout(() => {
      setProgress(100);
      setSupplierCount(54);
      setTimeout(onComplete, 400);
    }, 2000 + Math.random() * 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(supplierInterval);
      clearInterval(msgInterval);
      clearTimeout(timeout);
    };
  }, [open, onComplete]);

  const current = loadingSteps[step % loadingSteps.length];
  const Icon = current.icon;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <div className="flex flex-col items-center py-6 gap-4">
          {/* Animated icon */}
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Icon className="h-8 w-8 text-primary animate-bounce" />
            </div>
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </div>
          </div>

          {/* Hotel name */}
          <p className="text-xs text-muted-foreground">Fetching live rates for</p>
          <h3 className="text-lg font-bold text-center -mt-3">{hotelName}</h3>

          {/* Fun message */}
          <div className="text-center min-h-[48px]">
            <p className="text-sm font-medium">{current.text}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{current.subtext}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%`, background: "var(--primary)" }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Checked <span className="font-bold text-foreground">{supplierCount}</span> / 54 suppliers worldwide
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
