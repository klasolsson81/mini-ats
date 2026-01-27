import { cn } from '@/lib/utils/cn';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass-card',
        hover && 'transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
        className
      )}
    >
      {children}
    </div>
  );
}
