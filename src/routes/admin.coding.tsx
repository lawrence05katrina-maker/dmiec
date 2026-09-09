import { createFileRoute } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BASE_URL } from "@/config/apiConfig";

export const Route = createFileRoute("/admin/coding")({ component: () => <Guard role="admin"><CodingLog /></Guard> });

type TestResult = { name: string; hidden: boolean; pass: boolean; got: string; expected: string };
type Submission = {
  id: string;
  studentId: string;
  studentName: string;
  problemId: string;
  problemTitle: string;
  language: string;
  code: string;
  marks: number;
  maxMarks: number;
  passed: number;
  total: number;
  testResults: TestResult[];
  timestamp: number;
};

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return { Authorization: `Bearer ${token}` };
}

function CodingLog() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/submissions`, { headers: authHeaders(), cache: "no-store" });
        const data = await res.json();
        if (!res.ok) { toast.error(data?.message || "Failed to load submissions"); return; }
        setSubs(data.sort((a: Submission, b: Submission) => b.timestamp - a.timestamp));
      } catch {
        toast.error("Could not reach server");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const open = subs.find((s) => s.id === openId);

  return (
    <Shell>
      <h1 className="text-3xl font-bold">Coding Submissions Log</h1>
      <p className="text-sm text-muted-foreground mt-1">Read-only. Coding scores are auto-graded against all test cases (visible + hidden). Use this view for auditing and plagiarism checks.</p>

      {loading ? (
        <div className="mt-6 text-sm text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 mt-6">
          <GlassCard tint="plain" className="p-4 max-h-[70vh] overflow-y-auto">
            <div className="text-xs uppercase text-muted-foreground mb-2">All coding submissions</div>
            <ul className="space-y-2">
              {subs.map((s) => (
                <li key={s.id}>
                  <button onClick={() => setOpenId(s.id)} className={`w-full text-left p-3 rounded-lg border transition-all ${openId === s.id ? "bg-foreground text-background" : "bg-white/60 hover:bg-white"}`}>
                    <div className="flex justify-between gap-2 flex-wrap">
                      <div className="font-medium">{s.studentName} · {s.problemTitle}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-pastel-mint text-foreground">{s.marks}/{s.maxMarks}</span>
                    </div>
                    <div className="text-xs opacity-70 mt-0.5">{s.language} · {s.passed}/{s.total} tests · {new Date(s.timestamp).toLocaleString()}</div>
                  </button>
                </li>
              ))}
              {subs.length === 0 && <li className="text-sm text-muted-foreground">No coding submissions yet.</li>}
            </ul>
          </GlassCard>

          <GlassCard tint="plain" className="p-4">
            {!open ? (
              <div className="text-sm text-muted-foreground p-6 text-center">Select a submission to inspect.</div>
            ) : (
              <div>
                <div className="font-bold">{open.studentName} · {open.problemTitle}</div>
                <div className="text-xs text-muted-foreground">{open.language} · {new Date(open.timestamp).toLocaleString()}</div>
                <div className="mt-2 inline-block px-3 py-1 rounded-full bg-pastel-mint text-xs font-semibold">Auto-Graded · {open.marks}/{open.maxMarks} · {open.passed}/{open.total} tests</div>
                <pre className="mt-3 max-h-72 overflow-auto text-xs bg-[#1e1e1e] text-white p-3 rounded-lg font-mono">{open.code}</pre>
                <div className="mt-3 space-y-1">
                  {(open.testResults || []).map((t, i) => (
                    <div key={i} className={`rounded-lg p-2 text-xs ${t.pass ? "bg-pastel-mint/60" : "bg-pastel-pink/60"}`}>
                      <div className="font-semibold">{t.name}{t.hidden ? " (hidden)" : ""}: {t.pass ? "Passed ✓" : "Failed ✗"}</div>
                      {!t.pass && <div className="mt-1">Got: <code>{t.got || "(empty)"}</code> · Expected: <code>{t.expected}</code></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </Shell>
  );
}