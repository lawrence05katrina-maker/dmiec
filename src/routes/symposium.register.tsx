import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SymposiumLayout, MagneticButton } from "@/components/SymposiumLayout";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Upload, ShieldCheck, QrCode, IndianRupee, AlertCircle, ArrowLeft, Share2, HelpCircle, X } from "lucide-react";
import { BASE_URL } from "@/config/apiConfig";

export const Route = createFileRoute("/symposium/register")({ component: SymposiumRegister });

/* ── Payment config — change these to your real UPI details ──────────────
   QR_IMAGE points at a file in your /public folder. Drop your UPI QR
   screenshot in as public/upi-qr.png and it renders automatically; if the
   file is missing the component falls back to a readable UPI ID panel. */
const UPI_ID = "6369857409@pytes";
const PAYEE_NAME = "DMI Engineering College — IT Dept";
const QR_IMAGE = "/upi-qr.jpeg";

const TECHNICAL_EVENTS = ["Paper Presentation", "Project Expo", "Website Creation", "Debugging", "Quiz"];
const NON_TECHNICAL_EVENTS = ["Meme Creation", "Prompt Battle", "Imposter Game", "BGM Finding"];

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS: Record<Step, string> = {
  1: "Your details",
  2: "Pay",
  3: "Confirm payment",
  4: "Done",
};

function SymposiumRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", college: "", department: "", year: "",
    food: "" as "" | "veg" | "nonveg",
    events: [] as string[],
    paperMode: "" as "" | "online" | "offline",
    paperTeamName: "",
    pptLink: "",
    paperTeamMembers: ["", "", ""] as [string, string, string],
    projectTeamMembers: ["", "", ""] as [string, string, string],
    referredBy: "",
  });

  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string>("");
  const [technicalError, setTechnicalError] = useState("");
  const [nonTechnicalError, setNonTechnicalError] = useState("");
  const [payError, setPayError] = useState("");
  const [paymentClaimed, setPaymentClaimed] = useState(false);
  const [showHelpToast, setShowHelpToast] = useState(true);
  const [isMobile, setIsMobile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedReferralCode, setSubmittedReferralCode] = useState("");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    setIsMobile(!mq.matches);

    const handleResize = () => setIsMobile(!mq.matches);
    mq.addEventListener("change", handleResize);
    return () => mq.removeEventListener("change", handleResize);
  }, []);

  const includesPaper = form.events.includes("Paper Presentation");
  const includesProject = form.events.includes("Project Expo");
  const isOnlinePaper = includesPaper && form.paperMode === "online";
  
  // Calculate fee: ₹150 for online events, ₹200 for offline events
  const fee = isOnlinePaper ? 150 : 200;

  // Scroll to top whenever the step changes — on mobile you'd otherwise land
  // mid-page after a long form.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Clean up the object URL so we aren't leaking blobs on re-upload.
  useEffect(() => {
    return () => {
      if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
    };
  }, [screenshotUrl]);

  // If paper presentation mode changes to online, remove non-technical events and clear food preference
  useEffect(() => {
    if (isOnlinePaper) {
      const hasNonTechnical = form.events.some(e => NON_TECHNICAL_EVENTS.includes(e));
      if (hasNonTechnical) {
        setForm(f => ({
          ...f,
          events: f.events.filter(e => TECHNICAL_EVENTS.includes(e))
        }));
        setNonTechnicalError("Non-technical events have been removed because Paper Presentation is in online mode.");
      }
      // Clear food preference for online mode
      if (form.food) {
        setForm(f => ({ ...f, food: "" }));
      }
    }
  }, [isOnlinePaper]);

  function toggleEvent(ev: string) {
    const isTechnical = TECHNICAL_EVENTS.includes(ev);
    const selectedTechnical = form.events.filter((e) => TECHNICAL_EVENTS.includes(e));
    const selectedNonTechnical = form.events.filter((e) => NON_TECHNICAL_EVENTS.includes(e));

    // Check if trying to select a non-technical event when online paper presentation is selected
    if (!isTechnical && !form.events.includes(ev) && isOnlinePaper) {
      setNonTechnicalError("You cannot select non-technical events when Paper Presentation is in online mode.");
      return;
    }

    if (!form.events.includes(ev)) {
      if (isTechnical && selectedTechnical.length >= 1) {
        setTechnicalError("You can register for only one technical event. Unselect the other one first.");
        return;
      }
      if (!isTechnical && selectedNonTechnical.length >= 1) {
        setNonTechnicalError("You can register for only one non-technical event. Unselect the other one first.");
        return;
      }
      // Clear errors when successfully selecting
      setTechnicalError("");
      setNonTechnicalError("");
    } else {
      // Clear errors when unselecting
      setTechnicalError("");
      setNonTechnicalError("");
    }

    setForm((f) => ({
      ...f,
      events: f.events.includes(ev) ? f.events.filter((e) => e !== ev) : [...f.events, ev],
    }));
  }

  function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.events.length === 0) {
      setTechnicalError("Pick at least one event to continue.");
      return;
    }
    if (includesPaper && !form.paperMode) {
      setTechnicalError("Choose online or offline mode for Paper Presentation.");
      return;
    }
    if (includesPaper && (form.paperMode === "online" || form.paperMode === "offline")) {
      if (!form.paperTeamName.trim()) {
        setTechnicalError("Please enter a team name for Paper Presentation.");
        return;
      }
      const emptyMembers = form.paperTeamMembers.filter(m => !m.trim()).length;
      if (emptyMembers > 0) {
        setTechnicalError("Please enter all 3 team member names for Paper Presentation.");
        return;
      }
    }
    if (includesProject) {
      const emptyMembers = form.projectTeamMembers.filter(m => !m.trim()).length;
      if (emptyMembers > 0) {
        setTechnicalError("Please enter all 3 team member names for Project Expo.");
        return;
      }
    }
    setTechnicalError("");
    setNonTechnicalError("");
    setStep(2);
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPayError("Upload an image file — PNG or JPG.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPayError("That image is over 5MB. Compress it or take a fresh screenshot.");
      return;
    }
    if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
    setScreenshot(file);
    setScreenshotUrl(URL.createObjectURL(file));
    setPayError("");
  }

  function handleConfirmSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{12}$/.test(utr.trim())) {
      setPayError("Enter the 12-digit UTR number from your payment app.");
      return;
    }
    if (!screenshot) {
      setPayError("Attach the payment screenshot so we can verify it.");
      return;
    }
    setPayError("");
    setSubmitting(true);

    // Build FormData
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("college", form.college);
    formData.append("department", form.department);
    formData.append("year", form.year);
    
    // Only append food if not online paper presentation
    if (!isOnlinePaper && form.food) {
      formData.append("food", form.food);
    }
    
    formData.append("events", JSON.stringify(form.events));
    
    // Paper Presentation fields
    if (includesPaper && form.paperMode) {
      formData.append("paperMode", form.paperMode);
      formData.append("paperTeamName", form.paperTeamName);
      formData.append("paperTeamMembers", JSON.stringify(form.paperTeamMembers));
    }
    
    // Project Expo fields
    if (includesProject) {
      formData.append("projectTeamMembers", JSON.stringify(form.projectTeamMembers));
    }
    
    formData.append("pptLink", form.pptLink);
    
    if (form.referredBy) {
      formData.append("referredBy", form.referredBy);
    }
    
    formData.append("utr", utr);
    formData.append("paymentScreenshot", screenshot);

    // POST to API
    fetch(`${BASE_URL}/api/symposium/register`, {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          setPayError(errorBody.message || "Registration failed. Please try again.");
          setSubmitting(false);
          return;
        }
        const data = await res.json();
        setSubmittedReferralCode(data.referralCode);
        setStep(4);
        setSubmitting(false);
      })
      .catch((err) => {
        setPayError(err.message || "Failed to submit registration. Please try again.");
        setSubmitting(false);
      });
  }

  return (
    <SymposiumLayout>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <h1 className="text-2xl sm:text-5xl font-black uppercase tracking-tight text-center">
          {step === 4 ? "You're in." : "Register"}
        </h1>
        <p className="text-white/50 text-center mt-2 sm:mt-3 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          {step === 4
            ? "We'll verify your payment and email your confirmation within 24 hours."
            : "₹200 registration fee · ₹150 for online paper presentation · All colleges, Tech branches"}
        </p>

        <StepBar current={step} />

        {step === 1 && (
          <DetailsStep
            form={form}
            setForm={setForm}
            toggleEvent={toggleEvent}
            technicalError={technicalError}
            nonTechnicalError={nonTechnicalError}
            includesPaper={includesPaper}
            includesProject={includesProject}
            isOnlinePaper={isOnlinePaper}
            onSubmit={handleDetailsSubmit}
          />
        )}

        {step === 2 && (
          <PaymentStep
            form={form}
            fee={fee}
            isOnlinePaper={isOnlinePaper}
            paymentClaimed={paymentClaimed}
            onClaim={() => {
              setPaymentClaimed(true);
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <ConfirmStep
            fee={fee}
            utr={utr}
            setUtr={setUtr}
            screenshot={screenshot}
            screenshotUrl={screenshotUrl}
            onFile={handleFile}
            onClear={() => {
              if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
              setScreenshot(null);
              setScreenshotUrl("");
            }}
            error={payError}
            submitting={submitting}
            onSubmit={handleConfirmSubmit}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <SuccessStep
            form={form}
            fee={fee}
            code={submittedReferralCode}
            utr={utr}
            onEvents={() => navigate({ to: "/symposium/events" })}
          />
        )}
      </section>

      <style>{`
        .input {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          padding: 0.7rem 0.75rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
          border-radius: 0;
        }
        .input::placeholder { color: rgba(255,255,255,0.28); }
        .input:focus { border-color: #FF0000; }
        .input option { background: #111112; color: white; }
        /* Smaller inputs on mobile - 14px to prevent zoom, reduced padding */
        @media (max-width: 640px) { 
          .input { 
            font-size: 14px; 
            padding: 0.5rem 0.6rem;
          } 
        }
      `}</style>

      {/* Help Toast */}
      {showHelpToast && (
        <div className="fixed z-50 bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm animate-[slideUp_0.3s_ease]">
          <div className="relative bg-[#0e0e10] border border-[#FF0000]/40 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FF0000]/10 blur-3xl pointer-events-none" />

            <button
              onClick={() => setShowHelpToast(false)}
              aria-label="Close"
              className="absolute top-2.5 right-2.5 h-8 w-8 grid place-items-center text-white/40 hover:text-white transition-colors z-10 touch-manipulation active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>

            {isMobile ? (
              // Mobile compact view
              <div className="relative flex items-center gap-2.5 p-3 pr-10">
                <div className="h-2 w-2 rounded-full bg-[#FF0000] animate-pulse shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/90 truncate">
                    Issues with registration? Raise a query
                  </p>
                </div>
                <button
                  onClick={() => navigate({ to: "/symposium/support" })}
                  className="px-4 py-2 bg-[#FF0000] text-white text-[10px] font-bold uppercase tracking-wider hover:brightness-110 transition shrink-0 touch-manipulation active:scale-95 min-h-[44px] flex items-center"
                >
                  Help
                </button>
              </div>
            ) : (
              // Desktop full card view
              <div className="relative p-5 pr-10">
                <div className="text-[10px] uppercase tracking-[0.25em] text-[#FF0000] font-bold mb-1.5">
                  Need help?
                </div>
                <div className="text-base font-bold leading-snug">
                  Facing issues with registration?
                </div>
                <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                  We're here to help! Click below to raise a query and our team will assist you.
                </p>
                <button
                  onClick={() => navigate({ to: "/symposium/support" })}
                  className="mt-3 px-4 py-2.5 bg-[#FF0000] text-white text-xs font-bold uppercase tracking-wide hover:brightness-110 transition touch-manipulation active:scale-95"
                >
                  Raise Query
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </SymposiumLayout>
  );
}

/* ── Step indicator ─────────────────────────────────────────────────────── */
function StepBar({ current }: { current: Step }) {
  const steps: Step[] = [1, 2, 3, 4];
  return (
    <div className="mt-8 sm:mt-10 flex items-center justify-center gap-1.5 sm:gap-3">
      {steps.map((s, i) => {
        const done = current > s;
        const active = current === s;
        return (
          <div key={s} className="flex items-center gap-1.5 sm:gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`h-7 w-7 sm:h-8 sm:w-8 shrink-0 grid place-items-center text-[11px] font-bold border transition-colors ${
                  done
                    ? "bg-[#FF0000] border-[#FF0000] text-white"
                    : active
                    ? "border-[#FF0000] text-[#FF0000]"
                    : "border-white/20 text-white/30"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : s}
              </div>
              <span
                className={`hidden md:inline text-[10px] uppercase tracking-widest ${
                  active ? "text-white" : "text-white/35"
                }`}
              >
                {STEP_LABELS[s]}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-5 sm:w-10 ${done ? "bg-[#FF0000]" : "bg-white/15"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step 1: details ────────────────────────────────────────────────────── */
type FormState = {
  name: string; email: string; phone: string; college: string; department: string; year: string;
  food: "" | "veg" | "nonveg";
  events: string[];
  paperMode: "" | "online" | "offline";
  paperTeamName: string;
  pptLink: string;
  paperTeamMembers: [string, string, string];
  projectTeamMembers: [string, string, string];
  referredBy: string;
};

function DetailsStep({
  form, setForm, toggleEvent, technicalError, nonTechnicalError, includesPaper, includesProject, isOnlinePaper, onSubmit,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  toggleEvent: (ev: string) => void;
  technicalError: string;
  nonTechnicalError: string;
  includesPaper: boolean;
  includesProject: boolean;
  isOnlinePaper: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-6 sm:mt-10 space-y-5 sm:space-y-6 border border-white/10 p-4 sm:p-8">
      <div className="grid sm:grid-cols-2 gap-3 sm:gap-5">
        <Field label="Full name">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="As on your college ID" />
        </Field>
        <Field label="Email">
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="you@example.com" />
        </Field>
        <Field label="WhatsApp No">
          <input required type="tel" inputMode="numeric" pattern="[0-9]{10}" title="10-digit WhatsApp number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="10-digit WhatsApp number" />
        </Field>
        <Field label="College name">
          <input required value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} className="input" />
        </Field>
        <Field label="Department">
          <input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input" />
        </Field>
        <Field label="Year">
          <select required value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="input">
            <option value="">Select</option>
            <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
          </select>
        </Field>
      </div>

      <Field label="Food preference">
        {isOnlinePaper && (
          <div className="mb-2 px-3 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs">
            ℹ️ Food preferences are not available for online Paper Presentation mode.
          </div>
        )}
        <div className="flex gap-3">
          {(["nonveg", "veg"] as const).map((f) => (
            <button
              type="button" key={f}
              onClick={() => setForm({ ...form, food: f })}
              disabled={isOnlinePaper}
              className={`flex-1 sm:flex-none px-4 py-2.5 text-sm border uppercase tracking-wide font-semibold transition-colors ${
                isOnlinePaper 
                  ? "border-white/10 text-white/30 bg-white/5 cursor-not-allowed opacity-50"
                  : form.food === f 
                    ? "bg-[#FF0000] text-white border-[#FF0000]" 
                    : "border-white/20 text-white/60 hover:border-white/40"
              }`}
            >
              {f === "veg" ? "Veg" : "Non-Veg"}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Select events — one technical + one non-technical">
        {technicalError && (
          <div className="mb-3 flex items-start gap-2 px-3 py-2.5 bg-[#FF0000]/10 border border-[#FF0000]/60 text-[#FF6B6B] text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
            <span>{technicalError}</span>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#FF0000] mb-2">Technical — prize + certificate</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {TECHNICAL_EVENTS.map((ev) => (
                <EventToggle key={ev} label={ev} selected={form.events.includes(ev)} onClick={() => toggleEvent(ev)} />
              ))}
            </div>
            <div className="text-[10px] text-white/30 mt-2">₹1000 first · ₹500 second · certificate for all</div>
          </div>
        </div>
      </Field>

      {includesPaper && (
        <div className="border border-white/10 p-4 sm:p-5 space-y-4">
          <div className="text-xs uppercase tracking-widest text-[#FF0000]">Paper presentation details</div>
          
          {!form.paperMode && (
            <div className="px-3 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs">
              ℹ️ Please select a mode. Note: Online mode will disable non-technical events.
            </div>
          )}
          
          <Field label="Mode">
            <div className="flex gap-3">
              {(["offline", "online"] as const).map((m) => (
                <button
                  type="button" key={m}
                  onClick={() => setForm({ ...form, paperMode: m })}
                  className={`flex-1 sm:flex-none px-4 py-2.5 text-sm border capitalize font-semibold transition-colors ${
                    form.paperMode === m ? "bg-[#FF0000] text-white border-[#FF0000]" : "border-white/20 text-white/60 hover:border-white/40"
                  }`}
                >
                  {m} {m === "offline" ? "(₹200)" : "(₹150)"}
                </button>
              ))}
            </div>
          </Field>
          
          {(form.paperMode === "online" || form.paperMode === "offline") && (
            <>
              <Field label="Team Name">
                <input
                  required
                  value={form.paperTeamName}
                  onChange={(e) => setForm({ ...form, paperTeamName: e.target.value })}
                  placeholder="Enter your team name"
                  className="input"
                />
              </Field>
              
              <div className="space-y-3">
                <div className="text-[11px] text-white/60 uppercase tracking-wide">Team Members (3 members required)</div>
                {[0, 1, 2].map((index) => (
                  <Field key={index} label={`Member ${index + 1} Name`}>
                    <input
                      required
                      value={form.paperTeamMembers[index]}
                      onChange={(e) => {
                        const newMembers: [string, string, string] = [...form.paperTeamMembers] as [string, string, string];
                        newMembers[index] = e.target.value;
                        setForm({ ...form, paperTeamMembers: newMembers });
                      }}
                      placeholder={`Team member ${index + 1} full name`}
                      className="input"
                    />
                  </Field>
                ))}
              </div>
            </>
          )}
          
          <Field label="PPT Google Drive link">
            <input value={form.pptLink} onChange={(e) => setForm({ ...form, pptLink: e.target.value })} placeholder="https://drive.google.com/..." className="input" />
          </Field>
        </div>
      )}

      <Field label="Non-technical event — optional">
        {nonTechnicalError && !isOnlinePaper && (
          <div className="mb-3 flex items-start gap-2 px-3 py-2.5 bg-[#FF0000]/10 border border-[#FF0000]/60 text-[#FF6B6B] text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
            <span>{nonTechnicalError}</span>
          </div>
        )}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Non-technical</div>
          {isOnlinePaper && (
            <div className="mb-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-xs">
              ⚠️ Non-technical events are unavailable when Paper Presentation is in online mode.
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-2">
            {NON_TECHNICAL_EVENTS.map((ev) => (
              <EventToggle 
                key={ev} 
                label={ev} 
                selected={form.events.includes(ev)} 
                onClick={() => toggleEvent(ev)} 
                disabled={isOnlinePaper}
              />
            ))}
          </div>
        </div>
      </Field>

      {includesProject && (
        <div className="border border-white/10 p-4 sm:p-5 space-y-4">
          <div className="text-xs uppercase tracking-widest text-[#FF0000]">Project Expo details (Offline only)</div>
          
          <div className="space-y-3">
            <div className="text-[11px] text-white/60 uppercase tracking-wide">Team Members (3 members required)</div>
            {[0, 1, 2].map((index) => (
              <Field key={index} label={`Member ${index + 1} Name`}>
                <input
                  required
                  value={form.projectTeamMembers[index]}
                  onChange={(e) => {
                    const newMembers: [string, string, string] = [...form.projectTeamMembers] as [string, string, string];
                    newMembers[index] = e.target.value;
                    setForm({ ...form, projectTeamMembers: newMembers });
                  }}
                  placeholder={`Team member ${index + 1} full name`}
                  className="input"
                />
              </Field>
            ))}
          </div>
        </div>
      )}

      <div className="border border-dashed border-[#FF0000]/40 bg-[#FF0000]/5 p-4 sm:p-5">
        <Field label="Referral code — optional">
          <input
            value={form.referredBy}
            onChange={(e) => setForm({ ...form, referredBy: e.target.value.toUpperCase() })}
            placeholder="e.g. AB26-RK4X2M"
            maxLength={14}
            className="input tracking-widest uppercase"
          />
          <p className="text-[11px] text-white/40 mt-2 leading-relaxed">
            Someone shared their code with you? Enter it here — they earn ₹10 cashback after the event.
          </p>
        </Field>
      </div>

      <MagneticButton type="submit" className="w-full py-3.5 bg-[#FF0000] text-white font-bold uppercase text-xs sm:text-sm tracking-wide hover:brightness-110">
        Continue to payment
      </MagneticButton>
    </form>
  );
}

function EventToggle({ label, selected, onClick, disabled }: { label: string; selected: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-left px-3 py-3 sm:py-2.5 text-sm border transition-colors ${
        disabled 
          ? "border-white/10 text-white/30 bg-white/5 cursor-not-allowed opacity-50" 
          : selected 
            ? "bg-[#FF0000]/10 border-[#FF0000] text-[#FF0000]" 
            : "border-white/15 text-white/60 hover:bg-white/5"
      }`}
    >
      {selected ? "✓ " : ""}{label}
      {disabled && <span className="ml-2 text-[10px]">(unavailable)</span>}
    </button>
  );
}

/* ── Step 2: payment ────────────────────────────────────────────────────── */
function PaymentStep({
  form, fee, isOnlinePaper, onClaim, onBack,
}: {
  form: FormState;
  fee: number;
  isOnlinePaper: boolean;
  paymentClaimed: boolean;
  onClaim: () => void;
  onBack: () => void;
}) {
  const [qrFailed, setQrFailed] = useState(false);
  const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${fee}&cu=INR&tn=${encodeURIComponent("InfoVerse26 Registration")}`;

  return (
    <div className="mt-8 sm:mt-10 space-y-5">
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Summary */}
        <div className="border border-white/10 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <IndianRupee className="h-4 w-4 text-[#FF0000]" />
            <h2 className="text-sm font-bold uppercase tracking-widest">Payment summary</h2>
          </div>

          <div className="border border-[#FF0000]/30 bg-[#FF0000]/5 p-4 space-y-2.5">
            <SummaryRow label="Name" value={form.name || "—"} />
            <SummaryRow label="College" value={form.college || "—"} />
            <SummaryRow label="Events" value={form.events.join(", ") || "—"} />
            {form.referredBy && <SummaryRow label="Referred by" value={form.referredBy} />}
            <div className="pt-2.5 border-t border-white/10 flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-widest text-white/40">Amount</span>
              <span className="text-3xl font-black text-[#FF0000]">₹{fee}</span>
            </div>
          </div>

          {isOnlinePaper && (
            <p className="text-[11px] text-white/40 mt-3">
              Online paper presentation rate applied — ₹150 instead of ₹200.
            </p>
          )}

          <ul className="mt-5 space-y-2.5 text-xs text-white/60">
            <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-[#FF0000] shrink-0" /> Pay directly to the college UPI ID</li>
            <li className="flex items-center gap-2"><QrCode className="h-3.5 w-3.5 text-[#FF0000] shrink-0" /> Works with GPay, PhonePe, Paytm, any UPI app</li>
            <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#FF0000] shrink-0" /> Manually verified within 24 hours</li>
          </ul>
        </div>

        {/* QR */}
        <div className="border border-white/10 p-5 sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-5">Scan to pay</h2>

          <div className="bg-white p-3 sm:p-4 mx-auto w-fit">
            {qrFailed ? (
              <div className="h-40 w-40 sm:h-48 sm:w-48 grid place-items-center text-center px-3">
                <div>
                  <QrCode className="h-8 w-8 mx-auto text-black/30 mb-2" />
                  <div className="text-[10px] text-black/60 leading-snug">
                    Add your QR at<br /><code className="text-black/80">public/upi-qr.png</code>
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={QR_IMAGE}
                alt={`UPI QR code for ${UPI_ID}`}
                onError={() => setQrFailed(true)}
                className="h-40 w-40 sm:h-48 sm:w-48 object-contain"
              />
            )}
          </div>

          <div className="mt-5 text-center space-y-1.5">
            <div className="text-xs text-white/40 uppercase tracking-widest">UPI ID</div>
            <CopyLine value={UPI_ID} />
            <div className="text-[11px] text-white/40 pt-1">Amount to pay</div>
            <div className="text-2xl font-black text-[#FF0000]">₹{fee}</div>
          </div>

          {/* On a phone this opens the UPI app directly; on desktop it no-ops,
              so it stays secondary to the QR. */}
          <a
            href={upiLink}
            className="sm:hidden mt-5 block w-full text-center px-4 py-3.5 border border-white/25 text-xs font-bold uppercase tracking-wide hover:border-[#FF0000] hover:text-[#FF0000] transition-colors"
          >
            Open UPI app
          </a>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 border border-white/20 text-[11px] sm:text-xs font-bold uppercase tracking-wide text-white/60 hover:border-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Edit details
        </button>
        <MagneticButton
          onClick={onClaim}
          className="flex-1 py-3.5 bg-[#FF0000] text-white font-bold uppercase text-xs sm:text-sm tracking-wide hover:brightness-110"
        >
          I've made the payment
        </MagneticButton>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-white/40 shrink-0">{label}</span>
      <span className="text-white/85 text-right break-words">{value}</span>
    </div>
  );
}

function CopyLine({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (http, old browser) — the text is selectable anyway.
    }
  }

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-2 px-3 py-2 border border-white/15 hover:border-[#FF0000] transition-colors group max-w-full"
    >
      <span className="font-bold text-sm tracking-wide break-all">{value}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-[#FF0000] shrink-0" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-white/40 group-hover:text-[#FF0000] shrink-0" />
      )}
    </button>
  );
}

/* ── Step 3: confirmation ───────────────────────────────────────────────── */
function ConfirmStep({
  fee, utr, setUtr, screenshot, screenshotUrl, onFile, onClear, error, submitting, onSubmit, onBack,
}: {
  fee: number;
  utr: string;
  setUtr: (v: string) => void;
  screenshot: File | null;
  screenshotUrl: string;
  onFile: (f: File | undefined) => void;
  onClear: () => void;
  error: string;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <form onSubmit={onSubmit} className="mt-8 sm:mt-10 border border-white/10 p-5 sm:p-8 space-y-6">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="h-5 w-5 text-[#FF0000] shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest">Payment confirmation required</h2>
          <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
            Your seat is held once we verify the ₹{fee} transfer. Both fields are required.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-[#FF0000]/10 border border-[#FF0000]/60 text-[#FF6B6B] text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      <Field label="UTR number / transaction ID *">
        <input
          value={utr}
          onChange={(e) => setUtr(e.target.value.replace(/\D/g, "").slice(0, 12))}
          inputMode="numeric"
          placeholder="Enter 12-digit UTR number"
          className="input tracking-widest"
        />
        <p className="text-[11px] text-white/40 mt-2">
          Find this in your payment app's transaction history — GPay calls it "UPI transaction ID".
        </p>
      </Field>

      <Field label="Payment screenshot *">
        {screenshotUrl ? (
          <div className="border border-white/15 p-3 flex flex-col sm:flex-row gap-4 items-start">
            <img src={screenshotUrl} alt="Payment screenshot preview" className="h-32 w-full sm:w-28 object-cover border border-white/10" />
            <div className="min-w-0 flex-1">
              <div className="text-sm text-white/80 truncate">{screenshot?.name}</div>
              <div className="text-[11px] text-white/40 mt-1">
                {screenshot ? `${(screenshot.size / 1024).toFixed(0)} KB` : ""}
              </div>
              <button
                type="button"
                onClick={onClear}
                className="mt-3 text-[11px] uppercase tracking-widest text-[#FF0000] hover:underline"
              >
                Replace screenshot
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              onFile(e.dataTransfer.files?.[0]);
            }}
            className={`border border-dashed p-8 text-center cursor-pointer transition-colors ${
              dragging ? "border-[#FF0000] bg-[#FF0000]/5" : "border-white/20 hover:border-white/40"
            }`}
          >
            <Upload className="h-6 w-6 mx-auto text-white/30 mb-3" />
            <div className="text-sm text-white/70">Tap to upload screenshot</div>
            <div className="text-[11px] text-white/35 mt-1">PNG or JPG, up to 5MB</div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </Field>

      <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 border border-white/20 text-[11px] sm:text-xs font-bold uppercase tracking-wide text-white/60 hover:border-white/40 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to QR
        </button>
        <MagneticButton 
          type="submit" 
          disabled={submitting}
          className="flex-1 py-3.5 bg-[#FF0000] text-white font-bold uppercase text-xs sm:text-sm tracking-wide hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit payment details"}
        </MagneticButton>
      </div>
    </form>
  );
}

/* ── Step 4: success + referral code ────────────────────────────────────── */
function SuccessStep({
  form, fee, code, utr, onEvents,
}: {
  form: FormState;
  fee: number;
  code: string;
  utr: string;
  onEvents: () => void;
}) {
  const shareText = `I just registered for InfoVerse26 at DMI Engineering College — Oct 9. Use my referral code ${code} when you register.`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "InfoVerse26", text: shareText });
        return;
      } catch {
        // User dismissed the sheet — nothing to do.
      }
    }
    window.open(whatsapp, "_blank", "noopener");
  }

  return (
    <div className="mt-8 sm:mt-10 space-y-5">
      <div className="border border-white/10 p-6 sm:p-8 text-center">
        <div className="h-14 w-14 mx-auto bg-[#FF0000] grid place-items-center mb-5">
          <Check className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Payment submitted</h2>
        <p className="text-white/50 text-sm mt-3 max-w-sm mx-auto leading-relaxed">
          ₹{fee} against UTR {utr}. We verify manually and email {form.email || "your address"} within 24 hours.
          Bring your college ID on Oct 9.
        </p>
      </div>

      {/* Referral card */}
      <div className="relative border-2 border-[#FF0000] p-6 sm:p-8 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#FF0000]/10 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="inline-block px-3 py-1 bg-[#FF0000] text-white text-[10px] uppercase tracking-[0.25em] font-bold mb-4">
            Your referral code
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-2">
            Earn <span className="text-[#FF0000]">₹10</span> per friend
          </h3>
          <p className="text-sm text-white/60 leading-relaxed mb-5 max-w-md">
            Share this code. Every friend who registers with it earns you ₹10, paid by UPI after
            the event. No cap.
          </p>

          <div className="bg-black/40 border border-[#FF0000]/40 p-4 sm:p-5 text-center">
            <div className="text-2xl sm:text-3xl font-black tracking-[0.2em] text-[#FF0000] break-all">{code}</div>
            <div className="mt-3 flex justify-center">
              <CopyLine value={code} />
            </div>
          </div>

          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <button
              onClick={nativeShare}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#FF0000] text-white text-xs font-bold uppercase tracking-wide hover:brightness-110 transition"
            >
              <Share2 className="h-4 w-4" /> Share my code
            </button>
            <button
              onClick={onEvents}
              className="px-5 py-3.5 border border-white/20 text-xs font-bold uppercase tracking-wide text-white/70 hover:border-[#FF0000] hover:text-[#FF0000] transition-colors"
            >
              Browse events
            </button>
          </div>

          <p className="text-[11px] text-white/35 mt-4 leading-relaxed">
            Screenshot this page — the code is also in your confirmation email.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[9px] sm:text-xs uppercase tracking-widest text-white/40 block mb-1.5 sm:mb-2">{label}</label>
      {children}
    </div>
  );
}