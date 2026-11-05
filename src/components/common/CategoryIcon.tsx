import React from 'react';

interface CategoryIconProps {
  icon?: string;
  customLogoUrl?: string;
  name?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  icon = '📁',
  customLogoUrl,
  name,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4 text-xs',
    sm: 'w-5 h-5 text-sm',
    md: 'w-7 h-7 text-base',
    lg: 'w-9 h-9 text-xl',
  };

  const imgSizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const imageSrc = customLogoUrl || (icon && (icon.startsWith('data:image') || icon.startsWith('http')) ? icon : null);

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={name || 'Catégorie'}
        className={`${imgSizeClasses[size]} rounded-lg object-cover shadow-xs inline-block shrink-0 ${className}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center select-none shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {icon}
    </span>
  );
};
