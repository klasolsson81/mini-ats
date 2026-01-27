import { cn } from '@/lib/utils/cn';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <div className={cn('glass-panel', className)}>
      {children}
    </div>
  );
}
