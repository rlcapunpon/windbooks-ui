import { useState, useEffect, useCallback, useRef } from 'react';
import type { MenuProps, MenuState, MenuItem } from './types';
import { MenuItemComponent } from './MenuItem';
import { cn } from '../../utils/cn';

export const Menu = ({
  items,
  className,
  variant = 'sidebar',
  collapsible = true,
  multipleOpen = false,
  showIcons = true,
  collapsed = false,
  userPermissions = [],
  onItemClick,
  onSubmenuToggle,
  renderItem,
  asyncLoader,
}: MenuProps) => {
  const [state, setState] = useState<MenuState>({
    openItems: new Set(),
    activeItem: null,
    loadingItems: new Set(),
  });

  const menuRef = useRef<HTMLDivElement>(null);

  // Filter items based on user permissions
  const filteredItems = items.filter(item => {
    // If no permissions required, show the item
    if (!item.permissions || item.permissions.length === 0) {
      return true;
    }

    // If user has wildcard permission (*), show all items
    if (userPermissions.includes('*')) {
      return true;
    }

    // Check if user has any of the required permissions
    return item.permissions.some(permission => userPermissions.includes(permission));
  });

  // Handle item toggle (expand/collapse)
  const handleToggle = useCallback((itemId: string) => {
    setState(prev => {
      const newOpenItems = new Set(prev.openItems);

      if (newOpenItems.has(itemId)) {
        newOpenItems.delete(itemId);
      } else {
        if (!multipleOpen) {
          // Close all other items if multipleOpen is false
          newOpenItems.clear();
        }
        newOpenItems.add(itemId);
      }

      return {
        ...prev,
        openItems: newOpenItems,
      };
    });
  }, [multipleOpen]);

  // Handle item click
  const handleItemClick = useCallback((item: MenuItem) => {
    setState(prev => ({
      ...prev,
      activeItem: item.id,
    }));

    if (item.onClick) {
      item.onClick();
    }

    onItemClick?.(item);
  }, [onItemClick]);

  // Handle async loading of children
  const handleAsyncLoad = useCallback(async (parentId: string) => {
    if (!asyncLoader) return;

    setState(prev => ({
      ...prev,
      loadingItems: new Set([...prev.loadingItems, parentId]),
    }));

    try {
      const children = await asyncLoader(parentId);

      // Update the items with loaded children
      // This would need to be handled by parent component or through a callback
      console.log('Loaded children for', parentId, children);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    } finally {
      setState(prev => {
        const newLoadingItems = new Set(prev.loadingItems);
        newLoadingItems.delete(parentId);
        return {
          ...prev,
          loadingItems: newLoadingItems,
        };
      });
    }
  }, [asyncLoader]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) return;

      const { key } = event;
      const focusableElements = menuRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const focusedElement = document.activeElement;
      const currentIndex = Array.from(focusableElements).indexOf(focusedElement as Element);

      switch (key) {
        case 'ArrowDown': {
          event.preventDefault();
          const nextIndex = Math.min(currentIndex + 1, focusableElements.length - 1);
          (focusableElements[nextIndex] as HTMLElement)?.focus();
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          const prevIndex = Math.max(currentIndex - 1, 0);
          (focusableElements[prevIndex] as HTMLElement)?.focus();
          break;
        }
        case 'Home': {
          event.preventDefault();
          (focusableElements[0] as HTMLElement)?.focus();
          break;
        }
        case 'End': {
          event.preventDefault();
          (focusableElements[focusableElements.length - 1] as HTMLElement)?.focus();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const baseClasses = cn(
    'menu-component',
    {
      'menu-sidebar': variant === 'sidebar',
      'menu-drawer': variant === 'drawer',
      'menu-horizontal': variant === 'horizontal',
    },
    className
  );

  return (
    <div ref={menuRef} className={baseClasses} role="navigation" aria-label="Main navigation">
      <ul className="menu-list" role="menubar">
        {filteredItems.map((item) => (
          <MenuItemComponent
            key={item.id}
            item={item}
            level={0}
            isOpen={state.openItems.has(item.id)}
            isActive={state.activeItem === item.id}
            isLoading={state.loadingItems.has(item.id)}
            onToggle={() => handleToggle(item.id)}
            onItemClick={handleItemClick}
            onAsyncLoad={handleAsyncLoad}
            showIcons={showIcons}
            collapsed={collapsed}
            userPermissions={userPermissions}
            onSubmenuToggle={onSubmenuToggle}
            renderItem={renderItem}
            collapsible={collapsible}
          />
        ))}
      </ul>
    </div>
  );
};