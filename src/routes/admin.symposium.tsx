import { createFileRoute } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, Users, Download, TrendingUp, FileText, Mail, Phone, Award, Calendar, ExternalLink, Utensils, MessageSquare } from "lucide-react";
import { BASE_URL } from "@/config/apiConfig";

export const Route = createFileRoute("/admin/symposium")({ 
  component: () => <Guard role="admin"><AdminSymposium /></Guard> 
});

type SymposiumRegistration = {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  year: string;
  food: "veg" | "nonveg";
  events: string[];
  paperMode?: "online" | "offline";
  paperTeamName?: string;
  pptLink?: string;
  paperTeamMembers?: [string, string, string];
  projectTeamMembers?: [string, string, string];
  referralCode: string;
  referredBy?: string;
  utr: string;
  fee: number;
  paymentScreenshot?: string;
  verified: boolean;
  registeredAt: string;
};

type ReferralStats = {
  code: string;
  ownerName: string;
  ownerEmail: string;
  referralsCount: number;
  totalEarnings: number;
  referrals: Array<{
    name: string;
    email: string;
    registeredAt: string;
  }>;
};

type SupportQuery = {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationId?: string;
  issueType: "payment" | "registration" | "technical" | "other";
  subject: string;
  description: string;
  status: "pending" | "in-progress" | "resolved";
  submittedAt: string;
  resolvedAt?: string;
};

const TECHNICAL_EVENTS = ["Paper Presentation", "Project Expo", "Website Creation", "Debugging", "Quiz"];
const NON_TECHNICAL_EVENTS = ["Meme Creation", "Prompt Battle", "Imposter Game", "BGM Finding"];
const ALL_EVENTS = [...TECHNICAL_EVENTS, ...NON_TECHNICAL_EVENTS];

