import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { useAuth } from "@/lib/auth";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BASE_URL } from "@/config/apiConfig";

export const Route = createFileRoute("/leaderboard")({ component: LB });

type ScopeOption = { type: "overall" } | { type: "quiz"; id: string } | { type: "problem"; id: string };
type Row = { studentId: string; name: string; registerNo: string; score: number; meta: string };

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return { Authorization: `Bearer ${token}` };
}

function LB() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<{ id: string; title: string }[]>([]);
  const [problems, setProblems] = useState<{ id: string; title: string }[]>([]);
  const [scope, setScope] = useState<ScopeOption>({ type: "overall" });
  const [rows, setRows] = useState<Row[]>([]);
  const [year, setYear] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function loadLists() {
      const [qRes, pRes] = await Promise.all([
        fetch(`${BASE_URL}/api/quizzes`, { headers: authHeaders() }),
        fetch(`${BASE_URL}/api/problems`, { headers: authHeaders() }),
      ]);
      const qData = await qRes.json();
      const pData = await pRes.json();
      if (qRes.ok) setQuizzes(qData);
      if (pRes.ok) setProblems(pData);
    }
    loadLists();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    async function loadRows() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("scope", scope.type);
        if (scope.type !== "overall") params.set("id", scope.id);
        const res = await fetch(`${BASE_URL}/api/leaderboard?${params.toString()}`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) { toast.error(data?.message || "Failed to load leaderboard"); return; }
        setYear(data.year);
        setRows(data.rows);
      } catch {
        toast.error("Could not reach server");
      } finally {
        setLoading(false);
      }
    }
    loadRows();
  }, [scope, user]);

  if (!user) return <Navigate to="/login" />;

  const medal = ["🥇", "🥈", "🥉"];

  return (
    <Shell>
      <div className="flex items-center gap-2">
        <Trophy className="h-7 w-7" />
        <h1 className="text-3xl font-bold">Leaderboard</h1>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Showing {year || user.year} students only.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setScope({ type: "overall" })}
          className={`px-3 py-1.5 rounded-full text-sm ${scope.type === "overall" ? "bg-foreground text-background" : "bg-white/70"}`}
        >
          Overall
        </button>
        {quizzes.map((q) => (
          <button
            key={q.id}
            onClick={() => setScope({ type: "quiz", id: q.id })}
            className={`px-3 py-1.5 rounded-full text-sm ${scope.type === "quiz" && scope.id === q.id ? "bg-foreground text-background" : "bg-white/70"}`}
          >
            {q.title}
          </button>
        ))}
        {problems.map((p) => (
          <button
            key={p.id}
            onClick={() => setScope({ type: "problem", id: p.id })}
            className={`px-3 py-1.5 rounded-full text-sm ${scope.type === "problem" && scope.id === p.id ? "bg-foreground text-background" : "bg-white/70"}`}
          >
            {p.title}
          </button>
        ))}
      </div>

      <GlassCard tint="plain" className="mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/60">
            <tr className="text-left">
              <th className="p-3">Rank</th>
              <th className="p-3">Student</th>
              <th className="p-3 hidden sm:table-cell">Register No</th>
              <th className="p-3 text-right">Score</th>
              <th className="p-3 text-right hidden md:table-cell">Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No attempts yet for this selection.</td></tr>
            ) : (
              rows.map((r, i) => (
                <tr key={r.studentId} className={`border-t border-white/60 ${r.studentId === String(user.id) ? "bg-pastel-yellow/40" : ""}`}>
                  <td className="p-3 font-bold">{medal[i] || `#${i + 1}`}</td>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3 hidden sm:table-cell text-muted-foreground">{r.registerNo}</td>
                  <td className="p-3 text-right font-bold">{r.score}</td>
                  <td className="p-3 text-right hidden md:table-cell text-muted-foreground">{r.meta}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </GlassCard>
    </Shell>
  );
}