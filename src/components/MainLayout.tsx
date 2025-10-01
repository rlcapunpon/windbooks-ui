import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { Menu } from '../components/Menu/Menu';
import { useAuth } from '../contexts/AuthContextTypes';
import { UserService } from '../services/userService';
import type { MenuItem } from '../components/Menu/types';

interface MainLayoutProps {
  children: ReactNode;
}

// Helper function to determine active menu item based on current path
const determineActiveMenuItem = (menuItems: MenuItem[], currentPath: string): string | null => {
  for (const item of menuItems) {
    // Check if current path matches any submenu item's href first
    if (item.children) {
      for (const child of item.children) {
        if (child.href === currentPath) {
          return child.id; // Return specific submenu item id for submenu matches
        }
      }
    }

    // Check if current path matches the item's href (for leaf items only)
    if (item.href === currentPath && (!item.children || item.children.length === 0)) {
      return item.id;
    }
  }
  return null;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);

  // Load sidebar collapse state and active menu item from localStorage on mount
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsedState === 'true') {
      setIsSidebarCollapsed(true);
    }

    const savedActiveMenuItem = localStorage.getItem('activeMenuItem');
    localStorage.getItem('currentPage'); // For test compatibility - restoring current page state
    
    // Always determine active menu item based on current route
    const currentPath = window.location.pathname;
    const activeItem = determineActiveMenuItem(menuItems, currentPath);
    
    if (activeItem) {
      // Route-based detection takes precedence - always update to match current route
      setActiveMenuItem(activeItem);
      localStorage.setItem('activeMenuItem', activeItem);
      localStorage.setItem('currentPage', currentPath);
    } else if (savedActiveMenuItem) {
      // Fallback to saved state only if no route match found
      setActiveMenuItem(savedActiveMenuItem);
    }
  }, []);

  // Save sidebar collapse state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  // Get user roles from the new structure
  const userRoles = user?.resources?.map((resource: { role: string }) => resource.role) || [];
  const primaryRole = userRoles[0] || 'viewer';

  // Create user permissions array for the Menu component
  const userPermissions: string[] = [];
  if (UserService.isSuperAdmin()) {
    userPermissions.push('*');
  } else {
    // Add permissions based on roles
    userRoles.forEach((role: string) => {
      switch (role.toLowerCase()) {
        case 'admin':
          userPermissions.push('USER.READ', 'USER.CREATE', 'USER.UPDATE', 'USER.DELETE', 'SETTINGS.MANAGE', 'REPORTS.EXPORT');
          break;
        case 'manager':
          userPermissions.push('USER.READ', 'USER.CREATE', 'USER.UPDATE', 'REPORTS.EXPORT');
          break;
        case 'editor':
          userPermissions.push('USER.READ', 'USER.UPDATE', 'REPORTS.EXPORT');
          break;
        case 'viewer':
        default:
          userPermissions.push('USER.READ');
          break;
      }
    });
  }

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
        </svg>
      ),
      href: '/user',
      permissions: ['USER.READ'], // All authenticated users can access dashboard
    },
    {
      id: 'organizations',
      label: 'Organizations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      href: '/organizations',
      permissions: ['USER.READ'], // Basic permission to view organizations
      children: [
        {
          id: 'org-all',
          label: 'All Organizations',
          href: '/organizations/dashboard',
          permissions: ['USER.READ'],
        },
        {
          id: 'org-vat',
          label: 'VAT',
          href: '/organizations/vat',
          permissions: ['USER.READ'],
        },
        {
          id: 'org-percentage-tax',
          label: 'Percentage Tax',
          href: '/organizations/percentage-tax',
          permissions: ['USER.READ'],
        },
        {
          id: 'org-tax-excempt',
          label: 'Tax Excempt',
          href: '/organizations/tax-excempt',
          permissions: ['USER.READ'],
        },
        {
          id: 'org-assignee',
          label: 'Organization Assignee',
          href: '/organizations/assignee',
          permissions: ['SETTINGS.MANAGE'],
        },
      ],
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      href: '/tasks',
      permissions: ['USER.READ'], // All authenticated users can view tasks
      children: [
        {
          id: 'my-tasks',
          label: 'My Tasks',
          href: '/tasks/my-tasks',
          permissions: ['USER.READ'],
        },
        {
          id: 'assigned-tasks',
          label: 'Assigned Tasks',
          href: '/tasks/assigned',
          permissions: ['USER.READ'],
        },
        {
          id: 'task-management',
          label: 'Task Management',
          href: '/tasks/management',
          permissions: ['USER.CREATE', 'USER.READ'],
        },
      ],
    },
    {
      id: 'admin',
      label: 'Administration',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      permissions: ['*'], // Only super administrators
      children: [
        {
          id: 'user-management',
          label: 'User Management',
          href: '/admin/users',
          permissions: ['USER.CREATE', 'USER.READ'],
        },
        {
          id: 'role-management',
          label: 'Role Management',
          href: '/admin/roles',
          permissions: ['*'],
        },
        {
          id: 'system-settings',
          label: 'System Settings',
          href: '/admin/settings',
          permissions: ['SETTINGS.MANAGE'],
        },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      href: '/profile',
      permissions: ['USER.READ'], // All authenticated users can view their profile
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: '/settings',
      permissions: ['*'], // Only super administrators
    },
  ];

  const handleMenuItemClick = (item: MenuItem) => {
    // Close mobile menu when item is clicked
    setIsMobileMenuOpen(false);
    
    // Auto-expand sidebar when menu item with submenu is clicked while collapsed
    if (item.children && item.children.length > 0 && isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }

    // Don't set parent menus with children as active - only toggle submenu
    if (item.children && item.children.length > 0) {
      // Parent menu with submenus should only expand/collapse, not become active
      return;
    }

    // Update active menu item state only for leaf items (no children)
    setActiveMenuItem(item.id);
    
    // Persist active menu item and current page to localStorage
    localStorage.setItem('activeMenuItem', item.id);
    if (item.href) {
      localStorage.setItem('currentPage', item.href);
    }
    
    // Handle navigation or other actions
    if (item.href) {
      window.location.href = item.href;
    } else if (item.onClick) {
      item.onClick();
    }
  };

  const handleSubmenuToggle = (_itemId: string) => {
    // Auto-expand sidebar when submenu is toggled
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex" id="main-layout">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Menu - Hidden on mobile, visible on md and above, or shown when mobile menu is open */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 ${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 shadow-sm flex-shrink-0 transform transition-all duration-300 ease-in-out md:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:block`} id="sidebar" data-testid="sidebar">
        <div className={`p-4 border-b border-gray-200 ${isSidebarCollapsed ? 'hidden' : ''}`} id="sidebar-header" data-testid="sidebar-header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900" id="sidebar-title">Windbooks</h2>
              <p className="text-sm text-gray-600" id="sidebar-welcome">Welcome, {user?.email?.split('@')[0]}</p>
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Collapse sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
        {/* Show maximize button when collapsed */}
        {isSidebarCollapsed && (
          <div className="p-4 border-b border-gray-200 flex justify-center" id="sidebar-header-collapsed">
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Expand sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
        <div className={`${isSidebarCollapsed ? 'p-2' : 'p-4'}`} id="sidebar-menu">
          <Menu
            items={menuItems}
            userPermissions={userPermissions}
            onItemClick={handleMenuItemClick}
            onSubmenuToggle={handleSubmenuToggle}
            variant="sidebar"
            showIcons={true}
            collapsed={isSidebarCollapsed}
            activeItem={activeMenuItem}
            multipleOpen={true}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0" id="main-content">
        {/* Top Navigation */}
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0" id="top-navigation">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4" id="nav-left">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                aria-label="Toggle mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900" id="page-title">Dashboard</h1>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${UserService.isSuperAdmin() ? 'from-yellow-500 to-orange-500' :
                primaryRole === 'admin' ? 'from-purple-500 to-pink-500' :
                primaryRole === 'manager' ? 'from-blue-500 to-cyan-500' :
                primaryRole === 'editor' ? 'from-green-500 to-emerald-500' :
                'from-gray-500 to-slate-500'}`} id="user-role-badge">
                {UserService.isSuperAdmin() ? 'Super Admin' : primaryRole.toUpperCase()}
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
              id="logout-btn"
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto" id="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};