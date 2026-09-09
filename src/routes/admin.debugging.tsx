import { createFileRoute } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { CodingProblem } from "@/lib/types";
import { Trash2, Plus, Eye, EyeOff, X } from "lucide-react";
import { BASE_URL } from "@/config/apiConfig";

export const Route = createFileRoute("/admin/debugging")({ component: () => <Guard role="admin"><DAdmin /></Guard> });

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function emptyProblem(): CodingProblem {
  return {
    id: "",
    title: "",
    description: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    difficulty: "Easy",
    category: "Debugging",
    marks: 20,
    samples: [{ input: "", expected: "" }],
    hiddenTests: [],
    isHidden: false,
    referenceSolution: "",
  };
}

function DAdmin() {
  const [items, setItems] = useState<CodingProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CodingProblem | null>(null);
  const debugs = items.filter((p) => p.category.toLowerCase() === "debugging");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/problems`, { headers: authHeaders(), cache: "no-store" });
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
      toast.success(data.isHidden ? "Hidden from students" : "Visible to students");
    } catch {
      toast.error("Could not reach server");
    }
  }

  if (loading) return <Shell><div className="text-sm text-muted-foreground">Loading...</div></Shell>;

  return (
    <Shell>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Manage Debugging</h1>
        <Button onClick={() => setEditing(emptyProblem())}><Plus className="h-4 w-4" /> New</Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">Create and edit debugging challenges — description, format, constraints, sample tests, and reference solution.</p>

      <div className="mt-6 space-y-3">
        {debugs.map((p) => (
          <GlassCard key={p.id} tint="plain" className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex-1 min-w-64">
              <div className="font-semibold">{p.title || "(untitled)"}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {p.difficulty} · {p.marks}pts · {(p.samples || []).length} sample(s)
                {p.isHidden && <span className="ml-2 px-2 py-0.5 rounded-full bg-pastel-yellow">Hidden</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setEditing(p)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => toggleHide(p.id)} title={p.isHidden ? "Show" : "Hide"}>
                {p.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => del(p.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </GlassCard>
        ))}
        {debugs.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">No debugging tasks yet.</div>}
      </div>

      {editing && <ProblemEditor initial={editing} onCancel={() => setEditing(null)} onSave={save} />}
    </Shell>
  );
}

function ProblemEditor({ initial, onCancel, onSave }: { initial: CodingProblem; onCancel: () => void; onSave: (p: CodingProblem) => void }) {
  const [p, setP] = useState<CodingProblem>({
    ...initial,
    samples: initial.samples || [{ input: "", expected: "" }],
    hiddenTests: initial.hiddenTests || [],
  });

  const samples = p.samples || [];
  const hiddenTests = p.hiddenTests || [];

  function updateSample(i: number, field: "input" | "expected", value: string) {
    const next = [...samples];
    next[i] = { ...next[i], [field]: value };
    setP({ ...p, samples: next });
  }
  function addSample() { setP({ ...p, samples: [...samples, { input: "", expected: "" }] }); }
  function removeSample(i: number) { setP({ ...p, samples: samples.filter((_, x) => x !== i) }); }

  function updateHidden(i: number, field: "input" | "expected", value: string) {
    const next = [...hiddenTests];
    next[i] = { ...next[i], [field]: value };
    setP({ ...p, hiddenTests: next });
  }
  function addHidden() { setP({ ...p, hiddenTests: [...hiddenTests, { input: "", expected: "" }] }); }
  function removeHidden(i: number) { setP({ ...p, hiddenTests: hiddenTests.filter((_, x) => x !== i) }); }

  function handleSave() {
    if (!p.title.trim()) { toast.error("Title is required"); return; }
    if (!p.description.trim()) { toast.error("Description is required"); return; }
    if (samples.some((s) => !s.input.trim() && !s.expected.trim())) {
      toast.error("Remove empty sample test cases or fill them in");
      return;
    }
    onSave({ ...p, samples, hiddenTests });
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4 overflow-y-auto">
      <GlassCard tint="plain" className="max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold">{initial.id ? "Edit" : "New"} Debugging Task</h2>

        <div className="grid gap-3 sm:grid-cols-2 mt-4">
          <div className="sm:col-span-2">
            <label className="text-xs">Title</label>
            <Input value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} placeholder="e.g. Debug the Loop" />
          </div>
          <div>
            <label className="text-xs">Difficulty</label>
            <select
              value={p.difficulty}
              onChange={(e) => setP({ ...p, difficulty: e.target.value as CodingProblem["difficulty"] })}
              className="w-full rounded-md border px-3 py-2 text-sm bg-white"
            >
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
          </div>
          <div>
            <label className="text-xs">Marks</label>
            <Input type="number" value={p.marks} onChange={(e) => setP({ ...p, marks: Number(e.target.value) })} />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs">Description</label>
          <textarea
            value={p.description}
            onChange={(e) => setP({ ...p, description: e.target.value })}
            className="w-full rounded-md border px-3 py-2 text-sm bg-white min-h-24"
            placeholder="Given an integer N, print the sum of numbers 1..N. (Fix the classic off-by-one in your solution!)"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mt-3">
          <div>
            <label className="text-xs">Input format</label>
            <textarea
              value={p.inputFormat}
              onChange={(e) => setP({ ...p, inputFormat: e.target.value })}
              className="w-full rounded-md border px-3 py-2 text-sm bg-white min-h-16"
              placeholder="A single integer N."
            />
          </div>
          <div>
            <label className="text-xs">Output format</label>
            <textarea
              value={p.outputFormat}
              onChange={(e) => setP({ ...p, outputFormat: e.target.value })}
              className="w-full rounded-md border px-3 py-2 text-sm bg-white min-h-16"
              placeholder="The sum 1+2+...+N."
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="text-xs">Constraints</label>
          <Input value={p.constraints} onChange={(e) => setP({ ...p, constraints: e.target.value })} placeholder="1 <= N <= 10000" />
        </div>

        <div className="mt-3">
          <label className="text-xs">Starter code / buggy code shown to student</label>
          <textarea
            value={p.referenceSolution}
            onChange={(e) => setP({ ...p, referenceSolution: e.target.value })}
            className="w-full rounded-md border px-3 py-2 text-sm bg-white min-h-32 font-mono"
            placeholder={"# read input with input()\ndata = input()\nprint(data)"}
          />
          <div className="text-xs text-muted-foreground mt-1">This is the code pre-loaded into the editor for students to fix.</div>
        </div>

        <div className="mt-5">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">Sample test cases (visible to students)</h3>
            <Button size="sm" variant="secondary" onClick={addSample}>Add sample</Button>
          </div>
          <div className="mt-2 space-y-2">
            {samples.map((s, i) => (
              <div key={i} className="flex gap-2 items-start border rounded-lg p-3 bg-white/60">
                <div className="flex-1">
                  <label className="text-xs">Input</label>
                  <Input value={s.input} onChange={(e) => updateSample(i, "input", e.target.value)} placeholder="10" />
                </div>
                <div className="flex-1">
                  <label className="text-xs">Expected</label>
                  <Input value={s.expected} onChange={(e) => updateSample(i, "expected", e.target.value)} placeholder="55" />
                </div>
                <Button size="sm" variant="ghost" className="mt-4" onClick={() => removeSample(i)}><X className="h-3 w-3" /></Button>
              </div>
            ))}
            {samples.length === 0 && <div className="text-xs text-muted-foreground">No sample tests yet — add at least one.</div>}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">Hidden test cases (used for grading only)</h3>
            <Button size="sm" variant="secondary" onClick={addHidden}>Add hidden test</Button>
          </div>
          <div className="mt-2 space-y-2">
            {hiddenTests.map((s, i) => (
              <div key={i} className="flex gap-2 items-start border rounded-lg p-3 bg-white/60">
                <div className="flex-1">
                  <label className="text-xs">Input</label>
                  <Input value={s.input} onChange={(e) => updateHidden(i, "input", e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="text-xs">Expected</label>
                  <Input value={s.expected} onChange={(e) => updateHidden(i, "expected", e.target.value)} />
                </div>
                <Button size="sm" variant="ghost" className="mt-4" onClick={() => removeHidden(i)}><X className="h-3 w-3" /></Button>
              </div>
            ))}
            {hiddenTests.length === 0 && <div className="text-xs text-muted-foreground">No hidden tests yet — students will only be graded on samples.</div>}
          </div>
        </div>

        <div className="mt-5 flex gap-2 justify-end">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save Task</Button>
        </div>
      </GlassCard>
    </div>
  );
}