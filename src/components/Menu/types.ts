import type { ReactNode } from 'react';

export interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  children?: MenuItem[];
  permissions?: string[];
  disabled?: boolean;
  badge?: string | number;
  external?: boolean;
}

export interface MenuProps {
  items: MenuItem[];
  className?: string;
  variant?: 'sidebar' | 'drawer' | 'horizontal';
  collapsible?: boolean;
  multipleOpen?: boolean;
  showIcons?: boolean;
  collapsed?: boolean;
  userPermissions?: string[];
  onItemClick?: (item: MenuItem) => void;
  onSubmenuToggle?: (itemId: string) => void;
  renderItem?: (item: MenuItem, isActive: boolean, level: number) => ReactNode;
  asyncLoader?: (parentId: string) => Promise<MenuItem[]>;
  activeItem?: string | null;
}

export interface MenuItemProps {
  item: MenuItem;
  level: number;
  isOpen: boolean;
  isActive: boolean;
  onToggle: () => void;
  onItemClick: (item: MenuItem) => void;
  showIcons: boolean;
  collapsed?: boolean;
  userPermissions: string[];
  onSubmenuToggle?: (itemId: string) => void;
  renderItem?: (item: MenuItem, isActive: boolean, level: number) => ReactNode;
  collapsible?: boolean;
  activeItem?: string | null;
}

export interface MenuState {
  openItems: Set<string>;
  activeItem: string | null;
  loadingItems: Set<string>;
}