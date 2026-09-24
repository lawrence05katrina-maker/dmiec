import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SymposiumLayout, MagneticButton } from "@/components/SymposiumLayout";
import { useState } from "react";
import { ArrowLeft, Send, AlertCircle, CheckCircle } from "lucide-react";
import { BASE_URL } from "@/config/apiConfig";

export const Route = createFileRoute("/symposium/support")({ component: SymposiumSupport });

function SymposiumSupport() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    registrationId: "",
    issueType: "" as "" | "payment" | "registration" | "technical" | "other",
    subject: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!form.issueType) {
      setError("Please select an issue type");
      return;
    }
    
    if (!form.subject.trim()) {
      setError("Please enter a subject");
      return;
    }
    
    if (!form.description.trim()) {
      setError("Please describe your issue");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`${BASE_URL}/api/symposium/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          registrationId: form.registrationId || undefined,
          issueType: form.issueType,
          subject: form.subject,
          description: form.description,
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit query");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit query. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <SymposiumLayout>
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/10 border border-green-500/30 mb-6">
            <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-500" />
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4">Query Submitted</h1>
          <p className="text-white/60 text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-8">
            Thank you for reaching out. Our team will review your query and get back to you within 24 hours via email.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <MagneticButton
              onClick={() => navigate({ to: "/symposium" })}
              className="px-6 py-3 bg-white/10 text-white border border-white/20 font-bold uppercase text-xs sm:text-sm tracking-wide hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 inline mr-2" />
              Back to Home
            </MagneticButton>
            <MagneticButton
              onClick={() => navigate({ to: "/symposium/register" })}
              className="px-6 py-3 bg-[#FF0000] text-white font-bold uppercase text-xs sm:text-sm tracking-wide hover:brightness-110"
            >
              Continue Registration
            </MagneticButton>
          </div>
        </section>
      </SymposiumLayout>
    );
  }

  return (
    <SymposiumLayout>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <button
          onClick={() => navigate({ to: "/symposium/register" })}
          className="flex items-center gap-2 text-xs sm:text-sm text-white/50 hover:text-white mb-4 sm:mb-8 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Back to Registration
        </button>

        <h1 className="text-2xl sm:text-5xl font-black uppercase tracking-tight text-center mb-2 sm:mb-3">
          Need Help?
        </h1>
        <p className="text-white/50 text-center text-xs sm:text-sm max-w-xl mx-auto mb-6 sm:mb-10 leading-relaxed">
          Facing issues with registration? Fill out the form below and our team will assist you.
        </p>

        <form onSubmit={handleSubmit} className="border border-white/10 p-4 sm:p-8 space-y-4 sm:space-y-6">
          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-[#FF0000]/10 border border-[#FF0000]/60 text-[#FF6B6B] text-xs sm:text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-5">
            <div>
              <label className="block text-[9px] sm:text-xs uppercase tracking-widest text-white/40 mb-1.5 sm:mb-2">Full Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="support-input"
              />
            </div>

            <div>
              <label className="block text-[9px] sm:text-xs uppercase tracking-widest text-white/40 mb-1.5 sm:mb-2">Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="support-input"
              />
            </div>

            <div>
              <label className="block text-[9px] sm:text-xs uppercase tracking-widest text-white/40 mb-1.5 sm:mb-2">WhatsApp No *</label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="10-digit WhatsApp number"
                className="support-input"
              />
            </div>

            <div>
              <label className="block text-[9px] sm:text-xs uppercase tracking-widest text-white/40 mb-1.5 sm:mb-2">Registration ID (if any)</label>
              <input
                value={form.registrationId}
                onChange={(e) => setForm({ ...form, registrationId: e.target.value })}
                placeholder="Your registration ID"
                className="support-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] sm:text-xs uppercase tracking-widest text-white/40 mb-1.5 sm:mb-2">Issue Type *</label>
            <select
              required
              value={form.issueType}
              onChange={(e) => setForm({ ...form, issueType: e.target.value as any })}
              className="support-input"
            >
              <option value="">Select an issue type</option>
              <option value="payment">Payment Issue</option>
              <option value="registration">Registration Issue</option>
              <option value="technical">Technical Problem</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] sm:text-xs uppercase tracking-widest text-white/40 mb-1.5 sm:mb-2">Subject *</label>
            <input
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Brief description of your issue"
              className="support-input"
            />
          </div>

          <div>
            <label className="block text-[9px] sm:text-xs uppercase tracking-widest text-white/40 mb-1.5 sm:mb-2">Description *</label>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Please describe your issue in detail..."
              rows={5}
              className="support-input resize-none"
            />
          </div>

          <MagneticButton
            type="submit"
            disabled={submitting}
            className="w-full py-3 sm:py-3.5 bg-[#FF0000] text-white font-bold uppercase text-xs sm:text-sm tracking-wide hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Submitting..." : "Submit Query"}
          </MagneticButton>
        </form>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/916379778012"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[#FF0000] hover:bg-[#FF0000]/90 shadow-lg hover:shadow-[0_0_30px_rgba(255,0,0,0.5)] flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        aria-label="Contact us on WhatsApp"
      >
        <svg
          className="h-7 w-7 sm:h-8 sm:w-8 text-white group-hover:scale-110 transition-transform"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>

      <style>{`
        .support-input {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
        }
        .support-input:focus {
          border-color: #FF0000;
        }
        .support-input option {
          background: #0b0b0c;
          color: white;
        }
        @media (max-width: 640px) {
          .support-input {
            font-size: 14px;
            padding: 0.5rem 0.6rem;
          }
        }
      `}</style>
    </SymposiumLayout>
  );
}
