// src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/auth/useAuth";

import ProtectedRouteByRole from "./components/ProtectedRouteByRole";
import PrivateRoute from "./components/PrivateRoute";
import RedirectBasedOnRole from "./pages/RedirectBasedOnRole";

import Login from "./pages/login/Login";
import RegisterClientPage from "./pages/login/RegisterClientPage";

import DashboardPage from "./pages/Dashboard";
import SettingsPage from "./pages/settings/SettingsPage";
import LawSuitViewer from "./pages/lawSuits/LawSuitViewer";
import CreateLawsuitPage from "./pages/lawSuits/CreateLawsuitPage";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientPage from "./pages/ClientPage";

import MainLayout from "./layouts/MainLayout";
import ClientLayout from "./layouts/ClientLayout";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" richColors />

        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register-client" element={<RegisterClientPage />} />

          {/* Rotas do CLIENTE (usam ClientLayout) */}
          <Route
            element={
              <ProtectedRouteByRole allowedRoles={["Client"]}>
                <ClientLayout />
              </ProtectedRouteByRole>
            }
          >
            <Route path="/client" element={<ClientDashboard />} />
          </Route>

          {/* Rotas de ADMIN/ADVOGADO (usam MainLayout) */}
          <Route
            element={
              <ProtectedRouteByRole allowedRoles={["Admin", "Lawyer"]}>
                <MainLayout />
              </ProtectedRouteByRole>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/client/:id" element={<ClientPage />} />
            <Route
              path="/client/:clientId/create-lawsuit"
              element={<CreateLawsuitPage />}
            />
            <Route path="/lawsuit/:id" element={<LawSuitViewer />} />
          </Route>

          {/* Redirecionamento inicial com base na role */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <RedirectBasedOnRole />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
