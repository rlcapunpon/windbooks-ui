import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from './userService';
import apiClient from '../api/client';

// Mock the API client
vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockClear();
    mockPost.mockClear();
  });

  describe('searchResources', () => {
    it('should extract data array from API response with pagination', async () => {
      const mockApiResponse = {
        data: {
          data: [
            {
              id: 'cmg95g0wk0004n3m8xtdyl8si',
              name: 'Ramon Corp',
              description: 'Organization Ramon Corp (123456789000)',
              createdAt: '2025-10-02T08:24:28.821Z',
              updatedAt: '2025-10-02T08:24:28.821Z'
            },
            {
              id: 'cmg95degc0004n30oo3sr6oxn',
              name: 'WINDBOOKS_APP',
              description: 'Main frontend application resource for global role assignments',
              createdAt: '2025-10-02T08:22:26.413Z',
              updatedAt: '2025-10-02T08:22:26.413Z'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          }
        }
      };

      mockGet.mockResolvedValue(mockApiResponse);

      const result = await UserService.searchResources('test query');

      expect(mockGet).toHaveBeenCalledWith('/resources/v2', {
        params: { page: 1, limit: 10, q: 'test query' }
      });

      expect(result).toEqual([
        {
          id: 'cmg95g0wk0004n3m8xtdyl8si',
          name: 'Ramon Corp',
          description: 'Organization Ramon Corp (123456789000)',
          createdAt: '2025-10-02T08:24:28.821Z',
          updatedAt: '2025-10-02T08:24:28.821Z'
        },
        {
          id: 'cmg95degc0004n30oo3sr6oxn',
          name: 'WINDBOOKS_APP',
          description: 'Main frontend application resource for global role assignments',
          createdAt: '2025-10-02T08:22:26.413Z',
          updatedAt: '2025-10-02T08:22:26.413Z'
        }
      ]);
    });

    it('should return empty array when API response has no data', async () => {
      const mockApiResponse = {
        data: {
          data: null,
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        }
      };

      mockGet.mockResolvedValue(mockApiResponse);

      const result = await UserService.searchResources('nonexistent');

      expect(result).toEqual([]);
    });

    it('should return empty array when API response is malformed', async () => {
      const mockApiResponse = {
        data: {}
      };

      mockGet.mockResolvedValue(mockApiResponse);

      const result = await UserService.searchResources('test');

      expect(result).toEqual([]);
    });

    it('should handle API errors properly', async () => {
      const mockError = new Error('API Error');
      mockGet.mockRejectedValue(mockError);

      await expect(UserService.searchResources('test')).rejects.toThrow('API Error');
    });

    it('should include pagination parameters in request', async () => {
      const mockApiResponse = {
        data: {
          data: [],
          pagination: { page: 2, limit: 5, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
        }
      };

      mockGet.mockResolvedValue(mockApiResponse);

      await UserService.searchResources('test', 2, 5);

      expect(mockGet).toHaveBeenCalledWith('/resources/v2', {
        params: { page: 2, limit: 5, q: 'test' }
      });
    });

    it('should not include query parameter when query is empty', async () => {
      const mockApiResponse = {
        data: {
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
        }
      };

      mockGet.mockResolvedValue(mockApiResponse);

      await UserService.searchResources('');

      expect(mockGet).toHaveBeenCalledWith('/resources/v2', {
        params: { page: 1, limit: 10 }
      });
    });
  });

  describe('getAvailableRoles', () => {
    it('should call /roles/available endpoint', async () => {
      const mockRolesResponse = {
        data: [
          { id: 'role-1', name: 'ADMIN', description: 'Administrator role' },
          { id: 'role-2', name: 'CLIENT', description: 'Client role' }
        ]
      };

      mockGet.mockResolvedValue(mockRolesResponse);

      const result = await UserService.getAvailableRoles();

      expect(mockGet).toHaveBeenCalledWith('/roles/available');
      expect(result).toEqual([
        { id: 'role-1', name: 'ADMIN', description: 'Administrator role' },
        { id: 'role-2', name: 'CLIENT', description: 'Client role' }
      ]);
    });

    it('should handle API errors properly', async () => {
      const mockError = new Error('Roles API Error');
      mockGet.mockRejectedValue(mockError);

      await expect(UserService.getAvailableRoles()).rejects.toThrow('Roles API Error');
    });
  });

  describe('assignRole', () => {
    it('should call POST /users/assign-role with roleId', async () => {
      mockPost.mockResolvedValue({ data: {} });

      await UserService.assignRole('user-123', 'resource-456', 'role-789');

      expect(mockPost).toHaveBeenCalledWith('/users/assign-role', {
        userId: 'user-123',
        resourceId: 'resource-456',
        roleId: 'role-789'
      });
    });

    it('should handle assignment errors properly', async () => {
      const mockError = new Error('Assignment API Error');
      mockPost.mockRejectedValue(mockError);

      await expect(UserService.assignRole('user-123', 'resource-456', 'role-789')).rejects.toThrow('Assignment API Error');
    });
  });

  describe('getUserPermissionsFromRBAC', () => {
    it('should fetch user permissions from RBAC API for WINDBOOKS_APP resource', async () => {
      const mockResponse = {
        resourceId: 'cmga8vhx10000n3q4mqfdvqea',
        roleId: 'cmga8vhx50002n3q4abc123def',
        role: 'STAFF',
        permissions: ['user:read', 'resource:read']
      };

      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await UserService.getUserPermissionsFromRBAC();

      expect(mockGet).toHaveBeenCalledWith('/permission', {
        params: { resourceName: 'WINDBOOKS_APP' }
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('RBAC API Error');
      mockGet.mockRejectedValue(mockError);

      await expect(UserService.getUserPermissionsFromRBAC()).rejects.toThrow('RBAC API Error');
    });

    it('should handle 404 error when user has no role for WINDBOOKS_APP', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'No role found for this user on the specified resource' }
        }
      };
      mockGet.mockRejectedValue(mockError);

      await expect(UserService.getUserPermissionsFromRBAC()).rejects.toThrow();
    });
  });

  describe('getLastPasswordUpdate', () => {
    it('should fetch user password update history successfully', async () => {
      const mockUserId = 'user-123';
      const mockPasswordData = {
        create_date: '2024-01-01T00:00:00Z',
        last_update: '2024-06-01T00:00:00Z',
        updated_by: 'SUPERADMIN',
        how_many: 2
      };

      mockGet.mockResolvedValue({ data: mockPasswordData });

      const result = await UserService.getLastPasswordUpdate(mockUserId);

      expect(mockGet).toHaveBeenCalledWith(`/user/last-update/creds/${mockUserId}`);
      expect(result).toEqual(mockPasswordData);
    });

    it('should handle API response when user has never updated password', async () => {
      const mockUserId = 'user-456';
      const mockPasswordData = {
        create_date: '2024-01-01T00:00:00Z',
        last_update: null,
        updated_by: null,
        how_many: 0
      };

      mockGet.mockResolvedValue({ data: mockPasswordData });

      const result = await UserService.getLastPasswordUpdate(mockUserId);

      expect(mockGet).toHaveBeenCalledWith(`/user/last-update/creds/${mockUserId}`);
      expect(result).toEqual(mockPasswordData);
    });

    it('should handle API errors gracefully', async () => {
      const mockUserId = 'user-789';
      const mockError = new Error('API Error');
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGet.mockRejectedValue(mockError);

      await expect(UserService.getLastPasswordUpdate(mockUserId)).rejects.toThrow('API Error');
      
      expect(mockGet).toHaveBeenCalledWith(`/user/last-update/creds/${mockUserId}`);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch last password update:', mockError);
      consoleErrorSpy.mockRestore();
    });
  });
});