import React from 'react';
import logo from '/public/wb_icon_03.svg';

interface BannerProps {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'hero' | 'compact';
  className?: string;
  children?: React.ReactNode;
  showLogo?: boolean;
  logoSrc?: string;
}

const Banner: React.FC<BannerProps> = ({
  title = "Windbooks",
  subtitle,
  variant = 'default',
  className = '',
  children,
  showLogo = true,
  logoSrc = logo
}) => {
  const baseClasses = "flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/95 backdrop-blur-xl";

  const variantClasses = {
    default: "h-16",
    hero: "h-24 bg-gradient-to-r from-primary to-green-400 text-white",
    compact: "h-12 px-4 py-2"
  };

  const titleClasses = {
    default: "text-xl font-bold text-gray-800",
    hero: "text-3xl font-bold text-white",
    compact: "text-lg font-semibold text-gray-700"
  };

  const subtitleClasses = {
    default: "text-sm text-gray-600 mt-1",
    hero: "text-lg text-white/90 mt-2",
    compact: "text-xs text-gray-500 mt-0.5"
  };

  return (
    <header className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="flex items-center space-x-4">
        {showLogo && (
          <div className="flex-shrink-0">
            <img
              src={logoSrc}
              alt="Windbooks Logo"
              className={`${variant === 'hero' ? 'w-[265px] max-w-[265px] h-auto' : 'w-8 h-8'} object-contain`}
            />
          </div>
        )}
        <div>
          <h1 className={titleClasses[variant]}>
            {title}
          </h1>
          {subtitle && (
            <p className={subtitleClasses[variant]}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {children && (
        <div className="flex items-center space-x-4">
          {children}
        </div>
      )}
    </header>
  );
};

export default Banner;