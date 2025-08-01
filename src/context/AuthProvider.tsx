// src/context/auth/AuthProvider.tsx
import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './auth/AuthContext';
import type { JwtPayload, AuthUser, RegisterData, ApiErrorResponse, AuthContextType } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

axios.defaults.baseURL = API_BASE_URL;

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // >>> CORREÇÃO AQUI: Envolver JSON.parse em um try-catch para evitar que a aplicação quebre <<<
    const getStoredUser = (): AuthUser | null => {
        try {
            const userString = localStorage.getItem('user');
            if (userString) {
                return JSON.parse(userString);
            }
            return null;
        } catch (error) {
            console.error('Erro ao fazer parse do objeto de usuário no localStorage:', error);
            // Em caso de erro, limpa o user e retorna null
            localStorage.removeItem('user');
            return null;
        }
    };

    const [user, setUser] = useState<AuthUser | null>(getStoredUser());
    const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login');
    }, [navigate]);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    useEffect(() => {
      if (user && token) {
        setLoading(false);
        return;
      }
      if (token && !user) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const decodedPayload: JwtPayload = JSON.parse(window.atob(base64));

          if (decodedPayload.userId && decodedPayload.tenantId) {
              setUser({
                  id: decodedPayload.userId,
                  tenantId: decodedPayload.tenantId,
                  email: decodedPayload.email,
                  firstName: 'Carregado', 
                  lastName: 'Automaticamente',
              });
              console.log('[AuthProvider] Usuário carregado do token no localStorage.');
          }
        } catch (err) {
            console.error('[AuthProvider] Erro ao decodificar/carregar token JWT do localStorage:', err);
            logout();
        }
      }
      setLoading(false);
    }, [token, user, logout]);

    const login = async (emailParam: string, passwordParam: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`/auth/login`, { email: emailParam, password: passwordParam });
            if (response.data.token && response.data.user) {
                setToken(response.data.token);
                setUser(response.data.user);
                localStorage.setItem('jwt_token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                console.log('[AuthContext] Token e User salvos no localStorage após login.');
                return true;
            } else {
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
                localStorage.setItem('jwt_token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                console.log('[AuthContext] Token e User salvos no localStorage após registro.');
                return true;
            } else {
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