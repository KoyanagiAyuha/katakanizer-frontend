'use client';

import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  gradient?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  gradient = true,
  size = 'md',
  className = '',
  actions,
  breadcrumbs
}) => {
  const titleClasses = gradient
    ? 'bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent'
    : 'text-gray-900';

  const sizeClasses = {
    sm: {
      title: 'text-2xl',
      subtitle: 'text-lg',
      description: 'text-sm',
      spacing: 'mb-4'
    },
    md: {
      title: 'text-3xl',
      subtitle: 'text-xl',
      description: 'text-base',
      spacing: 'mb-6'
    },
    lg: {
      title: 'text-4xl lg:text-5xl',
      subtitle: 'text-xl lg:text-2xl',
      description: 'text-lg',
      spacing: 'mb-8'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`${currentSize.spacing} ${className}`.trim()}>
      {breadcrumbs && (
        <div className="mb-4">
          {breadcrumbs}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className={`${currentSize.title} font-bold ${titleClasses} mb-2`}>
            {title}
          </h1>

          {subtitle && (
            <h2 className={`${currentSize.subtitle} font-semibold text-gray-800 mb-2`}>
              {subtitle}
            </h2>
          )}

          {description && (
            <p className={`${currentSize.description} text-gray-600`}>
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="ml-6 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;