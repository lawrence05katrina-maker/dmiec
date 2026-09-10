import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Quiz, QuizQuestion } from "@/lib/types";
import { Trash2, Plus, Upload, Eye, EyeOff, BarChart3, KeyRound, Download } from "lucide-react";
import { readSheet, rowsToQuestions } from "@/lib/excel";
import { BASE_URL } from "@/config/apiConfig";
import * as XLSX from "xlsx";

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export const Route = createFileRoute("/admin/quizzes")({ component: () => <Guard role="admin"><QAdmin /></Guard> });

function QAdmin() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [codesFor, setCodesFor] = useState<Quiz | null>(null);

  async function loadQuizzes() {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/quizzes`, { headers: authHeaders(), cache: "no-store" });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.message || "Failed to load quizzes"); return; }
      setQuizzes(data);
    } catch {
      toast.error("Could not reach server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadQuizzes(); }, []);

  async function save(q: Quiz) {
    const isNew = !quizzes.some((x) => x.id === q.id);
    try {
      const res = await fetch(
        isNew ? `${BASE_URL}/api/admin/quizzes` : `${BASE_URL}/api/admin/quizzes/${q.id}`,
        { method: isNew ? "POST" : "PUT", headers: authHeaders(), body: JSON.stringify(q) }
      );
      const data = await res.json();
      if (!res.ok) { toast.error(data?.message || "Failed to save quiz"); return; }
      await loadQuizzes();
      setEditing(null);
      toast.success("Saved");
    } catch {
      toast.error("Could not reach server");
    }
  }

  async function del(id: string) {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/quizzes/${id}`, { method: "DELETE", headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(data?.message || "Failed to delete"); return; }
      setQuizzes(quizzes.filter((x) => x.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Could not reach server");
    }
  }

  async function toggleHide(id: string) {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/quizzes/${id}/toggle-hide`, { method: "PATCH", headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.message || "Failed to update"); return; }
      setQuizzes(quizzes.map((x) => (x.id === id ? { ...x, isHidden: data.isHidden } : x)));
      toast.success(data.isHidden ? "Quiz hidden from students" : "Quiz visible to students");
    } catch {
      toast.error("Could not reach server");
    }
  }

  if (loading) return <Shell><div className="text-sm text-muted-foreground">Loading quizzes...</div></Shell>;

  return (
    <Shell>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Manage Quizzes</h1>
        <div className="flex gap-2">
          <Button asChild variant="secondary"><Link to="/admin/submissions"><BarChart3 className="h-4 w-4" /> Analytics</Link></Button>
          <Button onClick={() => setEditing({ id: uid(), title: "", topic: "", difficulty: "Easy", timeLimit: 5, questions: [], isHidden: false, questionCount: undefined })}><Plus className="h-4 w-4" /> New Quiz</Button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {quizzes.map((q) => (
          <GlassCard key={q.id} tint="plain" className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="font-bold flex items-center gap-2">
                {q.title}
                {q.isHidden && <span className="text-xs px-2 py-0.5 rounded-full bg-pastel-yellow">Hidden</span>}
              </div>
              <div className="text-xs text-muted-foreground">
                {q.topic} · {q.difficulty} · {q.timeLimit}min · {q.questions.length} in bank
                {q.questionCount ? ` · ${q.questionCount} shown per student (shuffled)` : " · all shown to every student"}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button asChild size="sm" variant="ghost"><Link to="/admin/submissions" search={{ quiz: q.id } as never}><BarChart3 className="h-4 w-4" /></Link></Button>
              <Button size="sm" variant="secondary" onClick={() => setCodesFor(q)}>
                <KeyRound className="h-4 w-4" /> Codes
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toggleHide(q.id)} title={q.isHidden ? "Show" : "Hide"}>
                {q.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setEditing(q)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => del(q.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </GlassCard>
        ))}
      </div>

      {editing && <QuizEditor initial={editing} onCancel={() => setEditing(null)} onSave={save} />}
      {codesFor && <AccessCodeModal quiz={codesFor} onClose={() => setCodesFor(null)} />}
    </Shell>
  );
}

function QuizEditor({ initial, onCancel, onSave }: { initial: Quiz; onCancel: () => void; onSave: (q: Quiz) => void }) {
  const [q, setQ] = useState<Quiz>(initial);
  const [preview, setPreview] = useState<QuizQuestion[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    try {
      const rows = await readSheet(f);
      const parsed = rowsToQuestions(rows);
      if (parsed.length === 0) { toast.error("No valid questions found. Check column headers."); return; }
      setPreview(parsed);
      toast.success(`Parsed ${parsed.length} questions — review then confirm`);
    } catch (e) {
      toast.error("Failed to read Excel: " + (e as Error).message);
    }
  }

  function confirmImport() {
    if (!preview) return;
    setQ({ ...q, questions: [...q.questions, ...preview] });
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
    toast.success("Questions added to quiz");
  }

  function handleSaveClick() {
    if (q.questionCount !== undefined && q.questionCount <= 0) {
      toast.error("Questions to ask must be a positive number.");
      return;
    }
    if (q.questionCount && q.questionCount > q.questions.length) {
      toast.error(`You're asking for ${q.questionCount} questions, but the bank only has ${q.questions.length}. Add more questions below or reduce this number.`);
      return;
    }
    onSave(q);
  }

  const poolShortfall = q.questionCount && q.questionCount > q.questions.length;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4 overflow-y-auto">
      <GlassCard tint="plain" className="max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold">{initial.title ? "Edit" : "New"} Quiz</h2>
        <div className="grid gap-3 sm:grid-cols-2 mt-4">
          <div><label className="text-xs">Title</label><Input value={q.title} onChange={(e) => setQ({ ...q, title: e.target.value })} /></div>
          <div><label className="text-xs">Topic</label><Input value={q.topic} onChange={(e) => setQ({ ...q, topic: e.target.value })} /></div>
          <div><label className="text-xs">Difficulty</label>
            <select value={q.difficulty} onChange={(e) => setQ({ ...q, difficulty: e.target.value as Quiz["difficulty"] })} className="w-full rounded-md border px-3 py-2 text-sm bg-white">
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select></div>
          <div><label className="text-xs">Time limit (min)</label><Input type="number" value={q.timeLimit} onChange={(e) => setQ({ ...q, timeLimit: Number(e.target.value) })} /></div>
          <div className="sm:col-span-2">
            <label className="text-xs">Questions to ask per student (leave blank for all)</label>
            <Input
              type="number"
              value={q.questionCount ?? ""}
              onChange={(e) => setQ({ ...q, questionCount: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="e.g. 30"
              className={poolShortfall ? "border-rose-400" : ""}
            />
            <div className="text-xs mt-1">
              {q.questions.length > 0 ? (
                <span className="text-muted-foreground">
                  Question bank currently has <strong>{q.questions.length}</strong> question{q.questions.length === 1 ? "" : "s"} below.
                  {q.questionCount ? ` Each student will get a different random ${q.questionCount}, shuffled and locked to them.` : " Every student will see all of them."}
                </span>
              ) : (
                <span className="text-muted-foreground">Add questions below or import from Excel to build the question bank first.</span>
              )}
              {poolShortfall && (
                <div className="text-rose-600 font-medium mt-1">
                  Warning: you're asking for {q.questionCount}, but only {q.questions.length} exist in the bank — add more questions or lower this number before saving.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border-2 border-dashed border-pastel-lavender bg-pastel-lavender/20 p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="font-semibold text-sm flex items-center gap-2"><Upload className="h-4 w-4" /> Bulk import from Excel</div>
              <div className="text-xs text-muted-foreground mt-0.5">Columns: <code>Question | OptionA | OptionB | OptionC | OptionD | CorrectAnswer | Marks</code>. CorrectAnswer can be A/B/C/D, 1–4, or the option text. Import a large sheet (e.g. 100 rows) to build a big question bank, then set "Questions to ask" above to a smaller number like 30.</div>
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="text-xs" />
          </div>
          {preview && (
            <div className="mt-3">
              <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">Preview — {preview.length} question(s)</div>
              <div className="max-h-56 overflow-auto rounded-lg bg-white/70">
                <table className="w-full text-xs">
                  <thead className="bg-white/80"><tr><th className="p-2 text-left">#</th><th className="p-2 text-left">Question</th><th className="p-2 text-left">Correct</th><th className="p-2 text-right">Marks</th></tr></thead>
                  <tbody>
                    {preview.map((qu, i) => (
                      <tr key={qu.id} className="border-t border-white/60">
                        <td className="p-2">{i + 1}</td>
                        <td className="p-2">{qu.text}</td>
                        <td className="p-2 text-emerald-700 font-medium">{String.fromCharCode(65 + qu.correct)}. {qu.options[qu.correct]}</td>
                        <td className="p-2 text-right">{qu.marks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={confirmImport}>Add these {preview.length} questions</Button>
                <Button size="sm" variant="secondary" onClick={() => setPreview(null)}>Cancel import</Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Questions ({q.questions.length})</h3>
            <Button size="sm" variant="secondary" onClick={() => setQ({ ...q, questions: [...q.questions, { id: uid(), text: "", options: ["","","",""], correct: 0, marks: 5 }] })}>Add Question</Button>
          </div>
          <div className="mt-3 space-y-3">
            {q.questions.map((qu, i) => (
              <div key={qu.id} className="border rounded-lg p-3 bg-white/60">
                <div className="flex justify-between items-start gap-2">
                  <div className="text-xs text-muted-foreground">Q{i + 1}</div>
                  <Button size="sm" variant="ghost" onClick={() => setQ({ ...q, questions: q.questions.filter((_, x) => x !== i) })}><Trash2 className="h-3 w-3" /></Button>
                </div>
                <Input placeholder="Question text" value={qu.text} onChange={(e) => { const arr = [...q.questions]; arr[i] = { ...qu, text: e.target.value }; setQ({ ...q, questions: arr }); }} />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {qu.options.map((o, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input type="radio" checked={qu.correct === oi} onChange={() => { const arr = [...q.questions]; arr[i] = { ...qu, correct: oi }; setQ({ ...q, questions: arr }); }} />
                      <Input placeholder={`Option ${oi + 1}`} value={o} onChange={(e) => { const arr = [...q.questions]; const opts = [...qu.options]; opts[oi] = e.target.value; arr[i] = { ...qu, options: opts }; setQ({ ...q, questions: arr }); }} />
                    </div>
                  ))}
                </div>
                <div className="mt-2"><label className="text-xs">Marks</label><Input type="number" value={qu.marks} onChange={(e) => { const arr = [...q.questions]; arr[i] = { ...qu, marks: Number(e.target.value) }; setQ({ ...q, questions: arr }); }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-2 justify-end">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSaveClick}>Save Quiz</Button>
        </div>
      </GlassCard>
    </div>
  );
}

type AccessCodeRow = { name: string; registerNo: string; year: string; code: string; isUsed: boolean; usedAt: number | null };

function AccessCodeModal({ quiz, onClose }: { quiz: Quiz; onClose: () => void }) {
  const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [codes, setCodes] = useState<AccessCodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [regNo, setRegNo] = useState("");
  const [singleGenLoading, setSingleGenLoading] = useState(false);

  async function loadCodes() {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/quizzes/${quiz.id}/access-codes`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setCodes(data);
    } catch {
      toast.error("Could not reach server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCodes(); }, []);

  function toggleYear(y: string) {
    setSelectedYears((prev) => prev.includes(y) ? prev.filter((x) => x !== y) : [...prev, y]);
  }

  async function handleGenerate() {
    if (selectedYears.length === 0) { toast.error("Select at least one year"); return; }
    setGenerating(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/quizzes/${quiz.id}/access-codes/generate`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ years: selectedYears }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.message || "Failed to generate codes"); return; }
      toast.success(data.message);
      await loadCodes();
    } catch {
      toast.error("Could not reach server");
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateOne() {
    if (!regNo.trim()) { toast.error("Enter a register number"); return; }
    setSingleGenLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/quizzes/${quiz.id}/access-codes/generate-one`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ registerNo: regNo.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.message || "Failed to generate code"); return; }
      toast.success(data.message);
      setRegNo("");
      await loadCodes();
    } catch {
      toast.error("Could not reach server");
    } finally {
      setSingleGenLoading(false);
    }
  }

  function downloadExcel() {
    const rows = codes.map((c) => ({
      Name: c.name, "Register No": c.registerNo, Year: c.year, Code: c.code, Used: c.isUsed ? "Yes" : "No",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Access Codes");
    XLSX.writeFile(wb, `AccessCodes_${quiz.title.replace(/\s+/g, "_")}.xlsx`);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4 overflow-y-auto">
      <GlassCard tint="plain" className="max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold">Access Codes — {quiz.title}</h2>
        <p className="text-xs text-muted-foreground mt-1">Each student needs a unique, one-time code to start this quiz. Codes prevent credential sharing.</p>

        <div className="mt-4 border rounded-lg p-4 bg-white/60">
          <div className="text-sm font-semibold">Generate for year(s)</div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => toggleYear(y)}
                className={`px-3 py-1.5 rounded-full text-sm ${selectedYears.includes(y) ? "bg-foreground text-background" : "bg-white/80 border"}`}
              >
                {y}
              </button>
            ))}
          </div>
          <Button size="sm" className="mt-3" onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating..." : "Generate codes"}
          </Button>
        </div>

        <div className="mt-4 border rounded-lg p-4 bg-white/60">
          <div className="text-sm font-semibold">Missing a student? Generate one code</div>
          <div className="flex gap-2 mt-2">
            <Input placeholder="Register number" value={regNo} onChange={(e) => setRegNo(e.target.value)} />
            <Button size="sm" variant="secondary" onClick={handleGenerateOne} disabled={singleGenLoading}>
              {singleGenLoading ? "..." : "Generate"}
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Generated codes ({codes.length})</div>
            <Button size="sm" variant="secondary" onClick={downloadExcel} disabled={codes.length === 0}>
              <Download className="h-4 w-4" /> Download Excel
            </Button>
          </div>
          {loading ? (
            <div className="text-sm text-muted-foreground mt-2">Loading...</div>
          ) : (
            <div className="mt-2 max-h-64 overflow-auto rounded-lg bg-white/70">
              <table className="w-full text-xs">
                <thead className="bg-white/90"><tr><th className="p-2 text-left">Name</th><th className="p-2 text-left">Reg No</th><th className="p-2 text-left">Year</th><th className="p-2 text-left">Code</th><th className="p-2 text-left">Status</th></tr></thead>
                <tbody>
                  {codes.map((c, i) => (
                    <tr key={i} className="border-t border-white/60">
                      <td className="p-2">{c.name}</td>
                      <td className="p-2">{c.registerNo}</td>
                      <td className="p-2">{c.year}</td>
                      <td className="p-2 font-mono font-bold">{c.code}</td>
                      <td className="p-2">{c.isUsed ? <span className="text-rose-600">Used</span> : <span className="text-emerald-600">Unused</span>}</td>
                    </tr>
                  ))}
                  {codes.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No codes generated yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </GlassCard>
    </div>
  );
}