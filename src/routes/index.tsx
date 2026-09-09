import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Code2, ListChecks, Trophy, Sparkles, Rocket, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [user, navigate]);

  return (
    <Shell>
      <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl p-8 sm:p-14 shadow-sm">
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-pastel-pink/60 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-pastel-mint/60 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pastel-yellow/70 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" /> DMI IT · Practice Platform
          </div>
          <h1 className="mt-4 text-4xl sm:text-6xl font-black tracking-tight">
            Code. Compete. <span className="bg-gradient-to-r from-[oklch(0.55_0.15_165)] to-[oklch(0.55_0.15_300)] bg-clip-text text-transparent">Excel.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground text-lg">
            A HackerRank-style playground built for the Department of Information Technology —
            timed quizzes, real multi-language code execution, live leaderboards.
          </p>
          <div className="mt-6 flex flex-nowrap gap-2">
            <Button asChild size="lg" className="px-4 text-sm sm:px-8 sm:text-base"><Link to="/register">Get started</Link></Button>
            <Button asChild size="lg" variant="secondary" className="px-4 text-sm sm:px-8 sm:text-base"><Link to="/login">Student Login</Link></Button>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <GlassCard tint="mint" className="p-6">
          <ListChecks className="h-6 w-6" />
          <h3 className="mt-3 font-bold text-lg">Timed Quizzes</h3>
          <p className="text-sm text-muted-foreground mt-1">MCQ tests with per-quiz timer, instant scoring and history.</p>
        </GlassCard>
        <GlassCard tint="lavender" className="p-6">
          <Code2 className="h-6 w-6" />
          <h3 className="mt-3 font-bold text-lg">Coding Challenges</h3>
          <p className="text-sm text-muted-foreground mt-1">Write & run code in 13 languages via the Piston engine.</p>
        </GlassCard>
        <GlassCard tint="pink" className="p-6">
          <Trophy className="h-6 w-6" />
          <h3 className="mt-3 font-bold text-lg">Leaderboard</h3>
          <p className="text-sm text-muted-foreground mt-1">Combined quiz + coding scores, ranked in real time.</p>
        </GlassCard>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: GraduationCap, t: "Sign up", d: "Create a student profile with your register number." },
          { icon: Rocket, t: "Practice", d: "Attempt quizzes and solve coding problems in any language." },
          { icon: Trophy, t: "Get ranked", d: "Admins review your code and marks feed the leaderboard." },
        ].map((s, i) => (
          <GlassCard key={i} tint="sky" className="p-6">
            <div className="flex items-center gap-2 text-sm font-semibold"><span className="h-6 w-6 grid place-items-center rounded-full bg-white/80 text-xs">{i+1}</span>{s.t}</div>
            <p className="text-sm text-muted-foreground mt-2 flex gap-2"><s.icon className="h-4 w-4 shrink-0 mt-0.5" />{s.d}</p>
          </GlassCard>
        ))}
      </section>
    </Shell>
  );
}
