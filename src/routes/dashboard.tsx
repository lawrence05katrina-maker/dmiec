import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Code2, ListChecks, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BASE_URL } from "@/config/apiConfig";

export const Route = createFileRoute("/dashboard")({ component: () => <Guard role="student"><Dashboard /></Guard> });

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return { Authorization: `Bearer ${token}` };
}

type QuizSummary = { id: string; title: string; topic: string; difficulty: string; timeLimit: number };
type ProblemSummary = { id: string; title: string; category: string; difficulty: string; marks: number };
type QuizResult = { score: number; total: number };
type CodingSub = { marks: number };

function Dashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [codingScore, setCodingScore] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [qRes, pRes, resultsRes, subsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/quizzes`, { headers: authHeaders() }),
          fetch(`${BASE_URL}/api/problems`, { headers: authHeaders() }),
          fetch(`${BASE_URL}/api/quizzes/my-results`, { headers: authHeaders() }),
          fetch(`${BASE_URL}/api/submissions`, { headers: authHeaders() }),
        ]);
        const qData = await qRes.json();
        const pData = await pRes.json();
        const resultsData: QuizResult[] = await resultsRes.json();
        const subsData: CodingSub[] = await subsRes.json();

        if (qRes.ok) setQuizzes(qData);
        if (pRes.ok) setProblems(pData);
        if (resultsRes.ok) {
          setQuizScore(resultsData.reduce((a, b) => a + (b.score || 0), 0));
        }
        if (subsRes.ok) {
          setCodingScore(subsData.reduce((a, b) => a + (b.marks || 0), 0));
        }
        if (resultsRes.ok && subsRes.ok) {
          setAttemptCount(resultsData.length + subsData.length);
        }
      } catch {
        toast.error("Could not reach server");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !user) return <Shell><div className="text-sm text-muted-foreground">Loading...</div></Shell>;

  return (
    <Shell>
      <GlassCard tint="mint" className="p-8">
        <div className="text-sm text-muted-foreground">Welcome back,</div>
        <h1 className="text-3xl font-bold">{user.name} 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">Register No: {user.registerNo} · {user.department}{user.year ? ` · ${user.year}` : ""}</p>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-4 mt-6">
        <GlassCard tint="pink" className="p-5"><div className="text-xs uppercase text-muted-foreground">Quiz score</div><div className="text-3xl font-black mt-1">{quizScore}</div></GlassCard>
        <GlassCard tint="lavender" className="p-5"><div className="text-xs uppercase text-muted-foreground">Coding score</div><div className="text-3xl font-black mt-1">{codingScore}</div></GlassCard>
        <GlassCard tint="yellow" className="p-5"><div className="text-xs uppercase text-muted-foreground">Attempts</div><div className="text-3xl font-black mt-1">{attemptCount}</div></GlassCard>
        <GlassCard tint="sky" className="p-5"><div className="text-xs uppercase text-muted-foreground">Total</div><div className="text-3xl font-black mt-1">{quizScore + codingScore}</div></GlassCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <GlassCard tint="plain" className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2"><ListChecks className="h-5 w-5" />Available Quizzes</h2>
            <Button asChild size="sm" variant="ghost"><Link to="/quizzes">View all</Link></Button>
          </div>
          <ul className="mt-3 space-y-2">
            {quizzes.slice(0, 4).map((q) => (
              <li key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-white/60">
                <div>
                  <div className="font-medium">{q.title}</div>
                  <div className="text-xs text-muted-foreground">{q.topic} · {q.difficulty} · {q.timeLimit}min</div>
                </div>
                <Button asChild size="sm"><Link to="/quizzes/$id" params={{ id: q.id }}>Start</Link></Button>
              </li>
            ))}
            {quizzes.length === 0 && <li className="text-sm text-muted-foreground p-3">No quizzes available.</li>}
          </ul>
        </GlassCard>

        <GlassCard tint="plain" className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2"><Code2 className="h-5 w-5" />Coding Problems</h2>
            <Button asChild size="sm" variant="ghost"><Link to="/problems">View all</Link></Button>
          </div>
          <ul className="mt-3 space-y-2">
            {problems.slice(0, 4).map((p) => (
              <li key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-white/60">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.category} · {p.difficulty} · {p.marks}pts</div>
                </div>
                <Button asChild size="sm"><Link to="/problems/$id" params={{ id: p.id }}>Solve</Link></Button>
              </li>
            ))}
            {problems.length === 0 && <li className="text-sm text-muted-foreground p-3">No problems available.</li>}
          </ul>
        </GlassCard>
      </div>

      <div className="mt-6">
        <Button asChild variant="secondary"><Link to="/leaderboard"><Trophy className="h-4 w-4" /> View Leaderboard</Link></Button>
      </div>
    </Shell>
  );
}