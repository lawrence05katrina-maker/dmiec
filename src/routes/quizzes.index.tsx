import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BASE_URL } from "@/config/apiConfig";

export const Route = createFileRoute("/quizzes/")({ component: () => <Guard role="student"><QuizList /></Guard> });

type QuizSummary = { id: string; title: string; topic: string; difficulty: string; timeLimit: number; questionCount: number };

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return { Authorization: `Bearer ${token}` };
}

function QuizList() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${BASE_URL}/api/quizzes`, { headers: authHeaders(), cache: "no-store" });
        const data = await res.json();
        if (!res.ok) { toast.error(data?.message || "Failed to load quizzes"); return; }
        setQuizzes(data);
      } catch {
        toast.error("Could not reach server");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Shell>
      <h1 className="text-3xl font-bold">Quizzes</h1>
      <p className="text-muted-foreground text-sm mt-1">Pick a topic and beat the clock. Auto-graded on submit.</p>
      {loading ? (
        <div className="mt-6 text-sm text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {quizzes.map((q, i) => (
            <GlassCard key={q.id} tint={(["mint","pink","lavender","yellow","sky"] as const)[i % 5]} className="p-6">
              <div className="text-xs uppercase text-muted-foreground">{q.topic}</div>
              <h3 className="text-xl font-bold mt-1">{q.title}</h3>
              <div className="mt-2 text-xs flex gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-white/70">{q.difficulty}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/70">{q.timeLimit} min</span>
                <span className="px-2 py-0.5 rounded-full bg-white/70">{q.questionCount} Qs</span>
              </div>
              <Button asChild className="mt-4 w-full"><Link to="/quizzes/$id" params={{ id: q.id }}>Start Quiz</Link></Button>
            </GlassCard>
          ))}
          {quizzes.length === 0 && <div className="text-sm text-muted-foreground">No quizzes available right now.</div>}
        </div>
      )}
    </Shell>
  );
}