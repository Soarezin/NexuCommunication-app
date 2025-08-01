// Removed unused React import
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
      if (!isAuthenticated || authLoading || !token) {
        setIsLoadingData(false);
        return;
      }

      setIsLoadingData(true);
      setError(null);

      try {
        const clientsResponse = await axios.get(`/clients`);
        setClientCount(clientsResponse.data?.clients?.length || 0);

        const casesResponse = await axios.get(`/cases`);
        setCaseCount(casesResponse.data?.cases?.length || 0);

        setMessageCount(null);
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

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated || authLoading || !token) {
        return;
      }

      try {
        const response = await axios.get(`/users`);
        setUsers(response.data?.users || []);
      } catch (err) {
        console.error("Erro ao carregar usuários:", err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, [isAuthenticated, authLoading, token]);

  const [editUserDialog, setEditUserDialog] = useState<{ isOpen: boolean; user: any | null }>({
    isOpen: false,
    user: null,
  });

  const closeEditUserDialog = () => {
    setEditUserDialog({ isOpen: false, user: null });
  };

  const handlePermissionsModal = async (user: any) => {
    try {
      setEditUserDialog({ isOpen: true, user });
      const response = await axios.get(`/permissions`);
      
      // Add logic to display permissions data in the modal
    } catch (err) {
      console.error("Erro ao carregar permissões:", err);
    }
  };

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

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">User List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b dark:border-zinc-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b dark:border-zinc-700">Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b dark:border-zinc-700">Criado em</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b dark:border-zinc-700"></th>
              </tr>
            </thead>
            <tbody>
              {users && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-zinc-700">
                      {user.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-zinc-700">
                      {user.email}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-zinc-700">
                      {user.createdAt}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-zinc-700">
                      <button
                        onClick={() => handlePermissionsModal(user)}
                        className="ml-4 text-green-500 hover:underline"
                      >
                        Permissões
                      </button>
                      <button
                        onClick={() => setEditUserDialog({ isOpen: true, user })}
                        className="ml-4 text-blue-500 hover:underline"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400 border-b dark:border-zinc-700"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editUserDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Edit User</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Editing user: {editUserDialog.user?.firstName} {editUserDialog.user?.lastName}
            </p>  
            <button
              onClick={closeEditUserDialog}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}