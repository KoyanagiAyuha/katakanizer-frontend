'use client';

import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'history' | 'simple';
  onClick?: () => void;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  onClick,
  className = '',
  padding = 'md'
}) => {
  const baseClasses = 'bg-white rounded-2xl border transition-all duration-300';

  const variantClasses = {
    default: 'shadow-lg hover:shadow-xl border-gray-200',
    history: 'bg-white/70 backdrop-blur-sm shadow-xl border-white/20 hover:shadow-2xl rounded-3xl overflow-hidden',
    simple: 'shadow-md hover:shadow-lg border-gray-100'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${clickableClasses}
        ${className}
      `.trim()}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;