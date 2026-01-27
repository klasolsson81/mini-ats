import { cn } from '@/lib/utils/cn';

interface PillBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  glow?: boolean;
  className?: string;
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white shadow-sm',
  secondary: 'bg-gradient-to-r from-[var(--secondary)] to-[var(--secondary-light)] text-white shadow-sm',
  success: 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-sm',
  warning: 'bg-gradient-to-r from-amber-300 to-amber-400 text-gray-800 shadow-sm',
  danger: 'bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-sm',
  info: 'bg-gradient-to-r from-sky-400 to-sky-500 text-white shadow-sm',
  gray: 'bg-gray-50 text-gray-600 border border-gray-200',
};

export function PillBadge({
  children,
  variant = 'primary',
  glow = false,
  className
}: PillBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        'transition-all duration-200',
        variantStyles[variant],
        glow && 'shadow-md',
        className
      )}
    >
      {children}
    </span>
  );
}
