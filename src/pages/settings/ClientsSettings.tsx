// src/pages/settings/ClientsSettings.tsx
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash, Pencil } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
}

const mockClients: Client[] = [
  {
    id: "1",
    name: "João Gerhardt",
    email: "joao@example.com",
    phone: "51 99222-6182",
  },
  {
    id: "2",
    name: "Maria Oliveira",
    email: "maria@example.com",
    phone: "51 98888-3322",
  },
  {
    id: "3",
    name: "Carlos Mendes",
    email: "carlos@adv.com",
    phone: "51 98111-1122",
  },
]

export default function ClientsSettings() {
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [search, setSearch] = useState("")
  const [editClient, setEditClient] = useState<Client | null>(null)

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (id: string) => {
    setClients((prev) => prev.filter((client) => client.id !== id))
  }

  return (
    <div className="space-y-6">
      <Input
        type="text"
        placeholder="Buscar cliente por nome ou e-mail"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <div className="border rounded-md divide-y">
        {filteredClients.length === 0 ? (
          <p className="p-4 text-muted-foreground">Nenhum cliente encontrado.</p>
        ) : (
          filteredClients.map((client) => (
            <div
              key={client.id}
              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2"
            >
              <div>
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-muted-foreground">{client.email}</p>
                {client.phone && (
                  <p className="text-sm text-muted-foreground">{client.phone}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditClient(client)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar cliente</DialogTitle>
                    </DialogHeader>
                    {/* Mock - substituir depois */}
                    <div className="text-sm text-muted-foreground">
                      Aqui entraria o formulário de edição do cliente com os dados preenchidos.
                    </div>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash className="w-4 h-4 mr-1" />
                      Remover
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      Tem certeza que deseja remover este cliente?
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(client.id)}>
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
