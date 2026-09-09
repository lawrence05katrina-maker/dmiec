import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Code2, LogOut, LayoutDashboard, ListChecks, Trophy, User as UserIcon, Bug, BarChart3, Users } from "lucide-react";
import type { ReactNode } from "react";


export function Shell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const studentLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/quizzes", label: "Quizzes", icon: ListChecks },
    { to: "/problems", label: "Problems", icon: Code2 },
    { to: "/debugging", label: "Debugging", icon: Bug },
    { to: "/submissions", label: "My Submissions", icon: UserIcon },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];
  const adminLinks = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/submissions", label: "Analytics", icon: BarChart3 },
    { to: "/admin/coding", label: "Coding Log", icon: Code2 },
    { to: "/admin/quizzes", label: "Quizzes", icon: ListChecks },
    { to: "/admin/problems", label: "Problems", icon: Code2 },
    { to: "/admin/students", label: "Students", icon: Users },
    { to: "/admin/debugging", label: "Debugging", icon: Bug },
    { to: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  ];
  const links = user?.role === "admin" ? adminLinks : studentLinks;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.97_0.03_160)] via-[oklch(0.98_0.02_300)] to-[oklch(0.97_0.03_340)]">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[url('/pink1.png')] bg-cover bg-center border-b border-white/60 shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center gap-2 sm:gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-4 min-w-0"
          >
            <div className="h-10 w-10 sm:h-20 sm:w-20 rounded-xl overflow-hidden shrink-0 drop-shadow-md">
              <img
                src="/college-logo.png"
                alt="DMI Engineering College logo"
                className="w-full h-full object-cover scale-125"
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-3xl font-bold leading-tight text-blue-950 drop-shadow-sm">
                <span className="landscape:hidden sm:hidden whitespace-nowrap">DMIEC</span>
                <span className="hidden landscape:inline sm:inline">DMI ENGINEERING COLLEGE</span>
              </div>
              <div className="text-base text-blue-950 truncate hidden landscape:block sm:block">Department of Information Technology</div>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-1 sm:gap-2 shrink-0">
  {!user && (
    <img
      src="/naac.png"
      alt="NAAC Accredited"
      className="h-8 w-auto sm:h-14 sm:w-auto object-contain"
    />
  )}
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  {user.name} · <span className="capitalize">{user.role}</span>
                </span>
                <Button variant="ghost" size="sm" className="shrink-0 px-2 sm:px-3" onClick={() => { logout(); router.navigate({ to: "/" }); }}>
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm"><Link to="/login">Login</Link></Button>
                <Button asChild size="sm"><Link to="/register">Register</Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      {user && (
        <nav className="mx-auto max-w-7xl px-4 pt-4 flex flex-wrap gap-1.5 sm:gap-2">
          {links.map((l) => (
            <Link
  key={l.to}
  to={l.to}
  className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm bg-white/70 text-foreground border border-white hover:bg-white transition-all shadow-sm hover:-translate-y-0.5"
  activeProps={{
    className:
      "px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm !bg-slate-900 !text-white !border-slate-900 shadow-lg -translate-y-0.5 scale-[1.03] transition-all duration-200"
  }}
>
  <span className="inline-flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
    <l.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
    {l.label}
  </span>
</Link>
          ))}
        </nav>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>

      <footer className="mx-auto max-w-7xl px-4 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} DMI Engineering College · Department of Information Technology
      </footer>
    </div>
  );
}

export function GlassCard({ children, className = "", tint = "mint" }: { children: ReactNode; className?: string; tint?: "mint" | "pink" | "lavender" | "yellow" | "sky" | "plain" }) {
  const tints: Record<string, string> = {
    mint: "bg-pastel-mint/40",
    pink: "bg-pastel-pink/40",
    lavender: "bg-pastel-lavender/40",
    yellow: "bg-pastel-yellow/40",
    sky: "bg-pastel-sky/40",
    plain: "bg-white/70",
  };
  return (
    <div className={`rounded-2xl border border-white/60 shadow-sm backdrop-blur ${tints[tint]} ${className}`}>{children}</div>
  );
}