import { cn } from '@/lib/utils/cn';
import { ButtonHTMLAttributes } from 'react';

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function GlowButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: GlowButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'pill-button-primary',
    secondary: 'pill-button-secondary',
    outline: 'pill-button-outline',
  };

  return (
    <button
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
