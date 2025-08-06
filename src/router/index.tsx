// AppRoutes.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "../pages/login/Login"
import Dashboard from "../pages/Dashboard"
import LawSuit from "../pages/LawSuit"
import Client from "../pages/ClientPage"
import SettingsPage from "../pages/settings/SettingsPage"
import MainLayout from "../layouts/MainLayout"
import ClientLayout from "../layouts/ClientLayout"
import RedirectBasedOnRole from "../pages/RedirectBasedOnRole"
import type { JSX } from "react"
import { useAuth } from "@/context/auth/useAuth"
import ProtectedRouteByRole from "@/components/ProtectedRouteByRole"

const isAuthenticated = () => !!localStorage.getItem("token")

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <RedirectBasedOnRole />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRouteByRole allowedRoles={["Admin", "Lawyer", "Paralegal"]}>
              <MainLayout />
            </ProtectedRouteByRole>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="lawsuit/:id" element={<LawSuit />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route
          path="/client/:id"
          element={
            <ProtectedRouteByRole allowedRoles={["Client"]}>
              <ClientLayout />
            </ProtectedRouteByRole>
          }
        >
          <Route index element={<Client />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
