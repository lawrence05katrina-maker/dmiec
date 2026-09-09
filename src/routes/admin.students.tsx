import { createFileRoute } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BASE_URL } from "@/config/apiConfig";
import { Search } from "lucide-react";

export const Route = createFileRoute("/admin/students")({ component: () => <Guard role="admin"><AdminStudents /></Guard> });

type StudentRow = { id: string; name: string; email: string; registerNo: string; department: string; year: string; password: string };

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return { Authorization: `Bearer ${token}` };
}

function AdminStudents() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load(query = "") {
    setLoading(true);
    try {
      const url = query
        ? `${BASE_URL}/api/admin/students?search=${encodeURIComponent(query)}`
        : `${BASE_URL}/api/admin/students`;
      const res = await fetch(url, { headers: authHeaders(), cache: "no-store" });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.message || "Failed to load students"); return; }
      setStudents(data);
    } catch {
      toast.error("Could not reach server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <Shell>
      <h1 className="text-3xl font-bold">Registered Students</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Look up a student's name, email, register number, department, year, and password — useful when someone loses their login details.
        This information is only visible to admin.
      </p>

      <div className="mt-4 relative max-w-sm">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or register no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white/80"
        />
      </div>

      <GlassCard tint="plain" className="mt-6 overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/60">
              <tr className="text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Register No</th>
                <th className="p-3">Department</th>
                <th className="p-3">Year</th>
                <th className="p-3">Password</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-white/60">
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">{s.registerNo}</td>
                  <td className="p-3">{s.department}</td>
                  <td className="p-3">{s.year}</td>
                  <td className="p-3 font-mono">{s.password}</td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No students found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </GlassCard>
    </Shell>
  );
}