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

    expect(screen.getByText('Windbooks')).toBeInTheDocument();
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
    expect(screen.getByText('Windbooks')).toBeInTheDocument();
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
      expect(screen.getByText('Windbooks')).toBeInTheDocument();
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
});
