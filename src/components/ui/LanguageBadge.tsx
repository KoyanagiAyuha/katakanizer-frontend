'use client';

import React from 'react';
import { LANGUAGE_LABELS } from '../../utils/constants';

export interface LanguageBadgeProps {
  language: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
  className?: string;
}

const LanguageBadge: React.FC<LanguageBadgeProps> = ({
  language,
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const label = LANGUAGE_LABELS[language] || `🌐 ${language}`;

  const baseClasses = 'inline-flex items-center font-medium rounded-full';

  const variantClasses = {
    default: 'bg-indigo-100 text-indigo-700',
    minimal: 'bg-gray-100 text-gray-700'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm'
  };

  return (
    <span
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `.trim()}
    >
      {label}
    </span>
  );
};

export default LanguageBadge;