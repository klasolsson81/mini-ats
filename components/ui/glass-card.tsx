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
        'rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 p-5',
        'shadow-sm',
        hover && 'transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:bg-white/40',
        className
      )}
    >
      {children}
    </div>
  );
}
