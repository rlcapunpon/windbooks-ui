import React from 'react';

interface FooterProps {
  developer?: string;
  year?: number;
  variant?: 'default' | 'minimal' | 'compact';
  className?: string;
  showCopyright?: boolean;
  additionalContent?: React.ReactNode;
}

const Footer: React.FC<FooterProps> = ({
  developer = "Aerys Hyperlabs",
  year = new Date().getFullYear(),
  variant = 'default',
  className = '',
  showCopyright = true,
  additionalContent
}) => {
  const baseClasses = "w-full border-t border-gray-200 bg-white/95 backdrop-blur-xl";

  const variantClasses = {
    default: "py-6 px-6",
    minimal: "py-4 px-4",
    compact: "py-2 px-3"
  };

  const textClasses = {
    default: "text-sm text-gray-600",
    minimal: "text-xs text-gray-500",
    compact: "text-xs text-gray-500"
  };

  return (
    <footer className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4">
          {showCopyright && (
            <p className={textClasses[variant]}>
              © {year} Windbooks. All rights reserved.
            </p>
          )}
          <p className={`${textClasses[variant]} opacity-75`}>
            Developed by {developer}
          </p>
        </div>

        {additionalContent && (
          <div className="flex items-center space-x-4">
            {additionalContent}
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;