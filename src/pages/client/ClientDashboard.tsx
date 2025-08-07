import { useEffect, useState } from "react";
import { FolderOpen, MessageCircle } from "lucide-react";
import { useAuth } from "../../context/auth/useAuth";
import axios from "axios";

export default function ClientDashboard() {
  const { token, isAuthenticated, loading, user } = useAuth();

  const [caseCount, setCaseCount] = useState<number | null>(null);
  const [messageCount, setMessageCount] = useState<number | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || loading || !token || user?.role !== "Client") {
        setIsLoadingData(false);
        return;
      }

      setIsLoadingData(true);
      setError(null);

      try {
        const casesResponse = await axios.get(`/cases?clientId=${user.id}`);
        setCaseCount(casesResponse.data?.cases?.length || 0);

      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
        setError("Erro ao carregar dados. Tente novamente mais tarde.");
        setCaseCount(null);
        setMessageCount(null);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, loading, token, user]);

  if (user?.role !== "Client") {
    return <div className="p-6 text-red-500">Acesso restrito a clientes.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Olá, {user.firstName}</h1>

      {isLoadingData ? (
        <div className="text-center text-lg text-gray-500 dark:text-gray-400">
          Carregando dados...
        </div>
      ) : error ? (
        <div className="text-center text-lg text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow border dark:border-zinc-700">
            <FolderOpen className="text-green-500" />
            <div>
              <div className="text-xl font-semibold">
                {caseCount !== null ? caseCount : "-"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Meus Casos
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow border dark:border-zinc-700">
            <MessageCircle className="text-purple-500" />
            <div>
              <div className="text-xl font-semibold">
                {messageCount !== null ? messageCount : "N/A"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Mensagens
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-gray-700 dark:text-gray-300">
        Aqui você pode acompanhar o andamento dos seus casos, trocar mensagens
        com o escritório e acessar seus documentos.
      </p>
    </div>
  );
}
