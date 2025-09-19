import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import apiClient from '../api/client';
import { setTokens, getRefreshToken, clearTokens } from '../utils/tokenStorage';

interface User {
  id: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { accessToken, refreshToken } = res.data;
      setTokens(accessToken, refreshToken);
      const userRes = await apiClient.get('/auth/me');
      setUser(userRes.data);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        await apiClient.post('/auth/logout', { refreshToken: refresh });
      } catch {}
    }
    clearTokens();
    setUser(null);
  };

  const refresh = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return;
    try {
      const res = await apiClient.post('/auth/refresh', { refreshToken });
      const { accessToken } = res.data;
      setTokens(accessToken, refreshToken);
      const userRes = await apiClient.get('/auth/me');
      setUser(userRes.data);
    } catch {
      clearTokens();
      setUser(null);
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/register', { email, password });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    refresh,
    register,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};;