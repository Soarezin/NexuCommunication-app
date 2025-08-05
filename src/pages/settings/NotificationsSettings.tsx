import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Mail, Smartphone, MessageCircle, FileText, CaseSensitive, PenTool } from "lucide-react"

export default function NotificationsSettings() {
  const [channels, setChannels] = useState({
    email: true,
    whatsapp: false,
    app: true,
  })

  const [events, setEvents] = useState({
    newMessage: true,
    caseUpdate: true,
    newDocument: false,
    signatureRequest: true,
  })

  function toggleChannel(key: keyof typeof channels) {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleEvent(key: keyof typeof events) {
    setEvents((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-8">
      {/* Seção: Canais */}
      <section>
        <h3 className="text-lg font-medium mb-4">Canais de envio</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">E-mail</p>
                <p className="text-sm text-muted-foreground">Enviar notificações por e-mail</p>
              </div>
            </div>
            <Switch checked={channels.email} onCheckedChange={() => toggleChannel("email")} />
          </div>

          <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">WhatsApp</p>
                <p className="text-sm text-muted-foreground">Notificações pelo número do cliente</p>
              </div>
            </div>
            <Switch checked={channels.whatsapp} onCheckedChange={() => toggleChannel("whatsapp")} />
          </div>

          <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/50 md:col-span-2">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">App</p>
                <p className="text-sm text-muted-foreground">Notificações dentro da plataforma</p>
              </div>
            </div>
            <Switch checked={channels.app} onCheckedChange={() => toggleChannel("app")} />
          </div>
        </div>
      </section>

      {/* Seção: Eventos */}
      <section>
        <h3 className="text-lg font-medium mb-4">Eventos notificados</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Nova mensagem no chat</p>
                <p className="text-sm text-muted-foreground">Quando alguém envia uma nova mensagem</p>
              </div>
            </div>
            <Switch checked={events.newMessage} onCheckedChange={() => toggleEvent("newMessage")} />
          </div>

          <div className="flex items-center justify-between border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CaseSensitive className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Atualização de caso</p>
                <p className="text-sm text-muted-foreground">Quando um caso é alterado ou movido</p>
              </div>
            </div>
            <Switch checked={events.caseUpdate} onCheckedChange={() => toggleEvent("caseUpdate")} />
          </div>

          <div className="flex items-center justify-between border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Novo documento</p>
                <p className="text-sm text-muted-foreground">Ao anexar um novo documento ao caso</p>
              </div>
            </div>
            <Switch checked={events.newDocument} onCheckedChange={() => toggleEvent("newDocument")} />
          </div>

          <div className="flex items-center justify-between border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <PenTool className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Solicitação de assinatura</p>
                <p className="text-sm text-muted-foreground">Quando um cliente precisa assinar algo</p>
              </div>
            </div>
            <Switch checked={events.signatureRequest} onCheckedChange={() => toggleEvent("signatureRequest")} />
          </div>
        </div>
      </section>
    </div>
  )
}
