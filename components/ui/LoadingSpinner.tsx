'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'gradient' | 'white';
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 'md',
  variant = 'gradient',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-4',
  };

  const variants = {
    primary: 'border-primary-deep border-t-transparent',
    gradient: 'border-transparent border-t-primary-neural',
    white: 'border-white/30 border-t-white',
  };

  const spinner = (
    <div className={`rounded-full animate-spin ${sizes[size]} ${variants[variant]}`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center glass z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-sm text-muted animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
}
