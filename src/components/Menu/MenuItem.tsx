import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  collapsed = false,
  userPermissions,
  onSubmenuToggle,
  renderItem,
  collapsible = true,
  activeItem,
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

  // Always show menu items (no permission filtering)

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasChildren && collapsible) {
      onToggle();
    }
    
    // Always call onItemClick for all menu items, regardless of whether they have children
    onItemClick(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  // Custom render if provided
  if (renderItem) {
    return <>{renderItem(item, isActive, level)}</>;
  }

  const itemClasses = cn(
    'menu-item',
    'group relative flex items-center py-2 text-sm font-medium rounded-lg transition-all duration-200',
    'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50',
    {
      'px-3': !collapsed,
      'px-1': collapsed,
      'justify-center': collapsed, // Center all items when collapsed
      'bg-blue-50 text-primary': isActive,
      'text-gray-900 hover:text-primary': !isActive,
      'cursor-pointer': !item.disabled,
      'cursor-not-allowed opacity-50': item.disabled,
      'pl-6': level > 0 && !collapsed,
      'pl-9': level > 1 && !collapsed,
      'pl-12': level > 2 && !collapsed,
    }
  );

  const linkClasses = cn(
    'flex items-center min-w-0',
    {
      'flex-1': !collapsed || hasChildren || collapsed, // Always flex-1 when collapsed for centering
      'pointer-events-none': item.disabled,
    }
  );

  return (
    <li className="menu-item-container">
      <div className={itemClasses}>
        {item.href ? (
          item.external ? (
            <a
              href={item.href}
              className={linkClasses}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              role="menuitem"
              aria-current={isActive ? 'page' : undefined}
            >
              {showIcons && item.icon && (
                <span className={cn(
                  "flex-shrink-0", 
                  collapsed ? "w-5 h-5 mr-2" : "mr-3"
                )} aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-primary text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </a>
          ) : (
            <Link
              to={item.href}
              className={linkClasses}
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              role="menuitem"
              aria-current={isActive ? 'page' : undefined}
            >
              {showIcons && item.icon && (
                <span className={cn(
                  "flex-shrink-0", 
                  collapsed ? "w-5 h-5 mr-2" : "mr-3"
                )} aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-primary text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          )
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
              <span className={cn(
                "flex-shrink-0", 
                collapsed ? "w-5 h-5 mr-2" : "mr-3"
              )} aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-primary text-white text-xs px-2 py-1 rounded-full">
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

        {hasChildren && collapsible && !collapsed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
              onSubmenuToggle?.(item.id);
            }}
            className={cn(
              "p-1 rounded hover:bg-gray-100 transition-colors flex-shrink-0",
              collapsed ? "ml-2" : "ml-2"
            )}
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
              isActive={activeItem === child.id} // Check if this specific child is the active item
              onToggle={() => {}} // Children don't toggle in this implementation
              onItemClick={onItemClick}
              showIcons={showIcons}
              userPermissions={userPermissions}
              renderItem={renderItem}
              collapsible={false} // Disable collapsible for children to avoid complexity
              activeItem={activeItem} // Pass down activeItem to nested children
            />
          ))}
        </ul>
      )}
    </li>
  );
};