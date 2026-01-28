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
      <div className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
          <p className="text-4xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm font-medium text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg',
            styles.iconBg
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
