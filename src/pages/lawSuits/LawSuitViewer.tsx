// src/pages/lawSuits/LawSuitViewer.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Corrigido 'react-router-router-dom' para 'react-router-dom'
import axios from "axios";
import { useAuth } from "../../context/auth/useAuth";
import {
  connectChatSocket,
  sendChatMessage,
  disconnectChatSocket,
  // markMessageViewedBySocket // Removido da importação, pois não é usado diretamente aqui via socket
} from "../../services/chatService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react"; // Importe o ícone Plus

// MANTIDO O CAMINHO DE IMPORTAÇÃO DO DIÁLOGO QUE VOCÊ FORNECEU
import { AddClientOnCaseDialog } from "./dialogs/AddClientOnCaseDialog"; 

// Tipagem para Caso (refletindo o novo schema do backend)
interface LawSuit {
  id: string;
  title: string;
  description?: string;
  status: string; // O status do Prisma é um Enum, mas o frontend pode tratá-lo como string
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  
  // IDs primárias (correspondem a lawyerPrimaryId e clientPrimaryId no BE)
  lawyerPrimaryId?: string; 
  clientPrimaryId?: string;

  // Relações incluídas pelo backend (lawyerPrimary e clientPrimary)
  clientPrimary?: { 
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  lawyerPrimary?: { 
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  // As propriedades 'client' e 'lawyer' diretas NÃO existem mais no modelo Case do backend.
  // Se o backend não mapear 'clientPrimary' para 'client' e 'lawyerPrimary' para 'lawyer'
  // na resposta da API, estas devem ser removidas para evitar erros de tipagem.
  // Removidas para garantir que o código só use clientPrimary/lawyerPrimary.
  // client?: { id: string; firstName: string; lastName: string; email?: string; }; // Removido
  // lawyer?: { id: string; firstName: string; lastName: string; email?: string; }; // Removido
}

// Tipagem para Mensagem (mantida)
interface Message {
  caseId: string;
  id: string;
  content: string;
  createdAt: string;
  senderId: string; 
  receiverClientId: string; 
  viewed: boolean;
  viewedAt?: string;
  sender: { 
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  receiverClient: { 
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

// Status válidos (mantido, pois é o Enum do backend)
const VALID_CASE_STATUSES = [
  "Open",
  "In Progress",
  "Closed",
  "Pending",
  "On Hold",
];

export default function LawSuitViewer() {
  const { id: lawsuitId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated, loading: authLoading, user } = useAuth();

  const [lawsuit, setLawsuit] = useState<LawSuit | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageContent, setNewMessageContent] = useState("");

  // Estados de edição (mantidos, mesmo que não haja UI direta para eles nesta página)
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedStatus, setEditedStatus] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Estados para o diálogo de adicionar cliente
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [addClientLoading, setAddClientLoading] = useState(false);
  const [addClientError, setAddClientError] = useState<string | null>(null);


  // Função para carregar histórico de mensagens (useCallback para otimização)
  const fetchMessagesHistory = useCallback(
    async (caseId: string) => {
      if (!token) return;
      try {
        const response = await axios.get(`/messages/cases/${caseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data.messages) {
          setMessages(response.data.messages);
        }
      } catch (err) {
        console.error("Erro ao carregar histórico de mensagens:", err);
        setError("Não foi possível carregar o histórico de mensagens.");
      }
    },
    [token]
  );

  // Efeito para carregar detalhes do caso
  const fetchLawsuitDetails = useCallback(
    async () => {
      if (!lawsuitId || !isAuthenticated || authLoading || !token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/cases/${lawsuitId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data.case) {
          const fetchedLawsuit: LawSuit = response.data.case;
          setLawsuit(fetchedLawsuit);
          setEditedTitle(fetchedLawsuit.title);
          setEditedDescription(fetchedLawsuit.description || "");
          setEditedStatus(fetchedLawsuit.status);

          await fetchMessagesHistory(fetchedLawsuit.id);
        } else {
          setError("Caso não encontrado ou você não tem permissão.");
          navigate("/dashboard", { replace: true });
        }
      } catch (err: any) {
        console.error("Erro ao carregar detalhes do caso:", err);
        setError("Erro ao carregar detalhes do caso. Verifique o ID.");
        navigate("/dashboard", { replace: true });
      } finally {
        setIsLoading(false);
      }
    },
    [lawsuitId, isAuthenticated, authLoading, token, navigate, fetchMessagesHistory]
  );

  useEffect(() => {
    fetchLawsuitDetails();
  }, [fetchLawsuitDetails]);

  // Efeito para conectar/desconectar Socket.IO e lidar com novas mensagens
  useEffect(() => {
    if (isAuthenticated && token && lawsuit && user) {
      const onNewMessage = (msg: Message) => {
        setMessages((prevMessages) => {
          if (
            msg.caseId === lawsuit.id &&
            !prevMessages.some((m) => m.id === msg.id)
          ) {
            return [...prevMessages, msg];
          }
          return prevMessages;
        });
        scrollToBottom();
      };

      const onMessageViewed = (messageId: string) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId
              ? { ...msg, viewed: true, viewedAt: new Date().toISOString() }
              : msg
          )
        );
      };

      const onError = (err: string) => {
        setError(`Erro no chat: ${err}`);
      };

      connectChatSocket(token, onNewMessage, onMessageViewed, onError);
      console.log("[LawSuitViewer] Socket de chat conectado.");

      return () => {
        disconnectChatSocket();
        console.log("[LawSuitViewer] Socket de chat desconectado.");
      };
    }
  }, [isAuthenticated, token, lawsuit, user]); // Removido fetchMessagesHistory daqui, pois já é dependência do fetchLawsuitDetails

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Funções de edição/deleção do caso (mantidas, mas elas não estão mais diretamente ligadas à UI nesta página)
  // Seriam chamadas de um modal de configurações separado, que não está nesta tela LawSuitViewer.
  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
    if (lawsuit && isEditing) {
      setEditedTitle(lawsuit.title);
      setEditedDescription(lawsuit.description || "");
      setEditedStatus(lawsuit.status);
    }
  };

  const handleUpdateLawsuit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lawsuitId || !token) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updatedData = {
        title: editedTitle,
        description: editedDescription,
        status: editedStatus,
      };
      const response = await axios.put(`/cases/${lawsuitId}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.case) {
        setLawsuit(response.data.case);
        setSuccessMessage("Caso atualizado com sucesso!");
        setIsEditing(false);
      } else {
        setError(response.data.message || "Falha ao atualizar caso.");
      }
    } catch (err: any) {
      console.error("Erro ao atualizar caso:", err);
      setError(
        err.response?.data?.message ||
          (err.response?.data?.errors &&
            err.response.data.errors.map((e: any) => e.message).join(", ")) ||
          "Erro ao atualizar caso."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLawsuit = async () => {
    if (!lawsuitId || !token) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await axios.delete(`/cases/${lawsuitId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage("Caso excluído com sucesso!");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Erro ao excluir caso:", err);
      setError(err.response?.data?.message || "Erro ao excluir caso.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // >>> CORREÇÃO AQUI: Usar 'lawsuit.clientPrimaryId' <<<
    if (
      !newMessageContent.trim() ||
      !lawsuit ||
      !lawsuit.clientPrimaryId || // Acessar clientPrimaryId
      !user?.id
    ) {
      setError(
        "Mensagem vazia, caso ou cliente não selecionado, ou usuário não autenticado."
      );
      return;
    }
    sendChatMessage(newMessageContent, lawsuit.id, lawsuit.clientPrimaryId); // Usar clientPrimaryId
    setNewMessageContent("");
    setError(null);
  };

  const handleMarkMessageAsViewed = useCallback(
    async (messageId: string) => {
      try {
        await axios.put(
          `/messages/${messageId}/viewed`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, viewed: true, viewedAt: new Date().toISOString() }
              : msg
          )
        );
      } catch (err) {
        console.error("Erro ao marcar mensagem como visualizada:", err);
        setError("Não foi possível marcar a mensagem como visualizada.");
      }
    },
    [token]
  );

  // Função para adicionar cliente via e-mail (Mantida, pois é chamada pelo modal)
  const handleAddClientByEmail = async (email: string) => {
    if (!lawsuitId || !token) {
      setAddClientError("Erro: ID do caso ou token ausente.");
      return;
    }
    setAddClientLoading(true);
    setAddClientError(null);
    setSuccessMessage(null); // Limpa mensagens de sucesso anteriores

    try {
      // Endpoint para adicionar cliente a um caso por email (POST /api/cases/:lawsuitId/invite-client)
      const response = await axios.post(`/api/cases/${lawsuitId}/invite-client`, { email }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && (response.status === 200 || response.status === 201)) {
        setSuccessMessage(`Convite enviado para ${email} com sucesso!`);
        // Opcional: Recarregar detalhes do caso para atualizar a lista de participantes
        // await fetchLawsuitDetails();
        setIsAddClientDialogOpen(false); // Fecha o diálogo
      } else {
        setAddClientError(response.data.message || "Falha ao enviar convite.");
      }
    } catch (err: any) {
      console.error("Erro ao adicionar cliente:", err);
      setAddClientError(
        err.response?.data?.message ||
        (err.response?.data?.errors &&
          err.response.data.errors.map((e: any) => e.message).join(", ")) ||
        "Erro ao enviar convite. Verifique o email."
      );
    } finally {
      setAddClientLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Carregando detalhes do caso...
      </div>
    );
  }

  if (error && !lawsuit) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!lawsuitId || !lawsuit) {
    return (
      <div className="p-6 text-center text-red-500">
        ID do caso não fornecido ou caso não encontrado.
      </div>
    );
  }

  return (
    // O container principal do LawSuitViewer precisa ser 'relative'
    // para que o botão 'absolute' se posicione em relação a ele.
    <div className="relative flex flex-1 h-full overflow-hidden">
      {/* Botão "Adicionar Cliente" posicionado absolutamente */}
      {/* ATENÇÃO: Os valores 'top' e 'right' abaixo são estimativas.
          Você PRECISA ajustá-los no navegador para que o botão fique exatamente onde você quer,
          considerando a altura do header do MainLayout e o espaçamento do ícone de engrenagem.
          `top`: aproximadamente metade da altura do cabeçalho do MainLayout - metade da altura do botão.
          `right`: Distância da borda direita da tela, considerando a largura do ícone de engrenagem e o padding.
      */}
      <div
        className="absolute z-50" // Z-index alto para garantir que fique por cima
        style={{
          top: '12px',      // Exemplo: 12px do topo. Ajuste para a altura exata do cabeçalho do MainLayout
          right: '325px',  // Exemplo: 5.5rem (88px) da direita. Ajuste para alinhar antes do ícone de engrenagem
        }}
      >
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setIsAddClientDialogOpen(true)} // Abre o diálogo ao clicar
        >
          <Plus className="h-4 w-4" />
          Adicionar Cliente
        </Button>
      </div>

      {/* Conteúdo principal: Chat e Documentos */}
      {/* Este div flex vai dividir o espaço horizontalmente */}
      <div className="flex flex-1 overflow-hidden">
        {/* Coluna do Chat (Conteúdo Esquerdo) */}
        {/* Adicione padding-top para compensar o cabeçalho do MainLayout */}
        <div className="flex flex-col flex-1 overflow-y-auto p-6 gap-6 pt-[52px]"> {/* Ajuste pt para altura do cabeçalho */}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {successMessage && (
            <p className="text-green-500 text-center mb-4">{successMessage}</p>
          )}

          {/* Chat Box */}
          <div className="flex-1 flex flex-col bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg shadow-sm border dark:border-zinc-700 min-h-[500px]">
            <h2 className="text-xl font-semibold mb-3">Chat</h2>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Nenhuma mensagem ainda.
                </p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 items-start ${
                    msg.senderId === user?.id ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.senderId !== user?.id && (
                    <div className="w-8 h-8 rounded-full bg-gray-400 dark:bg-zinc-600" />
                  )}
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl shadow ${
                      msg.senderId === user?.id
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-200 dark:bg-zinc-700 text-gray-900 dark:text-white"
                    }`}
                  >
                    <p className="text-sm font-medium">
                      {msg.senderId === user?.id ? "Você" : msg.sender.firstName}
                    </p>
                    <p className="text-sm">{msg.content}</p>
                    <div className="text-xs mt-1 flex justify-between items-center">
                      <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                      {msg.senderId === user?.id && (
                        <span>{msg.viewed ? "✓✓ Lido" : "✓ Enviado"}</span>
                      )}
                    </div>
                    {!msg.viewed && msg.senderId !== user?.id && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleMarkMessageAsViewed(msg.id)}
                        className="text-xs mt-1 p-0 h-auto text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        Marcar como Lido
                      </Button>
                    )}
                  </div>
                  {msg.senderId === user?.id && (
                    <div className="w-8 h-8 rounded-full bg-blue-600" />
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
              <Input
                type="text"
                placeholder="Digite sua mensagem..."
                value={newMessageContent}
                onChange={(e) => setNewMessageContent(e.target.value)}
                className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm"
                disabled={isSubmitting}
              />
              <Button type="submit" disabled={isSubmitting || !lawsuit}>
                Enviar
              </Button>
            </form>
          </div>
        </div>

        {/* Coluna Direita: Documentos */}
        <div className="hidden lg:block w-[300px] bg-zinc-100 dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 overflow-y-auto p-4">
          <h2 className="text-xl font-semibold mb-3 text-zinc-800 dark:text-white">Documentos</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum documento adicionado.</p>
          <Button variant="link" size="sm" className="mt-2 px-0">
            Adicionar Documento
          </Button>
        </div>
      </div>

      {/* Renderiza o diálogo de adicionar cliente */}
      <AddClientOnCaseDialog
        isOpen={isAddClientDialogOpen}
        onClose={() => setIsAddClientDialogOpen(false)}
        lawsuitId={""}
        onClientAddedOrAssociated={function (message: string): void {
          throw new Error("Function not implemented.");
        }}
      />
    </div>
  );
}