import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import ClientSidebar from "@/components/navigation/ClientSidebar"
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

export default function ClientLayout() {
  const [theme, setTheme] = useState("light")
  const { user, logout } = useAuth()

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
    }
  }, [])

  const toggleTheme = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  return (
    <div className="flex h-screen text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-zinc-900">
      {/* Sidebar fixa */}
      <ClientSidebar />

      {/* Área principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b dark:border-zinc-700 px-4 py-2 flex justify-between items-center">
          <h1 className="font-semibold text-lg">Nexu Communication</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                ⚙️
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-3 py-2 text-sm font-semibold">
                {user?.firstName} {user?.lastName}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex items-center justify-between w-full">
                  <span>Tema escuro</span>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Conteúdo com Outlet */}
        <main className="flex-1 overflow-auto bg-white dark:bg-zinc-900 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
