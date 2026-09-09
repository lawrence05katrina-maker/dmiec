// problems.$id.tsx
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState, lazy, Suspense, useEffect } from "react";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import type { CodingProblem } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LANGUAGES, runCode } from "@/lib/piston";
import { BASE_URL } from "@/config/apiConfig";
import { toast } from "sonner";
import { Loader2, Play, Send, Eye, EyeOff } from "lucide-react";
import { useExamSecurity } from "@/hooks/useExamSecurity";

const MonacoEditor = lazy(() => import("@monaco-editor/react").then((m) => ({ default: m.default })));

export const Route = createFileRoute("/problems/$id")({ component: () => <Guard role="student"><ProblemPage /></Guard> });

function ProblemPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [problem, setProblem] = useState<CodingProblem | null>(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);

  const [langLabel, setLangLabel] = useState(LANGUAGES[0].label);
  const lang = LANGUAGES.find((l) => l.label === langLabel)!;
  const draftKey = `dmi_draft_${id}_${langLabel}`;
  const [code, setCode] = useState(lang.template);
  const [stdin, setStdin] = useState("");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<{ stdout: string; stderr: string } | null>(null);
  const [results, setResults] = useState<{ pass: boolean; got: string; expected: string }[] | null>(null);
  const [gradeResult, setGradeResult] = useState<{
    passed: number; total: number; marks: number; maxMarks: number;
    tests: { name: string; hidden: boolean; pass: boolean; got: string; expected: string }[];
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showRef, setShowRef] = useState(false);

  const handleSecurityViolation = (reason: string) => {
    toast.error("Test cancelled", {
      description: reason,
      duration: 5000,
    });

    router.navigate({ to: "/problems" });
  };

  useExamSecurity({
    enabled: !!problem,
    onViolation: handleSecurityViolation,
  });

  // Fetch problem + this student's submissions from the API
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingProblem(true);
      try {
        const token = localStorage.getItem("admin_token");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await fetch(`${BASE_URL}/api/problems/${id}`, { headers });
        const data = await res.json();
        if (!cancelled && res.ok) setProblem(data);

        const subRes = await fetch(`${BASE_URL}/api/submissions`, { headers });
        const subs = await subRes.json();
        if (!cancelled && subRes.ok) setMySubmissions(subs);
      } catch (e) {
        if (!cancelled) toast.error("Failed to load problem");
      } finally {
        if (!cancelled) setLoadingProblem(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  // Once problem loads, default the custom-input box to its first sample
  useEffect(() => {
    if (problem?.samples?.[0]?.input !== undefined) {
      setStdin(problem.samples[0].input);
    }
  }, [problem]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(draftKey);
    setCode(saved || lang.template);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [langLabel, id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(() => window.localStorage.setItem(draftKey, code), 800);
    return () => clearTimeout(t);
  }, [code, draftKey]);

  if (loadingProblem) {
    return (
      <Shell>
        <div className="grid place-items-center h-64 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </Shell>
    );
  }

  if (!problem) return <Shell><div>Problem not found.</div></Shell>;
  if (problem.isHidden) return (
    <Shell>
      <GlassCard tint="plain" className="p-8 text-center max-w-lg mx-auto">
        <h1 className="text-2xl font-bold">Problem unavailable</h1>
        <p className="text-sm text-muted-foreground mt-2">This problem is currently hidden by the administrator.</p>
      </GlassCard>
    </Shell>
  );

  const solvedFully = mySubmissions.some(
    (s) => s.problemId === problem!.id && s.passed === s.total && s.total > 0
  );
  const canSeeRef = solvedFully && !!problem.referenceSolution;

  async function handleRun() {
    setRunning(true); setOutput(null); setResults(null);
    try {
      const r = await runCode(langLabel, code, stdin);
      setOutput({ stdout: r.stdout, stderr: r.stderr });
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setRunning(false); }
  }

  async function handleRunSamples() {
    setRunning(true); setResults(null); setOutput(null);
    try {
      const out: { pass: boolean; got: string; expected: string }[] = [];
      for (const s of problem!.samples) {
        const r = await runCode(langLabel, code, s.input);
        const got = (r.stdout || "").trim();
        out.push({ pass: got === s.expected.trim(), got, expected: s.expected });
      }
      setResults(out);
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setRunning(false); }
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true); setGradeResult(null); setOutput(null); setResults(null);
    try {
      const visible = problem!.samples.map((t, i) => ({ ...t, name: `Sample ${i + 1}`, hidden: false }));
      const hidden = (problem!.hiddenTests || []).map((t, i) => ({ ...t, name: `Hidden ${i + 1}`, hidden: true }));
      const all = [...visible, ...hidden];
      const tests: { name: string; hidden: boolean; pass: boolean; got: string; expected: string }[] = [];
      for (const t of all) {
        const r = await runCode(langLabel, code, t.input);
        const got = (r.stdout || "").trim();
        tests.push({ name: t.name, hidden: t.hidden, pass: got === t.expected.trim(), got, expected: t.expected });
      }
      const passed = tests.filter((t) => t.pass).length;
      const total = tests.length;
      const marks = total === 0 ? 0 : Math.round((passed / total) * problem!.marks);

      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${BASE_URL}/api/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          problemId: problem!.id, language: langLabel, code,
          status: "Auto-Graded", marks, maxMarks: problem!.marks, passed, total, testResults: tests,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      const saved = await res.json();

      // Keep local submissions list in sync so "solvedFully" / reference-solution unlock updates immediately
      setMySubmissions((prev) => [...prev, saved]);

      setGradeResult({ passed, total, marks, maxMarks: problem!.marks, tests });
      toast.success(`Auto-Graded: ${marks}/${problem!.marks} (${passed}/${total} tests)`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setSubmitting(false); }
  }

  const diffColor: Record<string, string> = { Easy: "bg-pastel-mint", Medium: "bg-pastel-yellow", Hard: "bg-pastel-pink" };

  return (
    <Shell>
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard tint="plain" className="p-6 lg:max-h-[calc(100vh-10rem)] overflow-y-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs ${diffColor[problem.difficulty]}`}>{problem.difficulty}</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-white/80">{problem.category}</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-white/80">{problem.marks} pts</span>
          </div>
          <p className="mt-4 text-sm whitespace-pre-wrap">{problem.description}</p>
          <h3 className="mt-4 font-semibold text-sm">Input format</h3>
          <p className="text-sm text-muted-foreground">{problem.inputFormat}</p>
          <h3 className="mt-3 font-semibold text-sm">Output format</h3>
          <p className="text-sm text-muted-foreground">{problem.outputFormat}</p>
          <h3 className="mt-3 font-semibold text-sm">Constraints</h3>
          <p className="text-sm text-muted-foreground">{problem.constraints}</p>
          <h3 className="mt-4 font-semibold text-sm">Sample test cases</h3>
          <div className="mt-2 space-y-2">
            {problem.samples.map((s, i) => (
              <div key={i} className="grid sm:grid-cols-2 gap-2">
                <div><div className="text-xs text-muted-foreground">Input</div><pre className="text-xs bg-white/70 rounded-lg p-2 whitespace-pre-wrap">{s.input}</pre></div>
                <div><div className="text-xs text-muted-foreground">Expected</div><pre className="text-xs bg-white/70 rounded-lg p-2 whitespace-pre-wrap">{s.expected}</pre></div>
              </div>
            ))}
          </div>

          {problem.referenceSolution && (
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Reference solution</h3>
                {canSeeRef ? (
                  <Button size="sm" variant="ghost" onClick={() => setShowRef((v) => !v)}>
                    {showRef ? <><EyeOff className="h-3 w-3" /> Hide</> : <><Eye className="h-3 w-3" /> Show</>}
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">Unlocks after passing all tests</span>
                )}
              </div>
              {canSeeRef && showRef && (
                <pre className="mt-2 text-xs bg-[#1e1e1e] text-white rounded-lg p-3 overflow-auto max-h-64 font-mono">{problem.referenceSolution}</pre>
              )}
            </div>
          )}
        </GlassCard>

        <div className="flex flex-col gap-3">
          <GlassCard tint="plain" className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              <select value={langLabel} onChange={(e) => setLangLabel(e.target.value)} className="text-sm rounded-lg px-3 py-2 bg-white/80 border">
                {LANGUAGES.map((l) => <option key={l.label} value={l.label}>{l.label}</option>)}
              </select>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="secondary" onClick={handleRun} disabled={running || submitting}>{running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run</Button>
                <Button size="sm" variant="secondary" onClick={handleRunSamples} disabled={running || submitting}>Run Samples</Button>
                <Button size="sm" onClick={handleSubmit} disabled={running || submitting}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit</Button>
              </div>
            </div>
            <div className="mt-2 rounded-xl overflow-hidden border bg-white">
              <Suspense fallback={<div className="h-[380px] grid place-items-center text-sm text-muted-foreground">Loading editor…</div>}>
                <MonacoEditor height="380px" language={lang.monaco} value={code} onChange={(v) => setCode(v || "")} options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false }} theme="vs" />
              </Suspense>
            </div>
          </GlassCard>

          <GlassCard tint="plain" className="p-4">
            <div className="text-xs font-semibold uppercase text-muted-foreground">Custom Input</div>
            <textarea value={stdin} onChange={(e) => setStdin(e.target.value)} className="mt-1 w-full h-20 rounded-lg border bg-white/70 p-2 text-sm font-mono" />
            {output && (
              <div className="mt-3 space-y-1 text-sm">
                <div className="text-xs font-semibold uppercase text-muted-foreground">Output</div>
                <pre className="bg-white/70 rounded-lg p-2 whitespace-pre-wrap text-xs">{output.stdout || "(no stdout)"}</pre>
                {output.stderr && <><div className="text-xs font-semibold uppercase text-destructive">Stderr</div><pre className="bg-destructive/10 rounded-lg p-2 whitespace-pre-wrap text-xs">{output.stderr}</pre></>}
              </div>
            )}
            {results && (
              <div className="mt-3 space-y-2">
                <div className="text-xs font-semibold uppercase text-muted-foreground">Sample results</div>
                {results.map((r, i) => (
                  <div key={i} className={`rounded-lg p-2 text-xs ${r.pass ? "bg-pastel-mint/60" : "bg-pastel-pink/60"}`}>
                    <div className="font-semibold">Test {i + 1}: {r.pass ? "Passed ✓" : "Failed ✗"}</div>
                    {!r.pass && <div className="mt-1">Got: <code>{r.got || "(empty)"}</code> · Expected: <code>{r.expected}</code></div>}
                  </div>
                ))}
              </div>
            )}
            {gradeResult && (
              <div className="mt-3 space-y-2">
                <div className="rounded-xl p-3 bg-pastel-mint/60 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="text-xs font-semibold uppercase">Auto-Graded</div>
                    <div className="text-xs text-muted-foreground">{gradeResult.passed} of {gradeResult.total} test cases passed</div>
                  </div>
                  <div className="text-2xl font-black">{gradeResult.marks}<span className="text-sm text-muted-foreground">/{gradeResult.maxMarks}</span></div>
                </div>
                {gradeResult.tests.map((t, i) => (
                  <div key={i} className={`rounded-lg p-2 text-xs ${t.pass ? "bg-pastel-mint/60" : "bg-pastel-pink/60"}`}>
                    <div className="font-semibold">{t.name}{t.hidden ? " (hidden)" : ""}: {t.pass ? "Passed ✓" : "Failed ✗"}</div>
                    {!t.pass && !t.hidden && <div className="mt-1">Got: <code>{t.got || "(empty)"}</code> · Expected: <code>{t.expected}</code></div>}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </Shell>
  );
}