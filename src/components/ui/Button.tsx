'use client';

import React from 'react';
import { ButtonLoadingSpinner } from './LoadingSpinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transform';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white shadow-lg hover:shadow-xl hover:scale-105 disabled:transform-none disabled:hover:shadow-lg focus:ring-pink-500',
    secondary: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 focus:ring-gray-500',
    danger: 'bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
    icon: 'p-2 rounded-full transition-all hover:bg-gray-50 focus:ring-gray-500'
  };

  const sizeClasses = {
    sm: variant === 'icon' ? 'p-1.5' : 'py-2 px-4 text-sm rounded-lg',
    md: variant === 'icon' ? 'p-2' : 'py-3 px-6 text-base rounded-xl',
    lg: variant === 'icon' ? 'p-3' : 'py-4 px-8 text-lg rounded-xl'
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `.trim()}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <ButtonLoadingSpinner />
          {loadingText && <span className="ml-2">{loadingText}</span>}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;