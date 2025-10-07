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
});