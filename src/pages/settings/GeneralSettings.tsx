import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const TENANT_ID = localStorage.getItem("tenantId");

export default function GeneralSettings() {
  const [businessName, setBusinessName] = useState("");
  const [theme, setTheme] = useState("system");
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`/settings/general/${TENANT_ID}`);
        const data = response.data.settings;

        if (data) {
          setBusinessName(data.businessName || "");
          setTheme(data.theme || "system");
          setWorkingDays(data.workingDays || []);
          setStartHour(data.workingHours?.start || "");
          setEndHour(data.workingHours?.end || "");
        }
      } catch (err) {
        console.error("Erro ao buscar configurações:", err);
        setError("Erro ao buscar dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const toggleDay = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`/settings/general/${TENANT_ID}`, {
        businessName,
        theme,
        workingDays,
        workingHours: { start: startHour, end: endHour },
      });

      toast.success("Configurações salvas com sucesso!");
      setTimeout(() => location.reload(), 1000); // Pequeno delay para dar tempo do toast aparecer
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
      setError("Erro ao salvar.");
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="space-y-6">
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-2">
        <Label htmlFor="businessName">Nome do Escritório</Label>
        <Input
          id="businessName"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="theme">Tema</Label>
        <select
          id="theme"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
          <option value="system">Sistema</option>
        </select>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Dias de Funcionamento</Label>
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day) => (
            <Button
              key={day}
              variant={workingDays.includes(day) ? "default" : "outline"}
              onClick={() => toggleDay(day)}
            >
              {day}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="startHour">Hora de Início</Label>
          <Input
            type="time"
            id="startHour"
            value={startHour}
            onChange={(e) => setStartHour(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="endHour">Hora de Término</Label>
          <Input
            type="time"
            id="endHour"
            value={endHour}
            onChange={(e) => setEndHour(e.target.value)}
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Salvando..." : "Salvar"}
      </Button>
    </div>
  );
}
