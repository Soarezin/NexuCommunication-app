// src/context/auth/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from './AuthContext'; // Importa o contexto que definimos
import type{ AuthContextType } from '../../types/auth'; // Importa a tipagem do contexto

// Hook Personalizado para Consumir o Contexto
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};