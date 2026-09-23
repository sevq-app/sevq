import { useId } from 'react';

interface QLogoProps {
  size?: number;
  /** Plays the idle look-around + smile loop. Off by default (static resting pose). */
  animate?: boolean;
}

/**
 * Севчик — талисман приложения: кольцо-голова, две ножки, глаза со зрачками и звёздочка.
 * При animate=true зрачки поглядывают на звезду, а рот в такт выгибается в улыбку и обратно.
 */
export function QLogo({ size = 64, animate = false }: QLogoProps) {
  const uid = useId().replace(/:/g, '');

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    filter: 'drop-shadow(0 8px 24px rgba(101, 70, 199, 0.3))',
  };

  const mouthRest = 'M 91 127 Q 100 127 109 127';
  const mouthSmile = 'M 91 121 Q 100 133 109 121';

  return (
    <div style={containerStyle}>
      {animate && (
        <style>{`
          @keyframes qlogoLook-${uid} {
            0%, 18%   { transform: translate(-7px, 5px); }
            40%, 55%  { transform: translate(7px, -7px); }
            82%, 100% { transform: translate(-7px, 5px); }
          }
          .qlogo-eyes-${uid} {
            transform-box: fill-box;
            transform-origin: center;
            animation: qlogoLook-${uid} 5s ease-in-out infinite;
          }
        `}</style>
      )}
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`${uid}-purple`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8366D9" />
            <stop offset="55%" stopColor="#6546C7" />
            <stop offset="100%" stopColor="#4E35A5" />
          </linearGradient>
          <linearGradient id={`${uid}-star`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFB87A" />
            <stop offset="100%" stopColor="#E8802F" />
          </linearGradient>
          <radialGradient id={`${uid}-eyeWhite`} cx="0.35" cy="0.3" r="0.75">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E3E0F2" />
          </radialGradient>
        </defs>

        {/* Ножки */}
        <g fill="#FFFFFF">
          <rect x="50" y="130" width="16" height="42" rx="8" transform="rotate(-32 58 130)" />
          <rect x="134" y="130" width="16" height="42" rx="8" transform="rotate(32 142 130)" />
        </g>

        {/* Кольцо-голова */}
        <circle cx="100" cy="92" r="58" fill="#FFFFFF" />
        <circle cx="100" cy="92" r="52" fill={`url(#${uid}-purple)`} />

        {/* Белая основа глаз — неподвижна */}
        <ellipse cx="77" cy="90" rx="21.5" ry="26" fill={`url(#${uid}-eyeWhite)`} />
        <ellipse cx="123" cy="90" rx="21.5" ry="26" fill={`url(#${uid}-eyeWhite)`} />

        {/* Зрачки с бликом — "смотрят" */}
        <g className={animate ? `qlogo-eyes-${uid}` : undefined} transform={animate ? undefined : 'translate(-7, 5)'}>
          <circle cx="77" cy="92" r="10.5" fill="#1A1522" />
          <circle cx="73" cy="88" r="3.3" fill="#FFFFFF" />
          <circle cx="123" cy="92" r="10.5" fill="#1A1522" />
          <circle cx="119" cy="88" r="3.3" fill="#FFFFFF" />
        </g>

        {/* Рот: выгибается из прямой линии в улыбку и обратно, в такт со взглядом */}
        <path d={mouthRest} fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round">
          {animate && (
            <animate
              attributeName="d"
              values={`${mouthRest};${mouthRest};${mouthSmile};${mouthSmile};${mouthRest};${mouthRest}`}
              keyTimes="0;0.18;0.40;0.55;0.82;1"
              calcMode="spline"
              keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"
              dur="5s"
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Звёздочка */}
        <path
          fill={`url(#${uid}-star)`}
          d="
            M 162.63 10.933
            L 166.189 27.496
            Q 167.66 34.34, 174.174 36.911
            L 175.951 37.613
            Q 182 40, 175.951 42.387
            L 174.174 43.089
            Q 167.66 45.66, 164.742 52.023
            L 163.25 55.273
            Q 162 58, 160.75 55.273
            L 159.258 52.023
            Q 156.34 45.66, 149.826 43.089
            L 148.049 42.387
            Q 142 40, 148.049 37.613
            L 149.826 36.911
            Q 156.34 34.34, 157.811 27.496
            L 161.37 10.933
            Q 162 8, 162.63 10.933
            Z"
        />
      </svg>
    </div>
  );
}
