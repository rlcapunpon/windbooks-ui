import { useState, useEffect } from 'react';
import type { User } from '../api/auth';
import { UserService } from '../services/userService';

export const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await UserService.fetchAndStoreUserData();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    await fetchUserData();
  };

  useEffect(() => {
    // Always fetch fresh data from API when dashboard loads
    fetchUserData();
  }, []);

  return {
    user,
    loading,
    error,
    refreshUserData,
    hasPermission: (permission: string) => UserService.hasPermission(permission),
    hasRole: (role: string) => UserService.hasRole(role),
    isSuperAdmin: () => UserService.isSuperAdmin(),
    isActive: () => UserService.isActive(),
    getUserResources: () => UserService.getUserResources(),
  };
};