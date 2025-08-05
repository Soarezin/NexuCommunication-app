// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import LawSuitViewer from "./pages/lawSuits/LawSuitViewer";
import ClientPage from "./pages/Client";
import DashboardPage from "./pages/Dashboard";
import SettingsPage from "./pages/settings/SettingsPage";
import Login from "./pages/login/Login";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/auth/useAuth";
import CreateLawsuitPage from "./pages/lawSuits/CreateLawsuitPage";
import type { ReactNode } from "react";
import { Toaster } from "sonner"; // Importação do Sonner

interface PrivateRouteProps {
    children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Carregando autenticação...</div>;
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster position="top-right" richColors /> 
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<MainLayout />}>
                        <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                        <Route path="/client" element={<PrivateRoute><ClientPage /></PrivateRoute>} />
                        <Route path="/client/:clientId/create-lawsuit" element={<PrivateRoute><CreateLawsuitPage /></PrivateRoute>} />
                        <Route path="/lawsuit/:id" element={<PrivateRoute><LawSuitViewer /></PrivateRoute>} />
                        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}