// src/components/dialogs/AddClientOnCaseDialog.tsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/context/auth/useAuth";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectExistingClientDialog } from "./SelectExistingClientDialog"; // Ainda usado para o outro modo

// Tipagem para Cliente (se já não tiver uma global)
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AddClientOnCaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lawsuitId: string; // ID do caso
  onClientAddedOrAssociated: (message: string) => void; // Callback para o LawSuitViewer
}

export const AddClientOnCaseDialog: React.FC<AddClientOnCaseDialogProps> = ({
  isOpen,
  onClose,
  lawsuitId,
  onClientAddedOrAssociated,
}) => {
  const { token } = useAuth();

  const [clientEmail, setClientEmail] = useState("");
  const [sendInviteLoading, setSendInviteLoading] = useState(false); // Renomeado de addClientLoading
  const [sendInviteError, setSendInviteError] = useState<string | null>(null); // Renomeado de addClientError
  const [sendInviteSuccess, setSendInviteSuccess] = useState<string | null>(null); // Novo estado para sucesso do convite

  // Estados para o diálogo de seleção de cliente existente
  const [showSelectExistingClient, setShowSelectExistingClient] = useState(false);
  const [existingClients, setExistingClients] = useState<Client[]>([]);
  const [isLoadingExistingClients, setIsLoadingExistingClients] = useState(false);
  const [existingClientsError, setExistingClientsError] = useState<string | null>(null);
  const [selectExistingClientSubmitting, setSelectExistingClientSubmitting] = useState(false);

  // Função para limpar estados ao fechar o diálogo principal
  useEffect(() => {
    if (!isOpen) {
      setClientEmail("");
      setSendInviteError(null);
      setSendInviteSuccess(null); // Limpa a mensagem de sucesso
      setShowSelectExistingClient(false); // Garante que volta para a tela de e-mail
      setExistingClients([]);
      setExistingClientsError(null);
    }
  }, [isOpen]);

  // Lógica para ENVIAR CONVITE por e-mail
  const handleSendInviteEmail = async () => { // Renomeado a função
    if (!clientEmail.trim()) {
      setSendInviteError("Por favor, insira um e-mail.");
      return;
    }
    if (!lawsuitId || !token) {
      setSendInviteError("Erro interno: ID do caso ou token de autenticação ausente.");
      return;
    }

    setSendInviteLoading(true);
    setSendInviteError(null);
    setSendInviteSuccess(null);

    try {
      // NOVO ENDPOINT DE API: Este endpoint deve ser responsável por:
      // 1. Criar um registro de convite com o email e o ID do caso/tenant.
      // 2. Gerar um token único.
      // 3. Enviar um e-mail para `clientEmail` com o link de cadastro contendo o token.
      const response = await axios.post(`/cases/${lawsuitId}/invite-client`, { email: clientEmail.trim() }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) { // Sucesso no envio
        setSendInviteSuccess(`Convite enviado para ${clientEmail.trim()} com sucesso!`);
        // onClientAddedOrAssociated(`Convite enviado para ${clientEmail.trim()} com sucesso!`);
        // Pode-se fechar o modal ou deixá-lo aberto com a mensagem de sucesso
        // onClose(); // Se desejar fechar automaticamente após o sucesso
      } else {
        setSendInviteError(response.data.message || "Falha ao enviar convite por e-mail.");
      }
    } catch (err: any) {
      console.error("Erro ao enviar convite por e-mail:", err);
      setSendInviteError(
        err.response?.data?.message ||
        (err.response?.data?.errors &&
          err.response.data.errors.map((e: any) => e.message).join(", ")) ||
        "Erro ao enviar convite por e-mail. Verifique o e-mail e tente novamente."
      );
    } finally {
      setSendInviteLoading(false);
    }
  };

  // Lógica para buscar clientes existentes (mantida)
  const fetchExistingClients = useCallback(async () => {
    if (!token) return;
    setIsLoadingExistingClients(true);
    setExistingClientsError(null);
    try {
      const response = await axios.get('/clients', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExistingClients(response.data.clients || []);
    } catch (err: any) {
      console.error("Erro ao carregar clientes existentes:", err);
      setExistingClientsError(err.response?.data?.message || "Erro ao carregar clientes existentes.");
      setExistingClients([]);
    } finally {
      setIsLoadingExistingClients(false);
    }
  }, [token]);

  // Lógica para associar cliente existente (mantida, mas lembre-se do lawsuitId)
  const handleSelectExistingClient = async (clientId: string) => {
    if (!lawsuitId || !token) {
      setExistingClientsError("Erro interno: ID do caso ou token ausente.");
      return;
    }
    setSelectExistingClientSubmitting(true);
    setExistingClientsError(null);

    try {
      // Endpoint para associar um cliente existente a um caso por ID do cliente
      const response = await axios.post(`/cases/${lawsuitId}/associate-client`, { clientId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.case) {
        const associatedClient = existingClients.find(c => c.id === clientId);
        onClientAddedOrAssociated(`Cliente ${associatedClient?.firstName || ''} ${associatedClient?.lastName || ''} associado com sucesso!`);
        onClose(); // Fecha o diálogo principal
      } else {
        setExistingClientsError(response.data.message || "Falha ao associar cliente existente.");
      }
    } catch (err: any) {
      console.error("Erro ao associar cliente existente:", err);
      setExistingClientsError(
        err.response?.data?.message ||
        (err.response?.data?.errors &&
          err.response.data.errors.map((e: any) => e.message).join(", ")) ||
        "Erro ao associar cliente existente."
      );
    } finally {
      setSelectExistingClientSubmitting(false);
    }
  };

  // Funções para alternar entre os modos
  const openSelectExistingClientMode = () => {
    setShowSelectExistingClient(true);
    fetchExistingClients(); // Inicia a busca assim que o modo é ativado
  };

  const closeSelectExistingClientMode = () => {
    setShowSelectExistingClient(false);
    setExistingClientsError(null); // Limpa erro ao voltar para o modo email
  };


  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        {/* Renderiza o diálogo de seleção de cliente existente se showSelectExistingClient for true */}
        {showSelectExistingClient ? (
          <SelectExistingClientDialog
            isOpen={true} // Sempre aberto quando showSelectExistingClient é true
            onClose={closeSelectExistingClientMode} // Volta para o modo de e-mail
            onSelectClient={handleSelectExistingClient}
            clients={existingClients}
            isLoadingClients={isLoadingExistingClients}
            clientLoadError={existingClientsError}
            isSubmitting={selectExistingClientSubmitting}
          />
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Adicionar Cliente ao Caso</AlertDialogTitle>
              <AlertDialogDescription>
                Insira o endereço de e-mail do cliente ou use um cliente já existente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="clientEmail">
                  Email
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="exemplo@dominio.com"
                  className="w-full"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  disabled={sendInviteLoading} // Usar sendInviteLoading
                />
                <p
                  className="text-sm text-gray-500 cursor-pointer hover:text-white mt-1"
                  onClick={openSelectExistingClientMode}
                >
                  Usar cliente já existente
                </p>
              </div>
              {/* Exibe erro ou sucesso do envio do convite */}
              {sendInviteError && <p className="text-red-500 text-sm text-center w-full mt-2">{sendInviteError}</p>}
              {sendInviteSuccess && <p className="text-green-500 text-sm text-center w-full mt-2">{sendInviteSuccess}</p>}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={onClose} disabled={sendInviteLoading}>Cancelar</AlertDialogCancel>
              <Button onClick={handleSendInviteEmail} disabled={sendInviteLoading || !clientEmail.trim()}>
                {sendInviteLoading ? "Enviando Convite..." : "Enviar Convite"} {/* Texto do botão alterado */}
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};