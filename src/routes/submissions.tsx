import { createFileRoute } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BASE_URL } from "@/config/apiConfig";

export const Route = createFileRoute("/submissions")({ component: () => <Guard role="student"><MySubs /></Guard> });

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return { Authorization: `Bearer ${token}` };
}

type CodingSub = { id: string; problemId: string; problemTitle: string; language: string; status: string; marks: number; maxMarks: number; passed: number; total: number; timestamp: number };
type QuizResult = { id: string; quizId: string; quizTitle: string; score: number; total: number; status: string; timestamp: number };

function MySubs() {
  const [subs, setSubs] = useState<CodingSub[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [subRes, quizRes] = await Promise.all([
          fetch(`${BASE_URL}/api/submissions`, { headers: authHeaders() }),
          fetch(`${BASE_URL}/api/quizzes/my-results`, { headers: authHeaders() }),
        ]);
        const subData = await subRes.json();
        const quizData = await quizRes.json();
        if (subRes.ok) setSubs(subData);
        if (quizRes.ok) setQuizResults(quizData);
      } catch {
        toast.error("Could not reach server");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Shell><div className="text-sm text-muted-foreground">Loading...</div></Shell>;

  return (
    <Shell>
      <h1 className="text-3xl font-bold">My Submissions</h1>

      <h2 className="mt-6 text-lg font-semibold">Coding — Auto-Graded</h2>
      <div className="mt-2 space-y-3">
        {subs.length === 0 && <GlassCard tint="plain" className="p-6 text-sm text-muted-foreground">No coding submissions yet — solve a problem to get an instant score.</GlassCard>}
        {subs.map((s) => (
          <GlassCard key={s.id} tint="plain" className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="font-semibold">{s.problemTitle}</div>
              <div className="text-xs text-muted-foreground">{s.language} · {new Date(s.timestamp).toLocaleString()} · {s.passed}/{s.total} tests</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs bg-pastel-mint">{s.status}</span>
              <div className="text-xl font-black">{s.marks}<span className="text-xs text-muted-foreground">/{s.maxMarks}</span></div>
            </div>
          </GlassCard>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-semibold">Quizzes — Auto-Graded</h2>
      <div className="mt-2 space-y-3">
        {quizResults.length === 0 && <GlassCard tint="plain" className="p-6 text-sm text-muted-foreground">No quiz attempts yet.</GlassCard>}
        {quizResults.map((r) => (
          <GlassCard key={r.id} tint="plain" className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="font-semibold">{r.quizTitle}</div>
              <div className="text-xs text-muted-foreground">{new Date(r.timestamp).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs bg-pastel-mint">Auto-Graded</span>
              <div className="text-xl font-black">{r.score}<span className="text-xs text-muted-foreground">/{r.total}</span></div>
            </div>
          </GlassCard>
        ))}
      </div>
    </Shell>
  );
}