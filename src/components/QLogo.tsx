import { useId } from 'react';

interface QLogoProps {
  size?: number;
  /** Plays the idle look-around + smile loop. Off by default (static resting pose). */
  animate?: boolean;
  /**
   * 'light' — акцентный цвет (окантовка тела, ножки, окантовка глаз, рот) фиолетовый,
   * ореол за персонажем мягкий фиолетовый — для светлого/кремового фона.
   * 'dark' — акцентный цвет белый, ореол мягкий светлый — для тёмного/цветного фона.
   * 'system' (по умолчанию) — переключается автоматически по системной теме устройства
   * через `@media (prefers-color-scheme: dark)`, без участия JS.
   */
  theme?: 'light' | 'dark' | 'system';
}

const ACCENT = {
  light: '#6546C7',
  dark: '#FFFFFF',
};
// Зрачок всегда фирменный фиолетовый — не зависит от темы (в отличие от --qlogo-accent).
const PUPIL_COLOR = '#6546C7';

/**
 * Севчик — талисман приложения: кольцо-голова, две ножки, глаза со зрачками и звёздочка.
 *
 * Тело персонажа не залито — сквозь него виден фон страницы, видна только окантовка.
 * Окантовка тела, ножки, тонкая окантовка вокруг глаз и рот — один и тот же акцентный цвет
 * (--qlogo-accent), переключаемый темой; сам персонаж простой и чистый, без свечения на себе.
 * Глубину даёт мягкий размытый ореол ПОЗАДИ персонажа (того же акцентного цвета) — единственное
 * место, где используется blur. Глаза (белый белок, фиолетовый зрачок с белым бликом) и звезда
 * (оранжевая) не зависят от темы. При animate=true зрачки поглядывают на звезду, рот в такт
 * выгибается в улыбку, а звезда мягко пульсирует и мерцает ("Искра"); наведение курсора на
 * звезду увеличивает и осветляет её независимо от animate.
 */
