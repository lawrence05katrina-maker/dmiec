import { createFileRoute } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { Trophy, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { BASE_URL } from "@/config/apiConfig";

export const Route = createFileRoute("/admin/leaderboard")({ component: () => <Guard role="admin"><AdminLB /></Guard> });

type ScopeOption = { type: "overall" } | { type: "quiz"; id: string } | { type: "problem"; id: string };
type Row = { studentId: string; name: string; registerNo: string; year: string; department: string; score: number; meta: string };

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return { Authorization: `Bearer ${token}` };
}

function AdminLB() {
  const [quizzes, setQuizzes] = useState<{ id: string; title: string }[]>([]);
  const [problems, setProblems] = useState<{ id: string; title: string }[]>([]);
  const [year, setYear] = useState<string>("All");
  const [scope, setScope] = useState<ScopeOption>({ type: "overall" });
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const years = ["All", "1st Year", "2nd Year", "3rd Year", "4th Year"];

  useEffect(() => {
    async function loadLists() {
      const [qRes, pRes] = await Promise.all([
        fetch(`${BASE_URL}/api/admin/quizzes`, { headers: authHeaders() }),
        fetch(`${BASE_URL}/api/admin/problems`, { headers: authHeaders() }),
      ]);
      const qData = await qRes.json();
      const pData = await pRes.json();
      if (qRes.ok) setQuizzes(qData);
      if (pRes.ok) setProblems(pData);
    }
    loadLists();
  }, []);

  useEffect(() => {
    async function loadRows() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("scope", scope.type);
        if (scope.type !== "overall") params.set("id", scope.id);
        if (year !== "All") params.set("year", year);
        const res = await fetch(`${BASE_URL}/api/admin/leaderboard?${params.toString()}`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) { toast.error(data?.message || "Failed to load leaderboard"); return; }
        setRows(data.rows);
      } catch {
        toast.error("Could not reach server");
      } finally {
        setLoading(false);
      }
    }
    loadRows();
  }, [scope, year]);

  function downloadExcel() {
    const scopeLabel =
      scope.type === "overall" ? "Overall" :
      scope.type === "quiz" ? quizzes.find((q) => q.id === scope.id)?.title || "Quiz" :
      problems.find((p) => p.id === scope.id)?.title || "Problem";

    const sheetRows = rows.map((r, i) => ({
      Rank: i + 1,
      Name: r.name,
      "Register No": r.registerNo,
      Year: r.year,
      Department: r.department,
      Score: r.score,
      Detail: r.meta,
    }));
    const ws = XLSX.utils.json_to_sheet(sheetRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leaderboard");
    XLSX.writeFile(wb, `Leaderboard_${scopeLabel.replace(/\s+/g, "_")}_${year.replace(/\s+/g, "_")}.xlsx`);
  }

  const medal = ["🥇", "🥈", "🥉"];

  return (
    <Shell>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-7 w-7" />
          <h1 className="text-3xl font-bold">Leaderboard (Admin)</h1>
        </div>
        <Button variant="secondary" onClick={downloadExcel} disabled={rows.length === 0}>
          <Download className="h-4 w-4" /> Download Excel
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Full visibility across all years and departments.</p>

      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <select value={year} onChange={(e) => setYear(e.target.value)} className="rounded-md border px-3 py-1.5 text-sm bg-white">
          {years.map((y) => <option key={y}>{y}</option>)}
        </select>
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
              <th className="p-3 hidden md:table-cell">Year · Dept</th>
              <th className="p-3 text-right">Score</th>
              <th className="p-3 text-right hidden lg:table-cell">Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No attempts yet for this selection.</td></tr>
            ) : (
              rows.map((r, i) => (
                <tr key={r.studentId} className="border-t border-white/60">
                  <td className="p-3 font-bold">{medal[i] || `#${i + 1}`}</td>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3 hidden sm:table-cell text-muted-foreground">{r.registerNo}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{r.year} · {r.department}</td>
                  <td className="p-3 text-right font-bold">{r.score}</td>
                  <td className="p-3 text-right hidden lg:table-cell text-muted-foreground">{r.meta}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </GlassCard>
    </Shell>
  );
}