// src/pages/lawSuits/LawSuitViewer.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/auth/useAuth";
import {
  connectChatSocket,
  sendChatMessage,
  disconnectChatSocket,
  markMessageViewedBySocket,
} from "../../services/chatService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/alert-dialog";
// >>> REMOVIDO: Paperclip (já estará no MainLayout) e MessageCircle (não é necessário aqui) <<<
import { Paperclip } from "lucide-react";

// Tipagem para Caso (completa)
interface LawSuit {
  id: string;
  title: string;
  description?: string;
  status: string;
  clientId: string;
  lawyerId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  lawyer: {
    id: string; // Corrigido para 'id'
    firstName: string;
    lastName: string;
    email?: string;
  };
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

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedStatus, setEditedStatus] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLawsuitDetails = async () => {
      if (!lawsuitId || !isAuthenticated || authLoading || !token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/cases/${lawsuitId}`);
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
    };
    fetchLawsuitDetails();
  }, [lawsuitId, isAuthenticated, authLoading, token, navigate]);

  const fetchMessagesHistory = useCallback(
    async (caseId: string) => {
      if (!token) return;
      try {
        const response = await axios.get(`/messages/cases/${caseId}`);
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
  }, [isAuthenticated, token, lawsuit, user, fetchMessagesHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
      const response = await axios.put(`/cases/${lawsuitId}`, updatedData);
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
      await axios.delete(`/cases/${lawsuitId}`);
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
    if (
      !newMessageContent.trim() ||
      !lawsuit ||
      !lawsuit.clientId ||
      !user?.id
    ) {
      setError(
        "Mensagem vazia, caso ou cliente não selecionado, ou usuário não autenticado."
      );
      return;
    }
    sendChatMessage(newMessageContent, lawsuit.id, lawsuit.clientId);
    setNewMessageContent("");
    setError(null);
  };

  const handleMarkMessageAsViewed = useCallback(
    async (messageId: string) => {
      try {
        await axios.put(`/messages/${messageId}/viewed`);
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
  <div className="flex flex-1 h-full overflow-hidden">
    {/* Sidebar esquerda já vem do layout principal (não é parte deste return) */}

    {/* Conteúdo principal em 3 colunas */}
    <div className="flex flex-1 overflow-hidden">
      {/* Coluna do conteúdo (central) */}
      <div className="flex flex-col flex-1 overflow-y-auto p-6 gap-6">
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {successMessage && (
          <p className="text-green-500 text-center mb-4">{successMessage}</p>
        )}

        {/* Chat - agora centralizado e em tela cheia */}
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
                      <span>{msg.viewed ? "✓ Lido" : "✓ Enviado"}</span>
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

      {/* Coluna direita: Documentos */}
      <div className="hidden lg:block w-[300px] bg-zinc-100 dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 overflow-y-auto p-4">
        <h2 className="text-xl font-semibold mb-3 text-zinc-800 dark:text-white">Documentos</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum documento adicionado.</p>
        <Button variant="link" size="sm" className="mt-2 px-0">
          Adicionar Documento
        </Button>
      </div>
    </div>
  </div>
)


}
