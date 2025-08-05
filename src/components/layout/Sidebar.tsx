// src/components/layout/Sidebar.tsx
import React, { useState, useEffect, useCallback } from "react";
// >>> CORREÇÃO AQUI: Adicione useSearchParams <<<
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { FolderOpen, Users, Briefcase, Calendar, PlusCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "../../context/auth/useAuth";
import axios from "axios";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  cases?: LawSuit[];
}

interface LawSuit {
  id: string;
  title: string;
  status: string;
  clientId: string;
}

export default function Sidebar() {
  const { token, isAuthenticated, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // >>> CORREÇÃO AQUI: Use o hook useSearchParams para obter searchParams <<<
  const [searchParams] = useSearchParams(); 
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [errorClients, setErrorClients] = useState<string | null>(null);
  const [openClientIds, setOpenClientIds] = useState<Set<string>>(new Set());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchClientsAndCases = async () => {
      if (!isAuthenticated || authLoading || !token || !user?.tenantId) {
        setLoadingClients(false);
        return;
      }

      setLoadingClients(true);
      setErrorClients(null);

      try {
        const clientsResponse = await axios.get('/clients');
        const fetchedClients: Client[] = clientsResponse.data.clients || [];

        const clientsWithCasesPromises = fetchedClients.map(async (client) => {
          try {
            const casesResponse = await axios.get(`/cases?clientId=${client.id}`);
            const clientCases: LawSuit[] = casesResponse.data.cases || [];
            return { ...client, cases: clientCases };
          } catch (caseError) {
            console.error(`Erro ao buscar casos para o cliente ${client.id}:`, caseError);
            return { ...client, cases: [] };
          }
        });

        const clientsWithCases = await Promise.all(clientsWithCasesPromises);
        setClients(clientsWithCases);
        
        // Lógica para expandir o cliente se o caso ou o próprio cliente estiver ativo na URL
        const pathSegments = location.pathname.split('/');
        const activeClientIdFromUrl = searchParams.get('id'); // Agora searchParams está disponível

        clientsWithCases.forEach(client => {
          if (client.id === activeClientIdFromUrl) {
            setOpenClientIds(prev => new Set(prev).add(client.id));
          } else if (pathSegments[1] === 'lawsuit' && pathSegments[2]) {
            const activeLawsuitId = pathSegments[2];
            if (client.cases?.some(c => c.id === activeLawsuitId)) {
              setOpenClientIds(prev => new Set(prev).add(client.id));
            }
          }
        });

      } catch (err) {
        console.error("Erro ao carregar clientes e casos para a sidebar:", err);
        setErrorClients("Não foi possível carregar clientes e casos.");
      } finally {
        setLoadingClients(false);
      }
    };

    // >>> CORREÇÃO AQUI: Adicione searchParams na lista de dependências <<<
    fetchClientsAndCases();
  }, [isAuthenticated, authLoading, token, user?.tenantId, location.pathname, searchParams]); // Adicionado searchParams

  const handleClientToggle = useCallback((clientId: string) => {
    setOpenClientIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  }, []);

  const handleCreateClient = () => {
    navigate('/client?action=create');
    setIsMobileMenuOpen(false);
  };

  const handleCreateLawsuit = (clientId: string) => {
    navigate(`/client/${clientId}/create-lawsuit`);
    setIsMobileMenuOpen(false);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-100 dark:bg-zinc-800 p-4 border-r dark:border-zinc-700">
      <div className="text-xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">Nexu Admin</div>
      
      <nav className="space-y-2 mb-6">
        <Link to="/dashboard" className={`flex items-center gap-2 p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 ${location.pathname === '/dashboard' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
          <Users size={18} /> Dashboard
        </Link>
        <Link to="/settings" className={`flex items-center gap-2 p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 ${location.pathname === '/settings' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
          <Briefcase size={18} /> Configurações
        </Link>
        <Link to="/calendar" className={`flex items-center gap-2 p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 ${location.pathname === '/calendar' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
          <Calendar size={18} /> Calendário
        </Link>
      </nav>

      <div className="mb-4">
        <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 font-semibold mb-2">
          <span>Clientes</span>
          <Button variant="ghost" size="sm" onClick={handleCreateClient} title="Adicionar Novo Cliente">
            <PlusCircle size={16} />
          </Button>
        </div>
        {loadingClients ? (
          <div className="text-gray-500 dark:text-gray-400">Carregando clientes...</div>
        ) : errorClients ? (
          <div className="text-red-500 text-sm">{errorClients}</div>
        ) : clients.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm">Nenhum cliente.</div>
        ) : (
          <ul className="space-y-1">
            {clients.map((client) => (
              <li key={client.id}>
                <Collapsible
                  open={openClientIds.has(client.id)}
                  onOpenChange={() => handleClientToggle(client.id)}
                  className="w-full space-y-2"
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className={`w-full justify-between pr-2 text-base font-normal ${location.search === `?id=${client.id}` ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : ''}`} onClick={() => { navigate(`/client?id=${client.id}`); setIsMobileMenuOpen(false); }}>
                      <div className="flex items-center gap-2">
                        <FolderOpen size={16} /> {client.firstName} {client.lastName}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{client.cases?.length || 0}</span>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 space-y-1">
                    {client.cases && client.cases.length > 0 ? (
                      client.cases.map((lawsuit) => (
                        <Link
                          key={lawsuit.id}
                          to={`/lawsuit/${lawsuit.id}`}
                          className={`flex items-center gap-2 p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 ${location.pathname === `/lawsuit/${lawsuit.id}` ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : ''}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Briefcase size={14} /> {lawsuit.title}
                        </Link>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-xs pl-2">Nenhum caso.</p>
                    )}
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300" onClick={() => handleCreateLawsuit(client.id)}>
                      <PlusCircle size={14} className="mr-1" /> Novo Caso
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
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
  );
}