export function QLogo({ size = 64, animate = false, theme = 'system' }: QLogoProps) {
  const uid = useId().replace(/:/g, '');
  const systemClass = `qlogo-system-${uid}`;

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Для 'system' переменная задаётся только через класс ниже (см. <style> с @media) —
    // инлайн-style имеет более высокий приоритет, чем правило из @media, и перебил бы его.
    ...(theme === 'system' ? {} : ({ '--qlogo-accent': ACCENT[theme] } as React.CSSProperties)),
  };

  const mouthRest = 'M 91 127 Q 100 127 109 127';
  const mouthSmile = 'M 91 121 Q 100 133 109 121';

  return (
    <div style={containerStyle} className={theme === 'system' ? systemClass : undefined}>
      {theme === 'system' && (
        <style>{`
          .${systemClass} { --qlogo-accent: ${ACCENT.light}; }
          @media (prefers-color-scheme: dark) {
            .${systemClass} { --qlogo-accent: ${ACCENT.dark}; }
          }
        `}</style>
      )}
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
          /* Искра: медленный мягкий пульс размера/прозрачности + более быстрое лёгкое мерцание
             яркости поверх него — сдержанная, ненавязчивая амплитуда, не отвлекает от полей ввода. */
          @keyframes qlogoStarPulse-${uid} {
            0%, 100% { transform: scale(1); opacity: 0.95; }
            50%      { transform: scale(1.07); opacity: 1; }
          }
          @keyframes qlogoStarFlicker-${uid} {
            0%, 100% { filter: brightness(1); }
            25%      { filter: brightness(0.93); }
            55%      { filter: brightness(1.05); }
            80%      { filter: brightness(0.96); }
          }
          .qlogo-star-${uid} {
            animation: qlogoStarPulse-${uid} 3.2s ease-in-out infinite, qlogoStarFlicker-${uid} 2.1s ease-in-out infinite;
          }
        `}</style>
      )}
      <style>{`
        /* Наведение работает независимо от animate — звезда чуть увеличивается и становится ярче */
        .qlogo-star-${uid} {
          transform-box: fill-box;
          transform-origin: center;
          cursor: pointer;
          transition: transform 0.25s ease-out, filter 0.25s ease-out;
        }
        .qlogo-star-${uid}:hover {
          animation: none;
          transform: scale(1.18);
          filter: brightness(1.25);
        }
      `}</style>
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`${uid}-star`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFB87A" />
            <stop offset="100%" stopColor="#E8802F" />
          </linearGradient>
          <radialGradient id={`${uid}-eyeWhite`} cx="0.35" cy="0.3" r="0.75">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E3E0F2" />
          </radialGradient>
          {/* Размытие используется только здесь — для мягкого ореола позади персонажа */}
          <filter id={`${uid}-halo`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {/* Ореол за персонажем: мягкое размытое пятно акцентного цвета, чуть больше самой фигуры.
            Единственный размытый элемент — сам персонаж ниже остаётся чётким и без свечения. */}
        <ellipse cx="100" cy="108" rx="82" ry="86" fill="var(--qlogo-accent)" opacity="0.32" filter={`url(#${uid}-halo)`} />

        {/* Ножки: залиты акцентным цветом темы, слегка приглушены — мягче, не «пластиковый» тон */}
        <g fill="var(--qlogo-accent)" opacity="0.92">
          <rect x="50" y="130" width="16" height="42" rx="8" transform="rotate(-32 58 130)" />
          <rect x="134" y="130" width="16" height="42" rx="8" transform="rotate(32 142 130)" />
        </g>

        {/* Кольцо-голова: тело не залито, видна только окантовка акцентным цветом, слегка приглушена */}
        <circle cx="100" cy="92" r="55" fill="none" stroke="var(--qlogo-accent)" strokeWidth="8" opacity="0.92" />

        {/* Белая основа глаз с тонкой окантовкой акцентным цветом — не зависит от темы по цвету заливки.
            Глаза чистые: белок и зрачок, без дополнительных бликов. */}
        <ellipse cx="77" cy="90" rx="21.5" ry="26" fill={`url(#${uid}-eyeWhite)`} stroke="var(--qlogo-accent)" strokeWidth="2.5" opacity="0.92" />
        <ellipse cx="123" cy="90" rx="21.5" ry="26" fill={`url(#${uid}-eyeWhite)`} stroke="var(--qlogo-accent)" strokeWidth="2.5" opacity="0.92" />

        {/* Фиолетовые зрачки с бликом — анимированная часть, "смотрят". Блик — дочерний элемент
            зрачка внутри той же группы, поэтому двигается вместе с ним, а не отдельно. */}
        <g className={animate ? `qlogo-eyes-${uid}` : undefined} transform={animate ? undefined : 'translate(-7, 5)'}>
          <circle cx="77" cy="92" r="10.5" fill={PUPIL_COLOR} />
          <circle cx="73.5" cy="88" r="2.4" fill="#FFFFFF" />
          <circle cx="123" cy="92" r="10.5" fill={PUPIL_COLOR} />
          <circle cx="119.5" cy="88" r="2.4" fill="#FFFFFF" />
        </g>

        {/* Рот: акцентным цветом (иначе был бы невидим на светлом фоне сквозь прозрачное тело);
            выгибается из прямой линии в улыбку и обратно, в такт со взглядом */}
        <path d={mouthRest} fill="none" stroke="var(--qlogo-accent)" strokeWidth="4.5" strokeLinecap="round">
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

        {/* Звёздочка: всегда оранжевая, не зависит от темы. Внешняя группа задаёт базовый
            размер/позицию (статичный transform-атрибут); анимация "Искра" — на самом path,
            через CSS transform, чтобы не конфликтовать с базовым атрибутом. */}
        <g transform="translate(162, 33) scale(1.05) translate(-162, -33)">
          <path
            className={`qlogo-star-${uid}`}
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
        </g>
      </svg>
    </div>
  );
}
