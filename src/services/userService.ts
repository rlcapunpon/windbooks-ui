import type { User, UserResource } from '../api/auth';
import apiClient from '../api/client';
import { getAccessToken, getUserIdFromToken } from '../utils/tokenStorage';

export class UserService {
  private static readonly ME_ENDPOINT = 'auth/me';

  /**
   * Fetches current user data from /api/auth/me endpoint
   */
  static async fetchAndStoreUserData(): Promise<User> {
    try {
      const response = await apiClient.get<User>(this.ME_ENDPOINT);
      const userData = response.data;

      // Store user data in localStorage for caching
      localStorage.setItem('windbooks_user_data', JSON.stringify(userData));

      return userData;
    } catch (error: any) {
      // Check if this is related to large token issues
      const token = getAccessToken();
      if (token && token.length > 8000) {
        console.warn('⚠️ Authentication failed possibly due to large token size');
        console.log('🔄 This requires backend support for large token authentication');
        
        // For now, we'll throw a more descriptive error
        const enhancedError = new Error(
          'Authentication failed due to large token size. Please contact support or try logging out and back in.'
        );
        enhancedError.name = 'LargeTokenError';
        throw enhancedError;
      }
      
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  }

  /**
   * Gets user data from localStorage cache
   */
  static getCachedUserData(): User | null {
    try {
      const cached = localStorage.getItem('windbooks_user_data');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to parse cached user data:', error);
      return null;
    }
  }

  /**
   * Refreshes user data by calling /api/auth/me endpoint
   */
  static async refreshUserData(): Promise<User> {
    return this.fetchAndStoreUserData();
  }

  /**
   * Checks if user data exists in cache
   */
  static hasUserData(): boolean {
    return this.getCachedUserData() !== null;
  }

  /**
   * Clears all user data from cache
   */
  static clearUserData(): void {
    localStorage.removeItem('windbooks_user_data');
  }

  /**
   * Gets user roles from cached data
   */
  static getUserRoles(): string[] {
    const user = this.getCachedUserData();
    return user?.resources?.map(resource => resource.role) || [];
  }

  /**
   * Gets user permissions from cached data
   */
  static getUserPermissions(): string[] {
    const user = this.getCachedUserData();
    const roles = this.getUserRoles();
    const permissions: string[] = [];

    // Check if user is super admin
    if (user?.isSuperAdmin) {
      permissions.push('*'); // All permissions
      return permissions;
    }

    // Map roles to permissions
    roles.forEach(role => {
      switch (role.toLowerCase()) {
        case 'admin':
          permissions.push('USER.READ', 'USER.CREATE', 'USER.UPDATE', 'USER.DELETE', 'SETTINGS.MANAGE', 'REPORTS.EXPORT');
          break;
        case 'manager':
          permissions.push('USER.READ', 'USER.CREATE', 'USER.UPDATE', 'REPORTS.EXPORT');
          break;
        case 'editor':
          permissions.push('USER.READ', 'USER.UPDATE', 'REPORTS.EXPORT');
          break;
        case 'viewer':
        default:
          permissions.push('USER.READ');
          break;
      }
    });

    return [...new Set(permissions)]; // Remove duplicates
  }

  /**
   * Checks if user has specific permission
   */
  static hasPermission(permission: string): boolean {
    const permissions = this.getUserPermissions();
    return permissions.includes('*') || permissions.includes(permission);
  }

  /**
   * Checks if user has specific role
   */
  static hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(role);
  }

  /**
   * Checks if user is super admin
   */
  static isSuperAdmin(): boolean {
    const user = this.getCachedUserData();
    return user?.isSuperAdmin || false;
  }

  /**
   * Checks if user account is active
   */
  static isActive(): boolean {
    const user = this.getCachedUserData();
    return user?.isActive || false;
  }

  /**
   * Gets user's resource roles
   */
  static getUserResources(): UserResource[] {
    const user = this.getCachedUserData();
    return user?.resources || [];
  }

  /**
   * Updates user details.
   */
  static async updateUserDetails(userDetails: Partial<User['details']>) {
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        throw new Error('Unable to get user ID from token');
      }

      const response = await apiClient.put(`/user-details/${userId}`, userDetails);
      // After a successful update, refresh the user data in local storage
      await this.fetchAndStoreUserData();
      return response.data;
    } catch (error) {
      console.error('Failed to update user details:', error);
      throw error;
    }
  }
}
