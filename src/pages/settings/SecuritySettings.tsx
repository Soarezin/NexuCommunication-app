// src/pages/settings/SecuritySettings.tsx
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Timer, KeyRound, ShieldCheck, LogOut } from "lucide-react"

export default function SecuritySettings() {
    const [twoFAEnabled, setTwoFAEnabled] = useState(false)
    const [autoLogoutMinutes, setAutoLogoutMinutes] = useState(15)

    const mockSessions = [
        { id: 1, device: "Chrome - Windows", location: "Porto Alegre, BR", active: true },
        { id: 2, device: "Safari - iPhone", location: "São Paulo, BR", active: false },
    ]

    return (
        <div className="space-y-6">
            {/* 2FA */}
            <div className="border rounded-lg p-4 bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <p className="font-medium">Autenticação em duas etapas (2FA)</p>
                        <p className="text-sm text-muted-foreground">Exige um código adicional ao fazer login.</p>
                    </div>
                </div>
                <Switch checked={twoFAEnabled} onCheckedChange={setTwoFAEnabled} />
            </div>

            {/* Logout automático */}
            <div className="border rounded-lg p-4 bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Timer className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <p className="font-medium">Logout automático por inatividade</p>
                        <p className="text-sm text-muted-foreground">Desconectar usuário após tempo inativo.</p>
                    </div>
                </div>
                <Select
                    onValueChange={(value) => setAutoLogoutMinutes(Number(value))}
                    defaultValue={autoLogoutMinutes.toString()}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5 min</SelectItem>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Sessões ativas */}
            <div>
                <h3 className="text-lg font-medium mb-2">Sessões ativas</h3>
                <div className="border rounded-md divide-y">
                    {mockSessions.map((session) => (
                        <div key={session.id} className="flex justify-between items-center p-3">
                            <div>
                                <p className="font-medium">{session.device}</p>
                                <p className="text-sm text-muted-foreground">{session.location}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {session.active ? (
                                    <span className="text-xs text-green-600">Ativa</span>
                                ) : (
                                    <span className="text-xs text-muted-foreground">Inativa</span>
                                )}
                                <Button variant="ghost" size="sm">
                                    <LogOut className="w-4 h-4 mr-1" />
                                    Encerrar
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reset geral */}
            <div className="flex justify-end">
                <Button variant="destructive" size="sm">
                    <KeyRound className="w-4 h-4 mr-1" />
                    Resetar senhas de todos os funcionários
                </Button>
            </div>
        </div>
    )
}
