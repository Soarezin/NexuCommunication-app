import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "../pages/login/Login"
import Dashboard from "../pages/Dashboard"
import LawSuit from "../pages/LawSuit"
import Client from "../pages/Client"
import SettingsPage from "../pages/profile/SettingsPage"
import MainLayout from "../layouts/MainLayout"
import type { JSX } from "react"

const isAuthenticated = () => !!localStorage.getItem("token")

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="lawsuit/:id" element={<LawSuit />} />
          <Route path="client/:id" element={<Client />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
