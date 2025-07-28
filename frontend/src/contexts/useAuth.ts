import { createContext, useContext } from 'react';
import type { Employee } from '../api/employees';

export interface AuthContextType {
  user: Employee | null;
  isLoading: boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}