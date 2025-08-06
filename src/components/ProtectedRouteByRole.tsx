// src/components/ProtectedRouteByRole.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth/useAuth";
import type { ReactNode } from "react";

interface ProtectedRouteByRoleProps {
  children: ReactNode;
  allowedRoles: string[];   
}

export default function ProtectedRouteByRole({ children, allowedRoles }: ProtectedRouteByRoleProps) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div>Carregando autenticação...</div>;

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
