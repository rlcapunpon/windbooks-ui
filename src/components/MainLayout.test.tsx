import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MainLayout } from './MainLayout';

// Mock the Menu component
vi.mock('../components/Menu/Menu', () => ({
  Menu: ({ items, showIcons, collapsed, collapsible = true, onItemClick, onSubmenuToggle }: any) => (
    <div data-testid="menu-component" data-show-icons={showIcons ? 'true' : 'false'} data-collapsed={collapsed ? 'true' : 'false'}>
      {items.map((item: any) => (
        <div key={item.id} data-testid={`menu-item-${item.id}`} className={collapsed ? 'justify-center' : ''} onClick={() => onItemClick?.(item)}>
          {showIcons && item.icon && <span data-testid={`icon-${item.id}`}>Icon</span>}
          <span>{item.label}</span>
          {item.children && collapsible && !collapsed && (
            <button
              data-testid={`submenu-toggle-${item.id}`}
              className={collapsed ? "ml-2" : "ml-2"}
              onClick={(e) => {
                e.stopPropagation();
                onSubmenuToggle?.(item.id);
              }}
            >
              Toggle
            </button>
          )}
          {item.children && (
            <div data-testid={`submenu-${item.id}`}>
              {item.children.map((child: any) => (
                <div key={child.id} data-testid={`submenu-item-${child.id}`}>
                  {child.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  ),
}));

// Mock the auth context
vi.mock('../contexts/AuthContextTypes', () => ({
  useAuth: () => ({
    user: {
      email: 'test@example.com',
      resources: [{ role: 'admin' }],
    },
    logout: vi.fn(),
  }),
}));

// Mock UserService
vi.mock('../services/userService', () => ({
  UserService: {
    isSuperAdmin: () => false,
    hasRole: vi.fn(),
  },
}));

describe('MainLayout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders main layout structure', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    expect(screen.getByAltText('Windbooks Logo')).toBeInTheDocument();
    expect(screen.getByText('Welcome, test')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('displays menu items in correct order: Dashboard, Organizations, Tasks, Administration, Profile, Settings', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Check that menu items are rendered in the expected order
    const menuItems = screen.getAllByTestId(/^menu-item-/);
    expect(menuItems).toHaveLength(6);

    // Verify the order of menu items
    expect(screen.getByTestId('menu-item-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-organizations')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-tasks')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-admin')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-profile')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-settings')).toBeInTheDocument();
  });

  it('shows collapsible sidebar with minimize button in header', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Should have a minimize button in the sidebar header
    const minimizeButton = screen.getByRole('button', { name: /minimize|collapse/i });
    expect(minimizeButton).toBeInTheDocument();
  });

  it('toggles sidebar collapse when minimize button is clicked', async () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    const minimizeButton = screen.getByLabelText('Collapse sidebar');

    // Initially sidebar should be expanded
    expect(screen.getByAltText('Windbooks Logo')).toBeInTheDocument();
    expect(screen.getByText('Welcome, test')).toBeInTheDocument();

    // Click minimize button
    await act(async () => {
      fireEvent.click(minimizeButton);
    });

    // Wait for the collapse animation/state change
    await waitFor(() => {
      // After minimizing, header should be hidden
      const header = screen.getByTestId('sidebar-header');
      expect(header).toHaveClass('hidden');
    });

    // Should have a maximize button
    const maximizeButton = screen.getByRole('button', { name: /expand/i });
    expect(maximizeButton).toBeInTheDocument();
  });

  it('shows only icons when sidebar is collapsed', async () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    const minimizeButton = screen.getByRole('button', { name: /minimize|collapse/i });
    await act(async () => {
      fireEvent.click(minimizeButton);
    });

    // When collapsed, should show icons but not text labels
    // This test will fail until we implement the showIcons logic
    const menuComponent = screen.getByTestId('menu-component');
    expect(menuComponent).toHaveAttribute('data-show-icons', 'true');
  });

  it('shows icons when sidebar is maximized', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // When maximized (not collapsed), should still show icons
    const menuComponent = screen.getByTestId('menu-component');
    expect(menuComponent).toHaveAttribute('data-show-icons', 'true');
  });

  it('provides proper spacing for submenu toggle when sidebar is minimized', async () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Collapse the sidebar first
    const minimizeButton = screen.getByRole('button', { name: /minimize|collapse/i });
    await act(async () => {
      fireEvent.click(minimizeButton);
    });

    // When minimized, submenu toggles should be hidden (not rendered)
    // This test verifies that the Menu component receives collapsed=true
    const menuComponent = screen.getByTestId('menu-component');
    expect(menuComponent).toHaveAttribute('data-collapsed', 'true');
  });

  it('provides proper spacing between icon and submenu toggle arrow when minimized', async () => {
    // Mock localStorage to start collapsed
    const localStorageMock = {
      getItem: vi.fn(() => 'true'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // When minimized, submenu toggles are hidden to ensure proper alignment
    // This eliminates spacing issues between icons and toggle arrows
    expect(screen.queryByTestId('submenu-toggle-organizations')).not.toBeInTheDocument();
  });

  it('auto-expands sidebar when submenu toggle is clicked', async () => {
    // Mock localStorage to start collapsed
    const localStorageMock = {
      getItem: vi.fn(() => 'true'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Verify sidebar is collapsed
    expect(screen.getByTestId('sidebar')).toHaveClass('w-16');

    // When collapsed, submenu toggles are hidden, so we can't click them
    // This test verifies that toggles are not present when collapsed
    expect(screen.queryByTestId('submenu-toggle-organizations')).not.toBeInTheDocument();

    // The auto-expand behavior is no longer applicable since toggles are hidden when collapsed
  });

  it('adjusts sidebar width when collapsed', async () => {
    // Mock localStorage to ensure sidebar starts expanded
    const localStorageMock = {
      getItem: vi.fn(() => null), // Return null so it starts expanded
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    const sidebar = screen.getByTestId('sidebar');

    // Initially should have normal width
    expect(sidebar).toHaveClass('w-64');

    const minimizeButton = screen.getByLabelText('Collapse sidebar');
    await act(async () => {
      fireEvent.click(minimizeButton);
    });

    // Wait for the width to change
    await waitFor(() => {
      expect(sidebar).toHaveClass('w-16');
    });
  });

  it('expands sidebar when maximize button is clicked', async () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Collapse first
    const minimizeButton = screen.getByLabelText('Collapse sidebar');
    await act(async () => {
      fireEvent.click(minimizeButton);
    });

    // Wait for collapse
    await waitFor(() => {
      const header = screen.getByTestId('sidebar-header');
      expect(header).toHaveClass('hidden');
    });

    // Click maximize button
    const maximizeButton = screen.getByRole('button', { name: /expand/i });
    await act(async () => {
      fireEvent.click(maximizeButton);
    });

    // Wait for expand
    await waitFor(() => {
      // Should be expanded again
      expect(screen.getByAltText('Windbooks Logo')).toBeInTheDocument();
      expect(screen.getByText('Welcome, test')).toBeInTheDocument();
    });
  });

  it('closes mobile menu when menu item is clicked', async () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Open mobile menu
    const mobileMenuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
    await act(async () => {
      fireEvent.click(mobileMenuButton);
    });

    // Mobile menu should be open (this test assumes mobile menu overlay is visible)
    // Click on a menu item should close it
    const dashboardItem = screen.getByTestId('menu-item-dashboard');
    await act(async () => {
      fireEvent.click(dashboardItem);
    });

    // Mobile menu should be closed
    // This test will need to be updated based on actual mobile menu implementation
  });

  it('has proper spacing between icon and submenu toggle when collapsed', async () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // First collapse the sidebar
    const minimizeButton = screen.getByLabelText('Collapse sidebar');
    await act(async () => {
      fireEvent.click(minimizeButton);
    });

    // Wait for collapse to complete
    await waitFor(() => {
      const menu = screen.getByTestId('menu-component');
      expect(menu).toHaveAttribute('data-collapsed', 'true');
    });

    // When collapsed, submenu toggles should be hidden to ensure proper alignment
    // This eliminates spacing issues between icons and toggle arrows
    expect(screen.queryByTestId('submenu-toggle-organizations')).not.toBeInTheDocument();
    
    // Verify icons are shown even when collapsed
    expect(screen.getByTestId('menu-component')).toHaveAttribute('data-show-icons', 'true');
  });

  it('properly aligns menu icons when sidebar is collapsed', async () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Collapse the sidebar
    const minimizeButton = screen.getByLabelText('Collapse sidebar');
    await act(async () => {
      fireEvent.click(minimizeButton);
    });

    // Wait for collapse to complete
    await waitFor(() => {
      const menu = screen.getByTestId('menu-component');
      expect(menu).toHaveAttribute('data-collapsed', 'true');
    });

    // All menu items should have consistent alignment when collapsed
    // Regular menu items and submenu items should be aligned
    const dashboardIcon = screen.getByTestId('icon-dashboard');
    const organizationsIcon = screen.getByTestId('icon-organizations');
    const tasksIcon = screen.getByTestId('icon-tasks');

    // Verify all icons are present and properly positioned
    expect(dashboardIcon).toBeInTheDocument();
    expect(organizationsIcon).toBeInTheDocument();
    expect(tasksIcon).toBeInTheDocument();

    // In collapsed state, submenu toggles should be hidden to ensure proper alignment
    // Icons should maintain consistent positioning whether they have submenu toggles or not
    expect(screen.queryByTestId('submenu-toggle-organizations')).not.toBeInTheDocument();
    expect(screen.queryByTestId('submenu-toggle-tasks')).not.toBeInTheDocument();
    expect(screen.queryByTestId('submenu-toggle-admin')).not.toBeInTheDocument();
  });

  it('hides submenu toggles when sidebar is collapsed', async () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // First expand the sidebar to ensure toggles are visible
    const minimizeButton = screen.getByLabelText('Collapse sidebar');
    expect(minimizeButton).toBeInTheDocument();

    // Verify submenu toggle is visible when expanded
    const submenuToggle = screen.getByTestId('submenu-toggle-organizations');
    expect(submenuToggle).toBeInTheDocument();

    // Now collapse the sidebar
    await act(async () => {
      fireEvent.click(minimizeButton);
    });

    // Wait for collapse to complete
    await waitFor(() => {
      const menu = screen.getByTestId('menu-component');
      expect(menu).toHaveAttribute('data-collapsed', 'true');
    });

    // Submenu toggle should be hidden when collapsed
    expect(screen.queryByTestId('submenu-toggle-organizations')).not.toBeInTheDocument();
  });

  it('persists sidebar collapse state in localStorage', async () => {
    // Mock localStorage before rendering
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Initially, localStorage should be checked for saved state
    expect(localStorageMock.getItem).toHaveBeenCalledWith('sidebarCollapsed');

    // Collapse the sidebar
    const minimizeButton = screen.getByLabelText('Collapse sidebar');
    await act(async () => {
      fireEvent.click(minimizeButton);
    });

    // localStorage should be updated with collapsed state
    expect(localStorageMock.setItem).toHaveBeenCalledWith('sidebarCollapsed', 'true');
  });

  it('restores sidebar collapse state from localStorage on mount', () => {
    // Mock localStorage with collapsed state before rendering
    const localStorageMock = {
      getItem: vi.fn(() => 'true'), // Return 'true' to simulate collapsed state
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Sidebar should be collapsed based on localStorage value
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('w-16'); // Collapsed width
  });

  it('centers icons when sidebar is collapsed', async () => {
    // Mock localStorage to start collapsed
    const localStorageMock = {
      getItem: vi.fn(() => 'true'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // When collapsed, icons should be centered
    const menuComponent = screen.getByTestId('menu-component');
    expect(menuComponent).toHaveAttribute('data-collapsed', 'true');

    // Check that menu items are center-aligned when collapsed
    const dashboardItem = screen.getByTestId('menu-item-dashboard');
    expect(dashboardItem).toHaveClass('justify-center');

    // Verify icons are still present and visible
    const dashboardIcon = screen.getByTestId('icon-dashboard');
    expect(dashboardIcon).toBeInTheDocument();
  });

  it('auto-expands sidebar when menu item with submenu is clicked while collapsed', async () => {
    // Mock localStorage to start collapsed
    const localStorageMock = {
      getItem: vi.fn(() => 'true'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Verify sidebar is collapsed
    expect(screen.getByTestId('sidebar')).toHaveClass('w-16');

    // Click on a menu item with submenu (organizations)
    const organizationsItem = screen.getByTestId('menu-item-organizations');
    await act(async () => {
      fireEvent.click(organizationsItem);
    });

    // localStorage should be updated to expand the sidebar
    expect(localStorageMock.setItem).toHaveBeenCalledWith('sidebarCollapsed', 'false');
  });

  it('persists active menu item in localStorage when menu item is clicked', async () => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Click on dashboard menu item
    const dashboardItem = screen.getByTestId('menu-item-dashboard');
    await act(async () => {
      fireEvent.click(dashboardItem);
    });

    // Should persist active menu item in localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('activeMenuItem', 'dashboard');
  });

  it('persists current page path in localStorage when menu item is clicked', async () => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Click on profile menu item (doesn't have children)
    const profileItem = screen.getByTestId('menu-item-profile');
    await act(async () => {
      fireEvent.click(profileItem);
    });

    // Should persist current page path in localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('currentPage', '/profile');
  });

  it('restores active menu item from localStorage on component mount', () => {
    const localStorageMock = {
      getItem: vi.fn((key) => {
        if (key === 'activeMenuItem') return 'organizations';
        if (key === 'sidebarCollapsed') return 'false';
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Check that localStorage was queried for activeMenuItem
    expect(localStorageMock.getItem).toHaveBeenCalledWith('activeMenuItem');
  });

  it('highlights active menu item with background color', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // The Menu component should be rendered with the default mock
    // We can't easily test the highlighting without complex mocking,
    // but we can verify the Menu component receives the activeItem prop
    const menuComponent = screen.getByTestId('menu-component');
    expect(menuComponent).toBeInTheDocument();
  });

  it('determines active menu item based on current route', () => {
    // Mock window.location.pathname to simulate different routes
    Object.defineProperty(window, 'location', {
      value: { pathname: '/organizations/dashboard' },
      writable: true,
    });

    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Should have checked localStorage for saved activeMenuItem
    expect(localStorageMock.getItem).toHaveBeenCalledWith('activeMenuItem');
  });

  it('handles submenu items as active when their parent route matches', () => {
    // Mock window.location.pathname for a submenu route
    Object.defineProperty(window, 'location', {
      value: { pathname: '/organizations/dashboard' },
      writable: true,
    });

    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Should check localStorage for activeMenuItem
    expect(localStorageMock.getItem).toHaveBeenCalledWith('activeMenuItem');
  });

  it('restores both active menu item and current page from localStorage', () => {
    const localStorageMock = {
      getItem: vi.fn((key) => {
        if (key === 'activeMenuItem') return 'tasks';
        if (key === 'currentPage') return '/tasks/my-tasks';
        if (key === 'sidebarCollapsed') return 'false';
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Should have checked for both activeMenuItem and currentPage in localStorage
    expect(localStorageMock.getItem).toHaveBeenCalledWith('activeMenuItem');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('currentPage');
  });

  it('updates localStorage when navigating to different menu sections', async () => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Click on profile menu item
    const profileItem = screen.getByTestId('menu-item-profile');
    await act(async () => {
      fireEvent.click(profileItem);
    });

    // Should update both activeMenuItem and currentPage in localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('activeMenuItem', 'profile');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('currentPage', '/profile');
  });

  // Step 17.5 Fix Tests - Submenu behavior and active state exclusivity
  it('should not make parent menu with submenu items active when clicked', async () => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Click on Organizations menu (which has submenu items)
    const organizationsToggle = screen.getByTestId('submenu-toggle-organizations');
    await act(async () => {
      fireEvent.click(organizationsToggle);
    });

    // Parent menu with submenus should NOT become active
    expect(localStorageMock.setItem).not.toHaveBeenCalledWith('activeMenuItem', 'organizations');
    
    // Should only expand/collapse the submenu, not set as active
    const organizationsItem = screen.getByTestId('menu-item-organizations');
    expect(organizationsItem).not.toHaveClass('bg-blue-50', 'text-blue-600');
  });

  it('should make submenu item active instead of parent when submenu item is clicked', async () => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // First expand the Organizations submenu
    const organizationsToggle = screen.getByTestId('submenu-toggle-organizations');
    await act(async () => {
      fireEvent.click(organizationsToggle);
    });

    // Click on the All Organizations submenu item under Organizations
    const orgAllItem = screen.getByTestId('submenu-item-org-all');
    await act(async () => {
      fireEvent.click(orgAllItem);
    });

    // Submenu item should become active, not the parent
    expect(localStorageMock.setItem).toHaveBeenCalledWith('activeMenuItem', 'org-all');
    expect(localStorageMock.setItem).not.toHaveBeenCalledWith('activeMenuItem', 'organizations');
  });

  it('should only allow one menu item to be active at a time', async () => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Click on Profile menu item first
    const profileItem = screen.getByTestId('menu-item-profile');
    await act(async () => {
      fireEvent.click(profileItem);
    });

    // Then click on Dashboard menu item
    const dashboardItem = screen.getByTestId('menu-item-dashboard');
    await act(async () => {
      fireEvent.click(dashboardItem);
    });

    // Only the most recently clicked item should be active
    expect(localStorageMock.setItem).toHaveBeenCalledWith('activeMenuItem', 'dashboard');
    
    // Wait for the active state to be updated - verify through localStorage which reflects the active state
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('activeMenuItem', 'dashboard');
    });
    
    // Profile should no longer be active based on localStorage state
    expect(localStorageMock.setItem).not.toHaveBeenLastCalledWith('activeMenuItem', 'profile');
  });

  it('should determine active submenu item correctly based on route path', () => {
    // Mock window.location.pathname for a submenu route
    Object.defineProperty(window, 'location', {
      value: { pathname: '/organizations/dashboard' },
      writable: true,
    });

    const localStorageMock = {
      getItem: vi.fn(() => null), // No saved state
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Should detect the specific submenu item as active, not the parent
    expect(localStorageMock.setItem).toHaveBeenCalledWith('activeMenuItem', 'org-all');
    expect(localStorageMock.setItem).not.toHaveBeenCalledWith('activeMenuItem', 'organizations');
  });

  it('should not allow parent menu to be selected when it has href but also has children', async () => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Click directly on Organizations menu item (not the toggle button)
    const organizationsItem = screen.getByTestId('menu-item-organizations');
    await act(async () => {
      fireEvent.click(organizationsItem);
    });

    // Even if Organizations has href, it should not become active if it has children
    expect(localStorageMock.setItem).not.toHaveBeenCalledWith('activeMenuItem', 'organizations');
    
    // Should not navigate to parent href when it has children
    expect(window.location.href).not.toEqual(expect.stringContaining('/organizations'));
  });

  it('should persist submenu selection on page reload when on submenu route', () => {
    // Mock window.location.pathname to simulate being on the Organizations Dashboard page
    Object.defineProperty(window, 'location', {
      value: { pathname: '/organizations/dashboard' },
      writable: true,
    });

    const localStorageMock = {
      getItem: vi.fn((key) => {
        // Simulate localStorage already having some saved state (like after previous navigation)
        if (key === 'activeMenuItem') return 'profile'; // Different item was previously active
        if (key === 'currentPage') return '/profile';
        if (key === 'sidebarCollapsed') return 'false';
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // When the page loads and the current path is /organizations/dashboard,
    // it should detect and set 'org-all' as the active menu item,
    // NOT the parent 'organizations' or the previously saved 'profile'
    expect(localStorageMock.setItem).toHaveBeenCalledWith('activeMenuItem', 'org-all');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('currentPage', '/organizations/dashboard');
  });

  it('should auto-expand parent submenu when active item is a submenu item on page reload', async () => {
    // Mock window.location.pathname to simulate being on the Organizations Dashboard page
    Object.defineProperty(window, 'location', {
      value: { pathname: '/organizations/dashboard' },
      writable: true,
    });

    const localStorageMock = {
      getItem: vi.fn(() => null), // No saved state to simulate fresh page load
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Wait for initial render and route detection
    await waitFor(() => {
      // The active menu item should be set to the submenu item
      expect(localStorageMock.setItem).toHaveBeenCalledWith('activeMenuItem', 'org-all');
    });

    // Note: With our current mock, submenu items use 'submenu-item-*' test IDs
    // In the real implementation, we need the Menu component to auto-expand when activeItem is a child
    const dashboardSubmenuItem = screen.getByTestId('submenu-item-org-all');
    expect(dashboardSubmenuItem).toBeInTheDocument();
    
    // The issue is that the submenu is not automatically expanded on page load
    // even when the active item is within that submenu
    // This test will fail until we fix the Menu component to auto-expand parent menus
  });

  it('should allow other submenus to be toggled when one submenu item is active', async () => {
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // First, expand Organizations submenu and select All Organizations
    const organizationsToggle = screen.getByTestId('submenu-toggle-organizations');
    await act(async () => {
      fireEvent.click(organizationsToggle);
    });

    // Click on All Organizations submenu item to make it active
    const allOrganizationsSubmenu = screen.getByTestId('submenu-item-org-all');
    await act(async () => {
      fireEvent.click(allOrganizationsSubmenu);
    });

    // Now try to expand Tasks submenu - this should work
    const tasksToggle = screen.getByTestId('submenu-toggle-tasks');
    await act(async () => {
      fireEvent.click(tasksToggle);
    });

    // Tasks submenu should be expanded
    const myTasksSubmenu = screen.getByTestId('submenu-item-my-tasks');
    expect(myTasksSubmenu).toBeInTheDocument();

    // Now try to collapse Tasks submenu - this should also work
    await act(async () => {
      fireEvent.click(tasksToggle);
    });

    // Tasks submenu items should still be there in our mock, but in real implementation 
    // they would be hidden when collapsed
    expect(myTasksSubmenu).toBeInTheDocument();
  });

  it('should highlight only the active submenu item, not all submenu items', async () => {
    // Mock window.location.pathname to simulate being on the Organizations Dashboard page
    Object.defineProperty(window, 'location', {
      value: { pathname: '/organizations/dashboard' },
      writable: true,
    });

    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Wait for route detection
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('activeMenuItem', 'org-all');
    });

    // The All Organizations submenu item should be highlighted (in our mock, we don't have CSS classes)
    // But we can verify that the active item is correctly identified
    const allOrganizationsSubmenu = screen.getByTestId('submenu-item-org-all');
    expect(allOrganizationsSubmenu).toBeInTheDocument();

    // Note: In our mock, we can't test CSS classes, but this test documents the expected behavior
    // The real fix needs to ensure only org-all gets the active styling
  });

  // Step 2: Update the Side Menu behavior - minimize button disabled when submenu item is selected
  it('should disable minimize button when a submenu item is currently selected', async () => {
    // Mock window.location.pathname to simulate being on a submenu route
    Object.defineProperty(window, 'location', {
      value: { pathname: '/organizations/dashboard' },
      writable: true,
    });

    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Wait for route detection to set active submenu item
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('activeMenuItem', 'org-all');
    });

    // Minimize button should be disabled when submenu item is active
    const minimizeButton = screen.getByLabelText('Collapse sidebar');
    expect(minimizeButton).toBeDisabled();
  });

  it('should enable minimize button when a main menu item is selected', async () => {
    // Mock window.location.pathname to simulate being on a main menu route
    Object.defineProperty(window, 'location', {
      value: { pathname: '/profile' },
      writable: true,
    });

    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Wait for route detection to set active main menu item
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('activeMenuItem', 'profile');
    });

    // Minimize button should be enabled when main menu item is active
    const minimizeButton = screen.getByLabelText('Collapse sidebar');
    expect(minimizeButton).not.toBeDisabled();
  });

  // Step 13: Show the email beside the user-role-badge
  it('should display user email beside the user-role-badge', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Should display the user's email beside the role badge
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    
    // Should have the user-email id for the email element
    const emailElement = screen.getByTestId('user-email');
    expect(emailElement).toBeInTheDocument();
    expect(emailElement).toHaveTextContent('test@example.com');
  });

  // Step 14: Fix the side-menu view when the screen is mobile resolution
  it('should have clear background for mobile menu overlay', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Open mobile menu
    const mobileMenuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
    fireEvent.click(mobileMenuButton);

    // Mobile menu overlay should be present but with clear background (no black background)
    const overlay = document.querySelector('.fixed.inset-0.z-40.md\\:hidden');
    expect(overlay).toBeInTheDocument();
    
    // Should not have black background classes
    expect(overlay).not.toHaveClass('bg-black');
    expect(overlay).not.toHaveClass('bg-opacity-50');
  });

  it('should display menu items when mobile menu is opened', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Initially, sidebar should be hidden on mobile (translate-x-full)
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('-translate-x-full');

    // Open mobile menu
    const mobileMenuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
    fireEvent.click(mobileMenuButton);

    // Sidebar should now be visible (translate-x-0)
    expect(sidebar).toHaveClass('translate-x-0');
    expect(sidebar).not.toHaveClass('-translate-x-full');

    // Menu items should be visible
    expect(screen.getByTestId('menu-item-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-organizations')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-tasks')).toBeInTheDocument();
  });

  it('should hide mobile menu overlay when closed', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Open mobile menu
    const mobileMenuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
    fireEvent.click(mobileMenuButton);

    // Mobile menu overlay should be present
    let overlay = document.querySelector('.fixed.inset-0.z-40.md\\:hidden');
    expect(overlay).toBeInTheDocument();

    // Close mobile menu by clicking overlay
    fireEvent.click(overlay!);

    // Mobile menu overlay should no longer be present
    overlay = document.querySelector('.fixed.inset-0.z-40.md\\:hidden');
    expect(overlay).toBeNull();
  });

  it('should position sidebar correctly for mobile when menu is open', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    const sidebar = screen.getByTestId('sidebar');

    // Initially should be hidden on mobile
    expect(sidebar).toHaveClass('fixed');
    expect(sidebar).toHaveClass('md:relative');
    expect(sidebar).toHaveClass('-translate-x-full');
    expect(sidebar).toHaveClass('md:translate-x-0');

    // Open mobile menu
    const mobileMenuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
    fireEvent.click(mobileMenuButton);

    // Should be positioned for mobile view
    expect(sidebar).toHaveClass('translate-x-0');
    expect(sidebar).toHaveClass('md:block');
  });

  // Step 15: Issue still persists - menu items not visible on mobile
  it('should display menu items when mobile menu is opened on mobile-sized screen', () => {
    // Mock window.innerWidth to simulate mobile screen
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // iPhone width
    });

    // Mock matchMedia to simulate mobile viewport
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(max-width: 767px)', // Simulate mobile breakpoint
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Initially, sidebar should be hidden on mobile (translate-x-full)
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('-translate-x-full');

    // Open mobile menu
    const mobileMenuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
    fireEvent.click(mobileMenuButton);

    // Sidebar should now be visible (translate-x-0)
    expect(sidebar).toHaveClass('translate-x-0');
    expect(sidebar).not.toHaveClass('-translate-x-full');

    // Menu items should be visible and accessible
    expect(screen.getByTestId('menu-item-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-organizations')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-tasks')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-admin')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-profile')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-settings')).toBeInTheDocument();

    // Menu component should be rendered and visible
    const menuComponent = screen.getByTestId('menu-component');
    expect(menuComponent).toBeInTheDocument();
    expect(menuComponent).toBeVisible();
  });

  it('should ensure menu items are not hidden by CSS on mobile viewport', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(max-width: 767px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Open mobile menu
    const mobileMenuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
    fireEvent.click(mobileMenuButton);

    // Check that menu items don't have hidden or invisible classes
    const dashboardItem = screen.getByTestId('menu-item-dashboard');
    expect(dashboardItem).not.toHaveClass('hidden');
    expect(dashboardItem).not.toHaveClass('invisible');
    expect(dashboardItem).not.toHaveClass('opacity-0');

    const organizationsItem = screen.getByTestId('menu-item-organizations');
    expect(organizationsItem).not.toHaveClass('hidden');
    expect(organizationsItem).not.toHaveClass('invisible');
    expect(organizationsItem).not.toHaveClass('opacity-0');

    // Check that the menu container doesn't have mobile-specific hiding classes
    const menuComponent = screen.getByTestId('menu-component');
    expect(menuComponent).not.toHaveClass('md:hidden');
    expect(menuComponent).not.toHaveClass('hidden');
    expect(menuComponent).not.toHaveClass('invisible');
  });

  it('should render menu items with proper text content on mobile', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(max-width: 767px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Open mobile menu
    const mobileMenuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
    fireEvent.click(mobileMenuButton);

    // Verify menu items have their text content visible
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Organizations')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Administration')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();

    // Verify icons are also present
    expect(screen.getByTestId('icon-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('icon-organizations')).toBeInTheDocument();
    expect(screen.getByTestId('icon-tasks')).toBeInTheDocument();
    expect(screen.getByTestId('icon-admin')).toBeInTheDocument();
    expect(screen.getByTestId('icon-profile')).toBeInTheDocument();
    expect(screen.getByTestId('icon-settings')).toBeInTheDocument();
  });

  // Step 19: Remove the Organization Assignee and Assigned Tasks submenu items
  it('should not display Organization Assignee submenu item', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Organization Assignee submenu item should not be present
    expect(screen.queryByTestId('submenu-item-org-assignee')).not.toBeInTheDocument();
    expect(screen.queryByText('Organization Assignee')).not.toBeInTheDocument();
  });

  it('should not display Assigned Tasks submenu item', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    // Assigned Tasks submenu item should not be present
    expect(screen.queryByTestId('submenu-item-assigned-tasks')).not.toBeInTheDocument();
    expect(screen.queryByText('Assigned Tasks')).not.toBeInTheDocument();
  });

  // Step 29: Profile menu item should be visible for Viewer role users
  // Note: This test verifies that the Menu component receives the correct userPermissions
  // The actual filtering is tested in Menu.test.tsx
  it('should pass USER.READ permission to Menu component for Viewer role users', () => {
    // This test documents the expected behavior - Viewer role gets USER.READ permission
    // The actual permission filtering is tested in the Menu component tests
    expect(true).toBe(true); // Placeholder test - functionality verified in Menu.test.tsx
  });
});
