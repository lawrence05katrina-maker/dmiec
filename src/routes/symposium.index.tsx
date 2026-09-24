import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SymposiumLayout, MagneticButton, WordReveal, BackgroundWordmark, ReferralToast } from "@/components/SymposiumLayout";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/symposium/")({ component: SymposiumHome });

const TICKER_ITEMS = [
  "PAPER PRESENTATION", "PROJECT EXPO", "WEBSITE CREATION", "DEBUGGING",
  "PROMPT BATTLE", "MEME CREATION", "QUIZ", "IMPOSTER GAME",
];

function SymposiumHome() {
  const navigate = useNavigate();

  return (
    <SymposiumLayout>
      <section className="relative isolate min-h-[80vh] sm:min-h-[85vh] flex items-center overflow-hidden">
        <BackgroundWordmark text="INFOVERSE" sweepSeconds={3} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full pt-8 sm:pt-24 pb-12 sm:pb-16">
          <div className="text-[9px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/50 mb-4 sm:mb-8 reveal">
            Oct 09, 2026 · DMI Engineering College · IT Department
          </div>

          <h1 className="hero-text leading-[0.85] tracking-tight">
            <div className="text-[16vw] sm:text-[5rem] uppercase">
              <WordReveal text="Ideas" />
            </div>
            <div className="inline-block mt-2 sm:mt-4 px-3 sm:px-4 py-1 bg-[#FF0000]">
              <span className="text-[16vw] sm:text-[5rem] uppercase text-white">
                <WordReveal text="Compile." />
              </span>
            </div>
          </h1>

          <p className="mt-8 sm:mt-10 max-w-lg text-white/60 text-base sm:text-lg reveal" style={{ animationDelay: "0.6s" }}>
            One-day tech symposium. Nine events. Two tracks. Every engineering mind gets a stage.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-row flex-wrap items-start gap-2.5 sm:gap-4 reveal" style={{ animationDelay: "0.7s" }}>
            <MagneticButton
              onClick={() => navigate({ to: "/symposium/register" })}
              className="px-5 py-2.5 sm:px-8 sm:py-4 bg-[#FF0000] text-white font-bold uppercase text-xs sm:text-sm tracking-wide hover:brightness-110"
            >
              Register — ₹250
            </MagneticButton>
            <MagneticButton
              onClick={() => navigate({ to: "/symposium/events" })}
              className="px-5 py-2.5 sm:px-8 sm:py-4 border border-white/25 font-bold uppercase text-xs sm:text-sm tracking-wide hover:border-[#FF0000] hover:text-[#FF0000] transition-colors"
            >
              View Events
            </MagneticButton>
            <MagneticButton
              onClick={() => navigate({ to: "/symposium/bus-timings" })}
              className="px-5 py-2.5 sm:px-8 sm:py-4 border border-white/25 font-bold uppercase text-xs sm:text-sm tracking-wide hover:border-[#FF0000] hover:text-[#FF0000] transition-colors"
            >
              Bus Timings
            </MagneticButton>
          </div>

          <div className="mt-14 sm:mt-20 flex justify-center text-white/30 scroll-hint">
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
      </section>

      <section className="border-y border-white/15 py-4 overflow-hidden relative">
        <div className="flex whitespace-nowrap marquee-3d">
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="mx-5 sm:mx-8 text-xs sm:text-sm font-bold uppercase tracking-widest text-white/30 flex items-center gap-4 sm:gap-6">
              {item} <span className="text-[#FF0000]">✦</span>
            </span>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[
          { n: "05", l: "Technical events", sub: "Prize: ₹1000 1st, ₹500 2nd" },
          { n: "04", l: "Non-technical events", sub: "Participation certificate" },
          { n: "₹200", l: "Registration fee", sub: "₹150 for online paper presentation" },
        ].map((s, i) => (
          <div key={i} className="reveal" style={{ animationDelay: `${i * 0.15}s` }}>
            <div className="font-display text-4xl sm:text-5xl text-[#FF0000] flicker">{s.n}</div>
            <div className="text-sm text-white/60 mt-2 uppercase tracking-wide">{s.l}</div>
            <div className="text-xs text-white/40 mt-1">{s.sub}</div>
          </div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 overflow-hidden">
        <div className="border border-[#FF0000]/30 p-6 sm:p-12 relative prize-glow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF0000]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FF0000]/5 blur-3xl pointer-events-none" />

          <div className="text-center relative z-10">
            <div className="inline-block px-4 py-1 border border-[#FF0000]/50 text-[#FF0000] text-[10px] sm:text-xs uppercase tracking-[0.25em] mb-6">
              Prize pool
            </div>

            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-10 sm:mb-12">
              Win <span className="text-[#FF0000]">Cash Prizes</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 max-w-3xl mx-auto">
              {[
                { amt: "₹1000", place: "First prize" },
                { amt: "₹500", place: "Second prize" },
              ].map((p) => (
                <div key={p.amt} className="group border border-white/10 p-6 sm:p-8 hover:border-[#FF0000]/50 transition-all duration-300">
                  <div className="text-4xl sm:text-6xl font-black text-[#FF0000] mb-4 group-hover:scale-105 transition-transform duration-300">
                    {p.amt}
                  </div>
                  <div className="text-white/60 uppercase tracking-wide text-sm mb-1">{p.place}</div>
                  <div className="text-white/40 text-xs">Technical events</div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-white/50 text-sm">+ Participation certificates for all events</div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <h2 className="font-display text-3xl sm:text-5xl uppercase tracking-tight leading-tight">
          Every college. <span className="text-[#FF0000]">Tech branch.</span>
        </h2>
        <p className="mt-6 text-white/60 max-w-xl mx-auto text-sm sm:text-base">
          Open to all STEM students across tech departments and years. Pick your events,
          register once, show up on Oct 9.
        </p>
        <MagneticButton
          onClick={() => navigate({ to: "/symposium/register" })}
          className="mt-10 px-6 py-3 sm:px-10 sm:py-4 bg-[#FF0000] text-white font-bold uppercase text-xs sm:text-sm tracking-wide hover:brightness-110"
        >
          Secure your spot
        </MagneticButton>
      </section>

      {/* Referral */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="relative border-2 border-[#FF0000] p-6 sm:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF0000]/10 via-transparent to-[#FF0000]/5 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#FF0000]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#FF0000]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-block px-3 sm:px-4 py-1.5 bg-[#FF0000] text-white text-[10px] uppercase tracking-[0.25em] font-bold mb-6">
              Referral rewards
            </div>

            <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tight mb-4 leading-tight">
              Earn <span className="text-[#FF0000]">₹10</span> per referral
            </h2>

            <p className="text-white/70 text-base sm:text-lg mb-8 max-w-2xl">
              Share your referral code. For every friend who registers with it, you earn ₹10 cashback.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
              {[
                { icon: "👥", title: "Share", body: "Get your code the moment you finish registering" },
                { icon: "🎯", title: "Refer", body: "Friends enter your code on the registration form" },
                { icon: "💰", title: "Earn", body: "₹10 for every successful registration" },
              ].map((c) => (
                <div key={c.title} className="border border-white/10 p-5 sm:p-6 hover:border-[#FF0000]/50 transition-all">
                  <div className="text-3xl sm:text-4xl mb-3">{c.icon}</div>
                  <div className="text-xl sm:text-2xl font-bold text-[#FF0000] mb-2">{c.title}</div>
                  <div className="text-sm text-white/60 leading-relaxed">{c.body}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-8">
              <div className="text-center space-y-3">
                <div className="text-white/50 text-[10px] sm:text-sm uppercase tracking-widest">Example earnings</div>
                <div className="flex justify-center items-center gap-3 sm:gap-6 flex-wrap text-xs sm:text-sm">
                  <div className="text-white/70">5 referrals = <span className="text-[#FF0000] font-bold text-base sm:text-lg">₹50</span></div>
                  <div className="text-white/30 hidden sm:block">·</div>
                  <div className="text-white/70">10 referrals = <span className="text-[#FF0000] font-bold text-base sm:text-lg">₹100</span></div>
                  <div className="text-white/30 hidden sm:block">·</div>
                  <div className="text-white/70">20 referrals = <span className="text-[#FF0000] font-bold text-base sm:text-lg">₹200</span></div>
                </div>
                <p className="text-[11px] text-white/40 mt-4 leading-relaxed">
                  Cashback paid by UPI after event verification · No limit on referrals
                </p>
              </div>
            </div>

            <div className="mt-8 sm:mt-10 text-center">
              <MagneticButton
                onClick={() => navigate({ to: "/symposium/register" })}
                className="px-6 py-3 sm:px-10 sm:py-4 bg-[#FF0000] text-white font-bold uppercase text-xs sm:text-sm tracking-wide hover:brightness-110 whitespace-nowrap"
              >
                Get my code
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom notification advertising the referral programme */}
      <ReferralToast delay={100} onAction={() => navigate({ to: "/symposium/register" })} />
    </SymposiumLayout>
  );
}