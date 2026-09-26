import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  initials: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  online?: boolean;
  className?: string;
  /** Иконка вместо инициалов — для системных "чатов" вроде "Избранное" */
  icon?: ReactNode;
}

const MINT = '#4DC3C8';
const MINT_RGB = '77, 195, 200';

const sizeMap = {
  xs: 'w-8 h-8 text-[10px]',
  sm: 'w-11 h-11 text-sm',
  md: 'w-14 h-14 text-base',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-xl',
  xxl: 'w-[140px] h-[140px] text-4xl',
};

const iconSizeMap = {
  xs: 15,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 38,
  xxl: 56,
};

export function Avatar({
  initials,
  size = 'md',
  online = false,
  className,
  icon,
}: AvatarProps) {
  return (
    <div className={cn('relative shrink-0', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-heading font-black relative overflow-hidden',
          sizeMap[size]
        )}
        style={{
          background: 'var(--avatar-glass-bg)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          boxShadow: online
            ? `0 0 0 1px var(--avatar-glass-border), 0 0 16px 3px rgba(${MINT_RGB}, 0.5), 0 0 32px 8px rgba(${MINT_RGB}, 0.28)`
            : '0 0 0 1px var(--avatar-glass-border), 0 2px 6px rgba(15,23,42,0.12)',
        }}
      >
        {icon ? (
          <span className="relative z-10 flex items-center justify-center text-white" style={{ width: iconSizeMap[size], height: iconSizeMap[size] }}>
            {icon}
          </span>
        ) : (
          <span
            className="relative z-10"
            style={{
              color: MINT,
              opacity: online ? 1 : 0.55,
              textShadow: online
                ? `0 0 4px rgba(${MINT_RGB}, 0.85), 0 0 10px rgba(${MINT_RGB}, 0.55), 0 0 20px rgba(${MINT_RGB}, 0.3)`
                : 'none',
            }}
          >
            {initials}
          </span>
        )}
      </div>
    </div>
  );
}
