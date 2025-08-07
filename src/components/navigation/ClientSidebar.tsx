import React, { useEffect, useState } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { Briefcase } from "lucide-react"
import axios from "axios"
import { useAuth } from "@/context/auth/useAuth"
import { Button } from "@/components/ui/button"

interface LawSuit {
  id: string
  title: string
}

export default function ClientSidebar() {
  const { token, isAuthenticated, loading: authLoading, user } = useAuth()
  const location = useLocation()
  const [lawsuits, setLawsuits] = useState<LawSuit[]>([])
  const [loadingCases, setLoadingCases] = useState(true)


  const navigate = useNavigate();
  useEffect(() => {
    const fetchCases = async () => {
      if (!isAuthenticated || authLoading || !token || user?.role !== "Client") {
        setLoadingCases(false)
        return
      }

      try {
        const response = await axios.get(`/cases?clientId=${user.id}`)
        setLawsuits(response.data.cases)
      } catch (error) {
        console.error("Erro ao buscar casos do cliente:", error)
        setLawsuits([])
      } finally {
        setLoadingCases(false)
      }
    }

    fetchCases()
  }, [isAuthenticated, authLoading, token, user?.id])

  return (
    <div className="w-64 bg-zinc-100 dark:bg-zinc-800 p-4 border-r dark:border-zinc-700 h-full flex flex-col">
      <div className="text-xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">
        Nexu Cliente
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 font-semibold mb-2">
          <span>Meus Casos</span>
        </div>

        {loadingCases ? (
          <div className="text-gray-500 dark:text-gray-400">Carregando casos...</div>
        ) : lawsuits.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm">Nenhum caso vinculado.</div>
        ) : (
          <ul className="space-y-1">
            {lawsuits.map((lawsuit) => (
              <li key={lawsuit.id}>
                <Link
                  to={`/client/lawsuit/${lawsuit.id}`}
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
                    location.pathname === `/client/lawsuit/${lawsuit.id}`
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                      : ""
                  }`}
                >
                  <Briefcase size={16} /> {lawsuit.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
