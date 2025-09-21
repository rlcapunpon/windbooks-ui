import type { User, UserResource } from '../api/auth';
import { CookieStorage } from '../utils/cookieStorage';
import apiClient from '../api/client';

export class UserService {
  private static readonly ME_ENDPOINT = 'auth/me';

  /**
   * Fetches current user data from /api/auth/me endpoint and stores it in cookies
   */
  static async fetchAndStoreUserData(): Promise<User> {
    try {
      const response = await apiClient.get<User>(this.ME_ENDPOINT);
      const userData = response.data;

      // Store user data in cookies
      CookieStorage.setUserData(userData);

      return userData;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  }

  /**
   * Gets user data from cookies (cached data)
   */
  static getCachedUserData(): User | null {
    const minimalUser = CookieStorage.getUserData();
    if (!minimalUser) return null;

    // Convert minimal user data back to full User format for compatibility
    return {
      ...minimalUser,
      createdAt: '', // Not stored in cookies
      updatedAt: '', // Not stored in cookies
      details: minimalUser.details || {
        firstName: '',
        lastName: '',
        nickName: '',
        contactNumber: '',
        reportTo: {
          id: '',
          email: '',
          firstName: '',
          lastName: '',
          nickName: ''
        }
      }
    };
  }

  /**
   * Refreshes user data by calling /api/auth/me endpoint and updating cookies
   */
  static async refreshUserData(): Promise<User> {
    return this.fetchAndStoreUserData();
  }

  /**
   * Checks if user data exists in cookies
   */
  static hasUserData(): boolean {
    return this.getCachedUserData() !== null;
  }

  /**
   * Clears all user data from cookies
   */
  static clearUserData(): void {
    CookieStorage.clearUserData();
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
}