// src/types/auth.d.ts

// Payload do JWT (o que vem no token decodificado do seu backend)
export interface JwtPayload {
    userId: string;
    tenantId: string;
    iat?: number; // Issued At
    exp?: number; // Expiration Time
    email: string; // Email do usuário, se estiver presente
    // Adicione outras propriedades que seu backend coloca no token, se houver
}

// Interface para o objeto de usuário que será armazenado no contexto
export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    tenantId: string;
    // ... adicione outros campos do usuário que você retorna no login/registro
}

// Interface para os dados de registro
export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tenantName: string;
}

// Interface para o estado do contexto de autenticação
export interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (userData: RegisterData) => Promise<boolean>;
    logout: () => void;
    loading: boolean;
    error: string | null;
}

// Interface para a resposta de erro da API do backend
export interface ApiErrorResponse {
    message?: string; // Mensagem geral do erro
    errors?: Array<{ path: string; message: string }>; // Detalhes de erros de validação (ex: Zod)
    // Adicione outras propriedades que seu backend retorna em caso de erro
}