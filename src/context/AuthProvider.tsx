// src/context/auth/AuthProvider.tsx
import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './auth/AuthContext'; 
import type { JwtPayload, AuthUser, RegisterData, ApiErrorResponse, AuthContextType } from '../types/auth';

// Defina a URL base da sua API do backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

axios.defaults.baseURL = API_BASE_URL;

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // >>> Alterado para sessionStorage.getItem <<<
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(sessionStorage.getItem('jwt_token')); 
    const [loading, setLoading] = useState<boolean>(true); 
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        // >>> Alterado para sessionStorage.removeItem <<<
        sessionStorage.removeItem('jwt_token');
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login');
    }, [navigate]);

    // Efeito para verificar o token no carregamento da aplicação
    useEffect(() => {
        const loadUserFromToken = () => {
            if (token) {
                try {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const decodedPayload: JwtPayload = JSON.parse(window.atob(base64));

                    if (decodedPayload.exp && decodedPayload.exp * 1000 < Date.now()) {
                        console.warn('[AuthProvider] Token JWT expirado localmente.');
                        logout();
                        return;
                    }

                    if (decodedPayload.id && decodedPayload.tenantId) {
                        setUser({
                            id: decodedPayload.id,
                            tenantId: decodedPayload.tenantId,
                            email: 'carregado@example.com', 
                            firstName: 'Carregado', 
                            lastName: 'Automaticamente', 
                        });
                        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                        console.log('[AuthProvider] Token carregado e setado no Axios defaults.');
                    } else {
                        console.warn('[AuthProvider] Token JWT inválido ou incompleto no sessionStorage.');
                        setToken(null);
                        sessionStorage.removeItem('jwt_token');
                        logout();
                    }
                } catch (err) {
                    console.error('[AuthProvider] Erro ao decodificar/carregar token JWT:', err);
                    setToken(null);
                    sessionStorage.removeItem('jwt_token');
                    logout();
                }
            }
            setLoading(false); 
        };

        setLoading(true); 
        loadUserFromToken();
    }, [token, logout]);

    // Configurar interceptor do Axios para lidar com erros de autenticação (401/403)
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use((config) => {
            if (token && !config.headers.Authorization) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (err) => {
            return Promise.reject(err);
        });

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (err: unknown) => {
                if (axios.isAxiosError(err) && err.response) {
                    if (err.response.status === 401 || err.response.status === 403) {
                        console.warn('Token expirado ou inválido detectado pelo interceptor. Redirecionando para login.');
                    }
                }
                return Promise.reject(err);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [token, logout]);

    const login = async (emailParam: string, passwordParam: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`/auth/login`, { email: emailParam, password: passwordParam });
            if (response.data.token && response.data.user) {
                setToken(response.data.token);
                setUser(response.data.user);
                // >>> Alterado para sessionStorage.setItem <<<
                sessionStorage.setItem('jwt_token', response.data.token);
                console.log('[AuthContext] Token salvo no sessionStorage após login:', response.data.token.substring(0, 30) + '...');
                return true;
            } else {
                console.log('[AuthContext] Login falhou: Token ou usuário ausente na resposta.');
                setError(response.data.message || 'Credenciais inválidas.');
                return false;
            }
        } catch (err: unknown) {
            let errorMessage = 'Erro desconhecido ao fazer login.';
            if (axios.isAxiosError(err) && err.response) {
                const apiError = err.response.data as ApiErrorResponse;
                errorMessage = apiError.message || errorMessage;
                if (apiError.errors && apiError.errors.length > 0) {
                    errorMessage = apiError.errors.map(e => e.message).join(', ');
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            console.error('Erro no login:', err);
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false); 
        }
    };

    const register = async (userData: RegisterData): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`/auth/register`, userData);
            if (response.data.token && response.data.user) {
                setToken(response.data.token);
                setUser(response.data.user);
                // >>> Alterado para sessionStorage.setItem <<<
                sessionStorage.setItem('jwt_token', response.data.token);
                console.log('[AuthContext] Token salvo no sessionStorage após registro:', response.data.token.substring(0, 30) + '...');
                return true;
            } else {
                console.log('[AuthContext] Registro falhou: Token ou usuário ausente na resposta.');
                const apiError = response.data as ApiErrorResponse;
                let msg = apiError.message || 'Erro no registro.';
                if (apiError.errors && apiError.errors.length > 0) {
                    msg = apiError.errors.map(e => e.message).join(', ');
                }
                setError(msg);
                return false;
            }
        } catch (err: unknown) {
            let errorMessage = 'Erro desconhecido ao registrar.';
            if (axios.isAxiosError(err) && err.response) {
                const apiError = err.response.data as ApiErrorResponse;
                errorMessage = apiError.message || errorMessage;
                if (apiError.errors && apiError.errors.length > 0) {
                    errorMessage = apiError.errors.map(e => e.message).join(', ');
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            console.error('Erro no registro:', err);
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const authContextValue: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        loading,
        error,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};