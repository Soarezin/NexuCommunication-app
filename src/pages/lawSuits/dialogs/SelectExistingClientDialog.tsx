// src/components/dialogs/SelectExistingClientDialog.tsx
import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Definir uma tipagem para o cliente (se já não tiver uma global)
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface SelectExistingClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClient: (clientId: string) => void;
  clients: Client[]; // Lista de clientes disponíveis
  isLoadingClients?: boolean; // Se estiver carregando os clientes
  clientLoadError?: string | null; // Erro ao carregar clientes
  isSubmitting?: boolean; // Se a seleção está sendo submetida
}

export const SelectExistingClientDialog: React.FC<SelectExistingClientDialogProps> = ({
  isOpen,
  onClose,
  onSelectClient,
  clients,
  isLoadingClients,
  clientLoadError,
  isSubmitting,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);

  // Filtra os clientes com base no termo de busca
  const filteredClients = clients.filter(client =>
    client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    // Limpa o estado quando o diálogo é aberto ou fechado
    if (!isOpen) {
      setSearchTerm("");
      setSelectedClientId(undefined);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (selectedClientId) {
      onSelectClient(selectedClientId);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Selecionar Cliente Existente</AlertDialogTitle>
          <AlertDialogDescription>
            Busque por um cliente já cadastrado para associá-lo a este caso.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="searchClient">Buscar Cliente</Label>
            <Input
              id="searchClient"
              type="text"
              placeholder="Nome, Sobrenome ou Email do cliente"
              className="w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoadingClients || isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="selectClient">Resultados da Busca</Label>
            {isLoadingClients ? (
              <p className="text-sm text-gray-500 text-center">Carregando clientes...</p>
            ) : clientLoadError ? (
              <p className="text-red-500 text-sm text-center">{clientLoadError}</p>
            ) : (
              <Select
                onValueChange={setSelectedClientId}
                value={selectedClientId}
                disabled={filteredClients.length === 0 || isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {filteredClients.length === 0 ? (
                    <p className="p-2 text-sm text-gray-500">Nenhum cliente encontrado.</p>
                  ) : (
                    filteredClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.firstName} {client.lastName} ({client.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!selectedClientId || isSubmitting}>
            {isSubmitting ? "Associando..." : "Associar Cliente"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};