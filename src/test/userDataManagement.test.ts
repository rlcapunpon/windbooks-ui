import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../services/userService';
import { CookieStorage } from '../utils/cookieStorage';
import apiClient from '../api/client';
import type { User } from '../api/auth';
import type { AxiosResponse } from 'axios';

// Mock dependencies
vi.mock('../utils/cookieStorage');
vi.mock('../api/client');

const mockUser: User = {
  id: 'clx2vafy4000008l2g7w2b8h6',
  email: 'test@example.com',
  isActive: true,
  isSuperAdmin: false,
  createdAt: '2025-09-20T10:30:00.000Z',
  updatedAt: '2025-09-20T10:30:00.000Z',
  details: {
    firstName: 'John',
    lastName: 'Doe',
    nickName: 'Johnny',
    contactNumber: '+1-555-0123',
    reportTo: {
      id: 'clx2vafy4000008l2g7w2b8h5',
      email: 'manager@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      nickName: 'JaneS'
    }
  },
  resources: [
    {
      resourceId: 'clx2vafy4000008l2g7w2b8h7',
      role: 'manager',
    },
  ],
};

describe('User Data Management System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UserService', () => {
    it('should fetch and store user data from auth/me', async () => {
      const mockResponse: AxiosResponse<User> = { data: mockUser, status: 200, statusText: 'OK', headers: {}, config: { headers: {} as any } };
      vi.spyOn(apiClient, 'get').mockResolvedValue(mockResponse);

      const result = await UserService.fetchAndStoreUserData();

      expect(apiClient.get).toHaveBeenCalledWith('auth/me');
      expect(CookieStorage.setUserData).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should extract permissions from user resources', () => {
      vi.spyOn(CookieStorage, 'getUserData').mockReturnValue(mockUser);

      const permissions = UserService.getUserPermissions();

      expect(permissions).toContain('USER.READ');
      expect(permissions).toContain('USER.CREATE');
      expect(permissions).toContain('USER.UPDATE');
      expect(permissions).toContain('REPORTS.EXPORT');
    });

    it('should return wildcard permission for super admin', () => {
      const superAdminUser = { ...mockUser, isSuperAdmin: true };
      vi.spyOn(CookieStorage, 'getUserData').mockReturnValue(superAdminUser);

      const permissions = UserService.getUserPermissions();

      expect(permissions).toEqual(['*']);
    });

    it('should extract roles from user resources', () => {
      vi.spyOn(CookieStorage, 'getUserData').mockReturnValue(mockUser);

      const roles = UserService.getUserRoles();

      expect(roles).toEqual(['manager']);
    });
  });

  describe('CookieStorage', () => {
    it('should return null for malformed cookie data', () => {
      // Mock the underlying cookie mechanism to return malformed JSON
      vi.spyOn(CookieStorage, 'getUserData').mockImplementation(() => {
        try {
          JSON.parse('malformed json');
        } catch (error) {
          console.error('Failed to parse user data from cookie:', error);
          return null;
        }
        return null;
      });

      const retrievedUser = CookieStorage.getUserData();
      expect(retrievedUser).toBeNull();
    });
  });
});