// src/pages/lawSuits/CreateLawsuitPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/auth/useAuth'; // Caminho para seu useAuth
import { Input } from '@/components/ui/input'; // Assumindo Shadcn UI Input
import { Button } from '@/components/ui/button'; // Assumindo Shadcn UI Button
import { Label } from '@/components/ui/label'; // Assumindo Shadcn UI Label
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Assumindo Shadcn UI Select

// Defina os status de caso válidos (deve ser o mesmo que no backend caseValidations.ts)
const VALID_CASE_STATUSES = [
    "Open",
    "In Progress",
    "Closed",
    "Pending",
    "On Hold"
];

// Tipagem para Cliente (simplificada)
interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
}

export default function CreateLawsuitPage() {
    const { clientId } = useParams<{ clientId: string }>(); // Obtém clientId da URL
    const navigate = useNavigate();
    const { token, isAuthenticated, loading: authLoading } = useAuth();

    const [client, setClient] = useState<Client | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState(VALID_CASE_STATUSES[0]); // Padrão para o primeiro status
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Efeito para buscar detalhes do cliente e garantir permissão
    useEffect(() => {
        const fetchClientDetails = async () => {
            if (!clientId || !isAuthenticated || authLoading || !token) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(`/clients/${clientId}`);
                if (response.data && response.data.client) {
                    setClient(response.data.client);
                } else {
                    setError('Cliente não encontrado ou você não tem permissão.');
                    navigate('/dashboard', { replace: true }); // Redireciona se não encontrar
                }
            } catch (err) {
                console.error("Erro ao carregar detalhes do cliente:", err);
                setError('Erro ao carregar detalhes do cliente.');
                navigate('/dashboard', { replace: true });
            } finally {
                setIsLoading(false);
            }
        };
        fetchClientDetails();
    }, [clientId, isAuthenticated, authLoading, token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!client || !token) {
            setError('Cliente inválido ou não autenticado.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const newCaseData = {
                title,
                description,
                status,
                clientId: client.id, // O clientId já vem da URL e é validado
            };
            
            const response = await axios.post('/cases', newCaseData);
            if (response.data && response.data.case) {
                setSuccessMessage(`Caso "${response.data.case.title}" criado com sucesso!`);
                // Limpar formulário ou redirecionar
                setTitle('');
                setDescription('');
                setStatus(VALID_CASE_STATUSES[0]);
                // Opcional: Redirecionar para a página do caso recém-criado
                navigate(`/lawsuit/${response.data.case.id}`, { replace: true }); 
            } else {
                setError(response.data.message || 'Falha ao criar caso.');
            }
        } catch (err: unknown) {
            console.error("Erro ao criar caso:", err);
            if (typeof err === "object" && err !== null && "response" in err) {
                const errorObj = err as { response?: { data?: { message?: string; errors?: { message: string }[] } } };
                setError(
                    errorObj.response?.data?.message ||
                    (errorObj.response?.data?.errors && errorObj.response.data.errors.map((e) => e.message).join(', ')) ||
                    'Erro ao criar caso.'
                );
            } else {
                setError('Erro ao criar caso.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="p-6 text-center">Carregando detalhes do cliente...</div>;
    }

    if (error && !client) { // Se houver um erro e o cliente não foi carregado, exibe erro fatal
        return <div className="p-6 text-center text-red-500">{error}</div>;
    }

    // Se o cliente foi carregado e não há erro, mas não há clientId na URL
    if (!clientId || !client) {
        return <div className="p-6 text-center text-red-500">ID do cliente não fornecido ou cliente inválido.</div>;
    }

    return (
        <div className="p-6 max-w-2xl mx-auto bg-white dark:bg-zinc-800 rounded-lg shadow-md mt-6">
            <h1 className="text-2xl font-bold mb-6 text-center">
                Criar Novo Caso para {client.firstName} {client.lastName}
            </h1>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="title">Título do Caso</Label>
                    <Input
                        id="title"
                        type="text"
                        placeholder="Ex: Disputa Contratual"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                        id="description"
                        type="text"
                        placeholder="Detalhes do caso"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="status" className="w-full mt-1">
                            <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                        <SelectContent>
                            {VALID_CASE_STATUSES.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Criando..." : "Criar Caso"}
                </Button>
            </form>
        </div>
    );
}