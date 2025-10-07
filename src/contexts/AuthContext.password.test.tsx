import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from './AuthContextTypes';
import { UserService } from '../services/userService';
import { authService } from '../api/auth';
import * as tokenStorage from '../utils/tokenStorage';

// Mock dependencies
vi.mock('../services/userService');
vi.mock('../api/auth');
vi.mock('../utils/tokenStorage');

const mockAuthService = vi.mocked(authService);
const mockUserService = vi.mocked(UserService);
const mockTokenStorage = vi.mocked(tokenStorage);

// Test component that uses AuthContext
const TestComponent = () => {
  const { user, login } = useAuth();
  
  const handleLogin = () => {
    login('user@example.com', 'password');
  };

  return (
    <div>
      <div data-testid="user-email">{user?.email || 'Not logged in'}</div>
      <button onClick={handleLogin} data-testid="login-button">Login</button>
    </div>
  );
};

describe('AuthContext Password Update Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTokenStorage.getAccessToken.mockReturnValue(null);
    mockTokenStorage.getRefreshToken.mockReturnValue(null);
  });

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    isActive: true,
    isSuperAdmin: false,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    details: {
      firstName: 'Test',
      lastName: 'User',
      nickName: 'TestUser',
      contactNumber: '1234567890',
      reportTo: {
        id: 'manager-123',
        email: 'manager@example.com',
        firstName: 'Manager',
        lastName: 'User',
        nickName: 'Manager'
      }
    },
    resources: []
  };

  it('should call getLastPasswordUpdate after successful login', async () => {
    // Mock successful login
    mockAuthService.login.mockResolvedValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    });
    
    mockUserService.fetchAndStoreUserData.mockResolvedValue(mockUser);
    mockUserService.getUserPermissionsFromRBAC.mockResolvedValue({
      resourceId: 'windbooks-app',
      roleId: 'user-role',
      role: 'USER',
      permissions: ['read', 'write']
    });
    
    // Mock password update check
    mockUserService.getLastPasswordUpdate.mockResolvedValue({
      create_date: '2023-01-01T00:00:00.000Z',
      last_update: '2023-07-01T00:00:00.000Z',
      updated_by: 'user-123',
      how_many: 2
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = getByTestId('login-button');
    loginButton.click();

    await waitFor(() => {
      expect(getByTestId('user-email')).toHaveTextContent('user@example.com');
    });

    // Should call password update check after successful login
    expect(mockUserService.getLastPasswordUpdate).toHaveBeenCalledWith('user-123');
  });

  it('should show password modal for SUPERADMIN who never updated password', async () => {
    const mockSuperAdmin = {
      ...mockUser,
      id: 'superadmin-123',
      email: 'superadmin@example.com',
      isSuperAdmin: true
    };

    // Test component that also checks modal state
    const TestComponentWithModal = () => {
      const { user, login, isPasswordModalOpen, passwordModalProps } = useAuth();
      
      const handleLogin = () => {
        login('superadmin@example.com', 'password');
      };

      return (
        <div>
          <div data-testid="user-email">{user?.email || 'Not logged in'}</div>
          <button onClick={handleLogin} data-testid="login-button">Login</button>
          <div data-testid="modal-open">{isPasswordModalOpen ? 'true' : 'false'}</div>
          <div data-testid="modal-role">{passwordModalProps?.userRole || 'none'}</div>
          <div data-testid="modal-days">{passwordModalProps?.lastUpdateDays === null ? 'null' : passwordModalProps?.lastUpdateDays || 'none'}</div>
        </div>
      );
    };

    // Mock successful login
    mockAuthService.login.mockResolvedValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    });
    
    mockUserService.fetchAndStoreUserData.mockResolvedValue(mockSuperAdmin);
    mockUserService.getUserPermissionsFromRBAC.mockResolvedValue({
      resourceId: 'windbooks-app',
      roleId: 'superadmin-role',
      role: 'SUPERADMIN',
      permissions: ['*']
    });
    
    // Mock password update response for SUPERADMIN who never updated
    mockUserService.getLastPasswordUpdate.mockResolvedValue({
      create_date: '2023-01-01T00:00:00.000Z',
      last_update: null,
      updated_by: null,
      how_many: 0
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponentWithModal />
      </AuthProvider>
    );

    const loginButton = getByTestId('login-button');
    loginButton.click();

    await waitFor(() => {
      expect(getByTestId('user-email')).toHaveTextContent('superadmin@example.com');
    });

    // Should show the password modal for SUPERADMIN who never updated
    await waitFor(() => {
      expect(getByTestId('modal-open')).toHaveTextContent('true');
      expect(getByTestId('modal-role')).toHaveTextContent('SUPERADMIN');
      expect(getByTestId('modal-days')).toHaveTextContent('null');
    });

    // Should call password update check after successful login
    expect(mockUserService.getLastPasswordUpdate).toHaveBeenCalledWith('superadmin-123');
  });

  it('should show password modal for regular user after 90+ days since creation with no updates', async () => {
    // Mock a user created 91 days ago
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - 91);
    
    const mockRegularUser = {
      ...mockUser,
      id: 'regular-user-123',
      email: 'regular@example.com',
      isSuperAdmin: false,
      createdAt: createdDate.toISOString()
    };

    // Test component that also checks modal state
    const TestComponentWithModal = () => {
      const { user, login, isPasswordModalOpen, passwordModalProps } = useAuth();
      
      const handleLogin = () => {
        login('regular@example.com', 'password');
      };

      return (
        <div>
          <div data-testid="user-email">{user?.email || 'Not logged in'}</div>
          <button onClick={handleLogin} data-testid="login-button">Login</button>
          <div data-testid="modal-open">{isPasswordModalOpen ? 'true' : 'false'}</div>
          <div data-testid="modal-role">{passwordModalProps?.userRole || 'none'}</div>
          <div data-testid="modal-days">{passwordModalProps?.lastUpdateDays === null ? 'null' : passwordModalProps?.lastUpdateDays || 'none'}</div>
        </div>
      );
    };

    // Mock successful login
    mockAuthService.login.mockResolvedValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    });
    
    mockUserService.fetchAndStoreUserData.mockResolvedValue(mockRegularUser);
    mockUserService.getUserPermissionsFromRBAC.mockResolvedValue({
      resourceId: 'windbooks-app',
      roleId: 'user-role',
      role: 'USER',
      permissions: ['read']
    });
    
    // Mock password update response for regular user who never updated (91 days ago)
    mockUserService.getLastPasswordUpdate.mockResolvedValue({
      create_date: createdDate.toISOString(),
      last_update: null,
      updated_by: null,
      how_many: 0
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponentWithModal />
      </AuthProvider>
    );

    const loginButton = getByTestId('login-button');
    loginButton.click();

    await waitFor(() => {
      expect(getByTestId('user-email')).toHaveTextContent('regular@example.com');
    });

    // Should show the password modal for regular user after 90+ days
    await waitFor(() => {
      expect(getByTestId('modal-open')).toHaveTextContent('true');
      expect(getByTestId('modal-role')).toHaveTextContent('USER');
      expect(getByTestId('modal-days')).toHaveTextContent('null');
    });

    // Should call password update check after successful login
    expect(mockUserService.getLastPasswordUpdate).toHaveBeenCalledWith('regular-user-123');
  });

  it('should NOT show password modal for regular user within 90 days of creation', async () => {
    // Mock a user created 30 days ago
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - 30);
    
    const mockRegularUser = {
      ...mockUser,
      id: 'new-user-123',
      email: 'newuser@example.com',
      isSuperAdmin: false,
      createdAt: createdDate.toISOString()
    };

    // Test component that also checks modal state
    const TestComponentWithModal = () => {
      const { user, login, isPasswordModalOpen, passwordModalProps } = useAuth();
      
      const handleLogin = () => {
        login('newuser@example.com', 'password');
      };

      return (
        <div>
          <div data-testid="user-email">{user?.email || 'Not logged in'}</div>
          <button onClick={handleLogin} data-testid="login-button">Login</button>
          <div data-testid="modal-open">{isPasswordModalOpen ? 'true' : 'false'}</div>
          <div data-testid="modal-role">{passwordModalProps?.userRole || 'none'}</div>
        </div>
      );
    };

    // Mock successful login
    mockAuthService.login.mockResolvedValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    });
    
    mockUserService.fetchAndStoreUserData.mockResolvedValue(mockRegularUser);
    mockUserService.getUserPermissionsFromRBAC.mockResolvedValue({
      resourceId: 'windbooks-app',
      roleId: 'user-role',
      role: 'USER',
      permissions: ['read']
    });
    
    // Mock password update response for regular user who never updated (30 days ago)
    mockUserService.getLastPasswordUpdate.mockResolvedValue({
      create_date: createdDate.toISOString(),
      last_update: null,
      updated_by: null,
      how_many: 0
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponentWithModal />
      </AuthProvider>
    );

    const loginButton = getByTestId('login-button');
    loginButton.click();

    await waitFor(() => {
      expect(getByTestId('user-email')).toHaveTextContent('newuser@example.com');
    });

    // Should NOT show the password modal for user within 90 days
    await waitFor(() => {
      expect(getByTestId('modal-open')).toHaveTextContent('false');
      expect(getByTestId('modal-role')).toHaveTextContent('none');
    });

    // Should call password update check after successful login
    expect(mockUserService.getLastPasswordUpdate).toHaveBeenCalledWith('new-user-123');
  });
});