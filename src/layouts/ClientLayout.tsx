// src/layouts/ClientLayout.tsx
import { Outlet, NavLink } from "react-router-dom"
import { useAuth } from "@/context/auth/useAuth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function ClientLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 dark:bg-gray-900 p-4 border-r dark:border-gray-700">
        <div className="text-xl font-bold mb-6 text-blue-600">Nexu Client</div>

        <nav className="flex flex-col gap-2">
          <NavLink
            to="/client/dashboard"
            className={({ isActive }) =>
              `px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${isActive ? "bg-gray-200 dark:bg-gray-800 font-semibold" : ""}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/client/cases"
            className={({ isActive }) =>
              `px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${isActive ? "bg-gray-200 dark:bg-gray-800 font-semibold" : ""}`
            }
          >
            Meus Casos
          </NavLink>

          <NavLink
            to="/client/documents"
            className={({ isActive }) =>
              `px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${isActive ? "bg-gray-200 dark:bg-gray-800 font-semibold" : ""}`
            }
          >
            Documentos
          </NavLink>
        </nav>

        <div className="mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 mt-4 text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
            onClick={logout}
          >
            <LogOut size={16} /> Sair
          </Button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-950">
        <Outlet />
      </main>
    </div>
  )
}
