// src/pages/settings/BillingSettings.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, DollarSign } from "lucide-react"

export default function BillingSettings() {
  const billingHistory = [
    { id: 1, date: "05/08/2025", amount: "R$ 149,00", status: "Pago" },
    { id: 2, date: "05/07/2025", amount: "R$ 149,00", status: "Pago" },
    { id: 3, date: "05/06/2025", amount: "R$ 149,00", status: "Pago" },
  ]

  return (
    <div className="space-y-6">
      {/* Plano atual */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg">Plano Atual</CardTitle>
            <p className="text-sm text-muted-foreground">Profissional - R$ 149,00/mês</p>
          </div>
          <Badge variant="default">Ativo</Badge>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4">
          <div className="text-sm text-muted-foreground">
            Próxima cobrança em: <span className="font-medium text-foreground">05/09/2025</span>
          </div>
          <Button size="sm" variant="secondary">
            <CreditCard className="w-4 h-4 mr-2" />
            Atualizar forma de pagamento
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de cobranças */}
      <div>
        <h3 className="text-lg font-medium mb-2">Histórico de cobranças</h3>
        <div className="border rounded-md divide-y">
          {billingHistory.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{item.amount}</p>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
              </div>
              <Badge variant={item.status === "Pago" ? "default" : "secondary"}>
                {item.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
