import { useState, useEffect, type ReactNode } from 'react';
import { getMe } from '../api/auth';
import apiClient from '../api/client';
import { AuthContext, type AuthContextType } from './useAuth'; 

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getMe();
        setUser(currentUser);
      } catch (error) {
        console.error("Falha ao autenticar com token existente:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}