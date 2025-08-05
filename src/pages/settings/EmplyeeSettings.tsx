// src/pages/settings/EmployeesSettings.tsx
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Employee {
  id: string
  name: string
  email: string
  role: string
  active: boolean
}

export default function EmployeesSettings() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      name: "João Gerhardt",
      email: "joao@example.com",
      role: "admin",
      active: true,
    },
    {
      id: "2",
      name: "Maria Oliveira",
      email: "maria@example.com",
      role: "advogado",
      active: true,
    },
  ])

  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState("advogado")

  function handleInvite() {
    if (!newEmail) return
    // Aqui você integraria com backend: POST /employees/invite
    setEmployees((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: "Novo funcionário",
        email: newEmail,
        role: newRole,
        active: true,
      },
    ])
    setNewEmail("")
  }

  function handleRoleChange(id: string, newRole: string) {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, role: newRole } : emp))
    )
  }

  function handleToggleActive(id: string) {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, active: !emp.active } : emp))
    )
  }

  return (
    <div className="space-y-6">
      {/* Área de convite */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <Label htmlFor="email">E-mail do novo funcionário</Label>
          <Input
            id="email"
            type="email"
            className="mt-1"
            placeholder="email@funcionario.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </div>
        <div>
          <Label>Função</Label>
          <Select value={newRole} onValueChange={setNewRole}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione a função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="advogado">Advogado</SelectItem>
              <SelectItem value="assistente">Assistente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleInvite}>Convidar</Button>
      </div>

      {/* Lista de funcionários */}
      <div className="border rounded-md p-4 space-y-4">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div>
              <p className="font-medium">{emp.name}</p>
              <p className="text-sm text-muted-foreground">{emp.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={emp.role} onValueChange={(val) => handleRoleChange(emp.id, val)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="advogado">Advogado</SelectItem>
                  <SelectItem value="assistente">Assistente</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Switch
                  checked={emp.active}
                  onCheckedChange={() => handleToggleActive(emp.id)}
                />
                <span className="text-sm">{emp.active ? "Ativo" : "Inativo"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
