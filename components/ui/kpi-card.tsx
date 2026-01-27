import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  href?: string;
  variant?: 'blue' | 'purple' | 'cyan';
  className?: string;
}

const variantStyles = {
  blue: {
    bg: 'from-blue-500/20 via-blue-400/10 to-transparent',
    iconBg: 'from-blue-500 to-blue-600',
    border: 'border-blue-300/30',
    hoverBorder: 'hover:border-blue-400/50',
  },
  purple: {
    bg: 'from-violet-500/20 via-violet-400/10 to-transparent',
    iconBg: 'from-violet-500 to-purple-600',
    border: 'border-violet-300/30',
    hoverBorder: 'hover:border-violet-400/50',
  },
  cyan: {
    bg: 'from-cyan-500/20 via-cyan-400/10 to-transparent',
    iconBg: 'from-cyan-500 to-teal-600',
    border: 'border-cyan-300/30',
    hoverBorder: 'hover:border-cyan-400/50',
  },
};

export function KpiCard({
  title,
  value,
  icon: Icon,
  href,
  variant = 'blue',
  className,
}: KpiCardProps) {
  const styles = variantStyles[variant];

  const content = (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5',
        'bg-white/40 backdrop-blur-md',
        'border',
        styles.border,
        href && styles.hoverBorder,
        'shadow-sm transition-all duration-300',
        href && 'hover:shadow-lg hover:scale-[1.02] cursor-pointer',
        className
      )}
    >
      {/* Gradient overlay */}
      <div className={cn('absolute inset-0 bg-gradient-to-br', styles.bg)} />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
          <p className="text-4xl font-bold text-gray-900">{value}</p>
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
