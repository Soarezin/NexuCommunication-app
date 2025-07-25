// src/pages/DashboardPage.tsx
import { useEffect, useState } from "react";
import { Users, FolderOpen, MessageCircle } from "lucide-react";
import { useAuth } from "../context/auth/useAuth";
import axios from "axios"; // Importe axios

export default function DashboardPage() {
  const { token, isAuthenticated, loading: authLoading } = useAuth();

  const [clientCount, setClientCount] = useState<number | null>(null);
  const [caseCount, setCaseCount] = useState<number | null>(null);
  const [messageCount, setMessageCount] = useState<number | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Garante que a autenticação foi carregada e o usuário está autenticado
      if (!isAuthenticated || authLoading || !token) {
        setIsLoadingData(false); // Parar o loading de dados se as condições não forem atendidas
        return;
      }

      setIsLoadingData(true);
      setError(null);

      try {
        // Chamadas Axios usando caminhos relativos; a baseURL já está configurada globalmente
        const clientsResponse = await axios.get(`/clients`);
        if (clientsResponse.data && clientsResponse.data.clients) {
          setClientCount(clientsResponse.data.clients.length);
        } else {
          setClientCount(0);
        }

        const casesResponse = await axios.get(`/cases`);
        if (casesResponse.data && casesResponse.data.cases) {
          setCaseCount(casesResponse.data.cases.length);
        } else {
          setCaseCount(0);
        }

        setMessageCount(null); // Mantido como null, pois não há rota de contagem de mensagens ainda

      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
        setError("Não foi possível carregar os dados do dashboard. Verifique sua conexão ou permissões.");
        setClientCount(null);
        setCaseCount(null);
        setMessageCount(null);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, authLoading, token]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {isLoadingData ? (
        <div className="text-center text-lg text-gray-500 dark:text-gray-400">Carregando dados...</div>
      ) : error ? (
        <div className="text-center text-lg text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow border dark:border-zinc-700">
            <Users className="text-blue-500" />
            <div>
              <div className="text-xl font-semibold">{clientCount !== null ? clientCount : "-"}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Clients</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow border dark:border-zinc-700">
            <FolderOpen className="text-green-500" />
            <div>
              <div className="text-xl font-semibold">{caseCount !== null ? caseCount : "-"}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Lawsuits</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow border dark:border-zinc-700">
            <MessageCircle className="text-purple-500" />
            <div>
              <div className="text-xl font-semibold">{messageCount !== null ? messageCount : "N/A"}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Messages</div>
            </div>
          </div>
        </div>
      )}

      <p className="text-gray-700 dark:text-gray-300">
        Selecione um cliente na barra lateral para visualizar seus casos, ou navegue para um processo específico para continuar trabalhando.
      </p>
    </div>
  );
}