import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  href?: string;
  variant?: 'blue' | 'emerald' | 'cyan' | 'purple';
  className?: string;
}

const variantStyles = {
  blue: {
    glass: 'glass-blue',
    border: 'border-blue-300/50',
    iconBg: 'from-blue-500 to-indigo-600',
  },
  emerald: {
    glass: 'glass-emerald',
    border: 'border-emerald-300/50',
    iconBg: 'from-emerald-500 to-green-600',
  },
  cyan: {
    glass: 'glass-cyan',
    border: 'border-cyan-300/50',
    iconBg: 'from-cyan-500 to-teal-600',
  },
  purple: {
    glass: 'glass',
    border: 'border-purple-300/50',
    iconBg: 'from-purple-500 to-violet-600',
  },
};

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  variant = 'blue',
  className,
}: KpiCardProps) {
  const styles = variantStyles[variant];

  const content = (
    <div
      className={cn(
        'rounded-2xl border shadow-sm',
        styles.glass,
        styles.border,
        'transition-all duration-300',
        href && 'hover:scale-[1.02] hover:shadow-md cursor-pointer',
        className
      )}
    >
      <div className="p-3 sm:p-5 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 truncate">{title}</p>
          <p className="text-2xl sm:text-4xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1 truncate">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            'w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg shrink-0',
            styles.iconBg
          )}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
