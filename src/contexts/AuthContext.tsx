import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../api/auth';
import { setTokens, getRefreshToken, getAccessToken, clearTokens } from '../utils/tokenStorage';

import type { User } from '../api/auth';

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
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (accessToken && refreshToken) {
        try {
          // Try to get current user with existing tokens
          const user = await authService.getCurrentUser();
          setUser(user);
        } catch (error) {
          // If tokens are invalid, try to refresh
          try {
            const res = await authService.refreshToken({ refreshToken });
            const { accessToken: newAccessToken } = res;
            setTokens(newAccessToken, refreshToken);
            const user = await authService.getCurrentUser();
            setUser(user);
          } catch (refreshError) {
            // If refresh fails, clear tokens
            clearTokens();
          }
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      const { accessToken, refreshToken } = res;
      setTokens(accessToken, refreshToken);
      const user = await authService.getCurrentUser();
      setUser(user);
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
        await authService.logout(refresh);
      } catch {}
    }
    clearTokens();
    setUser(null);
  };

  const refresh = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return;
    try {
      const res = await authService.refreshToken({ refreshToken });
      const { accessToken } = res;
      setTokens(accessToken, refreshToken);
      const user = await authService.getCurrentUser();
      setUser(user);
    } catch {
      clearTokens();
      setUser(null);
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.register({ email, password });
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