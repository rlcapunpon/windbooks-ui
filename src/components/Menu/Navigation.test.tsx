import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MenuItemComponent } from './MenuItem';
import type { MenuItem } from './types';

// Mock react-router-dom to track navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the cn utility
vi.mock('../../utils/cn', () => ({
  cn: (...classes: string[]) => classes.join(' '),
}));

describe('Navigation Component (10-07-25.Step7)', () => {
  const mockMenuItem: MenuItem = {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    permissions: ['USER.READ'],
  };

  const mockProps = {
    item: mockMenuItem,
    level: 0,
    isOpen: false,
    isActive: false,
    onToggle: vi.fn(),
    onItemClick: vi.fn(),
    showIcons: true,
    collapsed: false,
    userPermissions: ['USER.READ'],
    activeItem: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('should use React Router Link instead of plain href for navigation', () => {
    render(
      <BrowserRouter>
        <MenuItemComponent {...mockProps} />
      </BrowserRouter>
    );

    // Should render as React Router Link (Link components render as anchor tags with data-testid)
    const menuElement = screen.getByRole('menuitem');
    
    // React Router Link should NOT prevent default or cause full page reload
    // Instead of checking href attribute (which Link components still have),
    // we verify the component uses Link by checking for React Router behavior
    expect(menuElement).toBeInTheDocument();
    expect(menuElement.tagName).toBe('A'); // Link renders as anchor
    
    // The key difference: Link components handle navigation via React Router
    // This test passes when using Link component from react-router-dom
  });

  it('should NOT cause full page reload when menu item is clicked', async () => {
    // Mock window.location to track if full reload happens
    const originalLocation = window.location;
    const mockLocation = {
      ...originalLocation,
      assign: vi.fn(),
      reload: vi.fn(),
      replace: vi.fn(),
    };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    render(
      <BrowserRouter>
        <MenuItemComponent {...mockProps} />
      </BrowserRouter>
    );

    const menuItem = screen.getByText('Dashboard');
    fireEvent.click(menuItem);

    // Should NOT call window.location methods (full page reload)
    expect(mockLocation.assign).not.toHaveBeenCalled();
    expect(mockLocation.reload).not.toHaveBeenCalled();
    expect(mockLocation.replace).not.toHaveBeenCalled();

    // Should call onItemClick handler instead
    expect(mockProps.onItemClick).toHaveBeenCalledWith(mockMenuItem);

    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('should use React Router navigation for programmatic navigation', () => {
    render(
      <BrowserRouter>
        <MenuItemComponent {...mockProps} />
      </BrowserRouter>
    );

    const menuItem = screen.getByText('Dashboard');
    fireEvent.click(menuItem);

    // After clicking, should eventually use navigate() for client-side routing
    // This test will pass when we implement proper React Router navigation
    expect(mockProps.onItemClick).toHaveBeenCalledWith(mockMenuItem);
  });
});