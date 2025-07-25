// src/context/auth/AuthContext.ts
import { createContext } from 'react';
import { type AuthContextType } from '../../types/auth.d';

// Crie o contexto com um valor padrão undefined.
// O AuthProvider será responsável por fornecer o valor real.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);