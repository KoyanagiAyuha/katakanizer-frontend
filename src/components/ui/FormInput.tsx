'use client';

import React from 'react';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'rounded';
  inputSize?: 'sm' | 'md' | 'lg';
}

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'rounded';
  inputSize?: 'sm' | 'md' | 'lg';
}

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'rounded';
  inputSize?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const getBaseClasses = (variant: 'default' | 'rounded', inputSize: 'sm' | 'md' | 'lg', hasError: boolean) => {
  const baseClasses = 'w-full border transition-colors text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2';

  const variantClasses = {
    default: 'rounded-md focus:ring-blue-500 focus:border-blue-500',
    rounded: 'rounded-xl focus:ring-pink-500 focus:border-pink-500'
  };

  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3',
    lg: 'p-4'
  };

  const errorClasses = hasError
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300';

  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[inputSize]} ${errorClasses}`;
};

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  inputSize = 'md',
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-800"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${getBaseClasses(variant, inputSize, hasError)} ${className}`.trim()}
        {...props}
      />
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-gray-500 text-sm">{helperText}</p>
      )}
    </div>
  );
};

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  inputSize = 'md',
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-800"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`${getBaseClasses(variant, inputSize, hasError)} resize-none ${className}`.trim()}
        {...props}
      />
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-gray-500 text-sm">{helperText}</p>
      )}
    </div>
  );
};

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  inputSize = 'md',
  className = '',
  children,
  id,
  ...props
}) => {
  const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-800"
        >
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`${getBaseClasses(variant, inputSize, hasError)} ${className}`.trim()}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-gray-500 text-sm">{helperText}</p>
      )}
    </div>
  );
};

export default FormInput;