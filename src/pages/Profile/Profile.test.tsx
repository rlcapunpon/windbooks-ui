import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Profile from './index';
import { UserService } from '../../services/userService';
import type { User } from '../../api/auth';

// Mock UserService
vi.mock('../../services/userService');

// Mock tokenStorage
vi.mock('../../utils/tokenStorage');

// Mock fetch globally
global.fetch = vi.fn();

// Mock user data
const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  isActive: true,
  isSuperAdmin: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  details: {
    firstName: 'John',
    lastName: 'Doe',
    nickName: 'Johnny',
    contactNumber: '+1-555-0123',
    reportTo: {
      id: 'manager-id',
      email: 'manager@example.com',
      firstName: 'Jane',
      lastName: 'Manager',
      nickName: 'Manager'
    }
  },
  resources: [
    {
      resourceId: 'resource-1',
      role: 'STAFF'
    }
  ]
};

describe('Profile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(global.fetch).mockClear();
  });

  it('should render loading state initially', () => {
    // Mock UserService to return null initially (simulating no cached data)
    vi.spyOn(UserService, 'getCachedUserData').mockReturnValue(null);
    vi.spyOn(UserService, 'fetchAndStoreUserData').mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<Profile />);

    // Check for loading skeleton elements - just verify the component renders
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should display user profile information for non-superadmin user', async () => {
    vi.spyOn(UserService, 'getCachedUserData').mockReturnValue(mockUser);
    vi.spyOn(UserService, 'isSuperAdmin').mockReturnValue(false);
    vi.spyOn(UserService, 'getUserRoles').mockReturnValue(['STAFF', 'STAFF', 'STAFF', 'STAFF', 'APPROVER']);

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Johnny')).toBeInTheDocument();
      expect(screen.getByText('+1-555-0123')).toBeInTheDocument();
      expect(screen.getByText('staff')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('approver')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('should display reports to information for non-superadmin user', async () => {
    vi.spyOn(UserService, 'getCachedUserData').mockReturnValue(mockUser);
    vi.spyOn(UserService, 'isSuperAdmin').mockReturnValue(false);
    vi.spyOn(UserService, 'getUserRoles').mockReturnValue(['STAFF']);

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Reports To')).toBeInTheDocument();
      expect(screen.getByText('Jane Manager')).toBeInTheDocument();
      expect(screen.getByText('manager@example.com')).toBeInTheDocument();
    });
  });

  it('should not display reports to section for superadmin user', async () => {
    const superAdminUser = { ...mockUser, isSuperAdmin: true };
    vi.spyOn(UserService, 'getCachedUserData').mockReturnValue(superAdminUser);
    vi.spyOn(UserService, 'isSuperAdmin').mockReturnValue(true);
    vi.spyOn(UserService, 'getUserRoles').mockReturnValue([]);

    render(<Profile />);

    await waitFor(() => {
      expect(screen.queryByText('Reports To')).not.toBeInTheDocument();
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });
  });

  it('should handle error state', async () => {
    vi.spyOn(UserService, 'getCachedUserData').mockReturnValue(null);
    vi.spyOn(UserService, 'fetchAndStoreUserData').mockRejectedValue(new Error('API Error'));

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load profile information')).toBeInTheDocument();
    });
  });

  describe('Security and Auth Section', () => {
    it('should display Security and Auth section', async () => {
      vi.spyOn(UserService, 'getCachedUserData').mockReturnValue(mockUser);
      vi.spyOn(UserService, 'isSuperAdmin').mockReturnValue(false);
      vi.spyOn(UserService, 'getUserRoles').mockReturnValue(['STAFF']);

      // Mock tokenStorage functions
      const { getAccessToken, getUserIdFromToken } = await import('../../utils/tokenStorage');
      vi.mocked(getAccessToken).mockReturnValue('mock-token');
      vi.mocked(getUserIdFromToken).mockReturnValue('test-user-id');

      // Mock the APIs based on URL
      vi.mocked(global.fetch).mockImplementation((url) => {
        const urlString = url.toString();
        if (urlString.includes('/user/last-login')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ last_login: null })
          } as Response);
        } else if (urlString.includes('/user/last-update/creds/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              create_date: '2025-01-01T00:00:00.000Z',
              last_update: null,
              updated_by: null,
              how_many: 0
            })
          } as Response);
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      render(<Profile />);

      await waitFor(() => {
        expect(screen.getByText('Security and Auth')).toBeInTheDocument();
      });
    });

    it('should display last login information', async () => {
      vi.spyOn(UserService, 'getCachedUserData').mockReturnValue(mockUser);
      vi.spyOn(UserService, 'isSuperAdmin').mockReturnValue(false);
      vi.spyOn(UserService, 'getUserRoles').mockReturnValue(['STAFF']);

      // Mock tokenStorage functions
      const { getAccessToken, getUserIdFromToken } = await import('../../utils/tokenStorage');
      vi.mocked(getAccessToken).mockReturnValue('mock-token');
      vi.mocked(getUserIdFromToken).mockReturnValue('test-user-id');

      // Mock the APIs based on URL
      vi.mocked(global.fetch).mockImplementation((url) => {
        const urlString = url.toString();
        if (urlString.includes('/api/user/last-login')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ last_login: '2025-01-15T10:30:00.000Z' })
          } as Response);
        } else if (urlString.includes('/api/user/last-update/creds/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              create_date: '2025-01-01T00:00:00.000Z',
              last_update: '2025-01-10T14:20:00.000Z',
              updated_by: 'user-id',
              how_many: 1
            })
          } as Response);
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      render(<Profile />);

      await waitFor(() => {
        expect(screen.getByText('Last Login')).toBeInTheDocument();
        expect(screen.getByText('1/15/2025, 6:30:00 PM')).toBeInTheDocument();
      });
    });

    it('should display password change information', async () => {
      vi.spyOn(UserService, 'getCachedUserData').mockReturnValue(mockUser);
      vi.spyOn(UserService, 'isSuperAdmin').mockReturnValue(false);
      vi.spyOn(UserService, 'getUserRoles').mockReturnValue(['STAFF']);

      // Mock tokenStorage functions
      const { getAccessToken, getUserIdFromToken } = await import('../../utils/tokenStorage');
      vi.mocked(getAccessToken).mockReturnValue('mock-token');
      vi.mocked(getUserIdFromToken).mockReturnValue('test-user-id');

      // Mock the APIs based on URL
      vi.mocked(global.fetch).mockImplementation((url) => {
        const urlString = url.toString();
        if (urlString.includes('/api/user/last-login')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ last_login: null })
          } as Response);
        } else if (urlString.includes('/api/user/last-update/creds/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              create_date: '2025-01-01T00:00:00.000Z',
              last_update: '2025-01-10T14:20:00.000Z',
              updated_by: 'user-id',
              how_many: 1
            })
          } as Response);
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      render(<Profile />);

      await waitFor(() => {
        expect(screen.getByText('Last Password Change')).toBeInTheDocument();
        expect(screen.getByText('1/10/2025, 10:20:00 PM')).toBeInTheDocument();
      });
    });

    it('should display Change Password button', async () => {
      vi.spyOn(UserService, 'getCachedUserData').mockReturnValue(mockUser);
      vi.spyOn(UserService, 'isSuperAdmin').mockReturnValue(false);
      vi.spyOn(UserService, 'getUserRoles').mockReturnValue(['STAFF']);

      // Mock tokenStorage functions
      const { getAccessToken, getUserIdFromToken } = await import('../../utils/tokenStorage');
      vi.mocked(getAccessToken).mockReturnValue('mock-token');
      vi.mocked(getUserIdFromToken).mockReturnValue('test-user-id');

      // Mock the APIs based on URL
      vi.mocked(global.fetch).mockImplementation((url) => {
        const urlString = url.toString();
        if (urlString.includes('/api/user/last-login')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ last_login: null })
          } as Response);
        } else if (urlString.includes('/api/user/last-update/creds/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              create_date: '2025-01-01T00:00:00.000Z',
              last_update: null,
              updated_by: null,
              how_many: 0
            })
          } as Response);
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      render(<Profile />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Change Password' })).toBeInTheDocument();
      });
    });

    it('should open Change Password modal when button is clicked', async () => {
      vi.spyOn(UserService, 'getCachedUserData').mockReturnValue(mockUser);
      vi.spyOn(UserService, 'isSuperAdmin').mockReturnValue(false);
      vi.spyOn(UserService, 'getUserRoles').mockReturnValue(['STAFF']);

      // Mock tokenStorage functions
      const { getAccessToken, getUserIdFromToken } = await import('../../utils/tokenStorage');
      vi.mocked(getAccessToken).mockReturnValue('mock-token');
      vi.mocked(getUserIdFromToken).mockReturnValue('test-user-id');

      // Mock the APIs based on URL
      vi.mocked(global.fetch).mockImplementation((url) => {
        const urlString = url.toString();
        if (urlString.includes('/api/user/last-login')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ last_login: null })
          } as Response);
        } else if (urlString.includes('/api/user/last-update/creds/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              create_date: '2025-01-01T00:00:00.000Z',
              last_update: null,
              updated_by: null,
              how_many: 0
            })
          } as Response);
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      render(<Profile />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Change Password' })).toBeInTheDocument();
      });

      const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
      await userEvent.click(changePasswordButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
        expect(screen.getByLabelText('New Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
      });
    });
  });
});