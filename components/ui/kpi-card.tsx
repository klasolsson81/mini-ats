import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'blue' | 'purple' | 'cyan';
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

const variantStyles = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100/80',
    iconBg: 'from-blue-400 to-blue-600',
    border: 'border-blue-200/50',
    glow: 'rgba(59, 130, 246, 0.15)',
  },
  purple: {
    bg: 'bg-gradient-to-br from-violet-100 via-purple-50 to-violet-100/80',
    iconBg: 'from-violet-400 to-purple-600',
    border: 'border-violet-200/50',
    glow: 'rgba(139, 92, 246, 0.15)',
  },
  cyan: {
    bg: 'bg-gradient-to-br from-cyan-100 via-cyan-50 to-cyan-100/80',
    iconBg: 'from-cyan-400 to-cyan-600',
    border: 'border-cyan-200/50',
    glow: 'rgba(6, 182, 212, 0.15)',
  },
};

export function KpiCard({
  title,
  value,
  icon: Icon,
  variant = 'blue',
  trend,
  className,
}: KpiCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5',
        styles.bg,
        'backdrop-blur-sm',
        'border',
        styles.border,
        'shadow-sm hover:shadow-md transition-all duration-300',
        'hover:scale-[1.02]',
        className
      )}
      style={{
        boxShadow: `0 4px 20px ${styles.glow}, 0 2px 8px rgba(0,0,0,0.04)`,
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id={`kpi-pattern-${variant}`}
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#kpi-pattern-${variant})`} />
        </svg>
      </div>

      {/* Icon background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-20">
        <Icon className="w-full h-full text-gray-600" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          <div
            className={cn(
              'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md',
              styles.iconBg
            )}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex items-baseline gap-3">
          <p className="text-4xl font-bold text-gray-900">{value}</p>
          {trend && (
            <span
              className={cn(
                'text-sm font-medium',
                trend.positive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.positive ? '+' : ''}
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
