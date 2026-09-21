import { cn } from '@/lib/utils';

interface AvatarProps {
  initials: string;
  color: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  online?: boolean;
  ringColor?: string;
  ringWidth?: number;
  className?: string;
}

const sizeMap = {
  sm: 'w-10 h-10 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-14 h-14 text-sm',
  xl: 'w-20 h-20 text-lg',
  xxl: 'w-[120px] h-[120px] text-3xl',
};

const dotSizeMap = {
  sm: 'w-3 h-3 border-2',
  md: 'w-3.5 h-3.5 border-2',
  lg: 'w-4 h-4 border-2',
  xl: 'w-5 h-5 border-[3px]',
  xxl: 'w-6 h-6 border-[3px]',
};

export function Avatar({
  initials,
  color,
  size = 'md',
  online = false,
  ringColor,
  ringWidth = 2,
  className,
}: AvatarProps) {
  return (
    <div className={cn('relative shrink-0', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-heading font-extrabold text-white relative overflow-hidden',
          sizeMap[size]
        )}
        style={{
          background: color,
          boxShadow: ringColor
            ? `0 0 0 ${ringWidth}px ${ringColor}, 0 2px 6px rgba(15,23,42,0.12)`
            : '0 2px 6px rgba(15,23,42,0.12)',
        }}
      >
        <span className="relative z-10">{initials}</span>
      </div>
      {online && (
        <div
          className={cn(
            'absolute bottom-0 right-0 rounded-full bg-sevchik-mint border-white z-20',
            dotSizeMap[size]
          )}
          style={{ boxShadow: '0 0 0 1px #4FD3C8' }}
        />
      )}
    </div>
  );
}
