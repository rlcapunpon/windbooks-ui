import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Profile from './index';
import { UserService } from '../../services/userService';
import type { User } from '../../api/auth';

// Mock UserService
vi.mock('../../services/userService');

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
});