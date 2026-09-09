import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import type { ReactNode } from "react";

export function Guard({ role, children }: { role: "student" | "admin"; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== role) return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} />;
  return <>{children}</>;
}