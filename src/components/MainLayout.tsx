import type { ReactNode } from 'react';
import { Menu } from '../components/Menu/Menu';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_ROLE_PERMISSIONS } from '../config/permissions';
import type { MenuItem } from '../components/Menu/types';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout } = useAuth();

  // Extract role names from the user roles
  const userRoleNames = user?.roles?.map(userRole => userRole.role.name) || [];
  const userPermissions = userRoleNames.flatMap(roleName =>
    DEFAULT_ROLE_PERMISSIONS[roleName as keyof typeof DEFAULT_ROLE_PERMISSIONS] || []
  );

  // Get the primary role for display
  const primaryRole = user?.roles?.[0]?.role?.name || 'ROLE_LEVEL_5';

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
      permissions: ['SETTINGS.MANAGE'], // Only users with settings permissions
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
          id: 'org-dashboard',
          label: 'Dashboard',
          href: '/organizations/dashboard',
          permissions: ['USER.READ'],
        },
        {
          id: 'org-members',
          label: 'Members',
          href: '/organizations/members',
          permissions: ['USER.READ'],
        },
        {
          id: 'org-settings',
          label: 'Settings',
          href: '/organizations/settings',
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
      permissions: ['*'], // Only system administrators
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
  ];

  const handleMenuItemClick = (item: MenuItem) => {
    // Handle navigation or other actions
    if (item.href) {
      window.location.href = item.href;
    } else if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex">
      {/* Sidebar Menu */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Windbooks</h2>
          <p className="text-sm text-gray-600">Welcome, {user?.email?.split('@')[0]}</p>
        </div>
        <div className="p-4">
          <Menu
            items={menuItems}
            userPermissions={userPermissions}
            onItemClick={handleMenuItemClick}
            variant="sidebar"
            showIcons={true}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${primaryRole === 'ROLE_LEVEL_1' ? 'from-purple-500 to-pink-500' :
                primaryRole === 'ROLE_LEVEL_2' ? 'from-blue-500 to-cyan-500' :
                primaryRole === 'ROLE_LEVEL_3' ? 'from-green-500 to-emerald-500' :
                primaryRole === 'ROLE_LEVEL_4' ? 'from-yellow-500 to-orange-500' :
                'from-gray-500 to-slate-500'}`}>
                {primaryRole === 'ROLE_LEVEL_1' ? 'System Admin' :
                 primaryRole === 'ROLE_LEVEL_2' ? 'Manager' :
                 primaryRole === 'ROLE_LEVEL_3' ? 'Supervisor' :
                 primaryRole === 'ROLE_LEVEL_4' ? 'Operator' :
                 'Viewer'}
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};