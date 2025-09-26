'use client';

import React from 'react';

export interface MessageProps {
  children: React.ReactNode;
  variant?: 'error' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md';
  className?: string;
  onClose?: () => void;
}

const Message: React.FC<MessageProps> = ({
  children,
  variant = 'info',
  size = 'md',
  className = '',
  onClose
}) => {
  const baseClasses = 'border rounded-xl';

  const variantClasses = {
    error: 'bg-red-50 border-red-200 text-red-600',
    success: 'bg-green-50 border-green-200 text-green-600',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    info: 'bg-blue-50 border-blue-200 text-blue-600'
  };

  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-sm'
  };

  const getIcon = () => {
    switch (variant) {
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}>
      <div className="flex items-start">
        {getIcon()}
        <div className="ml-3 flex-1">
          {children}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Convenience components
export const ErrorMessage: React.FC<Omit<MessageProps, 'variant'>> = (props) => (
  <Message variant="error" {...props} />
);

export const SuccessMessage: React.FC<Omit<MessageProps, 'variant'>> = (props) => (
  <Message variant="success" {...props} />
);

export const WarningMessage: React.FC<Omit<MessageProps, 'variant'>> = (props) => (
  <Message variant="warning" {...props} />
);

export const InfoMessage: React.FC<Omit<MessageProps, 'variant'>> = (props) => (
  <Message variant="info" {...props} />
);

export default Message;