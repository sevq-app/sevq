interface CLogoProps {
  size?: number;
  /** Хвостик диалогового облачка снизу буквы «С». По умолчанию включён; на очень
   * маленьких размерах (иконка нижней навигации) он не читается — там передаётся false. */
  tail?: boolean;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

const MINT = '#4DC3C8';

// Кольцо буквы «С»: толстая дуга (stroke + round linecap) с разрывом справа.
const RING_PATH = 'M149.2,124.7 A58,58 0 1,1 149.2,63.3';
// Хвостик: капсула по касательным между кругом у нижнего конца дуги (радиус
// половины толщины кольца) и маленьким кругом-остриём — даёт гладкое сужение
// без швов, а не отдельные наложенные кружки.
const TAIL_PATH =
  'M 135.11,106.52 L 93.26,169.30 A 11,11 0 1,1 109.21,184.02 L 168.45,137.29 A 23,23 0 0,1 135.11,106.52 Z';

/**
 * Логотип «Севчик»: мятная буква «С» в форме диалогового облачка (с хвостиком).
 * Векторный (SVG), поэтому остаётся чётким на любом размере — от фавикона до
 * полноразмерного лого на экране входа.
 */
export function CLogo({ size = 64, tail = true, color = MINT, className, style }: CLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      style={style}
      role="img"
      aria-label="Севчик"
    >
      <path d={RING_PATH} stroke={color} strokeWidth={46} strokeLinecap="round" />
      {tail && <path d={TAIL_PATH} fill={color} />}
    </svg>
  );
}
