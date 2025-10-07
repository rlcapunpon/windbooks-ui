import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../api/auth';
import { setTokens, getRefreshToken, getAccessToken, clearTokens } from '../utils/tokenStorage';
import { UserService } from '../services/userService';
import { AuthContext, type AuthContextType } from './AuthContextTypes';

import type { User } from '../api/auth';

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
          // Check if we have cached user data
          const cachedUser = UserService.getCachedUserData();
          if (cachedUser) {
            // Check if token is too large for API requests
            const tokenSize = `Bearer ${accessToken}`.length;
            if (tokenSize > 8000) {
              console.log('🔧 Using cached user data due to large token size');
              setUser(cachedUser);
              setIsLoading(false);
              return;
            }
          }
          
          // Try to get current user with existing tokens
          const user = await UserService.fetchAndStoreUserData();
          setUser(user);
        } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
          // _error is intentionally unused - we handle token refresh failures silently
          // If tokens are invalid, try to refresh
          try {
            const res = await authService.refreshToken({ refreshToken });
            const { accessToken: newAccessToken } = res;
            setTokens(newAccessToken, refreshToken);
            
            // Check new token size
            const newTokenSize = `Bearer ${newAccessToken}`.length;
            if (newTokenSize > 8000) {
              console.log('🔧 Refreshed token is still too large, using cached data if available');
              const cachedUser = UserService.getCachedUserData();
              if (cachedUser) {
                setUser(cachedUser);
                setIsLoading(false);
                return;
              }
            }
            
            const user = await UserService.fetchAndStoreUserData();
            setUser(user);
          } catch (_refreshError) { // eslint-disable-line @typescript-eslint/no-unused-vars
            // _refreshError is intentionally unused - we handle refresh failures silently
            // If refresh fails, clear tokens and cache
            clearTokens();
            UserService.clearUserData();
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
      
      // Check if token is too large for API requests
      const tokenSize = `Bearer ${accessToken}`.length;
      if (tokenSize > 8000) {
        console.warn(`⚠️ Token is very large (${tokenSize} chars), unable to make authenticated API requests`);
        
        // For superadmin users with large tokens, create a minimal user object from the email
        // This is a temporary workaround until backend supports large token handling
        if (email.includes('superadmin')) {
          const fallbackUser: User = {
            id: 'temp-superadmin-id',
            email: email,
            isActive: true,
            isSuperAdmin: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            details: {
              firstName: 'Super',
              lastName: 'Admin',
              nickName: 'SuperAdmin',
              contactNumber: '',
              reportTo: {
                id: '',
                email: '',
                firstName: '',
                lastName: '',
                nickName: ''
              }
            },
            resources: []
          };
          
          console.log('🔧 Using fallback user data for superadmin with large token');
          UserService.clearUserData(); // Clear any existing cache
          localStorage.setItem('windbooks_user_data', JSON.stringify(fallbackUser));
          
          // Try to fetch RBAC permissions even with large token
          try {
            await UserService.getUserPermissionsFromRBAC();
          } catch (error) {
            console.warn('Failed to fetch RBAC permissions for superadmin with large token:', error);
            // Continue with login even if RBAC fetch fails
          }

          // Check password update history for superadmin with large token
          try {
            await UserService.getLastPasswordUpdate(fallbackUser.id);
          } catch (error) {
            console.warn('Failed to check password update history for superadmin with large token:', error);
            // Continue with login even if password update check fails
          }
          
          setUser(fallbackUser);
          return;
        }
      }
      
      // Normal flow for users with manageable token sizes
      const user = await UserService.fetchAndStoreUserData();
      
      // Fetch and cache RBAC permissions on login
      try {
        await UserService.getUserPermissionsFromRBAC();
      } catch (error) {
        console.warn('Failed to fetch RBAC permissions on login:', error);
        // Continue with login even if RBAC fetch fails
      }

      // Check password update history after successful login
      try {
        await UserService.getLastPasswordUpdate(user.id);
      } catch (error) {
        console.warn('Failed to check password update history on login:', error);
        // Continue with login even if password update check fails
      }
      
      setUser(user);
    } catch (error: unknown) {
      // Check if this is a large token authentication error
      if (error instanceof Error && error.name === 'LargeTokenError') {
        console.error('❌ Large token authentication error:', error.message);
        // Clear tokens since they can't be used
        clearTokens();
        throw new Error('Your account has authentication data that is too large for the current system. Please contact support.');
      }
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
      } catch {
        // Ignore logout errors
      }
    }
    clearTokens();
    UserService.clearUserData(); // Clear user data cache
    UserService.clearRBACPermissions(); // Clear RBAC permissions cache
    setUser(null);
  };

  const refresh = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return;
    try {
      const res = await authService.refreshToken({ refreshToken });
      const { accessToken } = res;
      setTokens(accessToken, refreshToken);
      const user = await UserService.fetchAndStoreUserData();
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