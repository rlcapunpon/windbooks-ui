import { useState } from 'react';
import { Menu, type MenuItem } from '../Menu';
import { useAuth } from '../../contexts/AuthContext';

// Example menu items with different features
const createMenuItems = (_user: any): MenuItem[] => [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
      </svg>
    ),
    href: '/dashboard',
    permissions: ['USER.READ'],
  },
  {
    id: 'users',
    label: 'User Management',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    permissions: ['USER.READ', 'USER.CREATE'],
    children: [
      {
        id: 'users-list',
        label: 'All Users',
        href: '/admin/users',
        permissions: ['USER.READ'],
      },
      {
        id: 'users-create',
        label: 'Create User',
        href: '/admin/users/create',
        permissions: ['USER.CREATE'],
      },
      {
        id: 'users-roles',
        label: 'Manage Roles',
        href: '/admin/users/roles',
        permissions: ['USER.CREATE'],
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    permissions: ['REPORTS.EXPORT'],
    children: [
      {
        id: 'reports-sales',
        label: 'Sales Report',
        href: '/reports/sales',
        permissions: ['REPORTS.EXPORT'],
      },
      {
        id: 'reports-users',
        label: 'User Activity',
        href: '/reports/users',
        permissions: ['REPORTS.EXPORT'],
      },
    ],
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
    permissions: ['SETTINGS.MANAGE'],
    children: [
      {
        id: 'settings-profile',
        label: 'Profile',
        href: '/settings/profile',
        permissions: ['USER.READ'],
      },
      {
        id: 'settings-system',
        label: 'System Settings',
        href: '/settings/system',
        permissions: ['SETTINGS.MANAGE'],
      },
    ],
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    href: '/help',
    permissions: [], // No permissions required
  },
];

export const MenuExample = () => {
  const { user } = useAuth();
  const [variant, setVariant] = useState<'sidebar' | 'drawer' | 'horizontal'>('sidebar');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Mock user permissions based on resources
  const userPermissions: string[] = [];
  if (user?.isSuperAdmin) {
    userPermissions.push('*');
  } else {
    user?.resources?.forEach(resource => {
      switch (resource.role.toLowerCase()) {
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

  const menuItems = createMenuItems(user);

  const handleItemClick = (item: MenuItem) => {
    console.log('Menu item clicked:', item);
    if (variant === 'drawer') {
      setIsDrawerOpen(false);
    }
  };

  const handleAsyncLoad = async (parentId: string): Promise<MenuItem[]> => {
    // Simulate async loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      {
        id: `${parentId}-async-1`,
        label: `Async Item 1 for ${parentId}`,
        href: `/async/${parentId}/1`,
      },
      {
        id: `${parentId}-async-2`,
        label: `Async Item 2 for ${parentId}`,
        href: `/async/${parentId}/2`,
      },
    ];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Menu Component Demo</h2>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Menu Variant</label>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sidebar">Sidebar</option>
              <option value="drawer">Drawer (Mobile)</option>
              <option value="horizontal">Horizontal</option>
            </select>
          </div>

          {variant === 'drawer' && (
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {isDrawerOpen ? 'Close' : 'Open'} Drawer
            </button>
          )}
        </div>

        {/* Menu Display */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          {variant === 'sidebar' && (
            <div className="w-64">
              <Menu
                items={menuItems}
                variant="sidebar"
                userPermissions={userPermissions}
                onItemClick={handleItemClick}
                asyncLoader={handleAsyncLoad}
              />
            </div>
          )}

          {variant === 'drawer' && (
            <div className="relative h-96">
              <Menu
                items={menuItems}
                variant="drawer"
                className={isDrawerOpen ? '' : 'menu-closed'}
                userPermissions={userPermissions}
                onItemClick={handleItemClick}
                asyncLoader={handleAsyncLoad}
              />
            </div>
          )}

          {variant === 'horizontal' && (
            <Menu
              items={menuItems}
              variant="horizontal"
              userPermissions={userPermissions}
              onItemClick={handleItemClick}
              asyncLoader={handleAsyncLoad}
            />
          )}
        </div>

        {/* Info */}
        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Current User:</strong> {user?.email || 'Not logged in'}</p>
          <p><strong>Permissions:</strong> {userPermissions.join(', ') || 'None'}</p>
          <p><strong>Features:</strong> RBAC, Keyboard Navigation, Async Loading, Responsive Design</p>
        </div>
      </div>
    </div>
  );
};