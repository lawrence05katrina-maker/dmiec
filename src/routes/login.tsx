import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, GlassCard } from "@/components/Shell";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BASE_URL } from "@/config/apiConfig";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "student" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.message || data?.msg || "Login failed");
        return;
      }

      setSession({ ...data.student, role: "student" }, data.token);
      toast.success("Welcome back!");
      router.navigate({ to: "/dashboard" });
    } catch {
      toast.error("Could not reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="max-w-md mx-auto">
        <GlassCard tint="plain" className="p-8">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access your DMI IT account.
          </p>
          <form className="mt-5 space-y-4" onSubmit={submit}>
            <div>
              <Label>
                Email<span style={{ color: "red" }}>*</span>
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>
                Password<span style={{ color: "red" }}>*</span>
              </Label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </GlassCard>
      </div>
    </Shell>
  );
}