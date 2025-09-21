import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../services/userService';
import apiClient from '../api/client';
import { getUserIdFromToken } from '../utils/tokenStorage';
import type { User } from '../api/auth';
import type { AxiosResponse } from 'axios';

// Mock dependencies
vi.mock('../api/client');
vi.mock('../utils/tokenStorage', () => ({
  getAccessToken: vi.fn(),
  getUserIdFromToken: vi.fn()
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

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
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('UserService', () => {
    it('should fetch and store user data from auth/me', async () => {
      const mockResponse: AxiosResponse<User> = { 
        data: mockUser, 
        status: 200, 
        statusText: 'OK', 
        headers: {}, 
        config: { headers: {} as any } 
      };
      vi.spyOn(apiClient, 'get').mockResolvedValue(mockResponse);

      const result = await UserService.fetchAndStoreUserData();

      expect(apiClient.get).toHaveBeenCalledWith('auth/me');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('windbooks_user_data', JSON.stringify(mockUser));
      expect(result).toEqual(mockUser);
    });

    it('should extract permissions from user resources', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));

      const permissions = UserService.getUserPermissions();

      expect(permissions).toContain('USER.READ');
      expect(permissions).toContain('USER.CREATE');
      expect(permissions).toContain('USER.UPDATE');
      expect(permissions).toContain('REPORTS.EXPORT');
    });

    it('should return wildcard permission for super admin', () => {
      const superAdminUser = { ...mockUser, isSuperAdmin: true };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(superAdminUser));

      const permissions = UserService.getUserPermissions();

      expect(permissions).toEqual(['*']);
    });

    it('should return cached user data from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));

      const cachedUser = UserService.getCachedUserData();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('windbooks_user_data');
      expect(cachedUser).toEqual(mockUser);
    });

    it('should return null when no cached user data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const cachedUser = UserService.getCachedUserData();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('windbooks_user_data');
      expect(cachedUser).toBeNull();
    });

    it('should correctly identify super admin status from cached data', () => {
      const superAdminUser = { ...mockUser, isSuperAdmin: true };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(superAdminUser));

      const isSuperAdmin = UserService.isSuperAdmin();

      expect(isSuperAdmin).toBe(true);
    });

    it('should correctly identify non-super admin status from cached data', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));

      const isSuperAdmin = UserService.isSuperAdmin();

      expect(isSuperAdmin).toBe(false);
    });

    it('should handle large tokens and throw appropriate error', async () => {
      const mockLargeToken = 'x'.repeat(10000); // 10KB token
      
      // Mock getAccessToken to return a large token
      const { getAccessToken } = await import('../utils/tokenStorage');
      vi.mocked(getAccessToken).mockReturnValue(mockLargeToken);

      vi.spyOn(apiClient, 'get').mockRejectedValue({
        response: { status: 401 },
        message: 'Unauthorized'
      });

      await expect(UserService.fetchAndStoreUserData()).rejects.toThrow(
        expect.objectContaining({
          name: 'LargeTokenError',
          message: expect.stringContaining('large token size')
        })
      );
    });

    it('should clear user data from localStorage', () => {
      UserService.clearUserData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('windbooks_user_data');
    });

    it('should update user details and return refreshed user data', async () => {
      const updatedDetails = { firstName: 'Updated', lastName: 'Name' };
      const updatedUser = { ...mockUser, details: { ...mockUser.details, ...updatedDetails } };

      // Mock the API call
      (apiClient.put as any).mockResolvedValue({ data: { success: true } });
      // Mock fetchAndStoreUserData to return updated user
      const fetchSpy = vi.spyOn(UserService, 'fetchAndStoreUserData').mockResolvedValue(updatedUser);
      // Mock getUserIdFromToken
      vi.mocked(getUserIdFromToken).mockReturnValue('test-user-id');

      const result = await UserService.updateUserDetails(updatedDetails);

      expect(apiClient.put).toHaveBeenCalledWith('/user-details/test-user-id', updatedDetails);
      expect(fetchSpy).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });
  });

  describe('LocalStorage Error Handling', () => {
    it('should return null for malformed localStorage data', () => {
      localStorageMock.getItem.mockReturnValue('malformed json');

      const cachedUser = UserService.getCachedUserData();

      expect(cachedUser).toBeNull();
    });
  });
});