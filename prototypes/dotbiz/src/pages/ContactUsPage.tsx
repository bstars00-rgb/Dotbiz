import { useNavigate } from "react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ContactUsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="text-xs text-muted-foreground">
        <span className="hover:text-foreground cursor-pointer" onClick={() => navigate("/app/dashboard")}>Home</span>
        <span className="mx-2">&gt;</span>
        <span className="text-foreground font-medium">Contact Us</span>
      </div>

      {/* Hotel Customer Service */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-5">Hotel Customer Service</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Korean Market */}
          <div>
            <h3 className="font-bold text-sm mb-3">Korean Market</h3>
            <div className="space-y-2.5 text-sm">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                02-733-0550
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href="mailto:cscenter@ohmyhotel.com" className="text-primary hover:underline">cscenter@ohmyhotel.com</a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href="mailto:complaints@ohmyhotel.com" className="text-primary hover:underline">complaints@ohmyhotel.com</a>
                <span className="text-xs text-muted-foreground">(if complaints)</span>
              </p>
            </div>
          </div>

          {/* Global Market */}
          <div>
            <h3 className="font-bold text-sm mb-3">Global Market</h3>
            <div className="space-y-2.5 text-sm">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                +82-2-733-0550
                <span className="text-xs text-muted-foreground">(Virtual Numbers such as Skype are not supported)</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                +65-3138-1045
                <span className="text-xs text-muted-foreground">(Alternative)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href="mailto:global@ohmyhotel.com" className="text-primary hover:underline">global@ohmyhotel.com</a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href="mailto:complaints.global@ohmyhotel.com" className="text-primary hover:underline">complaints.global@ohmyhotel.com</a>
                <span className="text-xs text-muted-foreground">(if complaints)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href="mailto:reconfirm@ohmyhotel.com" className="text-primary hover:underline">reconfirm@ohmyhotel.com</a>
                <span className="text-xs text-muted-foreground">(hotel confirmation inquiries)</span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Separator className="border-dashed" />

      {/* Hotel Business Contact */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-5">Hotel Business Contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-sm mb-3">Korean Market</h3>
            <div className="space-y-2.5 text-sm">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href="mailto:partner.kr@ohmyhotel.com" className="text-primary hover:underline">partner.kr@ohmyhotel.com</a>
              </p>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-3">Global Market</h3>
            <div className="space-y-2.5 text-sm">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href="mailto:partner.global@ohmyhotel.com" className="text-primary hover:underline">partner.global@ohmyhotel.com</a>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Separator className="border-dashed" />

      {/* Office Locations */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-5">Office Locations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-1.5"><MapPin className="h-4 w-4" />Seoul Office (HQ)</h3>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>6th floor, GT Dongdaemun Building</p>
              <p>328 Jong-ro (330-1 Changsin-dong)</p>
              <p>Jongno-gu, Seoul, South Korea 03121</p>
              <p className="mt-2 text-foreground font-medium">Mon-Fri 09:00 ~ 18:00 (KST)</p>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-1.5"><MapPin className="h-4 w-4" />Singapore Office</h3>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>OHMYHOTEL GLOBAL PTE. LTD.</p>
              <p>Singapore</p>
              <p className="mt-2 text-foreground font-medium">Mon-Fri 09:00 ~ 18:00 (SGT)</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
