import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SymposiumLayout, MagneticButton } from "@/components/SymposiumLayout";
import { useEffect, useState } from "react";
import { X, MapPin, Clock, User } from "lucide-react";

export const Route = createFileRoute("/symposium/events")({ component: SymposiumEvents });

type EventInfo = {
  name: string;
  category: "Technical" | "Non-Technical";
  tag: string;
  desc: string;
  venue: string;
  time: string;
  coordinator: string;
  rules: string[];
};

const EVENTS: EventInfo[] = [
  {
    name: "Paper Presentation", category: "Technical", tag: "Solo",
    desc: "Present your research or technical idea. Online and offline modes available.",
    venue: "Seminar Hall, Block A", time: "10:00 AM – 12:30 PM",
    coordinator: "Prof. R. Selvam · +91 98765 43210",
    rules: ["8 minutes presentation + 2 minutes Q&A", "Submit PPT via Drive link at registration", "Offline mode: bring a backup on USB"],
  },
  {
    name: "Project Expo", category: "Technical", tag: "Solo/Team",
    desc: "Showcase a working project — hardware, software, or both. Offline only.",
    venue: "Exhibition Hall, Block B", time: "10:00 AM – 3:00 PM",
    coordinator: "Prof. K. Anitha · +91 98765 43211",
    rules: ["Each entry gets a 6x3 ft table", "Power sockets provided, bring your own extension if needed", "Judging at 2:00 PM sharp"],
  },
  {
    name: "Website Creation", category: "Technical", tag: "Solo/Team",
    desc: "Design and build a site live, against the clock.",
    venue: "Computer Lab 3", time: "11:00 AM – 1:00 PM",
    coordinator: "Prof. M. Iqbal · +91 98765 43212",
    rules: ["Theme announced on the spot", "2 hours, any framework", "Internet access provided"],
  },
  {
    name: "Debugging", category: "Technical", tag: "Solo/Team",
    desc: "Find and fix bugs faster than everyone else.",
    venue: "Computer Lab 1", time: "1:30 PM – 3:00 PM",
    coordinator: "Prof. S. Divya · +91 98765 43213",
    rules: ["Languages: Python, Java, C++", "Fastest correct fix wins", "No internet access during round"],
  },
  {
    name: "Quiz", category: "Technical", tag: "Solo",
    desc: "General + tech quiz, quickfire rounds.",
    venue: "Auditorium", time: "2:00 PM – 3:30 PM",
    coordinator: "Prof. T. Priya · +91 98765 43215",
    rules: ["Prelims + finals format", "Top 6 teams advance", "Buzzer round in finals"],
  },
  {
    name: "Meme Creation", category: "Non-Technical", tag: "Solo",
    desc: "Tech memes, judged on wit and relevance.",
    venue: "Open Lawn", time: "12:00 PM – 1:00 PM",
    coordinator: "Prof. A. Farhan · +91 98765 43214",
    rules: ["Submit via WhatsApp during the slot", "Original content only", "Keep it clean — no offensive content"],
  },
  {
    name: "Prompt Battle", category: "Non-Technical", tag: "Solo",
    desc: "Craft the sharpest AI prompts under pressure.",
    venue: "Seminar Hall, Block A", time: "3:30 PM – 4:30 PM",
    coordinator: "Prof. R. Selvam · +91 98765 43210",
    rules: ["Live challenge, judged on output quality", "3 rounds, elimination format"],
  },
  {
    name: "Imposter Game", category: "Non-Technical", tag: "Solo",
    desc: "Blend in, deduce, or get voted out.",
    venue: "Open Lawn", time: "4:00 PM – 5:00 PM",
    coordinator: "Prof. A. Farhan · +91 98765 43214",
    rules: ["Groups of 6-8 per round", "20 minutes per round", "Multiple rounds through the afternoon"],
  },
  {
    name: "BGM Finding", category: "Non-Technical", tag: "Solo",
    desc: "Identify background music from movies and shows.",
    venue: "Auditorium", time: "5:30 PM – 6:30 PM",
    coordinator: "Prof. M. Kumar · +91 98765 43216",
    rules: ["Audio clips played, fastest correct answer wins", "Mix of Tamil, English, and Hindi tracks", "Elimination rounds"],
  },
];

