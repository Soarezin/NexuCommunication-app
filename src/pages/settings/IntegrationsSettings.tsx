// src/pages/settings/IntegrationsSettings.tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  FileSignature,
  Calendar,
  Mail,
  Network,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  connected: boolean
}

const initialIntegrations: Integration[] = [
  {
    id: "d4sign",
    name: "Assinatura Digital (D4Sign)",
    description: "Permite enviar documentos para assinatura eletrônica com validade jurídica.",
    icon: <FileSignature className="w-5 h-5 text-muted-foreground" />,
    connected: false,
  },
  {
    id: "smtp",
    name: "E-mail personalizado (SMTP)",
    description: "Configure seu próprio servidor de e-mail para envio de notificações.",
    icon: <Mail className="w-5 h-5 text-muted-foreground" />,
    connected: true,
  },
  {
    id: "calendar",
    name: "Google Calendar",
    description: "Sincronize compromissos e prazos com seu calendário do Google.",
    icon: <Calendar className="w-5 h-5 text-muted-foreground" />,
    connected: false,
  },
  {
    id: "webhooks",
    name: "Webhooks",
    description: "Envie eventos do sistema para outros serviços (ex: CRMs, ERPs).",
    icon: <Network className="w-5 h-5 text-muted-foreground" />,
    connected: true,
  },
]

export default function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations)

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, connected: !item.connected } : item
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        {integrations.map((item) => (
          <div key={item.id} className="flex flex-col justify-between border rounded-lg p-4 bg-muted/50 space-y-2">
            <div className="flex items-center gap-3">
              {item.icon}
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <div>
                {item.connected ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>

            <Button
              size="sm"
              variant={item.connected ? "secondary" : "default"}
              onClick={() => toggleIntegration(item.id)}
            >
              {item.connected ? "Desconectar" : "Conectar"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
