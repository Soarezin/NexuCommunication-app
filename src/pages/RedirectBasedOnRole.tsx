import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth/useAuth";

export default function RedirectBasedOnRole() {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando autenticação...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return user.role === "Client"
    ? <Navigate to="/client" replace />
    : <Navigate to="/dashboard" replace />;
}
