'use client';

import React from 'react';

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
  const getLanguageDisplay = (lang: string) => {
    const languages = {
      'en': { flag: '🇺🇸', name: 'English' },
      'ko': { flag: '🇰🇷', name: 'Korean' },
      'fr': { flag: '🇫🇷', name: 'French' },
      'es': { flag: '🇪🇸', name: 'Spanish' },
      'de': { flag: '🇩🇪', name: 'German' },
      'it': { flag: '🇮🇹', name: 'Italian' },
      'pt': { flag: '🇵🇹', name: 'Portuguese' },
      'zh': { flag: '🇨🇳', name: 'Chinese' },
      'ja': { flag: '🇯🇵', name: 'Japanese' },
      'ru': { flag: '🇷🇺', name: 'Russian' },
      'ar': { flag: '🇸🇦', name: 'Arabic' },
      'hi': { flag: '🇮🇳', name: 'Hindi' },
      'th': { flag: '🇹🇭', name: 'Thai' },
      'vi': { flag: '🇻🇳', name: 'Vietnamese' }
    };
    return languages[lang as keyof typeof languages] || { flag: '🌐', name: lang };
  };

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

  const { flag, name } = getLanguageDisplay(language);

  return (
    <span
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `.trim()}
    >
      <span className="mr-1">{flag}</span>
      {name}
    </span>
  );
};

export default LanguageBadge;