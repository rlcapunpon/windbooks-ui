import { render, screen } from '@testing-library/react';
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
  },
}));

const mockIsSuperAdmin = vi.mocked(UserService.isSuperAdmin);

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
          { resourceId: 'org1', role: 'SUPERADMIN' },
          { resourceId: 'org2', role: 'SUPERADMIN' },
        ],
      };

      renderWithAuthContext(<Dashboard />, { ...mockAuthContext, user: mockUser });

      // Should show the organization list section
      expect(screen.getByText('Organization Access')).toBeInTheDocument();
      expect(screen.getByText('You have full access to all organizations and resources')).toBeInTheDocument();

      // Should show individual organization cards
      expect(screen.getByText('Organization org1')).toBeInTheDocument();
      expect(screen.getByText('Organization org2')).toBeInTheDocument();
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
          { resourceId: 'org1', role: 'CLIENT' },
          { resourceId: 'org2', role: 'CLIENT' },
          { resourceId: 'org3', role: 'CLIENT' },
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
          { resourceId: 'org1', role: 'CLIENT' },
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

    it('should handle users with no resources gracefully', () => {
      mockIsSuperAdmin.mockReturnValue(false);

      const mockUser: User = {
        id: '5',
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
            id: '5',
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
  });
});