import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Briefcase, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/context/auth/useAuth"
import axios from "axios"

interface LawSuit {
  id: string
  title: string
  status: string
  clientId: string
}

export default function ClientSidebar() {
  const { token, isAuthenticated, loading: authLoading, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [lawsuits, setLawsuits] = useState<LawSuit[]>([])
  const [loadingCases, setLoadingCases] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchCases = async () => {
      if (!isAuthenticated || authLoading || !token || user?.role !== "Client") {
        setLoadingCases(false)
        return
      }

      try {
        const response = await axios.get("/cases/me")
        setLawsuits(response.data.cases || [])
      } catch (error) {
        console.error("Erro ao buscar casos do cliente:", error)
        setLawsuits([])
      } finally {
        setLoadingCases(false)
      }
    }

    fetchCases()
  }, [isAuthenticated, authLoading, token, user?.id])

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-100 dark:bg-zinc-800 p-4 border-r dark:border-zinc-700">
      <div className="text-xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">
        Nexu Cliente
      </div>

      <nav className="space-y-2">
        {loadingCases ? (
          <div className="text-gray-500 dark:text-gray-400">Carregando casos...</div>
        ) : lawsuits.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm">Nenhum caso vinculado.</div>
        ) : (
          lawsuits.map((lawsuit) => (
            <Button
              key={lawsuit.id}
              variant="ghost"
              className={`w-full justify-start flex items-center gap-2 p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-base font-normal ${
                location.pathname === `/lawsuit/${lawsuit.id}`
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : ""
              }`}
              onClick={() => {
                navigate(`/lawsuit/${lawsuit.id}`)
                setIsMobileMenuOpen(false)
              }}
            >
              <Briefcase size={16} /> {lawsuit.title}
            </Button>
          ))
        )}
      </nav>
    </div>
  )

  return (
    <>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          {renderSidebarContent()}
        </SheetContent>
      </Sheet>

      <div className="hidden md:flex h-full w-64 flex-col">
        {renderSidebarContent()}
      </div>
    </>
  )
}
