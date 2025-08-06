import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "../pages/login/Login"
import Dashboard from "../pages/Dashboard"
import LawSuit from "../pages/LawSuit"
import Client from "../pages/ClientPage"
import SettingsPage from "../pages/settings/SettingsPage"
import MainLayout from "../layouts/MainLayout"
import RedirectBasedOnRole from "../pages/RedirectBasedOnRole" // <<< ADICIONE ISSO
import type { JSX } from "react"

const isAuthenticated = () => !!localStorage.getItem("token")

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login público */}
        <Route path="/login" element={<Login />} />

        {/* Rotas protegidas com layout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          {/* Redirecionamento dinâmico com base na role */}
          <Route index element={<RedirectBasedOnRole />} />

          {/* Páginas internas */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="lawsuit/:id" element={<LawSuit />} />
          <Route path="client/:id" element={<Client />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
