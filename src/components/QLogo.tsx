import { motion } from 'framer-motion';

interface QLogoProps {
  size?: number;
  animate?: boolean;
  variant?: 'solid' | 'ring' | 'gradient';
}

/**
 * 3D "plastic" Q logo.
 * - variant "solid": filled purple Q with orange tail, drop shadow
 * - variant "ring": outlined Q ring
 * - variant "gradient": gradient-filled Q
 */
export function QLogo({ size = 64, animate = false, variant = 'solid' }: QLogoProps) {
  const uid = `qlogo-${variant}-${size}`;
  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    filter: 'drop-shadow(0 8px 24px rgba(101, 70, 199, 0.3))',
  };

  const defs = (
    <>
      <linearGradient id={`${uid}-purple`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8366D9" />
        <stop offset="55%" stopColor="#6546C7" />
        <stop offset="100%" stopColor="#4E35A5" />
      </linearGradient>
      <linearGradient id={`${uid}-purpleGrad`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#8366D9" />
        <stop offset="100%" stopColor="#4E35A5" />
      </linearGradient>
      <linearGradient id={`${uid}-gloss`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
        <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${uid}-orange`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFB87A" />
        <stop offset="100%" stopColor="#E8802F" />
      </linearGradient>
    </>
  );

  // Q ring path (outer)
  const ringPath = "M32 6C18.2 6 7 17.2 7 31C7 44.8 18.2 56 32 56C39 56 45.3 53.2 49.8 48.7L55 54L59 50L53.7 44.7C57.6 40.2 57 35.5 57 31C57 17.2 45.8 6 32 6Z";
  // Q inner cutout path
  const innerPath = "M32 15C23.7 15 17 21.7 17 30C17 38.3 23.7 45 32 45C36.2 45 39.9 43.3 42.7 40.5L37.5 35.3L41.5 31.3L46.7 36.5C48.9 34.2 47 33 47 30C47 21.7 40.3 15 32 15Z";
  // Tail (the Q tail)
  const tailPath = "M42 46L54 58";

  const fillMap: Record<string, string> = {
    solid: `url(#${uid}-purple)`,
    gradient: `url(#${uid}-purpleGrad)`,
    ring: 'none',
  };
  const strokeMap: Record<string, string> = {
    solid: 'none',
    gradient: 'none',
    ring: '#6546C7',
  };

  const renderQ = (isAnimated: boolean) => {
    if (!isAnimated) {
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ overflow: 'visible' }}>
          {defs}
          {/* Outer ring with 3D fill */}
          <path d={ringPath} fill={fillMap[variant]} stroke={strokeMap[variant]} strokeWidth={variant === 'ring' ? 4 : 0} />
          {/* Inner cutout (cream background) */}
          <path d={innerPath} fill="#FFF8ED" />
          {/* Gloss highlight on top */}
          <path d={ringPath} fill={`url(#${uid}-gloss)`} />
          {/* Tail */}
          <path d={tailPath} stroke={`url(#${uid}-orange)`} strokeWidth="6" strokeLinecap="round" />
        </svg>
      );
    }
    const halfW = size / 2;
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ overflow: 'visible' }}>
        {defs}
        <motion.path
          d={ringPath}
          fill={fillMap[variant]}
          stroke={strokeMap[variant]}
          strokeWidth={variant === 'ring' ? 4 : 0}
          initial={{ opacity: 0, x: -halfW }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          d={innerPath}
          fill="#FFF8ED"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          d={ringPath}
          fill={`url(#${uid}-gloss)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        />
        <motion.path
          d={tailPath}
          stroke={`url(#${uid}-orange)`}
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.55, ease: 'easeOut' }}
        />
      </svg>
    );
  };

  return <div style={containerStyle}>{renderQ(animate)}</div>;
}

/** Three Q logo variants displayed side-by-side for selection */
export function QLogoShowcase() {
  const variants: { variant: 'solid' | 'ring' | 'gradient'; label: string; desc: string }[] = [
    { variant: 'solid', label: 'Объёмный', desc: 'Градиент + блик' },
    { variant: 'gradient', label: 'Диагональ', desc: 'Скошенный градиент' },
    { variant: 'ring', label: 'Контурный', desc: 'Только рамка' },
  ];
  return (
    <div className="flex gap-6 justify-center">
      {variants.map(({ variant, label, desc }) => (
        <div key={variant} className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-card bg-white flex items-center justify-center" style={{ boxShadow: '0 8px 24px rgba(15,23,42,0.07)' }}>
            <QLogo size={56} variant={variant} />
          </div>
          <span className="font-heading font-bold text-sm text-sevchik-text">{label}</span>
          <span className="text-xs text-sevchik-textSecondary font-body">{desc}</span>
        </div>
      ))}
    </div>
  );
}
