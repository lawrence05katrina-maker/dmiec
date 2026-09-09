import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Shell, GlassCard } from "@/components/Shell";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useFormValidation, rules, compose } from "@/lib/validation";
import { BASE_URL } from "@/config/apiConfig";

export const Route = createFileRoute("/register")({ component: RegisterPage });

// Fields we validate (year is a select with a guaranteed value, so excluded)
type Field = "name" | "registerNo" | "department" | "email" | "password";

function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
    registerNo: "",
    department: "IT",
    year: "1st Year",
  });

  // Build the validation schema using the existing rule helpers
  const schema = useMemo(
    () => ({
      name: rules.required("Full name"),
      registerNo: rules.required("Register number"),
      department: rules.required("Department"),
      email: compose(rules.required("Email"), rules.email()),
      password: compose(
        rules.required("Password"),
        rules.minLength(6)
      ),
    }),
    []
  );

  const { errors, validate, handleChange } = useFormValidation<Field>(schema);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Run all-field validation; abort if any field fails
    if (!validate(f)) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: f.name,
          registerNo: f.registerNo,
          department: f.department,
          year: f.year,
          email: f.email,
          password: f.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.message || "Registration failed");
        return;
      }

      // Store token if the API returns one, so the user is logged in immediately
      if (data?.token) {
        localStorage.setItem("admin_token", data.token);
      }

      toast.success("Account created!");
      router.navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error("Could not reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper: return the border class for a field
  const inputClass = (field: Field) =>
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  return (
    <Shell>
      <div className="max-w-md mx-auto">
        <GlassCard tint="plain" className="p-8">
          <h1 className="text-2xl font-bold">Create student account</h1>
          <form className="mt-5 space-y-3" onSubmit={submit}>

            {/* Full name */}
            <div>
              <Label>
                Full name<span style={{ color: "red" }}>*</span>
              </Label>
              <Input
                value={f.name}
                className={inputClass("name")}
                onChange={(e) => {
                  setF({ ...f, name: e.target.value });
                  handleChange("name");
                }}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Register number */}
            <div>
              <Label>
                Register number<span style={{ color: "red" }}>*</span>
              </Label>
              <Input
                value={f.registerNo}
                className={inputClass("registerNo")}
                onChange={(e) => {
                  setF({ ...f, registerNo: e.target.value });
                  handleChange("registerNo");
                }}
              />
              {errors.registerNo && (
                <p className="mt-1 text-xs text-red-500">{errors.registerNo}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <Label>
                Department<span style={{ color: "red" }}>*</span>
              </Label>
              <Input
                value={f.department}
                className={inputClass("department")}
                onChange={(e) => {
                  setF({ ...f, department: e.target.value });
                  handleChange("department");
                }}
              />
              {errors.department && (
                <p className="mt-1 text-xs text-red-500">{errors.department}</p>
              )}
            </div>

            {/* Year — always has a value, no validation needed */}
            <div>
              <Label>
                Year<span style={{ color: "red" }}>*</span>
              </Label>
              <select
                value={f.year}
                onChange={(e) => setF({ ...f, year: e.target.value })}
                className="w-full rounded-md border px-3 py-2 text-sm bg-white outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
              >
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <Label>
                Email<span style={{ color: "red" }}>*</span>
              </Label>
              <Input
                type="email"
                value={f.email}
                className={inputClass("email")}
                onChange={(e) => {
                  setF({ ...f, email: e.target.value });
                  handleChange("email");
                }}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label>
                Password<span style={{ color: "red" }}>*</span>
              </Label>
              <PasswordInput
                value={f.password}
                className={inputClass("password")}
                onChange={(e) => {
                  setF({ ...f, password: e.target.value });
                  handleChange("password");
                }}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </GlassCard>
      </div>
    </Shell>
  );
}