function SymposiumEvents() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<EventInfo | null>(null);

  const technical = EVENTS.filter((e) => e.category === "Technical");
  const nonTechnical = EVENTS.filter((e) => e.category === "Non-Technical");

  // Lock body scroll behind the modal, and close on Escape.
  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  return (
    <SymposiumLayout>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-6 sm:pb-10">
        <h1 className="text-4xl sm:text-7xl font-black uppercase tracking-tighter">Events</h1>
        <p className="text-white/50 mt-3 sm:mt-4 text-sm sm:text-base">
          Tap any event for venue, timing, and rules.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#FF0000]">Technical</div>
          <div className="text-[10px] sm:text-xs text-white/50">₹1000 1st · ₹500 2nd · certificate</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
          {technical.map((ev) => (
            <EventCard key={ev.name} ev={ev} onClick={() => setSelected(ev)} />
          ))}
        </div>
        <p className="text-[11px] text-white/40 mt-3">You can register for only one technical event.</p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#FF0000]">Non-technical</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
          {nonTechnical.map((ev) => (
            <EventCard key={ev.name} ev={ev} onClick={() => setSelected(ev)} />
          ))}
        </div>
        <p className="text-[11px] text-white/40 mt-3">You can register for only one non-technical event.</p>
      </section>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
        <MagneticButton
          className="px-6 py-3 sm:px-10 sm:py-4 bg-[#FF0000] text-white font-bold uppercase text-xs sm:text-sm tracking-wide hover:brightness-110"
          onClick={() => navigate({ to: "/symposium/register" })}
        >
          Register now
        </MagneticButton>
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-[#111112] border-t sm:border border-white/15 p-6 sm:p-8 relative max-h-[88vh] overflow-y-auto animate-[slideUp_0.25s_ease] sm:animate-[scaleIn_0.25s_ease]"
          >
            <button
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="absolute top-4 right-4 h-8 w-8 grid place-items-center text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-[10px] uppercase tracking-widest text-[#FF0000] mb-2 pr-10">
              {selected.category} · {selected.tag}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight pr-8">{selected.name}</h2>
            <p className="text-white/60 mt-3 text-sm leading-relaxed">{selected.desc}</p>

            <div className="mt-4 px-3 py-2.5 border border-[#FF0000]/30 bg-[#FF0000]/5">
              <div className="text-[10px] uppercase tracking-widest text-[#FF0000] mb-1">Rewards</div>
              <div className="text-sm text-white/80">
                {selected.category === "Technical"
                  ? "₹1000 first · ₹500 second · participation certificate"
                  : "No prizes or certificates"}
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-start gap-3 text-white/80">
                <MapPin className="h-4 w-4 text-[#FF0000] shrink-0 mt-0.5" /> {selected.venue}
              </div>
              <div className="flex items-start gap-3 text-white/80">
                <Clock className="h-4 w-4 text-[#FF0000] shrink-0 mt-0.5" /> {selected.time}
              </div>
              <div className="flex items-start gap-3 text-white/80">
                <User className="h-4 w-4 text-[#FF0000] shrink-0 mt-0.5" /> {selected.coordinator}
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Rules</div>
              <ul className="space-y-1.5 text-sm text-white/70 list-disc list-inside leading-relaxed">
                {selected.rules.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>

            <MagneticButton
              onClick={() => navigate({ to: "/symposium/register" })}
              className="mt-7 w-full py-3.5 bg-[#FF0000] text-white font-bold uppercase text-xs tracking-wide hover:brightness-110"
            >
              Register for this event
            </MagneticButton>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { opacity:0; transform: scale(0.95) } to { opacity:1; transform: scale(1) } }
        @keyframes slideUp { from { opacity:0; transform: translateY(40px) } to { opacity:1; transform: translateY(0) } }
      `}</style>
    </SymposiumLayout>
  );
}

function EventCard({ ev, onClick }: { ev: EventInfo; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-[#0b0b0c] p-5 sm:p-6 hover:bg-[#141415] transition-colors group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest text-white/40">{ev.tag}</span>
        <span className="text-[#FF0000] opacity-0 group-hover:opacity-100 transition-opacity text-sm">→</span>
      </div>
      <div className="font-bold uppercase tracking-tight">{ev.name}</div>
      <p className="text-xs text-white/50 mt-2 leading-relaxed">{ev.desc}</p>
    </button>
  );
}