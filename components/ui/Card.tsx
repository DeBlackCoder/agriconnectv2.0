'use client';

import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'neural' | 'glass' | 'elevated' | 'glass-elevated';
  hoverable?: boolean;
  children: ReactNode;
}

export default function Card({
  variant = 'default',
  hoverable = false,
  children,
  className = '',
  ...props
}: CardProps) {
  const variants = {
    default: 'glass rounded-2xl p-6',
    neural: 'card-neural',
    glass: 'glass rounded-2xl p-6',
    elevated: 'glass-elevated rounded-2xl p-6',
    'glass-elevated': 'glass-elevated rounded-2xl p-6',
  };

  const hoverClass = hoverable
    ? 'cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-xl'
    : '';

  return (
    <div
      className={`${variants[variant]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
}

export function CardTitle({ children, className = '', gradient = false }: CardTitleProps) {
  return (
    <h3
      className={`text-2xl font-bold ${gradient ? 'gradient-text' : ''} ${className}`}
    >
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-sm opacity-70 ${className}`}>
      {children}
    </p>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return <div className={`mt-6 pt-4 border-t border-white/10 ${className}`}>{children}</div>;
}
