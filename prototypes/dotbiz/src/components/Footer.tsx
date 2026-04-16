import { useNavigate } from "react-router";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="mt-auto border-t bg-card">
      {/* Main Footer */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)" }}>
        {/* Decorative dots */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{
              width: `${3 + Math.random() * 6}px`, height: `${3 + Math.random() * 6}px`,
              top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? "#FF6000" : i % 3 === 1 ? "#60A5FA" : "#F472B6",
            }} />
          ))}
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About Us */}
            <div>
              <h4 className="text-white font-bold text-lg mb-4">About Us</h4>
              <ul className="space-y-2.5">
                <li><a href="#" onClick={e => { e.preventDefault(); navigate("/app/contact"); }} className="text-slate-400 text-sm hover:text-white transition-colors cursor-pointer">Contact Us</a></li>
                <li><a href="#" onClick={e => { e.preventDefault(); const langMap: Record<string,string> = { EN: "en", KO: "ko", JA: "ja", ZH: "zh", VI: "vi" }; const sel = document.querySelector('select[aria-label="Language"]') as HTMLSelectElement | null; const lang = langMap[sel?.value || "EN"] || "en"; window.open(`https://ohmyhotelnco.com/?lang=${lang}`, "_blank"); }} className="text-slate-400 text-sm hover:text-white transition-colors cursor-pointer">About DOTBIZ</a></li>
                <li><a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">Partnership</a></li>
              </ul>
            </div>

            {/* Terms and Conditions */}
            <div className="md:border-l md:border-slate-700 md:pl-8">
              <h4 className="text-white font-bold text-lg mb-4">Terms and Conditions</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">DOTBIZ Platform Service Agreement</a></li>
                <li><a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>

            {/* Follow Us */}
            <div className="md:border-l md:border-slate-700 md:pl-8">
              <h4 className="text-white font-bold text-lg mb-4">Follow Us</h4>
              <div className="flex gap-3">
                <a href="#" className="h-10 w-10 rounded-full border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-colors" aria-label="LinkedIn">
                  <span className="text-sm font-bold">in</span>
                </a>
                <a href="#" className="h-10 w-10 rounded-full border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-colors" aria-label="WeChat">
                  <span className="text-sm">W</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-background border-t px-6 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <p className="text-xs text-muted-foreground">&copy; 2026 OHMYHOTEL GLOBAL PTE. LTD. All rights reserved.</p>
            <div className="flex items-center gap-4 shrink-0 text-xs">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
              <Separator orientation="vertical" className="h-3" />
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms & Condition</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
