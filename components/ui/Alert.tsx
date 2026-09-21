'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

export default function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
  ...props
}: AlertProps) {
  const variants = {
    success: {
      bg: 'bg-success/10 border-success/30',
      icon: <CheckCircle className="w-5 h-5 text-success" />,
      titleColor: 'text-success',
    },
    error: {
      bg: 'bg-error/10 border-error/30',
      icon: <XCircle className="w-5 h-5 text-error" />,
      titleColor: 'text-error',
    },
    warning: {
      bg: 'bg-warning/10 border-warning/30',
      icon: <AlertCircle className="w-5 h-5 text-warning" />,
      titleColor: 'text-warning',
    },
    info: {
      bg: 'bg-info/10 border-info/30',
      icon: <Info className="w-5 h-5 text-info" />,
      titleColor: 'text-info',
    },
  };

  const config = variants[variant];

  return (
    <div
      className={`
        relative rounded-xl border backdrop-blur-sm p-4
        ${config.bg}
        ${className}
      `}
      {...props}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold mb-1 ${config.titleColor}`}>
              {title}
            </h4>
          )}
          <div className="text-sm text-foreground/80">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