function AdminSymposium() {
  const [registrations, setRegistrations] = useState<SymposiumRegistration[]>([]);
  const [queries, setQueries] = useState<SupportQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEvent, setFilterEvent] = useState<string>("all");
  const [paperSubFilter, setPaperSubFilter] = useState<"all" | "online" | "offline">("all");
  const [view, setView] = useState<"overview" | "registrations" | "payments" | "referrals" | "food" | "queries">("overview");
  const [referralStats, setReferralStats] = useState<ReferralStats[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        throw new Error("No auth token found");
      }

      const [regsRes, queriesRes] = await Promise.all([
        fetch(`${BASE_URL}/api/admin/symposium/registrations`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/api/admin/symposium/support`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!regsRes.ok) {
        throw new Error("Failed to fetch registrations");
      }
      if (!queriesRes.ok) {
        throw new Error("Failed to fetch support queries");
      }

      const regsData = await regsRes.json();
      const queriesData = await queriesRes.json();

      setRegistrations(regsData);
      setQueries(queriesData);
      calculateReferralStats(regsData);
    } catch (err: any) {
      toast.error(err.message || "Failed to load data");
      console.error("Load data error:", err);
    } finally {
      setLoading(false);
    }
  }

  function calculateReferralStats(regs: SymposiumRegistration[]) {
    const statsMap = new Map<string, ReferralStats>();
    
    regs.forEach(reg => {
      if (reg.referredBy) {
        const referrer = regs.find(r => r.referralCode === reg.referredBy);
        if (referrer) {
          if (!statsMap.has(reg.referredBy)) {
            statsMap.set(reg.referredBy, {
              code: reg.referredBy,
              ownerName: referrer.name,
              ownerEmail: referrer.email,
              referralsCount: 0,
              totalEarnings: 0,
              referrals: [],
            });
          }
          const stat = statsMap.get(reg.referredBy)!;
          stat.referralsCount++;
          stat.totalEarnings += 10;
          stat.referrals.push({
            name: reg.name,
            email: reg.email,
            registeredAt: reg.registeredAt,
          });
        }
      }
    });
    
    setReferralStats(Array.from(statsMap.values()).sort((a, b) => b.totalEarnings - a.totalEarnings));
  }

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = search === "" || 
      reg.name.toLowerCase().includes(search.toLowerCase()) ||
      reg.email.toLowerCase().includes(search.toLowerCase()) ||
      reg.phone.includes(search) ||
      reg.college.toLowerCase().includes(search.toLowerCase()) ||
      reg.referralCode.toLowerCase().includes(search.toLowerCase());
    
    let matchesEvent = filterEvent === "all" || reg.events.includes(filterEvent);
    
    // Apply Paper Presentation sub-filter for online/offline
    if (filterEvent === "Paper Presentation" && paperSubFilter !== "all") {
      matchesEvent = matchesEvent && reg.paperMode === paperSubFilter;
    }
    
    return matchesSearch && matchesEvent;
  }).sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime()); // Sort by registration time

  const totalRegistrations = registrations.length;
  const totalRevenue = registrations.reduce((sum, r) => sum + r.fee, 0);
  const verifiedCount = registrations.filter(r => r.verified).length;
  const eventStats = ALL_EVENTS.map(event => ({
    name: event,
    count: registrations.filter(r => r.events.includes(event)).length,
    isTechnical: TECHNICAL_EVENTS.includes(event),
  }));

  function exportToCSV() {
    const headers = ["S.No", "Name", "Email", "Phone", "College", "Department", "Year", "Food", "Events", "Paper Mode", "Paper Team Name", "Paper Team Member 1", "Paper Team Member 2", "Paper Team Member 3", "Project Team Member 1", "Project Team Member 2", "Project Team Member 3", "PPT Link", "Referral Code", "Referred By", "UTR", "Fee", "Verified", "Registered At"];
    const rows = filteredRegistrations.map((r, index) => [
      index + 1, // S.No based on registration order
      r.name,
      r.email,
      r.phone,
      r.college,
      r.department,
      r.year,
      r.food,
      r.events.join("; "),
      r.paperMode || "N/A",
      r.paperTeamName || "N/A",
      r.paperTeamMembers?.[0] || "N/A",
      r.paperTeamMembers?.[1] || "N/A",
      r.paperTeamMembers?.[2] || "N/A",
      r.projectTeamMembers?.[0] || "N/A",
      r.projectTeamMembers?.[1] || "N/A",
      r.projectTeamMembers?.[2] || "N/A",
      r.pptLink || "N/A",
      r.referralCode,
      r.referredBy || "None",
      r.utr,
      r.fee,
      r.verified ? "Yes" : "No",
      new Date(r.registeredAt).toLocaleString(),
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `symposium-registrations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  }

  async function toggleVerification(id: string, currentStatus: boolean) {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        throw new Error("No auth token found");
      }

      const res = await fetch(`${BASE_URL}/api/admin/symposium/verify/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update verification status");
      }

      const data = await res.json();
      
      setRegistrations(prev => 
        prev.map(r => r.id === id ? { ...r, verified: data.verified } : r)
      );
      toast.success(data.verified ? "Payment verified successfully" : "Payment marked as unverified");
    } catch (err: any) {
      toast.error(err.message || "Failed to update verification status");
      console.error("Toggle verification error:", err);
    }
  }

  async function updateQueryStatus(queryId: string, newStatus: SupportQuery["status"]) {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        throw new Error("No auth token found");
      }

      const res = await fetch(`${BASE_URL}/api/admin/symposium/support/${queryId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update query status");
      }

      const data = await res.json();
      
      setQueries(prev =>
        prev.map(q =>
          q.id === queryId
            ? { ...q, status: data.status, resolvedAt: data.status === "resolved" ? new Date().toISOString() : undefined }
            : q
        )
      );
      toast.success(`Query status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update query status");
      console.error("Update query status error:", err);
    }
  }

  return (
    <Shell>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-7 w-7" />
          <h1 className="text-3xl font-bold">Symposium Registrations</h1>
        </div>
        <Button variant="secondary" onClick={exportToCSV} disabled={registrations.length === 0}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        Manage InfoVerse26 event registrations, track referrals, and view participant details
      </p>

      {/* View Tabs */}
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setView("overview")}
          className={`px-3 py-1.5 rounded-full text-sm ${
            view === "overview" ? "bg-foreground text-background" : "bg-white/70"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setView("registrations")}
          className={`px-3 py-1.5 rounded-full text-sm ${
            view === "registrations" ? "bg-foreground text-background" : "bg-white/70"
          }`}
        >
          All Registrations
        </button>
        <button
          onClick={() => setView("payments")}
          className={`px-3 py-1.5 rounded-full text-sm ${
            view === "payments" ? "bg-foreground text-background" : "bg-white/70"
          }`}
        >
          Payment Verification
        </button>
        <button
          onClick={() => setView("referrals")}
          className={`px-3 py-1.5 rounded-full text-sm ${
            view === "referrals" ? "bg-foreground text-background" : "bg-white/70"
          }`}
        >
          Referrals & Earnings
        </button>
        <button
          onClick={() => setView("food")}
          className={`px-3 py-1.5 rounded-full text-sm ${
            view === "food" ? "bg-foreground text-background" : "bg-white/70"
          }`}
        >
          Food Preferences
        </button>
        <button
          onClick={() => setView("queries")}
          className={`px-3 py-1.5 rounded-full text-sm ${
            view === "queries" ? "bg-foreground text-background" : "bg-white/70"
          }`}
        >
          Support Queries
        </button>
      </div>

      {/* Overview */}
      {view === "overview" && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard tint="plain" className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Registrations</p>
                  <p className="text-3xl font-bold mt-1">{totalRegistrations}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground/30" />
              </div>
            </GlassCard>

            <GlassCard tint="plain" className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold mt-1">₹{totalRevenue}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground/30" />
              </div>
            </GlassCard>

            <GlassCard tint="plain" className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verified Payments</p>
                  <p className="text-3xl font-bold mt-1">{verifiedCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">{totalRegistrations - verifiedCount} pending</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground/30" />
              </div>
            </GlassCard>

            <GlassCard tint="plain" className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Referral Earnings</p>
                  <p className="text-3xl font-bold mt-1">₹{referralStats.reduce((sum, r) => sum + r.totalEarnings, 0)}</p>
                  <p className="text-xs text-muted-foreground mt-1">To be settled</p>
                </div>
                <Award className="h-8 w-8 text-muted-foreground/30" />
              </div>
            </GlassCard>
          </div>

          <GlassCard tint="plain" className="p-6">
            <h2 className="text-xl font-bold mb-4">Event-wise Registrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide text-muted-foreground">Technical Events</h3>
                <div className="space-y-2">
                  {eventStats.filter(e => e.isTechnical).map(event => (
                    <div key={event.name} className="flex items-center justify-between p-3 bg-white/50 rounded border border-white/60">
                      <span className="text-sm font-medium">{event.name}</span>
                      <span className="text-lg font-bold">{event.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide text-muted-foreground">Non-Technical Events</h3>
                <div className="space-y-2">
                  {eventStats.filter(e => !e.isTechnical).map(event => (
                    <div key={event.name} className="flex items-center justify-between p-3 bg-white/50 rounded border border-white/60">
                      <span className="text-sm font-medium">{event.name}</span>
                      <span className="text-lg font-bold">{event.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* All Registrations */}
      {view === "registrations" && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, college..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white/80"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setFilterEvent("all")}
              className={`px-3 py-1.5 rounded-full text-sm ${filterEvent === "all" ? "bg-foreground text-background" : "bg-white/70"}`}
            >
              All Events
            </button>
            <span className="text-xs text-muted-foreground">Technical:</span>
            {TECHNICAL_EVENTS.map(event => (
              <button
                key={event}
                onClick={() => {
                  setFilterEvent(event);
                  setPaperSubFilter("all");
                }}
                className={`px-3 py-1.5 rounded-full text-sm ${filterEvent === event ? "bg-foreground text-background" : "bg-white/70"}`}
              >
                {event}
              </button>
            ))}
            <span className="text-xs text-muted-foreground ml-2">Non-Technical:</span>
            {NON_TECHNICAL_EVENTS.map(event => (
              <button
                key={event}
                onClick={() => {
                  setFilterEvent(event);
                  setPaperSubFilter("all");
                }}
                className={`px-3 py-1.5 rounded-full text-sm ${filterEvent === event ? "bg-foreground text-background" : "bg-white/70"}`}
              >
                {event}
              </button>
            ))}
          </div>

          {/* Paper Presentation Sub-Filter */}
          {filterEvent === "Paper Presentation" && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium">Paper Presentation Mode:</span>
              <button
                onClick={() => setPaperSubFilter("all")}
                className={`px-3 py-1.5 rounded-full text-sm ${paperSubFilter === "all" ? "bg-foreground text-background" : "bg-white/70"}`}
              >
                All
              </button>
              <button
                onClick={() => setPaperSubFilter("offline")}
                className={`px-3 py-1.5 rounded-full text-sm ${paperSubFilter === "offline" ? "bg-foreground text-background" : "bg-white/70"}`}
              >
                Offline
              </button>
              <button
                onClick={() => setPaperSubFilter("online")}
                className={`px-3 py-1.5 rounded-full text-sm ${paperSubFilter === "online" ? "bg-foreground text-background" : "bg-white/70"}`}
              >
                Online
              </button>
            </div>
          )}

          {/* Project Expo Sub-Filter - REMOVED (Project Expo is offline only) */}

          <GlassCard tint="plain" className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/60">
                <tr className="text-left">
                  <th className="p-3">S.No</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">College</th>
                  <th className="p-3">Events</th>
                  <th className="p-3">Team Members</th>
                  <th className="p-3">Referral</th>
                  <th className="p-3">Fee & Registered</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
                ) : filteredRegistrations.length === 0 ? (
                  <tr><td colSpan={10} className="p-6 text-center text-muted-foreground">No registrations found.</td></tr>
                ) : (
                  filteredRegistrations.map((reg, index) => (
                    <tr key={reg.id} className="border-t border-white/60">
                      <td className="p-3 font-bold text-muted-foreground">{index + 1}</td>
                      <td className="p-3">
                        <div className="font-medium">{reg.name}</div>
                        <div className="text-xs text-muted-foreground">{reg.department} · {reg.year}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-xs">{reg.email}</div>
                        <div className="text-xs text-muted-foreground">{reg.phone}</div>
                      </td>
                      <td className="p-3 text-xs">{reg.college}</td>
                      <td className="p-3">
                        {reg.events.map(e => (
                          <div key={e} className="text-xs px-2 py-0.5 bg-foreground/10 rounded inline-block mr-1 mb-1">{e}</div>
                        ))}
                        {reg.paperMode && <div className="text-xs text-muted-foreground mt-1">Paper: {reg.paperMode}</div>}
                      </td>
                      <td className="p-3">
                        {reg.events.includes("Paper Presentation") && reg.paperTeamMembers ? (
                          <div className="text-xs space-y-0.5">
                            {reg.paperTeamName && (
                              <div className="font-semibold text-[#FF0000] mb-1">
                                Team: {reg.paperTeamName}
                              </div>
                            )}
                            {reg.paperTeamMembers.map((m, i) => <div key={i}>• {m}</div>)}
                            {reg.events.includes("Paper Presentation") && reg.pptLink && (
                              <a
                                href={reg.pptLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1"
                              >
                                View PPT <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        ) : reg.events.includes("Project Expo") && reg.projectTeamMembers ? (
                          <div className="text-xs space-y-0.5">
                            {reg.projectTeamMembers.map((m, i) => <div key={i}>• {m}</div>)}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="text-xs font-mono">{reg.referralCode}</div>
                        {reg.referredBy && <div className="text-xs text-muted-foreground">By: {reg.referredBy}</div>}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold">Rs. {reg.fee}</div>
                        <div className="text-xs text-muted-foreground font-mono">{reg.utr}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {new Date(reg.registeredAt).toLocaleString('en-IN', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${reg.verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {reg.verified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleVerification(reg.id, reg.verified)}
                          className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${reg.verified ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                        >
                          {reg.verified ? "Unverify" : "Verify"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </GlassCard>
        </div>
      )}

      {/* Payment Verification */}
      {view === "payments" && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">Review payment screenshots and UTR numbers before verification.</p>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterEvent("all")}
              className={`px-3 py-1.5 rounded-full text-sm ${filterEvent === "all" ? "bg-foreground text-background" : "bg-white/70"}`}
            >
              All ({registrations.length})
            </button>
            <button
              onClick={() => setFilterEvent("pending")}
              className={`px-3 py-1.5 rounded-full text-sm ${filterEvent === "pending" ? "bg-foreground text-background" : "bg-white/70"}`}
            >
              Pending ({registrations.filter(r => !r.verified).length})
            </button>
            <button
              onClick={() => setFilterEvent("verified")}
              className={`px-3 py-1.5 rounded-full text-sm ${filterEvent === "verified" ? "bg-foreground text-background" : "bg-white/70"}`}
            >
              Verified ({registrations.filter(r => r.verified).length})
            </button>
          </div>

          <GlassCard tint="plain" className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/60">
                <tr className="text-left">
                  <th className="p-3">S.No</th>
                  <th className="p-3">Participant</th>
                  <th className="p-3">Events</th>
                  <th className="p-3">Amount & UTR</th>
                  <th className="p-3">Screenshot</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {registrations
                  .filter(reg => {
                    if (filterEvent === "pending") return !reg.verified;
                    if (filterEvent === "verified") return reg.verified;
                    return true;
                  })
                  .sort((a, b) => {
                    // Sort by verification status first (pending before verified)
                    if (a.verified !== b.verified) {
                      return a.verified ? 1 : -1;
                    }
                    // Then sort by registration time within each group (newest first)
                    return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime();
                  })
                  .map((reg, index) => (
                    <tr key={reg.id} className="border-t border-white/60">
                      <td className="p-3 font-bold text-muted-foreground">{index + 1}</td>
                      <td className="p-3">
                        <div className="font-medium">{reg.name}</div>
                        <div className="text-xs text-muted-foreground">{reg.email}</div>
                        <div className="text-xs text-muted-foreground">{reg.phone}</div>
                        <div className="text-xs text-muted-foreground mt-1">{reg.college}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Registered: {new Date(reg.registeredAt).toLocaleString('en-IN', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </td>
                      <td className="p-3">
                        {reg.events.map(e => (
                          <div key={e} className="text-xs px-2 py-0.5 bg-foreground/10 rounded inline-block mr-1 mb-1">{e}</div>
                        ))}
                        {reg.paperMode && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Paper: {reg.paperMode} (Rs. {reg.paperMode === "online" ? "175" : "200"})
                          </div>
                        )}
                        {reg.events.includes("Paper Presentation") && reg.paperTeamMembers && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Paper Team: {reg.paperTeamMembers.join(", ")}
                          </div>
                        )}
                        {reg.events.includes("Paper Presentation") && reg.pptLink && (
                          <a
                            href={reg.pptLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            View PPT <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {reg.events.includes("Project Expo") && reg.projectTeamMembers && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Project Team: {reg.projectTeamMembers.join(", ")}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="text-2xl font-bold">Rs. {reg.fee}</div>
                        <div className="text-xs font-mono text-muted-foreground mt-1">{reg.utr}</div>
                      </td>
                      <td className="p-3">
                        {reg.paymentScreenshot ? (
                          <a
                            href={`${BASE_URL}${reg.paymentScreenshot}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            View Screenshot <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">No screenshot</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${reg.verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {reg.verified ? "✓ Verified" : "⏳ Pending"}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleVerification(reg.id, reg.verified)}
                          className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${reg.verified ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                        >
                          {reg.verified ? "Unverify" : "Verify Payment"}
                        </button>
                      </td>
                    </tr>
                  ))}
                {registrations.filter(reg => {
                  if (filterEvent === "pending") return !reg.verified;
                  if (filterEvent === "verified") return reg.verified;
                  return true;
                }).length === 0 && (
                  <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No payments to display</td></tr>
                )}
              </tbody>
            </table>
          </GlassCard>
        </div>
      )}

      {/* Referrals */}
      {view === "referrals" && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Total referrals: <strong>{referralStats.reduce((sum, r) => sum + r.referralsCount, 0)}</strong> • 
            Total to settle: <strong>Rs. {referralStats.reduce((sum, r) => sum + r.totalEarnings, 0)}</strong>
          </p>

          <GlassCard tint="plain" className="overflow-hidden">
            {loading ? (
              <div className="p-6 text-sm text-muted-foreground">Loading...</div>
            ) : referralStats.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No referrals yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-white/60">
                  <tr className="text-left">
                    <th className="p-3">S.No</th>
                    <th className="p-3">Referrer</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Referrals</th>
                    <th className="p-3">Earnings</th>
                    <th className="p-3">Referred Participants</th>
                  </tr>
                </thead>
                <tbody>
                  {referralStats.map((stat, index) => (
                    <tr key={stat.code} className="border-t border-white/60">
                      <td className="p-3 font-bold text-muted-foreground">{index + 1}</td>
                      <td className="p-3">
                        <div className="font-medium">{stat.ownerName}</div>
                        <div className="text-xs text-muted-foreground">{stat.ownerEmail}</div>
                      </td>
                      <td className="p-3 font-mono text-xs">{stat.code}</td>
                      <td className="p-3 font-bold">{stat.referralsCount}</td>
                      <td className="p-3">
                        <div className="text-2xl font-bold text-green-600">Rs. {stat.totalEarnings}</div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {stat.referrals.map((ref, idx) => (
                            <div key={idx} className="text-xs">
                              <span className="font-medium">{ref.name}</span>
                              <span className="text-muted-foreground"> • {ref.email}</span>
                              <span className="text-muted-foreground"> • {new Date(ref.registeredAt).toLocaleString('en-IN', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </GlassCard>
        </div>
      )}

      {/* Food Preferences */}
      {view === "food" && (
        <div className="mt-6 space-y-6">
          <p className="text-sm text-muted-foreground">
            Food count excludes online Paper Presentation registrations (as they don't attend physically)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Veg Section */}
            <GlassCard tint="plain" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Utensils className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-bold text-green-600">Vegetarian</h2>
              </div>
              <div className="text-5xl font-black mb-4">
                {registrations.filter(r => r.food === "veg" && !(r.paperMode === "online")).length}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Total vegetarian meals required
              </p>
              <div className="border-t border-white/60 pt-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {registrations
                    .filter(r => r.food === "veg" && !(r.paperMode === "online"))
                    .sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime())
                    .map((reg, index) => (
                      <div key={reg.id} className="flex items-start justify-between p-2 bg-green-50 rounded text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{index + 1}. {reg.name}</div>
                          <div className="text-xs text-muted-foreground">{reg.college}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{reg.phone}</div>
                      </div>
                    ))}
                  {registrations.filter(r => r.food === "veg" && !(r.paperMode === "online")).length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      No vegetarian preferences yet
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Non-Veg Section */}
            <GlassCard tint="plain" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Utensils className="h-6 w-6 text-red-600" />
                <h2 className="text-xl font-bold text-red-600">Non-Vegetarian</h2>
              </div>
              <div className="text-5xl font-black mb-4">
                {registrations.filter(r => r.food === "nonveg" && !(r.paperMode === "online")).length}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Total non-vegetarian meals required
              </p>
              <div className="border-t border-white/60 pt-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {registrations
                    .filter(r => r.food === "nonveg" && !(r.paperMode === "online"))
                    .sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime())
                    .map((reg, index) => (
                      <div key={reg.id} className="flex items-start justify-between p-2 bg-red-50 rounded text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{index + 1}. {reg.name}</div>
                          <div className="text-xs text-muted-foreground">{reg.college}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{reg.phone}</div>
                      </div>
                    ))}
                  {registrations.filter(r => r.food === "nonveg" && !(r.paperMode === "online")).length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      No non-vegetarian preferences yet
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Summary Card */}
          <GlassCard tint="plain" className="p-6">
            <h2 className="text-xl font-bold mb-4">Food Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/50 rounded border border-white/60">
                <div className="text-sm text-muted-foreground mb-1">Total Participants</div>
                <div className="text-3xl font-bold">{registrations.length}</div>
              </div>
              <div className="p-4 bg-green-50 rounded border border-green-200">
                <div className="text-sm text-green-700 mb-1">Vegetarian</div>
                <div className="text-3xl font-bold text-green-600">
                  {registrations.filter(r => r.food === "veg").length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {registrations.length > 0 
                    ? `${((registrations.filter(r => r.food === "veg").length / registrations.length) * 100).toFixed(1)}%`
                    : "0%"}
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded border border-red-200">
                <div className="text-sm text-red-700 mb-1">Non-Vegetarian</div>
                <div className="text-3xl font-bold text-red-600">
                  {registrations.filter(r => r.food === "nonveg").length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {registrations.length > 0 
                    ? `${((registrations.filter(r => r.food === "nonveg").length / registrations.length) * 100).toFixed(1)}%`
                    : "0%"}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Support Queries */}
      {view === "queries" && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Total queries: <strong>{queries.length}</strong> • 
            Pending: <strong>{queries.filter(q => q.status === "pending").length}</strong> • 
            In Progress: <strong>{queries.filter(q => q.status === "in-progress").length}</strong> • 
            Resolved: <strong>{queries.filter(q => q.status === "resolved").length}</strong>
          </p>

          <GlassCard tint="plain" className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/60">
                <tr className="text-left">
                  <th className="p-3">S.No</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3">User Details</th>
                  <th className="p-3">Issue Type</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
                ) : queries.length === 0 ? (
                  <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">No queries submitted yet.</td></tr>
                ) : (
                  queries
                    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                    .map((query, index) => (
                      <tr key={query.id} className="border-t border-white/60">
                        <td className="p-3 font-bold text-muted-foreground">{index + 1}</td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {new Date(query.submittedAt).toLocaleString('en-IN', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{query.name}</div>
                          <div className="text-xs text-muted-foreground">{query.email}</div>
                          <div className="text-xs text-muted-foreground">{query.phone}</div>
                          {query.registrationId && (
                            <div className="text-xs text-muted-foreground mt-1">Reg: {query.registrationId}</div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            query.issueType === "payment" ? "bg-blue-100 text-blue-700" :
                            query.issueType === "registration" ? "bg-purple-100 text-purple-700" :
                            query.issueType === "technical" ? "bg-orange-100 text-orange-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {query.issueType.charAt(0).toUpperCase() + query.issueType.slice(1)}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs">
                          <div className="font-medium text-sm">{query.subject}</div>
                        </td>
                        <td className="p-3 max-w-md">
                          <div className="text-xs text-muted-foreground line-clamp-3">{query.description}</div>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            query.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                            query.status === "in-progress" ? "bg-blue-100 text-blue-700" :
                            "bg-green-100 text-green-700"
                          }`}>
                            {query.status === "in-progress" ? "In Progress" : query.status.charAt(0).toUpperCase() + query.status.slice(1)}
                          </span>
                          {query.resolvedAt && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(query.resolvedAt).toLocaleString('en-IN', { 
                                day: '2-digit', 
                                month: 'short'
                              })}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <select
                            value={query.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as SupportQuery["status"];
                              updateQueryStatus(query.id, newStatus);
                            }}
                            className="text-xs px-2 py-1.5 border border-white/20 bg-white/10 rounded"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </GlassCard>
        </div>
      )}
    </Shell>
  );
}
