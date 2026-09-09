import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BASE_URL } from "@/config/apiConfig";

export const Route = createFileRoute("/admin/")({ component: () => <Guard role="admin"><AdminDash /></Guard> });

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return { Authorization: `Bearer ${token}` };
}

type Summary = { students: number; codingSubmissions: number; quizAttempts: number; visibleContent: number; totalContent: number };

function AdminDash() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/overview`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) { toast.error(data?.message || "Failed to load overview"); return; }
        setSummary(data);
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
      <h1 className="text-3xl font-bold">Admin Overview</h1>
      <div className="grid gap-4 sm:grid-cols-4 mt-6">
        <GlassCard tint="mint" className="p-5"><div className="text-xs uppercase">Students</div><div className="text-3xl font-black">{summary?.students ?? 0}</div></GlassCard>
        <GlassCard tint="pink" className="p-5"><div className="text-xs uppercase">Coding Submissions</div><div className="text-3xl font-black">{summary?.codingSubmissions ?? 0}</div></GlassCard>
        <GlassCard tint="yellow" className="p-5"><div className="text-xs uppercase">Quiz Attempts</div><div className="text-3xl font-black">{summary?.quizAttempts ?? 0}</div></GlassCard>
        <GlassCard tint="lavender" className="p-5"><div className="text-xs uppercase">Quizzes / Problems</div><div className="text-3xl font-black">{summary?.visibleContent ?? 0}/{summary?.totalContent ?? 0}</div></GlassCard>
      </div>
      <div className="mt-6 flex gap-3 flex-wrap">
        <Button asChild><Link to="/admin/submissions">Analytics</Link></Button>
        <Button asChild variant="secondary"><Link to="/admin/coding">Coding submissions log</Link></Button>
        <Button asChild variant="secondary"><Link to="/admin/quizzes">Manage quizzes</Link></Button>
        <Button asChild variant="secondary"><Link to="/admin/problems">Manage problems</Link></Button>
        <Button asChild variant="secondary"><Link to="/admin/debugging">Manage debugging</Link></Button>
      </div>
    </Shell>
  );
}