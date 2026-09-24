import { useId } from 'react';

interface QLogoProps {
  size?: number;
  /** Plays the idle look-around + star sparkle loop. Off by default (static resting pose). */
  animate?: boolean;
  /**
   * 'light' — акцентный цвет (окантовка тела, ножки, окантовка глаз, рот) фиолетовый —
   * для светлого/кремового фона.
   * 'dark' — акцентный цвет белый — для тёмного/цветного фона.
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
 * (--qlogo-accent), переключаемый темой. Персонаж — просто объект, без собственного свечения;
 * источник света в композиции один — звезда. Персонажу вместо этого даёт объём мягкая нейтральная
 * тень (CSS drop-shadow), а не цветной ореол. Глаза (белый белок, фиолетовый зрачок с белым
 * бликом) и звезда (оранжевая) не зависят от темы. Рот статичный — всегда лёгкая улыбка, без
 * анимации и смены выражения. При animate=true зрачки поглядывают на звезду, а звезда мягко
 * пульсирует, мерцает и держит собственный — сдержанный — ореол ("Искра"); наведение курсора на
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
    // Мягкая нейтральная тень вниз-вбок вместо цветного ореола — даёт объём, но не спорит
    // со звездой за звание источника света.
    filter: 'drop-shadow(0 6px 7px rgba(20, 15, 35, 0.16))',
    // Для 'system' переменная задаётся только через класс ниже (см. <style> с @media) —
    // инлайн-style имеет более высокий приоритет, чем правило из @media, и перебил бы его.
    ...(theme === 'system' ? {} : ({ '--qlogo-accent': ACCENT[theme] } as React.CSSProperties)),
  };

  // Рот статичный: всегда улыбка (форма, которая раньше была кадром "взгляд на звезду"), без анимации.
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
          /* Искра: медленный пульс размера/прозрачности + более быстрое мерцание яркости поверх
             него — амплитуда сделана заметной на глаз (маленькая звёздочка иначе просто не читает
             тонкие колебания), но короткого 3–4-секундного цикла достаточно, чтобы не отвлекать. */
          @keyframes qlogoStarPulse-${uid} {
            0%, 100% { transform: scale(0.88); opacity: 0.75; }
            50%      { transform: scale(1.22); opacity: 1; }
          }
          @keyframes qlogoStarFlicker-${uid} {
            0%, 100% { filter: brightness(1); }
            20%      { filter: brightness(0.8); }
            45%      { filter: brightness(1.3); }
            70%      { filter: brightness(0.85); }
            88%      { filter: brightness(1.15); }
          }
          /* Ореол звезды: тот же масштаб (scale), что у самой звезды, — размер синхронен, тот
             же keyframes-таймлайн, тот же момент старта. Прозрачность у ореола отдельная и
             заметно ниже — сдержанное, благородное свечение, а не плотное пятно. */
          @keyframes qlogoStarGlowPulse-${uid} {
            0%, 100% { transform: scale(0.88); opacity: 0.16; }
            50%      { transform: scale(1.22); opacity: 0.3; }
          }
          .qlogo-star-glow-${uid} {
            animation: qlogoStarGlowPulse-${uid} 2.6s ease-in-out infinite;
          }
          .qlogo-star-${uid} {
            animation-name: qlogoStarPulse-${uid}, qlogoStarFlicker-${uid};
            animation-duration: 2.6s, 1.4s;
            animation-timing-function: ease-in-out, ease-in-out;
            animation-iteration-count: infinite, infinite;
          }
        `}</style>
      )}
      <style>{`
        /* Наведение работает независимо от animate — звезда чуть увеличивается и становится ярче */
        .qlogo-star-${uid}, .qlogo-star-glow-${uid} {
          transform-box: fill-box;
          transform-origin: center;
        }
        .qlogo-star-${uid} {
          cursor: pointer;
          transition: transform 0.25s ease-out, filter 0.25s ease-out;
        }
        .qlogo-star-${uid}:hover {
          animation: none;
          transform: scale(1.4);
          filter: brightness(1.5);
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
          {/* Размытие для ореола вокруг звезды — единственный источник свечения в композиции */}
          <filter id={`${uid}-starGlow`} x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

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

        {/* Рот: статичная улыбка акцентным цветом (иначе была бы невидима на светлом фоне сквозь
            прозрачное тело) — без анимации, выражение лица не меняется */}
        <path d={mouthSmile} fill="none" stroke="var(--qlogo-accent)" strokeWidth="4.5" strokeLinecap="round" />

        {/* Звёздочка: всегда оранжевая, не зависит от темы. Внешняя группа задаёт базовый
            размер/позицию (статичный transform-атрибут); анимация "Искра" — на самом path,
            через CSS transform, чтобы не конфликтовать с базовым атрибутом. */}
        <g transform="translate(162, 33) scale(1.05) translate(-162, -33)">
          {/* Ореол звезды: сдержанное оранжевое свечение позади. Размер растёт синхронно со звездой
              (тот же scale-таймлайн), прозрачность — своя, заметно ниже, чтобы выглядело
              благородно, а не плотным пятном. Цвет не зависит от темы, как и сама звезда. */}
          <circle
            className={`qlogo-star-glow-${uid}`}
            cx="162"
            cy="33"
            r="19"
            fill="#FFB020"
            filter={`url(#${uid}-starGlow)`}
          />
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
