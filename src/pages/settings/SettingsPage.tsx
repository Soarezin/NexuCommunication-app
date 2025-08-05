// src/pages/SettingsPage.tsx
import { useState } from "react"
import GeneralSettings from "./GeneralSettings"
import EmployeesSettings from "./EmplyeeSettings"
import ClientsSettings from "./ClientsSettings"
import NotificationsSettings from "./NotificationsSettings"
import IntegrationsSettings from "./IntegrationsSettings"
import SecuritySettings from "./SecuritySettings"
import BillingSettings from "./BillingSettings"

function Tab({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      className={`px-4 py-2 border-b-2 font-medium transition-colors ${
        isActive
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-primary"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Geral")

  const tabs = [
    { label: "Geral", content: <GeneralSettings /> },
    { label: "Funcionarios", content: <EmployeesSettings /> },
    { label: "Clientes", content: <ClientsSettings /> },
    { label: "Notificações", content: <NotificationsSettings /> },
    { label: "Integrações", content: <IntegrationsSettings /> },
    { label: "Segurança", content: <SecuritySettings /> },
    { label: "Faturamento", content: <BillingSettings /> },
  ]

  const activeContent = tabs.find((tab) => tab.label === activeTab)?.content

  return (
    <div className="p-6 min-h-screen flex justify-center items-start bg-background">
      <div className="w-full max-w-4xl mx-auto bg-card text-card-foreground rounded-lg border shadow-sm p-6 space-y-6">
        <h1 className="text-2xl font-extrabold text-center">Configurações</h1>
        <div className="flex space-x-4 border-b pb-2">
          {tabs.map((tab) => (
            <Tab
              key={tab.label}
              label={tab.label}
              isActive={tab.label === activeTab}
              onClick={() => setActiveTab(tab.label)}
            />
          ))}
        </div>

        <div>{activeContent}</div>
      </div>
    </div>
  )
}
