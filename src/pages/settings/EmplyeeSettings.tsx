import { useEffect, useState } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Employee {
  id: string
  name: string
  email: string
  role: "Admin" | "Lawyer" 
  isActive: boolean
  status: "Active" | "Pending" | "Suspended" | "Revoked"
}

export default function EmployeesSettings() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState<Employee["role"]>("Lawyer")

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("/users")
        setEmployees(response.data.users) // ou .data dependendo da estrutura da resposta
      } catch (err) {
        console.error("Erro ao buscar funcionários:", err)
      }
    }

    fetchEmployees()
  }, [])

  function handleInvite() {
    // Aqui você enviaria um POST para /users/invite, etc.
    setNewEmail("")
  }

  function handleRoleChange(id: string, newRole: Employee["role"]) {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, role: newRole } : emp))
    )
    // Aqui você pode fazer um PUT /users/:id com o novo role
  }

  function handleToggleActive(id: string) {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id
          ? {
              ...emp,
              status: emp.status === "Active" ? "Suspended" : "Active",
            }
          : emp
      )
    )
    // Aqui você pode fazer um PUT /users/:id com o novo status
  }

  return (
    <div className="space-y-6">
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
          <Select value={newRole} onValueChange={(value) => setNewRole(value as Employee["role"])}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione a função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Lawyer">Advogado</SelectItem>
              <SelectItem value="Paralegal">Assistente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleInvite}>Convidar</Button>
      </div>

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
              <Select
                value={emp.role}
                onValueChange={(val) => handleRoleChange(emp.id, val as Employee["role"])}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Lawyer">Advogado</SelectItem>
                  <SelectItem value="Paralegal">Assistente</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Switch
                  checked={emp.isActive}
                  onCheckedChange={() => handleToggleActive(emp.id)}
                />
                <span className="text-sm">
                  {emp.isActive ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
