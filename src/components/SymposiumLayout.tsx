import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function SymposiumLayout({ children }: { children: ReactNode }) {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Pointer effects are desktop-only; skip the listener entirely on touch
    // devices so we aren't burning frames on every scroll-induced pointer event.
    if (window.matchMedia("(hover: none)").matches) return;

    function handleMove(e: MouseEvent) {
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(255,43,61,0.08), transparent 40%)`;
      }
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`;
      }
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div ref={spotlightRef} className="fixed inset-0 pointer-events-none z-0 transition-[background] duration-75" />
      <div ref={cursorRef} className="hidden lg:block fixed top-0 left-0 h-3 w-3 rounded-full bg-[#FF0000] pointer-events-none z-[60] mix-blend-difference transition-transform duration-100 ease-out" />

      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <style>{`
        .font-display { font-family: 'Archivo Black', sans-serif; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-track { animation: marquee 22s linear infinite; }
        .marquee-3d { animation: marquee 30s linear infinite; }
        @keyframes wordUp { from { opacity:0; transform: translateY(100%); } to { opacity:1; transform: translateY(0); } }
        .word-reveal { display: inline-block; overflow: hidden; }
        .word-reveal span { display: inline-block; animation: wordUp 0.7s cubic-bezier(.2,.9,.2,1) both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }
        .reveal { animation: fadeUp 0.6s ease-out both; }
        .nav-link { position: relative; }
        .nav-link::after {
          content: ''; position: absolute; left: 0; bottom: -4px; height: 1px; width: 0;
          background: #FF0000; transition: width 0.25s ease;
        }
        .nav-link:hover::after { width: 100%; }
        .magnetic { transition: transform 0.15s ease-out; }
        @keyframes bounce-y { 0%,100% { transform: translateY(0);} 50% { transform: translateY(8px);} }
        .scroll-hint { animation: bounce-y 1.8s ease-in-out infinite; }
        @keyframes flicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
          20%, 24%, 55% { opacity: 0.4; }
        }
        .flicker { animation: flicker 4s linear infinite; }

        /* Prize glow effect */
        .prize-glow {
          background: linear-gradient(135deg, rgba(255, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0) 100%);
          transition: all 0.3s ease;
        }
        .prize-glow:hover {
          background: linear-gradient(135deg, rgba(255, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 100%);
          box-shadow: 0 0 40px rgba(255, 0, 0, 0.15);
        }

        /* 3D Animations */
        @keyframes float3d {
          0%, 100% { transform: translateY(0) rotateX(0deg) rotateY(0deg); }
          50% { transform: translateY(-20px) rotateX(5deg) rotateY(5deg); }
        }
        @keyframes rotate3d {
          0% { transform: perspective(1000px) rotateY(0deg); }
          100% { transform: perspective(1000px) rotateY(360deg); }
        }
        @keyframes tilt3d {
          0%, 100% { transform: perspective(1000px) rotateX(0deg) rotateY(0deg); }
          25% { transform: perspective(1000px) rotateX(10deg) rotateY(-10deg); }
          75% { transform: perspective(1000px) rotateX(-10deg) rotateY(10deg); }
        }
        @keyframes slideIn3d {
          from { opacity: 0; transform: perspective(1000px) translateZ(-100px) rotateY(-20deg); }
          to { opacity: 1; transform: perspective(1000px) translateZ(0) rotateY(0deg); }
        }

        /* Advanced 5D Animations */
        @keyframes morph5d {
          0%, 100% {
            transform: perspective(2000px) translateZ(0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1);
            filter: hue-rotate(0deg) brightness(1);
          }
          25% {
            transform: perspective(2000px) translateZ(50px) rotateX(15deg) rotateY(-15deg) rotateZ(3deg) scale(1.02);
            filter: hue-rotate(10deg) brightness(1.1);
          }
          50% {
            transform: perspective(2000px) translateZ(0) rotateX(-5deg) rotateY(10deg) rotateZ(-2deg) scale(0.98);
            filter: hue-rotate(-5deg) brightness(0.95);
          }
          75% {
            transform: perspective(2000px) translateZ(30px) rotateX(-10deg) rotateY(15deg) rotateZ(2deg) scale(1.01);
            filter: hue-rotate(5deg) brightness(1.05);
          }
        }
        @keyframes depth5d {
          0%, 100% { transform: perspective(2500px) translateZ(0) scale(1); box-shadow: 0 0 0 rgba(255, 43, 61, 0); }
          50% { transform: perspective(2500px) translateZ(100px) scale(1.05); box-shadow: 0 30px 80px rgba(255, 43, 61, 0.4); }
        }
        @keyframes pulse5d {
          0%, 100% { transform: perspective(2000px) scale(1) translateZ(0); text-shadow: 0 0 20px rgba(255, 43, 61, 0.5); }
          50% { transform: perspective(2000px) scale(1.03) translateZ(30px); text-shadow: 0 0 40px rgba(255, 43, 61, 0.8), 0 0 60px rgba(255, 43, 61, 0.4); }
        }

        .float-3d { animation: float3d 6s ease-in-out infinite; }
        .rotate-3d { animation: rotate3d 20s linear infinite; }
        .tilt-3d { animation: tilt3d 8s ease-in-out infinite; }
        .slide-3d { animation: slideIn3d 1s ease-out both; }
        .morph-5d { animation: morph5d 10s ease-in-out infinite; }
        .depth-5d { animation: depth5d 8s ease-in-out infinite; }
        .pulse-5d { animation: pulse5d 4s ease-in-out infinite; }

        .card-3d { transform-style: preserve-3d; transition: transform 0.3s ease; }
        .card-3d:hover { transform: perspective(1000px) rotateX(5deg) rotateY(5deg) translateZ(20px); }
        .parallax-3d { transform: perspective(1000px); transform-style: preserve-3d; }

        /* On touch screens the heavy perspective animations cost frames and
           there is no cursor to justify them, so flatten them out. */
        @media (hover: none), (max-width: 640px) {
          .morph-5d, .depth-5d, .tilt-3d, .float-3d, .rotate-3d { animation: none; }
          .card-3d:hover { transform: none; }
        }

        .hero-text {
          font-family: 'Space Grotesk', 'Archivo Black', sans-serif;
          font-weight: 900;
          letter-spacing: -0.05em;
          line-height: 0.85;
        }

        /* ── Background wordmark ────────────────────────────────────────── */
        .wordmark-shell {
          position: absolute;
          left: 0; right: 0; top: 50%;
          z-index: 0;
          pointer-events: none;
          user-select: none;
          transform: translate3d(var(--wm-px, 0px), calc(-50% + var(--wm-py, 0px)), 0);
          transition: transform 400ms cubic-bezier(.22,.61,.36,1);
          will-change: transform;
        }
        @keyframes wordmarkBreathe {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.025); }
        }
        .wordmark-breathe { animation: wordmarkBreathe 9s ease-in-out infinite; transform-origin: center center; }
        .wordmark-svg { display: block; width: 100%; height: auto; overflow: visible; }

        /* ── Referral toast ─────────────────────────────────────────────── */
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(24px) scale(0.96); }
        }
        .toast-in  { animation: toastIn 0.45s cubic-bezier(.2,.9,.2,1) both; }
        .toast-out { animation: toastOut 0.3s ease-in both; }

        @media (prefers-reduced-motion: reduce) {
          .wordmark-shell { transition: none; transform: translate3d(0, -50%, 0); }
          .wordmark-breathe, .marquee-track, .marquee-3d, .flicker, .scroll-hint,
          .morph-5d, .depth-5d, .pulse-5d, .tilt-3d, .float-3d, .rotate-3d { animation: none; }
          .wordmark-svg .wm-shine { display: none; }
          .toast-in, .toast-out { animation: none; }
        }
      `}</style>

      <header className="relative z-20 border-b border-white/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3">
          <Link to="/symposium" className="font-display text-lg sm:text-2xl tracking-tight shrink-0">
            INFO<span className="text-[#FF0000]">VERSE</span>26
          </Link>
          <nav className="flex items-center gap-2 sm:gap-8 text-[10px] sm:text-xs uppercase tracking-widest">
            <Link to="/symposium" className="hidden sm:inline nav-link hover:text-[#FF0000] transition-colors">Home</Link>
            <Link to="/symposium/events" className="nav-link hover:text-[#FF0000] transition-colors">Events</Link>
            <Link to="/symposium/bus-timings" className="hidden md:inline nav-link hover:text-[#FF0000] transition-colors">Bus Timings</Link>
            <Link
              to="/symposium/register"
              className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full bg-[#FF0000] text-white font-bold hover:scale-105 hover:brightness-110 transition-all inline-block whitespace-nowrap text-[9px] sm:text-[10px]"
            >
              Register <span className="hidden sm:inline">→</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 border-t border-white/15 mt-16 sm:mt-24 py-8 px-4 text-center text-[10px] sm:text-xs uppercase tracking-widest text-white/70 leading-relaxed">
        © 2026 INFOVERSE26 · Dept. of Information Technology · DMI Engineering College
      </footer>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   BackgroundWordmark — oversized lettering behind the hero.

   SVG rather than a giant <div>: `textLength` forces the word to fit the
   viewBox exactly, so it can never overflow or clip the way a nowrap block
   at 18vw does, at any screen width.
────────────────────────────────────────────────────────────────────────── */
export function BackgroundWordmark({
  text = "INFOVERSE",
  className = "",
  sweepSeconds = 7,
  parallax = 18,
}: {
  text?: string;
  className?: string;
  sweepSeconds?: number;
  parallax?: number;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const gradientId = useRef(`wm-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    if (!parallax) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let frame = 0;
    function handleMove(e: MouseEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = shellRef.current;
        if (!el) return;
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        el.style.setProperty("--wm-px", `${-nx * parallax}px`);
        el.style.setProperty("--wm-py", `${-ny * (parallax * 0.4)}px`);
      });
    }
    window.addEventListener("mousemove", handleMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", handleMove);
    };
  }, [parallax]);

  const id = gradientId.current;

  return (
    <div ref={shellRef} className={`wordmark-shell ${className}`} aria-hidden="true">
      <div className="wordmark-breathe">
        <svg className="wordmark-svg" viewBox="0 0 1200 230" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="46%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="49%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="51%" stopColor="#FF2B3D" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="62%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                values="-1 0; 1 0"
                dur={`${sweepSeconds}s`}
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0;1"
                keySplines="0.45 0 0.2 1"
              />
            </linearGradient>
            <filter id={`${id}-bloom`} x="-10%" y="-40%" width="120%" height="180%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g fontFamily="'Archivo Black', 'Space Grotesk', sans-serif" fontWeight="900" fontSize="200" letterSpacing="-6">
            <text x="10" y="180" textLength="1180" lengthAdjust="spacingAndGlyphs" fill="#ffffff" fillOpacity="0.045">{text}</text>
            <text x="10" y="180" textLength="1180" lengthAdjust="spacingAndGlyphs" fill="none" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1">{text}</text>
            <text className="wm-shine" x="10" y="180" textLength="1180" lengthAdjust="spacingAndGlyphs" fill={`url(#${id})`} filter={`url(#${id}-bloom)`}>{text}</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   ReferralToast — bottom notification advertising the ₹10 referral reward.

   Two layouts, switched on a real matchMedia listener rather than pure CSS,
   because the mobile and desktop versions differ in structure (which
   elements exist at all), not just spacing:

   - Mobile (<640px): a single slim row — status dot, one line of text, a
     small "Get code" pill, close button. No description paragraph, no
     full-width button. Stays under ~56px tall so it never blocks content
     on short phone screens.
   - Tablet/desktop (≥640px): the fuller card with a headline, a supporting
     line, and a standalone CTA button, since there's room to spare.
────────────────────────────────────────────────────────────────────────── */
export function ReferralToast({
  delay = 1000,
  onAction,
}: {
  delay?: number;
  onAction?: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [compact, setCompact] = useState(true);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = window.sessionStorage.getItem("ab26-referral-toast") === "dismissed";
    } catch {
      // Private mode / storage blocked — just show the toast.
    }
    if (dismissed) return;

    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setCompact(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  function dismiss() {
    setClosing(true);
    try {
      window.sessionStorage.setItem("ab26-referral-toast", "dismissed");
    } catch {
      // Ignore — dismissal just won't persist across reloads.
    }
    setTimeout(() => setVisible(false), 300);
  }

  if (!visible) return null;

  if (compact) {
    return (
      <div
        role="status"
        className={`fixed z-50 bottom-3 left-3 right-3 ${closing ? "toast-out" : "toast-in"}`}
      >
        <div className="flex items-center gap-2.5 bg-[#0e0e10] border border-[#FF0000]/40 shadow-[0_12px_30px_rgba(0,0,0,0.6)] pl-3.5 pr-2 py-2.5">
          <span className="h-2 w-2 rounded-full bg-[#FF0000] shrink-0 animate-pulse" />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold leading-tight truncate">
              Earn ₹10 per referral
            </div>
          </div>
          <button
            onClick={() => {
              dismiss();
              onAction?.();
            }}
            className="shrink-0 px-3 py-2 bg-[#FF0000] text-white text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
          >
            Get code
          </button>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="shrink-0 h-8 w-8 grid place-items-center text-white/40 hover:text-white transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      className={`fixed z-50 right-6 bottom-6 max-w-sm ${closing ? "toast-out" : "toast-in"}`}
    >
      <div className="relative bg-[#0e0e10] border border-[#FF0000]/40 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FF0000]/10 blur-3xl pointer-events-none" />

        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute top-2.5 right-2.5 h-7 w-7 grid place-items-center text-white/40 hover:text-white transition-colors text-lg leading-none"
        >
          ×
        </button>

        <div className="relative p-5 pr-10">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#FF0000] font-bold mb-1.5">
            Referral reward
          </div>
          <div className="text-base font-bold leading-snug">
            Earn ₹10 for every friend who registers
          </div>
          <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
            You get a referral code the moment you register. No limit on how many you share.
          </p>
          <button
            onClick={() => {
              dismiss();
              onAction?.();
            }}
            className="mt-3 px-4 py-2.5 bg-[#FF0000] text-white text-xs font-bold uppercase tracking-wide hover:brightness-110 transition"
          >
            Get my code
          </button>
        </div>
      </div>
    </div>
  );
}

export function MagneticButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  function handleMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(hover: none)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  }
  function reset() {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  }
  return (
    <button ref={ref} onMouseMove={handleMove} onMouseLeave={reset} className={`magnetic rounded-full ${className}`} {...props}>
      {children}
    </button>
  );
}

export function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="word-reveal mr-[0.25em]">
          <span style={{ animationDelay: `${i * 0.08}s` }}>{w}</span>
        </span>
      ))}
    </span>
  );
}