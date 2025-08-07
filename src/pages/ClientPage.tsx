// src/pages/Client.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom"; // Importe useParams também
import axios from "axios";
import { useAuth } from "../context/auth/useAuth"; // Caminho para seu useAuth
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Para confirmação de exclusão

// Tipagem para Cliente (completa)
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  // Adicione outras propriedades que seu backend retorna
}

// Tipagem para dados do formulário de cliente
interface ClientFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
}

export default function ClientPage() {
  const [ ] = useSearchParams();
  const navigate = useNavigate();
  const { token, isAuthenticated, loading: authLoading } = useAuth();

  const [isCreating, setIsCreating] = useState(false); // Modo: Criar novo cliente
  const [clientId, setClientId] = useState<string | null>(null); // ID do cliente para edição/visualização

  const [clientData, setClientData] = useState<ClientFormData>({
    // Dados do formulário
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [currentClientDetails, setCurrentClientDetails] =
    useState<Client | null>(null); // Detalhes do cliente se estiver em modo de visualização/edição

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Efeito para determinar o modo (criação vs. edição/visualização) e buscar dados

  const { id: idFromUrl } = useParams(); // 👈 Pega o :id da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get("action");
  
    if (action === "create") {
      setIsCreating(true);
      setClientId(null);
      setClientData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
      });
      setIsLoading(false);
    } else if (idFromUrl) {
      setIsCreating(false);
      setClientId(idFromUrl);
      fetchClientDetails(idFromUrl);
    } else {
      setError("Nenhum modo de operação especificado para Cliente.");
      setIsLoading(false);
    }
  }, [idFromUrl, isAuthenticated, authLoading, token, navigate]);
  

  // Função para buscar os detalhes do cliente para edição/visualização
  async function fetchClientDetails(id: string) {
    if (!isAuthenticated || authLoading || !token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/clients/${id}`);
      if (response.data && response.data.client) {
        const fetchedClient: Client = response.data.client;
        setCurrentClientDetails(fetchedClient);
        // Preenche o formulário com os dados existentes
        setClientData({
          firstName: fetchedClient.firstName,
          lastName: fetchedClient.lastName,
          email: fetchedClient.email || "",
          phoneNumber: fetchedClient.phoneNumber || "",
        });
      } else {
        setError("Cliente não encontrado ou você não tem permissão.");
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Erro ao carregar detalhes do cliente:", err);
      setError("Erro ao carregar detalhes do cliente. Verifique o ID.");
      navigate("/dashboard", { replace: true });
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setClientData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !token) {
      setError("Usuário não autenticado.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isCreating) {
        // Modo de Criação (POST /clients)
        const response = await axios.post("/clients", clientData);
        if (response.data && response.data.client) {
          setSuccessMessage(
            `Cliente "${response.data.client.firstName} ${response.data.client.lastName}" criado com sucesso!`
          );
          // Limpar formulário para permitir nova criação ou redirecionar
          setClientData({
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
          });
          // Opcional: Redirecionar para a Dashboard ou para a página de detalhes do cliente recém-criado
          // navigate(`/client/${response.data.client.id}`, { replace: true });
        } else {
          setError(response.data.message || "Falha ao criar cliente.");
        }
      } else if (clientId) {
        // Modo de Edição (PUT /clients/:id)
        const response = await axios.put(`/clients/${clientId}`, clientData);
        if (response.data && response.data.client) {
          setSuccessMessage(
            `Cliente "${response.data.client.firstName} ${response.data.client.lastName}" atualizado com sucesso!`
          );
          setCurrentClientDetails(response.data.client); // Atualiza os detalhes exibidos
        } else {
          setError(response.data.message || "Falha ao atualizar cliente.");
        }
      }
    } catch (err) {
      console.error("Erro ao processar cliente:", err);
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorResponse = (
          err as {
            response?: {
              data?: { message?: string; errors?: { message: string }[] };
            };
          }
        ).response;
        setError(
          errorResponse?.data?.message ||
            (errorResponse?.data?.errors &&
              errorResponse.data.errors
                .map((e: { message: string }) => e.message)
                .join(", ")) ||
            "Erro ao processar cliente."
        );
      } else {
        setError("Erro ao processar cliente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isAuthenticated || !token || !clientId) {
      setError("Usuário não autenticado ou cliente inválido para exclusão.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await axios.delete(`/clients/${clientId}`);
      setSuccessMessage("Cliente excluído com sucesso!");
      navigate("/dashboard", { replace: true }); // Redireciona após a exclusão
    } catch (err) {
      console.error("Erro ao excluir cliente:", err);
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorResponse = (
          err as { response?: { data?: { message?: string } } }
        ).response;
        setError(errorResponse?.data?.message || "Erro ao excluir cliente.");
      } else {
        setError("Erro ao excluir cliente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">Carregando detalhes do cliente...</div>
    );
  }

  if (!isCreating && !clientId) {
    return (
      <div className="p-6 text-center text-red-500">
        Nenhum modo de operação ou ID de cliente especificado.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white dark:bg-zinc-800 rounded-lg shadow-md mt-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {isCreating ? "Criar Novo Cliente" : "Detalhes do Cliente"}
      </h1>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {successMessage && (
        <p className="text-green-500 text-center mb-4">{successMessage}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="firstName">Primeiro Nome</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Nome"
            value={clientData.firstName}
            onChange={handleInputChange}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Sobrenome</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Sobrenome"
            value={clientData.lastName}
            onChange={handleInputChange}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="email">Email (Opcional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@cliente.com"
            value={clientData.email}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="phoneNumber">Telefone (Opcional)</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="(XX) XXXX-XXXX"
            value={clientData.phoneNumber}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting
            ? isCreating
              ? "Criando..."
              : "Salvando..."
            : isCreating
            ? "Criar Cliente"
            : "Salvar Alterações"}
        </Button>

        {!isCreating && ( // Exibir botão de exclusão apenas em modo de edição/visualização
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full mt-2"
                disabled={isSubmitting}
              >
                Excluir Cliente
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente
                  este cliente e todos os seus casos, mensagens e documentos
                  associados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Sim, excluir cliente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </form>

      {/* Opcional: Exibir casos associados ao cliente aqui, se esta for a página de detalhes */}
      {/* if (!isCreating && currentClientDetails) { ... exibir casos ... } */}
    </div>
  );
}
