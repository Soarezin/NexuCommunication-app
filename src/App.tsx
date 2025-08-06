// src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import LawSuitViewer from "./pages/lawSuits/LawSuitViewer";
import ClientDashboard from "./pages/client/ClientDashboard";
import DashboardPage from "./pages/Dashboard";
import SettingsPage from "./pages/settings/SettingsPage";
import Login from "./pages/login/Login";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/auth/useAuth";
import CreateLawsuitPage from "./pages/lawSuits/CreateLawsuitPage";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import ProtectedRouteByRole from "./components/ProtectedRouteByRole";
import RedirectBasedOnRole from "./pages/RedirectBasedOnRole";
import RegisterClientPage from "./pages/login/RegisterClientPage";
import ClientPage from "./pages/ClientPage";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Carregando autenticação...</div>;

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" richColors />

        <Routes>
          <Route path="/login" element={<Login />} />z
          <Route path="/register-client" element={<RegisterClientPage />} />
          <Route element={<MainLayout />}>
            {/* Cliente */}
            <Route
              path="/client"
              element={
                <ProtectedRouteByRole allowedRoles={["Client"]}>
                  <ClientDashboard />
                </ProtectedRouteByRole>
              }
            />
            <Route
              path="/client/:id"
              element={
                <ProtectedRouteByRole allowedRoles={["Lawyer", "Admin"]}>
                  <ClientPage />
                </ProtectedRouteByRole>
              }
            />

            {/* Advogado/Admin */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRouteByRole allowedRoles={["Lawyer", "Admin"]}>
                  <DashboardPage />
                </ProtectedRouteByRole>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRouteByRole allowedRoles={["Lawyer", "Admin"]}>
                  <SettingsPage />
                </ProtectedRouteByRole>
              }
            />

            <Route
              path="/lawsuit/:id"
              element={
                <PrivateRoute>
                  <LawSuitViewer />
                </PrivateRoute>
              }
            />

            <Route
              path="/client/:clientId/create-lawsuit"
              element={
                <ProtectedRouteByRole allowedRoles={["Lawyer", "Admin"]}>
                  <CreateLawsuitPage />
                </ProtectedRouteByRole>
              }
            />

            <Route
              path="/"
              element={
                <PrivateRoute>
                  <RedirectBasedOnRole />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}
