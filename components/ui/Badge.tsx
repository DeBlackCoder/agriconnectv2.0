'use client';

import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neural' | 'primary';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  glow?: boolean;
}

export default function Badge({
  variant = 'default',
  size = 'md',
  glow = false,
  children,
  className = '',
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-white/10 text-foreground border-white/20',
    success: 'bg-success/20 text-success border-success/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    error: 'bg-error/20 text-error border-error/30',
    info: 'bg-info/20 text-info border-info/30',
    neural: 'gradient-neural text-white border-transparent',
    primary: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
    icon: 'p-1',
  };

  const glowClass = glow ? 'glow-primary' : '';

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full
        font-semibold border backdrop-blur-sm
        transition-all duration-300
        ${variants[variant]}
        ${sizes[size]}
        ${glowClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
