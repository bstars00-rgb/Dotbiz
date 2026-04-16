import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Download, Moon, Sun, RefreshCw, Upload, X, FileText, Image as ImageIcon, File, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useScreenState } from "@/hooks/useScreenState";
import { useFormValidation } from "@/hooks/useFormValidation";
import { toast } from "sonner";

export default function RegistrationPage() {
  const { state, setState } = useScreenState("success");
  const navigate = useNavigate();
  const { errors, validate } = useFormValidation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "", businessRegNo: "", businessType: "Prepaid", address: "", phone: "", companyEmail: "",
    fullName: "", position: "", userEmail: "", password: "", confirmPassword: "", mobile: "", language: "EN",
    termsAgreed: false,
  });
  const [documents, setDocuments] = useState<{ id: string; name: string; size: number; type: string; url: string }[]>([]);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [dark, setDark] = useState(false);

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
    const newDocs: typeof documents = [];
    Array.from(files).forEach(file => {
      if (!allowed.includes(file.type)) {
        toast.error(`Unsupported format: ${file.name}`, { description: "Supported: JPG, PNG, PDF" });
        return;
      }
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}`, { description: "Maximum file size: 10MB" });
        return;
      }
      newDocs.push({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      });
    });
    setDocuments(prev => [...prev, ...newDocs].slice(0, 5));
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const removeDoc = (id: string) => {
    setDocuments(prev => {
      const doc = prev.find(d => d.id === id);
      if (doc) URL.revokeObjectURL(doc.url);
      return prev.filter(d => d.id !== id);
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const toggleDark = () => { setDark(!dark); document.documentElement.classList.toggle("dark"); };

  const update = (field: string, value: string | boolean) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleNext = () => {
    if (step === 1) {
      const e1 = validate("companyName", formData.companyName, { required: true, rules: [{ type: "maxLength", value: 100, message: "Company name must not exceed 100 characters" }] });
      const e2 = validate("businessRegNo", formData.businessRegNo, { required: true, rules: [{ type: "maxLength", value: 20, message: "Registration number must not exceed 20 characters" }] });
      const e3 = validate("companyEmail", formData.companyEmail, { required: true, rules: [{ type: "email", message: "Please enter a valid email address" }] });
      if (e1 || e2 || e3) return;
      setStep(2);
    } else if (step === 2) {
      const e1 = validate("fullName", formData.fullName, { required: true, rules: [] });
      const e2 = validate("userEmail", formData.userEmail, { required: true, rules: [{ type: "email", message: "Please enter a valid email address" }] });
      const e3 = validate("password", formData.password, { required: true, rules: [{ type: "minLength", value: 8, message: "Password must be at least 8 characters" }] });
      if (e1 || e2 || e3) return;
      setStep(3);
    } else {
      if (!formData.termsAgreed) {
        validate("terms", "", { required: true, rules: [{ type: "required", message: "You must agree to the terms to proceed" }] });
        return;
      }
      toast.success("Registration Submitted", { description: "Your account is pending approval. You will be redirected to the login page." });
      navigate("/login");
    }
  };

  if (state === "loading") return (<div className="flex flex-col items-center justify-center min-h-screen"><Skeleton className="h-10 w-40 mb-8" /><Skeleton className="h-12 w-96 mb-4" /><Skeleton className="h-96 w-[600px]" /><Toolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="min-h-screen flex items-center justify-center"><Card className="max-w-md p-6 text-center"><h2 className="text-xl font-semibold">Registration</h2><p className="text-muted-foreground mt-2">Complete the registration form to create your account.</p></Card><Toolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="min-h-screen flex items-center justify-center"><Alert variant="destructive" className="max-w-md"><AlertTitle>Registration Error</AlertTitle><AlertDescription>An error occurred during registration. Please try again.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><Toolbar state={state} setState={setState} /></div>);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between h-14 border-b px-4 shrink-0">
        <span className="text-xl font-bold text-primary font-heading">DOTBIZ</span>
        <Button variant="ghost" size="icon" onClick={toggleDark} aria-label="Toggle dark mode">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
      </header>

      <div className="flex items-center justify-center gap-4 py-6">
        <Badge variant={step >= 1 ? "default" : "secondary"}>1. Company Info</Badge>
        <Badge variant={step >= 2 ? "default" : "secondary"}>2. User Info</Badge>
        <Badge variant={step >= 3 ? "default" : "secondary"}>3. Agreement</Badge>
      </div>

      <Card className="max-w-2xl mx-auto p-8 w-full">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="companyName" className="text-sm font-medium">Company Name <span className="text-destructive">*</span></label>
              <Input id="companyName" placeholder="Enter company name" value={formData.companyName} onChange={e => update("companyName", e.target.value)} onBlur={() => validate("companyName", formData.companyName, { required: true, rules: [{ type: "maxLength", value: 100, message: "Company name must not exceed 100 characters" }] })} />
              {errors.companyName && <p className="text-sm text-destructive mt-1">{errors.companyName}</p>}
            </div>
            <div>
              <label htmlFor="businessRegNo" className="text-sm font-medium">Business Registration No. <span className="text-destructive">*</span></label>
              <Input id="businessRegNo" placeholder="Enter registration number" value={formData.businessRegNo} onChange={e => update("businessRegNo", e.target.value)} />
              {errors.businessRegNo && <p className="text-sm text-destructive mt-1">{errors.businessRegNo}</p>}
            </div>
            <div>
              <label htmlFor="businessType" className="text-sm font-medium">Business Type <span className="text-destructive">*</span></label>
              <select id="businessType" className="w-full border rounded px-3 py-2 text-sm bg-background" value={formData.businessType} onChange={e => update("businessType", e.target.value)}>
                <option>Prepaid</option><option>Postpaid</option>
              </select>
            </div>
            <div>
              <label htmlFor="address" className="text-sm font-medium">Address</label>
              <Input id="address" placeholder="Enter company address" value={formData.address} onChange={e => update("address", e.target.value)} />
            </div>
            <div>
              <label htmlFor="phone" className="text-sm font-medium">Phone</label>
              <Input id="phone" placeholder="Enter phone number" value={formData.phone} onChange={e => update("phone", e.target.value)} />
              {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="companyEmail" className="text-sm font-medium">Company Email <span className="text-destructive">*</span></label>
              <Input id="companyEmail" type="email" placeholder="Enter company email" value={formData.companyEmail} onChange={e => update("companyEmail", e.target.value)} onBlur={() => validate("companyEmail", formData.companyEmail, { required: true, rules: [{ type: "email", message: "Please enter a valid email address" }] })} />
              {errors.companyEmail && <p className="text-sm text-destructive mt-1">{errors.companyEmail}</p>}
            </div>

            {/* Document Attachment */}
            <div>
              <label className="text-sm font-medium">Document Attachment</label>
              <input
                ref={docInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={handleDocUpload}
              />
              <div className="mt-2 flex flex-wrap gap-3">
                {documents.map(doc => (
                  <div key={doc.id} className="relative group border rounded-xl overflow-hidden w-[100px] h-[100px] bg-muted/30">
                    {doc.type.startsWith("image/") ? (
                      <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                        <FileText className="h-8 w-8 text-[#FF6000]" />
                        <span className="text-[10px] text-muted-foreground truncate w-full text-center">{doc.name}</span>
                      </div>
                    )}
                    <button
                      onClick={() => removeDoc(doc.id)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1 py-0.5 text-center truncate">
                      {formatSize(doc.size)}
                    </div>
                  </div>
                ))}
                {documents.length < 5 && (
                  <button
                    onClick={() => docInputRef.current?.click()}
                    className="w-[100px] h-[100px] border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-[#FF6000] hover:bg-[#FF6000]/5 transition-colors cursor-pointer"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Upload</span>
                  </button>
                )}
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs flex items-center gap-1" style={{ color: "#FF6000" }}>
                  <AlertCircle className="h-3 w-3" />
                  The name on the official business qualification certificate must match the Company Name.
                </p>
                <p className="text-xs text-muted-foreground">
                  • Supported formats: jpg, png, pdf. Maximum file size: 10MB. Multiple documents can be uploaded.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="text-sm font-medium">Full Name <span className="text-destructive">*</span></label>
              <Input id="fullName" placeholder="Enter your full name" value={formData.fullName} onChange={e => update("fullName", e.target.value)} />
              {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label htmlFor="position" className="text-sm font-medium">Position</label>
              <Input id="position" placeholder="Enter your job title" value={formData.position} onChange={e => update("position", e.target.value)} />
            </div>
            <div>
              <label htmlFor="userEmail" className="text-sm font-medium">Email <span className="text-destructive">*</span></label>
              <Input id="userEmail" type="email" placeholder="Enter your email" value={formData.userEmail} onChange={e => update("userEmail", e.target.value)} />
              {errors.userEmail && <p className="text-sm text-destructive mt-1">{errors.userEmail}</p>}
            </div>
            <div>
              <label htmlFor="regPassword" className="text-sm font-medium">Password <span className="text-destructive">*</span></label>
              <Input id="regPassword" type="password" placeholder="Enter password" value={formData.password} onChange={e => update("password", e.target.value)} />
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password <span className="text-destructive">*</span></label>
              <Input id="confirmPassword" type="password" placeholder="Re-enter password" value={formData.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} />
            </div>
            <div>
              <label htmlFor="mobile" className="text-sm font-medium">Mobile</label>
              <Input id="mobile" placeholder="Enter mobile number" value={formData.mobile} onChange={e => update("mobile", e.target.value)} />
            </div>
            <div>
              <label htmlFor="language" className="text-sm font-medium">Preferred Language</label>
              <select id="language" className="w-full border rounded px-3 py-2 text-sm bg-background" value={formData.language} onChange={e => update("language", e.target.value)}>
                {["EN","KO","JA","ZH","VI"].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox id="terms" checked={formData.termsAgreed} onCheckedChange={c => update("termsAgreed", !!c)} />
              <label htmlFor="terms" className="text-sm">I agree to the B2B Terms of Service <span className="text-destructive">*</span></label>
            </div>
            {errors.terms && <p className="text-sm text-destructive mt-1">{errors.terms}</p>}
            <Button variant="outline" onClick={() => console.log("Download contract")}>
              <Download className="h-4 w-4 mr-2" aria-hidden="true" />Download Contract PDF
            </Button>
          </div>
        )}
      </Card>

      <div className="flex justify-between max-w-2xl mx-auto py-4 w-full">
        <Button variant="outline" onClick={() => step > 1 ? setStep(step - 1) : navigate("/login")}>
          <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />Back
        </Button>
        <Button onClick={handleNext}>
          {step === 3 ? "Submit" : "Next"}<ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
        </Button>
      </div>
      <Toolbar state={state} setState={setState} />
    </div>
  );
}

function Toolbar({ state, setState }: { state: string; setState: (s: "loading" | "empty" | "error" | "success") => void }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-muted border rounded-full px-3 py-1.5 shadow-lg flex items-center gap-2">
      {(["loading", "empty", "error", "success"] as const).map(s => (
        <Button key={s} size="sm" variant={state === s ? "default" : "outline"} onClick={() => setState(s)}>{s}</Button>
      ))}
    </div>
  );
}
