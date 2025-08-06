import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth/useAuth";
import type { ReactNode } from "react";

type UserRole = "Admin" | "Lawyer" | "Paralegal" | "Client";

interface ProtectedRouteByRoleProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export default function ProtectedRouteByRole({
  children,
  allowedRoles,
}: ProtectedRouteByRoleProps) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div>Carregando autenticação...</div>;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    // Corrigido o redirecionamento do cliente
    if (user.role === "Client") return <Navigate to="/client" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
