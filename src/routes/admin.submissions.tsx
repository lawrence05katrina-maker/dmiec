import { createFileRoute } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { BASE_URL } from "@/config/apiConfig";

export const Route = createFileRoute("/admin/submissions")({ component: () => <Guard role="admin"><Analytics /></Guard> });

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return { Authorization: `Bearer ${token}` };
}

type Attempt = { id: string; studentId: string; studentName: string; score: number; total: number; status: string; timestamp: number };
type Summary = { totalAttempts: number; totalQuizzes: number; studentsAttempted: number; avgScorePct: number };

function Analytics() {
  const [quizzes, setQuizzes] = useState<{ id: string; title: string }[]>([]);
  const [qid, setQid] = useState<string>("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitial() {
      try {
        const [qRes, sRes] = await Promise.all([
          fetch(`${BASE_URL}/api/admin/quizzes`, { headers: authHeaders() }),
          fetch(`${BASE_URL}/api/admin/quizzes/analytics/summary`, { headers: authHeaders() }),
        ]);
        const qData = await qRes.json();
        const sData = await sRes.json();
        if (qRes.ok) {
          setQuizzes(qData);
          if (qData.length > 0) setQid(qData[0].id);
        }
        if (sRes.ok) setSummary(sData);
      } catch {
        toast.error("Could not reach server");
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    if (!qid) return;
    async function loadAttempts() {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/quizzes/${qid}/analytics`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) { toast.error(data?.message || "Failed to load analytics"); return; }
        setAttempts(data.attempts);
      } catch {
        toast.error("Could not reach server");
      }
    }
    loadAttempts();
  }, [qid]);

  const quiz = quizzes.find((q) => q.id === qid);

  const stats = useMemo(() => {
    if (!quiz || attempts.length === 0) return null;
    const scores = attempts.map((a) => a.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const max = Math.max(...scores), min = Math.min(...scores);
    const buckets = [0, 20, 40, 60, 80, 100].map((p, i, arr) => {
      const lo = p, hi = arr[i + 1] ?? 101;
      const count = attempts.filter((a) => {
        const pct = (a.score / (a.total || 1)) * 100;
        return pct >= lo && pct < hi;
      }).length;
      return { range: `${lo}-${hi === 101 ? 100 : hi - 1}%`, count };
    });
    return { avg, max, min, buckets };
  }, [quiz, attempts]);

  if (loading) return <Shell><div className="text-sm text-muted-foreground">Loading...</div></Shell>;

  return (
    <Shell>
      <h1 className="text-3xl font-bold">Quiz Analytics</h1>
      <p className="text-sm text-muted-foreground mt-1">Attempts, averages, and score distribution.</p>

      <div className="grid gap-4 sm:grid-cols-4 mt-6">
        <GlassCard tint="mint" className="p-5"><div className="text-xs uppercase">Total attempts</div><div className="text-3xl font-black">{summary?.totalAttempts ?? 0}</div></GlassCard>
        <GlassCard tint="pink" className="p-5"><div className="text-xs uppercase">Quizzes</div><div className="text-3xl font-black">{summary?.totalQuizzes ?? 0}</div></GlassCard>
        <GlassCard tint="lavender" className="p-5"><div className="text-xs uppercase">Students attempted</div><div className="text-3xl font-black">{summary?.studentsAttempted ?? 0}</div></GlassCard>
        <GlassCard tint="yellow" className="p-5"><div className="text-xs uppercase">Avg score %</div><div className="text-3xl font-black">{summary?.avgScorePct ?? 0}%</div></GlassCard>
      </div>

      <GlassCard tint="plain" className="p-6 mt-6">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm font-semibold">Quiz:</label>
          <select value={qid} onChange={(e) => setQid(e.target.value)} className="rounded-md border px-3 py-2 text-sm bg-white">
            {quizzes.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
          </select>
        </div>

        {!quiz ? <div className="text-sm text-muted-foreground mt-4">No quiz selected.</div> :
          !stats ? <div className="text-sm text-muted-foreground mt-4">No attempts yet.</div> : (
          <>
            <div className="grid gap-4 sm:grid-cols-4 mt-4">
              <div className="rounded-xl p-4 bg-pastel-mint/40"><div className="text-xs uppercase">Attempts</div><div className="text-2xl font-black">{attempts.length}</div></div>
              <div className="rounded-xl p-4 bg-pastel-sky/40"><div className="text-xs uppercase">Average</div><div className="text-2xl font-black">{stats.avg.toFixed(1)}</div></div>
              <div className="rounded-xl p-4 bg-pastel-yellow/40"><div className="text-xs uppercase">High</div><div className="text-2xl font-black">{stats.max}</div></div>
              <div className="rounded-xl p-4 bg-pastel-pink/40"><div className="text-xs uppercase">Low</div><div className="text-2xl font-black">{stats.min}</div></div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-sm mb-2">Score distribution</h3>
              <div className="h-64 bg-white/60 rounded-xl p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.buckets}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="range" fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#a78bfa" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <h3 className="font-semibold text-sm mb-2">Attempts</h3>
              <table className="w-full text-sm">
                <thead className="bg-white/60"><tr className="text-left"><th className="p-2">Student</th><th className="p-2">Score</th><th className="p-2">%</th><th className="p-2">Status</th><th className="p-2">When</th></tr></thead>
                <tbody>
                  {attempts.map((a) => (
                    <tr key={a.id} className="border-t border-white/60">
                      <td className="p-2">{a.studentName}</td>
                      <td className="p-2">{a.score}/{a.total}</td>
                      <td className="p-2">{Math.round((a.score / (a.total || 1)) * 100)}%</td>
                      <td className="p-2"><span className="text-xs px-2 py-0.5 rounded-full bg-pastel-mint">{a.status}</span></td>
                      <td className="p-2 text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </GlassCard>
    </Shell>
  );
}