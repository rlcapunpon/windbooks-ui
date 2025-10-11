import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import { AuthContext } from '../../contexts/AuthContextTypes';
import type { User } from '../../api/auth';
import { UserService } from '../../services/userService';

// Mock the UserService
vi.mock('../../services/userService', () => ({
  UserService: {
    isSuperAdmin: vi.fn(),
    hasPermission: vi.fn(),
    getAdminStatus: vi.fn(),
  },
}));

const mockIsSuperAdmin = vi.mocked(UserService.isSuperAdmin);
const mockGetAdminStatus = vi.mocked(UserService.getAdminStatus);

// Mock the AuthContext
const mockAuthContext = {
  user: null as User | null,
  login: vi.fn(),
  logout: vi.fn(),
  refresh: vi.fn(),
  register: vi.fn(),
  isAuthenticated: false,
  isLoading: false,
};

const renderWithAuthContext = (component: React.ReactElement, contextValue = mockAuthContext) => {
  return render(
    <AuthContext.Provider value={contextValue}>
      {component}
    </AuthContext.Provider>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Organization Access Display', () => {
    it('should display organization list for SUPERADMIN users', () => {
      mockIsSuperAdmin.mockReturnValue(true);

      const mockUser: User = {
        id: '1',
        email: 'admin@example.com',
        isActive: true,
        isSuperAdmin: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        details: {
          firstName: 'Admin',
          lastName: 'User',
          nickName: 'Admin',
          contactNumber: '1234567890',
          reportTo: {
            id: '1',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            nickName: 'Admin',
          },
        },
        resources: [
          { resourceId: 'org1', resourceName: 'ABC Corporation', role: 'SUPERADMIN' },
          { resourceId: 'org2', resourceName: 'XYZ Company', role: 'SUPERADMIN' },
        ],
      };

      renderWithAuthContext(<Dashboard />, { ...mockAuthContext, user: mockUser });

      // Should show the organization list section
      expect(screen.getByText('Organization Access')).toBeInTheDocument();
      expect(screen.getByText('You have full access to all organizations and resources')).toBeInTheDocument();

      // Should show individual organization cards
      expect(screen.getByText('ABC Corporation')).toBeInTheDocument();
      expect(screen.getByText('XYZ Company')).toBeInTheDocument();
    });

    it('should display organization count for non-SUPERADMIN users with multiple organizations', () => {
      mockIsSuperAdmin.mockReturnValue(false);

      const mockUser: User = {
        id: '2',
        email: 'user@example.com',
        isActive: true,
        isSuperAdmin: false,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        details: {
          firstName: 'Regular',
          lastName: 'User',
          nickName: 'User',
          contactNumber: '1234567890',
          reportTo: {
            id: '2',
            email: 'user@example.com',
            firstName: 'Regular',
            lastName: 'User',
            nickName: 'User',
          },
        },
        resources: [
          { resourceId: 'org1', resourceName: 'Organization 1', role: 'CLIENT' },
          { resourceId: 'org2', resourceName: 'Organization 2', role: 'CLIENT' },
          { resourceId: 'org3', resourceName: 'Organization 3', role: 'CLIENT' },
        ],
      };

      renderWithAuthContext(<Dashboard />, { ...mockAuthContext, user: mockUser });

      // Should show organization count instead of list
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Organizations with limited access')).toBeInTheDocument();

      // Should not show individual organization cards
      expect(screen.queryByText('Organization org1')).not.toBeInTheDocument();
      expect(screen.queryByText('Organization org2')).not.toBeInTheDocument();
      expect(screen.queryByText('Organization org3')).not.toBeInTheDocument();
    });

    it('should display organization count for non-SUPERADMIN users with single organization', () => {
      mockIsSuperAdmin.mockReturnValue(false);

      const mockUser: User = {
        id: '3',
        email: 'user@example.com',
        isActive: true,
        isSuperAdmin: false,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        details: {
          firstName: 'Regular',
          lastName: 'User',
          nickName: 'User',
          contactNumber: '1234567890',
          reportTo: {
            id: '3',
            email: 'user@example.com',
            firstName: 'Regular',
            lastName: 'User',
            nickName: 'User',
          },
        },
        resources: [
          { resourceId: 'org1', resourceName: 'Organization 1', role: 'CLIENT' },
        ],
      };

      renderWithAuthContext(<Dashboard />, { ...mockAuthContext, user: mockUser });

      // Should show organization count
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Organization with limited access')).toBeInTheDocument();
    });

    it('should display organization count for non-SUPERADMIN users with no organizations', () => {
      mockIsSuperAdmin.mockReturnValue(false);

      const mockUser: User = {
        id: '4',
        email: 'user@example.com',
        isActive: true,
        isSuperAdmin: false,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        details: {
          firstName: 'Regular',
          lastName: 'User',
          nickName: 'User',
          contactNumber: '1234567890',
          reportTo: {
            id: '4',
            email: 'user@example.com',
            firstName: 'Regular',
            lastName: 'User',
            nickName: 'User',
          },
        },
        resources: [],
      };

      renderWithAuthContext(<Dashboard />, { ...mockAuthContext, user: mockUser });

      // Should show zero count
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Organizations with limited access')).toBeInTheDocument();
    });

    it('should not count WINDBOOKS_APP as organization for non-SUPERADMIN users', () => {
      mockIsSuperAdmin.mockReturnValue(false);

      const mockUser: User = {
        id: '6',
        email: 'user@example.com',
        isActive: true,
        isSuperAdmin: false,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        details: {
          firstName: 'Regular',
          lastName: 'User',
          nickName: 'User',
          contactNumber: '1234567890',
          reportTo: {
            id: '6',
            email: 'user@example.com',
            firstName: 'Regular',
            lastName: 'User',
            nickName: 'User',
          },
        },
        resources: [
          { resourceId: 'app1', resourceName: 'WINDBOOKS_APP', role: 'CLIENT' },
          { resourceId: 'org1', resourceName: 'Organization 1', role: 'CLIENT' },
          { resourceId: 'org2', resourceName: 'Organization 2', role: 'CLIENT' },
        ],
      };

      renderWithAuthContext(<Dashboard />, { ...mockAuthContext, user: mockUser });

      // Should show count of 2 (excluding WINDBOOKS_APP)
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Organizations with limited access')).toBeInTheDocument();
    });
  });

  describe('SUPERADMIN Dashboard Admin Status', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should call UserService.getAdminStatus for SUPERADMIN users and display admin statistics', async () => {
      mockIsSuperAdmin.mockReturnValue(true);

      // Mock successful API response
      const mockAdminStatus = {
        totalUsers: 3,
        totalResources: 3,
        activeUsers: 2,
        activeResources: 1,
        inactiveUsers: 1,
        inactiveResources: 1,
        deletedUsers: 0,
        deletedResources: 1,
        totalRoles: 2
      };

      mockGetAdminStatus.mockResolvedValueOnce(mockAdminStatus);

      const mockUser: User = {
        id: '1',
        email: 'admin@example.com',
        isActive: true,
        isSuperAdmin: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        details: {
          firstName: 'Admin',
          lastName: 'User',
          nickName: 'Admin',
          contactNumber: '1234567890',
          reportTo: {
            id: '1',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            nickName: 'Admin',
          },
        },
        resources: [
          { resourceId: 'org1', role: 'SUPERADMIN' },
        ],
      };

      renderWithAuthContext(<Dashboard />, { ...mockAuthContext, user: mockUser });

      // Wait for API call to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Verify UserService.getAdminStatus was called
      expect(mockGetAdminStatus).toHaveBeenCalledTimes(1);

      // Verify admin statistics are displayed
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Resources')).toBeInTheDocument();
      expect(screen.getByText('Roles')).toBeInTheDocument();
      
      // Check that the statistics are displayed
      expect(screen.getByText('3')).toBeInTheDocument(); // totalUsers
      const numberElements = screen.getAllByText('2');
      expect(numberElements.length).toBeGreaterThanOrEqual(2); // totalResources (3 - 1 for WINDBOOKS_APP) and totalRoles
      
      // Check specific statistics text
      expect(screen.getByText('2 active, 1 inactive')).toBeInTheDocument();
      expect(screen.getByText('1 active, 1 inactive')).toBeInTheDocument();
    });

    it('should handle API errors gracefully for admin status', async () => {
      mockIsSuperAdmin.mockReturnValue(true);

      // Mock API error
      mockGetAdminStatus.mockRejectedValueOnce(new Error('API Error'));

      const mockUser: User = {
        id: '1',
        email: 'admin@example.com',
        isActive: true,
        isSuperAdmin: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        details: {
          firstName: 'Admin',
          lastName: 'User',
          nickName: 'Admin',
          contactNumber: '1234567890',
          reportTo: {
            id: '1',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            nickName: 'Admin',
          },
        },
        resources: [
          { resourceId: 'org1', role: 'SUPERADMIN' },
        ],
      };

      renderWithAuthContext(<Dashboard />, { ...mockAuthContext, user: mockUser });

      // Wait for API call to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Verify UserService.getAdminStatus was called
      expect(mockGetAdminStatus).toHaveBeenCalledTimes(1);

      // Should still render dashboard but with placeholder data
      expect(screen.getByText('Super Admin Dashboard')).toBeInTheDocument();
    });

    it('should not call admin status API for non-SUPERADMIN users', () => {
      mockIsSuperAdmin.mockReturnValue(false);

      const mockUser: User = {
        id: '2',
        email: 'user@example.com',
        isActive: true,
        isSuperAdmin: false,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        details: {
          firstName: 'Regular',
          lastName: 'User',
          nickName: 'User',
          contactNumber: '1234567890',
          reportTo: {
            id: '2',
            email: 'user@example.com',
            firstName: 'Regular',
            lastName: 'User',
            nickName: 'User',
          },
        },
        resources: [
          { resourceId: 'org1', role: 'CLIENT' },
        ],
      };

      renderWithAuthContext(<Dashboard />, { ...mockAuthContext, user: mockUser });

      // Verify API was not called
      expect(mockGetAdminStatus).not.toHaveBeenCalled();
    });

    it('should display total of active and inactive resources for SUPERADMIN users', async () => {
      mockIsSuperAdmin.mockReturnValue(true);

      // Mock API response with specific active/inactive counts
      const mockAdminStatus = {
        totalUsers: 3,
        totalResources: 4, // Includes WINDBOOKS_APP
        activeUsers: 2,
        activeResources: 2,
        inactiveUsers: 1,
        inactiveResources: 1,
        deletedUsers: 0,
        deletedResources: 1,
        totalRoles: 2
      };

      mockGetAdminStatus.mockResolvedValueOnce(mockAdminStatus);

      const mockUser: User = {
        id: '1',
        email: 'admin@example.com',
        isActive: true,
        isSuperAdmin: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        details: {
          firstName: 'Admin',
          lastName: 'User',
          nickName: 'Admin',
          contactNumber: '1234567890',
          reportTo: {
            id: '1',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            nickName: 'Admin',
          },
        },
        resources: [
          { resourceId: 'org1', role: 'SUPERADMIN' },
        ],
      };

      renderWithAuthContext(<Dashboard />, { ...mockAuthContext, user: mockUser });

      // Wait for API call to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Verify UserService.getAdminStatus was called
      expect(mockGetAdminStatus).toHaveBeenCalledTimes(1);

      // Should display Resources count as 3 (activeResources 2 + inactiveResources 1)
      // Find the Resources card specifically and check its count
      const resourcesCard = screen.getByText('Resources').closest('.card') as HTMLElement;
      const resourcesCount = within(resourcesCard).getByText('3');
      expect(resourcesCount).toBeInTheDocument();
    });
  });
});