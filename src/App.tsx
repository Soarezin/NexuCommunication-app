// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import LawSuitViewer from "./pages/lawSuits/LawSuitViewer"
import ClientPage from "./pages/Client"
import DashboardPage from "./pages/Dashboard"
import SettingsPage from "./pages/profile/SettingsPage"
import Login from "./pages/login/Login"
// >>> CORREÇÃO FINAL AQUI: Importe useAuth do seu próprio arquivo useAuth.ts <<<
import { AuthProvider } from "./context/AuthProvider" // Caminho correto para AuthProvider
import { useAuth } from "./context/auth/useAuth"             // Caminho correto para useAuth
import CreateLawsuitPage from "./pages/lawSuits/CreateLawsuitPage"
import type { ReactNode } from "react"

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
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<MainLayout />}>
                        <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                        <Route path="/client" element={<PrivateRoute><ClientPage /></PrivateRoute>} />
                        {/* >>> NOVO: Rota para criar um novo caso associado a um cliente <<< */}
                        <Route path="/client/:clientId/create-lawsuit" element={<PrivateRoute><CreateLawsuitPage /></PrivateRoute>} />
                        <Route path="/lawsuit/:id" element={<PrivateRoute><LawSuitViewer /></PrivateRoute>} />
                        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}