// src/components/layout/MainLayout.tsx
import { useEffect, useState } from "react"
import { Outlet, Link } from "react-router-dom"
import Sidebar from "../components/layout/Sidebar" // Caminho relativo ajustado (era "../components/layout/Sidebar")
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth/useAuth"

export default function MainLayout() {
  const [theme, setTheme] = useState("light")
  const { user, logout } = useAuth();

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(theme)
    localStorage.setItem("theme", theme);
  }, [theme])

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  return (
    <div className="flex h-screen text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-zinc-900">
      <Sidebar /> {/* A Sidebar fixa à esquerda */}

      <div className="flex-1 flex flex-col"> {/* Área principal - Header e Conteúdo */}
        <header className="border-b dark:border-zinc-700 px-4 py-2 flex justify-between items-center">
          <h1 className="font-semibold text-lg">Nexu Communication</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">⚙️</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-3 py-2 text-sm font-semibold">
                {user?.firstName} {user?.lastName}
                {user?.tenantId && <div className="text-xs text-gray-500 dark:text-gray-400">Escritório: {user.tenantId}</div>}
              </div>
              <DropdownMenuItem asChild>
                <Link to="/settings">Configurações</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex items-center justify-between w-full">
                  <span>Tema escuro</span>
                  <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* >>> MUDANÇA AQUI: Renderiza o Outlet (suas páginas) e a coluna de Documentos Lado a Lado <<< */}
        {/* Usamos flex-grow para o Outlet ocupar o máximo de espaço possível */}
        <div className="flex flex-1 overflow-hidden"> {/* Este flex fará com que o Outlet e a nova aside fiquem lado a lado */}
          
          <main className="flex-1 overflow-auto bg-white dark:bg-zinc-900"> {/* main agora ocupa o espaço restante */}
            <Outlet /> {/* Aqui será renderizado o conteúdo da rota (LawSuitViewer, DashboardPage, etc.) */}
          </main>
        </div>
      </div>
    </div>
  )
}