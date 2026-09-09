import { createFileRoute } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { CodingProblem, TestCase } from "@/lib/types";
import { Trash2, Plus, Upload, Eye, EyeOff } from "lucide-react";
import { readSheet, rowsToProblems } from "@/lib/excel";
import { BASE_URL } from "@/config/apiConfig";

export const Route = createFileRoute("/admin/problems")({ component: () => <Guard role="admin"><PAdmin /></Guard> });

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function PAdmin() {
  const [items, setItems] = useState<CodingProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CodingProblem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/problems`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.message || "Failed to load problems"); return; }
      setItems(data);
    } catch {
      toast.error("Could not reach server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save(p: CodingProblem) {
    const isNew = !p.id;
    try {
      const res = await fetch(
        isNew ? `${BASE_URL}/api/admin/problems` : `${BASE_URL}/api/admin/problems/${p.id}`,
        { method: isNew ? "POST" : "PUT", headers: authHeaders(), body: JSON.stringify(p) }
      );
      const data = await res.json();
      if (!res.ok) { toast.error(data?.message || "Failed to save"); return; }
      await load();
      setEditing(null);
      toast.success("Saved");
    } catch {
      toast.error("Could not reach server");
    }
  }

  async function del(id: string) {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/problems/${id}`, { method: "DELETE", headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(data?.message || "Failed to delete"); return; }
      setItems(items.filter((x) => x.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Could not reach server");
    }
  }

  async function toggleHide(id: string) {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/problems/${id}/toggle-hide`, { method: "PATCH", headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.message || "Failed to update"); return; }
      setItems(items.map((x) => (x.id === id ? { ...x, isHidden: data.isHidden } : x)));
      toast.success(data.isHidden ? "Problem hidden" : "Problem visible");
    } catch {
      toast.error("Could not reach server");
    }
  }

  async function handleFile(f: File) {
    try {
      const rows = await readSheet(f);
      const parsed = rowsToProblems(rows).filter((p) => p.category.toLowerCase() !== "debugging");
      if (!parsed.length) return toast.error("No valid problems parsed.");
      for (const p of parsed) {
        await fetch(`${BASE_URL}/api/admin/problems`, { method: "POST", headers: authHeaders(), body: JSON.stringify(p) });
      }
      await load();
      toast.success(`Imported ${parsed.length} problems`);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      toast.error("Excel error: " + (e as Error).message);
    }
  }

  if (loading) return <Shell><div className="text-sm text-muted-foreground">Loading...</div></Shell>;

  const visible = items.filter((p) => p.category.toLowerCase() !== "debugging");

  return (
    <Shell>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Manage Problems</h1>
        <div className="flex gap-2 items-center">
          <label className="text-xs flex items-center gap-2 px-3 py-2 rounded-lg bg-pastel-lavender/40 border-2 border-dashed border-pastel-lavender cursor-pointer">
            <Upload className="h-4 w-4" /> Import Excel
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
          </label>
          <Button onClick={() => setEditing({ id: "", title: "", description: "", inputFormat: "", outputFormat: "", constraints: "", difficulty: "Easy", category: "Logic", marks: 10, samples: [{ input: "", expected: "" }], hiddenTests: [], isHidden: false, referenceSolution: "" })}><Plus className="h-4 w-4" /> New</Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">Excel columns: Title | Difficulty | Category | Points | Description | InputFormat | OutputFormat | Constraints | SampleInput | SampleOutput | HiddenTestInput | HiddenTestOutput | ReferenceSolution</p>

      <div className="mt-6 space-y-3">
        {visible.map((p) => (
          <GlassCard key={p.id} tint="plain" className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="font-bold flex items-center gap-2">
                {p.title}
                {p.isHidden && <span className="text-xs px-2 py-0.5 rounded-full bg-pastel-yellow">Hidden</span>}
              </div>
              <div className="text-xs text-muted-foreground">{p.category} · {p.difficulty} · {p.marks}pts · {(p.hiddenTests?.length || 0)} hidden tests</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => toggleHide(p.id)}>{p.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Button>
              <Button size="sm" variant="secondary" onClick={() => setEditing(p)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => del(p.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </GlassCard>
        ))}
      </div>

      {editing && <ProblemEditor initial={editing} onCancel={() => setEditing(null)} onSave={save} />}
    </Shell>
  );
}

function ProblemEditor({ initial, onCancel, onSave }: { initial: CodingProblem; onCancel: () => void; onSave: (p: CodingProblem) => void }) {
  const [p, setP] = useState<CodingProblem>(initial);
  const updTests = (key: "samples" | "hiddenTests", arr: TestCase[]) => setP({ ...p, [key]: arr });
  return (
    <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4 overflow-y-auto">
      <GlassCard tint="plain" className="max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold">{initial.id ? "Edit" : "New"} Problem</h2>
        <div className="grid gap-3 sm:grid-cols-2 mt-4">
          <div><label className="text-xs">Title</label><Input value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} /></div>
          <div><label className="text-xs">Category</label><Input value={p.category} onChange={(e) => setP({ ...p, category: e.target.value })} /></div>
          <div><label className="text-xs">Difficulty</label>
            <select value={p.difficulty} onChange={(e) => setP({ ...p, difficulty: e.target.value as CodingProblem["difficulty"] })} className="w-full rounded-md border px-3 py-2 text-sm bg-white">
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select></div>
          <div><label className="text-xs">Marks</label><Input type="number" value={p.marks} onChange={(e) => setP({ ...p, marks: Number(e.target.value) })} /></div>
        </div>
        <div className="mt-3"><label className="text-xs">Description</label><textarea value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} className="w-full rounded-md border p-2 text-sm min-h-24 bg-white" /></div>
        <div className="grid gap-3 sm:grid-cols-2 mt-3">
          <div><label className="text-xs">Input format</label><Input value={p.inputFormat} onChange={(e) => setP({ ...p, inputFormat: e.target.value })} /></div>
          <div><label className="text-xs">Output format</label><Input value={p.outputFormat} onChange={(e) => setP({ ...p, outputFormat: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="text-xs">Constraints</label><Input value={p.constraints} onChange={(e) => setP({ ...p, constraints: e.target.value })} /></div>
        </div>

        {(["samples", "hiddenTests"] as const).map((key) => (
          <div key={key} className="mt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm">{key === "samples" ? "Sample tests" : "Hidden tests"} ({(p[key] || []).length})</h3>
              <Button size="sm" variant="secondary" onClick={() => updTests(key, [...(p[key] || []), { input: "", expected: "" }])}>Add</Button>
            </div>
            <div className="space-y-2 mt-2">
              {(p[key] || []).map((t, i) => (
                <div key={i} className="grid sm:grid-cols-2 gap-2 border rounded-lg p-2 bg-white/60">
                  <textarea placeholder="Input" value={t.input} onChange={(e) => { const a = [...(p[key] || [])]; a[i] = { ...t, input: e.target.value }; updTests(key, a); }} className="rounded-md border p-2 text-xs font-mono min-h-16 bg-white" />
                  <textarea placeholder="Expected" value={t.expected} onChange={(e) => { const a = [...(p[key] || [])]; a[i] = { ...t, expected: e.target.value }; updTests(key, a); }} className="rounded-md border p-2 text-xs font-mono min-h-16 bg-white" />
                  <div className="sm:col-span-2 flex justify-end"><Button size="sm" variant="ghost" onClick={() => updTests(key, (p[key] || []).filter((_, x) => x !== i))}><Trash2 className="h-3 w-3" /></Button></div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-4">
          <label className="text-xs">Reference solution (revealed to students after they pass all tests)</label>
          <textarea value={p.referenceSolution || ""} onChange={(e) => setP({ ...p, referenceSolution: e.target.value })} className="w-full rounded-md border p-2 text-xs font-mono min-h-32 bg-white" placeholder="// Optional reference solution" />
        </div>

        <div className="mt-5 flex gap-2 justify-end">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onSave(p)}>Save</Button>
        </div>
      </GlassCard>
    </div>
  );
}