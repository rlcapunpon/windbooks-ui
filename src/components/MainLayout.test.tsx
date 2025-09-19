import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MainLayout } from './MainLayout';
import { AuthContext } from '../contexts/AuthContext';
import type { User } from '../api/auth';

// Mock the Menu component
vi.mock('./Menu/Menu', () => ({
  Menu: ({ items, userPermissions }: any) => {
    // No permission filtering - show all items
    const filteredItems = items;

    return (
      <div data-testid="menu-component">
        <div data-testid="menu-permissions">{JSON.stringify(userPermissions)}</div>
        <div data-testid="menu-items-count">{filteredItems.length}</div>
        {filteredItems.map((item: any) => (
          <div key={item.id} data-testid={`menu-item-${item.id}`}>
            {item.label}
          </div>
        ))}
      </div>
    );
  },
}));

// Mock the cn utility
vi.mock('../../utils/cn', () => ({
  cn: (...classes: string[]) => classes.join(' '),
}));

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  organizationCode: 'ORG001',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  roles: [
    {
      role: {
        id: '1',
        name: 'ROLE_LEVEL_2',
        description: 'Manager',
        permissions: [
          {
            permission: {
              id: '1',
              name: 'USER.READ',
              description: 'Read users',
            },
          },
        ],
      },
    },
  ],
};

const mockAuthContext = {
  user: mockUser,
  login: vi.fn(),
  logout: vi.fn(),
  refresh: vi.fn(),
  register: vi.fn(),
  isLoading: false,
};

describe('MainLayout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sidebar with correct structure', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthContext.Provider>
    );

    // Check if sidebar is present
    const sidebar = screen.getByRole('complementary') || screen.getByTestId('menu-component').closest('aside');
    expect(sidebar).toBeInTheDocument();

    // Check if main content area is present
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('displays user information in sidebar header', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Windbooks')).toBeInTheDocument();
    expect(screen.getByText('Welcome, test')).toBeInTheDocument();
  });

  it('passes correct permissions to Menu component', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthContext.Provider>
    );

    const permissionsElement = screen.getByTestId('menu-permissions');
    const permissions = JSON.parse(permissionsElement.textContent || '[]');

    // ROLE_LEVEL_2 should have USER.READ, USER.CREATE, SETTINGS.MANAGE
    expect(permissions).toContain('USER.READ');
    expect(permissions).toContain('USER.CREATE');
    expect(permissions).toContain('SETTINGS.MANAGE');
  });

  it('renders all expected menu items', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthContext.Provider>
    );

    // Check for main menu items that should be visible with ROLE_LEVEL_2 permissions
    expect(screen.getByTestId('menu-item-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-profile')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-settings')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-organizations')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-tasks')).toBeInTheDocument();
  });

  it('displays correct role badge in top navigation', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('handles logout button click', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthContext.Provider>
    );

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockAuthContext.logout).toHaveBeenCalled();
  });

  it('renders children content in main area', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MainLayout>
          <div data-testid="child-content">Custom Child Content</div>
        </MainLayout>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthContext.Provider>
    );

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-white', 'text-black', 'flex');

    // Check if sidebar has correct classes
    const sidebar = screen.getByTestId('menu-component').closest('aside');
    expect(sidebar).toHaveClass('w-64', 'bg-white', 'border-r', 'border-gray-200', 'shadow-sm', 'flex-shrink-0');
  });

  it('handles user with no roles gracefully', () => {
    const userWithoutRoles = { ...mockUser, roles: [] };

    render(
      <AuthContext.Provider value={{ ...mockAuthContext, user: userWithoutRoles }}>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthContext.Provider>
    );

    // Should still render without crashing
    expect(screen.getByText('Windbooks')).toBeInTheDocument();
  });

  it('handles user with multiple roles', () => {
    const userWithMultipleRoles = {
      ...mockUser,
      roles: [
        {
          role: {
            id: '1',
            name: 'ROLE_LEVEL_2',
            description: 'Manager',
            permissions: [
              {
                permission: {
                  id: '1',
                  name: 'USER.READ',
                  description: 'Read users',
                },
              },
            ],
          },
        },
        {
          role: {
            id: '2',
            name: 'ROLE_LEVEL_3',
            description: 'Supervisor',
            permissions: [
              {
                permission: {
                  id: '2',
                  name: 'REPORTS.EXPORT',
                  description: 'Export reports',
                },
              },
            ],
          },
        },
      ],
    };

    render(
      <AuthContext.Provider value={{ ...mockAuthContext, user: userWithMultipleRoles }}>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthContext.Provider>
    );

    const permissionsElement = screen.getByTestId('menu-permissions');
    const permissions = JSON.parse(permissionsElement.textContent || '[]');

    // Should have permissions from both roles
    expect(permissions).toContain('USER.READ');
    expect(permissions).toContain('USER.CREATE');
    expect(permissions).toContain('SETTINGS.MANAGE');
    expect(permissions).toContain('REPORTS.EXPORT');
  });

  it('shows admin menu for all users (no permission filtering)', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthContext.Provider>
    );

    // Admin menu should be visible for all users (no permission filtering)
    expect(screen.getByTestId('menu-item-admin')).toBeInTheDocument();
  });
});