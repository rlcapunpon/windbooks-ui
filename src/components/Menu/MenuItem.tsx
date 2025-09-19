import { useState, useEffect } from 'react';
import type { MenuItemProps } from './types';
import { cn } from '../../utils/cn';

export const MenuItemComponent = ({
  item,
  level,
  isOpen,
  isActive,
  isLoading,
  onToggle,
  onItemClick,
  onAsyncLoad,
  showIcons,
  userPermissions,
  renderItem,
  collapsible = true,
}: MenuItemProps & { isLoading?: boolean; onAsyncLoad?: (parentId: string) => void }) => {
  const [childrenLoaded, setChildrenLoaded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const shouldShowChildren = hasChildren && isOpen;

  // Load children asynchronously if needed
  useEffect(() => {
    if (hasChildren && isOpen && !childrenLoaded && onAsyncLoad) {
      onAsyncLoad(item.id);
      setChildrenLoaded(true);
    }
  }, [hasChildren, isOpen, childrenLoaded, item.id, onAsyncLoad]);

  // Check if user has permission for this item
  const hasPermission = () => {
    if (!item.permissions || item.permissions.length === 0) return true;
    return item.permissions.some(permission => userPermissions.includes(permission));
  };

  if (!hasPermission()) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasChildren && collapsible) {
      onToggle();
    } else {
      onItemClick(item);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as any);
    }
  };

  // Custom render if provided
  if (renderItem) {
    return <>{renderItem(item, isActive, level)}</>;
  }

  const itemClasses = cn(
    'menu-item',
    'group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
    'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50',
    {
      'bg-blue-50 text-blue-600': isActive,
      'text-gray-900 hover:text-blue-600': !isActive,
      'cursor-pointer': !item.disabled,
      'cursor-not-allowed opacity-50': item.disabled,
      'pl-6': level > 0,
      'pl-9': level > 1,
      'pl-12': level > 2,
    }
  );

  const linkClasses = cn(
    'flex items-center flex-1 min-w-0',
    {
      'pointer-events-none': item.disabled,
    }
  );

  return (
    <li className="menu-item-container">
      <div className={itemClasses}>
        {hasChildren && collapsible && (
          <button
            onClick={onToggle}
            className="mr-2 p-1 rounded hover:bg-gray-100 transition-colors"
            aria-expanded={isOpen}
            aria-label={`Toggle ${item.label} submenu`}
          >
            <svg
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                isOpen ? 'rotate-90' : ''
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {item.href ? (
          <a
            href={item.href}
            className={linkClasses}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noopener noreferrer' : undefined}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="menuitem"
            aria-current={isActive ? 'page' : undefined}
          >
            {showIcons && item.icon && (
              <span className="mr-3 flex-shrink-0" aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </a>
        ) : (
          <button
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={linkClasses}
            disabled={item.disabled}
            tabIndex={0}
            role="menuitem"
            aria-current={isActive ? 'page' : undefined}
          >
            {showIcons && item.icon && (
              <span className="mr-3 flex-shrink-0" aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        )}

        {isLoading && (
          <div className="ml-2 animate-spin">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        )}
      </div>

      {shouldShowChildren && (
        <ul
          className="menu-submenu ml-4 mt-1 space-y-1"
          role="menu"
          aria-label={`${item.label} submenu`}
        >
          {item.children?.map((child) => (
            <MenuItemComponent
              key={child.id}
              item={child}
              level={level + 1}
              isOpen={false} // Children don't have their own open state in this implementation
              isActive={isActive}
              onToggle={() => {}} // Children don't toggle in this implementation
              onItemClick={onItemClick}
              showIcons={showIcons}
              userPermissions={userPermissions}
              renderItem={renderItem}
              collapsible={false} // Disable collapsible for children to avoid complexity
            />
          ))}
        </ul>
      )}
    </li>
  );
};