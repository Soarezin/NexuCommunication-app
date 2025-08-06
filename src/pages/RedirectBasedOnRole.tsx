// src/pages/RedirectBasedOnRole.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth/useAuth";

export default function RedirectBasedOnRole() {
  const { user } = useAuth();
  const userRole = localStorage.getItem("role");

  if (userRole === "Client") return <Navigate to="/client" replace />;
  return <Navigate to="/dashboard" replace />;
}
